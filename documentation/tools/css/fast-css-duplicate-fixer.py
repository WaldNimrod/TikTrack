#!/usr/bin/env python3
"""
Fast CSS Duplicate Fixer - מתקן כפילויות CSS במהירות
מתמקד רק בכפילויות אמיתיות ולא תוקע את המחשב
"""

import os
import re
import signal
from collections import defaultdict

# הגבלת זמן - 30 שניות
def timeout_handler(signum, frame):
    raise TimeoutError("הסקריפט נעצר - זמן מוגבל")

signal.signal(signal.SIGALRM, timeout_handler)

def find_duplicate_selectors(file_path):
    """מוצא selectors כפולים בקובץ CSS"""
    try:
        # בדיקת גודל הקובץ
        file_size = os.path.getsize(file_path)
        if file_size > 1024 * 1024:  # יותר מ-1MB
            print(f"⚠️ קובץ גדול מדי: {file_path} ({file_size/1024/1024:.1f}MB)")
            return {}
        
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # חילוץ selectors פשוט - רק השמות
        selector_pattern = r'([^{]+)\s*\{'
        selectors = re.findall(selector_pattern, content)
        
        # ניקוי selectors
        cleaned_selectors = []
        for selector in selectors:
            selector = selector.strip()
            if selector and not selector.startswith('/*') and not selector.startswith('*'):
                cleaned_selectors.append(selector)
        
        # מציאת כפילויות
        selector_counts = {}
        for selector in cleaned_selectors:
            if selector in selector_counts:
                selector_counts[selector] += 1
            else:
                selector_counts[selector] = 1
        
        # החזרת selectors עם יותר ממופע אחד
        return {k: v for k, v in selector_counts.items() if v > 1}
        
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return {}

def fix_duplicates_in_file(file_path):
    """מתקן כפילויות בקובץ CSS"""
    print(f"🔍 בודק {file_path}...")
    
    duplicates = find_duplicate_selectors(file_path)
    if not duplicates:
        print(f"✅ {file_path} - אין כפילויות")
        return 0
    
    print(f"⚠️ {file_path} - נמצאו {len(duplicates)} selectors כפולים")
    
    # קריאת הקובץ
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    fixed_count = 0
    
    for selector, count in duplicates.items():
        print(f"  🔧 מתקן: {selector} ({count} מופעים)")
        
        # חיפוש כל המופעים של ה-selector
        pattern = rf'{re.escape(selector)}\s*\{{[^}}]*\}}'
        matches = list(re.finditer(pattern, content, re.DOTALL))
        
        if len(matches) > 1:
            # מחיקת המופעים הנוספים (מהסוף להתחלה)
            for match in reversed(matches[1:]):
                content = content[:match.start()] + content[match.end():]
                fixed_count += 1
    
    # שמירת הקובץ המתוקן
    if fixed_count > 0:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✅ {file_path} - תוקנו {fixed_count} כפילויות")
    
    return fixed_count

def main():
    """פונקציה ראשית"""
    print("🚀 מתחיל תיקון מהיר של כפילויות CSS...")
    
    # הגבלת זמן - 30 שניות
    signal.alarm(30)
    
    try:
        # רשימת קבצי CSS לבדיקה
        css_files = [
            "trading-ui/styles-new/06-components/_header-system.css",
            "trading-ui/styles-new/unified.css"
        ]
        
        total_fixed = 0
        
        for css_file in css_files:
            if os.path.exists(css_file):
                fixed = fix_duplicates_in_file(css_file)
                total_fixed += fixed
            else:
                print(f"❌ קובץ לא נמצא: {css_file}")
        
        print(f"\n🎉 הושלם! תוקנו {total_fixed} כפילויות בסך הכל")
        
        # בניית unified.css מחדש
        if total_fixed > 0:
            print("\n🔄 בונה unified.css מחדש...")
            os.system('python3 build-unified-css.py')
            print("✅ unified.css נבנה מחדש!")
            
    except TimeoutError:
        print("⏰ הסקריפט נעצר - זמן מוגבל")
    except Exception as e:
        print(f"❌ שגיאה: {e}")
    finally:
        signal.alarm(0)  # ביטול הגבלת זמן

if __name__ == "__main__":
    main()
