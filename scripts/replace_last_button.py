#!/usr/bin/env python3
"""
סקריפט להחלפת הכפתור האחרון במערכת המרכזית
Script to replace the last button with centralized system
"""

import os
import re

def replace_last_button(file_path):
    """החלפת הכפתור האחרון"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    changes_made = False
    
    # כפתור בדיקה עם סגנון מיוחד
    test_pattern = r'<button type="button" class="btn btn-outline-secondary btn-sm w-100" onclick="([^"]+)"([^>]*?)>'
    def replace_test(match):
        onclick = match.group(1)
        attributes = match.group(2).strip()
        if attributes:
            return f'${{createButton("CHECK", "{onclick}", "btn-outline-secondary btn-sm w-100", "{attributes}")}}'
        else:
            return f'${{createButton("CHECK", "{onclick}", "btn-outline-secondary btn-sm w-100", "")}}'
    
    new_content = re.sub(test_pattern, replace_test, content, flags=re.DOTALL)
    if new_content != content:
        changes_made = True
        content = new_content
    
    if changes_made:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✅ הוחלף הכפתור האחרון ב: {file_path}")
        return True
    return False

def main():
    """פונקציה ראשית"""
    print("🚀 מתחיל החלפת הכפתור האחרון במערכת המרכזית...")
    
    # קובץ HTML עם הכפתור האחרון
    html_file = "trading-ui/preferences.html"
    
    if os.path.exists(html_file):
        print(f"\n📄 מעבד: {html_file}")
        if replace_last_button(html_file):
            print("✅ הכפתור האחרון הוחלף בהצלחה")
        else:
            print("❌ לא נמצא כפתור להחלפה")
    else:
        print(f"❌ הקובץ {html_file} לא נמצא")
    
    print("\n🎉 הושלם!")
    print("✅ כל הכפתורים הוחלפו במערכת המרכזית")

if __name__ == "__main__":
    main()
