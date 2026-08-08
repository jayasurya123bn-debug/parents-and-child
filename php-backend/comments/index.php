<?php
/**
 * comments/index.php
 * GET  /api/comments?artworkId={id}     — Public: list approved comments
 * POST /api/comments?artworkId={id}     — Private: post a comment
 */

require_once __DIR__ . '/../middleware/cors.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../config/db.php';

$method    = $_SERVER['REQUEST_METHOD'];
$artworkId = isset($_GET['artworkId']) ? (int)$_GET['artworkId'] : 0;
$db        = getDB();

if (!$artworkId) jsonError('artworkId is required', 400);

// ── GET ───────────────────────────────────────────────────────
if ($method === 'GET') {
    $page   = max(1, (int)($_GET['page']  ?? 1));
    $limit  = min(50, (int)($_GET['limit'] ?? 20));
    $offset = ($page - 1) * $limit;

    $countStmt = $db->prepare('SELECT COUNT(*) FROM comments WHERE artwork_id = ? AND moderation_status = "approved" AND is_deleted = 0');
    $countStmt->execute([$artworkId]);
    $total = (int) $countStmt->fetchColumn();

    $stmt = $db->prepare('
        SELECT c.*,
               u.username AS author_username, u.first_name AS author_first_name, u.avatar_url AS author_avatar
        FROM comments c
        JOIN users u ON u.id = c.author_id
        WHERE c.artwork_id = ? AND c.moderation_status = "approved" AND c.is_deleted = 0
        ORDER BY c.created_at ASC
        LIMIT ? OFFSET ?
    ');
    $stmt->execute([$artworkId, $limit, $offset]);
    $comments = $stmt->fetchAll();

    jsonOk([
        'comments'   => $comments,
        'pagination' => ['page' => $page, 'limit' => $limit, 'total' => $total, 'totalPages' => (int)ceil($total / $limit)],
    ]);
}

// ── POST ──────────────────────────────────────────────────────
if ($method === 'POST') {
    $authUser = requireAuth();
    $body     = getBody();

    $text            = trim($body['text'] ?? '');
    $parentCommentId = isset($body['parentCommentId']) ? (int)$body['parentCommentId'] : null;

    if (!$text)              jsonError('Comment text is required', 400);
    if (strlen($text) > 500) jsonError('Comment cannot exceed 500 characters', 400);

    // Verify artwork exists
    $stmt = $db->prepare('SELECT id FROM artworks WHERE id = ? AND is_published = 1 LIMIT 1');
    $stmt->execute([$artworkId]);
    if (!$stmt->fetch()) jsonError('Artwork not found or not published', 404);

    $stmt = $db->prepare('
        INSERT INTO comments (artwork_id, author_id, parent_comment_id, text, moderation_status)
        VALUES (?, ?, ?, ?, "approved")
    ');
    $stmt->execute([$artworkId, $authUser['id'], $parentCommentId, $text]);
    $commentId = (int) $db->lastInsertId();

    // Increment reply count on parent comment
    if ($parentCommentId) {
        $db->prepare('UPDATE comments SET reply_count = reply_count + 1 WHERE id = ?')
           ->execute([$parentCommentId]);
    }

    // Update user's comment stats
    $db->prepare('UPDATE users SET total_comments_given = total_comments_given + 1 WHERE id = ?')
       ->execute([$authUser['id']]);

    $stmt = $db->prepare('
        SELECT c.*, u.username AS author_username, u.first_name AS author_first_name, u.avatar_url AS author_avatar
        FROM comments c JOIN users u ON u.id = c.author_id WHERE c.id = ? LIMIT 1
    ');
    $stmt->execute([$commentId]);
    $comment = $stmt->fetch();

    jsonOk(['comment' => $comment], 201);
}

jsonError('Method not allowed', 405);
