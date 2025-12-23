#!/usr/bin/env python3
"""
Remove duplicate showModalSafe definitions from HTML pages
Code Review Fix - Phase 4: Remove duplicate modal helper definitions

This script removes the inline showModalSafe function definitions from all HTML pages
since they are now provided by the centralized ModalHelperService.

@version 1.0.0
@created December 2025
@author TikTrack Development Team
"""

import os
import re
from pathlib import Path

# Project paths
PROJECT_ROOT = Path(__file__).parent.parent
TRADING_UI = PROJECT_ROOT / "trading-ui"

# Simple pattern to match showModalSafe definition start
SHOWMODALSAFE_START = r'<!-- ===== CRITICAL: showModalSafe Helper.*?<script>'
SHOWMODALSAFE_END = r'window\.Logger\?\.debug\?\("✅ \[showModalSafe\] Helper function created in <head> - available immediately"\);\s*</script>'

def remove_showmodalsafe_from_file(file_path):
    """Remove showModalSafe definition from a single file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Find the start of the showModalSafe block
        start_match = re.search(SHOWMODALSAFE_START, content, re.DOTALL)
        if not start_match:
            return False

        # Find the end of the block
        end_match = re.search(SHOWMODALSAFE_END, content[start_match.end():], re.DOTALL)
        if not end_match:
            return False

        # Calculate absolute positions
        start_pos = start_match.start()
        end_pos = start_match.end() + end_match.end()

        # Remove the block
        new_content = content[:start_pos] + content[end_pos:]

        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)

        return True

    except Exception as e:
        print(f"❌ Error processing {file_path}: {e}")
        return False

def remove_showmodalsafe_from_file(file_path):
    """Remove showModalSafe definition from a single file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        original_content = content
        content = SHOWMODALSAFE_PATTERN.sub('', content)

        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        return False

    except Exception as e:
        print(f"❌ Error processing {file_path}: {e}")
        return False

def main():
    """Main function to remove duplicate showModalSafe definitions"""
    print("🧹 Removing duplicate showModalSafe definitions from HTML pages")
    print("=" * 60)

    # Get all HTML files in trading-ui directory
    html_files = list(TRADING_UI.glob("*.html"))

    print(f"📂 Found {len(html_files)} HTML files to check")

    removed_count = 0
    processed_count = 0

    for html_file in sorted(html_files):
        processed_count += 1
        print(f"🔍 Processing {html_file.name}...", end=" ")

        if remove_showmodalsafe_from_file(html_file):
            print("✅ Removed duplicate definition")
            removed_count += 1
        else:
            print("ℹ️  No duplicate definition found")

    print("\n📊 Summary:")
    print(f"   Files processed: {processed_count}")
    print(f"   Duplicates removed: {removed_count}")
    print(f"   Files unchanged: {processed_count - removed_count}")

    if removed_count > 0:
        print("\n✅ Successfully removed duplicate showModalSafe definitions")
        print("   These functions are now provided by ModalHelperService")
    else:
        print("\nℹ️  No duplicate definitions found")

if __name__ == "__main__":
    main()
