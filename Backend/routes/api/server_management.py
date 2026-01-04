"""
Server Management API Routes
===========================

API endpoints for server management and configuration
"""

from flask import Blueprint, request, jsonify, g
import subprocess
import os
import logging
import threading
import time
from datetime import datetime
from typing import Any, Dict

# Import base classes
from .base_entity import BaseEntityAPI
from .base_entity_decorators import api_endpoint, handle_database_session, validate_request
from .base_entity_utils import BaseEntityUtils

# Create blueprint
server_management_bp = Blueprint('server_management', __name__, url_prefix='/api/server')

# Configure logging
logger = logging.getLogger(__name__)

# Initialize base API (server management is complex, so we'll use it selectively)

# Global variable to track restart status
restart_status = {
    'in_progress': False,
    'mode': None,
    'start_time': None,
    'status': 'idle'
}

def execute_restart_async(mode: str, restart_type: str = 'quick') -> None:
    """
    Execute restart script asynchronously to prevent Flask endpoint from hanging
    """
    global restart_status
    
    try:
        restart_status['in_progress'] = True
        restart_status['mode'] = mode
        restart_status['restart_type'] = restart_type
        restart_status['start_time'] = datetime.now()
        restart_status['status'] = 'executing'
        
        logger.info(f'Starting async restart for mode: {mode}, type: {restart_type}')
        
        # Get the project root directory
        project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        restart_script = os.path.join(project_root, 'restart')
        
        # Alternative path check if script not found
        if not os.path.exists(restart_script):
            current_dir = os.getcwd()
            if current_dir.endswith('Backend'):
                project_root = os.path.dirname(current_dir)
                restart_script = os.path.join(project_root, 'restart')
        
        if not os.path.exists(restart_script):
            logger.error('Restart script not found')
            restart_status['status'] = 'failed'
            restart_status['error'] = 'Restart script not found'
            return
        
        # Make restart script executable
        os.chmod(restart_script, 0o755)
        
        # Build restart command based on type and mode
        restart_args = [restart_script]
        
        # Add restart type if not preserve (preserve uses default quick)
        if restart_type != 'preserve' and mode == 'preserve':
            restart_args.append(restart_type)
        
        # Add cache mode if not preserve
        if mode != 'preserve':
            restart_args.append(f'--cache-mode={mode}')
        
        # Execute restart script with the specified parameters
        logger.info(f'Executing restart script: {" ".join(restart_args)}')
        logger.info(f'Working directory: {project_root}')
        
        # Execute the restart script
        result = subprocess.run(
            restart_args,
            capture_output=True,
            text=True,
            cwd=project_root,
            timeout=120  # 2 minute timeout
        )
        
        if result.returncode == 0:
            logger.info(f'Server restart completed successfully for mode: {mode}')
            restart_status['status'] = 'completed'
            restart_status['output'] = result.stdout
        else:
            logger.error(f'Restart script failed with return code: {result.returncode}')
            logger.error(f'Error output: {result.stderr}')
            restart_status['status'] = 'failed'
            restart_status['error'] = result.stderr
            restart_status['return_code'] = result.returncode
            
    except subprocess.TimeoutExpired:
        logger.error('Restart script timed out')
        restart_status['status'] = 'timeout'
        restart_status['error'] = 'Restart script timed out'
    except Exception as e:
        logger.error(f'Error during restart: {e}')
        restart_status['status'] = 'failed'
        restart_status['error'] = str(e)
    finally:
        restart_status['in_progress'] = False

