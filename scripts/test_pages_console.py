#!/usr/bin/env python3
"""
Script to test all pages and check for console errors
This script will help identify issues across all pages
"""

import requests
import time
import json
from datetime import datetime
from pathlib import Path

BASE_URL = "http://localhost:8080"

PAGES_TO_TEST = [
    {"name": "דף הבית", "url": "/", "priority": "high"},
    {"name": "טריידים", "url": "/trades.html", "priority": "high"},
    {"name": "תכניות מסחר", "url": "/trade_plans.html", "priority": "high"},
    {"name": "התראות", "url": "/alerts.html", "priority": "high"},
    {"name": "טיקרים", "url": "/tickers.html", "priority": "high"},
    {"name": "דשבורד טיקר", "url": "/ticker-dashboard.html", "priority": "medium"},
    {"name": "חשבונות מסחר", "url": "/trading_accounts.html", "priority": "high"},
    {"name": "ביצועים", "url": "/executions.html", "priority": "high"},
    {"name": "תזרימי מזומן", "url": "/cash_flows.html", "priority": "high"},
    {"name": "הערות", "url": "/notes.html", "priority": "high"},
    {"name": "מחקר", "url": "/research.html", "priority": "medium"},
    {"name": "ניתוח AI", "url": "/ai-analysis.html", "priority": "medium"},
    {"name": "העדפות", "url": "/preferences.html", "priority": "high"},
    {"name": "פרופיל משתמש", "url": "/user-profile.html", "priority": "medium"},
]

def test_page(page_info):
    """Test a single page"""
    url = BASE_URL + page_info["url"]
    result = {
        "page": page_info["name"],
        "url": page_info["url"],
        "status_code": None,
        "success": False,
        "response_time": None,
        "has_header": False,
        "has_core_systems": False,
        "errors": [],
        "timestamp": datetime.now().isoformat()
    }
    
    try:
        start_time = time.time()
        response = requests.get(url, timeout=10)
        result["response_time"] = time.time() - start_time
        result["status_code"] = response.status_code
        
        if response.status_code == 200:
            result["success"] = True
            content = response.text
            
            # Check for header
            if 'unified-header' in content or 'app-header' in content or 'header-container' in content:
                result["has_header"] = True
            
            # Check for core systems
            if 'initializeUnifiedApp' in content or 'core-systems.js' in content:
                result["has_core_systems"] = True
            
            # Check for common error patterns in HTML
            if 'Maximum call stack size exceeded' in content:
                result["errors"].append("Maximum call stack size exceeded found in page")
            if 'Uncaught' in content and 'Error' in content:
                result["errors"].append("Uncaught error pattern found in page")
                
        else:
            result["errors"].append(f"HTTP {response.status_code}")
            
    except requests.exceptions.Timeout:
        result["errors"].append("Request timeout")
    except requests.exceptions.ConnectionError:
        result["errors"].append("Connection error - server may be down")
    except Exception as e:
        result["errors"].append(f"Exception: {str(e)}")
    
    return result

def main():
    """Main test function"""
    print("=" * 80)
    print("🔍 בדיקת כל העמודים במערכת")
    print("=" * 80)
    print(f"Base URL: {BASE_URL}")
    print(f"Total pages to test: {len(PAGES_TO_TEST)}")
    print(f"Start time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 80)
    print()
    
    results = []
    
    # Test high priority pages first
    high_priority = [p for p in PAGES_TO_TEST if p["priority"] == "high"]
    medium_priority = [p for p in PAGES_TO_TEST if p["priority"] == "medium"]
    
    all_pages = high_priority + medium_priority
    
    for i, page in enumerate(all_pages, 1):
        print(f"[{i}/{len(all_pages)}] Testing: {page['name']} ({page['url']})")
        result = test_page(page)
        results.append(result)
        
        status_icon = "✅" if result["success"] else "❌"
        print(f"  {status_icon} Status: {result['status_code']} | Time: {result['response_time']:.2f}s")
        if result["errors"]:
            print(f"  ⚠️  Errors: {', '.join(result['errors'])}")
        print()
        
        time.sleep(0.5)  # Small delay between requests
    
    # Summary
    print("=" * 80)
    print("📊 סיכום תוצאות")
    print("=" * 80)
    
    successful = [r for r in results if r["success"]]
    failed = [r for r in results if not r["success"]]
    with_errors = [r for r in results if r["errors"]]
    
    print(f"✅ עמודים מוצלחים: {len(successful)}/{len(results)}")
    print(f"❌ עמודים כושלים: {len(failed)}/{len(results)}")
    print(f"⚠️  עמודים עם שגיאות: {len(with_errors)}/{len(results)}")
    print()
    
    if failed:
        print("❌ עמודים כושלים:")
        for r in failed:
            print(f"  - {r['page']} ({r['url']}): {', '.join(r['errors'])}")
        print()
    
    if with_errors:
        print("⚠️  עמודים עם שגיאות:")
        for r in with_errors:
            print(f"  - {r['page']} ({r['url']}): {', '.join(r['errors'])}")
        print()
    
    # Save results to file
    output_file = Path(__file__).parent.parent / "test_pages_results.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump({
            "timestamp": datetime.now().isoformat(),
            "base_url": BASE_URL,
            "total_pages": len(results),
            "successful": len(successful),
            "failed": len(failed),
            "with_errors": len(with_errors),
            "results": results
        }, f, ensure_ascii=False, indent=2)
    
    print(f"💾 תוצאות נשמרו ל: {output_file}")
    print()
    print("=" * 80)
    print(f"✅ בדיקה הושלמה: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 80)

if __name__ == "__main__":
    main()


