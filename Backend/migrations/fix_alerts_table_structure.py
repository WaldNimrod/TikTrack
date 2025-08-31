"""
Migration: Fix alerts table structure
Date: 2025-08-26
Description: Fix alerts table structure to match the model
- Update triggered_at and created_at to DATETIME
- Update condition_number to NUM
- Remove type column
- Add default values
"""

import sqlite3
import os
from datetime import datetime

def migrate():
    """Fix alerts table structure"""
    
    # Database path
    db_path = os.path.join(os.path.dirname(__file__), '..', 'db', 'simpleTrade_new.db')
    
    
    try:
        # Connect to database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        
        # Create new table with correct structure
        cursor.execute("""
            CREATE TABLE alerts_new (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                account_id INTEGER,
                ticker_id INTEGER,
                message TEXT,
                triggered_at DATETIME,
                created_at DATETIME DEFAULT (CURRENT_TIMESTAMP),
                status TEXT DEFAULT 'open',
                is_triggered TEXT DEFAULT 'false',
                related_type_id INTEGER NOT NULL DEFAULT 4,
                related_id INTEGER NOT NULL,
                condition_attribute TEXT NOT NULL DEFAULT 'price',
                condition_operator TEXT NOT NULL DEFAULT 'more_than',
                condition_number NUM NOT NULL DEFAULT 0
            )
        """)
        
        
        # Copy data from old table to new table
        cursor.execute("""
            INSERT INTO alerts_new (
                id, account_id, ticker_id, message, triggered_at, created_at,
                status, is_triggered, related_type_id, related_id,
                condition_attribute, condition_operator, condition_number
            )
            SELECT 
                id, account_id, ticker_id, message, 
                CASE 
                    WHEN triggered_at IS NOT NULL THEN datetime(triggered_at, 'unixepoch')
                    ELSE NULL 
                END as triggered_at,
                CASE 
                    WHEN created_at IS NOT NULL THEN datetime(created_at, 'unixepoch')
                    ELSE datetime('now')
                END as created_at,
                COALESCE(status, 'open') as status,
                COALESCE(is_triggered, 'false') as is_triggered,
                COALESCE(related_type_id, 4) as related_type_id,
                related_id,
                COALESCE(condition_attribute, 'price') as condition_attribute,
                COALESCE(condition_operator, 'more_than') as condition_operator,
                COALESCE(CAST(condition_number AS REAL), 0) as condition_number
            FROM alerts
        """)
        
        
        # Drop old table
        cursor.execute("DROP TABLE alerts")
        
        
        # Rename new table to original name
        cursor.execute("ALTER TABLE alerts_new RENAME TO alerts")
        
        
        # Recreate indexes
        cursor.execute("CREATE INDEX idx_alerts_status ON alerts(status)")
        cursor.execute("CREATE INDEX idx_alerts_is_triggered ON alerts(is_triggered)")
        cursor.execute("CREATE INDEX idx_alerts_related_type_id ON alerts(related_type_id)")
        cursor.execute("CREATE INDEX idx_alerts_created_at ON alerts(created_at)")
        
        # Commit changes
        conn.commit()
        
        
        # Show new table structure
        cursor.execute(".schema alerts")
        schema = cursor.fetchall()
        for line in schema:
        
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
