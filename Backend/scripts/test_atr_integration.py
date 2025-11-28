#!/usr/bin/env python3
"""
Test ATR Integration
====================

Tests the complete ATR integration:
1. Preference loading and saving
2. ATR calculation from database
3. ATR calculation from provider
4. ATR display in entity details

Usage:
    python3 Backend/scripts/test_atr_integration.py
"""

import os
import sys
from datetime import datetime, timezone, timedelta

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy.orm import Session
from config.database import SessionLocal
from models.ticker import Ticker
from models.external_data import MarketDataQuote
from services.external_data.atr_calculator import ATRCalculator
from services.external_data.yahoo_finance_adapter import YahooFinanceAdapter
from services.preferences_service import PreferencesService
from services.entity_details_service import EntityDetailsService

def test_preference_loading():
    """Test loading atr_period preference"""
    print("\n=== Test 1: Loading atr_period preference ===")
    db: Session = SessionLocal()
    try:
        prefs_service = PreferencesService()
        
        # Test with user_id=1
        prefs = prefs_service.get_preferences_by_names(user_id=1, names=['atr_period'])
        atr_period = prefs.get('atr_period')
        
        print(f"✅ Loaded atr_period preference: {atr_period}")
        return atr_period
    except Exception as e:
        print(f"❌ Error loading preference: {e}")
        return None
    finally:
        db.close()

def test_preference_saving():
    """Test saving atr_period preference"""
    print("\n=== Test 2: Saving atr_period preference ===")
    db: Session = SessionLocal()
    try:
        prefs_service = PreferencesService()
        
        # Save atr_period = 20
        success = prefs_service.save_preference(
            user_id=1,
            preference_name='atr_period',
            value=20
        )
        
        if success:
            print("✅ Saved atr_period = 20")
            
            # Verify it was saved
            prefs = prefs_service.get_preferences_by_names(user_id=1, names=['atr_period'])
            saved_value = prefs.get('atr_period')
            print(f"✅ Verified saved value: {saved_value}")
            return True
        else:
            print("❌ Failed to save preference")
            return False
    except Exception as e:
        print(f"❌ Error saving preference: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        db.close()

def test_atr_calculation_from_database():
    """Test ATR calculation from database"""
    print("\n=== Test 3: ATR calculation from database ===")
    db: Session = SessionLocal()
    try:
        # Find a ticker with historical data
        ticker = db.query(Ticker).first()
        if not ticker:
            print("❌ No tickers found in database")
            return None
        
        print(f"📊 Testing with ticker: {ticker.symbol} (ID: {ticker.id})")
        
        # Check if we have historical data
        quotes_count = db.query(MarketDataQuote).filter(
            MarketDataQuote.ticker_id == ticker.id,
            MarketDataQuote.open_price.isnot(None),
            MarketDataQuote.high_price.isnot(None),
            MarketDataQuote.low_price.isnot(None),
            MarketDataQuote.close_price.isnot(None)
        ).count()
        
        print(f"📊 Found {quotes_count} quotes with OHLC data")
        
        if quotes_count < 15:
            print(f"⚠️  Insufficient data for ATR calculation (need 15+, have {quotes_count})")
            return None
        
        # Calculate ATR
        calculator = ATRCalculator(db)
        result = calculator.calculate_atr_from_database(ticker.id, period=14)
        
        if result:
            print(f"✅ ATR calculated from database: {result.atr:.4f} (period: {result.period}, source: {result.source})")
            return result
        else:
            print("❌ Failed to calculate ATR from database")
            return None
    except Exception as e:
        print(f"❌ Error calculating ATR: {e}")
        import traceback
        traceback.print_exc()
        return None
    finally:
        db.close()

def test_atr_calculation_from_provider():
    """Test ATR calculation from provider"""
    print("\n=== Test 4: ATR calculation from provider ===")
    db: Session = SessionLocal()
    try:
        # Find a ticker
        ticker = db.query(Ticker).first()
        if not ticker:
            print("❌ No tickers found in database")
            return None
        
        print(f"📊 Testing with ticker: {ticker.symbol} (ID: {ticker.id})")
        
        # Calculate ATR from provider
        calculator = ATRCalculator(db)
        adapter = YahooFinanceAdapter(db)
        result = calculator.calculate_atr_from_provider(ticker.symbol, period=14, adapter=adapter, ticker_id=ticker.id)
        
        if result:
            print(f"✅ ATR calculated from provider: {result.atr:.4f} (period: {result.period}, source: {result.source})")
            if result.warnings:
                print(f"⚠️  Warnings: {result.warnings}")
            return result
        else:
            print("❌ Failed to calculate ATR from provider")
            return None
    except Exception as e:
        print(f"❌ Error calculating ATR from provider: {e}")
        import traceback
        traceback.print_exc()
        return None
    finally:
        db.close()

def test_atr_in_entity_details():
    """Test ATR in entity details"""
    print("\n=== Test 5: ATR in entity details ===")
    db: Session = SessionLocal()
    try:
        # Find a trade or execution with a ticker
        from models.trade import Trade
        trade = db.query(Trade).filter(Trade.ticker_id.isnot(None)).first()
        
        if not trade:
            print("❌ No trades with tickers found")
            return None
        
        print(f"📊 Testing with trade ID: {trade.id}, ticker: {trade.ticker.symbol if trade.ticker else 'N/A'}")
        
        # Get entity details
        entity_details = EntityDetailsService.get_entity_details(
            db=db,
            entity_type='trade',
            entity_id=trade.id
        )
        
        if entity_details and 'ticker' in entity_details:
            ticker_data = entity_details['ticker']
            atr = ticker_data.get('atr')
            atr_period = ticker_data.get('atr_period')
            atr_warnings = ticker_data.get('atr_warnings', [])
            
            if atr is not None:
                print(f"✅ ATR found in entity details: {atr:.4f} (period: {atr_period})")
                if atr_warnings:
                    print(f"⚠️  Warnings: {atr_warnings}")
                return True
            else:
                print("❌ ATR not found in entity details (value is None)")
                return False
        else:
            print("❌ Entity details not found or missing ticker data")
            return False
    except Exception as e:
        print(f"❌ Error getting entity details: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        db.close()

def main():
    """Run all tests"""
    print("🧪 Testing ATR Integration")
    print("=" * 50)
    
    # Test 1: Preference loading
    atr_period = test_preference_loading()
    
    # Test 2: Preference saving
    test_preference_saving()
    
    # Test 3: ATR from database
    db_result = test_atr_calculation_from_database()
    
    # Test 4: ATR from provider
    provider_result = test_atr_calculation_from_provider()
    
    # Test 5: ATR in entity details
    entity_result = test_atr_in_entity_details()
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 Test Summary:")
    print(f"   Preference loading: {'✅' if atr_period else '❌'}")
    print(f"   ATR from database: {'✅' if db_result else '❌'}")
    print(f"   ATR from provider: {'✅' if provider_result else '❌'}")
    print(f"   ATR in entity details: {'✅' if entity_result else '❌'}")

if __name__ == "__main__":
    main()

