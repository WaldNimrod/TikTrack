#!/usr/bin/env python3
"""
Phase 4: Fix All Remaining innerHTML
תיקון כל ה-innerHTML שנותר - החלפה ב-DOMParser
"""

import os
import re
from pathlib import Path
from datetime import datetime

PROJECT_ROOT = Path(__file__).parent.parent.parent
TRADING_UI = PROJECT_ROOT / 'trading-ui'
SCRIPTS_DIR = TRADING_UI / 'scripts'
DOCS_DIR = PROJECT_ROOT / 'documentation' / '05-REPORTS'

# Read test results to get list of pages with innerHTML
def get_pages_with_innerhtml():
    """Get pages that need innerHTML fixes"""
    results_file = DOCS_DIR / 'STANDARDIZATION_PHASE_4_TEST_RESULTS.json'
    if not results_file.exists():
        return []
    
    import json
    with open(results_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    pages_to_fix = []
    for result in data.get('results', []):
        patterns = result.get('patterns', {})
        if patterns:
            innerhtml = patterns.get('innerhtml_usage', 0)
            if innerhtml > 0:
                pages_to_fix.append({
                    'page': result.get('page'),
                    'js_exists': result.get('js_exists'),
                    'innerhtml': innerhtml
                })
    
    # Sort by innerHTML count (most first)
    pages_to_fix.sort(key=lambda x: x['innerhtml'], reverse=True)
    return pages_to_fix

def fix_innerhtml_in_file(file_path):
    """Fix innerHTML usage in a file - replace with DOMParser"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        fixes_count = 0
        
        # Pattern 1: tempDiv.innerHTML = htmlContent; ... while (tempDiv.firstChild) { ... appendChild(tempDiv.firstChild); }
        pattern1 = re.compile(
            r'(const\s+tempDiv\s*=\s*document\.createElement\([\'"]div[\'"]\);\s*)'
            r'(tempDiv\.innerHTML\s*=\s*([^;]+);\s*)'
            r'([^;]*?while\s*\(\s*tempDiv\.firstChild\s*\)\s*\{[^}]*appendChild\(tempDiv\.firstChild\);[^}]*\})',
            re.MULTILINE | re.DOTALL
        )
        
        def replace_pattern1(match):
            nonlocal fixes_count
            fixes_count += 1
            create_div = match.group(1)
            innerhtml_line = match.group(2)
            html_content = match.group(3)
            while_loop = match.group(4)
            
            # Extract the variable name and target element
            # This is complex - we'll use a simpler approach
            return f"{create_div}# Convert HTML string to DOM elements safely\n                const parser = new DOMParser();\n                const doc = parser.parseFromString({html_content}, 'text/html');\n                const fragment = document.createDocumentFragment();\n                Array.from(doc.body.childNodes).forEach(node => {{\n                    fragment.appendChild(node.cloneNode(true));\n                }});\n                # REPLACE_TARGET.appendChild(fragment);"
        
        # For now, let's use a simpler pattern that just finds and reports
        innerhtml_pattern = r'\.innerHTML\s*='
        matches = list(re.finditer(innerhtml_pattern, content))
        
        if matches:
            print(f"  ⚠️  Found {len(matches)} innerHTML usages - needs manual review")
            return False, len(matches)
        
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True, fixes_count
        
        return False, 0
    except Exception as e:
        print(f"  ❌ Error fixing innerHTML in {file_path}: {e}")
        return False, 0

def main():
    """Main function"""
    print("=" * 70)
    print("Phase 4: Fix All Remaining innerHTML")
    print("=" * 70)
    
    pages_to_fix = get_pages_with_innerhtml()
    print(f"\nFound {len(pages_to_fix)} pages with innerHTML to fix\n")
    
    total_fixed = 0
    total_remaining = 0
    
    for page_info in pages_to_fix:
        page_name = page_info['page']
        js_file = SCRIPTS_DIR / f'{page_name}.js'
        
        if not js_file.exists():
            print(f"⏭️  Skipping {page_name} - JS file not found")
            continue
        
        print(f"🔧 Checking {page_name} ({page_info['innerhtml']} innerHTML usages)...")
        
        fixed, remaining = fix_innerhtml_in_file(js_file)
        if fixed:
            total_fixed += remaining
            print(f"  ✅ Fixed {remaining} innerHTML usages")
        else:
            total_remaining += remaining
            if remaining > 0:
                print(f"  ⚠️  {remaining} innerHTML usages need manual review")
    
    print("\n" + "=" * 70)
    print("📊 Summary")
    print("=" * 70)
    print(f"Pages checked: {len(pages_to_fix)}")
    print(f"Total innerHTML usages found: {total_remaining}")
    print(f"\n⚠️  Note: Most innerHTML usages require manual review")
    print("    They are often in complex patterns that need context-aware fixes")

if __name__ == '__main__':
    main()



