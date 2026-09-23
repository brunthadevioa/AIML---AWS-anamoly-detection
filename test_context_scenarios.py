"""
VAAYU ML Service — test_context_scenarios.py

Validation test suite verifying that VAAYU's Context Engine accurately
distinguishes SENSOR FAULTS from REAL WEATHER EVENTS.
"""

import sys, os, json
sys.stdout.reconfigure(encoding="utf-8")
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "ml-service"))

from app import app

client = app.test_client()

scenarios = [
    {
        "name": "Scenario 1: Isolated Temperature Spike (Bhavani Station)",
        "input": {
            "station_id": "AWS_ERD_003", # Bhavani
            "temperature": 48.4,        # Spike
            "humidity": 61.2,           # Normal
            "pressure": 1005.4,         # Normal
            "wind_speed": 8.2,
            "rainfall": 0.0
        },
        "expected_label": "POSSIBLE_SENSOR_FAULT"
    },
    {
        "name": "Scenario 2: Regional Weather Front / Multi-Parameter Event",
        "input": {
            "station_id": "AWS_ERD_001", # Erode Town
            "temperature": 39.5,        # Heatwave temp
            "humidity": 32.0,           # Drops in tandem
            "pressure": 988.2,          # Low pressure storm/front
            "wind_speed": 28.5,         # High wind
            "rainfall": 12.4
        },
        "expected_label": "REAL_WEATHER_EVENT"
    },
    {
        "name": "Scenario 3: Out-of-Bounds Sensor Glitch (Physically Impossible Value)",
        "input": {
            "station_id": "AWS_ERD_004", # Sathyamangalam
            "temperature": -18.5,       # Impossible for Erode
            "humidity": 70.0,
            "pressure": 998.0,
            "wind_speed": 5.0,
            "rainfall": 0.0
        },
        "expected_label": "POSSIBLE_SENSOR_FAULT"
    },
    {
        "name": "Scenario 4: Normal Operational Baseline (Gobichettipalayam)",
        "input": {
            "station_id": "AWS_ERD_002", # Gobi
            "temperature": 29.2,
            "humidity": 68.5,
            "pressure": 996.1,
            "wind_speed": 4.5,
            "rainfall": 0.0
        },
        "expected_label": "NORMAL"
    }
]

def run_scenario_tests():
    print("=" * 70)
    print("VAAYU — Explainable AI Context Engine Scenario Validation")
    print("=" * 70)
    
    passed = 0
    for i, sc in enumerate(scenarios, 1):
        print(f"\n[{i}/{len(scenarios)}] Testing: {sc['name']}")
        res = client.post("/predict", json=sc["input"])
        data = json.loads(res.data)
        
        station_name = data.get("station", {}).get("name", "Unknown")
        classification = data.get("classification", {}).get("label", "UNKNOWN")
        confidence = data.get("classification", {}).get("confidence", 0.0)
        alert = data.get("alert_level", "NORMAL")
        buzzer = data.get("buzzer_active", False)
        evidence = data.get("evidence", [])
        
        print(f"      Station        : {station_name} ({sc['input']['station_id']})")
        print(f"      Classification : {classification} (Context Confidence: {confidence*100:.1f}%)")
        print(f"      Alert Level    : {alert} | Buzzer Active: {buzzer}")
        print("      Evidence List  :")
        for ev in evidence:
            print(f"        • {ev}")
        print(f"      Action         : {data.get('recommendation', {}).get('action')}")
        
        if classification == sc["expected_label"]:
            print("      STATUS         : ✅ PASSED (Matches expected classification)")
            passed += 1
        else:
            print(f"      STATUS         : ❌ FAILED (Expected {sc['expected_label']}, got {classification})")

    print("\n" + "=" * 70)
    print(f"Validation Results: {passed}/{len(scenarios)} Scenarios Passed")
    print("=" * 70)

if __name__ == "__main__":
    run_scenario_tests()
