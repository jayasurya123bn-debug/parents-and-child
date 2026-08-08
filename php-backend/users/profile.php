<?php
/**
 * users/profile.php
 * GET  /api/users/profile?id={userId}  — Public: get user by ID
 * GET  /api/users/profile              — Private: get own profile
 * PUT  /api/users/profile              — Private: update own profile
 */

require_once __DIR__ . '/../middleware/cors.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../config/db.php';

$method = $_SERVER['REQUEST_METHOD'];
$db     = getDB();

// ── GET ───────────────────────────────────────────────────────
if ($method === 'GET') {
    $id = isset($_GET['id']) ? (int)$_GET['id'] : null;

    if ($id) {
        // Public profile by ID
        $stmt = $db->prepare('
            SELECT id, first_name, last_name, username, email, role, account_status,
                   avatar_url, bio, location, website, total_likes_given,
                   total_comments_given, forum_post_count, created_at
            FROM users WHERE id = ? AND account_status != "deactivated" LIMIT 1
        ');
        $stmt->execute([$id]);
        $user = $stmt->fetch();
        if (!$user) jsonError('User not found', 404);

        // Attach children (public info only)
        $stmt = $db->prepare('SELECT id, display_name, avatar_url, age_group FROM children WHERE parent_id = ? AND is_active = 1 AND privacy_level != "private"');
        $stmt->execute([$id]);
        $user['children'] = $stmt->fetchAll();

        jsonOk(['user' => $user]);
    }

    // Own profile
    $authUser = requireAuth();
    $stmt = $db->prepare('SELECT * FROM users WHERE id = ? LIMIT 1');
    $stmt->execute([$authUser['id']]);
    $user = $stmt->fetch();
    unset($user['password'], $user['login_attempts'], $user['lock_until']);

    $stmt = $db->prepare('SELECT id, display_name, avatar_url, age_group FROM children WHERE parent_id = ? AND is_active = 1');
    $stmt->execute([$user['id']]);
    $user['children'] = $stmt->fetchAll();

    jsonOk(['user' => $user]);
}

// ── PUT ───────────────────────────────────────────────────────
if ($method === 'PUT') {
    $authUser = requireAuth();
    $body     = getBody();

    $allowed  = ['bio', 'location', 'website', 'theme', 'first_name', 'last_name',
                 'notif_email_comment', 'notif_email_like', 'notif_email_forum'];
    $updates  = [];
    $params   = [];

    // Map camelCase → snake_case
    $map = [
        'bio'       => 'bio',   'location'  => 'location', 'website' => 'website',
        'theme'     => 'theme', 'firstName' => 'first_name', 'lastName' => 'last_name',
    ];
    foreach ($map as $jsKey => $dbCol) {
        if (isset($body[$jsKey])) {
            $updates[] = "`$dbCol` = ?";
            $params[]  = $body[$jsKey];
        }
    }

    if (empty($updates)) jsonError('No valid fields provided to update', 400);

    $params[] = $authUser['id'];
    $db->prepare('UPDATE users SET ' . implode(', ', $updates) . ' WHERE id = ?')
       ->execute($params);

    $stmt = $db->prepare('SELECT * FROM users WHERE id = ? LIMIT 1');
    $stmt->execute([$authUser['id']]);
    $user = $stmt->fetch();
    unset($user['password'], $user['login_attempts'], $user['lock_until']);
    jsonOk(['user' => $user]);
}

jsonError('Method not allowed', 405);
