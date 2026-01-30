-- ============================================================================
-- TikTrack Phoenix V2.5 - Full Database Schema (DDL)
-- ============================================================================
-- Date: 2026-01-26
-- Version: 2.5 (Post GIN-004)
-- Total Tables: 48 (11 market_data + 37 user_data)
-- Materialized Views: 2
-- ENUMs: 17
-- Functions: 12
-- Triggers: 9
-- 
-- Changes in V2.5:
-- - Added: user_data.user_api_keys (multi-provider API keys)
-- - Added: user_data.password_reset_requests (SMS recovery)
-- - Added: trades.calculated_status (aggregated parent status)
-- - Added: strategies.ui_display_config (design tokens)
-- - Added: users.phone_number (phone identity)
-- ============================================================================

-- ============================================================================
-- SECTION 1: EXTENSIONS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";       -- UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";        -- Encryption functions
CREATE EXTENSION IF NOT EXISTS "pg_trgm";         -- Trigram text search
CREATE EXTENSION IF NOT EXISTS "btree_gin";       -- GIN indexes for btree types

-- ============================================================================
-- SECTION 2: SCHEMAS
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS market_data;
COMMENT ON SCHEMA market_data IS 'Public market data (tickers, prices, exchanges)';

CREATE SCHEMA IF NOT EXISTS user_data;
COMMENT ON SCHEMA user_data IS 'User-specific trading data';

-- ============================================================================
-- SECTION 3: CUSTOM TYPES (ENUMs)
-- ============================================================================

-- Market Data Types
CREATE TYPE market_data.exchange_status AS ENUM ('ACTIVE', 'INACTIVE', 'DELISTED');
CREATE TYPE market_data.ticker_type AS ENUM ('STOCK', 'ETF', 'OPTION', 'FUTURE', 'FOREX', 'CRYPTO', 'INDEX');
CREATE TYPE market_data.data_provider AS ENUM ('IBKR', 'POLYGON', 'YAHOO_FINANCE', 'ALPHA_VANTAGE', 'FINNHUB');

-- User Data Types
CREATE TYPE user_data.user_role AS ENUM ('USER', 'ADMIN', 'SUPERADMIN');
CREATE TYPE user_data.trade_status AS ENUM ('DRAFT', 'PLANNED', 'ACTIVE', 'CLOSED', 'CANCELLED');
CREATE TYPE user_data.calculated_trade_status AS ENUM ('OPEN', 'PARTIAL', 'CLOSED', 'CANCELLED', 'MIXED_CLOSE');
CREATE TYPE user_data.trade_direction AS ENUM ('LONG', 'SHORT');
CREATE TYPE user_data.order_type AS ENUM ('MARKET', 'LIMIT', 'STOP', 'STOP_LIMIT', 'TRAILING_STOP');
CREATE TYPE user_data.execution_side AS ENUM ('BUY', 'SELL');
CREATE TYPE user_data.alert_type AS ENUM ('PRICE', 'VOLUME', 'TECHNICAL', 'NEWS', 'CUSTOM');
CREATE TYPE user_data.alert_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE user_data.note_category AS ENUM ('TRADE', 'PSYCHOLOGY', 'ANALYSIS', 'GENERAL');
CREATE TYPE user_data.strategy_type AS ENUM ('MEAN_REVERSION', 'BREAKOUT', 'TREND_FOLLOWING', 'SCALPING', 'SWING', 'CUSTOM');
CREATE TYPE user_data.api_provider AS ENUM ('IBKR', 'POLYGON', 'YAHOO_FINANCE', 'ALPHA_VANTAGE', 'FINNHUB', 'TWELVE_DATA', 'IEX_CLOUD', 'CUSTOM');
CREATE TYPE user_data.reset_method AS ENUM ('EMAIL', 'SMS');

-- ============================================================================
-- SECTION 4: MARKET_DATA SCHEMA (11 tables + 2 materialized views)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Table: market_data.exchanges
-- ----------------------------------------------------------------------------
CREATE TABLE market_data.exchanges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exchange_code VARCHAR(10) NOT NULL UNIQUE,
    exchange_name VARCHAR(100) NOT NULL,
    country VARCHAR(3) NOT NULL,
    timezone VARCHAR(50) NOT NULL,
    open_time TIME,
    close_time TIME,
    status market_data.exchange_status NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::JSONB
);

CREATE INDEX idx_exchanges_code ON market_data.exchanges(exchange_code);
CREATE INDEX idx_exchanges_status ON market_data.exchanges(status) WHERE status = 'ACTIVE';

COMMENT ON TABLE market_data.exchanges IS 'Stock exchanges (NASDAQ, NYSE, etc.)';

-- ----------------------------------------------------------------------------
-- Table: market_data.sectors
-- ----------------------------------------------------------------------------
CREATE TABLE market_data.sectors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sector_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    sort_order INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sectors_name ON market_data.sectors(sector_name);

COMMENT ON TABLE market_data.sectors IS 'Market sectors (Technology, Healthcare, etc.)';

-- ----------------------------------------------------------------------------
-- Table: market_data.industries
-- ----------------------------------------------------------------------------
CREATE TABLE market_data.industries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    industry_name VARCHAR(150) NOT NULL UNIQUE,
    sector_id UUID REFERENCES market_data.sectors(id) ON DELETE SET NULL,
    description TEXT,
    sort_order INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_industries_name ON market_data.industries(industry_name);
CREATE INDEX idx_industries_sector ON market_data.industries(sector_id);

COMMENT ON TABLE market_data.industries IS 'Market industries within sectors';

-- ----------------------------------------------------------------------------
-- Table: market_data.market_cap_groups
-- ----------------------------------------------------------------------------
CREATE TABLE market_data.market_cap_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_name VARCHAR(50) NOT NULL UNIQUE,
    min_market_cap NUMERIC(20, 2),
    max_market_cap NUMERIC(20, 2),
    description TEXT,
    sort_order INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_market_cap_groups_name ON market_data.market_cap_groups(group_name);

COMMENT ON TABLE market_data.market_cap_groups IS 'Market cap categories (Mega, Large, Mid, Small)';

