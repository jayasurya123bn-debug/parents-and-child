<?php
/**
 * health.php
 * GET /api/health — Public health check
 */

require_once __DIR__ . '/middleware/cors.php';
require_once __DIR__ . '/config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') jsonError('Method not allowed', 405);

// Test DB connection
try {
    $db = getDB();
    $db->query('SELECT 1');
    $dbStatus = 'connected';
} catch (Exception $e) {
    $dbStatus = 'error';
}

jsonOk([
    'status'    => 'OK',
    'db'        => $dbStatus,
    'timestamp' => date('c'),
    'php'       => PHP_VERSION,
]);
