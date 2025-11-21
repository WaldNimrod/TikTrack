#!/usr/bin/env python3
"""
Step 05: Sync Code to Production
=================================

Syncs Backend and UI code to production directory.
"""

import os
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
    
    # Resolve to absolute path to handle subprocess calls correctly
    project_root = Path(__file__).resolve().parent.parent.parent.parent
    # Always use the main scripts (not lib versions which may be outdated and don't support TIKTRACK_PROJECT_ROOT)
    sync_backend_script = project_root / "scripts" / "sync_to_production.py"
    sync_ui_script = project_root / "scripts" / "sync_ui_to_production.py"
    
    if dry_run:
        logger.info("  [DRY RUN] Would sync Backend and UI code")
        return {'success': True, 'dry_run': True}
    
    try:
        import subprocess
        
        # Sync Backend
        if sync_backend_script.exists():
            logger.info("  🔄 Syncing Backend code...")
            # Pass project root via environment variable to ensure correct path resolution
            env = os.environ.copy()
            project_root_str = str(project_root.resolve())
            env['TIKTRACK_PROJECT_ROOT'] = project_root_str
            
            # Enhanced debug: verify env var is set with full details
            logger.info(f"  🔍 Setting TIKTRACK_PROJECT_ROOT={project_root_str}")
            logger.info(f"  🔍 CWD will be: {project_root_str}")
            logger.info(f"  🔍 Env dict has TIKTRACK_PROJECT_ROOT: {'TIKTRACK_PROJECT_ROOT' in env}")
            logger.info(f"  🔍 Env value: {env.get('TIKTRACK_PROJECT_ROOT', 'NOT SET')}")
            logger.info(f"  🔍 Env value type: {type(env.get('TIKTRACK_PROJECT_ROOT', 'NOT SET'))}")
            logger.info(f"  🔍 Env value length: {len(env.get('TIKTRACK_PROJECT_ROOT', ''))}")
            logger.info(f"  🔍 Sync script path: {sync_backend_script}")
            logger.info(f"  🔍 Sync script exists: {sync_backend_script.exists()}")
            logger.info(f"  🔍 Python executable: {sys.executable}")
            logger.info(f"  🔍 Full command: {[sys.executable, str(sync_backend_script)]}")
            
            # Log all TIKTRACK vars in env
            tiktrack_vars = {k: v for k, v in env.items() if 'TIKTRACK' in k}
            logger.info(f"  🔍 All TIKTRACK vars in env: {tiktrack_vars}")
            
            result = subprocess.run(
                [sys.executable, str(sync_backend_script)],
                cwd=project_root_str,
                env=env,
                capture_output=True,
                text=True
            )
            # Debug: check what the subprocess actually received
            logger.info(f"  🔍 Subprocess return code: {result.returncode}")
            if result.stdout:
                logger.info(f"  🔍 Subprocess stdout (first 200 chars): {result.stdout[:200]}")
            
            if result.returncode == 0:
                logger.info("  ✅ Backend sync completed")
                # Parse copied files count
                for line in result.stdout.split('\n'):
                    if 'Copied:' in line and 'files' in line:
                        reporter.add_file_updated("production/Backend/*", {'action': 'sync', 'details': line})
            else:
                error_msg = result.stderr.strip() if result.stderr.strip() else result.stdout.strip()
                logger.error(f"  ❌ Backend sync failed: {error_msg}")
                logger.error(f"  Return code: {result.returncode}")
                # Print full output for debugging
                if result.stdout:
                    # Print first 5000 chars to see all debug output including DEBUG lines
                    logger.error(f"  Full stdout (first 5000 chars):\n{result.stdout[:5000]}")
                if result.stderr:
                    logger.error(f"  Full stderr (first 1000 chars):\n{result.stderr[:1000]}")
                reporter.add_error(f"Backend sync failed: {error_msg}", "sync_code")
                return {'success': False, 'error': error_msg or 'Backend sync failed'}
        else:
            logger.error("  ❌ Backend sync script not found")
            return {'success': False, 'error': 'Backend sync script not found'}
        
        # Sync UI
        if sync_ui_script.exists():
            logger.info("  🔄 Syncing UI code...")
            # Pass project root via environment variable
            env = os.environ.copy()
            env['TIKTRACK_PROJECT_ROOT'] = str(project_root.resolve())
            result = subprocess.run(
                [sys.executable, str(sync_ui_script)],
                cwd=str(project_root.resolve()),
                env=env,
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

