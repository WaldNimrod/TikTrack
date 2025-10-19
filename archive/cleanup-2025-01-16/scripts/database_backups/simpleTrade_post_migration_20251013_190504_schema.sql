CREATE TABLE executions (
	trade_id INTEGER NOT NULL, 
	action VARCHAR(20) NOT NULL, 
	date DATETIME, 
	quantity FLOAT NOT NULL, 
	price FLOAT NOT NULL, 
	fee FLOAT, 
	source VARCHAR(50), 
	id INTEGER NOT NULL, 
	created_at DATETIME DEFAULT (CURRENT_TIMESTAMP), external_id VARCHAR(100), notes VARCHAR(500), 
	PRIMARY KEY (id), 
	FOREIGN KEY(trade_id) REFERENCES trades (id)
);
CREATE TABLE note_relation_types (
	note_relation_type VARCHAR(20) NOT NULL, 
	id INTEGER NOT NULL, 
	created_at DATETIME DEFAULT (CURRENT_TIMESTAMP), 
	PRIMARY KEY (id), 
	UNIQUE (note_relation_type)
);
CREATE TABLE currencies (
	symbol VARCHAR(10) NOT NULL, 
	name VARCHAR(100) NOT NULL, 
	usd_rate NUMERIC(10, 6) NOT NULL, 
	id INTEGER NOT NULL, 
	created_at DATETIME DEFAULT (CURRENT_TIMESTAMP), usd_rate_default NUMERIC(10,6) DEFAULT 1, 
	PRIMARY KEY (id), 
	UNIQUE (symbol)
);
CREATE TABLE notes (id INTEGER PRIMARY KEY AUTOINCREMENT, content VARCHAR(1000) NOT NULL, attachment VARCHAR(500), created_at DATETIME DEFAULT CURRENT_TIMESTAMP, related_type_id INTEGER NOT NULL, related_id INTEGER NOT NULL);
CREATE TABLE sqlite_sequence(name,seq);
CREATE TABLE constraints (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                table_name VARCHAR(50) NOT NULL,
                column_name VARCHAR(50) NOT NULL,
                constraint_type VARCHAR(20) NOT NULL,
                constraint_name VARCHAR(100) NOT NULL,
                constraint_definition TEXT NOT NULL,
                is_active BOOLEAN DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
CREATE TABLE enum_values (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                constraint_id INTEGER NOT NULL,
                value VARCHAR(50) NOT NULL,
                display_name VARCHAR(100),
                is_active BOOLEAN DEFAULT 1,
                sort_order INTEGER DEFAULT 0,
                FOREIGN KEY (constraint_id) REFERENCES constraints(id) ON DELETE CASCADE
            );
CREATE TABLE constraint_validations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                constraint_id INTEGER NOT NULL,
                validation_type VARCHAR(20) NOT NULL,
                validation_rule TEXT NOT NULL,
                error_message TEXT,
                is_active BOOLEAN DEFAULT 1,
                FOREIGN KEY (constraint_id) REFERENCES constraints(id) ON DELETE CASCADE
            );
CREATE TABLE tickers_backup(
  symbol TEXT,
  name TEXT,
  type TEXT,
  remarks TEXT,
  currency TEXT,
  active_trades NUM,
  id INT,
  created_at NUM,
  updated_at NUM
);
CREATE TABLE external_data_providers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name VARCHAR(50) NOT NULL UNIQUE,
                display_name VARCHAR(100) NOT NULL,
                is_active BOOLEAN NOT NULL DEFAULT 1,
                provider_type VARCHAR(50) NOT NULL,
                api_key VARCHAR(255),
                base_url VARCHAR(255) NOT NULL,
                rate_limit_per_hour INTEGER DEFAULT 900,
                timeout_seconds INTEGER DEFAULT 20,
                retry_attempts INTEGER DEFAULT 2,
                cache_ttl_hot INTEGER DEFAULT 60,
                cache_ttl_warm INTEGER DEFAULT 300,
                max_symbols_per_batch INTEGER DEFAULT 50,
                preferred_batch_size INTEGER DEFAULT 25,
                last_successful_request DATETIME,
                last_error TEXT,
                error_count INTEGER DEFAULT 0,
                is_healthy BOOLEAN DEFAULT 1,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME
            );
CREATE TABLE market_data_quotes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                ticker_id INTEGER NOT NULL,
                provider_id INTEGER NOT NULL,
                asof_utc DATETIME NOT NULL,
                fetched_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                price REAL NOT NULL,
                change_pct_day REAL,
                change_amount_day REAL,
                volume INTEGER,
                currency VARCHAR(10) NOT NULL DEFAULT 'USD',
                source VARCHAR(50) NOT NULL,
                is_stale BOOLEAN DEFAULT 0,
                quality_score REAL DEFAULT 1.0,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME,
                FOREIGN KEY (ticker_id) REFERENCES tickers(id),
                FOREIGN KEY (provider_id) REFERENCES external_data_providers(id)
            );
