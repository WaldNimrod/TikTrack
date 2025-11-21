#!/usr/bin/env python3
"""
Document Server Changes
========================

Documents changes to server configuration files (settings.py, logging.py, etc.)
and creates a changelog for production server updates.

Purpose: Track server configuration changes for production environment
Location: scripts/production-update/document_server_changes.py
"""

import subprocess
import sys
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional

# Add project root to path
PROJECT_ROOT = Path(__file__).parent.parent.parent
sys.path.insert(0, str(PROJECT_ROOT))


def get_file_diff(file_path: Path, base_ref: str = 'HEAD~1') -> Optional[str]:
    """Get diff for a specific file"""
    try:
        result = subprocess.run(
            ['git', 'diff', base_ref, 'HEAD', '--', str(file_path)],
            cwd=PROJECT_ROOT,
            capture_output=True,
            text=True,
            check=False
        )
        
        if result.returncode == 0 and result.stdout.strip():
            return result.stdout.strip()
        return None
    except Exception as e:
        print(f"  ⚠️  Error getting diff for {file_path}: {e}")
        return None


def analyze_config_changes(config_file: Path) -> Dict[str, any]:
    """Analyze changes in config file"""
    changes = {
        'file': str(config_file.relative_to(PROJECT_ROOT)),
        'exists': config_file.exists(),
        'has_changes': False,
        'diff': None,
        'key_changes': []
    }
    
    if not config_file.exists():
        return changes
    
    # Get diff
    diff = get_file_diff(config_file)
    if diff:
        changes['has_changes'] = True
        changes['diff'] = diff
        
        # Identify key configuration changes
        key_patterns = [
            'ENVIRONMENT',
            'IS_PRODUCTION',
            'PORT',
            'DB_PATH',
            'DEVELOPMENT_MODE',
            'CACHE_DISABLED',
            'LOG_LEVEL',
            'DEBUG'
        ]
        
        for pattern in key_patterns:
            if f'+{pattern}' in diff or f'-{pattern}' in diff:
                changes['key_changes'].append(pattern)
    
    return changes


def document_server_changes() -> str:
    """Document all server configuration changes"""
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    
    # Check production config files
    production_config = PROJECT_ROOT / "production" / "Backend" / "config"
    dev_config = PROJECT_ROOT / "Backend" / "config"
    
    config_files = {
        'settings.py': [
            production_config / "settings.py",
            dev_config / "settings.py"
        ],
        'logging.py': [
            production_config / "logging.py",
            dev_config / "logging.py"
        ],
        'database.py': [
            production_config / "database.py",
            dev_config / "database.py"
        ]
    }
    
    documentation = f"""# Server Configuration Changes

**Generated:** {timestamp}
**Purpose:** Document server configuration changes for production environment

## Configuration Files Analysis

"""
    
    all_changes = []
    
    for config_name, paths in config_files.items():
        prod_path, dev_path = paths
        
        documentation += f"### {config_name}\n\n"
        
        # Check production file
        prod_changes = analyze_config_changes(prod_path)
        if prod_changes['has_changes']:
            documentation += f"**Production file:** `{prod_changes['file']}`\n"
            documentation += f"- **Has changes:** ✅ Yes\n"
            if prod_changes['key_changes']:
                documentation += f"- **Key changes:** {', '.join(prod_changes['key_changes'])}\n"
            documentation += "\n"
            all_changes.append(prod_changes)
        elif prod_path.exists():
            documentation += f"**Production file:** `{prod_changes['file']}`\n"
            documentation += f"- **Has changes:** ❌ No\n\n"
        
        # Check dev file
        dev_changes = analyze_config_changes(dev_path)
        if dev_changes['has_changes']:
            documentation += f"**Development file:** `{dev_changes['file']}`\n"
            documentation += f"- **Has changes:** ✅ Yes\n"
            if dev_changes['key_changes']:
                documentation += f"- **Key changes:** {', '.join(dev_changes['key_changes'])}\n"
            documentation += "\n"
            all_changes.append(dev_changes)
        elif dev_path.exists():
            documentation += f"**Development file:** `{dev_changes['file']}`\n"
            documentation += f"- **Has changes:** ❌ No\n\n"
        
        documentation += "\n"
    
    # Summary
    documentation += "## Summary\n\n"
    if all_changes:
        documentation += f"**Total files with changes:** {len(all_changes)}\n\n"
        for change in all_changes:
            documentation += f"- `{change['file']}`: {len(change['key_changes'])} key changes\n"
    else:
        documentation += "**No configuration changes detected.**\n"
    
    documentation += "\n## Important Notes\n\n"
    documentation += "- Production config files should always have `IS_PRODUCTION = True`\n"
    documentation += "- Production port should be `5001`\n"
    documentation += "- Development mode should be `False` in production\n"
    documentation += "- All changes to production config should be documented here\n"
    
    return documentation


def main():
    """Main function"""
    print("=" * 70)
    print("TikTrack Production - Document Server Changes")
    print("=" * 70)
    print()
    
    print("📋 Analyzing server configuration changes...")
    documentation = document_server_changes()
    
    # Save to documentation
    doc_dir = PROJECT_ROOT / "documentation" / "production"
    doc_dir.mkdir(parents=True, exist_ok=True)
    
    output_file = doc_dir / "SERVER_CHANGES.md"
    
    # Append to existing file or create new
    if output_file.exists():
        # Read existing content
        with open(output_file, 'r', encoding='utf-8') as f:
            existing = f.read()
        
        # Append new section
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(existing)
            f.write("\n\n---\n\n")
            f.write(documentation)
        
        print(f"✅ Documentation appended to: {output_file}")
    else:
        # Create new file
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(documentation)
        
        print(f"✅ Documentation created at: {output_file}")
    
    print()
    print("=" * 70)
    print("✅ Server changes documentation completed!")
    print("=" * 70)
    
    return True


if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)

