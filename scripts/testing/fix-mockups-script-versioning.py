#!/usr/bin/env python3
"""
הוספת versioning (?v=) לסקריפטים
Add Versioning (?v=) to Scripts
"""

import os
import re
from pathlib import Path

MOCKUPS_DIR = Path("trading-ui/mockups/daily-snapshots")

MOCKUP_PAGES = [
    "portfolio-state-page.html",
    "trade-history-page.html",
    "price-history-page.html",
    "comparative-analysis-page.html",
    "trading-journal-page.html",
    "strategy-analysis-page.html",
    "economic-calendar-page.html",
    "history-widget.html",
    "emotional-tracking-widget.html",
    "date-comparison-modal.html",
    "tradingview-test-page.html"
]

def add_versioning_to_script(content):
    """הוספת versioning לסקריפטים ללא version"""
    changes_made = False
    
    # Pattern למציאת script tags ללא version
    pattern = r'(<script[^>]*src=["\']([^"\']+)["\'][^>]*>)'
    
    def add_version(match):
        full_tag = match.group(0)
        script_src = match.group(2)
        
        # דלג על CDN scripts
        if 'cdn.jsdelivr.net' in script_src or 'cdnjs.cloudflare.com' in script_src:
            return full_tag
        
        # דלג על scripts עם version
        if '?v=' in script_src or '&v=' in script_src:
            return full_tag
        
        # דלג על scripts חיצוניים
        if script_src.startswith('http'):
            return full_tag
        
        # הוסף version
        new_src = script_src + ('&' if '?' in script_src else '?') + 'v=1.0.0'
        new_tag = full_tag.replace(script_src, new_src)
        return new_tag
    
    new_content = re.sub(pattern, add_version, content)
    if new_content != content:
        changes_made = True
    
    return new_content, changes_made

def fix_page(page_name):
    """תיקון עמוד בודד"""
    page_path = MOCKUPS_DIR / page_name
    if not page_path.exists():
        print(f"⚠️ Page not found: {page_name}")
        return False
    
    with open(page_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    fixed_content, changed = add_versioning_to_script(content)
    
    if changed:
        with open(page_path, 'w', encoding='utf-8') as f:
            f.write(fixed_content)
        return True
    
    return False

def main():
    print("🔧 הוספת versioning (?v=) לסקריפטים...\n")
    
    fixed_count = 0
    for page_name in MOCKUP_PAGES:
        if fix_page(page_name):
            print(f"✅ Fixed: {page_name}")
            fixed_count += 1
        else:
            print(f"⏭️  No changes: {page_name}")
    
    print(f"\n✅ סה\"כ תוקן: {fixed_count} עמודים")

if __name__ == "__main__":
    main()

