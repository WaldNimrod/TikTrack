#!/usr/bin/env python3
"""
Pre-Sync Validation
====================

Validates that the codebase is ready for production sync.
Checks for uncommitted changes, backup files, and critical files.

Purpose: Ensure codebase is ready before syncing to production
Location: scripts/pre_sync_validation.py
"""

import subprocess
import sys
from pathlib import Path
from typing import Dict, List

# Add project root to path
PROJECT_ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(PROJECT_ROOT))


def check_git_status() -> Dict[str, any]:
    """Check git status for uncommitted changes"""
    try:
        result = subprocess.run(
            ['git', 'status', '--porcelain'],
            cwd=PROJECT_ROOT,
            capture_output=True,
            text=True,
            check=True
        )
        
        uncommitted = []
        for line in result.stdout.strip().split('\n'):
            if line.strip():
                uncommitted.append(line.strip())
        
        return {
            'has_uncommitted': len(uncommitted) > 0,
            'files': uncommitted,
            'count': len(uncommitted)
        }
    except subprocess.CalledProcessError as e:
        print(f"❌ Error checking git status: {e}")
        return {'has_uncommitted': False, 'files': [], 'count': 0}


def find_backup_files() -> List[str]:
    """Find backup and debug files"""
    backup_patterns = [
        '*.backup',
        '*.bak',
        '*_backup_*',
        '*debug*',
        '*.tmp',
        '*.temp'
    ]
    
    backup_files = []
    
    for pattern in backup_patterns:
        # Search in Backend and trading-ui
        for directory in ['Backend', 'trading-ui']:
            dir_path = PROJECT_ROOT / directory
            if dir_path.exists():
                for file_path in dir_path.rglob(pattern):
                    # Skip node_modules
                    if 'node_modules' not in str(file_path):
                        backup_files.append(str(file_path.relative_to(PROJECT_ROOT)))
    
    return backup_files


def check_critical_files() -> Dict[str, bool]:
    """Check that critical files exist"""
    critical_files = {
        'Backend/app.py': PROJECT_ROOT / 'Backend' / 'app.py',
        'Backend/config/settings.py': PROJECT_ROOT / 'Backend' / 'config' / 'settings.py',
        'trading-ui/index.html': PROJECT_ROOT / 'trading-ui' / 'index.html',
        'trading-ui/scripts/header-system.js': PROJECT_ROOT / 'trading-ui' / 'scripts' / 'header-system.js',
    }
    
    results = {}
    for name, path in critical_files.items():
        results[name] = path.exists()
    
    return results


def main():
    """Main validation function"""
    print("=" * 70)
    print("TikTrack Pre-Sync Validation")
    print("=" * 70)
    print()
    
    all_ok = True
    
    # Check git status
    print("📋 Checking git status...")
    git_status = check_git_status()
    
    if git_status['has_uncommitted']:
        print(f"  ⚠️  Found {git_status['count']} uncommitted changes:")
        for file_info in git_status['files'][:10]:  # Show first 10
            print(f"     - {file_info}")
        if git_status['count'] > 10:
            print(f"     ... and {git_status['count'] - 10} more")
        print()
        print("  ⚠️  Please commit all changes before syncing to production!")
        all_ok = False
    else:
        print("  ✅ No uncommitted changes")
    
    print()
    
    # Check for backup files
    print("🔍 Checking for backup/debug files...")
    backup_files = find_backup_files()
    
    if backup_files:
        print(f"  ⚠️  Found {len(backup_files)} backup/debug files:")
        for file_path in backup_files[:10]:  # Show first 10
            print(f"     - {file_path}")
        if len(backup_files) > 10:
            print(f"     ... and {len(backup_files) - 10} more")
        print()
        print("  ⚠️  Consider cleaning up backup files before sync")
        # This is a warning, not an error
    else:
        print("  ✅ No backup/debug files found")
    
    print()
    
    # Check critical files
    print("🔍 Checking critical files...")
    critical_files = check_critical_files()
    
    missing_files = [name for name, exists in critical_files.items() if not exists]
    
    if missing_files:
        print(f"  ❌ Missing {len(missing_files)} critical files:")
        for file_name in missing_files:
            print(f"     - {file_name}")
        all_ok = False
    else:
        print("  ✅ All critical files exist")
    
    print()
    print("=" * 70)
    
    if all_ok:
        print("✅ Pre-sync validation passed!")
        print("   Ready to sync to production")
    else:
        print("❌ Pre-sync validation failed!")
        print("   Please fix the issues above before syncing")
    
    print("=" * 70)
    
    return all_ok


if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)

