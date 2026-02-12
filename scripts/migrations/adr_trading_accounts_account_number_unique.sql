-- ============================================================================
-- Migration: trading_accounts — UNIQUE (user_id, account_number)
-- Team 20 (Backend)
-- Date: 2026-02-12
-- Source: TEAM_30_TO_TEAM_20_VALIDATION_COORDINATION_REQUEST.md
--
-- Purpose: Enforce account_number uniqueness per user (D16 validation).
-- Existing: trading_accounts_unique_name on (user_id, account_name).
-- Add: UNIQUE (user_id, account_number) for non-null account_number.
--
-- Run: Team 60 per instruction
-- ============================================================================

BEGIN;

-- Pre-check: fail if duplicates exist (manual resolution required)
DO $$
DECLARE
    dup_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO dup_count
    FROM (
        SELECT user_id, TRIM(account_number) AS acc_num, COUNT(*) AS cnt
        FROM user_data.trading_accounts
        WHERE deleted_at IS NULL
          AND account_number IS NOT NULL
          AND TRIM(account_number) != ''
        GROUP BY user_id, TRIM(account_number)
        HAVING COUNT(*) > 1
    ) d;
    
    IF dup_count > 0 THEN
        RAISE EXCEPTION 'ADR_TRADING_ACCOUNTS_DUPLICATE_ACCOUNT_NUMBERS: % user(s) have duplicate account_number. Resolve manually before migration.', dup_count;
    END IF;
END $$;

-- Create unique index (partial: only non-null, non-empty account_number)
CREATE UNIQUE INDEX IF NOT EXISTS idx_trading_accounts_user_account_number_unique
    ON user_data.trading_accounts(user_id, TRIM(account_number))
    WHERE deleted_at IS NULL
      AND account_number IS NOT NULL
      AND TRIM(account_number) != '';

COMMENT ON INDEX user_data.idx_trading_accounts_user_account_number_unique IS 
    'D16: Unique account_number per user. Partial index excludes NULL/empty.';

COMMIT;