-- ----------------------------------------------------------------------------
-- Table: market_data.tickers
-- ----------------------------------------------------------------------------
CREATE TABLE market_data.tickers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    symbol VARCHAR(20) NOT NULL,
    exchange_id UUID REFERENCES market_data.exchanges(id) ON DELETE SET NULL,
    company_name VARCHAR(255),
    ticker_type market_data.ticker_type NOT NULL DEFAULT 'STOCK',
    
    -- Static Metadata (NOT dynamic market data!)
    sector_id UUID REFERENCES market_data.sectors(id) ON DELETE SET NULL,
    industry_id UUID REFERENCES market_data.industries(id) ON DELETE SET NULL,
    market_cap_group_id UUID REFERENCES market_data.market_cap_groups(id) ON DELETE SET NULL,
    
    -- Identifiers
    cusip VARCHAR(9),
    isin VARCHAR(12),
    figi VARCHAR(12),
    
    -- Status
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    delisted_date DATE,
    
    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::JSONB,
    
    -- Constraints
    CONSTRAINT tickers_symbol_exchange_unique UNIQUE (symbol, exchange_id) WHERE deleted_at IS NULL
);

CREATE INDEX idx_tickers_symbol ON market_data.tickers(symbol) WHERE deleted_at IS NULL;
CREATE INDEX idx_tickers_exchange ON market_data.tickers(exchange_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_tickers_sector ON market_data.tickers(sector_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_tickers_industry ON market_data.tickers(industry_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_tickers_type ON market_data.tickers(ticker_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_tickers_active ON market_data.tickers(is_active) WHERE is_active = TRUE;

COMMENT ON TABLE market_data.tickers IS 'Static ticker metadata (NOT prices/quotes)';

-- ----------------------------------------------------------------------------
-- Table: market_data.external_data_providers
-- ----------------------------------------------------------------------------
CREATE TABLE market_data.external_data_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_name market_data.data_provider NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    priority INTEGER NOT NULL DEFAULT 100,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- Health
    health_check_url TEXT,
    last_health_check_at TIMESTAMPTZ,
    is_healthy BOOLEAN NOT NULL DEFAULT TRUE,
    consecutive_failures INTEGER DEFAULT 0,
    
    -- Rate Limiting
    rate_limit_per_minute INTEGER,
    rate_limit_per_day INTEGER,
    
    -- Configuration
    config JSONB DEFAULT '{}'::JSONB,
    
    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT external_data_providers_unique_name UNIQUE (provider_name)
);

CREATE INDEX idx_external_data_providers_active 
    ON market_data.external_data_providers(is_active, priority) 
    WHERE is_active = TRUE;

COMMENT ON TABLE market_data.external_data_providers IS 'External market data provider configurations';

-- ----------------------------------------------------------------------------
-- Table: market_data.ticker_prices
-- ----------------------------------------------------------------------------
CREATE TABLE market_data.ticker_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticker_id UUID NOT NULL REFERENCES market_data.tickers(id) ON DELETE CASCADE,
    provider_id UUID REFERENCES market_data.external_data_providers(id) ON DELETE SET NULL,
    
    -- Price Data
    price NUMERIC(20, 8) NOT NULL,
    open_price NUMERIC(20, 8),
    high_price NUMERIC(20, 8),
    low_price NUMERIC(20, 8),
    close_price NUMERIC(20, 8),
    volume BIGINT,
    
    -- Timestamps
    price_timestamp TIMESTAMPTZ NOT NULL,
    fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Staleness Tracking
    is_stale BOOLEAN NOT NULL DEFAULT FALSE,
    staleness_minutes INTEGER GENERATED ALWAYS AS (
        EXTRACT(EPOCH FROM (NOW() - price_timestamp)) / 60
    ) STORED,
    
    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT ticker_prices_positive_price CHECK (price > 0)
) PARTITION BY RANGE (price_timestamp);

-- Partition by month (create for last 3 years + next year)
-- Example partitions (Team 20 to create full set)
CREATE TABLE market_data.ticker_prices_2024_01 PARTITION OF market_data.ticker_prices
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

CREATE INDEX idx_ticker_prices_ticker_time 
    ON market_data.ticker_prices(ticker_id, price_timestamp DESC);
    
CREATE INDEX idx_ticker_prices_timestamp 
    ON market_data.ticker_prices(price_timestamp DESC);
    
CREATE INDEX idx_ticker_prices_stale 
    ON market_data.ticker_prices(is_stale) WHERE is_stale = TRUE;

COMMENT ON TABLE market_data.ticker_prices IS 'Historical ticker prices (partitioned by month)';

-- ----------------------------------------------------------------------------
-- Table: market_data.data_refresh_logs
-- ----------------------------------------------------------------------------
CREATE TABLE market_data.data_refresh_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID REFERENCES market_data.external_data_providers(id) ON DELETE SET NULL,
    
    -- Refresh Details
    refresh_type VARCHAR(50) NOT NULL,
    tickers_requested INTEGER NOT NULL DEFAULT 0,
    tickers_fetched INTEGER NOT NULL DEFAULT 0,
    
    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' 
        CHECK (status IN ('PENDING', 'SUCCESS', 'PARTIAL', 'FAILED')),
    
    -- Error Tracking
    error_message TEXT,
    error_count INTEGER DEFAULT 0,
    
    -- Timing
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    duration_ms INTEGER GENERATED ALWAYS AS (
        EXTRACT(EPOCH FROM (completed_at - started_at)) * 1000
    ) STORED,
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::JSONB
);

CREATE INDEX idx_data_refresh_logs_provider 
    ON market_data.data_refresh_logs(provider_id, started_at DESC);
    
CREATE INDEX idx_data_refresh_logs_status 
    ON market_data.data_refresh_logs(status, started_at DESC);

COMMENT ON TABLE market_data.data_refresh_logs IS 'Market data refresh audit trail';

-- ----------------------------------------------------------------------------
-- Table: market_data.intraday_data_slots
-- ----------------------------------------------------------------------------
CREATE TABLE market_data.intraday_data_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticker_id UUID NOT NULL REFERENCES market_data.tickers(id) ON DELETE CASCADE,
    
    -- Slot (5-minute intervals)
    slot_date DATE NOT NULL,
    slot_time TIME NOT NULL,
    
    -- OHLCV
    open_price NUMERIC(20, 8) NOT NULL,
    high_price NUMERIC(20, 8) NOT NULL,
    low_price NUMERIC(20, 8) NOT NULL,
    close_price NUMERIC(20, 8) NOT NULL,
    volume BIGINT NOT NULL DEFAULT 0,
    
    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT intraday_data_slots_unique_slot 
        UNIQUE (ticker_id, slot_date, slot_time)
) PARTITION BY RANGE (slot_date);

