#!/usr/bin/env python3
"""
Replace remaining Bootstrap Icons and FontAwesome with Tabler Icons
"""

import os
import re
from pathlib import Path

PROJECT_ROOT = Path(__file__).parent.parent.parent
TRADING_UI_DIR = PROJECT_ROOT / 'trading-ui'

# Mapping of Bootstrap Icons to Tabler Icons
BI_TO_TABLER = {
    'bi-link-45deg': 'link',
    'bi-bar-chart': 'chart-bar',
    'bi-funnel': 'filter',
    'bi-check-all': 'check',
    'bi-x-circle': 'x',
    'bi-arrow-counterclockwise': 'refresh',
    'bi-table': 'table',
    'bi-grid-3x3': 'grid',
    'bi-pie-chart': 'chart-pie',
    'bi-hourglass-split': 'hourglass',
    'bi-exclamation-triangle': 'alert-triangle',
    'bi-graph-up-arrow': 'chart-line',
    'bi-graph-up': 'chart-line',
    'bi-arrow-left-right': 'arrows-sort',
    'bi-clock-history': 'clock',
    'bi-search': 'search',
    'bi-download': 'download',
    'bi-x': 'x',
    'bi-info-circle': 'info-circle',
    'bi-box-arrow-up-right': 'external-link',
    'bi-list-ul': 'list',
    'bi-gear-fill': 'settings',
    'bi-gear': 'settings',
    'bi-person-circle': 'user-circle',
    'bi-sliders': 'sliders',
    'bi-broadcast-pin': 'broadcast',
    'bi-tags-fill': 'tags',
    'bi-collection': 'layers',
    'bi-chevron-down': 'chevron-down',
    'bi-chevron-up': 'chevron-up',
}

# Mapping of FontAwesome to Tabler Icons
FA_TO_TABLER = {
    'fa-chart-line': 'chart-line',
    'fa-check-circle': 'check',
    'fa-times-circle': 'x',
    'fa-clock': 'clock',
    'fa-info-circle': 'info-circle',
    'fa-cogs': 'settings',
    'fa-play': 'player-play',
    'fa-play-circle': 'player-play',
    'fa-download': 'download',
    'fa-copy': 'copy',
    'fa-trash': 'trash',
    'fa-redo': 'refresh',
    'fa-chart-bar': 'chart-bar',
    'fa-file-alt': 'file-text',
    'fa-search': 'search',
    'fa-mouse-pointer': 'cursor',
    'fa-cogs': 'settings',
    'fa-cog': 'settings',
    'fa-info-circle': 'info-circle',
    'fa-briefcase': 'briefcase',
    'fa-tags': 'tags',
    'fa-circle': 'circle',
    'fa-sort': 'arrows-sort',
}

def replace_bootstrap_icons(content):
    """Replace Bootstrap Icons with Tabler SVG images"""
    changes = 0
    
    # Pattern: <i class="bi bi-XXX"></i> or <i class="bi bi-XXX fa-2x"></i>
    pattern = r'<i class="bi\s+(bi-[^"\']+)(?:\s+[^"]*)?"></i>'
    
    def replace_func(match):
        nonlocal changes
        bi_class = match.group(1)
        tabler_name = BI_TO_TABLER.get(bi_class)
        
        if tabler_name:
            changes += 1
            # Extract size classes if any
            size_match = re.search(r'fa-(\d+)x', match.group(0))
            size = size_match.group(1) if size_match else '16'
            
            # Extract text color if any
            color_match = re.search(r'text-(\w+)', match.group(0))
            color_class = f' text-{color_match.group(1)}' if color_match else ''
            
            return f'<img src="/trading-ui/images/icons/tabler/{tabler_name}.svg" width="{size}" height="{size}" alt="{tabler_name}" class="icon{color_class}">'
        else:
            # Unknown icon - use generic
            return f'<img src="/trading-ui/images/icons/tabler/info-circle.svg" width="16" height="16" alt="icon" class="icon">'
    
    content = re.sub(pattern, replace_func, content)
    return content, changes

def replace_fontawesome_icons(content):
    """Replace FontAwesome icons with Tabler SVG images"""
    changes = 0
    
    # Pattern: <i class="fas fa-XXX"></i> or <i class="fas fa-XXX fa-2x text-primary"></i>
    pattern = r'<i class="(?:fas|far|fab)\s+(fa-[^"\']+)(?:\s+[^"]*)?"></i>'
    
    def replace_func(match):
        nonlocal changes
        fa_class = match.group(1)
        tabler_name = FA_TO_TABLER.get(fa_class)
        
        if tabler_name:
            changes += 1
            # Extract size classes if any
            size_match = re.search(r'fa-(\d+)x', match.group(0))
            size = size_match.group(1) if size_match else '16'
            
            # Extract text color if any
            color_match = re.search(r'text-(\w+)', match.group(0))
            color_class = f' text-{color_match.group(1)}' if color_match else ''
            
            return f'<img src="/trading-ui/images/icons/tabler/{tabler_name}.svg" width="{size}" height="{size}" alt="{tabler_name}" class="icon{color_class}">'
        else:
            # Unknown icon - use generic
            return f'<img src="/trading-ui/images/icons/tabler/info-circle.svg" width="16" height="16" alt="icon" class="icon">'
    
    content = re.sub(pattern, replace_func, content)
    return content, changes

def process_file(file_path):
    """Process a single HTML file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        total_changes = 0
        
        # Replace Bootstrap Icons
        content, bi_changes = replace_bootstrap_icons(content)
        total_changes += bi_changes
        
        # Replace FontAwesome
        content, fa_changes = replace_fontawesome_icons(content)
        total_changes += fa_changes
        
        if total_changes > 0:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return total_changes
        
        return 0
    
    except Exception as e:
        print(f"❌ Error processing {file_path}: {e}")
        return 0

def main():
    """Main function"""
    files_to_process = []
    
    # Search for all HTML files with remaining icons
    print("🔍 Searching for all files with Bootstrap Icons and FontAwesome...")
    html_files = list((PROJECT_ROOT / 'trading-ui').glob('*.html'))
    html_files.extend((PROJECT_ROOT / 'trading-ui' / 'mockups').rglob('*.html'))
    
    for html_file in html_files:
        try:
            with open(html_file, 'r', encoding='utf-8') as f:
                content = f.read()
                if re.search(r'class=["\']bi\s+bi-|class=["\'](?:fas|far|fab)\s+fa-', content):
                    file_str = str(html_file.relative_to(PROJECT_ROOT))
                    files_to_process.append(file_str)
        except Exception as e:
            print(f"⚠️  Error reading {html_file}: {e}")
    
    print(f"📋 Found {len(files_to_process)} files with remaining icons\n")
    
    print("🔍 Processing files with remaining icon replacements...\n")
    
    total_changes = 0
    for file_path_str in files_to_process:
        file_path = PROJECT_ROOT / file_path_str
        if file_path.exists():
            changes = process_file(file_path)
            if changes > 0:
                print(f"✅ Updated {file_path_str}: {changes} icons replaced")
                total_changes += changes
        else:
            print(f"⚠️  File not found: {file_path_str}")
    
    print(f"\n{'='*60}")
    print(f"✅ Total icons replaced: {total_changes}")
    print(f"{'='*60}")

if __name__ == '__main__':
    main()

