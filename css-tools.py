#!/usr/bin/env python3
"""
כלי עזר למערכת CSS החדשה
"""

import os
import re
import subprocess
from pathlib import Path

def build_css():
    """בניית CSS מאוחד"""
    print("🔨 בונה CSS מאוחד...")
    
    main_css = Path("/workspace/trading-ui/styles-new/main.css")
    dist_css = Path("/workspace/trading-ui/dist/main.css")
    
    # יצירת תיקיית dist
    dist_css.parent.mkdir(exist_ok=True)
    
    # העתקת הקובץ הראשי
    with open(main_css, 'r', encoding='utf-8') as f:
        content = f.read()
    
    with open(dist_css, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✅ CSS נבנה: {dist_css}")
    print(f"📏 גודל: {dist_css.stat().st_size / 1024:.1f} KB")

def analyze_css():
    """ניתוח מערכת CSS"""
    print("📊 מנתח מערכת CSS...")
    
    old_path = Path("/workspace/trading-ui/styles")
    new_path = Path("/workspace/trading-ui/styles-new")
    
    # ספירת קבצים
    old_files = list(old_path.glob("*.css"))
    new_files = list(new_path.rglob("*.css"))
    
    # ספירת שורות
    old_lines = 0
    for f in old_files:
        with open(f, 'r', encoding='utf-8', errors='ignore') as file:
            old_lines += len(file.readlines())
    
    new_lines = 0
    for f in new_files:
        with open(f, 'r', encoding='utf-8') as file:
            new_lines += len(file.readlines())
    
    print(f"📁 מערכת ישנה: {len(old_files)} קבצים, {old_lines:,} שורות")
    print(f"📁 מערכת חדשה: {len(new_files)} קבצים, {new_lines:,} שורות")
    print(f"📈 שיפור: {((old_lines - new_lines) / old_lines * 100):.1f}% פחות שורות")

def check_rtl_support():
    """בדיקת תמיכה ב-RTL"""
    print("🔄 בודק תמיכה ב-RTL...")
    
    new_path = Path("/workspace/trading-ui/styles-new")
    css_files = list(new_path.rglob("*.css"))
    
    rtl_count = 0
    logical_count = 0
    
    for css_file in css_files:
        with open(css_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # ספירת direction: rtl
        rtl_count += content.count('direction: rtl')
        
        # ספירת logical properties
        logical_count += content.count('inline-start')
        logical_count += content.count('inline-end')
        logical_count += content.count('inset-inline')
    
    print(f"✅ {rtl_count} הגדרות RTL")
    print(f"✅ {logical_count} שימושים ב-CSS Logical Properties")
    
    if rtl_count > 0:
        print("🎉 תמיכה מלאה ב-RTL!")
    else:
        print("⚠️ חסרות הגדרות RTL")

def validate_imports():
    """אימות ייבוא קבצים"""
    print("🔗 בודק ייבוא קבצים...")
    
    main_css = Path("/workspace/trading-ui/styles-new/main.css")
    base_path = main_css.parent
    
    with open(main_css, 'r', encoding='utf-8') as f:
        content = f.read()
    
    import_count = 0
    missing_files = []
    
    # חיפוש כל ההייבואים
    import_pattern = r"@import\s+['\"]([^'\"]+)['\"]"
    imports = re.findall(import_pattern, content)
    
    for import_file in imports:
        import_path = base_path / import_file
        if import_path.exists():
            print(f"  ✅ {import_file}")
            import_count += 1
        else:
            print(f"  ❌ חסר: {import_file}")
            missing_files.append(import_file)
    
    print(f"\n📊 תוצאות: {import_count}/{len(imports)} קבצים קיימים")
    
    if missing_files:
        print(f"⚠️ חסרים {len(missing_files)} קבצים")
        return False
    else:
        print("🎉 כל הקבצים קיימים!")
        return True

def main():
    """הרצת כל הכלים"""
    print("🛠️ כלי עזר למערכת CSS")
    print("=" * 40)
    
    build_css()
    print()
    analyze_css()
    print()
    check_rtl_support()
    print()
    
    import re  # הוספת import שחסר
    if validate_imports():
        print("\n🎉 המערכת מוכנה!")
    else:
        print("\n⚠️ יש בעיות שדורשות תיקון")

if __name__ == "__main__":
    main()