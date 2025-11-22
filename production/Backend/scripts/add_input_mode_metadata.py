#!/usr/bin/env python3
"""
Migration Script: Add Input Mode Metadata to trade_plans
=========================================================

Purpose: Track user input preferences for amount/shares and price/percentage choices
Date: January 12, 2025
Author: TikTrack Development Team

Changes:
1. Add amount_input_mode column (TEXT: 'amount' or 'shares')
2. Add stop_input_mode column (TEXT: 'price' or 'percentage')
3. Add target_input_mode column (TEXT: 'price' or 'percentage')
4. Remove current_price column (deprecated - use ticker price instead)
5. Set default values for existing records

Rollback: See rollback_input_mode_metadata.py
"""

import sqlite3
import sys
import os
from datetime import datetime

# Add parent directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'db', 'tiktrack.db')

def run_migration():
    """Run the migration"""
    print("=" * 60)
    print("🚀 Starting Input Mode Metadata Migration")
    print("=" * 60)
    print(f"📁 Database: {DB_PATH}")
    print(f"⏰ Time: {datetime.now()}")
    print()
    
    # Connect to database
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # Step 1: Add amount_input_mode column
        print("1️⃣ Adding amount_input_mode column...")
        cursor.execute("""
            ALTER TABLE trade_plans 
            ADD COLUMN amount_input_mode TEXT 
            CHECK(amount_input_mode IN ('amount', 'shares')) 
            DEFAULT 'amount'
        """)
        print("   ✅ amount_input_mode added")
        
        # Step 2: Add stop_input_mode column
        print("2️⃣ Adding stop_input_mode column...")
        cursor.execute("""
            ALTER TABLE trade_plans 
            ADD COLUMN stop_input_mode TEXT 
            CHECK(stop_input_mode IN ('price', 'percentage')) 
            DEFAULT 'price'
        """)
        print("   ✅ stop_input_mode added")
        
        # Step 3: Add target_input_mode column
        print("3️⃣ Adding target_input_mode column...")
        cursor.execute("""
            ALTER TABLE trade_plans 
            ADD COLUMN target_input_mode TEXT 
            CHECK(target_input_mode IN ('price', 'percentage')) 
            DEFAULT 'price'
        """)
        print("   ✅ target_input_mode added")
        
        # Step 4: Update existing records with default values
        print("4️⃣ Updating existing records with default values...")
        cursor.execute("""
            UPDATE trade_plans 
            SET amount_input_mode = 'amount',
                stop_input_mode = 'price',
                target_input_mode = 'price'
            WHERE amount_input_mode IS NULL 
               OR stop_input_mode IS NULL 
               OR target_input_mode IS NULL
        """)
        updated_rows = cursor.rowcount
        print(f"   ✅ Updated {updated_rows} existing records")
        
        # Step 5: Remove current_price column (SQLite limitation workaround)
        print("5️⃣ Removing current_price column...")
        print("   ℹ️  SQLite doesn't support DROP COLUMN directly")
        print("   ℹ️  Creating new table without current_price...")
        
        # Get current schema
        cursor.execute("PRAGMA table_info(trade_plans)")
        columns = cursor.fetchall()
        
        # Build new column list (exclude current_price)
        new_columns = []
        old_columns = []
        for col in columns:
            col_name = col[1]
            if col_name != 'current_price':
                new_columns.append(col_name)
                old_columns.append(col_name)
        
        new_columns_str = ', '.join(new_columns)
        old_columns_str = ', '.join(old_columns)
        
        # Create new table
        cursor.execute("""
            CREATE TABLE trade_plans_new (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                trading_account_id INTEGER NOT NULL,
                ticker_id INTEGER NOT NULL,
                investment_type VARCHAR(20) DEFAULT 'swing' NOT NULL,
                side VARCHAR(10) DEFAULT 'Long' NOT NULL,
                status VARCHAR(20) DEFAULT 'open' NOT NULL,
                planned_amount FLOAT DEFAULT 1000 NOT NULL,
                entry_conditions VARCHAR(500),
                stop_price FLOAT,
                target_price FLOAT,
                stop_percentage FLOAT GENERATED ALWAYS AS (
                    CASE WHEN stop_price IS NOT NULL 
                    THEN ROUND(ABS((stop_price / planned_amount - 1) * 100), 2)
                    ELSE NULL END
                ) VIRTUAL,
                target_percentage FLOAT GENERATED ALWAYS AS (
                    CASE WHEN target_price IS NOT NULL 
                    THEN ROUND(ABS((target_price / planned_amount - 1) * 100), 2)
                    ELSE NULL END
                ) VIRTUAL,
                reasons VARCHAR(500),
                cancelled_at DATETIME,
                cancel_reason VARCHAR(500),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                amount_input_mode TEXT CHECK(amount_input_mode IN ('amount', 'shares')) DEFAULT 'amount',
                stop_input_mode TEXT CHECK(stop_input_mode IN ('price', 'percentage')) DEFAULT 'price',
                target_input_mode TEXT CHECK(target_input_mode IN ('price', 'percentage')) DEFAULT 'price',
                FOREIGN KEY (trading_account_id) REFERENCES trading_accounts(id),
                FOREIGN KEY (ticker_id) REFERENCES tickers(id)
            )
        """)
        print("   ✅ New table created")
        
        # Copy data
        cursor.execute(f"""
            INSERT INTO trade_plans_new ({new_columns_str})
            SELECT {old_columns_str} FROM trade_plans
        """)
        print(f"   ✅ Copied {cursor.rowcount} records")
        
        # Drop old table
        cursor.execute("DROP TABLE trade_plans")
        print("   ✅ Old table dropped")
        
        # Rename new table
        cursor.execute("ALTER TABLE trade_plans_new RENAME TO trade_plans")
        print("   ✅ Table renamed")
        
        # Commit changes
        conn.commit()
        print()
        print("=" * 60)
        print("✅ Migration completed successfully!")
        print("=" * 60)
        
        # Verify
        print()
        print("🔍 Verification:")
        cursor.execute("PRAGMA table_info(trade_plans)")
        columns = cursor.fetchall()
        
        metadata_columns = [col for col in columns if 'input_mode' in col[1]]
        print(f"   ✅ Found {len(metadata_columns)} metadata columns:")
        for col in metadata_columns:
            print(f"      - {col[1]} ({col[2]})")
        
        current_price_exists = any(col[1] == 'current_price' for col in columns)
        if current_price_exists:
            print("   ❌ current_price still exists!")
        else:
            print("   ✅ current_price removed successfully")
        
        cursor.execute("SELECT COUNT(*) FROM trade_plans")
        count = cursor.fetchone()[0]
        print(f"   ✅ Total records: {count}")
        
        return True
        
    except Exception as e:
        print()
        print("❌ Migration failed!")
        print(f"Error: {e}")
        conn.rollback()
        return False
        
    finally:
        conn.close()

if __name__ == "__main__":
    success = run_migration()
    sys.exit(0 if success else 1)

