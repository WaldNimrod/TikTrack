#!/usr/bin/env python3
"""
Migration: Add Active Trades Dynamic Constraint
Date: August 24, 2025
Description: Add dynamic constraint for active_trades field in tickers table
"""

import sqlite3
import os
import sys
from datetime import datetime

def get_db_connection():
    """Get database connection"""
    db_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "db", "simpleTrade_new.db")
    return sqlite3.connect(db_path)

def add_active_trades_constraint():
    """Add dynamic constraint for active_trades field"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        
        # Add the constraint definition
        cursor.execute("""
            INSERT INTO constraints (table_name, column_name, constraint_type, constraint_name, constraint_definition)
            VALUES (?, ?, ?, ?, ?)
        """, ('tickers', 'active_trades', 'COMPUTED', 'active_trades_computed', 
              'active_trades = (SELECT COUNT(*) > 0 FROM trades WHERE ticker_id = tickers.id AND status = ''open'') OR (SELECT COUNT(*) > 0 FROM trade_plans WHERE ticker_id = tickers.id AND status = ''open'')'))
        
        constraint_id = cursor.lastrowid
        
        # Add validation rule
        cursor.execute("""
            INSERT INTO constraint_validations (constraint_id, validation_type, validation_rule, error_message)
            VALUES (?, ?, ?, ?)
        """, (constraint_id, 'COMPUTED', 
              'active_trades = (SELECT COUNT(*) > 0 FROM trades WHERE ticker_id = tickers.id AND status = ''open'') OR (SELECT COUNT(*) > 0 FROM trade_plans WHERE ticker_id = tickers.id AND status = ''open'')',
              'active_trades field must reflect actual open trades and plans'))
        
        conn.commit()
        return True
        
    except Exception as e:
        conn.rollback()
        return False
    finally:
        conn.close()

def create_update_triggers():
    """Create triggers to automatically update active_trades"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        
        # Trigger for trades table - when trade status changes
        cursor.execute("""
            CREATE TRIGGER IF NOT EXISTS update_ticker_active_trades_on_trade_change
            AFTER UPDATE OF status ON trades
            BEGIN
                UPDATE tickers 
                SET active_trades = (
                    SELECT COUNT(*) > 0 
                    FROM trades 
                    WHERE ticker_id = NEW.ticker_id AND status = 'open'
                ) OR (
                    SELECT COUNT(*) > 0 
                    FROM trade_plans 
                    WHERE ticker_id = NEW.ticker_id AND status = 'open'
                )
                WHERE id = NEW.ticker_id;
            END;
        """)
        
        # Trigger for trades table - when new trade is inserted
        cursor.execute("""
            CREATE TRIGGER IF NOT EXISTS update_ticker_active_trades_on_trade_insert
            AFTER INSERT ON trades
            BEGIN
                UPDATE tickers 
                SET active_trades = (
                    SELECT COUNT(*) > 0 
                    FROM trades 
                    WHERE ticker_id = NEW.ticker_id AND status = 'open'
                ) OR (
                    SELECT COUNT(*) > 0 
                    FROM trade_plans 
                    WHERE ticker_id = NEW.ticker_id AND status = 'open'
                )
                WHERE id = NEW.ticker_id;
            END;
        """)
        
        # Trigger for trades table - when trade is deleted
        cursor.execute("""
            CREATE TRIGGER IF NOT EXISTS update_ticker_active_trades_on_trade_delete
            AFTER DELETE ON trades
            BEGIN
                UPDATE tickers 
                SET active_trades = (
                    SELECT COUNT(*) > 0 
                    FROM trades 
                    WHERE ticker_id = OLD.ticker_id AND status = 'open'
                ) OR (
                    SELECT COUNT(*) > 0 
                    FROM trade_plans 
                    WHERE ticker_id = OLD.ticker_id AND status = 'open'
                )
                WHERE id = OLD.ticker_id;
            END;
        """)
        
        # Trigger for trade_plans table - when plan status changes
        cursor.execute("""
            CREATE TRIGGER IF NOT EXISTS update_ticker_active_trades_on_plan_change
            AFTER UPDATE OF status ON trade_plans
            BEGIN
                UPDATE tickers 
                SET active_trades = (
                    SELECT COUNT(*) > 0 
                    FROM trades 
                    WHERE ticker_id = NEW.ticker_id AND status = 'open'
                ) OR (
                    SELECT COUNT(*) > 0 
                    FROM trade_plans 
                    WHERE ticker_id = NEW.ticker_id AND status = 'open'
                )
                WHERE id = NEW.ticker_id;
            END;
        """)
        
        # Trigger for trade_plans table - when new plan is inserted
        cursor.execute("""
            CREATE TRIGGER IF NOT EXISTS update_ticker_active_trades_on_plan_insert
            AFTER INSERT ON trade_plans
            BEGIN
                UPDATE tickers 
                SET active_trades = (
                    SELECT COUNT(*) > 0 
                    FROM trades 
                    WHERE ticker_id = NEW.ticker_id AND status = 'open'
                ) OR (
                    SELECT COUNT(*) > 0 
                    FROM trade_plans 
                    WHERE ticker_id = NEW.ticker_id AND status = 'open'
                )
                WHERE id = NEW.ticker_id;
            END;
        """)
        
        # Trigger for trade_plans table - when plan is deleted
        cursor.execute("""
            CREATE TRIGGER IF NOT EXISTS update_ticker_active_trades_on_plan_delete
            AFTER DELETE ON trade_plans
            BEGIN
                UPDATE tickers 
                SET active_trades = (
                    SELECT COUNT(*) > 0 
                    FROM trades 
                    WHERE ticker_id = OLD.ticker_id AND status = 'open'
                ) OR (
                    SELECT COUNT(*) > 0 
                    FROM trade_plans 
                    WHERE ticker_id = OLD.ticker_id AND status = 'open'
                )
                WHERE id = OLD.ticker_id;
            END;
        """)
        
        conn.commit()
        return True
        
    except Exception as e:
        conn.rollback()
        return False
    finally:
        conn.close()

