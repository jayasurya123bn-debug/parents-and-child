<?php
/**
 * admin/dashboard.php
 * GET /api/admin/dashboard — Admin only
 * Returns platform statistics for the admin dashboard.
 */

require_once __DIR__ . '/../middleware/cors.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') jsonError('Method not allowed', 405);

requireAuth('admin');
$db = getDB();

// ── Aggregate stats ──────────────────────────────────────────
$stats = [];

$queries = [
    'totalUsers'            => 'SELECT COUNT(*) FROM users WHERE role = "parent"',
    'totalChildren'         => 'SELECT COUNT(*) FROM children WHERE is_active = 1',
    'totalArtworks'         => 'SELECT COUNT(*) FROM artworks',
    'pendingArtworks'       => 'SELECT COUNT(*) FROM artworks WHERE moderation_status = "pending"',
    'approvedArtworks'      => 'SELECT COUNT(*) FROM artworks WHERE moderation_status = "approved"',
    'rejectedArtworks'      => 'SELECT COUNT(*) FROM artworks WHERE moderation_status = "rejected"',
    'flaggedArtworks'       => 'SELECT COUNT(*) FROM artworks WHERE moderation_status = "flagged"',
    'totalComments'         => 'SELECT COUNT(*) FROM comments',
    'pendingComments'       => 'SELECT COUNT(*) FROM comments WHERE moderation_status = "pending"',
    'totalForumPosts'       => 'SELECT COUNT(*) FROM forum_posts WHERE is_deleted = 0',
    'totalLikes'            => 'SELECT COUNT(*) FROM artwork_likes',
    'suspendedUsers'        => 'SELECT COUNT(*) FROM users WHERE account_status = "suspended"',
];

foreach ($queries as $key => $sql) {
    $stats[$key] = (int) $db->query($sql)->fetchColumn();
}

// ── Recent users ──────────────────────────────────────────────
$stmt = $db->query('SELECT id, first_name, last_name, username, email, role, account_status, created_at FROM users ORDER BY created_at DESC LIMIT 5');
$stats['recentUsers'] = $stmt->fetchAll();

// ── Recent artworks pending moderation ────────────────────────
$stmt = $db->query('
    SELECT a.id, a.title, a.category, a.moderation_status, a.created_at,
           c.display_name AS child_name, u.username AS parent_username
    FROM artworks a
    JOIN children c ON c.id = a.child_id
    JOIN users    u ON u.id = a.parent_id
    WHERE a.moderation_status = "pending"
    ORDER BY a.created_at ASC LIMIT 10
');
$stats['pendingArtworksList'] = $stmt->fetchAll();

jsonOk(['stats' => $stats]);
