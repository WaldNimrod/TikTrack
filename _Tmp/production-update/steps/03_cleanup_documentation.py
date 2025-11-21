#!/usr/bin/env python3
"""
Step 03: Cleanup Documentation
===============================

Removes unwanted documentation files that came from merge.
"""

import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent))

# Import utils
sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent / "scripts" / "production-update" / "utils"))
from logger import get_logger
# Import utils
from reporter import get_reporter


def run_step(dry_run: bool = False) -> dict:
    """
    Cleanup unwanted documentation files
    
    Returns:
        Dict with step results
    """
    logger = get_logger()
    reporter = get_reporter()
    
    logger.step_start("Cleanup Documentation", 3)
    
    project_root = Path(__file__).parent.parent.parent.parent
    cleanup_script = project_root / "scripts" / "cleanup_documentation.py"
    
    if not cleanup_script.exists():
        # Use the one in lib if available
        cleanup_script = project_root / "scripts" / "production-update" / "lib" / "cleanup_documentation.py"
    
    if dry_run:
        logger.info("  [DRY RUN] Would cleanup documentation files")
        return {'success': True, 'dry_run': True}
    
    if not cleanup_script.exists():
        logger.warning("  ⚠️  Cleanup script not found, skipping")
        return {'success': True, 'skipped': True}
    
    try:
        import subprocess
        logger.info("  🧹 Running documentation cleanup...")
        result = subprocess.run(
            [sys.executable, str(cleanup_script)],
            cwd=project_root,
            capture_output=True,
            text=True
        )
        
        if result.returncode == 0:
            logger.info("  ✅ Documentation cleanup completed")
            # Parse output to count removed files
            output_lines = result.stdout.split('\n')
            removed_count = 0
            for line in output_lines:
                if 'Removed' in line and ('directories' in line or 'files' in line):
                    try:
                        # Extract number from line like "✅ Removed 5 directories"
                        parts = line.split()
                        for i, part in enumerate(parts):
                            if part.isdigit():
                                removed_count += int(part)
                                break
                    except:
                        pass
            
            reporter.add_file_deleted("documentation/*", f"Cleanup removed {removed_count} items")
            return {'success': True, 'removed_count': removed_count}
        else:
            logger.warning(f"  ⚠️  Cleanup script returned non-zero: {result.returncode}")
            logger.debug(result.stderr)
            return {'success': True, 'warning': 'Cleanup had warnings'}
            
    except Exception as e:
        logger.error(f"  ❌ Error during cleanup: {e}")
        reporter.add_error(f"Documentation cleanup failed: {e}", "cleanup_documentation")
        return {'success': False, 'error': str(e)}


if __name__ == '__main__':
    result = run_step()
    sys.exit(0 if result.get('success') else 1)

