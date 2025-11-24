#!/usr/bin/env python3
"""
Step 11: Update Server
======================

Updates server dependencies and verifies installation.
"""

import subprocess
import sys
from pathlib import Path
from typing import Dict, List, Optional, Tuple

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent))

# Import utils
sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent / "scripts" / "production-update" / "utils"))
from logger import get_logger
from reporter import get_reporter


def install_dependencies(requirements_file: Path, upgrade: bool = True) -> Tuple[bool, Optional[str]]:
    """Install or update dependencies
    
    Returns:
        Tuple of (success, error_message)
    """
    logger = get_logger()
    
    if not requirements_file.exists():
        return False, f"Requirements file not found: {requirements_file}"
    
    try:
        logger.info("  📦 Installing/updating dependencies...")
        
        cmd = [
            sys.executable, '-m', 'pip', 'install',
            '-r', str(requirements_file)
        ]
        
        if upgrade:
            cmd.append('--upgrade')
        
        result = subprocess.run(
            cmd,
            cwd=requirements_file.parent,
            capture_output=True,
            text=True
        )
        
        if result.returncode == 0:
            logger.info("  ✅ Dependencies installed/updated successfully")
            return True, None
        else:
            error_msg = result.stderr.strip() or result.stdout.strip()
            return False, error_msg
            
    except Exception as e:
        return False, str(e)


def verify_dependencies(requirements_file: Path) -> Tuple[bool, List[str]]:
    """Verify that all dependencies are installed
    
    Returns:
        Tuple of (all_installed, missing_packages)
    """
    logger = get_logger()
    
    if not requirements_file.exists():
        return False, []
    
    try:
        # Read requirements
        with open(requirements_file, 'r', encoding='utf-8') as f:
            requirements = f.read().splitlines()
        
        missing = []
        for line in requirements:
            line = line.strip()
            if line and not line.startswith('#'):
                package_name = line.split('==')[0].split('>=')[0].split('>')[0].split('<')[0].split('!=')[0].strip()
                if package_name:
                    result = subprocess.run(
                        [sys.executable, '-m', 'pip', 'show', package_name],
                        capture_output=True,
                        text=True
                    )
                    if result.returncode != 0:
                        missing.append(package_name)
        
        if missing:
            logger.warning(f"  ⚠️  {len(missing)} package(s) still missing: {', '.join(missing[:5])}")
        else:
            logger.info("  ✅ All dependencies verified")
        
        return len(missing) == 0, missing
        
    except Exception as e:
        logger.warning(f"  ⚠️  Error verifying dependencies: {e}")
        return False, []


def check_syntax(file_path: Path) -> Tuple[bool, Optional[str]]:
    """Check Python file syntax
    
    Returns:
        Tuple of (valid, error_message)
    """
    try:
        result = subprocess.run(
            [sys.executable, '-m', 'py_compile', str(file_path)],
            capture_output=True,
            text=True
        )
        return result.returncode == 0, result.stderr.strip() if result.returncode != 0 else None
    except Exception:
        return True, None  # If we can't check, assume it's OK


def run_step(dry_run: bool = False, update_report: Optional[dict] = None) -> dict:
    """
    Update server dependencies
    
    Args:
        dry_run: If True, don't actually update
        update_report: Result from check_server_updates step (optional)
    
    Returns:
        Dict with step results
    """
    logger = get_logger()
    reporter = get_reporter()
    
    logger.step_start("Update Server", 11)
    
    project_root = Path(__file__).parent.parent.parent.parent
    requirements_file = project_root / "production" / "Backend" / "requirements.txt"
    
    if dry_run:
        logger.info("  [DRY RUN] Would update server dependencies")
        return {'success': True, 'dry_run': True}
    
    try:
        # Check if updates are needed
        if update_report and not update_report.get('needs_update', True):
            logger.info("  ℹ️  No updates needed based on previous check")
            return {
                'success': True,
                'updated': False,
                'reason': 'no_updates_needed'
            }
        
        # Install/update dependencies
        if requirements_file.exists():
            success, error = install_dependencies(requirements_file, upgrade=True)
            
            if not success:
                logger.error(f"  ❌ Failed to install dependencies: {error}")
                reporter.add_error(f"Dependency installation failed: {error}", "update_server")
                return {
                    'success': False,
                    'error': error
                }
            
            # Verify installation
            all_installed, missing = verify_dependencies(requirements_file)
            
            if not all_installed:
                logger.warning(f"  ⚠️  Some dependencies still missing: {len(missing)} packages")
                reporter.add_warning(f"{len(missing)} dependencies still missing", "update_server")
            
            # Check syntax of critical files (optional)
            logger.info("  🔍 Checking syntax of critical files...")
            critical_files = [
                project_root / "production" / "Backend" / "app.py",
                project_root / "production" / "Backend" / "config" / "settings.py"
            ]
            
            syntax_errors = []
            for file_path in critical_files:
                if file_path.exists():
                    valid, error = check_syntax(file_path)
                    if not valid:
                        syntax_errors.append(str(file_path))
                        logger.warning(f"  ⚠️  Syntax error in {file_path.name}: {error}")
            
            return {
                'success': True,
                'updated': True,
                'missing_packages': missing,
                'syntax_errors': syntax_errors
            }
        else:
            logger.warning("  ⚠️  Requirements file not found - skipping dependency update")
            return {
                'success': True,
                'updated': False,
                'reason': 'no_requirements_file'
            }
        
    except Exception as e:
        logger.error(f"  ❌ Error updating server: {e}")
        reporter.add_error(f"Server update error: {e}", "update_server")
        return {'success': False, 'error': str(e)}


if __name__ == '__main__':
    from typing import Tuple, Optional
    result = run_step()
    sys.exit(0 if result.get('success') else 1)

