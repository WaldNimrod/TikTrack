#!/usr/bin/env python3
"""
Add ATR (Average True Range) fields to market_data_quotes table
===============================================================

This migration adds two new columns to the market_data_quotes table:
- atr: Average True Range value (FLOAT NULL)
- atr_period: ATR calculation period in days (INTEGER, default 14)

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


def add_atr_fields():
    """Add ATR fields to market_data_quotes table (PostgreSQL only)."""
    
    # PostgreSQL only - SQLite is no longer supported
    print(f"➡️  Using database: PostgreSQL")
    engine = create_engine(DATABASE_URL)
    
    with engine.connect() as conn:
        trans = conn.begin()
        try:
            table = 'market_data_quotes'
            
            # Check and add atr column
            if column_exists_postgres(engine, table, 'atr'):
                print("✅ Column 'atr' already exists - skipping.")
            else:
                print("➕ Adding 'atr' column (FLOAT NULL)...")
                conn.execute(text("ALTER TABLE market_data_quotes ADD COLUMN atr FLOAT NULL;"))
                print("✅ Column 'atr' added successfully.")
            
            # Check and add atr_period column
            if column_exists_postgres(engine, table, 'atr_period'):
                print("✅ Column 'atr_period' already exists - skipping.")
            else:
                print("➕ Adding 'atr_period' column (INTEGER DEFAULT 14)...")
                conn.execute(text("ALTER TABLE market_data_quotes ADD COLUMN atr_period INTEGER DEFAULT 14;"))
                print("✅ Column 'atr_period' added successfully.")
            
            trans.commit()
            print("🎉 Migration completed successfully.")
            
        except Exception as error:
            trans.rollback()
            print(f"❌ Database error: {error}")
            raise


if __name__ == "__main__":
    add_atr_fields()

