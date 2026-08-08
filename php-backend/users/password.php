<?php
/**
 * users/password.php
 * PUT /api/users/password — Private
 * Change the authenticated user's password.
 */

require_once __DIR__ . '/../middleware/cors.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') jsonError('Method not allowed', 405);

$authUser = requireAuth();
$body     = getBody();

$current = $body['currentPassword'] ?? '';
$new     = $body['newPassword']     ?? '';

if (!$current || !$new) jsonError('Current and new password are required', 400);
if (strlen($new) < 8)  jsonError('New password must be at least 8 characters', 400);

$db   = getDB();
$stmt = $db->prepare('SELECT password FROM users WHERE id = ? LIMIT 1');
$stmt->execute([$authUser['id']]);
$row  = $stmt->fetch();

if (!password_verify($current, $row['password'])) {
    jsonError('Current password is incorrect', 401);
}

$hash = password_hash($new, PASSWORD_BCRYPT, ['cost' => 12]);
$db->prepare('UPDATE users SET password = ? WHERE id = ?')
   ->execute([$hash, $authUser['id']]);

jsonOk(['message' => 'Password updated successfully']);
