<?php
/**
 * artworks/index.php
 * GET  /api/artworks         — Public: list approved artworks (paginated)
 * POST /api/artworks         — Private: upload new artwork
 */

require_once __DIR__ . '/../middleware/cors.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../config/db.php';

$method = $_SERVER['REQUEST_METHOD'];
$db     = getDB();

// ── GET ───────────────────────────────────────────────────────
if ($method === 'GET') {
    $page     = max(1, (int)($_GET['page']     ?? 1));
    $limit    = min(50, max(1, (int)($_GET['limit'] ?? 12)));
    $offset   = ($page - 1) * $limit;
    $category = $_GET['category'] ?? '';
    $status   = $_GET['status']   ?? 'approved';
    $childId  = isset($_GET['childId']) ? (int)$_GET['childId'] : null;
    $featured = isset($_GET['featured']) && $_GET['featured'] === 'true';

    // Only admins can see non-approved artworks
    $user = optionalAuth();
    if ($status !== 'approved') {
        if (!$user || $user['role'] !== 'admin') {
            $status = 'approved';
        }
    }

    $where  = ['a.moderation_status = ?'];
    $params = [$status];

    if ($category) { $where[] = 'a.category = ?'; $params[] = $category; }
    if ($childId)  { $where[] = 'a.child_id = ?'; $params[] = $childId; }
    if ($featured) { $where[] = 'a.is_featured = 1'; }

    $whereStr = implode(' AND ', $where);

    // Total count
    $countStmt = $db->prepare("SELECT COUNT(*) FROM artworks a WHERE $whereStr");
    $countStmt->execute($params);
    $total = (int) $countStmt->fetchColumn();

    // Fetch rows with child and parent info
    $params[] = $limit;
    $params[] = $offset;
    $stmt = $db->prepare("
        SELECT a.*,
               c.display_name AS child_display_name, c.avatar_url AS child_avatar, c.age_group,
               u.username AS parent_username, u.first_name AS parent_first_name
        FROM artworks a
        JOIN children c ON c.id = a.child_id
        JOIN users    u ON u.id = a.parent_id
        WHERE $whereStr
        ORDER BY a.created_at DESC
        LIMIT ? OFFSET ?
    ");
    $stmt->execute($params);
    $artworks = $stmt->fetchAll();

    foreach ($artworks as &$art) {
        $art['tags'] = $art['tags'] ? json_decode($art['tags'], true) : [];
    }

    jsonOk([
        'artworks'   => $artworks,
        'pagination' => [
            'page'       => $page,
            'limit'      => $limit,
            'total'      => $total,
            'totalPages' => (int)ceil($total / $limit),
        ],
    ]);
}

// ── POST ──────────────────────────────────────────────────────
if ($method === 'POST') {
    $authUser = requireAuth();
    $body     = getBody();

    $childId     = isset($body['childId'])     ? (int)$body['childId'] : 0;
    $title       = trim($body['title']       ?? '');
    $description = trim($body['description'] ?? '');
    $category    = $body['category'] ?? '';
    $medium      = trim($body['medium'] ?? '');
    $tags        = $body['tags']       ?? [];
    $childStory  = trim($body['childStory']  ?? '');
    $imageUrl    = $body['imageUrl']   ?? '';  // pre-uploaded to Cloudinary by frontend
    $imagePid    = $body['imagePublicId'] ?? '';

    if (!$childId || !$title || !$category || !$imageUrl) {
        jsonError('childId, title, category, and imageUrl are required', 400);
    }

    $validCategories = ['painting','drawing','craft','sculpture','digital','mixed_media','photography','other'];
    if (!in_array($category, $validCategories)) jsonError('Invalid artwork category', 400);

    // Verify child belongs to this parent
    $stmt = $db->prepare('SELECT id FROM children WHERE id = ? AND parent_id = ? AND is_active = 1 LIMIT 1');
    $stmt->execute([$childId, $authUser['id']]);
    if (!$stmt->fetch()) jsonError('Child not found or not owned by you', 403);

    // Normalise tags
    $tags = array_unique(array_filter(array_map(fn($t) => strtolower(trim($t)), $tags)));

    $stmt = $db->prepare('
        INSERT INTO artworks
          (child_id, parent_id, title, description, category, medium, tags,
           image_original_url, image_original_pid, moderation_status, child_story)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ');
    $stmt->execute([
        $childId, $authUser['id'], $title, $description, $category,
        $medium, json_encode(array_values($tags)), $imageUrl, $imagePid,
        'pending', $childStory,
    ]);
    $artworkId = (int) $db->lastInsertId();

    // Increment child's upload count
    $db->prepare('UPDATE children SET total_uploads = total_uploads + 1 WHERE id = ?')
       ->execute([$childId]);

    $stmt = $db->prepare('SELECT * FROM artworks WHERE id = ? LIMIT 1');
    $stmt->execute([$artworkId]);
    $artwork = $stmt->fetch();
    $artwork['tags'] = json_decode($artwork['tags'], true) ?? [];

    jsonOk(['artwork' => $artwork], 201);
}

jsonError('Method not allowed', 405);
