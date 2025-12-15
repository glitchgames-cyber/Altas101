-- SQL Scripts for Scheduled Tasks
-- Use with cron jobs or MySQL Event Scheduler

-- Clean old analytics data (older than 90 days)
DELETE FROM analytics_events 
WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY);

-- Archive old quiz scores (older than 1 year) to archive table
-- First create archive table: CREATE TABLE quiz_scores_archive LIKE quiz_scores;
INSERT INTO quiz_scores_archive 
SELECT * FROM quiz_scores 
WHERE created_at < DATE_SUB(NOW(), INTERVAL 1 YEAR);

DELETE FROM quiz_scores 
WHERE created_at < DATE_SUB(NOW(), INTERVAL 1 YEAR);

-- Update statistics cache
-- This can be used to pre-calculate stats
SELECT 
    COUNT(*) as total_entries,
    COUNT(DISTINCT DATE(created_at)) as active_days,
    COUNT(DISTINCT student_name) as unique_students
FROM logbook_entries
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY);

-- Optimize tables (run weekly)
OPTIMIZE TABLE logbook_entries;
OPTIMIZE TABLE quiz_scores;
OPTIMIZE TABLE analytics_events;

