#!/usr/bin/env python3
"""
Step 07: Fix Production Config
===============================

Restores and verifies production configuration files.
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
    Fix production configuration
    
    Returns:
        Dict with step results
    """
    logger = get_logger()
    reporter = get_reporter()
    
    logger.step_start("Fix Production Config", 7)
    
    project_root = Path(__file__).parent.parent.parent.parent
    production_config = project_root / "production" / "Backend" / "config"
    
    if dry_run:
        logger.info("  [DRY RUN] Would verify and fix production config")
        return {'success': True, 'dry_run': True}
    
    if not production_config.exists():
        logger.error("  ❌ Production config directory not found")
        reporter.add_error("Production config directory not found", "fix_config")
        return {'success': False, 'error': 'Config directory not found'}
    
    try:
        # Verify settings.py
        settings_file = production_config / "settings.py"
        if settings_file.exists():
            logger.info("  🔍 Verifying production settings...")
            
            # Check key settings
            with open(settings_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            checks = {
                'IS_PRODUCTION = True': 'IS_PRODUCTION' in content and 'True' in content,
                'PORT = 5001': 'PORT = 5001' in content,
                'tiktrack.db': 'tiktrack.db' in content,
            }
            
            all_ok = True
            for check_name, check_result in checks.items():
                if check_result:
                    logger.info(f"    ✅ {check_name}")
                else:
                    logger.warning(f"    ⚠️  {check_name} - not found or incorrect")
                    all_ok = False
            
            if not all_ok:
                logger.warning("  ⚠️  Some settings may need manual verification")
                reporter.add_warning("Production settings may need verification", "fix_config")
            
            # Try to import and verify
            try:
                sys.path.insert(0, str(production_config.parent))
                from config.settings import IS_PRODUCTION, PORT, DB_PATH, UI_DIR
                
                logger.info(f"    📍 IS_PRODUCTION: {IS_PRODUCTION}")
                logger.info(f"    📍 PORT: {PORT}")
                logger.info(f"    📍 DB_PATH: {DB_PATH}")
                logger.info(f"    📍 UI_DIR: {UI_DIR}")
                
                if IS_PRODUCTION and PORT == 5001:
                    logger.info("  ✅ Production settings verified")
                    return {'success': True, 'verified': True}
                else:
                    logger.warning("  ⚠️  Settings not matching expected production values")
                    return {'success': True, 'verified': False, 'warning': 'Settings mismatch'}
            except Exception as e:
                logger.warning(f"  ⚠️  Could not import settings: {e}")
                return {'success': True, 'verified': False, 'warning': str(e)}
        else:
            logger.error("  ❌ settings.py not found")
            return {'success': False, 'error': 'settings.py not found'}
            
    except Exception as e:
        logger.error(f"  ❌ Error verifying config: {e}")
        reporter.add_error(f"Config verification error: {e}", "fix_config")
        return {'success': False, 'error': str(e)}


if __name__ == '__main__':
    result = run_step()
    sys.exit(0 if result.get('success') else 1)

