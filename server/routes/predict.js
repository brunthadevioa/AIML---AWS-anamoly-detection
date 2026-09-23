const express = require('express');
const router = express.Router();
const { predictSingleReading } = require('../services/mlClient');
const Reading = require('../models/Reading');
const Anomaly = require('../models/Anomaly');
const Alert = require('../models/Alert');
const { broadcastLiveReading, broadcastAnomalyAlert } = require('../services/socketService');

// POST /api/predict
router.post('/', async (req, res) => {
  try {
    const readingData = req.body;
    if (!readingData) {
      return res.status(400).json({ error: 'Reading observation payload is required.' });
    }

    // 1. Call Python Flask ML & Context Engine Service
    const predictionResult = await predictSingleReading(readingData);

    // 2. Persist Reading & Anomaly asynchronously in MongoDB
    try {
      const reading = new Reading({
        station_id: predictionResult.station.id,
        station_name: predictionResult.station.name,
        temperature: predictionResult.observation.temperature,
        humidity: predictionResult.observation.humidity,
        pressure: predictionResult.observation.pressure,
        wind_speed: predictionResult.observation.wind_speed,
        rainfall: predictionResult.observation.rainfall,
      });
      await reading.save();

      if (predictionResult.classification.label !== 'NORMAL') {
        const anomaly = new Anomaly({
          station_id: predictionResult.station.id,
          station_name: predictionResult.station.name,
          observation: predictionResult.observation,
          ml_analysis: predictionResult.ml_analysis,
          context: predictionResult.context,
          classification: predictionResult.classification,
          alert_level: predictionResult.alert_level,
          buzzer_active: predictionResult.buzzer_active,
          evidence: predictionResult.evidence,
          recommendation: predictionResult.recommendation,
        });
        await anomaly.save();

        if (predictionResult.buzzer_active || predictionResult.alert_level === 'CRITICAL') {
          const alert = new Alert({
            station_id: predictionResult.station.id,
            station_name: predictionResult.station.name,
            anomaly_id: anomaly._id,
            alert_level: predictionResult.alert_level,
            type: predictionResult.classification.label === 'POSSIBLE_SENSOR_FAULT' ? 'SENSOR_FAULT' : 'WEATHER_EVENT',
            message: `${predictionResult.classification.label} detected at ${predictionResult.station.name} (${predictionResult.classification.confidence * 100}% confidence).`,
            buzzer_active: predictionResult.buzzer_active,
          });
          await alert.save();
        }
      }
    } catch (dbErr) {
      // Non-blocking: If MongoDB is offline, the API still returns the prediction result
      console.warn(`[DB Persist Notice] ${dbErr.message}`);
    }

    // 3. Broadcast to all connected WebSocket clients
    broadcastLiveReading(predictionResult);
    if (predictionResult.classification.label !== 'NORMAL') {
      broadcastAnomalyAlert(predictionResult);
    }

    // 4. Return the complete dashboard-ready schema
    res.json(predictionResult);
  } catch (error) {
    res.status(500).json({ error: `ML Service Error: ${error.message}` });
  }
});

module.exports = router;
