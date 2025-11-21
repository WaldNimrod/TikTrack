#!/usr/bin/env python3
"""
Step 06: Cleanup Backup Files
==============================

Removes backup files from production environment.
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
    Cleanup backup files from production
    
    Returns:
        Dict with step results
    """
    logger = get_logger()
    reporter = get_reporter()
    
    logger.step_start("Cleanup Backup Files", 6)
    
    project_root = Path(__file__).parent.parent.parent.parent
    cleanup_script = project_root / "scripts" / "production-update" / "lib" / "cleanup_production_backups.sh"
    
    if not cleanup_script.exists():
        cleanup_script = project_root / "scripts" / "cleanup_production_backups.sh"
    
    if dry_run:
        logger.info("  [DRY RUN] Would cleanup backup files")
        return {'success': True, 'dry_run': True}
    
    production_dir = project_root / "production"
    if not production_dir.exists():
        logger.warning("  ⚠️  Production directory not found, skipping")
        return {'success': True, 'skipped': True}
    
    try:
        import subprocess
        
        if cleanup_script.exists():
            logger.info("  🗑️  Running backup cleanup script...")
            result = subprocess.run(
                ['bash', str(cleanup_script)],
                cwd=project_root,
                capture_output=True,
                text=True
            )
            
            if result.returncode == 0:
                # Parse removed count
                removed_count = 0
                for line in result.stdout.split('\n'):
                    if 'Removed:' in line or 'Removing:' in line:
                        removed_count += 1
                        # Extract file path
                        if 'Removing:' in line:
                            parts = line.split('Removing:')
                            if len(parts) > 1:
                                file_path = parts[1].strip()
                                reporter.add_file_deleted(file_path, "Backup file cleanup")
                
                logger.info(f"  ✅ Cleaned up {removed_count} backup files")
                return {'success': True, 'removed_count': removed_count}
            else:
                logger.warning(f"  ⚠️  Cleanup script returned non-zero: {result.returncode}")
                return {'success': True, 'warning': 'Cleanup had warnings'}
        else:
            # Manual cleanup
            logger.info("  🗑️  Cleaning up backup files manually...")
            removed_count = 0
            
            for pattern in ['*.backup', '*.bak', '*backup*', '*old*']:
                for file_path in production_dir.rglob(pattern):
                    if file_path.is_file():
                        if not dry_run:
                            file_path.unlink()
                        removed_count += 1
                        reporter.add_file_deleted(str(file_path.relative_to(project_root)), "Backup file cleanup")
            
            # Remove backup directories
            for dir_path in production_dir.rglob('*backup*'):
                if dir_path.is_dir():
                    if not dry_run:
                        import shutil
                        shutil.rmtree(dir_path)
                    removed_count += 1
                    reporter.add_file_deleted(str(dir_path.relative_to(project_root)), "Backup directory cleanup")
            
            logger.info(f"  ✅ Cleaned up {removed_count} backup items")
            return {'success': True, 'removed_count': removed_count}
            
    except Exception as e:
        logger.error(f"  ❌ Error during cleanup: {e}")
        reporter.add_error(f"Backup cleanup error: {e}", "cleanup_backups")
        return {'success': False, 'error': str(e)}


if __name__ == '__main__':
    result = run_step()
    sys.exit(0 if result.get('success') else 1)

