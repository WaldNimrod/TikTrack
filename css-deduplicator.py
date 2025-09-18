#!/usr/bin/env python3
"""
CSS Deduplicator - מסיר כפילויות וסותרות מ-CSS
"""

import re
import os
import sys
from collections import defaultdict, OrderedDict

def deduplicate_css(css_file):
    """מסיר כפילויות וסותרות מקובץ CSS"""
    
    if not os.path.exists(css_file):
        print(f"❌ File not found: {css_file}")
        return
    
    with open(css_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    print(f"📄 Processing: {css_file}")
    print(f"📏 Original size: {len(content)} characters")
    
    # 1. מוצא כל ה-CSS rules
    rules = re.findall(r'([^{}]+)\s*\{([^{}]*)\}', content, re.MULTILINE | re.DOTALL)
    
    print(f"🎯 Found {len(rules)} CSS rules")
    
    # 2. מקבץ לפי selector
    selector_rules = defaultdict(list)
    
    for selector, properties in rules:
        selector = selector.strip()
        if selector and not selector.startswith('/*'):
            # מנקה את ה-properties
            clean_props = properties.strip()
            if clean_props:
                selector_rules[selector].append(clean_props)
    
    print(f"📊 Unique selectors: {len(selector_rules)}")
    
    # 3. מוצא כפילויות
    duplicates = {k: v for k, v in selector_rules.items() if len(v) > 1}
    print(f"🔄 Found {len(duplicates)} selectors with duplicates")
    
    # 4. משלב כפילויות
    merged_rules = {}
    for selector, prop_list in selector_rules.items():
        if len(prop_list) > 1:
            # משלב את כל ה-properties
            all_props = []
            for props in prop_list:
                # מחלץ properties
                props_match = re.findall(r'([^:;]+):\s*([^;]+);?', props)
                for prop, value in props_match:
                    all_props.append((prop.strip(), value.strip()))
            
            # מסיר כפילויות של properties
            unique_props = OrderedDict()
            for prop, value in all_props:
                if prop not in unique_props:
                    unique_props[prop] = value
                else:
                    # אם יש סתירה, לוקח את האחרון
                    print(f"⚠️ Conflict in {selector}: {prop} = {unique_props[prop]} vs {value}")
                    unique_props[prop] = value
            
            # בונה את ה-CSS החדש
            merged_props = []
            for prop, value in unique_props.items():
                merged_props.append(f"  {prop}: {value};")
            
            merged_rules[selector] = '{\n' + '\n'.join(merged_props) + '\n}'
        else:
            # selector יחיד - שומר כמו שהוא
            merged_rules[selector] = '{\n' + prop_list[0] + '\n}'
    
    # 5. בונה את ה-CSS החדש
    new_content = "/* TikTrack Unified CSS - Deduplicated */\n"
    new_content += "/* Generated automatically from ITCSS structure */\n"
    new_content += "/* אלמנט הראש נשמר בנפרד */\n\n"
    
    # מוסיף את כל ה-rules
    for selector, rule in merged_rules.items():
        new_content += f"{selector} {rule}\n\n"
    
    # 6. שומר את הקובץ
    with open(css_file, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f"💾 File updated: {css_file}")
    print(f"📏 New size: {len(new_content)} characters")
    print(f"📊 Rules before: {len(rules)}")
    print(f"📊 Rules after: {len(merged_rules)}")
    print(f"✅ Removed {len(rules) - len(merged_rules)} duplicate rules")

if __name__ == "__main__":
    print("🧹 CSS Deduplicator - מסיר כפילויות וסותרות")
    print("=" * 60)

    if len(sys.argv) > 1:
        css_file = sys.argv[1]
    else:
        css_file = "trading-ui/styles-new/unified.css"

    deduplicate_css(css_file)
    print("\n✅ Deduplication complete!")