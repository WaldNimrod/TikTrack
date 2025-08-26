"""
Migration: Remove currency string fields from tickers and cash_flows tables
Date: 2025-08-25
Description: Remove the currency VARCHAR fields and keep only currency_id INTEGER fields
"""

import sqlite3
import os
from datetime import datetime

def migrate():
    """Execute the migration"""
    
    # Path to database
    db_path = os.path.join(os.path.dirname(__file__), '..', 'db', 'simpleTrade_new.db')
    
    if not os.path.exists(db_path):
        print(f"❌ Database not found at {db_path}")
        return False
    
    try:
        # Connect to database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        print("🔄 Starting migration: Remove currency string fields")
        
        # 1. Backup current data
        print("📋 Backing up current data...")
        
        # Backup tickers table
        cursor.execute("DROP TABLE IF EXISTS tickers_backup")
        cursor.execute("""
            CREATE TABLE tickers_backup AS 
            SELECT * FROM tickers
        """)
        
        # Backup cash_flows table
        cursor.execute("DROP TABLE IF EXISTS cash_flows_backup")
        cursor.execute("""
            CREATE TABLE cash_flows_backup AS 
            SELECT * FROM cash_flows
        """)
        
        # 2. Create new tickers table without currency field
        print("🔧 Creating new tickers table...")
        cursor.execute("DROP TABLE IF EXISTS tickers_new")
        cursor.execute("""
            CREATE TABLE tickers_new (
                id INTEGER NOT NULL,
                symbol VARCHAR(10) NOT NULL,
                name VARCHAR(100),
                type VARCHAR(20),
                remarks VARCHAR(500),
                currency_id INTEGER NOT NULL,
                active_trades BOOLEAN,
                created_at DATETIME DEFAULT (CURRENT_TIMESTAMP),
                updated_at DATETIME,
                PRIMARY KEY (id),
                FOREIGN KEY (currency_id) REFERENCES currencies(id)
            )
        """)
        
        # 3. Create new cash_flows table without currency field
        print("🔧 Creating new cash_flows table...")
        cursor.execute("DROP TABLE IF EXISTS cash_flows_new")
        cursor.execute("""
            CREATE TABLE cash_flows_new (
                id INTEGER NOT NULL,
                account_id INTEGER NOT NULL,
                type VARCHAR(50) NOT NULL,
                amount FLOAT NOT NULL,
                date DATE,
                description VARCHAR(500),
                currency_id INTEGER NOT NULL,
                usd_rate DECIMAL(10,6) DEFAULT 1.000000,
                source VARCHAR(20) DEFAULT 'manual',
                external_id VARCHAR(100) DEFAULT '0',
                created_at DATETIME DEFAULT (CURRENT_TIMESTAMP),
                PRIMARY KEY (id),
                FOREIGN KEY (account_id) REFERENCES accounts (id),
                FOREIGN KEY (currency_id) REFERENCES currencies(id)
            )
        """)
        
        # 4. Copy data from old tables to new tables
        print("📊 Copying data to new tables...")
        
        # Copy tickers data (converting currency to currency_id)
        cursor.execute("""
            INSERT INTO tickers_new (
                id, symbol, name, type, remarks, currency_id, 
                active_trades, created_at, updated_at
            )
            SELECT 
                t.id, t.symbol, t.name, t.type, t.remarks, 
                CASE 
                    WHEN t.currency = 'USD' THEN 1
                    WHEN t.currency = 'EUR' THEN 2
                    WHEN t.currency = 'ILS' THEN 3
                    ELSE 1  -- Default to USD
                END as currency_id,
                t.active_trades, t.created_at, t.updated_at
            FROM tickers_backup t
        """)
        
        # Copy cash_flows data (converting currency to currency_id)
        cursor.execute("""
            INSERT INTO cash_flows_new (
                id, account_id, type, amount, date, description,
                currency_id, usd_rate, source, external_id, created_at
            )
            SELECT 
                cf.id, cf.account_id, cf.type, cf.amount, cf.date, cf.description,
                CASE 
                    WHEN cf.currency = 'USD' THEN 1
                    WHEN cf.currency = 'EUR' THEN 2
                    WHEN cf.currency = 'ILS' THEN 3
                    ELSE 1  -- Default to USD
                END as currency_id,
                cf.usd_rate, cf.source, cf.external_id, cf.created_at
            FROM cash_flows_backup cf
        """)
        
        # 5. Drop old tables
        print("🗑️ Dropping old tables...")
        cursor.execute("DROP TABLE tickers")
        cursor.execute("DROP TABLE cash_flows")
        
        # 6. Rename new tables
        print("🔄 Renaming new tables...")
        cursor.execute("ALTER TABLE tickers_new RENAME TO tickers")
        cursor.execute("ALTER TABLE cash_flows_new RENAME TO cash_flows")
        
        # 7. Recreate indexes
        print("🔗 Recreating indexes...")
        cursor.execute("CREATE UNIQUE INDEX ix_tickers_symbol ON tickers (symbol)")
        cursor.execute("CREATE INDEX ix_tickers_id ON tickers (id)")
        cursor.execute("CREATE INDEX ix_cash_flows_id ON cash_flows (id)")
        
        # 8. Update constraints table - remove currency field constraints
        print("🔧 Updating constraints...")
        
        # Remove constraints for currency field in tickers
        cursor.execute("""
            UPDATE constraints 
            SET is_active = 0 
            WHERE table_name = 'tickers' AND column_name = 'currency'
        """)
        
        # Remove constraints for currency field in cash_flows
        cursor.execute("""
            UPDATE constraints 
            SET is_active = 0 
            WHERE table_name = 'cash_flows' AND column_name = 'currency'
        """)
        
        # Add new constraint for currency_id in tickers
        cursor.execute("""
            INSERT INTO constraints (
                table_name, column_name, constraint_type, constraint_name, 
                constraint_definition, is_active, created_at, updated_at
            ) VALUES (
                'tickers', 'currency_id', 'FOREIGN_KEY', 'ticker_currency_fk',
                'FOREIGN KEY (currency_id) REFERENCES currencies(id)',
                1, datetime('now'), datetime('now')
            )
        """)
        
        # Add new constraint for currency_id in cash_flows
        cursor.execute("""
            INSERT INTO constraints (
                table_name, column_name, constraint_type, constraint_name, 
                constraint_definition, is_active, created_at, updated_at
            ) VALUES (
                'cash_flows', 'currency_id', 'FOREIGN_KEY', 'cash_flow_currency_fk',
                'FOREIGN KEY (currency_id) REFERENCES currencies(id)',
                1, datetime('now'), datetime('now')
            )
        """)
        
        # Commit changes
        conn.commit()
        
        print("✅ Migration completed successfully!")
        
        # Print summary
        cursor.execute("SELECT COUNT(*) FROM tickers")
        tickers_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM cash_flows")
        cash_flows_count = cursor.fetchone()[0]
        
        print(f"📊 Summary:")
        print(f"   - Tickers: {tickers_count} records")
        print(f"   - Cash Flows: {cash_flows_count} records")
        print(f"   - Currency field removed from both tables")
        print(f"   - Only currency_id field remains")
        
        return True
        
    except Exception as e:
        print(f"❌ Migration failed: {str(e)}")
        conn.rollback()
        return False
        
    finally:
        conn.close()

if __name__ == "__main__":
    migrate()
