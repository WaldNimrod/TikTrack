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
    # Use original scripts location (they handle paths correctly)
    sync_backend_script = project_root / "scripts" / "sync_to_production.py"
    sync_ui_script = project_root / "scripts" / "sync_ui_to_production.py"
    
    # Fallback to lib location if original doesn't exist
    if not sync_backend_script.exists():
        sync_backend_script = project_root / "scripts" / "production-update" / "lib" / "sync_to_production.py"
    if not sync_ui_script.exists():
        sync_ui_script = project_root / "scripts" / "production-update" / "lib" / "sync_ui_to_production.py"
    
    if dry_run:
        logger.info("  [DRY RUN] Would sync Backend and UI code")
        return {'success': True, 'dry_run': True}
    
    try:
        import subprocess
        
        # Sync Backend
        if sync_backend_script.exists():
            logger.info("  🔄 Syncing Backend code...")
            # Ensure we run from project root
            result = subprocess.run(
                [sys.executable, str(sync_backend_script)],
                cwd=str(project_root),
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
                error_msg = result.stderr.strip() if result.stderr.strip() else result.stdout.strip()
                logger.error(f"  ❌ Backend sync failed: {error_msg}")
                reporter.add_error(f"Backend sync failed: {error_msg}", "sync_code")
                return {'success': False, 'error': error_msg or 'Backend sync failed'}
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
                        logger.info(f"    {line.strip()}")
                        reporter.add_file_updated("production/trading-ui/*", {'action': 'sync', 'details': line})
                    if 'CSS files:' in line or 'JS files:' in line or 'HTML files:' in line:
                        logger.info(f"    {line.strip()}")
                    if 'MISSING:' in line:
                        logger.warning(f"    ⚠️  {line.strip()}")
                # Show output for debugging
                if result.stdout:
                    for line in result.stdout.split('\n'):
                        if 'Successfully copied' in line or 'verified' in line.lower() or 'restored' in line.lower() or 'critical files' in line.lower():
                            logger.info(f"    {line.strip()}")
            else:
                error_msg = result.stderr.strip() if result.stderr.strip() else result.stdout.strip()
                logger.error(f"  ❌ UI sync failed: {error_msg}")
                reporter.add_error(f"UI sync failed: {error_msg}", "sync_code")
                return {'success': False, 'error': 'UI sync failed'}
        
        # Run post-sync transformations
        logger.info("  🔄 Running post-sync transformations...")
        try:
            sys.path.insert(0, str(project_root / "scripts" / "production-update" / "utils"))
            from post_sync_transformer import run_transformations
            
            transform_results = run_transformations(
                project_root=project_root,
                backup_db=True,
                restore_db=True
            )
            
            transform_success = all(transform_results.values())
            
            if transform_success:
                logger.info("  ✅ Post-sync transformations completed")
            else:
                failed = [k for k, v in transform_results.items() if not v]
                logger.warning(f"  ⚠️  Some post-sync transformations had issues: {', '.join(failed)}")
                reporter.add_warning(f"Some post-sync transformations had issues: {', '.join(failed)}", "sync_code")
        except Exception as e:
            logger.error(f"  ❌ Post-sync transformations failed: {e}")
            reporter.add_error(f"Post-sync transformations failed: {e}", "sync_code")
            return {'success': False, 'error': f'Post-sync transformations failed: {e}'}
        
        # Verify sync completion
        logger.info("  🔍 Verifying sync completion...")
        try:
            sys.path.insert(0, str(project_root / "scripts" / "production-update" / "utils"))
            from sync_verifier import SyncVerifier
            
            verifier = SyncVerifier(project_root)
            verify_success = verifier.verify_sync_complete()
            
            if not verify_success:
                logger.warning("  ⚠️  Sync verification found issues - some files may not be up to date")
                reporter.add_warning("Sync verification found issues", "sync_code")
        except Exception as e:
            logger.warning(f"  ⚠️  Could not verify sync: {e}")
        
        logger.info("  ✅ Code sync completed successfully")
        return {'success': True}
        
    except Exception as e:
        logger.error(f"  ❌ Error during sync: {e}")
        reporter.add_error(f"Code sync error: {e}", "sync_code")
        return {'success': False, 'error': str(e)}


if __name__ == '__main__':
    result = run_step()
    sys.exit(0 if result.get('success') else 1)

