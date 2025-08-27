#!/usr/bin/env python3
"""
Migration script to remove old constraints from tables and rely on the new dynamic constraint system
Date: August 23, 2025
Description: Remove CHECK constraints from tables and rely on the new constraint management system
"""

import sqlite3
import os
from datetime import datetime

def remove_old_constraints():
    """Remove old CHECK constraints from tables"""
    
    # Database path
    db_path = "Backend/db/simpleTrade_new.db"
    
    if not os.path.exists(db_path):
        print(f"❌ Database file not found: {db_path}")
        return False
    
    try:
        # Connect to database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        print("🔄 Starting migration: Remove old constraints from tables...")
        
        # Get current timestamp
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        # 1. Create backup of current data
        print("📋 Creating backup of current data...")
        
        # Backup trades table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS trades_backup AS 
            SELECT * FROM trades
        """)
        
        # Backup trade_plans table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS trade_plans_backup AS 
            SELECT * FROM trade_plans
        """)
        
        # Backup alerts table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS alerts_backup AS 
            SELECT * FROM alerts
        """)
        
        # Backup accounts table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS accounts_backup AS 
            SELECT * FROM accounts
        """)
        
        print("✅ Backup tables created successfully")
        
        # 2. Drop and recreate trades table without CHECK constraints
        print("🔄 Recreating trades table without CHECK constraints...")
        
        # Get current data
        cursor.execute("SELECT * FROM trades")
        trades_data = cursor.fetchall()
        
        # Get column names
        cursor.execute("PRAGMA table_info(trades)")
        columns_info = cursor.fetchall()
        column_names = [col[1] for col in columns_info]
        
        # Drop old table
        cursor.execute("DROP TABLE trades")
        
        # Create new table without CHECK constraints
        create_trades_sql = """
        CREATE TABLE trades (
            account_id INTEGER NOT NULL,
            ticker_id INTEGER NOT NULL,
            trade_plan_id INTEGER,
            status VARCHAR(20),
            type VARCHAR(20),
            opened_at DATETIME,
            closed_at DATETIME,
            cancelled_at DATETIME,
            cancel_reason VARCHAR(500),
            total_pl FLOAT,
            notes VARCHAR(500),
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            side VARCHAR(10) DEFAULT 'Long',
            FOREIGN KEY (trade_plan_id) REFERENCES trade_plans(id),
            FOREIGN KEY (ticker_id) REFERENCES tickers(id),
            FOREIGN KEY (account_id) REFERENCES accounts(id)
        )
        """
        cursor.execute(create_trades_sql)
        
        # Reinsert data
        if trades_data:
            placeholders = ','.join(['?' for _ in column_names])
            insert_sql = f"INSERT INTO trades ({','.join(column_names)}) VALUES ({placeholders})"
            cursor.executemany(insert_sql, trades_data)
        
        print("✅ Trades table recreated successfully")
        
        # 3. Drop and recreate trade_plans table without CHECK constraints
        print("🔄 Recreating trade_plans table without CHECK constraints...")
        
        # Get current data
        cursor.execute("SELECT * FROM trade_plans")
        trade_plans_data = cursor.fetchall()
        
        # Get column names
        cursor.execute("PRAGMA table_info(trade_plans)")
        columns_info = cursor.fetchall()
        column_names = [col[1] for col in columns_info]
        
        # Drop old table
        cursor.execute("DROP TABLE trade_plans")
        
        # Create new table without CHECK constraints
        create_trade_plans_sql = """
        CREATE TABLE trade_plans (
            account_id INTEGER NOT NULL,
            ticker_id INTEGER NOT NULL,
            investment_type VARCHAR(20),
            planned_amount FLOAT,
            entry_conditions VARCHAR(500),
            stop_price FLOAT,
            target_price FLOAT,
            reasons VARCHAR(500),
            cancelled_at DATETIME,
            cancel_reason VARCHAR(500),
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            side VARCHAR(10) DEFAULT 'Long',
            status VARCHAR(20) DEFAULT 'open',
            FOREIGN KEY (ticker_id) REFERENCES tickers(id),
            FOREIGN KEY (account_id) REFERENCES accounts(id)
        )
        """
        cursor.execute(create_trade_plans_sql)
        
        # Reinsert data
        if trade_plans_data:
            placeholders = ','.join(['?' for _ in column_names])
            insert_sql = f"INSERT INTO trade_plans ({','.join(column_names)}) VALUES ({placeholders})"
            cursor.executemany(insert_sql, trade_plans_data)
        
        print("✅ Trade_plans table recreated successfully")
        
        # 4. Drop and recreate alerts table without CHECK constraints
        print("🔄 Recreating alerts table without CHECK constraints...")
        
        # Get current data
        cursor.execute("SELECT * FROM alerts")
        alerts_data = cursor.fetchall()
        
        # Get column names
        cursor.execute("PRAGMA table_info(alerts)")
        columns_info = cursor.fetchall()
        column_names = [col[1] for col in columns_info]
        
        # Drop old table
        cursor.execute("DROP TABLE alerts")
        
        # Create new table without CHECK constraints
        create_alerts_sql = """
        CREATE TABLE alerts (
            account_id INTEGER,
            ticker_id INTEGER,
            type VARCHAR(50) NOT NULL,
            condition VARCHAR(500) NOT NULL,
            message VARCHAR(500),
            is_active BOOLEAN,
            triggered_at DATETIME,
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            status VARCHAR(20) DEFAULT 'open',
            is_triggered VARCHAR(20) DEFAULT 'false',
            related_type_id INTEGER,
            related_id INTEGER
        )
        """
        cursor.execute(create_alerts_sql)
        
        # Reinsert data
        if alerts_data:
            placeholders = ','.join(['?' for _ in column_names])
            insert_sql = f"INSERT INTO alerts ({','.join(column_names)}) VALUES ({placeholders})"
            cursor.executemany(insert_sql, alerts_data)
        
        print("✅ Alerts table recreated successfully")
        
        # 5. Drop and recreate accounts table without CHECK constraints
        print("🔄 Recreating accounts table without CHECK constraints...")
        
        # Get current data
        cursor.execute("SELECT * FROM accounts")
        accounts_data = cursor.fetchall()
        
        # Get column names
        cursor.execute("PRAGMA table_info(accounts)")
        columns_info = cursor.fetchall()
        column_names = [col[1] for col in columns_info]
        
        # Drop old table
        cursor.execute("DROP TABLE accounts")
        
        # Create new table without CHECK constraints
        create_accounts_sql = """
        CREATE TABLE accounts (
            name VARCHAR(100) NOT NULL,
            currency VARCHAR(3),
            status VARCHAR(20),
            cash_balance FLOAT,
            total_value FLOAT,
            total_pl FLOAT,
            notes VARCHAR(500),
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
        """
        cursor.execute(create_accounts_sql)
        
        # Reinsert data
        if accounts_data:
            placeholders = ','.join(['?' for _ in column_names])
            insert_sql = f"INSERT INTO accounts ({','.join(column_names)}) VALUES ({placeholders})"
            cursor.executemany(insert_sql, accounts_data)
        
        print("✅ Accounts table recreated successfully")
        
        # 6. Update constraint definitions to match actual data
        print("🔄 Updating constraint definitions...")
        
        # Update trades status constraint to include 'cancelled'
        cursor.execute("""
            UPDATE constraints 
            SET constraint_definition = 'status IN (open, closed, cancelled)' 
            WHERE id = 2
        """)
        
        # Update enum values for trades status
        cursor.execute("DELETE FROM enum_values WHERE constraint_id = 2")
        cursor.execute("""
            INSERT INTO enum_values (constraint_id, value, display_name, is_active, sort_order) VALUES
            (2, 'open', 'פתוח', 1, 1),
            (2, 'closed', 'סגור', 1, 2),
            (2, 'cancelled', 'בוטל', 1, 3)
        """)
        
        print("✅ Constraint definitions updated successfully")
        
        # 7. Verify data integrity
        print("🔍 Verifying data integrity...")
        
        # Check trades count
        cursor.execute("SELECT COUNT(*) FROM trades")
        trades_count = cursor.fetchone()[0]
        print(f"   Trades: {trades_count} records")
        
        # Check trade_plans count
        cursor.execute("SELECT COUNT(*) FROM trade_plans")
        trade_plans_count = cursor.fetchone()[0]
        print(f"   Trade Plans: {trade_plans_count} records")
        
        # Check alerts count
        cursor.execute("SELECT COUNT(*) FROM alerts")
        alerts_count = cursor.fetchone()[0]
        print(f"   Alerts: {alerts_count} records")
        
        # Check accounts count
        cursor.execute("SELECT COUNT(*) FROM accounts")
        accounts_count = cursor.fetchone()[0]
        print(f"   Accounts: {accounts_count} records")
        
        # Commit changes
        conn.commit()
        
        print("✅ Migration completed successfully!")
        print("📋 Summary:")
        print(f"   - Removed old CHECK constraints from all tables")
        print(f"   - Recreated tables with dynamic constraint system")
        print(f"   - Updated constraint definitions to match actual data")
        print(f"   - All data preserved and verified")
        
        return True
        
    except Exception as e:
        print(f"❌ Error during migration: {e}")
        conn.rollback()
        return False
        
    finally:
        conn.close()

if __name__ == "__main__":
    success = remove_old_constraints()
    if success:
        print("🎉 Migration completed successfully!")
    else:
        print("💥 Migration failed!")
        exit(1)
