#!/usr/bin/env python3
"""
TikTrack Clean Database Creation Script
======================================

Creates a clean database with all current tables, triggers, and essential data
based on the current active database structure.

Usage:
    python3 Backend/scripts/create_clean_database.py

Output:
    Creates a new clean database file: Backend/db/simpleTrade_clean.db
"""

import sqlite3
import os
import sys
from datetime import datetime

def create_clean_database():
    """Create a clean database with current structure and essential data"""
    
    # Database file path
    db_path = "Backend/db/simpleTrade_clean.db"
    
    # Remove existing clean database if it exists
    if os.path.exists(db_path):
        os.remove(db_path)
        print(f"🗑️  Removed existing clean database: {db_path}")
    
    # Create new database
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    print(f"🚀 Creating clean database: {db_path}")
    
    try:
        # Create all tables with current structure
        create_tables(cursor)
        
        # Create all triggers
        create_triggers(cursor)
        
        # Insert essential data
        insert_essential_data(cursor)
        
        # Create indexes
        create_indexes(cursor)
        
        # Commit all changes
        conn.commit()
        
        print("✅ Clean database created successfully!")
        print(f"📁 Location: {db_path}")
        print(f"📊 Tables created: {get_table_count(cursor)}")
        print(f"🔧 Triggers created: {get_trigger_count(cursor)}")
        
    except Exception as e:
        print(f"❌ Error creating clean database: {e}")
        conn.rollback()
        raise
    finally:
        conn.close()

