-- TikTrack Database Schema Update: Admin Duplicate Email/Phone Support
-- Task: Allow ADMIN and SUPERADMIN users to have duplicate email/phone
-- Date: 2026-02-01
-- Team: 20 (Backend)

-- ============================================================================
-- Background
-- ============================================================================
-- Requirement: Admin users need to be able to have duplicate email/phone
-- This allows admin to also be a regular user (dual identity).
-- 
-- Current constraint: UNIQUE on email and phone_number prevents duplicates
-- Solution: Modify UNIQUE constraints to exclude ADMIN/SUPERADMIN users

-- ============================================================================
-- Step 1: Drop existing UNIQUE constraints/indexes
-- ============================================================================

-- Drop unique constraint on email (if exists as constraint)
ALTER TABLE user_data.users DROP CONSTRAINT IF EXISTS users_email_key;

-- Drop unique index on email
DROP INDEX IF EXISTS user_data.idx_users_email;

-- Drop unique index on phone_number
DROP INDEX IF EXISTS user_data.idx_users_phone_unique;

-- ============================================================================
-- Step 2: Create partial unique indexes that exclude ADMIN/SUPERADMIN
-- ============================================================================

-- Email: UNIQUE only for non-admin users
CREATE UNIQUE INDEX idx_users_email_unique_non_admin
    ON user_data.users(email)
    WHERE deleted_at IS NULL 
    AND role NOT IN ('ADMIN', 'SUPERADMIN');

-- Regular index for email (for queries)
CREATE INDEX idx_users_email
    ON user_data.users(email)
    WHERE deleted_at IS NULL;

-- Phone: UNIQUE only for non-admin users (and not NULL)
CREATE UNIQUE INDEX idx_users_phone_unique_non_admin
    ON user_data.users(phone_number)
    WHERE phone_number IS NOT NULL 
    AND deleted_at IS NULL
    AND role NOT IN ('ADMIN', 'SUPERADMIN');

-- Regular index for phone (for queries)
CREATE INDEX idx_users_phone
    ON user_data.users(phone_number)
    WHERE deleted_at IS NULL;

-- ============================================================================
-- Verification
-- ============================================================================

-- Verify indexes were created
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'user_data'
    AND tablename = 'users'
    AND indexname LIKE '%email%' OR indexname LIKE '%phone%'
ORDER BY indexname;

-- ============================================================================
-- Notes
-- ============================================================================
-- 1. ADMIN and SUPERADMIN users can now have duplicate email/phone
-- 2. Regular users (USER role) still have UNIQUE constraints
-- 3. Soft-deleted users (deleted_at IS NOT NULL) are excluded from uniqueness
-- 4. This allows admin to have both admin and regular user accounts
