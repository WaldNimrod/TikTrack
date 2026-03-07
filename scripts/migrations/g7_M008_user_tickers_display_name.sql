-- G7 M-008: user_data.user_tickers — ADD display_name (D33 Phase D)
-- Scope: User-customizable display name for ticker in "הטיקרים שלי"

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'user_data' AND table_name = 'user_tickers' AND column_name = 'display_name'
    ) THEN
        ALTER TABLE user_data.user_tickers
        ADD COLUMN display_name VARCHAR(100) NULL;
        COMMENT ON COLUMN user_data.user_tickers.display_name IS 'User display name for ticker (D33, max 100 chars)';
    END IF;
END $$;
