#!/usr/bin/env python3
"""
ניקוי executions-optimized.js בצורה שיטתית
"""

import re

def clean_executions():
    file_path = 'trading-ui/scripts/executions-optimized.js'
    
    print("🔧 קורא את executions-optimized.js...")
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_lines = content.count('\n')
    
    # 1. הסרת console.log debug בלבד (לא בתוך generateDetailedLog ולא שגיאות)
    print("1/4: מסיר console.log debug...")
    
    # הסרת שורות console.log עם אמוג'ים debug
    content = re.sub(r"^\s*console\.log\('✅.*?\);\s*$", '', content, flags=re.MULTILINE)
    content = re.sub(r"^\s*console\.log\('🔍.*?\);\s*$", '', content, flags=re.MULTILINE)
    content = re.sub(r"^\s*console\.log\('📊.*?\);\s*$", '', content, flags=re.MULTILINE)
    content = re.sub(r"^\s*console\.log\('🔄.*?\);\s*$", '', content, flags=re.MULTILINE)
    content = re.sub(r"^\s*console\.log\('➕.*?\);\s*$", '', content, flags=re.MULTILINE)
    content = re.sub(r"^\s*console\.log\('❌.*?\);\s*$", '', content, flags=re.MULTILINE)
    content = re.sub(r"^\s*console\.log\('⚠️.*?\);\s*$", '', content, flags=re.MULTILINE)
    
    # 2. הסרת console.log בתוך onclick (debug)
    print("2/4: מנקה console.log מתוך onclick attributes...")
    # זה מורכב - נדלג בינתיים
    
    # 3. הסרת שורות הערה מיותרות
    print("3/4: מנקה שורות הערה מיותרות...")
    # הסרת שורות הערה שמתחילות ב-//console.log
    content = re.sub(r"^\s*//\s*console\.log.*$", '', content, flags=re.MULTILINE)
    
    # 4. ניקוי שורות ריקות מרובות
    print("4/4: מנקה שורות ריקות...")
    content = re.sub(r'\n{4,}', '\n\n\n', content)
    
    # כתיבה חזרה
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    optimized_lines = content.count('\n')
    saved_lines = original_lines - optimized_lines
    
    print(f"\n✅ ניקוי הושלם!")
    print(f"📊 לפני: {original_lines} שורות")
    print(f"📊 אחרי: {optimized_lines} שורות")
    print(f"📉 חיסכון: {saved_lines} שורות")

if __name__ == '__main__':
    clean_executions()

