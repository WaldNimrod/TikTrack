"""
Migration: Add Ticker Status Triggers
===================================

This migration adds database triggers to automatically update the ticker status
and active_trades field based on linked trades and trade plans.

The triggers ensure that:
- active_trades = TRUE when there are open trades for the ticker
- status = 'open' when there are open trades OR open trade plans
- status = 'closed' when there are no open trades AND no open trade plans
- status = 'cancelled' can only be set manually and prevents automatic updates

Author: TikTrack Development Team
Version: 1.0
Date: 2025-08-28
"""

import sqlite3
import os
from datetime import datetime

def upgrade():
    """
    Add triggers to automatically update ticker status and active_trades
    """
    
    # Get database path
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    db_path = os.path.join(base_dir, "db", "simpleTrade_new.db")
    
    if not os.path.exists(db_path):
        return False
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # ========================================
        # TRADE PLANS TRIGGERS
        # ========================================
        
        # Create trigger for trade_plan INSERT
        cursor.execute("""
            CREATE TRIGGER IF NOT EXISTS trigger_trade_plan_insert_ticker_status
            AFTER INSERT ON trade_plans
            FOR EACH ROW
            BEGIN
                UPDATE tickers 
                SET active_trades = (
                    SELECT COUNT(*) > 0 
                    FROM trades 
                    WHERE trades.ticker_id = NEW.ticker_id 
                    AND trades.status = 'open'
                ),
                status = CASE 
                    WHEN NEW.status = 'open' OR (
                        SELECT COUNT(*) > 0 
                        FROM trades 
                        WHERE trades.ticker_id = NEW.ticker_id 
                        AND trades.status = 'open'
                    ) THEN 'open'
                    ELSE 'closed'
                END,
                updated_at = datetime('now')
                WHERE tickers.id = NEW.ticker_id
                AND tickers.status != 'cancelled';
            END;
        """)
        
        # Create trigger for trade_plan UPDATE
        cursor.execute("""
            CREATE TRIGGER IF NOT EXISTS trigger_trade_plan_update_ticker_status
            AFTER UPDATE ON trade_plans
            FOR EACH ROW
            BEGIN
                UPDATE tickers 
                SET active_trades = (
                    SELECT COUNT(*) > 0 
                    FROM trades 
                    WHERE trades.ticker_id = NEW.ticker_id 
                    AND trades.status = 'open'
                ),
                status = CASE 
                    WHEN NEW.status = 'open' OR (
                        SELECT COUNT(*) > 0 
                        FROM trades 
                        WHERE trades.ticker_id = NEW.ticker_id 
                        AND trades.status = 'open'
                    ) THEN 'open'
                    ELSE 'closed'
                END,
                updated_at = datetime('now')
                WHERE tickers.id = NEW.ticker_id
                AND tickers.status != 'cancelled';
            END;
        """)
        
        # Create trigger for trade_plan DELETE
        cursor.execute("""
            CREATE TRIGGER IF NOT EXISTS trigger_trade_plan_delete_ticker_status
            AFTER DELETE ON trade_plans
            FOR EACH ROW
            BEGIN
                UPDATE tickers 
                SET active_trades = (
                    SELECT COUNT(*) > 0 
                    FROM trades 
                    WHERE trades.ticker_id = OLD.ticker_id 
                    AND trades.status = 'open'
                ),
                status = CASE 
                    WHEN (
                        SELECT COUNT(*) > 0 
                        FROM trades 
                        WHERE trades.ticker_id = OLD.ticker_id 
                        AND trades.status = 'open'
                    ) OR (
                        SELECT COUNT(*) > 0 
                        FROM trade_plans 
                        WHERE trade_plans.ticker_id = OLD.ticker_id 
                        AND trade_plans.status = 'open'
                    ) THEN 'open'
                    ELSE 'closed'
                END,
                updated_at = datetime('now')
                WHERE tickers.id = OLD.ticker_id
                AND tickers.status != 'cancelled';
            END;
        """)
        
        # ========================================
        # UPDATE EXISTING TRADE TRIGGERS
        # ========================================
        
        # Drop existing trade triggers
        cursor.execute("DROP TRIGGER IF EXISTS trigger_trade_insert_active_trades")
        cursor.execute("DROP TRIGGER IF EXISTS trigger_trade_update_active_trades")
        cursor.execute("DROP TRIGGER IF EXISTS trigger_trade_delete_active_trades")
        
        # Create new comprehensive trade triggers
        cursor.execute("""
            CREATE TRIGGER IF NOT EXISTS trigger_trade_insert_ticker_status
            AFTER INSERT ON trades
            FOR EACH ROW
            BEGIN
                UPDATE tickers 
                SET active_trades = (
                    SELECT COUNT(*) > 0 
                    FROM trades 
                    WHERE trades.ticker_id = NEW.ticker_id 
                    AND trades.status = 'open'
                ),
                status = CASE 
                    WHEN NEW.status = 'open' OR (
                        SELECT COUNT(*) > 0 
                        FROM trade_plans 
                        WHERE trade_plans.ticker_id = NEW.ticker_id 
                        AND trade_plans.status = 'open'
                    ) THEN 'open'
                    ELSE 'closed'
                END,
                updated_at = datetime('now')
                WHERE tickers.id = NEW.ticker_id
                AND tickers.status != 'cancelled';
            END;
        """)
        
        cursor.execute("""
            CREATE TRIGGER IF NOT EXISTS trigger_trade_update_ticker_status
            AFTER UPDATE ON trades
            FOR EACH ROW
            BEGIN
                UPDATE tickers 
                SET active_trades = (
                    SELECT COUNT(*) > 0 
                    FROM trades 
                    WHERE trades.ticker_id = NEW.ticker_id 
                    AND trades.status = 'open'
                ),
                status = CASE 
                    WHEN NEW.status = 'open' OR (
                        SELECT COUNT(*) > 0 
                        FROM trade_plans 
                        WHERE trade_plans.ticker_id = NEW.ticker_id 
                        AND trade_plans.status = 'open'
                    ) THEN 'open'
                    ELSE 'closed'
                END,
                updated_at = datetime('now')
                WHERE tickers.id = NEW.ticker_id
                AND tickers.status != 'cancelled';
            END;
        """)
        
        cursor.execute("""
            CREATE TRIGGER IF NOT EXISTS trigger_trade_delete_ticker_status
            AFTER DELETE ON trades
            FOR EACH ROW
            BEGIN
                UPDATE tickers 
                SET active_trades = (
                    SELECT COUNT(*) > 0 
                    FROM trades 
                    WHERE trades.ticker_id = OLD.ticker_id 
                    AND trades.status = 'open'
                ),
                status = CASE 
                    WHEN (
                        SELECT COUNT(*) > 0 
                        FROM trades 
                        WHERE trades.ticker_id = OLD.ticker_id 
                        AND trades.status = 'open'
                    ) OR (
                        SELECT COUNT(*) > 0 
                        FROM trade_plans 
                        WHERE trade_plans.ticker_id = OLD.ticker_id 
                        AND trade_plans.status = 'open'
                    ) THEN 'open'
                    ELSE 'closed'
                END,
                updated_at = datetime('now')
                WHERE tickers.id = OLD.ticker_id
                AND tickers.status != 'cancelled';
            END;
        """)
        
        # ========================================
        # UPDATE ALL EXISTING TICKERS
        # ========================================
        
        # Update all existing tickers to have correct status and active_trades
        cursor.execute("""
            UPDATE tickers 
            SET active_trades = (
                SELECT COUNT(*) > 0 
                FROM trades 
                WHERE trades.ticker_id = tickers.id 
                AND trades.status = 'open'
            ),
            status = CASE 
                WHEN status = 'cancelled' THEN 'cancelled'
                WHEN (
                    SELECT COUNT(*) > 0 
                    FROM trades 
                    WHERE trades.ticker_id = tickers.id 
                    AND trades.status = 'open'
                ) OR (
                    SELECT COUNT(*) > 0 
                    FROM trade_plans 
                    WHERE trade_plans.ticker_id = tickers.id 
                    AND trade_plans.status = 'open'
                ) THEN 'open'
                ELSE 'closed'
            END,
            updated_at = datetime('now')
        """)
        
        conn.commit()
        
        # Verify triggers were created
        cursor.execute("""
            SELECT name FROM sqlite_master 
            WHERE type = 'trigger' 
            AND name LIKE '%ticker_status%'
        """)
        triggers = cursor.fetchall()
        
        for trigger in triggers:
            print(f"  - {trigger[0]}")
        
        # Show updated tickers
        cursor.execute("""
            SELECT id, symbol, name, status, active_trades 
            FROM tickers 
            ORDER BY symbol
        """)
        tickers = cursor.fetchall()
        
        for ticker in tickers:
            print(f"  - {ticker[1]} ({ticker[2]}): status={ticker[3]}, active_trades={ticker[4]}")
        
        conn.close()
        return True
        
    except Exception as e:
        if conn:
            conn.rollback()
            conn.close()
        return False


