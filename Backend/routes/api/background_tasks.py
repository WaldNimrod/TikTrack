"""
Background Tasks API Routes - TikTrack
Advanced background task management API endpoints.

This module provides comprehensive API endpoints for:
- Task management and monitoring
- Task execution control
- Progress tracking
- Task history and analytics
- Priority management

Author: TikTrack Development Team
Version: 2.0
Date: September 2025
"""

from flask import Blueprint, jsonify, request, current_app, g
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import logging
from services.background_tasks import BackgroundTaskManager
from utils.performance_monitor import monitor_performance
from utils.error_handlers import handle_database_error, handle_validation_error
from services.advanced_cache_service import cache_for, invalidate_cache

# Import base classes
from .base_entity import BaseEntityAPI
from .base_entity_decorators import api_endpoint, handle_database_session, validate_request
from .base_entity_utils import BaseEntityUtils

logger = logging.getLogger(__name__)

# Background task manager instance will be set from app.py
background_task_manager = None

def set_background_task_manager(manager):
    """Set the background task manager instance from app.py"""
    global background_task_manager
    background_task_manager = manager

# Create blueprint
background_tasks_bp = Blueprint('background_tasks', __name__, url_prefix='/api/background-tasks')

# Initialize base API (background tasks is complex, so we'll use it selectively)

@background_tasks_bp.route('/', methods=['GET'])
@api_endpoint(cache_ttl=30, rate_limit=60)
@handle_database_session()
@monitor_performance("background_tasks_status")
# @cache_for(ttl=30)  # Cache disabled - status needs to be real-time for testing
def get_background_tasks_status():
    """
    Get comprehensive background tasks status using base API patterns
    
    Returns:
        JSON: Complete system status including tasks, scheduler, and performance metrics
    """
    try:
        if background_task_manager is None:
            return jsonify({
                'error': 'Background task manager not initialized',
                'details': 'Manager instance not set from app.py'
            }), 500
            
        status = background_task_manager.get_task_status()
        
        # Add performance metrics
        performance_metrics = {
            'total_tasks': len(status['tasks']),
            'enabled_tasks': sum(1 for task in status['tasks'].values() if task['enabled']),
            'running_tasks': sum(1 for task in status['tasks'].values() if task.get('is_running', False)),
            'success_rate_overall': 0,
            'total_executions': 0
        }
        
        if status['tasks']:
            total_success = sum(task['success_count'] for task in status['tasks'].values())
            total_executions = sum(task['run_count'] for task in status['tasks'].values())
            performance_metrics['total_executions'] = total_executions
            if total_executions > 0:
                performance_metrics['success_rate_overall'] = round((total_success / total_executions) * 100, 2)
        
        status['performance_metrics'] = performance_metrics
        status['system_info'] = {
            'scheduler_running': status['scheduler_running'],
            'uptime': background_task_manager.get_uptime() if hasattr(background_task_manager, 'get_uptime') else 'N/A',
            'memory_usage': background_task_manager.get_memory_usage() if hasattr(background_task_manager, 'get_memory_usage') else 'N/A'
        }
        
        return jsonify({
            'status': 'success',
            'data': status,
            'message': 'Background tasks status retrieved successfully',
            'version': '1.0'
        })
        
    except Exception as e:
        logger.error(f"Error getting background tasks status: {e}")
        return jsonify({
            'status': 'error',
            'error': {'message': f'Failed to get background tasks status: {str(e)}'},
            'version': '1.0'
        }), 500

@background_tasks_bp.route('/tasks', methods=['GET'])
@monitor_performance("background_tasks_list")
# @cache_for(ttl=30)  # Cache disabled - tasks status needs to be real-time for testing
def get_background_tasks():
    """
    Get list of all background tasks with detailed information
    
    Query Parameters:
        - status: Filter by task status (enabled/disabled)
        - type: Filter by task type (scheduled/manual)
        - limit: Limit number of results (default: 50)
        - offset: Offset for pagination (default: 0)
    
    Returns:
        JSON: List of tasks with detailed information
    """
    try:
        # Get query parameters
        status_filter = request.args.get('status')
        task_type = request.args.get('type')
        limit = min(int(request.args.get('limit', 50)), 100)  # Max 100
        offset = max(int(request.args.get('offset', 0)), 0)
        
        tasks = background_task_manager.get_task_status()['tasks']
        
        # Apply filters
        if status_filter:
            if status_filter == 'enabled':
                tasks = {k: v for k, v in tasks.items() if v['enabled']}
            elif status_filter == 'disabled':
                tasks = {k: v for k, v in tasks.items() if not v['enabled']}
        
        # Convert to list and apply pagination
        task_list = list(tasks.items())
        total_tasks = len(task_list)
        paginated_tasks = task_list[offset:offset + limit]
        
        result = {
            'tasks': [{'name': name, **details} for name, details in paginated_tasks],
            'pagination': {
                'total': total_tasks,
                'limit': limit,
                'offset': offset,
                'has_more': offset + limit < total_tasks
            },
            'filters': {
                'status': status_filter,
                'type': task_type
            }
        }
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Error getting background tasks list: {e}")
        return jsonify({
            'error': 'Failed to get background tasks list',
            'details': str(e)
        }), 500

