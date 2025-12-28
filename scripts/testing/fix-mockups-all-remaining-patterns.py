#!/usr/bin/env python3
"""
תיקון כל הדפוסים הנותרים בעמודי מוקאפ
Fix All Remaining Patterns in Mockup Pages
"""

import os
import re
from pathlib import Path

MOCKUPS_DIR = Path("trading-ui/mockups/daily-snapshots")

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

def fix_load_order_simple(content):
    """תיקון סדר טעינה פשוט - העברת logger-service לפני header-system"""
    
    # מצא את logger-service.js עם error-handlers ו-api-config
    logger_section_pattern = r'(<!--\s*(?:Error Handlers|Logger Service|API Config)[^>]*-->\s*)?<script[^>]*(?:error-handlers|api-config|logger-service)\.js[^>]*></script>'
    
    # מצא את כל הקבוצה של error-handlers + api-config + logger-service
    logger_group_pattern = r'(<!--\s*Error Handlers[^>]*-->\s*<script[^>]*error-handlers\.js[^>]*></script>\s*<!--\s*API Config[^>]*-->\s*<script[^>]*api-config\.js[^>]*></script>\s*(?:<!--\s*Logger Service[^>]*-->\s*)?<script[^>]*logger-service\.js[^>]*></script>)'
    
    logger_group_match = re.search(logger_group_pattern, content, re.MULTILINE)
    if not logger_group_match:
        # נסה למצוא בנפרד
        error_handlers_match = re.search(r'<script[^>]*error-handlers\.js[^>]*></script>', content)
        api_config_match = re.search(r'<script[^>]*api-config\.js[^>]*></script>', content)
        logger_match = re.search(r'<script[^>]*logger-service\.js[^>]*></script>', content)
        
        if not (error_handlers_match and api_config_match and logger_match):
            return content, False
        
        # בניית הקבוצה
        logger_group = ""
        if error_handlers_match:
            logger_group += error_handlers_match.group(0) + "\n    "
        if api_config_match:
            logger_group += "<!-- API Config -->\n    <script src=\"../../scripts/api-config.js?v=1.0.0\"></script>\n    "
        if logger_match:
            logger_group += "<!-- Logger Service -->\n    " + logger_match.group(0)
        
        # הסר את הסקריפטים מהמקומות הנוכחיים
        if error_handlers_match:
            content = content[:error_handlers_match.start()] + content[error_handlers_match.end():]
        if api_config_match and api_config_match != error_handlers_match:
            content = content[:api_config_match.start()] + content[api_config_match.end():]
        if logger_match and logger_match != error_handlers_match and logger_match != api_config_match:
            content = content[:logger_match.start()] + content[logger_match.end():]
        
        # הוסף לפני header-system.js
        header_match = re.search(r'<script[^>]*header-system\.js[^>]*>', content)
        if header_match:
            content = content[:header_match.start()] + "<!-- Error Handlers (Must load first) -->\n    " + logger_group + "\n    \n    " + content[header_match.start():]
            return content, True
    
    return content, False

def fix_page(page_name):
    """תיקון עמוד בודד"""
    page_path = MOCKUPS_DIR / page_name
    if not page_path.exists():
        return False
    
    with open(page_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # תיקון סדר טעינה
    content, changed = fix_load_order_simple(content)
    
    if changed:
        with open(page_path, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    
    return False

def main():
    print("🔧 תיקון דפוסים נותרים בעמודי מוקאפ...\n")
    print("⚠️  זה דורש תיקון ידני מדויק - דילוג על תיקון אוטומטי\n")
    print("📝 המלצה: לתקן ידנית את סדר הטעינה לפי התקן")

if __name__ == "__main__":
    main()

