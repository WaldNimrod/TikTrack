"""
Migration: Remove legacy fields from alerts table
===============================================

This migration removes the following fields from the alerts table:
- related_type_id_default
- type_default  
- type

These fields are no longer needed as they have been replaced by the new condition-based system.

Author: TikTrack Development Team
Version: 1.0
Date: 2025-08-26
"""

import sqlite3
import os
from datetime import datetime

def run_migration():
    """Run the migration to remove legacy fields from alerts table"""
    
    # Get database path
    db_path = os.path.join(os.path.dirname(__file__), '..', 'db', 'simpleTrade_new.db')
    
    print(f"Starting migration: Remove legacy fields from alerts table")
    print(f"Database: {db_path}")
    
    try:
        # Connect to database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Start transaction
        cursor.execute("BEGIN TRANSACTION")
        
        # 1. Remove constraints related to the 'type' field
        print("Removing constraints for 'type' field...")
        cursor.execute("""
            DELETE FROM constraints 
            WHERE table_name = 'alerts' AND column_name = 'type'
        """)
        
        # Remove enum values for type field
        cursor.execute("""
            DELETE FROM enum_values 
            WHERE constraint_id IN (
                SELECT id FROM constraints 
                WHERE table_name = 'alerts' AND column_name = 'type'
            )
        """)
        
        # 2. Create new table structure without the legacy fields
        print("Creating new alerts table structure...")
        cursor.execute("""
            CREATE TABLE alerts_new (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                account_id INT,
                ticker_id INT,
                message TEXT,
                triggered_at NUM,
                created_at NUM,
                status TEXT,
                is_triggered TEXT,
                related_type_id INT,
                related_id INT,
                condition_attribute TEXT,
                condition_operator TEXT,
                condition_number NUM
            )
        """)
        
        # 3. Copy data from old table to new table (excluding legacy fields)
        print("Copying data to new table structure...")
        cursor.execute("""
            INSERT INTO alerts_new (
                id, account_id, ticker_id, message, triggered_at, created_at,
                status, is_triggered, related_type_id, related_id,
                condition_attribute, condition_operator, condition_number
            )
            SELECT 
                id, account_id, ticker_id, message, triggered_at, created_at,
                status, is_triggered, related_type_id, related_id,
                condition_attribute, condition_operator, condition_number
            FROM alerts
        """)
        
        # 4. Drop old table and rename new table
        print("Replacing old table with new structure...")
        cursor.execute("DROP TABLE alerts")
        cursor.execute("ALTER TABLE alerts_new RENAME TO alerts")
        
        # 5. Recreate indexes
        print("Recreating indexes...")
        cursor.execute("CREATE INDEX idx_alerts_status ON alerts(status)")
        cursor.execute("CREATE INDEX idx_alerts_is_triggered ON alerts(is_triggered)")
        cursor.execute("CREATE INDEX idx_alerts_related_type_id ON alerts(related_type_id)")
        cursor.execute("CREATE INDEX idx_alerts_created_at ON alerts(created_at)")
        
        # Commit transaction
        cursor.execute("COMMIT")
        
        print("Migration completed successfully!")
        
        # Verify the new structure
        cursor.execute("PRAGMA table_info(alerts)")
        columns = cursor.fetchall()
        print("\nNew table structure:")
        for col in columns:
            print(f"  {col[1]} ({col[2]})")
        
    except Exception as e:
        print(f"Migration failed: {str(e)}")
        cursor.execute("ROLLBACK")
        raise
    finally:
        conn.close()

if __name__ == "__main__":
    run_migration()