def update_all_tickers_active_status():
    """Update all tickers active_trades status"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        
        cursor.execute("""
            UPDATE tickers 
            SET active_trades = (
                SELECT COUNT(*) > 0 
                FROM trades 
                WHERE ticker_id = tickers.id AND status = 'open'
            ) OR (
                SELECT COUNT(*) > 0 
                FROM trade_plans 
                WHERE ticker_id = tickers.id AND status = 'open'
            )
        """)
        
        updated_count = cursor.rowcount
        conn.commit()
        return True
        
    except Exception as e:
        conn.rollback()
        return False
    finally:
        conn.close()

def verify_triggers():
    """Verify triggers were created correctly"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        
        cursor.execute("SELECT name FROM sqlite_master WHERE type='trigger' AND name LIKE '%active_trades%'")
        triggers = cursor.fetchall()
        
        expected_triggers = [
            'update_ticker_active_trades_on_trade_change',
            'update_ticker_active_trades_on_trade_insert', 
            'update_ticker_active_trades_on_trade_delete',
            'update_ticker_active_trades_on_plan_change',
            'update_ticker_active_trades_on_plan_insert',
            'update_ticker_active_trades_on_plan_delete'
        ]
        
        created_triggers = [trigger[0] for trigger in triggers]
        
        for trigger in created_triggers:
            print(f"✅ Found trigger: {trigger}")
        
        missing_triggers = [t for t in expected_triggers if t not in created_triggers]
        if missing_triggers:
            print(f"❌ Missing triggers: {missing_triggers}")
            for trigger in missing_triggers:
                print(f"  - {trigger}")
            return False
        
        print("✅ All expected triggers found!")
        return True
        
    except Exception as e:
        return False
    finally:
        conn.close()

def main():
    """Main migration function"""
    
    # Step 1: Add dynamic constraint
    if not add_active_trades_constraint():
        return
    
    # Step 2: Create update triggers
    if not create_update_triggers():
        return
    
    # Step 3: Update all existing tickers
    if not update_all_tickers_active_status():
        return
    
    # Step 4: Verify triggers
    if not verify_triggers():
        return
    

if __name__ == "__main__":
    main()
