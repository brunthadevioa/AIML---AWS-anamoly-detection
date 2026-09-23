const express = require('express');
const router = express.Router();
const fs = require('fs');
const csv = require('csv-parser');
const upload = require('../middleware/upload');
const { predictBatchReadings } = require('../services/mlClient');
const AnalysisRun = require('../models/AnalysisRun');
const Anomaly = require('../models/Anomaly');

// POST /api/upload/csv
router.post('/csv', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Please upload a valid CSV file.' });
  }

  const filePath = req.file.path;
  const readings = [];

  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (row) => {
      // Robust column mapping for various AWS telemetry CSV formats
      const temp = parseFloat(row.temperature || row.temp || row.temp_c || row.Temperature || 28.0);
      const hum  = parseFloat(row.humidity || row.hum || row.rh || row.Humidity || 70.0);
      const pres = parseFloat(row.pressure || row.pres || row.baro || row.Pressure || 1000.0);
      const wind = parseFloat(row.wind_speed || row.wind || row.ws || row.WindSpeed || 5.0);
      const rain = parseFloat(row.rainfall || row.rain || row.prcp || row.Rainfall || 0.0);
      const station_id = row.station_id || row.station || row.StationID || 'AWS_ERD_001';

      if (!isNaN(temp) && !isNaN(hum)) {
        readings.push({
          station_id,
          temperature: temp,
          humidity: hum,
          pressure: pres,
          wind_speed: wind,
          rainfall: rain,
          timestamp: row.timestamp || row.time || row.Date || new Date().toISOString(),
        });
      }
    })
    .on('end', async () => {
      try {
        // Delete temporary uploaded file
        fs.unlink(filePath, () => {});

        if (readings.length === 0) {
          return res.status(400).json({ error: 'CSV file contains no valid weather observations.' });
        }

        // Send batch to Python Flask ML Service
        const batchResponse = await predictBatchReadings(readings.slice(0, 5000));
        const runId = 'RUN-' + Date.now();

        // Save Analysis Run in MongoDB
        try {
          const run = new AnalysisRun({
            run_id: runId,
            filename: req.file.originalname,
            total_processed: batchResponse.summary.total_processed,
            ml_anomalies: batchResponse.summary.ml_anomalies,
            possible_sensor_faults: batchResponse.summary.possible_sensor_faults,
            real_weather_events: batchResponse.summary.real_weather_events,
            normal_readings: batchResponse.summary.normal_readings,
          });
          await run.save();

          // Save batch anomalies
          const anomaliesToSave = batchResponse.results
            .filter((r) => r.classification?.label !== 'NORMAL')
            .map((r) => ({
              station_id: r.station?.id || 'AWS_ERD_001',
              station_name: r.station?.name || 'AWS Station',
              observation: r.observation,
              ml_analysis: r.ml_analysis,
              context: r.context,
              classification: r.classification,
              alert_level: r.alert_level,
              buzzer_active: r.buzzer_active,
              evidence: r.evidence,
              recommendation: r.recommendation,
            }));

          if (anomaliesToSave.length > 0) {
            await Anomaly.insertMany(anomaliesToSave);
          }
        } catch (dbErr) {
          console.warn(`[Batch DB Persist Notice] ${dbErr.message}`);
        }

        res.json({
          run_id: runId,
          filename: req.file.originalname,
          summary: batchResponse.summary,
          anomalies: batchResponse.results.filter((r) => r.classification?.label !== 'NORMAL'),
          all_results: batchResponse.results,
        });
      } catch (err) {
        res.status(500).json({ error: `Batch processing failed: ${err.message}` });
      }
    })
    .on('error', (err) => {
      res.status(500).json({ error: `Error parsing CSV: ${err.message}` });
    });
});

module.exports = router;
