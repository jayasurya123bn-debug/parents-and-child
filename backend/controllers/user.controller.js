/**
 * controllers/user.controller.js
 *
 * Handles user profile management:
 *  - getUserProfile : Get a public profile by ID
 *  - updateProfile  : Update the current user's own profile
 */

const User = require('../models/User.model');

// ──────────────────────────────────────────────────────────────
// @desc    Get a user's public profile by ID
// @route   GET /api/users/:id
// @access  Public
// ──────────────────────────────────────────────────────────────
const getUserProfile = async (req, res) => {
  const user = await User.findById(req.params.id)
    .populate('children', 'displayName avatar ageGroup')
    .select('-refreshTokens -emailVerificationToken -passwordResetToken -passwordResetExpires -loginAttempts -lockUntil');

  if (!user || user.accountStatus === 'deactivated') {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  res.status(200).json({ success: true, user });
};

// ──────────────────────────────────────────────────────────────
// @desc    Update current user's profile (bio, location, website, theme)
// @route   PUT /api/users/profile
// @access  Private
// ──────────────────────────────────────────────────────────────
const updateProfile = async (req, res) => {
  const allowedFields = ['bio', 'location', 'website', 'theme', 'notificationPrefs', 'firstName', 'lastName'];
  const updates = {};

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ success: false, message: 'No valid fields provided to update' });
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: updates },
    { new: true, runValidators: true }
  );

  res.status(200).json({ success: true, user });
};

// ──────────────────────────────────────────────────────────────
// @desc    Change current user's password
// @route   PUT /api/users/password
// @access  Private
// ──────────────────────────────────────────────────────────────
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'Current and new password are required' });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ success: false, message: 'New password must be at least 8 characters' });
  }

  const user = await User.findById(req.user._id).select('+password');
  const isMatch = await user.matchPassword(currentPassword);

  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Current password is incorrect' });
  }

  user.password = newPassword;
  await user.save(); // Pre-save hook will hash the new password

  res.status(200).json({ success: true, message: 'Password updated successfully' });
};

module.exports = { getUserProfile, updateProfile, changePassword };
