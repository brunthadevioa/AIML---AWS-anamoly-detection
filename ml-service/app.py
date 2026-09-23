"""
VAAYU ML Service — app.py
Flask REST API — serves anomaly detection results.

Endpoints:
  POST /predict          → single-reading anomaly detection (IF + LSTM + Context)
  POST /predict/batch    → batch inference from uploaded CSV rows
  GET  /health           → service health + model status
  GET  /stations         → list of monitored Erode stations
  GET  /live/<station>   → live ERA5 reference reading for a station
"""

import sys, os
sys.stdout.reconfigure(encoding="utf-8")
sys.path.insert(0, os.path.dirname(__file__))

os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"

from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import pandas as pd
import joblib
import requests as req
from datetime import datetime
from typing import Optional

# ─── Lazy-load heavy models once at startup ───────────────────────────────────
_scaler       = None
_clf_if       = None
_if_meta      = None
_lstm_model   = None
_lstm_meta    = None

SAVED_DIR = os.path.join(os.path.dirname(__file__), "saved_models")

def get_scaler():
    global _scaler
    if _scaler is None:
        _scaler = joblib.load(os.path.join(SAVED_DIR, "scaler.pkl"))
    return _scaler

def get_if():
    global _clf_if, _if_meta
    if _clf_if is None:
        _clf_if  = joblib.load(os.path.join(SAVED_DIR, "isolation_forest.pkl"))
        _if_meta = joblib.load(os.path.join(SAVED_DIR, "if_threshold.pkl"))
    return _clf_if, _if_meta

def get_lstm():
    global _lstm_model, _lstm_meta
    if _lstm_model is None:
        try:
            import tensorflow as tf
            _lstm_model = tf.keras.models.load_model(
                os.path.join(SAVED_DIR, "lstm_autoencoder.keras")
            )
            _lstm_meta  = joblib.load(os.path.join(SAVED_DIR, "lstm_meta.pkl"))
        except Exception as e:
            print(f"[WARN] LSTM model not available: {e}")
    return _lstm_model, _lstm_meta

# ─── Import service modules ────────────────────────────────────────────────────
from preprocess import preprocess_single_reading, ENGINEERED_FEATURES
from context_engine import analyze_context, STATION_COORDS, fetch_era5_reference

app = Flask(__name__)
CORS(app)

# ─── Helper: run Isolation Forest on a single reading ─────────────────────────
def run_if(vec: np.ndarray) -> tuple[bool, float]:
    clf, meta = get_if()
    scaler    = get_scaler()
    raw_score = clf.score_samples(vec)[0]
    # Normalise to [0,1] — higher = more anomalous
    min_s = -0.7; max_s = 0.0
    score = float(np.clip((raw_score - max_s) / (min_s - max_s + 1e-9), 0, 1))
    is_anomaly = score > meta["threshold_95"]
    return is_anomaly, score


# ─── Helper: run LSTM on a single reading (best-effort) ──────────────────────
def run_lstm(reading: dict, station_id: str) -> tuple[bool, float]:
    try:
        model, meta = get_lstm()
        if model is None:
            return False, 0.0
        scaler  = get_scaler()
        seq_len = meta["seq_len"]
        n_feat  = meta["n_features"]
        # Build a synthetic sequence: repeat current reading seq_len times
        # (real usage would use last seq_len readings from MongoDB)
        vec = preprocess_single_reading(reading, scaler)[:, :n_feat]
        seq = np.tile(vec, (seq_len, 1))[np.newaxis, :, :]  # (1, seq_len, n_feat)
        recon = model.predict(seq, verbose=0)
        error = float(np.mean(np.square(seq - recon)))
        thresh = meta["threshold_95"]
        score = float(np.clip(error / (thresh * 2), 0, 1))
        is_anomaly = error > thresh
        return is_anomaly, score
    except Exception as e:
        return False, 0.0


# ─────────────────────────────────────────────────────────────────────────────
#  ROUTES
# ─────────────────────────────────────────────────────────────────────────────

@app.route("/health", methods=["GET"])
def health():
    """Service health + model status check."""
    models = {}
    try:
        get_if()
        models["isolation_forest"] = "loaded"
    except Exception as e:
        models["isolation_forest"] = f"error: {e}"
    try:
        get_scaler()
        models["scaler"] = "loaded"
    except Exception as e:
        models["scaler"] = f"error: {e}"
    try:
        m, _ = get_lstm()
        models["lstm_autoencoder"] = "loaded" if m else "not_trained_yet"
    except Exception as e:
        models["lstm_autoencoder"] = f"error: {e}"

    return jsonify({
        "status":    "ok",
        "service":   "VAAYU ML Service",
        "timestamp": datetime.now().isoformat(),
        "models":    models,
    })


@app.route("/stations", methods=["GET"])
def stations():
    """List all monitored Erode district stations."""
    return jsonify({
        "district": "Erode",
        "state":    "Tamil Nadu",
        "stations": [
            {"id": sid, **info} for sid, info in STATION_COORDS.items()
        ],
    })


