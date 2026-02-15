-- ============================================================================
-- P3-021: Market Data Reference Tables (exchanges, sectors, industries, market_cap_groups)
-- ============================================================================
-- Purpose: Unblock POST /me/tickers — tickers FK requires these tables
-- Team 20 → Team 60 directive: TEAM_20_TO_TEAM_60_USER_TICKERS_DB_SCHEMA_BLOCKER
-- Source: PHX_DB_SCHEMA_V2.5_FULL_DDL.sql (sections 4-5)
-- ============================================================================

-- Ensure schema
CREATE SCHEMA IF NOT EXISTS market_data;

-- ----------------------------------------------------------------------------
-- ENUM: exchange_status (if not exists)
-- ----------------------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE market_data.exchange_status AS ENUM ('ACTIVE', 'INACTIVE', 'DELISTED');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- ----------------------------------------------------------------------------
-- Table: market_data.exchanges
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS market_data.exchanges (
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
CREATE INDEX IF NOT EXISTS idx_exchanges_code ON market_data.exchanges(exchange_code);
CREATE INDEX IF NOT EXISTS idx_exchanges_status ON market_data.exchanges(status) WHERE status = 'ACTIVE';

-- ----------------------------------------------------------------------------
-- Table: market_data.sectors
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS market_data.sectors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sector_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    sort_order INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_sectors_name ON market_data.sectors(sector_name);

-- ----------------------------------------------------------------------------
-- Table: market_data.industries
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS market_data.industries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    industry_name VARCHAR(150) NOT NULL UNIQUE,
    sector_id UUID REFERENCES market_data.sectors(id) ON DELETE SET NULL,
    description TEXT,
    sort_order INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_industries_name ON market_data.industries(industry_name);
CREATE INDEX IF NOT EXISTS idx_industries_sector ON market_data.industries(sector_id);

-- ----------------------------------------------------------------------------
-- Table: market_data.market_cap_groups
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS market_data.market_cap_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_name VARCHAR(50) NOT NULL UNIQUE,
    min_market_cap NUMERIC(20, 2),
    max_market_cap NUMERIC(20, 2),
    description TEXT,
    sort_order INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_market_cap_groups_name ON market_data.market_cap_groups(group_name);

-- ----------------------------------------------------------------------------
-- Seed: exchanges
-- ----------------------------------------------------------------------------
INSERT INTO market_data.exchanges (exchange_code, exchange_name, country, timezone, status) VALUES
('NASDAQ', 'NASDAQ Stock Market', 'USA', 'America/New_York', 'ACTIVE'),
('NYSE', 'New York Stock Exchange', 'USA', 'America/New_York', 'ACTIVE'),
('LSE', 'London Stock Exchange', 'GBR', 'Europe/London', 'ACTIVE'),
('TASE', 'Tel Aviv Stock Exchange', 'ISR', 'Asia/Jerusalem', 'ACTIVE'),
('MIL', 'Borsa Italiana', 'ITA', 'Europe/Rome', 'ACTIVE')
ON CONFLICT (exchange_code) DO NOTHING;

-- ----------------------------------------------------------------------------
-- Seed: sectors
-- ----------------------------------------------------------------------------
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

-- ----------------------------------------------------------------------------
-- Seed: market_cap_groups
-- ----------------------------------------------------------------------------
INSERT INTO market_data.market_cap_groups (group_name, min_market_cap, max_market_cap, sort_order) VALUES
('Mega Cap', 200000000000, NULL, 1),
('Large Cap', 10000000000, 200000000000, 2),
('Mid Cap', 2000000000, 10000000000, 3),
('Small Cap', 300000000, 2000000000, 4),
('Micro Cap', 50000000, 300000000, 5),
('Nano Cap', NULL, 50000000, 6)
ON CONFLICT (group_name) DO NOTHING;

-- ----------------------------------------------------------------------------
-- Verify: tickers table must have FK to exchanges
-- If tickers exists but was created without FK (legacy), alter may be needed.
-- Run PHX_DB_SCHEMA_V2.5_FULL_DDL.sql for full schema if tickers is missing.
-- ----------------------------------------------------------------------------
