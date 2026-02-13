-- P3-006: brokers_fees.minimum — NUMERIC(20,8) → NUMERIC(20,6) per PRECISION_POLICY_SSOT
-- Source: documentation/01-ARCHITECTURE/PRECISION_POLICY_SSOT.md §3.4

ALTER TABLE user_data.brokers_fees
    ALTER COLUMN minimum TYPE NUMERIC(20,6) USING minimum::NUMERIC(20,6);

COMMENT ON COLUMN user_data.brokers_fees.minimum IS 'Minimum commission per transaction. NUMERIC(20,6) per PRECISION_POLICY_SSOT.';