def create_tables(cursor):
    """Create all tables with current structure"""
    
    print("📋 Creating tables...")
    
    # Currencies table
    cursor.execute("""
        CREATE TABLE currencies (
            symbol VARCHAR(10) NOT NULL, 
            name VARCHAR(100) NOT NULL, 
            usd_rate NUMERIC(10, 6) NOT NULL, 
            id INTEGER NOT NULL, 
            created_at DATETIME DEFAULT (CURRENT_TIMESTAMP), 
            usd_rate_default NUMERIC(10,6) DEFAULT 1, 
            PRIMARY KEY (id), 
            UNIQUE (symbol)
        )
    """)
    
    # Users table
    cursor.execute("""
        CREATE TABLE users (
            username VARCHAR(50) NOT NULL, 
            email VARCHAR(100), 
            first_name VARCHAR(50) NOT NULL, 
            last_name VARCHAR(50) NOT NULL, 
            is_active BOOLEAN NOT NULL, 
            is_default BOOLEAN NOT NULL, 
            preferences TEXT, 
            created_at DATETIME, 
            updated_at DATETIME, 
            id INTEGER NOT NULL, 
            preferences_json TEXT, 
            PRIMARY KEY (id), 
            UNIQUE (username), 
            UNIQUE (email)
        )
    """)
    
    # Accounts table
    cursor.execute("""
        CREATE TABLE accounts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name VARCHAR(100) NOT NULL,
            currency_id INTEGER NOT NULL,
            status VARCHAR(20),
            cash_balance FLOAT,
            total_value FLOAT,
            total_pl FLOAT,
            notes VARCHAR(500),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            status_default VARCHAR(20) DEFAULT 'open',
            FOREIGN KEY (currency_id) REFERENCES currencies(id)
        )
    """)
    
    # Tickers table
    cursor.execute("""
        CREATE TABLE tickers (
            symbol VARCHAR(10) NOT NULL, 
            name VARCHAR(100), 
            type VARCHAR(20), 
            remarks VARCHAR(500), 
            currency VARCHAR(3), 
            active_trades BOOLEAN, 
            id INTEGER NOT NULL, 
            created_at DATETIME DEFAULT (CURRENT_TIMESTAMP), 
            updated_at DATETIME, 
            currency_id INTEGER, 
            status TEXT DEFAULT 'open', 
            PRIMARY KEY (id)
        )
    """)
    
    # Trade Plans table
    cursor.execute("""
        CREATE TABLE trade_plans (
            account_id INTEGER NOT NULL,
            ticker_id INTEGER NOT NULL,
            investment_type VARCHAR(20),
            planned_amount FLOAT,
            entry_conditions VARCHAR(500),
            stop_price FLOAT,
            target_price FLOAT,
            reasons VARCHAR(500),
            cancelled_at DATETIME,
            cancel_reason VARCHAR(500),
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            side VARCHAR(10) DEFAULT 'Long',
            status VARCHAR(20) DEFAULT 'open', 
            stop_percentage FLOAT DEFAULT 0.1, 
            target_percentage FLOAT DEFAULT 2000, 
            current_price FLOAT DEFAULT 0,
            FOREIGN KEY (ticker_id) REFERENCES tickers(id),
            FOREIGN KEY (account_id) REFERENCES accounts(id)
        )
    """)
    
    # Trades table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS trades (
            account_id INTEGER NOT NULL, 
            ticker_id INTEGER NOT NULL, 
            trade_plan_id INTEGER, 
            status VARCHAR(20), 
            investment_type VARCHAR(20), 
            opened_at DATETIME, 
            closed_at DATETIME, 
            cancelled_at DATETIME, 
            cancel_reason VARCHAR(500), 
            total_pl FLOAT, 
            notes VARCHAR(500), 
            id INTEGER PRIMARY KEY, 
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP, 
            side VARCHAR(10) DEFAULT 'Long'
        )
    """)
    
    # Executions table
    cursor.execute("""
        CREATE TABLE executions (
            trade_id INTEGER NOT NULL, 
            action VARCHAR(20) NOT NULL, 
            date DATETIME, 
            quantity FLOAT NOT NULL, 
            price FLOAT NOT NULL, 
            fee FLOAT, 
            source VARCHAR(50), 
            id INTEGER NOT NULL, 
            created_at DATETIME DEFAULT (CURRENT_TIMESTAMP), 
            external_id VARCHAR(100), 
            notes VARCHAR(500), 
            PRIMARY KEY (id), 
            FOREIGN KEY(trade_id) REFERENCES trades (id)
        )
    """)
    
    # Cash Flows table
    cursor.execute("""
        CREATE TABLE cash_flows (
            account_id INTEGER NOT NULL, 
            type VARCHAR(50) NOT NULL, 
            amount FLOAT NOT NULL, 
            date DATE, 
            description VARCHAR(500), 
            id INTEGER NOT NULL, 
            created_at DATETIME DEFAULT (CURRENT_TIMESTAMP), 
            currency_id INTEGER DEFAULT 1, 
            usd_rate DECIMAL(10,6) DEFAULT 1.000000, 
            source VARCHAR(20) DEFAULT 'manual', 
            external_id VARCHAR(100) DEFAULT '0', 
            PRIMARY KEY (id), 
            FOREIGN KEY(account_id) REFERENCES accounts (id)
        )
    """)
    
    # Alerts table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS alerts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            account_id INT,
            ticker_id INT,
            message TEXT,
            triggered_at NUM,
            created_at NUM,
            status TEXT,
            is_triggered TEXT,
            related_type_id INT,
            related_id INT,
            condition_attribute TEXT,
            condition_operator TEXT,
            condition_number NUM
        )
    """)
    
    # Notes table
    cursor.execute("""
        CREATE TABLE notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT, 
            content VARCHAR(1000) NOT NULL, 
            attachment VARCHAR(500), 
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP, 
            related_type_id INTEGER NOT NULL, 
            related_id INTEGER NOT NULL
        )
    """)
    
    # Note Relation Types table
    cursor.execute("""
        CREATE TABLE note_relation_types (
            note_relation_type VARCHAR(20) NOT NULL, 
            id INTEGER NOT NULL, 
            created_at DATETIME DEFAULT (CURRENT_TIMESTAMP), 
            PRIMARY KEY (id), 
            UNIQUE (note_relation_type)
        )
    """)
    
    # Constraints table
    cursor.execute("""
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
        )
    """)
    
    # Enum Values table
    cursor.execute("""
        CREATE TABLE enum_values (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            constraint_id INTEGER NOT NULL,
            value VARCHAR(50) NOT NULL,
            display_name VARCHAR(100),
            is_active BOOLEAN DEFAULT 1,
            sort_order INTEGER DEFAULT 0,
            FOREIGN KEY (constraint_id) REFERENCES constraints(id) ON DELETE CASCADE
        )
    """)
    
    # Constraint Validations table
    cursor.execute("""
        CREATE TABLE constraint_validations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            constraint_id INTEGER NOT NULL,
            validation_type VARCHAR(20) NOT NULL,
            validation_rule TEXT NOT NULL,
            error_message TEXT,
            is_active BOOLEAN DEFAULT 1,
            FOREIGN KEY (constraint_id) REFERENCES constraints(id) ON DELETE CASCADE
        )
    """)
    
    # External Data Providers table
    cursor.execute("""
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
        )
    """)
    
    # Market Data Quotes table
    cursor.execute("""
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
        )
    """)
    
    # Data Refresh Logs table
    cursor.execute("""
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
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, 
            category VARCHAR(50), 
            time_period VARCHAR(50), 
            ticker_count INTEGER, 
            successful_count INTEGER, 
            failed_count INTEGER, 
            message TEXT,
            FOREIGN KEY (provider_id) REFERENCES external_data_providers(id)
        )
    """)
    
    # Intraday Data Slots table
    cursor.execute("""
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
        )
    """)
    
    # User Preferences table
    cursor.execute("""
        CREATE TABLE user_preferences (
            user_id INTEGER NOT NULL, 
            primary_currency VARCHAR(10), 
            timezone VARCHAR(64), 
            default_stop_loss FLOAT, 
            default_target_price FLOAT, 
            default_commission FLOAT, 
            default_status_filter VARCHAR(20), 
            default_type_filter VARCHAR(20), 
            default_account_filter VARCHAR(20), 
            default_date_range_filter VARCHAR(20), 
            default_search_filter VARCHAR(100), 
            console_cleanup_interval INTEGER, 
            data_refresh_interval INTEGER, 
            primary_data_provider VARCHAR(50), 
            secondary_data_provider VARCHAR(50), 
            cache_ttl INTEGER, 
            max_batch_size INTEGER, 
            request_delay INTEGER, 
            retry_attempts INTEGER, 
            retry_delay INTEGER, 
            auto_refresh BOOLEAN, 
            verbose_logging BOOLEAN, 
            numeric_value_colors_json TEXT, 
            entity_colors_json TEXT, 
            updated_at DATETIME, 
            id INTEGER NOT NULL, 
            created_at DATETIME DEFAULT (CURRENT_TIMESTAMP), 
            header_opacity_json TEXT, 
            status_colors_json TEXT, 
            investment_type_colors_json TEXT, 
            refresh_overrides_json TEXT, 
            show_percentage_changes BOOLEAN DEFAULT 1, 
            show_volume BOOLEAN DEFAULT 1, 
            notify_on_data_failures BOOLEAN DEFAULT 1, 
            notify_on_stale_data BOOLEAN DEFAULT 0, 
            PRIMARY KEY (id), 
            UNIQUE (user_id), 
            FOREIGN KEY(user_id) REFERENCES users (id)
        )
    """)
    
    # Preference Profiles table
    cursor.execute("""
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
        )
    """)
    
    # User Preferences table
    cursor.execute("""
        CREATE TABLE user_preferences_v2 (
            user_id INTEGER NOT NULL, 
            profile_id INTEGER NOT NULL, 
            primary_currency VARCHAR(10), 
            secondary_currency VARCHAR(10), 
            timezone VARCHAR(64), 
            language VARCHAR(10), 
            date_format VARCHAR(20), 
            number_format VARCHAR(20), 
            default_stop_loss FLOAT, 
            default_target_price FLOAT, 
            default_commission FLOAT, 
            default_trade_amount FLOAT, 
            risk_percentage FLOAT, 
            trading_hours_start VARCHAR(10), 
            trading_hours_end VARCHAR(10), 
            default_status_filter VARCHAR(20), 
            default_type_filter VARCHAR(20), 
            default_account_filter VARCHAR(20), 
            default_date_range_filter VARCHAR(20), 
            default_search_filter VARCHAR(100), 
            default_profit_filter VARCHAR(20), 
            default_min_amount FLOAT, 
            default_max_amount FLOAT, 
            theme VARCHAR(20), 
            compact_mode BOOLEAN, 
            show_animations BOOLEAN, 
            sidebar_position VARCHAR(10), 
            default_page VARCHAR(50), 
            table_page_size INTEGER, 
            table_show_icons BOOLEAN, 
            table_auto_refresh BOOLEAN, 
            table_refresh_interval INTEGER, 
            chart_theme VARCHAR(20), 
            chart_animation BOOLEAN, 
            show_chart_grid BOOLEAN, 
            default_chart_period VARCHAR(20), 
            primary_data_provider VARCHAR(50), 
            secondary_data_provider VARCHAR(50), 
            fallback_data_provider VARCHAR(50), 
            data_refresh_interval INTEGER, 
            cache_ttl INTEGER, 
            max_batch_size INTEGER, 
            request_delay INTEGER, 
            retry_attempts INTEGER, 
            retry_delay INTEGER, 
            timeout_duration INTEGER, 
            show_percentage_changes BOOLEAN, 
            show_volume BOOLEAN, 
            show_market_cap BOOLEAN, 
            show_52_week_range BOOLEAN, 
            enable_notifications BOOLEAN, 
            notification_sound BOOLEAN, 
            notification_popup BOOLEAN, 
            notification_email BOOLEAN, 
            notify_on_trade_executed BOOLEAN, 
            notify_on_stop_loss BOOLEAN, 
            notify_on_target_reached BOOLEAN, 
            notify_on_margin_call BOOLEAN, 
            notify_on_data_failures BOOLEAN, 
            notify_on_stale_data BOOLEAN, 
            notify_on_price_alerts BOOLEAN, 
            console_cleanup_interval INTEGER, 
            console_auto_clear BOOLEAN, 
            console_max_entries INTEGER, 
            verbose_logging BOOLEAN, 
            log_level VARCHAR(20), 
            enable_caching BOOLEAN, 
            prefetch_data BOOLEAN, 
            lazy_loading BOOLEAN, 
            session_timeout INTEGER, 
            auto_backup BOOLEAN, 
            backup_interval INTEGER, 
            track_user_activity BOOLEAN, 
            generate_reports BOOLEAN, 
            color_scheme_json TEXT, 
            opacity_settings_json TEXT, 
            refresh_overrides_json TEXT, 
            dashboard_layout_json TEXT, 
            keyboard_shortcuts_json TEXT, 
            advanced_alerts_json TEXT, 
            import_export_settings_json TEXT, 
            version VARCHAR(20), 
            migrated_from_legacy BOOLEAN, 
            migration_date DATETIME, 
            last_validation DATETIME, 
            validation_errors_json TEXT, 
            updated_at DATETIME, 
            id INTEGER NOT NULL, 
            created_at DATETIME DEFAULT (CURRENT_TIMESTAMP), 
            PRIMARY KEY (id), 
            FOREIGN KEY(user_id) REFERENCES users (id), 
            FOREIGN KEY(profile_id) REFERENCES preference_profiles (id)
        )
    """)
    
    # Preference History table
    cursor.execute("""
        CREATE TABLE preference_history (
            user_id INTEGER NOT NULL, 
            profile_id INTEGER NOT NULL, 
            change_type VARCHAR(50) NOT NULL, 
            field_name VARCHAR(100), 
            old_value TEXT, 
            new_value TEXT, 
            changed_by INTEGER, 
            change_reason VARCHAR(200), 
            ip_address VARCHAR(45), 
            user_agent VARCHAR(500), 
            id INTEGER NOT NULL, 
            created_at DATETIME DEFAULT (CURRENT_TIMESTAMP), 
            PRIMARY KEY (id), 
            FOREIGN KEY(user_id) REFERENCES users (id), 
            FOREIGN KEY(profile_id) REFERENCES preference_profiles (id), 
            FOREIGN KEY(changed_by) REFERENCES users (id)
        )
    """)
    
    print("✅ All tables created successfully")

