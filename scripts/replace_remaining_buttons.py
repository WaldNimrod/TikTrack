#!/usr/bin/env python3
"""
סקריפט להחלפת הכפתורים הנותרים במערכת המרכזית
Script to replace remaining buttons with centralized system
"""

import os
import re
import glob

def replace_export_buttons(file_path):
    """החלפת כפתורי ייצוא/העתקה"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # דפוס לכפתורי ייצוא
    export_pattern = r'<button class="btn btn-sm btn-outline-secondary" onclick="copyDetailedLog\(\)"([^>]*?)>'
    
    def replace_export(match):
        attributes = match.group(1).strip()
        if attributes:
            return f'${{createButton("EXPORT", "copyDetailedLog()", "btn-sm btn-outline-secondary", "{attributes}")}}'
        else:
            return '${createButton("EXPORT", "copyDetailedLog()", "btn-sm btn-outline-secondary", "")}'
    
    new_content = re.sub(export_pattern, replace_export, content, flags=re.DOTALL)
    
    if new_content != content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"✅ הוחלפו כפתורי ייצוא ב: {file_path}")
        return True
    return False

def replace_toggle_buttons(file_path):
    """החלפת כפתורי toggle"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # דפוס לכפתורי toggle
    toggle_pattern = r'<button class="btn btn-outline-warning" onclick="toggleSection\([^)]+\)"([^>]*?)>'
    
    def replace_toggle(match):
        attributes = match.group(1).strip()
        if 'title=' in attributes:
            title_match = re.search(r'title="([^"]*)"', attributes)
            if title_match:
                title = title_match.group(1)
                return f'${{createToggleButton("toggleSection(\'top\')", "{title}")}}'
        return '${createToggleButton("toggleSection(\'top\')", "הצג/הסתר")}'
    
    new_content = re.sub(toggle_pattern, replace_toggle, content, flags=re.DOTALL)
    
    if new_content != content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"✅ הוחלפו כפתורי toggle ב: {file_path}")
        return True
    return False

def replace_add_buttons(file_path):
    """החלפת כפתורי הוספה"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # דפוס לכפתורי הוספה
    add_pattern = r'<button class="btn btn-success" onclick="([^"]+)"([^>]*?)>'
    
    def replace_add(match):
        onclick = match.group(1)
        attributes = match.group(2).strip()
        if attributes:
            return f'${{createButton("ADD", "{onclick}", "btn-success", "{attributes}")}}'
        else:
            return f'${{createButton("ADD", "{onclick}", "btn-success", "")}}'
    
    new_content = re.sub(add_pattern, replace_add, content, flags=re.DOTALL)
    
    if new_content != content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"✅ הוחלפו כפתורי הוספה ב: {file_path}")
        return True
    return False

def replace_edit_buttons(file_path):
    """החלפת כפתורי עריכה"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # דפוס לכפתורי עריכה
    edit_pattern = r'<button class="btn btn-secondary d-none" onclick="([^"]+)"([^>]*?)>'
    
    def replace_edit(match):
        onclick = match.group(1)
        attributes = match.group(2).strip()
        if attributes:
            return f'${{createEditButton("{onclick}", "d-none", "{attributes}")}}'
        else:
            return f'${{createEditButton("{onclick}", "d-none", "")}}'
    
    new_content = re.sub(edit_pattern, replace_edit, content, flags=re.DOTALL)
    
    if new_content != content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"✅ הוחלפו כפתורי עריכה ב: {file_path}")
        return True
    return False

