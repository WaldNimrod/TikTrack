"""
Server Logs API - TikTrack
API endpoints for reading server log files

Features:
- Read-only access to log files
- Maximum 1000 records limit
- File size warning messages
- Read-Only Access (no file locking)
- Support for all server log types

Author: TikTrack Development Team
Version: 1.0
Date: January 2025
"""

from flask import Blueprint, jsonify, request
import os
import logging
from datetime import datetime
from pathlib import Path

# Setup logging
logger = logging.getLogger(__name__)

# Create Blueprint
server_logs_bp = Blueprint('server_logs', __name__)

# Configuration
MAX_RECORDS = 1000
MAX_FILE_SIZE_WARNING = 5 * 1024 * 1024  # 5MB warning threshold
ALLOWED_LOG_TYPES = ['app', 'errors', 'performance', 'database', 'background_tasks', 'cache']
LOG_DIR = Path("logs")

def get_log_file_path(log_type: str) -> Path:
    """Get the full path to a log file"""
    return LOG_DIR / f"{log_type}.log"

def check_file_size_warning(file_path: Path) -> dict:
    """Check if file size requires a warning"""
    try:
        file_size = file_path.stat().st_size
        if file_size > MAX_FILE_SIZE_WARNING:
            return {
                'warning': True,
                'size': file_size,
                'size_mb': round(file_size / (1024 * 1024), 2),
                'message': f'קובץ הלוג גדול ({round(file_size / (1024 * 1024), 2)}MB). ייתכן שהטעינה תהיה איטית.'
            }
        else:
            return {
                'warning': False,
                'size': file_size,
                'size_mb': round(file_size / (1024 * 1024), 2)
            }
    except Exception as e:
        logger.error(f"Error checking file size for {file_path}: {e}")
        return {
            'warning': False,
            'size': 0,
            'size_mb': 0,
            'error': str(e)
        }

def read_log_file_with_limit(file_path: Path, max_lines: int = MAX_RECORDS) -> dict:
    """
    Read log file with line limit (Read-Only Access)
    Returns the last N lines of the file
    """
    try:
        if not file_path.exists():
            return {
                'success': False,
                'error': 'Log file not found',
                'file_path': str(file_path)
            }
        
        # Check file size warning
        size_info = check_file_size_warning(file_path)
        
        # Read file with Read-Only Access (no locking)
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            # Read all lines first
            all_lines = f.readlines()
            
            # Get the last N lines
            if len(all_lines) <= max_lines:
                lines = all_lines
                truncated = False
            else:
                lines = all_lines[-max_lines:]
                truncated = True
            
            content = ''.join(lines)
            
            return {
                'success': True,
                'content': content,
                'total_lines': len(all_lines),
                'returned_lines': len(lines),
                'truncated': truncated,
                'max_lines': max_lines,
                'size_info': size_info,
                'last_modified': datetime.fromtimestamp(file_path.stat().st_mtime).isoformat()
            }
            
    except Exception as e:
        logger.error(f"Error reading log file {file_path}: {e}")
        return {
            'success': False,
            'error': str(e),
            'file_path': str(file_path)
        }

