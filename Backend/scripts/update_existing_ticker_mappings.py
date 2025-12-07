#!/usr/bin/env python3
"""
TikTrack Update Existing Ticker Mappings Script
================================================

Updates symbol mappings for existing tickers in the database.
This script is used to fix missing or incorrect mappings for demo data.

Usage:
    python3 Backend/scripts/update_existing_ticker_mappings.py [--dry-run] [--verbose]

Options:
    --dry-run: Show what would be done without making changes
    --verbose: Show detailed progress information

Author: TikTrack Development Team
Version: 1.0.0
Date: December 2025
"""

import sys
import os
import argparse
from typing import Dict, List, Optional

# Add Backend to path for imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy.orm import Session
from sqlalchemy import text

from config.settings import DATABASE_URL
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models.ticker import Ticker
from models.external_data import ExternalDataProvider
from services.ticker_symbol_mapping_service import TickerSymbolMappingService
import logging

logger = logging.getLogger(__name__)

# Symbol mappings for European tickers (Yahoo Finance format)
EUROPEAN_SYMBOL_MAPPINGS = {
    'SAN': 'SAN.PA',      # Banco Santander - Paris Exchange
    'SIE': 'SIE.F',       # Siemens AG - Frankfurt Exchange
    'SAP': 'SAP.F',       # SAP SE - Frankfurt Exchange
    'BMW': 'BMW.F',       # Bayerische Motoren Werke - Frankfurt Exchange
    'ASML': 'ASML.AS',    # ASML Holding - Amsterdam Exchange
    'UL': 'ULVR.L',       # Unilever PLC - London Stock Exchange
    'NOVN': 'NOVN.SW',    # Novartis AG - Swiss Exchange
}

# Fix incorrect mappings (remove wrong suffixes for US tickers)
# US tickers should NOT have exchange suffixes
FIX_INCORRECT_MAPPINGS = {
    'DIA': 'DIA',         # Should be DIA, not DIA.AS
    'COST': 'COST',     # Should be COST, not COST.L
    'TSLA': 'TSLA',     # Should be TSLA, not TSLA.AS
    'PFE': 'PFE',       # Should be PFE, not PFE.F (Pfizer is US)
    'MA': 'MA',         # Should be MA, not MA.PA (Mastercard is US)
    'AAPL': 'AAPL',     # Should be AAPL, not AAPL.L
    'VTI': 'VTI',       # Should be VTI, not VTI.F
    'MSFT': 'MSFT',     # Should be MSFT, not MSFT.AS
    'NVDA': 'NVDA',     # Should be NVDA, not NVDA.DE
    'META': 'META',     # Should be META (no suffix)
}

# ============================================================================
# Mapping Updater
# ============================================================================

