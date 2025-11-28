#!/usr/bin/env python3
"""
תיקון קישורים אחרי החלפת טיקרים

סקריפט זה מתקן את כל הקישורים לרשומות אחרי החלפת טיקרים נדירים בטיקרים נפוצים.
הוא מזהה רשומות שקשורות לטיקרים שהוחלפו ומעדכן אותן לטיקרים החדשים.

Usage:
    python3 Backend/scripts/fix_links_after_ticker_replacement.py [--dry-run]
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

# Mapping of old ticker symbols to new ones (from replacement script)
TICKER_REPLACEMENT_MAP = {
    'ANX': 'ASML',
    'SC0K': 'SAP',
    'SP5C': 'SAN',
    'SQ': 'AAPL',
    'TEST123': 'MSFT',
    'TIUP': None,  # Keep as is (or map to TIPU if needed)
}

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

def fix_links_after_ticker_replacement(db: Session, dry_run: bool = False) -> dict:
    """מתקן קישורים אחרי החלפת טיקרים"""
    
    print("=" * 70)
    print("🔗 תיקון קישורים אחרי החלפת טיקרים")
    print("=" * 70)
    print()
    
    stats = {
        'trades_fixed': 0,
        'trade_plans_fixed': 0,
        'executions_fixed': 0,
        'cash_flows_fixed': 0,
        'alerts_fixed': 0,
        'notes_fixed': 0,
        'errors': 0
    }
    
    # Get ticker ID mapping (old symbol -> new ticker ID)
    ticker_mapping = {}
    
    for old_symbol, new_symbol in TICKER_REPLACEMENT_MAP.items():
        if new_symbol is None:
            continue  # Skip - keep as is
            
        # Get old ticker ID
        old_ticker = db.execute(text('''
            SELECT id FROM tickers WHERE symbol = :symbol
        '''), {'symbol': old_symbol}).fetchone()
        
        # Get new ticker ID
        new_ticker = db.execute(text('''
            SELECT id FROM tickers WHERE symbol = :symbol
        '''), {'symbol': new_symbol}).fetchone()
        
        if old_ticker and new_ticker:
            ticker_mapping[old_ticker[0]] = new_ticker[0]
            print(f"✅ מיפוי: {old_symbol} (ID {old_ticker[0]}) → {new_symbol} (ID {new_ticker[0]})")
    
    if not ticker_mapping:
        print("⚠️  לא נמצאו טיקרים להחלפה בקישורים")
        return stats
    
    print()
    print(f"📊 נמצאו {len(ticker_mapping)} טיקרים שהוחלפו")
    print()
    
    # Fix trades
    print("🔧 מתקן טריידים...")
    for old_ticker_id, new_ticker_id in ticker_mapping.items():
        try:
            result = db.execute(text('''
                UPDATE trades
                SET ticker_id = :new_ticker_id
                WHERE ticker_id = :old_ticker_id
            '''), {
                'new_ticker_id': new_ticker_id,
                'old_ticker_id': old_ticker_id
            })
            
            if result.rowcount > 0:
                stats['trades_fixed'] += result.rowcount
                if not dry_run:
                    print(f"   ✅ עודכנו {result.rowcount} טריידים")
        except Exception as e:
            stats['errors'] += 1
            print(f"   ❌ שגיאה בתיקון טריידים: {str(e)}")
    
    # Fix trade plans
    print("🔧 מתקן תוכניות מסחר...")
    for old_ticker_id, new_ticker_id in ticker_mapping.items():
        try:
            result = db.execute(text('''
                UPDATE trade_plans
                SET ticker_id = :new_ticker_id
                WHERE ticker_id = :old_ticker_id
            '''), {
                'new_ticker_id': new_ticker_id,
                'old_ticker_id': old_ticker_id
            })
            
            if result.rowcount > 0:
                stats['trade_plans_fixed'] += result.rowcount
                if not dry_run:
                    print(f"   ✅ עודכנו {result.rowcount} תוכניות")
        except Exception as e:
            stats['errors'] += 1
            print(f"   ❌ שגיאה בתיקון תוכניות: {str(e)}")
    
    # Fix executions
    print("🔧 מתקן ביצועים...")
    for old_ticker_id, new_ticker_id in ticker_mapping.items():
        try:
            result = db.execute(text('''
                UPDATE executions
                SET ticker_id = :new_ticker_id
                WHERE ticker_id = :old_ticker_id
            '''), {
                'new_ticker_id': new_ticker_id,
                'old_ticker_id': old_ticker_id
            })
            
            if result.rowcount > 0:
                stats['executions_fixed'] += result.rowcount
                if not dry_run:
                    print(f"   ✅ עודכנו {result.rowcount} ביצועים")
        except Exception as e:
            stats['errors'] += 1
            print(f"   ❌ שגיאה בתיקון ביצועים: {str(e)}")
    
    # Fix alerts
    print("🔧 מתקן התראות...")
    for old_ticker_id, new_ticker_id in ticker_mapping.items():
        try:
            result = db.execute(text('''
                UPDATE alerts
                SET ticker_id = :new_ticker_id
                WHERE ticker_id = :old_ticker_id
            '''), {
                'new_ticker_id': new_ticker_id,
                'old_ticker_id': old_ticker_id
            })
            
            if result.rowcount > 0:
                stats['alerts_fixed'] += result.rowcount
                if not dry_run:
                    print(f"   ✅ עודכנו {result.rowcount} התראות")
        except Exception as e:
            stats['errors'] += 1
            print(f"   ❌ שגיאה בתיקון התראות: {str(e)}")
    
    print()
    print("=" * 70)
    print("📊 סיכום:")
    print("=" * 70)
    print(f"   טריידים: {stats['trades_fixed']}")
    print(f"   תוכניות: {stats['trade_plans_fixed']}")
    print(f"   ביצועים: {stats['executions_fixed']}")
    print(f"   התראות: {stats['alerts_fixed']}")
    if stats['errors'] > 0:
        print(f"   שגיאות: {stats['errors']}")
    print()
    
    if dry_run:
        print("🔍 DRY RUN - לא יבוצעו שינויים")
        return stats
    
    if stats['trades_fixed'] > 0 or stats['trade_plans_fixed'] > 0 or stats['executions_fixed'] > 0 or stats['alerts_fixed'] > 0:
        db.commit()
        print("✅ כל השינויים נשמרו בהצלחה!")
    else:
        print("ℹ️  אין רשומות שצריך לתקן")
    
    return stats

def main():
    parser = argparse.ArgumentParser(
        description='Fix links after ticker replacement',
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
        stats = fix_links_after_ticker_replacement(db, dry_run=args.dry_run)
        sys.exit(0 if stats['errors'] == 0 else 1)
    except Exception as e:
        print(f"❌ שגיאה: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    main()

