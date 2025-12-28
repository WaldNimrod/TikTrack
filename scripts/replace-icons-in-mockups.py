#!/usr/bin/env python3
"""
Script to replace direct <img> tags for Tabler icons with data-icon attributes
that will be replaced by IconSystem at runtime
"""

import os
import re
from pathlib import Path

BASE_DIR = Path(__file__).parent.parent
MOCKUPS_DIR = BASE_DIR / "trading-ui" / "mockups" / "daily-snapshots"

# Pattern to match: <img src="../../images/icons/tabler/ICON_NAME.svg" ...>
IMG_PATTERN = re.compile(
    r'<img\s+src=["\']\.\.\/\.\.\/images\/icons\/tabler\/([^"\']+)\.svg["\']'
    r'([^>]*)>',
    re.IGNORECASE
)

def extract_icon_name_and_attrs(match):
    """Extract icon name and attributes from img tag"""
    icon_name = match.group(1)
    attrs_str = match.group(2)
    
    # Extract common attributes
    width = re.search(r'width=["\']?(\d+)["\']?', attrs_str, re.IGNORECASE)
    height = re.search(r'height=["\']?(\d+)["\']?', attrs_str, re.IGNORECASE)
    alt = re.search(r'alt=["\']([^"\']+)["\']', attrs_str, re.IGNORECASE)
    class_attr = re.search(r'class=["\']([^"\']+)["\']', attrs_str, re.IGNORECASE)
    
    size = width.group(1) if width else (height.group(1) if height else '16')
    alt_text = alt.group(1) if alt else icon_name
    class_name = class_attr.group(1) if class_attr else 'icon'
    
    return icon_name, size, alt_text, class_name

def replace_img_with_placeholder(match):
    """Replace img tag with placeholder that will be processed by IconSystem"""
    icon_name, size, alt_text, class_name = extract_icon_name_and_attrs(match)
    
    # Create placeholder that will be replaced by IconSystem at runtime
    # We'll use a span with data attributes
    placeholder = (
        f'<span class="icon-placeholder {class_name}" '
        f'data-icon="{icon_name}" '
        f'data-size="{size}" '
        f'data-alt="{alt_text}" '
        f'aria-label="{alt_text}"></span>'
    )
    
    return placeholder

def process_file(file_path):
    """Process a single HTML file"""
    try:
        content = file_path.read_text(encoding='utf-8')
        original_content = content
        
        # Replace all img tags for Tabler icons
        content = IMG_PATTERN.sub(replace_img_with_placeholder, content)
        
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
        "trading_journal_page.html",
        "trade_history_page.html",
        "portfolio_state_page.html",
        "price_history_page.html",
        "comparative_analysis_page.html",
        "strategy_analysis_page.html",
        "economic_calendar_page.html",
        "date_comparison_modal.html",
        "history_widget.html",
        "emotional_tracking_widget.html",
        "tradingview_test_page.html",
        "heatmap_visual_example.html"
    ]
    
    total_replaced = 0
    files_modified = 0
    
    for filename in mockup_files:
        file_path = MOCKUPS_DIR / filename
        if file_path.exists():
            # Count matches before replacement
            content = file_path.read_text(encoding='utf-8')
            matches = len(IMG_PATTERN.findall(content))
            
            if process_file(file_path):
                files_modified += 1
                total_replaced += matches
                print(f"✅ {filename}: Replaced {matches} icon(s)")
            else:
                if matches > 0:
                    print(f"⚠️  {filename}: {matches} icon(s) found but not replaced")
        else:
            print(f"❌ {filename}: File not found")
    
    print(f"\n📊 Summary:")
    print(f"   Files modified: {files_modified}")
    print(f"   Total icons replaced: {total_replaced}")

if __name__ == "__main__":
    main()


