#!/usr/bin/env python3
"""
Script to add sample accounts to the database for testing
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from config.database import get_db, init_db
from models.account import Account
from models.currency import Currency
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def add_sample_accounts():
    """Add sample accounts to the database"""
    try:
        # Initialize database
        init_db()
        
        # Get database session
        db: Session = next(get_db())
        
        # Check if we already have accounts
        existing_accounts = db.query(Account).count()
        if existing_accounts > 0:
            logger.info(f"Database already has {existing_accounts} accounts. Skipping sample data creation.")
            return
        
        # Get or create USD currency
        usd_currency = db.query(Currency).filter(Currency.code == 'USD').first()
        if not usd_currency:
            usd_currency = Currency(code='USD', name='US Dollar', symbol='$')
            db.add(usd_currency)
            db.commit()
            db.refresh(usd_currency)
        
        # Get or create ILS currency
        ils_currency = db.query(Currency).filter(Currency.code == 'ILS').first()
        if not ils_currency:
            ils_currency = Currency(code='ILS', name='Israeli Shekel', symbol='₪')
            db.add(ils_currency)
            db.commit()
            db.refresh(ils_currency)
        
        # Sample accounts data
        sample_accounts = [
            {
                'name': 'חשבון מעודכן',
                'currency_id': usd_currency.id,
                'status': 'open',
                'cash_balance': 50000.0,
                'total_value': 75000.0,
                'total_pl': 25000.0,
                'notes': 'החשבון הראשי שלי'
            },
            {
                'name': 'חשבון טכנולוגיה',
                'currency_id': usd_currency.id,
                'status': 'open',
                'cash_balance': 25000.0,
                'total_value': 45000.0,
                'total_pl': 20000.0,
                'notes': 'מתמקד במניות טכנולוגיה'
            },
            {
                'name': 'חשבון השקעות',
                'currency_id': ils_currency.id,
                'status': 'open',
                'cash_balance': 100000.0,
                'total_value': 120000.0,
                'total_pl': 20000.0,
                'notes': 'השקעות ארוכות טווח'
            },
            {
                'name': 'חשבון סגור',
                'currency_id': usd_currency.id,
                'status': 'closed',
                'cash_balance': 0.0,
                'total_value': 0.0,
                'total_pl': -5000.0,
                'notes': 'חשבון שנסגר לאחר הפסדים'
            }
        ]
        
        # Add accounts to database
        for account_data in sample_accounts:
            account = Account(**account_data)
            db.add(account)
            logger.info(f"Adding account: {account_data['name']}")
        
        db.commit()
        logger.info(f"Successfully added {len(sample_accounts)} sample accounts")
        
        # Display added accounts
        accounts = db.query(Account).all()
        logger.info("Current accounts in database:")
        for account in accounts:
            logger.info(f"  - {account.name} ({account.status}) - ${account.total_value:,.2f}")
            
    except Exception as e:
        logger.error(f"Error adding sample accounts: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    add_sample_accounts()
