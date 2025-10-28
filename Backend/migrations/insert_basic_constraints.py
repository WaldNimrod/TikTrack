#!/usr/bin/env python3
"""
Migration: Insert Basic Constraints
Date: August 23, 2025
Description: Insert basic constraints for all tables according to the implementation guide
"""

import sqlite3
import os
import sys
from datetime import datetime

def get_db_connection():
    """Get database connection"""
    db_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "db", "simpleTrade_new.db")
    return sqlite3.connect(db_path)

def insert_trades_constraints():
    """Insert constraints for trades table"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        
        # 1. investment_type ENUM constraint
        cursor.execute("""
            INSERT INTO constraints (table_name, column_name, constraint_type, constraint_name, constraint_definition)
            VALUES (?, ?, ?, ?, ?)
        """, ('trades', 'investment_type', 'ENUM', 'valid_investment_type', 
              'investment_type IN (''swing'', ''investment'', ''passive'')'))
        
        constraint_id = cursor.lastrowid
        
        # Insert enum values
        enum_values = [
            ('swing', 'סווינג', 1),
            ('investment', 'השקעה', 2),
            ('passive', 'פאסיבי', 3)
        ]
        
        for value, display_name, sort_order in enum_values:
            cursor.execute("""
                INSERT INTO enum_values (constraint_id, value, display_name, sort_order)
                VALUES (?, ?, ?, ?)
            """, (constraint_id, value, display_name, sort_order))
        
        # 2. status ENUM constraint
        cursor.execute("""
            INSERT INTO constraints (table_name, column_name, constraint_type, constraint_name, constraint_definition)
            VALUES (?, ?, ?, ?, ?)
        """, ('trades', 'status', 'ENUM', 'valid_trade_status', 
              'status IN (''open'', ''closed'', ''cancelled'')'))
        
        constraint_id = cursor.lastrowid
        
        enum_values = [
            ('open', 'פתוח', 1),
            ('closed', 'סגור', 2),
            ('cancelled', 'בוטל', 3)
        ]
        
        for value, display_name, sort_order in enum_values:
            cursor.execute("""
                INSERT INTO enum_values (constraint_id, value, display_name, sort_order)
                VALUES (?, ?, ?, ?)
            """, (constraint_id, value, display_name, sort_order))
        
        # 3. side ENUM constraint
        cursor.execute("""
            INSERT INTO constraints (table_name, column_name, constraint_type, constraint_name, constraint_definition)
            VALUES (?, ?, ?, ?, ?)
        """, ('trades', 'side', 'ENUM', 'valid_trade_side', 
              'side IN (''Long'', ''Short'')'))
        
        constraint_id = cursor.lastrowid
        
        enum_values = [
            ('Long', 'קנייה', 1),
            ('Short', 'מכירה', 2)
        ]
        
        for value, display_name, sort_order in enum_values:
            cursor.execute("""
                INSERT INTO enum_values (constraint_id, value, display_name, sort_order)
                VALUES (?, ?, ?, ?)
            """, (constraint_id, value, display_name, sort_order))
        
        # 4. trading_account_id NOT NULL constraint
        cursor.execute("""
            INSERT INTO constraints (table_name, column_name, constraint_type, constraint_name, constraint_definition)
            VALUES (?, ?, ?, ?, ?)
        """, ('trades', 'trading_account_id', 'NOT_NULL', 'account_required', 
              'trading_account_id IS NOT NULL'))
        
        # 5. ticker_id NOT NULL constraint
        cursor.execute("""
            INSERT INTO constraints (table_name, column_name, constraint_type, constraint_name, constraint_definition)
            VALUES (?, ?, ?, ?, ?)
        """, ('trades', 'ticker_id', 'NOT_NULL', 'ticker_required', 
              'ticker_id IS NOT NULL'))
        
        conn.commit()
        return True
        
    except Exception as e:
        conn.rollback()
        return False
    finally:
        conn.close()

def insert_trade_plans_constraints():
    """Insert constraints for trade_plans table"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        
        # 1. investment_type ENUM constraint
        cursor.execute("""
            INSERT INTO constraints (table_name, column_name, constraint_type, constraint_name, constraint_definition)
            VALUES (?, ?, ?, ?, ?)
        """, ('trade_plans', 'investment_type', 'ENUM', 'valid_plan_investment_type', 
              'investment_type IN (''swing'', ''investment'', ''passive'')'))
        
        constraint_id = cursor.lastrowid
        
        enum_values = [
            ('swing', 'סווינג', 1),
            ('investment', 'השקעה', 2),
            ('passive', 'פאסיבי', 3)
        ]
        
        for value, display_name, sort_order in enum_values:
            cursor.execute("""
                INSERT INTO enum_values (constraint_id, value, display_name, sort_order)
                VALUES (?, ?, ?, ?)
            """, (constraint_id, value, display_name, sort_order))
        
        # 2. side ENUM constraint
        cursor.execute("""
            INSERT INTO constraints (table_name, column_name, constraint_type, constraint_name, constraint_definition)
            VALUES (?, ?, ?, ?, ?)
        """, ('trade_plans', 'side', 'ENUM', 'valid_plan_side', 
              'side IN (''Long'', ''Short'')'))
        
        constraint_id = cursor.lastrowid
        
        enum_values = [
            ('Long', 'קנייה', 1),
            ('Short', 'מכירה', 2)
        ]
        
        for value, display_name, sort_order in enum_values:
            cursor.execute("""
                INSERT INTO enum_values (constraint_id, value, display_name, sort_order)
                VALUES (?, ?, ?, ?)
            """, (constraint_id, value, display_name, sort_order))
        
        # 3. status ENUM constraint
        cursor.execute("""
            INSERT INTO constraints (table_name, column_name, constraint_type, constraint_name, constraint_definition)
            VALUES (?, ?, ?, ?, ?)
        """, ('trade_plans', 'status', 'ENUM', 'valid_plan_status', 
              'status IN (''open'', ''closed'', ''cancelled'')'))
        
        constraint_id = cursor.lastrowid
        
        enum_values = [
            ('open', 'פתוח', 1),
            ('closed', 'סגור', 2),
            ('cancelled', 'בוטל', 3)
        ]
        
        for value, display_name, sort_order in enum_values:
            cursor.execute("""
                INSERT INTO enum_values (constraint_id, value, display_name, sort_order)
                VALUES (?, ?, ?, ?)
            """, (constraint_id, value, display_name, sort_order))
        
        # 4. planned_amount RANGE constraint
        cursor.execute("""
            INSERT INTO constraints (table_name, column_name, constraint_type, constraint_name, constraint_definition)
            VALUES (?, ?, ?, ?, ?)
        """, ('trade_plans', 'planned_amount', 'RANGE', 'positive_planned_amount', 
              'planned_amount > 0'))
        
        # 5. target_price RANGE constraint
        cursor.execute("""
            INSERT INTO constraints (table_name, column_name, constraint_type, constraint_name, constraint_definition)
            VALUES (?, ?, ?, ?, ?)
        """, ('trade_plans', 'target_price', 'RANGE', 'positive_target_price', 
              'target_price > 0'))
        
        # 6. stop_price RANGE constraint
        cursor.execute("""
            INSERT INTO constraints (table_name, column_name, constraint_type, constraint_name, constraint_definition)
            VALUES (?, ?, ?, ?, ?)
        """, ('trade_plans', 'stop_price', 'RANGE', 'positive_stop_price', 
              'stop_price > 0'))
        
        conn.commit()
        return True
        
    except Exception as e:
        conn.rollback()
        return False
    finally:
        conn.close()

