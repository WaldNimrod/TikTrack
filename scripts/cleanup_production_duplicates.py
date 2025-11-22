#!/usr/bin/env python3
"""
Cleanup Production Environment
===============================

Removes duplicate directories, backup files, documentation, and archives from production environment.

Purpose: Keep production environment clean with only active, relevant files
Location: scripts/cleanup_production_duplicates.py
"""

import shutil
from pathlib import Path

def cleanup_production_duplicates():
    """Remove duplicate directories, backup files, documentation, and archives from production"""
    
    project_root = Path(__file__).parent.parent
    production_dir = project_root / "production"
    
    if not production_dir.exists():
        print("⚠️  Production directory not found")
        return False
    
    print("=" * 70)
    print("Cleaning Production Environment")
    print("=" * 70)
    print()
    
    removed_count = 0
    
    # 1. Remove nested Backend/Backend directory
    nested_backend = production_dir / "Backend" / "Backend"
    if nested_backend.exists():
        print(f"🗑️  Removing nested Backend directory: {nested_backend}")
        try:
            shutil.rmtree(nested_backend)
            removed_count += 1
            print(f"   ✅ Removed")
        except Exception as e:
            print(f"   ❌ Error: {e}")
    
    # 2. Remove backup directories and files in trading-ui
    trading_ui = production_dir / "trading-ui"
    if trading_ui.exists():
        # Remove backup directories
        for backup_dir in trading_ui.rglob("*backup*"):
            if backup_dir.is_dir():
                print(f"🗑️  Removing backup directory: {backup_dir.relative_to(production_dir)}")
                try:
                    shutil.rmtree(backup_dir)
                    removed_count += 1
                    print(f"   ✅ Removed")
                except Exception as e:
                    print(f"   ❌ Error: {e}")
        
        # Remove backup files (*.backup, *.backup-*, etc.)
        for backup_file in trading_ui.rglob("*.backup*"):
            if backup_file.is_file():
                print(f"🗑️  Removing backup file: {backup_file.relative_to(production_dir)}")
                try:
                    backup_file.unlink()
                    removed_count += 1
                    print(f"   ✅ Removed")
                except Exception as e:
                    print(f"   ❌ Error: {e}")
    
    # 3. Remove backup DB files in production root
    for backup_db in production_dir.glob("db_backup*.db"):
        if backup_db.is_file():
            print(f"🗑️  Removing backup DB: {backup_db.name}")
            try:
                backup_db.unlink()
                removed_count += 1
                print(f"   ✅ Removed")
            except Exception as e:
                print(f"   ❌ Error: {e}")
    
    # 4. Remove any empty duplicate directories
    for item in production_dir.rglob("*"):
        if item.is_dir() and item.name == "Backend" and item != production_dir / "Backend":
            # Check if it's empty or has minimal content
            try:
                contents = list(item.iterdir())
                if len(contents) == 0:
                    print(f"🗑️  Removing empty duplicate: {item.relative_to(production_dir)}")
                    shutil.rmtree(item)
                    removed_count += 1
                    print(f"   ✅ Removed")
            except Exception as e:
                print(f"   ⚠️  Could not check {item}: {e}")
    
    # 5. Remove documentation files (*.md, *.txt) from production
    print()
    print("📚 Removing documentation files...")
    for doc_file in production_dir.rglob("*.md"):
        if doc_file.is_file():
            # Keep only essential README if exists at root level
            if doc_file.name == "README.md" and doc_file.parent == production_dir:
                continue
            print(f"🗑️  Removing documentation: {doc_file.relative_to(production_dir)}")
            try:
                doc_file.unlink()
                removed_count += 1
                print(f"   ✅ Removed")
            except Exception as e:
                print(f"   ❌ Error: {e}")
    
    for txt_file in production_dir.rglob("*.txt"):
        if txt_file.is_file():
            # Keep requirements.txt
            if txt_file.name == "requirements.txt":
                continue
            print(f"🗑️  Removing text file: {txt_file.relative_to(production_dir)}")
            try:
                txt_file.unlink()
                removed_count += 1
                print(f"   ✅ Removed")
            except Exception as e:
                print(f"   ❌ Error: {e}")
    
    # 6. Remove archive directories
    print()
    print("📦 Removing archive directories...")
    for archive_dir in production_dir.rglob("*"):
        if archive_dir.is_dir() and any(keyword in archive_dir.name.lower() for keyword in ['archive', 'archived', 'old', 'deprecated']):
            print(f"🗑️  Removing archive directory: {archive_dir.relative_to(production_dir)}")
            try:
                shutil.rmtree(archive_dir)
                removed_count += 1
                print(f"   ✅ Removed")
            except Exception as e:
                print(f"   ❌ Error: {e}")
    
    # 7. Remove old log files (keep only recent ones in logs/ directory)
    print()
    print("📋 Cleaning old log files...")
    logs_dir = production_dir / "Backend" / "logs"
    if logs_dir.exists():
        # Keep only essential log files, remove old ones
        for log_file in logs_dir.rglob("*.log"):
            if log_file.is_file():
                # Keep server_output.log and recent app.log
                if log_file.name in ["server_output.log", "app.log"]:
                    continue
                # Remove old rotated logs
                if ".log." in log_file.name or log_file.name.endswith(".log.old"):
                    print(f"🗑️  Removing old log: {log_file.relative_to(production_dir)}")
                    try:
                        log_file.unlink()
                        removed_count += 1
                        print(f"   ✅ Removed")
                    except Exception as e:
                        print(f"   ❌ Error: {e}")
    
    # 8. Remove backup DB files (keep only active tiktrack.db)
    print()
    print("💾 Cleaning backup database files...")
    for db_file in production_dir.rglob("*.db*"):
        if db_file.is_file():
            # Keep only tiktrack.db in db/ directory
            if db_file.name == "tiktrack.db" and db_file.parent.name == "db":
                continue
            # Remove all other DB files (backups, shm, wal)
            print(f"🗑️  Removing DB file: {db_file.relative_to(production_dir)}")
            try:
                db_file.unlink()
                removed_count += 1
                print(f"   ✅ Removed")
            except Exception as e:
                print(f"   ❌ Error: {e}")
    
    print()
    if removed_count > 0:
        print(f"✅ Cleanup complete: {removed_count} items removed")
    else:
        print("✅ No cleanup needed")
    
    return True

if __name__ == "__main__":
    cleanup_production_duplicates()

