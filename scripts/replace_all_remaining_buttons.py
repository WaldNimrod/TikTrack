#!/usr/bin/env python3
"""
סקריפט להחלפת כל הכפתורים הנותרים במערכת המרכזית
Script to replace all remaining buttons with centralized system
"""

import os
import re

def replace_all_remaining_buttons(file_path):
    """החלפת כל הכפתורים הנותרים"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    changes_made = False
    
    # כפתורי קישור
    link_pattern = r'<button class="btn btn-outline-primary btn-sm" onclick="([^"]+)"([^>]*?)>'
    def replace_link(match):
        onclick = match.group(1)
        attributes = match.group(2).strip()
        if attributes:
            return f'${{createLinkButton("{onclick}", "btn-outline-primary btn-sm", "{attributes}")}}'
        else:
            return f'${{createLinkButton("{onclick}", "btn-outline-primary btn-sm", "")}}'
    
    new_content = re.sub(link_pattern, replace_link, content, flags=re.DOTALL)
    if new_content != content:
        changes_made = True
        content = new_content
    
    # כפתורי הוספת הערות
    note_pattern = r'<button class="btn btn-outline-info btn-sm" onclick="([^"]+)"([^>]*?)>'
    def replace_note(match):
        onclick = match.group(1)
        attributes = match.group(2).strip()
        if attributes:
            return f'${{createButton("ADD", "{onclick}", "btn-outline-info btn-sm", "{attributes}")}}'
        else:
            return f'${{createButton("ADD", "{onclick}", "btn-outline-info btn-sm", "")}}'
    
    new_content = re.sub(note_pattern, replace_note, content, flags=re.DOTALL)
    if new_content != content:
        changes_made = True
        content = new_content
    
    # כפתורי הוספת תזכורות
    reminder_pattern = r'<button class="btn btn-outline-warning btn-sm" onclick="([^"]+)"([^>]*?)>'
    def replace_reminder(match):
        onclick = match.group(1)
        attributes = match.group(2).strip()
        if attributes:
            return f'${{createButton("ADD", "{onclick}", "btn-outline-warning btn-sm", "{attributes}")}}'
        else:
            return f'${{createButton("ADD", "{onclick}", "btn-outline-warning btn-sm", "")}}'
    
    new_content = re.sub(reminder_pattern, replace_reminder, content, flags=re.DOTALL)
    if new_content != content:
        changes_made = True
        content = new_content
    
    # כפתורי הוספת הערות עם me-2
    note_me2_pattern = r'<button class="btn btn-info me-2" onclick="([^"]+)"([^>]*?)>'
    def replace_note_me2(match):
        onclick = match.group(1)
        attributes = match.group(2).strip()
        if attributes:
            return f'${{createButton("ADD", "{onclick}", "btn-info me-2", "{attributes}")}}'
        else:
            return f'${{createButton("ADD", "{onclick}", "btn-info me-2", "")}}'
    
    new_content = re.sub(note_me2_pattern, replace_note_me2, content, flags=re.DOTALL)
    if new_content != content:
        changes_made = True
        content = new_content
    
    # כפתורי הוספת תזכורות עם warning
    reminder_warning_pattern = r'<button class="btn btn-warning" onclick="([^"]+)"([^>]*?)>'
    def replace_reminder_warning(match):
        onclick = match.group(1)
        attributes = match.group(2).strip()
        if attributes:
            return f'${{createButton("ADD", "{onclick}", "btn-warning", "{attributes}")}}'
        else:
            return f'${{createButton("ADD", "{onclick}", "btn-warning", "")}}'
    
    new_content = re.sub(reminder_warning_pattern, replace_reminder_warning, content, flags=re.DOTALL)
    if new_content != content:
        changes_made = True
        content = new_content
    
    # כפתורי ביטול עם me-2
    cancel_me2_pattern = r'<button type="button" class="btn btn-secondary me-2" data-bs-dismiss="modal"([^>]*?)>ביטול</button>'
    def replace_cancel_me2(match):
        attributes = match.group(1).strip()
        if attributes:
            return f'${{createButton("CANCEL", "data-bs-dismiss=\\"modal\\"", "me-2", "{attributes}")}}'
        else:
            return '${createButton("CANCEL", "data-bs-dismiss=\\"modal\\"", "me-2", "")}'
    
    new_content = re.sub(cancel_me2_pattern, replace_cancel_me2, content, flags=re.DOTALL)
    if new_content != content:
        changes_made = True
        content = new_content
    
    # כפתורי שמירה עם me-2
    save_me2_pattern = r'<button type="button" class="btn btn-success" onclick="([^"]+)"([^>]*?)>שמור</button>'
    def replace_save_me2(match):
        onclick = match.group(1)
        attributes = match.group(2).strip()
        if attributes:
            return f'${{createButton("SAVE", "{onclick}", "", "{attributes}")}}'
        else:
            return f'${{createButton("SAVE", "{onclick}", "", "")}}'
    
    new_content = re.sub(save_me2_pattern, replace_save_me2, content, flags=re.DOTALL)
    if new_content != content:
        changes_made = True
        content = new_content
    
    # כפתורי פילטרים עם סגנון מיוחד
    filter_special_pattern = r'<button class="btn btn-sm btn-outline-primary" onclick="([^"]+)"([^>]*?)>'
    def replace_filter_special(match):
        onclick = match.group(1)
        attributes = match.group(2).strip()
        if attributes:
            return f'${{createButton("FILTER", "{onclick}", "btn-sm btn-outline-primary", "{attributes}")}}'
        else:
            return f'${{createButton("FILTER", "{onclick}", "btn-sm btn-outline-primary", "")}}'
    
    new_content = re.sub(filter_special_pattern, replace_filter_special, content, flags=re.DOTALL)
    if new_content != content:
        changes_made = True
        content = new_content
    
    # כפתורי toggle עם סגנון מיוחד
    toggle_special_pattern = r'<button class="btn btn-outline-secondary btn-sm" onclick="([^"]+)"([^>]*?)>'
    def replace_toggle_special(match):
        onclick = match.group(1)
        attributes = match.group(2).strip()
        if attributes:
            return f'${{createToggleButton("{onclick}", "הצג/הסתר", "btn-outline-secondary btn-sm")}}'
        else:
            return f'${{createToggleButton("{onclick}", "הצג/הסתר", "btn-outline-secondary btn-sm")}}'
    
    new_content = re.sub(toggle_special_pattern, replace_toggle_special, content, flags=re.DOTALL)
    if new_content != content:
        changes_made = True
        content = new_content
    
    # כפתורי שמירה עם סגנון מיוחד
    save_special_pattern = r'<button type="button" class="btn btn-primary btn-sm w-100 mb-2" onclick="([^"]+)"([^>]*?)>'
    def replace_save_special(match):
        onclick = match.group(1)
        attributes = match.group(2).strip()
        if attributes:
            return f'${{createButton("SAVE", "{onclick}", "btn-primary btn-sm w-100 mb-2", "{attributes}")}}'
        else:
            return f'${{createButton("SAVE", "{onclick}", "btn-primary btn-sm w-100 mb-2", "")}}'
    
    new_content = re.sub(save_special_pattern, replace_save_special, content, flags=re.DOTALL)
    if new_content != content:
        changes_made = True
        content = new_content
    
    if changes_made:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✅ הוחלפו כל הכפתורים הנותרים ב: {file_path}")
        return True
    return False

def main():
    """פונקציה ראשית"""
    print("🚀 מתחיל החלפת כל הכפתורים הנותרים במערכת המרכזית...")
    
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
            if replace_all_remaining_buttons(file_path):
                total_changes += 1
    
    print(f"\n🎉 הושלם! {total_changes} קבצים עודכנו")
    print("✅ כל הכפתורים הנותרים הוחלפו במערכת המרכזית")

if __name__ == "__main__":
    main()
