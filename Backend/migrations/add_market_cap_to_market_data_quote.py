#!/usr/bin/env python3
"""
Add market_cap column to market_data_quotes table

This migration adds the market_cap field to store market capitalization data
for tickers fetched from external data providers.

Author: TikTrack Development Team
Date: December 6, 2025
"""

import os
import sys
from sqlalchemy import create_engine, text, inspect
from sqlalchemy.exc import ProgrammingError

# Add Backend directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config.settings import DATABASE_URL

def column_exists(engine, table_name: str, column_name: str) -> bool:
    """Check if a column exists in a table"""
    inspector = inspect(engine)
    columns = [col['name'] for col in inspector.get_columns(table_name)]
    return column_name in columns

def add_market_cap_column():
    """Add market_cap column to market_data_quotes table"""
    print("🔄 Starting migration: Add market_cap to market_data_quotes")
    print(f"➡️  Using database: PostgreSQL")
    
    try:
        engine = create_engine(DATABASE_URL)
        
        with engine.connect() as conn:
            trans = conn.begin()
            try:
                # Check if column already exists
                if column_exists(engine, 'market_data_quotes', 'market_cap'):
                    print("✅ Column 'market_cap' already exists in market_data_quotes table - skipping.")
                    trans.rollback()
                    return
                
                print("➕ Adding 'market_cap' column to market_data_quotes table...")
                
                # Add the column
                conn.execute(text("""
                    ALTER TABLE market_data_quotes
                    ADD COLUMN market_cap DOUBLE PRECISION
                """))
                
                print("✅ Column 'market_cap' added successfully.")
                
                trans.commit()
                print("🎉 Migration completed successfully.")
                
            except Exception as error:
                trans.rollback()
                print(f"❌ Database error: {error}")
                raise
                
    except Exception as error:
        print(f"❌ Migration failed: {error}")
        sys.exit(1)

if __name__ == "__main__":
    add_market_cap_column()


