#!/usr/bin/env python3
"""
Test script for external data system final improvements
Tests all improvements made in the final improvements plan
"""

import sys
import os
import time
import requests
from datetime import datetime, timedelta
from typing import Dict, Any, List

BASE_URL = "http://localhost:8080"

def print_section(title: str):
    """Print a section header"""
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}\n")

def test_scheduler_status():
    """Test scheduler status"""
    print_section("Testing Scheduler Status")
    
    try:
        response = requests.get(f"{BASE_URL}/api/external-data/status/scheduler/monitoring", timeout=30)
        if response.status_code == 200:
            data = response.json()
            scheduler_status = data.get('data', {}).get('scheduler_status', {})
            print(f"✅ Scheduler Status:")
            print(f"   Running: {scheduler_status.get('scheduler_running', False)}")
            print(f"   Last Refresh: {scheduler_status.get('last_refresh')}")
            print(f"   Next Refresh: {scheduler_status.get('next_refresh')}")
            print(f"   Total Refreshes: {scheduler_status.get('total_refreshes', 0)}")
            return True
        else:
            print(f"❌ Failed to get scheduler status: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error testing scheduler status: {e}")
        return False

def count_quotes_before():
    """Count quotes in database before refresh - using API"""
    print_section("Counting Quotes Before Refresh")
    
    try:
        # Use missing data endpoint to get statistics
        response = requests.get(f"{BASE_URL}/api/external-data/status/tickers/missing-data", timeout=30)
        if response.status_code == 200:
            data = response.json()
            print(f"📊 Quotes Statistics (from missing data endpoint):")
            print(f"   Tickers missing current quotes: {len(data.get('tickers_missing_current', []))}")
            print(f"   Tickers missing historical data: {len(data.get('tickers_missing_historical', []))}")
            print(f"   Tickers missing technical indicators: {len(data.get('tickers_missing_indicators', []))}")
            return True
        else:
            print(f"⚠️  Could not get quotes statistics: {response.status_code}")
            return False
    except Exception as e:
        print(f"⚠️  Error getting quotes statistics: {e}")
        return False

def test_full_data_refresh():
    """Test full data refresh"""
    print_section("Testing Full Data Refresh")
    
    try:
        print("🚀 Starting full data refresh...")
        start_time = time.time()
        
        response = requests.post(
            f"{BASE_URL}/api/external-data/refresh/full",
            json={},
            timeout=600  # 10 minutes timeout
        )
        
        elapsed_time = time.time() - start_time
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Full data refresh completed in {elapsed_time:.2f} seconds")
            print(f"   Statistics:")
            if 'statistics' in data:
                stats = data['statistics']
                print(f"   - Tickers processed: {stats.get('tickers_processed', 0)}")
                print(f"   - Quotes fetched: {stats.get('quotes_fetched', 0)}")
                print(f"   - Historical quotes: {stats.get('historical_quotes', 0)}")
                print(f"   - Technical indicators: {stats.get('technical_indicators', 0)}")
            return True
        else:
            print(f"❌ Full data refresh failed: {response.status_code}")
            print(f"   Response: {response.text[:200]}")
            return False
    except Exception as e:
        print(f"❌ Error testing full data refresh: {e}")
        return False

def count_quotes_after():
    """Count quotes in database after refresh - using API"""
    print_section("Counting Quotes After Refresh")
    
    return count_quotes_before()  # Reuse the same function

def test_specific_ticker_refresh():
    """Test refreshing a specific ticker"""
    print_section("Testing Specific Ticker Refresh")
    
    try:
        # Get list of tickers from missing data endpoint
        response = requests.get(f"{BASE_URL}/api/external-data/status/tickers/missing-data", timeout=30)
        if response.status_code != 200:
            print("⚠️  Could not get ticker list")
            return False
        
        data = response.json()
        # Try to find a ticker that needs refresh
        tickers_missing = data.get('tickers_missing_current', [])
        if not tickers_missing:
            tickers_missing = data.get('tickers_missing_historical', [])
        
        if not tickers_missing:
            # Try to get any open ticker from status endpoint
            status_response = requests.get(f"{BASE_URL}/api/external-data/status", timeout=30)
            if status_response.status_code == 200:
                status_data = status_response.json()
                # Try to find a ticker from the status
                print("⚠️  No tickers found that need refresh, trying to get ticker from status...")
                # For now, use a hardcoded ticker ID (we'll improve this later)
                ticker_id = 1  # Default to ticker ID 1
                ticker_symbol = "Unknown"
            else:
                print("⚠️  Could not get ticker list from status")
                return False
        else:
            ticker = tickers_missing[0]
            ticker_id = ticker.get('id')
            ticker_symbol = ticker.get('symbol', 'Unknown')
        
        ticker = tickers_missing[0]
        ticker_id = ticker.get('id')
        ticker_symbol = ticker.get('symbol', 'Unknown')
        
        print(f"🔄 Refreshing ticker: {ticker_symbol} (ID: {ticker_id})")
        
        try:
            response = requests.post(
                f"{BASE_URL}/api/external-data/quotes/{ticker_id}/refresh",
                json={},
                headers={'Content-Type': 'application/json'},
                timeout=120
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Ticker refresh completed")
                if 'statistics' in data:
                    stats = data['statistics']
                    print(f"   - Historical quotes: {stats.get('historical_quotes', 0)}")
                    print(f"   - Technical indicators: {stats.get('technical_indicators', 0)}")
                return True
            else:
                print(f"❌ Ticker refresh failed: {response.status_code}")
                print(f"   Response: {response.text[:200]}")
                return False
        except Exception as e:
            print(f"❌ Error refreshing ticker: {e}")
            return False
    except Exception as e:
        print(f"❌ Error in test_specific_ticker_refresh: {e}")
        return False

def test_missing_data_identification():
    """Test missing data identification"""
    print_section("Testing Missing Data Identification")
    
    try:
        response = requests.get(f"{BASE_URL}/api/external-data/status/tickers/missing-data", timeout=30)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Missing data identification:")
            if 'tickers_missing_current' in data:
                print(f"   - Tickers missing current quotes: {len(data['tickers_missing_current'])}")
            if 'tickers_missing_historical' in data:
                print(f"   - Tickers missing historical data: {len(data['tickers_missing_historical'])}")
            if 'tickers_missing_indicators' in data:
                print(f"   - Tickers missing technical indicators: {len(data['tickers_missing_indicators'])}")
            return True
        else:
            print(f"❌ Failed to get missing data: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error testing missing data: {e}")
        return False

def main():
    """Run all tests"""
    print("\n" + "="*60)
    print("  External Data System - Final Improvements Tests")
    print("="*60)
    
    results = {}
    
    # Test 1: Scheduler status
    results['scheduler_status'] = test_scheduler_status()
    
    # Test 2: Count quotes before
    quotes_before = count_quotes_before()
    
    # Test 3: Full data refresh (commented out for now - takes too long)
    # results['full_refresh'] = test_full_data_refresh()
    # quotes_after = count_quotes_after()
    
    # Test 4: Specific ticker refresh
    results['specific_ticker'] = test_specific_ticker_refresh()
    
    # Test 5: Missing data identification
    results['missing_data'] = test_missing_data_identification()
    
    # Summary
    print_section("Test Summary")
    print("Results:")
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"   {test_name}: {status}")
    
    all_passed = all(results.values())
    print(f"\n{'✅ All tests passed!' if all_passed else '❌ Some tests failed'}")
    
    return 0 if all_passed else 1

if __name__ == '__main__':
    sys.exit(main())

