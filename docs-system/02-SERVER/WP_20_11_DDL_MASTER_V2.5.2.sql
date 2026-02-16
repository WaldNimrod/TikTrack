-- TikTrack Master DDL v2.5.2 (Lockdown)
-- Strategy: BIGINT Internal / ULID External
-- Terminology Alignment: SQL = API = Code (Plural Only)

CREATE TYPE user_tier AS ENUM ('Bronze', 'Silver', 'Gold', 'Platinum');

CREATE TABLE users (
    internal_ids BIGSERIAL PRIMARY KEY,
    external_ulids VARCHAR(26) UNIQUE NOT NULL,
    phone_numbers VARCHAR(20) UNIQUE NOT NULL,
    user_tier_levels user_tier DEFAULT 'Bronze',
    ui_display_configs JSONB DEFAULT '{}'
);

CREATE TABLE trades (
    internal_ids BIGSERIAL PRIMARY KEY,
    external_ulids VARCHAR(26) UNIQUE NOT NULL,
    parent_id BIGINT REFERENCES trades(internal_ids),
    calculated_statuses VARCHAR(50) DEFAULT 'PENDING',
    aggregated_pnl_amounts NUMERIC(20, 8) DEFAULT 0
);

CREATE TABLE user_api_keys (
    internal_ids BIGSERIAL PRIMARY KEY,
    external_ulids VARCHAR(26) UNIQUE NOT NULL,
    owner_user_ids BIGINT REFERENCES users(internal_ids),
    encrypted_api_keys TEXT NOT NULL,
    is_active_flags BOOLEAN DEFAULT TRUE
);