const mongoose = require('mongoose');

const anomalySchema = new mongoose.Schema({
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
  observation: {
    temperature: Number,
    humidity: Number,
    pressure: Number,
    wind_speed: Number,
    rainfall: Number,
  },
  ml_analysis: {
    is_anomaly: Boolean,
    isolation_forest_score: Number,
    lstm_score: Number,
  },
  context: {
    era5_reference: Number,
    era5_deviation: Number,
    neighbour_mean: Number,
    neighbour_agreement: Boolean,
    cross_parameter_consistency: Boolean,
  },
  classification: {
    label: {
      type: String,
      enum: ['POSSIBLE_SENSOR_FAULT', 'REAL_WEATHER_EVENT', 'NORMAL'],
      required: true,
      index: true,
    },
    confidence: Number,
  },
  alert_level: {
    type: String,
    enum: ['CRITICAL', 'WARNING', 'NORMAL'],
    default: 'NORMAL',
  },
  buzzer_active: {
    type: Boolean,
    default: false,
  },
  evidence: [String],
  recommendation: {
    action: String,
    checks: [String],
  },
  is_resolved: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model('Anomaly', anomalySchema);
