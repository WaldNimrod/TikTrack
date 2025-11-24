#!/usr/bin/env python3
"""
Script to rename chart icons from Hebrew to English with chart- prefix
and copy them to the icons directory

Updated to work with tiktrack_icons_svg_big folder with new naming convention
"""

import os
import shutil
from pathlib import Path

# Source and destination directories
# Source is in _Tmp folder within TikTrackApp
SCRIPT_DIR = Path(__file__).parent
SOURCE_DIR = SCRIPT_DIR / "tiktrack_icons_svg_big"
DEST_DIR = SCRIPT_DIR.parent / "trading-ui" / "images" / "icons"

# Mapping from number (1-43) to English names with chart- prefix
# Based on PRICE_HISTORY_CHART_BUTTONS_LIST.md numbering
NUMBER_TO_NAME_MAPPING = {
    # Unit Size (1-6)
    1: "chart-unit-5m",
    2: "chart-unit-1h",
    3: "chart-unit-1d",
    4: "chart-unit-1w",
    5: "chart-unit-1m",
    6: "chart-unit-1y",
    
    # Time Range (7-11)
    7: "chart-range-day",      # טווח_יום
    8: "chart-range-week",     # טווח_שבוע
    9: "chart-range-month",    # טווח_חודש
    10: "chart-range-year",    # טווח_שנה
    11: "chart-range-all",     # טווח_הכול
    
    # Chart Type (12-14)
    12: "chart-type-line",
    13: "chart-type-bar",
    14: "chart-type-candlestick",
    
    # View Mode (15-16)
    15: "chart-view-price",
    16: "chart-view-percent",
    
    # Y-Axis Scale (17-18)
    17: "chart-scale-linear",
    18: "chart-scale-log",
    
    # Volume (19)
    19: "chart-volume-toggle",
    
    # Auto Scale (20)
    20: "chart-auto-scale",
    
    # Zoom (21-23)
    21: "chart-zoom-in",
    22: "chart-zoom-out",
    23: "chart-zoom-reset",
    
    # Indicators (24)
    24: "chart-indicators",
    
    # Series Visibility (25)
    25: "chart-series-toggle",
    
    # Export (26-27)
    26: "chart-screenshot",
    27: "chart-export-image",
    
    # Drawing Tools (28-40)
    28: "chart-drawing-tools",
    29: "chart-line",
    30: "chart-line-horizontal",
    31: "chart-line-vertical",
    32: "chart-arrow",
    33: "chart-rectangle",
    34: "chart-text",
    35: "chart-measure",
    36: "chart-fibonacci",
    37: "chart-trend-line",
    38: "chart-support-resistance",
    39: "chart-marker",
    40: "chart-clear-all",
    
    # General (41-43)
    41: "chart-export-data",
    42: "chart-settings",
    43: "chart-section-toggle",
}

# Mapping from Hebrew filename parts to English names (for files with Hebrew names)
HEBREW_NAME_MAPPING = {
    # Time Range (7-11) - when they appear in filename
    "טווח_יום": "chart-range-day",
    "טווח_שבוע": "chart-range-week",
    "טווח_חודש": "chart-range-month",
    "טווח_שנה": "chart-range-year",
    "טווח_הכול": "chart-range-all",
    
    # Unit Size - when they appear in filename
    "5m": "chart-unit-5m",
    "1h": "chart-unit-1h",
    "1D": "chart-unit-1d",
    "1W": "chart-unit-1w",
    "1M": "chart-unit-1m",
    "1Y": "chart-unit-1y",
}

def extract_number_from_filename(filename):
    """Extract number from filename like '01_5m.svg' or '12.svg'"""
    # Remove extension
    name_without_ext = filename.replace('.svg', '')
    # Split by underscore
    parts = name_without_ext.split('_')
    # First part should be the number (with or without leading zero)
    try:
        number = int(parts[0])
        return number
    except (ValueError, IndexError):
        return None

def extract_hebrew_name(filename):
    """Extract Hebrew part from filename like '07_טווח_יום.svg'"""
    # Remove extension
    name_without_ext = filename.replace('.svg', '')
    # Split by underscore
    parts = name_without_ext.split('_', 1)  # Split only on first underscore
    if len(parts) > 1:
        return parts[1]  # Return everything after the number
    return None

def rename_and_copy():
    """Rename files and copy to destination"""
    if not SOURCE_DIR.exists():
        print(f"❌ Source directory not found: {SOURCE_DIR}")
        return
    
    if not DEST_DIR.exists():
        print(f"⚠️  Destination directory not found: {DEST_DIR}")
        print(f"Creating directory...")
        DEST_DIR.mkdir(parents=True, exist_ok=True)
    
    print(f"📁 Source: {SOURCE_DIR}")
    print(f"📁 Destination: {DEST_DIR}\n")
    
    success_count = 0
    error_count = 0
    skipped_count = 0
    
    # Process all SVG files
    for svg_file in sorted(SOURCE_DIR.glob("*.svg")):
        number = extract_number_from_filename(svg_file.name)
        
        if number is None:
            print(f"⚠️  Could not extract number from: {svg_file.name}")
            error_count += 1
            continue
        
        # Get English name from number mapping
        english_name = NUMBER_TO_NAME_MAPPING.get(number)
        
        if not english_name:
            print(f"⚠️  No mapping found for number {number}: {svg_file.name}")
            error_count += 1
            continue
        
        new_filename = f"{english_name}.svg"
        dest_path = DEST_DIR / new_filename
        
        try:
            # Copy file with new name (will overwrite existing)
            shutil.copy2(svg_file, dest_path)
            print(f"✅ {svg_file.name} -> {new_filename} (number {number})")
            success_count += 1
        except Exception as e:
            print(f"❌ Error copying {svg_file.name}: {e}")
            error_count += 1
    
    print(f"\n{'='*60}")
    print(f"✅ Successfully copied: {success_count} files")
    if error_count > 0:
        print(f"❌ Errors: {error_count} files")
    if skipped_count > 0:
        print(f"⏭️  Skipped: {skipped_count} files")
    print(f"{'='*60}\n")
    
    # Verify all expected files exist
    print("🔍 Verifying copied files...")
    missing_files = []
    for number, expected_name in NUMBER_TO_NAME_MAPPING.items():
        expected_path = DEST_DIR / f"{expected_name}.svg"
        if not expected_path.exists():
            missing_files.append(expected_name)
    
    if missing_files:
        print(f"⚠️  Missing files: {', '.join(missing_files)}")
    else:
        print(f"✅ All {len(NUMBER_TO_NAME_MAPPING)} expected files are present!")

if __name__ == "__main__":
    rename_and_copy()