CREATE TABLE data_refresh_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                provider_id INTEGER NOT NULL,
                operation_type VARCHAR(50) NOT NULL,
                symbols_requested INTEGER NOT NULL,
                symbols_successful INTEGER NOT NULL,
                symbols_failed INTEGER NOT NULL,
                start_time DATETIME NOT NULL,
                end_time DATETIME,
                total_duration_ms INTEGER,
                status VARCHAR(20) NOT NULL,
                error_message TEXT,
                error_code VARCHAR(50),
                rate_limit_remaining INTEGER,
                rate_limit_reset_time DATETIME,
                cache_hit_count INTEGER DEFAULT 0,
                cache_miss_count INTEGER DEFAULT 0,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, category VARCHAR(50), time_period VARCHAR(50), ticker_count INTEGER, successful_count INTEGER, failed_count INTEGER, message TEXT,
                FOREIGN KEY (provider_id) REFERENCES external_data_providers(id)
            );
CREATE TABLE intraday_data_slots (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                ticker_id INTEGER NOT NULL,
                provider_id INTEGER NOT NULL,
                slot_start_utc DATETIME NOT NULL,
                open_price REAL NOT NULL,
                high_price REAL NOT NULL,
                low_price REAL NOT NULL,
                close_price REAL NOT NULL,
                volume INTEGER NOT NULL,
                slot_duration_minutes INTEGER NOT NULL,
                is_complete BOOLEAN DEFAULT 0,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME,
                FOREIGN KEY (ticker_id) REFERENCES tickers(id),
                FOREIGN KEY (provider_id) REFERENCES external_data_providers(id)
            );
CREATE TABLE preference_profiles (
	user_id INTEGER NOT NULL, 
	profile_name VARCHAR(100) NOT NULL, 
	is_active BOOLEAN, 
	is_default BOOLEAN, 
	description TEXT, 
	created_by INTEGER, 
	last_used_at DATETIME, 
	usage_count INTEGER, 
	id INTEGER NOT NULL, 
	created_at DATETIME DEFAULT (CURRENT_TIMESTAMP), 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES users (id), 
	FOREIGN KEY(created_by) REFERENCES users (id)
);
CREATE TABLE sqlite_stat1(tbl,idx,stat);
CREATE TABLE preference_groups (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                group_name VARCHAR(100) NOT NULL UNIQUE,
                description TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
CREATE TABLE preference_types (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                group_id INTEGER NOT NULL,
                data_type VARCHAR(20) NOT NULL,
                preference_name VARCHAR(100) NOT NULL,
                description TEXT,
                constraints TEXT,  -- JSON עם הגבלות ואימותים
                default_value TEXT,
                is_required BOOLEAN DEFAULT FALSE,
                is_active BOOLEAN DEFAULT TRUE,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (group_id) REFERENCES preference_groups(id),
                UNIQUE(group_id, preference_name)
            );
CREATE TABLE users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(100) UNIQUE,
                full_name VARCHAR(100),
                is_active BOOLEAN DEFAULT 1,
                is_default BOOLEAN DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            , first_name VARCHAR(50), last_name VARCHAR(50));
CREATE TABLE trading_accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    currency_id INTEGER NOT NULL,
    status VARCHAR(20),
    cash_balance FLOAT,
    total_value FLOAT,
    total_pl FLOAT,
    notes VARCHAR(500),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (currency_id) REFERENCES currencies(id)
);
CREATE TABLE IF NOT EXISTS "cash_flows" (
    id INTEGER NOT NULL,
    trading_account_id INTEGER NOT NULL,
    type VARCHAR(50) NOT NULL,
    amount FLOAT NOT NULL,
    date DATE,
    description VARCHAR(500),
    created_at DATETIME DEFAULT (CURRENT_TIMESTAMP),
    currency_id INTEGER DEFAULT 1,
    usd_rate DECIMAL(10,6) DEFAULT 1.000000,
    source VARCHAR(20) DEFAULT 'manual',
    external_id VARCHAR(100) DEFAULT '0',
    PRIMARY KEY (id),
    FOREIGN KEY (trading_account_id) REFERENCES trading_accounts(id),
    FOREIGN KEY (currency_id) REFERENCES currencies(id)
);
CREATE TABLE quotes_last (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                ticker_id INTEGER NOT NULL,
                price NUMERIC(10, 4) NOT NULL,
                change_amount NUMERIC(10, 4),
                change_percent NUMERIC(5, 2),
                volume INTEGER,
                high_24h NUMERIC(10, 4),
                low_24h NUMERIC(10, 4),
                open_price NUMERIC(10, 4),
                previous_close NUMERIC(10, 4),
                provider VARCHAR(50) NOT NULL,
                asof_utc DATETIME,
                fetched_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
                source VARCHAR(50),
                currency VARCHAR(10) DEFAULT 'USD',
                is_stale BOOLEAN DEFAULT FALSE,
                quality_score REAL DEFAULT 1.0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (ticker_id) REFERENCES tickers(id),
                UNIQUE(ticker_id)
            );
