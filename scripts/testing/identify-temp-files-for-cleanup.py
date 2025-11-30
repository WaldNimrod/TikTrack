#!/usr/bin/env python3
"""
זיהוי קבצים זמניים לניקיון
Identify Temporary Files for Cleanup
"""

import os
from pathlib import Path
from datetime import datetime

BASE_DIR = Path(".")
REPORTS_DIR = Path("documentation/05-REPORTS")

# דפוסים של קבצים זמניים
TEMP_PATTERNS = [
    # קבצי debug
    "**/debug-*.js",
    "**/debug-*.html",
    "**/test-*.js",  # רק קבצי test זמניים
    "**/temp*.{txt,js,py,md}",
    "**/*-backup*.html",
    "**/*.backup",
    
    # קבצי test זמניים
    "**/test-*.html",
    
    # קבצי backup
    "**/*_backup_*.html",
    
    # קבצי backup של CSS
    "**/*.backup.css",
    
    # קבצי debug בתקיית scripts
    "scripts/debug-*.js",
    "trading-ui/scripts/debug-*.js",
    
    # קבצי test לא נחוצים
    "scripts/testing/test-*.js",  # אם יש
]

# קבצים שצריך לשמור (לא למחוק)
KEEP_FILES = [
    # קבצי test שהם חלק מהמערכת
    "scripts/testing/final-ui-standardization-*.js",
    "scripts/testing/comprehensive-final-verification-scan.py",
    "scripts/testing/scan-*.py",
    "scripts/testing/fix-*.py",
    
    # קבצי דוחות
    "documentation/05-REPORTS/*.md",
    
    # קבצי CSS backup (אם יש צורך)
]

def should_keep_file(file_path):
    """בדיקה אם צריך לשמור את הקובץ"""
    file_str = str(file_path)
    
    for keep_pattern in KEEP_FILES:
        # המרה פשוטה של pattern
        if keep_pattern.replace("*", "") in file_str:
            return True
    
    return False

def find_temp_files():
    """מציאת קבצים זמניים"""
    temp_files = []
    
    # חיפוש לפי דפוסים
    for pattern in TEMP_PATTERNS:
        if "{" in pattern:
            # טיפול ב-patterns עם multiple extensions
            base = pattern.split("{")[0]
            extensions = pattern.split("{")[1].split("}")[0].split(",")
            for ext in extensions:
                full_pattern = base + ext.strip()
                found = list(BASE_DIR.glob(full_pattern))
                temp_files.extend(found)
        else:
            found = list(BASE_DIR.glob(pattern))
            temp_files.extend(found)
    
    # הסרת כפילויות
    temp_files = list(set(temp_files))
    
    # סינון קבצים שצריך לשמור
    files_to_remove = []
    files_to_keep = []
    
    for file_path in temp_files:
        if should_keep_file(file_path):
            files_to_keep.append(file_path)
        else:
            # וידוא שהקובץ קיים
            if file_path.exists():
                files_to_remove.append(file_path)
    
    return files_to_remove, files_to_keep

def main():
    print("🔍 זיהוי קבצים זמניים לניקיון...\n")
    
    files_to_remove, files_to_keep = find_temp_files()
    
    print(f"📋 נמצאו {len(files_to_remove)} קבצים למחיקה")
    print(f"📋 נמצאו {len(files_to_keep)} קבצים לשמירה\n")
    
    if files_to_remove:
        print("🗑️  קבצים לניקיון:")
        for file_path in sorted(files_to_remove)[:50]:  # רק 50 ראשונים
            print(f"  - {file_path}")
        if len(files_to_remove) > 50:
            print(f"  ... ועוד {len(files_to_remove) - 50} קבצים")
    
    if files_to_keep:
        print(f"\n✅ קבצים שיישמרו ({len(files_to_keep)}):")
        for file_path in sorted(files_to_keep)[:10]:
            print(f"  - {file_path}")
    
    # יצירת רשימה
    report_path = REPORTS_DIR / f"TEMP_FILES_CLEANUP_LIST_{datetime.now().strftime('%Y%m%d_%H%M%S')}.md"
    
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write("# רשימת קבצים זמניים לניקיון\n\n")
        f.write(f"**תאריך:** {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}\n\n")
        f.write(f"## 📊 סיכום\n\n")
        f.write(f"- **סה\"כ קבצים לניקיון:** {len(files_to_remove)}\n")
        f.write(f"- **קבצים שיישמרו:** {len(files_to_keep)}\n\n")
        
        if files_to_remove:
            f.write("## 🗑️  קבצים לניקיון\n\n")
            for file_path in sorted(files_to_remove):
                f.write(f"- `{file_path}`\n")
        
        if files_to_keep:
            f.write("\n## ✅ קבצים שיישמרו\n\n")
            for file_path in sorted(files_to_keep):
                f.write(f"- `{file_path}`\n")
    
    print(f"\n✅ רשימה נוצרה: {report_path}")
    
    return files_to_remove, report_path

if __name__ == "__main__":
    main()

