#!/usr/bin/env python3
"""
Calculate Ticker Technical Indicators
======================================

Force calculation of all technical indicators for a ticker and cache them.

Usage:
    python3 Backend/scripts/calculate_ticker_indicators.py NFLX
    python3 Backend/scripts/calculate_ticker_indicators.py --ticker-id 422
"""

import sys
import os
from datetime import datetime, timedelta

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config.database import SessionLocal
from models.ticker import Ticker
from services.external_data.technical_indicators_calculator import TechnicalIndicatorsCalculator
from services.external_data.week52_calculator import Week52Calculator
from services.advanced_cache_service import advanced_cache_service

def calculate_indicators(symbol=None, ticker_id=None):
    """Calculate and cache all technical indicators for a ticker"""
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
        print(f"📊 Calculating Technical Indicators: {ticker.symbol} (ID: {ticker.id})")
        print(f"{'='*60}\n")
        
        tech_calculator = TechnicalIndicatorsCalculator(db)
        week52_calculator = Week52Calculator(db)
        
        # Calculate Volatility
        print("📊 Calculating Volatility...")
        try:
            volatility = tech_calculator.calculate_volatility(ticker.id, period=30, db_session=db)
            if volatility is not None:
                volatility_cache_key = f"ticker_{ticker.id}_volatility_30"
                advanced_cache_service.set(volatility_cache_key, volatility, ttl=3600)
                print(f"   ✅ Volatility: {volatility:.2f}% (cached)")
            else:
                print(f"   ❌ Volatility: Calculation returned None")
        except Exception as e:
            print(f"   ❌ Volatility: Error - {e}")
        
        # Calculate MA 20
        print("\n📊 Calculating MA 20...")
        try:
            sma_20 = tech_calculator.calculate_sma(ticker.id, period=20, db_session=db)
            if sma_20 is not None:
                ma20_cache_key = f"ticker_{ticker.id}_ma_20"
                advanced_cache_service.set(ma20_cache_key, sma_20, ttl=3600)
                print(f"   ✅ MA 20: ${sma_20:.2f} (cached)")
            else:
                print(f"   ❌ MA 20: Calculation returned None")
        except Exception as e:
            print(f"   ❌ MA 20: Error - {e}")
        
        # Calculate MA 150
        print("\n📊 Calculating MA 150...")
        try:
            sma_150 = tech_calculator.calculate_sma(ticker.id, period=150, db_session=db)
            if sma_150 is not None:
                ma150_cache_key = f"ticker_{ticker.id}_ma_150"
                advanced_cache_service.set(ma150_cache_key, sma_150, ttl=3600)
                print(f"   ✅ MA 150: ${sma_150:.2f} (cached)")
            else:
                print(f"   ❌ MA 150: Calculation returned None")
        except Exception as e:
            print(f"   ❌ MA 150: Error - {e}")
        
        # Calculate 52W Range
        print("\n📊 Calculating 52W Range...")
        try:
            week52_result = week52_calculator.calculate_52w_range(ticker.id, db_session=db)
            if week52_result:
                week52_cache_key = f"ticker_{ticker.id}_week52"
                week52_dict = {
                    'high': week52_result.high,
                    'low': week52_result.low,
                    'warnings': week52_result.warnings if hasattr(week52_result, 'warnings') else []
                }
                advanced_cache_service.set(week52_cache_key, week52_dict, ttl=3600)
                print(f"   ✅ 52W Range: High=${week52_result.high:.2f}, Low=${week52_result.low:.2f} (cached)")
            else:
                print(f"   ❌ 52W Range: Calculation returned None")
        except Exception as e:
            print(f"   ❌ 52W Range: Error - {e}")
        
        print(f"\n{'='*60}")
        print(f"✅ Calculation complete for {ticker.symbol}")
        print(f"{'='*60}\n")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python3 calculate_ticker_indicators.py <SYMBOL>")
        print("   or: python3 calculate_ticker_indicators.py --ticker-id <ID>")
        sys.exit(1)
    
    if sys.argv[1] == '--ticker-id':
        ticker_id = int(sys.argv[2])
        calculate_indicators(ticker_id=ticker_id)
    else:
        symbol = sys.argv[1]
        calculate_indicators(symbol=symbol)

