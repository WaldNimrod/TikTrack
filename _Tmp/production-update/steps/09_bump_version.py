#!/usr/bin/env python3
"""
Step 09: Bump Version
=====================

Updates version number for production release.
"""

import sys
from datetime import datetime
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent))

# Import utils
sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent / "scripts" / "production-update" / "utils"))
from logger import get_logger
# Import utils
from reporter import get_reporter


def run_step(dry_run: bool = False, bump_type: str = "patch", note: str = None, 
              set_version: str = None, allow_major_minor: bool = False) -> dict:
    """
    Bump version number
    
    Args:
        dry_run: If True, don't actually bump version
        bump_type: Type of bump (patch, build) - ignored if set_version is provided
        note: Optional note for version bump
        set_version: Explicitly set version (e.g., "1.2.0.0") - requires allow_major_minor for Major.Minor changes
        allow_major_minor: Allow Major.Minor updates when using set_version
    
    Returns:
        Dict with step results
    """
    logger = get_logger()
    reporter = get_reporter()
    
    logger.step_start("Bump Version", 9)
    
    project_root = Path(__file__).parent.parent.parent.parent
    bump_script = project_root / "scripts" / "production-update" / "lib" / "bump_version.py"
    
    if not bump_script.exists():
        bump_script = project_root / "scripts" / "versioning" / "bump-version.py"
    
    if dry_run:
        if set_version:
            logger.info(f"  [DRY RUN] Would set version to {set_version}")
        else:
            logger.info(f"  [DRY RUN] Would bump version ({bump_type})")
        return {'success': True, 'dry_run': True}
    
    if not bump_script.exists():
        logger.error("  ❌ Version bump script not found")
        reporter.add_error("Version bump script not found", "bump_version")
        return {'success': False, 'error': 'Bump script not found'}
    
    try:
        import subprocess
        
        if note is None:
            note = f"Production update - {datetime.now().strftime('%Y-%m-%d')}"
        
        # Build command
        cmd = [
            sys.executable,
            str(bump_script),
            '--env', 'production',
            '--note', note
        ]
        
        if set_version:
            logger.info(f"  📌 Setting version to {set_version}...")
            cmd.extend(['--set-version', set_version])
            if allow_major_minor:
                cmd.append('--allow-major-minor')
                logger.info("  ⚠️  Major.Minor update allowed")
        else:
            logger.info(f"  📌 Bumping version ({bump_type})...")
            cmd.extend(['--bump', bump_type])
        
        result = subprocess.run(
            cmd,
            cwd=project_root,
            capture_output=True,
            text=True
        )
        
        if result.returncode == 0:
            # Parse new version from output
            new_version = None
            for line in result.stdout.split('\n'):
                if '->' in line:
                    # Extract version (format: [environment] old -> new (type))
                    parts = line.split('->')
                    if len(parts) > 1:
                        new_version = parts[1].strip().split()[0]
                        break
            
            logger.info(f"  ✅ Version updated successfully")
            if new_version:
                logger.info(f"    New version: {new_version}")
                reporter.add_file_updated("documentation/version-manifest.json", {'new_version': new_version})
            
            return {'success': True, 'new_version': new_version}
        else:
            logger.error(f"  ❌ Version bump failed: {result.stderr}")
            reporter.add_error(f"Version bump failed: {result.stderr}", "bump_version")
            return {'success': False, 'error': result.stderr}
            
    except Exception as e:
        logger.error(f"  ❌ Error during version bump: {e}")
        reporter.add_error(f"Version bump error: {e}", "bump_version")
        return {'success': False, 'error': str(e)}


if __name__ == '__main__':
    result = run_step()
    sys.exit(0 if result.get('success') else 1)

