#!/usr/bin/env python3
"""
סקריפט להחלפת כפתורי המיון הנותרים במערכת המרכזית
Script to replace remaining sort buttons with centralized system
"""

import os
import re

def replace_final_sort_buttons(file_path):
    """החלפת כפתורי המיון הנותרים"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    changes_made = False
    
    # כפתורי מיון עם sortTableData
    sort_pattern = r'<button class="btn btn-link sortable-header" onclick="([^"]+)"([^>]*?)>'
    def replace_sort(match):
        onclick = match.group(1)
        attributes = match.group(2).strip()
        if attributes:
            return f'${{createSortButton("{onclick}", "sortable-header", "{attributes}", "")}}'
        else:
            return f'${{createSortButton("{onclick}", "sortable-header", "", "")}}'
    
    new_content = re.sub(sort_pattern, replace_sort, content, flags=re.DOTALL)
    if new_content != content:
        changes_made = True
        content = new_content
    
    # כפתורי toggle עם סגנון מיוחד
    toggle_pattern = r'<button class="btn btn-outline-secondary btn-sm" onclick="([^"]+)"([^>]*?)>'
    def replace_toggle(match):
        onclick = match.group(1)
        attributes = match.group(2).strip()
        if attributes:
            return f'${{createToggleButton("{onclick}", "הצג/הסתר", "btn-outline-secondary btn-sm")}}'
        else:
            return f'${{createToggleButton("{onclick}", "הצג/הסתר", "btn-outline-secondary btn-sm")}}'
    
    new_content = re.sub(toggle_pattern, replace_toggle, content, flags=re.DOTALL)
    if new_content != content:
        changes_made = True
        content = new_content
    
    # כפתורי שמירה עם סגנון מיוחד
    save_pattern = r'<button type="button" class="btn btn-primary btn-sm w-100 mb-2" onclick="([^"]+)"([^>]*?)>'
    def replace_save(match):
        onclick = match.group(1)
        attributes = match.group(2).strip()
        if attributes:
            return f'${{createButton("SAVE", "{onclick}", "btn-primary btn-sm w-100 mb-2", "{attributes}")}}'
        else:
            return f'${{createButton("SAVE", "{onclick}", "btn-primary btn-sm w-100 mb-2", "")}}'
    
    new_content = re.sub(save_pattern, replace_save, content, flags=re.DOTALL)
    if new_content != content:
        changes_made = True
        content = new_content
    
    if changes_made:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✅ הוחלפו כפתורי המיון הנותרים ב: {file_path}")
        return True
    return False

def main():
    """פונקציה ראשית"""
    print("🚀 מתחיל החלפת כפתורי המיון הנותרים במערכת המרכזית...")
    
    # רשימת קבצי HTML עם כפתורי מיון שנותרו
    html_files = [
        "trading-ui/trade_plans.html",
        "trading-ui/preferences.html"
    ]
    
    total_changes = 0
    
    for file_path in html_files:
        if os.path.exists(file_path):
            print(f"\n📄 מעבד: {file_path}")
            if replace_final_sort_buttons(file_path):
                total_changes += 1
    
    print(f"\n🎉 הושלם! {total_changes} קבצים עודכנו")
    print("✅ כל כפתורי המיון הנותרים הוחלפו במערכת המרכזית")

if __name__ == "__main__":
    main()
