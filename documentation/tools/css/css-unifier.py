#!/usr/bin/env python3
"""
CSS Unifier - איחוד קבצי CSS
מסיר כפילויות ומאחד את כל הסגנונות לקובץ אחד

Usage: python3 css-unifier.py
"""

import os
import re
from collections import defaultdict
from pathlib import Path

def find_css_files(directory):
    """מצא את כל קבצי ה-CSS"""
    css_files = []
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.css'):
                css_files.append(os.path.join(root, file))
    return css_files

def extract_css_rules(css_content):
    """חלץ כללי CSS מהתוכן"""
    rules = []
    
    # חלץ כללים בסיסיים
    pattern = r'([^{}]+)\s*\{([^{}]*)\}'
    matches = re.findall(pattern, css_content, re.DOTALL)
    
    for selector, properties in matches:
        selector = selector.strip()
        properties = properties.strip()
        
        if selector and properties:
            rules.append({
                'selector': selector,
                'properties': properties,
                'full_rule': f"{selector} {{\n{properties}\n}}"
            })
    
    return rules

def analyze_duplicates(css_files):
    """נתח כפילויות בקבצי CSS"""
    all_rules = defaultdict(list)
    
    for css_file in css_files:
        print(f"🔍 מנתח: {css_file}")
        
        try:
            with open(css_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            rules = extract_css_rules(content)
            
            for rule in rules:
                selector = rule['selector']
                all_rules[selector].append({
                    'file': css_file,
                    'rule': rule
                })
                
        except Exception as e:
            print(f"❌ שגיאה בקובץ {css_file}: {e}")
    
    return all_rules

def generate_report(duplicates):
    """צור דוח על כפילויות"""
    report = []
    report.append("# דוח כפילויות CSS")
    report.append("=" * 50)
    
    duplicate_count = 0
    total_selectors = len(duplicates)
    
    for selector, occurrences in duplicates.items():
        if len(occurrences) > 1:
            duplicate_count += 1
            report.append(f"\n## {selector}")
            report.append(f"מופיע ב-{len(occurrences)} קבצים:")
            
            for occ in occurrences:
                file_name = os.path.basename(occ['file'])
                report.append(f"- {file_name}")
    
    report.append(f"\n## סיכום")
    report.append(f"סה\"כ סלקטורים: {total_selectors}")
    report.append(f"סלקטורים כפולים: {duplicate_count}")
    report.append(f"אחוז כפילויות: {(duplicate_count/total_selectors)*100:.1f}%")
    
    return "\n".join(report)

def main():
    """פונקציה ראשית"""
    print("🚀 מתחיל ניתוח כפילויות CSS...")
    
    # מצא קבצי CSS
    css_files = find_css_files('trading-ui/styles-new')
    print(f"📁 נמצאו {len(css_files)} קבצי CSS")
    
    # נתח כפילויות
    duplicates = analyze_duplicates(css_files)
    
    # צור דוח
    report = generate_report(duplicates)
    
    # שמור דוח
    with open('css-duplicates-report.md', 'w', encoding='utf-8') as f:
        f.write(report)
    
    print("✅ דוח נשמר ב-css-duplicates-report.md")
    print(f"📊 נמצאו {len([k for k, v in duplicates.items() if len(v) > 1])} סלקטורים כפולים")

if __name__ == "__main__":
    main()