@background_tasks_bp.route('/tasks/<task_name>', methods=['GET'])
@monitor_performance("background_task_details")
@cache_for(ttl=60)  # Cache for 1 minute - individual task details
def get_background_task_details(task_name: str):
    """
    Get detailed information about a specific background task
    
    Args:
        task_name (str): Name of the task
        
    Returns:
        JSON: Detailed task information including history and performance
    """
    try:
        tasks = background_task_manager.get_task_status()['tasks']
        
        if task_name not in tasks:
            return jsonify({
                'error': 'Task not found',
                'task_name': task_name
            }), 404
        
        task_info = tasks[task_name].copy()
        
        # Add execution history
        history = background_task_manager.get_task_history(24)  # Last 24 hours
        task_history = [entry for entry in history if entry.get('task_name') == task_name]
        
        # Add performance analytics
        performance_analytics = {
            'average_duration_ms': 0,
            'success_rate_trend': [],
            'execution_frequency': 0
        }
        
        if task_history:
            durations = [entry.get('duration_ms', 0) for entry in task_history if entry.get('duration_ms')]
            if durations:
                performance_analytics['average_duration_ms'] = round(sum(durations) / len(durations), 2)
            
            # Calculate execution frequency (executions per hour)
            if len(task_history) > 1:
                first_execution = datetime.fromisoformat(task_history[0]['started_at'].replace('Z', '+00:00'))
                last_execution = datetime.fromisoformat(task_history[-1]['started_at'].replace('Z', '+00:00'))
                time_diff = (last_execution - first_execution).total_seconds() / 3600  # hours
                if time_diff > 0:
                    performance_analytics['execution_frequency'] = round(len(task_history) / time_diff, 2)
        
        task_info['history'] = task_history
        task_info['performance_analytics'] = performance_analytics
        
        return jsonify(task_info)
        
    except Exception as e:
        logger.error(f"Error getting task details for {task_name}: {e}")
        return jsonify({
            'error': 'Failed to get task details',
            'task_name': task_name,
            'details': str(e)
        }), 500

@background_tasks_bp.route('/tasks/<task_name>/execute', methods=['POST'])
@monitor_performance("background_task_execute")
def execute_background_task(task_name: str):
    """
    Manually execute a background task
    
    Args:
        task_name (str): Name of the task to execute
        
    Returns:
        JSON: Execution result and status
    """
    try:
        # Check if task exists
        tasks = background_task_manager.get_task_status()['tasks']
        if task_name not in tasks:
            return jsonify({
                'error': 'Task not found',
                'task_name': task_name
            }), 404
        
        # Check if task is enabled
        if not tasks[task_name]['enabled']:
            return jsonify({
                'error': 'Task is disabled',
                'task_name': task_name,
                'suggestion': 'Enable the task before execution'
            }), 400
        
        # Execute task
        execution_id = background_task_manager.run_task(task_name)
        
        # Invalidate cache for background tasks
        invalidate_cache('background_tasks')
        
        return jsonify({
            'message': 'Task execution started',
            'task_name': task_name,
            'execution_id': execution_id,
            'timestamp': datetime.now().isoformat(),
            'status': 'executing'
        })
        
    except Exception as e:
        logger.error(f"Error executing task {task_name}: {e}")
        return jsonify({
            'error': 'Failed to execute task',
            'task_name': task_name,
            'details': str(e)
        }), 500

