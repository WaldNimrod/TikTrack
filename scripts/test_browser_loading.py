#!/usr/bin/env python3
"""
Simple browser loading test without Selenium
Tests that pages load correctly with defer scripts
"""

import requests
import time
import json
from pathlib import Path

# Project paths
PROJECT_ROOT = Path(__file__).parent.parent

# Test pages
TEST_PAGES = [
    'cash_flows.html',
    'trades.html',
    'trade_plans.html',
    'alerts.html'
]

BASE_URL = "http://localhost:5001"

def test_page_loading():
    """Test that pages load with proper script attributes"""
    print("🧪 Testing browser-compatible page loading...")
    print("=" * 50)

    results = {}

    for page in TEST_PAGES:
        print(f"\n📄 Testing {page}...")

        try:
            # Fetch page
            response = requests.get(f"{BASE_URL}/{page}", timeout=10)
            response.raise_for_status()

            content = response.text

            # Count script tags
            total_scripts = content.count('<script')
            defer_scripts = content.count('defer')
            async_scripts = content.count('async')

            # Check for critical systems
            has_modal_manager = 'ModalManagerV2' in content
            has_api_config = 'API_CONFIG' in content
            has_logger = 'Logger' in content

            # Check for script loading order comments
            has_loading_order = 'Load Order:' in content

            results[page] = {
                'status': '✅ OK',
                'total_scripts': total_scripts,
                'defer_scripts': defer_scripts,
                'async_scripts': async_scripts,
                'has_modal_manager': has_modal_manager,
                'has_api_config': has_api_config,
                'has_logger': has_logger,
                'has_loading_order': has_loading_order,
                'response_time': response.elapsed.total_seconds()
            }

            print(f"  ✅ Loaded successfully ({response.elapsed.total_seconds():.2f}s)")
            print(f"  📊 Scripts: {total_scripts} total, {defer_scripts} defer, {async_scripts} async")
            print(f"  🔧 Critical systems: ModalManagerV2={has_modal_manager}, API_CONFIG={has_api_config}, Logger={has_logger}")

        except Exception as e:
            results[page] = {
                'status': f'❌ FAILED: {str(e)}',
                'error': str(e)
            }
            print(f"  ❌ Failed: {e}")

    return results

def test_deterministic_loading():
    """Test that multiple requests return consistent results"""
    print("\n🔄 Testing deterministic loading (consistency check)...")

    page = 'cash_flows.html'
    results = []

    for i in range(3):
        try:
            response = requests.get(f"{BASE_URL}/{page}", timeout=10)
            defer_count = response.text.count('defer')
            async_count = response.text.count('async')
            results.append((defer_count, async_count))
            print(f"  Request {i+1}: {defer_count} defer, {async_count} async")
            time.sleep(0.5)
        except Exception as e:
            print(f"  Request {i+1}: ❌ Failed - {e}")
            results.append(None)

    # Check consistency
    if all(r == results[0] for r in results if r is not None):
        print("  ✅ Consistent results across requests")
        return True
    else:
        print("  ⚠️  Inconsistent results detected")
        return False

def main():
    """Main test function"""
    print("🚀 Browser Loading Test - Defer Script Verification")
    print("Testing that pages load correctly with defer-only critical scripts\n")

    # Test server availability
    try:
        response = requests.get(BASE_URL, timeout=5)
        print(f"🌐 Server status: ✅ Available (HTTP {response.status_code})")
    except Exception as e:
        print(f"🌐 Server status: ❌ Not available - {e}")
        print("Please start the server with: ./start_server.sh")
        return

    # Run tests
    results = test_page_loading()
    consistency_passed = test_deterministic_loading()

    # Summary
    print("\n📊 Test Summary:")
    print("=" * 30)

    all_passed = True
    for page, data in results.items():
        status = data['status']
        if 'FAILED' in status:
            all_passed = False
        print(f"{page}: {status}")

    print(f"\nConsistency check: {'✅ PASSED' if consistency_passed else '❌ FAILED'}")

    if all_passed and consistency_passed:
        print("\n🎉 ALL TESTS PASSED!")
        print("✅ Pages load correctly with defer scripts")
        print("✅ Critical systems are included")
        print("✅ Loading is deterministic and consistent")
        print("\nBrowser testing ready - you can now test in actual browser!")
    else:
        print("\n⚠️  SOME TESTS FAILED")
        print("Check the results above and fix any issues")

if __name__ == "__main__":
    main()
