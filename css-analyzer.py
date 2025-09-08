#!/usr/bin/env python3
"""
CSS Analyzer - מוצא כפילויות, סתירות ובעיות ב-CSS
"""

import re
import os
from collections import defaultdict, Counter

def analyze_css_file(css_file):
    """מנתח קובץ CSS ומזהה בעיות"""
    
    if not os.path.exists(css_file):
        print(f"❌ File not found: {css_file}")
        return
    
    with open(css_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    print(f"📄 Analyzing: {css_file}")
    print(f"📏 File size: {len(content)} characters")
    print(f"📏 Lines: {content.count(chr(10))}")
    print("=" * 60)
    
    # 1. מוצא כל ה-selectors
    selectors = find_all_selectors(content)
    print(f"🎯 Found {len(selectors)} unique selectors")
    
    # 2. מוצא כפילויות
    duplicates = find_duplicate_selectors(selectors)
    if duplicates:
        print(f"\n🔄 DUPLICATE SELECTORS ({len(duplicates)}):")
        for selector, count in duplicates.most_common(10):
            print(f"  {selector} (appears {count} times)")
    
    # 3. מוצא סתירות
    conflicts = find_css_conflicts(content)
    if conflicts:
        print(f"\n⚠️ CSS CONFLICTS ({len(conflicts)}):")
        for conflict in conflicts[:10]:
            print(f"  {conflict}")
    
    # 4. מוצא הגדרות מיותרות
    redundant = find_redundant_properties(content)
    if redundant:
        print(f"\n🗑️ REDUNDANT PROPERTIES ({len(redundant)}):")
        for prop in redundant[:10]:
            print(f"  {prop}")
    
    # 5. מוצא הגדרות עם !important
    important_count = content.count('!important')
    print(f"\n💥 !important declarations: {important_count}")
    
    # 6. מוצא הגדרות עם specificity גבוהה
    high_specificity = find_high_specificity_selectors(selectors)
    if high_specificity:
        print(f"\n🎯 HIGH SPECIFICITY SELECTORS ({len(high_specificity)}):")
        for selector in high_specificity[:10]:
            print(f"  {selector}")
    
    # 7. מוצא הגדרות שלא בשימוש
    unused = find_unused_selectors(content)
    if unused:
        print(f"\n👻 POTENTIALLY UNUSED SELECTORS ({len(unused)}):")
        for selector in unused[:10]:
            print(f"  {selector}")

def find_all_selectors(content):
    """מוצא את כל ה-selectors בקובץ CSS"""
    selectors = []
    
    # מוצא כל ה-CSS rules
    css_rules = re.findall(r'([^{}]+)\s*\{[^{}]*\}', content, re.MULTILINE | re.DOTALL)
    
    for rule in css_rules:
        # מנקה את ה-selector
        selector = rule.strip()
        if selector and not selector.startswith('/*'):
            selectors.append(selector)
    
    return selectors

def find_duplicate_selectors(selectors):
    """מוצא selectors שמופיעים יותר מפעם אחת"""
    counter = Counter(selectors)
    return Counter({k: v for k, v in counter.items() if v > 1})

def find_css_conflicts(content):
    """מוצא סתירות ב-CSS"""
    conflicts = []
    
    # מוצא כל ה-CSS rules
    rules = re.findall(r'([^{}]+)\s*\{([^{}]*)\}', content, re.MULTILINE | re.DOTALL)
    
    # מקבץ לפי selector
    selector_properties = defaultdict(list)
    
    for selector, properties in rules:
        selector = selector.strip()
        if selector and not selector.startswith('/*'):
            # מחלץ properties
            props = re.findall(r'([^:;]+):\s*([^;]+);?', properties)
            for prop, value in props:
                prop = prop.strip()
                value = value.strip()
                selector_properties[selector].append((prop, value))
    
    # מוצא סתירות
    for selector, props in selector_properties.items():
        prop_values = defaultdict(list)
        for prop, value in props:
            prop_values[prop].append(value)
        
        for prop, values in prop_values.items():
            if len(set(values)) > 1:
                conflicts.append(f"{selector} - {prop}: {values}")
    
    return conflicts

def find_redundant_properties(content):
    """מוצא properties מיותרים"""
    redundant = []
    
    # מוצא כל ה-CSS rules
    rules = re.findall(r'([^{}]+)\s*\{([^{}]*)\}', content, re.MULTILINE | re.DOTALL)
    
    for selector, properties in rules:
        selector = selector.strip()
        if selector and not selector.startswith('/*'):
            # מחלץ properties
            props = re.findall(r'([^:;]+):\s*([^;]+);?', properties)
            prop_names = [prop.strip() for prop, _ in props]
            
            # מוצא properties שמופיעים יותר מפעם אחת
            prop_counter = Counter(prop_names)
            for prop, count in prop_counter.items():
                if count > 1:
                    redundant.append(f"{selector} - {prop} (appears {count} times)")
    
    return redundant

def find_high_specificity_selectors(selectors):
    """מוצא selectors עם specificity גבוהה"""
    high_specificity = []
    
    for selector in selectors:
        # מחשב specificity
        specificity = calculate_specificity(selector)
        if specificity > 100:  # threshold
            high_specificity.append(f"{selector} (specificity: {specificity})")
    
    return high_specificity

def calculate_specificity(selector):
    """מחשב CSS specificity"""
    # פשוט - סופר ID, classes, elements
    id_count = selector.count('#')
    class_count = selector.count('.')
    element_count = len(re.findall(r'\b[a-zA-Z][a-zA-Z0-9]*\b', selector))
    
    # specificity = (id * 100) + (class * 10) + (element * 1)
    return (id_count * 100) + (class_count * 10) + element_count

def find_unused_selectors(content):
    """מוצא selectors שלא בשימוש (הערכה)"""
    unused = []
    
    # selectors שכנראה לא בשימוש
    suspicious_patterns = [
        r'\.old-',
        r'\.legacy-',
        r'\.deprecated-',
        r'\.unused-',
        r'\.temp-',
        r'\.test-',
        r'\.debug-',
    ]
    
    selectors = find_all_selectors(content)
    
    for selector in selectors:
        for pattern in suspicious_patterns:
            if re.search(pattern, selector):
                unused.append(selector)
                break
    
    return unused

if __name__ == "__main__":
    css_file = "trading-ui/styles-new/unified.css"
    print("🔍 CSS Analyzer - מוצא כפילויות ובעיות")
    print("=" * 60)
    analyze_css_file(css_file)
    print("\n✅ Analysis complete!")
