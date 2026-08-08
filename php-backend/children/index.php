<?php
/**
 * children/index.php
 * GET  /api/children         — Private: list parent's children
 * POST /api/children         — Private: create a child profile
 */

require_once __DIR__ . '/../middleware/cors.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../config/db.php';

$authUser = requireAuth();
$method   = $_SERVER['REQUEST_METHOD'];
$db       = getDB();

// ── GET ───────────────────────────────────────────────────────
if ($method === 'GET') {
    $stmt = $db->prepare('SELECT * FROM children WHERE parent_id = ? AND is_active = 1 ORDER BY created_at DESC');
    $stmt->execute([$authUser['id']]);
    $children = $stmt->fetchAll();

    foreach ($children as &$child) {
        $child['art_interests']  = $child['art_interests']  ? json_decode($child['art_interests'],  true) : [];
        $child['favorite_colors']= $child['favorite_colors']? json_decode($child['favorite_colors'], true) : [];
    }
    jsonOk(['children' => $children]);
}

// ── POST ──────────────────────────────────────────────────────
if ($method === 'POST') {
    $body        = getBody();
    $displayName = trim($body['displayName'] ?? '');
    $dob         = $body['dateOfBirth'] ?? '';
    $privacyLevel = $body['privacyLevel'] ?? 'community';
    $bio         = trim($body['bio'] ?? '');
    $artInterests = $body['artInterests'] ?? [];
    $favoriteColors = $body['favoriteColors'] ?? [];
    $consent     = !empty($body['consentGiven']);

    if (!$displayName || !$dob) jsonError('Display name and date of birth are required', 400);
    if (strlen($displayName) > 40) jsonError('Display name cannot exceed 40 characters', 400);

    // Age validation
    $dobTs = strtotime($dob);
    if (!$dobTs) jsonError('Invalid date of birth', 400);
    $ageYears = (time() - $dobTs) / (365.25 * 86400);
    if ($ageYears < 2 || $ageYears > 17) jsonError('Child must be between 2 and 17 years old', 400);

    // Compute age group
    if      ($ageYears <= 4)  $ageGroup = 'toddler';
    elseif  ($ageYears <= 7)  $ageGroup = 'early_childhood';
    elseif  ($ageYears <= 11) $ageGroup = 'middle_childhood';
    else                      $ageGroup = 'tween';

    $validPrivacy = ['public','community','private'];
    if (!in_array($privacyLevel, $validPrivacy)) $privacyLevel = 'community';

    $stmt = $db->prepare('
        INSERT INTO children
          (parent_id, display_name, date_of_birth, age_group, bio,
           art_interests, favorite_colors, privacy_level, consent_given, consent_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ');
    $stmt->execute([
        $authUser['id'],
        $displayName,
        date('Y-m-d', $dobTs),
        $ageGroup,
        $bio,
        json_encode($artInterests),
        json_encode($favoriteColors),
        $privacyLevel,
        $consent ? 1 : 0,
        $consent ? date('Y-m-d H:i:s') : null,
    ]);
    $childId = (int) $db->lastInsertId();

    $stmt = $db->prepare('SELECT * FROM children WHERE id = ? LIMIT 1');
    $stmt->execute([$childId]);
    $child = $stmt->fetch();
    $child['art_interests']   = json_decode($child['art_interests'],   true) ?? [];
    $child['favorite_colors'] = json_decode($child['favorite_colors'], true) ?? [];

    jsonOk(['child' => $child], 201);
}

jsonError('Method not allowed', 405);
