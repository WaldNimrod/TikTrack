#!/usr/bin/env python3
"""
Script to replace console.* calls with Logger.* calls in JavaScript files
"""

import os
import re
import sys

def replace_console_calls(content, filename):
    """Replace console calls with Logger calls"""
    
    # Patterns to replace
    replacements = [
        # console.log patterns
        (r'console\.log\(([^)]+)\);', r'window.Logger.info(\1, {{ page: "{filename}" }});'),
        (r'console\.log\(([^)]+)\)', r'window.Logger.info(\1, {{ page: "{filename}" }})'),
        
        # console.error patterns  
        (r'console\.error\(([^)]+)\);', r'window.Logger.error(\1, {{ page: "{filename}" }});'),
        (r'console\.error\(([^)]+)\)', r'window.Logger.error(\1, {{ page: "{filename}" }})'),
        
        # console.warn patterns
        (r'console\.warn\(([^)]+)\);', r'window.Logger.warn(\1, {{ page: "{filename}" }});'),
        (r'console\.warn\(([^)]+)\)', r'window.Logger.warn(\1, {{ page: "{filename}" }})'),
        
        # console.debug patterns
        (r'console\.debug\(([^)]+)\);', r'window.Logger.debug(\1, {{ page: "{filename}" }});'),
        (r'console\.debug\(([^)]+)\)', r'window.Logger.debug(\1, {{ page: "{filename}" }})'),
        
        # console.info patterns
        (r'console\.info\(([^)]+)\);', r'window.Logger.info(\1, {{ page: "{filename}" }});'),
        (r'console\.info\(([^)]+)\)', r'window.Logger.info(\1, {{ page: "{filename}" }})'),
    ]
    
    # Get filename without path and extension
    base_filename = os.path.basename(filename).replace('.js', '')
    
    # Apply replacements
    for pattern, replacement in replacements:
        replacement = replacement.format(filename=base_filename)
        content = re.sub(pattern, replacement, content)
    
    return content

def process_file(filepath):
    """Process a single JavaScript file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Count original console calls
        original_count = len(re.findall(r'console\.', content))
        
        if original_count == 0:
            print(f"✅ {filepath}: No console calls found")
            return
        
        # Replace console calls
        new_content = replace_console_calls(content, filepath)
        
        # Count new console calls
        new_count = len(re.findall(r'console\.', new_content))
        
        # Write back if changes were made
        if new_count < original_count:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"✅ {filepath}: Replaced {original_count - new_count} console calls")
        else:
            print(f"⚠️ {filepath}: No changes made")
            
    except Exception as e:
        print(f"❌ Error processing {filepath}: {e}")

def main():
    """Main function"""
    if len(sys.argv) < 2:
        print("Usage: python3 fix_console_calls.py <file1> [file2] ...")
        sys.exit(1)
    
    for filepath in sys.argv[1:]:
        if os.path.exists(filepath):
            process_file(filepath)
        else:
            print(f"❌ File not found: {filepath}")

if __name__ == "__main__":
    main()
