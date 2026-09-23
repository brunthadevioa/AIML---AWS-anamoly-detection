"""
VAAYU ML Service — preprocess.py
Data preprocessing and feature engineering for Erode district AWS anomaly detection.

Data source: ERA5 reanalysis-based atmospheric data (Open-Meteo)
             Labeled with injected sensor fault patterns for supervised evaluation.
"""

import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
import joblib
import os

# ─── Feature columns used by both models ──────────────────────────────────────
SENSOR_FEATURES = [
    "temperature",
    "humidity",
    "pressure",
    "wind_speed",
    "rainfall",
    "dew_point",
    "wind_direction",
]

ENGINEERED_FEATURES = [
    # Raw sensor readings
    "temperature", "humidity", "pressure", "wind_speed", "rainfall",
    "dew_point", "wind_direction",
    # Rate of change (derivative) — key for SPIKE / DRIFT detection
    "temp_diff", "humidity_diff", "pressure_diff", "wind_diff",
    # Rolling statistics — key for STUCK / FLATLINE detection
    "temp_rolling_std",  "humidity_rolling_std",
    "temp_rolling_mean", "humidity_rolling_mean",
    # Physical relationship checks
    "temp_dew_spread",  # temp - dew_point; abnormal if ~0 when not raining
    "temp_z_score",     # station-specific z-score
    # Time of day / seasonality
    "hour_sin", "hour_cos",
    "month_sin", "month_cos",
]


def load_and_clean(csv_path: str) -> pd.DataFrame:
    """Load combined labeled CSV and do basic cleaning."""
    df = pd.read_csv(csv_path, parse_dates=["timestamp"])
    df = df.sort_values(["station_id", "timestamp"]).reset_index(drop=True)

    # Clip values to physically plausible ranges for Erode district
    df["temperature"]    = df["temperature"].clip(-5, 55)
    df["humidity"]       = df["humidity"].clip(0, 100)
    df["pressure"]       = df["pressure"].clip(950, 1030)
    df["wind_speed"]     = df["wind_speed"].clip(0, 100)
    df["rainfall"]       = df["rainfall"].clip(0, 200)
    df["wind_direction"] = df["wind_direction"].clip(0, 360)

    return df