def downgrade():
    """
    Remove the ticker status triggers
    """
    
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    db_path = os.path.join(base_dir, "db", "simpleTrade_new.db")
    
    if not os.path.exists(db_path):
        return False
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Drop all triggers
        triggers_to_drop = [
            'trigger_trade_plan_insert_ticker_status',
            'trigger_trade_plan_update_ticker_status',
            'trigger_trade_plan_delete_ticker_status',
            'trigger_trade_insert_ticker_status',
            'trigger_trade_update_ticker_status',
            'trigger_trade_delete_ticker_status'
        ]
        
        for trigger_name in triggers_to_drop:
            cursor.execute(f"DROP TRIGGER IF EXISTS {trigger_name}")
        
        # Reset all tickers to closed status
        cursor.execute("""
            UPDATE tickers 
            SET status = 'closed',
                active_trades = 0,
                updated_at = datetime('now')
            WHERE status != 'cancelled'
        """)
        
        conn.commit()
        conn.close()
        
        return True
        
    except Exception as e:
        if conn:
            conn.rollback()
            conn.close()
        return False


if __name__ == "__main__":
    
    success = upgrade()
    
    if success:
        print("✅ Ticker status triggers migration completed successfully")
    else:
        print("❌ Ticker status triggers migration failed")
        exit(1)
