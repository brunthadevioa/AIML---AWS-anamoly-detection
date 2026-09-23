"""
VAAYU — Phase 0: Pull 2-year historical baseline for all Erode stations
Injects realistic AWS sensor fault patterns for ML training labels.
"""
import sys, os, json
sys.stdout.reconfigure(encoding='utf-8')

import requests
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random

STATIONS = [
    {"id": "AWS_ERD_001", "name": "Erode Town",        "lat": 11.3410, "lon": 77.7172},
    {"id": "AWS_ERD_002", "name": "Gobichettipalayam", "lat": 11.4551, "lon": 77.4366},
    {"id": "AWS_ERD_003", "name": "Bhavani",           "lat": 11.4477, "lon": 77.6833},
    {"id": "AWS_ERD_004", "name": "Sathyamangalam",    "lat": 11.5052, "lon": 77.2388},
    {"id": "AWS_ERD_005", "name": "Perundurai",        "lat": 11.2744, "lon": 77.5831},
]

PARAMS = "temperature_2m,relative_humidity_2m,surface_pressure,wind_speed_10m,rain,wind_direction_10m,dew_point_2m"
START  = "2024-01-01"
END    = "2026-09-09"

os.makedirs("data/raw",      exist_ok=True)
os.makedirs("data/labeled",  exist_ok=True)
os.makedirs("data/combined", exist_ok=True)

def inject_faults(df, station_id, fault_rate=0.03):
    """
    Inject realistic AWS sensor fault patterns into clean data.
    Fault types from published AWS fault literature:
    1. Spike     — sudden extreme value then returns to normal
    2. Stuck     — sensor reads same value repeatedly
    3. Drift     — gradual offset accumulation
    4. Flatline  — sensor reads constant near-zero or constant value
    5. Gap/NaN   — transmission failure
    """
    df = df.copy()
    df["fault_type"]  = "NONE"
    df["is_anomaly"]  = 0
    df["label"]       = "NORMAL"
    df["confidence"]  = 0.0

    total = len(df)
    n_faults = int(total * fault_rate)
    fault_indices = random.sample(range(10, total - 10), n_faults)

    for idx in fault_indices:
        fault = random.choice(["SPIKE", "STUCK", "DRIFT", "FLATLINE"])
        col   = random.choice(["temperature_2m", "relative_humidity_2m", "surface_pressure", "wind_speed_10m"])
        duration = random.randint(1, 6)

        if fault == "SPIKE":
            real_val = df.at[idx, col]
            if real_val is not None and not pd.isna(real_val):
                spike_mag = random.choice([-1, 1]) * random.uniform(15, 40)
                df.at[idx, col] = real_val + spike_mag

        elif fault == "STUCK":
            stuck_val = df.at[idx, col]
            for j in range(duration):
                if idx + j < total:
                    df.at[idx + j, col] = stuck_val

        elif fault == "DRIFT":
            base = df.at[idx, col]
            for j in range(duration):
                if idx + j < total and base is not None and not pd.isna(base):
                    df.at[idx + j, col] = base + (j * random.uniform(1.5, 4.0))

        elif fault == "FLATLINE":
            flat_val = 0.0 if col == "rain" else random.uniform(0, 5)
            for j in range(duration):
                if idx + j < total:
                    df.at[idx + j, col] = flat_val

        for j in range(duration):
            if idx + j < total:
                df.at[idx + j, "fault_type"] = fault
                df.at[idx + j, "is_anomaly"]  = 1
                df.at[idx + j, "label"]        = "SENSOR_FAULT"
                df.at[idx + j, "confidence"]   = round(random.uniform(0.75, 0.98), 2)

    return df

print("=" * 60)
print("VAAYU — Pulling 2-Year Historical Data (ERA5)")
print(f"Period: {START} to {END}")
print("=" * 60)

all_dfs = []

for station in STATIONS:
    print(f"\n  [{station['id']}] {station['name']} ...")
    url = (
        f"https://archive-api.open-meteo.com/v1/archive"
        f"?latitude={station['lat']}&longitude={station['lon']}"
        f"&start_date={START}&end_date={END}"
        f"&hourly={PARAMS}"
        f"&timezone=Asia%2FKolkata"
        f"&wind_speed_unit=kmh"
    )
    try:
        resp = requests.get(url, timeout=60)
        if resp.status_code == 200:
            raw = resp.json()["hourly"]
            df  = pd.DataFrame(raw)
            df.rename(columns={
                "time":                  "timestamp",
                "temperature_2m":        "temperature",
                "relative_humidity_2m":  "humidity",
                "surface_pressure":      "pressure",
                "wind_speed_10m":        "wind_speed",
                "wind_direction_10m":    "wind_direction",
                "dew_point_2m":          "dew_point",
                "rain":                  "rainfall",
            }, inplace=True)

            df["station_id"]   = station["id"]
            df["station_name"] = station["name"]
            df["lat"]          = station["lat"]
            df["lon"]          = station["lon"]
            df["data_source"]  = "ERA5_OpenMeteo"

            # Save raw
            raw_path = f"data/raw/{station['id']}_raw.csv"
            df.to_csv(raw_path, index=False)
            print(f"    Saved {len(df)} raw records → {raw_path}")

            # Inject faults and label
            df_labeled = inject_faults(df, station["id"], fault_rate=0.03)
            labeled_path = f"data/labeled/{station['id']}_labeled.csv"
            df_labeled.to_csv(labeled_path, index=False)

            n_faults = df_labeled["is_anomaly"].sum()
            print(f"    Injected {n_faults} fault records ({round(n_faults/len(df)*100,1)}%)")
            print(f"    Saved labeled → {labeled_path}")

            all_dfs.append(df_labeled)
        else:
            print(f"    ERROR: HTTP {resp.status_code}")
    except Exception as e:
        print(f"    ERROR: {e}")

# ─── Combine all stations ─────────────────────────────────────────────────────
if all_dfs:
    combined = pd.concat(all_dfs, ignore_index=True)
    combined_path = "data/combined/erode_all_stations_labeled.csv"
    combined.to_csv(combined_path, index=False)
    print(f"\n{'='*60}")
    print(f"COMBINED DATASET")
    print(f"{'='*60}")
    print(f"  Total records : {len(combined):,}")
    print(f"  Date range    : {combined['timestamp'].min()} → {combined['timestamp'].max()}")
    print(f"  Stations      : {combined['station_id'].nunique()}")
    print(f"  Anomalies     : {combined['is_anomaly'].sum():,}")
    print(f"  Normal        : {(combined['is_anomaly']==0).sum():,}")
    print(f"  Columns       : {list(combined.columns)}")
    print(f"  Saved to      : {combined_path}")

    # Quick stats per station
    print(f"\n  Per-station summary:")
    for sid, grp in combined.groupby("station_id"):
        name = grp["station_name"].iloc[0]
        print(f"    {sid} ({name}): {len(grp):,} records | "
              f"Temp {grp['temperature'].min():.1f}-{grp['temperature'].max():.1f}°C | "
              f"Faults: {grp['is_anomaly'].sum()}")

    print(f"\nDone. Data is REAL (ERA5) + labeled faults. Ready for ML training.")
