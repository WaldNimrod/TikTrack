#!/usr/bin/env python3
"""
Remove Bootstrap Icons and FontAwesome CDN links from HTML files
"""

import os
import re
from pathlib import Path

PROJECT_ROOT = Path(__file__).parent.parent.parent
TRADING_UI_DIR = PROJECT_ROOT / 'trading-ui'

# Patterns to remove
BOOTSTRAP_ICONS_PATTERN = re.compile(
    r'<link\s+rel=["\']stylesheet["\']\s+href=["\']https://cdn\.jsdelivr\.net/npm/bootstrap-icons@[\d.]+/font/bootstrap-icons\.css[^"\']*["\']\s*>',
    re.IGNORECASE
)

FONTAWESOME_PATTERN = re.compile(
    r'<link\s+rel=["\']stylesheet["\']\s+href=["\']https://cdnjs\.cloudflare\.com/ajax/libs/font-awesome/[\d.]+/css/all\.min\.css[^"\']*["\']\s*>',
    re.IGNORECASE
)

# Replacement comment
REPLACEMENT = '    <!-- Bootstrap Icons and FontAwesome removed - using Tabler Icons via IconSystem -->'

def process_file(file_path):
    """Process a single HTML file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        changes = False
        
        # Remove Bootstrap Icons
        if BOOTSTRAP_ICONS_PATTERN.search(content):
            content = BOOTSTRAP_ICONS_PATTERN.sub('', content)
            changes = True
        
        # Remove FontAwesome
        if FONTAWESOME_PATTERN.search(content):
            content = FONTAWESOME_PATTERN.sub('', content)
            changes = True
        
        # Add replacement comment if we removed something
        if changes:
            # Check if replacement comment already exists
            if REPLACEMENT not in content:
                # Try to find a good place to insert it (after External Libraries comment or before </head>)
                external_lib_pattern = re.compile(r'(<!--\s*External Libraries\s*-->|<!--\s*External\s*-->)', re.IGNORECASE)
                match = external_lib_pattern.search(content)
                if match:
                    # Insert after External Libraries comment
                    insert_pos = match.end()
                    # Find next newline
                    newline_pos = content.find('\n', insert_pos)
                    if newline_pos != -1:
                        content = content[:newline_pos+1] + REPLACEMENT + '\n' + content[newline_pos+1:]
                else:
                    # Insert before </head>
                    head_end = content.rfind('</head>')
                    if head_end != -1:
                        # Find last newline before </head>
                        newline_pos = content.rfind('\n', 0, head_end)
                        if newline_pos != -1:
                            content = content[:newline_pos+1] + REPLACEMENT + '\n' + content[newline_pos+1:]
            
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            
            return True
        
        return False
    
    except Exception as e:
        print(f"❌ Error processing {file_path}: {e}")
        return False

def main():
    """Main function"""
    html_files = list(TRADING_UI_DIR.glob('*.html'))
    html_files.extend(TRADING_UI_DIR.glob('mockups/**/*.html'))
    
    print(f"🔍 Found {len(html_files)} HTML files to process\n")
    
    updated_count = 0
    for html_file in html_files:
        if process_file(html_file):
            print(f"✅ Updated: {html_file.relative_to(PROJECT_ROOT)}")
            updated_count += 1
    
    print(f"\n{'='*60}")
    print(f"✅ Updated {updated_count} files")
    print(f"📋 Total files checked: {len(html_files)}")
    print(f"{'='*60}")

if __name__ == '__main__':
    main()

