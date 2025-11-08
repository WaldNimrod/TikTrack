#!/usr/bin/env python3
"""
TikTrack Production Database Creation Script
============================================

Creates a production database from the development database with:
- Complete database structure
- All helper tables and preferences data
- Cleaned user data tables (only default account kept)

Purpose: Create production database for TikTrack
Location: Backend/scripts/create_production_db.py
"""

import sqlite3
import os
import sys
import shutil
from pathlib import Path
from datetime import datetime

# Add Backend directory to path
backend_dir = Path(__file__).parent.parent  # production/Backend/
project_root = backend_dir.parent.parent  # TikTrackApp/
dev_backend = project_root / "Backend"  # Backend/ (development)
sys.path.insert(0, str(backend_dir))

def get_default_trading_account_id(source_db_path: str) -> int:
    """
    Get the default trading account ID from preferences
    
    Returns:
        Account ID or None if not found
    """
    conn = sqlite3.connect(source_db_path)
    cursor = conn.cursor()
    
    try:
        # Try to get default_trading_account preference
        # Join with preference_types to get preference_name
        cursor.execute("""
            SELECT up.saved_value 
            FROM user_preferences up
            JOIN preference_types pt ON up.preference_id = pt.id
            WHERE pt.preference_name = 'default_trading_account'
            ORDER BY up.id DESC
            LIMIT 1
        """)
        result = cursor.fetchone()
        
        if result and result[0]:
            try:
                account_id = int(result[0])
                # Verify account exists
                cursor.execute("SELECT id FROM trading_accounts WHERE id = ?", (account_id,))
                if cursor.fetchone():
                    print(f"✅ Found default trading account from preferences: ID {account_id}")
                    return account_id
            except (ValueError, TypeError):
                pass
        
        # Fallback: get first open account
        cursor.execute("SELECT id FROM trading_accounts WHERE status = 'open' ORDER BY id LIMIT 1")
        result = cursor.fetchone()
        if result:
            account_id = result[0]
            print(f"✅ Using first open account as default: ID {account_id}")
            return account_id
        
        # Last resort: get first account
        cursor.execute("SELECT id FROM trading_accounts ORDER BY id LIMIT 1")
        result = cursor.fetchone()
        if result:
            account_id = result[0]
            print(f"⚠️  Using first account as default: ID {account_id}")
            return account_id
        
        print("❌ No trading account found!")
        return None
        
    finally:
        conn.close()

def copy_table_structure(source_conn, target_conn, table_name: str):
    """Copy table structure from source to target"""
    cursor = source_conn.cursor()
    
    # Get CREATE TABLE statement
    cursor.execute(f"SELECT sql FROM sqlite_master WHERE type='table' AND name='{table_name}'")
    result = cursor.fetchone()
    
    if result and result[0]:
        create_sql = result[0]
        target_conn.execute(create_sql)
        print(f"  ✅ Created table structure: {table_name}")

def copy_table_data(source_conn, target_conn, table_name: str, where_clause: str = ""):
    """Copy table data from source to target"""
    source_cursor = source_conn.cursor()
    target_cursor = target_conn.cursor()
    
    # Get column names
    source_cursor.execute(f"PRAGMA table_info({table_name})")
    columns = [row[1] for row in source_cursor.fetchall()]
    
    if not columns:
        return
    
    # Build SELECT query
    select_query = f"SELECT {', '.join(columns)} FROM {table_name}"
    if where_clause:
        select_query += f" WHERE {where_clause}"
    
    # Copy data
    source_cursor.execute(select_query)
    rows = source_cursor.fetchall()
    
    if rows:
        placeholders = ', '.join(['?' for _ in columns])
        insert_query = f"INSERT INTO {table_name} ({', '.join(columns)}) VALUES ({placeholders})"
        target_cursor.executemany(insert_query, rows)
        print(f"  ✅ Copied {len(rows)} rows to {table_name}")

