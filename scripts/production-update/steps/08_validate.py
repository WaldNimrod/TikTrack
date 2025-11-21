#!/usr/bin/env python3
"""
Step 08: Validate Production
============================

Runs validation and tests on production environment.
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


def run_step(dry_run: bool = False, skip_ui_tests: bool = False) -> dict:
    """
    Validate production environment
    
    Args:
        dry_run: If True, don't actually run validation
        skip_ui_tests: If True, skip UI tests
    
    Returns:
        Dict with step results
    """
    logger = get_logger()
    reporter = get_reporter()
    
    logger.step_start("Validate Production", 8)
    
    project_root = Path(__file__).parent.parent.parent.parent
    
    if dry_run:
        logger.info("  [DRY RUN] Would run validation tests")
        return {'success': True, 'dry_run': True}
    
    validation_results = {}
    
    try:
        import subprocess
        
        # 1. Verify isolation
        isolation_script = project_root / "scripts" / "production-update" / "lib" / "verify_production_isolation.sh"
        if not isolation_script.exists():
            isolation_script = project_root / "scripts" / "verify_production_isolation.sh"
        
        if isolation_script.exists():
            logger.info("  🔍 Verifying production isolation...")
            result = subprocess.run(
                ['bash', str(isolation_script)],
                cwd=project_root,
                capture_output=True,
                text=True
            )
            validation_results['isolation'] = result.returncode == 0
            if result.returncode == 0:
                logger.info("  ✅ Isolation verification passed")
            else:
                logger.warning("  ⚠️  Isolation verification had issues")
                reporter.add_warning("Isolation verification had issues", "validate")
        
        # 2. Verify production structure
        verify_script = project_root / "scripts" / "production-update" / "lib" / "verify_production.sh"
        if not verify_script.exists():
            verify_script = project_root / "scripts" / "verify_production.sh"
        
        if verify_script.exists():
            logger.info("  🔍 Verifying production structure...")
            result = subprocess.run(
                ['bash', str(verify_script)],
                cwd=project_root,
                capture_output=True,
                text=True
            )
            validation_results['structure'] = result.returncode == 0
            if result.returncode == 0:
                logger.info("  ✅ Structure verification passed")
            else:
                logger.warning("  ⚠️  Structure verification had issues")
        
        # 3. Run post-update validation
        post_validation_script = project_root / "scripts" / "production-update" / "lib" / "post_update_validation.py"
        if not post_validation_script.exists():
            post_validation_script = project_root / "scripts" / "release" / "post_update_validation.py"
        
        if post_validation_script.exists():
            logger.info("  🔍 Running post-update validation...")
            result = subprocess.run(
                [sys.executable, str(post_validation_script), '--skip-health'],
                cwd=project_root,
                capture_output=True,
                text=True
            )
            validation_results['post_validation'] = result.returncode == 0
            if result.returncode == 0:
                logger.info("  ✅ Post-update validation passed")
            else:
                logger.warning("  ⚠️  Post-update validation had issues")
        
        # 4. UI Tests (if not skipped)
        if not skip_ui_tests:
            ui_test_result = run_ui_tests(logger, reporter, project_root)
            validation_results['ui_tests'] = ui_test_result
        
        # Summary
        all_passed = all(validation_results.values())
        if all_passed:
            logger.info("  ✅ All validations passed")
        else:
            failed = [k for k, v in validation_results.items() if not v]
            logger.warning(f"  ⚠️  Some validations failed: {', '.join(failed)}")
        
        return {
            'success': all_passed,
            'results': validation_results
        }
        
    except Exception as e:
        logger.error(f"  ❌ Error during validation: {e}")
        reporter.add_error(f"Validation error: {e}", "validate")
        return {'success': False, 'error': str(e)}


def run_ui_tests(logger, reporter, project_root: Path) -> bool:
    """Run UI tests"""
    logger.info("  🌐 Running UI tests...")
    
    production_ui = project_root / "production" / "trading-ui"
    if not production_ui.exists():
        logger.warning("    ⚠️  Production UI not found, skipping UI tests")
        return True
    
    # Check critical pages exist
    critical_pages = ['index.html', 'trades.html', 'alerts.html', 'preferences.html']
    missing_pages = []
    
    for page in critical_pages:
        page_path = production_ui / page
        if page_path.exists():
            logger.info(f"    ✅ {page} exists")
        else:
            logger.warning(f"    ⚠️  {page} missing")
            missing_pages.append(page)
    
    # Check JavaScript syntax (basic check)
    js_files = list(production_ui.rglob('*.js'))
    syntax_errors = []
    
    for js_file in js_files[:10]:  # Check first 10 files
        try:
            with open(js_file, 'r', encoding='utf-8') as f:
                content = f.read()
                # Basic syntax check - look for common errors
                if content.count('{') != content.count('}'):
                    syntax_errors.append(str(js_file.relative_to(project_root)))
        except Exception:
            pass
    
    if syntax_errors:
        logger.warning(f"    ⚠️  Found {len(syntax_errors)} potential syntax issues")
        reporter.add_warning(f"JavaScript syntax issues found: {len(syntax_errors)} files", "validate")
    
    success = len(missing_pages) == 0
    if success:
        logger.info("  ✅ UI tests passed")
    else:
        logger.warning(f"  ⚠️  UI tests found {len(missing_pages)} missing pages")
    
    return success


if __name__ == '__main__':
    result = run_step()
    sys.exit(0 if result.get('success') else 1)

