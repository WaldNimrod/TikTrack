#!/usr/bin/env python3
"""
Step 08: File Verification
==========================

Verifies that all files are properly synchronized.
"""

import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent))

# Import utils
sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent / "scripts" / "production-update" / "utils"))
from logger import get_logger
from reporter import get_reporter
from file_verifier import verify_files


def run_step(dry_run: bool = False) -> dict:
    """
    Verify file synchronization
    
    Returns:
        Dict with step results
    """
    logger = get_logger()
    reporter = get_reporter()
    
    logger.step_start("File Verification", 8)
    
    project_root = Path(__file__).parent.parent.parent.parent
    
    if dry_run:
        logger.info("  [DRY RUN] Would verify file synchronization")
        return {'success': True, 'dry_run': True}
    
    try:
        logger.info("  🔍 Verifying file synchronization...")
        
        results = verify_files(project_root=project_root)
        
        # Check results
        all_ok = results.get('all_ok', False)
        
        backend = results.get('backend', {})
        ui = results.get('ui', {})
        critical = results.get('critical', {})
        
        # Report summary
        if all_ok:
            logger.info("  ✅ All files verified and synchronized")
        else:
            issues = []
            
            if backend.get('total_different', 0) > 0:
                issues.append(f"{backend['total_different']} Backend files differ")
                # Show first few different files
                different_files = backend.get('different_files', [])
                if different_files:
                    for diff_file in different_files[:5]:
                        logger.warning(f"    - {diff_file.get('path', 'unknown')} differs")
            if backend.get('total_missing', 0) > 0:
                issues.append(f"{backend['total_missing']} Backend files missing")
                # Show first few missing files
                missing_files = backend.get('missing_files', [])
                if missing_files:
                    for missing_file in missing_files[:5]:
                        logger.warning(f"    - {missing_file} missing")
            
            if ui.get('total_different', 0) > 0:
                issues.append(f"{ui['total_different']} UI files differ")
                # Show first few different files
                different_files = ui.get('different_files', [])
                if different_files:
                    for diff_file in different_files[:5]:
                        logger.warning(f"    - {diff_file.get('path', 'unknown')} differs")
            if ui.get('total_missing', 0) > 0:
                issues.append(f"{ui['total_missing']} UI files missing")
                # Show first few missing files
                missing_files = ui.get('missing_files', [])
                if missing_files:
                    for missing_file in missing_files[:5]:
                        logger.warning(f"    - {missing_file} missing")
            
            if critical.get('issues'):
                issues.append(f"{len(critical['issues'])} critical file issues")
                for issue in critical['issues']:
                    logger.error(f"    ❌ {issue}")
            
            if issues:
                logger.warning(f"  ⚠️  File verification found issues: {', '.join(issues)}")
                reporter.add_warning(f"File verification issues: {', '.join(issues)}", "file_verification")
            else:
                logger.info("  ✅ All files verified")
        
        return {
            'success': True,  # Always return success - warnings are reported separately
            'all_ok': all_ok,
            'results': results
        }
        
    except Exception as e:
        logger.error(f"  ❌ Error during file verification: {e}")
        reporter.add_error(f"File verification error: {e}", "file_verification")
        return {'success': False, 'error': str(e)}


if __name__ == '__main__':
    result = run_step()
    sys.exit(0 if result.get('success') else 1)


