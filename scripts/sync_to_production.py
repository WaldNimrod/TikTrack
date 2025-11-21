#!/usr/bin/env python3
"""
Sync Active Files to Production
================================

Automatically copies only active files from Backend/ to production/Backend/
based on directory structure, not manual lists.

Purpose: Keep production codebase clean and automatically discover new files
Location: scripts/sync_to_production.py
"""

import os
import shutil
import sys
import subprocess
from pathlib import Path
from typing import Set

# Directories
PROJECT_ROOT = Path(__file__).parent.parent
SOURCE_BACKEND = PROJECT_ROOT / "Backend"
TARGET_BACKEND = PROJECT_ROOT / "production" / "Backend"

# Allowed directories (only these will be copied)
ALLOWED_DIRS = {
    'config',
    'routes',
    'services',
    'models',
    'utils',
    'connectors'  # Required for user_data_import
}

# Allowed root files
ALLOWED_ROOT_FILES = {
    'app.py',
    'requirements.txt'
}

# Allowed scripts (production-ready scripts)
ALLOWED_SCRIPTS = {
    'backup_database.py',
    'create_production_db.py',
    'map_active_files.py',
    'cleanup_import_sessions.py'  # For periodic cleanup of old import sessions
}

# Note: Migration scripts are in Backend/migrations/ and should be run manually in production
# They are not copied automatically by sync_to_production.py

# Excluded patterns
EXCLUDED_PATTERNS = {
    '__pycache__',
    '.pyc',
    '.pyo',
    '.pyd',
    '.db',
    '.db-shm',
    '.db-wal',
    '.log'
}

def should_copy_file(file_path: Path, relative_path: Path) -> bool:
    """Check if file should be copied"""
    
    # Check excluded patterns
    if any(pattern in str(file_path) for pattern in EXCLUDED_PATTERNS):
        return False
    
    # Root level files
    if relative_path.parent == Path('.'):
        return relative_path.name in ALLOWED_ROOT_FILES
    
    # Files in allowed directories
    parts = relative_path.parts
    if len(parts) > 0:
        first_dir = parts[0]
        if first_dir in ALLOWED_DIRS:
            return True
        
        # Scripts directory - only allowed scripts
        if first_dir == 'scripts' and len(parts) > 1:
            return parts[1] in ALLOWED_SCRIPTS
    
    return False

def copy_directory_structure(source: Path, target: Path, relative: Path = Path('.')):
    """Recursively copy allowed files maintaining directory structure"""
    copied_count = 0
    skipped_count = 0
    
    if not source.exists():
        print(f"⚠️  Source directory not found: {source}")
        return copied_count, skipped_count
    
    # Create target directory
    target.mkdir(parents=True, exist_ok=True)
    
    # Process files and directories
    for item in source.iterdir():
        if item.name.startswith('.'):
            continue
        
        item_relative = relative / item.name
        
        if item.is_file():
            if should_copy_file(item, item_relative):
                target_file = target / item.name
                shutil.copy2(item, target_file)
                copied_count += 1
                print(f"  ✅ Copied: {item_relative}")
            else:
                skipped_count += 1
                if item.suffix == '.py':  # Only log skipped Python files
                    print(f"  ⏭️  Skipped: {item_relative}")
        
        elif item.is_dir():
            # Check if this directory should be processed
            # Allow directories that are in ALLOWED_DIRS or are subdirectories of allowed dirs
            if item.name in ALLOWED_DIRS or item.name == 'scripts':
                target_dir = target / item.name
                sub_copied, sub_skipped = copy_directory_structure(
                    item, target_dir, item_relative
                )
                copied_count += sub_copied
                skipped_count += sub_skipped
            elif len(relative.parts) > 0 and relative.parts[0] in ALLOWED_DIRS:
                # Subdirectory of allowed directory - copy it (e.g., routes/api/, services/external_data/)
                target_dir = target / item.name
                sub_copied, sub_skipped = copy_directory_structure(
                    item, target_dir, item_relative
                )
                copied_count += sub_copied
                skipped_count += sub_skipped
            else:
                skipped_count += 1
                print(f"  ⏭️  Skipped directory: {item_relative}/")
    
    return copied_count, skipped_count

