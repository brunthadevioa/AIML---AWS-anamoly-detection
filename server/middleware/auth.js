const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No authentication token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'vaayu_super_secret_jwt_key_sih_2026_erode');
    req.user = decoded;
    next();
  } catch (ex) {
    res.status(400).json({ error: 'Invalid or expired token.' });
  }
};

module.exports = authMiddleware;