def insert_alerts_constraints():
    """Insert constraints for alerts table"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        
        # 1. is_triggered ENUM constraint
        cursor.execute("""
            INSERT INTO constraints (table_name, column_name, constraint_type, constraint_name, constraint_definition)
            VALUES (?, ?, ?, ?, ?)
        """, ('alerts', 'is_triggered', 'ENUM', 'valid_alert_triggered', 
              'is_triggered IN (''new'', ''true'', ''false'')'))
        
        constraint_id = cursor.lastrowid
        
        enum_values = [
            ('new', 'חדש', 1),
            ('true', 'הופעל', 2),
            ('false', 'לא הופעל', 3)
        ]
        
        for value, display_name, sort_order in enum_values:
            cursor.execute("""
                INSERT INTO enum_values (constraint_id, value, display_name, sort_order)
                VALUES (?, ?, ?, ?)
            """, (constraint_id, value, display_name, sort_order))
        
        # 2. alert_type ENUM constraint
        cursor.execute("""
            INSERT INTO constraints (table_name, column_name, constraint_type, constraint_name, constraint_definition)
            VALUES (?, ?, ?, ?, ?)
        """, ('alerts', 'alert_type', 'ENUM', 'valid_alert_type', 
              'alert_type IN (''price'', ''time'', ''custom'')'))
        
        constraint_id = cursor.lastrowid
        
        enum_values = [
            ('price', 'מחיר', 1),
            ('time', 'זמן', 2),
            ('custom', 'מותאם אישית', 3)
        ]
        
        for value, display_name, sort_order in enum_values:
            cursor.execute("""
                INSERT INTO enum_values (constraint_id, value, display_name, sort_order)
                VALUES (?, ?, ?, ?)
            """, (constraint_id, value, display_name, sort_order))
        
        # 3. condition_type ENUM constraint
        cursor.execute("""
            INSERT INTO constraints (table_name, column_name, constraint_type, constraint_name, constraint_definition)
            VALUES (?, ?, ?, ?, ?)
        """, ('alerts', 'condition_type', 'ENUM', 'valid_condition_type', 
              'condition_type IN (''above'', ''below'', ''equals'')'))
        
        constraint_id = cursor.lastrowid
        
        enum_values = [
            ('above', 'מעל', 1),
            ('below', 'מתחת', 2),
            ('equals', 'שווה', 3)
        ]
        
        for value, display_name, sort_order in enum_values:
            cursor.execute("""
                INSERT INTO enum_values (constraint_id, value, display_name, sort_order)
                VALUES (?, ?, ?, ?)
            """, (constraint_id, value, display_name, sort_order))
        
        conn.commit()
        return True
        
    except Exception as e:
        conn.rollback()
        return False
    finally:
        conn.close()

def insert_cash_flows_constraints():
    """Insert constraints for cash_flows table"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        
        # 1. type ENUM constraint
        cursor.execute("""
            INSERT INTO constraints (table_name, column_name, constraint_type, constraint_name, constraint_definition)
            VALUES (?, ?, ?, ?, ?)
        """, ('cash_flows', 'type', 'ENUM', 'valid_cash_flow_type', 
              'type IN (''deposit'', ''withdrawal'', ''transfer'', ''fee'', ''dividend'', ''interest'')'))
        
        constraint_id = cursor.lastrowid
        
        enum_values = [
            ('deposit', 'הפקדה', 1),
            ('withdrawal', 'משיכה', 2),
            ('transfer', 'העברה', 3),
            ('fee', 'עמלה', 4),
            ('dividend', 'דיבידנד', 5),
            ('interest', 'ריבית', 6)
        ]
        
        for value, display_name, sort_order in enum_values:
            cursor.execute("""
                INSERT INTO enum_values (constraint_id, value, display_name, sort_order)
                VALUES (?, ?, ?, ?)
            """, (constraint_id, value, display_name, sort_order))
        
        # 2. source ENUM constraint
        cursor.execute("""
            INSERT INTO constraints (table_name, column_name, constraint_type, constraint_name, constraint_definition)
            VALUES (?, ?, ?, ?, ?)
        """, ('cash_flows', 'source', 'ENUM', 'valid_cash_flow_source', 
              'source IN (''manual'', ''file_import'', ''direct_import'', ''api'')'))
        
        constraint_id = cursor.lastrowid
        
        enum_values = [
            ('manual', 'ידני', 1),
            ('file_import', 'ייבוא קובץ', 2),
            ('direct_import', 'ייבוא ישיר', 3),
            ('api', 'API', 4)
        ]
        
        for value, display_name, sort_order in enum_values:
            cursor.execute("""
                INSERT INTO enum_values (constraint_id, value, display_name, sort_order)
                VALUES (?, ?, ?, ?)
            """, (constraint_id, value, display_name, sort_order))
        
        # 3. amount RANGE constraint (not zero)
        cursor.execute("""
            INSERT INTO constraints (table_name, column_name, constraint_type, constraint_name, constraint_definition)
            VALUES (?, ?, ?, ?, ?)
        """, ('cash_flows', 'amount', 'RANGE', 'non_zero_amount', 
              'amount != 0'))
        
        # 4. usd_rate RANGE constraint (positive)
        cursor.execute("""
            INSERT INTO constraints (table_name, column_name, constraint_type, constraint_name, constraint_definition)
            VALUES (?, ?, ?, ?, ?)
        """, ('cash_flows', 'usd_rate', 'RANGE', 'positive_usd_rate', 
              'usd_rate > 0'))
        
        conn.commit()
        return True
        
    except Exception as e:
        conn.rollback()
        return False
    finally:
        conn.close()