-- Example partition
CREATE TABLE market_data.intraday_data_slots_2024_01 
    PARTITION OF market_data.intraday_data_slots
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

CREATE INDEX idx_intraday_data_slots_ticker_date 
    ON market_data.intraday_data_slots(ticker_id, slot_date DESC, slot_time DESC);

COMMENT ON TABLE market_data.intraday_data_slots IS '5-minute intraday OHLCV data (partitioned by month)';

-- ----------------------------------------------------------------------------
-- Table: market_data.system_trading_calendar
-- ----------------------------------------------------------------------------
CREATE TABLE market_data.system_trading_calendar (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exchange_id UUID NOT NULL REFERENCES market_data.exchanges(id) ON DELETE CASCADE,
    
    -- Date
    calendar_date DATE NOT NULL,
    is_trading_day BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- Trading Hours
    market_open TIME,
    market_close TIME,
    
    -- Timezone
    timezone_offset_minutes INTEGER,
    
    -- Special Days
    is_early_close BOOLEAN NOT NULL DEFAULT FALSE,
    is_holiday BOOLEAN NOT NULL DEFAULT FALSE,
    holiday_name VARCHAR(100),
    
    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT system_trading_calendar_unique_date 
        UNIQUE (exchange_id, calendar_date)
);

CREATE INDEX idx_trading_calendar_exchange_date 
    ON market_data.system_trading_calendar(exchange_id, calendar_date DESC);
    
CREATE INDEX idx_trading_calendar_trading_days 
    ON market_data.system_trading_calendar(calendar_date DESC) 
    WHERE is_trading_day = TRUE;

COMMENT ON TABLE market_data.system_trading_calendar IS 'Exchange trading calendar (holidays, early closes)';

-- ----------------------------------------------------------------------------
-- Materialized View: market_data.quotes_last
-- ----------------------------------------------------------------------------
CREATE MATERIALIZED VIEW market_data.quotes_last AS
SELECT DISTINCT ON (tp.ticker_id)
    tp.ticker_id,
    tp.price AS last_price,
    tp.price_timestamp AS last_price_timestamp,
    tp.volume AS last_volume,
    tp.is_stale,
    tp.staleness_minutes,
    tp.provider_id,
    t.symbol,
    t.company_name
FROM market_data.ticker_prices tp
INNER JOIN market_data.tickers t ON tp.ticker_id = t.id
WHERE t.deleted_at IS NULL
ORDER BY tp.ticker_id, tp.price_timestamp DESC;

CREATE UNIQUE INDEX idx_quotes_last_ticker 
    ON market_data.quotes_last(ticker_id);
    
CREATE INDEX idx_quotes_last_symbol 
    ON market_data.quotes_last(symbol);

COMMENT ON MATERIALIZED VIEW market_data.quotes_last IS 'Latest price per ticker (refresh every 5 min)';

-- ----------------------------------------------------------------------------
-- Materialized View: market_data.latest_ticker_prices
-- ----------------------------------------------------------------------------
CREATE MATERIALIZED VIEW market_data.latest_ticker_prices AS
SELECT 
    t.id AS ticker_id,
    t.symbol,
    t.company_name,
    tp.price AS current_price,
    tp.open_price,
    tp.high_price,
    tp.low_price,
    tp.close_price,
    tp.volume,
    tp.price_timestamp,
    tp.is_stale,
    tp.staleness_minutes
FROM market_data.tickers t
LEFT JOIN LATERAL (
    SELECT *
    FROM market_data.ticker_prices
    WHERE ticker_id = t.id
    ORDER BY price_timestamp DESC
    LIMIT 1
) tp ON TRUE
WHERE t.deleted_at IS NULL;

CREATE UNIQUE INDEX idx_latest_ticker_prices_ticker 
    ON market_data.latest_ticker_prices(ticker_id);
    
CREATE INDEX idx_latest_ticker_prices_symbol 
    ON market_data.latest_ticker_prices(symbol);

COMMENT ON MATERIALIZED VIEW market_data.latest_ticker_prices IS 'Latest price per ticker with full OHLCV (refresh every 5 min)';

-- ============================================================================
-- SECTION 5: USER_DATA SCHEMA (37 tables)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Table: user_data.users
-- ----------------------------------------------------------------------------
CREATE TABLE user_data.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Identity
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    
    -- Phone Identity (NEW in V2.5)
    phone_number VARCHAR(20),
    phone_verified BOOLEAN NOT NULL DEFAULT FALSE,
    phone_verified_at TIMESTAMPTZ,
    
    -- Profile
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    display_name VARCHAR(100),
    
    -- Settings
    role user_data.user_role NOT NULL DEFAULT 'USER',
    timezone VARCHAR(50) NOT NULL DEFAULT 'UTC',
    language VARCHAR(5) NOT NULL DEFAULT 'en',
    
    -- Status
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    email_verified_at TIMESTAMPTZ,
    
    -- Security
    last_login_at TIMESTAMPTZ,
    last_login_ip VARCHAR(45),
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMPTZ,
    
    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::JSONB,
    
    -- Constraints
    CONSTRAINT users_phone_format CHECK (
        phone_number IS NULL 
        OR phone_number ~ '^\+?[1-9]\d{1,14}$'
    )
);

CREATE INDEX idx_users_email ON user_data.users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_username ON user_data.users(username) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_role ON user_data.users(role) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX idx_users_phone_unique 
    ON user_data.users(phone_number) 
    WHERE phone_number IS NOT NULL AND deleted_at IS NULL;
