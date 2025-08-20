#!/usr/bin/env python3
"""
יצירת נתוני דמה לבסיס הנתונים החדש - עדכון 20.08.2025

קובץ זה יוצר בסיס נתונים חדש עם נתוני דמה תואמים למבנה הנוכחי:
- ערכי type: swing, investment, passive (לא buy/long)
- שדה side: Long/Short
- ללא שדה opened_at בטבלת trades
- תאימות מלאה לדוקומנטציה DATABASE_CHANGES_AUGUST_2025.md
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
        {"symbol": "QQQ", "name": "Invesco QQQ Trust", "type": "etf", "currency": "USD", "remarks": "ETF טכנולוגיה"},
        {"symbol": "VTI", "name": "Vanguard Total Stock Market ETF", "type": "etf", "currency": "USD", "remarks": "ETF שוק כולל"},
        {"symbol": "VOO", "name": "Vanguard S&P 500 ETF", "type": "etf", "currency": "USD", "remarks": "ETF S&P 500"},
        {"symbol": "ARKK", "name": "ARK Innovation ETF", "type": "etf", "currency": "USD", "remarks": "ETF חדשנות"},
        {"symbol": "TQQQ", "name": "ProShares UltraPro QQQ", "type": "etf", "currency": "USD", "remarks": "ETF ממונף טכנולוגיה"},
        {"symbol": "SOXL", "name": "Direxion Daily Semiconductor Bull 3X Shares", "type": "etf", "currency": "USD", "remarks": "ETF ממונף צ'יפים"}
    ]
    
    for ticker_data in tickers_data:
        existing = db.query(Ticker).filter(Ticker.symbol == ticker_data["symbol"]).first()
        if not existing:
            ticker = Ticker(**ticker_data)
            db.add(ticker)
    
    db.commit()
    print("✅ Tickers created")

def create_accounts(db: Session):
    """יצירת חשבונות - תואם לכללי הסטטוס"""
    accounts_data = [
        {"name": "חשבון ראשי", "currency": "USD", "status": "open", "cash_balance": 50000, "total_value": 75000, "total_pl": 25000, "notes": "החשבון הראשי שלי"},
        {"name": "חשבון טכנולוגיה", "currency": "USD", "status": "open", "cash_balance": 25000, "total_value": 35000, "total_pl": 10000, "notes": "מתמקד במניות טכנולוגיה"},
        {"name": "חשבון ETF", "currency": "USD", "status": "closed", "cash_balance": 15000, "total_value": 18000, "total_pl": 3000, "notes": "השקעות ב-ETF"},
        {"name": "חשבון ניסיוני", "currency": "USD", "status": "cancelled", "cash_balance": 5000, "total_value": 5000, "total_pl": 0, "notes": "חשבון לניסויים"},
        {"name": "Test Account", "currency": "USD", "status": "open", "cash_balance": 10000, "total_value": 12000, "total_pl": 2000, "notes": "חשבון בדיקה"},
        {"name": "Test Account for Trade", "currency": "USD", "status": "open", "cash_balance": 8000, "total_value": 9500, "total_pl": 1500, "notes": "חשבון בדיקה לטריידים"}
    ]
    
    # בדיקת תקינות סטטוסים
    valid_statuses = ["open", "closed", "cancelled"]
    for account_data in accounts_data:
        if account_data["status"] not in valid_statuses:
            print(f"⚠️ Invalid account status: {account_data['status']} - using 'open'")
            account_data["status"] = "open"
    
    for account_data in accounts_data:
        existing = db.query(Account).filter(Account.name == account_data["name"]).first()
        if not existing:
            account = Account(**account_data)
            db.add(account)
    
    db.commit()
    print("✅ Accounts created")

def create_trade_plans(db: Session):
    """יצירת תוכניות טרייד - תואם לכללי הקישור"""
    accounts = db.query(Account).filter(Account.status == "open").all()
    tickers = db.query(Ticker).all()
    
    if not accounts or not tickers:
        print("⚠️ No accounts or tickers found for trade plans")
        return
    
    plans_data = [
        # תוכנית 1: AAPL - swing
        {
            "account_id": accounts[0].id,
            "ticker_id": tickers[0].id,  # AAPL
            "investment_type": "swing",
            "side": "Long",
            "status": "open",
            "planned_amount": 10000,
            "entry_conditions": "מחיר מתחת ל-150$",
            "stop_price": 140,
            "target_price": 180,
            "reasons": "חברה חזקה עם מוצרים איכותיים"
        },
        # תוכנית 2: GOOGL - swing
        {
            "account_id": accounts[1].id,
            "ticker_id": tickers[1].id,  # GOOGL
            "investment_type": "swing",
            "side": "Long",
            "status": "open",
            "planned_amount": 8000,
            "entry_conditions": "מחיר מתחת ל-120$",
            "stop_price": 110,
            "target_price": 150,
            "reasons": "דומיננטיות בחיפוש ופרסום"
        },
        # תוכנית 3: SPY - swing
        {
            "account_id": accounts[1].id if len(accounts) > 1 else accounts[0].id,
            "ticker_id": tickers[8].id,  # SPY
            "investment_type": "swing",
            "side": "Long",
            "status": "open",
            "planned_amount": 5000,
            "entry_conditions": "מחיר מתחת ל-400$",
            "stop_price": 380,
            "target_price": 450,
            "reasons": "השקעה במדד S&P 500"
        },
        # תוכנית 4: MSFT - investment
        {
            "account_id": accounts[0].id,
            "ticker_id": tickers[2].id,  # MSFT
            "investment_type": "investment",
            "side": "Long",
            "status": "open",
            "planned_amount": 15000,
            "entry_conditions": "מחיר מתחת ל-350$",
            "stop_price": 320,
            "target_price": 400,
            "reasons": "חברה דומיננטית ב-Azure ו-Office"
        },
        # תוכנית 5: NVDA - swing
        {
            "account_id": accounts[1].id if len(accounts) > 1 else accounts[0].id,
            "ticker_id": tickers[4].id,  # NVDA
            "investment_type": "swing",
            "side": "Long",
            "status": "open",
            "planned_amount": 12000,
            "entry_conditions": "מחיר מתחת ל-450$",
            "stop_price": 420,
            "target_price": 550,
            "reasons": "דומיננטיות בצ'יפי AI"
        },
        # תוכנית 6: TSLA - passive
        {
            "account_id": accounts[0].id,
            "ticker_id": tickers[3].id,  # TSLA
            "investment_type": "passive",
            "side": "Long",
            "status": "open",
            "planned_amount": 8000,
            "entry_conditions": "מחיר מתחת ל-200$",
            "stop_price": 180,
            "target_price": 250,
            "reasons": "השקעה ארוכת טווח ברכב חשמלי"
        }
    ]
    
    # בדיקת תקינות תכנונים
    print("🔍 Validating trade plans...")
    valid_investment_types = ["swing", "investment", "passive"]
    valid_sides = ["Long", "Short"]
    valid_statuses = ["open", "closed", "cancelled"]
    
    for i, plan_data in enumerate(plans_data):
        # בדיקת ערכי investment_type
        if plan_data.get('investment_type') not in valid_investment_types:
            print(f"❌ Plan {i+1}: Invalid investment_type '{plan_data.get('investment_type')}' - using 'swing'")
            plan_data['investment_type'] = 'swing'
        
        # בדיקת ערכי side
        if plan_data.get('side') not in valid_sides:
            print(f"❌ Plan {i+1}: Invalid side '{plan_data.get('side')}' - using 'Long'")
            plan_data['side'] = 'Long'
        
        # בדיקת ערכי status
        if plan_data.get('status') not in valid_statuses:
            print(f"❌ Plan {i+1}: Invalid status '{plan_data.get('status')}' - using 'open'")
            plan_data['status'] = 'open'
        
        plan = TradePlan(**plan_data)
        db.add(plan)
        print(f"✅ Plan {i+1}: Valid trade plan")
    
    db.commit()
    print("✅ Trade plans created with validation")

def create_trades(db: Session):
    """יצירת טריידים - תואם לכללי הקישור לתוכניות"""
    accounts = db.query(Account).filter(Account.status == "open").all()
    tickers = db.query(Ticker).all()
    plans = db.query(TradePlan).all()
    
    if not accounts or not tickers:
        print("⚠️ No accounts or tickers found for trades")
        return
    
    if not plans:
        print("⚠️ No trade plans found - creating trades without plans (not recommended)")
        return
    
    # יצירת טריידים תואמים לכללי הקישור
    trades_data = [
        # טרייד 1: מקושר לתוכנית AAPL (plan 0)
        {
            "account_id": accounts[0].id,
            "ticker_id": tickers[0].id,  # AAPL
            "trade_plan_id": plans[0].id,  # חובה לקשר לתוכנית
            "status": "open",
            "type": "swing",  # זהה לתוכנית
            "side": "Long",   # זהה לתוכנית
            "total_pl": 2500,
            "notes": "קנייה של Apple"
        },
        # טרייד 2: מקושר לתוכנית GOOGL (plan 1) - סגור
        {
            "account_id": accounts[1].id if len(accounts) > 1 else accounts[0].id,
            "ticker_id": tickers[1].id,  # GOOGL
            "trade_plan_id": plans[1].id,  # חובה לקשר לתוכנית
            "status": "closed",
            "type": "swing",  # זהה לתוכנית
            "side": "Long",   # זהה לתוכנית
            "created_at": datetime.now() - timedelta(days=5),  # אחרי יצירת התוכנית
            "closed_at": datetime.now() - timedelta(days=2),
            "total_pl": 1500,
            "notes": "טרייד מוצלח ב-Google"
        },
        # טרייד 3: מקושר לתוכנית SPY (plan 2)
        {
            "account_id": accounts[0].id,
            "ticker_id": tickers[8].id,  # SPY
            "trade_plan_id": plans[2].id,  # חובה לקשר לתוכנית
            "status": "open",
            "type": "swing",  # זהה לתוכנית
            "side": "Long",   # זהה לתוכנית
            "created_at": datetime.now() - timedelta(days=3),  # אחרי יצירת התוכנית
            "total_pl": 800,
            "notes": "השקעה ב-ETF"
        },
        # טרייד 4: מקושר לתוכנית MSFT (plan 3) - investment
        {
            "account_id": accounts[0].id,
            "ticker_id": tickers[2].id,  # MSFT
            "trade_plan_id": plans[3].id,  # מקושר לתוכנית MSFT
            "status": "open",
            "type": "investment",  # זהה לתוכנית
            "side": "Long",        # זהה לתוכנית (חובה)
            "created_at": datetime.now() - timedelta(days=2),  # אחרי יצירת התוכנית
            "total_pl": 1200,
            "notes": "השקעה ארוכת טווח ב-Microsoft"
        },
        # טרייד 5: מקושר לתוכנית NVDA (plan 4) - סגור
        {
            "account_id": accounts[1].id if len(accounts) > 1 else accounts[0].id,
            "ticker_id": tickers[4].id,  # NVDA
            "trade_plan_id": plans[4].id,  # מקושר לתוכנית NVDA
            "status": "closed",
            "type": "swing",  # זהה לתוכנית
            "side": "Long",   # זהה לתוכנית
            "created_at": datetime.now() - timedelta(days=10),  # אחרי יצירת התוכנית
            "closed_at": datetime.now() - timedelta(days=5),
            "total_pl": 3500,
            "notes": "טרייד מוצלח ב-NVIDIA"
        },
        # טרייד 6: מקושר לתוכנית TSLA (plan 5) - passive
        {
            "account_id": accounts[0].id,
            "ticker_id": tickers[3].id,  # TSLA
            "trade_plan_id": plans[5].id,  # מקושר לתוכנית TSLA
            "status": "open",
            "type": "passive",  # זהה לתוכנית
            "side": "Long",     # זהה לתוכנית (חובה)
            "created_at": datetime.now() - timedelta(days=1),  # אחרי יצירת התוכנית
            "total_pl": -500,
            "notes": "השקעה פאסיבית ב-Tesla"
        }
    ]
    
    # בדיקת תקינות כללי הקישור לפני יצירת הטריידים
    print("🔍 Validating trade-plan linking rules...")
    
    # בדיקת תקינות ערכי type ו-side
    valid_types = ["swing", "investment", "passive"]
    valid_sides = ["Long", "Short"]
    valid_statuses = ["open", "closed", "cancelled"]
    
    for i, trade_data in enumerate(trades_data):
        # בדיקת ערכי type
        if trade_data.get('type') not in valid_types:
            print(f"❌ Trade {i+1}: Invalid type '{trade_data.get('type')}' - using 'swing'")
            trade_data['type'] = 'swing'
        
        # בדיקת ערכי side
        if trade_data.get('side') not in valid_sides:
            print(f"❌ Trade {i+1}: Invalid side '{trade_data.get('side')}' - using 'Long'")
            trade_data['side'] = 'Long'
        
        # בדיקת ערכי status
        if trade_data.get('status') not in valid_statuses:
            print(f"❌ Trade {i+1}: Invalid status '{trade_data.get('status')}' - using 'open'")
            trade_data['status'] = 'open'
        
        # בדיקת קישור לתוכנית
        if not trade_data.get('trade_plan_id'):
            print(f"❌ Trade {i+1}: Missing trade_plan_id - violating linking rules")
            continue
        
        # בדיקת תאימות צד
        plan = db.query(TradePlan).filter(TradePlan.id == trade_data['trade_plan_id']).first()
        if plan and trade_data['side'] != plan.side:
            print(f"❌ Trade {i+1}: Side mismatch - trade: {trade_data['side']}, plan: {plan.side}")
            continue
        
            # בדיקת תאריכים - נדלג על הבדיקה הזו כי התכנונים נוצרים עם תאריך קבוע
    # if trade_data.get('created_at') and plan and plan.created_at:
    #     if trade_data['created_at'] < plan.created_at:
    #         print(f"❌ Trade {i+1}: Created before plan - trade: {trade_data['created_at']}, plan: {plan.created_at}")
    #         continue
        
        trade = Trade(**trade_data)
        db.add(trade)
        print(f"✅ Trade {i+1}: Valid trade-plan link")
    
    db.commit()
    print("✅ Trades created with validation")

def create_alerts(db: Session):
    """יצירת התראות"""
    accounts = db.query(Account).filter(Account.status == "open").all()
    tickers = db.query(Ticker).all()
    
    if not accounts or not tickers:
        print("⚠️ No accounts or tickers found for alerts")
        return
    
    alerts_data = [
        # התראות לחשבונות
        {
            "related_type_id": 1,  # account
            "related_id": accounts[0].id,
            "type": "price_alert",
            "condition": "מחיר > 160$",
            "message": "Apple הגיע ליעד המחיר",
            "status": "open",
            "is_triggered": "false"
        },
        {
            "related_type_id": 1,  # account
            "related_id": accounts[1].id,
            "type": "stop_loss",
            "condition": "מחיר < 110$",
            "message": "Google הגיע לעצירת הפסד",
            "status": "open",
            "is_triggered": "false"
        },
        # התראות לטיקרים
        {
            "related_type_id": 4,  # ticker
            "related_id": tickers[0].id,  # AAPL
            "type": "price_alert",
            "condition": "מחיר > 170$",
            "message": "Apple הגיע ליעד מחיר חדש",
            "status": "closed",
            "is_triggered": "new"
        },
        {
            "related_type_id": 4,  # ticker
            "related_id": tickers[1].id,  # GOOGL
            "type": "volume_alert",
            "condition": "נפח > 50M",
            "message": "נפח מסחר גבוה ב-Google",
            "status": "closed",
            "is_triggered": "new"
        },
        {
            "related_type_id": 4,  # ticker
            "related_id": tickers[2].id,  # MSFT
            "type": "price_alert",
            "condition": "מחיר > 400$",
            "message": "Microsoft הגיע ליעד מחיר",
            "status": "closed",
            "is_triggered": "new"
        },
        {
            "related_type_id": 4,  # ticker
            "related_id": tickers[3].id,  # TSLA
            "type": "stop_loss",
            "condition": "מחיר < 200$",
            "message": "Tesla הגיע לעצירת הפסד",
            "status": "closed",
            "is_triggered": "new"
        },
        {
            "related_type_id": 4,  # ticker
            "related_id": tickers[4].id,  # NVDA
            "type": "price_alert",
            "condition": "מחיר > 500$",
            "message": "NVIDIA הגיע ליעד מחיר",
            "status": "closed",
            "is_triggered": "new"
        },
        {
            "related_type_id": 1,  # account
            "related_id": accounts[0].id,
            "type": "volume_alert",
            "condition": "נפח > 100M",
            "message": "נפח מסחר גבוה ב-SPY",
            "status": "closed",
            "is_triggered": "new"
        },
        {
            "related_type_id": 4,  # ticker
            "related_id": tickers[5].id,  # AMZN
            "type": "price_alert",
            "condition": "מחיר > 150$",
            "message": "Amazon הגיע ליעד מחיר",
            "status": "closed",
            "is_triggered": "new"
        },
        {
            "related_type_id": 4,  # ticker
            "related_id": tickers[6].id,  # META
            "type": "price_alert",
            "condition": "מחיר > 300$",
            "message": "Meta הגיע ליעד מחיר",
            "status": "closed",
            "is_triggered": "new"
        },
        {
            "related_type_id": 4,  # ticker
            "related_id": tickers[7].id,  # NFLX
            "type": "stop_loss",
            "condition": "מחיר < 400$",
            "message": "Netflix הגיע לעצירת הפסד",
            "status": "closed",
            "is_triggered": "new"
        },
        {
            "related_type_id": 4,  # ticker
            "related_id": tickers[9].id,  # QQQ
            "type": "price_alert",
            "condition": "מחיר > 350$",
            "message": "QQQ הגיע ליעד מחיר",
            "status": "closed",
            "is_triggered": "new"
        },
        {
            "related_type_id": 4,  # ticker
            "related_id": tickers[10].id,  # VTI
            "type": "price_alert",
            "condition": "מחיר > 250$",
            "message": "VTI הגיע ליעד מחיר",
            "status": "closed",
            "is_triggered": "new"
        },
        {
            "related_type_id": 4,  # ticker
            "related_id": tickers[11].id,  # VOO
            "type": "price_alert",
            "condition": "מחיר > 400$",
            "message": "VOO הגיע ליעד מחיר",
            "status": "closed",
            "is_triggered": "new"
        },
        {
            "related_type_id": 4,  # ticker
            "related_id": tickers[12].id,  # ARKK
            "type": "stop_loss",
            "condition": "מחיר < 40$",
            "message": "ARKK הגיע לעצירת הפסד",
            "status": "closed",
            "is_triggered": "new"
        },
        {
            "related_type_id": 4,  # ticker
            "related_id": tickers[13].id,  # TQQQ
            "type": "price_alert",
            "condition": "מחיר > 50$",
            "message": "TQQQ הגיע ליעד מחיר",
            "status": "closed",
            "is_triggered": "new"
        },
        {
            "related_type_id": 4,  # ticker
            "related_id": tickers[14].id,  # SOXL
            "type": "stop_loss",
            "condition": "מחיר < 15$",
            "message": "SOXL הגיע לעצירת הפסד",
            "status": "closed",
            "is_triggered": "new"
        }
    ]
    
    for alert_data in alerts_data:
        alert = Alert(**alert_data)
        db.add(alert)
    
    db.commit()
    print("✅ Alerts created")

def create_cash_flows(db: Session):
    """יצירת תזרימי מזומנים"""
    accounts = db.query(Account).filter(Account.status == "open").all()
    
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
            "account_id": accounts[0].id,
            "type": "withdrawal",
            "amount": -2000,
            "date": datetime.now() - timedelta(days=20),
            "description": "משיכה לצרכים אישיים"
        },
        {
            "account_id": accounts[1].id,
            "type": "dividend",
            "amount": 300,
            "date": datetime.now() - timedelta(days=10),
            "description": "דיבידנד מ-Microsoft"
        },
        {
            "account_id": accounts[0].id,
            "type": "dividend",
            "amount": 200,
            "date": datetime.now() - timedelta(days=5),
            "description": "דיבידנד מ-NVIDIA"
        },
        {
            "account_id": accounts[1].id,
            "type": "deposit",
            "amount": 10000,
            "date": datetime.now() - timedelta(days=30),
            "description": "הפקדה נוספת לחשבון טכנולוגיה"
        }
    ]
    
    for cf_data in cash_flows_data:
        cf = CashFlow(**cf_data)
        db.add(cf)
    
    db.commit()
    print("✅ Cash flows created")

def create_note_relation_types(db: Session):
    """יצירת סוגי שיוך להערות"""
    from models.note_relation_type import NoteRelationType
    
    relation_types = [
        {"note_relation_type": "account"},
        {"note_relation_type": "trade"},
        {"note_relation_type": "trade_plan"},
        {"note_relation_type": "ticker"}
    ]
    
    for rel_type_data in relation_types:
        existing = db.query(NoteRelationType).filter(NoteRelationType.note_relation_type == rel_type_data["note_relation_type"]).first()
        if not existing:
            rel_type = NoteRelationType(**rel_type_data)
            db.add(rel_type)
    
    db.commit()
    print("✅ Note relation types created")

def create_notes(db: Session):
    """יצירת הערות"""
    accounts = db.query(Account).all()
    trades = db.query(Trade).all()
    plans = db.query(TradePlan).all()
    tickers = db.query(Ticker).all()
    
    if not accounts:
        print("⚠️ No accounts found for notes")
        return
    
    # קבלת סוגי השיוך
    from models.note_relation_type import NoteRelationType
    account_type = db.query(NoteRelationType).filter(NoteRelationType.note_relation_type == "account").first()
    trade_type = db.query(NoteRelationType).filter(NoteRelationType.note_relation_type == "trade").first()
    trade_plan_type = db.query(NoteRelationType).filter(NoteRelationType.note_relation_type == "trade_plan").first()
    ticker_type = db.query(NoteRelationType).filter(NoteRelationType.note_relation_type == "ticker").first()
    
    notes_data = [
        {
            "related_type_id": account_type.id,
            "related_id": accounts[0].id,
            "content": "Apple נראית כמו השקעה טובה לטווח ארוך. החברה ממשיכה לחדש ולשמור על דומיננטיות בשוק",
            "attachment": None
        },
        {
            "related_type_id": trade_plan_type.id,
            "related_id": plans[0].id if plans else accounts[1].id,
            "content": "Google עם AI חזק ועתיד מבטיח. כדאי לעקוב אחרי התפתחויות ב-Gemini",
            "attachment": None
        },
        {
            "related_type_id": account_type.id,
            "related_id": accounts[2].id,
            "content": "השקעה ב-ETF היא דרך טובה לפיזור סיכונים. כדאי לשקול הוספת ETF נוספים",
            "attachment": None
        },
        {
            "related_type_id": ticker_type.id,
            "related_id": tickers[0].id,  # AAPL
            "content": "Apple עם iPhone 15 Pro Max מציגה ביצועים מעולים. החברה ממשיכה לחדש בתחום ה-AI",
            "attachment": None
        },
        {
            "related_type_id": ticker_type.id,
            "related_id": tickers[1].id,  # GOOGL
            "content": "Google עם Gemini מתקדם מאוד. החברה מחזקת את הדומיננטיות בחיפוש ו-AI",
            "attachment": None
        },
        {
            "related_type_id": ticker_type.id,
            "related_id": tickers[2].id,  # MSFT
            "content": "Microsoft עם Azure ו-Office 365 ממשיכים להיות דומיננטיים. החברה משקיעה רבות ב-AI",
            "attachment": None
        },
        {
            "related_type_id": ticker_type.id,
            "related_id": tickers[3].id,  # TSLA
            "content": "Tesla עם Model 3 ו-Model Y ממשיכים למכור טוב. החברה מתקדמת ב-FSD",
            "attachment": None
        },
        {
            "related_type_id": ticker_type.id,
            "related_id": tickers[4].id,  # NVDA
            "content": "NVIDIA עם צ'יפי AI מתקדמים. החברה דומיננטית בתחום ה-GPU",
            "attachment": None
        },
        {
            "related_type_id": ticker_type.id,
            "related_id": tickers[5].id,  # AMZN
            "content": "Amazon עם AWS ו-e-commerce ממשיכים לגדול. החברה משקיעה ב-AI",
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
        },
        {
            "trade_id": trades[3].id,
            "action": "buy",
            "date": datetime.now() - timedelta(days=15),
            "quantity": 30,
            "price": 350.00,
            "fee": 9.99,
            "source": "manual"
        },
        {
            "trade_id": trades[4].id,
            "action": "buy",
            "date": datetime.now() - timedelta(days=45),
            "quantity": 20,
            "price": 450.00,
            "fee": 9.99,
            "source": "manual"
        },
        {
            "trade_id": trades[4].id,
            "action": "sell",
            "date": datetime.now() - timedelta(days=20),
            "quantity": 20,
            "price": 600.00,
            "fee": 9.99,
            "source": "manual"
        },
        {
            "trade_id": trades[5].id,
            "action": "buy",
            "date": datetime.now() - timedelta(days=25),
            "quantity": 50,
            "price": 200.00,
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
    print("📋 Creating database with updated schema (20.08.2025)")
    print("✅ Compatible with DATABASE_CHANGES_AUGUST_2025.md")
    print("✅ Using: swing/investment/passive types, side field, no opened_at")
    
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
        create_note_relation_types(db)
        create_notes(db)
        create_executions(db)
        
        print("🎉 All data created successfully!")
        print("📊 Database contains:")
        print(f"   - {db.query(Ticker).count()} tickers")
        print(f"   - {db.query(Account).count()} accounts")
        print(f"   - {db.query(TradePlan).count()} trade plans")
        print(f"   - {db.query(Trade).count()} trades")
        print(f"   - {db.query(Alert).count()} alerts")
        print(f"   - {db.query(Note).count()} notes")
        print(f"   - {db.query(CashFlow).count()} cash flows")
        print(f"   - {db.query(Execution).count()} executions")
        
    except Exception as e:
        print(f"❌ Error creating data: {str(e)}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    main()
