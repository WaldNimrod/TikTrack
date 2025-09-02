"""
Migration: Add Active Trades Trigger
===================================

This migration adds database triggers to automatically update the active_trades field
in the tickers table whenever trades are inserted, updated, or deleted.

The triggers ensure that:
- active_trades = TRUE when there are open trades for the ticker
- active_trades = FALSE when there are no open trades for the ticker

Author: TikTrack Development Team
Version: 1.0
Date: 2025-08-25
"""

import sqlite3
import os
from datetime import datetime

def upgrade():
    """
    Add triggers to automatically update active_trades field
    """
    
    # Get database path
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    db_path = os.path.join(base_dir, "db", "simpleTrade_new.db")
    
    if not os.path.exists(db_path):
        return False
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Note: SQLite doesn't support stored functions like PostgreSQL
        # We'll use triggers directly instead
        
        # Create trigger for INSERT
        cursor.execute("""
            CREATE TRIGGER IF NOT EXISTS trigger_trade_insert_active_trades
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
                updated_at = datetime('now')
                WHERE tickers.id = NEW.ticker_id;
            END;
        """)
        
        # Create trigger for UPDATE
        cursor.execute("""
            CREATE TRIGGER IF NOT EXISTS trigger_trade_update_active_trades
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
                updated_at = datetime('now')
                WHERE tickers.id = NEW.ticker_id;
            END;
        """)
        
        # Create trigger for DELETE
        cursor.execute("""
            CREATE TRIGGER IF NOT EXISTS trigger_trade_delete_active_trades
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
                updated_at = datetime('now')
                WHERE tickers.id = OLD.ticker_id;
            END;
        """)
        
        # Update all existing tickers to have correct active_trades value
        cursor.execute("""
            UPDATE tickers 
            SET active_trades = (
                SELECT COUNT(*) > 0 
                FROM trades 
                WHERE trades.ticker_id = tickers.id 
                AND trades.status = 'open'
            ),
            updated_at = datetime('now')
        """)
        
        conn.commit()
        
        # Verify triggers were created
        cursor.execute("""
            SELECT name FROM sqlite_master 
            WHERE type = 'trigger' 
            AND name LIKE '%active_trades%'
        """)
        triggers = cursor.fetchall()
        
        for trigger in triggers:
        
        # Show updated tickers
        cursor.execute("""
            SELECT id, symbol, name, active_trades 
            FROM tickers 
            WHERE active_trades = 1
        """)
        active_tickers = cursor.fetchall()
        
        for ticker in active_tickers:
        
        conn.close()
        return True
        
    except Exception as e:
        if conn:
            conn.rollback()
            conn.close()
        return False


def downgrade():
    """
    Remove the active_trades triggers
    """
    
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    db_path = os.path.join(base_dir, "db", "simpleTrade_new.db")
    
    if not os.path.exists(db_path):
        return False
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Drop triggers
        triggers_to_drop = [
            'trigger_trade_insert_active_trades',
            'trigger_trade_update_active_trades', 
            'trigger_trade_delete_active_trades'
        ]
        
        for trigger_name in triggers_to_drop:
            cursor.execute(f"DROP TRIGGER IF EXISTS {trigger_name}")
        
        # Reset all active_trades to False
        cursor.execute("""
            UPDATE tickers 
            SET active_trades = 0,
                updated_at = datetime('now')
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
    else:
        exit(1)
