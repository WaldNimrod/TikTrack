-- ============================================
-- D18: Brokers Fees Table Creation Script
-- Phase 2.1 - Brokers Fees (D18)
-- Created: 2026-02-06
-- Team: Team 60 (DevOps & Platform)
-- ============================================

-- Step 1: Create ENUM type for commission_type
-- Note: Using DO block to handle case where ENUM already exists
DO $$ 
BEGIN
    CREATE TYPE user_data.commission_type AS ENUM ('TIERED', 'FLAT');
    RAISE NOTICE 'ENUM type user_data.commission_type created successfully';
EXCEPTION
    WHEN duplicate_object THEN 
        RAISE NOTICE 'ENUM type user_data.commission_type already exists, skipping creation';
END $$;

-- Step 2: Drop table if exists (to handle partial creation)
DROP TABLE IF EXISTS user_data.brokers_fees CASCADE;

-- Step 3: Create brokers_fees table
CREATE TABLE user_data.brokers_fees (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Foreign Key
    user_id UUID NOT NULL REFERENCES user_data.users(id) ON DELETE CASCADE,
    
    -- Broker Details
    broker VARCHAR(100) NOT NULL,
    commission_type user_data.commission_type NOT NULL,
    commission_value VARCHAR(255) NOT NULL,
    minimum NUMERIC(20, 6) NOT NULL DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    
    -- Constraints
    CONSTRAINT brokers_fees_minimum_check CHECK (minimum >= 0)
);

-- Step 4: Create indexes for performance
-- Index on user_id (most common filter)
CREATE INDEX IF NOT EXISTS idx_brokers_fees_user_id 
    ON user_data.brokers_fees(user_id);

-- Index on broker (for filtering and search)
CREATE INDEX IF NOT EXISTS idx_brokers_fees_broker 
    ON user_data.brokers_fees(broker);

-- Index on commission_type (for filtering)
CREATE INDEX IF NOT EXISTS idx_brokers_fees_commission_type 
    ON user_data.brokers_fees(commission_type);

-- Partial index for soft delete (only non-deleted records)
CREATE INDEX IF NOT EXISTS idx_brokers_fees_deleted_at 
    ON user_data.brokers_fees(deleted_at) 
    WHERE deleted_at IS NULL;

-- Composite index for common query pattern (user_id + deleted_at)
CREATE INDEX IF NOT EXISTS idx_brokers_fees_user_deleted 
    ON user_data.brokers_fees(user_id, deleted_at) 
    WHERE deleted_at IS NULL;

-- Step 5: Add table and column comments
COMMENT ON TABLE user_data.brokers_fees IS 
    'Brokers fees and commission structures (D18) - Stores broker commission information per user';

COMMENT ON COLUMN user_data.brokers_fees.id IS 
    'Primary key - UUID';

COMMENT ON COLUMN user_data.brokers_fees.user_id IS 
    'Foreign key to user_data.users - Links broker fee to user';

COMMENT ON COLUMN user_data.brokers_fees.broker IS 
    'Broker name (e.g., "Interactive Brokers", "IBKR", "TD Ameritrade")';

COMMENT ON COLUMN user_data.brokers_fees.commission_type IS 
    'Commission type: TIERED (volume-based) or FLAT (fixed rate)';

COMMENT ON COLUMN user_data.brokers_fees.commission_value IS 
    'Commission value as string (e.g., "0.0035 $ / Share", "$0.00", "0.1%")';

COMMENT ON COLUMN user_data.brokers_fees.minimum IS 
    'Minimum commission per transaction in USD (NUMERIC(20,6) for precision - per SSOT)';

COMMENT ON COLUMN user_data.brokers_fees.created_at IS 
    'Timestamp when record was created';

COMMENT ON COLUMN user_data.brokers_fees.updated_at IS 
    'Timestamp when record was last updated';

COMMENT ON COLUMN user_data.brokers_fees.deleted_at IS 
    'Timestamp when record was soft-deleted (NULL = active)';

-- Step 6: Create trigger for updated_at (auto-update on row change)
CREATE OR REPLACE FUNCTION update_brokers_fees_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_brokers_fees_updated_at
    BEFORE UPDATE ON user_data.brokers_fees
    FOR EACH ROW
    EXECUTE FUNCTION update_brokers_fees_updated_at();

-- Step 7: Verify table creation
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables 
               WHERE table_schema = 'user_data' 
               AND table_name = 'brokers_fees') THEN
        RAISE NOTICE 'Table user_data.brokers_fees created successfully';
    ELSE
        RAISE EXCEPTION 'Table user_data.brokers_fees was not created';
    END IF;
END $$;
