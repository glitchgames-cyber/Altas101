-- India Tech Atlas Database Schema
-- MySQL/MariaDB Database Structure

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+05:30";

-- Create Database
CREATE DATABASE IF NOT EXISTS `india_tech_atlas` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `india_tech_atlas`;

-- Table: logbook_entries
-- Stores student logbook entries from the vault
CREATE TABLE IF NOT EXISTS `logbook_entries` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_name` varchar(255) NOT NULL,
  `class_name` varchar(255) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_student_name` (`student_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: quiz_questions
-- Stores quiz questions (can sync with quiz-questions.json)
CREATE TABLE IF NOT EXISTS `quiz_questions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `category` enum('past','present','future') NOT NULL,
  `question` text NOT NULL,
  `options` json NOT NULL,
  `answer` tinyint(4) NOT NULL,
  `fact` text DEFAULT NULL,
  `difficulty` enum('easy','medium','hard') DEFAULT 'medium',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_category` (`category`),
  KEY `idx_difficulty` (`difficulty`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: quiz_scores
-- Stores quiz game scores and statistics
CREATE TABLE IF NOT EXISTS `quiz_scores` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `player_name` varchar(255) DEFAULT 'Anonymous',
  `score` int(11) NOT NULL DEFAULT 0,
  `level` int(11) DEFAULT 1,
  `time_taken` int(11) DEFAULT 0,
  `questions_answered` int(11) DEFAULT 0,
  `correct_answers` int(11) DEFAULT 0,
  `game_type` varchar(50) DEFAULT 'quiz',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_score` (`score`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_game_type` (`game_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: game_sessions
-- Tracks game sessions for analytics
CREATE TABLE IF NOT EXISTS `game_sessions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `session_id` varchar(255) NOT NULL,
  `game_type` varchar(50) NOT NULL,
  `start_time` datetime NOT NULL,
  `end_time` datetime DEFAULT NULL,
  `duration` int(11) DEFAULT NULL,
  `score` int(11) DEFAULT 0,
  `user_agent` text DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_session_id` (`session_id`),
  KEY `idx_game_type` (`game_type`),
  KEY `idx_start_time` (`start_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: user_preferences
-- Stores user preferences and settings
CREATE TABLE IF NOT EXISTS `user_preferences` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_identifier` varchar(255) NOT NULL,
  `preference_key` varchar(100) NOT NULL,
  `preference_value` text DEFAULT NULL,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_user_pref` (`user_identifier`, `preference_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: analytics_events
-- Tracks user interactions and events
CREATE TABLE IF NOT EXISTS `analytics_events` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `event_type` varchar(50) NOT NULL,
  `event_name` varchar(100) NOT NULL,
  `event_data` json DEFAULT NULL,
  `user_identifier` varchar(255) DEFAULT NULL,
  `page_url` varchar(500) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_event_type` (`event_type`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample quiz questions (from quiz-questions.json structure)
-- This is optional - you can import from JSON instead
INSERT INTO `quiz_questions` (`category`, `question`, `options`, `answer`, `fact`, `difficulty`) VALUES
('past', 'Which institute built India\'s first indigenous computer TIFRAC?', '["IIT Bombay", "TIFR", "IISc", "BARC"]', 1, 'TIFR engineers completed TIFRAC in 1960 for atomic research.', 'medium'),
('present', 'Which rail unbundles e-commerce in India?', '["ONDC", "FASTag", "BHIM", "GSTN"]', 0, 'ONDC lets sellers and buyers transact across interoperable apps.', 'easy'),
('future', 'Gaganyaan aims to send astronauts to?', '["Moon orbit", "Low Earth Orbit", "Mars orbit", "Venus flyby"]', 1, 'Gaganyaan\'s crew module targets Low Earth Orbit missions.', 'medium');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS `idx_logbook_student_class` ON `logbook_entries` (`student_name`, `class_name`);
CREATE INDEX IF NOT EXISTS `idx_quiz_scores_player` ON `quiz_scores` (`player_name`, `score`);

-- Views for common queries

-- View: High Scores
CREATE OR REPLACE VIEW `high_scores` AS
SELECT 
    player_name,
    game_type,
    MAX(score) as best_score,
    AVG(score) as avg_score,
    COUNT(*) as games_played
FROM quiz_scores
GROUP BY player_name, game_type
ORDER BY best_score DESC;

-- View: Recent Entries
CREATE OR REPLACE VIEW `recent_entries` AS
SELECT 
    id,
    student_name,
    class_name,
    created_at,
    DATE_FORMAT(created_at, '%Y-%m-%d') as entry_date
FROM logbook_entries
ORDER BY created_at DESC
LIMIT 100;

-- Stored Procedures

-- Procedure: Get Quiz Statistics
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS `GetQuizStats`(IN category_name VARCHAR(20))
BEGIN
    SELECT 
        COUNT(*) as total_questions,
        COUNT(DISTINCT category) as categories,
        AVG(CASE WHEN difficulty = 'easy' THEN 1 WHEN difficulty = 'medium' THEN 2 ELSE 3 END) as avg_difficulty
    FROM quiz_questions
    WHERE category = category_name OR category_name IS NULL;
END //
DELIMITER ;

-- Procedure: Clean Old Analytics
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS `CleanOldAnalytics`(IN days_to_keep INT)
BEGIN
    DELETE FROM analytics_events 
    WHERE created_at < DATE_SUB(NOW(), INTERVAL days_to_keep DAY);
END //
DELIMITER ;

-- Triggers

-- Trigger: Update entry timestamp
DELIMITER //
CREATE TRIGGER IF NOT EXISTS `update_entry_timestamp`
BEFORE UPDATE ON `logbook_entries`
FOR EACH ROW
BEGIN
    SET NEW.updated_at = NOW();
END //
DELIMITER ;

-- Grant permissions (adjust as needed)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON india_tech_atlas.* TO 'atlas_user'@'localhost';
-- FLUSH PRIVILEGES;

