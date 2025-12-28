#!/usr/bin/env python3
"""
Comprehensive script to test ALL pages from PAGES_LIST.md
This script will check all pages: main, technical, secondary, auth, dev tools, etc.
"""

import requests
import time
import json
from datetime import datetime
from pathlib import Path

BASE_URL = "http://localhost:8080"

# All pages from PAGES_LIST.md
ALL_PAGES = [
    # עמודים מרכזיים (Main Pages)
    {"name": "דף הבית", "url": "/", "category": "main", "priority": "high"},
    {"name": "טריידים", "url": "/trades.html", "category": "main", "priority": "high"},
    {"name": "תכניות מסחר", "url": "/trade_plans.html", "category": "main", "priority": "high"},
    {"name": "התראות", "url": "/alerts.html", "category": "main", "priority": "high"},
    {"name": "טיקרים", "url": "/tickers.html", "category": "main", "priority": "high"},
    {"name": "דשבורד טיקר", "url": "/ticker_dashboard.html", "category": "main", "priority": "medium"},
    {"name": "חשבונות מסחר", "url": "/trading_accounts.html", "category": "main", "priority": "high"},
    {"name": "ביצועים", "url": "/executions.html", "category": "main", "priority": "high"},
    {"name": "ייבוא נתונים", "url": "/data_import.html", "category": "main", "priority": "medium"},
    {"name": "תזרימי מזומן", "url": "/cash_flows.html", "category": "main", "priority": "high"},
    {"name": "הערות", "url": "/notes.html", "category": "main", "priority": "high"},
    {"name": "מחקר", "url": "/research.html", "category": "main", "priority": "medium"},
    {"name": "ניתוח AI", "url": "/ai_analysis.html", "category": "main", "priority": "medium"},
    {"name": "העדפות", "url": "/preferences.html", "category": "main", "priority": "high"},
    {"name": "פרופיל משתמש", "url": "/user_profile.html", "category": "main", "priority": "medium"},
    
    # עמודים טכניים (Technical Pages)
    {"name": "תצוגת בסיס נתונים", "url": "/db_display.html", "category": "technical", "priority": "low"},
    {"name": "נתונים נוספים", "url": "/db_extradata.html", "category": "technical", "priority": "low"},
    {"name": "אילוצי מערכת", "url": "/constraints.html", "category": "technical", "priority": "low"},
    {"name": "משימות רקע", "url": "/background_tasks.html", "category": "technical", "priority": "low"},
    {"name": "ניטור שרת", "url": "/server_monitor.html", "category": "technical", "priority": "low"},
    {"name": "ניהול מערכת", "url": "/system_management.html", "category": "technical", "priority": "low"},
    {"name": "מרכז התראות", "url": "/notifications_center.html", "category": "technical", "priority": "low"},
    {"name": "ניהול CSS", "url": "/css_management.html", "category": "technical", "priority": "low"},
    {"name": "תצוגת צבעים", "url": "/dynamic_colors_display.html", "category": "technical", "priority": "low"},
    {"name": "עיצובים", "url": "/designs.html", "category": "technical", "priority": "low"},
    
    # עמודים משניים (Secondary Pages)
    {"name": "דשבורד נתונים חיצוניים", "url": "/external_data_dashboard.html", "category": "secondary", "priority": "low"},
    {"name": "ניהול גרפים", "url": "/chart_management.html", "category": "secondary", "priority": "low"},
    {"name": "דשבורד בדיקות CRUD", "url": "/crud_testing_dashboard.html", "category": "secondary", "priority": "low"},
    
    # עמודי אימות (Auth Pages)
    {"name": "כניסה למערכת", "url": "/login.html", "category": "auth", "priority": "high"},
    {"name": "הרשמה למערכת", "url": "/register.html", "category": "auth", "priority": "medium"},
    {"name": "שחזור סיסמה", "url": "/forgot_password.html", "category": "auth", "priority": "medium"},
    {"name": "איפוס סיסמה", "url": "/reset_password.html", "category": "auth", "priority": "medium"},
    
    # עמודי כלים לפיתוח (Dev Tools)
    {"name": "מיפוי צבעי כפתורים", "url": "/button_color_mapping.html", "category": "dev", "priority": "low"},
    {"name": "מיפוי צבעי כפתורים - פשוט", "url": "/button_color_mapping_simple.html", "category": "dev", "priority": "low"},
    {"name": "מודלים של תנאים", "url": "/conditions_modals.html", "category": "dev", "priority": "low"},
    {"name": "ניהול קבוצות העדפות", "url": "/preferences_groups_management.html", "category": "dev", "priority": "low"},
    {"name": "ניהול תגיות", "url": "/tag_management.html", "category": "dev", "priority": "low"},
    {"name": "ניהול מטמון", "url": "/cache_management.html", "category": "dev", "priority": "low"},
    {"name": "דשבורד איכות קוד", "url": "/code_quality_dashboard.html", "category": "dev", "priority": "low"},
    {"name": "ניהול מערכת אתחול", "url": "/init_system_management.html", "category": "dev", "priority": "low"},
    {"name": "בדיקת תנאים", "url": "/conditions_test.html", "category": "dev", "priority": "low"},
    
    # עמודי רשימות מעקב (Watch Lists)
    {"name": "ניהול רשימות צפייה", "url": "/mockups/watch_lists-page.html", "category": "watchlists", "priority": "medium"},
    
    # עמודים נוספים
    {"name": "תצוגת ווידג'טים TradingView", "url": "/tradingview_widgets_showcase.html", "category": "additional", "priority": "low"},
    {"name": "טריידים מעוצבים", "url": "/trades_formatted.html", "category": "additional", "priority": "low"},
]

