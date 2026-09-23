"""
VAAYU ML Service — train_isolation_forest.py
Trains an Isolation Forest on the labeled Erode district dataset.
Computes precision / recall / F1 against known injected fault labels.

Isolation Forest is unsupervised — it sees no labels during training.
We evaluate it post-hoc using the known labels to measure quality.
"""

import sys, os
sys.stdout.reconfigure(encoding="utf-8")
sys.path.insert(0, os.path.dirname(__file__))

import numpy as np
import pandas as pd
import joblib
from sklearn.ensemble import IsolationForest
from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
)
from preprocess import (
    load_and_clean,
    engineer_features,
    build_scaler,
    scale_features,
    ENGINEERED_FEATURES,
)

DATA_PATH   = os.path.join("..", "data", "combined", "erode_all_stations_labeled.csv")
SCALER_PATH = os.path.join("saved_models", "scaler.pkl")
IF_PATH     = os.path.join("saved_models", "isolation_forest.pkl")
THRESHOLD_PATH = os.path.join("saved_models", "if_threshold.pkl")

def train():
    print("=" * 60)
    print("VAAYU — Isolation Forest Training")
    print("=" * 60)

    # ── 1. Load & preprocess ─────────────────────────────────────────────────
    print("\n[1/5] Loading data...")
    df = load_and_clean(DATA_PATH)
    print(f"      Records: {len(df):,}  |  Stations: {df['station_id'].nunique()}")
    print(f"      Normal: {(df['label']=='NORMAL').sum():,}  |  Faults: {(df['label']=='SENSOR_FAULT').sum():,}")

    print("\n[2/5] Engineering features...")
    df = engineer_features(df)
    print(f"      Features: {ENGINEERED_FEATURES}")

    # ── 2. Scale on NORMAL data only ─────────────────────────────────────────
    print("\n[3/5] Fitting scaler on NORMAL data only...")
    scaler = build_scaler(df, SCALER_PATH)
    X = scale_features(df, scaler)
    y_true = df["is_anomaly"].values  # ground truth from injected faults

    # ── 3. Train Isolation Forest on ALL data (unsupervised) ─────────────────
    print("\n[4/5] Training Isolation Forest...")
    # contamination = known fault rate (~7.35%)
    contamination = df["is_anomaly"].mean()
    print(f"      Contamination: {contamination:.4f} ({contamination*100:.1f}%)")

    clf = IsolationForest(
        n_estimators=300,          # more trees = more stable scores
        max_samples="auto",
        contamination=contamination,
        max_features=1.0,
        bootstrap=False,
        random_state=42,
        n_jobs=-1,                 # use all CPU cores
    )
    clf.fit(X)

    # Raw anomaly scores: negative = more anomalous
    raw_scores = clf.score_samples(X)     # range: typically -0.7 to 0
    pred_labels = clf.predict(X)          # -1 = anomaly, 1 = normal

    # Convert to binary: 1 = anomaly, 0 = normal
    y_pred_binary = (pred_labels == -1).astype(int)

    # Normalize scores to [0, 1] confidence (higher = more anomalous)
    # score_samples returns negative values; flip and normalize
    min_s, max_s = raw_scores.min(), raw_scores.max()
    anomaly_scores = (raw_scores - max_s) / (min_s - max_s + 1e-9)

    # ── 4. Evaluate against known labels ─────────────────────────────────────
    print("\n[5/5] Evaluating against known injected fault labels...")
    prec  = precision_score(y_true, y_pred_binary, zero_division=0)
    rec   = recall_score(y_true, y_pred_binary, zero_division=0)
    f1    = f1_score(y_true, y_pred_binary, zero_division=0)
    auc   = roc_auc_score(y_true, anomaly_scores)
    cm    = confusion_matrix(y_true, y_pred_binary)

    print(f"\n  Confusion Matrix:")
    print(f"                    Predicted Normal  Predicted Fault")
    print(f"  Actual Normal     {cm[0][0]:>14,}  {cm[0][1]:>14,}")
    print(f"  Actual Fault      {cm[1][0]:>14,}  {cm[1][1]:>14,}")

    print(f"\n  Precision : {prec:.4f}  ({prec*100:.1f}%)")
    print(f"  Recall    : {rec:.4f}  ({rec*100:.1f}%)")
    print(f"  F1 Score  : {f1:.4f}  ({f1*100:.1f}%)")
    print(f"  ROC-AUC   : {auc:.4f}")

    # Per fault-type breakdown
    print(f"\n  Per fault-type detection rate:")
    for ftype in ["SPIKE", "STUCK", "DRIFT", "FLATLINE"]:
        mask = df["fault_type"] == ftype
        if mask.sum() > 0:
            detected = (y_pred_binary[mask] == 1).sum()
            total    = mask.sum()
            rate     = detected / total
            print(f"    {ftype:<10}: {detected:>4}/{total:>4} detected ({rate*100:.1f}%)")

    # ── 5. Save model + threshold ─────────────────────────────────────────────
    joblib.dump(clf, IF_PATH)
    print(f"\n  Model saved → {IF_PATH}")

    # Save threshold for real-time inference (95th pct of NORMAL scores)
    normal_scores = anomaly_scores[y_true == 0]
    threshold_95  = np.percentile(normal_scores, 95)
    joblib.dump({"threshold_95": threshold_95, "contamination": contamination}, THRESHOLD_PATH)
    print(f"  Threshold saved → {THRESHOLD_PATH}")
    print(f"  Anomaly threshold (95th pct of NORMAL): {threshold_95:.4f}")

    print(f"\n{'='*60}")
    print("Isolation Forest training complete.")
    print(f"{'='*60}")

    return clf, scaler, anomaly_scores, y_true, df


