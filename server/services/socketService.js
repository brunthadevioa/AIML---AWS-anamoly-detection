let ioInstance = null;

const initSocket = (io) => {
  ioInstance = io;

  io.on('connection', (socket) => {
    console.log(`[WebSocket] Client connected: ${socket.id}`);

    socket.on('subscribe_station', (stationId) => {
      socket.join(`station_${stationId}`);
      console.log(`[WebSocket] ${socket.id} subscribed to station: ${stationId}`);
    });

    socket.on('disconnect', () => {
      console.log(`[WebSocket] Client disconnected: ${socket.id}`);
    });
  });
};

const broadcastLiveReading = (readingData) => {
  if (ioInstance) {
    ioInstance.emit('live_reading', readingData);
    if (readingData.station_id) {
      ioInstance.to(`station_${readingData.station_id}`).emit('station_reading', readingData);
    }
  }
};

const broadcastAnomalyAlert = (anomalyData) => {
  if (ioInstance) {
    ioInstance.emit('anomaly_alert', anomalyData);
    if (anomalyData.buzzer_active) {
      ioInstance.emit('buzzer_trigger', {
        station_id: anomalyData.station?.id,
        station_name: anomalyData.station?.name,
        classification: anomalyData.classification?.label,
        confidence: anomalyData.classification?.confidence,
        timestamp: new Date().toISOString(),
      });
    }
  }
};

module.exports = {
  initSocket,
  broadcastLiveReading,
  broadcastAnomalyAlert,
};
