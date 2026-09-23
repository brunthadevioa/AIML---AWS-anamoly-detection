const axios = require('axios');

const ML_SERVICE_URL = process.env.PYTHON_ML_URL || 'http://127.0.0.1:5001';


/**
 * Send single sensor reading to Python Flask ML Service
 */
const predictSingleReading = async (readingPayload) => {
  try {
    const response = await axios.post(`${ML_SERVICE_URL}/predict`, readingPayload, {
      timeout: 10000,
    });
    return response.data;
  } catch (error) {
    console.error(`[ML Client] /predict error: ${error.message}`);
    throw error;
  }
};

/**
 * Send batch of sensor readings from CSV to Python Flask ML Service
 */
const predictBatchReadings = async (readingsArray) => {
  try {
    const response = await axios.post(`${ML_SERVICE_URL}/predict/batch`, readingsArray, {
      timeout: 60000,
    });
    return response.data;
  } catch (error) {
    console.error(`[ML Client] /predict/batch error: ${error.message}`);
    throw error;
  }
};

/**
 * Fetch health status of Python ML Service
 */
const checkMLHealth = async () => {
  try {
    const response = await axios.get(`${ML_SERVICE_URL}/health`, { timeout: 4000 });
    return response.data;
  } catch (error) {
    return { status: 'offline', error: error.message };
  }
};

/**
 * Fetch live ERA5 reference reading for a station
 */
const getLiveReference = async (stationId) => {
  try {
    const response = await axios.get(`${ML_SERVICE_URL}/live/${stationId}`, { timeout: 6000 });
    return response.data;
  } catch (error) {
    return null;
  }
};

module.exports = {
  predictSingleReading,
  predictBatchReadings,
  checkMLHealth,
  getLiveReference,
};
