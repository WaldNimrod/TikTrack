#!/usr/bin/env python3
"""
תיקון מטבע החשבון הראשי - תמיד USD

סקריפט זה מתקן את החשבון הראשי להיות תמיד במטבע USD,
גם אם נוצר בטעות במטבע אחר (כמו EUR).

Usage:
    python3 Backend/scripts/fix_primary_account_currency.py [--dry-run]
"""

import sys
import os
import argparse

# Add Backend to path for imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import QueuePool

from config.settings import DATABASE_URL

def _build_engine_kwargs():
    """בונה פרמטרים ל-engine עבור PostgreSQL"""
    return {
        "poolclass": QueuePool,
        "pool_size": 10,
        "max_overflow": 20,
        "pool_timeout": 60,
        "pool_recycle": 3600,
        "pool_pre_ping": True,
        "echo": False,
    }

def fix_primary_account_currency(db: Session, dry_run: bool = False) -> bool:
    """מתקן את החשבון הראשי להיות תמיד ב-USD"""
    
    print("=" * 70)
    print("🔧 תיקון מטבע החשבון הראשי")
    print("=" * 70)
    print()
    
    # Get USD currency ID
    usd_currency = db.execute(text("SELECT id, symbol FROM currencies WHERE symbol = 'USD'")).fetchone()
    if not usd_currency:
        print("❌ שגיאה: מטבע USD לא נמצא במערכת!")
        return False
    
    usd_id, usd_symbol = usd_currency
    print(f"✅ נמצא מטבע USD (ID: {usd_id})")
    print()
    
    # Find primary account (by name pattern or first account)
    primary_account = db.execute(text('''
        SELECT ta.id, ta.name, ta.currency_id, c.symbol, c.name as currency_name
        FROM trading_accounts ta
        LEFT JOIN currencies c ON ta.currency_id = c.id
        WHERE ta.name LIKE '%ראשי%' 
           OR ta.name LIKE '%primary%'
           OR ta.id = (SELECT MIN(id) FROM trading_accounts)
        ORDER BY ta.id
        LIMIT 1
    ''')).fetchone()
    
    if not primary_account:
        print("⚠️  לא נמצא חשבון ראשי במערכת")
        return False
    
    acc_id, name, currency_id, symbol, currency_name = primary_account
    
    print(f"📋 חשבון ראשי:")
    print(f"   ID: {acc_id}")
    print(f"   שם: {name}")
    print(f"   מטבע נוכחי: {symbol} ({currency_name}) - ID: {currency_id}")
    print()
    
    if symbol == 'USD':
        print("✅ החשבון הראשי כבר במטבע USD - תקין!")
        return True
    
    print(f"❌ החשבון הראשי במטבע {symbol} במקום USD!")
    print()
    
    if dry_run:
        print("🔍 DRY RUN - היה מתקן את החשבון למטבע USD")
        return True
    
    # Fix the account
    print(f"🔧 מתקן את החשבון למטבע USD...")
    try:
        db.execute(text('''
            UPDATE trading_accounts 
            SET currency_id = :usd_id
            WHERE id = :acc_id
        '''), {'usd_id': usd_id, 'acc_id': acc_id})
        
        db.commit()
        
        # Verify the fix
        updated_account = db.execute(text('''
            SELECT ta.id, ta.name, c.symbol
            FROM trading_accounts ta
            LEFT JOIN currencies c ON ta.currency_id = c.id
            WHERE ta.id = :acc_id
        '''), {'acc_id': acc_id}).fetchone()
        
        if updated_account and updated_account[2] == 'USD':
            print(f"✅ תוקן בהצלחה! החשבון הראשי כעת במטבע USD")
            return True
        else:
            print(f"❌ שגיאה: התיקון נכשל")
            return False
            
    except Exception as e:
        db.rollback()
        print(f"❌ שגיאה בתיקון: {str(e)}")
        return False

def main():
    parser = argparse.ArgumentParser(
        description='Fix primary account currency to USD',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__
    )
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Show what would be done without making changes.'
    )
    
    args = parser.parse_args()
    
    # Create database connection
    engine = create_engine(DATABASE_URL, **_build_engine_kwargs())
    Session = sessionmaker(bind=engine)
    db = Session()
    
    try:
        success = fix_primary_account_currency(db, dry_run=args.dry_run)
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"❌ שגיאה: {str(e)}")
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    main()

