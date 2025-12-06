#!/usr/bin/env python3
"""
Check Missing Watch List Icons
===============================
Script to identify exactly which icons are missing for the watch list modal.

This script:
1. Reads the icon list from watch-list-modal.js
2. Checks which icons exist in the tabler directory
3. Reports missing icons with exact paths
"""

import os
import re
import sys
from pathlib import Path

# Project root
PROJECT_ROOT = Path(__file__).parent.parent
TABLER_ICONS_DIR = PROJECT_ROOT / 'trading-ui' / 'images' / 'icons' / 'tabler'
WATCH_LIST_MODAL_JS = PROJECT_ROOT / 'trading-ui' / 'scripts' / 'watch-list-modal.js'

def extract_icon_list_from_js():
    """Extract the tablerIcons array from watch-list-modal.js"""
    if not WATCH_LIST_MODAL_JS.exists():
        print(f"❌ Error: {WATCH_LIST_MODAL_JS} not found")
        return []
    
    with open(WATCH_LIST_MODAL_JS, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find the tablerIcons array
    pattern = r'tablerIcons\s*=\s*\[(.*?)\]'
    match = re.search(pattern, content, re.DOTALL)
    
    if not match:
        print("❌ Error: Could not find tablerIcons array in watch-list-modal.js")
        return []
    
    # Extract icon names
    icons_str = match.group(1)
    # Remove comments and split by comma
    icons_str = re.sub(r'//.*', '', icons_str)
    icons = [icon.strip().strip("'\"") for icon in icons_str.split(',')]
    # Filter out empty strings and keep only non-empty icon names
    icons = [icon for icon in icons if icon and icon.strip()]
    
    return icons

def check_icon_exists(icon_name):
    """Check if icon file exists"""
    if not icon_name:
        return False, None
    
    icon_path = TABLER_ICONS_DIR / f"{icon_name}.svg"
    return icon_path.exists(), icon_path

def main():
    print("=" * 70)
    print("🔍 Checking Missing Watch List Icons")
    print("=" * 70)
    print()
    
    # Check if directories exist
    if not TABLER_ICONS_DIR.exists():
        print(f"❌ Error: Tabler icons directory not found: {TABLER_ICONS_DIR}")
        sys.exit(1)
    
    # Extract icon list from JS
    print("📋 Extracting icon list from watch-list-modal.js...")
    required_icons = extract_icon_list_from_js()
    
    if not required_icons:
        print("❌ No icons found in watch-list-modal.js")
        sys.exit(1)
    
    print(f"✅ Found {len(required_icons)} icons in code")
    print()
    
    # Check each icon
    print("🔍 Checking icon files...")
    print()
    
    missing_icons = []
    existing_icons = []
    
    for icon_name in sorted(required_icons):
        exists, icon_path = check_icon_exists(icon_name)
        if exists:
            existing_icons.append(icon_name)
            print(f"  ✅ {icon_name}.svg")
        else:
            missing_icons.append(icon_name)
            print(f"  ❌ {icon_name}.svg - MISSING")
            print(f"     Expected: {icon_path}")
    
    print()
    print("=" * 70)
    print("📊 Summary")
    print("=" * 70)
    print(f"Total icons in code: {len(required_icons)}")
    print(f"✅ Existing: {len(existing_icons)}")
    print(f"❌ Missing: {len(missing_icons)}")
    print()
    
    if missing_icons:
        print("=" * 70)
        print("❌ MISSING ICONS - Action Required")
        print("=" * 70)
        print()
        print("Missing icon files:")
        for icon_name in missing_icons:
            icon_path = TABLER_ICONS_DIR / f"{icon_name}.svg"
            print(f"  - {icon_name}.svg")
            print(f"    Path: {icon_path}")
            print()
        
        print("=" * 70)
        print("💡 To fix:")
        print("=" * 70)
        print("1. Download missing icons from Tabler Icons:")
        print("   https://tabler.io/icons")
        print()
        print("2. Save them to:")
        print(f"   {TABLER_ICONS_DIR}")
        print()
        print("3. Or use the icon download script:")
        print("   python3 scripts/icons/download-tabler-icon.py <icon-name>")
        print()
        
        # Generate download commands
        print("=" * 70)
        print("📥 Quick Download Commands")
        print("=" * 70)
        for icon_name in missing_icons:
            print(f"python3 scripts/icons/download-tabler-icon.py {icon_name}")
        
        sys.exit(1)
    else:
        print("✅ All icons are present!")
        sys.exit(0)

if __name__ == '__main__':
    main()

