<?php
/**
 * forum/single.php
 * GET  /api/forum/single?id={postId}             — Public: get post with comments
 * POST /api/forum/single?id={postId}&action=upvote — Private: toggle upvote
 * POST /api/forum/single?id={postId}&action=comment — Private: add comment
 */

require_once __DIR__ . '/../middleware/cors.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../config/db.php';

$method = $_SERVER['REQUEST_METHOD'];
$postId = isset($_GET['id']) ? (int)$_GET['id'] : 0;
$action = $_GET['action'] ?? '';
$db     = getDB();

if (!$postId) jsonError('Post ID is required', 400);

$stmt = $db->prepare('
    SELECT fp.*, u.username AS author_username, u.first_name AS author_first_name, u.avatar_url AS author_avatar
    FROM forum_posts fp JOIN users u ON u.id = fp.author_id
    WHERE fp.id = ? AND fp.is_deleted = 0 LIMIT 1
');
$stmt->execute([$postId]);
$post = $stmt->fetch();
if (!$post) jsonError('Post not found', 404);

// ── GET ───────────────────────────────────────────────────────
if ($method === 'GET') {
    // Increment view
    $db->prepare('UPDATE forum_posts SET view_count = view_count + 1 WHERE id = ?')->execute([$postId]);

    $post['tags'] = $post['tags'] ? json_decode($post['tags'], true) : [];

    // Fetch comments
    $stmt = $db->prepare('
        SELECT fc.*, u.username AS author_username, u.first_name AS author_first_name, u.avatar_url AS author_avatar
        FROM forum_comments fc JOIN users u ON u.id = fc.author_id
        WHERE fc.post_id = ? AND fc.is_deleted = 0 AND fc.moderation_status = "approved"
        ORDER BY fc.created_at ASC
    ');
    $stmt->execute([$postId]);
    $post['comments'] = $stmt->fetchAll();

    // Upvoted by list
    $stmt = $db->prepare('SELECT user_id FROM forum_post_upvotes WHERE post_id = ?');
    $stmt->execute([$postId]);
    $post['upvoted_by'] = array_column($stmt->fetchAll(), 'user_id');

    jsonOk(['post' => $post]);
}

// ── POST action=upvote ────────────────────────────────────────
if ($method === 'POST' && $action === 'upvote') {
    $authUser = requireAuth();

    $stmt = $db->prepare('SELECT 1 FROM forum_post_upvotes WHERE post_id = ? AND user_id = ? LIMIT 1');
    $stmt->execute([$postId, $authUser['id']]);

    if ($stmt->fetch()) {
        $db->prepare('DELETE FROM forum_post_upvotes WHERE post_id = ? AND user_id = ?')
           ->execute([$postId, $authUser['id']]);
        $db->prepare('UPDATE forum_posts SET upvote_count = GREATEST(0, upvote_count - 1) WHERE id = ?')
           ->execute([$postId]);
        jsonOk(['upvoted' => false]);
    } else {
        $db->prepare('INSERT IGNORE INTO forum_post_upvotes (post_id, user_id) VALUES (?, ?)')
           ->execute([$postId, $authUser['id']]);
        $db->prepare('UPDATE forum_posts SET upvote_count = upvote_count + 1 WHERE id = ?')
           ->execute([$postId]);
        jsonOk(['upvoted' => true]);
    }
}

// ── POST action=comment ───────────────────────────────────────
if ($method === 'POST' && $action === 'comment') {
    $authUser = requireAuth();
    $body     = getBody();

    if ($post['is_closed'] || $post['is_locked']) jsonError('This post is closed for comments', 403);

    $text            = trim($body['text'] ?? '');
    $parentCommentId = isset($body['parentCommentId']) ? (int)$body['parentCommentId'] : null;

    if (!$text)               jsonError('Comment text is required', 400);
    if (strlen($text) > 1000) jsonError('Comment cannot exceed 1000 characters', 400);

    $stmt = $db->prepare('INSERT INTO forum_comments (post_id, author_id, parent_comment_id, text) VALUES (?, ?, ?, ?)');
    $stmt->execute([$postId, $authUser['id'], $parentCommentId, $text]);
    $commentId = (int) $db->lastInsertId();

    $db->prepare('UPDATE forum_posts SET comment_count = comment_count + 1, last_activity_at = NOW() WHERE id = ?')
       ->execute([$postId]);

    if ($parentCommentId) {
        $db->prepare('UPDATE forum_comments SET reply_count = reply_count + 1 WHERE id = ?')
           ->execute([$parentCommentId]);
    }

    $stmt = $db->prepare('
        SELECT fc.*, u.username AS author_username, u.first_name AS author_first_name, u.avatar_url AS author_avatar
        FROM forum_comments fc JOIN users u ON u.id = fc.author_id WHERE fc.id = ? LIMIT 1
    ');
    $stmt->execute([$commentId]);
    jsonOk(['comment' => $stmt->fetch()], 201);
}

jsonError('Method not allowed', 405);
