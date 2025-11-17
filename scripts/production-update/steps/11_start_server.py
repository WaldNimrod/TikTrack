#!/usr/bin/env python3
"""
Step 11: Start Production Server
=================================

Starts the production server (optional step).
"""

import subprocess
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent))

# Import utils
sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent / "scripts" / "production-update" / "utils"))
from logger import get_logger
# Import utils
from reporter import get_reporter


def run_step(dry_run: bool = False, background: bool = True) -> dict:
    """
    Start production server
    
    Args:
        dry_run: If True, don't actually start server
        background: If True, start in background
    
    Returns:
        Dict with step results
    """
    logger = get_logger()
    reporter = get_reporter()
    
    logger.step_start("Start Production Server", 11)
    
    project_root = Path(__file__).parent.parent.parent.parent
    start_script = project_root / "start_production.sh"
    
    if dry_run:
        logger.info("  [DRY RUN] Would start production server")
        return {'success': True, 'dry_run': True}
    
    if not start_script.exists():
        logger.warning("  ⚠️  Start script not found, skipping")
        return {'success': True, 'skipped': True}
    
    try:
        # Check if port is already in use
        logger.info("  🔍 Checking if port 5001 is available...")
        result = subprocess.run(
            ['lsof', '-i', ':5001'],
            capture_output=True,
            text=True
        )
        
        if result.returncode == 0:
            logger.warning("  ⚠️  Port 5001 is already in use")
            logger.info("  💡 Server may already be running, or you may need to stop it first")
            return {'success': True, 'already_running': True}
        
        # Start server
        logger.info("  🚀 Starting production server...")
        
        if background:
            log_file = project_root / "logs-production" / "start.log"
            log_file.parent.mkdir(parents=True, exist_ok=True)
            
            result = subprocess.Popen(
                ['bash', str(start_script)],
                cwd=project_root,
                stdout=open(log_file, 'w'),
                stderr=subprocess.STDOUT
            )
            
            logger.info(f"  ✅ Server started in background (PID: {result.pid})")
            logger.info(f"  📄 Logs: {log_file}")
            return {'success': True, 'pid': result.pid, 'background': True}
        else:
            logger.info("  ⚠️  Starting server in foreground (this will block)")
            logger.info("  💡 Use Ctrl+C to stop")
            result = subprocess.run(
                ['bash', str(start_script)],
                cwd=project_root
            )
            return {'success': result.returncode == 0, 'background': False}
            
    except Exception as e:
        logger.error(f"  ❌ Error starting server: {e}")
        reporter.add_error(f"Server start error: {e}", "start_server")
        return {'success': False, 'error': str(e)}


if __name__ == '__main__':
    result = run_step()
    sys.exit(0 if result.get('success') else 1)

