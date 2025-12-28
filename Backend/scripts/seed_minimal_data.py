#!/usr/bin/env python3
"""
Minimal Data Seeding Script for TikTrack
========================================

Creates minimal data to make pages show records instead of empty tables.
This addresses the issue where all pages show 0 records due to empty database.

Author: TikTrack Development Team
Date: December 28, 2025
"""

import sys
import os
from datetime import datetime, date
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from config.settings import DATABASE_URL
from models.currency import Currency
from models.ticker import Ticker
from models.trading_account import TradingAccount
from models.cash_flow import CashFlow

def seed_minimal_data():
    """Seed minimal data to make pages functional"""

    # Create database connection
    engine = create_engine(DATABASE_URL)
    Session = sessionmaker(bind=engine)
    db = Session()

    try:
        print("🌱 Seeding minimal data for TikTrack...")

        # 1. Ensure base currencies (if not already done)
        usd = db.query(Currency).filter(Currency.symbol == 'USD').first()
        if not usd:
            usd = Currency(symbol='USD', name='US Dollar', usd_rate=1.0)
            db.add(usd)
            print("  ✅ Added USD currency")

        ils = db.query(Currency).filter(Currency.symbol == 'ILS').first()
        if not ils:
            ils = Currency(symbol='ILS', name='Israeli Shekel', usd_rate=3.65)
            db.add(ils)
            print("  ✅ Added ILS currency")

        # 2. Add basic tickers
        spy = db.query(Ticker).filter(Ticker.symbol == 'SPY').first()
        if not spy:
            spy = Ticker(
                symbol='SPY',
                name='SPDR S&P 500 ETF Trust',
                type='etf',
                currency_id=usd.id,
                status='active'
            )
            db.add(spy)
            print("  ✅ Added SPY ticker")

        # 3. Add a trading account
        account = db.query(TradingAccount).first()
        if not account:
            account = TradingAccount(
                user_id=1,  # admin user
                name='Demo Account',
                currency_id=usd.id,
                status='active'
            )
            db.add(account)
            db.flush()  # Get the ID
            print("  ✅ Added demo trading account")

        # 4. Add some cash flows
        cash_flows_count = db.query(CashFlow).count()
        if cash_flows_count == 0:
            # Add a deposit
            deposit = CashFlow(
                user_id=1,  # admin user
                trading_account_id=account.id,
                type='deposit',
                amount=10000.0,
                date=date.today(),
                description='Initial deposit',
                currency_id=usd.id,
                usd_rate=1.0,
                source='manual'
            )
            db.add(deposit)

            # Add a withdrawal
            withdrawal = CashFlow(
                user_id=1,
                trading_account_id=account.id,
                type='withdrawal',
                amount=1000.0,
                date=date.today(),
                description='Test withdrawal',
                currency_id=usd.id,
                usd_rate=1.0,
                source='manual'
            )
            db.add(withdrawal)

            print("  ✅ Added sample cash flows")

        db.commit()
        print("🎉 Minimal data seeding completed successfully!")
        print("   - Currencies: USD, ILS")
        print("   - Tickers: SPY")
        print("   - Trading Accounts: 1 demo account")
        print("   - Cash Flows: 2 sample transactions")

    except Exception as e:
        print(f"❌ Error seeding data: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == '__main__':
    seed_minimal_data()
