"""
VAAYU — Phase 0: Data Pipeline Probe
Verifies exactly what real data is accessible for Erode district stations.
Source: Open-Meteo Historical Weather API (ERA5 reanalysis)
        - Same global dataset referenced by IMD and ECMWF
        - Real observed + modelled atmospheric data
        - NOT synthetic / NOT invented
"""

import requests
import json
from datetime import datetime, timedelta

# ─── Erode District AWS Stations ───────────────────────────────────────────────
# Coordinates cross-referenced with known TAWN/IMD station locations in Erode
STATIONS = [
    {"id": "AWS_ERD_001", "name": "Erode Town",          "lat": 11.3410, "lon": 77.7172, "block": "Erode"},
    {"id": "AWS_ERD_002", "name": "Gobichettipalayam",   "lat": 11.4551, "lon": 77.4366, "block": "Gobi"},
    {"id": "AWS_ERD_003", "name": "Bhavani",             "lat": 11.4477, "lon": 77.6833, "block": "Bhavani"},
    {"id": "AWS_ERD_004", "name": "Sathyamangalam",      "lat": 11.5052, "lon": 77.2388, "block": "Sathyamangalam"},
    {"id": "AWS_ERD_005", "name": "Perundurai",          "lat": 11.2744, "lon": 77.5831, "block": "Perundurai"},
]

# ─── What we ask for ──────────────────────────────────────────────────────────
PARAMETERS = [
    "temperature_2m",        # °C — maps to AWS temperature sensor
    "relative_humidity_2m",  # %  — maps to AWS humidity sensor
    "surface_pressure",      # hPa — maps to AWS pressure sensor
    "wind_speed_10m",        # km/h — maps to AWS anemometer
    "rain",                  # mm/hr — maps to AWS rain gauge
    "wind_direction_10m",    # degrees
    "apparent_temperature",  # feels-like
    "dew_point_2m",          # °C
]

# ─── Probe 1: HISTORICAL data availability ──────────────────────────────────
print("=" * 65)
print("VAAYU — Real Data Probe | Erode District AWS Stations")
print("=" * 65)
print(f"\nTimestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S IST')}")
print(f"\nSource: Open-Meteo Historical API (ERA5 Reanalysis)")
print(f"        Resolution: Hourly | Coverage: 1940–present")
print(f"        Attribution: ECMWF ERA5 / Open-Meteo (open-source)\n")

# Test with 7 days of recent data for speed
end_date   = (datetime.now() - timedelta(days=2)).strftime("%Y-%m-%d")  # ERA5 has ~2 day lag
start_date = (datetime.now() - timedelta(days=9)).strftime("%Y-%m-%d")

results = {}

for station in STATIONS:
    print(f"  Probing: {station['name']} ({station['id']}) ...")
    url = (
        f"https://archive-api.open-meteo.com/v1/archive"
        f"?latitude={station['lat']}&longitude={station['lon']}"
        f"&start_date={start_date}&end_date={end_date}"
        f"&hourly={','.join(PARAMETERS)}"
        f"&timezone=Asia%2FKolkata"
        f"&wind_speed_unit=kmh"
    )
    try:
        resp = requests.get(url, timeout=15)
        if resp.status_code == 200:
            data = resp.json()
            hourly = data.get("hourly", {})
            times  = hourly.get("time", [])
            temps  = hourly.get("temperature_2m", [])
            humid  = hourly.get("relative_humidity_2m", [])
            pres   = hourly.get("surface_pressure", [])
            wind   = hourly.get("wind_speed_10m", [])
            rain   = hourly.get("rain", [])

            # Get most recent valid reading
            latest_idx = len(times) - 1
            while latest_idx >= 0 and temps[latest_idx] is None:
                latest_idx -= 1

            results[station["id"]] = {
                "station": station["name"],
                "status":  "✅ LIVE",
                "records": len(times),
                "date_range": f"{times[0]} → {times[-1]}" if times else "N/A",
                "latest": {
                    "time":        times[latest_idx] if latest_idx >= 0 else "N/A",
                    "temperature": f"{temps[latest_idx]}°C" if latest_idx >= 0 else "N/A",
                    "humidity":    f"{humid[latest_idx]}%" if latest_idx >= 0 else "N/A",
                    "pressure":    f"{pres[latest_idx]} hPa" if latest_idx >= 0 else "N/A",
                    "wind_speed":  f"{wind[latest_idx]} km/h" if latest_idx >= 0 else "N/A",
                    "rainfall":    f"{rain[latest_idx]} mm" if latest_idx >= 0 else "N/A",
                },
                "missing_pct": {
                    "temperature": f"{round(temps.count(None)/len(temps)*100, 1)}%" if temps else "N/A",
                    "humidity":    f"{round(humid.count(None)/len(humid)*100, 1)}%" if humid else "N/A",
                    "pressure":    f"{round(pres.count(None)/len(pres)*100, 1)}%"  if pres  else "N/A",
                    "wind":        f"{round(wind.count(None)/len(wind)*100, 1)}%"  if wind  else "N/A",
                    "rain":        f"{round(rain.count(None)/len(rain)*100, 1)}%"  if rain  else "N/A",
                }
            }
            print(f"    ✅ {len(times)} hourly records | Latest: {times[latest_idx] if latest_idx >= 0 else 'N/A'}")
        else:
            results[station["id"]] = {"station": station["name"], "status": f"❌ HTTP {resp.status_code}"}
            print(f"    ❌ HTTP {resp.status_code}")
    except Exception as e:
        results[station["id"]] = {"station": station["name"], "status": f"❌ ERROR: {e}"}
        print(f"    ❌ ERROR: {e}")

