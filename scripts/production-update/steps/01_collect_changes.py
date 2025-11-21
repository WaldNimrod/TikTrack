#!/usr/bin/env python3
"""
Step 01: Collect Changes from Main
===================================

Fetches and logs changes from main branch for review.
"""

import subprocess
import sys
from datetime import datetime
from pathlib import Path
from typing import Dict, Any

# Add parent directory to path for imports
project_root = Path(__file__).parent.parent.parent.parent
sys.path.insert(0, str(project_root))
sys.path.insert(0, str(project_root / "scripts" / "production-update" / "utils"))

from logger import get_logger
from reporter import get_reporter


def run_step(dry_run: bool = False) -> Dict[str, Any]:
    """
    Collect changes from main branch
    
    Returns:
        Dict with step results
    """
    logger = get_logger()
    reporter = get_reporter()
    
    logger.step_start("Collect Changes from Main", 1)
    
    if dry_run:
        logger.info("  [DRY RUN] Would fetch and log changes from main")
        return {'success': True, 'dry_run': True}
    
    project_root = Path(__file__).parent.parent.parent.parent
    output_file = project_root / "_Tmp" / f"release_notes_main_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log"
    output_file.parent.mkdir(parents=True, exist_ok=True)
    
    try:
        # Fetch from origin
        logger.info("  📥 Fetching changes from origin/main...")
        result = subprocess.run(
            ['git', 'fetch', 'origin', 'main'],
            cwd=project_root,
            capture_output=True,
            text=True,
            check=True
        )
        
        # Get commit log
        logger.info("  📋 Collecting commit log...")
        result = subprocess.run(
            ['git', 'log', 'origin/main', '-15', '--oneline'],
            cwd=project_root,
            capture_output=True,
            text=True,
            check=True
        )
        
        commits = result.stdout.strip().split('\n')
        
        # Save to file
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(f"Changes from main branch - {datetime.now().isoformat()}\n")
            f.write("=" * 70 + "\n\n")
            for commit in commits:
                f.write(f"{commit}\n")
        
        logger.info(f"  ✅ Collected {len(commits)} commits")
        logger.info(f"  📄 Saved to: {output_file}")
        
        reporter.add_file_new(str(output_file), {'type': 'release_notes', 'commits_count': len(commits)})
        
        return {
            'success': True,
            'commits_count': len(commits),
            'output_file': str(output_file),
            'commits': commits[:5]  # First 5 for summary
        }
        
    except subprocess.CalledProcessError as e:
        logger.error(f"  ❌ Error collecting changes: {e}")
        reporter.add_error(f"Failed to collect changes: {e}", "collect_changes")
        return {'success': False, 'error': str(e)}
    except Exception as e:
        logger.error(f"  ❌ Unexpected error: {e}")
        reporter.add_error(f"Unexpected error in collect_changes: {e}", "collect_changes")
        return {'success': False, 'error': str(e)}


if __name__ == '__main__':
    result = run_step()
    sys.exit(0 if result.get('success') else 1)

