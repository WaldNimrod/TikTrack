#!/usr/bin/env python3
"""
Add daily OHLC fields to market_data_quotes table
==================================================

This migration adds three new columns to the market_data_quotes table:
- high_price: Daily high price (FLOAT NULL)
- low_price: Daily low price (FLOAT NULL)
- close_price: Daily close price (FLOAT NULL)

These fields are essential for ATR calculation and historical analysis.
Storage policy: Keep full OHLC for last 30 days, only open/close for older data.

The script is idempotent: it checks whether the columns already exist before attempting to create them.

Author: TikTrack Development Team
Date: January 2025
"""

import os
import sys
from datetime import datetime

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy import create_engine, text
from config.settings import DATABASE_URL


def column_exists_postgres(engine, table: str, column: str) -> bool:
    """Check whether a specific column exists in a table (PostgreSQL)."""
    with engine.connect() as conn:
        result = conn.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = :table_name AND column_name = :column_name
        """), {"table_name": table, "column_name": column})
        return result.fetchone() is not None


def add_daily_ohlc_fields():
    """Add daily OHLC fields to market_data_quotes table (PostgreSQL only)."""
    
    # PostgreSQL only
    print(f"➡️  Using database: PostgreSQL")
    engine = create_engine(DATABASE_URL)
    
    with engine.connect() as conn:
        trans = conn.begin()
        try:
            table = 'market_data_quotes'
            
            # Check and add high_price column
            if column_exists_postgres(engine, table, 'high_price'):
                print("✅ Column 'high_price' already exists - skipping.")
            else:
                print("➕ Adding 'high_price' column (FLOAT NULL)...")
                conn.execute(text("ALTER TABLE market_data_quotes ADD COLUMN high_price FLOAT NULL;"))
                print("✅ Column 'high_price' added successfully.")
            
            # Check and add low_price column
            if column_exists_postgres(engine, table, 'low_price'):
                print("✅ Column 'low_price' already exists - skipping.")
            else:
                print("➕ Adding 'low_price' column (FLOAT NULL)...")
                conn.execute(text("ALTER TABLE market_data_quotes ADD COLUMN low_price FLOAT NULL;"))
                print("✅ Column 'low_price' added successfully.")
            
            # Check and add close_price column
            if column_exists_postgres(engine, table, 'close_price'):
                print("✅ Column 'close_price' already exists - skipping.")
            else:
                print("➕ Adding 'close_price' column (FLOAT NULL)...")
                conn.execute(text("ALTER TABLE market_data_quotes ADD COLUMN close_price FLOAT NULL;"))
                print("✅ Column 'close_price' added successfully.")
            
            trans.commit()
            print("🎉 Migration completed successfully.")
            
        except Exception as error:
            trans.rollback()
            print(f"❌ Database error: {error}")
            raise


if __name__ == "__main__":
    add_daily_ohlc_fields()
