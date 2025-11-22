#!/usr/bin/env python3
"""
Add Sample Account Activity Script - TikTrack
הוספת נתוני ביצועים ותזרימי מזומנים מכל הסוגים לחשבונות

תאריך: נובמבר 2025
גרסה: 1.0.0
מטרה: הוספת executions ו-cash_flows מכל הסוגים לחשבונות לבדיקת מערכת תנועות חשבון
"""

import sqlite3
import random
from datetime import datetime, timedelta, date
import sys
import os

# Add the Backend directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def get_database_path():
    """Get the database path"""
    return os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'db', 'tiktrack.db')

def get_existing_accounts():
    """Get existing trading accounts from the database"""
    db_path = get_database_path()
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        cursor.execute("SELECT id, name, currency_id FROM trading_accounts ORDER BY id")
        accounts = cursor.fetchall()
        return accounts
    finally:
        conn.close()

def get_existing_tickers():
    """Get existing tickers from the database"""
    db_path = get_database_path()
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        cursor.execute("SELECT id, symbol, currency_id FROM tickers ORDER BY id LIMIT 20")
        tickers = cursor.fetchall()
        return tickers
    finally:
        conn.close()

def get_existing_currencies():
    """Get existing currencies from the database"""
    db_path = get_database_path()
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        cursor.execute("SELECT id, symbol FROM currencies ORDER BY id")
        currencies = cursor.fetchall()
        return currencies
    finally:
        conn.close()

def generate_sample_executions(account_id, tickers):
    """Generate sample executions for an account"""
    executions = []
    
    if not tickers:
        print(f"   ⚠️  No tickers available for account {account_id}")
        return executions
    
    # Generate 5-15 executions per account
    num_executions = random.randint(5, 15)
    
    # Select random tickers
    selected_tickers = random.sample(tickers, min(num_executions, len(tickers)))
    
    for i in range(num_executions):
        ticker_id, ticker_symbol, ticker_currency_id = random.choice(tickers)
        
        # Date in the last 90 days
        days_ago = random.randint(0, 90)
        exec_date = datetime.now() - timedelta(days=days_ago)
        
        # Price variation
        base_price = random.uniform(50, 300)
        price = round(base_price, 2)
        
        # Quantity (10-500 shares)
        quantity = random.randint(10, 500)
        
        # Action (random buy/sell)
        action = random.choice(['buy', 'sell'])
        
        # Fee (0.5-10)
        fee = round(random.uniform(0.5, 10.0), 2)
        
        execution = {
            'trading_account_id': account_id,
            'ticker_id': ticker_id,
            'action': action,
            'quantity': quantity,
            'price': price,
            'fee': fee,
            'date': exec_date.strftime('%Y-%m-%d %H:%M:%S'),
            'source': 'sample_data',
            'notes': f'Sample {action} execution for testing account activity - {ticker_symbol}'
        }
        
        executions.append(execution)
    
    return executions

def generate_sample_cash_flows(account_id, currency_id):
    """Generate sample cash flows for an account - ALL TYPES"""
    cash_flows = []
    
    # Cash flow types and their typical amounts
    cash_flow_types = [
        # Positive cash flows (money coming in)
        {'type': 'deposit', 'amount_range': (1000, 10000), 'description': 'הפקדה ראשונית לחשבון'},
        {'type': 'dividend', 'amount_range': (50, 500), 'description': 'תשלום דיבידנד'},
        {'type': 'transfer_in', 'amount_range': (500, 5000), 'description': 'העברה מחשבון אחר'},
        {'type': 'other_positive', 'amount_range': (20, 200), 'description': 'החזר עמלה'},
        
        # Negative cash flows (money going out)
        {'type': 'withdrawal', 'amount_range': (500, 5000), 'description': 'משיכה מהחשבון'},
        {'type': 'fee', 'amount_range': (5, 50), 'description': 'עמלות שירות'},
        {'type': 'transfer_out', 'amount_range': (200, 2000), 'description': 'העברה לחשבון אחר'},
        {'type': 'other_negative', 'amount_range': (10, 100), 'description': 'הוצאות אחרות'},
        
        # Interest can be positive or negative - generate both
        {'type': 'interest', 'amount_range': (10, 100), 'description': 'ריבית על יתרה', 'can_be_negative': True},
        
        # Neutral (can be positive or negative)
        {'type': 'other', 'amount_range': (-100, 100), 'description': 'תנועה אחרת'}
    ]
    
    # Generate 2-3 of each type
    for cf_type_info in cash_flow_types:
        num_records = random.randint(2, 3)
        
        for j in range(num_records):
            cf_type = cf_type_info['type']
            amount_min, amount_max = cf_type_info['amount_range']
            
            # Generate base amount (always positive initially)
            base_amount = abs(random.uniform(amount_min, amount_max))
            
            # Apply sign based on type - IMPORTANT: amount in DB should be positive
            # The sign will be handled by normalizeAmountBySubtype in the frontend
            # But for balance calculation in backend, we need correct signs
            if cf_type in ['deposit', 'dividend', 'transfer_in', 'other_positive']:
                amount = round(base_amount, 2)  # Positive
            elif cf_type in ['withdrawal', 'fee', 'transfer_out', 'other_negative']:
                # For negative types, store as positive in DB, but we'll let the frontend normalize
                amount = round(-base_amount, 2)  # Negative (will be stored as abs in DB)
            elif cf_type == 'interest' and cf_type_info.get('can_be_negative', False):
                # Interest can be positive or negative - generate both types
                # Randomly assign positive or negative (about 50/50 split)
                if random.random() < 0.5:
                    amount = round(base_amount, 2)  # Positive
                else:
                    amount = round(-base_amount, 2)  # Negative
            else:  # 'other' and other types
                # Can be positive or negative
                amount = round(random.uniform(amount_min, amount_max), 2)
            
            # Date in the last 90 days
            days_ago = random.randint(0, 90)
            cf_date = date.today() - timedelta(days=days_ago)
            
            # Store amount - for cash_flows, amount should be stored as positive value
            # The type field determines the direction (deposit=positive, withdrawal=negative)
            # But in the DB, we store the absolute value and let the system normalize
            # EXCEPTION: For interest, store with original sign since it can be positive or negative
            db_amount = abs(amount) if cf_type != 'interest' else amount
            
            cash_flow = {
                'trading_account_id': account_id,
                'currency_id': currency_id,
                'type': cf_type,
                'amount': db_amount,  # Store absolute value in DB (except interest - keep sign)
                'date': cf_date.strftime('%Y-%m-%d'),
                'description': cf_type_info['description'],
                'source': 'sample_data',
                'usd_rate': 1.000000
            }
            
            cash_flows.append(cash_flow)
    
    return cash_flows

