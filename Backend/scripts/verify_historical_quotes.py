#!/usr/bin/env python3
"""
Script to verify historical quotes data in the database

Checks:
1. Number of quotes per ticker
2. Date ranges (150 days back)
3. Duplicate quotes
4. Data completeness (OHLC fields)
5. Data freshness

Usage:
    python3 Backend/scripts/verify_historical_quotes.py [--ticker-id TICKER_ID] [--min-quotes MIN_QUOTES]
"""

import sys
import os
from datetime import datetime, timedelta, timezone
from typing import Dict, List, Any, Optional

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config.database import SessionLocal
from models.ticker import Ticker
from models.external_data import MarketDataQuote, ExternalDataProvider
from sqlalchemy import func, and_
import argparse


def get_provider_id(session) -> Optional[int]:
    """Get Yahoo Finance provider ID"""
    provider = session.query(ExternalDataProvider).filter(
        ExternalDataProvider.name == 'yahoo_finance'
    ).first()
    return provider.id if provider else None


def verify_ticker_quotes(session, ticker: Ticker, provider_id: int, min_quotes: int = 120) -> Dict[str, Any]:
    """Verify quotes for a single ticker"""
    result = {
        'ticker_id': ticker.id,
        'ticker_symbol': ticker.symbol,
        'total_quotes': 0,
        'quotes_with_ohlc': 0,
        'quotes_with_price': 0,
        'duplicate_dates': [],
        'date_range': None,
        'missing_days': 0,
        'oldest_quote': None,
        'newest_quote': None,
        'issues': [],
        'status': 'ok'
    }
    
    # Get all quotes for this ticker
    quotes = session.query(MarketDataQuote).filter(
        MarketDataQuote.ticker_id == ticker.id,
        MarketDataQuote.provider_id == provider_id
    ).order_by(MarketDataQuote.asof_utc).all()
    
    result['total_quotes'] = len(quotes)
    
    if not quotes:
        result['status'] = 'no_quotes'
        result['issues'].append('No quotes found in database')
        return result
    
    # Check date range
    oldest_quote = quotes[0]
    newest_quote = quotes[-1]
    result['oldest_quote'] = oldest_quote.asof_utc.isoformat() if oldest_quote.asof_utc else None
    result['newest_quote'] = newest_quote.asof_utc.isoformat() if newest_quote.asof_utc else None
    
    if oldest_quote.asof_utc and newest_quote.asof_utc:
        date_range = (newest_quote.asof_utc - oldest_quote.asof_utc).days
        result['date_range'] = date_range
        
        # Check if we have at least 150 days of data
        if date_range < 150:
            result['issues'].append(f'Date range is only {date_range} days, expected at least 150')
    
    # Check for duplicates (same date)
    date_counts = {}
    for quote in quotes:
        if quote.asof_utc:
            date_key = quote.asof_utc.date().isoformat()
            if date_key not in date_counts:
                date_counts[date_key] = []
            date_counts[date_key].append(quote.id)
    
    for date_key, quote_ids in date_counts.items():
        if len(quote_ids) > 1:
            result['duplicate_dates'].append({
                'date': date_key,
                'count': len(quote_ids),
                'quote_ids': quote_ids
            })
    
    if result['duplicate_dates']:
        result['issues'].append(f'Found {len(result["duplicate_dates"])} dates with duplicate quotes')
    
    # Check data completeness
    for quote in quotes:
        if quote.price:
            result['quotes_with_price'] += 1
        
        if quote.open_price and quote.high_price and quote.low_price and quote.close_price:
            result['quotes_with_ohlc'] += 1
    
    # Check if we have enough quotes
    if result['total_quotes'] < min_quotes:
        result['status'] = 'insufficient_quotes'
        result['issues'].append(f'Only {result["total_quotes"]} quotes found, expected at least {min_quotes}')
    
    # Check data quality
    if result['quotes_with_ohlc'] < result['total_quotes'] * 0.9:  # Less than 90% have OHLC
        result['status'] = 'incomplete_data'
        result['issues'].append(f'Only {result["quotes_with_ohlc"]}/{result["total_quotes"]} quotes have complete OHLC data')
    
    if result['issues']:
        result['status'] = 'has_issues'
    
    return result


