-- ============================================================================
-- D16_ACCTS_VIEW Tables Creation Script
-- ============================================================================
-- Created: 2026-02-03
-- Team: Team 60 (DevOps & Platform)
-- Purpose: Create missing tables for D16_ACCTS_VIEW endpoints
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Create trading_accounts table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_data.trading_accounts (
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
    metadata JSONB DEFAULT '{}'::JSONB
);

-- Create partial unique index for unique name constraint
CREATE UNIQUE INDEX IF NOT EXISTS idx_trading_accounts_unique_name 
    ON user_data.trading_accounts(user_id, account_name) 
    WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_trading_accounts_user 
    ON user_data.trading_accounts(user_id, created_at DESC) 
    WHERE deleted_at IS NULL;
    
CREATE INDEX IF NOT EXISTS idx_trading_accounts_active 
    ON user_data.trading_accounts(is_active) 
    WHERE is_active = TRUE AND deleted_at IS NULL;

COMMENT ON TABLE user_data.trading_accounts IS 'User trading accounts';

-- ----------------------------------------------------------------------------
-- 2. Create cash_flows table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_data.cash_flows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_data.users(id) ON DELETE CASCADE,
    trading_account_id UUID NOT NULL REFERENCES user_data.trading_accounts(id) ON DELETE CASCADE,
    
    -- Type
    flow_type VARCHAR(20) NOT NULL CHECK (flow_type IN ('DEPOSIT', 'WITHDRAWAL', 'DIVIDEND', 'INTEREST', 'FEE', 'OTHER', 'CURRENCY_CONVERSION')),
    
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

CREATE INDEX IF NOT EXISTS idx_cash_flows_account 
    ON user_data.cash_flows(trading_account_id, transaction_date DESC) 
    WHERE deleted_at IS NULL;
    
CREATE INDEX IF NOT EXISTS idx_cash_flows_user 
    ON user_data.cash_flows(user_id, transaction_date DESC) 
    WHERE deleted_at IS NULL;
    
CREATE INDEX IF NOT EXISTS idx_cash_flows_type 
    ON user_data.cash_flows(flow_type) 
    WHERE deleted_at IS NULL;

COMMENT ON TABLE user_data.cash_flows IS 'Account deposits, withdrawals, dividends';

-- ----------------------------------------------------------------------------
-- 3. Create tickers table (if not exists)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS market_data.tickers (
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
    metadata JSONB DEFAULT '{}'::JSONB
);

-- Create partial unique index for unique symbol+exchange constraint
CREATE UNIQUE INDEX IF NOT EXISTS idx_tickers_symbol_exchange_unique 
    ON market_data.tickers(symbol, exchange_id) 
    WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_tickers_symbol ON market_data.tickers(symbol) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_tickers_exchange ON market_data.tickers(exchange_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_tickers_sector ON market_data.tickers(sector_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_tickers_industry ON market_data.tickers(industry_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_tickers_type ON market_data.tickers(ticker_type) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_tickers_active ON market_data.tickers(is_active) WHERE is_active = TRUE;

COMMENT ON TABLE market_data.tickers IS 'Static ticker metadata (NOT prices/quotes)';

-- ----------------------------------------------------------------------------
-- 4. Create ticker_prices table (partitioned)
-- ----------------------------------------------------------------------------
-- Note: For partitioned tables, PRIMARY KEY must include partition key
CREATE TABLE IF NOT EXISTS market_data.ticker_prices (
    id UUID DEFAULT gen_random_uuid(),
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
    
    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT ticker_prices_positive_price CHECK (price > 0),
    PRIMARY KEY (id, price_timestamp)
) PARTITION BY RANGE (price_timestamp);

-- Create a default partition for current month (if needed)
-- Note: Full partition management should be handled by Team 20

CREATE INDEX IF NOT EXISTS idx_ticker_prices_ticker_time 
    ON market_data.ticker_prices(ticker_id, price_timestamp DESC);
    
CREATE INDEX IF NOT EXISTS idx_ticker_prices_timestamp 
    ON market_data.ticker_prices(price_timestamp DESC);
    
CREATE INDEX IF NOT EXISTS idx_ticker_prices_stale 
    ON market_data.ticker_prices(is_stale) WHERE is_stale = TRUE;

COMMENT ON TABLE market_data.ticker_prices IS 'Historical ticker prices (partitioned by month)';

-- ----------------------------------------------------------------------------
-- 5. Create trades table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_data.trades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_data.users(id) ON DELETE CASCADE,
    ticker_id UUID NOT NULL REFERENCES market_data.tickers(id) ON DELETE RESTRICT,
    trading_account_id UUID NOT NULL REFERENCES user_data.trading_accounts(id) ON DELETE RESTRICT,
    
    -- Hierarchy (NEW in V2.4 - GIN-002)
    parent_trade_id UUID REFERENCES user_data.trades(id) ON DELETE SET NULL,
    
    -- Strategy & Plan (NEW in V2.4 - GIN-002)
    -- Note: These tables may not exist yet, so we'll make them nullable without FK constraint for now
    strategy_id UUID,
    origin_plan_id UUID,
    
    -- Alert Link (NEW in V2.4 - GIN-002)
    -- Note: This table may not exist yet, so we'll make it nullable without FK constraint for now
    trigger_alert_id UUID,
    
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

CREATE INDEX IF NOT EXISTS idx_trades_user 
    ON user_data.trades(user_id, created_at DESC) 
    WHERE deleted_at IS NULL;
    
CREATE INDEX IF NOT EXISTS idx_trades_ticker 
    ON user_data.trades(ticker_id) 
    WHERE deleted_at IS NULL;
    
CREATE INDEX IF NOT EXISTS idx_trades_account 
    ON user_data.trades(trading_account_id) 
    WHERE deleted_at IS NULL;
    
CREATE INDEX IF NOT EXISTS idx_trades_status 
    ON user_data.trades(status) 
    WHERE deleted_at IS NULL;
    
CREATE INDEX IF NOT EXISTS idx_trades_parent 
    ON user_data.trades(parent_trade_id) 
    WHERE parent_trade_id IS NOT NULL AND deleted_at IS NULL;
    
CREATE INDEX IF NOT EXISTS idx_trades_strategy 
    ON user_data.trades(strategy_id) 
    WHERE deleted_at IS NULL;
    
CREATE INDEX IF NOT EXISTS idx_trades_plan 
    ON user_data.trades(origin_plan_id) 
    WHERE deleted_at IS NULL;

COMMENT ON TABLE user_data.trades IS 'Active trades with hierarchy and strategy links';