CREATE TABLE user_preferences (
                id INTEGER,
                user_id INTEGER NOT NULL,
                profile_id INTEGER NOT NULL,
                preference_id INTEGER NOT NULL,
                saved_value TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (id),
                FOREIGN KEY (preference_id) REFERENCES preference_types(id),
                FOREIGN KEY (user_id, profile_id) REFERENCES preference_profiles(user_id, profile_name)
            );
CREATE TABLE IF NOT EXISTS "alerts" (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    message TEXT,
    triggered_at NUM,
    created_at NUM DEFAULT CURRENT_TIMESTAMP,
    status TEXT,
    is_triggered TEXT,
    related_type_id INTEGER NOT NULL,
    related_id INTEGER NOT NULL,
    condition_attribute TEXT NOT NULL,
    condition_operator TEXT NOT NULL,
    condition_number NUM NOT NULL,
    FOREIGN KEY (related_type_id) REFERENCES note_relation_types(id)
);
CREATE TABLE IF NOT EXISTS "tickers" (
                symbol VARCHAR(10) NOT NULL UNIQUE,
                name VARCHAR(100),
                type VARCHAR(20),
                remarks VARCHAR(500),
                active_trades BOOLEAN,
                id INTEGER PRIMARY KEY,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME,
                currency_id INTEGER,
                status TEXT DEFAULT 'open'
            );
CREATE TABLE IF NOT EXISTS "trades" (
                id INTEGER PRIMARY KEY,
                trading_account_id INTEGER NOT NULL,
                ticker_id INTEGER NOT NULL,
                trade_plan_id INTEGER,
                status VARCHAR(20),
                investment_type VARCHAR(20),
                closed_at DATETIME,
                cancelled_at DATETIME,
                cancel_reason VARCHAR(500),
                total_pl FLOAT,
                notes VARCHAR(500),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                side VARCHAR(10) DEFAULT 'Long'
            );
CREATE TABLE IF NOT EXISTS "trade_plans" (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                trading_account_id INTEGER NOT NULL,
                ticker_id INTEGER NOT NULL,
                investment_type VARCHAR(20) DEFAULT 'swing' NOT NULL,
                side VARCHAR(10) DEFAULT 'Long' NOT NULL,
                status VARCHAR(20) DEFAULT 'open' NOT NULL,
                planned_amount FLOAT DEFAULT 1000 NOT NULL,
                entry_conditions VARCHAR(500),
                stop_price FLOAT,
                target_price FLOAT,
                stop_percentage FLOAT GENERATED ALWAYS AS (
                    CASE WHEN stop_price IS NOT NULL 
                    THEN ROUND(ABS((stop_price / planned_amount - 1) * 100), 2)
                    ELSE NULL END
                ) VIRTUAL,
                target_percentage FLOAT GENERATED ALWAYS AS (
                    CASE WHEN target_price IS NOT NULL 
                    THEN ROUND(ABS((target_price / planned_amount - 1) * 100), 2)
                    ELSE NULL END
                ) VIRTUAL,
                reasons VARCHAR(500),
                cancelled_at DATETIME,
                cancel_reason VARCHAR(500),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                amount_input_mode TEXT CHECK(amount_input_mode IN ('amount', 'shares')) DEFAULT 'amount',
                stop_input_mode TEXT CHECK(stop_input_mode IN ('price', 'percentage')) DEFAULT 'price',
                target_input_mode TEXT CHECK(target_input_mode IN ('price', 'percentage')) DEFAULT 'price',
                FOREIGN KEY (trading_account_id) REFERENCES trading_accounts(id),
                FOREIGN KEY (ticker_id) REFERENCES tickers(id)
            );
