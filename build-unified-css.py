#!/usr/bin/env python3
'''
סקריפט לבניית קובץ CSS מאוחד
'''

import os
import re
from pathlib import Path

def build_unified_css():
    '''בניית קובץ CSS מאוחד ללא @import'''
    print("🔨 בונה קובץ CSS מאוחד...")
    
    styles_new = Path("trading-ui/styles-new")
    
    # רשימת הקבצים לפי סדר ITCSS
    css_files = [
        # 1. SETTINGS - משתנים גלובליים
        "01-settings/_variables.css",
        "01-settings/_colors-dynamic.css", 
        "01-settings/_colors-semantic.css",
        "01-settings/_spacing.css",
        "01-settings/_typography.css",
        "01-settings/_rtl-logical.css",
        
        # 2. TOOLS - כלים ו-mixins (לא בשימוש כרגע)
        
        # 3. GENERIC - איפוסים וסגנונות בסיסיים
        "03-generic/_reset.css",
        "03-generic/_base.css",
        
        # 4. ELEMENTS - סגנונות HTML בסיסיים
        "04-elements/_headings.css",
        "04-elements/_links.css",
        "04-elements/_forms-base.css",
        "04-elements/_buttons-base.css",
        
        # 5. OBJECTS - מבני פריסה
        "05-objects/_layout.css",
        "05-objects/_grid.css",
        
        # 6. COMPONENTS - רכיבים
        "06-components/_buttons-advanced.css",
        "06-components/_tables.css",
        "06-components/_cards.css",
        "06-components/_modals.css",
        "06-components/_notifications.css",
        "06-components/_navigation.css",
        "06-components/_forms-advanced.css",
        "06-components/_badges-status.css",
        "06-components/_header-system.css",
        "06-components/_entity-colors.css",
        "06-components/_missing-styles.css",
        "06-components/_complete-missing-styles.css",
    ]
    
    unified_css = []
    unified_css.append("""/**
 * TikTrack Unified CSS File
 * קובץ CSS מאוחד למערכת TikTrack
 * 
 * נבנה אוטומטית מקבצי ITCSS נפרדים
 * ללא @import - כל הסגנונות בקובץ אחד
 * 
 * @version 1.0.0
 * @lastUpdated September 6, 2025
 * @author TikTrack Development Team
 */

""")
    
    for css_file in css_files:
        file_path = styles_new / css_file
        if file_path.exists():
            print(f"📄 קורא {css_file}")
            
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # הסרת הערות של @import
            content = re.sub(r'/\*\*.*?@import.*?\*/', '', content, flags=re.DOTALL)
            content = re.sub(r'@import\s+[\'"][^\'"]*[\'"]\s*;', '', content)
            
            # הוספת הערה עם שם הקובץ
            unified_css.append(f"\n/* ===== {css_file} ===== */\n")
            unified_css.append(content)
            unified_css.append("\n")
        else:
            print(f"⚠️  קובץ לא נמצא: {css_file}")
    
    # כתיבת הקובץ המאוחד
    output_file = Path("trading-ui/styles-new/unified.css")
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(''.join(unified_css))
    
    print(f"✅ קובץ מאוחד נוצר: {output_file}")
    
    # ספירת שורות
    line_count = len(unified_css)
    print(f"📊 סה\"כ שורות: {line_count}")
    
    # גודל הקובץ
    file_size = output_file.stat().st_size
    print(f"📏 גודל קובץ: {file_size:,} bytes ({file_size/1024:.1f} KB)")
    
    print("🎉 בניית קובץ CSS מאוחד הושלמה!")

if __name__ == "__main__":
    build_unified_css()
