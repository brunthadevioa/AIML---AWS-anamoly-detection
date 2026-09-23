require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const connectDB = require('./config/db');
const { initSocket } = require('./services/socketService');
const { checkMLHealth } = require('./services/mlClient');

// Route imports
const authRoutes = require('./routes/auth');
const stationsRoutes = require('./routes/stations');
const predictRoutes = require('./routes/predict');
const uploadRoutes = require('./routes/upload');
const anomaliesRoutes = require('./routes/anomalies');
const alertsRoutes = require('./routes/alerts');

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT'],
  },
});
initSocket(io);

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check & Gateway Status
app.get('/health', async (req, res) => {
  const mlHealth = await checkMLHealth();
  res.json({
    gateway: 'VAAYU Node.js / Express API Gateway',
    status: 'ONLINE',
    port: process.env.PORT || 5000,
    timestamp: new Date().toISOString(),
    ml_service: mlHealth,
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/stations', stationsRoutes);
app.use('/api/predict', predictRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/anomalies', anomaliesRoutes);
app.use('/api/alerts', alertsRoutes);

// Connect Database & Start Server
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log('====================================================');
  console.log(`🚀 VAAYU Gateway Server running on http://127.0.0.1:${PORT}`);
  console.log(`📡 WebSocket ready for live data & buzzer streaming`);
  console.log(`🤖 Python ML Service target: ${process.env.PYTHON_ML_URL || 'http://127.0.0.1:5001'}`);
  console.log('====================================================');
});

connectDB();

module.exports = { app, server };

