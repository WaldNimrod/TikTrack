-- ============================================
-- TikTrack Migration: Add cache_change_log table
-- ============================================
-- 
-- Purpose: Create table for polling-based cache invalidation
-- Date: January 13, 2025
-- Version: 2.1.0
-- Part of: Option B-Lite implementation
-- 
-- ============================================

CREATE TABLE IF NOT EXISTS cache_change_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    keys_json TEXT NOT NULL,
    reason VARCHAR(200),
    timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'system'
);

-- Create index on timestamp for faster queries
CREATE INDEX IF NOT EXISTS idx_cache_change_log_timestamp 
ON cache_change_log(timestamp);

-- Insert initial entry for testing
INSERT INTO cache_change_log (keys_json, reason, created_by, timestamp)
VALUES ('["system"]', 'Table created', 'migration', CURRENT_TIMESTAMP);

-- Verify table created
SELECT 'Cache change log table created successfully' AS status;

