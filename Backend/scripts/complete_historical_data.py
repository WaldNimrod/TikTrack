#!/usr/bin/env python3
"""
Script to complete historical data for all tickers by calling the refresh/full endpoint.
This ensures all tickers have 150 quotes and all technical indicators are calculated.
"""

import os
import sys
import requests
import time
from datetime import datetime, timezone

# Add the Backend directory to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from config.database import SessionLocal
from models.ticker import Ticker

def complete_historical_data_for_all_tickers(
    base_url: str = "http://127.0.0.1:8080",
    verify_after: bool = True
):
    """
    Complete historical data for all tickers by calling the refresh/full endpoint.
    
    Args:
        base_url: Base URL of the Flask server
        verify_after: Whether to verify the data after completion
    """
    print("================================================================================")
    print("Complete Historical Data for All Tickers")
    print("================================================================================")
    print(f"Timestamp: {datetime.now(timezone.utc).isoformat()}")
    print(f"Server URL: {base_url}")
    print()
    
    # First, check how many tickers we have
    session = SessionLocal()
    try:
        tickers = session.query(Ticker).filter(Ticker.status == 'open').all()
        print(f"Found {len(tickers)} open tickers")
        print()
    finally:
        session.close()
    
    # Call the refresh/full endpoint
    endpoint = f"{base_url}/api/external-data/refresh/full"
    print(f"🔄 Calling {endpoint}...")
    print()
    
    start_time = datetime.now()
    try:
        response = requests.post(
            endpoint,
            json={},
            headers={"Content-Type": "application/json"},
            timeout=600  # 10 minutes timeout
        )
        
        duration = (datetime.now() - start_time).total_seconds()
        
        if response.status_code == 200 or response.status_code == 207:
            data = response.json()
            print("✅ Refresh completed successfully!")
            print()
            
            if "data" in data:
                data_info = data["data"]
                print("Summary:")
                print(f"  Requested tickers: {data_info.get('requested', 0)}")
                print(f"  Current quotes loaded: {data_info.get('current_quotes_loaded', 0)}")
                print(f"  Failed symbols: {len(data_info.get('failed_symbols', []))}")
                if data_info.get('failed_symbols'):
                    print(f"    Failed: {', '.join(data_info.get('failed_symbols', [])[:10])}")
                
                if "historical_data" in data_info:
                    hist_data = data_info["historical_data"]
                    print()
                    print("Historical Data:")
                    print(f"  Tickers with historical data: {hist_data.get('tickers_with_historical', 0)}")
                    print(f"  Total historical quotes: {hist_data.get('total_historical_quotes', 0)}")
                    avg_quotes = hist_data.get('average_quotes_per_ticker', 0)
                    print(f"  Average quotes per ticker: {avg_quotes}")
                    
                    if avg_quotes < 140:
                        print(f"  ⚠️ WARNING: Average quotes per ticker is below 140 (expected ~150)")
                    else:
                        print(f"  ✅ Average quotes per ticker looks good (expected ~150)")
                
                if "technical_indicators" in data_info:
                    tech_data = data_info["technical_indicators"]
                    print()
                    print("Technical Indicators:")
                    print(f"  Total calculated: {tech_data.get('total_calculated', 0)}")
                    print(f"  Tickers with indicators: {tech_data.get('tickers_with_indicators', 0)}")
                
                if "performance" in data_info:
                    perf_data = data_info["performance"]
                    print()
                    print("Performance:")
                    print(f"  Duration: {perf_data.get('duration_seconds', 0):.2f} seconds")
                    print(f"  Start time: {perf_data.get('start_time', 'N/A')}")
                    print(f"  End time: {perf_data.get('end_time', 'N/A')}")
                
                if "ticker_errors" in data_info and data_info["ticker_errors"]:
                    print()
                    print(f"⚠️ Ticker Errors ({len(data_info['ticker_errors'])}):")
                    for error in data_info["ticker_errors"][:10]:
                        print(f"  - {error.get('symbol', 'N/A')} (ID: {error.get('ticker_id', 'N/A')}): {error.get('error', 'N/A')}")
                    if len(data_info["ticker_errors"]) > 10:
                        print(f"  ... and {len(data_info['ticker_errors']) - 10} more errors")
            
            print()
            print(f"Total script duration: {duration:.2f} seconds")
            
            # Verify the data if requested
            if verify_after:
                print()
                print("================================================================================")
                print("Verifying Historical Data...")
                print("================================================================================")
                
                # Import and run verification scripts
                try:
                    # Import verification functions directly
                    import importlib.util
                    import sys
                    
                    # Load verify_historical_quotes
                    hist_script_path = os.path.join(os.path.dirname(__file__), 'verify_historical_quotes.py')
                    spec = importlib.util.spec_from_file_location("verify_historical_quotes", hist_script_path)
                    hist_module = importlib.util.module_from_spec(spec)
                    sys.modules["verify_historical_quotes"] = hist_module
                    spec.loader.exec_module(hist_module)
                    verify_historical_quotes = hist_module.verify_historical_quotes
                    
                    # Load verify_technical_indicators
                    tech_script_path = os.path.join(os.path.dirname(__file__), 'verify_technical_indicators.py')
                    spec = importlib.util.spec_from_file_location("verify_technical_indicators", tech_script_path)
                    tech_module = importlib.util.module_from_spec(spec)
                    sys.modules["verify_technical_indicators"] = tech_module
                    spec.loader.exec_module(tech_module)
                    verify_technical_indicators = tech_module.verify_technical_indicators
                    
                    session = SessionLocal()
                    try:
                        # Verify historical quotes
                        print()
                        print("1. Verifying Historical Quotes...")
                        hist_report = verify_historical_quotes(session, min_quotes_required=120)
                        print(f"   Tickers checked: {hist_report['tickers_checked']}")
                        print(f"   ✓ OK: {hist_report['ok']}")
                        print(f"   ⚠ With issues: {hist_report['with_issues']}")
                        print(f"   ✗ No quotes: {hist_report['no_quotes']}")
                        print(f"   Total quotes: {hist_report['total_quotes']}")
                        
                        # Calculate average quotes per ticker
                        if hist_report['tickers_checked'] > 0:
                            avg_quotes = hist_report['total_quotes'] / hist_report['tickers_checked']
                            print(f"   Average quotes per ticker: {avg_quotes:.2f}")
                            if avg_quotes >= 140:
                                print(f"   ✅ Average quotes per ticker is good (>= 140)")
                            else:
                                print(f"   ⚠️ Average quotes per ticker is below 140")
                        
                        # Verify technical indicators
                        print()
                        print("2. Verifying Technical Indicators...")
                        tech_report = verify_technical_indicators(session)
                        print(f"   Tickers checked: {tech_report['tickers_checked']}")
                        print(f"   ✓ All indicators OK: {tech_report['ok']}")
                        print(f"   ⚠ Partial indicators: {tech_report['with_issues']}")
                        print(f"   ✗ No indicators: {tech_report.get('no_indicators', 0)}")
                        
                    finally:
                        session.close()
                    
                except Exception as verify_error:
                    print(f"⚠️ Error during verification: {verify_error}")
                    import traceback
                    traceback.print_exc()
            
        else:
            print(f"❌ Refresh failed with status code {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except requests.exceptions.Timeout:
        print(f"❌ Request timed out after 600 seconds")
        return False
    except requests.exceptions.ConnectionError:
        print(f"❌ Connection error: Could not connect to {base_url}")
        print("   Make sure the Flask server is running on port 8080")
        return False
    except Exception as e:
        print(f"❌ Error calling refresh/full endpoint: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    print()
    print("================================================================================")
    return True

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Complete historical data for all tickers")
    parser.add_argument(
        "--url",
        default="http://127.0.0.1:8080",
        help="Base URL of the Flask server (default: http://127.0.0.1:8080)"
    )
    parser.add_argument(
        "--no-verify",
        action="store_true",
        help="Skip verification after completion"
    )
    
    args = parser.parse_args()
    
    success = complete_historical_data_for_all_tickers(
        base_url=args.url,
        verify_after=not args.no_verify
    )
    
    sys.exit(0 if success else 1)

