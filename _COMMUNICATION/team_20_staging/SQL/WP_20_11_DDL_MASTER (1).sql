-- TikTrack Master DDL - GIN-2026-004
-- Strategy: BIGINT Internal / ULID External
ALTER TABLE users ADD COLUMN phone_numbers VARCHAR(20) UNIQUE;
ALTER TABLE trades ADD COLUMN parent_id BIGINT REFERENCES trades(internal_ids);
CREATE TABLE user_api_keys (
    internal_ids BIGSERIAL PRIMARY KEY,
    external_ulids VARCHAR(26) UNIQUE NOT NULL,
    encrypted_api_keys TEXT NOT NULL,
    is_active_flags BOOLEAN DEFAULT TRUE
);