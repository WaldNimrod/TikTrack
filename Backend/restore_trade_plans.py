#!/usr/bin/env python3
import sqlite3
import os

def restore_trade_plans():
    backup_file = "db/database_full_backup_20250819_201159.sql"
    current_db = "db/simpleTrade_new.db"
    
    if not os.path.exists(backup_file):
        print(f"❌ Backup file not found: {backup_file}")
        return
    
    if not os.path.exists(current_db):
        print(f"❌ Current database not found: {current_db}")
        return
    
    try:
        # Connect to current database
        current_conn = sqlite3.connect(current_db)
        current_cursor = current_conn.cursor()
        
        # Delete all current data from trade_plans table
        current_cursor.execute("DELETE FROM trade_plans")
        print("✅ Cleared current trade_plans table")
        
        # Read backup file and extract trade plans
        with open(backup_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Extract table definition and data
        start_marker = "CREATE TABLE trade_plans ("
        end_marker = "CREATE TABLE alerts ("
        
        start_idx = content.find(start_marker)
        end_idx = content.find(end_marker)
        
        if start_idx == -1 or end_idx == -1:
            print("❌ Could not find trade_plans table in backup")
            return
        
        trade_plans_section = content[start_idx:end_idx]
        
        # Extract INSERT statements
        lines = trade_plans_section.split('\n')
        insert_statements = []
        
        for line in lines:
            if line.strip().startswith('INSERT INTO trade_plans'):
                insert_statements.append(line.strip())
        
        print(f"📊 Found {len(insert_statements)} trade plans in backup")
        
        # Insert data into current database
        for insert_stmt in insert_statements:
            current_cursor.execute(insert_stmt)
        
        # Save changes
        current_conn.commit()
        print("✅ Trade plans restored successfully!")
        
        # Verify data was inserted
        current_cursor.execute("SELECT COUNT(*) FROM trade_plans")
        count = current_cursor.fetchone()[0]
        print(f"📊 Current trade plans count: {count}")
        
        # Show trade plan details
        current_cursor.execute("""
            SELECT tp.id, tp.investment_type, tp.status, tp.planned_amount, 
                   a.name as account_name, t.symbol as ticker_symbol
            FROM trade_plans tp
            LEFT JOIN accounts a ON tp.account_id = a.id
            LEFT JOIN tickers t ON tp.ticker_id = t.id
        """)
        
        plans = current_cursor.fetchall()
        print("\n📋 Restored trade plans:")
        for plan in plans:
            print(f"  - ID: {plan[0]}, Type: {plan[1]}, Status: {plan[2]}, Amount: ${plan[3]}, Account: {plan[4]}, Ticker: {plan[5]}")
        
    except Exception as e:
        print(f"❌ Error restoring trade plans: {e}")
    finally:
        current_conn.close()

if __name__ == "__main__":
    restore_trade_plans()
