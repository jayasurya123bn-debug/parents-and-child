<?php
/**
 * middleware/cors.php
 * CORS and JSON content-type headers — included in every PHP endpoint.
 */

// ── Your ProFreeHost domain ──────────────────────────────────
// Change this to your actual domain, e.g. https://artbloom.profreehost.com
define('FRONTEND_ORIGIN', 'https://artbloom.profreehost.com');

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: ' . FRONTEND_ORIGIN);
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Max-Age: 3600');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

/** Decode JSON request body and return as array. */
function getBody(): array {
    $raw = file_get_contents('php://input');
    if (empty($raw)) return [];
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

/** Emit a success JSON response and exit. */
function jsonOk(array $data, int $code = 200): void {
    http_response_code($code);
    echo json_encode(array_merge(['success' => true], $data));
    exit;
}