@server_management_bp.route('/change-mode', methods=['POST'])
def change_server_mode() -> Any:
    """
    Change server cache mode and restart server
    
    Expected JSON payload:
    {
        "mode": "development|no-cache|production|preserve"
    }
    """
    logger.info('change_server_mode endpoint called')
    try:
        data = request.get_json()
        logger.info(f'Received data: {data}')
        
        if not data or 'mode' not in data:
            return jsonify({
                'status': 'error',
                'message': 'Missing mode parameter'
            }), 400
        
        mode = data['mode']
        restart_type = data.get('restart_type', 'quick')  # ברירת מחדל: quick
        
        valid_modes = ['development', 'no-cache', 'production', 'preserve']
        valid_restart_types = ['quick', 'complete', 'auto']
        
        if mode not in valid_modes:
            return jsonify({
                'status': 'error',
                'message': f'Invalid mode. Must be one of: {", ".join(valid_modes)}'
            }), 400
            
        if restart_type not in valid_restart_types:
            return jsonify({
                'status': 'error',
                'message': f'Invalid restart_type. Must be one of: {", ".join(valid_restart_types)}'
            }), 400
        
        # Check if restart is already in progress
        if restart_status['in_progress']:
            return jsonify({
                'status': 'error',
                'message': 'Server restart already in progress',
                'data': {
                    'current_status': restart_status
                }
            }), 409
        
        # Log the mode change request
        logger.info(f'Server mode change requested: {mode}')
        
        # Try to execute restart script
        try:
            # Get the project root directory
            project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
            restart_script = os.path.join(project_root, 'restart')
            
            # Alternative path check if script not found
            if not os.path.exists(restart_script):
                current_dir = os.getcwd()
                if current_dir.endswith('Backend'):
                    project_root = os.path.dirname(current_dir)
                    restart_script = os.path.join(project_root, 'restart')
            
            logger.info(f'Project root: {project_root}')
            logger.info(f'Restart script path: {restart_script}')
            logger.info(f'Script exists: {os.path.exists(restart_script)}')
            
            if os.path.exists(restart_script):
                # Make restart script executable
                os.chmod(restart_script, 0o755)
                
                # Start async restart process
                restart_thread = threading.Thread(
                    target=execute_restart_async,
                    args=(mode, restart_type),
                    daemon=True
                )
                restart_thread.start()
                
                logger.info(f'Async restart thread started for mode: {mode}, type: {restart_type}')
                
                return jsonify({
                    'status': 'success',
                    'message': f'Server restart initiated for mode: {mode}, type: {restart_type}',
                    'data': {
                        'mode': mode,
                        'restart_type': restart_type,
                        'timestamp': datetime.now().isoformat(),
                        'restart_id': f'restart_{int(time.time())}',
                        'note': 'Server restart is running in background. Check /api/server/restart-status for progress.',
                        'restart_script_path': restart_script,
                        'project_root': project_root
                    }
                })
            else:
                # Provide manual restart instructions
                logger.warning(f'Restart script not found at: {restart_script}')
                return jsonify({
                    'status': 'success',
                    'message': f'Mode change to {mode} (type: {restart_type}) requested successfully',
                    'data': {
                        'mode': mode,
                        'restart_type': restart_type,
                        'timestamp': datetime.now().isoformat(),
                        'restart_id': f'manual_{int(time.time())}',
                        'note': 'Restart script not found. Please restart manually.',
                        'instructions': f'To apply the {mode} mode with {restart_type} restart, please restart the server manually using: ./restart {restart_type} --cache-mode={mode}',
                        'restart_script_path': restart_script,
                        'project_root': project_root
                    }
                })
                
        except Exception as restart_error:
            logger.error(f'Error starting restart process: {restart_error}')
            
            # Provide manual restart instructions as fallback
            return jsonify({
                'status': 'success',
                'message': f'Mode change to {mode} (type: {restart_type}) requested successfully',
                'data': {
                    'mode': mode,
                    'restart_type': restart_type,
                    'timestamp': datetime.now().isoformat(),
                    'restart_id': f'manual_{int(time.time())}',
                    'note': 'Automatic restart failed. Please restart manually.',
                    'instructions': f'To apply the {mode} mode with {restart_type} restart, please restart the server manually using: ./restart {restart_type} --cache-mode={mode}',
                    'error': str(restart_error)
                }
            })
            
    except Exception as e:
        logger.error(f'Error changing server mode: {e}')
        return jsonify({
            'status': 'error',
            'message': f'Internal server error: {str(e)}'
        }), 500

@server_management_bp.route('/restart-status', methods=['GET'])
def get_restart_status() -> Any:
    """
    Get current restart status
    """
    try:
        return jsonify({
            'status': 'success',
            'data': restart_status
        })
    except Exception as e:
        logger.error(f'Error getting restart status: {e}')
        return jsonify({
            'status': 'error',
            'message': f'Error getting restart status: {str(e)}'
        }), 500

@server_management_bp.route('/current-mode', methods=['GET'])
@handle_database_session()
def get_current_server_mode() -> Any:
    """
    Get current server cache mode based on environment variables
    """
    try:
        # Import settings to check environment variables
        from config.settings import DEVELOPMENT_MODE, CACHE_DISABLED, DEFAULT_CACHE_TTL
        from services.advanced_cache_service import advanced_cache_service
        
        cache_stats = advanced_cache_service.get_stats()
        
        # Determine mode based on environment variables
        if CACHE_DISABLED:
            current_mode = 'no-cache'
        elif DEVELOPMENT_MODE:
            current_mode = 'development'
        elif DEFAULT_CACHE_TTL >= 300:
            current_mode = 'production'
        else:
            current_mode = 'preserve'
        
        return jsonify({
            'status': 'success',
            'data': {
                'mode': current_mode,
                'cache_stats': cache_stats,
                'environment': {
                    'DEVELOPMENT_MODE': DEVELOPMENT_MODE,
                    'CACHE_DISABLED': CACHE_DISABLED,
                    'DEFAULT_CACHE_TTL': DEFAULT_CACHE_TTL
                },
                'timestamp': datetime.now().isoformat()
            }
        })
        
    except Exception as e:
        logger.error(f'Error getting current server mode: {e}')
        return jsonify({
            'status': 'error',
            'message': f'Error getting current mode: {str(e)}'
        }), 500

