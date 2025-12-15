<?php
/**
 * Database Backup Script
 * Creates a backup of the database
 */

require_once 'config.php';

// Check authentication
$authorized = true; // Replace with actual auth check

if (!$authorized) {
    die('Unauthorized');
}

$backupDir = 'backups';
$backupFile = $backupDir . DIRECTORY_SEPARATOR . 'backup-' . date('Y-m-d-H-i-s') . '.sql';

// Create backups directory if it doesn't exist
if (!is_dir($backupDir)) {
    if (!mkdir($backupDir, 0755, true)) {
        http_response_code(500);
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'error' => 'Failed to create backups directory']);
        exit;
    }
}

// Ensure exec is available
if (!function_exists('exec')) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'error' => 'Server does not allow executing shell commands']);
    exit;
}

// Use a temporary credentials file to avoid exposing password on command line
$tmpIni = tempnam(sys_get_temp_dir(), 'mycnf');
$myCnf = "[client]\nuser=" . DB_USER . "\npassword=" . DB_PASS . "\nhost=" . DB_HOST . "\n";
file_put_contents($tmpIni, $myCnf);
@chmod($tmpIni, 0600);

$command = sprintf('mysqldump --defaults-extra-file=%s %s > %s', escapeshellarg($tmpIni), escapeshellarg(DB_NAME), escapeshellarg($backupFile));

exec($command, $output, $returnVar);

// cleanup temp file
@unlink($tmpIni);

if ($returnVar === 0 && file_exists($backupFile)) {
    header('Content-Type: application/json');
    echo json_encode([
        'success' => true,
        'file' => $backupFile,
        'size' => filesize($backupFile),
        'message' => 'Backup created successfully'
    ]);
} else {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'error' => 'Backup failed',
        'output' => $output
    ]);
}

?>

