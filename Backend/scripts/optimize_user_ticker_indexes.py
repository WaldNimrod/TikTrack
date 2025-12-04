#!/usr/bin/env python3
"""
Optimize Indexes for User-Ticker Integration
============================================

Creates optimized indexes for user_tickers table to improve query performance.

Author: TikTrack Development Team
Date: January 2025
"""

import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy import create_engine, text
from config.settings import DATABASE_URL

def optimize_indexes():
    """Create optimized indexes for user_tickers table"""
    
    print("🔄 Optimizing indexes for user_tickers table...")
    print(f"➡️  Using database: PostgreSQL")
    
    engine = create_engine(DATABASE_URL)
    
    with engine.connect() as conn:
        trans = conn.begin()
        try:
            # Check existing indexes
            result = conn.execute(text("""
                SELECT indexname 
                FROM pg_indexes 
                WHERE tablename = 'user_tickers'
            """))
            existing_indexes = {row[0] for row in result}
            
            # Index for filtering by user_id and status (common query pattern)
            if 'idx_user_tickers_user_status' not in existing_indexes:
                print("➕ Creating index on (user_id, status)...")
                conn.execute(text("""
                    CREATE INDEX idx_user_tickers_user_status 
                    ON user_tickers(user_id, status)
                """))
                print("✅ Index created")
            else:
                print("✅ Index idx_user_tickers_user_status already exists")
            
            # Index for filtering by ticker_id and status (for ticker status calculation)
            if 'idx_user_tickers_ticker_status' not in existing_indexes:
                print("➕ Creating index on (ticker_id, status)...")
                conn.execute(text("""
                    CREATE INDEX idx_user_tickers_ticker_status 
                    ON user_tickers(ticker_id, status)
                """))
                print("✅ Index created")
            else:
                print("✅ Index idx_user_tickers_ticker_status already exists")
            
            # Index for status alone (if not exists)
            if 'idx_user_tickers_status' not in existing_indexes:
                print("➕ Creating index on status...")
                conn.execute(text("""
                    CREATE INDEX idx_user_tickers_status 
                    ON user_tickers(status)
                """))
                print("✅ Index created")
            else:
                print("✅ Index idx_user_tickers_status already exists")
            
            trans.commit()
            print("🎉 Index optimization completed successfully.")
            
        except Exception as error:
            trans.rollback()
            print(f"❌ Database error: {error}")
            raise

if __name__ == "__main__":
    optimize_indexes()


