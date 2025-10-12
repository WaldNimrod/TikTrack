#!/usr/bin/env python3
"""
Migration Script: Remove Old/Unused Columns from Database
==========================================================

This script removes old/unused columns that are no longer defined in the models:
1. tickers.currency (VARCHAR(3)) - replaced by tickers.currency_id (INTEGER)
2. trades.opened_at (DATETIME) - replaced by trades.created_at (DATETIME) from BaseModel

Author: TikTrack Development Team
Date: October 2025
Version: 1.0
"""

import sqlite3
import os
import sys
from datetime import datetime
import shutil

# Add Backend directory to path
backend_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, backend_path)

DB_PATH = os.path.join(backend_path, 'db', 'simpleTrade_new.db')
BACKUP_PATH = os.path.join(backend_path, 'db', f'simpleTrade_new_backup_{datetime.now().strftime("%Y%m%d_%H%M%S")}.db')

def create_backup():
    """Create a backup of the database before migration"""
    print(f"📦 Creating backup: {BACKUP_PATH}")
    shutil.copy2(DB_PATH, BACKUP_PATH)
    print(f"✅ Backup created successfully")

def get_table_info(cursor, table_name):
    """Get current table structure"""
    cursor.execute(f"PRAGMA table_info({table_name})")
    return cursor.fetchall()

def remove_old_columns():
    """Remove old columns from tables"""
    
    print("=" * 60)
    print("REMOVING OLD/UNUSED COLUMNS FROM DATABASE")
    print("=" * 60)
    print()
    
    # Create backup first
    create_backup()
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # Enable foreign keys
        cursor.execute("PRAGMA foreign_keys = OFF")
        
        # ==========================================
        # 1. Remove 'currency' column from tickers
        # ==========================================
        print("🔧 Processing table: tickers")
        print("   Removing old column: 'currency' (VARCHAR(3))")
        
        # Get current structure
        print("   Current columns:")
        columns = get_table_info(cursor, 'tickers')
        for col in columns:
            print(f"     - {col[1]} ({col[2]})")
        
        # Create new table without 'currency' column
        cursor.execute("""
            CREATE TABLE tickers_new (
                symbol VARCHAR(10) NOT NULL UNIQUE,
                name VARCHAR(100),
                type VARCHAR(20),
                remarks VARCHAR(500),
                active_trades BOOLEAN,
                id INTEGER PRIMARY KEY,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME,
                currency_id INTEGER,
                status TEXT DEFAULT 'open'
            )
        """)
        
        # Copy data (excluding 'currency' column)
        cursor.execute("""
            INSERT INTO tickers_new (symbol, name, type, remarks, active_trades, id, created_at, updated_at, currency_id, status)
            SELECT symbol, name, type, remarks, active_trades, id, created_at, updated_at, currency_id, status
            FROM tickers
        """)
        
        # Drop old table and rename new one
        cursor.execute("DROP TABLE tickers")
        cursor.execute("ALTER TABLE tickers_new RENAME TO tickers")
        
        print("   ✅ Removed 'currency' column from tickers")
        print()
        
        # ==========================================
        # 2. Remove 'opened_at' column from trades
        # ==========================================
        print("🔧 Processing table: trades")
        print("   Removing old column: 'opened_at' (DATETIME)")
        
        # Get current structure
        print("   Current columns:")
        columns = get_table_info(cursor, 'trades')
        for col in columns:
            print(f"     - {col[1]} ({col[2]})")
        
        # Create new table without 'opened_at' column
        cursor.execute("""
            CREATE TABLE trades_new (
                id INTEGER PRIMARY KEY,
                trading_account_id INTEGER NOT NULL,
                ticker_id INTEGER NOT NULL,
                trade_plan_id INTEGER,
                status VARCHAR(20),
                investment_type VARCHAR(20),
                closed_at DATETIME,
                cancelled_at DATETIME,
                cancel_reason VARCHAR(500),
                total_pl FLOAT,
                notes VARCHAR(500),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                side VARCHAR(10) DEFAULT 'Long'
            )
        """)
        
        # Copy data (excluding 'opened_at' column)
        cursor.execute("""
            INSERT INTO trades_new (id, trading_account_id, ticker_id, trade_plan_id, status, investment_type, 
                                   closed_at, cancelled_at, cancel_reason, total_pl, notes, created_at, side)
            SELECT id, trading_account_id, ticker_id, trade_plan_id, status, investment_type,
                   closed_at, cancelled_at, cancel_reason, total_pl, notes, created_at, side
            FROM trades
        """)
        
        # Drop old table and rename new one
        cursor.execute("DROP TABLE trades")
        cursor.execute("ALTER TABLE trades_new RENAME TO trades")
        
        print("   ✅ Removed 'opened_at' column from trades")
        print()
        
        # Commit changes
        conn.commit()
        
        # Verify changes
        print("=" * 60)
        print("VERIFICATION - NEW TABLE STRUCTURES")
        print("=" * 60)
        print()
        
        print("📊 tickers table columns:")
        columns = get_table_info(cursor, 'tickers')
        for col in columns:
            print(f"   {col[0]:2d}. {col[1]:20s} {col[2]:15s} {'NOT NULL' if col[3] else ''} {'PK' if col[5] else ''}")
        print()
        
        print("📊 trades table columns:")
        columns = get_table_info(cursor, 'trades')
        for col in columns:
            print(f"   {col[0]:2d}. {col[1]:20s} {col[2]:15s} {'NOT NULL' if col[3] else ''} {'PK' if col[5] else ''}")
        print()
        
        # Re-enable foreign keys
        cursor.execute("PRAGMA foreign_keys = ON")
        
        print("=" * 60)
        print("✅ MIGRATION COMPLETED SUCCESSFULLY")
        print("=" * 60)
        print()
        print(f"📦 Backup saved at: {BACKUP_PATH}")
        print(f"🗄️  Database updated at: {DB_PATH}")
        print()
        
    except Exception as e:
        print(f"❌ Error during migration: {e}")
        conn.rollback()
        
        # Restore from backup
        print("🔄 Restoring from backup...")
        conn.close()
        shutil.copy2(BACKUP_PATH, DB_PATH)
        print("✅ Database restored from backup")
        sys.exit(1)
    
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    print()
    print("⚠️  WARNING: This script will modify the database structure!")
    print("⚠️  A backup will be created automatically before any changes.")
    print()
    
    response = input("Do you want to continue? (yes/no): ").strip().lower()
    if response == 'yes':
        remove_old_columns()
    else:
        print("❌ Migration cancelled by user")
        sys.exit(0)

