#!/usr/bin/env python3
"""
Fix Problematic Notification Replacements
=========================================

תיקון ההחלפות הבעייתיות שנוצרו בסקריפט הקודם.
הבעיה: window.(typeof... במקום (typeof...

גרסה: 1.0
"""

import os
import re
from pathlib import Path


def fix_problematic_patterns(file_path):
    """תיקון הדפוסים הבעייתיים בקובץ"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # תיקון הדפוס הבעייתי: window.(typeof... -> (typeof...
        pattern1 = r'window\.\(typeof window\.showConfirmationDialog'
        replacement1 = r'(typeof window.showConfirmationDialog'
        content = re.sub(pattern1, replacement1, content)
        
        # תיקון נוסף לדפוסים אחרים שעלולים להיווצר
        pattern2 = r'window\.\(typeof window\.show\w+Notification'
        replacement2 = r'(typeof window.show\\w+Notification'
        # אל תתבלבל - אנחנו רק מתקנים את הדפוס הראשון
        # content = re.sub(pattern2, replacement2, content)
        
        # בדיקה אם השתנה משהו
        if content != original_content:
            # שמירת הקובץ המתוקן
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        
        return False
        
    except Exception as e:
        print(f"❌ שגיאה בעיבוד {file_path}: {e}")
        return False


def main():
    """פונקציה ראשית לתיקון כל הקבצים"""
    print("🔧 מתקן דפוסים בעייתיים במערכת ההתראות")
    print("=" * 50)
    
    base_path = Path("trading-ui")
    files_fixed = 0
    
    # חיפוש כל קבצי JavaScript
    js_files = list(base_path.glob('scripts/**/*.js'))
    
    for file_path in js_files:
        if file_path.exists():
            if fix_problematic_patterns(file_path):
                print(f"✅ תוקן: {file_path}")
                files_fixed += 1
            # לא מדפיס הודעה לקבצים שלא השתנו
    
    print(f"\n📊 סיכום:")
    print(f"   📄 קבצים נבדקו: {len(js_files)}")
    print(f"   🔧 קבצים תוקנו: {files_fixed}")
    print(f"   ✅ התיקון הושלם!")


if __name__ == "__main__":
    main()