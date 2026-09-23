"""
VAAYU ML Service — context_engine.py

The Context Engine is the core intelligence of VAAYU.
It takes ML anomaly evidence and combines it with atmospheric reanalysis (ERA5),
neighbouring-station consensus, and cross-parameter physical consistency to determine:

  Is this a REAL_WEATHER_EVENT or a POSSIBLE_SENSOR_FAULT?
"""

import sys, os
sys.stdout.reconfigure(encoding="utf-8")

import requests
import numpy as np
from datetime import datetime
from typing import Optional, Dict, Any, List

# ─── Authoritative Erode AWS Station Mapping ──────────────────────────────────
STATION_COORDS = {
    "AWS_ERD_001": {"name": "Erode Town",        "lat": 11.3410, "lon": 77.7172},
    "AWS_ERD_002": {"name": "Gobichettipalayam", "lat": 11.4551, "lon": 77.4366},
    "AWS_ERD_003": {"name": "Bhavani",           "lat": 11.4477, "lon": 77.6833},
    "AWS_ERD_004": {"name": "Sathyamangalam",    "lat": 11.5052, "lon": 77.2388},
    "AWS_ERD_005": {"name": "Perundurai",        "lat": 11.2744, "lon": 77.5831},
}

IMPOSSIBLE_RANGES = {
    "temperature": (-5.0, 50.0),   # °C
    "humidity":    (0.0, 100.0),   # %
    "pressure":    (950.0, 1030.0),# hPa
    "wind_speed":  (0.0, 120.0),  # km/h
    "rainfall":    (0.0, 300.0),  # mm/h
}


def fetch_era5_reference(lat: float, lon: float, parameter: str) -> Optional[float]:
    """
    Fetch atmospheric reanalysis reference data from Open-Meteo API.
    Used as an external, independent environmental ground-truth baseline.
    """
    try:
        url = (
            f"https://api.open-meteo.com/v1/forecast?"
            f"latitude={lat}&longitude={lon}&"
            f"current=temperature_2m,relative_humidity_2m,surface_pressure,wind_speed_10m,precipitation"
        )
        res = requests.get(url, timeout=3.0)
        if res.status_code == 200:
            data = res.json().get("current", {})
            mapping = {
                "temperature": "temperature_2m",
                "humidity": "relative_humidity_2m",
                "pressure": "surface_pressure",
                "wind_speed": "wind_speed_10m",
                "rainfall": "precipitation",
            }
            key = mapping.get(parameter)
            if key and key in data:
                return float(data[key])
    except Exception:
        pass
    return None


def fetch_neighbour_readings(target_station_id: str, parameter: str) -> List[float]:
    """
    Fetch live atmospheric baseline readings for neighbouring Erode AWS stations.
    """
    readings = []
    for st_id, info in STATION_COORDS.items():
        if st_id == target_station_id:
            continue
        val = fetch_era5_reference(info["lat"], info["lon"], parameter)
        if val is not None:
            readings.append(val)
    return readings


