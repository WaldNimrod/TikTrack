#!/usr/bin/env python3
"""
סקריפט לתיקון כפתורים שבורים - החזרה לטקסט HTML רגיל
Script to fix broken buttons - revert to normal HTML text
"""

import os
import re

def fix_broken_buttons(file_path):
    """תיקון כפתורים שבורים"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    changes_made = False
    
    # תיקון כפתורי ייצוא
    export_pattern = r'\$\{createButton\("EXPORT", "([^"]+)", "([^"]+)", "([^"]*)"\)\}'
    def replace_export(match):
        onclick = match.group(1)
        classes = match.group(2)
        attributes = match.group(3)
        if attributes:
            return f'<button class="btn {classes}" onclick="{onclick}" {attributes}><i class="fas fa-copy"></i> העתק לוג מפורט</button>'
        else:
            return f'<button class="btn {classes}" onclick="{onclick}"><i class="fas fa-copy"></i> העתק לוג מפורט</button>'
    
    new_content = re.sub(export_pattern, replace_export, content, flags=re.DOTALL)
    if new_content != content:
        changes_made = True
        content = new_content
    
    # תיקון כפתורי toggle
    toggle_pattern = r'\$\{createToggleButton\("([^"]+)", "([^"]+)", "([^"]*)"\)\}'
    def replace_toggle(match):
        onclick = match.group(1)
        title = match.group(2)
        classes = match.group(3)
        if classes:
            return f'<button class="btn {classes}" onclick="{onclick}" title="{title}">▼ {title}</button>'
        else:
            return f'<button class="btn btn-outline-warning" onclick="{onclick}" title="{title}">▼ {title}</button>'
    
    new_content = re.sub(toggle_pattern, replace_toggle, content, flags=re.DOTALL)
    if new_content != content:
        changes_made = True
        content = new_content
    
    # תיקון כפתורי הוספה
    add_pattern = r'\$\{createButton\("ADD", "([^"]+)", "([^"]+)", "([^"]*)"\)\}'
    def replace_add(match):
        onclick = match.group(1)
        classes = match.group(2)
        attributes = match.group(3)
        if attributes:
            return f'<button class="btn {classes}" onclick="{onclick}" {attributes}><i class="fas fa-plus"></i> הוסף</button>'
        else:
            return f'<button class="btn {classes}" onclick="{onclick}"><i class="fas fa-plus"></i> הוסף</button>'
    
    new_content = re.sub(add_pattern, replace_add, content, flags=re.DOTALL)
    if new_content != content:
        changes_made = True
        content = new_content
    
    # תיקון כפתורי רענון
    refresh_pattern = r'\$\{createButton\("REFRESH", "([^"]+)", "([^"]+)", "([^"]*)"\)\}'
    def replace_refresh(match):
        onclick = match.group(1)
        classes = match.group(2)
        attributes = match.group(3)
        if attributes:
            return f'<button class="btn {classes}" onclick="{onclick}" {attributes}><i class="fas fa-sync-alt"></i> רענן</button>'
        else:
            return f'<button class="btn {classes}" onclick="{onclick}"><i class="fas fa-sync-alt"></i> רענן</button>'
    
    new_content = re.sub(refresh_pattern, replace_refresh, content, flags=re.DOTALL)
    if new_content != content:
        changes_made = True
        content = new_content
    
    # תיקון כפתורי שמירה
    save_pattern = r'\$\{createButton\("SAVE", "([^"]+)", "([^"]+)", "([^"]*)"\)\}'
    def replace_save(match):
        onclick = match.group(1)
        classes = match.group(2)
        attributes = match.group(3)
        if attributes:
            return f'<button class="btn {classes}" onclick="{onclick}" {attributes}><i class="fas fa-save"></i> שמור</button>'
        else:
            return f'<button class="btn {classes}" onclick="{onclick}"><i class="fas fa-save"></i> שמור</button>'
    
    new_content = re.sub(save_pattern, replace_save, content, flags=re.DOTALL)
    if new_content != content:
        changes_made = True
        content = new_content
    
    # תיקון כפתורי פילטר
    filter_pattern = r'\$\{createButton\("FILTER", "([^"]+)", "([^"]+)", "([^"]*)"\)\}'
    def replace_filter(match):
        onclick = match.group(1)
        classes = match.group(2)
        attributes = match.group(3)
        if attributes:
            return f'<button class="btn {classes}" onclick="{onclick}" {attributes}><i class="fas fa-filter"></i> פילטר</button>'
        else:
            return f'<button class="btn {classes}" onclick="{onclick}"><i class="fas fa-filter"></i> פילטר</button>'
    
    new_content = re.sub(filter_pattern, replace_filter, content, flags=re.DOTALL)
    if new_content != content:
        changes_made = True
        content = new_content
    
    # תיקון כפתורי סגירה
    close_pattern = r'\$\{createCloseButton\("([^"]*)"\)\}'
    def replace_close(match):
        attributes = match.group(1)
        if attributes:
            return f'<button type="button" class="btn-close" data-bs-dismiss="modal" {attributes}></button>'
        else:
            return '<button type="button" class="btn-close" data-bs-dismiss="modal"></button>'
    
    new_content = re.sub(close_pattern, replace_close, content, flags=re.DOTALL)
    if new_content != content:
        changes_made = True
        content = new_content
    
    # תיקון כפתורי מיון
    sort_pattern = r'\$\{createSortButton\("([^"]+)", "([^"]+)", "([^"]*)", "([^"]*)"\)\}'
    def replace_sort(match):
        onclick = match.group(1)
        classes = match.group(2)
        attributes = match.group(3)
        text = match.group(4)
        if attributes:
            return f'<button class="btn {classes}" onclick="{onclick}" {attributes}>{text} <span class="sort-icon">↕</span></button>'
        else:
            return f'<button class="btn {classes}" onclick="{onclick}">{text} <span class="sort-icon">↕</span></button>'
    
    new_content = re.sub(sort_pattern, replace_sort, content, flags=re.DOTALL)
    if new_content != content:
        changes_made = True
        content = new_content
    
    if changes_made:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✅ תוקנו כפתורים שבורים ב: {file_path}")
        return True
    return False

def main():
    """פונקציה ראשית"""
    print("🚀 מתחיל תיקון כפתורים שבורים...")
    
    # רשימת קבצי HTML עם כפתורים שבורים
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
            if fix_broken_buttons(file_path):
                total_changes += 1
    
    print(f"\n🎉 הושלם! {total_changes} קבצים תוקנו")
    print("✅ כל הכפתורים השבורים תוקנו")

if __name__ == "__main__":
    main()
