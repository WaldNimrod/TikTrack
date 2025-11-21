#!/usr/bin/env python3
"""
Preserve Production Changes
===========================

Checks for uncommitted changes in production environment and commits them
to preserve production-specific changes (especially config files) before merge.

Purpose: Ensure production changes are saved before merging from main
Location: scripts/production-update/preserve_production_changes.py
"""

import subprocess
import sys
from datetime import datetime
from pathlib import Path
from typing import Dict, List

# Add project root to path
PROJECT_ROOT = Path(__file__).parent.parent.parent
sys.path.insert(0, str(PROJECT_ROOT))


def get_git_status() -> Dict[str, List[str]]:
    """Get git status and categorize changes"""
    try:
        result = subprocess.run(
            ['git', 'status', '--porcelain'],
            cwd=PROJECT_ROOT,
            capture_output=True,
            text=True,
            check=True
        )
        
        changes = {
            'modified': [],
            'added': [],
            'deleted': [],
            'untracked': []
        }
        
        for line in result.stdout.strip().split('\n'):
            if not line:
                continue
            
            status = line[:2]
            file_path = line[3:]
            
            if status.startswith('M'):
                changes['modified'].append(file_path)
            elif status.startswith('A'):
                changes['added'].append(file_path)
            elif status.startswith('D'):
                changes['deleted'].append(file_path)
            elif status.startswith('??'):
                changes['untracked'].append(file_path)
        
        return changes
    except subprocess.CalledProcessError as e:
        print(f"❌ Error getting git status: {e}")
        return {'modified': [], 'added': [], 'deleted': [], 'untracked': []}


def identify_production_changes(changes: Dict[str, List[str]]) -> Dict[str, List[str]]:
    """Identify production-specific changes that need to be preserved"""
    production_changes = {
        'config': [],
        'other': []
    }
    
    # Production config files that must be preserved
    config_patterns = [
        'production/Backend/config/settings.py',
        'production/Backend/config/logging.py',
        'production/Backend/config/database.py',
    ]
    
    all_changes = changes['modified'] + changes['added'] + changes['deleted']
    
    for file_path in all_changes:
        if any(pattern in file_path for pattern in config_patterns):
            production_changes['config'].append(file_path)
        elif file_path.startswith('production/'):
            production_changes['other'].append(file_path)
    
    return production_changes


def preserve_changes(changes: Dict[str, List[str]], 
                    production_changes: Dict[str, List[str]],
                    auto_commit: bool = False) -> bool:
    """Preserve production changes by committing them"""
    
    total_changes = (len(changes['modified']) + len(changes['added']) + 
                    len(changes['deleted']) + len(changes['untracked']))
    
    if total_changes == 0:
        print("✅ No uncommitted changes found")
        return True
    
    print(f"📋 Found {total_changes} uncommitted changes:")
    print(f"   - Modified: {len(changes['modified'])}")
    print(f"   - Added: {len(changes['added'])}")
    print(f"   - Deleted: {len(changes['deleted'])}")
    print(f"   - Untracked: {len(changes['untracked'])}")
    print()
    
    # Show production-specific changes
    if production_changes['config']:
        print("🔍 Production config changes (must be preserved):")
        for file_path in production_changes['config']:
            print(f"   - {file_path}")
        print()
    
    if production_changes['other']:
        print("🔍 Other production changes:")
        for file_path in production_changes['other'][:10]:  # Show first 10
            print(f"   - {file_path}")
        if len(production_changes['other']) > 10:
            print(f"   ... and {len(production_changes['other']) - 10} more")
        print()
    
    # Ask for confirmation (unless auto_commit)
    if not auto_commit:
        response = input("❓ Commit these changes? (y/n): ")
        if response.lower() != 'y':
            print("❌ Changes not committed")
            return False
    
    # Commit changes
    try:
        # Add all production changes
        files_to_add = production_changes['config'] + production_changes['other']
        
        if not files_to_add:
            print("⚠️  No production-specific changes to commit")
            return True
        
        # Stage files
        subprocess.run(
            ['git', 'add'] + files_to_add,
            cwd=PROJECT_ROOT,
            check=True
        )
        
        # Create commit message
        timestamp = datetime.now().strftime('%Y-%m-%d')
        commit_message = f"chore: Preserve production changes {timestamp}\n\n"
        
        if production_changes['config']:
            commit_message += "Config changes:\n"
            for file_path in production_changes['config']:
                commit_message += f"- {file_path}\n"
            commit_message += "\n"
        
        if production_changes['other']:
            commit_message += f"Other changes: {len(production_changes['other'])} files\n"
        
        # Commit
        subprocess.run(
            ['git', 'commit', '-m', commit_message],
            cwd=PROJECT_ROOT,
            check=True
        )
        
        print("✅ Changes committed successfully")
        
        # Ask about push
        if not auto_commit:
            response = input("❓ Push to remote? (y/n): ")
            if response.lower() == 'y':
                subprocess.run(
                    ['git', 'push', 'origin', 'production'],
                    cwd=PROJECT_ROOT,
                    check=True
                )
                print("✅ Changes pushed to remote")
        else:
            # Auto-push if auto_commit
            subprocess.run(
                ['git', 'push', 'origin', 'production'],
                cwd=PROJECT_ROOT,
                check=True
            )
            print("✅ Changes pushed to remote")
        
        return True
        
    except subprocess.CalledProcessError as e:
        print(f"❌ Error committing changes: {e}")
        return False


def main():
    """Main function"""
    print("=" * 70)
    print("TikTrack Production - Preserve Changes")
    print("=" * 70)
    print()
    
    # Check current branch
    try:
        result = subprocess.run(
            ['git', 'rev-parse', '--abbrev-ref', 'HEAD'],
            cwd=PROJECT_ROOT,
            capture_output=True,
            text=True,
            check=True
        )
        current_branch = result.stdout.strip()
        
        if current_branch != 'production':
            print(f"⚠️  Current branch is '{current_branch}', not 'production'")
            print("   This script should be run in production branch")
            response = input("   Continue anyway? (y/n): ")
            if response.lower() != 'y':
                return False
    except subprocess.CalledProcessError:
        print("⚠️  Could not determine current branch")
    
    # Get git status
    print("📋 Checking git status...")
    changes = get_git_status()
    
    # Identify production changes
    production_changes = identify_production_changes(changes)
    
    # Preserve changes
    success = preserve_changes(changes, production_changes, auto_commit=False)
    
    print()
    print("=" * 70)
    if success:
        print("✅ Production changes preserved successfully!")
    else:
        print("❌ Failed to preserve production changes")
    print("=" * 70)
    
    return success


if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)

