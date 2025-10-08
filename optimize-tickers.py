#!/usr/bin/env python3
"""
סקריפט לאופטימיזציה של tickers.js
מסיר קוד מיותר, כפול, ו-console.log שאינו שגיאות
"""

import re

def optimize_tickers_js():
    input_file = 'trading-ui/scripts/tickers.js'
    output_file = 'trading-ui/scripts/tickers-optimized.js'
    
    print("🔧 קורא את tickers.js...")
    with open(input_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_lines = content.count('\n')
    
    # 1. הסרת Yahoo Finance Integration section
    print("1/6: מסיר Yahoo Finance Integration...")
    # מחפש מ-"===== Yahoo Finance Integration =====" עד סוף הפונקציות
    content = re.sub(
        r'// ===== Yahoo Finance Integration =====.*?(?=// פונקציה לפילטר טיקרים)',
        '',
        content,
        flags=re.DOTALL
    )
    
    # 2. הסרת deprecated function restoreTickersSectionState
    print("2/6: מסיר restoreTickersSectionState...")
    content = re.sub(
        r'/\*\*\s*\n\s*\* שחזור מצב סקשנים - משתמש במערכת הכללית\s*\n\s*\* @deprecated.*?\n\s*\*/\s*\nfunction restoreTickersSectionState\(\) \{.*?\n\}',
        '',
        content,
        flags=re.DOTALL
    )
    
    # 3. הסרת deprecated function clearTickersCache
    print("3/6: מסיר clearTickersCache...")
    content = re.sub(
        r'/\*\*\s*\n\s*\* ניקוי מטמון הטיקרים - משתמש במערכת הכללית\s*\n\s*\* @deprecated.*?\n\s*\*/\s*\nfunction clearTickersCache\(\) \{.*?\n\}',
        '',
        content,
        flags=re.DOTALL
    )
    
    # 4. הסרת wrapper functions section
    print("4/6: מסיר wrapper functions...")
    content = re.sub(
        r'// ===== MISSING FUNCTIONS FOR ONCLICK ATTRIBUTES =====.*?// ===== GLOBAL EXPORTS =====',
        '// ===== GLOBAL EXPORTS =====',
        content,
        flags=re.DOTALL
    )
    
    # 5. הסרת console.log (לא console.error או console.warn)
    print("5/6: מנקה console.log מיותר...")
    # הסרת שורות console.log בודדות
    content = re.sub(r'^\s*console\.log\(.*?\);?\s*$', '', content, flags=re.MULTILINE)
    
    # 6. הסרת ייצוא גלובלי כפול של Yahoo Finance
    print("6/6: מנקה ייצוא גלובלי כפול...")
    # הסרת window.refreshYahooFinanceData כפולות
    lines = content.split('\n')
    seen_exports = set()
    cleaned_lines = []
    
    for line in lines:
        # בדיקה אם זו שורת ייצוא
        if line.strip().startswith('window.refreshYahoo'):
            if line.strip() not in seen_exports:
                seen_exports.add(line.strip())
                cleaned_lines.append(line)
            # אחרת דלג על השורה (זה כפול)
        else:
            cleaned_lines.append(line)
    
    content = '\n'.join(cleaned_lines)
    
    # 7. הסרת שורות ריקות מרובות (3+ שורות ריקות ← 2 שורות ריקות)
    print("7/6: מנקה שורות ריקות מיותרות...")
    content = re.sub(r'\n{4,}', '\n\n\n', content)
    
    # כתיבת הקובץ המאופטם
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(content)
    
    optimized_lines = content.count('\n')
    saved_lines = original_lines - optimized_lines
    
    print(f"\n✅ אופטימיזציה הושלמה!")
    print(f"📊 קובץ מקורי: {original_lines} שורות")
    print(f"📊 קובץ מאופטם: {optimized_lines} שורות")
    print(f"📉 חיסכון: {saved_lines} שורות ({saved_lines/original_lines*100:.1f}%)")
    print(f"✨ הקובץ המאופטם נשמר ב: {output_file}")

if __name__ == '__main__':
    optimize_tickers_js()

