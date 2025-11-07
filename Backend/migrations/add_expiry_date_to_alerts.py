"""
Migration: Add expiry_date to alerts table
Date: 2025-11-05
Description: Add expiry_date column to alerts table for automatic expiration
- Column: expiry_date VARCHAR(10) NULL (stores DATE as YYYY-MM-DD in SQLite)
- Default: NULL (no expiration)
- Nullable: True
"""

import sqlite3
import os
from datetime import datetime

def migrate():
    """Add expiry_date column to alerts table"""
    
    # Database path
    db_path = os.path.join(os.path.dirname(__file__), '..', 'db', 'simpleTrade_new.db')
    
    try:
        # Connect to database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check if column already exists
        cursor.execute("PRAGMA table_info(alerts)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'expiry_date' in columns:
            print("⚠️ Column expiry_date already exists in alerts table")
            return True
        
        # Add expiry_date column
        cursor.execute("""
            ALTER TABLE alerts ADD COLUMN expiry_date VARCHAR(10) NULL
        """)
        
        # Commit changes
        conn.commit()
        print("✅ Successfully added expiry_date column to alerts table")
        
        # Verify the column was added
        cursor.execute("PRAGMA table_info(alerts)")
        columns_after = [column[1] for column in cursor.fetchall()]
        
        if 'expiry_date' in columns_after:
            print("✅ Verified: expiry_date column exists in alerts table")
            return True
        else:
            print("❌ Error: expiry_date column was not added")
            return False
        
    except Exception as e:
        if conn:
            conn.rollback()
        print(f"❌ Error adding expiry_date column: {str(e)}")
        return False
        
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    print("🔄 Starting migration: Add expiry_date to alerts table...")
    success = migrate()
    if success:
        print("✅ Migration completed successfully")
    else:
        print("❌ Migration failed")
        exit(1)
