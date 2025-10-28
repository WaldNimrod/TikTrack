#!/usr/bin/env python3
"""
Database Migration: Standardize Trading Account ID

This script migrates the import_sessions table to use 'trading_account_id' 
instead of 'account_id' to maintain consistency across the entire system.

Author: TikTrack Development Team
Date: 2025-10-27
"""

import sqlite3
import os
import sys
from datetime import datetime

def backup_database(db_path):
    """Create a backup of the database before migration."""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_path = f"{db_path}.backup_{timestamp}"
    
    print(f"Creating backup: {backup_path}")
    
    # Copy database file
    import shutil
    shutil.copy2(db_path, backup_path)
    
    return backup_path

def verify_table_structure(db_path):
    """Verify the current table structure."""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    print("=== Current Table Structure ===")
    
    # Check import_sessions table
    cursor.execute("PRAGMA table_info(import_sessions)")
    columns = cursor.fetchall()
    
    print("\nimport_sessions table:")
    for col in columns:
        print(f"  {col[1]} ({col[2]})")
    
    # Check if account_id exists
    account_id_exists = any(col[1] == 'account_id' for col in columns)
    trading_account_id_exists = any(col[1] == 'trading_account_id' for col in columns)
    
    print(f"\naccount_id exists: {account_id_exists}")
    print(f"trading_account_id exists: {trading_account_id_exists}")
    
    conn.close()
    return account_id_exists, trading_account_id_exists

def migrate_import_sessions_table(db_path):
    """Migrate import_sessions.account_id to trading_account_id."""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    print("\n=== Starting Migration ===")
    
    try:
        # Check current data
        cursor.execute("SELECT COUNT(*) FROM import_sessions")
        count = cursor.fetchone()[0]
        print(f"Records in import_sessions: {count}")
        
        if count > 0:
            # Show sample data
            cursor.execute("SELECT id, account_id FROM import_sessions LIMIT 5")
            samples = cursor.fetchall()
            print("Sample data:")
            for sample in samples:
                print(f"  ID: {sample[0]}, account_id: {sample[1]}")
        
        # Step 1: Add new column
        print("\nStep 1: Adding trading_account_id column...")
        cursor.execute("""
            ALTER TABLE import_sessions 
            ADD COLUMN trading_account_id INTEGER
        """)
        
        # Step 2: Copy data from account_id to trading_account_id
        print("Step 2: Copying data from account_id to trading_account_id...")
        cursor.execute("""
            UPDATE import_sessions 
            SET trading_account_id = account_id 
            WHERE account_id IS NOT NULL
        """)
        
        # Step 3: Drop old account_id column (since trading_account_id already exists)
        print("Step 3: Dropping old account_id column...")
        cursor.execute("ALTER TABLE import_sessions DROP COLUMN account_id")
        
        # Step 4: Recreate indexes
        print("Step 4: Recreating indexes...")
        cursor.execute("""
            CREATE INDEX idx_import_sessions_trading_account_id 
            ON import_sessions(trading_account_id)
        """)
        
        cursor.execute("""
            CREATE INDEX idx_import_sessions_status 
            ON import_sessions(status)
        """)
        
        cursor.execute("""
            CREATE INDEX idx_import_sessions_created_at 
            ON import_sessions(created_at)
        """)
        
        # Commit changes
        conn.commit()
        print("✅ Migration completed successfully!")
        
        # Verify migration
        cursor.execute("PRAGMA table_info(import_sessions)")
        columns = cursor.fetchall()
        
        print("\n=== Verification ===")
        print("New table structure:")
        for col in columns:
            print(f"  {col[1]} ({col[2]})")
        
        # Check data integrity
        cursor.execute("SELECT COUNT(*) FROM import_sessions")
        new_count = cursor.fetchone()[0]
        print(f"\nRecords after migration: {new_count}")
        
        if count == new_count:
            print("✅ Data integrity verified!")
        else:
            print("❌ Data integrity issue detected!")
            return False
        
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        conn.rollback()
        conn.close()
        return False

def main():
    """Main migration function."""
    db_path = "Backend/db/simpleTrade_new.db"
    
    if not os.path.exists(db_path):
        print(f"❌ Database not found: {db_path}")
        sys.exit(1)
    
    print("🚀 Starting Trading Account ID Standardization Migration")
    print(f"Database: {db_path}")
    
    # Create backup
    backup_path = backup_database(db_path)
    print(f"✅ Backup created: {backup_path}")
    
    # Verify current structure
    account_id_exists, trading_account_id_exists = verify_table_structure(db_path)
    
    if not account_id_exists:
        print("✅ account_id column not found - migration not needed")
        return True
    
    if trading_account_id_exists:
        print("⚠️  trading_account_id already exists - recreating table to remove account_id")
        # Need to recreate table to properly remove account_id column
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Create new table without account_id
        cursor.execute("""
            CREATE TABLE import_sessions_new (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                trading_account_id INTEGER NOT NULL,
                provider VARCHAR(50) NOT NULL,
                file_name VARCHAR(255) NOT NULL,
                total_records INTEGER NOT NULL DEFAULT 0,
                imported_records INTEGER NOT NULL DEFAULT 0,
                skipped_records INTEGER NOT NULL DEFAULT 0,
                status VARCHAR(20) NOT NULL DEFAULT 'analyzing',
                summary_data TEXT,
                created_at DATETIME,
                completed_at DATETIME,
                FOREIGN KEY (trading_account_id) REFERENCES trading_accounts(id)
            )
        """)
        
        # Copy data (excluding account_id)
        cursor.execute("""
            INSERT INTO import_sessions_new 
            (id, trading_account_id, provider, file_name, total_records, 
             imported_records, skipped_records, status, summary_data, 
             created_at, completed_at)
            SELECT id, trading_account_id, provider, file_name, total_records,
                   imported_records, skipped_records, status, summary_data,
                   created_at, completed_at
            FROM import_sessions
        """)
        
        # Replace old table
        cursor.execute("DROP TABLE import_sessions")
        cursor.execute("ALTER TABLE import_sessions_new RENAME TO import_sessions")
        
        # Recreate indexes
        cursor.execute("""
            CREATE INDEX idx_import_sessions_trading_account_id 
            ON import_sessions(trading_account_id)
        """)
        
        cursor.execute("""
            CREATE INDEX idx_import_sessions_status 
            ON import_sessions(status)
        """)
        
        cursor.execute("""
            CREATE INDEX idx_import_sessions_created_at 
            ON import_sessions(created_at)
        """)
        
        conn.commit()
        conn.close()
        print("✅ Table recreated without account_id column")
        return True
    
    # Perform migration
    success = migrate_import_sessions_table(db_path)
    
    if success:
        print("\n🎉 Migration completed successfully!")
        print("Next steps:")
        print("1. Update SQLAlchemy models")
        print("2. Update service layer code")
        print("3. Update API routes")
        print("4. Clear Python cache and restart server")
    else:
        print("\n❌ Migration failed!")
        print(f"Restore from backup: cp {backup_path} {db_path}")
        sys.exit(1)

if __name__ == "__main__":
    main()
