<?php
/**
 * middleware/auth.php
 * JWT authentication and role-based authorisation.
 *
 * Usage:
 *   require_once __DIR__ . '/../middleware/auth.php';
 *   $user = requireAuth();            // any authenticated user
 *   $user = requireAuth('admin');     // admin only
 */

require_once __DIR__ . '/../config/jwt.php';
require_once __DIR__ . '/../config/db.php';

/**
 * Verify Bearer token and return the current user row.
 * Exits with JSON error if invalid/missing/unauthorised.
 */
function requireAuth(string $role = ''): array {
    $auth = $_SERVER['HTTP_AUTHORIZATION'] ?? '';

    // Some servers use REDIRECT_HTTP_AUTHORIZATION
    if (empty($auth) && function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        $auth = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    }

    if (!str_starts_with($auth, 'Bearer ')) {
        jsonError('Not authorised — no token provided', 401);
    }

    $token   = substr($auth, 7);
    $payload = jwtDecode($token);

    if (!$payload || empty($payload['id'])) {
        jsonError('Token invalid or expired', 401);
    }

    $db   = getDB();
    $stmt = $db->prepare('SELECT * FROM users WHERE id = ? AND account_status NOT IN ("deactivated") LIMIT 1');
    $stmt->execute([$payload['id']]);
    $user = $stmt->fetch();

    if (!$user) {
        jsonError('User not found — token invalid', 401);
    }

    if ($user['account_status'] === 'suspended') {
        jsonError('Account suspended: ' . ($user['suspension_reason'] ?? ''), 403);
    }

    if ($role && $user['role'] !== $role) {
        jsonError('Access denied — requires role: ' . $role, 403);
    }

    return $user;
}

/**
 * Optional auth — attaches user if valid token present, null otherwise.
 */
function optionalAuth(): ?array {
    $auth = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (empty($auth) && function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        $auth = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    }
    if (!str_starts_with($auth, 'Bearer ')) return null;

    $token   = substr($auth, 7);
    $payload = jwtDecode($token);
    if (!$payload || empty($payload['id'])) return null;

    $db   = getDB();
    $stmt = $db->prepare('SELECT * FROM users WHERE id = ? LIMIT 1');
    $stmt->execute([$payload['id']]);
    return $stmt->fetch() ?: null;
}

/** Emit JSON error response and exit. */
function jsonError(string $message, int $code = 400): void {
    http_response_code($code);
    echo json_encode(['success' => false, 'message' => $message]);
    exit;
}

/** Strip sensitive fields from user row before returning to client. */
function sanitizeUser(array $user): array {
    unset($user['password'], $user['lock_until'], $user['login_attempts']);
    return $user;
}
