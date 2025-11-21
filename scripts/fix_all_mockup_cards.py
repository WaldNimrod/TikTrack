#!/usr/bin/env python3
"""
Script to convert all cards to content-sections in mockup files
"""
import re
from pathlib import Path

MOCKUPS_DIR = Path('trading-ui/mockups/daily-snapshots')

def convert_card_to_section(card_html, page_name, title):
    """Convert a card HTML to content-section HTML"""
    # Extract card content (everything between card-body opening and closing)
    content_match = re.search(r'<div class="card-body">(.*?)</div>\s*</div>\s*</div>', card_html, re.DOTALL)
    if not content_match:
        return card_html
    
    card_content = content_match.group(1)
    # Remove the h5 title from content since it will be in section-header
    card_content = re.sub(r'<h5 class="card-title">[^<]+</h5>\s*', '', card_content)
    
    # Generate section ID
    section_id = re.sub(r'[^\w\s-]', '', title.lower())
    section_id = re.sub(r'\s+', '-', section_id)
    section_id = f"{page_name}-{section_id}"[:50]
    
    # Determine icon
    icon = "bi-file-text"
    if any(w in title for w in ['טבלה', 'table', 'Table']):
        icon = "bi-table"
    elif any(w in title for w in ['גרף', 'chart', 'Chart', 'graph', 'Graph', 'מחירים']):
        icon = "bi-graph-up"
    elif any(w in title for w in ['השוואה', 'compare', 'Compare', 'ניתוח']):
        icon = "bi-bar-chart"
    elif any(w in title for w in ['פילטר', 'filter', 'Filter']):
        icon = "bi-funnel"
    elif any(w in title for w in ['סטטיסטיקות', 'statistics', 'Statistics']):
        icon = "bi-bar-chart"
    
    # Build new section
    new_section = f'''                <div class="content-section" id="{section_id}">
                    <div class="section-header">
                        <h2><i class="bi {icon}"></i> {title}</h2>
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

def fix_file(filepath):
    """Fix a single mockup file"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    page_name = filepath.stem.replace('-', '_')
    
    # Find all cards with h5.card-title that are NOT inside section-body
    # Strategy: find cards, check if they're inside section-body by looking backwards
    
    lines = content.split('\n')
    new_lines = []
    i = 0
    section_body_depth = 0
    
    while i < len(lines):
        line = lines[i]
        
        # Track section-body depth
        if '<div class="section-body">' in line:
            section_body_depth += 1
        elif '</div>' in line and section_body_depth > 0:
            # Check if this closes section-body by counting divs
            if i > 0 and 'section-body' in lines[i-1]:
                section_body_depth -= 1
        
        # If we find a card outside section-body, convert it
        if section_body_depth == 0 and '<div class="card mb-4">' in line:
            # Find the full card block
            card_start = i
            card_lines = []
            div_count = 0
            found_h5 = False
            title = None
            
            # Collect card lines
            for j in range(i, min(i+100, len(lines))):
                card_line = lines[j]
                card_lines.append(card_line)
                
                if '<div class="card mb-4">' in card_line:
                    div_count += 1
                if '<h5 class="card-title">' in card_line:
                    found_h5 = True
                    title_match = re.search(r'<h5 class="card-title">([^<]+)</h5>', card_line)
                    if title_match:
                        title = title_match.group(1).strip()
                if '</div>' in card_line:
                    div_count -= 1
                    if div_count == 0 and found_h5 and title:
                        card_end = j
                        card_html = '\n'.join(card_lines)
                        converted = convert_card_to_section(card_html, page_name, title)
                        new_lines.append(converted)
                        i = card_end + 1
                        break
            else:
                # Card not properly closed, keep original
                new_lines.append(line)
                i += 1
        else:
            new_lines.append(line)
            i += 1
    
    new_content = '\n'.join(new_lines)
    
    if new_content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        return True
    return False

def main():
    """Main function"""
    files_to_fix = [
        'comparative-analysis-page.html',
        'trading-journal-page.html',
        'strategy-analysis-page.html',
        'economic-calendar-page.html',
        'history-widget.html',
        'emotional-tracking-widget.html',
        'date-comparison-modal.html',
        'journal-entry-modal.html'
    ]
    
    fixed_count = 0
    for filename in files_to_fix:
        filepath = MOCKUPS_DIR / filename
        if filepath.exists():
            try:
                if fix_file(filepath):
                    print(f"✓ Fixed: {filename}")
                    fixed_count += 1
                else:
                    print(f"- No changes: {filename}")
            except Exception as e:
                print(f"✗ Error in {filename}: {e}")
        else:
            print(f"? Not found: {filename}")
    
    print(f"\nFixed {fixed_count} files")

if __name__ == '__main__':
    main()

