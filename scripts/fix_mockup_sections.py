#!/usr/bin/env python3
"""
Script to fix section structure and toggle buttons in all mockup files
"""
import re
import os
from pathlib import Path

MOCKUPS_DIR = Path('trading-ui/mockups/daily-snapshots')

def fix_top_section(content, page_name):
    """Fix top-section: add ID and toggle button"""
    section_id = f"{page_name}_top_section"
    
    # Add ID to top-section if missing
    if '<div class="top-section">' in content:
        content = re.sub(
            r'<div class="top-section">',
            f'<div class="top-section" id="{section_id}">',
            content,
            count=1
        )
    
    # Add toggle button to section-header if missing
    if f'toggleSection(\'{section_id}\')' not in content:
        # Find section-header and check if it has header-actions
        pattern = r'(<div class="section-header[^>]*>.*?)(</div>\s*<div class="section-body">)'
        
        def add_toggle_button(match):
            header_content = match.group(1)
            section_body = match.group(2)
            
            # Check if header-actions already exists
            if 'header-actions' in header_content:
                # Add toggle button to existing header-actions
                if 'filter-toggle-btn' not in header_content:
                    header_content = re.sub(
                        r'(</div>\s*</div>\s*)$',
                        f'<button class="filter-toggle-btn" onclick="toggleSection(\'{section_id}\')" title="הצג/הסתר סקשן"><span class="section-toggle-icon">▼</span></button></div>\\1',
                        header_content,
                        flags=re.MULTILINE
                    )
            else:
                # Add header-actions with toggle button
                # Find table-actions or last div before closing section-header
                if 'table-actions' in header_content:
                    header_content = re.sub(
                        r'(<div class="table-actions">.*?</div>)',
                        r'<div class="header-actions d-flex align-items-center gap-2">\1<button class="filter-toggle-btn" onclick="toggleSection(\'' + section_id + r'\')" title="הצג/הסתר סקשן"><span class="section-toggle-icon">▼</span></button></div>',
                        header_content,
                        flags=re.DOTALL
                    )
                else:
                    # Add header-actions at the end of section-header
                    header_content = re.sub(
                        r'(</div>\s*)$',
                        f'<div class="header-actions"><button class="filter-toggle-btn" onclick="toggleSection(\'{section_id}\')" title="הצג/הסתר סקשן"><span class="section-toggle-icon">▼</span></button></div>\\1',
                        header_content,
                        flags=re.MULTILINE
                    )
            
            return header_content + section_body
        
        content = re.sub(pattern, add_toggle_button, content, flags=re.DOTALL)
    
    return content

def convert_card_to_content_section(content, card_title, section_id, section_icon="bi-file-text"):
    """Convert a card to content-section with proper structure"""
    # Pattern to find card with specific title
    pattern = rf'(<!--\s*{re.escape(card_title)}\s*Section[^>]*-->.*?<div class="card mb-4">.*?<div class="card-body">.*?<h5 class="card-title">[^<]*{re.escape(card_title.split()[-1] if card_title.split() else "")}[^<]*</h5>)(.*?)(</div>\s*</div>\s*</div>)'
    
    def replace_card(match):
        comment = match.group(1)
        card_content = match.group(2)
        closing = match.group(3)
        
        # Extract title from h5
        title_match = re.search(r'<h5 class="card-title">([^<]+)</h5>', comment)
        title = title_match.group(1).strip() if title_match else card_title
        
        new_section = f'''{comment.replace('<div class="card mb-4">', f'<div class="content-section" id="{section_id}">').replace('<div class="card-body">', '<div class="section-header">').replace(f'<h5 class="card-title">{title}</h5>', f'<h2><i class="bi {section_icon}"></i> {title}</h2>')}
                        <div class="header-actions">
                            <button class="filter-toggle-btn" onclick="toggleSection('{section_id}')" title="הצג/הסתר סקשן">
                                <span class="section-toggle-icon">▼</span>
                            </button>
                        </div>
                    </div>
                    <div class="section-body">
{card_content}
                    </div>
                </div>'''
        
        return new_section
    
    content = re.sub(pattern, replace_card, content, flags=re.DOTALL)
    return content

def fix_mockup_file(filepath):
    """Fix a single mockup file"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    page_name = filepath.stem.replace('-', '_')
    
    # Fix top-section
    content = fix_top_section(content, page_name)
    
    # Note: Card to content-section conversion is complex and should be done manually
    # This script only fixes top-section structure
    
    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

def main():
    """Main function to fix all mockup files"""
    if not MOCKUPS_DIR.exists():
        print(f"Directory not found: {MOCKUPS_DIR}")
        return
    
    html_files = list(MOCKUPS_DIR.glob('*.html'))
    print(f"Found {len(html_files)} HTML files")
    
    fixed_count = 0
    for filepath in html_files:
        try:
            if fix_mockup_file(filepath):
                print(f"✓ Fixed: {filepath.name}")
                fixed_count += 1
            else:
                print(f"- No changes needed: {filepath.name}")
        except Exception as e:
            print(f"✗ Error fixing {filepath.name}: {e}")
    
    print(f"\nFixed {fixed_count} out of {len(html_files)} files")

if __name__ == '__main__':
    main()

