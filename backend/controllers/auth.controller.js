/**
 * controllers/auth.controller.js
 *
 * Handles all authentication logic:
 *  - register : Create a new parent account
 *  - login    : Authenticate and return JWT
 *  - logout   : Invalidate refresh token
 *  - getMe    : Return current user profile
 */

const User          = require('../models/User.model');
const generateToken = require('../utils/generateToken');

// ── Helper: Send token response ──────────────────────────────
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);
  res.status(statusCode).json({
    success : true,
    token,
    user,
  });
};

// ──────────────────────────────────────────────────────────────
// @desc    Register a new parent account
// @route   POST /api/auth/register
// @access  Public
// ──────────────────────────────────────────────────────────────
const register = async (req, res) => {
  const { firstName, lastName, email, username, password } = req.body;

  // Basic validation
  if (!firstName || !lastName || !email || !username || !password) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  // Check for duplicate email
  const emailExists = await User.findOne({ email: email.toLowerCase() });
  if (emailExists) {
    return res.status(409).json({ success: false, message: 'An account with this email already exists' });
  }

  // Check for duplicate username
  const usernameExists = await User.findOne({ username: username.toLowerCase() });
  if (usernameExists) {
    return res.status(409).json({ success: false, message: 'This username is already taken' });
  }

  // Create the user — password hashing happens in the pre-save hook
  const user = await User.create({
    firstName,
    lastName,
    email,
    username,
    password,
    role: 'parent',
  });

  sendTokenResponse(user, 201, res);
};

// ──────────────────────────────────────────────────────────────
// @desc    Login with email & password
// @route   POST /api/auth/login
// @access  Public
// ──────────────────────────────────────────────────────────────
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  // Fetch user with password (select: false by default)
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password +loginAttempts +lockUntil');

  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  // Check if account is locked
  if (user.isLocked) {
    return res.status(423).json({
      success  : false,
      message  : 'Account temporarily locked due to too many failed attempts. Please try again in 30 minutes.',
    });
  }

  // Check account status
  if (user.accountStatus === 'suspended') {
    return res.status(403).json({
      success : false,
      message : 'Your account has been suspended.',
      reason  : user.suspensionReason,
    });
  }

  if (user.accountStatus === 'deactivated') {
    return res.status(403).json({ success: false, message: 'This account has been deactivated.' });
  }

  // Verify password
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    await user.incLoginAttempts();
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  // Reset login attempts on success & update lastLogin
  await User.findByIdAndUpdate(user._id, {
    $set   : { loginAttempts: 0, lastLogin: new Date() },
    $unset : { lockUntil: 1 },
  });

  // Re-fetch without password fields for the response
  const freshUser = await User.findById(user._id);
  sendTokenResponse(freshUser, 200, res);
};

// ──────────────────────────────────────────────────────────────
// @desc    Logout (client should discard token; here we just acknowledge)
// @route   POST /api/auth/logout
// @access  Private
// ──────────────────────────────────────────────────────────────
const logout = async (req, res) => {
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

// ──────────────────────────────────────────────────────────────
// @desc    Get currently logged-in user profile
// @route   GET /api/auth/me
// @access  Private
// ──────────────────────────────────────────────────────────────
const getMe = async (req, res) => {
  const user = await User.findById(req.user._id).populate('children', 'displayName avatar ageGroup');
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  res.status(200).json({ success: true, user });
};

module.exports = { register, login, logout, getMe };
