#!/usr/bin/env python3
import sqlite3
import os

def restore_trades():
    backup_db = "db/simpleTrade_new_backup_20250819_201151.db"
    current_db = "db/simpleTrade_new.db"
    
    if not os.path.exists(backup_db):
        print(f"❌ Backup file not found: {backup_db}")
        return
    
    if not os.path.exists(current_db):
        print(f"❌ Current database not found: {current_db}")
        return
    
    try:
        # Connect to current database
        current_conn = sqlite3.connect(current_db)
        current_cursor = current_conn.cursor()
        
        # Connect to backup database
        backup_conn = sqlite3.connect(backup_db)
        backup_cursor = backup_conn.cursor()
        
        # Delete all current data from trades table
        current_cursor.execute("DELETE FROM trades")
        print("✅ Cleared current trades table")
        
        # Get all data from backup
        backup_cursor.execute("SELECT account_id, ticker_id, trade_plan_id, status, type, closed_at, cancelled_at, cancel_reason, total_pl, notes, id, created_at FROM trades")
        trades_data = backup_cursor.fetchall()
        
        print(f"📊 Found {len(trades_data)} trades in backup")
        
        # Insert data into current database
        for trade in trades_data:
            current_cursor.execute("""
                INSERT INTO trades (account_id, ticker_id, trade_plan_id, status, type, closed_at, cancelled_at, cancel_reason, total_pl, notes, id, created_at, side) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, trade + ('Long',))  # Add default 'Long' for side column
        
        # Save changes
        current_conn.commit()
        print("✅ Trades restored successfully!")
        
        # Verify data was inserted
        current_cursor.execute("SELECT COUNT(*) FROM trades")
        count = current_cursor.fetchone()[0]
        print(f"📊 Current trades count: {count}")
        
    except Exception as e:
        print(f"❌ Error restoring trades: {e}")
    finally:
        current_conn.close()
        backup_conn.close()

if __name__ == "__main__":
    restore_trades()
