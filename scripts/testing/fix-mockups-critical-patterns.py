#!/usr/bin/env python3
"""
תיקון דפוסים קריטיים בעמודי מוקאפ
Fix Critical Patterns in Mockup Pages
"""

import os
import re
from pathlib import Path

MOCKUPS_DIR = Path("trading-ui/mockups/daily-snapshots")

# עמודים שצריך לתקן (לא כולל trading-journal-page שכבר תקין ברוב המקרים)
PAGES_TO_FIX = [
    "portfolio_state_page.html",
    "trade_history_page.html",
    "price_history_page.html",
    "comparative_analysis_page.html",
    "strategy_analysis_page.html",
    "economic_calendar_page.html",
    "history_widget.html",
    "emotional_tracking_widget.html",
    "date_comparison_modal.html",
    "tradingview_test_page.html"
]

def add_error_handlers(content):
    """הוספת error-handlers.js לפני scripts אחרים"""
    if 'error-handlers.js' in content:
        return content  # כבר קיים
    
    # מוסיף אחרי preconnect, לפני scripts אחרים
    if 'api-config.js' in content:
        pattern = r'(<script[^>]*api-config\.js[^>]*></script>)'
        replacement = r'<!-- Error Handlers (Must load first) -->\n    <script src="../../scripts/error-handlers.js?v=1.0.0"></script>\n    \1'
        content = re.sub(pattern, replacement, content, count=1)
    elif 'logger-service.js' in content:
        pattern = r'(<script[^>]*logger-service\.js[^>]*></script>)'
        replacement = r'<!-- Error Handlers (Must load first) -->\n    <script src="../../scripts/error-handlers.js?v=1.0.0"></script>\n    \1'
        content = re.sub(pattern, replacement, content, count=1)
    else:
        # מוסיף בתחילת scripts section
        pattern = r'(<!--\s*(?:Core Systems|TradingView|Icon System|Header System|Preferences System|Notification System|Logger Service)[^>]*-->)'
        if re.search(pattern, content):
            replacement = r'<!-- Error Handlers (Must load first) -->\n    <script src="../../scripts/error-handlers.js?v=1.0.0"></script>\n    \1'
            content = re.sub(pattern, replacement, content, count=1)
    
    return content

def add_api_config(content):
    """הוספת api-config.js לפני scripts אחרים"""
    if 'api-config.js' in content:
        return content  # כבר קיים
    
    # מוסיף אחרי error-handlers, לפני scripts אחרים
    if 'error-handlers.js' in content:
        pattern = r'(<script[^>]*error-handlers\.js[^>]*></script>)'
        replacement = r'\1\n    <!-- API Config -->\n    <script src="../../scripts/api-config.js?v=1.0.0"></script>'
        content = re.sub(pattern, replacement, content, count=1)
    elif 'logger-service.js' in content:
        pattern = r'(<script[^>]*logger-service\.js[^>]*></script>)'
        replacement = r'<!-- API Config -->\n    <script src="../../scripts/api-config.js?v=1.0.0"></script>\n    \1'
        content = re.sub(pattern, replacement, content, count=1)
    
    return content

def fix_logger_order(content):
    """תיקון סדר טעינה - logger-service.js צריך להיות לפני מערכות אחרות"""
    logger_pos = content.find("logger-service.js")
    if logger_pos == -1:
        return content  # אין logger-service
    
    # בדוק אם יש scripts לפני logger שצריכים להיות אחרי
    scripts_to_move_after_logger = [
        ("notification-system.js", "Notification System"),
        ("header-system.js", "Header System"),
    ]
    
    # לא נעביר - רק נוסיף הערה
    # במקום זה, נוודא ש-logger-service.js נמצא לפני
    return content

def remove_defer_from_logger(content):
    """הסרת defer מ-logger-service.js"""
    pattern = r'<script([^>]*)logger-service\.js([^>]*)defer([^>]*)></script>'
    
    def remove_defer(match):
        full_tag = match.group(0)
        # הסר defer מה-attributes
        new_tag = full_tag.replace(' defer', '').replace('defer ', '').replace(' defer ', '')
        return new_tag
    
    if re.search(pattern, content):
        content = re.sub(pattern, remove_defer, content)
    
    # גם בדיקה עם defer לפני logger-service
    pattern2 = r'<script([^>]*)defer([^>]*)logger-service\.js([^>]*)></script>'
    if re.search(pattern2, content):
        def remove_defer2(match):
            full_tag = match.group(0)
            new_tag = full_tag.replace(' defer', '').replace('defer ', '').replace(' defer ', '')
            return new_tag
        content = re.sub(pattern2, remove_defer2, content)
    
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
    
    # תיקון 1: error-handlers.js
    content = add_error_handlers(content)
    
    # תיקון 2: api-config.js
    content = add_api_config(content)
    
    # תיקון 3: הסרת defer מ-logger-service.js
    content = remove_defer_from_logger(content)
    
    if content != original_content:
        with open(page_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✅ Fixed: {page_name}")
        return True
    else:
        print(f"⏭️  No changes needed: {page_name}")
        return False

def main():
    print("🔧 תיקון דפוסים קריטיים בעמודי מוקאפ...\n")
    
    fixed_count = 0
    for page_name in PAGES_TO_FIX:
        if fix_page(page_name):
            fixed_count += 1
    
    print(f"\n✅ סה\"כ תוקן: {fixed_count} עמודים")

if __name__ == "__main__":
    main()

