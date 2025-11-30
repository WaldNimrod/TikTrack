#!/usr/bin/env python3
"""
Fix all SQLite references in script files
==========================================
This script removes all USING_SQLITE imports and conditional logic
from Python scripts, keeping only PostgreSQL support.

Run this script to update all scripts at once.
"""

import os
import re
import sys
from pathlib import Path

# Scripts to fix
SCRIPTS_TO_FIX = [
    "Backend/scripts/debug_session_78_import.py",
    "Backend/scripts/analyze_session_78_import.py",
    "Backend/scripts/check_session_78_records.py",
    "Backend/scripts/create_classification_table.py",
    "Backend/scripts/full_classification_analysis.py",
    "Backend/scripts/analyze_cashflow_classification_table.py",
    "Backend/scripts/analyze_cashflow_classification.py",
]

def fix_script(filepath: str):
    """Fix SQLite references in a script file"""
    path = Path(filepath)
    if not path.exists():
        print(f"⚠️  File not found: {filepath}")
        return False
    
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # Remove USING_SQLITE from imports
    content = re.sub(
        r'from config\.settings import ([^,]*),?\s*USING_SQLITE\s*,?\s*([^,\n]*)',
        r'from config.settings import \1\2',
        content
    )
    content = re.sub(
        r'from config\.settings import USING_SQLITE\s*,?\s*([^,\n]*)',
        r'from config.settings import \1',
        content
    )
    content = re.sub(
        r'from config\.settings import USING_SQLITE',
        r'from config.settings import',
        content
    )
    
    # Remove if USING_SQLITE: blocks (simple cases)
    # This is a basic pattern - may need manual review
    content = re.sub(
        r'\s*if USING_SQLITE:\s*\n\s*kwargs\["connect_args"\] = \{"check_same_thread": False\}\s*\n',
        r'',
        content
    )
    
    if content != original_content:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✅ Fixed: {filepath}")
        return True
    else:
        print(f"⏭️  No changes needed: {filepath}")
        return False

def main():
    print("=" * 70)
    print("Fixing SQLite References in Scripts")
    print("=" * 70)
    print()
    
    fixed_count = 0
    for script in SCRIPTS_TO_FIX:
        if fix_script(script):
            fixed_count += 1
    
    print()
    print(f"✅ Fixed {fixed_count} out of {len(SCRIPTS_TO_FIX)} scripts")
    print()
    print("⚠️  NOTE: Some scripts may need manual review for complex SQLite logic")
    print("    Please check each file after running this script")

if __name__ == "__main__":
    main()

