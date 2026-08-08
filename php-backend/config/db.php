<?php
/**
 * config/db.php
 * MySQL PDO connection singleton.
 * Edit DB_HOST, DB_NAME, DB_USER, DB_PASS with your ProFreeHost MySQL credentials.
 */

define('DB_HOST', 'localhost');
define('DB_NAME', 'YOUR_DB_NAME');      // ← Replace with your ProFreeHost DB name
define('DB_USER', 'YOUR_DB_USER');      // ← Replace with your ProFreeHost DB username
define('DB_PASS', 'YOUR_DB_PASSWORD');  // ← Replace with your ProFreeHost DB password
define('DB_CHARSET', 'utf8mb4');

function getDB(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        $dsn = sprintf('mysql:host=%s;dbname=%s;charset=%s', DB_HOST, DB_NAME, DB_CHARSET);
        try {
            $pdo = new PDO($dsn, DB_USER, DB_PASS, [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Database connection failed.']);
            exit;
        }
    }
    return $pdo;
}
