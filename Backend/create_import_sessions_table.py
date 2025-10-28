#!/usr/bin/env python3
"""
Create import_sessions table directly
"""

import sqlite3
import os
from pathlib import Path

def create_import_sessions_table():
    """Create import_sessions table"""
    
    # Get database path
    backend_dir = Path(__file__).parent
    db_path = backend_dir / "db" / "simpleTrade_clean.db"
    
    if not db_path.exists():
        print(f"Database not found at: {db_path}")
        return False
    
    try:
        # Connect to database
        conn = sqlite3.connect(str(db_path))
        cursor = conn.cursor()
        
        # Create import_sessions table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS import_sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                trading_account_id INTEGER NOT NULL,
                provider VARCHAR(50) NOT NULL,
                file_name VARCHAR(255) NOT NULL,
                total_records INTEGER NOT NULL DEFAULT 0,
                imported_records INTEGER NOT NULL DEFAULT 0,
                skipped_records INTEGER NOT NULL DEFAULT 0,
                status VARCHAR(20) NOT NULL DEFAULT 'analyzing',
                summary_data TEXT,
                created_at DATETIME,
                completed_at DATETIME,
                FOREIGN KEY (trading_account_id) REFERENCES trading_accounts (id)
            )
        ''')
        
        # Create indexes
        cursor.execute('CREATE INDEX IF NOT EXISTS ix_import_sessions_trading_account_id ON import_sessions(trading_account_id)')
        cursor.execute('CREATE INDEX IF NOT EXISTS ix_import_sessions_status ON import_sessions(status)')
        cursor.execute('CREATE INDEX IF NOT EXISTS ix_import_sessions_provider ON import_sessions(provider)')
        cursor.execute('CREATE INDEX IF NOT EXISTS ix_import_sessions_created_at ON import_sessions(created_at)')
        
        # Commit changes
        conn.commit()
        conn.close()
        
        print("✅ import_sessions table created successfully")
        return True
        
    except Exception as e:
        print(f"❌ Error creating table: {e}")
        return False

if __name__ == "__main__":
    create_import_sessions_table()
