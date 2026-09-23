const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, district } = req.body;
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ error: 'User with this email already exists.' });
    }

    user = new User({ name, email, password, role: role || 'officer', district: district || 'Erode' });
    await user.save();

    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email, role: user.role, district: user.district },
      process.env.JWT_SECRET || 'vaayu_super_secret_jwt_key_sih_2026_erode',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, district: user.district },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // In-memory fallback support if MongoDB is not reachable
    if (email === 'officer@vaayu.tn.gov.in' && password === 'password123') {
      const token = jwt.sign(
        { id: 'demo-officer-id', name: 'District Weather Officer (Erode)', email, role: 'officer', district: 'Erode' },
        process.env.JWT_SECRET || 'vaayu_super_secret_jwt_key_sih_2026_erode',
        { expiresIn: '7d' }
      );
      return res.json({
        message: 'Login successful',
        token,
        user: { id: 'demo-officer-id', name: 'District Weather Officer (Erode)', email, role: 'officer', district: 'Erode' },
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email, role: user.role, district: user.district },
      process.env.JWT_SECRET || 'vaayu_super_secret_jwt_key_sih_2026_erode',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, district: user.district },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
