#!/usr/bin/env python3
"""
יצירת נתוני דמה לבסיס הנתונים החדש
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from config.database import SessionLocal, init_db
from models import (
    Ticker, Account, Trade, TradePlan, 
    Alert, CashFlow, Note, Execution
)
from datetime import datetime, timedelta
import random

# Authentication system removed for simplicity

def create_tickers(db: Session):
    """יצירת טיקרים"""
    tickers_data = [
        {"symbol": "AAPL", "name": "Apple Inc.", "type": "stock", "currency": "USD", "remarks": "טכנולוגיה"},
        {"symbol": "GOOGL", "name": "Alphabet Inc.", "type": "stock", "currency": "USD", "remarks": "טכנולוגיה"},
        {"symbol": "MSFT", "name": "Microsoft Corporation", "type": "stock", "currency": "USD", "remarks": "טכנולוגיה"},
        {"symbol": "TSLA", "name": "Tesla Inc.", "type": "stock", "currency": "USD", "remarks": "רכב חשמלי"},
        {"symbol": "NVDA", "name": "NVIDIA Corporation", "type": "stock", "currency": "USD", "remarks": "צ'יפים"},
        {"symbol": "AMZN", "name": "Amazon.com Inc.", "type": "stock", "currency": "USD", "remarks": "מסחר אלקטרוני"},
        {"symbol": "META", "name": "Meta Platforms Inc.", "type": "stock", "currency": "USD", "remarks": "מדיה חברתית"},
        {"symbol": "NFLX", "name": "Netflix Inc.", "type": "stock", "currency": "USD", "remarks": "סטרימינג"},
        {"symbol": "SPY", "name": "SPDR S&P 500 ETF", "type": "etf", "currency": "USD", "remarks": "ETF מדד S&P 500"},
        {"symbol": "QQQ", "name": "Invesco QQQ Trust", "type": "etf", "currency": "USD", "remarks": "ETF טכנולוגיה"}
    ]
    
    for ticker_data in tickers_data:
        existing = db.query(Ticker).filter(Ticker.symbol == ticker_data["symbol"]).first()
        if not existing:
            ticker = Ticker(**ticker_data)
            db.add(ticker)
    
    db.commit()
    print("✅ Tickers created")

def create_accounts(db: Session):
    """יצירת חשבונות"""
    accounts_data = [
        {"name": "חשבון ראשי", "currency": "USD", "status": "active", "cash_balance": 50000, "total_value": 75000, "total_pl": 25000, "notes": "החשבון הראשי שלי"},
        {"name": "חשבון טכנולוגיה", "currency": "USD", "status": "active", "cash_balance": 25000, "total_value": 35000, "total_pl": 10000, "notes": "מתמקד במניות טכנולוגיה"},
        {"name": "חשבון ETF", "currency": "USD", "status": "active", "cash_balance": 15000, "total_value": 18000, "total_pl": 3000, "notes": "השקעות ב-ETF"},
        {"name": "חשבון ניסיוני", "currency": "USD", "status": "inactive", "cash_balance": 5000, "total_value": 5000, "total_pl": 0, "notes": "חשבון לניסויים"}
    ]
    
    for account_data in accounts_data:
        existing = db.query(Account).filter(Account.name == account_data["name"]).first()
        if not existing:
            account = Account(**account_data)
            db.add(account)
    
    db.commit()
    print("✅ Accounts created")

def create_trade_plans(db: Session):
    """יצירת תוכניות טרייד"""
    accounts = db.query(Account).filter(Account.status == "active").all()
    tickers = db.query(Ticker).all()
    
    if not accounts or not tickers:
        print("⚠️ No accounts or tickers found for trade plans")
        return
    
    plans_data = [
        {
            "account_id": accounts[0].id,
            "ticker_id": tickers[0].id,  # AAPL
            "investment_type": "long",
            "planned_amount": 10000,
            "entry_conditions": "מחיר מתחת ל-150$",
            "stop_price": 140,
            "target_price": 180,
            "reasons": "חברה חזקה עם מוצרים איכותיים"
        },
        {
            "account_id": accounts[1].id,
            "ticker_id": tickers[1].id,  # GOOGL
            "investment_type": "long",
            "planned_amount": 8000,
            "entry_conditions": "מחיר מתחת ל-120$",
            "stop_price": 110,
            "target_price": 150,
            "reasons": "דומיננטיות בחיפוש ופרסום"
        },
        {
            "account_id": accounts[2].id,
            "ticker_id": tickers[8].id,  # SPY
            "investment_type": "long",
            "planned_amount": 5000,
            "entry_conditions": "מחיר מתחת ל-400$",
            "stop_price": 380,
            "target_price": 450,
            "reasons": "השקעה במדד S&P 500"
        }
    ]
    
    for plan_data in plans_data:
        plan = TradePlan(**plan_data)
        db.add(plan)
    
    db.commit()
    print("✅ Trade plans created")

def create_trades(db: Session):
    """יצירת טריידים"""
    accounts = db.query(Account).filter(Account.status == "active").all()
    tickers = db.query(Ticker).all()
    plans = db.query(TradePlan).all()
    
    if not accounts or not tickers:
        print("⚠️ No accounts or tickers found for trades")
        return
    
    trades_data = [
        {
            "account_id": accounts[0].id,
            "ticker_id": tickers[0].id,  # AAPL
            "trade_plan_id": plans[0].id if plans else None,
            "status": "open",
            "type": "buy",
            "opened_at": datetime.now() - timedelta(days=5),
            "total_pl": 2500,
            "notes": "קנייה של Apple"
        },
        {
            "account_id": accounts[1].id,
            "ticker_id": tickers[1].id,  # GOOGL
            "status": "closed",
            "type": "buy",
            "opened_at": datetime.now() - timedelta(days=30),
            "closed_at": datetime.now() - timedelta(days=5),
            "total_pl": 1500,
            "notes": "טרייד מוצלח ב-Google"
        },
        {
            "account_id": accounts[2].id,
            "ticker_id": tickers[8].id,  # SPY
            "status": "open",
            "type": "buy",
            "opened_at": datetime.now() - timedelta(days=10),
            "total_pl": 800,
            "notes": "השקעה ב-ETF"
        }
    ]
    
    for trade_data in trades_data:
        trade = Trade(**trade_data)
        db.add(trade)
    
    db.commit()
    print("✅ Trades created")

def create_alerts(db: Session):
    """יצירת התראות"""
    accounts = db.query(Account).filter(Account.status == "active").all()
    tickers = db.query(Ticker).all()
    
    if not accounts or not tickers:
        print("⚠️ No accounts or tickers found for alerts")
        return
    
    alerts_data = [
        {
            "account_id": accounts[0].id,
            "ticker_id": tickers[0].id,  # AAPL
            "type": "price_alert",
            "condition": "מחיר > 160$",
            "message": "Apple הגיע ליעד המחיר",
            "is_active": True
        },
        {
            "account_id": accounts[1].id,
            "ticker_id": tickers[1].id,  # GOOGL
            "type": "stop_loss",
            "condition": "מחיר < 110$",
            "message": "Google הגיע לעצירת הפסד",
            "is_active": True
        },
        {
            "account_id": accounts[2].id,
            "ticker_id": tickers[8].id,  # SPY
            "type": "volume_alert",
            "condition": "נפח > 100M",
            "message": "נפח מסחר גבוה ב-SPY",
            "is_active": False
        }
    ]
    
    for alert_data in alerts_data:
        alert = Alert(**alert_data)
        db.add(alert)
    
    db.commit()
    print("✅ Alerts created")

def create_cash_flows(db: Session):
    """יצירת תזרימי מזומנים"""
    accounts = db.query(Account).filter(Account.status == "active").all()
    
    if not accounts:
        print("⚠️ No accounts found for cash flows")
        return
    
    cash_flows_data = [
        {
            "account_id": accounts[0].id,
            "type": "deposit",
            "amount": 50000,
            "date": datetime.now() - timedelta(days=60),
            "description": "הפקדה ראשונית"
        },
        {
            "account_id": accounts[0].id,
            "type": "dividend",
            "amount": 500,
            "date": datetime.now() - timedelta(days=15),
            "description": "דיבידנד מ-Apple"
        },
        {
            "account_id": accounts[1].id,
            "type": "deposit",
            "amount": 25000,
            "date": datetime.now() - timedelta(days=45),
            "description": "הפקדה לחשבון טכנולוגיה"
        },
        {
            "account_id": accounts[2].id,
            "type": "withdrawal",
            "amount": -2000,
            "date": datetime.now() - timedelta(days=20),
            "description": "משיכה לצרכים אישיים"
        }
    ]
    
    for cf_data in cash_flows_data:
        cf = CashFlow(**cf_data)
        db.add(cf)
    
    db.commit()
    print("✅ Cash flows created")

def create_notes(db: Session):
    """יצירת הערות"""
    accounts = db.query(Account).all()
    trades = db.query(Trade).all()
    plans = db.query(TradePlan).all()
    
    if not accounts:
        print("⚠️ No accounts found for notes")
        return
    
    notes_data = [
        {
            "account_id": accounts[0].id,
            "trade_id": trades[0].id if trades else None,
            "content": "Apple נראית כמו השקעה טובה לטווח ארוך. החברה ממשיכה לחדש ולשמור על דומיננטיות בשוק",
            "attachment": None
        },
        {
            "account_id": accounts[1].id,
            "trade_plan_id": plans[0].id if plans else None,
            "content": "Google עם AI חזק ועתיד מבטיח. כדאי לעקוב אחרי התפתחויות ב-Gemini",
            "attachment": None
        },
        {
            "account_id": accounts[2].id,
            "content": "השקעה ב-ETF היא דרך טובה לפיזור סיכונים. כדאי לשקול הוספת ETF נוספים",
            "attachment": None
        }
    ]
    
    for note_data in notes_data:
        note = Note(**note_data)
        db.add(note)
    
    db.commit()
    print("✅ Notes created")

def create_executions(db: Session):
    """יצירת ביצועים"""
    trades = db.query(Trade).all()
    
    if not trades:
        print("⚠️ No trades found for executions")
        return
    
    executions_data = [
        {
            "trade_id": trades[0].id,
            "action": "buy",
            "date": datetime.now() - timedelta(days=5),
            "quantity": 100,
            "price": 155.50,
            "fee": 9.99,
            "source": "manual"
        },
        {
            "trade_id": trades[1].id,
            "action": "buy",
            "date": datetime.now() - timedelta(days=30),
            "quantity": 50,
            "price": 120.00,
            "fee": 9.99,
            "source": "manual"
        },
        {
            "trade_id": trades[1].id,
            "action": "sell",
            "date": datetime.now() - timedelta(days=5),
            "quantity": 50,
            "price": 150.00,
            "fee": 9.99,
            "source": "manual"
        },
        {
            "trade_id": trades[2].id,
            "action": "buy",
            "date": datetime.now() - timedelta(days=10),
            "quantity": 25,
            "price": 400.00,
            "fee": 9.99,
            "source": "manual"
        }
    ]
    
    for exec_data in executions_data:
        execution = Execution(**exec_data)
        db.add(execution)
    
    db.commit()
    print("✅ Executions created")

def main():
    """פונקציה ראשית"""
    print("🚀 Starting data creation...")
    
    # יצירת בסיס הנתונים
    init_db()
    
    # יצירת session
    db = SessionLocal()
    
    try:
        # יצירת נתונים בסדר הנכון
        create_tickers(db)
        create_accounts(db)
        create_trade_plans(db)
        create_trades(db)
        create_alerts(db)
        create_cash_flows(db)
        create_notes(db)
        create_executions(db)
        
        print("🎉 All data created successfully!")
        
    except Exception as e:
        print(f"❌ Error creating data: {str(e)}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    main()
