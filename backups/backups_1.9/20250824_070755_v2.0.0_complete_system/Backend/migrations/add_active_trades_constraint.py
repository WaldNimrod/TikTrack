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
        print("🔧 Adding active_trades dynamic constraint...")
        
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
        print("✅ Active trades constraint added successfully")
        return True
        
    except Exception as e:
        print(f"❌ Error adding active_trades constraint: {e}")
        conn.rollback()
        return False
    finally:
        conn.close()

def create_update_triggers():
    """Create triggers to automatically update active_trades"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        print("🔧 Creating update triggers for active_trades...")
        
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
        print("✅ Update triggers created successfully")
        return True
        
    except Exception as e:
        print(f"❌ Error creating triggers: {e}")
        conn.rollback()
        return False
    finally:
        conn.close()

def update_all_tickers_active_status():
    """Update all tickers active_trades status"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        print("🔄 Updating all tickers active_trades status...")
        
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
        print(f"✅ Updated {updated_count} tickers active_trades status")
        return True
        
    except Exception as e:
        print(f"❌ Error updating tickers: {e}")
        conn.rollback()
        return False
    finally:
        conn.close()

def verify_triggers():
    """Verify triggers were created correctly"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        print("\n📋 Verifying triggers...")
        
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
        
        print("📊 Created triggers:")
        for trigger in created_triggers:
            print(f"  ✅ {trigger}")
        
        missing_triggers = [t for t in expected_triggers if t not in created_triggers]
        if missing_triggers:
            print("❌ Missing triggers:")
            for trigger in missing_triggers:
                print(f"  ❌ {trigger}")
            return False
        
        print("✅ All triggers verified successfully")
        return True
        
    except Exception as e:
        print(f"❌ Error verifying triggers: {e}")
        return False
    finally:
        conn.close()

def main():
    """Main migration function"""
    print("🚀 Starting Active Trades Constraint Migration")
    print("=" * 60)
    
    # Step 1: Add dynamic constraint
    if not add_active_trades_constraint():
        print("❌ Failed to add active_trades constraint")
        return
    
    # Step 2: Create update triggers
    if not create_update_triggers():
        print("❌ Failed to create triggers")
        return
    
    # Step 3: Update all existing tickers
    if not update_all_tickers_active_status():
        print("❌ Failed to update tickers")
        return
    
    # Step 4: Verify triggers
    if not verify_triggers():
        print("❌ Trigger verification failed")
        return
    
    print("\n✅ Active Trades Constraint Migration Completed Successfully!")
    print("📝 Features added:")
    print("  ✅ Dynamic constraint for active_trades field")
    print("  ✅ Automatic triggers for trade status changes")
    print("  ✅ Automatic triggers for plan status changes")
    print("  ✅ Real-time active_trades updates")
    print("  ✅ All existing tickers updated")

if __name__ == "__main__":
    main()
