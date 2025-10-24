#!/usr/bin/env python3
"""
Fix anonymous async functions in JavaScript files
"""

import os
import re
import glob

def fix_anonymous_async_functions():
    """Fix 'async function  {' patterns in JavaScript files"""
    
    # Find all JS files
    js_files = glob.glob("*.js")
    
    fixed_files = []
    total_fixes = 0
    
    for file_path in js_files:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Count occurrences before fix
            before_count = content.count('async function  {')
            
            if before_count > 0:
                # Fix the problematic patterns
                # Pattern 1: async function  { -> async function generateDetailedLogFor[PageName]() {
                page_name = file_path.replace('.js', '').replace('-', '_').replace('_', ' ').title().replace(' ', '')
                if not page_name:
                    page_name = "Page"
                
                # Replace the pattern
                content = content.replace('async function  {', f'async function generateDetailedLogFor{page_name}() {{')
                
                # Write back the fixed content
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                
                fixed_files.append(file_path)
                total_fixes += before_count
                
                print(f"✅ Fixed {file_path}: {before_count} errors")
            else:
                print(f"✅ {file_path}: No errors found")
                
        except Exception as e:
            print(f"❌ Error fixing {file_path}: {e}")
    
    print(f"\n🎯 Summary:")
    print(f"📁 Files processed: {len(js_files)}")
    print(f"🔧 Files fixed: {len(fixed_files)}")
    print(f"🚫 Total errors removed: {total_fixes}")
    
    if fixed_files:
        print(f"\n📋 Fixed files:")
        for file in fixed_files:
            print(f"  - {file}")
    
    return len(fixed_files), total_fixes

if __name__ == "__main__":
    print("🔧 Fixing anonymous async functions...")
    fixed_count, total_fixes = fix_anonymous_async_functions()
    print(f"\n✅ Done! Fixed {fixed_count} files with {total_fixes} total errors.")
