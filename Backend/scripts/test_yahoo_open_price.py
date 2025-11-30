#!/usr/bin/env python3
"""
Test script to verify regularMarketOpen availability from Yahoo Finance API
This script fetches data for a test ticker and checks if regularMarketOpen is available
"""

import sys
import os
import json
from datetime import datetime

# Add parent directory to path
parent_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.insert(0, parent_dir)

# Change to parent directory for imports
os.chdir(parent_dir)

from services.external_data.yahoo_finance_adapter import YahooFinanceAdapter
from models.ticker import Ticker
from models.external_data import ExternalDataProvider
from config.database import SessionLocal

def test_yahoo_open_price(symbol='AAPL'):
    """Test fetching quote data and check for regularMarketOpen"""
    print(f"\n{'='*60}")
    print(f"Testing Yahoo Finance API for symbol: {symbol}")
    print(f"{'='*60}\n")
    
    db_session = None
    try:
        db_session = SessionLocal()
        
        # Get or create provider
        provider = db_session.query(ExternalDataProvider).filter(
            ExternalDataProvider.name == 'yahoo_finance'
        ).first()
        
        if not provider:
            print("❌ Yahoo Finance provider not found in database")
            return False
        
        print(f"✅ Found provider: {provider.name} (ID: {provider.id})")
        
        # Get or create ticker
        ticker = db_session.query(Ticker).filter(Ticker.symbol == symbol).first()
        
        if not ticker:
            print(f"⚠️  Ticker {symbol} not found in database. Creating test ticker...")
            ticker = Ticker(
                symbol=symbol,
                name=f"Test {symbol}",
                status='open',
                type='stock'
            )
            db_session.add(ticker)
            db_session.commit()
            print(f"✅ Created test ticker: {symbol} (ID: {ticker.id})")
        else:
            print(f"✅ Found ticker: {symbol} (ID: {ticker.id})")
        
        # Create adapter
        adapter = YahooFinanceAdapter(
            db_session=db_session,
            provider_id=provider.id
        )
        
        print(f"\n📡 Fetching quote data from Yahoo Finance...")
        
        # Fetch quote
        quote = adapter.fetch_quote(symbol)
        
        if not quote:
            print("❌ Failed to fetch quote data")
            return False
        
        print(f"\n{'='*60}")
        print("QUOTE DATA RECEIVED:")
        print(f"{'='*60}")
        print(f"Symbol: {quote.symbol}")
        print(f"Price: ${quote.price}")
        print(f"Currency: {quote.currency}")
        print(f"Change Amount (day): {quote.change_amount}")
        print(f"Change Percent (day): {quote.change_pct}%")
        print(f"Volume: {quote.volume}")
        
        # Check for open price fields
        print(f"\n{'='*60}")
        print("OPEN PRICE FIELDS CHECK:")
        print(f"{'='*60}")
        
        has_open_price = hasattr(quote, 'open_price') and quote.open_price is not None
        has_change_from_open = hasattr(quote, 'change_amount_from_open') and quote.change_amount_from_open is not None
        has_change_pct_from_open = hasattr(quote, 'change_pct_from_open') and quote.change_pct_from_open is not None
        
        print(f"open_price attribute exists: {hasattr(quote, 'open_price')}")
        print(f"open_price value: {quote.open_price if hasattr(quote, 'open_price') else 'N/A'}")
        print(f"change_amount_from_open attribute exists: {hasattr(quote, 'change_amount_from_open')}")
        print(f"change_amount_from_open value: {quote.change_amount_from_open if hasattr(quote, 'change_amount_from_open') else 'N/A'}")
        print(f"change_pct_from_open attribute exists: {hasattr(quote, 'change_pct_from_open')}")
        print(f"change_pct_from_open value: {quote.change_pct_from_open if hasattr(quote, 'change_pct_from_open') else 'N/A'}")
        
        if has_open_price:
            print(f"\n✅ SUCCESS: Open price data is available!")
            print(f"   Open Price: ${quote.open_price}")
            if has_change_from_open:
                print(f"   Change from Open: ${quote.change_amount_from_open:.2f}")
            if has_change_pct_from_open:
                print(f"   Change from Open %: {quote.change_pct_from_open:.2f}%")
            
            # Calculate expected values for verification
            if quote.price and quote.open_price:
                expected_change = quote.price - quote.open_price
                expected_change_pct = (expected_change / quote.open_price) * 100
                print(f"\n📊 Verification:")
                print(f"   Current Price: ${quote.price}")
                print(f"   Open Price: ${quote.open_price}")
                print(f"   Expected Change: ${expected_change:.2f}")
                print(f"   Expected Change %: {expected_change_pct:.2f}%")
                
                if has_change_from_open:
                    diff = abs(expected_change - quote.change_amount_from_open)
                    if diff < 0.01:  # Allow small floating point differences
                        print(f"   ✅ Calculated change matches expected value")
                    else:
                        print(f"   ⚠️  Calculated change differs: {diff:.4f}")
        else:
            print(f"\n❌ WARNING: Open price data is NOT available")
            print(f"   This means regularMarketOpen was not found in Yahoo Finance response")
            print(f"   Check the adapter logs for more details")
        
        print(f"\n{'='*60}\n")
        
        return has_open_price
        
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        if db_session:
            db_session.close()

if __name__ == '__main__':
    # Test with default symbol or use command line argument
    test_symbol = sys.argv[1] if len(sys.argv) > 1 else 'AAPL'
    success = test_yahoo_open_price(test_symbol)
    
    sys.exit(0 if success else 1)