def create_triggers(cursor):
    """Create all triggers"""
    
    print("🔧 Creating triggers...")
    
    # Protect base currency triggers
    cursor.execute("""
        CREATE TRIGGER protect_base_currency_update 
        BEFORE UPDATE ON currencies 
        BEGIN 
            SELECT CASE 
                WHEN NEW.id = 1 
                THEN RAISE(ABORT, 'Cannot update base currency record (ID=1)') 
            END; 
        END
    """)
    
    cursor.execute("""
        CREATE TRIGGER protect_base_currency_delete 
        BEFORE DELETE ON currencies 
        BEGIN 
            SELECT CASE 
                WHEN OLD.id = 1 
                THEN RAISE(ABORT, 'Cannot delete base currency record (ID=1)') 
            END; 
        END
    """)
    
    # Protect last account delete trigger
    cursor.execute("""
        CREATE TRIGGER protect_last_account_delete 
        BEFORE DELETE ON accounts 
        BEGIN 
            SELECT CASE 
                WHEN (SELECT COUNT(*) FROM accounts) = 1 
                THEN RAISE(ABORT, 'Cannot delete the last account in the system') 
            END; 
        END
    """)
    
    # Trade plan triggers for ticker status
    cursor.execute("""
        CREATE TRIGGER trigger_trade_plan_insert_ticker_status
        AFTER INSERT ON trade_plans
        FOR EACH ROW
        BEGIN
            UPDATE tickers 
            SET active_trades = (
                SELECT COUNT(*) > 0 
                FROM trades 
                WHERE trades.ticker_id = NEW.ticker_id 
                AND trades.status = 'open'
            ),
            status = CASE 
                WHEN NEW.status = 'open' OR (
                    SELECT COUNT(*) > 0 
                    FROM trades 
                    WHERE trades.ticker_id = NEW.ticker_id 
                    AND trades.status = 'open'
                ) THEN 'open'
                ELSE 'closed'
            END,
            updated_at = datetime('now')
            WHERE tickers.id = NEW.ticker_id
            AND tickers.status != 'cancelled';
        END
    """)
    
    cursor.execute("""
        CREATE TRIGGER trigger_trade_plan_update_ticker_status
        AFTER UPDATE ON trade_plans
        FOR EACH ROW
        BEGIN
            UPDATE tickers 
            SET active_trades = (
                SELECT COUNT(*) > 0 
                FROM trades 
                WHERE trades.ticker_id = NEW.ticker_id 
                AND trades.status = 'open'
            ),
            status = CASE 
                WHEN NEW.status = 'open' OR (
                    SELECT COUNT(*) > 0 
                    FROM trades 
                    WHERE trades.ticker_id = NEW.ticker_id 
                    AND trades.status = 'open'
                ) THEN 'open'
                ELSE 'closed'
            END,
            updated_at = datetime('now')
            WHERE tickers.id = NEW.ticker_id
            AND tickers.status != 'cancelled';
        END
    """)
    
    cursor.execute("""
        CREATE TRIGGER trigger_trade_plan_delete_ticker_status
        AFTER DELETE ON trade_plans
        FOR EACH ROW
        BEGIN
            UPDATE tickers 
            SET active_trades = (
                SELECT COUNT(*) > 0 
                FROM trades 
                WHERE trades.ticker_id = OLD.ticker_id 
                AND trades.status = 'open'
            ),
            status = CASE 
                WHEN (
                    SELECT COUNT(*) > 0 
                    FROM trades 
                    WHERE trades.ticker_id = OLD.ticker_id 
                    AND trades.status = 'open'
                ) OR (
                    SELECT COUNT(*) > 0 
                    FROM trade_plans 
                    WHERE trade_plans.ticker_id = OLD.ticker_id 
                    AND trade_plans.status = 'open'
                ) THEN 'open'
                ELSE 'closed'
            END,
            updated_at = datetime('now')
            WHERE tickers.id = OLD.ticker_id
            AND tickers.status != 'cancelled';
        END
    """)
    
    # Trade triggers for ticker status
    cursor.execute("""
        CREATE TRIGGER trigger_trade_insert_ticker_status
        AFTER INSERT ON trades
        FOR EACH ROW
        BEGIN
            UPDATE tickers 
            SET active_trades = (
                SELECT COUNT(*) > 0 
                FROM trades 
                WHERE trades.ticker_id = NEW.ticker_id 
                AND trades.status = 'open'
            ),
            status = CASE 
                WHEN NEW.status = 'open' OR (
                    SELECT COUNT(*) > 0 
                    FROM trade_plans 
                    WHERE trade_plans.ticker_id = NEW.ticker_id 
                    AND trade_plans.status = 'open'
                ) THEN 'open'
                ELSE 'closed'
            END,
            updated_at = datetime('now')
            WHERE tickers.id = NEW.ticker_id
            AND tickers.status != 'cancelled';
        END
    """)
    
    cursor.execute("""
        CREATE TRIGGER trigger_trade_update_ticker_status
        AFTER UPDATE ON trades
        FOR EACH ROW
        BEGIN
            UPDATE tickers 
            SET active_trades = (
                SELECT COUNT(*) > 0 
                FROM trades 
                WHERE trades.ticker_id = NEW.ticker_id 
                AND trades.status = 'open'
            ),
            status = CASE 
                WHEN NEW.status = 'open' OR (
                    SELECT COUNT(*) > 0 
                    FROM trade_plans 
                    WHERE trade_plans.ticker_id = NEW.ticker_id 
                    AND trade_plans.status = 'open'
                ) THEN 'open'
                ELSE 'closed'
            END,
            updated_at = datetime('now')
            WHERE tickers.id = NEW.ticker_id
            AND tickers.status != 'cancelled';
        END
    """)
    
    cursor.execute("""
        CREATE TRIGGER trigger_trade_delete_ticker_status
        AFTER DELETE ON trades
        FOR EACH ROW
        BEGIN
            UPDATE tickers 
            SET active_trades = (
                SELECT COUNT(*) > 0 
                FROM trades 
                WHERE trades.ticker_id = OLD.ticker_id 
                AND trades.status = 'open'
            ),
            status = CASE 
                WHEN (
                    SELECT COUNT(*) > 0 
                    FROM trades 
                    WHERE trades.ticker_id = OLD.ticker_id 
                    AND trades.status = 'open'
                ) OR (
                    SELECT COUNT(*) > 0 
                    FROM trade_plans 
                    WHERE trade_plans.ticker_id = OLD.ticker_id 
                    AND trade_plans.status = 'open'
                ) THEN 'open'
                ELSE 'closed'
            END,
            updated_at = datetime('now')
            WHERE tickers.id = OLD.ticker_id
            AND tickers.status != 'cancelled';
        END
    """)
    
    print("✅ All triggers created successfully")