@background_tasks_bp.route('/tasks/<task_name>/toggle', methods=['POST'])
@monitor_performance("background_task_toggle")
def toggle_background_task(task_name: str):
    """
    Enable or disable a background task
    
    Args:
        task_name (str): Name of the task to toggle
        
    Returns:
        JSON: Updated task status
    """
    try:
        # Check if task exists
        if task_name not in background_task_manager.tasks:
            return jsonify({
                'error': 'Task not found',
                'task_name': task_name
            }), 404
        
        current_status = background_task_manager.tasks[task_name]['enabled']
        new_status = not current_status
        
        # Toggle task status
        logger.info(f"About to toggle task {task_name} from {current_status} to {new_status}")
        if hasattr(background_task_manager, 'toggle_task'):
            logger.info(f"Using toggle_task method")
            background_task_manager.toggle_task(task_name)
        else:
            logger.info(f"Using fallback method")
            # Fallback: update the task status directly
            background_task_manager.tasks[task_name]['enabled'] = new_status
        logger.info(f"Task {task_name} status after toggle: {background_task_manager.tasks[task_name]['enabled']}")
        
        # Invalidate cache for background tasks
        invalidate_cache('background_tasks')
        
        return jsonify({
            'message': f'Task {task_name} {"enabled" if new_status else "disabled"}',
            'task_name': task_name,
            'previous_status': current_status,
            'new_status': new_status,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error toggling task {task_name}: {e}")
        return jsonify({
            'error': 'Failed to toggle task',
            'task_name': task_name,
            'details': str(e)
        }), 500

@background_tasks_bp.route('/scheduler/start', methods=['POST'])
@monitor_performance("background_scheduler_start")
def start_background_scheduler():
    """
    Start the background task scheduler
    
    Returns:
        JSON: Scheduler start result
    """
    try:
        if background_task_manager.running:
            return jsonify({
                'message': 'Scheduler is already running',
                'status': 'running',
                'timestamp': datetime.now().isoformat()
            })
        
        background_task_manager.start_scheduler()
        
        # Invalidate cache for background tasks
        invalidate_cache('background_tasks')
        
        return jsonify({
            'message': 'Background task scheduler started',
            'status': 'started',
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error starting scheduler: {e}")
        return jsonify({
            'error': 'Failed to start scheduler',
            'details': str(e)
        }), 500

@background_tasks_bp.route('/scheduler/stop', methods=['POST'])
@monitor_performance("background_scheduler_stop")
def stop_background_scheduler():
    """
    Stop the background task scheduler
    
    Returns:
        JSON: Scheduler stop result
    """
    try:
        if not background_task_manager.running:
            return jsonify({
                'message': 'Scheduler is already stopped',
                'status': 'stopped',
                'timestamp': datetime.now().isoformat()
            })
        
        background_task_manager.stop_scheduler()
        
        # Invalidate cache for background tasks
        invalidate_cache('background_tasks')
        
        return jsonify({
            'message': 'Background task scheduler stopped',
            'status': 'stopped',
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error stopping scheduler: {e}")
        return jsonify({
            'error': 'Failed to stop scheduler',
            'details': str(e)
        }), 500

@background_tasks_bp.route('/history', methods=['GET'])
@monitor_performance("background_tasks_history")
# @cache_for(ttl=60)  # Cache disabled for debugging
def get_background_tasks_history():
    """
    Get background tasks execution history
    
    Query Parameters:
        - hours: Number of hours to look back (default: 24, max: 168)
        - task_name: Filter by specific task name
        - status: Filter by execution status (success/error)
        - limit: Limit number of results (default: 50, max: 200)
        - offset: Offset for pagination (default: 0)
    
    Returns:
        JSON: Task execution history with pagination
    """
    try:
        # Get query parameters
        hours = min(int(request.args.get('hours', 24)), 168)  # Max 1 week
        task_name = request.args.get('task_name')
        status_filter = request.args.get('status')
        limit = min(int(request.args.get('limit', 50)), 200)  # Max 200
        offset = max(int(request.args.get('offset', 0)), 0)
        
        # Get history
        history = background_task_manager.get_task_history(hours)
        
        # Apply filters
        if task_name:
            history = [entry for entry in history if entry.get('task_name') == task_name]
        
        if status_filter:
            if status_filter == 'success':
                history = [entry for entry in history if entry.get('status') == 'success']
            elif status_filter == 'error':
                history = [entry for entry in history if entry.get('status') == 'error']
        
        # Apply pagination
        total_entries = len(history)
        paginated_history = history[offset:offset + limit]
        
        result = {
            'history': paginated_history,
            'pagination': {
                'total': total_entries,
                'limit': limit,
                'offset': offset,
                'has_more': offset + limit < total_entries
            },
            'filters': {
                'hours': hours,
                'task_name': task_name,
                'status': status_filter
            },
            'summary': {
                'total_executions': total_entries,
                'success_count': sum(1 for entry in history if entry.get('status') == 'success'),
                'error_count': sum(1 for entry in history if entry.get('status') == 'error'),
                'time_range': f'Last {hours} hours'
            }
        }
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Error getting background tasks history: {e}")
        return jsonify({
            'error': 'Failed to get background tasks history',
            'details': str(e)
        }), 500

@background_tasks_bp.route('/analytics', methods=['GET'])
@monitor_performance("background_tasks_analytics")
@cache_for(ttl=120)  # Cache for 2 minutes - analytics don't change frequently
def get_background_tasks_analytics():
    """
    Get comprehensive analytics for background tasks
    
    Query Parameters:
        - period: Analysis period (1d, 7d, 30d, default: 7d)
        - group_by: Grouping method (hour, day, task, default: day)
    
    Returns:
        JSON: Comprehensive analytics and performance metrics
    """
    try:
        period = request.args.get('period', '7d')
        group_by = request.args.get('group_by', 'day')
        
        # Validate parameters
        valid_periods = ['1d', '7d', '30d']
        valid_groupings = ['hour', 'day', 'task']
        
        if period not in valid_periods:
            return jsonify({
                'error': 'Invalid period parameter',
                'valid_periods': valid_periods,
                'provided': period
            }), 400
        
        if group_by not in valid_groupings:
            return jsonify({
                'error': 'Invalid group_by parameter',
                'valid_groupings': valid_groupings,
                'provided': period
            }), 400
        
        # Calculate hours based on period
        period_hours = {'1d': 24, '7d': 168, '30d': 720}[period]
        
        # Get history for analysis
        history = background_task_manager.get_task_history(period_hours)
        
        # Generate analytics
        analytics = {
            'period': period,
            'group_by': group_by,
            'total_executions': len(history),
            'success_rate': 0,
            'average_duration_ms': 0,
            'task_performance': {},
            'time_distribution': {},
            'error_analysis': {}
        }
        
        if history:
            # Calculate success rate
            success_count = sum(1 for entry in history if entry.get('status') == 'success')
            analytics['success_rate'] = round((success_count / len(history)) * 100, 2)
            
            # Calculate average duration
            durations = [entry.get('duration_ms', 0) for entry in history if entry.get('duration_ms')]
            if durations:
                analytics['average_duration_ms'] = round(sum(durations) / len(durations), 2)
            
            # Task performance breakdown
            task_stats = {}
            for entry in history:
                task_name = entry.get('task_name', 'unknown')
                if task_name not in task_stats:
                    task_stats[task_name] = {'executions': 0, 'success': 0, 'errors': 0, 'total_duration': 0}
                
                task_stats[task_name]['executions'] += 1
                if entry.get('status') == 'success':
                    task_stats[task_name]['success'] += 1
                else:
                    task_stats[task_name]['errors'] += 1
                
                task_stats[task_name]['total_duration'] += entry.get('duration_ms', 0)
            
            # Calculate success rates and average durations for each task
            for task_name, stats in task_stats.items():
                analytics['task_performance'][task_name] = {
                    'executions': stats['executions'],
                    'success_rate': round((stats['success'] / stats['executions']) * 100, 2),
                    'average_duration_ms': round(stats['total_duration'] / stats['executions'], 2) if stats['executions'] > 0 else 0
                }
            
            # Time distribution analysis
            time_distribution = {}
            for entry in history:
                try:
                    # Use started_at instead of timestamp
                    started_at = entry.get('started_at')
                    if started_at:
                        # Parse timestamp and group by hour/day based on group_by parameter
                        entry_time = datetime.fromisoformat(started_at.replace('Z', '+00:00'))
                        if group_by == 'hour':
                            time_key = entry_time.strftime('%Y-%m-%d %H:00')
                        elif group_by == 'day':
                            time_key = entry_time.strftime('%Y-%m-%d')
                        else:  # task
                            time_key = entry.get('task_name', 'unknown')
                        
                        if time_key not in time_distribution:
                            time_distribution[time_key] = {'executions': 0, 'success': 0, 'errors': 0}
                        
                        time_distribution[time_key]['executions'] += 1
                        if entry.get('status') == 'success':
                            time_distribution[time_key]['success'] += 1
                        else:
                            time_distribution[time_key]['errors'] += 1
                except Exception as e:
                    logger.warning(f"Error processing time distribution entry: {e}")
                    continue
            
            analytics['time_distribution'] = time_distribution
        
        return jsonify(analytics)
        
    except Exception as e:
        logger.error(f"Error getting background tasks analytics: {e}")
        return jsonify({
            'error': 'Failed to get background tasks analytics',
            'details': str(e)
        }), 500

# Error handlers
@background_tasks_bp.errorhandler(404)
def not_found(error):
    return jsonify({
        'error': 'Background tasks API endpoint not found',
        'available_endpoints': [
            'GET /api/background-tasks/',
            'GET /api/background-tasks/tasks',
            'GET /api/background-tasks/tasks/<task_name>',
            'POST /api/background-tasks/tasks/<task_name>/execute',
            'POST /api/background-tasks/tasks/<task_name>/toggle',
            'POST /api/background-tasks/scheduler/start',
            'POST /api/background-tasks/scheduler/stop',
            'GET /api/background-tasks/history',
            'GET /api/background-tasks/analytics'
        ]
    }), 404

@background_tasks_bp.errorhandler(500)
def internal_error(error):
    logger.error(f"Internal error in background tasks API: {error}")
    return jsonify({
        'error': 'Internal server error in background tasks API',
        'timestamp': datetime.now().isoformat()
    }), 500
