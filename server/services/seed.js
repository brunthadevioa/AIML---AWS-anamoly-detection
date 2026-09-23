require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Station = require('../models/Station');
const User = require('../models/User');

const ERODE_STATIONS = [
  { station_id: 'AWS_ERD_001', name: 'Erode Town',        lat: 11.3410, lon: 77.7172, district: 'Erode', state: 'Tamil Nadu' },
  { station_id: 'AWS_ERD_002', name: 'Gobichettipalayam', lat: 11.4551, lon: 77.4366, district: 'Erode', state: 'Tamil Nadu' },
  { station_id: 'AWS_ERD_003', name: 'Bhavani',           lat: 11.4477, lon: 77.6833, district: 'Erode', state: 'Tamil Nadu' },
  { station_id: 'AWS_ERD_004', name: 'Sathyamangalam',    lat: 11.5052, lon: 77.2388, district: 'Erode', state: 'Tamil Nadu' },
  { station_id: 'AWS_ERD_005', name: 'Perundurai',        lat: 11.2744, lon: 77.5831, district: 'Erode', state: 'Tamil Nadu' },
];

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/vaayu_db';
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log('[Seed] Connected to MongoDB');

    // 1. Seed Stations
    for (const st of ERODE_STATIONS) {
      await Station.findOneAndUpdate(
        { station_id: st.station_id },
        { ...st, status: 'ACTIVE', health_score: 98.5 },
        { upsert: true, new: true }
      );
    }
    console.log(`[Seed] Successfully seeded ${ERODE_STATIONS.length} Erode AWS stations.`);

    // 2. Seed Default Officer Account
    const existingUser = await User.findOne({ email: 'officer@vaayu.tn.gov.in' });
    if (!existingUser) {
      const user = new User({
        name: 'District Weather Officer (Erode)',
        email: 'officer@vaayu.tn.gov.in',
        password: 'password123',
        role: 'officer',
        district: 'Erode',
      });
      await user.save();
      console.log('[Seed] Created default officer account: officer@vaayu.tn.gov.in / password123');
    }

    process.exit(0);
  } catch (error) {
    console.error(`[Seed] Notice: Could not seed MongoDB (${error.message}). Running with local station memory.`);
    process.exit(0);
  }
};

if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase, ERODE_STATIONS };