def evaluate_sample(clf, scaler, station_id="AWS_ERD_002"):
    """Quick demo: run a normal reading and a fault reading through the model."""
    print(f"\n{'─'*50}")
    print("  SAMPLE INFERENCE DEMO")
    print(f"{'─'*50}")

    from preprocess import preprocess_single_reading

    # Normal reading (real Erode values)
    normal_reading = {
        "temperature": 31.4, "humidity": 68.0, "pressure": 1008.0,
        "wind_speed": 12.0,  "rainfall": 0.0,  "dew_point": 24.1,
        "wind_direction": 180,
    }

    # Fault: humidity sensor stuck at 99.2% while temp/pressure are normal
    fault_reading = {
        "temperature": 31.4, "humidity": 99.2, "pressure": 1008.0,
        "wind_speed": 12.0,  "rainfall": 0.0,  "dew_point": 24.1,
        "wind_direction": 180,
    }

    threshold_data = joblib.load(THRESHOLD_PATH)
    thresh = threshold_data["threshold_95"]

    for label, reading in [("NORMAL", normal_reading), ("FAULT (humidity=99.2%)", fault_reading)]:
        vec = preprocess_single_reading(reading, scaler)
        raw = clf.score_samples(vec)[0]
        min_s, max_s = -0.7, 0.0
        score = (raw - max_s) / (min_s - max_s + 1e-9)
        score = float(np.clip(score, 0, 1))
        is_anomaly = score > thresh

        print(f"\n  Input ({label}):")
        print(f"    Temperature: {reading['temperature']}°C | Humidity: {reading['humidity']}%")
        print(f"    Pressure: {reading['pressure']} hPa | Wind: {reading['wind_speed']} km/h")
        print(f"  Output:")
        print(f"    Anomaly Score : {score:.4f}  (threshold: {thresh:.4f})")
        print(f"    Detected      : {'YES — ANOMALY' if is_anomaly else 'No — Normal'}")


if __name__ == "__main__":
    clf, scaler, scores, y_true, df = train()
    evaluate_sample(clf, scaler)
