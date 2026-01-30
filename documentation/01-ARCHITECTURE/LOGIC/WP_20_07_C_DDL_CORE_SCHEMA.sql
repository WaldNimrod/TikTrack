-- TikTrack Core Schema - WP-20.7.C Correction
-- Standard: BIGINT Internal / ULID External (Plural Standard)

CREATE TYPE user_tier AS ENUM ('Bronze', 'Silver', 'Gold', 'Platinum');

CREATE TABLE users (
    internal_ids BIGSERIAL PRIMARY KEY,
    external_ulids VARCHAR(26) UNIQUE NOT NULL,
    user_tier_levels user_tier DEFAULT 'Bronze',
    email_addresses VARCHAR(255) UNIQUE NOT NULL,
    user_profiles_data JSONB DEFAULT '{}'
);

CREATE TABLE trading_accounts (
    internal_ids BIGSERIAL PRIMARY KEY,
    external_ulids VARCHAR(26) UNIQUE NOT NULL,
    owner_user_ids BIGINT REFERENCES users(internal_ids),
    display_names VARCHAR(255) NOT NULL,
    is_active_statuses BOOLEAN DEFAULT TRUE
);

CREATE TABLE trading_accounts_balances (
    internal_ids BIGSERIAL PRIMARY KEY,
    external_ulids VARCHAR(26) UNIQUE NOT NULL,
    trading_account_ids BIGINT REFERENCES trading_accounts(internal_ids),
    currency_codes VARCHAR(3) NOT NULL,
    available_amounts NUMERIC(20, 8) DEFAULT 0,
    locked_amounts NUMERIC(20, 8) DEFAULT 0,
    opening_balance_amounts NUMERIC(20, 8) DEFAULT 0,
    PRIMARY KEY (trading_account_ids, currency_codes)
);

CREATE TABLE encrypted_credentials (
    internal_ids BIGSERIAL PRIMARY KEY,
    external_ulids VARCHAR(26) UNIQUE NOT NULL,
    trading_account_ids BIGINT REFERENCES trading_accounts(internal_ids),
    encrypted_api_keys TEXT NOT NULL,
    encrypted_secrets TEXT NOT NULL,
    key_updated_at_times TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);