CREATE INDEX idx_users_phone 
    ON user_data.users(phone_number) 
    WHERE deleted_at IS NULL;

COMMENT ON TABLE user_data.users IS 'System users';

-- ----------------------------------------------------------------------------
-- Table: user_data.password_reset_requests (NEW in V2.5)
-- ----------------------------------------------------------------------------
CREATE TABLE user_data.password_reset_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_data.users(id) ON DELETE CASCADE,
    
    -- Method
    method user_data.reset_method NOT NULL,
    sent_to VARCHAR(255) NOT NULL,
    
    -- Token (for email)
    reset_token VARCHAR(64) NOT NULL UNIQUE,
    token_expires_at TIMESTAMPTZ NOT NULL,
    
    -- Code (for SMS)
    verification_code VARCHAR(6),
    code_expires_at TIMESTAMPTZ,
    attempts_count INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    
    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
        CHECK (status IN ('PENDING', 'USED', 'EXPIRED', 'REVOKED')),
    
    -- Usage
    used_at TIMESTAMPTZ,
    used_from_ip VARCHAR(45),
    
    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT password_reset_token_length 
        CHECK (LENGTH(reset_token) >= 32),
    CONSTRAINT password_reset_code_length 
        CHECK (
            verification_code IS NULL 
            OR LENGTH(verification_code) = 6
        ),
    CONSTRAINT password_reset_attempts_limit 
        CHECK (attempts_count <= max_attempts)
);

CREATE UNIQUE INDEX idx_password_reset_token 
    ON user_data.password_reset_requests(reset_token) 
    WHERE status = 'PENDING';
    
CREATE INDEX idx_password_reset_user_id 
    ON user_data.password_reset_requests(user_id, created_at DESC);
    
CREATE INDEX idx_password_reset_expired 
    ON user_data.password_reset_requests(token_expires_at) 
    WHERE status = 'PENDING';
    
CREATE INDEX idx_password_reset_method 
    ON user_data.password_reset_requests(method, status);

COMMENT ON TABLE user_data.password_reset_requests IS 'Password recovery (email + SMS)';

-- ----------------------------------------------------------------------------
-- Table: user_data.trading_accounts
-- ----------------------------------------------------------------------------
CREATE TABLE user_data.trading_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_data.users(id) ON DELETE CASCADE,
    
    -- Account Details
    account_name VARCHAR(100) NOT NULL,
    broker VARCHAR(100),
    account_number VARCHAR(50),
    
    -- External Integration
    external_account_id VARCHAR(100),
    last_sync_at TIMESTAMPTZ,
    
    -- Balances
    initial_balance NUMERIC(20, 6) NOT NULL,
    cash_balance NUMERIC(20, 6) NOT NULL DEFAULT 0,
    total_deposits NUMERIC(20, 6) NOT NULL DEFAULT 0,
    total_withdrawals NUMERIC(20, 6) NOT NULL DEFAULT 0,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    
    -- Status
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- Audit
    created_by UUID NOT NULL REFERENCES user_data.users(id),
    updated_by UUID NOT NULL REFERENCES user_data.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    version INTEGER NOT NULL DEFAULT 1,
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::JSONB,
    
    CONSTRAINT trading_accounts_unique_name 
        UNIQUE (user_id, account_name) WHERE deleted_at IS NULL
);

CREATE INDEX idx_trading_accounts_user 
    ON user_data.trading_accounts(user_id, created_at DESC) 
    WHERE deleted_at IS NULL;
    
CREATE INDEX idx_trading_accounts_active 
    ON user_data.trading_accounts(is_active) 
    WHERE is_active = TRUE AND deleted_at IS NULL;

COMMENT ON TABLE user_data.trading_accounts IS 'User trading accounts';

-- ----------------------------------------------------------------------------
-- Table: user_data.strategies (NEW in V2.4)
-- ----------------------------------------------------------------------------
CREATE TABLE user_data.strategies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_data.users(id) ON DELETE CASCADE,
    
    -- Identity
    name VARCHAR(200) NOT NULL,
    description TEXT,
    thesis TEXT,
    strategy_type user_data.strategy_type NOT NULL DEFAULT 'CUSTOM',
    
    -- Rules
    rules_json JSONB NOT NULL DEFAULT '{}'::JSONB,
    ai_context_anchor TEXT,
    
    -- Versioning (NEW in V2.4 - GIN-003)
    version_id INTEGER NOT NULL DEFAULT 1,
    parent_strategy_id UUID REFERENCES user_data.strategies(id) ON DELETE SET NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    superseded_by UUID REFERENCES user_data.strategies(id) ON DELETE SET NULL,
    superseded_at TIMESTAMPTZ,
    
    -- UI Configuration (NEW in V2.5 - GIN-004)
    ui_display_config JSONB NOT NULL DEFAULT '{}'::JSONB,
    
    -- Targets
    target_accounts JSONB DEFAULT '[]'::JSONB,
    
    -- Risk Management
    max_position_size NUMERIC(20, 6),
    max_loss_per_trade NUMERIC(20, 6),
    max_trades_per_day INTEGER,
    
    -- Performance
    total_trades INTEGER DEFAULT 0,
    winning_trades INTEGER DEFAULT 0,
    total_pl NUMERIC(20, 6) DEFAULT 0,
    
    -- Audit
    created_by UUID NOT NULL REFERENCES user_data.users(id),
    updated_by UUID NOT NULL REFERENCES user_data.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    version INTEGER NOT NULL DEFAULT 1,
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::JSONB,
    tags VARCHAR(255)[],
    
    -- Constraints
    CONSTRAINT strategies_unique_name_per_user 
        UNIQUE (user_id, name) WHERE deleted_at IS NULL,
    CONSTRAINT strategies_has_content 
        CHECK ((name IS NOT NULL AND name != '') OR (description IS NOT NULL AND description != '')),
    CONSTRAINT strategies_rules_structure 
        CHECK (jsonb_typeof(rules_json) = 'object'),
    CONSTRAINT strategies_target_accounts_array 
        CHECK (jsonb_typeof(target_accounts) = 'array'),
    CONSTRAINT strategies_performance_logic 
        CHECK (total_trades >= 0 AND winning_trades >= 0 AND winning_trades <= total_trades),
    CONSTRAINT strategies_version_positive 
        CHECK (version_id > 0),
    CONSTRAINT strategies_superseded_logic 
        CHECK (
            (is_active = TRUE AND superseded_by IS NULL AND superseded_at IS NULL)
            OR
            (is_active = FALSE AND superseded_by IS NOT NULL AND superseded_at IS NOT NULL)
        ),
    CONSTRAINT strategies_ui_config_is_object 
        CHECK (jsonb_typeof(ui_display_config) = 'object')
);

