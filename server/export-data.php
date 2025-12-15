<?php
/**
 * Data Export Script
 * Exports logbook entries and quiz scores to CSV/JSON
 */

require_once __DIR__ . '/config.php';

// Default response type is JSON
header('Content-Type: application/json; charset=utf-8');

// Check authentication (add your auth logic here)
$authorized = true; // Replace with actual auth check

if (!$authorized) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$format = $_GET['format'] ?? 'json';
$type = $_GET['type'] ?? 'all';

$db = getDBConnection();

if (!$db) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}

$data = [];

if ($type === 'all' || $type === 'entries') {
    $stmt = $db->query("SELECT * FROM logbook_entries ORDER BY created_at DESC");
    $data['entries'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
}

if ($type === 'all' || $type === 'scores') {
    $stmt = $db->query("SELECT * FROM quiz_scores ORDER BY created_at DESC");
    $data['scores'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
}

if ($format === 'csv') {
    // Stream CSV output
    header('Content-Type: text/csv; charset=utf-8');
    $filename = 'atlas-export-' . date('Y-m-d') . '.csv';
    header('Content-Disposition: attachment; filename="' . basename($filename) . '"');

    $output = fopen('php://output', 'w');

    // Entries section
    if (!empty($data['entries'])) {
        fputcsv($output, ['ID', 'Student Name', 'Class', 'Created At']);
        foreach ($data['entries'] as $entry) {
            fputcsv($output, [
                $entry['id'] ?? '',
                $entry['student_name'] ?? $entry['name'] ?? '',
                $entry['class_name'] ?? $entry['class'] ?? '',
                $entry['created_at'] ?? ''
            ]);
        }
    } else {
        // write a small placeholder if no entries
        fputcsv($output, ['No entries found']);
    }

    // Separator row between sections
    fputcsv($output, []);

    // Scores section
    if (!empty($data['scores'])) {
        fputcsv($output, ['ID', 'Player', 'Score', 'Level', 'Time', 'Created At']);
        foreach ($data['scores'] as $score) {
            fputcsv($output, [
                $score['id'] ?? '',
                $score['player_name'] ?? '',
                $score['score'] ?? '',
                $score['level'] ?? '',
                $score['time_taken'] ?? '',
                $score['created_at'] ?? ''
            ]);
        }
    } else {
        fputcsv($output, ['No scores found']);
    }

    fclose($output);
    exit;
} else {
    echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
}

?>

