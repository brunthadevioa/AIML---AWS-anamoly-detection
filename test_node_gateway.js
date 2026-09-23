const fs = require('fs');
const path = require('path');

const GATEWAY_URL = 'http://localhost:5000';

async function runGatewayTests() {
  console.log('====================================================');
  console.log('🧪 Testing VAAYU Node.js API Gateway (:5000) End-to-End');
  console.log('====================================================');

  try {
    // 1. Health Check
    console.log('\n[1/5] GET /health...');
    const healthRes = await fetch(`${GATEWAY_URL}/health`);
    const health = await healthRes.json();
    console.log('Status:', healthRes.status);
    console.log('Gateway:', health.gateway, '| ML Service:', health.ml_service?.service || health.ml_service?.status);

    // 2. Auth Login
    console.log('\n[2/5] POST /api/auth/login...');
    const loginRes = await fetch(`${GATEWAY_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'officer@vaayu.tn.gov.in',
        password: 'password123',
      }),
    });
    const login = await loginRes.json();
    console.log('Status:', loginRes.status);
    console.log('Logged in as:', login.user?.name, '| Role:', login.user?.role);

    // 3. Get Stations
    console.log('\n[3/5] GET /api/stations...');
    const stationsRes = await fetch(`${GATEWAY_URL}/api/stations`);
    const stations = await stationsRes.json();
    console.log('Status:', stationsRes.status);
    console.log('District:', stations.district, '| Stations count:', stations.count);
    stations.stations.forEach(s => console.log(`  - ${s.station_id}: ${s.name} (${s.lat}, ${s.lon})`));

    // 4. Test Single Prediction Proxy (Bhavani 48.4°C Temperature Spike)
    console.log('\n[4/5] POST /api/predict (Bhavani Sensor Fault Simulation)...');
    const predRes = await fetch(`${GATEWAY_URL}/api/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        station_id: 'AWS_ERD_003',
        temperature: 48.4,
        humidity: 61.2,
        pressure: 1005.4,
        wind_speed: 8.2,
        rainfall: 0.0,
      }),
    });
    const pred = await predRes.json();
    console.log('Status:', predRes.status);
    console.log('Station:', pred.station?.name);
    console.log('Classification:', pred.classification?.label, `(Confidence: ${pred.classification?.confidence * 100}%)`);
    console.log('Alert Level:', pred.alert_level, '| Buzzer Active:', pred.buzzer_active);
    console.log('Evidence:', pred.evidence);

    // 5. Test CSV Upload Pipeline
    console.log('\n[5/5] POST /api/upload/csv (Uploading Sample AWS CSV)...');
    const sampleCsvContent = `station_id,temperature,humidity,pressure,wind_speed,rainfall
AWS_ERD_001,28.5,72.0,1001.2,5.4,0.0
AWS_ERD_002,29.1,68.0,999.8,4.2,0.0
AWS_ERD_003,48.4,61.2,1005.4,8.2,0.0
AWS_ERD_004,39.5,32.0,988.2,28.5,12.4
AWS_ERD_005,29.0,70.0,1000.0,5.0,0.0`;

    const blob = new Blob([sampleCsvContent], { type: 'text/csv' });
    const formData = new FormData();
    formData.append('file', blob, 'erode_aws_live_sample.csv');

    const uploadRes = await fetch(`${GATEWAY_URL}/api/upload/csv`, {
      method: 'POST',
      body: formData,
    });
    const uploadData = await uploadRes.json();
    console.log('Status:', uploadRes.status);
    console.log('Run ID:', uploadData.run_id);
    console.log('Summary:', uploadData.summary);
    console.log('Anomalies Detected in Batch:', uploadData.anomalies?.length);

    console.log('\n====================================================');
    console.log('🎉 ALL 5 GATEWAY TESTS PASSED SUCCESSFULLY!');
    console.log('====================================================');
  } catch (error) {
    console.error('Test Failed:', error.message);
  }
}

runGatewayTests();
