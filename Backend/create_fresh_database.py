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
✅ Includes users table
✅ Includes constraint_validations table

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
        
        # 1. Currencies table (referenced by accounts, cash_flows, tickers)
        cursor.execute("""
            CREATE TABLE currencies (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                symbol VARCHAR(10) NOT NULL UNIQUE,
                name VARCHAR(100) NOT NULL UNIQUE,
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
        
        # 3. Users table
        cursor.execute("""
            CREATE TABLE users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username VARCHAR(50) NOT NULL,
                email VARCHAR(100) NOT NULL,
                first_name VARCHAR(50),
                last_name VARCHAR(50),
                is_active BOOLEAN DEFAULT 1,
                is_default BOOLEAN DEFAULT 0,
                preferences TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # 4. Trading Accounts table
        cursor.execute("""
            CREATE TABLE accounts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name VARCHAR(100) NOT NULL UNIQUE,
                currency_id INTEGER NOT NULL,
                status VARCHAR(20) DEFAULT 'active',
                cash_balance FLOAT DEFAULT 0.00,
                total_value FLOAT DEFAULT 0.00,
                total_pl FLOAT DEFAULT 0.00,
                notes VARCHAR(500),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                status_default VARCHAR(20) DEFAULT 'active',
                FOREIGN KEY (currency_id) REFERENCES currencies (id)
            )
        """)
        
        # 5. Tickers table
        cursor.execute("""
            CREATE TABLE tickers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                symbol VARCHAR(10) NOT NULL,
                name VARCHAR(100),
                type VARCHAR(20),
                remarks VARCHAR(500),
                currency VARCHAR(3),
                active_trades BOOLEAN DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                currency_id INTEGER,
                status TEXT DEFAULT 'open',
                FOREIGN KEY (currency_id) REFERENCES currencies (id)
            )
        """)
        
        # 6. Trade plans table
        cursor.execute("""
            CREATE TABLE trade_plans (
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
                side VARCHAR(10),
                status VARCHAR(20) DEFAULT 'open',
                stop_percentage FLOAT,
                target_percentage FLOAT,
                current_price FLOAT
            )
        """)
        
        # 7. Trades table
        cursor.execute("""
            CREATE TABLE trades (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                trading_account_id INTEGER NOT NULL,
                ticker_id INTEGER NOT NULL,
                trade_plan_id INTEGER NOT NULL,
                status VARCHAR(20) DEFAULT 'open',
                investment_type VARCHAR(20),
                opened_at DATETIME,
                closed_at DATETIME,
                cancelled_at DATETIME,
                cancel_reason VARCHAR(500),
                total_pl FLOAT DEFAULT 0.00,
                notes VARCHAR(500),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                side VARCHAR(10)
            )
        """)
        
        # 8. Executions table
        cursor.execute("""
            CREATE TABLE executions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                trade_id INTEGER NOT NULL,
                action VARCHAR(20),
                date DATETIME NOT NULL,
                quantity FLOAT,
                price FLOAT,
                fee FLOAT DEFAULT 0.00,
                source VARCHAR(50),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                external_id VARCHAR(100),
                notes VARCHAR(500),
                FOREIGN KEY (trade_id) REFERENCES trades (id)
            )
        """)
        
        # 9. Cash flows table
        cursor.execute("""
            CREATE TABLE cash_flows (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                trading_account_id INTEGER NOT NULL,
                type VARCHAR(50),
                amount FLOAT NOT NULL,
                date DATE NOT NULL,
                description VARCHAR(500),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                currency_id INTEGER NOT NULL,
                usd_rate DECIMAL(10,6) DEFAULT 1.000000,
                source VARCHAR(20) DEFAULT 'manual',
                external_id VARCHAR(100),
                FOREIGN KEY (trading_account_id) REFERENCES accounts (id),
                FOREIGN KEY (currency_id) REFERENCES currencies (id)
            )
        """)
        
        # 10. Alerts table
        cursor.execute("""
            CREATE TABLE alerts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                trading_account_id INTEGER,
                ticker_id INTEGER,
                message TEXT,
                triggered_at NUMERIC,
                created_at NUMERIC DEFAULT (strftime('%s', 'now')),
                status TEXT DEFAULT 'open',
                is_triggered TEXT DEFAULT 'false',
                related_type_id INTEGER NOT NULL,
                related_id INTEGER NOT NULL,
                condition_attribute TEXT,
                condition_operator TEXT,
                condition_number NUMERIC
            )
        """)
        
        # 11. Notes table
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
        
        # 12. Constraints table
        cursor.execute("""
            CREATE TABLE constraints (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                table_name VARCHAR(50) NOT NULL,
                column_name VARCHAR(50) NOT NULL,
                constraint_type VARCHAR(20) NOT NULL,
                constraint_name VARCHAR(100) NOT NULL,
                constraint_definition TEXT,
                is_active BOOLEAN DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # 13. Enum values table
        cursor.execute("""
            CREATE TABLE enum_values (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                constraint_id INTEGER NOT NULL,
                value VARCHAR(50) NOT NULL,
                display_name VARCHAR(100) NOT NULL,
                is_active BOOLEAN DEFAULT 1,
                sort_order INTEGER DEFAULT 0,
                FOREIGN KEY (constraint_id) REFERENCES constraints (id)
            )
        """)
        
        # 14. Constraint validations table
        cursor.execute("""
            CREATE TABLE constraint_validations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                constraint_id INTEGER NOT NULL,
                validation_type VARCHAR(20) NOT NULL,
                validation_rule TEXT NOT NULL,
                error_message TEXT,
                is_active BOOLEAN DEFAULT 1,
                FOREIGN KEY (constraint_id) REFERENCES constraints (id)
            )
        """)
        
        conn.commit()
        conn.close()
        logger.info("✅ Database structure created successfully")
    
    def insert_sample_data(self):
        """Insert sample data into all tables"""
        logger.info("📊 Inserting sample data...")
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # 1. Insert currencies
        currencies = [
            ('USD', 'US Dollar', 1.000000, 1.000000),
            ('ILS', 'Israeli Shekel', 3.650000, 3.650000),
            ('EUR', 'Euro', 0.920000, 0.920000),
            ('GBP', 'British Pound', 0.790000, 0.790000),
            ('JPY', 'Japanese Yen', 150.000000, 150.000000)
        ]
        cursor.executemany(
            "INSERT INTO currencies (symbol, name, usd_rate, usd_rate_default) VALUES (?, ?, ?, ?)",
            currencies
        )
        
        # 2. Insert note relation types
        note_relation_types = [
            ('trades',),
            ('accounts',),
            ('tickers',),
            ('trade_plans',),
            ('executions',),
            ('cash_flows',),
            ('alerts',),
            ('notes',)
        ]
        cursor.executemany(
            "INSERT INTO note_relation_types (note_relation_type) VALUES (?)",
            note_relation_types
        )
        
        # 3. Insert default user
        cursor.execute("""
            INSERT INTO users (username, email, first_name, last_name, is_active, is_default, preferences)
            VALUES ('admin', 'admin@tiktrack.com', 'Admin', 'User', 1, 1, '{"theme": "dark", "language": "he"}')
        """)
        
        # 4. Insert sample accounts
        accounts = [
            ('Main Trading Account', 1, 'active', 10000.00, 15000.00, 5000.00, 'Primary trading account'),
            ('Secondary Trading Account', 1, 'active', 5000.00, 7500.00, 2500.00, 'Secondary trading account'),
            ('Demo Trading Account', 1, 'active', 1000.00, 1200.00, 200.00, 'Demo trading account for testing')
        ]
        cursor.executemany(
            "INSERT INTO accounts (name, currency_id, status, cash_balance, total_value, total_pl, notes) VALUES (?, ?, ?, ?, ?, ?, ?)",
            accounts
        )
        
        # 5. Insert sample tickers
        tickers = [
            ('AAPL', 'Apple Inc.', 'stock', 'Technology company', 'USD', 0, 1, 'open'),
            ('MSFT', 'Microsoft Corporation', 'stock', 'Software company', 'USD', 0, 1, 'open'),
            ('GOOGL', 'Alphabet Inc.', 'stock', 'Internet services', 'USD', 0, 1, 'open'),
            ('TSLA', 'Tesla Inc.', 'stock', 'Electric vehicles', 'USD', 0, 1, 'open'),
            ('NVDA', 'NVIDIA Corporation', 'stock', 'Graphics processing', 'USD', 0, 1, 'open'),
            ('SPY', 'SPDR S&P 500 ETF', 'etf', 'S&P 500 ETF', 'USD', 0, 1, 'open'),
            ('QQQ', 'Invesco QQQ Trust', 'etf', 'NASDAQ-100 ETF', 'USD', 0, 1, 'open'),
            ('TLV', 'Tel Aviv 35', 'stock', 'Israeli market index', 'ILS', 0, 2, 'open'),
            ('BTC', 'Bitcoin', 'crypto', 'Cryptocurrency', 'USD', 0, 1, 'open'),
            ('ETH', 'Ethereum', 'crypto', 'Cryptocurrency', 'USD', 0, 1, 'open')
        ]
        cursor.executemany(
            "INSERT INTO tickers (symbol, name, type, remarks, currency, active_trades, currency_id, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            tickers
        )
        
        # 6. Insert sample trade plans
        trade_plans = [
            (1, 1, 'swing', 1000.00, 'Buy on dip below $150', 140.00, 160.00, 'Strong fundamentals', 'Long', 'open'),
            (1, 2, 'investment', 2000.00, 'Long term investment', 300.00, 350.00, 'Cloud growth potential', 'Long', 'open'),
            (2, 3, 'passive', 500.00, 'Index investment', 120.00, 130.00, 'Diversification', 'Long', 'open')
        ]
        cursor.executemany(
            "INSERT INTO trade_plans (trading_account_id, ticker_id, investment_type, planned_amount, entry_conditions, stop_price, target_price, reasons, side, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            trade_plans
        )
        
        # 7. Insert sample trades
        trades = [
            (1, 1, 1, 'open', 'swing', datetime.now() - timedelta(days=5), None, None, None, 150.00, 'AAPL swing trade', 'Long'),
            (1, 2, 2, 'open', 'investment', datetime.now() - timedelta(days=10), None, None, None, 300.00, 'MSFT long term', 'Long'),
            (2, 3, 3, 'closed', 'passive', datetime.now() - timedelta(days=15), datetime.now() - timedelta(days=1), None, None, 25.00, 'GOOGL completed', 'Long')
        ]
        cursor.executemany(
            "INSERT INTO trades (trading_account_id, ticker_id, trade_plan_id, status, investment_type, opened_at, closed_at, cancelled_at, cancel_reason, total_pl, notes, side) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            trades
        )
        
        # 8. Insert sample executions
        executions = [
            (1, 'buy', datetime.now() - timedelta(days=5), 10, 150.00, 1.50, 'manual', 'exec_001'),
            (2, 'buy', datetime.now() - timedelta(days=10), 5, 300.00, 2.00, 'manual', 'exec_002'),
            (3, 'buy', datetime.now() - timedelta(days=15), 2, 120.00, 1.00, 'manual', 'exec_003'),
            (3, 'sale', datetime.now() - timedelta(days=1), 2, 132.50, 1.00, 'manual', 'exec_004')
        ]
        cursor.executemany(
            "INSERT INTO executions (trade_id, action, date, quantity, price, fee, source, external_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            executions
        )
        
        # 9. Insert sample cash flows
        cash_flows = [
            (1, 'deposit', 10000.00, datetime.now() - timedelta(days=30), 'Initial deposit', 1, 1.000000, 'manual'),
            (2, 'deposit', 5000.00, datetime.now() - timedelta(days=25), 'Trading Account funding', 1, 1.000000, 'manual'),
            (1, 'dividend', 50.00, datetime.now() - timedelta(days=5), 'AAPL dividend', 1, 1.000000, 'manual'),
            (1, 'fee', -10.00, datetime.now() - timedelta(days=1), 'Trading fee', 1, 1.000000, 'manual')
        ]
        cursor.executemany(
            "INSERT INTO cash_flows (trading_account_id, type, amount, date, description, currency_id, usd_rate, source) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            cash_flows
        )
        
        # 10. Insert sample alerts
        alerts = [
            (1, 1, 'AAPL price alert', None, int(datetime.now().timestamp()), 'open', 'false', 1, 1, 'price', '>', 160.00),
            (1, 2, 'MSFT stop loss', None, int(datetime.now().timestamp()), 'open', 'false', 1, 2, 'price', '<', 280.00),
            (2, 3, 'GOOGL volume alert', None, int(datetime.now().timestamp()), 'closed', 'true', 1, 3, 'volume', '>', 1000000)
        ]
        cursor.executemany(
            "INSERT INTO alerts (trading_account_id, ticker_id, message, triggered_at, created_at, status, is_triggered, related_type_id, related_id, condition_attribute, condition_operator, condition_number) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            alerts
        )
        
        # 11. Insert sample notes
        notes = [
            ('Strong earnings report expected', None, 1, 1),
            ('Technical analysis shows support at $140', None, 1, 1),
            ('Consider adding to position on dip', None, 1, 2),
            ('Market sentiment improving', None, 1, 3)
        ]
        cursor.executemany(
            "INSERT INTO notes (content, attachment, related_type_id, related_id) VALUES (?, ?, ?, ?)",
            notes
        )
        
        # 12. Insert constraints
        constraints = [
            ('trades', 'investment_type', 'ENUM', 'valid_investment_type', 'valid_investment_type', 1),
            ('trades', 'status', 'ENUM', 'valid_trade_status', 'valid_trade_status', 1),
            ('trades', 'side', 'ENUM', 'valid_trade_side', 'valid_trade_side', 1),
            ('trades', 'trading_account_id', 'NOT_NULL', 'account_required', 'account_required', 1),
            ('trades', 'ticker_id', 'NOT_NULL', 'ticker_required', 'ticker_required', 1),
            ('trade_plans', 'investment_type', 'ENUM', 'valid_plan_investment_type', 'valid_plan_investment_type', 1),
            ('trade_plans', 'side', 'ENUM', 'valid_plan_side', 'valid_plan_side', 1),
            ('trade_plans', 'planned_amount', 'RANGE', 'positive_planned_amount', 'positive_planned_amount', 1),
            ('trade_plans', 'target_price', 'RANGE', 'positive_target_price', 'positive_target_price', 1),
            ('trade_plans', 'stop_price', 'RANGE', 'positive_stop_price', 'positive_stop_price', 1),
            ('trade_plans', 'ticker_id', 'NOT_NULL', 'ticker_required_for_plans', 'ticker_required_for_plans', 1),
            ('trade_plans', 'status', 'ENUM', 'valid_plan_status', 'valid_plan_status', 1),
            ('trades', 'trade_plan_id', 'NOT_NULL', 'trade_plan_required_for_trades', 'trade_plan_required_for_trades', 1),
            ('accounts', 'name', 'UNIQUE', 'account_name_unique', 'account_name_unique', 1),
            ('accounts', 'currency_id', 'NOT_NULL', 'account_currency_required', 'account_currency_required', 1),
            ('accounts', 'status', 'ENUM', 'valid_account_status', 'valid_account_status', 1),
            ('tickers', 'symbol', 'NOT_NULL', 'ticker_symbol_required', 'ticker_symbol_required', 1),
            ('tickers', 'type', 'ENUM', 'ticker_type_enum', 'ticker_type_enum', 1),
            ('tickers', 'status', 'ENUM', 'ticker_status_enum', 'ticker_status_enum', 1),
            ('executions', 'trade_id', 'NOT_NULL', 'execution_trade_required', 'execution_trade_required', 1),
            ('executions', 'action', 'ENUM', 'valid_execution_action', 'valid_execution_action', 1),
            ('executions', 'date', 'NOT_NULL', 'execution_date_required', 'execution_date_required', 1),
            ('cash_flows', 'trading_account_id', 'NOT_NULL', 'cash_flow_account_required', 'cash_flow_account_required', 1),
            ('cash_flows', 'type', 'ENUM', 'valid_cash_flow_type', 'valid_cash_flow_type', 1),
            ('cash_flows', 'amount', 'NOT_NULL', 'cash_flow_amount_required', 'cash_flow_amount_required', 1),
            ('cash_flows', 'date', 'NOT_NULL', 'cash_flow_date_required', 'cash_flow_date_required', 1),
            ('cash_flows', 'source', 'ENUM', 'valid_cash_flow_source', 'valid_cash_flow_source', 1),
            ('alerts', 'status', 'ENUM', 'valid_alert_status', 'valid_alert_status', 1),
            ('alerts', 'is_triggered', 'ENUM', 'valid_alert_triggered', 'valid_alert_triggered', 1),
            ('alerts', 'related_type_id', 'NOT_NULL', 'alert_related_type_required', 'alert_related_type_required', 1),
            ('alerts', 'related_id', 'NOT_NULL', 'alert_related_id_required', 'alert_related_id_required', 1),
            ('notes', 'content', 'NOT_NULL', 'note_content_required', 'note_content_required', 1),
            ('notes', 'related_type_id', 'NOT_NULL', 'note_related_type_required', 'note_related_type_required', 1),
            ('currencies', 'symbol', 'UNIQUE', 'currency_symbol_unique', 'currency_symbol_unique', 1),
            ('currencies', 'name', 'UNIQUE', 'currency_name_unique', 'currency_name_unique', 1),
            ('note_relation_types', 'note_relation_type', 'UNIQUE', 'note_relation_type_unique', 'note_relation_type_unique', 1)
        ]
        cursor.executemany(
            "INSERT INTO constraints (table_name, column_name, constraint_type, constraint_name, constraint_definition, is_active) VALUES (?, ?, ?, ?, ?, ?)",
            constraints
        )
        
        # Get constraint IDs for enum values
        cursor.execute("SELECT id FROM constraints WHERE constraint_name = 'valid_investment_type'")
        investment_type_constraint_id = cursor.fetchone()[0]
        
        cursor.execute("SELECT id FROM constraints WHERE constraint_name = 'valid_trade_status'")
        trade_status_constraint_id = cursor.fetchone()[0]
        
        cursor.execute("SELECT id FROM constraints WHERE constraint_name = 'valid_trade_side'")
        trade_side_constraint_id = cursor.fetchone()[0]
        
        cursor.execute("SELECT id FROM constraints WHERE constraint_name = 'valid_plan_investment_type'")
        plan_investment_type_constraint_id = cursor.fetchone()[0]
        
        cursor.execute("SELECT id FROM constraints WHERE constraint_name = 'valid_plan_side'")
        plan_side_constraint_id = cursor.fetchone()[0]
        
        cursor.execute("SELECT id FROM constraints WHERE constraint_name = 'valid_plan_status'")
        plan_status_constraint_id = cursor.fetchone()[0]
        
        cursor.execute("SELECT id FROM constraints WHERE constraint_name = 'valid_account_status'")
        account_status_constraint_id = cursor.fetchone()[0]
        
        cursor.execute("SELECT id FROM constraints WHERE constraint_name = 'ticker_type_enum'")
        ticker_type_constraint_id = cursor.fetchone()[0]
        
        cursor.execute("SELECT id FROM constraints WHERE constraint_name = 'ticker_status_enum'")
        ticker_status_constraint_id = cursor.fetchone()[0]
        
        cursor.execute("SELECT id FROM constraints WHERE constraint_name = 'valid_execution_action'")
        execution_action_constraint_id = cursor.fetchone()[0]
        
        cursor.execute("SELECT id FROM constraints WHERE constraint_name = 'valid_cash_flow_type'")
        cash_flow_type_constraint_id = cursor.fetchone()[0]
        
        cursor.execute("SELECT id FROM constraints WHERE constraint_name = 'valid_cash_flow_source'")
        cash_flow_source_constraint_id = cursor.fetchone()[0]
        
        cursor.execute("SELECT id FROM constraints WHERE constraint_name = 'valid_alert_status'")
        alert_status_constraint_id = cursor.fetchone()[0]
        
        cursor.execute("SELECT id FROM constraints WHERE constraint_name = 'valid_alert_triggered'")
        alert_triggered_constraint_id = cursor.fetchone()[0]
        
        # 13. Insert enum values
        enum_values = [
            # Investment types
            (investment_type_constraint_id, 'swing', 'סווינג', 1, 1),
            (investment_type_constraint_id, 'investment', 'השקעה', 1, 2),
            (investment_type_constraint_id, 'passive', 'פאסיבי', 1, 3),
            
            # Trade status
            (trade_status_constraint_id, 'open', 'פתוח', 1, 1),
            (trade_status_constraint_id, 'closed', 'סגור', 1, 2),
            (trade_status_constraint_id, 'cancelled', 'בוטל', 1, 3),
            
            # Trade side
            (trade_side_constraint_id, 'Long', 'קנייה', 1, 1),
            (trade_side_constraint_id, 'Short', 'מכירה', 1, 2),
            
            # Plan investment types
            (plan_investment_type_constraint_id, 'swing', 'סווינג', 1, 1),
            (plan_investment_type_constraint_id, 'investment', 'השקעה', 1, 2),
            (plan_investment_type_constraint_id, 'passive', 'פאסיבי', 1, 3),
            
            # Plan side
            (plan_side_constraint_id, 'Long', 'קנייה', 1, 1),
            (plan_side_constraint_id, 'Short', 'מכירה', 1, 2),
            
            # Plan status
            (plan_status_constraint_id, 'open', 'פתוח', 1, 1),
            (plan_status_constraint_id, 'closed', 'סגור', 1, 2),
            (plan_status_constraint_id, 'cancelled', 'בוטל', 1, 3),
            
            # Trading Account status
            (account_status_constraint_id, 'active', 'פעיל', 1, 1),
            (account_status_constraint_id, 'inactive', 'לא פעיל', 1, 2),
            (account_status_constraint_id, 'closed', 'סגור', 1, 3),
            (account_status_constraint_id, 'suspended', 'מושעה', 1, 4),
            (account_status_constraint_id, 'cancelled', 'מבוטל', 1, 5),
            
            # Ticker types
            (ticker_type_constraint_id, 'stock', 'מניה', 1, 1),
            (ticker_type_constraint_id, 'etf', 'ETF', 1, 2),
            (ticker_type_constraint_id, 'bond', 'אגרת חוב', 1, 3),
            (ticker_type_constraint_id, 'crypto', 'קריפטו', 1, 4),
            (ticker_type_constraint_id, 'forex', 'מטבע חוץ', 1, 5),
            (ticker_type_constraint_id, 'commodity', 'סחורה', 1, 6),
            (ticker_type_constraint_id, 'other', 'אחר', 1, 7),
            
            # Ticker status
            (ticker_status_constraint_id, 'open', 'פתוח', 1, 1),
            (ticker_status_constraint_id, 'closed', 'סגור', 1, 2),
            (ticker_status_constraint_id, 'cancelled', 'מבוטל', 1, 3),
            
            # Execution actions
            (execution_action_constraint_id, 'buy', 'קנייה', 1, 1),
            (execution_action_constraint_id, 'sale', 'מכירה', 1, 2),
            
            # Cash flow types
            (cash_flow_type_constraint_id, 'deposit', 'הפקדה', 1, 1),
            (cash_flow_type_constraint_id, 'withdrawal', 'משיכה', 1, 2),
            (cash_flow_type_constraint_id, 'dividend', 'דיבידנד', 1, 3),
            (cash_flow_type_constraint_id, 'tax', 'מס', 1, 4),
            (cash_flow_type_constraint_id, 'fee', 'עמלה', 1, 5),
            (cash_flow_type_constraint_id, 'interest', 'ריבית', 1, 6),
            (cash_flow_type_constraint_id, 'other', 'אחר', 1, 7),
            
            # Cash flow sources
            (cash_flow_source_constraint_id, 'manual', 'ידני', 1, 1),
            (cash_flow_source_constraint_id, 'IBKR-tradelog-csv', 'IBKR CSV', 1, 2),
            (cash_flow_source_constraint_id, 'IBKR-api', 'IBKR API', 1, 3),
            
            # Alert status
            (alert_status_constraint_id, 'open', 'פתוח', 1, 1),
            (alert_status_constraint_id, 'closed', 'סגור', 1, 2),
            (alert_status_constraint_id, 'cancelled', 'מבוטל', 1, 3),
            
            # Alert triggered
            (alert_triggered_constraint_id, 'false', 'לא הופעל', 1, 1),
            (alert_triggered_constraint_id, 'true', 'הופעל', 1, 2)
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
        print("❌ Operation cancelled")

if __name__ == "__main__":
    main()