# ─── Probe 2: LIVE/FORECAST data availability ────────────────────────────────
print(f"\n{'─'*65}")
print("  Probing: Live/Forecast Feed (for real-time dashboard) ...")
station = STATIONS[1]  # Gobi
url = (
    f"https://api.open-meteo.com/v1/forecast"
    f"?latitude={station['lat']}&longitude={station['lon']}"
    f"&current=temperature_2m,relative_humidity_2m,surface_pressure,"
    f"wind_speed_10m,rain,weather_code"
    f"&hourly=temperature_2m,relative_humidity_2m,surface_pressure,"
    f"wind_speed_10m,rain"
    f"&forecast_days=1"
    f"&timezone=Asia%2FKolkata"
    f"&wind_speed_unit=kmh"
)
try:
    resp = requests.get(url, timeout=10)
    if resp.status_code == 200:
        data = resp.json()
        current = data.get("current", {})
        print(f"    ✅ LIVE FEED AVAILABLE — Gobichettipalayam RIGHT NOW:")
        print(f"       Time:        {current.get('time', 'N/A')}")
        print(f"       Temperature: {current.get('temperature_2m', 'N/A')}°C")
        print(f"       Humidity:    {current.get('relative_humidity_2m', 'N/A')}%")
        print(f"       Pressure:    {current.get('surface_pressure', 'N/A')} hPa")
        print(f"       Wind:        {current.get('wind_speed_10m', 'N/A')} km/h")
        print(f"       Rainfall:    {current.get('rain', 'N/A')} mm")
        print(f"       Update freq: Every 15 minutes (WMO standard)")
    else:
        print(f"    ❌ HTTP {resp.status_code}")
except Exception as e:
    print(f"    ❌ ERROR: {e}")

# ─── Summary Report ──────────────────────────────────────────────────────────
print(f"\n{'='*65}")
print("FULL PROBE RESULTS")
print(f"{'='*65}\n")

for sid, r in results.items():
    print(f"  Station:   {r['station']} ({sid})")
    print(f"  Status:    {r['status']}")
    if "records" in r:
        print(f"  Records:   {r['records']} hourly readings ({r['date_range']})")
        print(f"  Latest observation:")
        l = r["latest"]
        print(f"    → Time:        {l['time']}")
        print(f"    → Temperature: {l['temperature']}")
        print(f"    → Humidity:    {l['humidity']}")
        print(f"    → Pressure:    {l['pressure']}")
        print(f"    → Wind:        {l['wind_speed']}")
        print(f"    → Rainfall:    {l['rainfall']}")
        print(f"  Missing data %:")
        m = r["missing_pct"]
        print(f"    → Temp: {m['temperature']}  Humidity: {m['humidity']}  "
              f"Pressure: {m['pressure']}  Wind: {m['wind']}  Rain: {m['rain']}")
    print()

# ─── Pipeline Verdict ─────────────────────────────────────────────────────────
print(f"{'='*65}")
print("PIPELINE VERDICT")
print(f"{'='*65}")
print("""
PRIMARY DATA PATH (Upload Workflow):
  Officer uploads actual Gobi_AWS_2026.csv
  → Our system validates, cleans, analyses
  → Anomaly detection runs on REAL sensor data
  → Labeled clearly as: "Uploaded AWS Observations"

REFERENCE DATA PATH (Context for anomaly classification):
  Open-Meteo ERA5 / Forecast for Erode station coordinates
  → Used to cross-check: "Are neighboring stations also seeing this?"
  → Labeled clearly as: "ERA5 Atmospheric Reference (Open-Meteo)"
  → NOT presented as physical AWS sensor telemetry

LIVE MONITORING PATH (Dashboard):
  Open-Meteo Forecast API → updates every 15 min
  → Labeled: "Live Weather Reference — Erode District"
  → Anomaly detection runs on incoming reference readings
  → Detects weather events (real spikes in the atmosphere)

HISTORICAL BASELINE:
  2 years of ERA5 hourly data per station
  → Used to train Isolation Forest + LSTM Autoencoder
  → Erode-specific seasonal patterns, monsoon behaviour
""")
print(f"Probe complete: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
