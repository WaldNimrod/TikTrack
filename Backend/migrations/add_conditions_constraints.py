"""
Add Conditions System Constraints Migration
Date: 2025
Description: Adds all constraints for the conditions system tables
"""

import sqlite3
import os
import sys
from datetime import datetime

# Add the parent directory to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def add_constraints(connection):
    """Add all constraints for conditions system tables"""
    cursor = connection.cursor()
    
    print("Adding conditions system constraints...")
    
    # Define constraints for each table
    constraints = [
        # Trading Methods constraints
        {
            'table_name': 'trading_methods',
            'column_name': 'name_en',
            'constraint_type': 'NOT_NULL',
            'constraint_name': 'trading_methods_name_en_not_null',
            'constraint_definition': 'name_en IS NOT NULL'
        },
        {
            'table_name': 'trading_methods',
            'column_name': 'name_he',
            'constraint_type': 'NOT_NULL',
            'constraint_name': 'trading_methods_name_he_not_null',
            'constraint_definition': 'name_he IS NOT NULL'
        },
        {
            'table_name': 'trading_methods',
            'column_name': 'category',
            'constraint_type': 'NOT_NULL',
            'constraint_name': 'trading_methods_category_not_null',
            'constraint_definition': 'category IS NOT NULL'
        },
        {
            'table_name': 'trading_methods',
            'column_name': 'is_active',
            'constraint_type': 'NOT_NULL',
            'constraint_name': 'trading_methods_is_active_not_null',
            'constraint_definition': 'is_active IS NOT NULL'
        },
        {
            'table_name': 'trading_methods',
            'column_name': 'name_en',
            'constraint_type': 'CHECK',
            'constraint_name': 'trading_methods_name_en_length',
            'constraint_definition': 'LENGTH(name_en) >= 3'
        },
        {
            'table_name': 'trading_methods',
            'column_name': 'name_he',
            'constraint_type': 'CHECK',
            'constraint_name': 'trading_methods_name_he_length',
            'constraint_definition': 'LENGTH(name_he) >= 2'
        },
        {
            'table_name': 'trading_methods',
            'column_name': 'category',
            'constraint_type': 'ENUM',
            'constraint_name': 'trading_methods_category_enum',
            'constraint_definition': 'technical_indicators,price_patterns,support_resistance,trend_analysis,volume_analysis,fibonacci'
        },
        {
            'table_name': 'trading_methods',
            'column_name': 'name_en',
            'constraint_type': 'UNIQUE',
            'constraint_name': 'trading_methods_name_en_unique',
            'constraint_definition': 'UNIQUE(name_en)'
        },
        {
            'table_name': 'trading_methods',
            'column_name': 'name_he',
            'constraint_type': 'UNIQUE',
            'constraint_name': 'trading_methods_name_he_unique',
            'constraint_definition': 'UNIQUE(name_he)'
        },
        
        # Method Parameters constraints
        {
            'table_name': 'method_parameters',
            'column_name': 'method_id',
            'constraint_type': 'NOT_NULL',
            'constraint_name': 'method_parameters_method_id_not_null',
            'constraint_definition': 'method_id IS NOT NULL'
        },
        {
            'table_name': 'method_parameters',
            'column_name': 'parameter_key',
            'constraint_type': 'NOT_NULL',
            'constraint_name': 'method_parameters_parameter_key_not_null',
            'constraint_definition': 'parameter_key IS NOT NULL'
        },
        {
            'table_name': 'method_parameters',
            'column_name': 'parameter_name_en',
            'constraint_type': 'NOT_NULL',
            'constraint_name': 'method_parameters_parameter_name_en_not_null',
            'constraint_definition': 'parameter_name_en IS NOT NULL'
        },
        {
            'table_name': 'method_parameters',
            'column_name': 'parameter_name_he',
            'constraint_type': 'NOT_NULL',
            'constraint_name': 'method_parameters_parameter_name_he_not_null',
            'constraint_definition': 'parameter_name_he IS NOT NULL'
        },
        {
            'table_name': 'method_parameters',
            'column_name': 'parameter_type',
            'constraint_type': 'NOT_NULL',
            'constraint_name': 'method_parameters_parameter_type_not_null',
            'constraint_definition': 'parameter_type IS NOT NULL'
        },
        {
            'table_name': 'method_parameters',
            'column_name': 'is_required',
            'constraint_type': 'NOT_NULL',
            'constraint_name': 'method_parameters_is_required_not_null',
            'constraint_definition': 'is_required IS NOT NULL'
        },
        {
            'table_name': 'method_parameters',
            'column_name': 'parameter_key',
            'constraint_type': 'CHECK',
            'constraint_name': 'method_parameters_parameter_key_format',
            'constraint_definition': "parameter_key REGEXP '^[a-z0-9_]+$'"
        },
        {
            'table_name': 'method_parameters',
            'column_name': 'parameter_type',
            'constraint_type': 'ENUM',
            'constraint_name': 'method_parameters_parameter_type_enum',
            'constraint_definition': 'number,price,percentage,period,boolean,dropdown,date'
        },
        {
            'table_name': 'method_parameters',
            'column_name': 'method_id',
            'constraint_type': 'FOREIGN_KEY',
            'constraint_name': 'method_parameters_method_id_fk',
            'constraint_definition': 'FOREIGN KEY (method_id) REFERENCES trading_methods(id) ON DELETE CASCADE'
        },
        {
            'table_name': 'method_parameters',
            'column_name': 'method_id',
            'constraint_type': 'UNIQUE',
            'constraint_name': 'method_parameters_method_key_unique',
            'constraint_definition': 'UNIQUE(method_id, parameter_key)'
        },
        
        # Plan Conditions constraints
        {
            'table_name': 'plan_conditions',
            'column_name': 'trade_plan_id',
            'constraint_type': 'NOT_NULL',
            'constraint_name': 'plan_conditions_trade_plan_id_not_null',
            'constraint_definition': 'trade_plan_id IS NOT NULL'
        },
        {
            'table_name': 'plan_conditions',
            'column_name': 'method_id',
            'constraint_type': 'NOT_NULL',
            'constraint_name': 'plan_conditions_method_id_not_null',
            'constraint_definition': 'method_id IS NOT NULL'
        },
        {
            'table_name': 'plan_conditions',
            'column_name': 'parameters_json',
            'constraint_type': 'NOT_NULL',
            'constraint_name': 'plan_conditions_parameters_json_not_null',
            'constraint_definition': 'parameters_json IS NOT NULL'
        },
        {
            'table_name': 'plan_conditions',
            'column_name': 'is_active',
            'constraint_type': 'NOT_NULL',
            'constraint_name': 'plan_conditions_is_active_not_null',
            'constraint_definition': 'is_active IS NOT NULL'
        },
        {
            'table_name': 'plan_conditions',
            'column_name': 'condition_group',
            'constraint_type': 'CHECK',
            'constraint_name': 'plan_conditions_condition_group_positive',
            'constraint_definition': 'condition_group >= 0'
        },
        {
            'table_name': 'plan_conditions',
            'column_name': 'logical_operator',
            'constraint_type': 'ENUM',
            'constraint_name': 'plan_conditions_logical_operator_enum',
            'constraint_definition': 'AND,OR,NONE'
        },
        {
            'table_name': 'plan_conditions',
            'column_name': 'trade_plan_id',
            'constraint_type': 'FOREIGN_KEY',
            'constraint_name': 'plan_conditions_trade_plan_id_fk',
            'constraint_definition': 'FOREIGN KEY (trade_plan_id) REFERENCES trade_plans(id) ON DELETE CASCADE'
        },
        {
            'table_name': 'plan_conditions',
            'column_name': 'method_id',
            'constraint_type': 'FOREIGN_KEY',
            'constraint_name': 'plan_conditions_method_id_fk',
            'constraint_definition': 'FOREIGN KEY (method_id) REFERENCES trading_methods(id)'
        },
        
        # Trade Conditions constraints
        {
            'table_name': 'trade_conditions',
            'column_name': 'trade_id',
            'constraint_type': 'NOT_NULL',
            'constraint_name': 'trade_conditions_trade_id_not_null',
            'constraint_definition': 'trade_id IS NOT NULL'
        },
        {
            'table_name': 'trade_conditions',
            'column_name': 'method_id',
            'constraint_type': 'NOT_NULL',
            'constraint_name': 'trade_conditions_method_id_not_null',
            'constraint_definition': 'method_id IS NOT NULL'
        },
        {
            'table_name': 'trade_conditions',
            'column_name': 'parameters_json',
            'constraint_type': 'NOT_NULL',
            'constraint_name': 'trade_conditions_parameters_json_not_null',
            'constraint_definition': 'parameters_json IS NOT NULL'
        },
        {
            'table_name': 'trade_conditions',
            'column_name': 'is_active',
            'constraint_type': 'NOT_NULL',
            'constraint_name': 'trade_conditions_is_active_not_null',
            'constraint_definition': 'is_active IS NOT NULL'
        },
        {
            'table_name': 'trade_conditions',
            'column_name': 'condition_group',
            'constraint_type': 'CHECK',
            'constraint_name': 'trade_conditions_condition_group_positive',
            'constraint_definition': 'condition_group >= 0'
        },
        {
            'table_name': 'trade_conditions',
            'column_name': 'logical_operator',
            'constraint_type': 'ENUM',
            'constraint_name': 'trade_conditions_logical_operator_enum',
            'constraint_definition': 'AND,OR,NONE'
        },
        {
            'table_name': 'trade_conditions',
            'column_name': 'trade_id',
            'constraint_type': 'FOREIGN_KEY',
            'constraint_name': 'trade_conditions_trade_id_fk',
            'constraint_definition': 'FOREIGN KEY (trade_id) REFERENCES trades(id) ON DELETE CASCADE'
        },
        {
            'table_name': 'trade_conditions',
            'column_name': 'method_id',
            'constraint_type': 'FOREIGN_KEY',
            'constraint_name': 'trade_conditions_method_id_fk',
            'constraint_definition': 'FOREIGN KEY (method_id) REFERENCES trading_methods(id)'
        },
        {
            'table_name': 'trade_conditions',
            'column_name': 'inherited_from_plan_condition_id',
            'constraint_type': 'FOREIGN_KEY',
            'constraint_name': 'trade_conditions_inherited_fk',
            'constraint_definition': 'FOREIGN KEY (inherited_from_plan_condition_id) REFERENCES plan_conditions(id)'
        },
        
        # Condition Alert Mapping constraints
        {
            'table_name': 'condition_alerts_mapping',
            'column_name': 'condition_id',
            'constraint_type': 'NOT_NULL',
            'constraint_name': 'condition_alerts_mapping_condition_id_not_null',
            'constraint_definition': 'condition_id IS NOT NULL'
        },
        {
            'table_name': 'condition_alerts_mapping',
            'column_name': 'condition_type',
            'constraint_type': 'NOT_NULL',
            'constraint_name': 'condition_alerts_mapping_condition_type_not_null',
            'constraint_definition': 'condition_type IS NOT NULL'
        },
        {
            'table_name': 'condition_alerts_mapping',
            'column_name': 'alert_id',
            'constraint_type': 'NOT_NULL',
            'constraint_name': 'condition_alerts_mapping_alert_id_not_null',
            'constraint_definition': 'alert_id IS NOT NULL'
        },
        {
            'table_name': 'condition_alerts_mapping',
            'column_name': 'auto_created',
            'constraint_type': 'NOT_NULL',
            'constraint_name': 'condition_alerts_mapping_auto_created_not_null',
            'constraint_definition': 'auto_created IS NOT NULL'
        },
        {
            'table_name': 'condition_alerts_mapping',
            'column_name': 'is_active',
            'constraint_type': 'NOT_NULL',
            'constraint_name': 'condition_alerts_mapping_is_active_not_null',
            'constraint_definition': 'is_active IS NOT NULL'
        },
        {
            'table_name': 'condition_alerts_mapping',
            'column_name': 'condition_type',
            'constraint_type': 'ENUM',
            'constraint_name': 'condition_alerts_mapping_condition_type_enum',
            'constraint_definition': 'plan,trade'
        },
        {
            'table_name': 'condition_alerts_mapping',
            'column_name': 'condition_id',
            'constraint_type': 'CHECK',
            'constraint_name': 'condition_alerts_mapping_condition_id_positive',
            'constraint_definition': 'condition_id > 0'
        },
        {
            'table_name': 'condition_alerts_mapping',
            'column_name': 'alert_id',
            'constraint_type': 'FOREIGN_KEY',
            'constraint_name': 'condition_alerts_mapping_alert_id_fk',
            'constraint_definition': 'FOREIGN KEY (alert_id) REFERENCES alerts(id) ON DELETE CASCADE'
        }
    ]
    
    # Insert constraints into the constraints table
    for constraint in constraints:
        print(f"Adding constraint: {constraint['constraint_name']}")
        
        cursor.execute("""
            INSERT OR REPLACE INTO constraints 
            (table_name, column_name, constraint_type, constraint_name, constraint_definition, is_active)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            constraint['table_name'],
            constraint['column_name'],
            constraint['constraint_type'],
            constraint['constraint_name'],
            constraint['constraint_definition'],
            True
        ))
    
    # Add enum values for ENUM constraints
    # First, get constraint IDs for enum constraints
    enum_constraints = [
        ('trading_methods_category_enum', [
            ('technical_indicators', 'Technical Indicators', 1),
            ('price_patterns', 'Price Patterns', 2),
            ('support_resistance', 'Support & Resistance', 3),
            ('trend_analysis', 'Trend Analysis', 4),
            ('volume_analysis', 'Volume Analysis', 5),
            ('fibonacci', 'Fibonacci', 6)
        ]),
        ('method_parameters_parameter_type_enum', [
            ('number', 'Number', 1),
            ('price', 'Price', 2),
            ('percentage', 'Percentage', 3),
            ('period', 'Period', 4),
            ('boolean', 'Boolean', 5),
            ('dropdown', 'Dropdown', 6),
            ('date', 'Date', 7)
        ]),
        ('plan_conditions_logical_operator_enum', [
            ('AND', 'AND', 1),
            ('OR', 'OR', 2),
            ('NONE', 'NONE', 3)
        ]),
        ('trade_conditions_logical_operator_enum', [
            ('AND', 'AND', 1),
            ('OR', 'OR', 2),
            ('NONE', 'NONE', 3)
        ]),
        ('condition_alerts_mapping_condition_type_enum', [
            ('plan', 'Plan', 1),
            ('trade', 'Trade', 2)
        ])
    ]
    
    for constraint_name, values in enum_constraints:
        # Get constraint ID
        cursor.execute("SELECT id FROM constraints WHERE constraint_name = ?", (constraint_name,))
        result = cursor.fetchone()
        if result:
            constraint_id = result[0]
            print(f"Adding enum values for constraint: {constraint_name} (ID: {constraint_id})")
            
            for value, display_name, sort_order in values:
                cursor.execute("""
                    INSERT OR REPLACE INTO enum_values 
                    (constraint_id, value, display_name, sort_order)
                    VALUES (?, ?, ?, ?)
                """, (constraint_id, value, display_name, sort_order))
    
    connection.commit()
    print("✅ Conditions system constraints added successfully!")

def remove_constraints(connection):
    """Remove all conditions system constraints"""
    cursor = connection.cursor()
    
    print("Removing conditions system constraints...")
    
    # Remove constraints for conditions system tables
    tables = ['trading_methods', 'method_parameters', 'plan_conditions', 'trade_conditions', 'condition_alerts_mapping']
    
    for table in tables:
        cursor.execute("DELETE FROM constraints WHERE table_name = ?", (table,))
        cursor.execute("DELETE FROM enum_values WHERE constraint_name LIKE ?", (f'%{table}%',))
    
    connection.commit()
    print("✅ Conditions system constraints removed successfully!")

def main():
    """Run constraint migration directly"""
    # Get database path
    current_dir = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.join(current_dir, "..", "db", "simpleTrade_new.db")
    
    if not os.path.exists(db_path):
        print(f"❌ Database not found at {db_path}")
        return
    
    # Connect to database
    connection = sqlite3.connect(db_path)
    
    try:
        add_constraints(connection)
        print("Constraint migration completed successfully!")
    except Exception as e:
        print(f"❌ Constraint migration failed: {e}")
        connection.rollback()
    finally:
        connection.close()

if __name__ == "__main__":
    main()