def insert_tickers_constraints():
    """Insert constraints for tickers table"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        
        # 1. status ENUM constraint
        cursor.execute("""
            INSERT INTO constraints (table_name, column_name, constraint_type, constraint_name, constraint_definition)
            VALUES (?, ?, ?, ?, ?)
        """, ('tickers', 'status', 'ENUM', 'valid_ticker_status', 
              'status IN (''open'', ''closed'', ''cancelled'')'))
        
        constraint_id = cursor.lastrowid
        
        enum_values = [
            ('open', 'פעיל', 1),
            ('closed', 'סגור', 2),
            ('cancelled', 'מבוטל', 3)
        ]
        
        for value, display_name, sort_order in enum_values:
            cursor.execute("""
                INSERT INTO enum_values (constraint_id, value, display_name, sort_order)
                VALUES (?, ?, ?, ?)
            """, (constraint_id, value, display_name, sort_order))
        
        # 2. type ENUM constraint
        cursor.execute("""
            INSERT INTO constraints (table_name, column_name, constraint_type, constraint_name, constraint_definition)
            VALUES (?, ?, ?, ?, ?)
        """, ('tickers', 'type', 'ENUM', 'valid_ticker_type', 
              'type IN (''stock'', ''etf'', ''crypto'', ''forex'', ''commodity'')'))
        
        constraint_id = cursor.lastrowid
        
        enum_values = [
            ('stock', 'מניה', 1),
            ('etf', 'קרן נאמנות', 2),
            ('crypto', 'מטבע דיגיטלי', 3),
            ('forex', 'מטבע חוץ', 4),
            ('commodity', 'סחורה', 5)
        ]
        
        for value, display_name, sort_order in enum_values:
            cursor.execute("""
                INSERT INTO enum_values (constraint_id, value, display_name, sort_order)
                VALUES (?, ?, ?, ?)
            """, (constraint_id, value, display_name, sort_order))
        
        conn.commit()
        return True
        
    except Exception as e:
        conn.rollback()
        return False
    finally:
        conn.close()

def insert_accounts_constraints():
    """Insert constraints for accounts table"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        
        # 1. status ENUM constraint
        cursor.execute("""
            INSERT INTO constraints (table_name, column_name, constraint_type, constraint_name, constraint_definition)
            VALUES (?, ?, ?, ?, ?)
        """, ('accounts', 'status', 'ENUM', 'valid_account_status', 
              'status IN (''open'', ''closed'', ''cancelled'')'))
        
        constraint_id = cursor.lastrowid
        
        enum_values = [
            ('open', 'פעיל', 1),
            ('closed', 'סגור', 2),
            ('cancelled', 'מבוטל', 3)
        ]
        
        for value, display_name, sort_order in enum_values:
            cursor.execute("""
                INSERT INTO enum_values (constraint_id, value, display_name, sort_order)
                VALUES (?, ?, ?, ?)
            """, (constraint_id, value, display_name, sort_order))
        
        conn.commit()
        return True
        
    except Exception as e:
        conn.rollback()
        return False
    finally:
        conn.close()

