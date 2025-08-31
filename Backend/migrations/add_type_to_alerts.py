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
    
    
    try:
        # Connect to database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check if type column already exists
        cursor.execute("PRAGMA table_info(alerts)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'type' in columns:
            return True
        
        # Add type column
        cursor.execute("ALTER TABLE alerts ADD COLUMN type VARCHAR(50)")
        
        # Update existing records with default type
        cursor.execute("UPDATE alerts SET type = 'price_alert' WHERE type IS NULL")
        
        # Commit changes
        conn.commit()
        
        
        return True
        
    except Exception as e:
        if conn:
            conn.rollback()
        return False
        
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    migrate()

