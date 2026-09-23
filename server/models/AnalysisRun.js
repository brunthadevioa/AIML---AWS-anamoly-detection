const mongoose = require('mongoose');

const analysisRunSchema = new mongoose.Schema({
  run_id: {
    type: String,
    required: true,
    unique: true,
  },
  filename: {
    type: String,
    required: true,
  },
  uploaded_by: {
    type: String,
    default: 'District Weather Officer',
  },
  total_processed: {
    type: Number,
    required: true,
  },
  ml_anomalies: {
    type: Number,
    default: 0,
  },
  possible_sensor_faults: {
    type: Number,
    default: 0,
  },
  real_weather_events: {
    type: Number,
    default: 0,
  },
  normal_readings: {
    type: Number,
    default: 0,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('AnalysisRun', analysisRunSchema);
