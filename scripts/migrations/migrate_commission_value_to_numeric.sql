-- ============================================================================
-- Migration: Convert commission_value from VARCHAR(255) to NUMERIC(20,6)
-- Team 60 (DevOps & Platform)
-- Date: 2026-02-10
-- Source: TEAM_10_TO_TEAMS_20_30_60_COMMISSION_VALUE_MIGRATION_GO.md
-- ============================================================================
-- 
-- Purpose:
--   Convert commission_value column from VARCHAR(255) to NUMERIC(20,6)
--   to enable precise financial calculations and comply with GIN-003.
--
-- Decisions (from Gateway):
--   1. Precision: NUMERIC(20, 6) - consistent with Phase 2 standard
--   2. Existing values: Extract number from string; default to 0 if not parseable
--   3. Units: Derived from commission_type only (no new DB field)
--   4. Backward compatibility: None - one-time migration
--
-- Execution order: 60 → 20 → 30
-- ============================================================================

BEGIN;

-- Step 1: Add temporary column for numeric values
ALTER TABLE user_data.brokers_fees
ADD COLUMN commission_value_new NUMERIC(20, 6);

-- Step 2: Extract numeric value from existing VARCHAR values
-- Strategy:
--   - Remove all non-numeric characters except decimal point and minus sign
--   - Use regexp_replace to extract first number found
--   - If extraction fails or result is NULL/empty, default to 0
UPDATE user_data.brokers_fees
SET commission_value_new = CASE
    -- Try to extract number using regex (handles formats like "0.0035 $ / Share", "$0.00", "0.1%")
    WHEN commission_value ~ '^-?[0-9]+\.?[0-9]*' THEN
        -- Extract first number found (handles leading/trailing text)
        COALESCE(
            NULLIF(
                regexp_replace(
                    regexp_replace(commission_value, '[^0-9.-]', '', 'g'),
                    '^-?([0-9]+\.?[0-9]*).*$',
                    '\1'
                ),
                ''
            )::NUMERIC(20, 6),
            0
        )
    -- If no number found, default to 0
    ELSE 0
END;

-- Step 3: Verify no NULL values (should not happen, but safety check)
UPDATE user_data.brokers_fees
SET commission_value_new = 0
WHERE commission_value_new IS NULL;

-- Step 4: Add NOT NULL constraint to new column
ALTER TABLE user_data.brokers_fees
ALTER COLUMN commission_value_new SET NOT NULL;

-- Step 5: Drop old column
ALTER TABLE user_data.brokers_fees
DROP COLUMN commission_value;

-- Step 6: Rename new column to original name
ALTER TABLE user_data.brokers_fees
RENAME COLUMN commission_value_new TO commission_value;

-- Step 7: Add CHECK constraint to ensure non-negative values (if applicable)
-- Note: Commission values can be positive (0.005, 1.00, etc.)
-- We'll add a constraint to ensure >= 0
ALTER TABLE user_data.brokers_fees
ADD CONSTRAINT brokers_fees_commission_value_check 
CHECK (commission_value >= 0);

-- Step 8: Update column comment
COMMENT ON COLUMN user_data.brokers_fees.commission_value IS 
    'Commission value as numeric (NUMERIC(20,6) for precision - per SSOT). Units derived from commission_type (TIERED = $/Share, FLAT = %)';

-- Step 9: Verify migration
DO $$
DECLARE
    row_count INTEGER;
    null_count INTEGER;
    negative_count INTEGER;
BEGIN
    -- Count total rows
    SELECT COUNT(*) INTO row_count FROM user_data.brokers_fees;
    
    -- Count NULL values (should be 0)
    SELECT COUNT(*) INTO null_count 
    FROM user_data.brokers_fees 
    WHERE commission_value IS NULL;
    
    -- Count negative values (should be 0)
    SELECT COUNT(*) INTO negative_count 
    FROM user_data.brokers_fees 
    WHERE commission_value < 0;
    
    -- Report
    RAISE NOTICE 'Migration verification:';
    RAISE NOTICE '  Total rows: %', row_count;
    RAISE NOTICE '  NULL values: % (expected: 0)', null_count;
    RAISE NOTICE '  Negative values: % (expected: 0)', negative_count;
    
    -- Assertions
    IF null_count > 0 THEN
        RAISE EXCEPTION 'Migration failed: Found % NULL values in commission_value', null_count;
    END IF;
    
    IF negative_count > 0 THEN
        RAISE EXCEPTION 'Migration failed: Found % negative values in commission_value', negative_count;
    END IF;
    
    RAISE NOTICE 'Migration completed successfully!';
END $$;

COMMIT;

-- ============================================================================
-- Migration Complete
-- ============================================================================
-- 
-- Next steps:
--   1. Team 20: Update Model & Schema (Numeric(20,6) / Decimal)
--   2. Team 30: Update Frontend forms and display
--   3. Team 50: E2E testing
-- ============================================================================
