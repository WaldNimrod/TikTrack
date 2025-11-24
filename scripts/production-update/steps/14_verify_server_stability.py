#!/usr/bin/env python3
"""
Step 14: Verify Server Stability
=================================

Verifies that the server is running stably after startup.
"""

import subprocess
import sys
import time
from pathlib import Path
from typing import Dict, List, Optional, Tuple

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent))

# Import utils
sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent / "scripts" / "production-update" / "utils"))
from logger import get_logger
from reporter import get_reporter


def check_health_repeated(port: int = 5001, count: int = 6, interval: int = 5) -> List[Tuple[bool, Optional[str]]]:
    """Check health endpoint repeatedly
    
    Returns:
        List of (success, error_message) tuples
    """
    logger = get_logger()
    results = []
    
    for i in range(count):
        try:
            import urllib.request
            import urllib.error
            
            url = f"http://127.0.0.1:{port}/api/health"
            req = urllib.request.Request(url)
            req.add_header('User-Agent', 'TikTrack-Update-Script')
            
            try:
                with urllib.request.urlopen(req, timeout=5) as response:
                    if response.status == 200:
                        results.append((True, None))
                        logger.info(f"    ✅ Health check {i+1}/{count}: OK")
                    else:
                        error = f"HTTP {response.status}"
                        results.append((False, error))
                        logger.warning(f"    ⚠️  Health check {i+1}/{count}: {error}")
            except urllib.error.URLError as e:
                results.append((False, str(e)))
                logger.warning(f"    ⚠️  Health check {i+1}/{count}: {e}")
        except Exception as e:
            results.append((False, str(e)))
            logger.warning(f"    ⚠️  Health check {i+1}/{count}: {e}")
        
        if i < count - 1:  # Don't sleep after last check
            time.sleep(interval)
    
    return results


def check_process_alive(pid: Optional[int], port: int = 5001) -> Tuple[bool, Optional[str]]:
    """Check if server process is still alive
    
    Returns:
        Tuple of (is_alive, error_message)
    """
    if pid:
        try:
            import os
            os.kill(pid, 0)  # Signal 0 doesn't kill, just checks
            return True, None
        except ProcessLookupError:
            return False, "Process not found"
        except PermissionError:
            return False, "Permission denied"
        except Exception as e:
            return False, str(e)
    else:
        # Fallback: check if port is in use
        try:
            result = subprocess.run(
                ['lsof', '-i', f':{port}'],
                capture_output=True,
                text=True
            )
            return result.returncode == 0, None
        except Exception as e:
            return False, str(e)


