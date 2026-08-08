<?php
/**
 * auth/login.php
 * POST /api/auth/login
 * Authenticate with email + password, return JWT.
 */

require_once __DIR__ . '/../middleware/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/jwt.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') jsonError('Method not allowed', 405);

$body     = getBody();
$email    = strtolower(trim($body['email']    ?? ''));
$password = $body['password'] ?? '';

if (!$email || !$password) {
    jsonError('Email and password are required', 400);
}

$db   = getDB();
$stmt = $db->prepare('SELECT * FROM users WHERE email = ? LIMIT 1');
$stmt->execute([$email]);
$user = $stmt->fetch();

if (!$user) jsonError('Invalid email or password', 401);

// ── Account lock check ───────────────────────────────────────
$lockUntil = $user['lock_until'] ? strtotime($user['lock_until']) : null;
if ($lockUntil && $lockUntil > time()) {
    jsonError('Account temporarily locked due to too many failed attempts. Please try again in 30 minutes.', 423);
}

// ── Account status ───────────────────────────────────────────
if ($user['account_status'] === 'suspended') {
    jsonError('Your account has been suspended. Reason: ' . ($user['suspension_reason'] ?? ''), 403);
}
if ($user['account_status'] === 'deactivated') {
    jsonError('This account has been deactivated.', 403);
}

// ── Password verification ─────────────────────────────────────
if (!password_verify($password, $user['password'])) {
    // Increment login attempts
    $attempts = (int)$user['login_attempts'] + 1;
    if ($attempts >= 5) {
        $lockUntilTs = date('Y-m-d H:i:s', time() + 30 * 60);
        $db->prepare('UPDATE users SET login_attempts = ?, lock_until = ? WHERE id = ?')
           ->execute([$attempts, $lockUntilTs, $user['id']]);
    } else {
        $db->prepare('UPDATE users SET login_attempts = ? WHERE id = ?')
           ->execute([$attempts, $user['id']]);
    }
    jsonError('Invalid email or password', 401);
}

// ── Success: reset attempts + update last_login ───────────────
$db->prepare('UPDATE users SET login_attempts = 0, lock_until = NULL, last_login = NOW() WHERE id = ?')
   ->execute([$user['id']]);

$token = jwtEncode(['id' => $user['id']]);

// Re-fetch clean user row
$stmt = $db->prepare('SELECT * FROM users WHERE id = ? LIMIT 1');
$stmt->execute([$user['id']]);
$user = $stmt->fetch();

unset($user['password'], $user['login_attempts'], $user['lock_until']);
jsonOk(['token' => $token, 'user' => $user]);
