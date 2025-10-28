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
        return None
    
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
    
    # 8. מוצא CSS variables
    css_vars = find_css_variables(content)
    if css_vars:
        print(f"\n🎨 CSS VARIABLES ({len(css_vars)}):")
        for var in css_vars[:10]:
            print(f"  {var}")
    
    # 9. מוצא media queries
    media_queries = find_media_queries(content)
    if media_queries:
        print(f"\n📱 MEDIA QUERIES ({len(media_queries)}):")
        for query in media_queries[:5]:
            print(f"  {query}")
    
    return {
        'selectors_count': len(selectors),
        'duplicates': dict(duplicates),
        'conflicts': conflicts,
        'redundant': redundant,
        'important': important_count,
        'high_specificity': high_specificity,
        'unused': unused,
        'css_variables': css_vars,
        'media_queries': media_queries
    }

def find_all_selectors(content):
    """מוצא את כל ה-selectors בקובץ CSS"""
    selectors = []
    
    # מוצא כל ה-CSS rules - שיפור regex
    css_rules = re.findall(r'([^{}]+)\s*\{[^{}]*\}', content, re.MULTILINE | re.DOTALL)
    
    for rule in css_rules:
        # מנקה את ה-selector
        selector = rule.strip()
        if selector and not selector.startswith('/*') and not selector.startswith('@'):
            # מנקה הערות בתוך selector
            selector = re.sub(r'/\*.*?\*/', '', selector, flags=re.DOTALL)
            selector = selector.strip()
            if selector:
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

def find_css_variables(content):
    """מוצא CSS variables בקובץ"""
    variables = []
    
    # מוצא הגדרות CSS variables
    var_definitions = re.findall(r'--[a-zA-Z0-9-]+:\s*[^;]+;', content)
    for var in var_definitions:
        variables.append(f"Defined: {var.strip()}")
    
    # מוצא שימוש ב-CSS variables
    var_usage = re.findall(r'var\(--[a-zA-Z0-9-]+\)', content)
    for var in var_usage:
        variables.append(f"Used: {var}")
    
    return variables

def find_media_queries(content):
    """מוצא media queries בקובץ"""
    media_queries = []
    
    # מוצא media queries
    media_pattern = r'@media\s+([^{]+)\s*\{'
    matches = re.findall(media_pattern, content, re.MULTILINE | re.DOTALL)
    
    for match in matches:
        media_queries.append(match.strip())
    
    return media_queries

def check_inline_styles_in_html(results):
    """בודק inline styles בקבצי HTML"""
    print("\n🔍 Checking for inline styles in HTML files...")
    
    html_files = []
    html_dir = "trading-ui/"
    if os.path.exists(html_dir):
        for file in os.listdir(html_dir):
            if file.endswith('.html'):
                html_files.append(os.path.join(html_dir, file))
    
    inline_styles_found = []
    for html_file in html_files:
        try:
            with open(html_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # חיפוש inline styles - שיפור regex
            style_matches = re.findall(r'style\s*=\s*["\']([^"\']*)["\']', content)
            if style_matches:
                # מנתח כל inline style
                analyzed_styles = []
                for style in style_matches:
                    # מחלץ properties מ-inline style
                    properties = re.findall(r'([^:;]+):\s*([^;]+)', style)
                    analyzed_styles.append({
                        'raw': style,
                        'properties': properties
                    })
                
                inline_styles_found.append({
                    'file': html_file,
                    'count': len(style_matches),
                    'analyzed': analyzed_styles[:3]  # רק 3 דוגמאות
                })
        except Exception as e:
            print(f"⚠️ Error reading {html_file}: {e}")
    
    results['inline_styles_in_html'] = inline_styles_found
    if inline_styles_found:
        print(f"⚠️ Found inline styles in {len(inline_styles_found)} HTML files")
        for item in inline_styles_found[:5]:  # הצג רק 5 קבצים
            print(f"  📄 {item['file']}: {item['count']} inline styles")
    else:
        print("✅ No inline styles found in HTML files")

if __name__ == "__main__":
    print("🔍 CSS Analyzer - מוצא כפילויות ובעיות")
    print("=" * 60)
    
    # סריקה מקיפה של כל קבצי CSS
    css_files = []
    
    # קבצי styles-new
    styles_dir = "trading-ui/styles-new/"
    if os.path.exists(styles_dir):
        for file in os.listdir(styles_dir):
            if file.endswith('.css'):
                css_files.append(os.path.join(styles_dir, file))
    
    # קבצי styles נוספים
    styles_old_dir = "trading-ui/styles/"
    if os.path.exists(styles_old_dir):
        for file in os.listdir(styles_old_dir):
            if file.endswith('.css'):
                css_files.append(os.path.join(styles_old_dir, file))
    
    print(f"📁 נמצאו {len(css_files)} קבצי CSS לסריקה")
    
    all_results = {
        'files_analyzed': [],
        'total_selectors': 0,
        'duplicate_selectors': {},
        'css_conflicts': [],
        'redundant_properties': [],
        'important_declarations': [],
        'inline_styles_in_html': []
    }
    
    for css_file in css_files:
        print(f"\n📄 Analyzing: {css_file}")
        result = analyze_css_file(css_file)
        if result:
            all_results['files_analyzed'].append(css_file)
            all_results['total_selectors'] += result.get('selectors_count', 0)
            all_results['duplicate_selectors'].update(result.get('duplicates', {}))
            all_results['css_conflicts'].extend(result.get('conflicts', []))
            all_results['redundant_properties'].extend(result.get('redundant', []))
            all_results['important_declarations'].append({
                'file': css_file,
                'count': result.get('important', 0)
            })
    
    # בדיקת inline styles בקבצי HTML
    check_inline_styles_in_html(all_results)
    
    # שמירת תוצאות
    import json
    with open('css-issues-phase1.json', 'w', encoding='utf-8') as f:
        json.dump(all_results, f, indent=2, ensure_ascii=False)
    
    print(f"\n✅ Analysis complete!")
    print(f"📊 Results saved to: css-issues-phase1.json")
