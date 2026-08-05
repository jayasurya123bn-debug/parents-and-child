/**
 * routes/user.routes.js
 * User profile management routes — Phase 2 implementation.
 */
const express = require('express');
const router  = express.Router();
const { getUserProfile, updateProfile, changePassword } = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');

// Public
router.get('/:id', getUserProfile);

// Protected
router.put('/profile',  protect, updateProfile);
router.put('/password', protect, changePassword);

module.exports = router;