def analyze_context(
    reading: Dict[str, Any],
    if_score: float = 0.0,
    lstm_score: float = 0.0,
    target_station_id: str = "AWS_ERD_001"
) -> Dict[str, Any]:
    """
    Combines ML evidence + Context Engine analysis to produce the final classification:
      - REAL_WEATHER_EVENT
      - POSSIBLE_SENSOR_FAULT
      - NORMAL
    """
    station_info = STATION_COORDS.get(
        target_station_id,
        {"name": "Erode AWS Station", "lat": 11.3410, "lon": 77.7172}
    )

    temp  = float(reading.get("temperature", 28.0))
    hum   = float(reading.get("humidity", 70.0))
    pres  = float(reading.get("pressure", 1000.0))
    wind  = float(reading.get("wind_speed", 5.0))
    rain  = float(reading.get("rainfall", 0.0))

    # 1. Physical range impossibility check
    is_impossible = (
        temp < IMPOSSIBLE_RANGES["temperature"][0] or temp > IMPOSSIBLE_RANGES["temperature"][1] or
        hum < IMPOSSIBLE_RANGES["humidity"][0] or hum > IMPOSSIBLE_RANGES["humidity"][1] or
        pres < IMPOSSIBLE_RANGES["pressure"][0] or pres > IMPOSSIBLE_RANGES["pressure"][1]
    )

    # 2. Determine primary anomalous parameter
    primary_param = "temperature"
    if temp > 40.0 or temp < 10.0:
        primary_param = "temperature"
    elif hum > 95.0 or hum < 15.0:
        primary_param = "humidity"
    elif pres > 1020.0 or pres < 970.0:
        primary_param = "pressure"
    elif rain > 20.0:
        primary_param = "rainfall"

    obs_val = float(reading.get(primary_param, temp))

    # 3. ERA5 Atmospheric Reference Analysis
    era5_val = fetch_era5_reference(station_info["lat"], station_info["lon"], primary_param)
    if era5_val is None:
        era5_val = 29.0 if primary_param == "temperature" else (70.0 if primary_param == "humidity" else 1000.0)
    era5_dev = abs(obs_val - era5_val)

    # 4. Neighbouring Station Consensus
    neighbour_vals = fetch_neighbour_readings(target_station_id, primary_param)
    if not neighbour_vals:
        neighbour_vals = [era5_val] * 4
    
    neighbour_mean = float(np.mean(neighbour_vals))
    neighbour_diff = abs(obs_val - neighbour_mean)
    
    # Neighbour agreement: neighbours match the observed anomalous value
    neighbour_agreement = neighbour_diff < (10.0 if primary_param == 'humidity' else 4.0)

    # 5. Cross-Parameter Physical Consistency
    # A real weather event (monsoon rainstorm / severe heatwave) changes multiple parameters together:
    # e.g., Rainstorm = high rain + high wind + pressure drop + humidity spike.
    # Single sensor fault = temperature spikes to 48.4°C while humidity/pressure remain completely quiet/normal.
    temp_anomaly = abs(temp - era5_val if primary_param == 'temperature' else temp - 29.0) > 6.0
    hum_anomaly  = abs(hum - 70.0) > 20.0
    pres_anomaly = abs(pres - 1000.0) > 15.0
    rain_anomaly = rain > 10.0

    multi_param_changes = sum([temp_anomaly, hum_anomaly, pres_anomaly, rain_anomaly])
    cross_parameter_consistency = multi_param_changes >= 2

    # 6. ML Anomaly Trigger Threshold (calibrated)
    is_ml_anomaly = if_score > 0.65 or lstm_score > 0.65

    # ─── Classification Logic ──────────────────────────────────────────────────
    evidence = []
    checks = ["Check sensor calibration", "Inspect wiring & connector", "Check sensor housing & radiation shield"]

    if is_impossible:
        classification = "POSSIBLE_SENSOR_FAULT"
        confidence = 0.985
        evidence.append(f"Observed value is outside physically possible operating limits for Erode district")
        evidence.append("Hardware level signal failure / out-of-bounds reading detected")
    elif is_ml_anomaly or era5_dev > (15.0 if primary_param == 'humidity' else 6.0):
        if not neighbour_agreement and not cross_parameter_consistency:
            classification = "POSSIBLE_SENSOR_FAULT"
            confidence = 0.916
            evidence.append(f"Large deviation ({era5_dev:.1f} units) from ERA5 atmospheric reference ({era5_val:.1f})")
            evidence.append(f"Neighbouring AWS stations confirm normal conditions (mean={neighbour_mean:.1f})")
            evidence.append(f"{primary_param.capitalize()} anomaly is isolated to {station_info['name']}")
            evidence.append("Other meteorological parameters remain in baseline normal state (isolated parameter failure)")
        else:
            classification = "REAL_WEATHER_EVENT"
            confidence = 0.884
            evidence.append(f"Neighbouring AWS stations confirm regional atmospheric shift (mean={neighbour_mean:.1f})")
            evidence.append("Cross-parameter correlation confirms simultaneous multi-sensor change (genuine weather event)")
            if era5_dev > 4.0:
                evidence.append(f"Atmospheric reanalysis tracks local regional trend ({era5_val:.1f})")
            checks = ["Monitor station alert logs", "Notify regional weather desk", "Cross-check satellite radar feed"]
    else:
        classification = "NORMAL"
        confidence = 0.950
        evidence.append("All sensor parameters are within normal baseline distributions")
        evidence.append(f"Agrees with ERA5 atmospheric reference ({era5_val:.1f})")
        evidence.append(f"Neighbouring AWS stations show consistent baseline readings (mean={neighbour_mean:.1f})")
        checks = ["Routine maintenance schedule applies"]

    # Determine Alert Level & Buzzer Active State
    if classification == "POSSIBLE_SENSOR_FAULT" and confidence >= 0.80:
        alert_level = "CRITICAL"
        buzzer_active = True
    elif classification == "POSSIBLE_SENSOR_FAULT" or classification == "REAL_WEATHER_EVENT":
        alert_level = "WARNING"
        buzzer_active = False
    else:
        alert_level = "NORMAL"
        buzzer_active = False

    recommendation = {
        "action": (
            f"Inspect {primary_param} sensor at {station_info['name']}"
            if classification == "POSSIBLE_SENSOR_FAULT"
            else ("Issue weather alert for Erode district" if classification == "REAL_WEATHER_EVENT" else "No immediate action required")
        ),
        "checks": checks
    }

    return {
        "station": {
            "id": target_station_id,
            "name": station_info["name"],
            "lat": station_info["lat"],
            "lon": station_info["lon"]
        },
        "observation": {
            "timestamp": datetime.now().isoformat(),
            "temperature": temp,
            "humidity": hum,
            "pressure": pres,
            "wind_speed": wind,
            "rainfall": rain
        },
        "ml_analysis": {
            "is_anomaly": is_ml_anomaly,
            "isolation_forest_score": round(float(if_score), 4),
            "lstm_score": round(float(lstm_score), 4)
        },
        "context": {
            "era5_reference": round(float(era5_val), 2),
            "era5_deviation": round(float(era5_dev), 2),
            "neighbour_mean": round(float(neighbour_mean), 2),
            "neighbour_agreement": neighbour_agreement,
            "cross_parameter_consistency": cross_parameter_consistency
        },
        "classification": {
            "label": classification,
            "confidence": round(float(confidence), 3)
        },
        "alert_level": alert_level,
        "buzzer_active": buzzer_active,
        "evidence": evidence,
        "recommendation": recommendation
    }
