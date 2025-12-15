<?php
/**
 * API Endpoints for India Tech Atlas
 * Provides RESTful API for future backend functionality
 */

require_once 'config.php';

// Set CORS headers
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    setCORSHeaders();
    http_response_code(200);
    exit;
}

setCORSHeaders();

// Get request method and path
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$pathParts = explode('/', trim($path, '/'));

// Remove 'api.php' from path if present
$pathParts = array_filter($pathParts, function($part) {
    return $part !== 'api.php' && !empty($part);
});
$pathParts = array_values($pathParts);

// Get request data
$input = json_decode(file_get_contents('php://input'), true);
$queryParams = $_GET;

// Route handling
$endpoint = $pathParts[0] ?? '';

switch ($endpoint) {
    case 'quiz':
        handleQuizEndpoint($method, $pathParts, $input, $queryParams);
        break;
    
    case 'entries':
        handleEntriesEndpoint($method, $pathParts, $input, $queryParams);
        break;
    
    case 'stats':
        handleStatsEndpoint($method, $pathParts, $input, $queryParams);
        break;
    
    case 'health':
        handleHealthEndpoint();
        break;
    
    default:
        errorResponse('Endpoint not found', 404);
}

/**
 * Quiz API Endpoints
 */
function handleQuizEndpoint($method, $pathParts, $input, $queryParams) {
    switch ($method) {
        case 'GET':
            if (count($pathParts) > 1 && $pathParts[1] === 'questions') {
                // Get quiz questions
                $category = $queryParams['category'] ?? 'all';
                $questions = getQuizQuestions($category);
                successResponse($questions, 'Quiz questions retrieved');
            } else {
                errorResponse('Invalid quiz endpoint', 400);
            }
            break;
        
        case 'POST':
            if (count($pathParts) > 1 && $pathParts[1] === 'score') {
                // Submit quiz score
                $score = saveQuizScore($input);
                successResponse($score, 'Score saved successfully');
            } else {
                errorResponse('Invalid quiz endpoint', 400);
            }
            break;
        
        default:
            errorResponse('Method not allowed', 405);
    }
}

/**
 * Entries API Endpoints (for vault/logbook)
 */
function handleEntriesEndpoint($method, $pathParts, $input, $queryParams) {
    // Note: In production, add authentication here
    
    switch ($method) {
        case 'GET':
            if (count($pathParts) > 1) {
                $id = $pathParts[1];
                $entry = getEntry($id);
                if ($entry) {
                    successResponse($entry, 'Entry retrieved');
                } else {
                    errorResponse('Entry not found', 404);
                }
            } else {
                $entries = getEntries($queryParams);
                successResponse($entries, 'Entries retrieved');
            }
            break;
        
        case 'POST':
            $entry = createEntry($input);
            if ($entry) {
                successResponse($entry, 'Entry created', 201);
            } else {
                errorResponse('Failed to create entry', 500);
            }
            break;
        
        case 'PUT':
            if (count($pathParts) > 1) {
                $id = $pathParts[1];
                $entry = updateEntry($id, $input);
                if ($entry) {
                    successResponse($entry, 'Entry updated');
                } else {
                    errorResponse('Entry not found', 404);
                }
            } else {
                errorResponse('Entry ID required', 400);
            }
            break;
        
        case 'DELETE':
            if (count($pathParts) > 1) {
                $id = $pathParts[1];
                if (deleteEntry($id)) {
                    successResponse(null, 'Entry deleted');
                } else {
                    errorResponse('Entry not found', 404);
                }
            } else {
                errorResponse('Entry ID required', 400);
            }
            break;
        
        default:
            errorResponse('Method not allowed', 405);
    }
}

/**
 * Stats API Endpoints
 */
function handleStatsEndpoint($method, $pathParts, $input, $queryParams) {
    if ($method !== 'GET') {
        errorResponse('Method not allowed', 405);
    }
    
    $stats = getStats($queryParams);
    successResponse($stats, 'Statistics retrieved');
}

/**
 * Health Check Endpoint
 */
function handleHealthEndpoint() {
    $db = getDBConnection();
    $dbStatus = $db ? 'connected' : 'disconnected';
    
    jsonResponse([
        'status' => 'ok',
        'timestamp' => date('c'),
        'database' => $dbStatus,
        'version' => APP_VERSION
    ]);
}

