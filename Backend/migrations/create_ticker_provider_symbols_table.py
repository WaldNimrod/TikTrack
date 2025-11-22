"""
Migration: Create Ticker Provider Symbols Table
Creates the ticker_provider_symbols table for mapping internal ticker symbols
to provider-specific symbol formats.

Supports both SQLite and PostgreSQL databases.

Date: 2025-01-27
Author: TikTrack Development Team
"""

import os
import sys
from datetime import datetime

# Add the parent directory to the path so we can import models
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config.settings import DATABASE_URL, USING_SQLITE
from sqlalchemy import create_engine, text, inspect
from sqlalchemy.exc import SQLAlchemyError

def check_table_exists(engine, table_name):
    """Check if table exists in database"""
    inspector = inspect(engine)
    return table_name in inspector.get_table_names()

def verify_required_tables(engine):
    """Verify that required tables exist"""
    inspector = inspect(engine)
    existing_tables = inspector.get_table_names()
    
    required_tables = ['tickers', 'external_data_providers']
    missing_tables = [t for t in required_tables if t not in existing_tables]
    
    if missing_tables:
        raise Exception(f"Required tables do not exist: {', '.join(missing_tables)}")
    
    return True

def create_table_sqlite(conn):
    """Create table for SQLite"""
    cursor = conn.cursor()
    
    cursor.execute("""
        CREATE TABLE ticker_provider_symbols (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ticker_id INTEGER NOT NULL,
            provider_id INTEGER NOT NULL,
            provider_symbol VARCHAR(50) NOT NULL,
            is_primary BOOLEAN DEFAULT FALSE NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME,
            UNIQUE(ticker_id, provider_id),
            FOREIGN KEY (ticker_id) REFERENCES tickers(id) ON DELETE CASCADE,
            FOREIGN KEY (provider_id) REFERENCES external_data_providers(id)
        )
    """)
    
    # Create indexes
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_ticker_provider_symbols_ticker_id 
        ON ticker_provider_symbols(ticker_id)
    """)
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_ticker_provider_symbols_provider_id 
        ON ticker_provider_symbols(provider_id)
    """)
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_ticker_provider_symbols_provider_symbol 
        ON ticker_provider_symbols(provider_symbol)
    """)
    
    conn.commit()

def create_table_postgresql(conn):
    """Create table for PostgreSQL"""
    with conn.begin():
        conn.execute(text("""
            CREATE TABLE ticker_provider_symbols (
                id SERIAL PRIMARY KEY,
                ticker_id INTEGER NOT NULL,
                provider_id INTEGER NOT NULL,
                provider_symbol VARCHAR(50) NOT NULL,
                is_primary BOOLEAN DEFAULT FALSE NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE,
                CONSTRAINT uq_ticker_provider_symbols_ticker_provider 
                    UNIQUE (ticker_id, provider_id),
                CONSTRAINT fk_ticker_provider_symbols_ticker 
                    FOREIGN KEY (ticker_id) REFERENCES tickers(id) ON DELETE CASCADE,
                CONSTRAINT fk_ticker_provider_symbols_provider 
                    FOREIGN KEY (provider_id) REFERENCES external_data_providers(id)
            )
        """))
        
        # Create indexes
        conn.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_ticker_provider_symbols_ticker_id 
            ON ticker_provider_symbols(ticker_id)
        """))
        conn.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_ticker_provider_symbols_provider_id 
            ON ticker_provider_symbols(provider_id)
        """))
        conn.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_ticker_provider_symbols_provider_symbol 
            ON ticker_provider_symbols(provider_symbol)
        """))

def verify_table_structure(engine):
    """Verify table structure after creation"""
    inspector = inspect(engine)
    columns = inspector.get_columns('ticker_provider_symbols')
    
    print("Table structure:")
    for col in columns:
        nullable = "NULL" if col['nullable'] else "NOT NULL"
        default = f" DEFAULT {col['default']}" if col.get('default') else ""
        print(f"  - {col['name']} ({col['type']}) {nullable}{default}")

def run_migration(database_url=None):
    """Run the migration"""
    if database_url is None:
        database_url = DATABASE_URL
    
    using_sqlite = database_url.startswith("sqlite")
    
    print("=" * 70)
    print("Create Ticker Provider Symbols Table Migration")
    print("=" * 70)
    print(f"Database: {database_url}")
    print(f"Type: {'SQLite' if using_sqlite else 'PostgreSQL'}")
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    try:
        engine = create_engine(database_url)
        
        # Check if table already exists
        print("[1/4] Checking if table already exists...")
        if check_table_exists(engine, 'ticker_provider_symbols'):
            print("⚠️  Table 'ticker_provider_symbols' already exists")
            response = input("Continue anyway? This will drop and recreate the table (y/n): ")
            if response.lower() != 'y':
                print("Migration cancelled")
                return False
            
            print("Dropping existing table...")
            with engine.begin() as conn:
                conn.execute(text("DROP TABLE IF EXISTS ticker_provider_symbols CASCADE"))
            print("✓ Existing table dropped")
        else:
            print("✓ Table does not exist - will create new")
        
        print()
        
        # Step 2: Verify required tables exist
        print("[2/4] Verifying required tables exist...")
        verify_required_tables(engine)
        print("✓ Required tables verified")
        print()
        
        # Step 3: Create the table
        print("[3/4] Creating ticker_provider_symbols table...")
        with engine.connect() as conn:
            if using_sqlite:
                create_table_sqlite(conn)
            else:
                create_table_postgresql(conn)
        print("✓ Table created")
        print()
        
        # Step 4: Verify table structure
        print("[4/4] Verifying table structure...")
        verify_table_structure(engine)
        print("✓ Table structure verified")
        print()
        
        print("✅ Migration completed successfully!")
        return True
        
    except SQLAlchemyError as e:
        print(f"❌ Database error during migration: {e}")
        import traceback
        traceback.print_exc()
        return False
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    import sys
    
    database_url = None
    if len(sys.argv) > 1:
        database_url = sys.argv[1]
    
    success = run_migration(database_url)
    sys.exit(0 if success else 1)

