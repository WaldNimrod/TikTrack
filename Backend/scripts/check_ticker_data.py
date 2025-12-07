#!/usr/bin/env python3
"""
Check Ticker Data in Database
=============================

Script to check what data is stored for a specific ticker in the database.
Checks:
- Historical quotes count and date range
- Latest quote data
- Technical indicators cache
- Whether data is sufficient for calculations

Usage:
    python3 Backend/scripts/check_ticker_data.py NFLX
    python3 Backend/scripts/check_ticker_data.py --ticker-id 433
"""

import sys
import os
from datetime import datetime, timedelta
from sqlalchemy import func, and_, desc

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config.database import SessionLocal
from models.ticker import Ticker
from models.external_data import MarketDataQuote
from services.advanced_cache_service import advanced_cache_service

def check_ticker_data(symbol=None, ticker_id=None):
    """Check data for a ticker"""
    db = SessionLocal()
    
    try:
        # Find ticker
        if ticker_id:
            ticker = db.query(Ticker).filter(Ticker.id == ticker_id).first()
        elif symbol:
            ticker = db.query(Ticker).filter(Ticker.symbol == symbol.upper()).first()
        else:
            print("❌ Error: Must provide either symbol or ticker_id")
            return
        
        if not ticker:
            print(f"❌ Ticker not found: {symbol or ticker_id}")
            return
        
        print(f"\n{'='*60}")
        print(f"📊 Ticker Information: {ticker.symbol} (ID: {ticker.id})")
        print(f"{'='*60}\n")
        
        # Check latest quote
        latest_quote = db.query(MarketDataQuote).filter(
            MarketDataQuote.ticker_id == ticker.id
        ).order_by(desc(MarketDataQuote.fetched_at)).first()
        
        if latest_quote:
            print(f"✅ Latest Quote:")
            print(f"   Price: ${latest_quote.price:.2f}")
            print(f"   Change: {latest_quote.change_pct_day:.2f}%")
            print(f"   Volume: {latest_quote.volume:,}" if latest_quote.volume else "   Volume: N/A")
            print(f"   Fetched At: {latest_quote.fetched_at}")
            print(f"   As Of: {latest_quote.asof_utc}")
        else:
            print("❌ No latest quote found")
        
        # Check historical quotes count
        total_quotes = db.query(MarketDataQuote).filter(
            MarketDataQuote.ticker_id == ticker.id
        ).count()
        
        print(f"\n📈 Historical Quotes:")
        print(f"   Total Quotes: {total_quotes}")
        
        # Check date range
        oldest_quote = db.query(MarketDataQuote).filter(
            MarketDataQuote.ticker_id == ticker.id
        ).order_by(MarketDataQuote.asof_utc).first()
        
        newest_quote = db.query(MarketDataQuote).filter(
            MarketDataQuote.ticker_id == ticker.id
        ).order_by(desc(MarketDataQuote.asof_utc)).first()
        
        if oldest_quote and newest_quote:
            date_range = (newest_quote.asof_utc - oldest_quote.asof_utc).days
            print(f"   Date Range: {oldest_quote.asof_utc.date()} to {newest_quote.asof_utc.date()} ({date_range} days)")
            print(f"   Oldest Quote: {oldest_quote.asof_utc}")
            print(f"   Newest Quote: {newest_quote.asof_utc}")
        
        # Check quotes with close_price (needed for calculations)
        quotes_with_close = db.query(MarketDataQuote).filter(
            and_(
                MarketDataQuote.ticker_id == ticker.id,
                MarketDataQuote.close_price.isnot(None)
            )
        ).count()
        
        print(f"   Quotes with Close Price: {quotes_with_close}")
        
        # Check quotes in last 30 days (for Volatility)
        cutoff_30 = datetime.utcnow() - timedelta(days=35)
        quotes_30d = db.query(MarketDataQuote).filter(
            and_(
                MarketDataQuote.ticker_id == ticker.id,
                MarketDataQuote.close_price.isnot(None),
                MarketDataQuote.asof_utc >= cutoff_30
            )
        ).count()
        
        print(f"\n📊 Data Sufficiency for Calculations:")
        print(f"   Volatility (need 31+ quotes): {'✅' if quotes_30d >= 31 else '❌'} {quotes_30d} quotes")
        
        # Check quotes in last 20 days (for MA 20)
        cutoff_20 = datetime.utcnow() - timedelta(days=25)
        quotes_20d = db.query(MarketDataQuote).filter(
            and_(
                MarketDataQuote.ticker_id == ticker.id,
                MarketDataQuote.close_price.isnot(None),
                MarketDataQuote.asof_utc >= cutoff_20
            )
        ).count()
        
        print(f"   MA 20 (need 20+ quotes): {'✅' if quotes_20d >= 20 else '❌'} {quotes_20d} quotes")
        
        # Check quotes in last 150 days (for MA 150)
        cutoff_150 = datetime.utcnow() - timedelta(days=155)
        quotes_150d = db.query(MarketDataQuote).filter(
            and_(
                MarketDataQuote.ticker_id == ticker.id,
                MarketDataQuote.close_price.isnot(None),
                MarketDataQuote.asof_utc >= cutoff_150
            )
        ).count()
        
        print(f"   MA 150 (need 150+ quotes): {'✅' if quotes_150d >= 150 else '❌'} {quotes_150d} quotes")
        
        # Check quotes in last 365 days (for 52W)
        cutoff_52w = datetime.utcnow() - timedelta(days=365)
        quotes_52w = db.query(MarketDataQuote).filter(
            and_(
                MarketDataQuote.ticker_id == ticker.id,
                MarketDataQuote.high_price.isnot(None),
                MarketDataQuote.low_price.isnot(None),
                MarketDataQuote.asof_utc >= cutoff_52w
            )
        ).count()
        
        print(f"   52W Range (need 10+ quotes): {'✅' if quotes_52w >= 10 else '❌'} {quotes_52w} quotes")
        
        # Check cached calculations
        print(f"\n💾 Cached Calculations:")
        
        volatility_cache = advanced_cache_service.get(f"ticker_{ticker.id}_volatility_30")
        if volatility_cache is not None:
            print(f"   Volatility: ✅ {volatility_cache:.2f}%")
        else:
            print(f"   Volatility: ❌ Not cached")
        
        ma20_cache = advanced_cache_service.get(f"ticker_{ticker.id}_ma_20")
        if ma20_cache is not None:
            print(f"   MA 20: ✅ ${ma20_cache:.2f}")
        else:
            print(f"   MA 20: ❌ Not cached")
        
        ma150_cache = advanced_cache_service.get(f"ticker_{ticker.id}_ma_150")
        if ma150_cache is not None:
            print(f"   MA 150: ✅ ${ma150_cache:.2f}")
        else:
            print(f"   MA 150: ❌ Not cached")
        
        week52_cache = advanced_cache_service.get(f"ticker_{ticker.id}_week52")
        if week52_cache:
            print(f"   52W Range: ✅ High=${week52_cache.get('high', 'N/A'):.2f}, Low=${week52_cache.get('low', 'N/A'):.2f}")
        else:
            print(f"   52W Range: ❌ Not cached")
        
        # Check if data is fresh (less than 1 day old)
        if latest_quote:
            age_hours = (datetime.utcnow() - latest_quote.fetched_at.replace(tzinfo=None)).total_seconds() / 3600
            print(f"\n⏰ Data Freshness:")
            print(f"   Latest quote age: {age_hours:.1f} hours")
            if age_hours < 24:
                print(f"   Status: ✅ Fresh (less than 24 hours)")
            elif age_hours < 48:
                print(f"   Status: ⚠️  Stale (24-48 hours)")
            else:
                print(f"   Status: ❌ Very Stale (more than 48 hours)")
        
        # Summary
        print(f"\n{'='*60}")
        print(f"📋 Summary:")
        print(f"{'='*60}")
        
        all_sufficient = (
            quotes_30d >= 31 and
            quotes_20d >= 20 and
            quotes_150d >= 150 and
            quotes_52w >= 10
        )
        
        if all_sufficient:
            print("✅ All data is sufficient for calculations")
        else:
            print("⚠️  Some data is insufficient:")
            if quotes_30d < 31:
                print(f"   - Need {31 - quotes_30d} more quotes for Volatility")
            if quotes_20d < 20:
                print(f"   - Need {20 - quotes_20d} more quotes for MA 20")
            if quotes_150d < 150:
                print(f"   - Need {150 - quotes_150d} more quotes for MA 150")
            if quotes_52w < 10:
                print(f"   - Need {10 - quotes_52w} more quotes for 52W range")
        
        all_cached = (
            volatility_cache is not None and
            ma20_cache is not None and
            ma150_cache is not None and
            week52_cache is not None
        )
        
        if all_cached:
            print("✅ All calculations are cached")
        else:
            print("⚠️  Some calculations are not cached (will be calculated on-demand)")
        
        if latest_quote and age_hours < 24:
            print("✅ Data is fresh - reload should not be required")
        elif latest_quote and age_hours >= 24:
            print("⚠️  Data is stale - reload may be recommended")
        else:
            print("❌ No recent data - reload is required")
        
        print(f"{'='*60}\n")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python3 check_ticker_data.py <SYMBOL>")
        print("   or: python3 check_ticker_data.py --ticker-id <ID>")
        sys.exit(1)
    
    if sys.argv[1] == '--ticker-id':
        ticker_id = int(sys.argv[2])
        check_ticker_data(ticker_id=ticker_id)
    else:
        symbol = sys.argv[1]
        check_ticker_data(symbol=symbol)

