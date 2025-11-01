#!/usr/bin/env python3
"""
Migration script: Remove cash_balance column from trading_accounts table

This script removes the cash_balance column from trading_accounts table.
Since SQLite doesn't support DROP COLUMN directly, it:
1. Creates a new table without cash_balance
2. Copies all data from old table
3. Drops the old table
4. Renames the new table

Author: TikTrack Development Team
Version: 1.0.0
Date: November 2025
"""

import sqlite3
import os
import sys
import logging
from datetime import datetime

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def get_db_path():
    """Get the database path"""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.join(script_dir, '..', 'db', 'simpleTrade_new.db')
    return os.path.abspath(db_path)

def backup_database():
    """Create a backup of the database before migration"""
    db_path = get_db_path()
    backup_dir = os.path.join(os.path.dirname(db_path), 'backups')
    os.makedirs(backup_dir, exist_ok=True)
    
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    backup_path = os.path.join(backup_dir, f'simpleTrade_new_before_remove_cash_balance_{timestamp}.db')
    
    logger.info(f"Creating database backup: {backup_path}")
    
    # Read the entire database
    with open(db_path, 'rb') as source:
        with open(backup_path, 'wb') as backup:
            backup.write(source.read())
    
    logger.info(f"Database backup created successfully: {backup_path}")
    return backup_path

def remove_cash_balance_column():
    """Remove cash_balance column from trading_accounts table"""
    db_path = get_db_path()
    
    if not os.path.exists(db_path):
        logger.error(f"Database not found: {db_path}")
        return False
    
    # Create backup first
    backup_path = backup_database()
    logger.info(f"Backup created at: {backup_path}")
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        logger.info("Starting removal of cash_balance column from trading_accounts...")
        
        # Check if column exists
        cursor.execute("PRAGMA table_info(trading_accounts)")
        columns = cursor.fetchall()
        column_names = [col[1] for col in columns]
        
        if 'cash_balance' not in column_names:
            logger.info("cash_balance column does not exist - migration not needed")
            conn.close()
            return True
        
        logger.info("cash_balance column found - proceeding with migration...")
        
        # Step 0: Drop new table if exists (from previous failed migration)
        logger.info("Step 0: Dropping any existing trading_accounts_new table...")
        cursor.execute("DROP TABLE IF EXISTS trading_accounts_new")
        
        # Step 1: Create new table without cash_balance
        logger.info("Step 1: Creating new table structure without cash_balance...")
        cursor.execute("""
            CREATE TABLE trading_accounts_new (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name VARCHAR(100) NOT NULL,
                currency_id INTEGER NOT NULL,
                status VARCHAR(20) DEFAULT 'open',
                total_value FLOAT DEFAULT 0,
                total_pl FLOAT DEFAULT 0,
                notes VARCHAR(500),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(currency_id) REFERENCES currencies(id)
            )
        """)
        
        # Step 2: Copy data from old table to new table (excluding cash_balance)
        logger.info("Step 2: Copying data from old table to new table...")
        cursor.execute("""
            INSERT INTO trading_accounts_new (
                id, name, currency_id, status, total_value, total_pl, notes, created_at
            )
            SELECT 
                id, name, currency_id, status, total_value, total_pl, notes, created_at
            FROM trading_accounts
        """)
        
        # Step 3: Count rows to verify
        cursor.execute("SELECT COUNT(*) FROM trading_accounts")
        old_count = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM trading_accounts_new")
        new_count = cursor.fetchone()[0]
        
        if old_count != new_count:
            logger.error(f"Row count mismatch: old={old_count}, new={new_count}")
            conn.rollback()
            conn.close()
            return False
        
        logger.info(f"Successfully copied {new_count} rows")
        
        # Step 4: Drop old table
        logger.info("Step 4: Dropping old table...")
        cursor.execute("DROP TABLE trading_accounts")
        
        # Step 5: Rename new table
        logger.info("Step 5: Renaming new table to trading_accounts...")
        cursor.execute("ALTER TABLE trading_accounts_new RENAME TO trading_accounts")
        
        # Commit changes
        conn.commit()
        logger.info("Migration completed successfully!")
        
        # Verify the new structure
        cursor.execute("PRAGMA table_info(trading_accounts)")
        new_columns = cursor.fetchall()
        new_column_names = [col[1] for col in new_columns]
        
        if 'cash_balance' in new_column_names:
            logger.error("cash_balance column still exists after migration!")
            conn.close()
            return False
        
        logger.info(f"New table structure verified. Columns: {', '.join(new_column_names)}")
        
        conn.close()
        return True
        
    except Exception as e:
        logger.error(f"Migration failed: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return False

if __name__ == "__main__":
    logger.info("=" * 60)
    logger.info("Migration: Remove cash_balance column from trading_accounts")
    logger.info("=" * 60)
    
    success = remove_cash_balance_column()
    
    if success:
        logger.info("Migration completed successfully!")
        sys.exit(0)
    else:
        logger.error("Migration failed!")
        sys.exit(1)