@server_logs_bp.route('/api/logs/raw/background_tasks', methods=['GET'])
def get_background_tasks_log():
    """החזרת לוגים של משימות ברקע מ-app.log"""
    try:
        # Get max lines from query parameter (default: MAX_RECORDS)
        max_lines = request.args.get('max_lines', MAX_RECORDS, type=int)
        if max_lines > MAX_RECORDS:
            max_lines = MAX_RECORDS
        
        # Get app.log file path
        app_log_path = LOG_DIR / "app.log"
        
        if not app_log_path.exists():
            return jsonify({
                'success': False,
                'error': 'App log file not found',
                'file_path': str(app_log_path)
            }), 404
        
        # Check file size warning
        size_info = check_file_size_warning(app_log_path)
        
        # Read app.log and filter background tasks logs
        with open(app_log_path, 'r', encoding='utf-8', errors='ignore') as f:
            all_lines = f.readlines()
            
            # Filter lines that contain background tasks logs
            background_tasks_lines = []
            for line in all_lines:
                if 'services.background_tasks' in line or 'background_task' in line.lower():
                    background_tasks_lines.append(line)
            
            # Get the last N lines
            if len(background_tasks_lines) <= max_lines:
                lines = background_tasks_lines
                truncated = False
            else:
                lines = background_tasks_lines[-max_lines:]
                truncated = True
            
            content = ''.join(lines)
            
            return jsonify({
                'success': True,
                'logType': 'background_tasks',
                'content': content,
                'metadata': {
                    'totalLines': len(background_tasks_lines),
                    'returnedLines': len(lines),
                    'truncated': truncated,
                    'maxLines': max_lines,
                    'lastModified': datetime.fromtimestamp(app_log_path.stat().st_mtime).isoformat(),
                    'sizeInfo': size_info
                },
                'timestamp': datetime.now().isoformat()
            })
            
    except Exception as e:
        logger.error(f"Error reading background tasks log: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@server_logs_bp.route('/api/logs/raw/<log_type>', methods=['GET'])
def get_raw_log_file(log_type):
    """החזרת קובץ לוג גולמי עם הגבלת רשומות"""
    try:
        # Validate log type
        if log_type not in ALLOWED_LOG_TYPES:
            return jsonify({
                'success': False,
                'error': f'Invalid log type. Allowed types: {", ".join(ALLOWED_LOG_TYPES)}'
            }), 400
        
        # Get file path
        log_file_path = get_log_file_path(log_type)
        
        # Get max lines from query parameter (default: MAX_RECORDS)
        max_lines = request.args.get('max_lines', MAX_RECORDS, type=int)
        if max_lines > MAX_RECORDS:
            max_lines = MAX_RECORDS
        
        # Read log file
        result = read_log_file_with_limit(log_file_path, max_lines)
        
        if not result['success']:
            return jsonify({
                'success': False,
                'error': result['error'],
                'logType': log_type,
                'timestamp': datetime.now().isoformat()
            }), 404
        
        # Prepare response
        response = {
            'success': True,
            'logType': log_type,
            'content': result['content'],
            'metadata': {
                'totalLines': result['total_lines'],
                'returnedLines': result['returned_lines'],
                'truncated': result['truncated'],
                'maxLines': result['max_lines'],
                'lastModified': result['last_modified'],
                'sizeInfo': result['size_info']
            },
            'timestamp': datetime.now().isoformat()
        }
        
        # Add warning if file is large
        if result['size_info'].get('warning', False):
            response['warning'] = result['size_info']
        
        logger.info(f"Successfully read {result['returned_lines']} lines from {log_type}.log")
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"Unexpected error in get_raw_log_file for {log_type}: {e}")
        return jsonify({
            'success': False,
            'error': f'Internal server error: {str(e)}',
            'logType': log_type,
            'timestamp': datetime.now().isoformat()
        }), 500

@server_logs_bp.route('/api/logs/raw/<log_type>/tail', methods=['GET'])
def get_raw_log_tail(log_type):
    """החזרת חלק אחרון מקובץ הלוג (לעדכונים מהירים)"""
    try:
        # Validate log type
        if log_type not in ALLOWED_LOG_TYPES:
            return jsonify({
                'success': False,
                'error': f'Invalid log type. Allowed types: {", ".join(ALLOWED_LOG_TYPES)}'
            }), 400
        
        # Get file path
        log_file_path = get_log_file_path(log_type)
        
        # Get lines count from query parameter (default: 100, max: 500)
        lines_count = request.args.get('lines', 100, type=int)
        if lines_count > 500:
            lines_count = 500
        
        # Read log file tail
        result = read_log_file_with_limit(log_file_path, lines_count)
        
        if not result['success']:
            return jsonify({
                'success': False,
                'error': result['error'],
                'logType': log_type,
                'timestamp': datetime.now().isoformat()
            }), 404
        
        # Prepare response
        response = {
            'success': True,
            'logType': log_type,
            'content': result['content'],
            'metadata': {
                'linesCount': result['returned_lines'],
                'totalLines': result['total_lines'],
                'lastModified': result['last_modified'],
                'sizeInfo': result['size_info']
            },
            'timestamp': datetime.now().isoformat()
        }
        
        logger.info(f"Successfully read tail of {lines_count} lines from {log_type}.log")
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"Unexpected error in get_raw_log_tail for {log_type}: {e}")
        return jsonify({
            'success': False,
            'error': f'Internal server error: {str(e)}',
            'logType': log_type,
            'timestamp': datetime.now().isoformat()
        }), 500

@server_logs_bp.route('/api/logs/status', methods=['GET'])
def get_logs_status():
    """החזרת סטטוס כל קבצי הלוג"""
    try:
        status = {}
        
        for log_type in ALLOWED_LOG_TYPES:
            log_file_path = get_log_file_path(log_type)
            
            if log_file_path.exists():
                size_info = check_file_size_warning(log_file_path)
                stat_info = log_file_path.stat()
                
                status[log_type] = {
                    'exists': True,
                    'size': stat_info.st_size,
                    'size_mb': round(stat_info.st_size / (1024 * 1024), 2),
                    'last_modified': datetime.fromtimestamp(stat_info.st_mtime).isoformat(),
                    'warning': size_info.get('warning', False)
                }
            else:
                status[log_type] = {
                    'exists': False,
                    'size': 0,
                    'size_mb': 0,
                    'last_modified': None,
                    'warning': False
                }
        
        return jsonify({
            'success': True,
            'status': status,
            'timestamp': datetime.now().isoformat(),
            'config': {
                'max_records': MAX_RECORDS,
                'max_file_size_warning_mb': MAX_FILE_SIZE_WARNING / (1024 * 1024),
                'allowed_types': ALLOWED_LOG_TYPES
            }
        })
        
    except Exception as e:
        logger.error(f"Error getting logs status: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500