CREATE INDEX ix_executions_id ON executions (id);
CREATE INDEX ix_note_relation_types_id ON note_relation_types (id);
CREATE INDEX ix_currencies_id ON currencies (id);
CREATE INDEX idx_constraints_table_column ON constraints (table_name, column_name);
CREATE INDEX idx_constraints_type ON constraints (constraint_type);
CREATE INDEX idx_constraints_active ON constraints (is_active);
CREATE INDEX idx_enum_constraint_id ON enum_values (constraint_id);
CREATE INDEX idx_enum_active ON enum_values (is_active);
CREATE INDEX idx_enum_sort ON enum_values (sort_order);
CREATE INDEX idx_validation_constraint_id ON constraint_validations (constraint_id);
CREATE INDEX idx_validation_type ON constraint_validations (validation_type);
CREATE INDEX idx_validation_active ON constraint_validations (is_active);
CREATE INDEX idx_market_data_quotes_ticker_provider ON market_data_quotes(ticker_id, provider_id);
CREATE INDEX idx_market_data_quotes_asof_utc ON market_data_quotes(asof_utc);
CREATE INDEX idx_market_data_quotes_fetched_at ON market_data_quotes(fetched_at);
CREATE INDEX idx_market_data_quotes_stale ON market_data_quotes(is_stale);
CREATE INDEX idx_data_refresh_logs_provider ON data_refresh_logs(provider_id);
CREATE INDEX idx_data_refresh_logs_operation_type ON data_refresh_logs(operation_type);
CREATE INDEX idx_data_refresh_logs_status ON data_refresh_logs(status);
CREATE INDEX idx_data_refresh_logs_start_time ON data_refresh_logs(start_time);
CREATE INDEX idx_intraday_data_slots_ticker_provider_slot ON intraday_data_slots(ticker_id, provider_id, slot_start_utc);
CREATE INDEX idx_intraday_data_slots_slot_start_utc ON intraday_data_slots(slot_start_utc);
CREATE UNIQUE INDEX ux_intraday_data_slots_ticker_provider_slot ON intraday_data_slots(ticker_id, provider_id, slot_start_utc);
CREATE INDEX ix_preference_profiles_id ON preference_profiles (id);
CREATE INDEX idx_preference_types_active 
            ON preference_types(is_active, group_id)
        ;
CREATE INDEX idx_preference_profiles_user_active 
            ON preference_profiles(user_id, is_active)
        ;
CREATE INDEX idx_quotes_last_ticker_id ON quotes_last(ticker_id);
CREATE INDEX idx_quotes_last_asof_utc ON quotes_last(asof_utc);
CREATE INDEX idx_quotes_last_fetched_at ON quotes_last(fetched_at);
CREATE INDEX idx_quotes_last_provider ON quotes_last(provider);
CREATE INDEX idx_quotes_last_stale ON quotes_last(is_stale);
CREATE INDEX idx_user_preferences_user_id 
            ON user_preferences(user_id)
        ;
CREATE INDEX idx_user_preferences_profile_id 
            ON user_preferences(profile_id)
        ;
CREATE INDEX idx_user_preferences_preference_id 
            ON user_preferences(preference_id)
        ;
CREATE INDEX idx_alerts_related ON alerts(related_type_id, related_id);
CREATE INDEX idx_alerts_status ON alerts(status);
CREATE TRIGGER protect_base_currency_update BEFORE UPDATE ON currencies BEGIN SELECT CASE WHEN NEW.id = 1 THEN RAISE(ABORT, 'Cannot update base currency record (ID=1)') END; END;
CREATE TRIGGER protect_base_currency_delete BEFORE DELETE ON currencies BEGIN SELECT CASE WHEN OLD.id = 1 THEN RAISE(ABORT, 'Cannot delete base currency record (ID=1)') END; END;
CREATE TABLE schema_migrations (
                id INTEGER PRIMARY KEY,
                version VARCHAR(50) UNIQUE NOT NULL,
                name VARCHAR(200) NOT NULL,
                sql_up TEXT NOT NULL,
                sql_down TEXT,
                applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                status VARCHAR(20) DEFAULT 'applied'
            );
CREATE TABLE cache_change_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    keys_json TEXT NOT NULL,
    reason VARCHAR(200),
    timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'system'
);
CREATE INDEX idx_cache_change_log_timestamp 
ON cache_change_log(timestamp);
CREATE INDEX idx_tickers_symbol ON tickers(symbol);
CREATE INDEX idx_tickers_type ON tickers(type);
CREATE INDEX idx_tickers_currency_id ON tickers(currency_id);
CREATE TABLE entity_relation_types (
	relation_type VARCHAR(20) NOT NULL, 
	id INTEGER NOT NULL, 
	created_at DATETIME DEFAULT (CURRENT_TIMESTAMP), 
	PRIMARY KEY (id), 
	UNIQUE (relation_type)
);
CREATE INDEX ix_entity_relation_types_id ON entity_relation_types (id);
CREATE TABLE system_setting_groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE system_setting_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id INTEGER NOT NULL,
    key VARCHAR(150) NOT NULL UNIQUE,
    data_type VARCHAR(20) NOT NULL,
    description TEXT,
    default_value TEXT,
    is_active BOOLEAN DEFAULT 1,
    constraints_json TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES system_setting_groups(id)
);
CREATE TABLE system_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type_id INTEGER NOT NULL,
    value TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (type_id) REFERENCES system_setting_types(id)
);
