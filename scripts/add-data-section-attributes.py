#!/usr/bin/env python3
"""
Script to add data-section attributes to sections that use toggleSection
"""

import os
import re
from pathlib import Path

BASE_DIR = Path(__file__).parent.parent
MOCKUPS_DIR = BASE_DIR / "trading-ui" / "mockups" / "daily-snapshots"

def process_file(file_path):
    """Process a single HTML file"""
    try:
        content = file_path.read_text(encoding='utf-8')
        original_content = content
        
        # Pattern: find divs with id that are used in toggleSection calls
        # Look for toggleSection('ID') and then find the div with that id
        
        # Find all toggleSection calls
        toggle_pattern = re.compile(r"toggleSection\(['\"]([^'\"]+)['\"]\)", re.IGNORECASE)
        section_ids = set(toggle_pattern.findall(content))
        
        # For each section ID, find the div and add data-section if missing
        for section_id in section_ids:
            # Pattern to find div with id="section_id" that doesn't have data-section
            div_pattern = re.compile(
                rf'<div([^>]*)\bid=["\']{re.escape(section_id)}["\']([^>]*)>',
                re.IGNORECASE
            )
            
            def add_data_section(match):
                attrs_before = match.group(1)
                attrs_after = match.group(2)
                
                # Check if data-section already exists
                if 'data-section' in (attrs_before + attrs_after):
                    return match.group(0)  # Already has data-section
                
                # Add data-section attribute
                if attrs_before.strip():
                    return f'<div{attrs_before} data-section="{section_id}"{attrs_after}>'
                else:
                    return f'<div data-section="{section_id}"{attrs_after}>'
            
            content = div_pattern.sub(add_data_section, content)
        
        if content != original_content:
            file_path.write_text(content, encoding='utf-8')
            return True
        return False
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False

def main():
    """Main function"""
    mockup_files = [
        "trading-journal-page.html",
        "trade-history-page.html",
        "portfolio-state-page.html",
        "price-history-page.html",
        "comparative-analysis-page.html",
        "strategy-analysis-page.html",
        "economic-calendar-page.html",
        "date-comparison-modal.html",
        "history-widget.html",
        "emotional-tracking-widget.html",
        "tradingview-test-page.html",
        "heatmap-visual-example.html"
    ]
    
    files_modified = 0
    
    for filename in mockup_files:
        file_path = MOCKUPS_DIR / filename
        if file_path.exists():
            if process_file(file_path):
                files_modified += 1
                print(f"✅ {filename}: Added data-section attributes")
        else:
            print(f"❌ {filename}: File not found")
    
    print(f"\n📊 Summary:")
    print(f"   Files modified: {files_modified}")

if __name__ == "__main__":
    main()

