#!/usr/bin/env python3
"""
Migration script: accounts → trading_accounts
This script migrates the accounts table to trading_accounts table.
"""

import sqlite3
import os
import logging
from datetime import datetime

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def get_db_path():
    """Get the database path"""
    return os.path.join(os.path.dirname(__file__), '..', 'db', 'tiktrack.db')

def backup_database():
    """Create a backup of the database before migration"""
    db_path = get_db_path()
    backup_path = f"{db_path}.backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    
    logger.info(f"Creating database backup: {backup_path}")
    
    # Read the entire database
    with open(db_path, 'rb') as source:
        with open(backup_path, 'wb') as backup:
            backup.write(source.read())
    
    logger.info(f"Database backup created successfully: {backup_path}")
    return backup_path

def migrate_accounts_to_trading_accounts():
    """Perform the migration from accounts to trading_accounts"""
    db_path = get_db_path()
    
    if not os.path.exists(db_path):
        logger.error(f"Database not found: {db_path}")
        return False
    
    # Create backup first
    backup_path = backup_database()
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        logger.info("Starting accounts to trading_accounts migration...")
        
        # Step 1: Create trading_accounts table with same structure as accounts
        logger.info("Step 1: Creating trading_accounts table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS trading_accounts (
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
        """)
        
        # Step 2: Copy all data from accounts to trading_accounts
        logger.info("Step 2: Copying data from accounts to trading_accounts...")
        cursor.execute("""
            INSERT INTO trading_accounts 
            SELECT * FROM accounts
        """)
        
        accounts_count = cursor.rowcount
        logger.info(f"Copied {accounts_count} records from accounts to trading_accounts")
        
        # Step 3: We'll handle foreign key updates in Step 4 by recreating tables
        logger.info("Step 3: Skipping direct column updates - will handle in table recreation...")
        
        # Step 4: Update foreign key constraints
        logger.info("Step 4: Updating foreign key constraints...")
        
        # Drop old foreign key constraints (SQLite doesn't support DROP CONSTRAINT directly)
        # We need to recreate the tables with new constraints
        
        # For trades table
        logger.info("  - Recreating trades table with new constraints...")
        cursor.execute("DROP TABLE IF EXISTS trades_new")
        cursor.execute("""
            CREATE TABLE trades_new (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                trading_account_id INTEGER NOT NULL,
                ticker_id INTEGER NOT NULL,
                trade_plan_id INTEGER,
                status VARCHAR(20),
                investment_type VARCHAR(20),
                opened_at DATETIME,
                closed_at DATETIME,
                cancelled_at DATETIME,
                cancel_reason VARCHAR(500),
                total_pl FLOAT,
                notes VARCHAR(500),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                side VARCHAR(10) DEFAULT 'Long',
                FOREIGN KEY (trading_account_id) REFERENCES trading_accounts(id),
                FOREIGN KEY (ticker_id) REFERENCES tickers(id),
                FOREIGN KEY (trade_plan_id) REFERENCES trade_plans(id)
            )
        """)
        
        cursor.execute("""
            INSERT INTO trades_new (
                id, trading_account_id, ticker_id, trade_plan_id, status, 
                investment_type, opened_at, closed_at, cancelled_at, 
                cancel_reason, total_pl, notes, created_at, side
            ) 
            SELECT 
                id, account_id, ticker_id, trade_plan_id, status, 
                investment_type, opened_at, closed_at, cancelled_at, 
                cancel_reason, total_pl, notes, created_at, side
            FROM trades
        """)
        cursor.execute("DROP TABLE trades")
        cursor.execute("ALTER TABLE trades_new RENAME TO trades")
        
        # For trade_plans table
        logger.info("  - Recreating trade_plans table with new constraints...")
        cursor.execute("DROP TABLE IF EXISTS trade_plans_new")
        cursor.execute("""
            CREATE TABLE trade_plans_new (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                trading_account_id INTEGER NOT NULL,
                ticker_id INTEGER NOT NULL,
                investment_type VARCHAR(20),
                planned_amount FLOAT,
                entry_conditions VARCHAR(500),
                stop_price FLOAT,
                target_price FLOAT,
                reasons VARCHAR(500),
                cancelled_at DATETIME,
                cancel_reason VARCHAR(500),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                side VARCHAR(10) DEFAULT 'Long',
                status VARCHAR(20) DEFAULT 'open',
                stop_percentage FLOAT DEFAULT 0.1,
                target_percentage FLOAT DEFAULT 2000,
                current_price FLOAT DEFAULT 0,
                FOREIGN KEY (trading_account_id) REFERENCES trading_accounts(id),
                FOREIGN KEY (ticker_id) REFERENCES tickers(id)
            )
        """)
        
        cursor.execute("""
            INSERT INTO trade_plans_new (
                id, trading_account_id, ticker_id, investment_type, 
                planned_amount, entry_conditions, stop_price, target_price, 
                reasons, cancelled_at, cancel_reason, created_at, side, 
                status, stop_percentage, target_percentage, current_price
            ) 
            SELECT 
                id, account_id, ticker_id, investment_type, 
                planned_amount, entry_conditions, stop_price, target_price, 
                reasons, cancelled_at, cancel_reason, created_at, side, 
                status, stop_percentage, target_percentage, current_price
            FROM trade_plans
        """)
        cursor.execute("DROP TABLE trade_plans")
        cursor.execute("ALTER TABLE trade_plans_new RENAME TO trade_plans")
        
        # For cash_flows table
        logger.info("  - Recreating cash_flows table with new constraints...")
        cursor.execute("DROP TABLE IF EXISTS cash_flows_new")
        cursor.execute("""
            CREATE TABLE cash_flows_new (
                id INTEGER NOT NULL,
                trading_account_id INTEGER NOT NULL,
                type VARCHAR(50) NOT NULL,
                amount FLOAT NOT NULL,
                date DATE,
                description VARCHAR(500),
                created_at DATETIME DEFAULT (CURRENT_TIMESTAMP),
                currency_id INTEGER DEFAULT 1,
                usd_rate DECIMAL(10,6) DEFAULT 1.000000,
                source VARCHAR(20) DEFAULT 'manual',
                external_id VARCHAR(100) DEFAULT '0',
                PRIMARY KEY (id),
                FOREIGN KEY (trading_account_id) REFERENCES trading_accounts(id),
                FOREIGN KEY (currency_id) REFERENCES currencies(id)
            )
        """)
        
        cursor.execute("""
            INSERT INTO cash_flows_new (
                id, trading_account_id, type, amount, date, description, 
                created_at, currency_id, usd_rate, source, external_id
            ) 
            SELECT 
                id, account_id, type, amount, date, description, 
                created_at, currency_id, usd_rate, source, external_id
            FROM cash_flows
        """)
        cursor.execute("DROP TABLE cash_flows")
        cursor.execute("ALTER TABLE cash_flows_new RENAME TO cash_flows")
        
        # Step 5: Create protection trigger for trading_accounts
        logger.info("Step 5: Creating protection trigger for trading_accounts...")
        cursor.execute("""
            CREATE TRIGGER protect_last_trading_account_delete 
            BEFORE DELETE ON trading_accounts 
            BEGIN 
                SELECT CASE 
                    WHEN (SELECT COUNT(*) FROM trading_accounts) = 1 
                    THEN RAISE(ABORT, 'Cannot delete the last trading account in the system') 
                END; 
            END;
        """)
        
        # Step 6: Drop old accounts table
        logger.info("Step 6: Dropping old accounts table...")
        cursor.execute("DROP TABLE accounts")
        
        # Commit all changes
        conn.commit()
        logger.info("✅ Migration completed successfully!")
        
        # Verify the migration
        logger.info("Verifying migration...")
        cursor.execute("SELECT COUNT(*) FROM trading_accounts")
        trading_accounts_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM trades WHERE trading_account_id IS NOT NULL")
        trades_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM trade_plans WHERE trading_account_id IS NOT NULL")
        trade_plans_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM cash_flows WHERE trading_account_id IS NOT NULL")
        cash_flows_count = cursor.fetchone()[0]
        
        logger.info(f"Migration verification:")
        logger.info(f"  - Trading accounts: {trading_accounts_count}")
        logger.info(f"  - Trades with trading_account_id: {trades_count}")
        logger.info(f"  - Trade plans with trading_account_id: {trade_plans_count}")
        logger.info(f"  - Cash flows with trading_account_id: {cash_flows_count}")
        
        return True
        
    except Exception as e:
        logger.error(f"Migration failed: {str(e)}")
        logger.error(f"Database backup available at: {backup_path}")
        conn.rollback()
        return False
        
    finally:
        conn.close()

def main():
    """Main function"""
    logger.info("🚀 Starting accounts to trading_accounts migration...")
    
    if migrate_accounts_to_trading_accounts():
        logger.info("✅ Migration completed successfully!")
        logger.info("You can now start the server with the new trading_accounts table.")
    else:
        logger.error("❌ Migration failed!")
        logger.error("Please check the logs and restore from backup if necessary.")

if __name__ == "__main__":
    main()
