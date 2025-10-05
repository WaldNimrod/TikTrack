"""
Migration: Create External Data Integration Tables
Creates all tables needed for external data integration system
"""

from sqlalchemy import create_engine, MetaData, Table, Column, Integer, String, DateTime, Float, Boolean, Text, ForeignKey, Index
from sqlalchemy.dialects.sqlite import BOOLEAN
import os
import sys

# Add the parent directory to the path so we can import models
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config.settings import DATABASE_URL

def upgrade():
    """Create external data integration tables"""
    engine = create_engine(DATABASE_URL)
    metadata = MetaData()
    
    # Create external_data_providers table
    external_data_providers = Table(
        'external_data_providers', metadata,
        Column('id', Integer, primary_key=True, autoincrement=True),
        Column('name', String(50), nullable=False, unique=True),
        Column('display_name', String(100), nullable=False),
        Column('is_active', BOOLEAN, default=True, nullable=False),
        Column('provider_type', String(50), nullable=False),
        Column('api_key', String(255), nullable=True),
        Column('base_url', String(255), nullable=False),
        Column('rate_limit_per_hour', Integer, default=900),
        Column('timeout_seconds', Integer, default=20),
        Column('retry_attempts', Integer, default=2),
        Column('cache_ttl_hot', Integer, default=60),
        Column('cache_ttl_warm', Integer, default=300),
        Column('max_symbols_per_batch', Integer, default=50),
        Column('preferred_batch_size', Integer, default=25),
        Column('last_successful_request', DateTime, nullable=True),
        Column('last_error', Text, nullable=True),
        Column('error_count', Integer, default=0),
        Column('is_healthy', BOOLEAN, default=True),
        Column('created_at', DateTime, nullable=False),
        Column('updated_at', DateTime, nullable=True)
    )
    
    # Create market_data_quotes table
    market_data_quotes = Table(
        'market_data_quotes', metadata,
        Column('id', Integer, primary_key=True, autoincrement=True),
        Column('ticker_id', Integer, ForeignKey('tickers.id'), nullable=False),
        Column('provider_id', Integer, ForeignKey('external_data_providers.id'), nullable=False),
        Column('asof_utc', DateTime, nullable=False),
        Column('fetched_at', DateTime, nullable=False),
        Column('price', Float, nullable=False),
        Column('change_pct_day', Float, nullable=True),
        Column('change_amount_day', Float, nullable=True),
        Column('volume', Integer, nullable=True),
        Column('currency', String(10), nullable=False, default='USD'),
        Column('source', String(50), nullable=False),
        Column('is_stale', BOOLEAN, default=False),
        Column('quality_score', Float, default=1.0),
        Column('created_at', DateTime, nullable=False),
        Column('updated_at', DateTime, nullable=True)
    )
    
    # Create user_data_preferences table
    user_data_preferences = Table(
        'user_data_preferences', metadata,
        Column('id', Integer, primary_key=True, autoincrement=True),
        Column('user_id', Integer, ForeignKey('users.id'), nullable=False, unique=True),
        Column('timezone', String(64), nullable=False, default='UTC'),
        Column('refresh_overrides_json', Text, nullable=True),
        Column('primary_provider', String(50), default='yahoo_finance'),
        Column('secondary_provider', String(50), nullable=True),
        Column('primary_currency', String(10), default='USD'),
        Column('show_percentage_changes', BOOLEAN, default=True),
        Column('show_volume', BOOLEAN, default=True),
        Column('notify_on_data_failures', BOOLEAN, default=True),
        Column('notify_on_stale_data', BOOLEAN, default=False),
        Column('created_at', DateTime, nullable=False),
        Column('updated_at', DateTime, nullable=True)
    )
    
    # Create data_refresh_logs table
    data_refresh_logs = Table(
        'data_refresh_logs', metadata,
        Column('id', Integer, primary_key=True, autoincrement=True),
        Column('provider_id', Integer, ForeignKey('external_data_providers.id'), nullable=False),
        Column('operation_type', String(50), nullable=False),
        Column('symbols_requested', Integer, nullable=False),
        Column('symbols_successful', Integer, nullable=False),
        Column('symbols_failed', Integer, nullable=False),
        Column('start_time', DateTime, nullable=False),
        Column('end_time', DateTime, nullable=True),
        Column('total_duration_ms', Integer, nullable=True),
        Column('status', String(20), nullable=False),
        Column('error_message', Text, nullable=True),
        Column('error_code', String(50), nullable=True),
        Column('rate_limit_remaining', Integer, nullable=True),
        Column('rate_limit_reset_time', DateTime, nullable=True),
        Column('cache_hit_count', Integer, default=0),
        Column('cache_miss_count', Integer, default=0),
        Column('created_at', DateTime, nullable=False)
    )
    
    # Create intraday_data_slots table (optional for Stage-1)
    intraday_data_slots = Table(
        'intraday_data_slots', metadata,
        Column('id', Integer, primary_key=True, autoincrement=True),
        Column('ticker_id', Integer, ForeignKey('tickers.id'), nullable=False),
        Column('provider_id', Integer, ForeignKey('external_data_providers.id'), nullable=False),
        Column('slot_start_utc', DateTime, nullable=False),
        Column('open_price', Float, nullable=False),
        Column('high_price', Float, nullable=False),
        Column('low_price', Float, nullable=False),
        Column('close_price', Float, nullable=False),
        Column('volume', Integer, nullable=False),
        Column('slot_duration_minutes', Integer, nullable=False),
        Column('is_complete', BOOLEAN, default=False),
        Column('created_at', DateTime, nullable=False),
        Column('updated_at', DateTime, nullable=True)
    )
    
    # Create all tables
    metadata.create_all(engine)
    
    # Create indexes for performance
    with engine.connect() as conn:
        # Indexes for market_data_quotes
        conn.execute("CREATE INDEX IF NOT EXISTS idx_market_data_quotes_ticker_provider ON market_data_quotes(ticker_id, provider_id)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_market_data_quotes_asof_utc ON market_data_quotes(asof_utc)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_market_data_quotes_fetched_at ON market_data_quotes(fetched_at)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_market_data_quotes_stale ON market_data_quotes(is_stale)")
        
        # Indexes for data_refresh_logs
        conn.execute("CREATE INDEX IF NOT EXISTS idx_data_refresh_logs_provider ON data_refresh_logs(provider_id)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_data_refresh_logs_operation_type ON data_refresh_logs(operation_type)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_data_refresh_logs_status ON data_refresh_logs(status)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_data_refresh_logs_start_time ON data_refresh_logs(start_time)")
        
        # Indexes for intraday_data_slots
        conn.execute("CREATE INDEX IF NOT EXISTS idx_intraday_data_slots_ticker_provider_slot ON intraday_data_slots(ticker_id, provider_id, slot_start_utc)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_intraday_data_slots_slot_start_utc ON intraday_data_slots(slot_start_utc)")
        
        # Unique constraint for intraday_data_slots
        conn.execute("CREATE UNIQUE INDEX IF NOT EXISTS ux_intraday_data_slots_ticker_provider_slot ON intraday_data_slots(ticker_id, provider_id, slot_start_utc)")
        
        conn.commit()
    
    print("✅ External data integration tables created successfully")
    print("✅ All indexes created successfully")


def downgrade():
    """Drop external data integration tables"""
    engine = create_engine(DATABASE_URL)
    metadata = MetaData()
    
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
            with engine.connect() as conn:
                conn.execute(f"DROP TABLE IF EXISTS {table_name}")
                conn.commit()
                print(f"✅ Dropped table: {table_name}")
        except Exception as e:
            print(f"⚠️ Error dropping table {table_name}: {e}")
    
    print("✅ External data integration tables dropped successfully")


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "down":
        print("🔄 Downgrading external data integration tables...")
        downgrade()
    else:
        print("🔄 Upgrading to create external data integration tables...")
        upgrade()
