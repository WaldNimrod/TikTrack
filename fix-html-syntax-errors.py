#!/usr/bin/env python3
"""
Fix HTML syntax errors - Remove 'window. = ;' from all HTML files
"""

import os
import re
import glob

def fix_html_syntax_errors():
    """Fix 'window. = ;' syntax errors in HTML files"""
    
    # Find all HTML files
    html_files = glob.glob("*.html")
    
    fixed_files = []
    total_fixes = 0
    
    for file_path in html_files:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Count occurrences before fix
            before_count = content.count('window. = ;')
            
            if before_count > 0:
                # Remove the problematic lines
                lines = content.split('\n')
                fixed_lines = []
                
                for line in lines:
                    if 'window. = ;' in line:
                        # Check if this is a standalone line or part of a script block
                        if line.strip() == 'window. = ;' or line.strip() == '            window. = ;':
                            # Skip this line completely
                            continue
                        else:
                            # Remove just the problematic part
                            line = line.replace('window. = ;', '')
                            if line.strip():
                                fixed_lines.append(line)
                    else:
                        fixed_lines.append(line)
                
                # Write back the fixed content
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write('\n'.join(fixed_lines))
                
                fixed_files.append(file_path)
                total_fixes += before_count
                
                print(f"✅ Fixed {file_path}: {before_count} errors")
            else:
                print(f"✅ {file_path}: No errors found")
                
        except Exception as e:
            print(f"❌ Error fixing {file_path}: {e}")
    
    print(f"\n🎯 Summary:")
    print(f"📁 Files processed: {len(html_files)}")
    print(f"🔧 Files fixed: {len(fixed_files)}")
    print(f"🚫 Total errors removed: {total_fixes}")
    
    if fixed_files:
        print(f"\n📋 Fixed files:")
        for file in fixed_files:
            print(f"  - {file}")
    
    return len(fixed_files), total_fixes

if __name__ == "__main__":
    print("🔧 Fixing HTML syntax errors...")
    fixed_count, total_fixes = fix_html_syntax_errors()
    print(f"\n✅ Done! Fixed {fixed_count} files with {total_fixes} total errors.")
