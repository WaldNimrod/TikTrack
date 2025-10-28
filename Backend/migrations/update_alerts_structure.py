#!/usr/bin/env python3
"""
Migration to update alerts table structure
==========================================

This migration updates the alerts table to use a flexible association system:
- Adds related_type_id and related_id fields
- Removes trading_account_id and ticker_id fields
- Transfers existing data to the new system
- Adds 'ticker' association type to note_relation_types table

Author: TikTrack Development Team
Date: 2025-08-18
"""

import sqlite3
import os
from datetime import datetime

def update_alerts_structure():
    """Update alerts table structure to flexible association system"""
    
    # Database path
    db_path = os.path.join(os.path.dirname(__file__), '..', 'db', 'simpleTrade_new.db')
    
    if not os.path.exists(db_path):
        return False
    
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check if new fields already exist
        cursor.execute("PRAGMA table_info(alerts)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'related_type_id' in columns and 'related_id' in columns:
            return True
        
        # 1. Add 'ticker' association type to note_relation_types table
        try:
            cursor.execute("INSERT INTO note_relation_types (note_relation_type) VALUES (?)", ('ticker',))
            ticker_relation_id = cursor.lastrowid
        except sqlite3.IntegrityError:
            # If already exists, get the ID
            cursor.execute("SELECT id FROM note_relation_types WHERE note_relation_type = ?", ('ticker',))
            ticker_relation_id = cursor.fetchone()[0]
        
        # Get existing association type IDs
        cursor.execute("SELECT id, note_relation_type FROM note_relation_types")
        relation_types = {row[1]: row[0] for row in cursor.fetchall()}
        
        # 2. Add new fields
        cursor.execute("ALTER TABLE alerts ADD COLUMN related_type_id INTEGER")
        cursor.execute("ALTER TABLE alerts ADD COLUMN related_id INTEGER")
        
        # 3. Transfer existing data
        
        # Transfer alerts associated with accounts
        cursor.execute("""
            UPDATE alerts 
            SET related_type_id = ?, related_id = trading_account_id 
            WHERE trading_account_id IS NOT NULL
        """, (relation_types.get('account', 1),))
        account_alerts_updated = cursor.rowcount
        
        # Transfer alerts associated with tickers
        cursor.execute("""
            UPDATE alerts 
            SET related_type_id = ?, related_id = ticker_id 
            WHERE ticker_id IS NOT NULL
        """, (ticker_relation_id,))
        ticker_alerts_updated = cursor.rowcount
        
        # 4. Remove old fields
        
        # Create temporary table with new structure
        cursor.execute("""
            CREATE TABLE alerts_new (
                id INTEGER PRIMARY KEY,
                type VARCHAR(50) NOT NULL,
                status VARCHAR(20) DEFAULT 'open',
                condition VARCHAR(500) NOT NULL,
                message VARCHAR(500),
                triggered_at DATETIME,
                is_triggered VARCHAR(20) DEFAULT 'false',
                related_type_id INTEGER NOT NULL,
                related_id INTEGER NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (related_type_id) REFERENCES note_relation_types(id)
            )
        """)
        
        # Copy data to new table
        cursor.execute("""
            INSERT INTO alerts_new 
            SELECT id, type, status, condition, message, triggered_at, is_triggered, 
                   related_type_id, related_id, created_at
            FROM alerts
        """)
        
        # Delete old table
        cursor.execute("DROP TABLE alerts")
        
        # Rename new table
        cursor.execute("ALTER TABLE alerts_new RENAME TO alerts")
        
        
        # 5. Create indexes
        cursor.execute("CREATE INDEX IF NOT EXISTS ix_alerts_related_type_id ON alerts(related_type_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS ix_alerts_related_id ON alerts(related_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS ix_alerts_is_triggered ON alerts(is_triggered)")
        cursor.execute("CREATE INDEX IF NOT EXISTS ix_alerts_status ON alerts(status)")
        
        # 6. Final check
        cursor.execute("PRAGMA table_info(alerts)")
        final_columns = [column[1] for column in cursor.fetchall()]
        
        # Data check
        cursor.execute("SELECT COUNT(*) FROM alerts")
        total_alerts = cursor.fetchone()[0]
        
        conn.commit()
        conn.close()
        
        return True
        
    except Exception as e:
        if 'conn' in locals():
            conn.rollback()
            conn.close()
        return False

if __name__ == "__main__":
    success = update_alerts_structure()
    if success:
    else:
        exit(1)
