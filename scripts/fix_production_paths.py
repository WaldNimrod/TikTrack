#!/usr/bin/env python3
"""
Fix Hardcoded Paths in Production Files
========================================

Replaces hardcoded database paths with config.settings imports
"""

import re
from pathlib import Path

PRODUCTION_BACKEND = Path(__file__).parent.parent / "production" / "Backend"

# Pattern to find hardcoded DB paths
HARDCODED_DB_PATTERN = r'BASE_DIR\s*=\s*os\.path\.dirname\(.*?\)\s*\n\s*DB_PATH\s*=\s*os\.path\.join\(BASE_DIR,\s*["\']db["\'],\s*["\']simpleTrade_new\.db["\']\)'

# Replacement pattern
REPLACEMENT = """from config.settings import DB_PATH"""

def fix_file(file_path: Path):
    """Fix hardcoded paths in a single file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Replace hardcoded DB path pattern
        # Pattern 1: Multi-line pattern
        pattern1 = re.compile(
            r'BASE_DIR\s*=\s*os\.path\.dirname\([^)]+\)\s*\n\s*DB_PATH\s*=\s*os\.path\.join\(BASE_DIR,\s*["\']db["\'],\s*["\']simpleTrade_new\.db["\']\)',
            re.MULTILINE
        )
        content = pattern1.sub('from config.settings import DB_PATH', content)
        
        # Pattern 2: Single line with multiple dirname calls
        pattern2 = re.compile(
            r'BASE_DIR\s*=\s*os\.path\.dirname\(os\.path\.dirname\(os\.path\.dirname\(os\.path\.abspath\(__file__\)\)\)\)\s*\n\s*DB_PATH\s*=\s*os\.path\.join\(BASE_DIR,\s*["\']db["\'],\s*["\']simpleTrade_new\.db["\']\)',
            re.MULTILINE
        )
        content = pattern2.sub('from config.settings import DB_PATH', content)
        
        # Fix get_db_connection functions
        # Replace DB_PATH usage in sqlite3.connect
        content = re.sub(
            r'sqlite3\.connect\(DB_PATH\)',
            r'sqlite3.connect(str(DB_PATH))',
            content
        )
        
        # Fix user_data_import.py special case
        content = re.sub(
            r"create_engine\('sqlite:///db/simpleTrade_new\.db'\)",
            r"create_engine(f'sqlite:///{DB_PATH}')",
            content
        )
        
        # Add import if needed
        if 'from config.settings import DB_PATH' in content and 'import sqlite3' in content:
            # Check if import is after sqlite3 import
            if content.find('import sqlite3') < content.find('from config.settings import DB_PATH'):
                # Already in right place
                pass
            else:
                # Move import to top
                lines = content.split('\n')
                import_line_idx = None
                config_import_idx = None
                
                for i, line in enumerate(lines):
                    if 'import sqlite3' in line and import_line_idx is None:
                        import_line_idx = i
                    if 'from config.settings import DB_PATH' in line:
                        config_import_idx = i
                        break
                
                if import_line_idx is not None and config_import_idx is not None:
                    # Move config import after sqlite3 import
                    config_line = lines.pop(config_import_idx)
                    lines.insert(import_line_idx + 1, config_line)
                    content = '\n'.join(lines)
        
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        
        return False
        
    except Exception as e:
        print(f"  ⚠️  Error fixing {file_path}: {e}")
        return False

def main():
    """Fix all files in production/Backend/"""
    print("=" * 60)
    print("Fixing Hardcoded Paths in Production Files")
    print("=" * 60)
    print()
    
    fixed_count = 0
    
    # Find all Python files
    for py_file in PRODUCTION_BACKEND.rglob("*.py"):
        if fix_file(py_file):
            print(f"  ✅ Fixed: {py_file.relative_to(PRODUCTION_BACKEND)}")
            fixed_count += 1
    
    print()
    print("=" * 60)
    print(f"Fixed {fixed_count} files")
    print("=" * 60)

if __name__ == '__main__':
    main()

