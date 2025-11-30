#!/usr/bin/env python3
"""
סקריפט ניקיון סופי - מחיקת קבצים זמניים
Final Cleanup Script - Remove Temporary Files
"""

import os
from pathlib import Path
from datetime import datetime

BASE_DIR = Path(".")

# קבצים זמניים למחיקה - רק קבצים שהם באמת זמניים
TEMP_FILES_TO_DELETE = [
    # קבצי debug בתיקיית trading-ui (לא ב-archive/backup)
    "trading-ui/debug-*.js",
    "trading-ui/debug-*.html",
    "trading-ui/*.backup",
    
    # קבצי test זמניים
    "trading-ui/test-*.html",
    
    # קבצי backup ב-HTML
    "trading-ui/*_backup_*.html",
    
    # קבצי debug scripts בתיקיית scripts (לא בתיקיות משנה)
    "scripts/debug-*.js",
    "scripts/debug/**/*.js",  # כל הקבצים בתיקיית debug
    
    # קבצי test זמניים בסקריפטים
    "test_*.js",
    "test_*.py",
]

# תיקיות שלא לגעת בהן
PROTECTED_DIRS = [
    "archive",
    "backup",
    "node_modules",
    ".venv",
    ".git",
    "production",
    "documentation",
    "scripts/testing",  # נשמור את כל קבצי הבדיקה
]

def should_protect_file(file_path):
    """בדיקה אם הקובץ מוגן"""
    file_str = str(file_path)
    
    for protected in PROTECTED_DIRS:
        if protected in file_str:
            return True
    
    return False

def find_files_to_delete():
    """מציאת קבצים למחיקה"""
    files_to_delete = []
    
    # חיפוש קבצים לפי דפוסים
    for pattern in TEMP_FILES_TO_DELETE:
        found = list(BASE_DIR.glob(pattern))
        for file_path in found:
            if not should_protect_file(file_path) and file_path.exists():
                files_to_delete.append(file_path)
    
    # הסרת כפילויות
    files_to_delete = list(set(files_to_delete))
    
    return files_to_delete

def main():
    print("🧹 סקריפט ניקיון סופי - מחיקת קבצים זמניים\n")
    
    files_to_delete = find_files_to_delete()
    
    if not files_to_delete:
        print("✅ לא נמצאו קבצים למחיקה")
        return
    
    print(f"📋 נמצאו {len(files_to_delete)} קבצים למחיקה:\n")
    
    # הצגת רשימה
    for file_path in sorted(files_to_delete)[:20]:
        print(f"  - {file_path}")
    if len(files_to_delete) > 20:
        print(f"  ... ועוד {len(files_to_delete) - 20} קבצים")
    
    # אישור מחיקה
    print(f"\n⚠️  האם למחוק {len(files_to_delete)} קבצים? (yes/no): ", end="")
    confirm = input().strip().lower()
    
    if confirm != 'yes':
        print("❌ בוטל - לא נמחקו קבצים")
        return
    
    # מחיקה
    deleted = 0
    failed = 0
    
    for file_path in files_to_delete:
        try:
            if file_path.is_file():
                file_path.unlink()
                deleted += 1
            elif file_path.is_dir():
                # מחיקת תיקייה רק אם היא ריקה או עם קבצים זמניים
                import shutil
                shutil.rmtree(file_path)
                deleted += 1
        except Exception as e:
            print(f"  ❌ שגיאה במחיקת {file_path}: {e}")
            failed += 1
    
    print(f"\n✅ ניקיון הושלם:")
    print(f"  - נמחקו: {deleted} קבצים")
    if failed > 0:
        print(f"  - נכשלו: {failed} קבצים")

if __name__ == "__main__":
    main()

