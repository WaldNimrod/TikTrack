#!/usr/bin/env python3
"""
Step 02: Merge Main to Production
==================================

Merges main branch into production branch with automatic conflict resolution.
"""

import subprocess
import sys
from pathlib import Path

# Add parent directory to path for imports
project_root = Path(__file__).parent.parent.parent.parent
sys.path.insert(0, str(project_root))
sys.path.insert(0, str(project_root / "scripts" / "production-update" / "utils"))

from logger import get_logger
from reporter import get_reporter
from conflict_resolver import ConflictResolver


def run_step(dry_run: bool = False) -> dict:
    """
    Merge main branch into production
    
    Returns:
        Dict with step results
    """
    logger = get_logger()
    reporter = get_reporter()
    
    logger.step_start("Merge Main to Production", 2)
    
    project_root = Path(__file__).parent.parent.parent.parent
    
    if dry_run:
        logger.info("  [DRY RUN] Would merge main into production")
        return {'success': True, 'dry_run': True}
    
    try:
        # Check current branch
        result = subprocess.run(
            ['git', 'rev-parse', '--abbrev-ref', 'HEAD'],
            cwd=project_root,
            capture_output=True,
            text=True,
            check=True
        )
        current_branch = result.stdout.strip()
        
        if current_branch != 'production':
            logger.warning(f"  ⚠️  Current branch is '{current_branch}', not 'production'")
            logger.info("  🔄 Switching to production branch...")
            subprocess.run(
                ['git', 'checkout', 'production'],
                cwd=project_root,
                check=True
            )
        
        # Pull latest production
        logger.info("  📥 Pulling latest production branch...")
        subprocess.run(
            ['git', 'pull', 'origin', 'production'],
            cwd=project_root,
            check=True
        )
        
        # Update main
        logger.info("  📥 Updating main branch...")
        subprocess.run(
            ['git', 'fetch', 'origin', 'main'],
            cwd=project_root,
            check=True
        )
        
        # Merge main into production
        logger.info("  🔀 Merging main into production...")
        try:
            subprocess.run(
                ['git', 'merge', 'origin/main', '--no-edit'],
                cwd=project_root,
                check=True
            )
            logger.info("  ✅ Merge completed without conflicts")
            conflicts_resolved = 0
            conflicts_unresolved = 0
        except subprocess.CalledProcessError:
            # Conflicts detected - resolve automatically
            logger.warning("  ⚠️  Merge conflicts detected, attempting automatic resolution...")
            resolver = ConflictResolver(project_root)
            conflicts_resolved, conflicts_unresolved = resolver.resolve_all()
            
            if conflicts_unresolved > 0:
                logger.error(f"  ❌ {conflicts_unresolved} conflicts require manual resolution")
                manual_files = resolver.requires_manual_resolution()
                for file in manual_files:
                    logger.error(f"    - {file}")
                return {
                    'success': False,
                    'conflicts_resolved': conflicts_resolved,
                    'conflicts_unresolved': conflicts_unresolved,
                    'manual_resolution_required': manual_files
                }
        
        logger.info(f"  ✅ Merge completed: {conflicts_resolved} conflicts resolved automatically")
        
        return {
            'success': True,
            'conflicts_resolved': conflicts_resolved,
            'conflicts_unresolved': conflicts_unresolved
        }
        
    except subprocess.CalledProcessError as e:
        logger.error(f"  ❌ Error during merge: {e}")
        reporter.add_error(f"Merge failed: {e}", "merge_main")
        return {'success': False, 'error': str(e)}
    except Exception as e:
        logger.error(f"  ❌ Unexpected error: {e}")
        reporter.add_error(f"Unexpected error in merge: {e}", "merge_main")
        return {'success': False, 'error': str(e)}


if __name__ == '__main__':
    result = run_step()
    sys.exit(0 if result.get('success') else 1)
