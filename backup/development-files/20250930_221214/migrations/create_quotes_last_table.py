#!/usr/bin/env python3
"""
Create quotes_last Table Migration
==================================

This script creates the quotes_last table for storing the latest quote data
per ticker for performance optimization.

Author: TikTrack Development Team
Date: January 2025
"""

import sqlite3
import os
from datetime import datetime

def create_quotes_last_table():
    """Create quotes_last table for latest quote data per ticker"""
    
    # Database path
    current_dir = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.join(current_dir, "..", "db", "simpleTrade_new.db")
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        print("📊 Creating quotes_last table...")
        
        # Check if table already exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='quotes_last'")
        if cursor.fetchone():
            print("⚠️  quotes_last table already exists, skipping creation")
            return True
        
        # Create quotes_last table based on specification
        cursor.execute("""
            CREATE TABLE quotes_last (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                ticker_id INTEGER NOT NULL,
                price NUMERIC(10, 4) NOT NULL,
                change_amount NUMERIC(10, 4),
                change_percent NUMERIC(5, 2),
                volume INTEGER,
                high_24h NUMERIC(10, 4),
                low_24h NUMERIC(10, 4),
                open_price NUMERIC(10, 4),
                previous_close NUMERIC(10, 4),
                provider VARCHAR(50) NOT NULL,
                asof_utc DATETIME,
                fetched_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
                source VARCHAR(50),
                currency VARCHAR(10) DEFAULT 'USD',
                is_stale BOOLEAN DEFAULT FALSE,
                quality_score REAL DEFAULT 1.0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (ticker_id) REFERENCES tickers(id),
                UNIQUE(ticker_id)
            )
        """)
        
        # Create indexes for performance
        print("📊 Creating indexes...")
        cursor.execute("CREATE INDEX idx_quotes_last_ticker_id ON quotes_last(ticker_id)")
        cursor.execute("CREATE INDEX idx_quotes_last_asof_utc ON quotes_last(asof_utc)")
        cursor.execute("CREATE INDEX idx_quotes_last_fetched_at ON quotes_last(fetched_at)")
        cursor.execute("CREATE INDEX idx_quotes_last_provider ON quotes_last(provider)")
        cursor.execute("CREATE INDEX idx_quotes_last_stale ON quotes_last(is_stale)")
        
        conn.commit()
        print("✅ quotes_last table created successfully with indexes")
        
        # Verify table structure
        cursor.execute("PRAGMA table_info(quotes_last)")
        columns = cursor.fetchall()
        print(f"📋 Table has {len(columns)} columns:")
        for col in columns:
            print(f"   - {col[1]} ({col[2]})")
        
        return True
        
    except Exception as e:
        print(f"❌ Error creating quotes_last table: {e}")
        conn.rollback()
        return False
        
    finally:
        conn.close()

if __name__ == "__main__":
    create_quotes_last_table()
