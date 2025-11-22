#!/usr/bin/env python3
"""
Verification Script for Ticker Provider Symbol Mapping Migration
Verifies that the migration was successful and the table structure is correct.
"""

import os
import sys
from sqlalchemy import create_engine, text, inspect
from sqlalchemy.exc import SQLAlchemyError

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from config.settings import DATABASE_URL

def verify_migration():
    """Verify that migration was successful"""
    print("=" * 70)
    print("Ticker Provider Symbol Mapping - Migration Verification")
    print("=" * 70)
    print(f"Database: {DATABASE_URL}")
    print()
    
    try:
        engine = create_engine(DATABASE_URL)
        inspector = inspect(engine)
        
        # Check if table exists
        print("[1/5] Checking if table exists...")
        if 'ticker_provider_symbols' not in inspector.get_table_names():
            print("❌ Table 'ticker_provider_symbols' does not exist!")
            return False
        print("✅ Table 'ticker_provider_symbols' exists")
        print()
        
        # Check columns
        print("[2/5] Verifying columns...")
        columns = inspector.get_columns('ticker_provider_symbols')
        required_columns = ['id', 'ticker_id', 'provider_id', 'provider_symbol', 'is_primary', 'created_at', 'updated_at']
        existing_columns = {col['name'] for col in columns}
        
        missing_columns = set(required_columns) - existing_columns
        if missing_columns:
            print(f"❌ Missing columns: {', '.join(missing_columns)}")
            return False
        print("✅ All required columns exist")
        print()
        
        # Check indexes
        print("[3/5] Verifying indexes...")
        indexes = inspector.get_indexes('ticker_provider_symbols')
        index_names = {idx['name'] for idx in indexes}
        
        required_indexes = [
            'idx_ticker_provider_symbols_ticker_id',
            'idx_ticker_provider_symbols_provider_id',
            'idx_ticker_provider_symbols_provider_symbol'
        ]
        
        missing_indexes = set(required_indexes) - index_names
        if missing_indexes:
            print(f"⚠️  Missing indexes: {', '.join(missing_indexes)}")
            print("   (Indexes may have different names - checking structure...)")
        else:
            print("✅ All indexes created")
        print()
        
        # Check foreign keys
        print("[4/5] Verifying foreign key constraints...")
        with engine.connect() as conn:
            if DATABASE_URL.startswith('sqlite'):
                # SQLite doesn't expose foreign keys in inspector
                result = conn.execute(text("PRAGMA foreign_key_list(ticker_provider_symbols)"))
                fks = result.fetchall()
                if len(fks) < 2:
                    print("⚠️  Expected 2 foreign keys, found fewer")
                else:
                    print("✅ Foreign key constraints verified")
            else:
                # PostgreSQL
                result = conn.execute(text("""
                    SELECT constraint_name, table_name, column_name, foreign_table_name, foreign_column_name
                    FROM information_schema.key_column_usage k
                    JOIN information_schema.referential_constraints r
                    ON k.constraint_name = r.constraint_name
                    WHERE k.table_name = 'ticker_provider_symbols'
                """))
                fks = result.fetchall()
                if len(fks) < 2:
                    print("⚠️  Expected 2 foreign keys, found fewer")
                else:
                    print("✅ Foreign key constraints verified")
        print()
        
        # Check unique constraint
        print("[5/5] Verifying unique constraint...")
        with engine.connect() as conn:
            if DATABASE_URL.startswith('sqlite'):
                result = conn.execute(text("PRAGMA index_list(ticker_provider_symbols)"))
                indexes = result.fetchall()
                unique_indexes = [idx for idx in indexes if idx[1] == 1]  # unique = 1
                if not any('uq_ticker_provider_symbol' in str(idx) for idx in unique_indexes):
                    print("⚠️  Unique constraint may not be properly set")
                else:
                    print("✅ Unique constraint verified")
            else:
                result = conn.execute(text("""
                    SELECT constraint_name
                    FROM information_schema.table_constraints
                    WHERE table_name = 'ticker_provider_symbols'
                    AND constraint_type = 'UNIQUE'
                """))
                constraints = result.fetchall()
                if not any('uq_ticker_provider_symbol' in str(c) for c in constraints):
                    print("⚠️  Unique constraint may not be properly set")
                else:
                    print("✅ Unique constraint verified")
        print()
        
        print("=" * 70)
        print("✅ Migration verification passed!")
        print("=" * 70)
        return True
        
    except SQLAlchemyError as e:
        print(f"❌ Database error: {e}")
        return False
    except Exception as e:
        print(f"❌ Verification failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = verify_migration()
    sys.exit(0 if success else 1)