// Database Functions

function getQuizQuestions($category = 'all') {
    $db = getDBConnection();
    if (!$db) {
        // Fallback to JSON file
        $json = @file_get_contents('quiz-questions.json');
        if ($json === false) {
            return [];
        }
        $data = json_decode($json, true);
        if (!is_array($data)) {
            return [];
        }
        if ($category === 'all') {
            $past = $data['past'] ?? [];
            $present = $data['present'] ?? [];
            $future = $data['future'] ?? [];
            return array_merge($past, $present, $future);
        }
        return $data[$category] ?? [];
    }
    
    $stmt = $db->prepare("SELECT * FROM quiz_questions WHERE category = ? OR ? = 'all' ORDER BY RAND()");
    $stmt->execute([$category, $category]);
    return $stmt->fetchAll();
}

function saveQuizScore($data) {
    $db = getDBConnection();
    if (!$db) return null;
    
    $stmt = $db->prepare("INSERT INTO quiz_scores (player_name, score, level, time_taken, created_at) VALUES (?, ?, ?, ?, NOW())");
    $stmt->execute([
        $data['player_name'] ?? 'Anonymous',
        $data['score'] ?? 0,
        $data['level'] ?? 1,
        $data['time_taken'] ?? 0
    ]);
    
    return ['id' => $db->lastInsertId()];
}

function getEntries($params = []) {
    $db = getDBConnection();
    if (!$db) return [];
    $limit = isset($params['limit']) ? (int)$params['limit'] : 50;
    $offset = isset($params['offset']) ? (int)$params['offset'] : 0;

    // cast to integers and safely inject into query (safe because of casting)
    $limit = max(1, min(1000, $limit));
    $offset = max(0, $offset);

    $sql = "SELECT * FROM logbook_entries ORDER BY created_at DESC LIMIT $limit OFFSET $offset";
    $stmt = $db->query($sql);
    return $stmt ? $stmt->fetchAll() : [];
}

function getEntry($id) {
    $db = getDBConnection();
    if (!$db) return null;
    
    $stmt = $db->prepare("SELECT * FROM logbook_entries WHERE id = ?");
    $stmt->execute([$id]);
    return $stmt->fetch();
}

function createEntry($data) {
    $db = getDBConnection();
    if (!$db) return null;
    $studentName = $data['student_name'] ?? $data['name'] ?? '';
    $className = $data['class_name'] ?? $data['className'] ?? '';

    $stmt = $db->prepare("INSERT INTO logbook_entries (student_name, class_name, created_at) VALUES (?, ?, NOW())");
    $stmt->execute([
        $studentName,
        $className
    ]);

    return getEntry($db->lastInsertId());
}

function updateEntry($id, $data) {
    $db = getDBConnection();
    if (!$db) return null;
    $studentName = $data['student_name'] ?? $data['name'] ?? '';
    $className = $data['class_name'] ?? $data['className'] ?? '';

    $stmt = $db->prepare("UPDATE logbook_entries SET student_name = ?, class_name = ? WHERE id = ?");
    $stmt->execute([
        $studentName,
        $className,
        $id
    ]);

    return getEntry($id);
}

function deleteEntry($id) {
    $db = getDBConnection();
    if (!$db) return false;
    
    $stmt = $db->prepare("DELETE FROM logbook_entries WHERE id = ?");
    return $stmt->execute([$id]);
}

function getStats($params = []) {
    $db = getDBConnection();
    if (!$db) {
        return [
            'total_entries' => 0,
            'total_quiz_plays' => 0,
            'average_score' => 0
        ];
    }
    
    $stats = [];
    
    // Total entries
    $stmt = $db->query("SELECT COUNT(*) as count FROM logbook_entries");
    $stats['total_entries'] = $stmt->fetch()['count'];
    
    // Total quiz plays
    $stmt = $db->query("SELECT COUNT(*) as count FROM quiz_scores");
    $stats['total_quiz_plays'] = $stmt->fetch()['count'];
    
    // Average score
    $stmt = $db->query("SELECT AVG(score) as avg FROM quiz_scores");
    $stats['average_score'] = round($stmt->fetch()['avg'] ?? 0, 2);
    
    return $stats;
}

?>

