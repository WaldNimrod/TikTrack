-- ============================================================================
-- Add CURRENCY_CONVERSION flow_type to cash_flows
-- Team 20 (Backend)
-- Purpose: מזהה ברור להמרת מטבע — לא להשתמש ב-OTHER
-- ============================================================================

BEGIN;

-- Drop existing flow_type CHECK (try common names from model/DDL)
ALTER TABLE user_data.cash_flows DROP CONSTRAINT IF EXISTS cash_flows_flow_type_check;

-- Add new constraint with CURRENCY_CONVERSION
ALTER TABLE user_data.cash_flows
ADD CONSTRAINT cash_flows_flow_type_check
CHECK (flow_type IN (
    'DEPOSIT', 'WITHDRAWAL', 'DIVIDEND', 'INTEREST', 'FEE', 'OTHER', 'CURRENCY_CONVERSION'
));

COMMENT ON COLUMN user_data.cash_flows.flow_type IS 'Flow type. CURRENCY_CONVERSION = המרת מטבע (dedicated, not OTHER).';

COMMIT;
