#!/usr/bin/env python3
"""
Script to add test data for cash flows
"""

import sqlite3
import os
from datetime import datetime, timedelta
import random

# Database path
DB_PATH = "Backend/db/simpleTrade_new.db"

def add_cash_flows():
    """Add test data for cash flows"""
    
    if not os.path.exists(DB_PATH):
        print(f"❌ Database not found: {DB_PATH}")
        return
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # Check if there are accounts
        cursor.execute("SELECT id FROM accounts LIMIT 1")
        accounts = cursor.fetchall()
        
        if not accounts:
            print("❌ No accounts in database. Please add accounts first.")
            return
        
        account_ids = [acc[0] for acc in accounts]
        
        # Test data for cash flows
        cash_flows_data = [
            # Deposits
            (account_ids[0], 'deposit', 10000.00, '2025-01-15', 'Initial deposit'),
            (account_ids[0], 'deposit', 5000.00, '2025-02-01', 'Additional deposit'),
            (account_ids[0], 'deposit', 3000.00, '2025-03-10', 'Monthly deposit'),
            
            # Withdrawals
            (account_ids[0], 'withdrawal', 2000.00, '2025-02-15', 'Personal withdrawal'),
            (account_ids[0], 'withdrawal', 1500.00, '2025-03-20', 'Additional withdrawal'),
            
            # Dividends
            (account_ids[0], 'dividend', 250.00, '2025-02-28', 'AAPL dividend'),
            (account_ids[0], 'dividend', 180.00, '2025-03-31', 'MSFT dividend'),
            
            # Fees
            (account_ids[0], 'fee', -25.00, '2025-01-31', 'Broker fee'),
            (account_ids[0], 'fee', -15.00, '2025-02-28', 'Broker fee'),
            (account_ids[0], 'fee', -20.00, '2025-03-31', 'Broker fee'),
            
            # If there's more than one account
            (account_ids[-1], 'deposit', 8000.00, '2025-01-20', 'Second account deposit'),
            (account_ids[-1], 'withdrawal', 1000.00, '2025-02-10', 'Second account withdrawal'),
            (account_ids[-1], 'dividend', 120.00, '2025-03-15', 'GOOGL dividend'),
        ]
        
        # Add the data
        for account_id, flow_type, amount, date, description in cash_flows_data:
            cursor.execute("""
                INSERT INTO cash_flows (account_id, type, amount, date, description, created_at)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (
                account_id,
                flow_type,
                amount,
                date,
                description,
                datetime.now().isoformat()
            ))
        
        conn.commit()
        print(f"✅ Added {len(cash_flows_data)} cash flows successfully")
        
        # Display summary
        cursor.execute("""
            SELECT 
                type,
                COUNT(*) as count,
                SUM(amount) as total_amount
            FROM cash_flows 
            GROUP BY type
        """)
        
        summary = cursor.fetchall()
        print("\n📊 Cash flows summary:")
        for flow_type, count, total in summary:
            print(f"  {flow_type}: {count} items, total {total:,.2f}")
        
    except Exception as e:
        print(f"❌ Error adding cash flows: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    print("🔄 Adding test data for cash flows...")
    add_cash_flows()
    print("✅ Completed")
