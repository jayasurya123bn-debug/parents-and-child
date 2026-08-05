/**
 * routes/auth.routes.js — stub (Phase 2 will implement all handlers)
 */
const express = require('express');
const router  = express.Router();

router.post('/register', (req, res) => res.status(501).json({ message: 'Phase 2: Register — coming soon' }));
router.post('/login',    (req, res) => res.status(501).json({ message: 'Phase 2: Login — coming soon' }));
router.post('/logout',   (req, res) => res.status(501).json({ message: 'Phase 2: Logout — coming soon' }));
router.get ('/me',       (req, res) => res.status(501).json({ message: 'Phase 2: Get me — coming soon' }));

module.exports = router;