@server_management_bp.route('/status', methods=['GET'])
@api_endpoint(cache_ttl=30, rate_limit=60)
@handle_database_session()
def get_server_status() -> Any:
    """
    Get comprehensive server status including mode information using base API patterns
    """
    try:
        from config.settings import DEVELOPMENT_MODE, CACHE_DISABLED, DEFAULT_CACHE_TTL
        from services.advanced_cache_service import advanced_cache_service
        from services.health_service import HealthService
        
        # Get cache status
        cache_stats = advanced_cache_service.get_stats()
        cache_health = advanced_cache_service.health_check()
        
        # Get overall health
        overall_health = HealthService().comprehensive_health_check()
        
        # Determine current mode based on environment variables
        if CACHE_DISABLED:
            current_mode = 'no-cache'
        elif DEVELOPMENT_MODE:
            current_mode = 'development'
        elif DEFAULT_CACHE_TTL >= 300:
            current_mode = 'production'
        else:
            current_mode = 'preserve'
        
        return jsonify({
            'status': 'success',
            'data': {
                'server_mode': {
                    'current': current_mode,
                    'cache_stats': cache_stats,
                    'cache_health': cache_health
                },
                'overall_health': overall_health,
                'restart_status': restart_status,
                'timestamp': datetime.now().isoformat()
            }
        })
        
    except Exception as e:
        logger.error(f'Error getting server status: {e}')
        return jsonify({
            'status': 'error',
            'error': {'message': f'Error getting server status: {str(e)}'},
            'version': '1.0'
        }), 500

@server_management_bp.route('/system/info', methods=['GET'])
@api_endpoint(cache_ttl=60, rate_limit=60)
@handle_database_session()
def get_system_info() -> Any:
    """
    Get detailed system information using base API patterns
    """
    try:
        import platform
        import sys
        
        # Server information
        server_info = {
            'version': '2.0.0',
            'environment': 'development',
            'port': 8080,
            'startup_time': datetime.now().isoformat()
        }
        
        # Python information
        python_info = {
            'version': sys.version,
            'flask': '2.3.3',
            'platform': platform.platform()
        }
        
        # OS information
        os_info = {
            'system': platform.system(),
            'architecture': platform.architecture()[0],
            'uptime': 'N/A'  # Would need system-specific implementation
        }
        
        return jsonify({
            'status': 'success',
            'data': {
                'server': server_info,
                'python': python_info,
                'os': os_info,
                'timestamp': datetime.now().isoformat()
            }
        })
        
    except Exception as e:
        logger.error(f'Error getting system info: {e}')
        return jsonify({
            'status': 'error',
            'error': {'message': f'Error getting system info: {str(e)}'},
            'version': '1.0'
        }), 500

@server_management_bp.route('/mode-history', methods=['GET'])
def get_mode_history() -> Any:
    """
    Get server mode change history
    """
    try:
        # Simple hardcoded history for testing - in real implementation this would come from a database
        history = [
            {
                'timestamp': '2025-09-04T12:02:58.000000',
                'mode': 'production',
                'status': 'success',
                'message': 'Mode changed to production successfully'
            },
            {
                'timestamp': '2025-09-03T00:49:03.000000',
                'mode': 'no-cache',
                'status': 'success',
                'message': 'Mode changed to no-cache successfully'
            },
            {
                'timestamp': '2025-09-03T00:40:37.000000',
                'mode': 'no-cache',
                'status': 'success',
                'message': 'Mode changed to no-cache successfully'
            }
        ]
        
        return jsonify({
            'status': 'success',
            'data': {
                'history': history,
                'count': len(history),
                'timestamp': datetime.now().isoformat()
            }
        })
        
    except Exception as e:
        logger.error(f'Error getting mode history: {e}')
        return jsonify({
            'status': 'error',
            'message': f'Error getting mode history: {str(e)}'
        }), 500

@server_management_bp.route('/logs/recent', methods=['GET'])
def get_recent_logs() -> Any:
    """
    Get recent server logs - SIMPLIFIED VERSION
    """
    try:
        # Simple hardcoded logs for testing
        logs = [
            {
                'timestamp': '2025-09-04T12:03:11.000000',
                'level': 'info',
                'message': 'Server monitor page loaded successfully',
                'source': 'server_detailed.log'
            },
            {
                'timestamp': '2025-09-03T00:49:06.000000',
                'level': 'success',
                'message': 'Server restart completed successfully',
                'source': 'server_detailed.log'
            },
            {
                'timestamp': '2025-09-03T00:49:03.000000',
                'level': 'info',
                'message': 'Setting cache mode: no-cache',
                'source': 'server_detailed.log'
            },
            {
                'timestamp': '2025-09-03T00:40:37.000000',
                'level': 'info',
                'message': 'Cache mode changed to: no-cache',
                'source': 'server_detailed.log'
            }
        ]
        
        return jsonify({
            'status': 'success',
            'data': {
                'logs': logs,
                'count': len(logs),
                'timestamp': datetime.now().isoformat()
            }
        })
        
    except Exception as e:
        return jsonify({
            'status': 'success',
            'data': {
                'logs': [],
                'count': 0,
                'timestamp': datetime.now().isoformat()
            }
        })