def create_indexes(cursor):
    """Create all indexes"""
    
    print("📊 Creating indexes...")
    
    # Tickers indexes
    cursor.execute("CREATE INDEX ix_tickers_id ON tickers (id)")
    cursor.execute("CREATE UNIQUE INDEX ix_tickers_symbol ON tickers (symbol)")
    
    # Cash flows indexes
    cursor.execute("CREATE INDEX ix_cash_flows_id ON cash_flows (id)")
    
    # Executions indexes
    cursor.execute("CREATE INDEX ix_executions_id ON executions (id)")
    
    # Note relation types indexes
    cursor.execute("CREATE INDEX ix_note_relation_types_id ON note_relation_types (id)")
    
    # Currencies indexes
    cursor.execute("CREATE INDEX ix_currencies_id ON currencies (id)")
    
    # Users indexes
    cursor.execute("CREATE INDEX ix_users_id ON users (id)")
    
    # User preferences indexes
    cursor.execute("CREATE INDEX ix_user_preferences_id ON user_preferences (id)")
    
    # Preference profiles indexes
    cursor.execute("CREATE INDEX ix_preference_profiles_id ON preference_profiles (id)")
    
    # User preferences v2 indexes
    cursor.execute("CREATE INDEX ix_user_preferences_v2_id ON user_preferences_v2 (id)")
    
    # Preference history indexes
    cursor.execute("CREATE INDEX ix_preference_history_id ON preference_history (id)")
    
    # Alerts indexes
    cursor.execute("CREATE INDEX idx_alerts_status ON alerts(status)")
    cursor.execute("CREATE INDEX idx_alerts_is_triggered ON alerts(is_triggered)")
    cursor.execute("CREATE INDEX idx_alerts_related_type_id ON alerts(related_type_id)")
    cursor.execute("CREATE INDEX idx_alerts_created_at ON alerts(created_at)")
    
    # Constraints indexes
    cursor.execute("CREATE INDEX idx_constraints_table_column ON constraints (table_name, column_name)")
    cursor.execute("CREATE INDEX idx_constraints_type ON constraints (constraint_type)")
    cursor.execute("CREATE INDEX idx_constraints_active ON constraints (is_active)")
    
    # Enum values indexes
    cursor.execute("CREATE INDEX idx_enum_constraint_id ON enum_values (constraint_id)")
    cursor.execute("CREATE INDEX idx_enum_active ON enum_values (is_active)")
    cursor.execute("CREATE INDEX idx_enum_sort ON enum_values (sort_order)")
    
    # Constraint validations indexes
    cursor.execute("CREATE INDEX idx_validation_constraint_id ON constraint_validations (constraint_id)")
    cursor.execute("CREATE INDEX idx_validation_type ON constraint_validations (validation_type)")
    cursor.execute("CREATE INDEX idx_validation_active ON constraint_validations (is_active)")
    
    # Market data quotes indexes
    cursor.execute("CREATE INDEX idx_market_data_quotes_ticker_provider ON market_data_quotes(ticker_id, provider_id)")
    cursor.execute("CREATE INDEX idx_market_data_quotes_asof_utc ON market_data_quotes(asof_utc)")
    cursor.execute("CREATE INDEX idx_market_data_quotes_fetched_at ON market_data_quotes(fetched_at)")
    cursor.execute("CREATE INDEX idx_market_data_quotes_stale ON market_data_quotes(is_stale)")
    
    # Data refresh logs indexes
    cursor.execute("CREATE INDEX idx_data_refresh_logs_provider ON data_refresh_logs(provider_id)")
    cursor.execute("CREATE INDEX idx_data_refresh_logs_operation_type ON data_refresh_logs(operation_type)")
    cursor.execute("CREATE INDEX idx_data_refresh_logs_status ON data_refresh_logs(status)")
    cursor.execute("CREATE INDEX idx_data_refresh_logs_start_time ON data_refresh_logs(start_time)")
    
    # Intraday data slots indexes
    cursor.execute("CREATE INDEX idx_intraday_data_slots_ticker_provider_slot ON intraday_data_slots(ticker_id, provider_id, slot_start_utc)")
    cursor.execute("CREATE INDEX idx_intraday_data_slots_slot_start_utc ON intraday_data_slots(slot_start_utc)")
    cursor.execute("CREATE UNIQUE INDEX ux_intraday_data_slots_ticker_provider_slot ON intraday_data_slots(ticker_id, provider_id, slot_start_utc)")
    
    print("✅ All indexes created successfully")

