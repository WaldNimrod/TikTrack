-- TikTrack Core DDL Update - GIN-2026-004 (v254.1 Fix)
-- Implementation of Hierarchical Trades, D24 and D25 components

-- 1. עדכון ישות המשתמשים (Identity D25)
ALTER TABLE users ADD COLUMN phone_numbers VARCHAR(20);
CREATE UNIQUE INDEX idx_users_phone_numbers ON users(phone_numbers);

-- 2. הוספת טוקנים ויזואליים לאסטרטגיות
ALTER TABLE strategies ADD COLUMN ui_display_configs JSONB DEFAULT '{}';

-- 3. עדכון טבלת טריידים (Hierarchical Trades & Aggregation)
ALTER TABLE trades ADD COLUMN parent_id BIGINT REFERENCES trades(internal_ids);
ALTER TABLE trades ADD COLUMN calculated_statuses VARCHAR(50) DEFAULT 'PENDING';
ALTER TABLE trades ADD COLUMN aggregated_pnl_amounts NUMERIC(20, 8) DEFAULT 0;
-- Logic: parent_id allows tree structure. aggregated_pnl stores the sum of children PnL.

-- 4. הקמת ישות מפתחות API מרובה (D24)
CREATE TABLE user_api_keys (
    internal_ids BIGSERIAL PRIMARY KEY,
    external_ulids VARCHAR(26) UNIQUE NOT NULL,
    owner_user_ids BIGINT REFERENCES users(internal_ids),
    provider_enums VARCHAR(20) NOT NULL,
    encrypted_api_keys TEXT NOT NULL,
    encrypted_secrets TEXT NOT NULL,
    is_active_flags BOOLEAN DEFAULT TRUE,
    created_at_times TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. עדכון שחזור סיסמה (D25)
CREATE TYPE delivery_method AS ENUM ('EMAIL', 'SMS');
ALTER TABLE password_reset_requests ADD COLUMN delivery_methods delivery_method DEFAULT 'EMAIL';