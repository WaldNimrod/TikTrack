#!/usr/bin/env python3
"""
Migration script to create currencies table

This script creates the currencies table with the required fields:
- id: Primary key
- symbol: Currency symbol (e.g., USD, EUR, ILS)
- name: Currency name in Hebrew
- usd_rate: Current exchange rate to USD
- created_at: Timestamp when the record was created

Author: TikTrack Development Team
Version: 1.0
Last Updated: 2025-08-21
"""

import sys
import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Add the Backend directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from config.settings import DATABASE_URL

def create_currencies_table():
    """Create currencies table"""
    
    try:
        # Create database connection
        engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
        
        # SQL to create the table
        create_table_sql = """
        CREATE TABLE IF NOT EXISTS currencies (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            symbol VARCHAR(10) NOT NULL UNIQUE,
            name VARCHAR(100) NOT NULL,
            usd_rate DECIMAL(10,6) NOT NULL DEFAULT 1.000000,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """
        
        # Create index on symbol
        create_index_sql = """
        CREATE INDEX IF NOT EXISTS idx_currencies_symbol ON currencies(symbol);
        """
        
        # Execute migration
        with engine.connect() as connection:
            # Create table
            connection.execute(text(create_table_sql))
            connection.commit()
            
            # Create index
            connection.execute(text(create_index_sql))
            connection.commit()
            
            # Verify table was created
            result = connection.execute(text("SELECT name FROM sqlite_master WHERE type='table' AND name='currencies'"))
            if result.fetchone():
            else:
                return False
        
        return True
        
    except Exception as e:
        return False

def verify_table_structure():
    """Verify the structure of the created table"""
    
    try:
        engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
        
        with engine.connect() as connection:
            # Check table structure
            result = connection.execute(text("PRAGMA table_info(currencies)"))
            columns = result.fetchall()
            
            
            expected_columns = {
                'id': 'INTEGER PRIMARY KEY',
                'symbol': 'VARCHAR(10)',
                'name': 'VARCHAR(100)', 
                'usd_rate': 'DECIMAL(10,6)',
                'created_at': 'TIMESTAMP'
            }
            
            found_columns = {}
            for col in columns:
                col_name = col[1]
                col_type = col[2]
                found_columns[col_name] = col_type
            
            # Check that all required fields exist
            missing_columns = []
            for expected_col, expected_type in expected_columns.items():
                if expected_col not in found_columns:
                    missing_columns.append(expected_col)
            
            if missing_columns:
                return False
            else:
                return True
                
    except Exception as e:
        return False

if __name__ == "__main__":
    
    # Create table
    if create_currencies_table():
        # Check structure
        verify_table_structure()
    else:
        sys.exit(1)
