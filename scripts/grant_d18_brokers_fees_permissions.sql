-- ============================================================================
-- D18 Brokers Fees Table Permissions Grant Script
-- ============================================================================
-- Created: 2026-02-06
-- Team: Team 60 (DevOps & Platform)
-- Purpose: Grant permissions to application database user for brokers_fees table
-- ============================================================================

-- Application user (from existing users table permissions)
-- Based on existing grants, the application user is 'TikTrackDbAdmin'

-- Set the application user
DO $$
DECLARE
    app_user TEXT := 'TikTrackDbAdmin';
BEGIN
    -- 1. Grant USAGE on schema
    EXECUTE format('GRANT USAGE ON SCHEMA user_data TO %I', app_user);
    
    -- 2. Grant permissions on brokers_fees table
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON user_data.brokers_fees TO %I', app_user);
    
    -- 3. Grant ENUM type usage
    EXECUTE format('GRANT USAGE ON TYPE user_data.commission_type TO %I', app_user);
    
    -- 4. Grant sequence permissions (if using SERIAL/BIGSERIAL in future)
    EXECUTE format('GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA user_data TO %I', app_user);
    
    -- 5. Set default privileges for future tables (if not already set)
    EXECUTE format('ALTER DEFAULT PRIVILEGES IN SCHEMA user_data GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO %I', app_user);
    
    RAISE NOTICE 'Permissions granted successfully to user: %', app_user;
END $$;

-- Verification: Check permissions
SELECT 
    grantee,
    privilege_type,
    table_schema,
    table_name
FROM information_schema.role_table_grants
WHERE table_schema = 'user_data'
AND table_name = 'brokers_fees'
AND grantee = 'TikTrackDbAdmin'
ORDER BY privilege_type;
