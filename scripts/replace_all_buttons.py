#!/usr/bin/env python3
"""
סקריפט להחלפת כל הכפתורים במערכת המרכזית
Script to replace all buttons with centralized system
"""

import os
import re
import glob

def replace_sort_buttons(file_path):
    """החלפת כפתורי מיון בטבלאות"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # דפוס לכפתורי מיון
    sort_pattern = r'<button class="btn btn-link sortable-header"\s*onclick="([^"]+)"\s*([^>]*?)>\s*([^<]+?)\s*<span class="sort-icon">[^<]*</span>\s*</button>'
    
    def replace_sort(match):
        onclick = match.group(1)
        attributes = match.group(2).strip()
        text = match.group(3).strip()
        
        # ניקוי attributes מיותרים
        if 'style=' in attributes:
            style_match = re.search(r'style="([^"]*)"', attributes)
            if style_match:
                style = style_match.group(1)
                attributes = f'style="{style}"'
            else:
                attributes = ''
        else:
            attributes = ''
        
        return f'${{createSortButton("{onclick}", "sortable-header", "{attributes}", "{text}")}}'
    
    new_content = re.sub(sort_pattern, replace_sort, content, flags=re.DOTALL)
    
    if new_content != content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"✅ הוחלפו כפתורי מיון ב: {file_path}")
        return True
    return False

def replace_close_buttons(file_path):
    """החלפת כפתורי סגירה במודלים"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # דפוס לכפתורי סגירה
    close_pattern = r'<button type="button" class="btn-close" data-bs-dismiss="modal"([^>]*?)></button>'
    
    def replace_close(match):
        attributes = match.group(1).strip()
        if attributes:
            return f'${{createCloseButton("{attributes}")}}'
        else:
            return '${createCloseButton()}'
    
    new_content = re.sub(close_pattern, replace_close, content, flags=re.DOTALL)
    
    if new_content != content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"✅ הוחלפו כפתורי סגירה ב: {file_path}")
        return True
    return False

def replace_remaining_buttons(file_path):
    """החלפת כפתורים נוספים שנותרו"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    changes_made = False
    
    # כפתורי העתקה/ייצוא
    copy_pattern = r'<button class="btn btn-sm btn-outline-secondary" onclick="copyDetailedLog\(\)"([^>]*?)>\s*<i class="fas fa-copy"></i>\s*העתק לוג מפורט\s*</button>'
    def replace_copy(match):
        attributes = match.group(1).strip()
        if attributes:
            return f'${{createButton("EXPORT", "copyDetailedLog()", "btn-sm btn-outline-secondary", "{attributes}")}}'
        else:
            return '${createButton("EXPORT", "copyDetailedLog()", "btn-sm btn-outline-secondary", "")}'
    
    new_content = re.sub(copy_pattern, replace_copy, content, flags=re.DOTALL)
    if new_content != content:
        changes_made = True
        content = new_content
    
    # כפתורי הוספה
    add_pattern = r'<button class="btn btn-success" onclick="([^"]+)"([^>]*?)>\s*<i class="fas fa-plus"></i>\s*הוסף\s*</button>'
    def replace_add(match):
        onclick = match.group(1)
        attributes = match.group(2).strip()
        if attributes:
            return f'${{createButton("ADD", "{onclick}", "btn-success", "{attributes}")}}'
        else:
            return f'${{createButton("ADD", "{onclick}", "btn-success", "")}}'
    
    new_content = re.sub(add_pattern, replace_add, content, flags=re.DOTALL)
    if new_content != content:
        changes_made = True
        content = new_content
    
    if changes_made:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✅ הוחלפו כפתורים נוספים ב: {file_path}")
        return True
    return False

def main():
    """פונקציה ראשית"""
    print("🚀 מתחיל החלפת כפתורים במערכת המרכזית...")
    
    # רשימת קבצי HTML לעמודים החשובים
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
    
    # שלב 1: החלפת כפתורי מיון
    print("\n📊 שלב 1: החלפת כפתורי מיון בטבלאות...")
    for file_path in html_files:
        if os.path.exists(file_path):
            if replace_sort_buttons(file_path):
                total_changes += 1
    
    # שלב 2: החלפת כפתורי סגירה
    print("\n❌ שלב 2: החלפת כפתורי סגירה במודלים...")
    for file_path in html_files:
        if os.path.exists(file_path):
            if replace_close_buttons(file_path):
                total_changes += 1
    
    # שלב 3: החלפת כפתורים נוספים
    print("\n🔧 שלב 3: החלפת כפתורים נוספים...")
    for file_path in html_files:
        if os.path.exists(file_path):
            if replace_remaining_buttons(file_path):
                total_changes += 1
    
    print(f"\n🎉 הושלם! {total_changes} קבצים עודכנו")
    print("✅ כל הכפתורים הוחלפו במערכת המרכזית")

if __name__ == "__main__":
    main()