def test_page(page_info):
    """Test a single page"""
    url = BASE_URL + page_info["url"]
    result = {
        "page": page_info["name"],
        "url": page_info["url"],
        "category": page_info["category"],
        "priority": page_info["priority"],
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
            if 'unified-header' in content or 'app-header' in content or 'header-container' in content or '<header' in content:
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
    print("🔍 בדיקה מקיפה של כל העמודים במערכת")
    print("=" * 80)
    print(f"Base URL: {BASE_URL}")
    print(f"Total pages to test: {len(ALL_PAGES)}")
    print(f"Start time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 80)
    print()
    
    results = []
    
    # Group by priority
    high_priority = [p for p in ALL_PAGES if p["priority"] == "high"]
    medium_priority = [p for p in ALL_PAGES if p["priority"] == "medium"]
    low_priority = [p for p in ALL_PAGES if p["priority"] == "low"]
    
    all_pages = high_priority + medium_priority + low_priority
    
    # Group by category for reporting
    by_category = {}
    for page in ALL_PAGES:
        cat = page["category"]
        if cat not in by_category:
            by_category[cat] = []
        by_category[cat].append(page)
    
    print(f"📊 Breakdown by category:")
    for cat, pages in by_category.items():
        print(f"  {cat}: {len(pages)} pages")
    print()
    print(f"📊 Breakdown by priority:")
    print(f"  High: {len(high_priority)} pages")
    print(f"  Medium: {len(medium_priority)} pages")
    print(f"  Low: {len(low_priority)} pages")
    print()
    print("=" * 80)
    print()
    
    for i, page in enumerate(all_pages, 1):
        print(f"[{i}/{len(all_pages)}] Testing: {page['name']} ({page['url']}) [{page['category']}]")
        result = test_page(page)
        results.append(result)
        
        status_icon = "✅" if result["success"] else "❌"
        print(f"  {status_icon} Status: {result['status_code']} | Time: {result['response_time']:.2f}s")
        if result["errors"]:
            print(f"  ⚠️  Errors: {', '.join(result['errors'])}")
        print()
        
        time.sleep(0.3)  # Small delay between requests
    
    # Summary
    print("=" * 80)
    print("📊 סיכום תוצאות")
    print("=" * 80)
    
    successful = [r for r in results if r["success"]]
    failed = [r for r in results if not r["success"]]
    with_errors = [r for r in results if r["errors"]]
    with_header = [r for r in results if r["has_header"]]
    with_core_systems = [r for r in results if r["has_core_systems"]]
    
    print(f"✅ עמודים מוצלחים: {len(successful)}/{len(results)} ({len(successful)/len(results)*100:.1f}%)")
    print(f"❌ עמודים כושלים: {len(failed)}/{len(results)} ({len(failed)/len(results)*100:.1f}%)")
    print(f"⚠️  עמודים עם שגיאות: {len(with_errors)}/{len(results)}")
    print(f"📄 עמודים עם Header: {len(with_header)}/{len(results)} ({len(with_header)/len(results)*100:.1f}%)")
    print(f"⚙️  עמודים עם Core Systems: {len(with_core_systems)}/{len(results)} ({len(with_core_systems)/len(results)*100:.1f}%)")
    print()
    
    # Summary by category
    print("📊 סיכום לפי קטגוריה:")
    for cat in sorted(by_category.keys()):
        cat_results = [r for r in results if r["category"] == cat]
        cat_successful = [r for r in cat_results if r["success"]]
        print(f"  {cat}: {len(cat_successful)}/{len(cat_results)} successful ({len(cat_successful)/len(cat_results)*100:.1f}%)")
    print()
    
    # Summary by priority
    print("📊 סיכום לפי עדיפות:")
    for priority in ["high", "medium", "low"]:
        priority_results = [r for r in results if r["priority"] == priority]
        priority_successful = [r for r in priority_results if r["success"]]
        print(f"  {priority}: {len(priority_successful)}/{len(priority_results)} successful ({len(priority_successful)/len(priority_results)*100:.1f}%)")
    print()
    
    if failed:
        print("❌ עמודים כושלים:")
        for r in failed:
            print(f"  - {r['page']} ({r['url']}) [{r['category']}]: {', '.join(r['errors'])}")
        print()
    
    if with_errors:
        print("⚠️  עמודים עם שגיאות:")
        for r in with_errors:
            print(f"  - {r['page']} ({r['url']}) [{r['category']}]: {', '.join(r['errors'])}")
        print()
    
    # Save results to file
    output_file = Path(__file__).parent.parent / "test_all_pages_comprehensive_results.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump({
            "timestamp": datetime.now().isoformat(),
            "base_url": BASE_URL,
            "total_pages": len(results),
            "successful": len(successful),
            "failed": len(failed),
            "with_errors": len(with_errors),
            "with_header": len(with_header),
            "with_core_systems": len(with_core_systems),
            "summary_by_category": {
                cat: {
                    "total": len([r for r in results if r["category"] == cat]),
                    "successful": len([r for r in results if r["category"] == cat and r["success"]])
                }
                for cat in sorted(by_category.keys())
            },
            "summary_by_priority": {
                priority: {
                    "total": len([r for r in results if r["priority"] == priority]),
                    "successful": len([r for r in results if r["priority"] == priority and r["success"]])
                }
                for priority in ["high", "medium", "low"]
            },
            "results": results
        }, f, ensure_ascii=False, indent=2)
    
    print(f"💾 תוצאות נשמרו ל: {output_file}")
    print()
    print("=" * 80)
    print(f"✅ בדיקה הושלמה: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 80)

if __name__ == "__main__":
    main()


