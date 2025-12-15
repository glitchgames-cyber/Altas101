<?php
/**
 * Installation Script for India Tech Atlas
 * Run this once to set up the database
 */

require_once __DIR__ . '/config.php';

$rootPath = dirname(__DIR__);

// Check if already installed
$installed = file_exists($rootPath . '/.installed');

if ($installed && !isset($_GET['force'])) {
    die('Application is already installed. Add ?force=1 to reinstall.');
}

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Installation - India Tech Atlas</title>
    <style>
        body {
            font-family: 'Space Grotesk', system-ui, sans-serif;
            max-width: 800px;
            margin: 2rem auto;
            padding: 2rem;
            background: #050d1a;
            color: #f5f8ff;
        }
        .step {
            background: rgba(15, 25, 45, 0.8);
            padding: 1.5rem;
            margin: 1rem 0;
            border-radius: 12px;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .success { color: #4dd0e1; }
        .error { color: #ff7a18; }
        button {
            background: #ff7a18;
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            cursor: pointer;
            font-size: 1rem;
        }
        button:hover { background: #ff8a28; }
    </style>
</head>
<body>
    <h1>India Tech Atlas - Installation</h1>

    <?php
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['install'])) {
        $db = getDBConnection();

        if (!$db) {
            echo '<div class="step error">Database connection failed. Please check config.php</div>';
        } else {
            echo '<div class="step success">Database connected successfully!</div>';

            // Read and execute SQL file
            if (!file_exists($rootPath . '/database.sql')) {
                echo '<div class="step error">database.sql not found in project root.</div>';
            } else {
                $sql = file_get_contents($rootPath . '/database.sql');
                $statements = array_filter(array_map('trim', explode(';', $sql)));

            $success = 0;
            $errors = 0;

                foreach ($statements as $statement) {
                if (empty($statement) || strpos($statement, '--') === 0) {
                    continue;
                }

                try {
                    $db->exec($statement);
                    $success++;
                } catch (PDOException $e) {
                    if (strpos($e->getMessage(), 'already exists') === false) {
                        $errors++;
                        echo '<div class="step error">Error: ' . htmlspecialchars($e->getMessage()) . '</div>';
                    }
                }
                }
            }

            if ($errors === 0) {
                file_put_contents($rootPath . '/.installed', date('Y-m-d H:i:s'));
                echo '<div class="step success">Installation completed successfully!</div>';
                echo '<div class="step">You can now <a href="index.html" style="color: #4dd0e1;">access the application</a>.</div>';
            }
        }
    } else {
    ?>

    <div class="step">
        <h2>Pre-Installation Checklist</h2>
        <ul>
            <li>✓ Database created (or will be created automatically)</li>
            <li>✓ config.php configured with database credentials</li>
            <li>✓ PHP PDO extension enabled</li>
            <li>✓ Write permissions on this directory</li>
        </ul>
    </div>

    <div class="step">
        <h2>Installation Steps</h2>
        <p>This will:</p>
        <ul>
            <li>Create all necessary database tables</li>
            <li>Insert sample data</li>
            <li>Create indexes for performance</li>
            <li>Set up views and stored procedures</li>
        </ul>
    </div>

    <form method="POST">
        <button type="submit" name="install">Start Installation</button>
    </form>

    <?php } ?>
</body>
</html>

