#!/usr/bin/env python3
"""
סקריפט להמרת כפתורים רגילים לכפתורים עם data attributes
Script to convert regular buttons to buttons with data attributes
"""

import os
import re

def convert_buttons_to_data_attributes(file_path):
    """המרת כפתורים רגילים לכפתורים עם data attributes"""
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
    
    # המרת כפתורי הוספה
    add_pattern = r'<button class="btn[^"]*"[^>]*onclick="showAddModal\(\)"[^>]*>.*?➕ הוסף.*?</button>'
    def replace_add(match):
        return '<button data-button-type="ADD" data-onclick="showAddModal()" data-classes="btn-success" data-text="הוסף" data-attributes="title=\\"הוסף\\""></button>'
    
    new_content = re.sub(add_pattern, replace_add, content, flags=re.DOTALL)
    if new_content != content:
        changes_made = True
        content = new_content
    
    # המרת כפתורי רענון
    refresh_pattern = r'<button class="btn[^"]*"[^>]*onclick="refreshData\(\)"[^>]*>.*?🔄 רענן.*?</button>'
    def replace_refresh(match):
        return '<button data-button-type="REFRESH" data-onclick="refreshData()" data-classes="refresh-btn" data-text="רענן" data-attributes="title=\\"רענן\\""></button>'
    
    new_content = re.sub(refresh_pattern, replace_refresh, content, flags=re.DOTALL)
    if new_content != content:
        changes_made = True
        content = new_content
    
    # המרת כפתורי שמירה
    save_pattern = r'<button class="btn[^"]*"[^>]*onclick="[^"]*save[^"]*"[^>]*>.*?💾 שמור.*?</button>'
    def replace_save(match):
        return '<button data-button-type="SAVE" data-onclick="saveAllPreferences()" data-classes="btn-success btn-sm" data-text="שמור" data-attributes="id=\\"saveAllBtn\\""></button>'
    
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
    
    # המרת כפתורי עריכה
    edit_pattern = r'<button class="btn[^"]*"[^>]*onclick="[^"]*edit[^"]*"[^>]*>.*?✏️ ערוך.*?</button>'
    def replace_edit(match):
        return '<button data-button-type="EDIT" data-onclick="editRecord()" data-classes="btn-secondary" data-text="ערוך" data-attributes="title=\\"ערוך\\""></button>'
    
    new_content = re.sub(edit_pattern, replace_edit, content, flags=re.DOTALL)
    if new_content != content:
        changes_made = True
        content = new_content
    
    # המרת כפתורי מחיקה
    delete_pattern = r'<button class="btn[^"]*"[^>]*onclick="[^"]*delete[^"]*"[^>]*>.*?🗑️ מחק.*?</button>'
    def replace_delete(match):
        return '<button data-button-type="DELETE" data-onclick="deleteRecord()" data-classes="btn-danger" data-text="מחק" data-attributes="title=\\"מחק\\""></button>'
    
    new_content = re.sub(delete_pattern, replace_delete, content, flags=re.DOTALL)
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
    
    if changes_made:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✅ הומרו כפתורים ל-data attributes ב: {file_path}")
        return True
    return False

def main():
    """פונקציה ראשית"""
    print("🚀 מתחיל המרת כפתורים ל-data attributes...")
    
    # רשימת קבצי HTML עם כפתורים
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
            if convert_buttons_to_data_attributes(file_path):
                total_changes += 1
    
    print(f"\n🎉 הושלם! {total_changes} קבצים הומרו")
    print("✅ כל הכפתורים הומרו ל-data attributes")

if __name__ == "__main__":
    main()