CREATE INDEX idx_strategies_user 
    ON user_data.strategies(user_id, created_at DESC) 
    WHERE deleted_at IS NULL;
    
CREATE INDEX idx_strategies_type 
    ON user_data.strategies(strategy_type) 
    WHERE deleted_at IS NULL;
    
CREATE INDEX idx_strategies_active 
    ON user_data.strategies(is_active) 
    WHERE is_active = TRUE AND deleted_at IS NULL;
    
CREATE INDEX idx_strategies_name_trgm 
    ON user_data.strategies USING gin(name gin_trgm_ops) 
    WHERE deleted_at IS NULL;
    
CREATE INDEX idx_strategies_rules 
    ON user_data.strategies USING gin(rules_json jsonb_path_ops);
    
CREATE INDEX idx_strategies_ui_config 
    ON user_data.strategies USING gin(ui_display_config jsonb_path_ops);

COMMENT ON TABLE user_data.strategies IS 'Trading strategies with versioning and UI config';

-- ----------------------------------------------------------------------------
-- Table: user_data.trade_plans
-- ----------------------------------------------------------------------------
CREATE TABLE user_data.trade_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_data.users(id) ON DELETE CASCADE,
    ticker_id UUID NOT NULL REFERENCES market_data.tickers(id) ON DELETE RESTRICT,
    trading_account_id UUID REFERENCES user_data.trading_accounts(id) ON DELETE SET NULL,
    strategy_id UUID REFERENCES user_data.strategies(id) ON DELETE SET NULL,
    
    -- Plan Details
    plan_name VARCHAR(200),
    thesis TEXT,
    direction user_data.trade_direction NOT NULL,
    
    -- Entry
    planned_entry_price NUMERIC(20, 8),
    planned_quantity NUMERIC(20, 8),
    
    -- Exit
    planned_stop_loss NUMERIC(20, 8),
    planned_take_profit NUMERIC(20, 8),
    
    -- Risk
    planned_risk_amount NUMERIC(20, 6),
    planned_reward_amount NUMERIC(20, 6),
    risk_reward_ratio NUMERIC(10, 2),
    
    -- Status
    status user_data.trade_status NOT NULL DEFAULT 'DRAFT',
    
    -- Dates
    planned_entry_date DATE,
    activated_at TIMESTAMPTZ,
    
    -- Audit
    created_by UUID NOT NULL REFERENCES user_data.users(id),
    updated_by UUID NOT NULL REFERENCES user_data.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    version INTEGER NOT NULL DEFAULT 1,
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::JSONB,
    tags VARCHAR(255)[]
);

CREATE INDEX idx_trade_plans_user 
    ON user_data.trade_plans(user_id, created_at DESC) 
    WHERE deleted_at IS NULL;
    
CREATE INDEX idx_trade_plans_ticker 
    ON user_data.trade_plans(ticker_id) 
    WHERE deleted_at IS NULL;
    
CREATE INDEX idx_trade_plans_status 
    ON user_data.trade_plans(status) 
    WHERE deleted_at IS NULL;
    
CREATE INDEX idx_trade_plans_strategy 
    ON user_data.trade_plans(strategy_id) 
    WHERE deleted_at IS NULL;

COMMENT ON TABLE user_data.trade_plans IS 'Trade plans (pre-trade analysis)';

-- ----------------------------------------------------------------------------
-- Table: user_data.trades
-- ----------------------------------------------------------------------------
CREATE TABLE user_data.trades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_data.users(id) ON DELETE CASCADE,
    ticker_id UUID NOT NULL REFERENCES market_data.tickers(id) ON DELETE RESTRICT,
    trading_account_id UUID NOT NULL REFERENCES user_data.trading_accounts(id) ON DELETE RESTRICT,
    
    -- Hierarchy (NEW in V2.4 - GIN-002)
    parent_trade_id UUID REFERENCES user_data.trades(id) ON DELETE SET NULL,
    
    -- Strategy & Plan (NEW in V2.4 - GIN-002)
    strategy_id UUID REFERENCES user_data.strategies(id) ON DELETE SET NULL,
    origin_plan_id UUID REFERENCES user_data.trade_plans(id) ON DELETE SET NULL,
    
    -- Alert Link (NEW in V2.4 - GIN-002)
    trigger_alert_id UUID REFERENCES user_data.alerts(id) ON DELETE SET NULL,
    
    -- Trade Details
    direction user_data.trade_direction NOT NULL,
    
    -- Quantity & Price
    quantity NUMERIC(20, 8) NOT NULL,
    avg_entry_price NUMERIC(20, 8),
    avg_exit_price NUMERIC(20, 8),
    
    -- Stop Loss & Take Profit
    stop_loss NUMERIC(20, 8),
    take_profit NUMERIC(20, 8),
    
    -- P&L
    realized_pl NUMERIC(20, 6) DEFAULT 0,
    unrealized_pl NUMERIC(20, 6) DEFAULT 0,
    total_pl NUMERIC(20, 6) GENERATED ALWAYS AS (realized_pl + unrealized_pl) STORED,
    
    -- Fees
    commission NUMERIC(20, 6) DEFAULT 0,
    fees NUMERIC(20, 6) DEFAULT 0,
    
    -- Status
    status user_data.trade_status NOT NULL DEFAULT 'DRAFT',
    calculated_status user_data.calculated_trade_status,
    
    -- Dates
    entry_date TIMESTAMPTZ,
    exit_date TIMESTAMPTZ,
    
    -- Audit
    created_by UUID NOT NULL REFERENCES user_data.users(id),
    updated_by UUID NOT NULL REFERENCES user_data.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    version INTEGER NOT NULL DEFAULT 1,
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::JSONB,
    tags VARCHAR(255)[],
    
    -- Constraints
    CONSTRAINT trades_positive_quantity CHECK (quantity > 0),
    CONSTRAINT trades_not_self_parent CHECK (parent_trade_id IS NULL OR parent_trade_id != id)
);

