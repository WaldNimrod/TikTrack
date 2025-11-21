#!/usr/bin/env python3
"""
Step 05: Sync Code to Production
=================================

Syncs Backend and UI code to production directory.
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
    Sync code to production
    
    Returns:
        Dict with step results
    """
    logger = get_logger()
    reporter = get_reporter()
    
    logger.step_start("Sync Code to Production", 5)
    
    project_root = Path(__file__).parent.parent.parent.parent
    sync_backend_script = project_root / "scripts" / "production-update" / "lib" / "sync_to_production.py"
    sync_ui_script = project_root / "scripts" / "production-update" / "lib" / "sync_ui_to_production.py"
    
    # Fallback to original locations
    if not sync_backend_script.exists():
        sync_backend_script = project_root / "scripts" / "sync_to_production.py"
    if not sync_ui_script.exists():
        sync_ui_script = project_root / "scripts" / "sync_ui_to_production.py"
    
    if dry_run:
        logger.info("  [DRY RUN] Would sync Backend and UI code")
        return {'success': True, 'dry_run': True}
    
    try:
        import subprocess
        
        # Sync Backend
        if sync_backend_script.exists():
            logger.info("  🔄 Syncing Backend code...")
            result = subprocess.run(
                [sys.executable, str(sync_backend_script)],
                cwd=project_root,
                capture_output=True,
                text=True
            )
            
            if result.returncode == 0:
                logger.info("  ✅ Backend sync completed")
                # Parse copied files count
                for line in result.stdout.split('\n'):
                    if 'Copied:' in line and 'files' in line:
                        reporter.add_file_updated("production/Backend/*", {'action': 'sync', 'details': line})
            else:
                logger.error(f"  ❌ Backend sync failed: {result.stderr}")
                reporter.add_error(f"Backend sync failed: {result.stderr}", "sync_code")
                return {'success': False, 'error': 'Backend sync failed'}
        else:
            logger.error("  ❌ Backend sync script not found")
            return {'success': False, 'error': 'Backend sync script not found'}
        
        # Sync UI
        if sync_ui_script.exists():
            logger.info("  🔄 Syncing UI code...")
            result = subprocess.run(
                [sys.executable, str(sync_ui_script)],
                cwd=project_root,
                capture_output=True,
                text=True
            )
            
            if result.returncode == 0:
                logger.info("  ✅ UI sync completed")
                # Parse copied files count
                for line in result.stdout.split('\n'):
                    if 'copied' in line.lower() and 'files' in line.lower():
                        reporter.add_file_updated("production/trading-ui/*", {'action': 'sync', 'details': line})
            else:
                logger.warning(f"  ⚠️  UI sync had issues: {result.stderr}")
                reporter.add_warning(f"UI sync had issues: {result.stderr}", "sync_code")
        
        logger.info("  ✅ Code sync completed successfully")
        return {'success': True}
        
    except Exception as e:
        logger.error(f"  ❌ Error during sync: {e}")
        reporter.add_error(f"Code sync error: {e}", "sync_code")
        return {'success': False, 'error': str(e)}


if __name__ == '__main__':
    result = run_step()
    sys.exit(0 if result.get('success') else 1)

