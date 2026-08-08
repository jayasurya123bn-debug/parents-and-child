<?php
/**
 * admin/users.php
 * GET  /api/admin/users                          — Admin: list all users
 * PUT  /api/admin/users?id={userId}&action=...   — Admin: suspend/activate/delete user
 */

require_once __DIR__ . '/../middleware/cors.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../config/db.php';

requireAuth('admin');
$method = $_SERVER['REQUEST_METHOD'];
$db     = getDB();

// ── GET ───────────────────────────────────────────────────────
if ($method === 'GET') {
    $page   = max(1, (int)($_GET['page']  ?? 1));
    $limit  = min(100, (int)($_GET['limit'] ?? 20));
    $offset = ($page - 1) * $limit;
    $search = $_GET['search'] ?? '';
    $role   = $_GET['role']   ?? '';
    $status = $_GET['status'] ?? '';

    $where  = ['1=1'];
    $params = [];

    if ($search) {
        $where[] = '(username LIKE ? OR email LIKE ? OR first_name LIKE ? OR last_name LIKE ?)';
        $params  = array_merge($params, ["%$search%", "%$search%", "%$search%", "%$search%"]);
    }
    if ($role)   { $where[] = 'role = ?';           $params[] = $role; }
    if ($status) { $where[] = 'account_status = ?'; $params[] = $status; }

    $whereStr = implode(' AND ', $where);

    $countStmt = $db->prepare("SELECT COUNT(*) FROM users WHERE $whereStr");
    $countStmt->execute($params);
    $total = (int) $countStmt->fetchColumn();

    $params[] = $limit;
    $params[] = $offset;
    $stmt = $db->prepare("
        SELECT id, first_name, last_name, username, email, role, account_status,
               suspension_reason, last_login, forum_post_count, created_at
        FROM users WHERE $whereStr ORDER BY created_at DESC LIMIT ? OFFSET ?
    ");
    $stmt->execute($params);
    $users = $stmt->fetchAll();

    jsonOk([
        'users'      => $users,
        'pagination' => ['page' => $page, 'limit' => $limit, 'total' => $total, 'totalPages' => (int)ceil($total / $limit)],
    ]);
}

// ── PUT ───────────────────────────────────────────────────────
if ($method === 'PUT') {
    $userId = isset($_GET['id']) ? (int)$_GET['id'] : 0;
    $action = $_GET['action'] ?? '';

    if (!$userId) jsonError('User ID is required', 400);

    $body = getBody();

    switch ($action) {
        case 'suspend':
            $reason  = $body['reason']  ?? '';
            $endDate = $body['endDate'] ?? null;
            $db->prepare('UPDATE users SET account_status = "suspended", suspension_reason = ?, suspension_end_date = ? WHERE id = ?')
               ->execute([$reason, $endDate, $userId]);
            jsonOk(['message' => 'User suspended']);

        case 'activate':
            $db->prepare('UPDATE users SET account_status = "active", suspension_reason = NULL, suspension_end_date = NULL WHERE id = ?')
               ->execute([$userId]);
            jsonOk(['message' => 'User activated']);

        case 'deactivate':
            $db->prepare('UPDATE users SET account_status = "deactivated" WHERE id = ?')
               ->execute([$userId]);
            jsonOk(['message' => 'User deactivated']);

        case 'role':
            $role = $body['role'] ?? '';
            if (!in_array($role, ['parent','admin'])) jsonError('Invalid role', 400);
            $db->prepare('UPDATE users SET role = ? WHERE id = ?')->execute([$role, $userId]);
            jsonOk(['message' => 'Role updated']);

        default:
            jsonError('Unknown action', 400);
    }
}

jsonError('Method not allowed', 405);
