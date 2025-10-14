"""
Migration: Executions Flexible Association
Date: 2025-10-14
Version: 2.0.7

Description:
This migration modifies the Executions table to support flexible association,
allowing executions to be linked either to a Ticker (temporary state) or to a
Trade (complete state).

Changes:
1. Add ticker_id column (NULLABLE, FK to tickers.id)
2. Modify trade_id to be NULLABLE (was NOT NULL)
3. Modify trading_account_id to be NULLABLE (required only when trade_id is set)
4. Add CHECK constraint to ensure exactly one of ticker_id or trade_id is NOT NULL

Rollback:
To rollback, restore database from backup:
Backend/db/backups/backup_before_executions_migration_*.db
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
    print("Executions Flexible Association Migration")
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
        print("[1/6] Checking current table structure...")
        cursor.execute("PRAGMA table_info(executions)")
        columns = {col[1]: col for col in cursor.fetchall()}
        
        if 'ticker_id' in columns:
            print("⚠️  ticker_id column already exists - migration may have been run before")
            response = input("Continue anyway? (y/n): ")
            if response.lower() != 'y':
                print("Migration cancelled")
                return False
        
        print("✓ Current structure verified")
        print()
        
        # Step 2: Create new table with updated structure
        print("[2/6] Creating new table structure...")
        cursor.execute("""
            CREATE TABLE executions_new (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                ticker_id INTEGER,
                trade_id INTEGER,
                trading_account_id INTEGER,
                action VARCHAR(20) NOT NULL DEFAULT 'buy',
                date DATETIME NOT NULL,
                quantity FLOAT NOT NULL,
                price FLOAT NOT NULL,
                fee FLOAT DEFAULT 0.00,
                source VARCHAR(50) DEFAULT 'manual',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                external_id VARCHAR(100),
                notes VARCHAR(500),
                FOREIGN KEY (ticker_id) REFERENCES tickers (id),
                FOREIGN KEY (trade_id) REFERENCES trades (id),
                FOREIGN KEY (trading_account_id) REFERENCES trading_accounts (id),
                CHECK (
                    (ticker_id IS NOT NULL AND trade_id IS NULL) OR 
                    (ticker_id IS NULL AND trade_id IS NOT NULL)
                )
            )
        """)
        print("✓ New table created with updated structure")
        print()
        
        # Step 3: Copy existing data
        print("[3/6] Migrating existing data...")
        cursor.execute("""
            INSERT INTO executions_new 
            (id, trade_id, action, date, quantity, price, fee, source, created_at, external_id, notes)
            SELECT 
                id, trade_id, action, date, quantity, price, fee, source, created_at, external_id, notes
            FROM executions
        """)
        rows_migrated = cursor.rowcount
        print(f"✓ Migrated {rows_migrated} existing executions")
        print()
        
        # Step 4: Drop old table
        print("[4/6] Removing old table...")
        cursor.execute("DROP TABLE executions")
        print("✓ Old table removed")
        print()
        
        # Step 5: Rename new table
        print("[5/6] Finalizing new table...")
        cursor.execute("ALTER TABLE executions_new RENAME TO executions")
        print("✓ New table renamed to 'executions'")
        print()
        
        # Step 6: Verify migration
        print("[6/6] Verifying migration...")
        cursor.execute("SELECT COUNT(*) FROM executions")
        final_count = cursor.fetchone()[0]
        
        cursor.execute("PRAGMA table_info(executions)")
        new_columns = {col[1]: col for col in cursor.fetchall()}
        
        # Verify all required columns exist
        required_columns = ['ticker_id', 'trade_id', 'trading_account_id']
        all_present = all(col in new_columns for col in required_columns)
        
        if not all_present:
            raise Exception("Not all required columns were created")
        
        if final_count != rows_migrated:
            raise Exception(f"Row count mismatch: {rows_migrated} → {final_count}")
        
        print(f"✓ Verified {final_count} rows in new structure")
        print("✓ All required columns present")
        print()
        
        # Commit transaction
        conn.commit()
        print("=" * 70)
        print("✅ MIGRATION SUCCESSFUL")
        print("=" * 70)
        print()
        print("Summary:")
        print(f"  - Migrated {rows_migrated} executions")
        print(f"  - Added ticker_id column")
        print(f"  - Changed trade_id to NULLABLE")
        print(f"  - Changed trading_account_id to NULLABLE")
        print(f"  - Added CHECK constraint for association")
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
        print("To restore from backup:")
        print("  cp Backend/db/backups/backup_before_executions_migration_*.db Backend/db/simpleTrade_new.db")
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

