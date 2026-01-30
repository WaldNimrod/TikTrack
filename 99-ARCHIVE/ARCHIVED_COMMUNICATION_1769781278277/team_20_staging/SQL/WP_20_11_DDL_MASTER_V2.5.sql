-- TikTrack Master DDL v2.5 (Lockdown Version)
-- Strategy: BIGINT Internal / ULID External
-- Terminology Alignment: phone_numbers, strategies

ALTER TABLE users ADD COLUMN phone_numbers VARCHAR(20) UNIQUE;
ALTER TABLE strategies ADD COLUMN ui_display_configs JSONB DEFAULT '{}';

-- Hierarchical Support in Database
ALTER TABLE trades ADD COLUMN parent_id BIGINT REFERENCES trades(internal_ids);
ALTER TABLE trades ADD COLUMN calculated_statuses VARCHAR(50) DEFAULT 'PENDING';
ALTER TABLE trades ADD COLUMN aggregated_pnl_amounts NUMERIC(20, 8) DEFAULT 0;

CREATE TABLE user_api_keys (
    internal_ids BIGSERIAL PRIMARY KEY,
    external_ulids VARCHAR(26) UNIQUE NOT NULL,
    owner_user_ids BIGINT REFERENCES users(internal_ids),
    encrypted_api_keys TEXT NOT NULL,
    is_active_flags BOOLEAN DEFAULT TRUE
);