#!/usr/bin/env python3
"""
Activate Yahoo Finance Provider and Fetch Test Data
Simple script to test Yahoo Finance integration
"""

import sys
import os
from datetime import datetime, timezone

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def main():
    """Main function to activate Yahoo Finance"""
    print("🚀 הפעלת Yahoo Finance Provider")
    print("="*50)
    
    try:
        # Import required modules
        from config.database import SessionLocal
        from services.external_data.yahoo_finance_adapter import YahooFinanceAdapter
        from models.ticker import Ticker
        
        print("✅ Modules imported successfully")
        
        # Get database session
        db_session = SessionLocal()
        print("✅ Database session created")
        
        try:
            # Create Yahoo Finance adapter
            adapter = YahooFinanceAdapter(db_session, provider_id=1)
            print("✅ Yahoo Finance adapter created")
            
            # Get provider status
            status = adapter.get_provider_status()
            print(f"📊 Provider Status: {status['is_active']} (Healthy: {status['is_healthy']})")
            
            # Get some tickers from database
            tickers = db_session.query(Ticker).limit(3).all()
            symbols = [ticker.symbol for ticker in tickers]
            print(f"📈 Testing with symbols: {symbols}")
            
            # Fetch quotes
            print("🔄 Fetching quotes...")
            quotes = adapter.get_quotes_batch(symbols)
            
            if quotes:
                print(f"✅ Successfully fetched {len(quotes)} quotes:")
                for quote in quotes:
                    price_str = f"${quote.price:.2f}" if quote.price is not None else "N/A"
                    change_str = f"{quote.change_pct:+.2f}%" if quote.change_pct is not None else "N/A"
                    print(f"   {quote.symbol}: {price_str} ({change_str})")
            else:
                print("⚠️ No quotes fetched")
            
            # Get updated status
            updated_status = adapter.get_provider_status()
            print(f"📊 Updated Status - Last Request: {updated_status['last_successful_request']}")
            
            print("\n🎉 Yahoo Finance activation completed!")
            return True
            
        finally:
            db_session.close()
            print("✅ Database session closed")
        
    except Exception as e:
        print(f"❌ Error activating Yahoo Finance: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
