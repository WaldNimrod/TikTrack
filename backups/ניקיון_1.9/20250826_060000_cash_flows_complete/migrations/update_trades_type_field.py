#!/usr/bin/env python3
"""
Migration: Update trades.type to trades.investment_type
Date: August 22, 2025
Description: Rename type field to investment_type in trades table for consistency with trade_plans
"""

import sqlite3
import os
import sys
from datetime import datetime

def get_db_connection():
    """Get database connection"""
    db_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "db", "simpleTrade_new.db")
    return sqlite3.connect(db_path)

def check_current_schema():
    """Check current schema of trades table"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Get table info
        cursor.execute("PRAGMA table_info(trades)")
        columns = cursor.fetchall()
        
        print("📊 Current trades table schema:")
        for col in columns:
            print(f"  - {col[1]} ({col[2]}) - Default: {col[4]}")
        
        # Check if type column exists
        type_exists = any(col[1] == 'type' for col in columns)
        investment_type_exists = any(col[1] == 'investment_type' for col in columns)
        
        print(f"\n🔍 Column check:")
        print(f"  - 'type' column exists: {type_exists}")
        print(f"  - 'investment_type' column exists: {investment_type_exists}")
        
        return type_exists, investment_type_exists
        
    except Exception as e:
        print(f"❌ Error checking schema: {e}")
        return False, False
    finally:
        conn.close()

def backup_trades_data():
    """Create backup of trades data"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Create backup table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS trades_backup AS 
            SELECT * FROM trades
        """)
        
        # Count records
        cursor.execute("SELECT COUNT(*) FROM trades_backup")
        count = cursor.fetchone()[0]
        
        print(f"✅ Backup created: {count} trades backed up to trades_backup table")
        return True
        
    except Exception as e:
        print(f"❌ Error creating backup: {e}")
        return False
    finally:
        conn.close()

def rename_type_column():
    """Rename type column to investment_type"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        print("🔄 Starting column rename...")
        
        # SQLite doesn't support RENAME COLUMN directly, so we need to recreate the table
        # First, get the current table structure
        cursor.execute("PRAGMA table_info(trades)")
        columns = cursor.fetchall()
        
        # Create new table with investment_type instead of type
        new_columns = []
        for col in columns:
            if col[1] == 'type':
                # Replace type with investment_type
                new_columns.append(f"{col[1].replace('type', 'investment_type')} {col[2]}")
            else:
                new_columns.append(f"{col[1]} {col[2]}")
        
        # Create new table
        create_sql = f"""
        CREATE TABLE trades_new (
            {', '.join(new_columns)}
        )
        """
        
        print("🏗️ Creating new table structure...")
        cursor.execute(create_sql)
        
        # Copy data from old table to new table
        print("📋 Copying data...")
        cursor.execute("""
            INSERT INTO trades_new 
            SELECT 
                account_id, ticker_id, trade_plan_id, status, 
                type as investment_type, opened_at, closed_at, cancelled_at, 
                cancel_reason, total_pl, notes, id, created_at, side
            FROM trades
        """)
        
        # Drop old table
        print("🗑️ Dropping old table...")
        cursor.execute("DROP TABLE trades")
        
        # Rename new table to original name
        print("🔄 Renaming new table...")
        cursor.execute("ALTER TABLE trades_new RENAME TO trades")
        
        # Recreate indexes
        print("🔗 Recreating indexes...")
        cursor.execute("CREATE INDEX ix_trades_id ON trades (id)")
        
        # Commit changes
        conn.commit()
        
        print("✅ Column rename completed successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Error during column rename: {e}")
        conn.rollback()
        return False
    finally:
        conn.close()

def verify_migration():
    """Verify the migration was successful"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Check new schema
        cursor.execute("PRAGMA table_info(trades)")
        columns = cursor.fetchall()
        
        print("\n📊 New trades table schema:")
        for col in columns:
            print(f"  - {col[1]} ({col[2]}) - Default: {col[4]}")
        
        # Check if investment_type column exists
        investment_type_exists = any(col[1] == 'investment_type' for col in columns)
        type_exists = any(col[1] == 'type' for col in columns)
        
        print(f"\n🔍 Verification:")
        print(f"  - 'investment_type' column exists: {investment_type_exists}")
        print(f"  - 'type' column exists: {type_exists}")
        
        # Check data integrity
        cursor.execute("SELECT COUNT(*) FROM trades")
        count = cursor.fetchone()[0]
        print(f"  - Total trades: {count}")
        
        # Check sample data
        cursor.execute("SELECT id, investment_type FROM trades LIMIT 5")
        samples = cursor.fetchall()
        print(f"  - Sample data:")
        for sample in samples:
            print(f"    ID {sample[0]}: investment_type = '{sample[1]}'")
        
        return investment_type_exists and not type_exists
        
    except Exception as e:
        print(f"❌ Error during verification: {e}")
        return False
    finally:
        conn.close()

def rollback_migration():
    """Rollback the migration if needed"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        print("🔄 Rolling back migration...")
        
        # Drop current table
        cursor.execute("DROP TABLE IF EXISTS trades")
        
        # Restore from backup
        cursor.execute("ALTER TABLE trades_backup RENAME TO trades")
        
        # Recreate indexes
        cursor.execute("CREATE INDEX ix_trades_id ON trades (id)")
        
        conn.commit()
        print("✅ Rollback completed successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Error during rollback: {e}")
        conn.rollback()
        return False
    finally:
        conn.close()

def main():
    """Main migration function"""
    print("🚀 Starting trades.type to investment_type migration")
    print("=" * 60)
    
    # Step 1: Check current schema
    print("\n📋 Step 1: Checking current schema...")
    type_exists, investment_type_exists = check_current_schema()
    
    if not type_exists:
        print("❌ 'type' column not found. Migration not needed.")
        return
    
    if investment_type_exists:
        print("❌ 'investment_type' column already exists. Migration already done.")
        return
    
    # Step 2: Create backup
    print("\n📋 Step 2: Creating backup...")
    if not backup_trades_data():
        print("❌ Backup failed. Aborting migration.")
        return
    
    # Step 3: Perform migration
    print("\n🔄 Step 3: Performing migration...")
    if not rename_type_column():
        print("❌ Migration failed. Rolling back...")
        rollback_migration()
        return
    
    # Step 4: Verify migration
    print("\n📋 Step 4: Verifying migration...")
    if not verify_migration():
        print("❌ Verification failed. Rolling back...")
        rollback_migration()
        return
    
    print("\n✅ Migration completed successfully!")
    print("📝 Next steps:")
    print("  1. Update Backend models")
    print("  2. Update API routes")
    print("  3. Update Frontend code")
    print("  4. Test all functionality")

if __name__ == "__main__":
    main()
