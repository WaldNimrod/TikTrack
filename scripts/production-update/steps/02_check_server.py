#!/usr/bin/env python3
"""
Step 02: Check Server Status
============================

Checks if the production server is running on port 5001.
"""

import subprocess
import sys
import time
from pathlib import Path
from typing import Dict, Optional, Tuple

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent))

# Import utils
sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent / "scripts" / "production-update" / "utils"))
from logger import get_logger
from reporter import get_reporter


def check_server_running(port: int = 5001) -> Tuple[bool, Optional[int]]:
    """Check if server is running on specified port
    
    Returns:
        Tuple of (is_running, pid)
    """
    try:
        # Check if port is in use
        result = subprocess.run(
            ['lsof', '-i', f':{port}'],
            capture_output=True,
            text=True
        )
        
        if result.returncode == 0:
            # Parse PID from output
            lines = result.stdout.strip().split('\n')
            if len(lines) > 1:  # Header + data
                # Second line should have PID
                parts = lines[1].split()
                if parts:
                    try:
                        pid = int(parts[1])
                        return True, pid
                    except (ValueError, IndexError):
                        pass
            return True, None
        else:
            return False, None
    except FileNotFoundError:
        # lsof not available, try alternative method
        try:
            result = subprocess.run(
                ['netstat', '-an'],
                capture_output=True,
                text=True
            )
            if f':{port}' in result.stdout:
                return True, None
            return False, None
        except FileNotFoundError:
            # Fallback: try to connect
            import socket
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            result = sock.connect_ex(('127.0.0.1', port))
            sock.close()
            return result == 0, None
    except Exception as e:
        logger = get_logger()
        logger.warning(f"  ⚠️  Error checking server status: {e}")
        return False, None


def check_health(port: int = 5001, timeout: int = 5) -> Tuple[bool, Optional[str]]:
    """Check server health endpoint
    
    Returns:
        Tuple of (is_healthy, error_message)
    """
    try:
        import urllib.request
        import urllib.error
        
        url = f"http://127.0.0.1:{port}/api/health"
        req = urllib.request.Request(url)
        req.add_header('User-Agent', 'TikTrack-Update-Script')
        
        try:
            with urllib.request.urlopen(req, timeout=timeout) as response:
                if response.status == 200:
                    return True, None
                else:
                    return False, f"HTTP {response.status}"
        except urllib.error.URLError as e:
            return False, str(e)
    except Exception as e:
        return False, str(e)


def get_server_info(pid: Optional[int] = None) -> Dict:
    """Get server information"""
    info = {
        'pid': pid,
        'uptime': None,
        'version': None
    }
    
    if pid:
        try:
            # Get process start time
            import psutil
            process = psutil.Process(pid)
            info['uptime'] = time.time() - process.create_time()
            info['version'] = None  # Could try to get from process
        except (ImportError, psutil.NoSuchProcess):
            # Try alternative method
            try:
                result = subprocess.run(
                    ['ps', '-p', str(pid), '-o', 'etime='],
                    capture_output=True,
                    text=True
                )
                if result.returncode == 0:
                    info['uptime'] = result.stdout.strip()
            except Exception:
                pass
    
    return info


def run_step(dry_run: bool = False) -> dict:
    """
    Check server status
    
    Returns:
        Dict with step results
    """
    logger = get_logger()
    reporter = get_reporter()
    
    logger.step_start("Check Server Status", 2)
    
    if dry_run:
        logger.info("  [DRY RUN] Would check server status")
        return {'success': True, 'dry_run': True, 'running': False}
    
    try:
        port = 5001  # Production port
        
        logger.info(f"  🔍 Checking if server is running on port {port}...")
        
        is_running, pid = check_server_running(port)
        
        result = {
            'success': True,
            'running': is_running,
            'port': port,
            'pid': pid
        }
        
        if is_running:
            logger.info(f"  ✅ Server is running (PID: {pid if pid else 'unknown'})")
            
            # Check health
            logger.info("  🔍 Checking server health...")
            is_healthy, error = check_health(port)
            
            if is_healthy:
                logger.info("  ✅ Server health check passed")
                result['health'] = 'healthy'
            else:
                logger.warning(f"  ⚠️  Server health check failed: {error}")
                result['health'] = 'unhealthy'
                result['health_error'] = error
            
            # Get server info
            server_info = get_server_info(pid)
            if server_info.get('uptime'):
                logger.info(f"  📊 Server uptime: {server_info['uptime']}")
                result['uptime'] = server_info['uptime']
        else:
            logger.info("  ℹ️  Server is not running")
            result['health'] = 'not_running'
        
        return result
        
    except Exception as e:
        logger.error(f"  ❌ Error checking server status: {e}")
        reporter.add_error(f"Server check error: {e}", "check_server")
        return {'success': False, 'error': str(e)}


if __name__ == '__main__':
    from typing import Dict, Optional, Tuple
    result = run_step()
    sys.exit(0 if result.get('success') else 1)

