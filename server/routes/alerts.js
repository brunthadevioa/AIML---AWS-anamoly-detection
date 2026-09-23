const express = require('express');
const router = express.Router();
const Alert = require('../models/Alert');

// GET /api/alerts
router.get('/', async (req, res) => {
  try {
    const { acknowledged, limit = 50 } = req.query;
    const filter = {};
    if (acknowledged !== undefined) {
      filter.is_acknowledged = acknowledged === 'true';
    }

    const alerts = await Alert.find(filter)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    res.json({
      count: alerts.length,
      alerts,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/alerts/:id/acknowledge
router.put('/:id/acknowledge', async (req, res) => {
  try {
    const { officer_name } = req.body;
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      {
        is_acknowledged: true,
        acknowledged_by: officer_name || 'District Weather Officer',
        acknowledged_at: new Date(),
        buzzer_active: false,
      },
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    res.json({ message: 'Alert acknowledged and buzzer silenced', alert });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
