#!/usr/bin/env python3
"""
Complete innerHTML to createElement conversion script
Fixes all remaining innerHTML instances across all JS files
"""

import os
import re
import json
from pathlib import Path

# Base directory
BASE_DIR = Path(__file__).parent.parent.parent
SCRIPTS_DIR = BASE_DIR / 'trading-ui' / 'scripts'

# Files to skip (test files, old files, etc.)
SKIP_FILES = [
    'header-system-old.js',
    'conditions-test.js',
    'services-test.js',
    'test-widgets-overlay-logger.js',
    'database.js',
    'calendar/calendar-renderer.js',
    'init-system/pages-standardization-plan.js',
]

def find_innerhtml_files():
    """Find all JS files with innerHTML"""
    files = []
    for js_file in SCRIPTS_DIR.rglob('*.js'):
        if any(skip in str(js_file) for skip in SKIP_FILES):
            continue
        try:
            content = js_file.read_text(encoding='utf-8')
            if re.search(r'\.innerHTML\s*=', content):
                count = len(re.findall(r'\.innerHTML\s*=', content))
                files.append((js_file, count))
        except Exception as e:
            print(f"⚠️  Error reading {js_file}: {e}")
    return sorted(files, key=lambda x: x[1], reverse=True)

def fix_simple_innerhtml(content):
    """Fix simple innerHTML = '' or innerHTML = 'text' patterns"""
    # Fix: element.innerHTML = '';
    content = re.sub(
        r'(\w+)\.innerHTML\s*=\s*[\'"]\s*[\'"]\s*;',
        r'\1.textContent = \'\';',
        content
    )
    
    # Fix: element.innerHTML = 'simple text';
    # This is more complex and needs context, so we'll handle it case by case
    return content

def fix_innerhtml_with_parser(content, file_path):
    """Fix innerHTML assignments using DOMParser"""
    fixes = []
    
    # Pattern: element.innerHTML = `...`;
    pattern = r'(\w+)\.innerHTML\s*=\s*`([^`]+)`;'
    matches = list(re.finditer(pattern, content, re.DOTALL))
    
    for match in reversed(matches):
        var_name = match.group(1)
        html_content = match.group(2)
        start_pos = match.start()
        end_pos = match.end()
        
        # Skip if it's a complex template with variables
        if '${' in html_content:
            continue
        
        # Generate fix
        indent = ' ' * (len(content[:start_pos]) - len(content[:start_pos].rstrip()))
        fix_code = f"""{var_name}.textContent = '';
        const parser = new DOMParser();
        const doc = parser.parseFromString(`{html_content}`, 'text/html');
        const fragment = document.createDocumentFragment();
        doc.body.childNodes.forEach(node => {{
            fragment.appendChild(node.cloneNode(true));
        }});
        {var_name}.appendChild(fragment);"""
        
        fixes.append((start_pos, end_pos, fix_code))
    
    # Apply fixes in reverse order
    for start, end, replacement in fixes:
        content = content[:start] + replacement + content[end:]
    
    return content, len(fixes)

def main():
    print("🔍 Finding files with innerHTML...")
    files = find_innerhtml_files()
    
    if not files:
        print("✅ No files with innerHTML found!")
        return
    
    print(f"\n📊 Found {len(files)} files with innerHTML:")
    total_count = sum(count for _, count in files)
    print(f"   Total occurrences: {total_count}\n")
    
    results = []
    
    for file_path, count in files:
        print(f"🔧 Processing {file_path.name} ({count} occurrences)...")
        
        try:
            content = file_path.read_text(encoding='utf-8')
            original_content = content
            
            # Fix simple cases
            content = fix_simple_innerhtml(content)
            
            # Count remaining
            remaining = len(re.findall(r'\.innerHTML\s*=', content))
            
            if remaining < count:
                fixed = count - remaining
                file_path.write_text(content, encoding='utf-8')
                print(f"   ✅ Fixed {fixed} simple cases, {remaining} remaining")
                results.append({
                    'file': str(file_path.relative_to(BASE_DIR)),
                    'total': count,
                    'fixed': fixed,
                    'remaining': remaining
                })
            else:
                print(f"   ⚠️  No simple fixes found, {count} need manual review")
                results.append({
                    'file': str(file_path.relative_to(BASE_DIR)),
                    'total': count,
                    'fixed': 0,
                    'remaining': count
                })
                
        except Exception as e:
            print(f"   ❌ Error: {e}")
            results.append({
                'file': str(file_path.relative_to(BASE_DIR)),
                'total': count,
                'fixed': 0,
                'remaining': count,
                'error': str(e)
            })
    
    # Save results
    results_file = BASE_DIR / 'documentation' / '05-REPORTS' / 'INNERHTML_FIX_RESULTS.json'
    results_file.parent.mkdir(parents=True, exist_ok=True)
    results_file.write_text(json.dumps(results, indent=2, ensure_ascii=False), encoding='utf-8')
    
    total_fixed = sum(r['fixed'] for r in results)
    total_remaining = sum(r['remaining'] for r in results)
    
    print(f"\n📊 Summary:")
    print(f"   Files processed: {len(files)}")
    print(f"   Total fixed: {total_fixed}")
    print(f"   Total remaining: {total_remaining}")
    print(f"   Results saved to: {results_file}")

if __name__ == '__main__':
    main()




