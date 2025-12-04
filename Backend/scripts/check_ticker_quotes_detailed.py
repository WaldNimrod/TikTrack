#!/usr/bin/env python3
"""
Check Ticker Quotes - Detailed Analysis
========================================

Detailed analysis of quotes for a ticker to identify gaps and issues.

Usage:
    python3 Backend/scripts/check_ticker_quotes_detailed.py NFLX
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

def check_ticker_quotes_detailed(symbol=None, ticker_id=None):
    """Detailed analysis of quotes"""
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
        print(f"📊 Detailed Quote Analysis: {ticker.symbol} (ID: {ticker.id})")
        print(f"{'='*60}\n")
        
        # Get all quotes ordered by date
        all_quotes = db.query(MarketDataQuote).filter(
            MarketDataQuote.ticker_id == ticker.id
        ).order_by(MarketDataQuote.asof_utc).all()
        
        print(f"Total Quotes: {len(all_quotes)}\n")
        
        # Check for gaps in dates
        if len(all_quotes) > 1:
            print("📅 Date Gaps Analysis:")
            gaps = []
            for i in range(1, len(all_quotes)):
                prev_date = all_quotes[i-1].asof_utc
                curr_date = all_quotes[i].asof_utc
                days_diff = (curr_date - prev_date).days
                
                if days_diff > 1:
                    gaps.append({
                        'from': prev_date,
                        'to': curr_date,
                        'days': days_diff
                    })
            
            if gaps:
                print(f"   Found {len(gaps)} gaps:")
                for gap in gaps[:10]:  # Show first 10 gaps
                    print(f"   - {gap['from'].date()} to {gap['to'].date()} ({gap['days']} days)")
                if len(gaps) > 10:
                    print(f"   ... and {len(gaps) - 10} more gaps")
            else:
                print("   ✅ No gaps found - dates are continuous")
        
        # Check quotes in last 150 days
        cutoff_150 = datetime.utcnow() - timedelta(days=155)
        quotes_150d = db.query(MarketDataQuote).filter(
            and_(
                MarketDataQuote.ticker_id == ticker.id,
                MarketDataQuote.close_price.isnot(None),
                MarketDataQuote.asof_utc >= cutoff_150
            )
        ).order_by(MarketDataQuote.asof_utc).all()
        
        print(f"\n📊 Quotes in Last 155 Days (for MA 150):")
        print(f"   Total: {len(quotes_150d)}")
        print(f"   Need: 150")
        print(f"   Status: {'✅' if len(quotes_150d) >= 150 else '❌'} {'Sufficient' if len(quotes_150d) >= 150 else f'Missing {150 - len(quotes_150d)} quotes'}")
        
        if quotes_150d:
            print(f"   Date Range: {quotes_150d[0].asof_utc.date()} to {quotes_150d[-1].asof_utc.date()}")
            print(f"   First Quote: {quotes_150d[0].asof_utc}")
            print(f"   Last Quote: {quotes_150d[-1].asof_utc}")
        
        # Check quotes by date range
        print(f"\n📅 Quotes by Date Range:")
        ranges = [
            (1, "Last 1 day"),
            (7, "Last 7 days"),
            (30, "Last 30 days"),
            (60, "Last 60 days"),
            (90, "Last 90 days"),
            (120, "Last 120 days"),
            (150, "Last 150 days"),
            (365, "Last 365 days")
        ]
        
        for days, label in ranges:
            cutoff = datetime.utcnow() - timedelta(days=days + 5)
            count = db.query(MarketDataQuote).filter(
                and_(
                    MarketDataQuote.ticker_id == ticker.id,
                    MarketDataQuote.close_price.isnot(None),
                    MarketDataQuote.asof_utc >= cutoff
                )
            ).count()
            print(f"   {label:20s}: {count:3d} quotes")
        
        # Check data quality
        print(f"\n🔍 Data Quality:")
        quotes_with_all_fields = db.query(MarketDataQuote).filter(
            and_(
                MarketDataQuote.ticker_id == ticker.id,
                MarketDataQuote.open_price.isnot(None),
                MarketDataQuote.high_price.isnot(None),
                MarketDataQuote.low_price.isnot(None),
                MarketDataQuote.close_price.isnot(None)
            )
        ).count()
        
        print(f"   Quotes with all OHLC fields: {quotes_with_all_fields}")
        print(f"   Quotes with close_price only: {len(all_quotes) - quotes_with_all_fields}")
        
        print(f"\n{'='*60}\n")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python3 check_ticker_quotes_detailed.py <SYMBOL>")
        sys.exit(1)
    
    symbol = sys.argv[1]
    check_ticker_quotes_detailed(symbol=symbol)

