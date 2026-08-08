<?php
/**
 * children/single.php
 * GET    /api/children/single?id={childId}  — Private
 * PUT    /api/children/single?id={childId}  — Private (owner)
 * DELETE /api/children/single?id={childId}  — Private (owner)
 */

require_once __DIR__ . '/../middleware/cors.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../config/db.php';

$authUser = requireAuth();
$method   = $_SERVER['REQUEST_METHOD'];
$db       = getDB();
$childId  = isset($_GET['id']) ? (int)$_GET['id'] : 0;

if (!$childId) jsonError('Child ID is required', 400);

// Fetch child and verify ownership
$stmt = $db->prepare('SELECT * FROM children WHERE id = ? AND is_active = 1 LIMIT 1');
$stmt->execute([$childId]);
$child = $stmt->fetch();
if (!$child) jsonError('Child not found', 404);
if ((int)$child['parent_id'] !== (int)$authUser['id'] && $authUser['role'] !== 'admin') {
    jsonError('Not authorised to access this child profile', 403);
}

// ── GET ───────────────────────────────────────────────────────
if ($method === 'GET') {
    $child['art_interests']   = $child['art_interests']   ? json_decode($child['art_interests'],   true) : [];
    $child['favorite_colors'] = $child['favorite_colors'] ? json_decode($child['favorite_colors'], true) : [];
    jsonOk(['child' => $child]);
}

// ── PUT ───────────────────────────────────────────────────────
if ($method === 'PUT') {
    $body    = getBody();
    $updates = [];
    $params  = [];

    $map = [
        'displayName'    => 'display_name',
        'bio'            => 'bio',
        'privacyLevel'   => 'privacy_level',
        'artInterests'   => 'art_interests',
        'favoriteColors' => 'favorite_colors',
    ];
    foreach ($map as $jsKey => $dbCol) {
        if (isset($body[$jsKey])) {
            $val = $body[$jsKey];
            if (is_array($val)) $val = json_encode($val);
            $updates[] = "`$dbCol` = ?";
            $params[]  = $val;
        }
    }

    if (empty($updates)) jsonError('No valid fields to update', 400);
    $params[] = $childId;

    $db->prepare('UPDATE children SET ' . implode(', ', $updates) . ' WHERE id = ?')
       ->execute($params);

    $stmt = $db->prepare('SELECT * FROM children WHERE id = ? LIMIT 1');
    $stmt->execute([$childId]);
    $child = $stmt->fetch();
    $child['art_interests']   = json_decode($child['art_interests'],   true) ?? [];
    $child['favorite_colors'] = json_decode($child['favorite_colors'], true) ?? [];
    jsonOk(['child' => $child]);
}

// ── DELETE ────────────────────────────────────────────────────
if ($method === 'DELETE') {
    $db->prepare('UPDATE children SET is_active = 0, deactivated_at = NOW() WHERE id = ?')
       ->execute([$childId]);
    jsonOk(['message' => 'Child profile deactivated']);
}

jsonError('Method not allowed', 405);
