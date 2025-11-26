#!/usr/bin/env python3
"""
בדיקת שימוש ב-Default Value Setter
Test Default Value Setter usage and availability

בודק:
1. האם העמודים טוענים את services package
2. האם DefaultValueSetter זמין
3. האם יש שימושים ישירים ב-DefaultValueSetter
"""

import os
import re
from pathlib import Path

PROJECT_ROOT = Path(__file__).parent.parent.parent
SCRIPTS_DIR = PROJECT_ROOT / "trading-ui" / "scripts"
HTML_DIR = PROJECT_ROOT / "trading-ui"

# Core pages to check
CORE_PAGES = [
    "index.html",
    "trades.html",
    "trade_plans.html",
    "alerts.html",
    "tickers.html",
    "trading_accounts.html",
    "executions.html",
    "cash_flows.html",
    "notes.html",
    "research.html",
    "preferences.html"
]

def check_page_loads_services(html_file: Path) -> dict:
    """Check if page loads services package"""
    try:
        with open(html_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check for services package or direct default-value-setter.js
        has_services = 'services' in content.lower() or 'package-manifest' in content.lower()
        has_direct = 'default-value-setter.js' in content
        
        # Check for unified initialization system
        has_init_system = 'unified-app-initializer.js' in content or 'page-initialization-configs.js' in content
        
        return {
            'file': str(html_file.relative_to(PROJECT_ROOT)),
            'has_services': has_services or has_init_system,
            'has_direct': has_direct,
            'has_init_system': has_init_system,
            'status': 'OK' if (has_services or has_init_system) else 'MISSING'
        }
    except Exception as e:
        return {
            'file': str(html_file.relative_to(PROJECT_ROOT)),
            'error': str(e),
            'status': 'ERROR'
        }

def check_default_value_setter_usage(js_file: Path) -> dict:
    """Check if file uses DefaultValueSetter"""
    try:
        with open(js_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check for usage
        has_usage = any(pattern in content for pattern in [
            'DefaultValueSetter',
            'setCurrentDate',
            'setCurrentDateTime',
            'setPreferenceValue',
            'setLogicalDefault',
            'setAllDefaults',
            'setFormDefaults'
        ])
        
        # Count usages
        usage_count = len(re.findall(r'DefaultValueSetter\.|setCurrent(?:Date|DateTime)|setPreferenceValue|setLogicalDefault|setAllDefaults|setFormDefaults', content))
        
        return {
            'file': str(js_file.relative_to(PROJECT_ROOT)),
            'has_usage': has_usage,
            'usage_count': usage_count,
            'status': 'USES' if has_usage else 'NO_USAGE'
        }
    except Exception as e:
        return {
            'file': str(js_file.relative_to(PROJECT_ROOT)),
            'error': str(e),
            'status': 'ERROR'
        }

def main():
    print("=" * 80)
    print("🧪 בדיקת שימוש ב-Default Value Setter")
    print("=" * 80)
    print()
    
    # Check core pages
    print("📋 בדיקת עמודים מרכזיים...")
    print()
    
    page_results = []
    for page_name in CORE_PAGES:
        html_file = HTML_DIR / page_name
        if html_file.exists():
            result = check_page_loads_services(html_file)
            page_results.append(result)
            status_icon = "✅" if result.get('status') == 'OK' else "❌"
            print(f"{status_icon} {page_name}: {result.get('status', 'ERROR')}")
        else:
            print(f"⚠️  {page_name}: לא נמצא")
    
    print()
    print("=" * 80)
    print("📊 PAGE LOADING SUMMARY")
    print("=" * 80)
    
    ok_count = sum(1 for r in page_results if r.get('status') == 'OK')
    missing_count = sum(1 for r in page_results if r.get('status') == 'MISSING')
    
    print(f"Total pages checked: {len(page_results)}")
    print(f"Pages with services package: {ok_count}")
    print(f"Pages missing services package: {missing_count}")
    print(f"Success rate: {ok_count / len(page_results) * 100:.1f}%")
    print()
    
    # Check JS files for usage
    print("📋 בדיקת שימוש ב-DefaultValueSetter בקבצי JavaScript...")
    print()
    
    js_files = [
        SCRIPTS_DIR / "modal-manager-v2.js",
        SCRIPTS_DIR / "trade_plans.js",
        SCRIPTS_DIR / "auth.js",
        SCRIPTS_DIR / "services" / "default-value-setter.js"
    ]
    
    usage_results = []
    for js_file in js_files:
        if js_file.exists():
            result = check_default_value_setter_usage(js_file)
            usage_results.append(result)
            status_icon = "✅" if result.get('status') == 'USES' else "ℹ️"
            print(f"{status_icon} {js_file.name}: {result.get('usage_count', 0)} שימושים")
    
    print()
    print("=" * 80)
    print("📊 USAGE SUMMARY")
    print("=" * 80)
    
    total_usages = sum(r.get('usage_count', 0) for r in usage_results)
    print(f"Total files checked: {len(usage_results)}")
    print(f"Total DefaultValueSetter usages: {total_usages}")
    print()
    
    # Generate report
    report_path = PROJECT_ROOT / "documentation" / "05-REPORTS" / "DEFAULT_VALUE_SETTER_TESTING_REPORT.md"
    report_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write("# דוח בדיקות - Default Value Setter\n")
        f.write("## Default Value Setter Testing Report\n\n")
        f.write(f"**תאריך:** {Path(__file__).stat().st_mtime}\n\n")
        f.write("---\n\n")
        f.write("## בדיקת טעינת קבצים\n\n")
        f.write(f"**סה\"כ עמודים נבדקו:** {len(page_results)}\n")
        f.write(f"**עמודים עם services package:** {ok_count}\n")
        f.write(f"**עמודים חסרים:** {missing_count}\n")
        f.write(f"**אחוז הצלחה:** {ok_count / len(page_results) * 100:.1f}%\n\n")
        f.write("### פרטים:\n\n")
        for result in page_results:
            f.write(f"- **{result['file']}**: {result.get('status', 'ERROR')}\n")
            if result.get('has_services'):
                f.write("  - ✅ טוען services package\n")
            if result.get('has_init_system'):
                f.write("  - ✅ משתמש במערכת אתחול מאוחדת\n")
        f.write("\n---\n\n")
        f.write("## בדיקת שימוש\n\n")
        f.write(f"**סה\"כ קבצים נבדקו:** {len(usage_results)}\n")
        f.write(f"**סה\"כ שימושים:** {total_usages}\n\n")
        f.write("### פרטים:\n\n")
        for result in usage_results:
            f.write(f"- **{result['file']}**: {result.get('usage_count', 0)} שימושים\n")
    
    print(f"📄 Detailed report saved to: {report_path}")
    print("=" * 80)

if __name__ == "__main__":
    main()