CREATE INDEX idx_trades_user 
    ON user_data.trades(user_id, created_at DESC) 
    WHERE deleted_at IS NULL;
    
CREATE INDEX idx_trades_ticker 
    ON user_data.trades(ticker_id) 
    WHERE deleted_at IS NULL;
    
CREATE INDEX idx_trades_account 
    ON user_data.trades(trading_account_id) 
    WHERE deleted_at IS NULL;
    
CREATE INDEX idx_trades_status 
    ON user_data.trades(status) 
    WHERE deleted_at IS NULL;
    
CREATE INDEX idx_trades_parent 
    ON user_data.trades(parent_trade_id) 
    WHERE parent_trade_id IS NOT NULL AND deleted_at IS NULL;
    
CREATE INDEX idx_trades_strategy 
    ON user_data.trades(strategy_id) 
    WHERE deleted_at IS NULL;
    
CREATE INDEX idx_trades_plan 
    ON user_data.trades(origin_plan_id) 
    WHERE deleted_at IS NULL;

COMMENT ON TABLE user_data.trades IS 'Active trades with hierarchy and strategy links';

-- ----------------------------------------------------------------------------
-- Table: user_data.executions
-- ----------------------------------------------------------------------------
CREATE TABLE user_data.executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_data.users(id) ON DELETE CASCADE,
    trade_id UUID NOT NULL REFERENCES user_data.trades(id) ON DELETE CASCADE,
    ticker_id UUID NOT NULL REFERENCES market_data.tickers(id) ON DELETE RESTRICT,
    trading_account_id UUID NOT NULL REFERENCES user_data.trading_accounts(id) ON DELETE RESTRICT,
    
    -- Execution Details
    side user_data.execution_side NOT NULL,
    quantity NUMERIC(20, 8) NOT NULL,
    price NUMERIC(20, 8) NOT NULL,
    
    -- Order
    order_type user_data.order_type,
    
    -- Broker Integration
    broker_execution_id VARCHAR(100) UNIQUE,
    external_order_id VARCHAR(100),
    
    -- Fees
    commission NUMERIC(20, 6) DEFAULT 0,
    fees NUMERIC(20, 6) DEFAULT 0,
    
    -- Currency (NEW in V2.4 - GIN-003)
    original_currency VARCHAR(3),
    original_currency_rate NUMERIC(20, 10),
    base_currency VARCHAR(3),
    
    -- Manual Override (NEW in V2.4 - GIN-003)
    manual_override_flag BOOLEAN DEFAULT FALSE,
    manual_override_reason TEXT,
    manual_override_by UUID REFERENCES user_data.users(id),
    manual_override_at TIMESTAMPTZ,
    
    -- Timezone (NEW in V2.4 - GIN-003)
    execution_time TIMESTAMPTZ NOT NULL,
    execution_time_utc TIMESTAMPTZ,
    execution_time_local TIME,
    exchange_timezone VARCHAR(50),
    timezone_offset_minutes INTEGER,
    
    -- Audit
    created_by UUID NOT NULL REFERENCES user_data.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::JSONB,
    
    CONSTRAINT executions_positive_quantity CHECK (quantity > 0),
    CONSTRAINT executions_positive_price CHECK (price > 0)
);

CREATE UNIQUE INDEX idx_executions_broker_id 
    ON user_data.executions(broker_execution_id) 
    WHERE broker_execution_id IS NOT NULL;
    
CREATE INDEX idx_executions_trade 
    ON user_data.executions(trade_id, execution_time DESC);
    
CREATE INDEX idx_executions_user 
    ON user_data.executions(user_id, execution_time DESC);
    
CREATE INDEX idx_executions_ticker 
    ON user_data.executions(ticker_id, execution_time DESC);

COMMENT ON TABLE user_data.executions IS 'Individual trade executions (fills)';

-- ----------------------------------------------------------------------------
-- Table: user_data.cash_flows
-- ----------------------------------------------------------------------------
CREATE TABLE user_data.cash_flows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_data.users(id) ON DELETE CASCADE,
    trading_account_id UUID NOT NULL REFERENCES user_data.trading_accounts(id) ON DELETE CASCADE,
    
    -- Type
    flow_type VARCHAR(20) NOT NULL CHECK (flow_type IN ('DEPOSIT', 'WITHDRAWAL', 'DIVIDEND', 'INTEREST', 'FEE', 'OTHER')),
    
    -- Amount
    amount NUMERIC(20, 6) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    
    -- Details
    description TEXT,
    transaction_date DATE NOT NULL,
    
    -- External
    external_reference VARCHAR(100),
    
    -- Audit
    created_by UUID NOT NULL REFERENCES user_data.users(id),
    updated_by UUID NOT NULL REFERENCES user_data.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::JSONB
);

CREATE INDEX idx_cash_flows_account 
    ON user_data.cash_flows(trading_account_id, transaction_date DESC) 
    WHERE deleted_at IS NULL;
    
CREATE INDEX idx_cash_flows_user 
    ON user_data.cash_flows(user_id, transaction_date DESC) 
    WHERE deleted_at IS NULL;
    
CREATE INDEX idx_cash_flows_type 
    ON user_data.cash_flows(flow_type) 
    WHERE deleted_at IS NULL;

COMMENT ON TABLE user_data.cash_flows IS 'Account deposits, withdrawals, dividends';

