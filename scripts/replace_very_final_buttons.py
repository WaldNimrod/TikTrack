#!/usr/bin/env python3
"""
סקריפט להחלפת הכפתורים הסופיים ביותר במערכת המרכזית
Script to replace very final buttons with centralized system
"""

import os
import re

def replace_very_final_buttons(file_path):
    """החלפת הכפתורים הסופיים ביותר"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    changes_made = False
    
    # כפתורי ביטול במודלים
    cancel_pattern = r'<button type="button" class="btn btn-secondary" data-bs-dismiss="modal"([^>]*?)>'
    def replace_cancel(match):
        attributes = match.group(1).strip()
        if attributes:
            return f'${{createButton("CANCEL", "data-bs-dismiss=\\"modal\\"", "", "{attributes}")}}'
        else:
            return '${createButton("CANCEL", "data-bs-dismiss=\\"modal\\"", "", "")}'
    
    new_content = re.sub(cancel_pattern, replace_cancel, content, flags=re.DOTALL)
    if new_content != content:
        changes_made = True
        content = new_content
    
    # כפתורי שמירה במודלים
    save_pattern = r'<button type="button" class="btn btn-primary" onclick="([^"]+)"([^>]*?)>'
    def replace_save(match):
        onclick = match.group(1)
        attributes = match.group(2).strip()
        if attributes:
            return f'${{createButton("SAVE", "{onclick}", "", "{attributes}")}}'
        else:
            return f'${{createButton("SAVE", "{onclick}", "", "")}}'
    
    new_content = re.sub(save_pattern, replace_save, content, flags=re.DOTALL)
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
    
    if changes_made:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✅ הוחלפו הכפתורים הסופיים ביותר ב: {file_path}")
        return True
    return False

def main():
    """פונקציה ראשית"""
    print("🚀 מתחיל החלפת הכפתורים הסופיים ביותר במערכת המרכזית...")
    
    # רשימת קבצי HTML עם כפתורים שנותרו
    html_files = [
        "trading-ui/trade_plans.html",
        "trading-ui/preferences.html"
    ]
    
    total_changes = 0
    
    for file_path in html_files:
        if os.path.exists(file_path):
            print(f"\n📄 מעבד: {file_path}")
            if replace_very_final_buttons(file_path):
                total_changes += 1
    
    print(f"\n🎉 הושלם! {total_changes} קבצים עודכנו")
    print("✅ כל הכפתורים הסופיים ביותר הוחלפו במערכת המרכזית")

if __name__ == "__main__":
    main()
