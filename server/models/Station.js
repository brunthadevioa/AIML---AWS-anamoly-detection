const mongoose = require('mongoose');

const stationSchema = new mongoose.Schema({
  station_id: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
  },
  lat: {
    type: Number,
    required: true,
  },
  lon: {
    type: Number,
    required: true,
  },
  district: {
    type: String,
    default: 'Erode',
  },
  state: {
    type: String,
    default: 'Tamil Nadu',
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'WARNING', 'MAINTENANCE_REQUIRED', 'OFFLINE'],
    default: 'ACTIVE',
  },
  health_score: {
    type: Number,
    default: 100.0,
  },
  last_seen: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Station', stationSchema);
