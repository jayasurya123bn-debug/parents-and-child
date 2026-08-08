<?php
/**
 * artworks/upload.php
 * POST /api/artworks/upload — Private
 * Upload image file to Cloudinary, return URL + publicId.
 * Frontend calls this first, then sends result to artworks/index.php (POST).
 */

require_once __DIR__ . '/../middleware/cors.php';
require_once __DIR__ . '/../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') jsonError('Method not allowed', 405);

$authUser = requireAuth();

// ── Cloudinary credentials ────────────────────────────────────
define('CLOUDINARY_CLOUD_NAME', 'YOUR_CLOUD_NAME');  // ← Replace!
define('CLOUDINARY_API_KEY',    'YOUR_API_KEY');      // ← Replace!
define('CLOUDINARY_API_SECRET', 'YOUR_API_SECRET');   // ← Replace!

if (empty($_FILES['image'])) jsonError('No image file provided', 400);

$file      = $_FILES['image'];
$maxSize   = 10 * 1024 * 1024; // 10 MB
$allowed   = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

if ($file['size'] > $maxSize)                 jsonError('File too large (max 10MB)', 400);
if (!in_array($file['type'], $allowed))       jsonError('Only JPEG, PNG, GIF and WebP images are allowed', 400);
if (!is_uploaded_file($file['tmp_name']))     jsonError('Invalid file upload', 400);

// ── Cloudinary signed upload ──────────────────────────────────
$timestamp  = time();
$folder     = 'art-showcase/artworks';
$params     = ['folder' => $folder, 'timestamp' => $timestamp];
ksort($params);
$paramStr   = urldecode(http_build_query($params));
$signature  = sha1($paramStr . CLOUDINARY_API_SECRET);

$url = 'https://api.cloudinary.com/v1_1/' . CLOUDINARY_CLOUD_NAME . '/image/upload';

$postFields = [
    'file'       => new CURLFile($file['tmp_name'], $file['type'], $file['name']),
    'api_key'    => CLOUDINARY_API_KEY,
    'timestamp'  => $timestamp,
    'signature'  => $signature,
    'folder'     => $folder,
];

$ch = curl_init($url);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => $postFields,
    CURLOPT_TIMEOUT        => 60,
]);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode !== 200) jsonError('Image upload to Cloudinary failed', 502);

$result = json_decode($response, true);
if (!isset($result['secure_url'])) jsonError('Cloudinary did not return a URL', 502);

jsonOk([
    'imageUrl'       => $result['secure_url'],
    'imagePublicId'  => $result['public_id'],
    'width'          => $result['width']  ?? null,
    'height'         => $result['height'] ?? null,
]);
