#!/usr/bin/env python3
"""
Step 07: Stop Production Server
================================

Stops the production server gracefully if it's running.
"""

import os
import signal
import subprocess
import sys
import time
from pathlib import Path
from typing import Dict, Optional

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent))

# Import utils
sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent / "scripts" / "production-update" / "utils"))
from logger import get_logger
from reporter import get_reporter

# Import check_server functions directly
def check_server_running(port: int = 5001):
    """Check if server is running on specified port"""
    try:
        result = subprocess.run(
            ['lsof', '-i', f':{port}'],
            capture_output=True,
            text=True
        )
        if result.returncode == 0:
            lines = result.stdout.strip().split('\n')
            if len(lines) > 1:
                parts = lines[1].split()
                if parts:
                    try:
                        pid = int(parts[1])
                        return True, pid
                    except (ValueError, IndexError):
                        pass
            return True, None
        return False, None
    except Exception:
        return False, None


def stop_server_graceful(pid: int, timeout: int = 30) -> bool:
    """Stop server gracefully using SIGTERM
    
    Args:
        pid: Process ID
        timeout: Maximum time to wait for shutdown (seconds)
    
    Returns:
        True if server stopped, False otherwise
    """
    logger = get_logger()
    
    try:
        logger.info(f"  🛑 Sending SIGTERM to process {pid}...")
        os.kill(pid, signal.SIGTERM)
        
        # Wait for process to terminate
        start_time = time.time()
        while time.time() - start_time < timeout:
            try:
                # Check if process still exists
                os.kill(pid, 0)  # Signal 0 doesn't kill, just checks
                time.sleep(1)
            except OSError:
                # Process no longer exists
                logger.info(f"  ✅ Server stopped gracefully")
                return True
        
        # Process still running after timeout
        logger.warning(f"  ⚠️  Server did not stop within {timeout} seconds")
        return False
        
    except ProcessLookupError:
        # Process already gone
        logger.info("  ✅ Server process already stopped")
        return True
    except PermissionError:
        logger.error(f"  ❌ Permission denied - cannot stop process {pid}")
        return False
    except Exception as e:
        logger.error(f"  ❌ Error stopping server: {e}")
        return False


def stop_server_force(pid: int) -> bool:
    """Stop server forcefully using SIGKILL
    
    Args:
        pid: Process ID
    
    Returns:
        True if successful, False otherwise
    """
    logger = get_logger()
    
    try:
        logger.warning(f"  ⚠️  Sending SIGKILL to process {pid}...")
        os.kill(pid, signal.SIGKILL)
        time.sleep(2)  # Give it a moment
        
        # Verify it's stopped
        try:
            os.kill(pid, 0)
            logger.error(f"  ❌ Process {pid} still running after SIGKILL")
            return False
        except ProcessLookupError:
            logger.info(f"  ✅ Server stopped forcefully")
            return True
    except Exception as e:
        logger.error(f"  ❌ Error force-stopping server: {e}")
        return False


def verify_server_stopped(port: int = 5001) -> bool:
    """Verify that server is stopped
    
    Args:
        port: Port to check
    
    Returns:
        True if server is stopped, False if still running
    """
    logger = get_logger()
    
    is_running, _ = check_server_running(port)
    
    if not is_running:
        logger.info(f"  ✅ Verified: Server is stopped (port {port} is free)")
        return True
    else:
        logger.warning(f"  ⚠️  Server is still running on port {port}")
        return False


def run_step(dry_run: bool = False, server_status: Optional[dict] = None) -> dict:
    """
    Stop production server
    
    Args:
        dry_run: If True, don't actually stop server
        server_status: Result from check_server step (optional)
    
    Returns:
        Dict with step results
    """
    logger = get_logger()
    reporter = get_reporter()
    
    logger.step_start("Stop Production Server", 7)
    
    if dry_run:
        logger.info("  [DRY RUN] Would stop production server")
        return {'success': True, 'dry_run': True}
    
    try:
        port = 5001  # Production port
        
        # Get server status if not provided
        if server_status is None:
            logger.info("  🔍 Checking server status...")
            is_running, pid = check_server_running(port)
        else:
            is_running = server_status.get('running', False)
            pid = server_status.get('pid')
        
        if not is_running:
            logger.info("  ℹ️  Server is not running - nothing to stop")
            return {
                'success': True,
                'stopped': False,
                'reason': 'not_running'
            }
        
        if not pid:
            logger.warning("  ⚠️  Server is running but PID is unknown")
            logger.warning("  💡 Trying to find process using port...")
            
            # Try to find PID using lsof
            try:
                result = subprocess.run(
                    ['lsof', '-ti', f':{port}'],
                    capture_output=True,
                    text=True
                )
                if result.returncode == 0 and result.stdout.strip():
                    pid = int(result.stdout.strip().split('\n')[0])
                    logger.info(f"  📍 Found PID: {pid}")
                else:
                    logger.error("  ❌ Could not determine PID")
                    return {
                        'success': False,
                        'error': 'Could not determine PID'
                    }
            except Exception as e:
                logger.error(f"  ❌ Error finding PID: {e}")
                return {
                    'success': False,
                    'error': f'Could not find PID: {e}'
                }
        
        # Try graceful shutdown first
        logger.info(f"  🛑 Stopping server (PID: {pid})...")
        stopped = stop_server_graceful(pid, timeout=30)
        
        if not stopped:
            # Force stop if graceful didn't work
            logger.warning("  ⚠️  Graceful shutdown failed, trying force stop...")
            stopped = stop_server_force(pid)
        
        if stopped:
            # Verify it's stopped
            time.sleep(2)  # Give it a moment
            verified = verify_server_stopped(port)
            
            if verified:
                logger.info("  ✅ Server stopped successfully")
                return {
                    'success': True,
                    'stopped': True,
                    'pid': pid
                }
            else:
                logger.warning("  ⚠️  Server may still be running")
                return {
                    'success': False,
                    'stopped': False,
                    'error': 'Server still running after stop attempt'
                }
        else:
            logger.error("  ❌ Failed to stop server")
            return {
                'success': False,
                'stopped': False,
                'error': 'Could not stop server process'
            }
        
    except Exception as e:
        logger.error(f"  ❌ Error stopping server: {e}")
        reporter.add_error(f"Server stop error: {e}", "stop_server")
        return {'success': False, 'error': str(e)}


if __name__ == '__main__':
    result = run_step()
    sys.exit(0 if result.get('success') else 1)

