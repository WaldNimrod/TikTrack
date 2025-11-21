#!/usr/bin/env python3
"""
Step 07: Schema & Data Sync
============================

Synchronizes schema and data between development and production.
"""

import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent))

# Import utils
sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent / "scripts" / "production-update" / "utils"))
from logger import get_logger
from reporter import get_reporter
from data_sync import sync_data


def run_step(dry_run: bool = False, groups_approved: bool = False) -> dict:
    """
    Sync schema and data
    
    Args:
        dry_run: If True, don't make changes
        groups_approved: Whether groups sync is approved
    
    Returns:
        Dict with step results
    """
    logger = get_logger()
    reporter = get_reporter()
    
    logger.step_start("Schema & Data Sync", 7)
    
    project_root = Path(__file__).parent.parent.parent.parent
    
    if dry_run:
        logger.info("  [DRY RUN] Would sync schema and data")
        return {'success': True, 'dry_run': True}
    
    try:
        logger.info("  🔄 Synchronizing schema and data...")
        
        # Check if groups approval is needed
        if not groups_approved:
            logger.warning("  ⚠️  Groups sync requires explicit approval (use --approve-groups)")
            logger.info("  ℹ️  Skipping groups sync - other data will be synced")
        
        results = sync_data(project_root=project_root, groups_approved=groups_approved)
        
        # Report results
        all_success = all(results.values())
        
        if results.get('schema'):
            logger.info("  ✅ Schema synced")
        else:
            logger.warning("  ⚠️  Schema sync had issues")
        
        if results.get('reference_data'):
            logger.info("  ✅ Reference data synced")
        else:
            logger.warning("  ⚠️  Reference data sync had issues")
        
        if results.get('preferences'):
            logger.info("  ✅ System preferences synced")
        else:
            logger.warning("  ⚠️  Preferences sync had issues")
        
        if results.get('groups'):
            logger.info("  ✅ Groups synced")
        elif not groups_approved:
            logger.info("  ℹ️  Groups sync skipped (requires approval)")
        else:
            logger.warning("  ⚠️  Groups sync had issues")
        
        if all_success:
            logger.info("  ✅ Schema and data sync completed")
        else:
            failed = [k for k, v in results.items() if not v]
            logger.warning(f"  ⚠️  Some sync operations failed: {', '.join(failed)}")
            reporter.add_warning(f"Some sync operations failed: {', '.join(failed)}", "schema_data_sync")
        
        return {
            'success': all_success,
            'results': results
        }
        
    except Exception as e:
        logger.error(f"  ❌ Error during schema/data sync: {e}")
        reporter.add_error(f"Schema/data sync error: {e}", "schema_data_sync")
        return {'success': False, 'error': str(e)}


if __name__ == '__main__':
    result = run_step()
    sys.exit(0 if result.get('success') else 1)


