const express = require('express');
const router = express.Router();
const Station = require('../models/Station');
const { getLiveReference } = require('../services/mlClient');

const FALLBACK_STATIONS = [
  { station_id: 'AWS_ERD_001', name: 'Erode Town',        lat: 11.3410, lon: 77.7172, district: 'Erode', state: 'Tamil Nadu', status: 'ACTIVE', health_score: 98.2 },
  { station_id: 'AWS_ERD_002', name: 'Gobichettipalayam', lat: 11.4551, lon: 77.4366, district: 'Erode', state: 'Tamil Nadu', status: 'ACTIVE', health_score: 99.1 },
  { station_id: 'AWS_ERD_003', name: 'Bhavani',           lat: 11.4477, lon: 77.6833, district: 'Erode', state: 'Tamil Nadu', status: 'WARNING', health_score: 84.5 },
  { station_id: 'AWS_ERD_004', name: 'Sathyamangalam',    lat: 11.5052, lon: 77.2388, district: 'Erode', state: 'Tamil Nadu', status: 'ACTIVE', health_score: 97.8 },
  { station_id: 'AWS_ERD_005', name: 'Perundurai',        lat: 11.2744, lon: 77.5831, district: 'Erode', state: 'Tamil Nadu', status: 'ACTIVE', health_score: 96.4 },
];

// GET /api/stations
router.get('/', async (req, res) => {
  try {
    let stations = await Station.find().sort({ station_id: 1 });
    if (!stations || stations.length === 0) {
      stations = FALLBACK_STATIONS;
    }
    res.json({
      district: 'Erode',
      state: 'Tamil Nadu',
      count: stations.length,
      stations,
    });
  } catch (error) {
    res.json({
      district: 'Erode',
      state: 'Tamil Nadu',
      count: FALLBACK_STATIONS.length,
      stations: FALLBACK_STATIONS,
    });
  }
});

// GET /api/stations/:id
router.get('/:id', async (req, res) => {
  try {
    let station = await Station.findOne({ station_id: req.params.id });
    if (!station) {
      station = FALLBACK_STATIONS.find(s => s.station_id === req.params.id);
    }
    if (!station) {
      return res.status(404).json({ error: 'Station not found' });
    }

    const liveRef = await getLiveReference(req.params.id);
    res.json({
      station,
      atmospheric_reference: liveRef,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
