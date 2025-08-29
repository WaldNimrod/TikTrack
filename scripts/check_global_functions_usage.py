#!/usr/bin/env python3
"""
סקריפט לבדיקת שימוש בפונקציות כלליות
בודק איזה פונקציות כלליות זמינות ואיזה מהן לא בשימוש בכל עמוד
"""

import os
import re
import json
from pathlib import Path

# רשימת הפונקציות הכלליות הזמינות
GLOBAL_FUNCTIONS = {
    # פונקציות וולידציה
    'window.validateCurrencySymbol': 'וולידציה של סמל מטבע',
    'window.validateCurrencyRate': 'וולידציה של שער מטבע', 
    'window.validateTickerSymbol': 'וולידציה של סימבול טיקר',
    'window.validateForm': 'וולידציה של טופס',
    'window.validateField': 'וולידציה של שדה',
    'window.initializeValidation': 'אתחול וולידציה',
    'window.clearValidation': 'ניקוי וולידציה',
    'window.setupFieldValidation': 'הגדרת וולידציה לשדה',
    'window.clearFieldError': 'ניקוי שגיאת שדה',
    'window.clearFieldValidation': 'ניקוי וולידציה של שדה',
    'window.showFieldError': 'הצגת שגיאת שדה',
    'window.showFieldSuccess': 'הצגת הצלחת שדה',
    
    # פונקציות התראות
    'window.showNotification': 'הצגת התראה כללית',
    'window.showErrorNotification': 'הצגת שגיאה',
    'window.showSuccessNotification': 'הצגת הצלחה',
    'window.showWarningNotification': 'הצגת אזהרה',
    'window.showInfoNotification': 'הצגת מידע',
    'window.showValidationWarning': 'הצגת אזהרת וולידציה',
    
    # פונקציות מודלים
    'window.showModal': 'הצגת מודל',
    'window.showModalNotification': 'הצגת מודל התראה',
    'window.showSecondConfirmationModal': 'הצגת מודל אישור שני',
    'window.showLinkedItemsWarning': 'הצגת אזהרת פריטים מקושרים',
    'window.showLinkedItemsModal': 'הצגת מודל פריטים מקושרים',
    'window.showDeleteWarning': 'הצגת אזהרת מחיקה',
    'window.showCancelWarning': 'הצגת אזהרת ביטול',
    
    # פונקציות toggle
    'window.toggleSection': 'פתיחה/סגירה של סקשן',
    'window.toggleAllSections': 'פתיחה/סגירה של כל הסקשנים',
    'window.toggleMainSection': 'פתיחה/סגירה של סקשן ראשי',
    
    # פונקציות נוספות
    'window.validationUtils': 'כלי וולידציה',
}

def find_js_files(directory):
    """מוצא את כל קבצי JavaScript בתיקייה"""
    js_files = []
    for root, dirs, files in os.walk(directory):
        # דילוג על תיקיות גיבוי
        dirs[:] = [d for d in dirs if not d.startswith('.') and 'backup' not in d.lower()]
        
        for file in files:
            if file.endswith('.js') and not file.endswith('.backup'):
                js_files.append(os.path.join(root, file))
    return js_files

def check_function_usage(file_path, global_functions):
    """בודק איזה פונקציות כלליות בשימוש בקובץ"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"⚠️ שגיאה בקריאת קובץ {file_path}: {e}")
        return {}, {}
    
    used_functions = {}
    unused_functions = {}
    
    for func_name, description in global_functions.items():
        # חיפוש שימוש בפונקציה
        pattern = r'\b' + re.escape(func_name) + r'\b'
        matches = re.findall(pattern, content)
        
        if matches:
            used_functions[func_name] = {
                'description': description,
                'count': len(matches),
                'lines': []
            }
            
            # מציאת מספרי השורות
            lines = content.split('\n')
            for i, line in enumerate(lines, 1):
                if func_name in line:
                    used_functions[func_name]['lines'].append(i)
        else:
            unused_functions[func_name] = description
    
    return used_functions, unused_functions

def check_function_definition(file_path, global_functions):
    """בודק איזה פונקציות כלליות מוגדרות בקובץ"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"⚠️ שגיאה בקריאת קובץ {file_path}: {e}")
        return {}
    
    defined_functions = {}
    
    for func_name, description in global_functions.items():
        # חיפוש הגדרת הפונקציה
        pattern = r'window\.' + func_name.split('.')[-1] + r'\s*='
        matches = re.findall(pattern, content)
        
        if matches:
            defined_functions[func_name] = {
                'description': description,
                'count': len(matches),
                'lines': []
            }
            
            # מציאת מספרי השורות
            lines = content.split('\n')
            for i, line in enumerate(lines, 1):
                if pattern in line:
                    defined_functions[func_name]['lines'].append(i)
    
    return defined_functions

