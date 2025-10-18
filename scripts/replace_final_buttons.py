#!/usr/bin/env python3
"""
סקריפט להחלפת הכפתורים הסופיים במערכת המרכזית
Script to replace final remaining buttons with centralized system
"""

import os
import re

def replace_remaining_buttons(file_path):
    """החלפת כל הכפתורים הנותרים"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    changes_made = False
    
    # כפתורי הוספה עם ID
    add_pattern = r'<button id="addTradeBtn" class="btn btn-success" onclick="([^"]+)"([^>]*?)>'
    def replace_add(match):
        onclick = match.group(1)
        attributes = match.group(2).strip()
        if attributes:
            return f'${{createButton("ADD", "{onclick}", "btn-success", "id=\\"addTradeBtn\\" {attributes}")}}'
        else:
            return f'${{createButton("ADD", "{onclick}", "btn-success", "id=\\"addTradeBtn\\"")}}'
    
    new_content = re.sub(add_pattern, replace_add, content, flags=re.DOTALL)
    if new_content != content:
        changes_made = True
        content = new_content
    
    # כפתורי עריכה עם ID
    edit_pattern = r'<button id="editTradeBtn" class="btn btn-secondary d-none" onclick="([^"]+)"([^>]*?)>'
    def replace_edit(match):
        onclick = match.group(1)
        attributes = match.group(2).strip()
        if attributes:
            return f'${{createEditButton("{onclick}", "d-none", "id=\\"editTradeBtn\\" {attributes}")}}'
        else:
            return f'${{createEditButton("{onclick}", "d-none", "id=\\"editTradeBtn\\"")}}'
    
    new_content = re.sub(edit_pattern, replace_edit, content, flags=re.DOTALL)
    if new_content != content:
        changes_made = True
        content = new_content
    
    # כפתורי מחיקה עם ID
    delete_pattern = r'<button id="deleteTradeBtn" class="btn btn-danger d-none" onclick="([^"]+)"([^>]*?)>'
    def replace_delete(match):
        onclick = match.group(1)
        attributes = match.group(2).strip()
        if attributes:
            return f'${{createDeleteButton("{onclick}", "d-none", "id=\\"deleteTradeBtn\\" {attributes}")}}'
        else:
            return f'${{createDeleteButton("{onclick}", "d-none", "id=\\"deleteTradeBtn\\"")}}'
    
    new_content = re.sub(delete_pattern, replace_delete, content, flags=re.DOTALL)
    if new_content != content:
        changes_made = True
        content = new_content
    
    # כפתורי סגירה במודלים
    close_pattern = r'<button type="button" class="btn-close" data-bs-dismiss="modal"([^>]*?)></button>'
    def replace_close(match):
        attributes = match.group(1).strip()
        if attributes:
            return f'${{createCloseButton("{attributes}")}}'
        else:
            return '${createCloseButton()}'
    
    new_content = re.sub(close_pattern, replace_close, content, flags=re.DOTALL)
    if new_content != content:
        changes_made = True
        content = new_content
    
    # כפתורי הוספה עם ID אחר
    add_pattern2 = r'<button id="addTradePlanBtn" class="btn btn-success" onclick="([^"]+)"([^>]*?)>'
    def replace_add2(match):
        onclick = match.group(1)
        attributes = match.group(2).strip()
        if attributes:
            return f'${{createButton("ADD", "{onclick}", "btn-success", "id=\\"addTradePlanBtn\\" {attributes}")}}'
        else:
            return f'${{createButton("ADD", "{onclick}", "btn-success", "id=\\"addTradePlanBtn\\"")}}'
    
    new_content = re.sub(add_pattern2, replace_add2, content, flags=re.DOTALL)
    if new_content != content:
        changes_made = True
        content = new_content
    
    # כפתורי פילטרים עם סגנון מיוחד
    filter_pattern = r'<button class="btn btn-sm active" onclick="([^"]+)"([^>]*?)>([^<]+)</button>'
    def replace_filter(match):
        onclick = match.group(1)
        attributes = match.group(2).strip()
        text = match.group(3).strip()
        if attributes:
            return f'${{createButton("FILTER", "{onclick}", "btn-sm active", "{attributes}")}}'
        else:
            return f'${{createButton("FILTER", "{onclick}", "btn-sm active", "")}}'
    
    new_content = re.sub(filter_pattern, replace_filter, content, flags=re.DOTALL)
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
        print(f"✅ הוחלפו כפתורים סופיים ב: {file_path}")
        return True
    return False

def main():
    """פונקציה ראשית"""
    print("🚀 מתחיל החלפת הכפתורים הסופיים במערכת המרכזית...")
    
    # רשימת קבצי HTML עם כפתורים שנותרו
    html_files = [
        "trading-ui/trades.html",
        "trading-ui/trade_plans.html", 
        "trading-ui/alerts.html",
        "trading-ui/preferences.html",
        "trading-ui/research.html"
    ]
    
    total_changes = 0
    
    for file_path in html_files:
        if os.path.exists(file_path):
            print(f"\n📄 מעבד: {file_path}")
            if replace_remaining_buttons(file_path):
                total_changes += 1
    
    print(f"\n🎉 הושלם! {total_changes} קבצים עודכנו")
    print("✅ כל הכפתורים הסופיים הוחלפו במערכת המרכזית")

if __name__ == "__main__":
    main()
