#!/usr/bin/env python3
"""
בדיקה ממוקדת על עמודי משתמש, כלי פיתוח ועמודים תומכים
Focused test on user pages, dev tools, and supporting pages

✅ FIXED 2025-12-25: Corrected page URLs to match actual file names:
- Changed URLs with hyphens (-) to underscores (_) to match actual HTML files
- Fixed: ticker-dashboard, ai-analysis, user-profile, external-data-dashboard,
  chart-management, crud-testing-dashboard, tag-management, trade-history,
  trading-journal, watch-list, portfolio-state
"""

import sys
import subprocess
from pathlib import Path

# Focused pages list - user pages, dev tools, and supporting pages
FOCUSED_PAGES = [
    # עמודי משתמש (Main Pages)
    {"name": "דף הבית", "url": "/", "category": "main"},
    {"name": "טריידים", "url": "/trades.html", "category": "main"},
    {"name": "תכניות מסחר", "url": "/trade_plans.html", "category": "main"},
    {"name": "התראות", "url": "/alerts.html", "category": "main"},
    {"name": "טיקרים", "url": "/tickers.html", "category": "main"},
    {"name": "דשבורד טיקר", "url": "/ticker_dashboard.html", "category": "main"},
    {"name": "חשבונות מסחר", "url": "/trading_accounts.html", "category": "main"},
    {"name": "ביצועים", "url": "/executions.html", "category": "main"},
    {"name": "ייבוא נתונים", "url": "/data_import.html", "category": "main"},
    {"name": "תזרימי מזומן", "url": "/cash_flows.html", "category": "main"},
    {"name": "הערות", "url": "/notes.html", "category": "main"},
    {"name": "ניהול תגיות", "url": "/tag_management", "category": "main"},
    {"name": "מחקר", "url": "/research.html", "category": "main"},
    {"name": "ניתוח AI", "url": "/ai_analysis.html", "category": "main"},
    {"name": "העדפות", "url": "/preferences.html", "category": "main"},
    {"name": "פרופיל משתמש", "url": "/user_profile.html", "category": "main"},
    {"name": "היסטוריית טרייד", "url": "/trade_history.html", "category": "main"},
    {"name": "מצב תיק היסטורי", "url": "/portfolio_state.html", "category": "main"},
    {"name": "יומן מסחר", "url": "/trading_journal.html", "category": "main"},
    
    # עמודי כלי פיתוח (Dev Tools)
    {"name": "כלי פיתוח ראשי", "url": "/dev_tools", "category": "dev"},
    {"name": "מיפוי צבעי כפתורים", "url": "/button_color_mapping.html", "category": "dev"},
    {"name": "מיפוי צבעי כפתורים - פשוט", "url": "/button_color_mapping_simple.html", "category": "dev"},
    {"name": "מודלים של תנאים", "url": "/conditions_modals.html", "category": "dev"},
    {"name": "ניהול קבוצות העדפות", "url": "/preferences_groups_management.html", "category": "dev"},
    {"name": "ניהול תגיות", "url": "/tag_management.html", "category": "dev"},
    {"name": "ניהול מטמון", "url": "/cache_management.html", "category": "dev"},
    {"name": "דשבורד איכות קוד", "url": "/code_quality_dashboard.html", "category": "dev"},
    {"name": "ניהול מערכת אתחול", "url": "/init_system_management.html", "category": "dev"},
    {"name": "בדיקת תנאים", "url": "/conditions_test.html", "category": "dev"},
    
    # עמודים תומכים (Supporting Pages)
    {"name": "דשבורד נתונים חיצוניים", "url": "/external_data_dashboard.html", "category": "secondary"},
    {"name": "ניהול גרפים", "url": "/chart_management.html", "category": "secondary"},
    {"name": "דשבורד בדיקות CRUD", "url": "/crud_testing_dashboard.html", "category": "secondary"},
    {"name": "תצוגת בסיס נתונים", "url": "/db_display.html", "category": "technical"},
    {"name": "נתונים נוספים", "url": "/db_extradata.html", "category": "technical"},
    {"name": "אילוצי מערכת", "url": "/constraints.html", "category": "technical"},
    {"name": "משימות רקע", "url": "/background_tasks.html", "category": "technical"},
    {"name": "ניטור שרת", "url": "/server_monitor.html", "category": "technical"},
    {"name": "ניהול מערכת", "url": "/system_management.html", "category": "technical"},
    {"name": "מרכז התראות", "url": "/notifications_center.html", "category": "technical"},
    {"name": "ניהול CSS", "url": "/css_management.html", "category": "technical"},
    {"name": "תצוגת צבעים", "url": "/dynamic_colors_display.html", "category": "technical"},
    {"name": "עיצובים", "url": "/designs.html", "category": "technical"},
]

