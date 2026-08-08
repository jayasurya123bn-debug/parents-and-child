<?php
/**
 * admin/artworks.php
 * GET /api/admin/artworks             — Admin: list artworks with moderation filter
 * PUT /api/admin/artworks?id={id}&action={approve|reject|flag|feature}
 */

require_once __DIR__ . '/../middleware/cors.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../config/db.php';

requireAuth('admin');
$method = $_SERVER['REQUEST_METHOD'];
$db     = getDB();

// ── GET ───────────────────────────────────────────────────────
if ($method === 'GET') {
    $page   = max(1, (int)($_GET['page']   ?? 1));
    $limit  = min(100, (int)($_GET['limit'] ?? 20));
    $offset = ($page - 1) * $limit;
    $status = $_GET['status'] ?? 'pending';

    $where  = ['a.moderation_status = ?'];
    $params = [$status];

    $countStmt = $db->prepare('SELECT COUNT(*) FROM artworks a WHERE ' . implode(' AND ', $where));
    $countStmt->execute($params);
    $total = (int) $countStmt->fetchColumn();

    $params[] = $limit;
    $params[] = $offset;
    $stmt = $db->prepare('
        SELECT a.*,
               c.display_name AS child_name, u.username AS parent_username, u.email AS parent_email
        FROM artworks a
        JOIN children c ON c.id = a.child_id
        JOIN users    u ON u.id = a.parent_id
        WHERE a.moderation_status = ?
        ORDER BY a.created_at ASC
        LIMIT ? OFFSET ?
    ');
    $stmt->execute($params);
    $artworks = $stmt->fetchAll();

    foreach ($artworks as &$art) {
        $art['tags'] = $art['tags'] ? json_decode($art['tags'], true) : [];
    }

    jsonOk([
        'artworks'   => $artworks,
        'pagination' => ['page' => $page, 'limit' => $limit, 'total' => $total, 'totalPages' => (int)ceil($total / $limit)],
    ]);
}

// ── PUT ───────────────────────────────────────────────────────
if ($method === 'PUT') {
    $artworkId = isset($_GET['id']) ? (int)$_GET['id'] : 0;
    $action    = $_GET['action'] ?? '';
    $authUser  = requireAuth('admin');
    $body      = getBody();

    if (!$artworkId) jsonError('Artwork ID required', 400);

    switch ($action) {
        case 'approve':
            $db->prepare('UPDATE artworks SET moderation_status = "approved", is_published = 1, moderated_by = ?, moderated_at = NOW() WHERE id = ?')
               ->execute([$authUser['id'], $artworkId]);
            jsonOk(['message' => 'Artwork approved and published']);

        case 'reject':
            $note = $body['note'] ?? '';
            $db->prepare('UPDATE artworks SET moderation_status = "rejected", is_published = 0, moderation_notes = ?, moderated_by = ?, moderated_at = NOW() WHERE id = ?')
               ->execute([$note, $authUser['id'], $artworkId]);
            jsonOk(['message' => 'Artwork rejected']);

        case 'flag':
            $db->prepare('UPDATE artworks SET moderation_status = "flagged", is_published = 0, moderated_by = ?, moderated_at = NOW() WHERE id = ?')
               ->execute([$authUser['id'], $artworkId]);
            jsonOk(['message' => 'Artwork flagged']);

        case 'feature':
            $featured = !empty($body['featured']) ? 1 : 0;
            $db->prepare('UPDATE artworks SET is_featured = ?, featured_at = ? WHERE id = ?')
               ->execute([$featured, $featured ? date('Y-m-d H:i:s') : null, $artworkId]);
            jsonOk(['message' => $featured ? 'Artwork featured' : 'Artwork unfeatured']);

        default:
            jsonError('Unknown action', 400);
    }
}

jsonError('Method not allowed', 405);
