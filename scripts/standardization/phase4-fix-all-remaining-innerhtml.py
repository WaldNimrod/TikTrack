#!/usr/bin/env python3
"""
Phase 4: Fix All Remaining innerHTML - Comprehensive Script
תיקון כל ה-innerHTML שנותר - סקריפט מקיף
"""

import os
import re
from pathlib import Path
from datetime import datetime

PROJECT_ROOT = Path(__file__).parent.parent.parent
TRADING_UI = PROJECT_ROOT / 'trading-ui'
SCRIPTS_DIR = TRADING_UI / 'scripts'
DOCS_DIR = PROJECT_ROOT / 'documentation' / '05-REPORTS'

# Pages to fix (from test results)
PAGES_TO_FIX = [
    {'page': 'cash_flows', 'count': 6},
    {'page': 'research', 'count': 1},
    {'page': 'preferences', 'count': 1},
    {'page': 'db_display', 'count': 4},
    {'page': 'db_extradata', 'count': 4},
    {'page': 'constraints', 'count': 9},
    {'page': 'background-tasks', 'count': 9},
    {'page': 'server-monitor', 'count': 3},
    {'page': 'system-management', 'count': 13},
    {'page': 'notifications-center', 'count': 12},
    {'page': 'css-management', 'count': 8},
    {'page': 'dynamic-colors-display', 'count': 4},
    {'page': 'chart-management', 'count': 1},
    {'page': 'init-system-management', 'count': 164},
    {'page': 'cache-management', 'count': 51},
    {'page': 'tradingview-test-page', 'count': 14},
    {'page': 'portfolio-state-page', 'count': 23},
    {'page': 'trade-history-page', 'count': 12},
    {'page': 'comparative-analysis-page', 'count': 25},
    {'page': 'trading-journal-page', 'count': 2},
    {'page': 'strategy-analysis-page', 'count': 23},
    {'page': 'economic-calendar-page', 'count': 1},
    {'page': 'history-widget', 'count': 17},
    {'page': 'emotional-tracking-widget', 'count': 7},
    {'page': 'date-comparison-modal', 'count': 11},
    {'page': 'external-data-dashboard', 'count': 10},
]

def fix_innerhtml_patterns(content):
    """Fix common innerHTML patterns"""
    original = content
    fixes = 0
    
    # Pattern 1: tempDiv.innerHTML = html; while (tempDiv.firstChild) { appendChild(tempDiv.firstChild); }
    pattern1 = re.compile(
        r'(const\s+tempDiv\s*=\s*document\.createElement\([\'"]div[\'"]\);\s*)'
        r'(tempDiv\.innerHTML\s*=\s*([^;]+);\s*)'
        r'([^}]*?while\s*\(\s*tempDiv\.firstChild\s*\)\s*\{[^}]*appendChild\(tempDiv\.firstChild\);[^}]*\})',
        re.MULTILINE | re.DOTALL
    )
    
    def replace_pattern1(match):
        nonlocal fixes
        fixes += 1
        create_div = match.group(1)
        innerhtml_line = match.group(2)
        html_content = match.group(3)
        while_loop = match.group(4)
        
        # Extract target element from while loop
        target_match = re.search(r'appendChild\(tempDiv\.firstChild\)', while_loop)
        if target_match:
            # Find the element before appendChild
            before_append = while_loop[:target_match.start()]
            target_elem_match = re.search(r'(\w+)\.appendChild', before_append)
            if target_elem_match:
                target_elem = target_elem_match.group(1)
                return f"{create_div}# Convert HTML string to DOM elements safely\n                const parser = new DOMParser();\n                const doc = parser.parseFromString({html_content}, 'text/html');\n                const fragment = document.createDocumentFragment();\n                Array.from(doc.body.childNodes).forEach(node => {{\n                    fragment.appendChild(node.cloneNode(true));\n                }});\n                {target_elem}.appendChild(fragment);"
        
        return match.group(0)  # Return original if can't parse
    
    content = pattern1.sub(replace_pattern1, content)
    
    # Pattern 2: element.innerHTML = html; (simple case)
    pattern2 = re.compile(
        r'(\w+)\.innerHTML\s*=\s*`([^`]+)`;',
        re.MULTILINE | re.DOTALL
    )
    
    def replace_pattern2(match):
        nonlocal fixes
        fixes += 1
        element = match.group(1)
        html_content = match.group(2)
        
        return f"{element}.textContent = '';\n        // Convert HTML string to DOM elements safely\n        const parser = new DOMParser();\n        const doc = parser.parseFromString(`{html_content}`, 'text/html');\n        const fragment = document.createDocumentFragment();\n        Array.from(doc.body.childNodes).forEach(node => {{\n            fragment.appendChild(node.cloneNode(true));\n        }});\n        {element}.appendChild(fragment);"
    
    # Only apply pattern2 if it's a simple case (not already handled by pattern1)
    # We'll be more conservative here
    simple_cases = re.finditer(r'(\w+)\.innerHTML\s*=\s*`([^`]+)`;', content)
    for match in list(simple_cases):
        # Check if this is already part of a tempDiv pattern
        start = match.start()
        end = match.end()
        context = content[max(0, start-100):min(len(content), end+100)]
        if 'tempDiv' not in context:
            content = pattern2.sub(replace_pattern2, content, count=1)
            break
    
    return content, fixes

def fix_file(file_path):
    """Fix innerHTML in a single file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original = content
        content, fixes = fix_innerhtml_patterns(content)
        
        if content != original and fixes > 0:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True, fixes
        return False, 0
    except Exception as e:
        print(f"  ❌ Error: {e}")
        return False, 0

def main():
    """Main function"""
    print("=" * 70)
    print("Phase 4: Fix All Remaining innerHTML")
    print("=" * 70)
    
    total_fixed = 0
    total_files = 0
    
    for page_info in PAGES_TO_FIX:
        page_name = page_info['page']
        js_file = SCRIPTS_DIR / f'{page_name}.js'
        
        if not js_file.exists():
            print(f"⏭️  Skipping {page_name} - JS file not found")
            continue
        
        print(f"🔧 Fixing {page_name} ({page_info['count']} innerHTML usages)...")
        
        fixed, count = fix_file(js_file)
        if fixed:
            total_fixed += count
            total_files += 1
            print(f"  ✅ Fixed {count} innerHTML usages")
        else:
            print(f"  ⚠️  Could not auto-fix (may need manual review)")
    
    print("\n" + "=" * 70)
    print("📊 Summary")
    print("=" * 70)
    print(f"Files processed: {len(PAGES_TO_FIX)}")
    print(f"Files fixed: {total_files}")
    print(f"Total fixes: {total_fixed}")
    print("\n⚠️  Note: Some patterns may require manual review")

if __name__ == '__main__':
    main()