@app.route("/live/<station_id>", methods=["GET"])
def live_reading(station_id: str):
    """
    Fetch live ERA5-based atmospheric reference reading for a station.
    Clearly labeled as reanalysis-based atmospheric data (Open-Meteo / ERA5).
    """
    if station_id not in STATION_COORDS:
        return jsonify({"error": f"Unknown station: {station_id}"}), 404

    info = STATION_COORDS[station_id]
    lat, lon = info["lat"], info["lon"]

    try:
        url = (
            f"https://api.open-meteo.com/v1/forecast"
            f"?latitude={lat}&longitude={lon}"
            f"&current=temperature_2m,relative_humidity_2m,surface_pressure,"
            f"wind_speed_10m,rain,weather_code,wind_direction_10m"
            f"&timezone=Asia%2FKolkata&wind_speed_unit=kmh"
        )
        resp = req.get(url, timeout=8)
        if resp.status_code == 200:
            cur = resp.json().get("current", {})
            return jsonify({
                "station_id":   station_id,
                "station_name": info["name"],
                "data_source":  "ERA5_reanalysis_OpenMeteo",
                "source_label": "Atmospheric Reference (ERA5/Open-Meteo) — NOT physical AWS telemetry",
                "timestamp":    cur.get("time"),
                "readings": {
                    "temperature":  cur.get("temperature_2m"),
                    "humidity":     cur.get("relative_humidity_2m"),
                    "pressure":     cur.get("surface_pressure"),
                    "wind_speed":   cur.get("wind_speed_10m"),
                    "rainfall":     cur.get("rain"),
                    "wind_direction": cur.get("wind_direction_10m"),
                },
            })
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    return jsonify({"error": "Failed to fetch reference data"}), 500


@app.route("/predict", methods=["POST"])
def predict():
    """
    Single-reading anomaly detection + Context Engine explainability.
    Returns dashboard-ready JSON schema with ML evidence, Context evidence,
    and alert/recommendation guidance.
    """
    data = request.get_json(force=True)
    if not data:
        return jsonify({"error": "No JSON body"}), 400

    station_id = data.get("station_id", "AWS_ERD_001")
    reading    = {
        "temperature":    float(data.get("temperature", 30.0)),
        "humidity":       float(data.get("humidity", 65.0)),
        "pressure":       float(data.get("pressure", 985.0)),
        "wind_speed":     float(data.get("wind_speed", 8.0)),
        "rainfall":       float(data.get("rainfall", 0.0)),
        "dew_point":      float(data.get("dew_point", data.get("temperature", 30.0) - 6)),
        "wind_direction": int(data.get("wind_direction", 180)),
    }

    try:
        scaler = get_scaler()
        vec    = preprocess_single_reading(reading, scaler)

        # ── ML Evidence ───────────────────────────────────────────────────────
        if_anomaly, if_score     = run_if(vec)
        lstm_anomaly, lstm_score = run_lstm(reading, station_id)

        # ── Context Engine Analysis ───────────────────────────────────────────
        ctx_result = analyze_context(
            reading=reading,
            if_score=if_score,
            lstm_score=lstm_score,
            target_station_id=station_id
        )

        return jsonify(ctx_result)

    except Exception as e:
        import traceback
        return jsonify({"error": str(e), "trace": traceback.format_exc()}), 500



@app.route("/predict/batch", methods=["POST"])
def predict_batch():
    """
    Batch inference on a list of readings (from CSV upload).
    Accepts: JSON array of reading objects (same schema as /predict).
    Returns: List of predictions + summary statistics.
    """
    data = request.get_json(force=True)
    if isinstance(data, dict):
        data = data.get("readings", [])
    if not isinstance(data, list) or not data:
        return jsonify({"error": "Empty readings list"}), 400

    results    = []
    n_anomaly  = 0
    n_fault    = 0
    n_weather  = 0

    for row in data[:5000]:   # cap at 5000 rows per batch
        station_id = row.get("station_id", "AWS_ERD_001")
        reading    = {
            "temperature":    float(row.get("temperature", 30.0)),
            "humidity":       float(row.get("humidity", 65.0)),
            "pressure":       float(row.get("pressure", 985.0)),
            "wind_speed":     float(row.get("wind_speed", 8.0)),
            "rainfall":       float(row.get("rainfall", 0.0)),
            "dew_point":      float(row.get("dew_point", row.get("temperature", 30.0) - 6)),
            "wind_direction": int(row.get("wind_direction", 180)),
        }
        try:
            scaler = get_scaler()
            vec    = preprocess_single_reading(reading, scaler)
            if_anomaly, if_score     = run_if(vec)
            lstm_anomaly, lstm_score = run_lstm(reading, station_id)

            ctx_res = analyze_context(
                reading=reading,
                if_score=if_score,
                lstm_score=lstm_score,
                target_station_id=station_id
            )

            results.append(ctx_res)

            if ctx_res["ml_analysis"]["is_anomaly"]:
                n_anomaly += 1
            lbl = ctx_res["classification"]["label"]
            if lbl == "POSSIBLE_SENSOR_FAULT":
                n_fault += 1
            elif lbl == "REAL_WEATHER_EVENT":
                n_weather += 1

        except Exception as e:
            results.append({"error": str(e), "row": row})

    return jsonify({
        "summary": {
            "total_processed":       len(results),
            "ml_anomalies":          n_anomaly,
            "possible_sensor_faults": n_fault,
            "real_weather_events":   n_weather,
            "normal_readings":       len(results) - (n_fault + n_weather),
        },
        "results": results
    })



if __name__ == "__main__":
    print("=" * 50)
    print("VAAYU ML Service starting on http://localhost:5001")
    print("=" * 50)
    app.run(host="0.0.0.0", port=5001, debug=False)
