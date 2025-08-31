"""
Migration: Fix tickers table structure
Date: 2025-08-25
Description: Fix the tickers table to have proper ID as PRIMARY KEY with AUTOINCREMENT
"""

import sqlite3
import os
from datetime import datetime

def migrate():
    """Execute the migration"""
    
    # Path to database
    db_path = os.path.join(os.path.dirname(__file__), '..', 'db', 'simpleTrade_new.db')
    
    if not os.path.exists(db_path):
        return False
    
    try:
        # Connect to database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        
        # 1. Backup current data
        cursor.execute("DROP TABLE IF EXISTS tickers_backup")
        cursor.execute("""
            CREATE TABLE tickers_backup AS 
            SELECT * FROM tickers
        """)
        
        # 2. Create new tickers table with proper structure
        cursor.execute("DROP TABLE IF EXISTS tickers_new")
        cursor.execute("""
            CREATE TABLE tickers_new (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                symbol VARCHAR(10) NOT NULL,
                name VARCHAR(100),
                type VARCHAR(20),
                remarks VARCHAR(500),
                currency_id INTEGER NOT NULL,
                active_trades BOOLEAN,
                created_at DATETIME DEFAULT (CURRENT_TIMESTAMP),
                updated_at DATETIME,
                UNIQUE(symbol),
                FOREIGN KEY (currency_id) REFERENCES currencies(id)
            )
        """)
        
        # 3. Copy data from old table to new table
        cursor.execute("""
            INSERT INTO tickers_new (
                symbol, name, type, remarks, currency_id, 
                active_trades, created_at, updated_at
            )
            SELECT 
                symbol, name, type, remarks, currency_id,
                active_trades, created_at, updated_at
            FROM tickers_backup
        """)
        
        # 4. Drop old table
        cursor.execute("DROP TABLE tickers")
        
        # 5. Rename new table
        cursor.execute("ALTER TABLE tickers_new RENAME TO tickers")
        
        # 6. Recreate indexes
        cursor.execute("CREATE UNIQUE INDEX ix_tickers_symbol ON tickers (symbol)")
        cursor.execute("CREATE INDEX ix_tickers_id ON tickers (id)")
        
        # Commit changes
        conn.commit()
        
        
        # Print summary
        cursor.execute("SELECT COUNT(*) FROM tickers")
        tickers_count = cursor.fetchone()[0]
        
        
        return True
        
    except Exception as e:
        conn.rollback()
        return False
        
    finally:
        conn.close()

if __name__ == "__main__":
    migrate()
