#!/usr/bin/env python3
"""
Ensure Base Currencies Script
============================
Creates base currencies (USD, EUR, ILS) if they don't exist.
"""

import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from config.settings import DATABASE_URL
from models.currency import Currency

def ensure_base_currencies():
    """Ensures base currencies exist in the system"""
    engine = create_engine(DATABASE_URL)
    Session = sessionmaker(bind=engine)
    db = Session()
    
    try:
        base_currencies = [
            {'symbol': 'USD', 'name': 'US Dollar', 'usd_rate': 1.0},
            {'symbol': 'EUR', 'name': 'Euro', 'usd_rate': 0.85},
            {'symbol': 'ILS', 'name': 'Israeli Shekel', 'usd_rate': 3.65}
        ]
        
        created = []
        existing = []
        
        for curr_data in base_currencies:
            existing_currency = db.query(Currency).filter(Currency.symbol == curr_data['symbol']).first()
            if existing_currency:
                existing.append(curr_data['symbol'])
            else:
                currency = Currency(**curr_data)
                db.add(currency)
                created.append(curr_data['symbol'])
        
        if created:
            db.commit()
            print(f'✅ נוצרו מטבעות: {", ".join(created)}')
        
        if existing:
            print(f'✅ מטבעות קיימים: {", ".join(existing)}')
        
        if not created and not existing:
            print('⚠️ לא נוצרו מטבעות')
        
        return True
        
    except Exception as e:
        print(f'❌ שגיאה: {e}')
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == '__main__':
    ensure_base_currencies()

