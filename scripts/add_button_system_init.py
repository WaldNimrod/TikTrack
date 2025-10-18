#!/usr/bin/env python3
"""
סקריפט להוספת button-system-init.js לכל העמודים
Script to add button-system-init.js to all pages
"""

import os
import re

def add_button_system_init(file_path):
    """הוספת button-system-init.js לעמוד"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # בדיקה אם הקובץ כבר קיים
    if 'button-system-init.js' in content:
        print(f"⚠️  button-system-init.js כבר קיים ב: {file_path}")
        return False
    
    # חיפוש אחר button-icons.js
    button_icons_pattern = r'(<script src="scripts/button-icons\.js[^"]*"></script>)'
    match = re.search(button_icons_pattern, content)
    
    if match:
        # הוספה אחרי button-icons.js
        button_icons_script = match.group(1)
        new_script = button_icons_script + '\n    <script src="scripts/button-system-init.js"></script>'
        content = content.replace(button_icons_script, new_script)
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"✅ נוסף button-system-init.js ל: {file_path}")
        return True
    else:
        print(f"❌ לא נמצא button-icons.js ב: {file_path}")
        return False

def main():
    """פונקציה ראשית"""
    print("🚀 מתחיל הוספת button-system-init.js לכל העמודים...")
    
    # רשימת קבצי HTML
    html_files = [
        "trading-ui/trades.html",
        "trading-ui/alerts.html",
        "trading-ui/executions.html",
        "trading-ui/trading_accounts.html",
        "trading-ui/notes.html",
        "trading-ui/tickers.html",
        "trading-ui/cash_flows.html",
        "trading-ui/trade_plans.html",
        "trading-ui/constraints.html",
        "trading-ui/preferences.html",
        "trading-ui/designs.html",
        "trading-ui/db_display.html",
        "trading-ui/research.html",
        "trading-ui/db_extradata.html",
        "trading-ui/index.html"
    ]
    
    total_changes = 0
    
    for file_path in html_files:
        if os.path.exists(file_path):
            print(f"\n📄 מעבד: {file_path}")
            if add_button_system_init(file_path):
                total_changes += 1
    
    print(f"\n🎉 הושלם! {total_changes} קבצים עודכנו")
    print("✅ button-system-init.js נוסף לכל העמודים")

if __name__ == "__main__":
    main()
