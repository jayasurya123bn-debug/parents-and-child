<?php
/**
 * forum/index.php
 * GET  /api/forum            — Public: list forum posts
 * POST /api/forum            — Private: create forum post
 */

require_once __DIR__ . '/../middleware/cors.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../config/db.php';

$method = $_SERVER['REQUEST_METHOD'];
$db     = getDB();

// ── GET ───────────────────────────────────────────────────────
if ($method === 'GET') {
    $page     = max(1, (int)($_GET['page']     ?? 1));
    $limit    = min(50, (int)($_GET['limit']   ?? 10));
    $offset   = ($page - 1) * $limit;
    $category = $_GET['category'] ?? '';
    $search   = $_GET['search']   ?? '';

    $where  = ['fp.moderation_status = "approved"', 'fp.is_deleted = 0'];
    $params = [];

    if ($category) { $where[] = 'fp.category = ?'; $params[] = $category; }
    if ($search)   { $where[] = '(fp.title LIKE ? OR fp.body LIKE ?)'; $params[] = "%$search%"; $params[] = "%$search%"; }

    $whereStr = implode(' AND ', $where);

    $countStmt = $db->prepare("SELECT COUNT(*) FROM forum_posts fp WHERE $whereStr");
    $countStmt->execute($params);
    $total = (int) $countStmt->fetchColumn();

    $params[] = $limit;
    $params[] = $offset;

    $stmt = $db->prepare("
        SELECT fp.*,
               u.username AS author_username, u.first_name AS author_first_name,
               u.avatar_url AS author_avatar
        FROM forum_posts fp
        JOIN users u ON u.id = fp.author_id
        WHERE $whereStr
        ORDER BY fp.is_pinned DESC, fp.last_activity_at DESC
        LIMIT ? OFFSET ?
    ");
    $stmt->execute($params);
    $posts = $stmt->fetchAll();

    foreach ($posts as &$post) {
        $post['tags'] = $post['tags'] ? json_decode($post['tags'], true) : [];
    }

    jsonOk([
        'posts'      => $posts,
        'pagination' => ['page' => $page, 'limit' => $limit, 'total' => $total, 'totalPages' => (int)ceil($total / $limit)],
    ]);
}

// ── POST ──────────────────────────────────────────────────────
if ($method === 'POST') {
    $authUser = requireAuth();
    $body     = getBody();

    $title    = trim($body['title']    ?? '');
    $postBody = trim($body['body']     ?? '');
    $category = $body['category'] ?? '';
    $tags     = $body['tags']     ?? [];

    if (!$title || !$postBody || !$category) jsonError('Title, body and category are required', 400);
    if (strlen($title)    < 5)   jsonError('Title must be at least 5 characters', 400);
    if (strlen($title)    > 150) jsonError('Title cannot exceed 150 characters', 400);
    if (strlen($postBody) < 10)  jsonError('Body must be at least 10 characters', 400);
    if (strlen($postBody) > 5000)jsonError('Body cannot exceed 5000 characters', 400);

    $validCategories = ['tips_and_advice','art_techniques','child_development','materials_and_supplies',
                        'showcase_feedback','events_and_activities','general_discussion','announcements'];
    if (!in_array($category, $validCategories)) jsonError('Invalid forum category', 400);

    $tags = array_unique(array_filter(array_map(fn($t) => strtolower(trim($t)), $tags)));

    $stmt = $db->prepare('
        INSERT INTO forum_posts (author_id, title, body, category, tags)
        VALUES (?, ?, ?, ?, ?)
    ');
    $stmt->execute([$authUser['id'], $title, $postBody, $category, json_encode(array_values($tags))]);
    $postId = (int) $db->lastInsertId();

    $db->prepare('UPDATE users SET forum_post_count = forum_post_count + 1 WHERE id = ?')
       ->execute([$authUser['id']]);

    $stmt = $db->prepare('
        SELECT fp.*, u.username AS author_username, u.first_name AS author_first_name, u.avatar_url AS author_avatar
        FROM forum_posts fp JOIN users u ON u.id = fp.author_id WHERE fp.id = ? LIMIT 1
    ');
    $stmt->execute([$postId]);
    $post = $stmt->fetch();
    $post['tags'] = json_decode($post['tags'], true) ?? [];

    jsonOk(['post' => $post], 201);
}

jsonError('Method not allowed', 405);
