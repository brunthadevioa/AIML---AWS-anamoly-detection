"""
VAAYU ML Service — train_lstm.py
LSTM Autoencoder for temporal anomaly detection in AWS time-series data.

Architecture:
  Input  →  Encoder (LSTM 64 → LSTM 32)
         →  RepeatVector
         →  Decoder (LSTM 32 → LSTM 64)
         →  TimeDistributed Dense
         →  Reconstruction Error
         →  Threshold → Anomaly / Normal

Training strategy:
  - Train ONLY on NORMAL data (unsupervised reconstruction)
  - At inference: high reconstruction error = the model is "surprised"
    → likely a sensor fault or unusual weather event
  - Threshold: 95th percentile of reconstruction error on NORMAL holdout
"""

import sys, os
sys.stdout.reconfigure(encoding="utf-8")
sys.path.insert(0, os.path.dirname(__file__))

import numpy as np
import pandas as pd
import joblib

os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"  # suppress TF info/warnings
import tensorflow as tf
from tensorflow.keras.models import Model, load_model
from tensorflow.keras.layers import (
    Input, LSTM, Dense, RepeatVector, TimeDistributed, Dropout
)
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau
from sklearn.metrics import (
    precision_score, recall_score, f1_score, roc_auc_score, confusion_matrix
)

from preprocess import (
    load_and_clean,
    engineer_features,
    build_scaler,
    build_lstm_sequences,
    ENGINEERED_FEATURES,
)

# ─── Paths ────────────────────────────────────────────────────────────────────
DATA_PATH      = os.path.join("..", "data", "combined", "erode_all_stations_labeled.csv")
SCALER_PATH    = os.path.join("saved_models", "scaler.pkl")
LSTM_PATH      = os.path.join("saved_models", "lstm_autoencoder.keras")
LSTM_META_PATH = os.path.join("saved_models", "lstm_meta.pkl")

SEQ_LEN        = 24   # 24-hour sliding window
LSTM_FEATURES  = 11   # subset used in build_lstm_sequences

# ─── Model definition ─────────────────────────────────────────────────────────
def build_autoencoder(seq_len: int, n_features: int) -> Model:
    """
    LSTM Autoencoder — learns to reconstruct normal weather sequences.
    High reconstruction error at inference = anomaly.
    """
    inp = Input(shape=(seq_len, n_features), name="encoder_input")

    # Encoder
    x = LSTM(64, activation="tanh", return_sequences=True, name="enc_lstm1")(inp)
    x = Dropout(0.1)(x)
    x = LSTM(32, activation="tanh", return_sequences=False, name="enc_lstm2")(x)

    # Bottleneck (latent representation)
    encoded = Dense(16, activation="relu", name="bottleneck")(x)

    # Decoder
    x = RepeatVector(seq_len, name="repeat")(encoded)
    x = LSTM(32, activation="tanh", return_sequences=True, name="dec_lstm1")(x)
    x = Dropout(0.1)(x)
    x = LSTM(64, activation="tanh", return_sequences=True, name="dec_lstm2")(x)
    decoded = TimeDistributed(Dense(n_features), name="output")(x)

    model = Model(inp, decoded, name="VAAYU_LSTM_Autoencoder")
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-3),
        loss="mse",
    )
    return model


