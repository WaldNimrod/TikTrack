-- ============================================================================
-- dev_bootstrap_schema.sql
-- Cursor Cloud / local dev helper (NOT a production migration).
--
-- Purpose: create the extensions, schemas and ENUM types that the SQLAlchemy
-- ORM models expect (models declare enums with create_type=False, so the PG
-- types must exist before Base.metadata.create_all runs).
--
-- The canonical full DDL (documentation/docs-system/02-SERVER/
-- PHX_DB_SCHEMA_V2.6_FULL_DDL.sql) does not apply cleanly (trailing commas,
-- non-immutable generated columns, partitioned unique constraints), so the dev
-- database is built from the ORM instead. Run this file first, then
-- scripts/dev_build_schema_from_orm.py.
--
-- Usage:
--   PGPASSWORD=postgres psql -h localhost -U postgres -d tiktrack \
--       -v ON_ERROR_STOP=1 -f scripts/dev_bootstrap_schema.sql
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

CREATE SCHEMA IF NOT EXISTS market_data;
CREATE SCHEMA IF NOT EXISTS user_data;
CREATE SCHEMA IF NOT EXISTS admin_data;

DO $$
BEGIN
    -- market_data enums
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid=t.typnamespace WHERE n.nspname='market_data' AND t.typname='exchange_status') THEN
        CREATE TYPE market_data.exchange_status AS ENUM ('ACTIVE', 'INACTIVE', 'DELISTED');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid=t.typnamespace WHERE n.nspname='market_data' AND t.typname='ticker_type') THEN
        CREATE TYPE market_data.ticker_type AS ENUM ('STOCK', 'ETF', 'OPTION', 'FUTURE', 'FOREX', 'CRYPTO', 'INDEX');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid=t.typnamespace WHERE n.nspname='market_data' AND t.typname='data_provider') THEN
        CREATE TYPE market_data.data_provider AS ENUM ('IBKR', 'POLYGON', 'YAHOO_FINANCE', 'ALPHA_VANTAGE', 'FINNHUB');
    END IF;

    -- user_data enums
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid=t.typnamespace WHERE n.nspname='user_data' AND t.typname='user_role') THEN
        CREATE TYPE user_data.user_role AS ENUM ('USER', 'ADMIN', 'SUPERADMIN');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid=t.typnamespace WHERE n.nspname='user_data' AND t.typname='trade_status') THEN
        CREATE TYPE user_data.trade_status AS ENUM ('DRAFT', 'PLANNED', 'ACTIVE', 'CLOSED', 'CANCELLED');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid=t.typnamespace WHERE n.nspname='user_data' AND t.typname='calculated_trade_status') THEN
        CREATE TYPE user_data.calculated_trade_status AS ENUM ('OPEN', 'PARTIAL', 'CLOSED', 'CANCELLED', 'MIXED_CLOSE');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid=t.typnamespace WHERE n.nspname='user_data' AND t.typname='trade_direction') THEN
        CREATE TYPE user_data.trade_direction AS ENUM ('LONG', 'SHORT');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid=t.typnamespace WHERE n.nspname='user_data' AND t.typname='order_type') THEN
        CREATE TYPE user_data.order_type AS ENUM ('MARKET', 'LIMIT', 'STOP', 'STOP_LIMIT', 'TRAILING_STOP');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid=t.typnamespace WHERE n.nspname='user_data' AND t.typname='execution_side') THEN
        CREATE TYPE user_data.execution_side AS ENUM ('BUY', 'SELL');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid=t.typnamespace WHERE n.nspname='user_data' AND t.typname='alert_type') THEN
        CREATE TYPE user_data.alert_type AS ENUM ('PRICE', 'VOLUME', 'TECHNICAL', 'NEWS', 'CUSTOM');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid=t.typnamespace WHERE n.nspname='user_data' AND t.typname='alert_priority') THEN
        CREATE TYPE user_data.alert_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid=t.typnamespace WHERE n.nspname='user_data' AND t.typname='note_category') THEN
        CREATE TYPE user_data.note_category AS ENUM ('TRADE', 'PSYCHOLOGY', 'ANALYSIS', 'GENERAL');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid=t.typnamespace WHERE n.nspname='user_data' AND t.typname='strategy_type') THEN
        CREATE TYPE user_data.strategy_type AS ENUM ('MEAN_REVERSION', 'BREAKOUT', 'TREND_FOLLOWING', 'SCALPING', 'SWING', 'CUSTOM');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid=t.typnamespace WHERE n.nspname='user_data' AND t.typname='api_provider') THEN
        CREATE TYPE user_data.api_provider AS ENUM ('IBKR', 'POLYGON', 'YAHOO_FINANCE', 'ALPHA_VANTAGE', 'FINNHUB', 'TWELVE_DATA', 'IEX_CLOUD', 'CUSTOM');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid=t.typnamespace WHERE n.nspname='user_data' AND t.typname='reset_method') THEN
        CREATE TYPE user_data.reset_method AS ENUM ('EMAIL', 'SMS');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid=t.typnamespace WHERE n.nspname='user_data' AND t.typname='commission_type') THEN
        CREATE TYPE user_data.commission_type AS ENUM ('TIERED', 'FLAT');
    END IF;
END$$;

-- market_data.external_data_providers is referenced by an FK from
-- market_data.ticker_prices but has no ORM model, so it is created here.
CREATE TABLE IF NOT EXISTS market_data.external_data_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_name market_data.data_provider NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    priority INTEGER NOT NULL DEFAULT 100,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    health_check_url TEXT,
    last_health_check_at TIMESTAMPTZ,
    is_healthy BOOLEAN NOT NULL DEFAULT TRUE,
    consecutive_failures INTEGER DEFAULT 0,
    rate_limit_per_minute INTEGER,
    rate_limit_per_day INTEGER,
    config JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT external_data_providers_unique_name UNIQUE (provider_name)
);
