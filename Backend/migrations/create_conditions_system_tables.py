"""
Create Conditions System Tables Migration
Date: 2025
Description: Creates all tables for the conditions system with proper constraints
"""

import sqlite3
import os
import sys
from datetime import datetime

# Add the parent directory to the path to import models
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def upgrade(connection):
    """Create all conditions system tables"""
    cursor = connection.cursor()
    
    print("Creating conditions system tables...")
    
    # 1. Create trading_methods table
    print("Creating trading_methods table...")
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS trading_methods (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name_en VARCHAR(100) NOT NULL,
            name_he VARCHAR(100) NOT NULL,
            category VARCHAR(50) NOT NULL,
            description_en TEXT,
            description_he TEXT,
            icon_class VARCHAR(50),
            is_active BOOLEAN DEFAULT 1,
            sort_order INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(name_en),
            UNIQUE(name_he)
        )
    """)
    
    # 2. Create method_parameters table
    print("Creating method_parameters table...")
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS method_parameters (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            method_id INTEGER NOT NULL,
            parameter_key VARCHAR(50) NOT NULL,
            parameter_name_en VARCHAR(100) NOT NULL,
            parameter_name_he VARCHAR(100) NOT NULL,
            parameter_type VARCHAR(20) NOT NULL,
            default_value VARCHAR(100),
            min_value VARCHAR(50),
            max_value VARCHAR(50),
            validation_rule TEXT,
            is_required BOOLEAN DEFAULT 1,
            sort_order INTEGER DEFAULT 0,
            help_text_en TEXT,
            help_text_he TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (method_id) REFERENCES trading_methods(id) ON DELETE CASCADE,
            UNIQUE(method_id, parameter_key)
        )
    """)
    
    # 3. Create plan_conditions table
    print("Creating plan_conditions table...")
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS plan_conditions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            trade_plan_id INTEGER NOT NULL,
            method_id INTEGER NOT NULL,
            condition_group INTEGER DEFAULT 0,
            parameters_json TEXT NOT NULL,
            logical_operator VARCHAR(10) DEFAULT 'NONE',
            is_active BOOLEAN DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (trade_plan_id) REFERENCES trade_plans(id) ON DELETE CASCADE,
            FOREIGN KEY (method_id) REFERENCES trading_methods(id)
        )
    """)
    
    # 4. Create trade_conditions table
    print("Creating trade_conditions table...")
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS trade_conditions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            trade_id INTEGER NOT NULL,
            method_id INTEGER NOT NULL,
            condition_group INTEGER DEFAULT 0,
            parameters_json TEXT NOT NULL,
            logical_operator VARCHAR(10) DEFAULT 'NONE',
            inherited_from_plan_condition_id INTEGER,
            is_active BOOLEAN DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (trade_id) REFERENCES trades(id) ON DELETE CASCADE,
            FOREIGN KEY (method_id) REFERENCES trading_methods(id),
            FOREIGN KEY (inherited_from_plan_condition_id) REFERENCES plan_conditions(id)
        )
    """)
    
    # 5. Create condition_alerts_mapping table
    print("Creating condition_alerts_mapping table...")
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS condition_alerts_mapping (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            condition_id INTEGER NOT NULL,
            condition_type VARCHAR(10) NOT NULL,
            alert_id INTEGER NOT NULL,
            auto_created BOOLEAN DEFAULT 0,
            is_active BOOLEAN DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (alert_id) REFERENCES alerts(id) ON DELETE CASCADE
        )
    """)
    
    # 6. Create indexes for performance
    print("Creating indexes...")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_plan_conditions_plan_id ON plan_conditions(trade_plan_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_plan_conditions_method_id ON plan_conditions(method_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_trade_conditions_trade_id ON trade_conditions(trade_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_trade_conditions_method_id ON trade_conditions(method_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_trade_conditions_inherited ON trade_conditions(inherited_from_plan_condition_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_conditions_mapping_condition ON condition_alerts_mapping(condition_id, condition_type)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_conditions_mapping_alert ON condition_alerts_mapping(alert_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_method_parameters_method_id ON method_parameters(method_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_trading_methods_category ON trading_methods(category)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_trading_methods_active ON trading_methods(is_active)")
    
    connection.commit()
    print("✅ Conditions system tables created successfully!")

def downgrade(connection):
    """Drop all conditions system tables"""
    cursor = connection.cursor()
    
    print("Dropping conditions system tables...")
    
    # Drop tables in reverse order (respecting foreign key constraints)
    tables_to_drop = [
        'condition_alerts_mapping',
        'trade_conditions', 
        'plan_conditions',
        'method_parameters',
        'trading_methods'
    ]
    
    for table in tables_to_drop:
        print(f"Dropping table {table}...")
        cursor.execute(f"DROP TABLE IF EXISTS {table}")
    
    connection.commit()
    print("✅ Conditions system tables dropped successfully!")

def main():
    """Run migration directly"""
    # Get database path
    current_dir = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.join(current_dir, "..", "db", "simpleTrade_new.db")
    
    if not os.path.exists(db_path):
        print(f"❌ Database not found at {db_path}")
        return
    
    # Connect to database
    connection = sqlite3.connect(db_path)
    
    try:
        upgrade(connection)
        print("Migration completed successfully!")
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        connection.rollback()
    finally:
        connection.close()

if __name__ == "__main__":
    main()
