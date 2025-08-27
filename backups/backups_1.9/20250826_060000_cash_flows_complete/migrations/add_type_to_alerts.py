"""
Migration: Add type column to alerts table
Date: 2025-08-26
Description: Add missing type column to alerts table to fix API errors
"""

import sqlite3
import os
from datetime import datetime

def migrate():
    """Add type column to alerts table"""
    
    # Database path
    db_path = os.path.join(os.path.dirname(__file__), '..', 'db', 'simpleTrade_new.db')
    
    print(f"🔄 Starting migration: Add type column to alerts table")
    print(f"📁 Database path: {db_path}")
    
    try:
        # Connect to database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check if type column already exists
        cursor.execute("PRAGMA table_info(alerts)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'type' in columns:
            print("✅ Type column already exists in alerts table")
            return True
        
        # Add type column
        print("🔄 Adding type column to alerts table...")
        cursor.execute("ALTER TABLE alerts ADD COLUMN type VARCHAR(50)")
        
        # Update existing records with default type
        print("🔄 Updating existing records with default type...")
        cursor.execute("UPDATE alerts SET type = 'price_alert' WHERE type IS NULL")
        
        # Commit changes
        conn.commit()
        
        print("✅ Migration completed successfully")
        print(f"📊 Updated {cursor.rowcount} records with default type")
        
        return True
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        if conn:
            conn.rollback()
        return False
        
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    migrate()
