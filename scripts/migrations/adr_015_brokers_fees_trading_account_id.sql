-- ============================================================================
-- Migration ADR-015: brokers_fees — trading_account_id, remove broker
-- Team 20 (Backend)
-- Date: 2026-02-12
-- Source: TEAM_10_TO_TEAM_20_ADR_015_BROKER_REFERENCE_MANDATE.md
--         TEAM_10_ADR_015_BROKER_REFERENCE_WORK_PLAN.md §6א
--
-- Purpose: Fees per Trading Account. Broker is metadata of account only.
-- 1. Add trading_account_id
-- 2. Migrate: match (user_id, broker) → trading_accounts
-- 3. No match: DELETE fee (log count)
-- 4. Remove broker, NOT NULL on trading_account_id
--
-- Run: Team 60 per TEAM_20 instruction (make db-* / pipeline)
-- ============================================================================

BEGIN;

-- Step 0: Idempotency — skip if broker already removed (migration applied)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'user_data' AND table_name = 'brokers_fees'
        AND column_name = 'broker'
    ) THEN
        RAISE NOTICE 'ADR-015 migration already applied (broker column removed). No action.';
        RAISE EXCEPTION 'ADR_015_ALREADY_APPLIED' USING MESSAGE = 'Migration skipped - broker column already removed';
    END IF;
END $$;

-- Step 1: Add trading_account_id (nullable for migration)
ALTER TABLE user_data.brokers_fees
ADD COLUMN IF NOT EXISTS trading_account_id UUID REFERENCES user_data.trading_accounts(id) ON DELETE CASCADE;

-- Step 2: Populate trading_account_id from trading_accounts match
-- Match: same user_id, same broker (case-insensitive trim)
-- Multiple matches: use first by created_at
WITH ranked AS (
    SELECT bf.id AS fee_id,
           ta.id AS account_id,
           ROW_NUMBER() OVER (PARTITION BY bf.id ORDER BY ta.created_at) AS rn
    FROM user_data.brokers_fees bf
    INNER JOIN user_data.trading_accounts ta
        ON ta.user_id = bf.user_id
        AND TRIM(LOWER(COALESCE(ta.broker, ''))) = TRIM(LOWER(COALESCE(bf.broker, '')))
        AND ta.deleted_at IS NULL
    WHERE bf.trading_account_id IS NULL
)
UPDATE user_data.brokers_fees bf
SET trading_account_id = r.account_id
FROM ranked r
WHERE bf.id = r.fee_id AND r.rn = 1;

-- Step 3: Delete rows with no match (no trading_account_id)
-- Policy: delete orphan fees; log count
DO $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM user_data.brokers_fees
    WHERE trading_account_id IS NULL;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    IF deleted_count > 0 THEN
        RAISE NOTICE 'ADR-015: Deleted % broker fee(s) with no matching trading account.', deleted_count;
    END IF;
END $$;

-- Step 4: commission_value NUMERIC(20,6) if still VARCHAR (from TEAM_10_COMMISSION_VALUE_NUMERIC_DECISIONS)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'user_data' AND table_name = 'brokers_fees'
        AND column_name = 'commission_value'
        AND data_type = 'character varying'
    ) THEN
        -- Add temp column, migrate, swap (extract number; default 0)
        ALTER TABLE user_data.brokers_fees ADD COLUMN IF NOT EXISTS commission_value_new NUMERIC(20, 6);
        UPDATE user_data.brokers_fees SET commission_value_new = COALESCE(
            NULLIF(regexp_replace(regexp_replace(commission_value::TEXT, '[^0-9.-]', '', 'g'), '^(-?[0-9]+\.?[0-9]*).*$', '\1'), '')::NUMERIC(20,6),
            0
        ) WHERE commission_value_new IS NULL;
        UPDATE user_data.brokers_fees SET commission_value_new = 0 WHERE commission_value_new IS NULL;
        ALTER TABLE user_data.brokers_fees ALTER COLUMN commission_value_new SET NOT NULL;
        ALTER TABLE user_data.brokers_fees DROP COLUMN commission_value;
        ALTER TABLE user_data.brokers_fees RENAME COLUMN commission_value_new TO commission_value;
        ALTER TABLE user_data.brokers_fees ADD CONSTRAINT brokers_fees_commission_value_check CHECK (commission_value >= 0);
        RAISE NOTICE 'ADR-015: Converted commission_value to NUMERIC(20,6).';
    END IF;
END $$;

-- Step 5: Drop broker column
ALTER TABLE user_data.brokers_fees DROP COLUMN IF EXISTS broker;

-- Step 6: NOT NULL on trading_account_id
ALTER TABLE user_data.brokers_fees ALTER COLUMN trading_account_id SET NOT NULL;

-- Step 7: Indexes
DROP INDEX IF EXISTS user_data.idx_brokers_fees_broker;
CREATE INDEX IF NOT EXISTS idx_brokers_fees_trading_account_id ON user_data.brokers_fees(trading_account_id);
CREATE INDEX IF NOT EXISTS idx_brokers_fees_account_deleted ON user_data.brokers_fees(trading_account_id, deleted_at) WHERE deleted_at IS NULL;

-- Step 8: Comments
COMMENT ON TABLE user_data.brokers_fees IS 'Fees per Trading Account (D18) - ADR-015. One-to-many: trading_account → brokers_fees.';
COMMENT ON COLUMN user_data.brokers_fees.trading_account_id IS 'FK to trading_accounts. Fees belong to account; broker derived from account.';

-- Step 9: Verification
DO $$
DECLARE
    null_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO null_count FROM user_data.brokers_fees WHERE trading_account_id IS NULL;
    IF null_count > 0 THEN
        RAISE EXCEPTION 'ADR-015 migration failed: % rows with NULL trading_account_id', null_count;
    END IF;
    RAISE NOTICE 'ADR-015 migration completed successfully.';
END $$;

COMMIT;
