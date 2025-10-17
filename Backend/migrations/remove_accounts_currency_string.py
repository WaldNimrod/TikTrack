#!/usr/bin/env python3
"""
Migration script to remove the old currency string field from accounts table

This script:
1. Verifies that currency_id column exists and has data
2. Removes the old currency VARCHAR(3) column
3. Updates the table structure

Author: TikTrack Development Team
Version: 1.0
Last Updated: 2025-08-28
"""

import sys
import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Add the Backend directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from config.settings import DATABASE_URL

def remove_accounts_currency_string():
    """Remove the old currency string field from accounts table"""
    
    try:
        # Create database connection
        engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
        
        with engine.connect() as connection:
            
            # 1. Check that currency_id column exists and has data
            result = connection.execute(text("PRAGMA table_info(accounts)"))
            columns = [col[1] for col in result.fetchall()]
            
            if 'currency_id' not in columns:
                return False
            
            # 2. Check that currency_id has data
            result = connection.execute(text("SELECT COUNT(*) FROM accounts WHERE currency_id IS NOT NULL"))
            count = result.fetchone()[0]
            
            if count == 0:
                return False
            
            
            # 3. Check that currency column exists
            if 'currency' not in columns:
                return True
            
            # 4. Verify data integrity before removal
            result = connection.execute(text("""
                SELECT COUNT(*) as invalid_count 
                FROM accounts a 
                LEFT JOIN currencies c ON a.currency_id = c.id 
                WHERE a.currency_id IS NOT NULL AND c.id IS NULL
            """))
            
            invalid_count = result.fetchone()[0]
            if invalid_count > 0:
                return False
            
            
            # 5. Create new table without currency column
            connection.execute(text("""
                CREATE TABLE accounts_new (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name VARCHAR(100) NOT NULL,
                    currency_id INTEGER NOT NULL,
                    status VARCHAR(20),
                    cash_balance FLOAT,
                    total_value FLOAT,
                    total_pl FLOAT,
                    notes VARCHAR(500),
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    status_default VARCHAR(20) DEFAULT 'open',
                    FOREIGN KEY (currency_id) REFERENCES currencies(id)
                )
            """))
            
            # 6. Copy data to new table
            connection.execute(text("""
                INSERT INTO accounts_new (
                    id, name, currency_id, status, cash_balance, 
                    total_value, total_pl, notes, created_at, status_default
                )
                SELECT 
                    id, name, currency_id, status, cash_balance,
                    total_value, total_pl, notes, created_at, status_default
                FROM accounts
            """))
            
            # 7. Drop old table and rename new table
            connection.execute(text("DROP TABLE accounts"))
            connection.execute(text("ALTER TABLE accounts_new RENAME TO accounts"))
            
            # 8. Recreate trigger
            connection.execute(text("""
                CREATE TRIGGER protect_last_account_delete 
                BEFORE DELETE ON accounts 
                BEGIN 
                    SELECT CASE 
                        WHEN (SELECT COUNT(*) FROM accounts) = 1 
                        THEN RAISE(ABORT, 'Cannot delete the last account in the system') 
                    END; 
                END
            """))
            
            connection.commit()
            
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
            
            # Check for old currency column
            column_names = [col[1] for col in columns]
            if 'currency' in column_names:
                return False
            else:
            
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
                LIMIT 5
            """))
            
            accounts = result.fetchall()
            if accounts:
                for acc in accounts:
            
            return True
            
    except Exception as e:
        return False

if __name__ == "__main__":
    
    # Update table
    if remove_accounts_currency_string():
        # Verify results
        verify_accounts_update()
    else:
        sys.exit(1)
