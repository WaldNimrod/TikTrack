#!/usr/bin/env python3
"""
Add indexes to user_tickers table for performance
==================================================

This migration adds indexes to improve query performance:
- Index on user_id for faster user ticker lookups
- Index on ticker_id for faster ticker association lookups
- Index on status for faster status filtering

Author: TikTrack Development Team
Date: January 2025
"""

import os
import sys
from datetime import datetime

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy import create_engine, text
from config.settings import DATABASE_URL


def index_exists_postgres(engine, table: str, index: str) -> bool:
    """Check whether a specific index exists"""
    with engine.connect() as conn:
        result = conn.execute(text("""
            SELECT indexname 
            FROM pg_indexes 
            WHERE tablename = :table_name AND indexname = :index_name
        """), {"table_name": table, "index_name": index})
        return result.fetchone() is not None


def add_user_tickers_indexes():
    """Add indexes to user_tickers table for performance"""
    
    print(f"➡️  Using database: PostgreSQL")
    engine = create_engine(DATABASE_URL)
    
    with engine.connect() as conn:
        trans = conn.begin()
        try:
            table = 'user_tickers'
            
            # Index on user_id
            index_name = 'user_tickers_user_id_idx'
            if index_exists_postgres(engine, table, index_name):
                print(f"✅ Index '{index_name}' already exists - skipping.")
            else:
                print(f"➕ Creating index '{index_name}' on user_id...")
                conn.execute(text(f"CREATE INDEX {index_name} ON {table} (user_id);"))
                print(f"✅ Index '{index_name}' created successfully.")
            
            # Index on ticker_id
            index_name = 'user_tickers_ticker_id_idx'
            if index_exists_postgres(engine, table, index_name):
                print(f"✅ Index '{index_name}' already exists - skipping.")
            else:
                print(f"➕ Creating index '{index_name}' on ticker_id...")
                conn.execute(text(f"CREATE INDEX {index_name} ON {table} (ticker_id);"))
                print(f"✅ Index '{index_name}' created successfully.")
            
            # Composite index on (user_id, ticker_id) for faster lookups
            index_name = 'user_tickers_user_ticker_idx'
            if index_exists_postgres(engine, table, index_name):
                print(f"✅ Index '{index_name}' already exists - skipping.")
            else:
                print(f"➕ Creating composite index '{index_name}' on (user_id, ticker_id)...")
                conn.execute(text(f"CREATE INDEX {index_name} ON {table} (user_id, ticker_id);"))
                print(f"✅ Index '{index_name}' created successfully.")
            
            # Index on status for faster filtering
            index_name = 'user_tickers_status_idx'
            if index_exists_postgres(engine, table, index_name):
                print(f"✅ Index '{index_name}' already exists - skipping.")
            else:
                print(f"➕ Creating index '{index_name}' on status...")
                conn.execute(text(f"CREATE INDEX {index_name} ON {table} (status);"))
                print(f"✅ Index '{index_name}' created successfully.")
            
            # Composite index on (ticker_id, status) for status calculation
            index_name = 'user_tickers_ticker_status_idx'
            if index_exists_postgres(engine, table, index_name):
                print(f"✅ Index '{index_name}' already exists - skipping.")
            else:
                print(f"➕ Creating composite index '{index_name}' on (ticker_id, status)...")
                conn.execute(text(f"CREATE INDEX {index_name} ON {table} (ticker_id, status);"))
                print(f"✅ Index '{index_name}' created successfully.")
            
            trans.commit()
            print("🎉 Index migration completed successfully.")
            
        except Exception as error:
            trans.rollback()
            print(f"❌ Database error: {error}")
            raise


if __name__ == "__main__":
    add_user_tickers_indexes()

