#!/usr/bin/env python3
"""
Fix CASH_FLOW_TRADE_TICKER_MATCH constraint message
====================================================

This migration updates the constraint message to correctly reflect that
cash flows validate trading_account_id matching, not ticker matching.

Author: TikTrack Development Team
Date: February 2025
"""

import os
import sqlite3
from datetime import datetime

DB_RELATIVE_PATH = os.path.join('..', 'db', 'simpleTrade_new.db')

def get_db_path() -> str:
    """Return absolute path to the SQLite database file."""
    current_dir = os.path.dirname(os.path.abspath(__file__))
    return os.path.join(current_dir, DB_RELATIVE_PATH)

def fix_constraint_message():
    """Update the constraint message to the correct one."""
    db_path = get_db_path()
    print(f"➡️  Using database: {db_path}")

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    try:
        # Find the constraint
        cursor.execute(
            """
            SELECT id, constraint_definition 
            FROM constraints 
            WHERE table_name = 'cash_flows' 
              AND column_name = 'trade_id' 
              AND constraint_type = 'CUSTOM'
              AND constraint_name = 'cash_flows_trade_ticker_match'
            """
        )
        constraint = cursor.fetchone()
        
        if constraint:
            constraint_id, old_definition = constraint
            print(f"📝 Found constraint ID {constraint_id}")
            print(f"📝 Old definition: {old_definition}")
            
            # Update to correct message
            new_definition = 'CASH_FLOW_TRADE_TICKER_MATCH|If trade_id is set, the cash flow trading_account_id must match the trade trading_account_id'
            
            cursor.execute(
                """
                UPDATE constraints 
                SET constraint_definition = ?,
                    updated_at = ?
                WHERE id = ?
                """,
                (new_definition, datetime.utcnow().isoformat(), constraint_id)
            )
            print(f"✅ Updated constraint definition to: {new_definition}")
        else:
            print("⚠️  Constraint not found - it may not exist yet")
        
        conn.commit()
        print("🎉 Migration completed successfully.")

    except sqlite3.Error as error:
        print(f"❌ SQLite error: {error}")
        conn.rollback()
        raise
    finally:
        conn.close()

if __name__ == "__main__":
    fix_constraint_message()

