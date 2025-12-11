"""
User Data Import Reports API

Handles report generation, listing, and download for user data import sessions.
Provides endpoints for accessing live reports and historical import reports.

Author: TikTrack Development Team
Version: 1.0
Last Updated: 2025-01-26
"""

from flask import Blueprint, jsonify, request, send_file, abort, g
import os
import json
import logging
from datetime import datetime

from services.user_data_import.report_generator import ImportReportGenerator

logger = logging.getLogger(__name__)

# Create blueprint
user_data_import_reports_bp = Blueprint('user_data_import_reports', __name__)

# Initialize report generator
report_generator = ImportReportGenerator()

@user_data_import_reports_bp.route('/reports', methods=['GET'])
def list_user_reports():
    """
    List all reports for a user.
    
    Returns:
        JSON response with list of user reports
    """
    try:
        user_id = getattr(g, 'user_id', None)
        if user_id is None:
            return jsonify({
                'status': 'error',
                'message': 'Authentication required'
            }), 401
        reports = report_generator.get_user_reports(user_id)
        
        return jsonify({
            'status': 'success',
            'reports': reports,
            'total_count': len(reports)
        }), 200
        
    except Exception as e:
        logger.error(f"Failed to list user reports: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@user_data_import_reports_bp.route('/reports/<int:session_id>', methods=['GET'])
def get_live_report(session_id):
    """
    Get live report for a specific session.
    
    Args:
        session_id: Import session ID
        
    Returns:
        JSON response with live report data
    """
    try:
        user_id = getattr(g, 'user_id', None)
        if user_id is None:
            return jsonify({
                'status': 'error',
                'message': 'Authentication required'
            }), 401
        report_filename = f"import_live_report_{session_id}.json"
        report_path = report_generator.get_report_file_path(user_id, report_filename)
        
        if not os.path.exists(report_path):
            return jsonify({
                'status': 'error',
                'message': 'Live report not found'
            }), 404
        
        with open(report_path, 'r', encoding='utf-8') as f:
            report_data = json.load(f)
        
        return jsonify({
            'status': 'success',
            'report': report_data
        }), 200
        
    except Exception as e:
        logger.error(f"Failed to get live report: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@user_data_import_reports_bp.route('/reports/<int:session_id>/download', methods=['GET'])
def download_report(session_id):
    """
    Download a specific report file.
    
    Args:
        session_id: Import session ID
        
    Returns:
        File download response
    """
    try:
        user_id = getattr(g, 'user_id', None)
        if user_id is None:
            return jsonify({
                'status': 'error',
                'message': 'Authentication required'
            }), 401
        report_type = request.args.get('type', 'live')  # 'live' or 'final'
        
        if report_type == 'live':
            report_filename = f"import_live_report_{session_id}.json"
        else:
            # Look for final report
            reports = report_generator.get_user_reports(user_id)
            final_report = None
            for report in reports:
                if report.get('session_id') == session_id:
                    final_report = report
                    break
            
            if not final_report:
                return jsonify({
                    'status': 'error',
                    'message': 'Final report not found'
                }), 404
            
            report_filename = final_report['filename']
        
        report_path = report_generator.get_report_file_path(user_id, report_filename)
        
        if not os.path.exists(report_path):
            return jsonify({
                'status': 'error',
                'message': 'Report file not found'
            }), 404
        
        # Generate download filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        download_filename = f"import_report_{session_id}_{timestamp}.json"
        
        return send_file(
            report_path,
            as_attachment=True,
            download_name=download_filename,
            mimetype='application/json'
        )
        
    except Exception as e:
        logger.error(f"Failed to download report: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@user_data_import_reports_bp.route('/reports/<int:session_id>/finalize', methods=['POST'])
def finalize_report(session_id):
    """
    Finalize a live report and create a final report.
    
    Args:
        session_id: Import session ID
        
    Returns:
        JSON response with finalization results
    """
    try:
        user_id = getattr(g, 'user_id', None)
        if user_id is None:
            return jsonify({
                'status': 'error',
                'message': 'Authentication required'
            }), 401
        data = request.get_json() or {}
        
        # Get live report
        report_filename = f"import_live_report_{session_id}.json"
        report_path = report_generator.get_report_file_path(user_id, report_filename)
        
        if not os.path.exists(report_path):
            return jsonify({
                'status': 'error',
                'message': 'Live report not found'
            }), 404
        
        with open(report_path, 'r', encoding='utf-8') as f:
            live_report = json.load(f)
        
        # Create final report
        final_report_path = report_generator.generate_import_report(
            session_id=session_id,
            user_id=user_id,
            analysis_results=live_report.get('steps', {}).get('analysis', {}).get('data', {}),
            preview_data=live_report.get('steps', {}).get('preview', {}).get('data', {}),
            execution_results=data.get('execution_results', {})
        )
        
        # Remove live report (optional)
        if data.get('remove_live_report', False):
            os.remove(report_path)
        
        return jsonify({
            'status': 'success',
            'final_report_path': final_report_path,
            'message': 'Report finalized successfully'
        }), 200
        
    except Exception as e:
        logger.error(f"Failed to finalize report: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@user_data_import_reports_bp.route('/reports/<int:session_id>/files', methods=['GET'])
def list_session_files(session_id):
    """
    List all files for a specific session.
    
    Args:
        session_id: Import session ID
        
    Returns:
        JSON response with list of session files
    """
    try:
        user_id = getattr(g, 'user_id', None)
        if user_id is None:
            return jsonify({
                'status': 'error',
                'message': 'Authentication required'
            }), 401
        user_dir = report_generator.get_user_report_dir(user_id)
        
        if not os.path.exists(user_dir):
            return jsonify({
                'status': 'success',
                'files': []
            }), 200
        
        # Find all files for this session
        session_files = []
        for filename in os.listdir(user_dir):
            if f"session_{session_id}" in filename:
                file_path = os.path.join(user_dir, filename)
                file_stat = os.stat(file_path)
                session_files.append({
                    'filename': filename,
                    'size': file_stat.st_size,
                    'created': datetime.fromtimestamp(file_stat.st_ctime).isoformat(),
                    'modified': datetime.fromtimestamp(file_stat.st_mtime).isoformat()
                })
        
        return jsonify({
            'status': 'success',
            'files': session_files,
            'total_count': len(session_files)
        }), 200
        
    except Exception as e:
        logger.error(f"Failed to list session files: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@user_data_import_reports_bp.route('/reports/<int:session_id>/files/<filename>', methods=['GET'])
def download_session_file(session_id, filename):
    """
    Download a specific session file.
    
    Args:
        session_id: Import session ID
        filename: File name to download
        
    Returns:
        File download response
    """
    try:
        user_id = getattr(g, 'user_id', None)
        if user_id is None:
            return jsonify({
                'status': 'error',
                'message': 'Authentication required'
            }), 401
        user_dir = report_generator.get_user_report_dir(user_id)
        file_path = os.path.join(user_dir, filename)
        
        if not os.path.exists(file_path):
            return jsonify({
                'status': 'error',
                'message': 'File not found'
            }), 404
        
        # Verify the file belongs to this session
        if f"session_{session_id}" not in filename:
            return jsonify({
                'status': 'error',
                'message': 'File does not belong to this session'
            }), 403
        
        return send_file(
            file_path,
            as_attachment=True,
            download_name=filename,
            mimetype='application/octet-stream'
        )
        
    except Exception as e:
        logger.error(f"Failed to download session file: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@user_data_import_reports_bp.route('/reports/cleanup', methods=['POST'])
def cleanup_old_reports():
    """
    Clean up old reports for a user.
    
    Returns:
        JSON response with cleanup results
    """
    try:
        user_id = getattr(g, 'user_id', None)
        if user_id is None:
            return jsonify({
                'status': 'error',
                'message': 'Authentication required'
            }), 401
        days_to_keep = request.args.get('days', 30, type=int)
        
        report_generator.cleanup_old_reports(user_id, days_to_keep)
        
        return jsonify({
            'status': 'success',
            'message': f'Cleaned up reports older than {days_to_keep} days'
        }), 200
        
    except Exception as e:
        logger.error(f"Failed to cleanup reports: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500