def check_logs_for_errors(log_file: Path, since_start: float) -> List[str]:
    """Check logs for critical errors since server start
    
    Returns:
        List of error messages found
    """
    errors = []
    
    if not log_file.exists():
        return errors
    
    try:
        # Read log file
        with open(log_file, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        # Check last N lines for errors (since server start)
        # Look for ERROR, CRITICAL, FATAL, Traceback
        error_keywords = ['ERROR', 'CRITICAL', 'FATAL', 'Traceback', 'Exception']
        
        for line in lines[-100:]:  # Check last 100 lines
            if any(keyword in line for keyword in error_keywords):
                # Skip common non-critical errors
                if '404' not in line and 'favicon' not in line.lower():
                    errors.append(line.strip())
        
        return errors[:10]  # Return first 10 errors
        
    except Exception as e:
        return [f"Error reading log file: {e}"]


def wait_and_check(port: int = 5001, pid: Optional[int] = None, 
                  wait_time: int = 30, check_interval: int = 5) -> Dict:
    """Wait and perform repeated checks
    
    Returns:
        Dict with stability check results
    """
    logger = get_logger()
    
    logger.info(f"  ⏳ Waiting {wait_time} seconds for server to stabilize...")
    time.sleep(wait_time)
    
    logger.info("  🔍 Performing stability checks...")
    
    # Check health repeatedly
    health_results = check_health_repeated(port, count=6, interval=check_interval)
    health_passed = sum(1 for success, _ in health_results if success)
    health_failed = len(health_results) - health_passed
    
    # Check process
    process_alive, process_error = check_process_alive(pid, port)
    
    # Check logs
    log_file = Path(__file__).parent.parent.parent.parent / "production" / "Backend" / "server_output.log"
    log_errors = check_logs_for_errors(log_file, time.time() - wait_time)
    
    # Determine stability
    is_stable = (
        health_passed >= 5 and  # At least 5 out of 6 health checks passed
        process_alive and
        len(log_errors) == 0
    )
    
    return {
        'stable': is_stable,
        'health_checks': {
            'passed': health_passed,
            'failed': health_failed,
            'total': len(health_results),
            'results': health_results
        },
        'process_alive': process_alive,
        'process_error': process_error,
        'log_errors': log_errors,
        'log_errors_count': len(log_errors)
    }


def generate_stability_report(stability_result: Dict) -> Dict:
    """Generate human-readable stability report"""
    report = {
        'stable': stability_result['stable'],
        'summary': [],
        'warnings': [],
        'errors': []
    }
    
    # Health checks
    health = stability_result['health_checks']
    if health['failed'] > 0:
        report['warnings'].append(f"{health['failed']} health check(s) failed")
    else:
        report['summary'].append(f"All {health['total']} health checks passed")
    
    # Process
    if not stability_result['process_alive']:
        report['errors'].append(f"Process not alive: {stability_result.get('process_error', 'Unknown')}")
    else:
        report['summary'].append("Process is running")
    
    # Log errors
    if stability_result['log_errors_count'] > 0:
        report['errors'].extend(stability_result['log_errors'][:5])  # First 5 errors
    
    return report


def run_step(dry_run: bool = False, server_pid: Optional[int] = None) -> dict:
    """
    Verify server stability
    
    Args:
        dry_run: If True, don't actually check
        server_pid: PID of the server process (from start_server step)
    
    Returns:
        Dict with step results
    """
    logger = get_logger()
    reporter = get_reporter()
    
    logger.step_start("Verify Server Stability", 14)
    
    if dry_run:
        logger.info("  [DRY RUN] Would verify server stability")
        return {'success': True, 'dry_run': True}
    
    try:
        port = 5001  # Production port
        
        # Get PID if not provided (try to find it)
        if not server_pid:
            try:
                result = subprocess.run(
                    ['lsof', '-ti', f':{port}'],
                    capture_output=True,
                    text=True
                )
                if result.returncode == 0 and result.stdout.strip():
                    server_pid = int(result.stdout.strip().split('\n')[0])
                    logger.info(f"  📍 Found server PID: {server_pid}")
            except Exception:
                logger.warning("  ⚠️  Could not determine server PID")
        
        # Perform stability checks
        stability_result = wait_and_check(port, server_pid, wait_time=30, check_interval=5)
        
        # Generate report
        report = generate_stability_report(stability_result)
        
        if stability_result['stable']:
            logger.info("  ✅ Server is running stably")
            for summary in report['summary']:
                logger.info(f"    - {summary}")
        else:
            logger.warning("  ⚠️  Server stability issues detected")
            for warning in report['warnings']:
                logger.warning(f"    - {warning}")
            for error in report['errors']:
                logger.error(f"    - {error}")
            reporter.add_warning("Server stability issues detected", "verify_stability")
        
        return {
            'success': True,
            'stable': stability_result['stable'],
            'report': report,
            'stability_result': stability_result
        }
        
    except Exception as e:
        logger.error(f"  ❌ Error verifying server stability: {e}")
        reporter.add_error(f"Stability check error: {e}", "verify_stability")
        return {'success': False, 'error': str(e)}


if __name__ == '__main__':
    result = run_step()
    sys.exit(0 if result.get('success') and result.get('stable') else 1)

