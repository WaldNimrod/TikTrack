#!/usr/bin/env python3
"""
Add custom fields and status to user_tickers table
==================================================

This migration adds new columns to the user_tickers table:
- name_custom: Custom company name for this user (VARCHAR(100) NULL)
- type_custom: Custom asset type for this user (VARCHAR(20) NULL)
- status: User-ticker association status (VARCHAR(20) DEFAULT 'open' NOT NULL)
- updated_at: Last update timestamp (TIMESTAMP WITH TIME ZONE NULL)

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


def add_user_ticker_custom_fields():
    """Add custom fields and status to user_tickers table (PostgreSQL only)."""
    
    # PostgreSQL only
    print(f"➡️  Using database: PostgreSQL")
    engine = create_engine(DATABASE_URL)
    
    with engine.connect() as conn:
        trans = conn.begin()
        try:
            table = 'user_tickers'
            
            # Check and add name_custom column
            if column_exists_postgres(engine, table, 'name_custom'):
                print("✅ Column 'name_custom' already exists - skipping.")
            else:
                print("➕ Adding 'name_custom' column (VARCHAR(100) NULL)...")
                conn.execute(text("ALTER TABLE user_tickers ADD COLUMN name_custom VARCHAR(100) NULL;"))
                print("✅ Column 'name_custom' added successfully.")
            
            # Check and add type_custom column
            if column_exists_postgres(engine, table, 'type_custom'):
                print("✅ Column 'type_custom' already exists - skipping.")
            else:
                print("➕ Adding 'type_custom' column (VARCHAR(20) NULL)...")
                conn.execute(text("ALTER TABLE user_tickers ADD COLUMN type_custom VARCHAR(20) NULL;"))
                print("✅ Column 'type_custom' added successfully.")
            
            # Check and add status column
            if column_exists_postgres(engine, table, 'status'):
                print("✅ Column 'status' already exists - skipping.")
            else:
                print("➕ Adding 'status' column (VARCHAR(20) DEFAULT 'open' NOT NULL)...")
                # First add column as nullable
                conn.execute(text("ALTER TABLE user_tickers ADD COLUMN status VARCHAR(20) NULL;"))
                # Set default value for existing rows
                conn.execute(text("UPDATE user_tickers SET status = 'open' WHERE status IS NULL;"))
                # Make it NOT NULL with default
                conn.execute(text("ALTER TABLE user_tickers ALTER COLUMN status SET DEFAULT 'open';"))
                conn.execute(text("ALTER TABLE user_tickers ALTER COLUMN status SET NOT NULL;"))
                print("✅ Column 'status' added successfully.")
            
            # Check and add updated_at column
            if column_exists_postgres(engine, table, 'updated_at'):
                print("✅ Column 'updated_at' already exists - skipping.")
            else:
                print("➕ Adding 'updated_at' column (TIMESTAMP WITH TIME ZONE NULL)...")
                conn.execute(text("ALTER TABLE user_tickers ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE NULL;"))
                print("✅ Column 'updated_at' added successfully.")
            
            # Update created_at to use timezone if it doesn't already
            # Check if created_at is already timestamp with time zone
            with engine.connect() as check_conn:
                result = check_conn.execute(text("""
                    SELECT data_type 
                    FROM information_schema.columns 
                    WHERE table_name = :table_name AND column_name = 'created_at'
                """), {"table_name": table})
                row = result.fetchone()
                if row and row[0] != 'timestamp with time zone':
                    print("🔄 Updating 'created_at' column to TIMESTAMP WITH TIME ZONE...")
                    conn.execute(text("ALTER TABLE user_tickers ALTER COLUMN created_at TYPE TIMESTAMP WITH TIME ZONE USING created_at AT TIME ZONE 'UTC';"))
                    print("✅ Column 'created_at' updated successfully.")
                else:
                    print("✅ Column 'created_at' already has correct type - skipping.")
            
            trans.commit()
            print("🎉 Migration completed successfully.")
            
        except Exception as error:
            trans.rollback()
            print(f"❌ Database error: {error}")
            raise


if __name__ == "__main__":
    add_user_ticker_custom_fields()

