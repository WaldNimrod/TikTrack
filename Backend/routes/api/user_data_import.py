"""
User Data Import API Routes

This module provides API endpoints for the user data import system.
It handles file uploads, analysis, preview generation, and import execution.

Author: TikTrack Development Team
Version: 1.0
Last Updated: 2025-01-16
"""

from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
import os
import logging
from datetime import datetime
from typing import Dict, Any

from config.database import get_db
from services.user_data_import import ImportOrchestrator
from models.trading_account import TradingAccount

logger = logging.getLogger(__name__)

# Create blueprint
user_data_import_bp = Blueprint('user_data_import', __name__, url_prefix='/api/user-data-import')

# Allowed file extensions
ALLOWED_EXTENSIONS = {'csv', 'txt'}

def allowed_file(filename: str) -> bool:
    """Check if file extension is allowed"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@user_data_import_bp.route('/upload-and-preview', methods=['POST'])
def upload_and_preview():
    """
    Handles file upload, identifies connector, parses, normalizes, validates,
    detects duplicates, and returns a preview of the data.
    """
    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    account_id = request.form.get('account_id')
    if not account_id:
        return jsonify({"error": "Missing trading account ID"}), 400
    
    try:
        account_id = int(account_id)
    except ValueError:
        return jsonify({"error": "Invalid trading account ID"}), 400

    file_content = file.read().decode('utf-8')
    file_name = file.filename

    try:
        orchestrator = ImportOrchestrator(g.db_session)
        
        # Create import session first
        session_data = orchestrator.create_import_session(account_id, file_name, file_content)
        session_id = session_data['session_id']
        
        # Analyze the file
        analysis_data = orchestrator.analyze_file(session_id)
        
        # Generate preview
        preview_data = orchestrator.generate_preview(session_id)
        
        # Combine results
        result = {
            'session_id': session_id,
            'file_name': file_name,
            'analysis': analysis_data,
            'preview': preview_data
        }
        
        return jsonify(result), 200
    except ValueError as e:
        logger.error(f"Error during file preview: {e}")
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        logger.error(f"Unexpected error during file preview: {e}", exc_info=True)
        return jsonify({"error": "An unexpected error occurred during file analysis."}), 500

@user_data_import_bp.route('/upload', methods=['POST'])
def upload_file():
    """
    Upload a file for import analysis.
    
    Expected form data:
    - file: CSV file to import
    - account_id: Trading account ID (optional, defaults to first account)
    
    Returns:
        JSON response with session ID and analysis results
    """
    try:
        # Check if file is present
        if 'file' not in request.files:
            return jsonify({
                'status': 'error',
                'message': 'No file provided'
            }), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({
                'status': 'error',
                'message': 'No file selected'
            }), 400
        
        if not allowed_file(file.filename):
            return jsonify({
                'status': 'error',
                'message': 'Invalid file type. Only CSV files are allowed'
            }), 400
        
        # Get account ID
        account_id = request.form.get('account_id', type=int)
        if not account_id:
            # Default to first account
            db_session = next(get_db())
            try:
                account = db_session.query(TradingAccount).first()
                if not account:
                    return jsonify({
                        'status': 'error',
                        'message': 'No trading accounts found'
                    }), 400
                account_id = account.id
            finally:
                db_session.close()
        
        # Read file content
        file_content = file.read().decode('utf-8')
        secure_filename(file.filename)
        
        # Create import session
        db_session = next(get_db())
        try:
            orchestrator = ImportOrchestrator(db_session)
            result = orchestrator.create_import_session(
                account_id=account_id,
                file_name=file.filename,
                file_content=file_content
            )
            
            if not result['success']:
                return jsonify({
                    'status': 'error',
                    'message': result['error']
                }), 400
            
            # Analyze file
            analysis_result = orchestrator.analyze_file(result['session_id'])
            
            if not analysis_result['success']:
                return jsonify({
                    'status': 'error',
                    'message': analysis_result['error']
                }), 500
            
            return jsonify({
                'status': 'success',
                'session_id': result['session_id'],
                'provider': result['provider'],
                'analysis_results': analysis_result['analysis_results']
            }), 200
            
        finally:
            db_session.close()
        
    except Exception as e:
        logger.error(f"File upload failed: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'File upload failed: {str(e)}'
        }), 500

@user_data_import_bp.route('/session/<int:session_id>/analyze', methods=['GET'])
def analyze_session(session_id: int):
    """
    Get analysis results for a session.
    
    Args:
        session_id: Import session ID
        
    Returns:
        JSON response with analysis results
    """
    try:
        db_session = next(get_db())
        try:
            orchestrator = ImportOrchestrator(db_session)
            result = orchestrator.analyze_file(session_id)
            
            if not result['success']:
                return jsonify({
                    'status': 'error',
                    'message': result['error']
                }), 400
            
            return jsonify({
                'status': 'success',
                'analysis_results': result['analysis_results']
            }), 200
            
        finally:
            db_session.close()
        
    except Exception as e:
        logger.error(f"Analysis failed: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'Analysis failed: {str(e)}'
        }), 500

@user_data_import_bp.route('/session/<int:session_id>/preview', methods=['GET'])
def get_preview(session_id: int):
    """
    Get preview data for user confirmation.
    
    Args:
        session_id: Import session ID
        
    Returns:
        JSON response with preview data
    """
    try:
        db_session = next(get_db())
        try:
            orchestrator = ImportOrchestrator(db_session)
            result = orchestrator.generate_preview(session_id)
            
            if not result['success']:
                return jsonify({
                    'status': 'error',
                    'message': result['error']
                }), 400
            
            return jsonify({
                'status': 'success',
                'preview_data': result['preview_data']
            }), 200
            
        finally:
            db_session.close()
        
    except Exception as e:
        logger.error(f"Preview generation failed: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'Preview generation failed: {str(e)}'
        }), 500

@user_data_import_bp.route('/session/<int:session_id>/execute', methods=['POST'])
def execute_import(session_id: int):
    """
    Execute the import process.
    
    Args:
        session_id: Import session ID
        
    Returns:
        JSON response with import results
    """
    try:
        db_session = next(get_db())
        try:
            orchestrator = ImportOrchestrator(db_session)
            result = orchestrator.execute_import(session_id)
            
            if not result['success']:
                return jsonify({
                    'status': 'error',
                    'message': result['error']
                }), 400
            
            return jsonify({
                'status': 'success',
                'imported_count': result['imported_count'],
                'skipped_count': result['skipped_count'],
                'import_errors': result['import_errors']
            }), 200
            
        finally:
            db_session.close()
        
    except Exception as e:
        logger.error(f"Import execution failed: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'Import execution failed: {str(e)}'
        }), 500

@user_data_import_bp.route('/session/<int:session_id>/status', methods=['GET'])
def get_session_status(session_id: int):
    """
    Get current session status.
    
    Args:
        session_id: Import session ID
        
    Returns:
        JSON response with session status
    """
    try:
        db_session = next(get_db())
        try:
            orchestrator = ImportOrchestrator(db_session)
            result = orchestrator.get_session_status(session_id)
            
            if not result['success']:
                return jsonify({
                    'status': 'error',
                    'message': result['error']
                }), 404
            
            return jsonify({
                'status': 'success',
                'session': result['session'],
                'summary_stats': result['summary_stats']
            }), 200
            
        finally:
            db_session.close()
        
    except Exception as e:
        logger.error(f"Status retrieval failed: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'Status retrieval failed: {str(e)}'
        }), 500

@user_data_import_bp.route('/history', methods=['GET'])
def get_import_history():
    """
    Get import history for an account.
    
    Query parameters:
    - account_id: Trading account ID (optional)
    - limit: Maximum number of records (default: 10)
    
    Returns:
        JSON response with import history
    """
    try:
        account_id = request.args.get('account_id', type=int)
        limit = request.args.get('limit', 10, type=int)
        
        if not account_id:
            return jsonify({
                'status': 'error',
                'message': 'account_id parameter is required'
            }), 400
        
        db_session = next(get_db())
        try:
            orchestrator = ImportOrchestrator(db_session)
            result = orchestrator.get_import_history(account_id, limit)
            
            if not result['success']:
                return jsonify({
                    'status': 'error',
                    'message': result['error']
                }), 400
            
            return jsonify({
                'status': 'success',
                'sessions': result['sessions']
            }), 200
            
        finally:
            db_session.close()
        
    except Exception as e:
        logger.error(f"History retrieval failed: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'History retrieval failed: {str(e)}'
        }), 500

@user_data_import_bp.route('/supported-formats', methods=['GET'])
def get_supported_formats():
    """
    Get list of supported file formats.
    
    Returns:
        JSON response with supported formats
    """
    try:
        formats = [
            {
                'name': 'IBKR Activity Statement',
                'extension': '.csv',
                'provider': 'Interactive Brokers',
                'description': 'Interactive Brokers Activity Statement CSV file'
            },
            {
                'name': 'Demo CSV',
                'extension': '.csv',
                'provider': 'Demo',
                'description': 'Simple CSV format for testing'
            }
        ]
        
        return jsonify({
            'status': 'success',
            'formats': formats
        }), 200
        
    except Exception as e:
        logger.error(f"Format list retrieval failed: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'Format list retrieval failed: {str(e)}'
        }), 500

@user_data_import_bp.route('/accounts', methods=['GET'])
def get_trading_accounts():
    """
    Get list of trading accounts for import.
    
    Returns:
        JSON response with trading accounts
    """
    try:
        db_session = next(get_db())
        try:
            accounts = db_session.query(TradingAccount).all()
            
            return jsonify({
                'status': 'success',
                'accounts': [account.to_dict() for account in accounts]
            }), 200
            
        finally:
            db_session.close()
        
    except Exception as e:
        logger.error(f"Account list retrieval failed: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'Account list retrieval failed: {str(e)}'
        }), 500
