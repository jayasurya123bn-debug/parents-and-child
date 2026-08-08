<?php
/**
 * auth/register.php
 * POST /api/auth/register
 * Create a new parent account.
 */

require_once __DIR__ . '/../middleware/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/jwt.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonError('Method not allowed', 405);
}

$body = getBody();
$firstName = trim($body['firstName'] ?? '');
$lastName  = trim($body['lastName']  ?? '');
$email     = strtolower(trim($body['email']    ?? ''));
$username  = strtolower(trim($body['username'] ?? ''));
$password  = $body['password'] ?? '';

// ── Validation ───────────────────────────────────────────────
if (!$firstName || !$lastName || !$email || !$username || !$password) {
    jsonError('All fields are required', 400);
}
if (strlen($firstName) > 50 || strlen($lastName) > 50) {
    jsonError('Name fields cannot exceed 50 characters', 400);
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    jsonError('Please provide a valid email address', 400);
}
if (!preg_match('/^[a-z0-9_]{3,30}$/', $username)) {
    jsonError('Username may only contain lowercase letters, numbers and underscores (3–30 chars)', 400);
}
if (strlen($password) < 8) {
    jsonError('Password must be at least 8 characters', 400);
}

$db = getDB();

// ── Duplicate checks ─────────────────────────────────────────
$stmt = $db->prepare('SELECT id FROM users WHERE email = ? LIMIT 1');
$stmt->execute([$email]);
if ($stmt->fetch()) jsonError('An account with this email already exists', 409);

$stmt = $db->prepare('SELECT id FROM users WHERE username = ? LIMIT 1');
$stmt->execute([$username]);
if ($stmt->fetch()) jsonError('This username is already taken', 409);

// ── Create user ──────────────────────────────────────────────
$hash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);

$stmt = $db->prepare('
    INSERT INTO users (first_name, last_name, username, email, password, role, account_status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
');
$stmt->execute([$firstName, $lastName, $username, $email, $hash, 'parent', 'active']);
$userId = (int) $db->lastInsertId();

$stmt = $db->prepare('SELECT * FROM users WHERE id = ? LIMIT 1');
$stmt->execute([$userId]);
$user  = $stmt->fetch();

$token = jwtEncode(['id' => $userId]);

jsonOk(['token' => $token, 'user' => sanitizeUserForResponse($user)], 201);

// ── Helper ───────────────────────────────────────────────────
function sanitizeUserForResponse(array $u): array {
    unset($u['password'], $u['login_attempts'], $u['lock_until']);
    return $u;
}
