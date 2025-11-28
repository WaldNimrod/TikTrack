#!/usr/bin/env python3
"""
TikTrack Market Data Loader Script
==================================

Loads market data (quotes) for all tickers in the database.
This script is designed to be used as part of the demo data generation process.

Usage:
    python3 Backend/scripts/load_market_data_for_tickers.py [--dry-run] [--tickers-only <symbol1,symbol2,...>]

Options:
    --dry-run: Show what would be done without making changes
    --tickers-only: Load data only for specific ticker symbols (comma-separated)

Author: TikTrack Development Team
Version: 1.0.0
Date: November 2025
"""

import sys
import os
import argparse
from typing import List, Optional, Dict, Any
from datetime import datetime

# Add Backend to path for imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy.orm import Session
from sqlalchemy import text

from config.database import SessionLocal
from models.ticker import Ticker
from models.external_data import ExternalDataProvider
from services.external_data.yahoo_finance_adapter import YahooFinanceAdapter

# ============================================================================
# Market Data Loader
# ============================================================================

class MarketDataLoader:
    """טוען נתוני שוק לכל הטיקרים"""
    
    def __init__(self, db_session: Session, dry_run: bool = False):
        self.db = db_session
        self.dry_run = dry_run
        self.yahoo_adapter = None
        self.stats = {
            'total_tickers': 0,
            'loaded': 0,
            'failed': 0,
            'skipped': 0
        }
    
    def _initialize_adapter(self):
        """אתחול ה-Yahoo Finance adapter"""
        if self.yahoo_adapter:
            return
        
        # Get Yahoo Finance provider
        provider = self.db.query(ExternalDataProvider).filter(
            ExternalDataProvider.name == 'yahoo_finance'
        ).first()
        
        if not provider:
            raise ValueError(
                "Yahoo Finance provider not found in database. "
                "Please ensure external data providers are configured."
            )
        
        self.yahoo_adapter = YahooFinanceAdapter(
            db_session=self.db,
            provider_id=provider.id
        )
        print(f"✅ Yahoo Finance adapter initialized (Provider ID: {provider.id})")
    
    def load_data_for_all_tickers(self, ticker_symbols: Optional[List[str]] = None):
        """טוען נתוני שוק לכל הטיקרים"""
        print(f"\n📊 טוען נתוני שוק לטיקרים...")
        print("-" * 70)
        
        # Initialize adapter
        self._initialize_adapter()
        
        # Get tickers to load
        if ticker_symbols:
            tickers = self.db.query(Ticker).filter(
                Ticker.symbol.in_(ticker_symbols)
            ).all()
            print(f"   טעינה עבור {len(ticker_symbols)} טיקרים ספציפיים...")
        else:
            tickers = self.db.query(Ticker).all()
            print(f"   טעינה עבור כל הטיקרים במערכת...")
        
        if not tickers:
            print("   ⚠️  לא נמצאו טיקרים לטעינה")
            return self.stats
        
        self.stats['total_tickers'] = len(tickers)
        
        # Filter out tickers without symbols
        valid_tickers = []
        for ticker in tickers:
            symbol = (ticker.symbol or '').strip()
            if not symbol:
                print(f"   ⚠️  דילוג על טיקר ID={ticker.id} - אין symbol")
                self.stats['skipped'] += 1
                continue
            valid_tickers.append(ticker)
        
        if not valid_tickers:
            print("   ⚠️  לא נמצאו טיקרים תקינים לטעינה")
            return self.stats
        
        print(f"   ✅ נמצאו {len(valid_tickers)} טיקרים תקינים")
        
        if self.dry_run:
            print(f"\n   🔍 DRY RUN - היה נטען נתונים עבור:")
            for ticker in valid_tickers[:10]:  # Show first 10
                print(f"      - {ticker.symbol} ({ticker.name})")
            if len(valid_tickers) > 10:
                print(f"      ... ועוד {len(valid_tickers) - 10} טיקרים")
            return self.stats
        
        # Process in batches
        batch_size = 50  # Yahoo Finance batch size
        for i in range(0, len(valid_tickers), batch_size):
            batch = valid_tickers[i:i + batch_size]
            self._load_batch(batch)
        
        # Commit all changes
        try:
            self.db.commit()
            print(f"\n✅ כל השינויים נשמרו בהצלחה!")
        except Exception as e:
            self.db.rollback()
            print(f"\n❌ שגיאה בשמירת השינויים: {e}")
            raise
        
        return self.stats
    
    def _load_batch(self, tickers: List[Ticker]):
        """טוען נתונים עבור batch של טיקרים"""
        symbols = [(ticker.symbol or '').strip() for ticker in tickers]
        symbols = [s for s in symbols if s]  # Filter empty
        
        if not symbols:
            return
        
        print(f"\n   📡 טוען נתונים עבור {len(symbols)} טיקרים...")
        print(f"      סמלים: {', '.join(symbols[:5])}" + (f"... ({len(symbols)-5} נוספים)" if len(symbols) > 5 else ""))
        
        try:
            # Fetch quotes from Yahoo Finance
            quotes_data = self.yahoo_adapter.get_quotes_batch(symbols)
            
            # Count results
            quotes_by_symbol = {quote.symbol: quote for quote in quotes_data if quote}
            
            # Update statistics
            for ticker in tickers:
                symbol = ticker.symbol
                if symbol in quotes_by_symbol:
                    self.stats['loaded'] += 1
                    print(f"      ✅ {symbol}: נטען")
                else:
                    self.stats['failed'] += 1
                    print(f"      ❌ {symbol}: נכשל")
            
        except Exception as e:
            print(f"      ❌ שגיאה בטעינת batch: {e}")
            self.stats['failed'] += len(symbols)
    
    def print_summary(self):
        """מדפיס סיכום"""
        print("\n" + "=" * 70)
        print("📊 סיכום טעינת נתוני שוק")
        print("=" * 70)
        print(f"   סה\"כ טיקרים: {self.stats['total_tickers']}")
        print(f"   נטענו בהצלחה: {self.stats['loaded']}")
        print(f"   נכשלו: {self.stats['failed']}")
        print(f"   דולגו: {self.stats['skipped']}")
        print("=" * 70)


# ============================================================================
# Main Entry Point
# ============================================================================

def main():
    parser = argparse.ArgumentParser(
        description='Load market data for all tickers in the database',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__
    )
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Show what would be done without making changes'
    )
    parser.add_argument(
        '--tickers-only',
        type=str,
        help='Load data only for specific ticker symbols (comma-separated, e.g., "AAPL,MSFT,GOOGL")'
    )
    
    args = parser.parse_args()
    
    # Parse ticker symbols if provided
    ticker_symbols = None
    if args.tickers_only:
        ticker_symbols = [s.strip().upper() for s in args.tickers_only.split(',')]
        print(f"📋 טעינת נתונים עבור טיקרים ספציפיים: {', '.join(ticker_symbols)}")
    
    # Create database connection
    db = SessionLocal()
    
    try:
        loader = MarketDataLoader(db, dry_run=args.dry_run)
        loader.load_data_for_all_tickers(ticker_symbols)
        loader.print_summary()
    except Exception as e:
        print(f"\n❌ שגיאה בהרצת הסקריפט: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    main()