-- ----------------------------------------------------------------------------
-- Table: user_data.alerts
-- ----------------------------------------------------------------------------
CREATE TABLE user_data.alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_data.users(id) ON DELETE CASCADE,
    
    -- Polymorphic Target
    target_type VARCHAR(50) NOT NULL CHECK (target_type IN ('ticker', 'trade', 'trade_plan', 'account', 'general')),
    target_id UUID,
    
    -- Ticker (if target_type = 'ticker')
    ticker_id UUID REFERENCES market_data.tickers(id) ON DELETE CASCADE,
    
    -- Alert Details
    alert_type user_data.alert_type NOT NULL,
    priority user_data.alert_priority NOT NULL DEFAULT 'MEDIUM',
    
    -- Condition
    condition_field VARCHAR(50),
    condition_operator VARCHAR(10),
    condition_value NUMERIC(20, 8),
    
    -- Message
    title VARCHAR(200) NOT NULL,
    message TEXT,
    
    -- Status
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_triggered BOOLEAN NOT NULL DEFAULT FALSE,
    triggered_at TIMESTAMPTZ,
    
    -- Expiry
    expires_at TIMESTAMPTZ,
    
    -- Audit
    created_by UUID NOT NULL REFERENCES user_data.users(id),
    updated_by UUID NOT NULL REFERENCES user_data.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::JSONB
);

CREATE INDEX idx_alerts_user 
    ON user_data.alerts(user_id, created_at DESC) 
    WHERE deleted_at IS NULL;
    
CREATE INDEX idx_alerts_ticker 
    ON user_data.alerts(ticker_id) 
    WHERE ticker_id IS NOT NULL AND deleted_at IS NULL;
    
CREATE INDEX idx_alerts_target 
    ON user_data.alerts(target_type, target_id) 
    WHERE deleted_at IS NULL;
    
CREATE INDEX idx_alerts_active 
    ON user_data.alerts(is_active, is_triggered) 
    WHERE is_active = TRUE AND is_triggered = FALSE AND deleted_at IS NULL;

COMMENT ON TABLE user_data.alerts IS 'Price alerts and notifications (polymorphic)';

-- ----------------------------------------------------------------------------
-- Table: user_data.notes
-- ----------------------------------------------------------------------------
CREATE TABLE user_data.notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_data.users(id) ON DELETE CASCADE,
    
    -- Polymorphic Parent
    parent_type VARCHAR(50) NOT NULL CHECK (parent_type IN ('trade', 'trade_plan', 'ticker', 'account', 'general')),
    parent_id UUID,
    
    -- Content
    title VARCHAR(200),
    content TEXT NOT NULL,
    category user_data.note_category NOT NULL DEFAULT 'GENERAL',
    
    -- Status
    is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Audit
    created_by UUID NOT NULL REFERENCES user_data.users(id),
    updated_by UUID NOT NULL REFERENCES user_data.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::JSONB,
    tags VARCHAR(255)[]
);

CREATE INDEX idx_notes_user 
    ON user_data.notes(user_id, created_at DESC) 
    WHERE deleted_at IS NULL;
    
CREATE INDEX idx_notes_parent 
    ON user_data.notes(parent_type, parent_id) 
    WHERE deleted_at IS NULL;
    
CREATE INDEX idx_notes_category 
    ON user_data.notes(category) 
    WHERE deleted_at IS NULL;

COMMENT ON TABLE user_data.notes IS 'User notes (polymorphic, can attach to trades, plans, tickers)';

-- ----------------------------------------------------------------------------
-- Table: user_data.user_api_keys (NEW in V2.5 - GIN-004)
-- ----------------------------------------------------------------------------
CREATE TABLE user_data.user_api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_data.users(id) ON DELETE CASCADE,
    
    -- Provider
    provider user_data.api_provider NOT NULL,
    provider_label VARCHAR(100),
    
    -- Credentials (ENCRYPTED!)
    api_key_encrypted TEXT NOT NULL,
    api_secret_encrypted TEXT,
    additional_config JSONB DEFAULT '{}'::JSONB,
    
    -- Status
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    last_verified_at TIMESTAMPTZ,
    verification_error TEXT,
    
    -- Rate Limiting
    rate_limit_per_minute INTEGER,
    rate_limit_per_day INTEGER,
    quota_used_today INTEGER DEFAULT 0,
    quota_reset_at TIMESTAMPTZ,
    
    -- Audit
    created_by UUID NOT NULL REFERENCES user_data.users(id),
    updated_by UUID NOT NULL REFERENCES user_data.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    version INTEGER NOT NULL DEFAULT 1,
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::JSONB,
    
    -- Constraints
    CONSTRAINT user_api_keys_unique_user_provider 
        UNIQUE (user_id, provider, provider_label) WHERE deleted_at IS NULL,
    CONSTRAINT user_api_keys_encrypted_not_empty
        CHECK (LENGTH(api_key_encrypted) > 0),
    CONSTRAINT user_api_keys_rate_limit_positive
        CHECK (rate_limit_per_minute IS NULL OR rate_limit_per_minute > 0),
    CONSTRAINT user_api_keys_quota_logic
        CHECK (quota_used_today >= 0)
);

CREATE INDEX idx_user_api_keys_user_id 
    ON user_data.user_api_keys(user_id, created_at DESC) 
    WHERE deleted_at IS NULL;
    
CREATE INDEX idx_user_api_keys_provider 
    ON user_data.user_api_keys(provider, is_active) 
    WHERE is_active = TRUE AND deleted_at IS NULL;
    
CREATE INDEX idx_user_api_keys_verified 
    ON user_data.user_api_keys(is_verified, last_verified_at DESC) 
    WHERE deleted_at IS NULL;
    
CREATE INDEX idx_user_api_keys_config 
    ON user_data.user_api_keys USING gin(additional_config jsonb_path_ops);

COMMENT ON TABLE user_data.user_api_keys IS 'Multi-provider API keys (IBKR, Polygon, etc.) - ENCRYPTED';

-- ============================================================================
-- SECTION 6: SQL FUNCTIONS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Function: get_latest_price (simple)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION market_data.get_latest_price(p_ticker_id UUID)
RETURNS NUMERIC(20, 8) AS $$
DECLARE
    v_price NUMERIC(20, 8);
BEGIN
    SELECT price INTO v_price
    FROM market_data.ticker_prices
    WHERE ticker_id = p_ticker_id
    ORDER BY price_timestamp DESC
    LIMIT 1;
    
    RETURN v_price;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION market_data.get_latest_price IS 'Get latest price for ticker (simple, returns price only)';

