#!/usr/bin/env python3
"""
Simple script to test console errors using the existing JavaScript checker
This script loads pages and provides instructions for manual console checking
"""

import requests
import json
import time
from datetime import datetime
from pathlib import Path

BASE_URL = "http://localhost:8080"

# All pages from test_all_pages_comprehensive.py
ALL_PAGES = [
    # עמודים מרכזיים (Main Pages)
    {"name": "דף הבית", "url": "/", "category": "main", "priority": "high"},
    {"name": "טריידים", "url": "/trades.html", "category": "main", "priority": "high"},
    {"name": "תכניות מסחר", "url": "/trade_plans.html", "category": "main", "priority": "high"},
    {"name": "התראות", "url": "/alerts.html", "category": "main", "priority": "high"},
    {"name": "טיקרים", "url": "/tickers.html", "category": "main", "priority": "high"},
    {"name": "דשבורד טיקר", "url": "/ticker-dashboard.html", "category": "main", "priority": "medium"},
    {"name": "חשבונות מסחר", "url": "/trading_accounts.html", "category": "main", "priority": "high"},
    {"name": "ביצועים", "url": "/executions.html", "category": "main", "priority": "high"},
    {"name": "ייבוא נתונים", "url": "/data_import.html", "category": "main", "priority": "medium"},
    {"name": "תזרימי מזומן", "url": "/cash_flows.html", "category": "main", "priority": "high"},
    {"name": "הערות", "url": "/notes.html", "category": "main", "priority": "high"},
    {"name": "מחקר", "url": "/research.html", "category": "main", "priority": "medium"},
    {"name": "ניתוח AI", "url": "/ai-analysis.html", "category": "main", "priority": "medium"},
    {"name": "העדפות", "url": "/preferences.html", "category": "main", "priority": "high"},
    {"name": "פרופיל משתמש", "url": "/user-profile.html", "category": "main", "priority": "medium"},
    
    # עמודים טכניים (Technical Pages)
    {"name": "תצוגת בסיס נתונים", "url": "/db_display.html", "category": "technical", "priority": "low"},
    {"name": "נתונים נוספים", "url": "/db_extradata.html", "category": "technical", "priority": "low"},
    {"name": "אילוצי מערכת", "url": "/constraints.html", "category": "technical", "priority": "low"},
    {"name": "משימות רקע", "url": "/background-tasks.html", "category": "technical", "priority": "low"},
    {"name": "ניטור שרת", "url": "/server-monitor.html", "category": "technical", "priority": "low"},
    {"name": "ניהול מערכת", "url": "/system-management.html", "category": "technical", "priority": "low"},
    {"name": "מרכז התראות", "url": "/notifications-center.html", "category": "technical", "priority": "low"},
    {"name": "ניהול CSS", "url": "/css-management.html", "category": "technical", "priority": "low"},
    {"name": "תצוגת צבעים", "url": "/dynamic-colors-display.html", "category": "technical", "priority": "low"},
    {"name": "עיצובים", "url": "/designs.html", "category": "technical", "priority": "low"},
    
    # עמודים משניים (Secondary Pages)
    {"name": "דשבורד נתונים חיצוניים", "url": "/external-data-dashboard.html", "category": "secondary", "priority": "low"},
    {"name": "ניהול גרפים", "url": "/chart-management.html", "category": "secondary", "priority": "low"},
    {"name": "דשבורד בדיקות CRUD", "url": "/crud-testing-dashboard.html", "category": "secondary", "priority": "low"},
    
    # עמודי אימות (Auth Pages)
    {"name": "כניסה למערכת", "url": "/login.html", "category": "auth", "priority": "high"},
    {"name": "הרשמה למערכת", "url": "/register.html", "category": "auth", "priority": "medium"},
    {"name": "שחזור סיסמה", "url": "/forgot-password.html", "category": "auth", "priority": "medium"},
    {"name": "איפוס סיסמה", "url": "/reset-password.html", "category": "auth", "priority": "medium"},
    
    # עמודי כלים לפיתוח (Dev Tools)
    {"name": "מיפוי צבעי כפתורים", "url": "/button-color-mapping.html", "category": "dev", "priority": "low"},
    {"name": "מיפוי צבעי כפתורים - פשוט", "url": "/button-color-mapping-simple.html", "category": "dev", "priority": "low"},
    {"name": "מודלים של תנאים", "url": "/conditions-modals.html", "category": "dev", "priority": "low"},
    {"name": "ניהול קבוצות העדפות", "url": "/preferences-groups-management.html", "category": "dev", "priority": "low"},
    {"name": "ניהול תגיות", "url": "/tag-management.html", "category": "dev", "priority": "low"},
    {"name": "ניהול מטמון", "url": "/cache-management.html", "category": "dev", "priority": "low"},
    {"name": "דשבורד איכות קוד", "url": "/code-quality-dashboard.html", "category": "dev", "priority": "low"},
    {"name": "ניהול מערכת אתחול", "url": "/init-system-management.html", "category": "dev", "priority": "low"},
    {"name": "בדיקת תנאים", "url": "/conditions-test.html", "category": "dev", "priority": "low"},
    
    # עמודי רשימות מעקב (Watch Lists)
    {"name": "ניהול רשימות צפייה", "url": "/mockups/watch-lists-page.html", "category": "watchlists", "priority": "medium"},
    
    # עמודים נוספים
    {"name": "תצוגת ווידג'טים TradingView", "url": "/tradingview-widgets-showcase.html", "category": "additional", "priority": "low"},
    {"name": "טריידים מעוצבים", "url": "/trades_formatted.html", "category": "additional", "priority": "low"},
]

