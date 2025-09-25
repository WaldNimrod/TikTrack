#!/usr/bin/env python3
"""
סקריפט בדיקה למערכת CSS החדשה
"""

import os
import re
from pathlib import Path

def check_css_files():
    """בדיקת קיום קבצי CSS"""
    print("🔍 בודק קיום קבצי CSS החדשים...")
    
    styles_new_path = Path("/workspace/trading-ui/styles-new")
    required_files = [
        "main.css",
        "01-settings/_variables.css",
        "01-settings/_colors-dynamic.css", 
        "01-settings/_colors-semantic.css",
        "01-settings/_spacing.css",
        "01-settings/_typography.css",
        "01-settings/_rtl-logical.css",
        "03-generic/_reset.css",
        "03-generic/_base.css",
        "04-elements/_headings.css",
        "04-elements/_links.css",
        "04-elements/_forms-base.css",
        "04-elements/_buttons-base.css",
        "05-objects/_layout.css",
        "05-objects/_grid.css",
        "06-components/_buttons-advanced.css",
        "06-components/_tables.css",
        "06-components/_cards.css",
        "06-components/_modals.css",
        "06-components/_notifications.css",
        "06-components/_navigation.css",
        "06-components/_forms-advanced.css",
        "06-components/_badges-status.css",
    ]
    
    missing_files = []
    for file_name in required_files:
        file_path = styles_new_path / file_name
        if file_path.exists():
            print(f"  ✅ {file_name}")
        else:
            print(f"  ❌ חסר: {file_name}")
            missing_files.append(file_name)
    
    if missing_files:
        print(f"\n⚠️ חסרים {len(missing_files)} קבצים!")
    else:
        print(f"\n🎉 כל הקבצים קיימים!")
    
    return len(missing_files) == 0

def check_html_links():
    """בדיקת קישורי CSS בקבצי HTML"""
    print("\n🔍 בודק קישורי CSS בקבצי HTML...")
    
    trading_ui_path = Path("/workspace/trading-ui")
    html_files = list(trading_ui_path.glob("*.html"))
    html_files = [f for f in html_files if not f.name.startswith('test-')]
    
    correct_files = 0
    
    for html_file in html_files:
        with open(html_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # בדיקה שיש קישור למערכת החדשה
        if 'styles-new/main.css' in content:
            print(f"  ✅ {html_file.name}")
            correct_files += 1
        else:
            print(f"  ❌ {html_file.name} - חסר קישור למערכת החדשה")
    
    print(f"\n📊 תוצאות: {correct_files}/{len(html_files)} קבצים תקינים")
    return correct_files == len(html_files)

def check_css_syntax():
    """בדיקה בסיסית של תחביר CSS"""
    print("\n🔍 בודק תחביר CSS בסיסי...")
    
    styles_new_path = Path("/workspace/trading-ui/styles-new")
    css_files = list(styles_new_path.rglob("*.css"))
    
    errors = []
    
    for css_file in css_files:
        with open(css_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # בדיקות בסיסיות
        open_braces = content.count('{')
        close_braces = content.count('}')
        
        if open_braces != close_braces:
            errors.append(f"{css_file.name}: סוגריים לא מאוזנים ({open_braces} פתוחים, {close_braces} סגורים)")
            print(f"  ❌ {css_file.name} - סוגריים לא מאוזנים")
        else:
            print(f"  ✅ {css_file.name}")
    
    if errors:
        print(f"\n⚠️ נמצאו {len(errors)} שגיאות תחביר!")
        for error in errors:
            print(f"    - {error}")
    else:
        print(f"\n🎉 כל הקבצים תקינים!")
    
    return len(errors) == 0

def check_file_sizes():
    """בדיקת גדלי קבצים"""
    print("\n📏 בודק גדלי קבצים...")
    
    # בדיקת מערכת ישנה
    old_styles = Path("/workspace/trading-ui/styles")
    old_total = sum(f.stat().st_size for f in old_styles.glob("*.css"))
    old_total_kb = old_total / 1024
    
    # בדיקת מערכת חדשה
    new_styles = Path("/workspace/trading-ui/styles-new")
    new_total = sum(f.stat().st_size for f in new_styles.rglob("*.css"))
    new_total_kb = new_total / 1024
    
    print(f"  📁 מערכת ישנה: {old_total_kb:.1f} KB")
    print(f"  📁 מערכת חדשה: {new_total_kb:.1f} KB")
    print(f"  📊 הפרש: {new_total_kb - old_total_kb:.1f} KB ({((new_total_kb - old_total_kb) / old_total_kb * 100):.1f}%)")
    
    if new_total_kb < old_total_kb:
        print(f"  🎉 המערכת החדשה קטנה יותר!")
    elif new_total_kb == old_total_kb:
        print(f"  ✅ המערכת החדשה באותו גודל")
    else:
        print(f"  ⚠️ המערכת החדשה גדולה יותר")

def main():
    """הרצת כל הבדיקות"""
    print("=" * 50)
    print("🧪 בדיקות מערכת CSS חדשה")
    print("=" * 50)
    
    tests_passed = 0
    total_tests = 4
    
    if check_css_files():
        tests_passed += 1
    
    if check_html_links():
        tests_passed += 1
    
    if check_css_syntax():
        tests_passed += 1
    
    check_file_sizes()  # אינפורמטיבי, לא בדיקה
    
    print("\n" + "=" * 50)
    print(f"🏁 סיכום בדיקות: {tests_passed}/{total_tests - 1} הצליחו")
    
    if tests_passed == total_tests - 1:
        print("🎉 כל הבדיקות עברו בהצלחה!")
        print("✅ המערכת מוכנה לשימוש!")
    else:
        print("⚠️ יש בעיות שדורשות תיקון")
    
    print("=" * 50)

if __name__ == "__main__":
    main()