def main():
    """Main sync function"""
    print("=" * 60)
    print("Syncing Active Files to Production")
    print("=" * 60)
    print(f"Source: {SOURCE_BACKEND}")
    print(f"Target: {TARGET_BACKEND}")
    print()
    
    # Verify source exists
    if not SOURCE_BACKEND.exists():
        print(f"❌ Source directory not found: {SOURCE_BACKEND}")
        return False
    
    # Create target structure
    TARGET_BACKEND.parent.mkdir(parents=True, exist_ok=True)
    
    # Backup and preserve DB before removing production directory
    db_backup = None
    production_db = TARGET_BACKEND / "db" / "tiktrack.db"
    db_dir = TARGET_BACKEND / "db"
    
    if TARGET_BACKEND.exists():
        if production_db.exists():
            db_backup = TARGET_BACKEND.parent / "db_backup_before_sync.db"
            print(f"💾 Backing up production DB before sync...")
            shutil.copy2(production_db, db_backup)
            print(f"   ✅ DB backed up to: {db_backup}")
        
        print(f"🗑️  Removing existing production directory (preserving DB)...")
        # Remove everything except db directory
        for item in TARGET_BACKEND.iterdir():
            if item.name != 'db':
                if item.is_file():
                    item.unlink()
                elif item.is_dir():
                    shutil.rmtree(item)
    
    print("📋 Copying files...")
    print()
    
    # Copy files
    copied, skipped = copy_directory_structure(SOURCE_BACKEND, TARGET_BACKEND)
    
    # Restore or create DB
    production_db = TARGET_BACKEND / "db" / "tiktrack.db"
    production_db.parent.mkdir(parents=True, exist_ok=True)
    
    if not production_db.exists():
        if db_backup and db_backup.exists():
            print(f"💾 Restoring production DB from backup...")
            shutil.copy2(db_backup, production_db)
            print(f"   ✅ DB restored")
            db_backup.unlink()
        else:
            # Try to copy from dev
            dev_db = PROJECT_ROOT / "Backend" / "db" / "tiktrack.db"
            tmp_db = PROJECT_ROOT / "_Tmp" / "tiktrack.db"
            
            source_db = None
            if tmp_db.exists():
                source_db = tmp_db
                print(f"💾 Copying DB from _Tmp...")
            elif dev_db.exists():
                source_db = dev_db
                print(f"💾 Copying DB from Backend...")
            
            if source_db:
                shutil.copy2(source_db, production_db)
                print(f"   ✅ DB copied to production")
            else:
                print(f"   ⚠️  No source DB found - server may fail to start")
                print(f"   ⚠️  Run: cd production/Backend && python3 scripts/create_production_db.py")
    elif db_backup and db_backup.exists():
        # DB exists, remove backup
        db_backup.unlink()
    
    print()
    print("=" * 60)
    print("Backend Sync Complete")
    print("=" * 60)
    print(f"✅ Copied: {copied} files")
    print(f"⏭️  Skipped: {skipped} items")
    print(f"📁 Target: {TARGET_BACKEND}")
    print()
    
    # Sync UI to production
    print("=" * 60)
    print("Syncing UI to production...")
    print("=" * 60)
    ui_sync_script = Path(__file__).parent / "sync_ui_to_production.py"
    if ui_sync_script.exists():
        result = subprocess.run([sys.executable, str(ui_sync_script)], capture_output=True, text=True)
        print(result.stdout)
        if result.returncode != 0:
            print("⚠️  UI sync had issues, but Backend sync completed")
            return False
    else:
        print("⚠️  UI sync script not found, skipping UI sync")
    
    print()
    print("=" * 60)
    print("✅ Complete sync finished!")
    print("=" * 60)
    
    return True

if __name__ == '__main__':
    success = main()
    exit(0 if success else 1)