def add_executions_to_database(executions):
    """Add executions to the database"""
    db_path = get_database_path()
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        for execution in executions:
            cursor.execute("""
                INSERT INTO executions (
                    trading_account_id, ticker_id, action, quantity, price, fee, 
                    date, source, notes, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                execution['trading_account_id'],
                execution['ticker_id'],
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
        print(f"   ✅ Added {len(executions)} executions")
        
    except Exception as e:
        print(f"   ❌ Error adding executions: {e}")
        conn.rollback()
        raise
    finally:
        conn.close()

def add_cash_flows_to_database(cash_flows):
    """Add cash flows to the database"""
    db_path = get_database_path()
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        for cf in cash_flows:
            cursor.execute("""
                INSERT INTO cash_flows (
                    trading_account_id, currency_id, type, amount, date, 
                    description, source, usd_rate, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                cf['trading_account_id'],
                cf['currency_id'],
                cf['type'],
                cf['amount'],
                cf['date'],
                cf['description'],
                cf['source'],
                cf['usd_rate'],
                datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            ))
        
        conn.commit()
        print(f"   ✅ Added {len(cash_flows)} cash flows")
        
    except Exception as e:
        print(f"   ❌ Error adding cash flows: {e}")
        conn.rollback()
        raise
    finally:
        conn.close()

def main():
    """Main function"""
    print("🚀 Starting sample account activity generation...")
    print("=" * 60)
    
    # Get existing data
    accounts = get_existing_accounts()
    tickers = get_existing_tickers()
    currencies = get_existing_currencies()
    
    print(f"📊 Found:")
    print(f"   - {len(accounts)} trading accounts")
    print(f"   - {len(tickers)} tickers")
    print(f"   - {len(currencies)} currencies")
    print()
    
    if not accounts:
        print("❌ No trading accounts found in database. Please create some accounts first.")
        return
    
    if not tickers:
        print("⚠️  No tickers found. Executions will not be added, but cash flows will still be added.")
    
    # Group currencies by ID for quick lookup
    currency_dict = {cid: symbol for cid, symbol in currencies}
    
    # Generate data for each account
    all_executions = []
    all_cash_flows = []
    
    for account_id, account_name, account_currency_id in accounts:
        print(f"📝 Processing account: {account_name} (ID: {account_id})")
        
        # Generate executions
        if tickers:
            executions = generate_sample_executions(account_id, tickers)
            if executions:
                add_executions_to_database(executions)
                all_executions.extend(executions)
        
        # Generate cash flows
        # Use account's currency, or default to currency_id=1 (USD) if not set
        currency_id = account_currency_id if account_currency_id else 1
        cash_flows = generate_sample_cash_flows(account_id, currency_id)
        if cash_flows:
            add_cash_flows_to_database(cash_flows)
            all_cash_flows.extend(cash_flows)
        
        print()
    
    # Show summary
    print("=" * 60)
    print("🎉 Successfully generated sample account activity!")
    print()
    print("📋 Summary:")
    print(f"   - Total executions: {len(all_executions)}")
    print(f"   - Total cash flows: {len(all_cash_flows)}")
    print(f"   - Accounts processed: {len(accounts)}")
    print()
    
    # Show cash flow type breakdown
    if all_cash_flows:
        print("📊 Cash flow types breakdown:")
        cf_types = {}
        for cf in all_cash_flows:
            cf_type = cf['type']
            cf_types[cf_type] = cf_types.get(cf_type, 0) + 1
        
        for cf_type, count in sorted(cf_types.items()):
            print(f"   - {cf_type}: {count} records")
    
    print()
    print("💡 You can now test the account activity system on the trading accounts page.")
    print("   All types of cash flows and executions should be visible.")

if __name__ == "__main__":
    main()

