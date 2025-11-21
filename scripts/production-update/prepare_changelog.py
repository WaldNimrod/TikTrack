#!/usr/bin/env python3
"""
Prepare Changelog for Production Sync
=====================================

Creates a changelog of changes before syncing to production.
Identifies critical changes (config, DB schema) and creates a changelog.

Purpose: Document changes before production sync
Location: scripts/production-update/prepare_changelog.py
"""

import subprocess
import sys
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Set

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


def get_recent_commits(count: int = 10) -> List[str]:
    """Get recent commit messages"""
    try:
        result = subprocess.run(
            ['git', 'log', f'-{count}', '--oneline', '--no-decorate'],
            cwd=PROJECT_ROOT,
            capture_output=True,
            text=True,
            check=True
        )
        
        return [line.strip() for line in result.stdout.strip().split('\n') if line.strip()]
    except subprocess.CalledProcessError as e:
        print(f"❌ Error getting commits: {e}")
        return []


def identify_critical_changes(changes: Dict[str, List[str]]) -> Dict[str, List[str]]:
    """Identify critical changes (config, DB schema, etc.)"""
    critical = {
        'config': [],
        'db_schema': [],
        'server': [],
        'other': []
    }
    
    critical_patterns = {
        'config': ['config/', 'settings.py', 'logging.py', 'database.py'],
        'db_schema': ['models/', 'migrations/', 'schema'],
        'server': ['app.py', 'routes/', 'services/']
    }
    
    all_changes = changes['modified'] + changes['added'] + changes['deleted']
    
    for file_path in all_changes:
        categorized = False
        for category, patterns in critical_patterns.items():
            if any(pattern in file_path for pattern in patterns):
                critical[category].append(file_path)
                categorized = True
                break
        
        if not categorized:
            critical['other'].append(file_path)
    
    return critical


def create_changelog(changes: Dict[str, List[str]], 
                    critical: Dict[str, List[str]],
                    commits: List[str]) -> str:
    """Create changelog content"""
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    
    changelog = f"""# Production Sync Changelog

**Generated:** {timestamp}
**Branch:** {subprocess.run(['git', 'rev-parse', '--abbrev-ref', 'HEAD'], 
                          cwd=PROJECT_ROOT, capture_output=True, text=True).stdout.strip()}

## Summary

- **Modified:** {len(changes['modified'])} files
- **Added:** {len(changes['added'])} files
- **Deleted:** {len(changes['deleted'])} files
- **Untracked:** {len(changes['untracked'])} files

## Critical Changes

### Config Changes
"""
    
    if critical['config']:
        for file_path in critical['config']:
            changelog += f"- `{file_path}`\n"
    else:
        changelog += "- No config changes\n"
    
    changelog += "\n### DB Schema Changes\n"
    if critical['db_schema']:
        for file_path in critical['db_schema']:
            changelog += f"- `{file_path}`\n"
    else:
        changelog += "- No DB schema changes\n"
    
    changelog += "\n### Server Changes\n"
    if critical['server']:
        for file_path in critical['server'][:10]:  # Limit to first 10
            changelog += f"- `{file_path}`\n"
        if len(critical['server']) > 10:
            changelog += f"- ... and {len(critical['server']) - 10} more\n"
    else:
        changelog += "- No server changes\n"
    
    changelog += "\n## Recent Commits\n\n"
    for commit in commits[:10]:
        changelog += f"- {commit}\n"
    
    changelog += "\n## All Changes\n\n"
    changelog += "### Modified Files\n"
    for file_path in changes['modified'][:20]:  # Limit to first 20
        changelog += f"- `{file_path}`\n"
    if len(changes['modified']) > 20:
        changelog += f"- ... and {len(changes['modified']) - 20} more\n"
    
    if changes['added']:
        changelog += "\n### Added Files\n"
        for file_path in changes['added'][:20]:
            changelog += f"- `{file_path}`\n"
        if len(changes['added']) > 20:
            changelog += f"- ... and {len(changes['added']) - 20} more\n"
    
    if changes['deleted']:
        changelog += "\n### Deleted Files\n"
        for file_path in changes['deleted']:
            changelog += f"- `{file_path}`\n"
    
    return changelog


def main():
    """Main function"""
    print("=" * 70)
    print("TikTrack Production Sync - Changelog Preparation")
    print("=" * 70)
    print()
    
    # Check git status
    print("📋 Checking git status...")
    changes = get_git_status()
    
    total_changes = (len(changes['modified']) + len(changes['added']) + 
                    len(changes['deleted']) + len(changes['untracked']))
    
    if total_changes == 0:
        print("✅ No uncommitted changes found")
        print("   All changes are already committed")
    else:
        print(f"⚠️  Found {total_changes} uncommitted changes:")
        print(f"   - Modified: {len(changes['modified'])}")
        print(f"   - Added: {len(changes['added'])}")
        print(f"   - Deleted: {len(changes['deleted'])}")
        print(f"   - Untracked: {len(changes['untracked'])}")
        print()
        print("   ⚠️  Please commit all changes before syncing to production!")
    
    # Get recent commits
    print()
    print("📋 Getting recent commits...")
    commits = get_recent_commits(15)
    print(f"   Found {len(commits)} recent commits")
    
    # Identify critical changes
    print()
    print("🔍 Identifying critical changes...")
    critical = identify_critical_changes(changes)
    
    print(f"   - Config changes: {len(critical['config'])}")
    print(f"   - DB schema changes: {len(critical['db_schema'])}")
    print(f"   - Server changes: {len(critical['server'])}")
    
    # Create changelog
    print()
    print("📝 Creating changelog...")
    changelog = create_changelog(changes, critical, commits)
    
    # Save changelog
    output_dir = PROJECT_ROOT / "_Tmp"
    output_dir.mkdir(parents=True, exist_ok=True)
    
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    output_file = output_dir / f"production_sync_changelog_{timestamp}.md"
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(changelog)
    
    print(f"✅ Changelog saved to: {output_file}")
    print()
    print("=" * 70)
    print("✅ Changelog preparation completed!")
    print("=" * 70)
    
    return True


if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)

