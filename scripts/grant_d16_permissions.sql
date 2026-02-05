-- ============================================================================
-- D16_ACCTS_VIEW Tables Permissions Grant Script
-- ============================================================================
-- Created: 2026-02-03
-- Team: Team 60 (DevOps & Platform)
-- Purpose: Grant permissions to application database user for D16_ACCTS_VIEW tables
-- ============================================================================

-- Application user (from existing users table permissions)
-- Based on existing grants, the application user is likely 'TikTrackDbAdmin'
-- If different, replace <app_user> with the actual application user

-- Set the application user (adjust if needed)
DO $$
DECLARE
    app_user TEXT := 'TikTrackDbAdmin';
BEGIN
    -- 1. Grant USAGE on schemas
    EXECUTE format('GRANT USAGE ON SCHEMA user_data TO %I', app_user);
    EXECUTE format('GRANT USAGE ON SCHEMA market_data TO %I', app_user);
    
    -- 2. Grant permissions on user_data tables
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON user_data.trading_accounts TO %I', app_user);
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON user_data.cash_flows TO %I', app_user);
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON user_data.trades TO %I', app_user);
    
    -- 3. Grant permissions on market_data tables
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON market_data.tickers TO %I', app_user);
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON market_data.ticker_prices TO %I', app_user);
    
    -- 4. Grant permissions on sequences (if any)
    EXECUTE format('GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA user_data TO %I', app_user);
    EXECUTE format('GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA market_data TO %I', app_user);
    
    -- 5. Set default privileges for future tables (recommended)
    EXECUTE format('ALTER DEFAULT PRIVILEGES IN SCHEMA user_data GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO %I', app_user);
    EXECUTE format('ALTER DEFAULT PRIVILEGES IN SCHEMA market_data GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO %I', app_user);
    
    RAISE NOTICE 'Permissions granted successfully to user: %', app_user;
END $$;

-- Verify permissions
SELECT 
    grantee, 
    table_schema,
    table_name,
    privilege_type
FROM information_schema.role_table_grants 
WHERE table_schema IN ('user_data', 'market_data')
AND table_name IN ('trading_accounts', 'cash_flows', 'trades', 'tickers', 'ticker_prices')
AND grantee = 'TikTrackDbAdmin'
ORDER BY table_schema, table_name, privilege_type;
