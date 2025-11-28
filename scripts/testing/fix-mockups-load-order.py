#!/usr/bin/env python3
"""
תיקון סדר טעינה - logger-service.js צריך להיות לפני מערכות אחרות
Fix Load Order - logger-service.js should be before other systems
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

def fix_load_order(content):
    """תיקון סדר טעינה - logger-service.js לפני מערכות אחרות"""
    
    # מצא את logger-service.js
    logger_match = re.search(r'<script[^>]*logger-service\.js[^>]*></script>', content)
    if not logger_match:
        return content, False  # אין logger-service.js
    
    logger_tag = logger_match.group(0)
    logger_pos = logger_match.start()
    
    # רשימת scripts שצריכים להיות אחרי logger-service.js
    scripts_after_logger = [
        "notification-system.js",
        "header-system.js",
        "preferences-core"
    ]
    
    # בדוק אם יש scripts שצריכים להיות אחרי logger לפני logger
    moved_scripts = []
    for script_pattern in scripts_after_logger:
        # מצא את כל המופעים של הסקריפט
        script_matches = list(re.finditer(rf'<script[^>]*{re.escape(script_pattern)}[^>]*></script>', content))
        for match in script_matches:
            if match.start() < logger_pos:
                # צריך להעביר אחרי logger
                script_tag = match.group(0)
                # הסר את הסקריפט מהמקום הנוכחי
                content = content[:match.start()] + content[match.end():]
                # עדכן את logger_pos אחרי הסרה
                if match.start() < logger_pos:
                    logger_pos -= len(script_tag) + 1
                
                # הוסף אחרי logger
                logger_end = content.find(logger_tag) + len(logger_tag)
                content = content[:logger_end] + '\n    ' + script_tag + content[logger_end:]
                moved_scripts.append(script_pattern)
                logger_pos = content.find(logger_tag) + len(logger_tag)
    
    return content, len(moved_scripts) > 0

def fix_page(page_name):
    """תיקון עמוד בודד"""
    page_path = MOCKUPS_DIR / page_name
    if not page_path.exists():
        return False
    
    with open(page_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    fixed_content, changed = fix_load_order(content)
    
    if changed:
        with open(page_path, 'w', encoding='utf-8') as f:
            f.write(fixed_content)
        return True
    
    return False

def main():
    print("🔧 תיקון סדר טעינה - logger-service.js לפני מערכות אחרות...\n")
    print("⚠️  הערה: סדר טעינה יכול להיות מורכב - זה דורש בדיקה ידנית")
    print("⏭️  דילוג על תיקון אוטומטי - מומלץ לתקן ידנית או לוודא שסדר תקין\n")

if __name__ == "__main__":
    main()

