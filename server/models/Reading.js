const mongoose = require('mongoose');

const readingSchema = new mongoose.Schema({
  station_id: {
    type: String,
    required: true,
    index: true,
  },
  station_name: {
    type: String,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
  temperature: {
    type: Number,
    required: true,
  },
  humidity: {
    type: Number,
    required: true,
  },
  pressure: {
    type: Number,
    required: true,
  },
  wind_speed: {
    type: Number,
    default: 0.0,
  },
  rainfall: {
    type: Number,
    default: 0.0,
  },
  dew_point: {
    type: Number,
  },
  wind_direction: {
    type: Number,
    default: 180,
  },
  source: {
    type: String,
    enum: ['AWS_LIVE_TELEMETRY', 'AWS_CSV_UPLOAD', 'SIMULATION'],
    default: 'AWS_LIVE_TELEMETRY',
  },
});

module.exports = mongoose.model('Reading', readingSchema);
