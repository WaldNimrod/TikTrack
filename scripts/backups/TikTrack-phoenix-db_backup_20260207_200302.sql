-- TikTrack Phoenix Database Backup
-- Created: 2026-02-07 20:03:02
-- Database: TikTrack-phoenix-db
-- Host: localhost:5432
-- User: TikTrackDbAdmin

-- ============================================
-- SCHEMA DEFINITIONS
-- ============================================


-- Table: market_data.data_refresh_logs
-- Error getting table definition: unsupported operand type(s) for +: 'NoneType' and 'str'


-- Table: market_data.exchanges
-- Error getting table definition: unsupported operand type(s) for +: 'NoneType' and 'str'


-- Table: market_data.external_data_providers
-- Error getting table definition: unsupported operand type(s) for +: 'NoneType' and 'str'


-- Table: market_data.industries
-- Error getting table definition: unsupported operand type(s) for +: 'NoneType' and 'str'


-- Table: market_data.market_cap_groups
-- Error getting table definition: unsupported operand type(s) for +: 'NoneType' and 'str'


-- Table: market_data.sectors
-- Error getting table definition: unsupported operand type(s) for +: 'NoneType' and 'str'


-- Table: market_data.system_trading_calendar
-- Error getting table definition: unsupported operand type(s) for +: 'NoneType' and 'str'


-- Table: market_data.ticker_prices
CREATE TABLE IF NOT EXISTS market_data.ticker_prices (id uuid NOT NULL DEFAULT gen_random_uuid(), ticker_id uuid NOT NULL, provider_id uuid, price numeric(20,8) NOT NULL, open_price numeric(20,8), high_price numeric(20,8), low_price numeric(20,8), close_price numeric(20,8), volume bigint(64,0), price_timestamp timestamp with time zone NOT NULL, fetched_at timestamp with time zone NOT NULL DEFAULT now(), is_stale boolean NOT NULL DEFAULT false, created_at timestamp with time zone NOT NULL DEFAULT now());


-- Table: market_data.tickers
CREATE TABLE IF NOT EXISTS market_data.tickers (id uuid NOT NULL DEFAULT gen_random_uuid(), symbol character varying(20) NOT NULL, exchange_id uuid, company_name character varying(255), ticker_type ticker_type NOT NULL DEFAULT 'STOCK'::market_data.ticker_type, sector_id uuid, industry_id uuid, market_cap_group_id uuid, cusip character varying(9), isin character varying(12), figi character varying(12), is_active boolean NOT NULL DEFAULT true, delisted_date date, created_at timestamp with time zone NOT NULL DEFAULT now(), updated_at timestamp with time zone NOT NULL DEFAULT now(), deleted_at timestamp with time zone, metadata jsonb DEFAULT '{}'::jsonb);


-- Table: user_data.brokers_fees
CREATE TABLE IF NOT EXISTS user_data.brokers_fees (id uuid NOT NULL DEFAULT gen_random_uuid(), user_id uuid NOT NULL, broker character varying(100) NOT NULL, commission_type commission_type NOT NULL, commission_value character varying(255) NOT NULL, minimum numeric(20,8) NOT NULL DEFAULT 0, created_at timestamp with time zone NOT NULL DEFAULT now(), updated_at timestamp with time zone NOT NULL DEFAULT now(), deleted_at timestamp with time zone);


-- Table: user_data.cash_flows
CREATE TABLE IF NOT EXISTS user_data.cash_flows (id uuid NOT NULL DEFAULT gen_random_uuid(), user_id uuid NOT NULL, trading_account_id uuid NOT NULL, flow_type character varying(20) NOT NULL, amount numeric(20,6) NOT NULL, currency character varying(3) NOT NULL DEFAULT 'USD'::character varying, description text, transaction_date date NOT NULL, external_reference character varying(100), created_by uuid NOT NULL, updated_by uuid NOT NULL, created_at timestamp with time zone NOT NULL DEFAULT now(), updated_at timestamp with time zone NOT NULL DEFAULT now(), deleted_at timestamp with time zone, metadata jsonb DEFAULT '{}'::jsonb);


-- Table: user_data.notes
CREATE TABLE IF NOT EXISTS user_data.notes (id uuid NOT NULL DEFAULT gen_random_uuid(), user_id uuid NOT NULL, parent_type character varying(50) NOT NULL, parent_id uuid, title character varying(200), content text NOT NULL, category note_category NOT NULL DEFAULT 'GENERAL'::user_data.note_category, is_pinned boolean NOT NULL DEFAULT false, created_by uuid NOT NULL, updated_by uuid NOT NULL, created_at timestamp with time zone NOT NULL DEFAULT now(), updated_at timestamp with time zone NOT NULL DEFAULT now(), deleted_at timestamp with time zone, metadata jsonb DEFAULT '{}'::jsonb, tags ARRAY);


-- Table: user_data.password_reset_requests
CREATE TABLE IF NOT EXISTS user_data.password_reset_requests (id uuid NOT NULL DEFAULT gen_random_uuid(), user_id uuid NOT NULL, method reset_method NOT NULL, sent_to character varying(255) NOT NULL, reset_token character varying(64) NOT NULL, token_expires_at timestamp with time zone NOT NULL, verification_code character varying(6), code_expires_at timestamp with time zone, attempts_count integer(32,0) DEFAULT 0, max_attempts integer(32,0) DEFAULT 3, status character varying(20) NOT NULL DEFAULT 'PENDING'::character varying, used_at timestamp with time zone, used_from_ip character varying(45), created_at timestamp with time zone NOT NULL DEFAULT now());


