#!/usr/bin/env python3
"""
בדיקת טעינת Default Value Setter
Test Default Value Setter loading in HTML pages
"""

import os
import re
from pathlib import Path

PROJECT_ROOT = Path(__file__).parent.parent.parent
HTML_DIR = PROJECT_ROOT / "trading-ui"

# Core pages that should load services package
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

def check_page_loading(html_file: Path) -> dict:
    """Check if default-value-setter.js is loaded in HTML file"""
    try:
        with open(html_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check for services package (which includes default-value-setter.js)
        has_services_package = 'services' in content.lower() or 'package-manifest' in content.lower()
        
        # Check for direct loading
        has_direct_loading = 'default-value-setter.js' in content
        
        # Check for init system
        has_init_system = 'unified-app-initializer' in content or 'init-system' in content.lower()
        
        return {
            'file': str(html_file.relative_to(PROJECT_ROOT)),
            'has_services_package': has_services_package,
            'has_direct_loading': has_direct_loading,
            'has_init_system': has_init_system,
            'loaded': has_services_package or has_direct_loading or has_init_system
        }
    except Exception as e:
        return {
            'file': str(html_file.relative_to(PROJECT_ROOT)),
            'error': str(e),
            'loaded': False
        }

def main():
    print("=" * 80)
    print("🔍 בדיקת טעינת Default Value Setter")
    print("=" * 80)
    print()
    
    results = []
    for page_name in CORE_PAGES:
        html_file = HTML_DIR / page_name
        if html_file.exists():
            result = check_page_loading(html_file)
            results.append(result)
            status = "✅" if result.get('loaded') else "❌"
            print(f"{status} {page_name}")
            if not result.get('loaded'):
                print(f"   ⚠️  לא נמצאה טעינה של services package או default-value-setter.js")
        else:
            print(f"⚠️  {page_name} - קובץ לא נמצא")
    
    print()
    print("=" * 80)
    print("📊 SUMMARY")
    print("=" * 80)
    
    loaded_count = sum(1 for r in results if r.get('loaded'))
    total_count = len(results)
    
    print(f"Pages checked: {total_count}")
    print(f"Pages with Default Value Setter loaded: {loaded_count}")
    print(f"Pages missing Default Value Setter: {total_count - loaded_count}")
    print()
    
    if loaded_count == total_count:
        print("✅ כל העמודים המרכזיים טוענים את Default Value Setter!")
    else:
        print("⚠️  יש עמודים שצריכים להוסיף טעינה של services package")
        for r in results:
            if not r.get('loaded'):
                print(f"   - {r['file']}")
    
    print("=" * 80)

if __name__ == "__main__":
    main()

