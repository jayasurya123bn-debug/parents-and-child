<?php
/**
 * auth/logout.php
 * POST /api/auth/logout — Private
 */

require_once __DIR__ . '/../middleware/cors.php';
require_once __DIR__ . '/../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') jsonError('Method not allowed', 405);

requireAuth(); // just verify token is valid
jsonOk(['message' => 'Logged out successfully']);
