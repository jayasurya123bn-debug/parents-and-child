/**
 * utils/generateToken.js
 * Generates a signed JWT access token for a user.
 */

const jwt = require('jsonwebtoken');

/**
 * @param {string} id  — MongoDB ObjectId of the user
 * @returns {string}   — Signed JWT
 */
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

module.exports = generateToken;