def create_production_database():
    """Create production database from development database"""
    
    # Paths
    # Source: development database
    project_root = backend_dir.parent.parent
    dev_backend = project_root / "Backend"
    source_db = dev_backend / "db" / "simpleTrade_new.db"
    
    # Target: production database
    target_db = backend_dir / "db" / "TikTrack_DB.db"
    
    # Check if source database exists
    if not source_db.exists():
        print(f"❌ Source database not found: {source_db}")
        return False
    
    # Backup target if exists
    if target_db.exists():
        backup_path = backend_dir / "db" / f"TikTrack_DB_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.db"
        print(f"📦 Backing up existing production database to: {backup_path}")
        shutil.copy2(target_db, backup_path)
    
    # Remove target if exists
    if target_db.exists():
        target_db.unlink()
    
    print("=" * 60)
    print("TikTrack Production Database Creation")
    print("=" * 60)
    print(f"Source: {source_db}")
    print(f"Target: {target_db}")
    print()
    
    # Connect to databases
    source_conn = sqlite3.connect(source_db)
    target_conn = sqlite3.connect(target_db)
    
    # Disable foreign keys temporarily during data copy
    # We'll enable them at the end
    target_conn.execute("PRAGMA foreign_keys = OFF")
    
    try:
        # Step 1: Get default trading account ID
        print("Step 1: Finding default trading account...")
        default_account_id = get_default_trading_account_id(str(source_db))
        if default_account_id is None:
            print("❌ Cannot proceed without a trading account")
            return False
        print()
        
        # Step 2: Get all table names
        print("Step 2: Getting table list...")
        source_cursor = source_conn.cursor()
        source_cursor.execute("""
            SELECT name FROM sqlite_master 
            WHERE type='table' AND name NOT LIKE 'sqlite_%'
            ORDER BY name
        """)
        all_tables = [row[0] for row in source_cursor.fetchall()]
        print(f"  Found {len(all_tables)} tables")
        print()
        
        # Step 3: Copy all table structures
        print("Step 3: Copying table structures...")
        for table_name in all_tables:
            copy_table_structure(source_conn, target_conn, table_name)
        target_conn.commit()
        print()
        
        # Step 4: Copy helper tables (full data) - in correct order for foreign keys
        print("Step 4: Copying helper tables and preferences (full data)...")
        # Order matters - copy tables with no dependencies first
        helper_tables_ordered = [
            'currencies',
            'note_relation_types',
            'users',
            'preference_groups',
            'preference_types',
            'preference_profiles',  # Must be before user_preferences
            'user_preferences',  # Depends on preference_profiles and preference_types
            'system_setting_groups',
            'system_setting_types',
            'system_settings',
            'external_data_providers',
            'trading_methods',
            'constraints',
            'enum_values',
            'import_sessions',
            'data_refresh_logs',
            'market_data_quotes',
            'quotes_last'
        ]
        
        for table_name in helper_tables_ordered:
            if table_name in all_tables:
                copy_table_data(source_conn, target_conn, table_name)
        target_conn.commit()
        print()
        
        # Step 5: Copy default trading account only
        print("Step 5: Copying default trading account...")
        if 'trading_accounts' in all_tables:
            copy_table_data(source_conn, target_conn, 'trading_accounts', 
                          f"id = {default_account_id}")
        target_conn.commit()
        print()
        
        # Step 6: Clean user data tables (empty them)
        print("Step 6: Cleaning user data tables...")
        user_data_tables = [
            'cash_flows',
            'executions',
            'tickers',
            'notes',
            'alerts',
            'trade_plans',
            'trades'
        ]
        
        for table_name in user_data_tables:
            if table_name in all_tables:
                # Table structure already exists, just leave it empty
                print(f"  ✅ Table {table_name} is empty (ready for production data)")
        print()
        
        # Step 7: Copy indexes
        print("Step 7: Copying indexes...")
        source_cursor.execute("""
            SELECT sql FROM sqlite_master 
            WHERE type='index' AND name NOT LIKE 'sqlite_%'
        """)
        indexes = source_cursor.fetchall()
        for index_sql in indexes:
            if index_sql[0]:
                try:
                    target_conn.execute(index_sql[0])
                    print(f"  ✅ Created index")
                except Exception as e:
                    print(f"  ⚠️  Could not create index: {e}")
        target_conn.commit()
        print()
        
        # Step 8: Copy triggers
        print("Step 8: Copying triggers...")
        source_cursor.execute("""
            SELECT sql FROM sqlite_master 
            WHERE type='trigger'
        """)
        triggers = source_cursor.fetchall()
        for trigger_sql in triggers:
            if trigger_sql[0]:
                try:
                    target_conn.execute(trigger_sql[0])
                    print(f"  ✅ Created trigger")
                except Exception as e:
                    print(f"  ⚠️  Could not create trigger: {e}")
        target_conn.commit()
        print()
        
        # Step 9: Enable foreign keys and verify
        print("Step 9: Enabling foreign keys and verifying production database...")
        target_conn.execute("PRAGMA foreign_keys = ON")
        target_conn.commit()
        
        target_cursor = target_conn.cursor()
        target_cursor.execute("SELECT COUNT(*) FROM sqlite_master WHERE type='table'")
        table_count = target_cursor.fetchone()[0]
        
        target_cursor.execute("SELECT COUNT(*) FROM trading_accounts")
        account_count = target_cursor.fetchone()[0]
        
        print(f"  ✅ Foreign keys enabled")
        print(f"  ✅ Tables: {table_count}")
        print(f"  ✅ Trading accounts: {account_count}")
        print()
        
        print("=" * 60)
        print("✅ Production database created successfully!")
        print(f"📁 Location: {target_db}")
        print(f"📊 Tables: {table_count}")
        print(f"👤 Default account ID: {default_account_id}")
        print("=" * 60)
        
        return True
        
    except Exception as e:
        print(f"❌ Error creating production database: {e}")
        import traceback
        traceback.print_exc()
        return False
        
    finally:
        source_conn.close()
        target_conn.close()

if __name__ == '__main__':
    success = create_production_database()
    sys.exit(0 if success else 1)

