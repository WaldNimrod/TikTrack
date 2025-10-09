#!/usr/bin/env python3
"""
שלב 1: ניקוי בסיסי של executions.js
- הסרת console.log (להשאיר רק error ו-warn)
- ניקוי שורות ריקות מיותרות
"""

import re

def optimize_executions_phase1():
    input_file = 'trading-ui/scripts/executions.js'
    output_file = 'trading-ui/scripts/executions-optimized.js'
    
    print("🔧 קורא את executions.js...")
    with open(input_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_lines = content.count('\n')
    
    # 1. הסרת console.log (לא console.error או console.warn)
    print("1/2: מסיר console.log מיותר...")
    # הסרת שורות console.log בודדות (לא בתוך generateDetailedLog)
    lines = content.split('\n')
    cleaned_lines = []
    in_generate_log = False
    
    for line in lines:
        # זיהוי אם אנחנו בתוך generateDetailedLog
        if 'function generateDetailedLog' in line:
            in_generate_log = True
        elif in_generate_log and line.strip().startswith('}') and 'function' not in line:
            # יציאה מ-generateDetailedLog
            in_generate_log = False
        
        # הסרת console.log רק אם לא בתוך generateDetailedLog
        if not in_generate_log and re.match(r'^\s*console\.log\(', line):
            continue  # דלג על השורה
        
        cleaned_lines.append(line)
    
    content = '\n'.join(cleaned_lines)
    
    # 2. הסרת שורות ריקות מרובות (4+ → 2)
    print("2/2: מנקה שורות ריקות מיותרות...")
    content = re.sub(r'\n{4,}', '\n\n\n', content)
    
    # כתיבת הקובץ
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(content)
    
    optimized_lines = content.count('\n')
    saved_lines = original_lines - optimized_lines
    
    print(f"\n✅ שלב 1 הושלם!")
    print(f"📊 קובץ מקורי: {original_lines} שורות")
    print(f"📊 קובץ מנוקה: {optimized_lines} שורות")
    print(f"📉 חיסכון: {saved_lines} שורות ({saved_lines/original_lines*100:.1f}%)")
    print(f"✨ הקובץ נשמר ב: {output_file}")

if __name__ == '__main__':
    optimize_executions_phase1()

