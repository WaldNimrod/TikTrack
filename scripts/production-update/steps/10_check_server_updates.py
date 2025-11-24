#!/usr/bin/env python3
"""
Step 10: Check Server Updates Required
======================================

Checks what updates are required for the server before starting it.
"""

import subprocess
import sys
from pathlib import Path
from typing import Dict, List, Optional, Set

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent))

# Import utils
sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent / "scripts" / "production-update" / "utils"))
from logger import get_logger
from reporter import get_reporter


def check_dependencies(requirements_file: Path) -> Dict:
    """Check if dependencies need to be updated
    
    Returns:
        Dict with dependency check results
    """
    logger = get_logger()
    
    if not requirements_file.exists():
        logger.warning(f"  ⚠️  Requirements file not found: {requirements_file}")
        return {
            'needs_update': False,
            'missing_file': True,
            'packages': []
        }
    
    try:
        # Read requirements
        with open(requirements_file, 'r', encoding='utf-8') as f:
            requirements = f.read().splitlines()
        
        # Filter out comments and empty lines
        packages = []
        for line in requirements:
            line = line.strip()
            if line and not line.startswith('#'):
                # Extract package name (before == or >= etc.)
                package_name = line.split('==')[0].split('>=')[0].split('>')[0].split('<')[0].split('!=')[0].strip()
                if package_name:
                    packages.append(package_name)
        
        # Check which packages are installed
        missing_packages = []
        outdated_packages = []
        
        for package in packages:
            try:
                result = subprocess.run(
                    [sys.executable, '-m', 'pip', 'show', package],
                    capture_output=True,
                    text=True
                )
                if result.returncode != 0:
                    missing_packages.append(package)
            except Exception:
                missing_packages.append(package)
        
        needs_update = len(missing_packages) > 0
        
        return {
            'needs_update': needs_update,
            'missing_file': False,
            'packages': packages,
            'missing_packages': missing_packages,
            'outdated_packages': outdated_packages
        }
        
    except Exception as e:
        logger.warning(f"  ⚠️  Error checking dependencies: {e}")
        return {
            'needs_update': False,
            'error': str(e),
            'packages': []
        }


def check_critical_files(project_root: Path) -> Dict[str, bool]:
    """Check if critical files exist and are valid"""
    logger = get_logger()
    
    critical_files = {
        'app.py': project_root / "production" / "Backend" / "app.py",
        'settings.py': project_root / "production" / "Backend" / "config" / "settings.py",
        'requirements.txt': project_root / "production" / "Backend" / "requirements.txt"
    }
    
    results = {}
    for name, path in critical_files.items():
        exists = path.exists()
        results[name] = exists
        
        if exists:
            # Check if file is not empty
            try:
                if path.stat().st_size == 0:
                    logger.warning(f"  ⚠️  Critical file is empty: {path}")
                    results[f"{name}_empty"] = True
            except Exception:
                pass
        else:
            logger.warning(f"  ⚠️  Critical file missing: {path}")
    
    return results


def check_database_structure(project_root: Path) -> Dict:
    """Check if database structure is ready for server"""
    logger = get_logger()
    
    try:
        sys.path.insert(0, str(project_root / "production" / "Backend"))
        from config.settings import DATABASE_URL
        from sqlalchemy import create_engine, inspect
        
        engine = create_engine(DATABASE_URL)
        inspector = inspect(engine)
        
        # Check critical tables
        critical_tables = [
            'currencies',
            'trading_accounts',
            'tickers',
            'trades',
            'executions'
        ]
        
        existing_tables = inspector.get_table_names()
        missing_tables = [t for t in critical_tables if t not in existing_tables]
        
        return {
            'ready': len(missing_tables) == 0,
            'missing_tables': missing_tables,
            'total_tables': len(existing_tables)
        }
        
    except Exception as e:
        logger.warning(f"  ⚠️  Error checking database structure: {e}")
        return {
            'ready': False,
            'error': str(e)
        }


def check_ui_files(project_root: Path) -> Dict:
    """Check if critical UI files exist"""
    logger = get_logger()
    
    ui_dir = project_root / "production" / "trading-ui"
    critical_files = [
        'index.html',
        'trades.html',
        'alerts.html',
        'preferences.html'
    ]
    
    missing_files = []
    for file_name in critical_files:
        file_path = ui_dir / file_name
        if not file_path.exists():
            missing_files.append(file_name)
            logger.warning(f"  ⚠️  UI file missing: {file_path}")
    
    return {
        'ready': len(missing_files) == 0,
        'missing_files': missing_files
    }


def generate_update_report(project_root: Path) -> Dict:
    """Generate comprehensive update report"""
    logger = get_logger()
    
    logger.info("  🔍 Checking server update requirements...")
    
    # Check dependencies
    requirements_file = project_root / "production" / "Backend" / "requirements.txt"
    deps_result = check_dependencies(requirements_file)
    
    # Check critical files
    critical_files = check_critical_files(project_root)
    
    # Check database structure
    db_structure = check_database_structure(project_root)
    
    # Check UI files
    ui_files = check_ui_files(project_root)
    
    # Generate warnings
    warnings = []
    
    if deps_result.get('needs_update'):
        missing = deps_result.get('missing_packages', [])
        if missing:
            warnings.append(f"Missing packages: {', '.join(missing[:5])}")
    
    missing_critical = [name for name, exists in critical_files.items() if not exists]
    if missing_critical:
        warnings.append(f"Missing critical files: {', '.join(missing_critical)}")
    
    if not db_structure.get('ready'):
        missing_tables = db_structure.get('missing_tables', [])
        if missing_tables:
            warnings.append(f"Missing database tables: {', '.join(missing_tables)}")
    
    if not ui_files.get('ready'):
        missing_ui = ui_files.get('missing_files', [])
        if missing_ui:
            warnings.append(f"Missing UI files: {', '.join(missing_ui)}")
    
    return {
        'dependencies': deps_result,
        'critical_files': critical_files,
        'database_structure': db_structure,
        'ui_files': ui_files,
        'warnings': warnings,
        'needs_update': len(warnings) > 0
    }


def run_step(dry_run: bool = False) -> dict:
    """
    Check server update requirements
    
    Returns:
        Dict with step results
    """
    logger = get_logger()
    reporter = get_reporter()
    
    logger.step_start("Check Server Updates", 10)
    
    project_root = Path(__file__).parent.parent.parent.parent
    
    if dry_run:
        logger.info("  [DRY RUN] Would check server update requirements")
        return {'success': True, 'dry_run': True}
    
    try:
        report = generate_update_report(project_root)
        
        if report['needs_update']:
            logger.warning(f"  ⚠️  Server updates required:")
            for warning in report['warnings']:
                logger.warning(f"    - {warning}")
            reporter.add_warning(f"Server updates required: {len(report['warnings'])} issues", "check_server_updates")
        else:
            logger.info("  ✅ No server updates required")
        
        return {
            'success': True,
            'needs_update': report['needs_update'],
            'report': report
        }
        
    except Exception as e:
        logger.error(f"  ❌ Error checking server updates: {e}")
        reporter.add_error(f"Server update check error: {e}", "check_server_updates")
        return {'success': False, 'error': str(e)}


if __name__ == '__main__':
    result = run_step()
    sys.exit(0 if result.get('success') else 1)