class TickerMappingUpdater:
    """מעדכן symbol mappings לטיקרים קיימים"""
    
    def __init__(self, db_session: Session, dry_run: bool = False, verbose: bool = False):
        self.db = db_session
        self.dry_run = dry_run
        self.verbose = verbose
        self.stats = {
            'total_tickers': 0,
            'mappings_created': 0,
            'mappings_updated': 0,
            'mappings_fixed': 0,
            'skipped': 0
        }
        self.yahoo_provider = None
    
    def _initialize_provider(self):
        """אתחול Yahoo Finance provider"""
        if self.yahoo_provider:
            return
        
        provider = self.db.query(ExternalDataProvider).filter(
            ExternalDataProvider.name == 'yahoo_finance'
        ).first()
        
        if not provider:
            raise ValueError(
                "Yahoo Finance provider not found in database. "
                "Please ensure external data providers are configured."
            )
        
        self.yahoo_provider = provider
        print(f"✅ Yahoo Finance provider initialized (Provider ID: {provider.id})")
    
    def update_all_mappings(self):
        """מעדכן mappings לכל הטיקרים"""
        print(f"\n🔗 מעדכן symbol mappings לטיקרים...")
        print("-" * 70)
        
        # Initialize provider
        self._initialize_provider()
        
        # Get all tickers
        tickers = self.db.query(Ticker).all()
        self.stats['total_tickers'] = len(tickers)
        
        if not tickers:
            print("   ⚠️  לא נמצאו טיקרים לעדכון")
            return self.stats
        
        print(f"   נמצאו {len(tickers)} טיקרים לעדכון")
        
        # Process each ticker
        for ticker in tickers:
            self._update_ticker_mapping(ticker)
        
        return self.stats
    
    def _update_ticker_mapping(self, ticker: Ticker):
        """מעדכן mapping לטיקר ספציפי"""
        symbol = (ticker.symbol or '').strip()
        if not symbol:
            self.stats['skipped'] += 1
            return
        
        # Check if needs European mapping
        if symbol in EUROPEAN_SYMBOL_MAPPINGS:
            provider_symbol = EUROPEAN_SYMBOL_MAPPINGS[symbol]
            self._create_or_update_mapping(ticker, provider_symbol, 'European mapping')
        
        # Check if needs fixing (incorrect mapping)
        elif symbol in FIX_INCORRECT_MAPPINGS:
            correct_symbol = FIX_INCORRECT_MAPPINGS[symbol]
            existing = TickerSymbolMappingService.get_provider_symbol(
                self.db, ticker.id, self.yahoo_provider.id
            )
            
            # If has incorrect mapping, fix it
            if existing and existing != correct_symbol:
                if self.dry_run:
                    print(f"   🔍 DRY RUN: היה מתקן {symbol}: {existing} -> {correct_symbol}")
                else:
                    TickerSymbolMappingService.set_provider_symbol(
                        self.db,
                        ticker.id,
                        self.yahoo_provider.id,
                        correct_symbol,
                        is_primary=True
                    )
                    self.stats['mappings_fixed'] += 1
                    if self.verbose:
                        print(f"      ✅ תוקן {symbol}: {existing} -> {correct_symbol}")
            
            # If no mapping exists, create correct one
            elif not existing:
                if self.dry_run:
                    print(f"   🔍 DRY RUN: היה יוצר {symbol} -> {correct_symbol}")
                else:
                    TickerSymbolMappingService.set_provider_symbol(
                        self.db,
                        ticker.id,
                        self.yahoo_provider.id,
                        correct_symbol,
                        is_primary=True
                    )
                    self.stats['mappings_created'] += 1
                    if self.verbose:
                        print(f"      ✅ נוצר {symbol} -> {correct_symbol}")
    
    def _create_or_update_mapping(self, ticker: Ticker, provider_symbol: str, reason: str):
        """יוצר או מעדכן mapping"""
        existing = TickerSymbolMappingService.get_provider_symbol(
            self.db, ticker.id, self.yahoo_provider.id
        )
        
        if existing == provider_symbol:
            # Already correct
            self.stats['skipped'] += 1
            return
        
        if self.dry_run:
            if existing:
                print(f"   🔍 DRY RUN: היה מעדכן {ticker.symbol}: {existing} -> {provider_symbol} ({reason})")
            else:
                print(f"   🔍 DRY RUN: היה יוצר {ticker.symbol} -> {provider_symbol} ({reason})")
        else:
            TickerSymbolMappingService.set_provider_symbol(
                self.db,
                ticker.id,
                self.yahoo_provider.id,
                provider_symbol,
                is_primary=True
            )
            
            if existing:
                self.stats['mappings_updated'] += 1
                if self.verbose:
                    print(f"      ✅ עודכן {ticker.symbol}: {existing} -> {provider_symbol} ({reason})")
            else:
                self.stats['mappings_created'] += 1
                if self.verbose:
                    print(f"      ✅ נוצר {ticker.symbol} -> {provider_symbol} ({reason})")
    
    def print_summary(self):
        """מדפיס סיכום"""
        print("\n" + "=" * 70)
        print("📊 סיכום עדכון Symbol Mappings")
        print("=" * 70)
        print(f"   סה\"כ טיקרים: {self.stats['total_tickers']}")
        print(f"   mappings שנוצרו: {self.stats['mappings_created']}")
        print(f"   mappings שעודכנו: {self.stats['mappings_updated']}")
        print(f"   mappings שתוקנו: {self.stats['mappings_fixed']}")
        print(f"   דולגו: {self.stats['skipped']}")
        print("=" * 70)


# ============================================================================
# Main Entry Point
# ============================================================================

def main():
    parser = argparse.ArgumentParser(
        description='Update symbol mappings for existing tickers',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__
    )
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Show what would be done without making changes'
    )
    parser.add_argument(
        '--verbose',
        action='store_true',
        help='Show detailed progress information'
    )
    
    args = parser.parse_args()
    
    # Create database connection
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()
    
    try:
        updater = TickerMappingUpdater(db, dry_run=args.dry_run, verbose=args.verbose)
        updater.update_all_mappings()
        
        if not args.dry_run:
            db.commit()
            print("\n✅ כל השינויים נשמרו במסד הנתונים")
        
        updater.print_summary()
    except Exception as e:
        print(f"\n❌ שגיאה בהרצת הסקריפט: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    main()

