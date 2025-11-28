#!/usr/bin/env python3
"""
החלפת טיקרים נדירים בטיקרים נפוצים

סקריפט זה מחליף טיקרים נדירים ללא נתוני שוק בטיקרים נפוצים ומרכזיים
שבהם יש נתונים זמינים. שומר על TIPU ו-500X גם אם אין להם נתונים.

Usage:
    python3 Backend/scripts/replace_rare_tickers_with_common_ones.py [--dry-run]
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

# Common tickers to replace rare ones
COMMON_REPLACEMENT_TICKERS = {
    # Large US Tech Stocks
    'AAPL': ('Apple Inc.', 'stock', 'USD'),
    'MSFT': ('Microsoft Corporation', 'stock', 'USD'),
    'GOOGL': ('Alphabet Inc. Class A', 'stock', 'USD'),
    'AMZN': ('Amazon.com Inc.', 'stock', 'USD'),
    'META': ('Meta Platforms Inc.', 'stock', 'USD'),
    'NFLX': ('Netflix Inc.', 'stock', 'USD'),
    'AMD': ('Advanced Micro Devices', 'stock', 'USD'),
    'INTC': ('Intel Corporation', 'stock', 'USD'),
    'ORCL': ('Oracle Corporation', 'stock', 'USD'),
    'ADBE': ('Adobe Inc.', 'stock', 'USD'),
    
    # Large US Finance
    'JPM': ('JPMorgan Chase & Co.', 'stock', 'USD'),
    'BAC': ('Bank of America Corp.', 'stock', 'USD'),
    'WFC': ('Wells Fargo & Company', 'stock', 'USD'),
    'GS': ('Goldman Sachs Group Inc.', 'stock', 'USD'),
    'MS': ('Morgan Stanley', 'stock', 'USD'),
    'V': ('Visa Inc.', 'stock', 'USD'),
    'MA': ('Mastercard Inc.', 'stock', 'USD'),
    
    # Large US Consumer
    'WMT': ('Walmart Inc.', 'stock', 'USD'),
    'HD': ('Home Depot Inc.', 'stock', 'USD'),
    'DIS': ('Walt Disney Company', 'stock', 'USD'),
    'NKE': ('Nike Inc.', 'stock', 'USD'),
    'SBUX': ('Starbucks Corporation', 'stock', 'USD'),
    'MCD': ('McDonald\'s Corporation', 'stock', 'USD'),
    'COST': ('Costco Wholesale Corporation', 'stock', 'USD'),
    
    # Large US ETFs
    'SPY': ('SPDR S&P 500 ETF Trust', 'etf', 'USD'),
    'VTI': ('Vanguard Total Stock Market ETF', 'etf', 'USD'),
    'VOO': ('Vanguard S&P 500 ETF', 'etf', 'USD'),
    'IWM': ('iShares Russell 2000 ETF', 'etf', 'USD'),
    'DIA': ('SPDR Dow Jones Industrial Average ETF', 'etf', 'USD'),
    'GLD': ('SPDR Gold Trust', 'etf', 'USD'),
    'TLT': ('iShares 20+ Year Treasury Bond ETF', 'etf', 'USD'),
    
    # Large European Stocks (EUR)
    'ASML': ('ASML Holding N.V.', 'stock', 'EUR'),
    'SAP': ('SAP SE', 'stock', 'EUR'),
    'SAN': ('Banco Santander S.A.', 'stock', 'EUR'),
    'BMW': ('Bayerische Motoren Werke AG', 'stock', 'EUR'),
    'SIE': ('Siemens AG', 'stock', 'EUR'),
    'UL': ('Unilever PLC', 'stock', 'EUR'),
    
    # Israeli Stocks (ILS)
    'TEVA': ('Teva Pharmaceutical Industries', 'stock', 'ILS'),
    'WIX': ('Wix.com Ltd.', 'stock', 'ILS'),
    'NICE': ('NICE Ltd.', 'stock', 'ILS'),
}

# Tickers to keep even without data
# Note: Keep TIPU (or TIUP variant) and 500X even if they don't have market data
KEEP_TICKERS = ['TIPU', 'TIUP', '500X']

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

def get_replacement_ticker(used_symbols: set, currency: str = None) -> tuple:
    """מחזיר טיקר חלופי נפוץ"""
    available = []
    
    for symbol, (name, ticker_type, ticker_currency) in COMMON_REPLACEMENT_TICKERS.items():
        if symbol not in used_symbols:
            if currency is None or ticker_currency == currency:
                available.append((symbol, name, ticker_type, ticker_currency))
    
    if not available and currency:
        # Fallback: try any currency
        for symbol, (name, ticker_type, ticker_currency) in COMMON_REPLACEMENT_TICKERS.items():
            if symbol not in used_symbols:
                available.append((symbol, name, ticker_type, ticker_currency))
    
    if available:
        return available[0]  # Return first available
    return None

def replace_rare_tickers(db: Session, dry_run: bool = False) -> dict:
    """מחליף טיקרים נדירים בטיקרים נפוצים"""
    
    print("=" * 70)
    print("🔄 החלפת טיקרים נדירים בטיקרים נפוצים")
    print("=" * 70)
    print()
    
    stats = {
        'total_tickers': 0,
        'kept': 0,
        'with_data': 0,
        'replaced': 0,
        'failed': 0
    }
    
    # Get all tickers
    all_tickers = db.execute(text('''
        SELECT t.id, t.symbol, t.name, t.type, t.currency_id, c.symbol as currency
        FROM tickers t
        LEFT JOIN currencies c ON t.currency_id = c.id
        ORDER BY t.symbol
    ''')).fetchall()
    
    stats['total_tickers'] = len(all_tickers)
    
    # Check which tickers have market data
    tickers_with_data = db.execute(text('''
        SELECT DISTINCT t.id, t.symbol
        FROM tickers t
        INNER JOIN market_data_quotes mdq ON t.id = mdq.ticker_id
    ''')).fetchall()
    
    ticker_ids_with_data = {row[0] for row in tickers_with_data}
    symbols_with_data = {row[1] for row in tickers_with_data}
    
    # Get existing symbols to avoid duplicates
    existing_symbols = {row[1] for row in all_tickers}
    
    # Get currency IDs
    currency_ids = {}
    for symbol in ['USD', 'EUR', 'ILS']:
        currency_result = db.execute(text('''
            SELECT id FROM currencies WHERE symbol = :symbol
        '''), {'symbol': symbol}).fetchone()
        if currency_result:
            currency_ids[symbol] = currency_result[0]
    
    print(f"📊 סה\"כ טיקרים: {stats['total_tickers']}")
    print()
    
    replacements = []
    
    for ticker in all_tickers:
        ticker_id, symbol, name, ticker_type, currency_id, currency = ticker
        has_data = ticker_id in ticker_ids_with_data
        should_keep = symbol.upper() in [t.upper() for t in KEEP_TICKERS]
        
        if should_keep:
            stats['kept'] += 1
            print(f"✅ שומרים: {symbol} - {name}")
        elif has_data:
            stats['with_data'] += 1
            print(f"✅ יש נתונים: {symbol} - {name}")
        else:
            # Need to replace
            replacement = get_replacement_ticker(existing_symbols, currency)
            
            if not replacement:
                stats['failed'] += 1
                print(f"❌ לא נמצא חלופה ל: {symbol} - {name}")
                continue
            
            new_symbol, new_name, new_type, new_currency = replacement
            
            # Get currency ID for replacement
            new_currency_id = currency_ids.get(new_currency)
            if not new_currency_id:
                stats['failed'] += 1
                print(f"❌ לא נמצא מטבע {new_currency} ל: {symbol}")
                continue
            
            replacements.append({
                'ticker_id': ticker_id,
                'old_symbol': symbol,
                'old_name': name,
                'new_symbol': new_symbol,
                'new_name': new_name,
                'new_type': new_type,
                'new_currency': new_currency,
                'new_currency_id': new_currency_id
            })
            
            existing_symbols.add(new_symbol)
            stats['replaced'] += 1
            print(f"🔄 מחליף: {symbol} → {new_symbol} ({new_name})")
    
    print()
    print("=" * 70)
    print("📊 סיכום:")
    print("=" * 70)
    print(f"   טיקרים נשמרו (TIPU/500X): {stats['kept']}")
    print(f"   טיקרים עם נתונים: {stats['with_data']}")
    print(f"   טיקרים להחלפה: {stats['replaced']}")
    if stats['failed'] > 0:
        print(f"   טיקרים שלא הוחלפו: {stats['failed']}")
    print()
    
    if not replacements:
        print("✅ אין טיקרים להחליף!")
        return stats
    
    if dry_run:
        print("🔍 DRY RUN - לא יבוצעו שינויים")
        return stats
    
    # Perform replacements
    print("🔧 מבצע החלפות...")
    print()
    
    for repl in replacements:
        try:
            # Update ticker
            db.execute(text('''
                UPDATE tickers
                SET symbol = :new_symbol,
                    name = :new_name,
                    type = :new_type,
                    currency_id = :new_currency_id
                WHERE id = :ticker_id
            '''), {
                'new_symbol': repl['new_symbol'],
                'new_name': repl['new_name'],
                'new_type': repl['new_type'],
                'new_currency_id': repl['new_currency_id'],
                'ticker_id': repl['ticker_id']
            })
            
            print(f"✅ הוחלף: {repl['old_symbol']} → {repl['new_symbol']}")
        except Exception as e:
            print(f"❌ שגיאה בהחלפת {repl['old_symbol']}: {str(e)}")
            stats['failed'] += 1
            stats['replaced'] -= 1
    
    db.commit()
    print()
    print(f"✅ הושלמו {stats['replaced']} החלפות!")
    
    return stats

def main():
    parser = argparse.ArgumentParser(
        description='Replace rare tickers with common ones',
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
        stats = replace_rare_tickers(db, dry_run=args.dry_run)
        sys.exit(0 if stats['failed'] == 0 else 1)
    except Exception as e:
        print(f"❌ שגיאה: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    main()