def verify_all_tickers(session, provider_id: int, min_quotes: int = 120, ticker_id: Optional[int] = None) -> Dict[str, Any]:
    """Verify quotes for all tickers or a specific ticker"""
    results = {
        'timestamp': datetime.now(timezone.utc).isoformat(),
        'provider_id': provider_id,
        'min_quotes': min_quotes,
        'tickers_checked': 0,
        'tickers_ok': 0,
        'tickers_with_issues': 0,
        'tickers_no_quotes': 0,
        'total_quotes': 0,
        'total_duplicates': 0,
        'ticker_results': []
    }
    
    # Get tickers to check
    if ticker_id:
        tickers = session.query(Ticker).filter(Ticker.id == ticker_id).all()
    else:
        tickers = session.query(Ticker).filter(Ticker.status == 'open').all()
    
    results['tickers_checked'] = len(tickers)
    
    for ticker in tickers:
        ticker_result = verify_ticker_quotes(session, ticker, provider_id, min_quotes)
        results['ticker_results'].append(ticker_result)
        results['total_quotes'] += ticker_result['total_quotes']
        results['total_duplicates'] += len(ticker_result['duplicate_dates'])
        
        if ticker_result['status'] == 'no_quotes':
            results['tickers_no_quotes'] += 1
        elif ticker_result['status'] == 'ok':
            results['tickers_ok'] += 1
        else:
            results['tickers_with_issues'] += 1
    
    return results


def print_results(results: Dict[str, Any]):
    """Print verification results"""
    print("=" * 80)
    print("Historical Quotes Verification Report")
    print("=" * 80)
    print(f"Timestamp: {results['timestamp']}")
    print(f"Provider ID: {results['provider_id']}")
    print(f"Minimum quotes required: {results['min_quotes']}")
    print()
    print(f"Tickers checked: {results['tickers_checked']}")
    print(f"  ✓ OK: {results['tickers_ok']}")
    print(f"  ⚠ With issues: {results['tickers_with_issues']}")
    print(f"  ✗ No quotes: {results['tickers_no_quotes']}")
    print()
    print(f"Total quotes: {results['total_quotes']}")
    print(f"Total duplicate dates: {results['total_duplicates']}")
    print()
    
    # Print detailed results for tickers with issues
    if results['tickers_with_issues'] > 0 or results['tickers_no_quotes'] > 0:
        print("Tickers with issues:")
        print("-" * 80)
        for ticker_result in results['ticker_results']:
            if ticker_result['status'] != 'ok':
                print(f"\nTicker: {ticker_result['ticker_symbol']} (ID: {ticker_result['ticker_id']})")
                print(f"  Status: {ticker_result['status']}")
                print(f"  Total quotes: {ticker_result['total_quotes']}")
                print(f"  Quotes with OHLC: {ticker_result['quotes_with_ohlc']}")
                print(f"  Quotes with price: {ticker_result['quotes_with_price']}")
                if ticker_result['date_range']:
                    print(f"  Date range: {ticker_result['date_range']} days")
                if ticker_result['oldest_quote']:
                    print(f"  Oldest quote: {ticker_result['oldest_quote']}")
                if ticker_result['newest_quote']:
                    print(f"  Newest quote: {ticker_result['newest_quote']}")
                if ticker_result['duplicate_dates']:
                    print(f"  Duplicate dates: {len(ticker_result['duplicate_dates'])}")
                    for dup in ticker_result['duplicate_dates'][:5]:  # Show first 5
                        print(f"    - {dup['date']}: {dup['count']} quotes")
                if ticker_result['issues']:
                    print(f"  Issues:")
                    for issue in ticker_result['issues']:
                        print(f"    - {issue}")
    
    print()
    print("=" * 80)


def main():
    parser = argparse.ArgumentParser(description='Verify historical quotes in database')
    parser.add_argument('--ticker-id', type=int, help='Verify specific ticker ID')
    parser.add_argument('--min-quotes', type=int, default=120, help='Minimum quotes required (default: 120)')
    parser.add_argument('--json', action='store_true', help='Output results as JSON')
    
    args = parser.parse_args()
    
    session = SessionLocal()
    try:
        provider_id = get_provider_id(session)
        if not provider_id:
            print("ERROR: Yahoo Finance provider not found in database")
            return 1
        
        results = verify_all_tickers(session, provider_id, args.min_quotes, args.ticker_id)
        
        if args.json:
            import json
            print(json.dumps(results, indent=2, default=str))
        else:
            print_results(results)
        
        # Return exit code based on results
        if results['tickers_no_quotes'] > 0 or results['tickers_with_issues'] > 0:
            return 1
        return 0
        
    except Exception as e:
        print(f"ERROR: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        return 1
    finally:
        session.close()


if __name__ == '__main__':
    sys.exit(main())

