#!/usr/bin/env python3
"""
Script to add diverse trade plans to the database
Contains plans with:
- Various dates (for date filtering)
- Various types (swing, investment, passive)
- Various sides (Long, Short)
- Various statuses (open, closed, cancelled)
- Old and new plans
"""

import sqlite3
from datetime import datetime, timedelta
import random

def add_diverse_trade_plans():
    # Database connection
    conn = sqlite3.connect('Backend/db/simpleTrade_new.db')
    cursor = conn.cursor()
    
    # Ticker data (only real tickers, not TEST)
    tickers = [
        (1, 'AAPL'), (2, 'GOOGL'), (3, 'MSFT'), (4, 'TSLA'), 
        (5, 'NVDA'), (6, 'AMZN'), (7, 'META'), (8, 'NFLX'),
        (9, 'SPY'), (10, 'QQQ')
    ]
    
    # Account data
    accounts = [
        (1, 'Main Account'), (2, 'Technology Account'), 
        (3, 'ETF Account'), (4, 'Experimental Account')
    ]
    
    # Investment types
    investment_types = ['swing', 'investment', 'passive']
    
    # Sides
    sides = ['Long', 'Short']
    
    # Statuses
    statuses = ['open', 'closed', 'cancelled']
    
    # Prepare diverse plans
    trade_plans = []
    
    # Very old plans (6 months ago)
    old_date = datetime.now() - timedelta(days=180)
    
    # Very old plan - closed
    trade_plans.append({
        'account_id': 1,
        'ticker_id': 1,  # AAPL
        'investment_type': 'investment',
        'side': 'Long',
        'status': 'closed',
        'planned_amount': 15000.0,
        'entry_conditions': 'Buy below $150',
        'stop_price': 140.0,
        'target_price': 200.0,
        'reasons': 'Strong company with quality products',
        'created_at': old_date.strftime('%Y-%m-%d %H:%M:%S'),
        'canceled_at': None,
        'cancel_reason': None
    })
    
    # Very old plan - cancelled
    trade_plans.append({
        'account_id': 2,
        'ticker_id': 2,  # GOOGL
        'investment_type': 'swing',
        'side': 'Short',
        'status': 'cancelled',
        'planned_amount': 8000.0,
        'entry_conditions': 'Sell above $2800',
        'stop_price': 2900.0,
        'target_price': 2600.0,
        'reasons': 'High market volatility',
        'created_at': old_date.strftime('%Y-%m-%d %H:%M:%S'),
        'canceled_at': (old_date + timedelta(days=30)).strftime('%Y-%m-%d %H:%M:%S'),
        'cancel_reason': 'Market conditions changed'
    })
    
    # Old plans (3 months ago)
    medium_old_date = datetime.now() - timedelta(days=90)
    
    # Old plan - closed
    trade_plans.append({
        'account_id': 3,
        'ticker_id': 9,  # SPY
        'investment_type': 'passive',
        'side': 'Long',
        'status': 'closed',
        'planned_amount': 20000.0,
        'entry_conditions': 'Buy below $400',
        'stop_price': 380.0,
        'target_price': 450.0,
        'reasons': 'Passive investment in S&P 500',
        'created_at': medium_old_date.strftime('%Y-%m-%d %H:%M:%S'),
        'canceled_at': None,
        'cancel_reason': None
    })
    
    # Old plan - cancelled
    trade_plans.append({
        'account_id': 1,
        'ticker_id': 4,  # TSLA
        'investment_type': 'swing',
        'side': 'Long',
        'status': 'cancelled',
        'planned_amount': 12000.0,
        'entry_conditions': 'Buy below $200',
        'stop_price': 180.0,
        'target_price': 250.0,
        'reasons': 'Advanced technology',
        'created_at': medium_old_date.strftime('%Y-%m-%d %H:%M:%S'),
        'canceled_at': (medium_old_date + timedelta(days=45)).strftime('%Y-%m-%d %H:%M:%S'),
        'cancel_reason': 'Too high volatility'
    })
    
    # Recent plans (last month)
    recent_date = datetime.now() - timedelta(days=30)
    
    # Recent plan - open
    trade_plans.append({
        'account_id': 2,
        'ticker_id': 5,  # NVDA
        'investment_type': 'investment',
        'side': 'Long',
        'status': 'open',
        'planned_amount': 25000.0,
        'entry_conditions': 'Buy below $800',
        'stop_price': 750.0,
        'target_price': 1000.0,
        'reasons': 'AI and advanced technology',
        'created_at': recent_date.strftime('%Y-%m-%d %H:%M:%S'),
        'canceled_at': None,
        'cancel_reason': None
    })
    
    # Recent plan - open
    trade_plans.append({
        'account_id': 3,
        'ticker_id': 10,  # QQQ
        'investment_type': 'passive',
        'side': 'Long',
        'status': 'open',
        'planned_amount': 18000.0,
        'entry_conditions': 'Buy below $350',
        'stop_price': 330.0,
        'target_price': 400.0,
        'reasons': 'Technology ETF',
        'created_at': recent_date.strftime('%Y-%m-%d %H:%M:%S'),
        'canceled_at': None,
        'cancel_reason': None
    })
    
    # Plans from last week
    week_ago = datetime.now() - timedelta(days=7)
    
    # Plan from last week - open
    trade_plans.append({
        'account_id': 1,
        'ticker_id': 6,  # AMZN
        'investment_type': 'swing',
        'side': 'Short',
        'status': 'open',
        'planned_amount': 15000.0,
        'entry_conditions': 'Sell above $180',
        'stop_price': 190.0,
        'target_price': 160.0,
        'reasons': 'Expected technical correction',
        'created_at': week_ago.strftime('%Y-%m-%d %H:%M:%S'),
        'canceled_at': None,
        'cancel_reason': None
    })
    
    # Plan from last week - open
    trade_plans.append({
        'account_id': 4,
        'ticker_id': 7,  # META
        'investment_type': 'investment',
        'side': 'Long',
        'status': 'open',
        'planned_amount': 22000.0,
        'entry_conditions': 'Buy below $300',
        'stop_price': 280.0,
        'target_price': 350.0,
        'reasons': 'Social media and advertising',
        'created_at': week_ago.strftime('%Y-%m-%d %H:%M:%S'),
        'canceled_at': None,
        'cancel_reason': None
    })
    
    # Plans from today
    today = datetime.now()
    
    # Plan from today - open
    trade_plans.append({
        'account_id': 2,
        'ticker_id': 8,  # NFLX
        'investment_type': 'swing',
        'side': 'Short',
        'status': 'open',
        'planned_amount': 10000.0,
        'entry_conditions': 'Sell above $600',
        'stop_price': 620.0,
        'target_price': 550.0,
        'reasons': 'Competition in streaming market',
        'created_at': today.strftime('%Y-%m-%d %H:%M:%S'),
        'canceled_at': None,
        'cancel_reason': None
    })
    
    # Plan from today - open
    trade_plans.append({
        'account_id': 3,
        'ticker_id': 3,  # MSFT
        'investment_type': 'passive',
        'side': 'Long',
        'status': 'open',
        'planned_amount': 30000.0,
        'entry_conditions': 'Buy below $400',
        'stop_price': 380.0,
        'target_price': 450.0,
        'reasons': 'Stable company with consistent revenue',
        'created_at': today.strftime('%Y-%m-%d %H:%M:%S'),
        'canceled_at': None,
        'cancel_reason': None
    })
    
    # Add plans to database
    for plan in trade_plans:
        cursor.execute('''
            INSERT INTO trade_plans (
                account_id, ticker_id, investment_type, side, status,
                planned_amount, entry_conditions, stop_price, target_price,
                reasons, created_at, canceled_at, cancel_reason
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            plan['account_id'], plan['ticker_id'], plan['investment_type'],
            plan['side'], plan['status'], plan['planned_amount'],
            plan['entry_conditions'], plan['stop_price'], plan['target_price'],
            plan['reasons'], plan['created_at'], plan['canceled_at'],
            plan['cancel_reason']
        ))
    
    # Save changes
    conn.commit()
    
    # Print summary
    print(f"✅ Added {len(trade_plans)} new plans to database")
    print("\n📊 Summary of added plans:")
    
    for i, plan in enumerate(trade_plans, 1):
        ticker_symbol = next((t[1] for t in tickers if t[0] == plan['ticker_id']), 'Unknown')
        account_name = next((a[1] for a in accounts if a[0] == plan['account_id']), 'Unknown')
        
        print(f"{i}. {ticker_symbol} - {plan['investment_type']} - {plan['side']} - {plan['status']}")
        print(f"   Account: {account_name}, Amount: ${plan['planned_amount']:,.0f}")
        print(f"   Date: {plan['created_at']}")
        print()
    
    # Close connection
    conn.close()
    
    print("🎉 Adding plans completed successfully!")

if __name__ == "__main__":
    add_diverse_trade_plans()
