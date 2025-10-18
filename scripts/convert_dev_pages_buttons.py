#!/usr/bin/env python3
"""
סקריפט להמרת כפתורים בעמודי כלי פיתוח
Script to convert buttons in development tools pages
"""

import os
import re

def convert_dev_page_buttons(file_path):
    """המרת כפתורים בעמוד כלי פיתוח"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    changes_made = False
    
    # המרת כפתורי ייצוא
    export_pattern = r'<button class="btn[^"]*"[^>]*onclick="copyDetailedLog\(\)"[^>]*>.*?📤 העתק לוג מפורט.*?</button>'
    def replace_export(match):
        return '<button data-button-type="EXPORT" data-onclick="copyDetailedLog()" data-classes="btn-sm btn-outline-secondary" data-text="העתק לוג מפורט" data-attributes="title=\\"העתק לוג מפורט\\""></button>'
    
    new_content = re.sub(export_pattern, replace_export, content, flags=re.DOTALL)
    if new_content != content:
        changes_made = True
        content = new_content
    
    # המרת כפתורי toggle
    toggle_pattern = r'<button class="btn[^"]*"[^>]*onclick="toggleSection\([^)]+\)"[^>]*>.*?▼ הצג/הסתר.*?</button>'
    def replace_toggle(match):
        return '<button data-button-type="TOGGLE" data-onclick="toggleSection(\'top\')" data-classes="btn-outline-warning" data-text="הצג/הסתר" data-attributes="title=\\"הצג/הסתר\\""></button>'
    
    new_content = re.sub(toggle_pattern, replace_toggle, content, flags=re.DOTALL)
    if new_content != content:
        changes_made = True
        content = new_content
    
    # המרת כפתורי רענון
    refresh_pattern = r'<button class="btn[^"]*"[^>]*onclick="[^"]*refresh[^"]*"[^>]*>.*?🔄 רענן.*?</button>'
    def replace_refresh(match):
        return '<button data-button-type="REFRESH" data-onclick="refreshData()" data-classes="refresh-btn" data-text="רענן" data-attributes="title=\\"רענן\\""></button>'
    
    new_content = re.sub(refresh_pattern, replace_refresh, content, flags=re.DOTALL)
    if new_content != content:
        changes_made = True
        content = new_content
    
    # המרת כפתורי סגירה
    close_pattern = r'<button[^>]*class="btn-close"[^>]*data-bs-dismiss="modal"[^>]*></button>'
    def replace_close(match):
        return '<button data-button-type="CLOSE" data-attributes="type=\\"button\\" class=\\"btn-close\\" data-bs-dismiss=\\"modal\\""></button>'
    
    new_content = re.sub(close_pattern, replace_close, content, flags=re.DOTALL)
    if new_content != content:
        changes_made = True
        content = new_content
    
    # המרת כפתורי שמירה
    save_pattern = r'<button class="btn[^"]*"[^>]*onclick="[^"]*save[^"]*"[^>]*>.*?💾 שמור.*?</button>'
    def replace_save(match):
        return '<button data-button-type="SAVE" data-onclick="saveData()" data-classes="btn-success" data-text="שמור" data-attributes="title=\\"שמור\\""></button>'
    
    new_content = re.sub(save_pattern, replace_save, content, flags=re.DOTALL)
    if new_content != content:
        changes_made = True
        content = new_content
    
    # המרת כפתורי ביטול
    cancel_pattern = r'<button class="btn[^"]*"[^>]*onclick="[^"]*cancel[^"]*"[^>]*>.*?❌ ביטול.*?</button>'
    def replace_cancel(match):
        return '<button data-button-type="CANCEL" data-onclick="closeModal()" data-classes="btn-secondary" data-text="ביטול" data-attributes="data-bs-dismiss=\\"modal\\""></button>'
    
    new_content = re.sub(cancel_pattern, replace_cancel, content, flags=re.DOTALL)
    if new_content != content:
        changes_made = True
        content = new_content
    
    # הוספת button-system-init.js אם לא קיים
    if 'button-system-init.js' not in content and 'button-icons.js' in content:
        button_icons_pattern = r'(<script src="scripts/button-icons\.js[^"]*"></script>)'
        match = re.search(button_icons_pattern, content)
        
        if match:
            button_icons_script = match.group(1)
            new_script = button_icons_script + '\n    <script src="scripts/button-system-init.js"></script>'
            content = content.replace(button_icons_script, new_script)
            changes_made = True
    
    if changes_made:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✅ הומרו כפתורים בעמוד כלי פיתוח: {file_path}")
        return True
    return False

def main():
    """פונקציה ראשית"""
    print("🚀 מתחיל המרת כפתורים בעמודי כלי פיתוח...")
    
    # רשימת עמודי כלי פיתוח
    dev_files = [
        "trading-ui/system-management.html",
        "trading-ui/linter-realtime-monitor.html",
        "trading-ui/page-scripts-matrix.html",
        "trading-ui/server-monitor.html",
        "trading-ui/notifications-center.html",
        "trading-ui/background-tasks.html",
        "trading-ui/dynamic-colors-display.html",
        "trading-ui/external-data-dashboard.html",
        "trading-ui/crud-testing-dashboard.html",
        "trading-ui/test-header-only.html"
    ]
    
    total_changes = 0
    
    for file_path in dev_files:
        if os.path.exists(file_path):
            print(f"\n📄 מעבד: {file_path}")
            if convert_dev_page_buttons(file_path):
                total_changes += 1
    
    print(f"\n🎉 הושלם! {total_changes} עמודי כלי פיתוח עודכנו")
    print("✅ כל הכפתורים בעמודי כלי הפיתוח הומרו")

if __name__ == "__main__":
    main()
