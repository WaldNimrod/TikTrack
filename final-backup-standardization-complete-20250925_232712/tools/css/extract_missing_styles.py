#!/usr/bin/env python3
"""
סקריפט לחילוץ סגנונות חסרים מהמערכת הישנה
"""

import re
import os

def extract_css_rule(css_content, selector):
    """חילוץ סגנון מהמערכת הישנה"""
    # בדיקת הסלקטור
    pattern = rf'^({re.escape(selector)}[^{{]*)\s*\{{([^}}]*)\}}'
    matches = re.finditer(pattern, css_content, re.MULTILINE | re.IGNORECASE)
    
    rules = []
    for match in matches:
        full_selector = match.group(1).strip()
        rule_content = match.group(2).strip()
        if rule_content:
            rules.append(f"{full_selector} {{\n{rule_content}\n}}")
    
    # גם בדיקה עם חיפוש פשוט יותר
    if not rules:
        escaped_selector = re.escape(selector)
        pattern2 = rf'{escaped_selector}\s*\{{[^}}]*\}}'
        matches = re.finditer(pattern2, css_content, re.IGNORECASE | re.DOTALL)
        for match in matches:
            rules.append(match.group(0))
    
    return rules

def main():
    # קריאת הקובץ הישן
    with open('trading-ui/styles/styles.css', 'r', encoding='utf-8') as f:
        old_css = f.read()
    
    # קריאת הסלקטורים החסרים
    with open('missing-selectors-complete.txt', 'r', encoding='utf-8') as f:
        missing_selectors = [line.strip() for line in f.readlines() if line.strip()]
    
    print(f"🔍 מחפש סגנונות עבור {len(missing_selectors)} סלקטורים...")
    
    # הכנת הקובץ החדש
    output = """/**
 * Complete Missing Styles - כל הסגנונות החסרים
 * 
 * קובץ זה מכיל את כל הסגנונות שנמצאו במערכת הישנה
 * אבל חסרים במערכת החדשה
 * 
 * @version 1.0.0  
 * @lastUpdated January 8, 2025
 * @extractedFrom styles.css (old system)
 */

"""
    
    found_count = 0
    not_found = []
    
    for selector in missing_selectors:
        rules = extract_css_rule(old_css, selector)
        if rules:
            found_count += 1
            output += f"/* === {selector} === */\n"
            for rule in rules:
                output += rule + "\n\n"
        else:
            not_found.append(selector)
    
    # שמירת התוצאות
    with open('trading-ui/styles-new/06-components/_complete-missing-styles.css', 'w', encoding='utf-8') as f:
        f.write(output)
    
    print(f"✅ נמצאו סגנונות עבור {found_count}/{len(missing_selectors)} סלקטורים")
    
    if not_found:
        print(f"⚠️  לא נמצאו סגנונות עבור {len(not_found)} סלקטורים:")
        for selector in not_found[:10]:
            print(f"   - {selector}")
        if len(not_found) > 10:
            print(f"   ... ועוד {len(not_found) - 10} סלקטורים")

if __name__ == "__main__":
    main()