#!/usr/bin/env python3
"""
Add open price fields to market_data_quotes table
=================================================

This migration adds three new columns to the market_data_quotes table:
- open_price: Daily open price
- change_pct_from_open: Change percentage from open
- change_amount_from_open: Change amount from open

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


def add_open_price_fields():
    """Add open price fields to market_data_quotes table."""
    
    if USE_SQLALCHEMY:
        # Check if using SQLite or PostgreSQL
        is_sqlite = USING_SQLITE if 'USING_SQLITE' in globals() else DATABASE_URL.startswith('sqlite')
        engine = create_engine(DATABASE_URL)
        
        if is_sqlite:
            print(f"➡️  Using database: SQLite")
            db_path = DATABASE_URL.replace('sqlite:///', '')
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            
            try:
                table = 'market_data_quotes'
                
                # Check and add open_price column
                if column_exists_sqlite(cursor, table, 'open_price'):
                    print("✅ Column 'open_price' already exists - skipping.")
                else:
                    print("➕ Adding 'open_price' column (FLOAT NULL)...")
                    cursor.execute("ALTER TABLE market_data_quotes ADD COLUMN open_price FLOAT NULL;")
                    print("✅ Column 'open_price' added successfully.")
                
                # Check and add change_pct_from_open column
                if column_exists_sqlite(cursor, table, 'change_pct_from_open'):
                    print("✅ Column 'change_pct_from_open' already exists - skipping.")
                else:
                    print("➕ Adding 'change_pct_from_open' column (FLOAT NULL)...")
                    cursor.execute("ALTER TABLE market_data_quotes ADD COLUMN change_pct_from_open FLOAT NULL;")
                    print("✅ Column 'change_pct_from_open' added successfully.")
                
                # Check and add change_amount_from_open column
                if column_exists_sqlite(cursor, table, 'change_amount_from_open'):
                    print("✅ Column 'change_amount_from_open' already exists - skipping.")
                else:
                    print("➕ Adding 'change_amount_from_open' column (FLOAT NULL)...")
                    cursor.execute("ALTER TABLE market_data_quotes ADD COLUMN change_amount_from_open FLOAT NULL;")
                    print("✅ Column 'change_amount_from_open' added successfully.")
                
                conn.commit()
                print("🎉 Migration completed successfully.")
                conn.close()
                
            except Exception as error:
                conn.rollback()
                conn.close()
                print(f"❌ Database error: {error}")
                raise
        else:
            # PostgreSQL path
            print(f"➡️  Using database: PostgreSQL")
            
            with engine.connect() as conn:
                trans = conn.begin()
                try:
                    table = 'market_data_quotes'
                    
                    # Check and add open_price column
                    if column_exists_postgres(engine, table, 'open_price'):
                        print("✅ Column 'open_price' already exists - skipping.")
                    else:
                        print("➕ Adding 'open_price' column (FLOAT NULL)...")
                        conn.execute(text("ALTER TABLE market_data_quotes ADD COLUMN open_price FLOAT NULL;"))
                        print("✅ Column 'open_price' added successfully.")
                    
                    # Check and add change_pct_from_open column
                    if column_exists_postgres(engine, table, 'change_pct_from_open'):
                        print("✅ Column 'change_pct_from_open' already exists - skipping.")
                    else:
                        print("➕ Adding 'change_pct_from_open' column (FLOAT NULL)...")
                        conn.execute(text("ALTER TABLE market_data_quotes ADD COLUMN change_pct_from_open FLOAT NULL;"))
                        print("✅ Column 'change_pct_from_open' added successfully.")
                    
                    # Check and add change_amount_from_open column
                    if column_exists_postgres(engine, table, 'change_amount_from_open'):
                        print("✅ Column 'change_amount_from_open' already exists - skipping.")
                    else:
                        print("➕ Adding 'change_amount_from_open' column (FLOAT NULL)...")
                        conn.execute(text("ALTER TABLE market_data_quotes ADD COLUMN change_amount_from_open FLOAT NULL;"))
                        print("✅ Column 'change_amount_from_open' added successfully.")
                    
                    trans.commit()
                    print("🎉 Migration completed successfully.")
                    
                except Exception as error:
                    trans.rollback()
                    print(f"❌ Database error: {error}")
                    raise
    else:
        # SQLite path (fallback)
        db_path = get_db_path()
        print(f"➡️  Using database: {db_path}")
        
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        try:
            table = 'market_data_quotes'
            
            # Check and add open_price column
            if column_exists_sqlite(cursor, table, 'open_price'):
                print("✅ Column 'open_price' already exists - skipping.")
            else:
                print("➕ Adding 'open_price' column (FLOAT NULL)...")
                cursor.execute("ALTER TABLE market_data_quotes ADD COLUMN open_price FLOAT NULL;")
                print("✅ Column 'open_price' added successfully.")
            
            # Check and add change_pct_from_open column
            if column_exists_sqlite(cursor, table, 'change_pct_from_open'):
                print("✅ Column 'change_pct_from_open' already exists - skipping.")
            else:
                print("➕ Adding 'change_pct_from_open' column (FLOAT NULL)...")
                cursor.execute("ALTER TABLE market_data_quotes ADD COLUMN change_pct_from_open FLOAT NULL;")
                print("✅ Column 'change_pct_from_open' added successfully.")
            
            # Check and add change_amount_from_open column
            if column_exists_sqlite(cursor, table, 'change_amount_from_open'):
                print("✅ Column 'change_amount_from_open' already exists - skipping.")
            else:
                print("➕ Adding 'change_amount_from_open' column (FLOAT NULL)...")
                cursor.execute("ALTER TABLE market_data_quotes ADD COLUMN change_amount_from_open FLOAT NULL;")
                print("✅ Column 'change_amount_from_open' added successfully.")
            
            conn.commit()
            print("🎉 Migration completed successfully.")
            
        except sqlite3.Error as error:
            print(f"❌ SQLite error: {error}")
            conn.rollback()
            raise
        finally:
            conn.close()


if __name__ == "__main__":
    add_open_price_fields()

