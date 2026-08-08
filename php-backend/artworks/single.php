<?php
/**
 * artworks/single.php
 * GET    /api/artworks/single?id={artworkId} — Public (approved) / Private (admin/owner)
 * DELETE /api/artworks/single?id={artworkId} — Private (owner or admin)
 * POST   /api/artworks/single?id={artworkId}&action=like   — Private: toggle like
 * POST   /api/artworks/single?id={artworkId}&action=view   — Public: increment view
 */

require_once __DIR__ . '/../middleware/cors.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../config/db.php';

$method    = $_SERVER['REQUEST_METHOD'];
$artworkId = isset($_GET['id']) ? (int)$_GET['id'] : 0;
$action    = $_GET['action'] ?? '';
$db        = getDB();

if (!$artworkId) jsonError('Artwork ID is required', 400);

$stmt = $db->prepare('
    SELECT a.*,
           c.display_name AS child_display_name, c.avatar_url AS child_avatar, c.age_group,
           u.username AS parent_username, u.first_name AS parent_first_name, u.avatar_url AS parent_avatar
    FROM artworks a
    JOIN children c ON c.id = a.child_id
    JOIN users    u ON u.id = a.parent_id
    WHERE a.id = ? LIMIT 1
');
$stmt->execute([$artworkId]);
$artwork = $stmt->fetch();
if (!$artwork) jsonError('Artwork not found', 404);

// ── GET ───────────────────────────────────────────────────────
if ($method === 'GET') {
    // Only published artworks are public; others need owner/admin
    if (!$artwork['is_published']) {
        $user = optionalAuth();
        if (!$user || ((int)$user['id'] !== (int)$artwork['parent_id'] && $user['role'] !== 'admin')) {
            jsonError('Artwork not found', 404);
        }
    }

    $artwork['tags'] = $artwork['tags'] ? json_decode($artwork['tags'], true) : [];

    // Fetch liked_by user ids
    $stmt = $db->prepare('SELECT user_id FROM artwork_likes WHERE artwork_id = ?');
    $stmt->execute([$artworkId]);
    $artwork['liked_by'] = array_column($stmt->fetchAll(), 'user_id');

    jsonOk(['artwork' => $artwork]);
}

// ── POST action=view ─────────────────────────────────────────
if ($method === 'POST' && $action === 'view') {
    $db->prepare('UPDATE artworks SET view_count = view_count + 1 WHERE id = ?')
       ->execute([$artworkId]);
    jsonOk(['message' => 'View recorded']);
}

// ── POST action=like ─────────────────────────────────────────
if ($method === 'POST' && $action === 'like') {
    $authUser = requireAuth();

    $stmt = $db->prepare('SELECT 1 FROM artwork_likes WHERE artwork_id = ? AND user_id = ? LIMIT 1');
    $stmt->execute([$artworkId, $authUser['id']]);
    $alreadyLiked = $stmt->fetch();

    if ($alreadyLiked) {
        // Unlike
        $db->prepare('DELETE FROM artwork_likes WHERE artwork_id = ? AND user_id = ?')
           ->execute([$artworkId, $authUser['id']]);
        $db->prepare('UPDATE artworks SET like_count = GREATEST(0, like_count - 1) WHERE id = ?')
           ->execute([$artworkId]);
        jsonOk(['liked' => false, 'message' => 'Unliked']);
    } else {
        // Like
        $db->prepare('INSERT IGNORE INTO artwork_likes (artwork_id, user_id) VALUES (?, ?)')
           ->execute([$artworkId, $authUser['id']]);
        $db->prepare('UPDATE artworks SET like_count = like_count + 1 WHERE id = ?')
           ->execute([$artworkId]);
        // Increment child's total_likes
        $db->prepare('UPDATE children SET total_likes = total_likes + 1 WHERE id = ?')
           ->execute([$artwork['child_id']]);
        jsonOk(['liked' => true, 'message' => 'Liked']);
    }
}

// ── DELETE ────────────────────────────────────────────────────
if ($method === 'DELETE') {
    $authUser = requireAuth();
    if ((int)$authUser['id'] !== (int)$artwork['parent_id'] && $authUser['role'] !== 'admin') {
        jsonError('Not authorised to delete this artwork', 403);
    }
    $db->prepare('DELETE FROM artworks WHERE id = ?')->execute([$artworkId]);
    jsonOk(['message' => 'Artwork deleted']);
}

jsonError('Method not allowed', 405);
