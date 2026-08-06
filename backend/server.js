/**
 * server.js — Application Entry Point
 *
 * Bootstraps the Express server, connects to MongoDB,
 * registers global middleware, and mounts API routers.
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// ── Route Imports ────────────────────────────────────────────
const authRoutes        = require('./routes/auth.routes');
const userRoutes        = require('./routes/user.routes');
const childRoutes       = require('./routes/child.routes');
const artworkRoutes     = require('./routes/artwork.routes');
const commentRoutes     = require('./routes/comment.routes');
const forumRoutes       = require('./routes/forum.routes');
const moderationRoutes  = require('./routes/moderation.routes');
const adminRoutes       = require('./routes/admin.routes');

// ── Error Handler ────────────────────────────────────────────
const { notFound, errorHandler } = require('./middleware/error.middleware');

const app = express();

// ── Security Middleware ──────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));

// ── Rate Limiting ────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 min
  max:      parseInt(process.env.RATE_LIMIT_MAX)        || 100,
  message:  { message: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);

// ── General Middleware ───────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// ── API Routes ───────────────────────────────────────────────
app.use('/api/auth',       authRoutes);
app.use('/api/users',      userRoutes);
app.use('/api/children',   childRoutes);
app.use('/api/artworks',   artworkRoutes);
app.use('/api/comments',   commentRoutes);
app.use('/api/forum',      forumRoutes);
app.use('/api/moderation', moderationRoutes);
app.use('/api/admin',      adminRoutes);

// ── Health Check ─────────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ status: 'OK', timestamp: new Date() }));

// ── Error Middleware (must be last) ──────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Database Connection & Server Start ───────────────────────
let isConnected = false;
const connectDB = async () => {
  if (isConnected || mongoose.connection.readyState >= 1) {
    isConnected = true;
    return;
  }
  if (!process.env.MONGO_URI) {
    console.warn('⚠️ MONGO_URI is not defined in environment variables.');
    return;
  }
  try {
    await mongoose.connect(process.env.MONGO_URI);
    isConnected = true;
    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
  }
};

// Ensure database connection middleware for serverless requests
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  connectDB().then(() => {
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`));
  });
}

module.exports = app;