def train():
    print("=" * 60)
    print("VAAYU — LSTM Autoencoder Training")
    print("=" * 60)

    # ── 1. Load & preprocess ─────────────────────────────────────────────────
    print("\n[1/6] Loading data...")
    df = load_and_clean(DATA_PATH)
    df = engineer_features(df)
    print(f"      Records: {len(df):,} | Faults: {df['is_anomaly'].sum():,}")

    # ── 2. Load scaler (already fitted by IF training) ────────────────────────
    print("\n[2/6] Loading scaler...")
    if not os.path.exists(SCALER_PATH):
        print("      Scaler not found — fitting now...")
        scaler = build_scaler(df, SCALER_PATH)
    else:
        scaler = joblib.load(SCALER_PATH)
        print(f"      Scaler loaded from {SCALER_PATH}")

    # ── 3. Build sequences ────────────────────────────────────────────────────
    print(f"\n[3/6] Building {SEQ_LEN}-step sequences...")
    X_all, y_all, meta_all, lstm_feature_names = build_lstm_sequences(df, scaler, SEQ_LEN)
    n_features = X_all.shape[2]
    print(f"      Total sequences : {len(X_all):,}")
    print(f"      Shape           : {X_all.shape}")
    print(f"      LSTM features   : {lstm_feature_names}")

    # ── 4. Train ONLY on NORMAL sequences ─────────────────────────────────────
    y_all_arr = np.array(y_all)
    X_normal  = X_all[y_all_arr == 0]
    X_fault   = X_all[y_all_arr == 1]
    y_fault   = y_all_arr[y_all_arr == 1]

    # 80 / 20 split within normal data for validation
    split     = int(len(X_normal) * 0.8)
    X_train   = X_normal[:split]
    X_val     = X_normal[split:]

    print(f"\n[4/6] Training on NORMAL sequences only...")
    print(f"      Train (normal) : {len(X_train):,}")
    print(f"      Val   (normal) : {len(X_val):,}")
    print(f"      Fault (eval)   : {len(X_fault):,}")

    model = build_autoencoder(SEQ_LEN, n_features)
    model.summary(print_fn=lambda x: print(f"      {x}"))

    callbacks = [
        EarlyStopping(monitor="val_loss", patience=5, restore_best_weights=True, verbose=1),
        ReduceLROnPlateau(monitor="val_loss", factor=0.5, patience=3, verbose=1),
    ]

    history = model.fit(
        X_train, X_train,
        epochs=50,
        batch_size=256,
        validation_data=(X_val, X_val),
        callbacks=callbacks,
        shuffle=True,
        verbose=1,
    )

    # ── 5. Compute reconstruction error & threshold ───────────────────────────
    print("\n[5/6] Computing reconstruction errors & threshold...")

    def reconstruction_error(X: np.ndarray) -> np.ndarray:
        pred = model.predict(X, verbose=0, batch_size=512)
        return np.mean(np.square(X - pred), axis=(1, 2))

    # Threshold: 95th percentile of NORMAL validation errors
    normal_errors = reconstruction_error(X_val)
    fault_errors  = reconstruction_error(X_fault)
    threshold_95  = float(np.percentile(normal_errors, 95))
    threshold_99  = float(np.percentile(normal_errors, 99))

    print(f"      Normal error   — mean: {normal_errors.mean():.6f}, std: {normal_errors.std():.6f}")
    print(f"      Fault  error   — mean: {fault_errors.mean():.6f},  std: {fault_errors.std():.6f}")
    print(f"      Threshold 95th : {threshold_95:.6f}")
    print(f"      Threshold 99th : {threshold_99:.6f}")

    # ── 6. Evaluate against known labels ─────────────────────────────────────
    print("\n[6/6] Evaluating on ALL sequences...")
    all_errors = reconstruction_error(X_all)
    y_pred     = (all_errors > threshold_95).astype(int)
    y_true_all = y_all_arr

    prec  = precision_score(y_true_all, y_pred, zero_division=0)
    rec   = recall_score(y_true_all, y_pred, zero_division=0)
    f1    = f1_score(y_true_all, y_pred, zero_division=0)
    auc   = roc_auc_score(y_true_all, all_errors)
    cm    = confusion_matrix(y_true_all, y_pred)

    print(f"\n  Confusion Matrix:")
    print(f"                    Predicted Normal  Predicted Fault")
    print(f"  Actual Normal     {cm[0][0]:>14,}  {cm[0][1]:>14,}")
    print(f"  Actual Fault      {cm[1][0]:>14,}  {cm[1][1]:>14,}")

    print(f"\n  Precision : {prec:.4f}  ({prec*100:.1f}%)")
    print(f"  Recall    : {rec:.4f}  ({rec*100:.1f}%)")
    print(f"  F1 Score  : {f1:.4f}  ({f1*100:.1f}%)")
    print(f"  ROC-AUC   : {auc:.4f}")

    # ── Save ──────────────────────────────────────────────────────────────────
    model.save(LSTM_PATH)
    meta = {
        "threshold_95":      threshold_95,
        "threshold_99":      threshold_99,
        "normal_error_mean": float(normal_errors.mean()),
        "normal_error_std":  float(normal_errors.std()),
        "seq_len":           SEQ_LEN,
        "lstm_features":     lstm_feature_names,
        "n_features":        n_features,
    }
    joblib.dump(meta, LSTM_META_PATH)
    print(f"\n  Model saved → {LSTM_PATH}")
    print(f"  Meta saved  → {LSTM_META_PATH}")
    print(f"\n{'='*60}")
    print("LSTM Autoencoder training complete.")
    print(f"{'='*60}")
    return model, meta


if __name__ == "__main__":
    train()