-- ----------------------------------------------------------------------------
-- Function: get_trade_hierarchy (recursive)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION user_data.get_trade_hierarchy(p_trade_id UUID)
RETURNS TABLE (
    trade_id UUID,
    parent_id UUID,
    level INTEGER,
    quantity NUMERIC,
    status VARCHAR,
    entry_date TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    WITH RECURSIVE trade_tree AS (
        -- Anchor: starting trade
        SELECT 
            id,
            parent_trade_id,
            1 AS level,
            quantity,
            status::VARCHAR,
            entry_date
        FROM user_data.trades
        WHERE id = p_trade_id AND deleted_at IS NULL
        
        UNION ALL
        
        -- Recursive: children
        SELECT 
            t.id,
            t.parent_trade_id,
            tt.level + 1,
            t.quantity,
            t.status::VARCHAR,
            t.entry_date
        FROM user_data.trades t
        INNER JOIN trade_tree tt ON t.parent_trade_id = tt.trade_id
        WHERE t.deleted_at IS NULL
    )
    SELECT * FROM trade_tree
    ORDER BY level, entry_date;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION user_data.get_trade_hierarchy IS 'Get full trade hierarchy (parent + all descendants)';

-- ----------------------------------------------------------------------------
-- Function: calculate_parent_trade_status (trigger function)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION user_data.calculate_parent_trade_status()
RETURNS TRIGGER AS $$
DECLARE
    parent_id UUID;
    total_children INTEGER;
    open_children INTEGER;
    closed_children INTEGER;
    cancelled_children INTEGER;
    new_calculated_status user_data.calculated_trade_status;
BEGIN
    -- Get parent ID
    IF NEW.parent_trade_id IS NOT NULL THEN
        parent_id := NEW.parent_trade_id;
    ELSE
        -- This is a parent, check if it has children
        SELECT COUNT(*) INTO total_children
        FROM user_data.trades
        WHERE parent_trade_id = NEW.id AND deleted_at IS NULL;
        
        IF total_children = 0 THEN
            NEW.calculated_status := NEW.status::TEXT::user_data.calculated_trade_status;
            RETURN NEW;
        END IF;
        
        parent_id := NEW.id;
    END IF;
    
    -- Count children by status
    SELECT 
        COUNT(*),
        COUNT(*) FILTER (WHERE status = 'ACTIVE'),
        COUNT(*) FILTER (WHERE status = 'CLOSED'),
        COUNT(*) FILTER (WHERE status = 'CANCELLED')
    INTO total_children, open_children, closed_children, cancelled_children
    FROM user_data.trades
    WHERE parent_trade_id = parent_id AND deleted_at IS NULL;
    
    -- Determine calculated status
    IF total_children = 0 THEN
        new_calculated_status := 'OPEN';
    ELSIF closed_children = total_children THEN
        new_calculated_status := 'CLOSED';
    ELSIF cancelled_children = total_children THEN
        new_calculated_status := 'CANCELLED';
    ELSIF open_children > 0 AND (closed_children > 0 OR cancelled_children > 0) THEN
        new_calculated_status := 'PARTIAL';
    ELSIF closed_children > 0 AND cancelled_children > 0 THEN
        new_calculated_status := 'MIXED_CLOSE';
    ELSE
        new_calculated_status := 'OPEN';
    END IF;
    
    -- Update parent
    UPDATE user_data.trades
    SET calculated_status = new_calculated_status,
        updated_at = NOW()
    WHERE id = parent_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION user_data.calculate_parent_trade_status IS 'Auto-calculate parent trade status based on children (trigger function)';

-- ============================================================================
-- SECTION 7: TRIGGERS
-- ============================================================================

-- Trigger: Update parent calculated_status when children change
CREATE TRIGGER update_parent_calculated_status
    AFTER INSERT OR UPDATE OR DELETE ON user_data.trades
    FOR EACH ROW
    WHEN (NEW.parent_trade_id IS NOT NULL OR OLD.parent_trade_id IS NOT NULL)
    EXECUTE FUNCTION user_data.calculate_parent_trade_status();

-- ============================================================================
-- SECTION 8: INITIAL DATA SEED
-- ============================================================================

-- Seed: Exchanges
INSERT INTO market_data.exchanges (exchange_code, exchange_name, country, timezone, status) VALUES
('NASDAQ', 'NASDAQ Stock Market', 'USA', 'America/New_York', 'ACTIVE'),
('NYSE', 'New York Stock Exchange', 'USA', 'America/New_York', 'ACTIVE'),
('LSE', 'London Stock Exchange', 'GBR', 'Europe/London', 'ACTIVE'),
('TASE', 'Tel Aviv Stock Exchange', 'ISR', 'Asia/Jerusalem', 'ACTIVE')
ON CONFLICT (exchange_code) DO NOTHING;

-- Seed: Sectors
INSERT INTO market_data.sectors (sector_name, sort_order) VALUES
('Technology', 1),
('Healthcare', 2),
('Financial Services', 3),
('Consumer Cyclical', 4),
('Industrials', 5),
('Energy', 6),
('Utilities', 7),
('Real Estate', 8),
('Materials', 9),
('Consumer Defensive', 10),
('Communication Services', 11)
ON CONFLICT (sector_name) DO NOTHING;

-- Seed: Market Cap Groups
INSERT INTO market_data.market_cap_groups (group_name, min_market_cap, max_market_cap, sort_order) VALUES
('Mega Cap', 200000000000, NULL, 1),
('Large Cap', 10000000000, 200000000000, 2),
('Mid Cap', 2000000000, 10000000000, 3),
('Small Cap', 300000000, 2000000000, 4),
('Micro Cap', 50000000, 300000000, 5),
('Nano Cap', NULL, 50000000, 6)
ON CONFLICT (group_name) DO NOTHING;

-- ============================================================================
-- END OF DDL
-- ============================================================================

-- Refresh materialized views (run periodically via cron/scheduler)
-- REFRESH MATERIALIZED VIEW CONCURRENTLY market_data.quotes_last;
-- REFRESH MATERIALIZED VIEW CONCURRENTLY market_data.latest_ticker_prices;
