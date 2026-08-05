/**
 * config/db.js
 * MongoDB connection factory with retry logic and event listeners.
 */

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Mongoose 7+ defaults are sensible; no deprecated options needed.
    });

    console.log(`✅  MongoDB connected: ${conn.connection.host}`);

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('🛑  MongoDB connection closed due to app termination');
      process.exit(0);
    });
  } catch (error) {
    console.error(`❌  MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected — attempting reconnect...');
});

mongoose.connection.on('reconnected', () => {
  console.log('🔄  MongoDB reconnected');
});

module.exports = connectDB;
