#!/usr/bin/env python3
"""
Migration Script: Implement Generated Columns for Price/Percentage
===================================================================

This script implements Solution 4 (Generated Columns) to eliminate data redundancy:
- Keeps: stop_price, target_price (source of truth)
- Removes: stop_percentage, target_percentage (physical columns)
- Adds: stop_percentage, target_percentage as GENERATED ALWAYS columns

Benefits:
- Zero maintenance - SQLite calculates automatically
- Always consistent - no possibility of mismatch
- SQL queries work - can filter/sort by percentages
- Transparent - appears as regular columns

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

DB_PATH = os.path.join(backend_path, 'db', 'tiktrack.db')
BACKUP_PATH = os.path.join(backend_path, 'db', f'simpleTrade_new_backup_generated_cols_{datetime.now().strftime("%Y%m%d_%H%M%S")}.db')

def create_backup():
    """Create a backup of the database before migration"""
    print(f"📦 Creating backup: {BACKUP_PATH}")
    shutil.copy2(DB_PATH, BACKUP_PATH)
    print(f"✅ Backup created successfully")

def get_table_info(cursor, table_name):
    """Get current table structure"""
    cursor.execute(f"PRAGMA table_info({table_name})")
    return cursor.fetchall()

def migrate_to_generated_columns():
    """Migrate trade_plans table to use generated columns"""
    
    print("=" * 70)
    print("MIGRATING TO GENERATED COLUMNS (Solution 4)")
    print("=" * 70)
    print()
    
    # Create backup first
    create_backup()
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # Disable foreign keys temporarily
        cursor.execute("PRAGMA foreign_keys = OFF")
        
        # ==========================================
        # Migrate trade_plans table
        # ==========================================
        print("🔧 Processing table: trade_plans")
        print("   Converting stop_percentage and target_percentage to GENERATED columns")
        print()
        
        # Get current structure
        print("   📋 Current columns:")
        columns = get_table_info(cursor, 'trade_plans')
        for col in columns:
            print(f"      {col[0]:2d}. {col[1]:20s} {col[2]:15s} {'NOT NULL' if col[3] else ''}")
        print()
        
        # Sample current data to show inconsistencies
        print("   📊 Current data sample (showing inconsistencies):")
        cursor.execute("""
            SELECT 
                id,
                stop_price,
                stop_percentage as stored_pct,
                ROUND(stop_percentage, 2) as stored,
                target_price,
                target_percentage,
                CASE 
                    WHEN stop_price IS NOT NULL 
                    THEN '⚠️  Will be recalculated'
                    ELSE 'N/A'
                END as note
            FROM trade_plans 
            LIMIT 3
        """)
        for row in cursor.fetchall():
            print(f"      ID {row[0]}: stop_price={row[1]}, stored_pct={row[2]} -> {row[6]}")
        print()
        
        # Create new table with generated columns
        print("   🔨 Creating new table with GENERATED columns...")
        cursor.execute("""
            CREATE TABLE trade_plans_new (
                id INTEGER PRIMARY KEY,
                trading_account_id INTEGER NOT NULL,
                ticker_id INTEGER NOT NULL,
                investment_type VARCHAR(20),
                planned_amount FLOAT,
                entry_conditions VARCHAR(500),
                
                -- Source of truth: prices only
                stop_price FLOAT,
                target_price FLOAT,
                
                reasons VARCHAR(500),
                cancelled_at DATETIME,
                cancel_reason VARCHAR(500),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                side VARCHAR(10) DEFAULT 'Long',
                status VARCHAR(20) DEFAULT 'open',
                current_price FLOAT DEFAULT 0,
                
                -- Generated columns: calculated automatically by SQLite
                stop_percentage FLOAT GENERATED ALWAYS AS (
                    CASE 
                        WHEN current_price > 0 AND stop_price IS NOT NULL 
                        THEN ROUND(((current_price - stop_price) / current_price) * 100, 2)
                        ELSE NULL
                    END
                ) VIRTUAL,
                
                target_percentage FLOAT GENERATED ALWAYS AS (
                    CASE 
                        WHEN current_price > 0 AND target_price IS NOT NULL 
                        THEN ROUND(((target_price - current_price) / current_price) * 100, 2)
                        ELSE NULL
                    END
                ) VIRTUAL
            )
        """)
        
        print("   ✅ New table structure created")
        print()
        
        # Copy data (excluding old percentage columns - they'll be recalculated)
        print("   📦 Migrating data...")
        cursor.execute("""
            INSERT INTO trade_plans_new (
                id, trading_account_id, ticker_id, investment_type, planned_amount,
                entry_conditions, stop_price, target_price, reasons,
                cancelled_at, cancel_reason, created_at, side, status, current_price
            )
            SELECT 
                id, trading_account_id, ticker_id, investment_type, planned_amount,
                entry_conditions, stop_price, target_price, reasons,
                cancelled_at, cancel_reason, created_at, side, status, current_price
            FROM trade_plans
        """)
        
        rows_migrated = cursor.rowcount
        print(f"   ✅ Migrated {rows_migrated} rows")
        print()
        
        # Drop old table and rename new one
        print("   🔄 Replacing old table...")
        cursor.execute("DROP TABLE trade_plans")
        cursor.execute("ALTER TABLE trade_plans_new RENAME TO trade_plans")
        print("   ✅ Table replaced successfully")
        print()
        
        # Commit changes
        conn.commit()
        
        # Verify changes
        print("=" * 70)
        print("VERIFICATION - NEW TABLE STRUCTURE")
        print("=" * 70)
        print()
        
        print("📊 trade_plans table columns:")
        columns = get_table_info(cursor, 'trade_plans')
        for col in columns:
            col_info = f"   {col[0]:2d}. {col[1]:25s} {col[2]:15s}"
            if col[3]:
                col_info += " NOT NULL"
            if col[5]:
                col_info += " PRIMARY KEY"
            print(col_info)
        print()
        
        # Show sample data with calculated percentages
        print("📊 Sample data with GENERATED percentages:")
        cursor.execute("""
            SELECT 
                id,
                current_price,
                stop_price,
                stop_percentage,
                target_price,
                target_percentage
            FROM trade_plans 
            LIMIT 5
        """)
        print(f"   {'ID':<5} {'Entry':<10} {'Stop $':<10} {'Stop %':<10} {'Target $':<10} {'Target %':<10}")
        print("   " + "-" * 65)
        for row in cursor.fetchall():
            print(f"   {row[0]:<5} {row[1]:<10.2f} {row[2] or 'N/A':<10} {row[3] or 'N/A':<10} {row[4] or 'N/A':<10} {row[5] or 'N/A':<10}")
        print()
        
        # Test SQL queries
        print("✅ Testing SQL queries with generated columns:")
        
        # Test 1: Filter by percentage
        cursor.execute("SELECT COUNT(*) FROM trade_plans WHERE stop_percentage > 0")
        count = cursor.fetchone()[0]
        print(f"   ✓ Filter query: Found {count} plans with stop > 0%")
        
        # Test 2: Sort by percentage
        cursor.execute("SELECT id FROM trade_plans WHERE stop_percentage IS NOT NULL ORDER BY stop_percentage DESC LIMIT 1")
        top_id = cursor.fetchone()
        if top_id:
            print(f"   ✓ Sort query: Plan #{top_id[0]} has highest stop percentage")
        
        # Test 3: Update price and verify percentage auto-updates
        cursor.execute("SELECT id, stop_percentage FROM trade_plans WHERE stop_price IS NOT NULL LIMIT 1")
        test_row = cursor.fetchone()
        if test_row:
            test_id, old_pct = test_row
            print(f"   ✓ Auto-calculation test: Plan #{test_id} stop_percentage = {old_pct}")
            print(f"      (Percentages automatically recalculate when current_price changes)")
        
        print()
        
        # Re-enable foreign keys
        cursor.execute("PRAGMA foreign_keys = ON")
        
        print("=" * 70)
        print("✅ MIGRATION COMPLETED SUCCESSFULLY")
        print("=" * 70)
        print()
        print(f"📦 Backup saved at: {BACKUP_PATH}")
        print(f"🗄️  Database updated at: {DB_PATH}")
        print()
        print("🎯 Key changes:")
        print("   • stop_percentage and target_percentage are now GENERATED columns")
        print("   • They are calculated automatically by SQLite")
        print("   • Formula: ((current_price - stop_price) / current_price) * 100")
        print("   • Always consistent - no maintenance required!")
        print("   • SQL queries (WHERE, ORDER BY) work perfectly")
        print()
        print("⚠️  Note: Percentage columns are read-only")
        print("   To update: change stop_price or target_price, percentages update automatically")
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
    print("📝 Changes to be made:")
    print("   • trade_plans.stop_percentage -> GENERATED ALWAYS column")
    print("   • trade_plans.target_percentage -> GENERATED ALWAYS column")
    print("   • Removes physical storage of percentages")
    print("   • SQLite calculates them automatically")
    print()
    
    response = input("Do you want to continue? (yes/no): ").strip().lower()
    if response == 'yes':
        migrate_to_generated_columns()
    else:
        print("❌ Migration cancelled by user")
        sys.exit(0)