def test_page_basic(page_info):
    """Test a single page for basic HTTP and HTML structure"""
    url = BASE_URL + page_info["url"]
    result = {
        "page": page_info["name"],
        "url": page_info["url"],
        "category": page_info["category"],
        "priority": page_info["priority"],
        "http_status": None,
        "success": False,
        "has_header": False,
        "has_core_systems": False,
        "has_error_patterns": False,
        "error_patterns": [],
        "timestamp": datetime.now().isoformat()
    }
    
    try:
        response = requests.get(url, timeout=10)
        result["http_status"] = response.status_code
        
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
            error_patterns = [
                "Maximum call stack size exceeded",
                "Uncaught",
                "ReferenceError",
                "TypeError",
                "SyntaxError"
            ]
            
            for pattern in error_patterns:
                if pattern in content:
                    result["has_error_patterns"] = True
                    result["error_patterns"].append(pattern)
                    
    except Exception as e:
        result["error_patterns"].append(f"Exception: {str(e)}")
    
    return result

def main():
    """Main test function"""
    print("=" * 80)
    print("🔍 בדיקה בסיסית של כל העמודים (HTTP + HTML patterns)")
    print("=" * 80)
    print(f"Base URL: {BASE_URL}")
    print(f"Total pages to test: {len(ALL_PAGES)}")
    print(f"Start time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    print("⚠️  הערה: בדיקה זו בודקת רק HTTP status ו-patterns ב-HTML.")
    print("   לבדיקה מלאה של שגיאות JavaScript, יש להשתמש ב-Selenium")
    print("   או לבדוק ידנית עם scripts/check_console_errors.js")
    print("=" * 80)
    print()
    
    results = []
    
    for i, page in enumerate(ALL_PAGES, 1):
        print(f"[{i}/{len(ALL_PAGES)}] Testing: {page['name']} ({page['url']}) [{page['category']}]")
        result = test_page_basic(page)
        results.append(result)
        
        status_icon = "✅" if result["success"] else "❌"
        print(f"  {status_icon} Status: {result['http_status']}")
        if result["has_error_patterns"]:
            print(f"  ⚠️  Error patterns found: {', '.join(result['error_patterns'])}")
        if result["has_header"]:
            print(f"  📄 Header: ✅")
        if result["has_core_systems"]:
            print(f"  ⚙️  Core Systems: ✅")
        print()
        
        time.sleep(0.1)  # Small delay between requests
    
    # Summary
    print("=" * 80)
    print("📊 סיכום תוצאות")
    print("=" * 80)
    
    successful = [r for r in results if r["success"]]
    failed = [r for r in results if not r["success"]]
    with_error_patterns = [r for r in results if r["has_error_patterns"]]
    with_header = [r for r in results if r["has_header"]]
    with_core_systems = [r for r in results if r["has_core_systems"]]
    
    print(f"✅ עמודים מוצלחים: {len(successful)}/{len(results)} ({len(successful)/len(results)*100:.1f}%)")
    print(f"❌ עמודים כושלים: {len(failed)}/{len(results)} ({len(failed)/len(results)*100:.1f}%)")
    print(f"⚠️  עמודים עם error patterns: {len(with_error_patterns)}/{len(results)}")
    print(f"📄 עמודים עם Header: {len(with_header)}/{len(results)} ({len(with_header)/len(results)*100:.1f}%)")
    print(f"⚙️  עמודים עם Core Systems: {len(with_core_systems)}/{len(results)} ({len(with_core_systems)/len(results)*100:.1f}%)")
    print()
    
    if with_error_patterns:
        print("⚠️  עמודים עם error patterns ב-HTML:")
        for r in with_error_patterns:
            print(f"  - {r['page']} ({r['url']}): {', '.join(r['error_patterns'])}")
        print()
    
    # Save results to file
    output_file = Path(__file__).parent.parent / "console_errors_basic_report.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump({
            "timestamp": datetime.now().isoformat(),
            "base_url": BASE_URL,
            "total_pages": len(results),
            "successful": len(successful),
            "failed": len(failed),
            "with_error_patterns": len(with_error_patterns),
            "with_header": len(with_header),
            "with_core_systems": len(with_core_systems),
            "note": "This is a basic check. For full JavaScript console error checking, use Selenium or manual browser testing with scripts/check_console_errors.js",
            "results": results
        }, f, ensure_ascii=False, indent=2)
    
    print(f"💾 תוצאות נשמרו ל: {output_file}")
    print()
    print("=" * 80)
    print(f"✅ בדיקה הושלמה: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 80)
    print()
    print("📝 לבדיקה מלאה של שגיאות JavaScript:")
    print("   1. התקן Selenium: pip install selenium")
    print("   2. הרץ: python3 scripts/test_pages_console_errors.py")
    print("   3. או בדוק ידנית עם scripts/check_console_errors.js בכל עמוד")

if __name__ == "__main__":
    main()











