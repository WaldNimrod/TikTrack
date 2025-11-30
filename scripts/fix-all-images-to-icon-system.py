#!/usr/bin/env python3
"""
Fix all missing images by replacing with IconSystem placeholders
"""

import re
import os
from pathlib import Path

BASE_DIR = Path(__file__).parent.parent

PAGES_TO_FIX = [
    BASE_DIR / "trading-ui" / "mockups" / "daily-snapshots" / "portfolio-state-page.html",
    BASE_DIR / "trading-ui" / "mockups" / "watch-lists-page.html",
]

def extract_icon_name_from_path(img_tag):
    """Extract icon name from img src path"""
    match = re.search(r'/([^/]+)\.svg', img_tag)
    if match:
        return match.group(1)
    return None

def replace_img_with_icon_placeholder(img_tag):
    """Replace img tag with icon-placeholder"""
    # Extract icon name
    icon_name = extract_icon_name_from_path(img_tag)
    if not icon_name:
        return img_tag
    
    # Extract attributes
    width_match = re.search(r'width\s*=\s*["\'](\d+)["\']', img_tag)
    height_match = re.search(r'height\s*=\s*["\'](\d+)["\']', img_tag)
    alt_match = re.search(r'alt\s*=\s*["\']([^"\']+)["\']', img_tag)
    class_match = re.search(r'class\s*=\s*["\']([^"\']+)["\']', img_tag)
    id_match = re.search(r'id\s*=\s*["\']([^"\']+)["\']', img_tag)
    
    size = width_match.group(1) if width_match else '16'
    alt = alt_match.group(1) if alt_match else icon_name
    
    # Build placeholder
    placeholder = f'<span class="icon-placeholder icon" data-icon="{icon_name}" data-size="{size}" data-alt="{alt}" aria-label="{alt}"'
    
    if id_match:
        placeholder += f' id="{id_match.group(1)}"'
    
    placeholder += '></span>'
    
    return placeholder

def fix_page(file_path):
    """Fix images in a page"""
    if not file_path.exists():
        print(f"⚠️  File not found: {file_path}")
        return False
    
    try:
        content = file_path.read_text(encoding='utf-8')
        original_content = content
        
        # Find all img tags with tabler icons
        pattern = r'<img[^>]*src\s*=\s*["\'][^"\']*tabler/[^"\']+\.svg["\'][^>]*>'
        
        matches = list(re.finditer(pattern, content))
        
        if not matches:
            print(f"ℹ️  No tabler icons found in: {file_path.name}")
            return False
        
        # Replace from end to start to preserve positions
        for match in reversed(matches):
            img_tag = match.group(0)
            placeholder = replace_img_with_icon_placeholder(img_tag)
            content = content[:match.start()] + placeholder + content[match.end():]
        
        if content != original_content:
            file_path.write_text(content, encoding='utf-8')
            print(f"✅ Fixed {len(matches)} images in: {file_path.name}")
            return True
        else:
            print(f"ℹ️  No changes needed: {file_path.name}")
            return False
        
    except Exception as e:
        print(f"❌ Error fixing {file_path}: {e}")
        return False

def main():
    print("🔧 Fixing missing images by replacing with IconSystem...\n")
    
    fixed = 0
    for page_path in PAGES_TO_FIX:
        if fix_page(page_path):
            fixed += 1
    
    print(f"\n📊 Summary:")
    print(f"   Pages fixed: {fixed}")
    print(f"   Total: {len(PAGES_TO_FIX)}")

if __name__ == "__main__":
    main()

