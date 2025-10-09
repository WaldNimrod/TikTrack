#!/usr/bin/env python3
"""
סקריפט לאופטימיזציה של executions.js
שלב 1: ניקוי קוד בסיסי
"""

import re

def optimize_executions_stage1():
    input_file = 'trading-ui/scripts/executions.js'
    output_file = 'trading-ui/scripts/executions-stage1.js'
    
    print("🔧 שלב 1: ניקוי קוד בסיסי...")
    with open(input_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_lines = content.count('\n')
    
    # 1. הסרת console.log (לא console.error או console.warn)
    print("  1/3: מסיר console.log מיותר...")
    # הסרת שורות console.log בודדות (לא בתוך generateDetailedLog)
    lines = content.split('\n')
    cleaned_lines = []
    in_detailed_log = False
    
    for line in lines:
        # בדיקה אם נכנסנו ל-generateDetailedLog
        if 'function generateDetailedLog' in line:
            in_detailed_log = True
        elif in_detailed_log and line.strip().startswith('}') and 'function' not in line:
            # יצאנו מ-generateDetailedLog
            in_detailed_log = False
        
        # הסרת console.log רק אם לא ב-generateDetailedLog
        if not in_detailed_log and re.match(r'^\s*console\.log\(', line):
            continue  # דלג על השורה
        
        cleaned_lines.append(line)
    
    content = '\n'.join(cleaned_lines)
    
    # 2. הסרת שורות ריקות מרובות
    print("  2/3: מנקה שורות ריקות מיותרות...")
    content = re.sub(r'\n{4,}', '\n\n\n', content)
    
    # 3. הסרת הערות ריקות
    print("  3/3: מנקה הערות מיותרות...")
    content = re.sub(r'^\s*//\s*$', '', content, flags=re.MULTILINE)
    
    # כתיבת הקובץ
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(content)
    
    optimized_lines = content.count('\n')
    saved_lines = original_lines - optimized_lines
    
    print(f"\n✅ שלב 1 הושלם!")
    print(f"📊 קובץ מקורי: {original_lines} שורות")
    print(f"📊 אחרי ניקוי: {optimized_lines} שורות")
    print(f"📉 חיסכון: {saved_lines} שורות ({saved_lines/original_lines*100:.1f}%)")

if __name__ == '__main__':
    optimize_executions_stage1()

