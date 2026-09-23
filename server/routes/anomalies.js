const express = require('express');
const router = express.Router();
const Anomaly = require('../models/Anomaly');

// GET /api/anomalies
router.get('/', async (req, res) => {
  try {
    const { station_id, classification, limit = 100 } = req.query;
    const filter = {};
    if (station_id) filter.station_id = station_id;
    if (classification) filter['classification.label'] = classification;

    const anomalies = await Anomaly.find(filter)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    res.json({
      count: anomalies.length,
      anomalies,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/anomalies/stats
router.get('/stats', async (req, res) => {
  try {
    const totalAnomalies = await Anomaly.countDocuments();
    const sensorFaults = await Anomaly.countDocuments({ 'classification.label': 'POSSIBLE_SENSOR_FAULT' });
    const weatherEvents = await Anomaly.countDocuments({ 'classification.label': 'REAL_WEATHER_EVENT' });

    res.json({
      total_anomalies: totalAnomalies,
      sensor_faults: sensorFaults,
      weather_events: weatherEvents,
      fault_rate_pct: totalAnomalies > 0 ? round((sensorFaults / totalAnomalies) * 100, 1) : 0,
    });
  } catch (error) {
    res.json({
      total_anomalies: 0,
      sensor_faults: 0,
      weather_events: 0,
      fault_rate_pct: 0,
    });
  }
});

module.exports = router;