def analyze_page(page_name, js_files):
    """מנתח עמוד ספציפי"""
    print(f"\n{'='*60}")
    print(f"📄 ניתוח עמוד: {page_name}")
    print(f"{'='*60}")
    
    page_js_files = [f for f in js_files if page_name in f.lower()]
    
    if not page_js_files:
        print(f"❌ לא נמצאו קבצי JavaScript לעמוד {page_name}")
        return
    
    all_used = {}
    all_unused = set(GLOBAL_FUNCTIONS.keys())
    all_defined = {}
    
    for js_file in page_js_files:
        print(f"\n🔍 בודק קובץ: {os.path.basename(js_file)}")
        
        # בדיקת שימוש
        used, unused = check_function_usage(js_file, GLOBAL_FUNCTIONS)
        all_used.update(used)
        all_unused = all_unused.intersection(set(unused.keys()))
        
        # בדיקת הגדרות
        defined = check_function_definition(js_file, GLOBAL_FUNCTIONS)
        all_defined.update(defined)
        
        if used:
            print(f"  ✅ פונקציות בשימוש ({len(used)}):")
            for func, info in used.items():
                print(f"    - {func}: {info['count']} פעמים (שורות: {info['lines']})")
        
        if defined:
            print(f"  ⚠️ פונקציות מוגדרות ({len(defined)}):")
            for func, info in defined.items():
                print(f"    - {func}: {info['count']} פעמים (שורות: {info['lines']})")
    
    # סיכום לעמוד
    print(f"\n📊 סיכום לעמוד {page_name}:")
    print(f"  ✅ פונקציות בשימוש: {len(all_used)}")
    print(f"  ❌ פונקציות לא בשימוש: {len(all_unused)}")
    print(f"  ⚠️ פונקציות מוגדרות: {len(all_defined)}")
    
    if all_unused:
        print(f"\n💡 פונקציות כלליות שלא בשימוש:")
        for func in sorted(all_unused):
            print(f"    - {func}: {GLOBAL_FUNCTIONS[func]}")
    
    if all_defined:
        print(f"\n⚠️ פונקציות שמוגדרות (כפילות אפשרית):")
        for func in sorted(all_defined.keys()):
            print(f"    - {func}: {GLOBAL_FUNCTIONS[func]}")

def main():
    """הפונקציה הראשית"""
    print("🔍 בדיקת שימוש בפונקציות כלליות")
    print("="*60)
    
    # מציאת קבצי JavaScript
    trading_ui_dir = "trading-ui/scripts"
    if not os.path.exists(trading_ui_dir):
        print(f"❌ תיקייה לא נמצאה: {trading_ui_dir}")
        return
    
    js_files = find_js_files(trading_ui_dir)
    print(f"📁 נמצאו {len(js_files)} קבצי JavaScript")
    
    # רשימת העמודים לבדיקה
    pages = [
        'accounts',
        'alerts', 
        'cash_flows',
        'db-extradata',  # טבלאות עזר
        'executions',
        'tickers',
        'trade_plans',
        'trades'
    ]
    
    # ניתוח כל עמוד
    for page in pages:
        analyze_page(page, js_files)
    
    print(f"\n{'='*60}")
    print("✅ בדיקה הושלמה")
    print(f"{'='*60}")

if __name__ == "__main__":
    main()
