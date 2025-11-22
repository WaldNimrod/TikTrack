#!/usr/bin/env python3
"""
Add Sample Executions Script - TikTrack
הוספת נתוני ביצוע לבדיקה

תאריך: 24/10/2025
גרסה: 1.0.0
מטרה: הוספת executions לטריידים קיימים לבדיקת מערכת חישוב פוזיציות
"""

import sqlite3
import random
from datetime import datetime, timedelta
import sys
import os

# Add the Backend directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def get_database_path():
    """Get the database path"""
    return os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'db', 'tiktrack.db')

def get_existing_trades():
    """Get existing trades from the database"""
    db_path = get_database_path()
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        cursor.execute("SELECT id, ticker_id, created_at FROM trades ORDER BY id")
        trades = cursor.fetchall()
        return trades
    finally:
        conn.close()

def generate_sample_executions(trade_id, ticker_id, trade_created_at):
    """Generate sample executions for a trade"""
    executions = []
    
    # Random number of executions (2-5)
    num_executions = random.randint(2, 5)
    
    # Base price around 200-300 (realistic stock prices)
    base_price = random.uniform(200, 300)
    
    # Generate executions
    for i in range(num_executions):
        # Date after trade creation
        days_after = random.randint(1, 30)
        exec_date = datetime.fromisoformat(trade_created_at.replace('Z', '+00:00')) + timedelta(days=days_after)
        
        # Price variation around base price
        price_variation = random.uniform(-0.05, 0.05)  # ±5%
        price = base_price * (1 + price_variation)
        
        # Quantity (50-200 shares)
        quantity = random.randint(50, 200)
        
        # Action (mostly buy, some sell)
        if i < num_executions - 1:  # All but last are buy
            action = 'buy'
        else:  # Last one might be sell (partial close)
            action = random.choice(['buy', 'sell'])
        
        # Fee
        fee = random.uniform(1.0, 5.0)
        
        execution = {
            'trade_id': trade_id,
            'action': action,
            'quantity': quantity,
            'price': round(price, 2),
            'fee': round(fee, 2),
            'date': exec_date.strftime('%Y-%m-%d %H:%M:%S'),
            'source': 'sample_data',
            'notes': f'Sample execution {i+1} for testing position calculator'
        }
        
        executions.append(execution)
    
    return executions

def add_executions_to_database(executions):
    """Add executions to the database"""
    db_path = get_database_path()
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        for execution in executions:
            cursor.execute("""
                INSERT INTO executions (
                    trade_id, action, quantity, price, fee, date, source, notes, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                execution['trade_id'],
                execution['action'],
                execution['quantity'],
                execution['price'],
                execution['fee'],
                execution['date'],
                execution['source'],
                execution['notes'],
                datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            ))
        
        conn.commit()
        print(f"✅ Added {len(executions)} executions to database")
        
    except Exception as e:
        print(f"❌ Error adding executions: {e}")
        conn.rollback()
        raise
    finally:
        conn.close()

def main():
    """Main function"""
    print("🚀 Starting sample executions generation...")
    
    # Get existing trades
    trades = get_existing_trades()
    print(f"📊 Found {len(trades)} existing trades")
    
    if not trades:
        print("❌ No trades found in database. Please create some trades first.")
        return
    
    # Generate executions for each trade
    all_executions = []
    
    for trade_id, ticker_id, created_at in trades:
        executions = generate_sample_executions(trade_id, ticker_id, created_at)
        all_executions.extend(executions)
        print(f"📝 Generated {len(executions)} executions for trade {trade_id}")
    
    # Add to database
    if all_executions:
        add_executions_to_database(all_executions)
        print(f"🎉 Successfully added {len(all_executions)} sample executions")
        
        # Show summary
        print("\n📋 Summary:")
        print(f"   - Total executions: {len(all_executions)}")
        print(f"   - Trades with executions: {len(trades)}")
        print(f"   - Average executions per trade: {len(all_executions) / len(trades):.1f}")
        
        # Show sample data
        print("\n📄 Sample execution data:")
        for i, exec in enumerate(all_executions[:3]):  # Show first 3
            print(f"   {i+1}. Trade {exec['trade_id']}: {exec['action']} {exec['quantity']} @ ${exec['price']} (fee: ${exec['fee']})")
        
        print("\n✅ Sample executions generation completed!")
        print("💡 You can now test the position calculator system on the trades page.")
        
    else:
        print("❌ No executions generated")

if __name__ == "__main__":
    main()
