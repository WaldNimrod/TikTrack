#!/usr/bin/env python3
"""
Migration script to update accounts table to use currency_id instead of currency string

This script:
1. Creates a new currency_id column in the accounts table
2. Maps existing currency strings to currency IDs
3. Removes the old currency column
4. Updates the table structure

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

def update_accounts_currency_table():
    """Update accounts table to use currency ID"""
    
    try:
        # Create database connection
        engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
        
        with engine.connect() as connection:
            
            # 1. Check that currencies table exists
            result = connection.execute(text("SELECT name FROM sqlite_master WHERE type='table' AND name='currencies'"))
            if not result.fetchone():
                return False
            
            # 2. Check that there are currencies in the table
            result = connection.execute(text("SELECT COUNT(*) as count FROM currencies"))
            currency_count = result.fetchone()[0]
            if currency_count == 0:
                return False
            
            
            # 3. Check if currency_id column already exists
            result = connection.execute(text("PRAGMA table_info(accounts)"))
            columns = [col[1] for col in result.fetchall()]
            
            if 'currency_id' in columns:
                return True
            
            # 4. Create new currency_id column
            connection.execute(text("ALTER TABLE accounts ADD COLUMN currency_id INTEGER"))
            connection.commit()
            
            # 5. Map existing currencies to IDs
            currency_mapping = {}
            result = connection.execute(text("SELECT id, symbol FROM currencies"))
            for row in result.fetchall():
                currency_mapping[row[1]] = row[0]
            
            
            # 6. Update existing records
            result = connection.execute(text("SELECT id, currency FROM accounts WHERE currency IS NOT NULL"))
            accounts_to_update = result.fetchall()
            
            updated_count = 0
            for account_id, currency_str in accounts_to_update:
                currency_str = currency_str.upper() if currency_str else 'USD'
                
                if currency_str in currency_mapping:
                    currency_id = currency_mapping[currency_str]
                    connection.execute(
                        text("UPDATE accounts SET currency_id = :currency_id WHERE id = :account_id"),
                        {"currency_id": currency_id, "account_id": account_id}
                    )
                    updated_count += 1
                else:
                    # If currency doesn't exist, use USD as default
                    default_currency_id = currency_mapping.get('USD', 1)
                    connection.execute(
                        text("UPDATE accounts SET currency_id = :currency_id WHERE id = :account_id"),
                        {"currency_id": default_currency_id, "account_id": account_id}
                    )
                    updated_count += 1
            
            connection.commit()
            
            # 7. Set default for records without currency
            usd_id = currency_mapping.get('USD', 1)
            result = connection.execute(
                text("UPDATE accounts SET currency_id = :usd_id WHERE currency_id IS NULL"),
                {"usd_id": usd_id}
            )
            connection.commit()
            
            if result.rowcount > 0:
            
            # 8. Create Foreign Key constraint (indirectly in SQLite)
            # SQLite doesn't support ALTER TABLE ADD CONSTRAINT, so verify data integrity
            result = connection.execute(text("""
                SELECT COUNT(*) as invalid_count 
                FROM accounts a 
                LEFT JOIN currencies c ON a.currency_id = c.id 
                WHERE a.currency_id IS NOT NULL AND c.id IS NULL
            """))
            
            invalid_count = result.fetchone()[0]
            if invalid_count > 0:
                return False
            
            
            return True
            
    except Exception as e:
        return False

def verify_accounts_update():
    """Verify update results"""
    
    try:
        engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
        
        with engine.connect() as connection:
            
            # Check table structure
            result = connection.execute(text("PRAGMA table_info(accounts)"))
            columns = result.fetchall()
            
            for col in columns:
                col_name, col_type = col[1], col[2]
            
            # Check data
            result = connection.execute(text("""
                SELECT 
                    a.id, 
                    a.name, 
                    a.currency_id, 
                    c.symbol as currency_symbol,
                    c.name as currency_name
                FROM accounts a
                LEFT JOIN currencies c ON a.currency_id = c.id
                LIMIT 10
            """))
            
            accounts = result.fetchall()
            if accounts:
                for acc in accounts:
            
            return True
            
    except Exception as e:
        return False

if __name__ == "__main__":
    
    # Update table
    if update_accounts_currency_table():
        # Verify results
        verify_accounts_update()
    else:
        sys.exit(1)