def replace_delete_buttons(file_path):
    """החלפת כפתורי מחיקה"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # דפוס לכפתורי מחיקה
    delete_pattern = r'<button class="btn btn-danger d-none" onclick="([^"]+)"([^>]*?)>'
    
    def replace_delete(match):
        onclick = match.group(1)
        attributes = match.group(2).strip()
        if attributes:
            return f'${{createDeleteButton("{onclick}", "d-none", "{attributes}")}}'
        else:
            return f'${{createDeleteButton("{onclick}", "d-none", "")}}'
    
    new_content = re.sub(delete_pattern, replace_delete, content, flags=re.DOTALL)
    
    if new_content != content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"✅ הוחלפו כפתורי מחיקה ב: {file_path}")
        return True
    return False

def replace_sort_buttons_remaining(file_path):
    """החלפת כפתורי מיון שנותרו"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # דפוס לכפתורי מיון שנותרו
    sort_pattern = r'<button class="sortable-header"([^>]*?)onclick="([^"]+)"([^>]*?)>([^<]+)</button>'
    
    def replace_sort(match):
        before_onclick = match.group(1).strip()
        onclick = match.group(2)
        after_onclick = match.group(3).strip()
        text = match.group(4).strip()
        
        # ניקוי attributes מיותרים
        attributes = f"{before_onclick} {after_onclick}".strip()
        if attributes:
            return f'${{createSortButton("{onclick}", "sortable-header", "{attributes}", "{text}")}}'
        else:
            return f'${{createSortButton("{onclick}", "sortable-header", "", "{text}")}}'
    
    new_content = re.sub(sort_pattern, replace_sort, content, flags=re.DOTALL)
    
    if new_content != content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"✅ הוחלפו כפתורי מיון שנותרו ב: {file_path}")
        return True
    return False

def replace_modal_buttons(file_path):
    """החלפת כפתורי מודלים"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    changes_made = False
    
    # כפתורי ביטול במודלים
    cancel_pattern = r'<button type="button" class="btn btn-secondary" data-bs-dismiss="modal"([^>]*?)>ביטול</button>'
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
    save_pattern = r'<button type="button" class="btn btn-success" onclick="([^"]+)"([^>]*?)>שמור</button>'
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
    
    if changes_made:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✅ הוחלפו כפתורי מודלים ב: {file_path}")
        return True
    return False

def replace_filter_buttons(file_path):
    """החלפת כפתורי פילטרים"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # דפוס לכפתורי פילטרים
    filter_pattern = r'<button class="btn btn-sm btn-outline-primary" onclick="([^"]+)"([^>]*?)>'
    
    def replace_filter(match):
        onclick = match.group(1)
        attributes = match.group(2).strip()
        if attributes:
            return f'${{createButton("FILTER", "{onclick}", "btn-sm btn-outline-primary", "{attributes}")}}'
        else:
            return f'${{createButton("FILTER", "{onclick}", "btn-sm btn-outline-primary", "")}}'
    
    new_content = re.sub(filter_pattern, replace_filter, content, flags=re.DOTALL)
    
    if new_content != content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"✅ הוחלפו כפתורי פילטרים ב: {file_path}")
        return True
    return False

def main():
    """פונקציה ראשית"""
    print("🚀 מתחיל החלפת הכפתורים הנותרים במערכת המרכזית...")
    
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
            file_changes = 0
            
            # שלב 1: החלפת כפתורי ייצוא
            if replace_export_buttons(file_path):
                file_changes += 1
            
            # שלב 2: החלפת כפתורי toggle
            if replace_toggle_buttons(file_path):
                file_changes += 1
            
            # שלב 3: החלפת כפתורי הוספה
            if replace_add_buttons(file_path):
                file_changes += 1
            
            # שלב 4: החלפת כפתורי עריכה
            if replace_edit_buttons(file_path):
                file_changes += 1
            
            # שלב 5: החלפת כפתורי מחיקה
            if replace_delete_buttons(file_path):
                file_changes += 1
            
            # שלב 6: החלפת כפתורי מיון שנותרו
            if replace_sort_buttons_remaining(file_path):
                file_changes += 1
            
            # שלב 7: החלפת כפתורי מודלים
            if replace_modal_buttons(file_path):
                file_changes += 1
            
            # שלב 8: החלפת כפתורי פילטרים
            if replace_filter_buttons(file_path):
                file_changes += 1
            
            if file_changes > 0:
                total_changes += 1
                print(f"✅ {file_path}: {file_changes} סוגי החלפות")
    
    print(f"\n🎉 הושלם! {total_changes} קבצים עודכנו")
    print("✅ כל הכפתורים הנותרים הוחלפו במערכת המרכזית")

if __name__ == "__main__":
    main()
