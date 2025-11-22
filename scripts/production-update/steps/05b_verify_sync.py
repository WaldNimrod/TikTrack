#!/usr/bin/env python3
"""
Step 05b: Verify Sync Completion
=================================

Comprehensive verification that sync completed successfully.
Checks file counts, critical files, checksums, and directory structure.

This step is mandatory and will stop the process if critical issues are found.
"""

import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent))

# Import utils
sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent / "scripts" / "production-update" / "utils"))
from logger import get_logger
from reporter import get_reporter
from sync_verification import (
    verify_file_count,
    verify_critical_files,
    verify_file_content,
    verify_directory_structure,
    generate_sync_report
)


def run_step(dry_run: bool = False) -> dict:
    """
    Verify sync completion
    
    Args:
        dry_run: If True, don't actually run verification
    
    Returns:
        Dict with step results
    """
    logger = get_logger()
    reporter = get_reporter()
    
    logger.step_start("Verify Sync Completion", 5.5)
    
    project_root = Path(__file__).parent.parent.parent.parent
    source_backend = project_root / "Backend"
    target_backend = project_root / "production" / "Backend"
    
    if dry_run:
        logger.info("  [DRY RUN] Would verify sync completion")
        return {'success': True, 'dry_run': True}
    
    if not source_backend.exists():
        logger.error(f"  ❌ Source directory not found: {source_backend}")
        reporter.add_error(f"Source directory not found: {source_backend}", "verify_sync")
        return {'success': False, 'error': 'Source directory not found'}
    
    if not target_backend.exists():
        logger.error(f"  ❌ Target directory not found: {target_backend}")
        reporter.add_error(f"Target directory not found: {target_backend}", "verify_sync")
        return {'success': False, 'error': 'Target directory not found'}
    
    try:
        # Generate comprehensive report
        logger.info("  🔍 Running comprehensive sync verification...")
        report = generate_sync_report(source_backend, target_backend)
        
        # Check each verification
        all_passed = True
        critical_issues = []
        warnings = []
        
        # 1. File count verification
        file_count_result = report['verifications'].get('file_count', {})
        if file_count_result.get('success', False):
            details = file_count_result.get('details', {})
            logger.info(f"  ✅ File count: {details.get('source_count', 0)} files (matched)")
        else:
            details = file_count_result.get('details', {})
            diff = details.get('difference', 0)
            logger.warning(f"  ⚠️  File count mismatch: {diff} files difference")
            warnings.append(f"File count mismatch: {diff} files")
            all_passed = False
        
        # 2. Critical files verification
        critical_files_result = report['verifications'].get('critical_files', {})
        if critical_files_result.get('success', False):
            details = critical_files_result.get('details', {})
            logger.info(f"  ✅ Critical files: {details.get('found', 0)}/{details.get('total_critical', 0)} found")
        else:
            details = critical_files_result.get('details', {})
            missing = details.get('missing_files', [])
            if missing:
                logger.error(f"  ❌ Missing critical files: {', '.join(missing)}")
                critical_issues.append(f"Missing critical files: {', '.join(missing)}")
                all_passed = False
        
        # 3. File content verification
        file_content_result = report['verifications'].get('file_content', {})
        if file_content_result.get('success', False):
            details = file_content_result.get('details', {})
            logger.info(f"  ✅ File content: {details.get('matching', 0)} files match")
        else:
            details = file_content_result.get('details', {})
            different = details.get('different_files', [])
            missing = details.get('missing_files', [])
            if different:
                logger.warning(f"  ⚠️  Different files: {len(different)} files have different content")
                warnings.append(f"{len(different)} files have different content")
            if missing:
                logger.warning(f"  ⚠️  Missing files: {len(missing)} files missing")
                warnings.append(f"{len(missing)} files missing")
            all_passed = False
        
        # 4. Directory structure verification
        dir_structure_result = report['verifications'].get('directory_structure', {})
        if dir_structure_result.get('success', False):
            details = dir_structure_result.get('details', {})
            logger.info(f"  ✅ Directory structure: {details.get('matching', 0)} directories match")
        else:
            details = dir_structure_result.get('details', {})
            missing_dirs = details.get('missing_dirs', [])
            if missing_dirs:
                logger.warning(f"  ⚠️  Missing directories: {len(missing_dirs)} directories")
                warnings.append(f"{len(missing_dirs)} directories missing")
            all_passed = False
        
        # Report results
        if critical_issues:
            for issue in critical_issues:
                reporter.add_error(issue, "verify_sync")
        
        if warnings:
            for warning in warnings:
                reporter.add_warning(warning, "verify_sync")
        
        # Summary
        if all_passed and not critical_issues:
            logger.info("  ✅ All verifications passed")
            return {'success': True, 'report': report}
        elif critical_issues:
            logger.error("  ❌ Critical issues found - sync verification failed")
            return {'success': False, 'error': 'Critical sync verification issues', 'report': report}
        else:
            logger.warning("  ⚠️  Some warnings found, but no critical issues")
            return {'success': True, 'warnings': warnings, 'report': report}
        
    except Exception as e:
        logger.error(f"  ❌ Error during verification: {e}")
        reporter.add_error(f"Verification error: {e}", "verify_sync")
        return {'success': False, 'error': str(e)}


if __name__ == '__main__':
    result = run_step()
    sys.exit(0 if result.get('success') else 1)

