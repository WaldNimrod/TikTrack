"""
Server Management API Routes
===========================

API endpoints for server management and configuration
"""

from flask import Blueprint, request, jsonify
import subprocess
import os
import logging
from datetime import datetime
from typing import Any, Dict

# Create blueprint
server_management_bp = Blueprint('server_management', __name__, url_prefix='/api/server')

# Configure logging
logger = logging.getLogger(__name__)

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
        valid_modes = ['development', 'no-cache', 'production', 'preserve']
        
        if mode not in valid_modes:
            return jsonify({
                'status': 'error',
                'message': f'Invalid mode. Must be one of: {", ".join(valid_modes)}'
            }), 400
        
        # Log the mode change request
        logger.info(f'Server mode change requested: {mode}')
        
        # Get the project root directory (one level up from Backend)
        project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        restart_script = os.path.join(project_root, 'restart')
        
        # Log the path for debugging
        logger.info(f'Project root: {project_root}')
        logger.info(f'Restart script path: {restart_script}')
        logger.info(f'Script exists: {os.path.exists(restart_script)}')
        
        # Alternative path check
        if not os.path.exists(restart_script):
            # Try relative path from current working directory
            current_dir = os.getcwd()
            logger.info(f'Current working directory: {current_dir}')
            
            # If we're in Backend directory, go up one level
            if current_dir.endswith('Backend'):
                project_root = os.path.dirname(current_dir)
                restart_script = os.path.join(project_root, 'restart')
                logger.info(f'Adjusted project root: {project_root}')
                logger.info(f'Adjusted restart script path: {restart_script}')
                logger.info(f'Script exists after adjustment: {os.path.exists(restart_script)}')
        
        # Check if restart script exists
        if not os.path.exists(restart_script):
            return jsonify({
                'status': 'error',
                'message': 'Restart script not found'
            }), 500
        
        # Make restart script executable
        os.chmod(restart_script, 0o755)
        
        # Log the mode change request for manual action
        logger.info(f'Server mode change requested: {mode}')
        
        return jsonify({
            'status': 'success',
            'message': f'Server mode change to {mode} requested successfully',
            'data': {
                'mode': mode,
                'timestamp': datetime.now().isoformat(),
                'instructions': f'To apply the {mode} mode, please restart the server manually using: ./restart --cache-mode={mode}',
                'note': 'The server will continue running in the current mode until manually restarted'
            }
        })
        
        # TODO: Uncomment the actual restart logic below when the issue is resolved
        """
        # Execute restart script with the specified mode
        try:
            logger.info(f'Executing restart script: {restart_script} --cache-mode={mode}')
            logger.info(f'Working directory: {project_root}')
            
            # Test if the script can be executed first
            test_result = subprocess.run(
                [restart_script, '--help'],
                capture_output=True,
                text=True,
                cwd=project_root,
                timeout=10
            )
            logger.info(f'Help test result: {test_result.returncode}')
            logger.info(f'Help output: {test_result.stdout[:200]}...')
            
            result = subprocess.run(
                [restart_script, f'--cache-mode={mode}'],
                capture_output=True,
                text=True,
                cwd=project_root,
                timeout=60  # 60 second timeout
            )
            
            if result.returncode == 0:
                logger.info(f'Server mode changed successfully to: {mode}')
                
                return jsonify({
                    'status': 'success',
                    'message': f'Server mode changed to {mode} successfully',
                    'data': {
                        'mode': mode,
                        'timestamp': datetime.now().isoformat(),
                        'output': result.stdout,
                        'return_code': result.returncode
                    }
                })
            else:
                logger.error(f'Restart script failed with return code: {result.returncode}')
                logger.error(f'Error output: {result.stderr}')
                
                return jsonify({
                    'status': 'error',
                    'message': f'Restart script failed with return code: {result.returncode}',
                    'data': {
                        'error_output': result.stderr,
                        'return_code': result.returncode
                    }
                }), 500
                
        except subprocess.TimeoutExpired:
            logger.error('Restart script timed out')
            return jsonify({
                'status': 'error',
                'message': 'Restart script timed out'
            }), 500
            
        except subprocess.SubprocessError as e:
            logger.error(f'Subprocess error: {e}')
            return jsonify({
                'status': 'error',
                'message': f'Subprocess error: {str(e)}'
            }), 500
        """
            
    except Exception as e:
        logger.error(f'Error changing server mode: {e}')
        return jsonify({
            'status': 'error',
            'message': f'Internal server error: {str(e)}'
        }), 500

@server_management_bp.route('/current-mode', methods=['GET'])
def get_current_server_mode() -> Any:
    """
    Get current server cache mode
    """
    try:
        # Get cache statistics to determine current mode
        from services.advanced_cache_service import advanced_cache_service
        
        cache_stats = advanced_cache_service.get_stats()
        
        # Determine mode based on cache behavior
        if cache_stats['total_entries'] == 0 and cache_stats['stats']['sets'] == 0:
            current_mode = 'no-cache'
        elif cache_stats['stats']['hits'] > 0 and cache_stats['hit_rate_percent'] > 20:
            current_mode = 'production'
        elif cache_stats['stats']['hits'] > 0 and cache_stats['hit_rate_percent'] <= 20:
            current_mode = 'development'
        else:
            current_mode = 'preserve'
        
        return jsonify({
            'status': 'success',
            'data': {
                'mode': current_mode,
                'cache_stats': cache_stats,
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
def get_server_status() -> Any:
    """
    Get comprehensive server status including mode information
    """
    try:
        from services.advanced_cache_service import advanced_cache_service
        from services.health_service import HealthService
        
        # Get cache status
        cache_stats = advanced_cache_service.get_stats()
        cache_health = advanced_cache_service.health_check()
        
        # Get overall health
        overall_health = HealthService().comprehensive_health_check()
        
        # Determine current mode
        if cache_stats['total_entries'] == 0 and cache_stats['stats']['sets'] == 0:
            current_mode = 'no-cache'
        elif cache_stats['stats']['hits'] > 0 and cache_stats['hit_rate_percent'] > 20:
            current_mode = 'production'
        elif cache_stats['stats']['hits'] > 0 and cache_stats['hit_rate_percent'] <= 20:
            current_mode = 'development'
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
                'timestamp': datetime.now().isoformat()
            }
        })
        
    except Exception as e:
        logger.error(f'Error getting server status: {e}')
        return jsonify({
            'status': 'error',
            'message': f'Error getting server status: {str(e)}'
        }), 500

