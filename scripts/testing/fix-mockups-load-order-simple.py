#!/usr/bin/env python3
"""
תיקון סדר טעינה פשוט - העברת logger-service.js לפני header-system.js
Simple Load Order Fix - Move logger-service.js before header-system.js
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

def fix_load_order(page_path):
    """תיקון סדר טעינה פשוט"""
    with open(page_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # מצא את logger-service.js
    logger_match = re.search(r'(<!--\s*Logger Service[^>]*-->)?\s*<script[^>]*logger-service\.js[^>]*></script>', content)
    if not logger_match:
        return False  # אין logger-service.js
    
    logger_tag = logger_match.group(0)
    logger_pos = logger_match.start()
    
    # מצא את header-system.js (אם יש לפני logger)
    header_pattern = r'<script[^>]*header-system\.js[^>]*></script>'
    header_matches = list(re.finditer(header_pattern, content))
    
    moved = False
    for header_match in header_matches:
        if header_match.start() < logger_pos:
            # צריך להזיז את header-system אחרי logger
            header_tag = header_match.group(0)
            
            # הסר את header-system מהמקום הנוכחי
            content = content[:header_match.start()] + content[header_match.end():]
            
            # עדכן את logger_pos
            if header_match.start() < logger_pos:
                logger_pos -= len(header_tag)
                # עדכן את logger_match
                logger_match = re.search(r'(<!--\s*Logger Service[^>]*-->)?\s*<script[^>]*logger-service\.js[^>]*></script>', content)
                if logger_match:
                    logger_pos = logger_match.start()
            
            # הוסף את header-system אחרי logger
            if logger_match:
                logger_end = logger_match.end()
                # הוסף שורה חדשה ושדה ריק לפני header
                content = content[:logger_end] + '\n    ' + header_tag + content[logger_end:]
                moved = True
                break
    
    if moved and content != original_content:
        with open(page_path, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    
    return False

def main():
    print("🔧 תיקון סדר טעינה - העברת header-system.js אחרי logger-service.js...\n")
    print("⚠️  הערה: זה דורש זהירות - רק אם header-system לפני logger-service\n")
    
    # בינתיים נדלג על זה - דורש תיקון ידני יותר מדויק
    print("⏭️  דילוג על תיקון אוטומטי - מומלץ לתקן ידנית")

if __name__ == "__main__":
    main()