-- Table: user_data.revoked_tokens
CREATE TABLE IF NOT EXISTS user_data.revoked_tokens (jti character varying(255) NOT NULL, expires_at timestamp with time zone NOT NULL, revoked_at timestamp with time zone NOT NULL DEFAULT now());


-- Table: user_data.trades
CREATE TABLE IF NOT EXISTS user_data.trades (id uuid NOT NULL DEFAULT gen_random_uuid(), user_id uuid NOT NULL, ticker_id uuid NOT NULL, trading_account_id uuid NOT NULL, parent_trade_id uuid, strategy_id uuid, origin_plan_id uuid, trigger_alert_id uuid, direction trade_direction NOT NULL, quantity numeric(20,8) NOT NULL, avg_entry_price numeric(20,8), avg_exit_price numeric(20,8), stop_loss numeric(20,8), take_profit numeric(20,8), realized_pl numeric(20,6) DEFAULT 0, unrealized_pl numeric(20,6) DEFAULT 0, total_pl numeric(20,6), commission numeric(20,6) DEFAULT 0, fees numeric(20,6) DEFAULT 0, status trade_status NOT NULL DEFAULT 'DRAFT'::user_data.trade_status, calculated_status calculated_trade_status, entry_date timestamp with time zone, exit_date timestamp with time zone, created_by uuid NOT NULL, updated_by uuid NOT NULL, created_at timestamp with time zone NOT NULL DEFAULT now(), updated_at timestamp with time zone NOT NULL DEFAULT now(), deleted_at timestamp with time zone, version integer(32,0) NOT NULL DEFAULT 1, metadata jsonb DEFAULT '{}'::jsonb, tags ARRAY);


-- Table: user_data.trading_accounts
CREATE TABLE IF NOT EXISTS user_data.trading_accounts (id uuid NOT NULL DEFAULT gen_random_uuid(), user_id uuid NOT NULL, account_name character varying(100) NOT NULL, broker character varying(100), account_number character varying(50), external_account_id character varying(100), last_sync_at timestamp with time zone, initial_balance numeric(20,6) NOT NULL, cash_balance numeric(20,6) NOT NULL DEFAULT 0, total_deposits numeric(20,6) NOT NULL DEFAULT 0, total_withdrawals numeric(20,6) NOT NULL DEFAULT 0, currency character varying(3) NOT NULL DEFAULT 'USD'::character varying, is_active boolean NOT NULL DEFAULT true, created_by uuid NOT NULL, updated_by uuid NOT NULL, created_at timestamp with time zone NOT NULL DEFAULT now(), updated_at timestamp with time zone NOT NULL DEFAULT now(), deleted_at timestamp with time zone, version integer(32,0) NOT NULL DEFAULT 1, metadata jsonb DEFAULT '{}'::jsonb);


-- Table: user_data.user_api_keys
CREATE TABLE IF NOT EXISTS user_data.user_api_keys (id uuid NOT NULL DEFAULT gen_random_uuid(), user_id uuid NOT NULL, provider api_provider NOT NULL, provider_label character varying(100), api_key_encrypted text NOT NULL, api_secret_encrypted text, additional_config jsonb DEFAULT '{}'::jsonb, is_active boolean NOT NULL DEFAULT true, is_verified boolean NOT NULL DEFAULT false, last_verified_at timestamp with time zone, verification_error text, rate_limit_per_minute integer(32,0), rate_limit_per_day integer(32,0), quota_used_today integer(32,0) DEFAULT 0, quota_reset_at timestamp with time zone, created_by uuid NOT NULL, updated_by uuid NOT NULL, created_at timestamp with time zone NOT NULL DEFAULT now(), updated_at timestamp with time zone NOT NULL DEFAULT now(), deleted_at timestamp with time zone, version integer(32,0) NOT NULL DEFAULT 1, metadata jsonb DEFAULT '{}'::jsonb);


-- Table: user_data.user_refresh_tokens
CREATE TABLE IF NOT EXISTS user_data.user_refresh_tokens (id uuid NOT NULL DEFAULT gen_random_uuid(), user_id uuid NOT NULL, token_hash character varying(255) NOT NULL, jti character varying(255) NOT NULL, expires_at timestamp with time zone NOT NULL, revoked_at timestamp with time zone, created_at timestamp with time zone NOT NULL DEFAULT now());


-- Table: user_data.users
CREATE TABLE IF NOT EXISTS user_data.users (id uuid NOT NULL DEFAULT gen_random_uuid(), username character varying(50) NOT NULL, email character varying(255) NOT NULL, password_hash character varying(255) NOT NULL, phone_number character varying(20), phone_verified boolean NOT NULL DEFAULT false, phone_verified_at timestamp with time zone, first_name character varying(100), last_name character varying(100), display_name character varying(100), role user_role NOT NULL DEFAULT 'USER'::user_data.user_role, timezone character varying(50) NOT NULL DEFAULT 'UTC'::character varying, language character varying(5) NOT NULL DEFAULT 'en'::character varying, is_active boolean NOT NULL DEFAULT true, is_email_verified boolean NOT NULL DEFAULT false, email_verified_at timestamp with time zone, last_login_at timestamp with time zone, last_login_ip character varying(45), failed_login_attempts integer(32,0) DEFAULT 0, locked_until timestamp with time zone, created_at timestamp with time zone NOT NULL DEFAULT now(), updated_at timestamp with time zone NOT NULL DEFAULT now(), deleted_at timestamp with time zone, metadata jsonb DEFAULT '{}'::jsonb);


-- ============================================
-- DATA
-- ============================================


-- Data for market_data.data_refresh_logs
