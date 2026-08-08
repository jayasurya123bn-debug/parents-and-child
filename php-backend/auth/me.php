<?php
/**
 * auth/me.php
 * GET /api/auth/me — Private
 * Return the currently authenticated user with their children.
 */

require_once __DIR__ . '/../middleware/cors.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') jsonError('Method not allowed', 405);

$authUser = requireAuth();
$db       = getDB();

// Fetch fresh user
$stmt = $db->prepare('SELECT * FROM users WHERE id = ? LIMIT 1');
$stmt->execute([$authUser['id']]);
$user = $stmt->fetch();
unset($user['password'], $user['login_attempts'], $user['lock_until']);

// Attach children
$stmt = $db->prepare('SELECT id, display_name, avatar_url, age_group FROM children WHERE parent_id = ? AND is_active = 1');
$stmt->execute([$user['id']]);
$user['children'] = $stmt->fetchAll();

jsonOk(['user' => $user]);
