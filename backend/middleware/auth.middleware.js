/**
 * middleware/auth.middleware.js
 *
 * JWT authentication and role-based authorisation middleware.
 *
 *  protect      — verifies JWT, attaches req.user
 *  authorise    — restricts route to specific roles
 *  optionalAuth — non-blocking auth (attaches user if token present)
 */

const jwt  = require('jsonwebtoken');
const User = require('../models/User.model');

// ── protect ──────────────────────────────────────────────────
const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorised — no token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user    = await User.findById(decoded.id).select('-password -refreshTokens');

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found — token invalid' });
    }

    if (user.accountStatus === 'suspended') {
      return res.status(403).json({
        success : false,
        message : 'Account suspended',
        reason  : user.suspensionReason,
        until   : user.suspensionEndDate,
      });
    }

    if (user.accountStatus === 'deactivated') {
      return res.status(403).json({ success: false, message: 'Account deactivated' });
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

// ── authorise ────────────────────────────────────────────────
const authorise = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) {
    return res.status(403).json({
      success : false,
      message : `Access denied — requires role: ${roles.join(' or ')}`,
    });
  }
  next();
};

// ── optionalAuth ─────────────────────────────────────────────
const optionalAuth = async (req, _res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password -refreshTokens');
    }
  } catch (_err) {
    // Token invalid — proceed as unauthenticated
  }
  next();
};

module.exports = { protect, authorise, optionalAuth };
