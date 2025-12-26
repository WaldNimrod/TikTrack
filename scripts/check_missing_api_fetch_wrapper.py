#!/usr/bin/env python3
"""
Check which pages are missing api-fetch-wrapper.js
בודק אילו עמודים חסרים את api-fetch-wrapper.js
"""

import os
import re
from pathlib import Path

BASE_DIR = Path(__file__).parent.parent
TRADING_UI_DIR = BASE_DIR / "trading-ui"

def check_page(file_path):
    """Check if page has api-fetch-wrapper.js and header system"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check if page has header system (needs api-fetch-wrapper)
        has_header = 'unified-header' in content or 'header-system' in content
        has_wrapper = 'api-fetch-wrapper.js' in content
        
        # Skip login/register pages
        if 'login.html' in str(file_path) or 'register.html' in str(file_path):
            return None
        
        if has_header and not has_wrapper:
            return {
                'file': str(file_path.relative_to(BASE_DIR)),
                'has_header': True,
                'has_wrapper': False,
                'needs_fix': True
            }
        elif has_header and has_wrapper:
            return {
                'file': str(file_path.relative_to(BASE_DIR)),
                'has_header': True,
                'has_wrapper': True,
                'needs_fix': False
            }
    except Exception as e:
        return None
    
    return None

def main():
    """Main function"""
    print("🔍 Checking pages for missing api-fetch-wrapper.js...")
    print("=" * 80)
    
    html_files = list(TRADING_UI_DIR.rglob("*.html"))
    
    results = []
    for html_file in html_files:
        # Skip mockups and test files
        if 'mockup' in str(html_file) or 'test' in str(html_file).lower():
            continue
        
        result = check_page(html_file)
        if result:
            results.append(result)
    
    # Separate by status
    needs_fix = [r for r in results if r['needs_fix']]
    has_wrapper = [r for r in results if not r['needs_fix']]
    
    print(f"\n📊 Summary:")
    print(f"  ✅ Pages with api-fetch-wrapper.js: {len(has_wrapper)}")
    print(f"  ❌ Pages missing api-fetch-wrapper.js: {len(needs_fix)}")
    print(f"  📄 Total pages checked: {len(results)}")
    
    if needs_fix:
        print(f"\n❌ Pages that need fixing ({len(needs_fix)}):")
        for r in sorted(needs_fix, key=lambda x: x['file']):
            print(f"  - {r['file']}")
    
    return needs_fix

if __name__ == "__main__":
    missing = main()
    exit(1 if missing else 0)

