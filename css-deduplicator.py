#!/usr/bin/env python3
"""
CSS Deduplicator - הסרת כפילויות מ-CSS
מסיר כפילויות ומאחד סגנונות זהים

Usage: python3 css-deduplicator.py
"""

import os
import re
from pathlib import Path
from collections import OrderedDict

class CSSDeduplicator:
    def __init__(self):
        self.styles_dir = Path('trading-ui/styles-new')
        self.unified_file = self.styles_dir / 'unified.css'
        
    def parse_css_rules(self, css_content):
        """נתח כללי CSS"""
        rules = OrderedDict()
        
        # Find all CSS rules
        pattern = r'([^{}]+)\s*\{([^{}]*)\}'
        matches = re.findall(pattern, css_content, re.DOTALL)
        
        for selector, properties in matches:
            selector = selector.strip()
            properties = properties.strip()
            
            if selector and properties:
                # Normalize selector (remove extra spaces)
                normalized_selector = re.sub(r'\s+', ' ', selector)
                
                # Normalize properties (remove extra spaces, sort)
                normalized_properties = self.normalize_properties(properties)
                
                # Use normalized selector as key
                if normalized_selector not in rules:
                    rules[normalized_selector] = []
                
                rules[normalized_selector].append({
                    'original_selector': selector,
                    'properties': normalized_properties,
                    'full_rule': f"{selector} {{\n{properties}\n}}"
                })
        
        return rules
    
    def normalize_properties(self, properties):
        """נרמל מאפיינים CSS"""
        # Split by semicolon and clean
        prop_list = [prop.strip() for prop in properties.split(';') if prop.strip()]
        
        # Sort properties for consistency
        prop_list.sort()
        
        return '; '.join(prop_list)
    
    def deduplicate_css(self):
        """הסר כפילויות מ-CSS"""
        print("🚀 מתחיל הסרת כפילויות...")
        
        if not self.unified_file.exists():
            print("❌ קובץ unified.css לא נמצא")
            return
        
        # Read CSS content
        with open(self.unified_file, 'r', encoding='utf-8') as f:
            css_content = f.read()
        
        # Parse rules
        rules = self.parse_css_rules(css_content)
        
        print(f"📊 נמצאו {len(rules)} סלקטורים ייחודיים")
        
        # Count duplicates
        duplicates = 0
        for selector, rule_list in rules.items():
            if len(rule_list) > 1:
                duplicates += len(rule_list) - 1
        
        print(f"📊 נמצאו {duplicates} כפילויות")
        
        # Create deduplicated CSS
        deduplicated_content = []
        deduplicated_content.append("/* TikTrack Unified CSS - Deduplicated */")
        deduplicated_content.append("/* Generated automatically with duplicate removal */")
        deduplicated_content.append("")
        
        # Add each unique rule
        for selector, rule_list in rules.items():
            # Use the first rule (most specific)
            rule = rule_list[0]
            deduplicated_content.append(rule['full_rule'])
            deduplicated_content.append("")
        
        # Write deduplicated file
        deduplicated_file = self.styles_dir / 'unified-deduplicated.css'
        with open(deduplicated_file, 'w', encoding='utf-8') as f:
            f.write('\n'.join(deduplicated_content))
        
        print(f"✅ קובץ ללא כפילויות נשמר ב: {deduplicated_file}")
        
        # Calculate file size
        file_size = deduplicated_file.stat().st_size
        print(f"📊 גודל קובץ: {file_size / 1024:.1f} KB")
        
        return deduplicated_file
    
    def replace_unified_css(self, deduplicated_file):
        """החלף את unified.css בקובץ ללא כפילויות"""
        # Create backup
        backup_file = self.styles_dir / 'unified-backup.css'
        with open(self.unified_file, 'r', encoding='utf-8') as src:
            with open(backup_file, 'w', encoding='utf-8') as dst:
                dst.write(src.read())
        
        print(f"💾 גיבוי נשמר ב: {backup_file}")
        
        # Replace unified.css
        with open(deduplicated_file, 'r', encoding='utf-8') as src:
            with open(self.unified_file, 'w', encoding='utf-8') as dst:
                dst.write(src.read())
        
        print("✅ unified.css הוחלף בקובץ ללא כפילויות")
    
    def run(self):
        """הרץ את תהליך הסרת הכפילויות"""
        print("🎯 מתחיל תהליך הסרת כפילויות...")
        
        # Step 1: Deduplicate CSS
        deduplicated_file = self.deduplicate_css()
        
        # Step 2: Replace unified.css
        self.replace_unified_css(deduplicated_file)
        
        print("🎉 תהליך הסרת הכפילויות הושלם בהצלחה!")

if __name__ == "__main__":
    deduplicator = CSSDeduplicator()
    deduplicator.run()
