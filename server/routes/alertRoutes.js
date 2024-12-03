const express = require('express');
const router = express.Router();
const Alert = require('../models/Alert');

// Get all alerts
router.get('/api/alerts', async (req, res) => {
  try {
    const alerts = await Alert.find().sort({ timestamp: -1 });
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Save alerts
router.post('/api/alerts', async (req, res) => {
  try {
    await Alert.deleteMany({}); // Clear existing alerts
    const alerts = req.body.alerts.map(alert => new Alert(alert));
    await Alert.insertMany(alerts);
    res.status(201).json(alerts);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
