#!/usr/bin/env python3
"""
תיקון דפוסים חוזרים בעמודי מוקאפ
Fix Recurring Patterns in Mockup Pages
"""

import os
import re
from pathlib import Path

MOCKUPS_DIR = Path("trading-ui/mockups/daily-snapshots")

# עמודים שצריך לתקן (לא כולל trading-journal-page ו-date-comparison-modal שכבר תקינים)
PAGES_TO_FIX = [
    "portfolio_state_page.html",
    "trade_history_page.html",
    "price_history_page.html",
    "comparative_analysis_page.html",
    "strategy_analysis_page.html",
    "economic_calendar_page.html",
    "history_widget.html",
    "emotional_tracking_widget.html",
    "tradingview_test_page.html"
]

def add_unified_cache_manager(content):
    """הוספת unified-cache-manager.js לפני IconSystem"""
    # חיפוש אחר icon-mappings.js או icon-system.js
    icon_pattern = r'(<!--\s*Icon System[^>]*-->|<!--\s*\[.*?\]\s*Load Order:.*?icon-mappings)'
    
    if 'unified-cache-manager.js' in content:
        return content  # כבר קיים
    
    # נסה למצוא מקום להוסיף (אחרי error-handlers או לפני IconSystem)
    if 'error-handlers.js' in content:
        pattern = r'(<script[^>]*error-handlers\.js[^>]*></script>)'
        replacement = r'\1\n    <!-- [8] Load Order: 8 -->\n    <script src="../../scripts/unified-cache-manager.js?v=1.0.0"></script> <!-- Unified cache manager -->'
        content = re.sub(pattern, replacement, content, count=1)
    elif re.search(icon_pattern, content):
        # מוסיף לפני IconSystem
        pattern = r'(<!--\s*Icon System[^>]*-->|<script[^>]*icon-mappings\.js[^>]*></script>)'
        replacement = r'<!-- [8] Load Order: 8 -->\n    <script src="../../scripts/unified-cache-manager.js?v=1.0.0"></script> <!-- Unified cache manager -->\n    \1'
        content = re.sub(pattern, replacement, content, count=1)
    
    return content

def add_icon_replacement_helper(content):
    """הוספת icon-replacement-helper.js אחרי icon-system.js"""
    if 'icon-replacement-helper.js' in content:
        return content  # כבר קיים
    
    # חיפוש אחר icon-system.js
    pattern = r'(<script[^>]*icon-system\.js[^>]*></script>)'
    replacement = r'\1\n    <script src="../../scripts/icon-replacement-helper.js?v=1.0.0"></script> <!-- Icon replacement helper -->'
    content = re.sub(pattern, replacement, content, count=1)
    
    return content

def add_icon_mappings_to_tradingview(content):
    """הוספת icon-mappings.js ל-tradingview-test-page"""
    if 'icon-mappings.js' in content:
        return content  # כבר קיים
    
    # נסה למצוא מקום להוסיף לפני icon-system
    if 'icon-system.js' in content:
        pattern = r'(<script[^>]*icon-system\.js[^>]*></script>)'
        replacement = r'<script src="../../scripts/icon-mappings.js?v=1.0.0"></script>\n    \1'
        content = re.sub(pattern, replacement, content, count=1)
    
    return content

def fix_page(page_name):
    """תיקון עמוד בודד"""
    page_path = MOCKUPS_DIR / page_name
    if not page_path.exists():
        print(f"⚠️ Page not found: {page_name}")
        return False
    
    with open(page_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # תיקון 1: unified-cache-manager.js
    content = add_unified_cache_manager(content)
    
    # תיקון 2: icon-replacement-helper.js
    content = add_icon_replacement_helper(content)
    
    # תיקון 3: icon-mappings.js ל-tradingview-test-page
    if page_name == "tradingview_test_page.html":
        content = add_icon_mappings_to_tradingview(content)
    
    if content != original_content:
        with open(page_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✅ Fixed: {page_name}")
        return True
    else:
        print(f"⏭️  No changes needed: {page_name}")
        return False

def main():
    print("🔧 תיקון דפוסים חוזרים בעמודי מוקאפ...\n")
    
    fixed_count = 0
    for page_name in PAGES_TO_FIX:
        if fix_page(page_name):
            fixed_count += 1
    
    print(f"\n✅ סה\"כ תוקן: {fixed_count} עמודים")

if __name__ == "__main__":
    main()