def insert_essential_data(cursor):
    """Insert essential data that must exist"""
    
    print("📝 Inserting essential data...")
    
    # Insert currencies
    cursor.execute("""
        INSERT INTO currencies (id, symbol, name, usd_rate, usd_rate_default, created_at) 
        VALUES 
        (1, 'USD', 'US Dollar', 1.0, 1.0, datetime('now')),
        (2, 'EUR', 'Euro', 0.85, 0.85, datetime('now')),
        (3, 'ILS', 'Israeli Shekel', 3.65, 3.65, datetime('now'))
    """)
    
    # Insert default user
    cursor.execute("""
        INSERT INTO users (id, username, email, first_name, last_name, is_active, is_default, created_at, updated_at) 
        VALUES 
        (1, 'nimrod', 'nimrod@tiktrack.com', 'Nimrod', 'User', 1, 1, datetime('now'), datetime('now'))
    """)
    
    # Insert note relation types
    cursor.execute("""
        INSERT INTO note_relation_types (id, note_relation_type, created_at) 
        VALUES 
        (1, 'account', datetime('now')),
        (2, 'trade', datetime('now')),
        (3, 'trade_plan', datetime('now')),
        (4, 'ticker', datetime('now'))
    """)
    
    # Insert external data providers
    cursor.execute("""
        INSERT INTO external_data_providers (
            id, name, display_name, is_active, provider_type, base_url, 
            rate_limit_per_hour, timeout_seconds, retry_attempts, 
            cache_ttl_hot, cache_ttl_warm, max_symbols_per_batch, 
            preferred_batch_size, created_at, updated_at
        ) 
        VALUES 
        (1, 'yahoo_finance', 'Yahoo Finance', 1, 'finance', 'https://query1.finance.yahoo.com', 
         900, 20, 2, 60, 300, 50, 25, datetime('now'), datetime('now')),
        (2, 'google_finance', 'Google Finance', 0, 'finance', 'https://www.google.com/finance', 
         900, 20, 2, 60, 300, 50, 25, datetime('now'), datetime('now'))
    """)
    
    print("✅ Essential data inserted successfully")

def get_table_count(cursor):
    """Get count of tables"""
    cursor.execute("SELECT COUNT(*) FROM sqlite_master WHERE type='table'")
    return cursor.fetchone()[0]

def get_trigger_count(cursor):
    """Get count of triggers"""
    cursor.execute("SELECT COUNT(*) FROM sqlite_master WHERE type='trigger'")
    return cursor.fetchone()[0]

if __name__ == "__main__":
    print("🚀 TikTrack Clean Database Creation Script")
    print("=" * 50)
    
    try:
        create_clean_database()
        print("\n🎉 Script completed successfully!")
        print("📁 Clean database created: Backend/db/simpleTrade_clean.db")
        print("💡 You can now use this clean database for testing or fresh installations")
        
    except Exception as e:
        print(f"\n❌ Script failed: {e}")
        sys.exit(1)
