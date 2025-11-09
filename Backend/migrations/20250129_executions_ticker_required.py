"""
Migration: Executions Ticker Required
Date: 2025-01-29
Version: 2.0.8

Description:
This migration modifies the Executions table to make ticker_id required (NOT NULL).
The ticker_id field is now mandatory for all executions, while trade_id remains optional.

Changes:
1. Change ticker_id column to NOT NULL
2. Remove CHECK constraint for XOR (if exists) - ticker_id is always required, trade_id is optional
3. Ensure all existing executions have ticker_id (should be 0 based on current data)

Rollback:
To rollback, restore database from backup:
Backend/db/backups/backup_before_executions_ticker_required_*.db
"""

import sqlite3
import sys
import os
from datetime import datetime

# Add parent directory to path to import config
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def run_migration(db_path='Backend/db/simpleTrade_new.db'):
    """Run the migration"""
    print("=" * 70)
    print("Executions Ticker Required Migration")
    print("=" * 70)
    print(f"Database: {db_path}")
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Start transaction
        print("✓ Connected to database")
        print("✓ Starting migration...")
        print()
        
        # Step 1: Check current structure
        print("[1/5] Checking current table structure...")
        cursor.execute("PRAGMA table_info(executions)")
        columns = {col[1]: col for col in cursor.fetchall()}
        
        if 'ticker_id' not in columns:
            raise Exception("ticker_id column does not exist")
        
        # Check if ticker_id is already NOT NULL
        ticker_col = columns['ticker_id']
        if ticker_col[3] == 1:  # NOT NULL flag
            print("⚠️  ticker_id is already NOT NULL - migration may have been run before")
            response = input("Continue anyway? (y/n): ")
            if response.lower() != 'y':
                print("Migration cancelled")
                return False
        
        # Check for executions without ticker_id
        cursor.execute("SELECT COUNT(*) FROM executions WHERE ticker_id IS NULL")
        null_count = cursor.fetchone()[0]
        if null_count > 0:
            raise Exception(f"Cannot proceed: {null_count} executions have NULL ticker_id. Please fix data first.")
        
        print(f"✓ Verified: {null_count} executions with NULL ticker_id (OK)")
        print()
        
        # Step 2: Check for CHECK constraint
        print("[2/5] Checking for CHECK constraints...")
        cursor.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='executions'")
        table_sql = cursor.fetchone()[0]
        
        has_check_constraint = 'CHECK' in table_sql.upper()
        if has_check_constraint:
            print("⚠️  Found CHECK constraint - will be removed")
        else:
            print("✓ No CHECK constraint found")
        print()
        
        # Step 3: Create new table with updated structure
        print("[3/5] Creating new table structure...")
        cursor.execute("""
            CREATE TABLE executions_new (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                ticker_id INTEGER NOT NULL,
                trade_id INTEGER NULL,
                trading_account_id INTEGER NULL,
                action VARCHAR(20) NOT NULL DEFAULT 'buy',
                date DATETIME NOT NULL,
                quantity FLOAT NOT NULL,
                price FLOAT NOT NULL,
                fee FLOAT DEFAULT 0.00,
                source VARCHAR(50) DEFAULT 'manual',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                external_id VARCHAR(100),
                notes VARCHAR(5000),
                realized_pl INTEGER NULL,
                mtm_pl INTEGER NULL,
                FOREIGN KEY (ticker_id) REFERENCES tickers (id),
                FOREIGN KEY (trade_id) REFERENCES trades (id),
                FOREIGN KEY (trading_account_id) REFERENCES trading_accounts (id)
            )
        """)
        print("✓ New table created with updated structure")
        print()
        
        # Step 4: Copy existing data
        print("[4/5] Migrating existing data...")
        cursor.execute("""
            INSERT INTO executions_new 
            (id, ticker_id, trade_id, trading_account_id, action, date, quantity, price, fee, source, created_at, external_id, notes, realized_pl, mtm_pl)
            SELECT 
                id, ticker_id, trade_id, trading_account_id, action, date, quantity, price, fee, source, created_at, external_id, notes, realized_pl, mtm_pl
            FROM executions
            WHERE ticker_id IS NOT NULL
        """)
        rows_migrated = cursor.rowcount
        print(f"✓ Migrated {rows_migrated} existing executions")
        print()
        
        # Step 5: Replace old table
        print("[5/5] Finalizing migration...")
        cursor.execute("DROP TABLE executions")
        cursor.execute("ALTER TABLE executions_new RENAME TO executions")
        print("✓ Old table replaced")
        print()
        
        # Verify migration
        print("[Verification] Verifying migration...")
        cursor.execute("SELECT COUNT(*) FROM executions")
        final_count = cursor.fetchone()[0]
        
        cursor.execute("PRAGMA table_info(executions)")
        new_columns = {col[1]: col for col in cursor.fetchall()}
        
        # Verify ticker_id is NOT NULL
        ticker_col_new = new_columns['ticker_id']
        if ticker_col_new[3] != 1:
            raise Exception("ticker_id is still nullable after migration")
        
        if final_count != rows_migrated:
            raise Exception(f"Row count mismatch: {rows_migrated} → {final_count}")
        
        print(f"✓ Verified {final_count} rows in new structure")
        print("✓ ticker_id is now NOT NULL")
        print()
        
        # Commit transaction
        conn.commit()
        print("=" * 70)
        print("✅ MIGRATION SUCCESSFUL")
        print("=" * 70)
        print()
        print("Summary:")
        print(f"  - Migrated {rows_migrated} executions")
        print(f"  - Changed ticker_id to NOT NULL")
        print(f"  - Removed CHECK constraint (if existed)")
        print()
        
        return True
        
    except Exception as e:
        print()
        print("=" * 70)
        print("❌ MIGRATION FAILED")
        print("=" * 70)
        print(f"Error: {str(e)}")
        print()
        print("Rolling back changes...")
        conn.rollback()
        print("✓ Rollback complete")
        print()
        return False
        
    finally:
        conn.close()
        print("✓ Database connection closed")

if __name__ == "__main__":
    # Determine database path
    if len(sys.argv) > 1:
        db_path = sys.argv[1]
    else:
        # Default path relative to project root
        project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        db_path = os.path.join(project_root, 'db', 'simpleTrade_new.db')
    
    success = run_migration(db_path)
    sys.exit(0 if success else 1)