def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Add engineered features per station. All features are computed
    within each station's time series to avoid cross-station leakage.
    """
    df = df.copy()
    result_parts = []

    for station_id, grp in df.groupby("station_id"):
        grp = grp.sort_values("timestamp").copy()

        # ── Rate of change (1-hour diff) ─────────────────────────────────────
        grp["temp_diff"]     = grp["temperature"].diff().fillna(0)
        grp["humidity_diff"] = grp["humidity"].diff().fillna(0)
        grp["pressure_diff"] = grp["pressure"].diff().fillna(0)
        grp["wind_diff"]     = grp["wind_speed"].diff().fillna(0)

        # ── Rolling stats (6-hour window) ────────────────────────────────────
        # Std → near-zero for STUCK / FLATLINE faults
        grp["temp_rolling_std"]     = grp["temperature"].rolling(6, min_periods=1).std().fillna(0)
        grp["humidity_rolling_std"] = grp["humidity"].rolling(6, min_periods=1).std().fillna(0)
        grp["temp_rolling_mean"]    = grp["temperature"].rolling(6, min_periods=1).mean().fillna(grp["temperature"])
        grp["humidity_rolling_mean"] = grp["humidity"].rolling(6, min_periods=1).mean().fillna(grp["humidity"])

        # ── Physical relationship ─────────────────────────────────────────────
        # Dew point spread: temp − dew_point. Should be >0.
        # If it's very large (>20) with high humidity, likely sensor issue.
        grp["temp_dew_spread"] = grp["temperature"] - grp["dew_point"]

        # ── Station-specific z-score ──────────────────────────────────────────
        mean_t = grp["temperature"].mean()
        std_t  = grp["temperature"].std() + 1e-6
        grp["temp_z_score"] = (grp["temperature"] - mean_t) / std_t

        # ── Cyclical time encoding ────────────────────────────────────────────
        hour  = grp["timestamp"].dt.hour
        month = grp["timestamp"].dt.month
        grp["hour_sin"]  = np.sin(2 * np.pi * hour  / 24)
        grp["hour_cos"]  = np.cos(2 * np.pi * hour  / 24)
        grp["month_sin"] = np.sin(2 * np.pi * month / 12)
        grp["month_cos"] = np.cos(2 * np.pi * month / 12)

        result_parts.append(grp)

    return pd.concat(result_parts, ignore_index=True).sort_values(
        ["station_id", "timestamp"]
    ).reset_index(drop=True)


def build_scaler(df: pd.DataFrame, scaler_path: str) -> StandardScaler:
    """Fit a StandardScaler on NORMAL data only, then save it."""
    normal_df = df[df["label"] == "NORMAL"]
    scaler = StandardScaler()
    scaler.fit(normal_df[ENGINEERED_FEATURES])
    joblib.dump(scaler, scaler_path)
    print(f"  Scaler saved → {scaler_path}")
    return scaler


def scale_features(df: pd.DataFrame, scaler: StandardScaler) -> np.ndarray:
    """Return scaled feature matrix."""
    return scaler.transform(df[ENGINEERED_FEATURES])


def build_lstm_sequences(df: pd.DataFrame,
                          scaler: StandardScaler,
                          seq_len: int = 24) -> tuple:
    """
    Build sliding-window sequences for LSTM Autoencoder.
    One sequence per station per timestep, no cross-station mixing.

    Returns:
        X_seq  : shape (N, seq_len, n_features)
        y_seq  : shape (N,) — is_anomaly label for last timestep
        meta   : list of dicts with station_id, timestamp for each sequence
    """
    LSTM_FEATURES = [
        "temperature", "humidity", "pressure", "wind_speed", "rainfall",
        "temp_diff", "humidity_diff", "temp_rolling_std", "humidity_rolling_std",
        "hour_sin", "hour_cos",
    ]

    X_list, y_list, meta_list = [], [], []

    for station_id, grp in df.groupby("station_id"):
        grp = grp.sort_values("timestamp").reset_index(drop=True)
        vals   = scaler.transform(grp[ENGINEERED_FEATURES])[:, :len(LSTM_FEATURES)]
        labels = grp["is_anomaly"].values

        for i in range(seq_len, len(grp)):
            X_list.append(vals[i - seq_len:i])
            y_list.append(labels[i])
            meta_list.append({
                "station_id": station_id,
                "timestamp":  grp.at[i, "timestamp"],
                "label":      grp.at[i, "label"],
                "fault_type": grp.at[i, "fault_type"],
            })

    X_seq = np.array(X_list, dtype=np.float32)
    y_seq = np.array(y_list, dtype=np.int32)
    return X_seq, y_seq, meta_list, LSTM_FEATURES


def preprocess_single_reading(reading: dict,
                               scaler: StandardScaler,
                               history_df: pd.DataFrame | None = None) -> np.ndarray:
    """
    Preprocess a single incoming sensor reading for real-time inference.

    Args:
        reading    : dict with keys matching SENSOR_FEATURES
        scaler     : fitted StandardScaler
        history_df : optional recent history for rolling features

    Returns:
        scaled feature vector (1, n_features)
    """
    row = {f: reading.get(f, 0.0) for f in SENSOR_FEATURES}

    # Compute engineered features from history if available
    if history_df is not None and len(history_df) >= 2:
        last = history_df.iloc[-1]
        row["temp_diff"]          = row["temperature"]  - last["temperature"]
        row["humidity_diff"]      = row["humidity"]      - last["humidity"]
        row["pressure_diff"]      = row["pressure"]      - last["pressure"]
        row["wind_diff"]          = row["wind_speed"]    - last["wind_speed"]
        recent = history_df.tail(6)
        row["temp_rolling_std"]     = recent["temperature"].std()
        row["humidity_rolling_std"] = recent["humidity"].std()
        row["temp_rolling_mean"]    = recent["temperature"].mean()
        row["humidity_rolling_mean"] = recent["humidity"].mean()
    else:
        row["temp_diff"] = row["humidity_diff"] = row["pressure_diff"] = row["wind_diff"] = 0.0
        row["temp_rolling_std"] = row["humidity_rolling_std"] = 0.0
        row["temp_rolling_mean"]    = row["temperature"]
        row["humidity_rolling_mean"] = row["humidity"]

    row["temp_dew_spread"] = row["temperature"] - row.get("dew_point", row["temperature"] - 5)
    row["temp_z_score"]    = 0.0  # no station history in single-reading mode

    ts = pd.Timestamp.now()
    row["hour_sin"]  = np.sin(2 * np.pi * ts.hour  / 24)
    row["hour_cos"]  = np.cos(2 * np.pi * ts.hour  / 24)
    row["month_sin"] = np.sin(2 * np.pi * ts.month / 12)
    row["month_cos"] = np.cos(2 * np.pi * ts.month / 12)

    vec = np.array([[row[f] for f in ENGINEERED_FEATURES]], dtype=np.float32)
    return scaler.transform(vec)


if __name__ == "__main__":
    import sys
    sys.stdout.reconfigure(encoding="utf-8")
    print("Testing preprocess pipeline...")
    df = load_and_clean("../data/combined/erode_all_stations_labeled.csv")
    print(f"  Loaded: {df.shape}")
    df = engineer_features(df)
    print(f"  Engineered: {df.shape}")
    print(f"  Features: {ENGINEERED_FEATURES}")
    scaler = build_scaler(df, "../ml-service/saved_models/scaler.pkl")
    X = scale_features(df, scaler)
    print(f"  Scaled shape: {X.shape}")
    print("  Preprocess OK")
