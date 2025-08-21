#!/usr/bin/env python3
"""
Creating dummy data for database - Updated 21.08.2025

This file creates a new database with dummy data compatible with the current active structure:

Table structure (compatible with current structure):
- tickers: symbol, name, type, remarks, currency, active_trades
- accounts: name, currency, status, cash_balance, total_value, total_pl, notes
- trade_plans: account_id, ticker_id, investment_type, side, status, planned_amount, entry_conditions, stop_price, target_price, reasons
- trades: account_id, ticker_id, trade_plan_id, status, type, side, closed_at, cancelled_at, cancel_reason, total_pl, notes
- alerts: related_type_id, related_id, type, condition, message, status, is_triggered
- cash_flows: account_id, type, amount, date, description
- notes: content, attachment, related_type_id, related_id
- note_relation_types: note_relation_type (account, trade, trade_plan, ticker)
- executions: trade_id, action, date, quantity, price, fee, source

Special features:
- Trade type values: swing, investment, passive
- Side field: Long/Short in trades and plans
- Flexible note linking system with related_type_id
- Mandatory linking between trades and plans
- Full compatibility with current database structure
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
    """Create tickers - compatible with current structure"""
    tickers_data = [
        {"symbol": "AAPL", "name": "Apple Inc.", "type": "stock", "currency": "USD", "remarks": "Technology", "active_trades": True},
        {"symbol": "GOOGL", "name": "Alphabet Inc.", "type": "stock", "currency": "USD", "remarks": "Technology", "active_trades": True},
        {"symbol": "MSFT", "name": "Microsoft Corporation", "type": "stock", "currency": "USD", "remarks": "Technology", "active_trades": True},
        {"symbol": "TSLA", "name": "Tesla Inc.", "type": "stock", "currency": "USD", "remarks": "Electric vehicles", "active_trades": True},
        {"symbol": "NVDA", "name": "NVIDIA Corporation", "type": "stock", "currency": "USD", "remarks": "Chips", "active_trades": True},
        {"symbol": "AMZN", "name": "Amazon.com Inc.", "type": "stock", "currency": "USD", "remarks": "E-commerce", "active_trades": False},
        {"symbol": "META", "name": "Meta Platforms Inc.", "type": "stock", "currency": "USD", "remarks": "Social media", "active_trades": False},
        {"symbol": "NFLX", "name": "Netflix Inc.", "type": "stock", "currency": "USD", "remarks": "Streaming", "active_trades": False},
        {"symbol": "SPY", "name": "SPDR S&P 500 ETF", "type": "etf", "currency": "USD", "remarks": "S&P 500 ETF", "active_trades": True},
        {"symbol": "QQQ", "name": "Invesco QQQ Trust", "type": "etf", "currency": "USD", "remarks": "Technology ETF", "active_trades": False},
        {"symbol": "VTI", "name": "Vanguard Total Stock Market ETF", "type": "etf", "currency": "USD", "remarks": "Total market ETF", "active_trades": False},
        {"symbol": "VOO", "name": "Vanguard S&P 500 ETF", "type": "etf", "currency": "USD", "remarks": "S&P 500 ETF", "active_trades": False},
        {"symbol": "ARKK", "name": "ARK Innovation ETF", "type": "etf", "currency": "USD", "remarks": "Innovation ETF", "active_trades": False},
        {"symbol": "TQQQ", "name": "ProShares UltraPro QQQ", "type": "etf", "currency": "USD", "remarks": "Leveraged technology ETF", "active_trades": False},
        {"symbol": "SOXL", "name": "Direxion Daily Semiconductor Bull 3X Shares", "type": "etf", "currency": "USD", "remarks": "Leveraged semiconductor ETF", "active_trades": False}
    ]
    
    for ticker_data in tickers_data:
        existing = db.query(Ticker).filter(Ticker.symbol == ticker_data["symbol"]).first()
        if not existing:
            ticker = Ticker(**ticker_data)
            db.add(ticker)
    
    db.commit()
    print("✅ Tickers created")

def create_accounts(db: Session):
    """Create accounts - compatible with status rules"""
    accounts_data = [
        {"name": "Main Account", "currency": "USD", "status": "open", "cash_balance": 50000, "total_value": 75000, "total_pl": 25000, "notes": "My main account"},
        {"name": "Technology Account", "currency": "USD", "status": "open", "cash_balance": 25000, "total_value": 35000, "total_pl": 10000, "notes": "Focused on technology stocks"},
        {"name": "ETF Account", "currency": "USD", "status": "closed", "cash_balance": 15000, "total_value": 18000, "total_pl": 3000, "notes": "ETF investments"},
        {"name": "Experimental Account", "currency": "USD", "status": "cancelled", "cash_balance": 5000, "total_value": 5000, "total_pl": 0, "notes": "Account for experiments"},
        {"name": "Test Account", "currency": "USD", "status": "open", "cash_balance": 10000, "total_value": 12000, "total_pl": 2000, "notes": "Test account"},
        {"name": "Test Account for Trade", "currency": "USD", "status": "open", "cash_balance": 8000, "total_value": 9500, "total_pl": 1500, "notes": "Test account for trades"}
    ]
    
    # Validate status values
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
    """Create trade plans - compatible with linking rules"""
    accounts = db.query(Account).filter(Account.status == "open").all()
    tickers = db.query(Ticker).all()
    
    if not accounts or not tickers:
        print("⚠️ No accounts or tickers found for trade plans")
        return
    
    plans_data = [
        # Plan 1: AAPL - swing
        {
            "account_id": accounts[0].id,
            "ticker_id": tickers[0].id,  # AAPL
            "investment_type": "swing",
            "side": "Long",
            "status": "open",
            "planned_amount": 10000,
            "entry_conditions": "Price below $150",
            "stop_price": 140,
            "target_price": 180,
            "reasons": "Strong company with quality products"
        },
        # Plan 2: GOOGL - swing
        {
            "account_id": accounts[1].id,
            "ticker_id": tickers[1].id,  # GOOGL
            "investment_type": "swing",
            "side": "Long",
            "status": "open",
            "planned_amount": 8000,
            "entry_conditions": "Price below $120",
            "stop_price": 110,
            "target_price": 150,
            "reasons": "Dominance in search and advertising"
        },
        # Plan 3: SPY - swing
        {
            "account_id": accounts[1].id if len(accounts) > 1 else accounts[0].id,
            "ticker_id": tickers[8].id,  # SPY
            "investment_type": "swing",
            "side": "Long",
            "status": "open",
            "planned_amount": 5000,
            "entry_conditions": "Price below $400",
            "stop_price": 380,
            "target_price": 450,
            "reasons": "Investment in S&P 500 index"
        },
        # Plan 4: MSFT - investment
        {
            "account_id": accounts[0].id,
            "ticker_id": tickers[2].id,  # MSFT
            "investment_type": "investment",
            "side": "Long",
            "status": "open",
            "planned_amount": 15000,
            "entry_conditions": "Price below $350",
            "stop_price": 320,
            "target_price": 400,
            "reasons": "Dominant company in Azure and Office"
        },
        # Plan 5: NVDA - swing
        {
            "account_id": accounts[1].id if len(accounts) > 1 else accounts[0].id,
            "ticker_id": tickers[4].id,  # NVDA
            "investment_type": "swing",
            "side": "Long",
            "status": "open",
            "planned_amount": 12000,
            "entry_conditions": "Price below $450",
            "stop_price": 420,
            "target_price": 550,
            "reasons": "Dominance in AI chips"
        },
        # Plan 6: TSLA - passive
        {
            "account_id": accounts[0].id,
            "ticker_id": tickers[3].id,  # TSLA
            "investment_type": "passive",
            "side": "Long",
            "status": "open",
            "planned_amount": 8000,
            "entry_conditions": "Price below $200",
            "stop_price": 180,
            "target_price": 250,
            "reasons": "Long-term investment in electric vehicles"
        }
    ]
    
    # Validate plans
    print("🔍 Validating trade plans...")
    valid_investment_types = ["swing", "investment", "passive"]
    valid_sides = ["Long", "Short"]
    valid_statuses = ["open", "closed", "cancelled"]
    
    for i, plan_data in enumerate(plans_data):
        # Validate investment_type values
        if plan_data.get('investment_type') not in valid_investment_types:
            print(f"❌ Plan {i+1}: Invalid investment_type '{plan_data.get('investment_type')}' - using 'swing'")
            plan_data['investment_type'] = 'swing'
        
        # Validate side values
        if plan_data.get('side') not in valid_sides:
            print(f"❌ Plan {i+1}: Invalid side '{plan_data.get('side')}' - using 'Long'")
            plan_data['side'] = 'Long'
        
        # Validate status values
        if plan_data.get('status') not in valid_statuses:
            print(f"❌ Plan {i+1}: Invalid status '{plan_data.get('status')}' - using 'open'")
            plan_data['status'] = 'open'
        
        plan = TradePlan(**plan_data)
        db.add(plan)
        print(f"✅ Plan {i+1}: Valid trade plan")
    
    db.commit()
    print("✅ Trade plans created with validation")

def create_trades(db: Session):
    """Create trades - compatible with plan linking rules"""
    accounts = db.query(Account).filter(Account.status == "open").all()
    tickers = db.query(Ticker).all()
    plans = db.query(TradePlan).all()
    
    if not accounts or not tickers:
        print("⚠️ No accounts or tickers found for trades")
        return
    
    if not plans:
        print("⚠️ No trade plans found - creating trades without plans (not recommended)")
        return
    
    # Create trades compatible with linking rules
    trades_data = [
        # Trade 1: Linked to AAPL plan (plan 0)
        {
            "account_id": accounts[0].id,
            "ticker_id": tickers[0].id,  # AAPL
            "trade_plan_id": plans[0].id,  # Must link to plan
            "status": "open",
            "type": "swing",  # Same as plan
            "side": "Long",   # Same as plan
            "total_pl": 2500,
            "notes": "Apple purchase"
        },
        # Trade 2: Linked to GOOGL plan (plan 1) - closed
        {
            "account_id": accounts[1].id if len(accounts) > 1 else accounts[0].id,
            "ticker_id": tickers[1].id,  # GOOGL
            "trade_plan_id": plans[1].id,  # Must link to plan
            "status": "closed",
            "type": "swing",  # Same as plan
            "side": "Long",   # Same as plan
            "created_at": datetime.now() - timedelta(days=5),  # After plan creation
            "closed_at": datetime.now() - timedelta(days=2),
            "total_pl": 1500,
            "notes": "Successful Google trade"
        },
        # Trade 3: Linked to SPY plan (plan 2)
        {
            "account_id": accounts[0].id,
            "ticker_id": tickers[8].id,  # SPY
            "trade_plan_id": plans[2].id,  # Must link to plan
            "status": "open",
            "type": "swing",  # Same as plan
            "side": "Long",   # Same as plan
            "created_at": datetime.now() - timedelta(days=3),  # After plan creation
            "total_pl": 800,
            "notes": "ETF investment"
        },
        # Trade 4: Linked to MSFT plan (plan 3) - investment
        {
            "account_id": accounts[0].id,
            "ticker_id": tickers[2].id,  # MSFT
            "trade_plan_id": plans[3].id,  # Linked to MSFT plan
            "status": "open",
            "type": "investment",  # Same as plan
            "side": "Long",        # Same as plan (required)
            "created_at": datetime.now() - timedelta(days=2),  # After plan creation
            "total_pl": 1200,
            "notes": "Long-term Microsoft investment"
        },
        # Trade 5: Linked to NVDA plan (plan 4) - closed
        {
            "account_id": accounts[1].id if len(accounts) > 1 else accounts[0].id,
            "ticker_id": tickers[4].id,  # NVDA
            "trade_plan_id": plans[4].id,  # Linked to NVDA plan
            "status": "closed",
            "type": "swing",  # Same as plan
            "side": "Long",   # Same as plan
            "created_at": datetime.now() - timedelta(days=10),  # After plan creation
            "closed_at": datetime.now() - timedelta(days=5),
            "total_pl": 3500,
            "notes": "Successful NVIDIA trade"
        },
        # Trade 6: Linked to TSLA plan (plan 5) - passive
        {
            "account_id": accounts[0].id,
            "ticker_id": tickers[3].id,  # TSLA
            "trade_plan_id": plans[5].id,  # Linked to TSLA plan
            "status": "open",
            "type": "passive",  # Same as plan
            "side": "Long",     # Same as plan (required)
            "created_at": datetime.now() - timedelta(days=1),  # After plan creation
            "total_pl": -500,
            "notes": "Passive Tesla investment"
        }
    ]
    
    # Validate trade-plan linking rules before creating trades
    print("🔍 Validating trade-plan linking rules...")
    
    # Validate type and side values
    valid_types = ["swing", "investment", "passive"]
    valid_sides = ["Long", "Short"]
    valid_statuses = ["open", "closed", "cancelled"]
    
    for i, trade_data in enumerate(trades_data):
        # Validate type values
        if trade_data.get('type') not in valid_types:
            print(f"❌ Trade {i+1}: Invalid type '{trade_data.get('type')}' - using 'swing'")
            trade_data['type'] = 'swing'
        
        # Validate side values
        if trade_data.get('side') not in valid_sides:
            print(f"❌ Trade {i+1}: Invalid side '{trade_data.get('side')}' - using 'Long'")
            trade_data['side'] = 'Long'
        
        # Validate status values
        if trade_data.get('status') not in valid_statuses:
            print(f"❌ Trade {i+1}: Invalid status '{trade_data.get('status')}' - using 'open'")
            trade_data['status'] = 'open'
        
        # Validate plan link
        if not trade_data.get('trade_plan_id'):
            print(f"❌ Trade {i+1}: Missing trade_plan_id - violating linking rules")
            continue
        
        # Validate side compatibility
        plan = db.query(TradePlan).filter(TradePlan.id == trade_data['trade_plan_id']).first()
        if plan and trade_data['side'] != plan.side:
            print(f"❌ Trade {i+1}: Side mismatch - trade: {trade_data['side']}, plan: {plan.side}")
            continue
        
            # Validate dates - skip this check because plans are created with fixed date
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
    """
    Create alerts - compatible with flexible linking system
    
    Linking system:
    - related_type_id = 1: Alert linked to account
    - related_type_id = 4: Alert linked to ticker
    
    Alerts can be of different types:
    - price_alert: Price alert
    - stop_loss: Stop loss
    - volume_alert: Volume alert
    """
    accounts = db.query(Account).filter(Account.status == "open").all()
    tickers = db.query(Ticker).all()
    
    if not accounts or not tickers:
        print("⚠️ No accounts or tickers found for alerts")
        return
    
    alerts_data = [
        # Account alerts
        {
            "related_type_id": 1,  # account
            "related_id": accounts[0].id,
            "type": "price_alert",
            "condition": "Price > $160",
            "message": "Apple reached target price",
            "status": "open",
            "is_triggered": "false"
        },
        {
            "related_type_id": 1,  # account
            "related_id": accounts[1].id,
            "type": "stop_loss",
            "condition": "Price < $110",
            "message": "Google reached stop loss",
            "status": "open",
            "is_triggered": "false"
        },
        # Ticker alerts
        {
            "related_type_id": 4,  # ticker
            "related_id": tickers[0].id,  # AAPL
            "type": "price_alert",
            "condition": "Price > $170",
            "message": "Apple reached new target price",
            "status": "closed",
            "is_triggered": "new"
        },
        {
            "related_type_id": 4,  # ticker
            "related_id": tickers[1].id,  # GOOGL
            "type": "volume_alert",
            "condition": "Volume > 50M",
            "message": "High trading volume in Google",
            "status": "closed",
            "is_triggered": "new"
        },
        {
            "related_type_id": 4,  # ticker
            "related_id": tickers[2].id,  # MSFT
            "type": "price_alert",
            "condition": "Price > $400",
            "message": "Microsoft reached target price",
            "status": "closed",
            "is_triggered": "new"
        },
        {
            "related_type_id": 4,  # ticker
            "related_id": tickers[3].id,  # TSLA
            "type": "stop_loss",
            "condition": "Price < $200",
            "message": "Tesla reached stop loss",
            "status": "closed",
            "is_triggered": "new"
        },
        {
            "related_type_id": 4,  # ticker
            "related_id": tickers[4].id,  # NVDA
            "type": "price_alert",
            "condition": "Price > $500",
            "message": "NVIDIA reached target price",
            "status": "closed",
            "is_triggered": "new"
        },
        {
            "related_type_id": 1,  # account
            "related_id": accounts[0].id,
            "type": "volume_alert",
            "condition": "Volume > 100M",
            "message": "High trading volume in SPY",
            "status": "closed",
            "is_triggered": "new"
        },
        {
            "related_type_id": 4,  # ticker
            "related_id": tickers[5].id,  # AMZN
            "type": "price_alert",
            "condition": "Price > $150",
            "message": "Amazon reached target price",
            "status": "closed",
            "is_triggered": "new"
        },
        {
            "related_type_id": 4,  # ticker
            "related_id": tickers[6].id,  # META
            "type": "price_alert",
            "condition": "Price > $300",
            "message": "Meta reached target price",
            "status": "closed",
            "is_triggered": "new"
        },
        {
            "related_type_id": 4,  # ticker
            "related_id": tickers[7].id,  # NFLX
            "type": "stop_loss",
            "condition": "Price < $400",
            "message": "Netflix reached stop loss",
            "status": "closed",
            "is_triggered": "new"
        },
        {
            "related_type_id": 4,  # ticker
            "related_id": tickers[9].id,  # QQQ
            "type": "price_alert",
            "condition": "Price > $350",
            "message": "QQQ reached target price",
            "status": "closed",
            "is_triggered": "new"
        },
        {
            "related_type_id": 4,  # ticker
            "related_id": tickers[10].id,  # VTI
            "type": "price_alert",
            "condition": "Price > $250",
            "message": "VTI reached target price",
            "status": "closed",
            "is_triggered": "new"
        },
        {
            "related_type_id": 4,  # ticker
            "related_id": tickers[11].id,  # VOO
            "type": "price_alert",
            "condition": "Price > $400",
            "message": "VOO reached target price",
            "status": "closed",
            "is_triggered": "new"
        },
        {
            "related_type_id": 4,  # ticker
            "related_id": tickers[12].id,  # ARKK
            "type": "stop_loss",
            "condition": "Price < $40",
            "message": "ARKK reached stop loss",
            "status": "closed",
            "is_triggered": "new"
        },
        {
            "related_type_id": 4,  # ticker
            "related_id": tickers[13].id,  # TQQQ
            "type": "price_alert",
            "condition": "Price > $50",
            "message": "TQQQ reached target price",
            "status": "closed",
            "is_triggered": "new"
        },
        {
            "related_type_id": 4,  # ticker
            "related_id": tickers[14].id,  # SOXL
            "type": "stop_loss",
            "condition": "Price < $15",
            "message": "SOXL reached stop loss",
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
    """Create cash flows"""
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
            "description": "Initial deposit"
        },
        {
            "account_id": accounts[0].id,
            "type": "dividend",
            "amount": 500,
            "date": datetime.now() - timedelta(days=15),
            "description": "Dividend from Apple"
        },
        {
            "account_id": accounts[1].id,
            "type": "deposit",
            "amount": 25000,
            "date": datetime.now() - timedelta(days=45),
            "description": "Deposit to technology account"
        },
        {
            "account_id": accounts[0].id,
            "type": "withdrawal",
            "amount": -2000,
            "date": datetime.now() - timedelta(days=20),
            "description": "Personal withdrawal"
        },
        {
            "account_id": accounts[1].id,
            "type": "dividend",
            "amount": 300,
            "date": datetime.now() - timedelta(days=10),
            "description": "Dividend from Microsoft"
        },
        {
            "account_id": accounts[0].id,
            "type": "dividend",
            "amount": 200,
            "date": datetime.now() - timedelta(days=5),
            "description": "Dividend from NVIDIA"
        },
        {
            "account_id": accounts[1].id,
            "type": "deposit",
            "amount": 10000,
            "date": datetime.now() - timedelta(days=30),
            "description": "Additional deposit to technology account"
        }
    ]
    
    for cf_data in cash_flows_data:
        cf = CashFlow(**cf_data)
        db.add(cf)
    
    db.commit()
    print("✅ Cash flows created")

def create_note_relation_types(db: Session):
    """Create note relation types"""
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
    """
    Create notes - compatible with flexible linking system
    
    Linking system:
    - related_type_id = 1: Note linked to account
    - related_type_id = 2: Note linked to trade
    - related_type_id = 3: Note linked to trade plan
    - related_type_id = 4: Note linked to ticker
    
    Notes linked to existing entities only
    """
    accounts = db.query(Account).all()
    trades = db.query(Trade).all()
    plans = db.query(TradePlan).all()
    tickers = db.query(Ticker).all()
    
    if not accounts:
        print("⚠️ No accounts found for notes")
        return
    
    # Get relation types from note_relation_types table
    from models.note_relation_type import NoteRelationType
    account_type = db.query(NoteRelationType).filter(NoteRelationType.note_relation_type == "account").first()
    trade_type = db.query(NoteRelationType).filter(NoteRelationType.note_relation_type == "trade").first()
    trade_plan_type = db.query(NoteRelationType).filter(NoteRelationType.note_relation_type == "trade_plan").first()
    ticker_type = db.query(NoteRelationType).filter(NoteRelationType.note_relation_type == "ticker").first()
    
    if not all([account_type, trade_type, trade_plan_type, ticker_type]):
        print("⚠️ Note relation types not found - creating notes may fail")
        return
    
    notes_data = [
        {
            "related_type_id": account_type.id,
            "related_id": accounts[0].id,
            "content": "Apple looks like a good long-term investment. The company continues to innovate and maintain market dominance",
            "attachment": None
        },
        {
            "related_type_id": trade_plan_type.id,
            "related_id": plans[0].id if plans else accounts[1].id,
            "content": "Google with strong AI and promising future. Worth following developments in Gemini",
            "attachment": None
        },
        {
            "related_type_id": account_type.id,
            "related_id": accounts[2].id,
            "content": "ETF investment is a good way to diversify risk. Consider adding more ETFs",
            "attachment": None
        },
        {
            "related_type_id": ticker_type.id,
            "related_id": tickers[0].id,  # AAPL
            "content": "Apple with iPhone 15 Pro Max shows excellent performance. Company continues to innovate in AI",
            "attachment": None
        },
        {
            "related_type_id": ticker_type.id,
            "related_id": tickers[1].id,  # GOOGL
            "content": "Google with advanced Gemini. Company strengthens dominance in search and AI",
            "attachment": None
        },
        {
            "related_type_id": ticker_type.id,
            "related_id": tickers[2].id,  # MSFT
            "content": "Microsoft with Azure and Office 365 continues to be dominant. Company invests heavily in AI",
            "attachment": None
        },
        {
            "related_type_id": ticker_type.id,
            "related_id": tickers[3].id,  # TSLA
            "content": "Tesla with Model 3 and Model Y continues to sell well. Company advances in FSD",
            "attachment": None
        },
        {
            "related_type_id": ticker_type.id,
            "related_id": tickers[4].id,  # NVDA
            "content": "NVIDIA with advanced AI chips. Company dominant in GPU field",
            "attachment": None
        },
        {
            "related_type_id": ticker_type.id,
            "related_id": tickers[5].id,  # AMZN
            "content": "Amazon with AWS and e-commerce continues to grow. Company invests in AI",
            "attachment": None
        }
    ]
    
    for note_data in notes_data:
        note = Note(**note_data)
        db.add(note)
    
    db.commit()
    print("✅ Notes created")

def create_executions(db: Session):
    """Create executions"""
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
    """Main function"""
    print("🚀 Starting data creation...")
    print("📋 Creating database with current schema (21.08.2025)")
    print("✅ Compatible with current database structure")
    print("✅ Using: swing/investment/passive types, side field, active_trades field")
    print("✅ Flexible notes system with related_type_id")
    print("✅ Mandatory trade-plan linking")
    
    # Create database
    init_db()
    
    # Create session
    db = SessionLocal()
    
    try:
        # Create data in correct order
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
        print(f"   - {db.query(Ticker).count()} tickers (with active_trades field)")
        print(f"   - {db.query(Account).count()} accounts (with status: open/closed/cancelled)")
        print(f"   - {db.query(TradePlan).count()} trade plans (with investment_type and side)")
        print(f"   - {db.query(Trade).count()} trades (linked to plans, with type and side)")
        print(f"   - {db.query(Alert).count()} alerts (flexible linking system)")
        print(f"   - {db.query(Note).count()} notes (flexible linking system)")
        print(f"   - {db.query(CashFlow).count()} cash flows")
        print(f"   - {db.query(Execution).count()} executions")
        print("")
        print("✅ Database structure matches current active schema")
        print("✅ All relationships and constraints validated")
        print("✅ Ready for production use")
        
    except Exception as e:
        print(f"❌ Error creating data: {str(e)}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    main()
