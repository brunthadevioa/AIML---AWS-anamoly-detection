const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  station_id: {
    type: String,
    required: true,
    index: true,
  },
  station_name: {
    type: String,
    required: true,
  },
  anomaly_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Anomaly',
  },
  alert_level: {
    type: String,
    enum: ['CRITICAL', 'WARNING', 'INFO'],
    default: 'WARNING',
  },
  type: {
    type: String,
    enum: ['SENSOR_FAULT', 'WEATHER_EVENT', 'SYSTEM'],
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  buzzer_active: {
    type: Boolean,
    default: false,
  },
  is_acknowledged: {
    type: Boolean,
    default: false,
  },
  acknowledged_by: {
    type: String,
  },
  acknowledged_at: {
    type: Date,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Alert', alertSchema);
