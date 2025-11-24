#!/usr/bin/env python3
"""
Step 13: Start Production Server
==================================

Starts the production server on port 5001 and verifies it's running.
"""

import subprocess
import sys
import time
import urllib.request
import urllib.error
from pathlib import Path
from typing import Dict, Optional, Tuple

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent))

# Import utils
sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent / "scripts" / "production-update" / "utils"))
from logger import get_logger
from reporter import get_reporter


def check_port_available(port: int = 5001) -> Tuple[bool, Optional[int]]:
    """Check if port is available
    
    Returns:
        Tuple of (is_available, pid_if_in_use)
    """
    try:
        result = subprocess.run(
            ['lsof', '-i', f':{port}'],
            capture_output=True,
            text=True
        )
        
        if result.returncode == 0:
            # Port is in use, try to get PID
            lines = result.stdout.strip().split('\n')
            if len(lines) > 1:
                parts = lines[1].split()
                if parts:
                    try:
                        pid = int(parts[1])
                        return False, pid
                    except (ValueError, IndexError):
                        pass
            return False, None
        else:
            return True, None
    except FileNotFoundError:
        # lsof not available, try alternative
        import socket
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        result = sock.connect_ex(('127.0.0.1', port))
        sock.close()
        return result != 0, None
    except Exception:
        return True, None  # Assume available if we can't check


def wait_for_health_check(port: int = 5001, timeout: int = 30) -> Tuple[bool, Optional[str]]:
    """Wait for server health check to pass
    
    Returns:
        Tuple of (success, error_message)
    """
    logger = get_logger()
    url = f"http://127.0.0.1:{port}/api/health"
    
    logger.info(f"  🔍 Waiting for health check (up to {timeout} seconds)...")
    
    start_time = time.time()
    while time.time() - start_time < timeout:
        try:
            req = urllib.request.Request(url)
            req.add_header('User-Agent', 'TikTrack-Update-Script')
            
            with urllib.request.urlopen(req, timeout=5) as response:
                if response.status == 200:
                    elapsed = time.time() - start_time
                    logger.info(f"  ✅ Health check passed after {elapsed:.1f} seconds")
                    return True, None
        except urllib.error.URLError:
            # Server not ready yet
            time.sleep(1)
        except Exception as e:
            # Other error
            time.sleep(1)
    
    elapsed = time.time() - start_time
    return False, f"Health check did not pass within {timeout} seconds (elapsed: {elapsed:.1f}s)"


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
    
    logger.step_start("Start Production Server", 13)
    
    project_root = Path(__file__).parent.parent.parent.parent
    start_script = project_root / "start_production.sh"
    port = 5001  # Production port - CRITICAL!
    
    if dry_run:
        logger.info("  [DRY RUN] Would start production server on port 5001")
        return {'success': True, 'dry_run': True}
    
    if not start_script.exists():
        logger.warning("  ⚠️  Start script not found, trying start_server.sh...")
        start_script = project_root / "start_server.sh"
        if not start_script.exists():
            logger.error("  ❌ Start script not found")
            return {'success': False, 'error': 'Start script not found'}
    
    try:
        # Check if port is available
        logger.info(f"  🔍 Checking if port {port} is available...")
        is_available, pid_in_use = check_port_available(port)
        
        if not is_available:
            logger.warning(f"  ⚠️  Port {port} is already in use")
            if pid_in_use:
                logger.warning(f"    Process using port: PID {pid_in_use}")
            logger.info("  💡 Server may already be running, or you may need to stop it first")
            return {
                'success': True,
                'already_running': True,
                'pid': pid_in_use
            }
        
        # Start server
        logger.info(f"  🚀 Starting production server on port {port}...")
        
        if background:
            log_file = project_root / "production" / "Backend" / "server_output.log"
            log_file.parent.mkdir(parents=True, exist_ok=True)
            
            # Use start_production.sh or start_server.sh with --env production
            if start_script.name == "start_production.sh":
                cmd = ['bash', str(start_script)]
            else:
                cmd = ['bash', str(start_script), '--env', 'production']
            
            process = subprocess.Popen(
                cmd,
                cwd=project_root,
                stdout=open(log_file, 'w'),
                stderr=subprocess.STDOUT
            )
            
            server_pid = process.pid
            logger.info(f"  ✅ Server started in background (PID: {server_pid})")
            logger.info(f"  📄 Logs: {log_file}")
            
            # Wait for health check
            health_success, health_error = wait_for_health_check(port, timeout=30)
            
            if health_success:
                logger.info("  ✅ Server is running and healthy")
                return {
                    'success': True,
                    'pid': server_pid,
                    'port': port,
                    'background': True,
                    'health_check': 'passed'
                }
            else:
                logger.warning(f"  ⚠️  Server started but health check failed: {health_error}")
                return {
                    'success': True,  # Server started, even if health check failed
                    'pid': server_pid,
                    'port': port,
                    'background': True,
                    'health_check': 'failed',
                    'health_error': health_error
                }
        else:
            logger.info("  ⚠️  Starting server in foreground (this will block)")
            logger.info("  💡 Use Ctrl+C to stop")
            result = subprocess.run(
                ['bash', str(start_script), '--env', 'production'] if start_script.name == "start_server.sh" else ['bash', str(start_script)],
                cwd=project_root
            )
            return {
                'success': result.returncode == 0,
                'background': False,
                'port': port
            }
            
    except Exception as e:
        logger.error(f"  ❌ Error starting server: {e}")
        reporter.add_error(f"Server start error: {e}", "start_server")
        import traceback
        traceback.print_exc()
        return {'success': False, 'error': str(e)}


if __name__ == '__main__':
    from typing import Tuple
    result = run_step()
    sys.exit(0 if result.get('success') else 1)

