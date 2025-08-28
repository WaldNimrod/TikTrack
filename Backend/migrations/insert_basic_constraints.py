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
        print("📊 Inserting trades table constraints...")
        
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
        
        # 4. account_id NOT NULL constraint
        cursor.execute("""
            INSERT INTO constraints (table_name, column_name, constraint_type, constraint_name, constraint_definition)
            VALUES (?, ?, ?, ?, ?)
        """, ('trades', 'account_id', 'NOT_NULL', 'account_required', 
              'account_id IS NOT NULL'))
        
        # 5. ticker_id NOT NULL constraint
        cursor.execute("""
            INSERT INTO constraints (table_name, column_name, constraint_type, constraint_name, constraint_definition)
            VALUES (?, ?, ?, ?, ?)
        """, ('trades', 'ticker_id', 'NOT_NULL', 'ticker_required', 
              'ticker_id IS NOT NULL'))
        
        conn.commit()
        print("✅ Trades constraints inserted successfully")
        return True
        
    except Exception as e:
        print(f"❌ Error inserting trades constraints: {e}")
        conn.rollback()
        return False
    finally:
        conn.close()

def insert_trade_plans_constraints():
    """Insert constraints for trade_plans table"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        print("📊 Inserting trade_plans table constraints...")
        
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
        
        # 3. planned_amount RANGE constraint
        cursor.execute("""
            INSERT INTO constraints (table_name, column_name, constraint_type, constraint_name, constraint_definition)
            VALUES (?, ?, ?, ?, ?)
        """, ('trade_plans', 'planned_amount', 'RANGE', 'positive_planned_amount', 
              'planned_amount > 0'))
        
        # 4. target_price RANGE constraint
        cursor.execute("""
            INSERT INTO constraints (table_name, column_name, constraint_type, constraint_name, constraint_definition)
            VALUES (?, ?, ?, ?, ?)
        """, ('trade_plans', 'target_price', 'RANGE', 'positive_target_price', 
              'target_price > 0'))
        
                # 5. stop_loss RANGE constraint
        cursor.execute("""
            INSERT INTO constraints (table_name, column_name, constraint_type, constraint_name, constraint_definition)
            VALUES (?, ?, ?, ?, ?)
        """, ('trade_plans', 'stop_loss', 'RANGE', 'positive_stop_loss',
            'stop_loss > 0'))
        
        conn.commit()
        print("✅ Trade plans constraints inserted successfully")
        return True
        
    except Exception as e:
        print(f"❌ Error inserting trade_plans constraints: {e}")
        conn.rollback()
        return False
    finally:
        conn.close()

def insert_alerts_constraints():
    """Insert constraints for alerts table"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        print("📊 Inserting alerts table constraints...")
        
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
        print("✅ Alerts constraints inserted successfully")
        return True
        
    except Exception as e:
        print(f"❌ Error inserting alerts constraints: {e}")
        conn.rollback()
        return False
    finally:
        conn.close()

def insert_accounts_constraints():
    """Insert constraints for accounts table"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        print("📊 Inserting accounts table constraints...")
        
        # 1. status ENUM constraint
        cursor.execute("""
            INSERT INTO constraints (table_name, column_name, constraint_type, constraint_name, constraint_definition)
            VALUES (?, ?, ?, ?, ?)
        """, ('accounts', 'status', 'ENUM', 'valid_account_status', 
              'status IN (''active'', ''inactive'', ''suspended'')'))
        
        constraint_id = cursor.lastrowid
        
        enum_values = [
            ('active', 'פעיל', 1),
            ('inactive', 'לא פעיל', 2),
            ('suspended', 'מושעה', 3)
        ]
        
        for value, display_name, sort_order in enum_values:
            cursor.execute("""
                INSERT INTO enum_values (constraint_id, value, display_name, sort_order)
                VALUES (?, ?, ?, ?)
            """, (constraint_id, value, display_name, sort_order))
        
        conn.commit()
        print("✅ Accounts constraints inserted successfully")
        return True
        
    except Exception as e:
        print(f"❌ Error inserting accounts constraints: {e}")
        conn.rollback()
        return False
    finally:
        conn.close()

def verify_constraints():
    """Verify all constraints were inserted correctly"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        print("\n📋 Verifying constraints...")
        
        # Count constraints by table
        cursor.execute("""
            SELECT table_name, COUNT(*) as constraint_count 
            FROM constraints 
            GROUP BY table_name 
            ORDER BY table_name
        """)
        
        results = cursor.fetchall()
        print("📊 Constraints by table:")
        for table_name, count in results:
            print(f"  - {table_name}: {count} constraints")
        
        # Count enum values
        cursor.execute("SELECT COUNT(*) FROM enum_values")
        enum_count = cursor.fetchone()[0]
        print(f"📊 Total enum values: {enum_count}")
        
        # Show sample constraints
        cursor.execute("""
            SELECT table_name, column_name, constraint_type, constraint_name 
            FROM constraints 
            ORDER BY table_name, column_name
        """)
        
        print("\n📋 Sample constraints:")
        for table_name, column_name, constraint_type, constraint_name in cursor.fetchall():
            print(f"  - {table_name}.{column_name}: {constraint_type} ({constraint_name})")
        
        return True
        
    except Exception as e:
        print(f"❌ Error verifying constraints: {e}")
        return False
    finally:
        conn.close()

def main():
    """Main migration function"""
    print("🚀 Starting Basic Constraints Insertion")
    print("=" * 60)
    
    # Step 1: Insert trades constraints
    if not insert_trades_constraints():
        print("❌ Failed to insert trades constraints")
        return
    
    # Step 2: Insert trade_plans constraints
    if not insert_trade_plans_constraints():
        print("❌ Failed to insert trade_plans constraints")
        return
    
    # Step 3: Insert alerts constraints
    if not insert_alerts_constraints():
        print("❌ Failed to insert alerts constraints")
        return
    
    # Step 4: Insert accounts constraints
    if not insert_accounts_constraints():
        print("❌ Failed to insert accounts constraints")
        return
    
    # Step 5: Verify all constraints
    if not verify_constraints():
        print("❌ Constraint verification failed")
        return
    
    print("\n✅ Basic Constraints Insertion Completed Successfully!")
    print("📝 Next steps:")
    print("  1. Create constraint service")
    print("  2. Update API routes")
    print("  3. Test constraint validation")
    print("  4. Create frontend interface")

if __name__ == "__main__":
    main()
