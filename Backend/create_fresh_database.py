#!/usr/bin/env python3
"""
TikTrack Database Recreation Script
===================================

🎯 Purpose: Create a fresh database with complete structure and sample data
📍 Location: Backend/create_fresh_database.py
🔧 Usage: python3 create_fresh_database.py

✅ Creates all tables with proper structure
✅ Adds all constraints and relationships
✅ Inserts sample data for all modules
✅ Sets up currency system
✅ Creates note relation types
✅ Establishes all foreign key relationships
✅ Adds comprehensive constraints

⚠️  WARNING: This will DELETE the existing database and create a new one!
"""

import sqlite3
import os
import shutil
from datetime import datetime, timedelta
import logging

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class DatabaseRecreator:
    def __init__(self, db_path: str = "db/simpleTrade_new.db"):
        self.db_path = db_path
        self.backup_path = f"{db_path}.backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
    def backup_existing_database(self):
        """Create backup of existing database if it exists"""
        if os.path.exists(self.db_path):
            logger.info(f"📦 Creating backup of existing database: {self.backup_path}")
            shutil.copy2(self.db_path, self.backup_path)
            logger.info("✅ Backup created successfully")
        else:
            logger.info("ℹ️  No existing database found, proceeding with fresh creation")
    
    def create_database_structure(self):
        """Create all database tables with proper structure"""
        logger.info("🏗️  Creating database structure...")
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Enable foreign keys
        cursor.execute("PRAGMA foreign_keys = ON")
        
        # Create tables in proper order (respecting foreign key dependencies)
        
        # 1. Currencies table (referenced by accounts and cash_flows)
        cursor.execute("""
            CREATE TABLE currencies (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                symbol VARCHAR(10) NOT NULL UNIQUE,
                name VARCHAR(100) NOT NULL,
                usd_rate NUMERIC(10, 6) NOT NULL,
                usd_rate_default NUMERIC(10,6) DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # 2. Note relation types (referenced by notes)
        cursor.execute("""
            CREATE TABLE note_relation_types (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                note_relation_type VARCHAR(20) NOT NULL UNIQUE,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # 3. Accounts table
        cursor.execute("""
            CREATE TABLE accounts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name VARCHAR(100) NOT NULL,
                status VARCHAR(20) DEFAULT 'active',
                balance DECIMAL(10,2) DEFAULT 0.00,
                currency_id INTEGER DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME,
                FOREIGN KEY (currency_id) REFERENCES currencies (id)
            )
        """)
        
        # 4. Tickers table
        cursor.execute("""
            CREATE TABLE tickers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                symbol VARCHAR(10) NOT NULL UNIQUE,
                name VARCHAR(100),
                type VARCHAR(20),
                remarks VARCHAR(500),
                currency VARCHAR(3),
                active_trades BOOLEAN DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME
            )
        """)
        
        # 5. Trade plans table
        cursor.execute("""
            CREATE TABLE trade_plans (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                account_id INTEGER NOT NULL,
                ticker_id INTEGER NOT NULL,
                type VARCHAR(20) NOT NULL,
                status VARCHAR(20) DEFAULT 'open',
                entry_price DECIMAL(10,2),
                target_price DECIMAL(10,2),
                stop_loss DECIMAL(10,2),
                quantity INTEGER,
                notes TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME,
                FOREIGN KEY (account_id) REFERENCES accounts (id),
                FOREIGN KEY (ticker_id) REFERENCES tickers (id)
            )
        """)
        
        # 6. Trades table
        cursor.execute("""
            CREATE TABLE trades (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                account_id INTEGER NOT NULL,
                ticker_id INTEGER NOT NULL,
                type VARCHAR(20) NOT NULL,
                status VARCHAR(20) DEFAULT 'open',
                entry_price DECIMAL(10,2),
                exit_price DECIMAL(10,2),
                quantity INTEGER,
                profit_loss DECIMAL(10,2),
                entry_date DATETIME,
                exit_date DATETIME,
                notes TEXT,
                investment_type VARCHAR(20) DEFAULT 'swing',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME,
                FOREIGN KEY (account_id) REFERENCES accounts (id),
                FOREIGN KEY (ticker_id) REFERENCES tickers (id)
            )
        """)
        
        # 7. Alerts table
        cursor.execute("""
            CREATE TABLE alerts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                account_id INTEGER,
                ticker_id INTEGER,
                type VARCHAR(50) NOT NULL,
                message VARCHAR(500),
                condition_attribute VARCHAR(50),
                condition_operator VARCHAR(50),
                condition_number DECIMAL(10,2),
                status VARCHAR(20) DEFAULT 'open',
                is_triggered VARCHAR(20) DEFAULT 'false',
                triggered_at DATETIME,
                related_type_id INTEGER,
                related_id INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (account_id) REFERENCES accounts (id),
                FOREIGN KEY (ticker_id) REFERENCES tickers (id)
            )
        """)
        
        # 8. Cash flows table
        cursor.execute("""
            CREATE TABLE cash_flows (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                account_id INTEGER NOT NULL,
                type VARCHAR(50) NOT NULL,
                amount FLOAT NOT NULL,
                date DATE,
                description VARCHAR(500),
                currency VARCHAR(10) DEFAULT 'USD',
                currency_id INTEGER DEFAULT 1,
                usd_rate DECIMAL(10,6) DEFAULT 1.000000,
                source VARCHAR(20) DEFAULT 'manual',
                external_id VARCHAR(100) DEFAULT '0',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (account_id) REFERENCES accounts (id),
                FOREIGN KEY (currency_id) REFERENCES currencies (id)
            )
        """)
        
        # 9. Notes table
        cursor.execute("""
            CREATE TABLE notes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                content VARCHAR(1000) NOT NULL,
                attachment VARCHAR(500),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                related_type_id INTEGER NOT NULL,
                related_id INTEGER NOT NULL,
                FOREIGN KEY (related_type_id) REFERENCES note_relation_types (id)
            )
        """)
        
        # 10. Executions table
        cursor.execute("""
            CREATE TABLE executions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                trade_id INTEGER NOT NULL,
                action VARCHAR(20) NOT NULL,
                date DATETIME,
                quantity FLOAT NOT NULL,
                price FLOAT NOT NULL,
                fee FLOAT,
                source VARCHAR(50),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (trade_id) REFERENCES trades (id)
            )
        """)
        
        # 11. Constraints table
        cursor.execute("""
            CREATE TABLE constraints (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                table_name VARCHAR(50) NOT NULL,
                column_name VARCHAR(50) NOT NULL,
                constraint_type VARCHAR(20) NOT NULL,
                constraint_name VARCHAR(100) NOT NULL,
                constraint_definition TEXT NOT NULL,
                is_active BOOLEAN DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # 12. Enum values table
        cursor.execute("""
            CREATE TABLE enum_values (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                constraint_id INTEGER NOT NULL,
                value VARCHAR(50) NOT NULL,
                display_name VARCHAR(100),
                is_active BOOLEAN DEFAULT 1,
                sort_order INTEGER DEFAULT 0,
                FOREIGN KEY (constraint_id) REFERENCES constraints(id) ON DELETE CASCADE
            )
        """)
        
        # 13. Constraint validations table
        cursor.execute("""
            CREATE TABLE constraint_validations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                constraint_id INTEGER NOT NULL,
                validation_type VARCHAR(20) NOT NULL,
                validation_rule TEXT NOT NULL,
                error_message TEXT,
                is_active BOOLEAN DEFAULT 1,
                FOREIGN KEY (constraint_id) REFERENCES constraints(id) ON DELETE CASCADE
            )
        """)
        
        # Create indexes
        cursor.execute("CREATE INDEX ix_tickers_id ON tickers (id)")
        cursor.execute("CREATE INDEX ix_cash_flows_id ON cash_flows (id)")
        cursor.execute("CREATE INDEX ix_executions_id ON executions (id)")
        cursor.execute("CREATE INDEX ix_note_relation_types_id ON note_relation_types (id)")
        cursor.execute("CREATE INDEX ix_currencies_id ON currencies (id)")
        cursor.execute("CREATE INDEX idx_constraints_table_column ON constraints (table_name, column_name)")
        cursor.execute("CREATE INDEX idx_constraints_type ON constraints (constraint_type)")
        cursor.execute("CREATE INDEX idx_constraints_active ON constraints (is_active)")
        cursor.execute("CREATE INDEX idx_enum_constraint_id ON enum_values (constraint_id)")
        cursor.execute("CREATE INDEX idx_enum_active ON enum_values (is_active)")
        cursor.execute("CREATE INDEX idx_enum_sort ON enum_values (sort_order)")
        cursor.execute("CREATE INDEX idx_validation_constraint_id ON constraint_validations (constraint_id)")
        cursor.execute("CREATE INDEX idx_validation_type ON constraint_validations (validation_type)")
        cursor.execute("CREATE INDEX idx_validation_active ON constraint_validations (is_active)")
        
        conn.commit()
        conn.close()
        logger.info("✅ Database structure created successfully")
    
    def insert_sample_data(self):
        """Insert sample data for all tables"""
        logger.info("📊 Inserting sample data...")
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # 1. Insert currencies
        currencies = [
            ('USD', 'US Dollar', 1.000000),
            ('ILS', 'Israeli Shekel', 3.650000),
            ('EUR', 'Euro', 0.920000),
            ('GBP', 'British Pound', 0.790000)
        ]
        cursor.executemany(
            "INSERT INTO currencies (symbol, name, usd_rate) VALUES (?, ?, ?)",
            currencies
        )
        
        # 2. Insert note relation types
        note_relation_types = [
            ('account',),
            ('trade',),
            ('trade_plan',),
            ('ticker',),
            ('alert',)
        ]
        cursor.executemany(
            "INSERT INTO note_relation_types (note_relation_type) VALUES (?)",
            note_relation_types
        )
        
        # 3. Insert accounts
        accounts = [
            ('Trading Account 1', 'active', 10000.00, 1),
            ('Investment Account', 'active', 50000.00, 1),
            ('Retirement Account', 'active', 75000.00, 1)
        ]
        cursor.executemany(
            "INSERT INTO accounts (name, status, balance, currency_id) VALUES (?, ?, ?, ?)",
            accounts
        )
        
        # 4. Insert tickers
        tickers = [
            ('AAPL', 'Apple Inc.', 'stock', 'Technology company', 'USD', 0),
            ('GOOGL', 'Alphabet Inc.', 'stock', 'Technology company', 'USD', 0),
            ('TSLA', 'Tesla Inc.', 'stock', 'Electric vehicles', 'USD', 0),
            ('NVDA', 'NVIDIA Corporation', 'stock', 'Semiconductors', 'USD', 0),
            ('META', 'Meta Platforms Inc.', 'stock', 'Social media', 'USD', 0)
        ]
        cursor.executemany(
            "INSERT INTO tickers (symbol, name, type, remarks, currency, active_trades) VALUES (?, ?, ?, ?, ?, ?)",
            tickers
        )
        
        # 5. Insert trade plans
        trade_plans = [
            (1, 1, 'swing', 'open', 150.00, 160.00, 145.00, 100, 'AAPL swing trade'),
            (2, 2, 'investment', 'open', 2800.00, 3000.00, 2700.00, 10, 'GOOGL long term'),
            (1, 3, 'swing', 'open', 200.00, 220.00, 190.00, 50, 'TSLA momentum trade')
        ]
        cursor.executemany(
            "INSERT INTO trade_plans (account_id, ticker_id, type, status, entry_price, target_price, stop_loss, quantity, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            trade_plans
        )
        
        # 6. Insert trades
        trades = [
            (1, 1, 'buy', 'open', 150.00, None, 100, None, datetime.now(), None, 'AAPL long position', 'swing'),
            (2, 2, 'buy', 'closed', 2800.00, 2850.00, 10, 500.00, datetime.now() - timedelta(days=30), datetime.now(), 'GOOGL profitable trade', 'investment'),
            (1, 3, 'sell', 'open', 200.00, None, 50, None, datetime.now(), None, 'TSLA short position', 'swing')
        ]
        cursor.executemany(
            "INSERT INTO trades (account_id, ticker_id, type, status, entry_price, exit_price, quantity, profit_loss, entry_date, exit_date, notes, investment_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            trades
        )
        
        # 7. Insert alerts
        alerts = [
            (1, 1, 'price_alert', 'AAPL הגיע ליעד מחיר של 180.50', 'price', 'more_than', 180.50, 'open', 'false', None, 4, 1),
            (2, 3, 'stop_loss', 'TSLA מתחת לסטופ לוס של 150.00', 'price', 'less_than', 150.00, 'open', 'false', None, 2, 1),
            (1, 5, 'volume_alert', 'נפח מסחר גבוה ב-NVDA', 'volume', 'more_than', 1000000, 'open', 'false', None, 4, 5)
        ]
        cursor.executemany(
            "INSERT INTO alerts (account_id, ticker_id, type, message, condition_attribute, condition_operator, condition_number, status, is_triggered, triggered_at, related_type_id, related_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            alerts
        )
        
        # 8. Insert cash flows
        cash_flows = [
            (1, 'income', 5000.00, datetime.now().date(), 'Salary deposit', 'USD', 1, 1.000000, 'manual', '0'),
            (2, 'expense', -1000.00, datetime.now().date(), 'Trading fees', 'USD', 1, 1.000000, 'manual', '0'),
            (1, 'income', 2500.00, datetime.now().date(), 'Dividend payment', 'USD', 1, 1.000000, 'automatic', '0')
        ]
        cursor.executemany(
            "INSERT INTO cash_flows (account_id, type, amount, date, description, currency, currency_id, usd_rate, source, external_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            cash_flows
        )
        
        # 9. Insert notes
        notes = [
            ('AAPL analysis - strong fundamentals', None, 4, 1),
            ('GOOGL earnings report positive', None, 4, 2),
            ('TSLA technical analysis - breakout potential', None, 4, 3)
        ]
        cursor.executemany(
            "INSERT INTO notes (content, attachment, related_type_id, related_id) VALUES (?, ?, ?, ?)",
            notes
        )
        
        # 10. Insert executions
        executions = [
            (1, 'buy', datetime.now(), 100, 150.00, 5.00, 'manual'),
            (2, 'buy', datetime.now() - timedelta(days=30), 10, 2800.00, 10.00, 'manual'),
            (2, 'sell', datetime.now(), 10, 2850.00, 10.00, 'manual')
        ]
        cursor.executemany(
            "INSERT INTO executions (trade_id, action, date, quantity, price, fee, source) VALUES (?, ?, ?, ?, ?, ?, ?)",
            executions
        )
        
        # 11. Insert constraints
        constraints = [
            ('trades', 'type', 'ENUM', 'trade_type_enum', 'trade_type_enum', 1),
            ('trades', 'status', 'ENUM', 'trade_status_enum', 'trade_status_enum', 1),
            ('alerts', 'type', 'ENUM', 'alert_type_enum', 'alert_type_enum', 1),
            ('cash_flows', 'type', 'ENUM', 'cash_flow_type_enum', 'cash_flow_type_enum', 1)
        ]
        cursor.executemany(
            "INSERT INTO constraints (table_name, column_name, constraint_type, constraint_name, constraint_definition, is_active) VALUES (?, ?, ?, ?, ?, ?)",
            constraints
        )
        
        # Get constraint IDs for enum values
        cursor.execute("SELECT id FROM constraints WHERE constraint_name = 'trade_type_enum'")
        trade_type_constraint_id = cursor.fetchone()[0]
        
        cursor.execute("SELECT id FROM constraints WHERE constraint_name = 'trade_status_enum'")
        trade_status_constraint_id = cursor.fetchone()[0]
        
        cursor.execute("SELECT id FROM constraints WHERE constraint_name = 'alert_type_enum'")
        alert_type_constraint_id = cursor.fetchone()[0]
        
        cursor.execute("SELECT id FROM constraints WHERE constraint_name = 'cash_flow_type_enum'")
        cash_flow_type_constraint_id = cursor.fetchone()[0]
        
        # 12. Insert enum values
        enum_values = [
            # Trade types
            (trade_type_constraint_id, 'buy', 'Buy', 1, 1),
            (trade_type_constraint_id, 'sell', 'Sell', 1, 2),
            (trade_type_constraint_id, 'short', 'Short', 1, 3),
            (trade_type_constraint_id, 'cover', 'Cover', 1, 4),
            
            # Trade status
            (trade_status_constraint_id, 'open', 'Open', 1, 1),
            (trade_status_constraint_id, 'closed', 'Closed', 1, 2),
            (trade_status_constraint_id, 'cancelled', 'Cancelled', 1, 3),
            (trade_status_constraint_id, 'pending', 'Pending', 1, 4),
            
            # Alert types
            (alert_type_constraint_id, 'price_alert', 'Price Alert', 1, 1),
            (alert_type_constraint_id, 'stop_loss', 'Stop Loss', 1, 2),
            (alert_type_constraint_id, 'volume_alert', 'Volume Alert', 1, 3),
            (alert_type_constraint_id, 'custom_alert', 'Custom Alert', 1, 4),
            
            # Cash flow types
            (cash_flow_type_constraint_id, 'income', 'Income', 1, 1),
            (cash_flow_type_constraint_id, 'expense', 'Expense', 1, 2),
            (cash_flow_type_constraint_id, 'fee', 'Fee', 1, 3),
            (cash_flow_type_constraint_id, 'tax', 'Tax', 1, 4),
            (cash_flow_type_constraint_id, 'interest', 'Interest', 1, 5)
        ]
        cursor.executemany(
            "INSERT INTO enum_values (constraint_id, value, display_name, is_active, sort_order) VALUES (?, ?, ?, ?, ?)",
            enum_values
        )
        
        conn.commit()
        conn.close()
        logger.info("✅ Sample data inserted successfully")
    
    def create_fresh_database(self):
        """Main method to create a fresh database"""
        logger.info("🚀 Starting fresh database creation...")
        
        try:
            # Create db directory if it doesn't exist
            os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
            
            # Backup existing database
            self.backup_existing_database()
            
            # Remove existing database file
            if os.path.exists(self.db_path):
                os.remove(self.db_path)
                logger.info("🗑️  Removed existing database file")
            
            # Create database structure
            self.create_database_structure()
            
            # Insert sample data
            self.insert_sample_data()
            
            logger.info("🎉 Fresh database created successfully!")
            logger.info(f"📁 Database location: {os.path.abspath(self.db_path)}")
            logger.info(f"📦 Backup location: {os.path.abspath(self.backup_path)}" if os.path.exists(self.backup_path) else "ℹ️  No backup created (no existing database)")
            
        except Exception as e:
            logger.error(f"❌ Error creating database: {e}")
            raise

def main():
    """Main execution function"""
    
    response = input("Do you want to continue? (yes/no): ").lower().strip()
    
    if response in ['yes', 'y', 'כן']:
        recreator = DatabaseRecreator()
        recreator.create_fresh_database()
    else:

if __name__ == "__main__":
    main()
