"""
Migration: Create External Data Integration Tables (Simple Version)
Creates all tables needed for external data integration system using direct SQL
"""

import sqlite3
import os
import sys
from pathlib import Path

# Get the database path
BASE_DIR = Path(__file__).parent.parent
DB_PATH = BASE_DIR / "db" / "simpleTrade_new.db"

def upgrade():
    """Create external data integration tables using direct SQL"""
    if not DB_PATH.exists():
        print(f"❌ Database not found at: {DB_PATH}")
        return
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # Create external_data_providers table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS external_data_providers (
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
        print("✅ external_data_providers table created")
        
        # Create market_data_quotes table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS market_data_quotes (
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
        print("✅ market_data_quotes table created")
        
        # Create user_data_preferences table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS user_data_preferences (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL UNIQUE,
                timezone VARCHAR(64) NOT NULL DEFAULT 'UTC',
                refresh_overrides_json TEXT,
                primary_provider VARCHAR(50) DEFAULT 'yahoo_finance',
                secondary_provider VARCHAR(50),
                primary_currency VARCHAR(10) DEFAULT 'USD',
                show_percentage_changes BOOLEAN DEFAULT 1,
                show_volume BOOLEAN DEFAULT 1,
                notify_on_data_failures BOOLEAN DEFAULT 1,
                notify_on_stale_data BOOLEAN DEFAULT 0,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        """)
        print("✅ user_data_preferences table created")
        
        # Create data_refresh_logs table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS data_refresh_logs (
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
                FOREIGN KEY (provider_id) REFERENCES external_data_providers(id)
            )
        """)
        print("✅ data_refresh_logs table created")
        
        # Create intraday_data_slots table (optional for Stage-1)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS intraday_data_slots (
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
        print("✅ intraday_data_slots table created")
        
        # Create indexes for performance
        indexes = [
            ("idx_market_data_quotes_ticker_provider", "market_data_quotes(ticker_id, provider_id)"),
            ("idx_market_data_quotes_asof_utc", "market_data_quotes(asof_utc)"),
            ("idx_market_data_quotes_fetched_at", "market_data_quotes(fetched_at)"),
            ("idx_market_data_quotes_stale", "market_data_quotes(is_stale)"),
            ("idx_data_refresh_logs_provider", "data_refresh_logs(provider_id)"),
            ("idx_data_refresh_logs_operation_type", "data_refresh_logs(operation_type)"),
            ("idx_data_refresh_logs_status", "data_refresh_logs(status)"),
            ("idx_data_refresh_logs_start_time", "data_refresh_logs(start_time)"),
            ("idx_intraday_data_slots_ticker_provider_slot", "intraday_data_slots(ticker_id, provider_id, slot_start_utc)"),
            ("idx_intraday_data_slots_slot_start_utc", "intraday_data_slots(slot_start_utc)")
        ]
        
        for index_name, index_def in indexes:
            try:
                cursor.execute(f"CREATE INDEX IF NOT EXISTS {index_name} ON {index_def}")
                print(f"✅ Index {index_name} created")
            except Exception as e:
                print(f"⚠️ Error creating index {index_name}: {e}")
        
        # Create unique constraint for intraday_data_slots
        try:
            cursor.execute("CREATE UNIQUE INDEX IF NOT EXISTS ux_intraday_data_slots_ticker_provider_slot ON intraday_data_slots(ticker_id, provider_id, slot_start_utc)")
            print("✅ Unique constraint for intraday_data_slots created")
        except Exception as e:
            print(f"⚠️ Error creating unique constraint: {e}")
        
        conn.commit()
        print("✅ All external data integration tables created successfully")
        print("✅ All indexes created successfully")
        
    except Exception as e:
        print(f"❌ Error creating tables: {e}")
        conn.rollback()
        raise
    finally:
        conn.close()


def downgrade():
    """Drop external data integration tables"""
    if not DB_PATH.exists():
        print(f"❌ Database not found at: {DB_PATH}")
        return
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # Drop tables in reverse order (due to foreign key constraints)
        tables_to_drop = [
            'intraday_data_slots',
            'data_refresh_logs', 
            'user_data_preferences',
            'market_data_quotes',
            'external_data_providers'
        ]
        
        for table_name in tables_to_drop:
            try:
                cursor.execute(f"DROP TABLE IF EXISTS {table_name}")
                print(f"✅ Dropped table: {table_name}")
            except Exception as e:
                print(f"⚠️ Error dropping table {table_name}: {e}")
        
        conn.commit()
        print("✅ External data integration tables dropped successfully")
        
    except Exception as e:
        print(f"❌ Error dropping tables: {e}")
        conn.rollback()
        raise
    finally:
        conn.close()


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "down":
        print("🔄 Downgrading external data integration tables...")
        downgrade()
    else:
        print("🔄 Upgrading to create external data integration tables...")
        upgrade()