def main():
    print("=" * 80)
    print("🔍 בדיקה אוטומטית ממוקדת")
    print("=" * 80)
    print(f"📋 סה\"כ עמודים לבדיקה: {len(FOCUSED_PAGES)}")
    print(f"   - עמודי משתמש: {len([p for p in FOCUSED_PAGES if p['category'] == 'main'])}")
    print(f"   - עמודי כלי פיתוח: {len([p for p in FOCUSED_PAGES if p['category'] == 'dev'])}")
    print(f"   - עמודים תומכים: {len([p for p in FOCUSED_PAGES if p['category'] in ['secondary', 'technical']])}")
    print("=" * 80)
    print()
    
    # Use the existing test script
    script_path = Path(__file__).parent / "test_pages_console_errors.py"
    
    results = []
    pages_with_401 = []
    
    for i, page in enumerate(FOCUSED_PAGES, 1):
        print(f"[{i}/{len(FOCUSED_PAGES)}] בודק: {page['name']} ({page['url']})")
        try:
            result = subprocess.run(
                [sys.executable, str(script_path), '--page', page['url']],
                capture_output=True,
                text=True,
                timeout=120
            )
            
            output = result.stdout + result.stderr
            
            # Check for 401 errors
            if '401' in output or 'UNAUTHORIZED' in output.upper():
                pages_with_401.append({
                    'page': page['name'],
                    'url': page['url'],
                    'category': page['category']
                })
                print(f"  ❌ נמצאה שגיאת 401")
            else:
                print(f"  ✅ ללא שגיאת 401")
                
            results.append({
                'page': page['name'],
                'url': page['url'],
                'category': page['category'],
                'has_401': '401' in output or 'UNAUTHORIZED' in output.upper(),
                'success': result.returncode == 0
            })
            
        except subprocess.TimeoutExpired:
            print(f"  ⏱️  זמן הבדיקה פג (timeout)")
            results.append({
                'page': page['name'],
                'url': page['url'],
                'category': page['category'],
                'has_401': False,
                'success': False,
                'error': 'timeout'
            })
        except Exception as e:
            print(f"  ⚠️  שגיאה בבדיקה: {e}")
            results.append({
                'page': page['name'],
                'url': page['url'],
                'category': page['category'],
                'has_401': False,
                'success': False,
                'error': str(e)
            })
    
    print()
    print("=" * 80)
    print("📊 סיכום תוצאות")
    print("=" * 80)
    
    successful = [r for r in results if r.get('success', False)]
    failed = [r for r in results if not r.get('success', False)]
    
    print(f"✅ בדיקות מוצלחות: {len(successful)}/{len(results)} ({len(successful)/len(results)*100:.1f}%)")
    print(f"❌ בדיקות נכשלו: {len(failed)}/{len(results)} ({len(failed)/len(results)*100:.1f}%)")
    print()
    
    if pages_with_401:
        print(f"❌ עמודים עם שגיאת 401 Unauthorized: {len(pages_with_401)}")
        print("=" * 80)
        for p in pages_with_401:
            print(f"  - {p['page']} ({p['url']}) [{p['category']}]")
        print()
    else:
        print("✅ כל העמודים ללא שגיאת 401 Unauthorized!")
        print()
    
    if failed:
        print(f"⚠️  עמודים עם בעיות בבדיקה ({len(failed)}):")
        for r in failed[:10]:  # Show first 10
            error_msg = r.get('error', 'unknown error')
            print(f"  - {r['page']} ({r['url']}): {error_msg}")
    
    print("=" * 80)
    
    return 0 if not pages_with_401 else 1

if __name__ == "__main__":
    exit(main())

