#!/usr/bin/env python3
"""
Script to remove all !important declarations from unified.css
while preserving newlines and formatting
"""

import re
import os

def remove_important_from_css():
    """Remove all !important declarations from unified.css"""
    
    css_file = "trading-ui/styles-new/unified.css"
    
    if not os.path.exists(css_file):
        print(f"❌ File not found: {css_file}")
        return
    
    # Read the file
    with open(css_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    print(f"📄 Original file size: {len(content)} characters")
    print(f"📏 Original lines: {content.count(chr(10))}")
    
    # Count !important occurrences
    important_count = content.count('!important')
    print(f"🔍 Found {important_count} !important declarations")
    
    # Remove all !important declarations while preserving newlines
    # This regex matches !important at the end of CSS declarations
    cleaned_content = re.sub(r'\s*!important\s*', ' ', content)
    
    # Clean up any double spaces that might have been created, but preserve newlines
    cleaned_content = re.sub(r'[ \t]+', ' ', cleaned_content)  # Multiple spaces/tabs to single space
    cleaned_content = re.sub(r' \n', '\n', cleaned_content)    # Space before newline to just newline
    cleaned_content = re.sub(r'\n ', '\n', cleaned_content)    # Space after newline to just newline
    
    # Count remaining !important
    remaining_important = cleaned_content.count('!important')
    print(f"✅ Removed {important_count - remaining_important} !important declarations")
    print(f"📊 Remaining: {remaining_important} !important declarations")
    
    # Write back to file
    with open(css_file, 'w', encoding='utf-8') as f:
        f.write(cleaned_content)
    
    print(f"💾 File updated: {css_file}")
    print(f"📄 New file size: {len(cleaned_content)} characters")
    print(f"📏 New lines: {cleaned_content.count(chr(10))}")
    
    # Show some statistics
    lines_before = content.count('\n')
    lines_after = cleaned_content.count('\n')
    print(f"📊 Lines before: {lines_before}")
    print(f"📊 Lines after: {lines_after}")

if __name__ == "__main__":
    print("🧹 Removing !important declarations from unified.css (preserving formatting)...")
    remove_important_from_css()
    print("✅ Done!")