def insert_executions_constraints():
    """Insert constraints for executions table"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        
        # 1. source ENUM constraint
        cursor.execute("""
            INSERT INTO constraints (table_name, column_name, constraint_type, constraint_name, constraint_definition)
            VALUES (?, ?, ?, ?, ?)
        """, ('executions', 'source', 'ENUM', 'valid_execution_source', 
              'source IN (''manual'', ''api'', ''file_import'', ''direct_import'')'))
        
        constraint_id = cursor.lastrowid
        
        enum_values = [
            ('manual', 'ידני', 1),
            ('api', 'API', 2),
            ('file_import', 'ייבוא קובץ', 3),
            ('direct_import', 'ייבוא ישיר', 4)
        ]
        
        for value, display_name, sort_order in enum_values:
            cursor.execute("""
                INSERT INTO enum_values (constraint_id, value, display_name, sort_order)
                VALUES (?, ?, ?, ?)
            """, (constraint_id, value, display_name, sort_order))
        
        # 2. date RANGE constraint (must be >= trade.open_date)
        cursor.execute("""
            INSERT INTO constraints (table_name, column_name, constraint_type, constraint_name, constraint_definition)
            VALUES (?, ?, ?, ?, ?)
        """, ('executions', 'date', 'RANGE', 'execution_date_after_trade_open', 
              'date >= (SELECT open_date FROM trades WHERE id = trade_id)'))
        
        conn.commit()
        return True
        
    except Exception as e:
        conn.rollback()
        return False
    finally:
        conn.close()

def verify_constraints():
    """Verify all constraints were inserted correctly"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        
        # Count constraints by table
        cursor.execute("""
            SELECT table_name, COUNT(*) as constraint_count 
            FROM constraints 
            GROUP BY table_name 
            ORDER BY table_name
        """)
        
        results = cursor.fetchall()
        for table_name, count in results:
        
        # Count enum values
        cursor.execute("SELECT COUNT(*) FROM enum_values")
        enum_count = cursor.fetchone()[0]
        
        # Show sample constraints
        cursor.execute("""
            SELECT table_name, column_name, constraint_type, constraint_name 
            FROM constraints 
            ORDER BY table_name, column_name
        """)
        
        for table_name, column_name, constraint_type, constraint_name in cursor.fetchall():
        
        return True
        
    except Exception as e:
        return False
    finally:
        conn.close()

def main():
    """Main migration function"""
    
    # Step 1: Insert trades constraints
    if not insert_trades_constraints():
        return
    
    # Step 2: Insert trade_plans constraints
    if not insert_trade_plans_constraints():
        return
    
    # Step 3: Insert alerts constraints
    if not insert_alerts_constraints():
        return
    
    # Step 4: Insert cash_flows constraints
    if not insert_cash_flows_constraints():
        return
    
    # Step 5: Insert tickers constraints
    if not insert_tickers_constraints():
        return
    
    # Step 6: Insert accounts constraints
    if not insert_accounts_constraints():
        return
    
    # Step 7: Insert executions constraints
    if not insert_executions_constraints():
        return
    
    # Step 8: Verify all constraints
    if not verify_constraints():
        return
    

if __name__ == "__main__":
    main()
