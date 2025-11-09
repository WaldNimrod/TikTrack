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
from pathlib import Path

from config.database import get_db
from config.settings import DB_PATH as CONFIG_DB_PATH
from services.user_data_import import ImportOrchestrator
from models.import_session import ImportSession
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
    
    trading_account_id = request.form.get('trading_account_id')
    if not trading_account_id:
        return jsonify({"error": "Missing trading account ID"}), 400
    
    try:
        trading_account_id = int(trading_account_id)
    except ValueError:
        return jsonify({"error": "Invalid trading account ID"}), 400

    file_content = file.read().decode('utf-8')
    file_name = file.filename

    try:
        # Create database session
        from sqlalchemy import create_engine
        from sqlalchemy.orm import sessionmaker
        database_url = f"sqlite:///{Path(CONFIG_DB_PATH)}"
        engine = create_engine(database_url)
        Session = sessionmaker(bind=engine)
        db_session = Session()
        
        orchestrator = ImportOrchestrator(db_session)
        
        # Create import session first
        session_data = orchestrator.create_import_session(trading_account_id, file_name, file_content)
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
    - trading_account_id: Trading account ID (optional, defaults to first account)
    
    Returns:
        JSON response with session ID and analysis results
    """
    logger.info("🚀 Starting file upload process")
    try:
        # Check if file is present
        if 'file' not in request.files:
            logger.warning("❌ No file provided in request")
            return jsonify({
                'success': False,
                'error': 'No file provided'
            }), 400
        
        file = request.files['file']
        if file.filename == '':
            logger.warning("❌ No file selected")
            return jsonify({
                'success': False,
                'error': 'No file selected'
            }), 400
        
        logger.info(f"📁 File received: {file.filename}")
        
        if not allowed_file(file.filename):
            logger.warning(f"❌ Invalid file type: {file.filename}")
            return jsonify({
                'success': False,
                'error': 'Invalid file type. Only CSV files are allowed'
            }), 400
        
        # Get account ID
        trading_account_id = request.form.get('trading_account_id', type=int)
        logger.info(f"🏦 Trading account ID from request: {trading_account_id}")
        
        if not trading_account_id:
            logger.info("🔍 No trading account provided, using default")
            # Default to first account
            db_session = next(get_db())
            try:
                account = db_session.query(TradingAccount).first()
                if not account:
                    logger.error("❌ No trading accounts found in database")
                    return jsonify({
                        'success': False,
                        'error': 'No trading accounts found'
                    }), 400
                trading_account_id = account.id
                logger.info(f"✅ Using default trading account: {trading_account_id}")
            finally:
                db_session.close()
        
        # Get connector type
        connector_type = request.form.get('connector_type')
        logger.info(f"🔌 Connector type from request: {connector_type}")
        
        if not connector_type:
            logger.error("❌ No connector type provided")
            return jsonify({
                'success': False,
                'error': 'Connector type is required'
            }), 400
        
        # Read file content
        file_content = file.read().decode('utf-8')
        secure_filename(file.filename)
        logger.info(f"📄 File content read successfully, length: {len(file_content)} characters")
        
        # Create import session
        logger.info("🔧 Creating import session...")
        db_session = next(get_db())
        try:
            orchestrator = ImportOrchestrator(db_session)
            logger.info("✅ ImportOrchestrator created successfully")
            
            result = orchestrator.create_import_session(
                trading_account_id=trading_account_id,
                file_name=file.filename,
                file_content=file_content,
                connector_type=connector_type
            )
            logger.info(f"📊 Session creation result: {result}")
            
            if not result['success']:
                logger.error(f"❌ Session creation failed: {result['error']}")
                return jsonify({
                    'success': False,
                    'error': result['error']
                }), 400
            
            logger.info(f"✅ Import session created successfully: {result['session_id']}")
            
            # Analyze file
            logger.info("🔍 Starting file analysis...")
            analysis_result = orchestrator.analyze_file(result['session_id'])
            logger.info(f"📊 Analysis result: {analysis_result}")
            
            if not analysis_result['success']:
                logger.error(f"❌ File analysis failed: {analysis_result['error']}")
                return jsonify({
                    'success': False,
                    'error': analysis_result['error']
                }), 500
            
            logger.info("✅ File analysis completed successfully")
            
            # Note: analyze_file already saves the results to session and commits
            # No need to save again here
            
            response_data = {
                'success': True,
                'session_id': result['session_id'],
                'provider': result['provider'],
                'analysis_results': analysis_result['analysis_results']
            }
            logger.info(f"🎉 Returning success response: {response_data}")
            
            return jsonify(response_data), 200
            
        finally:
            db_session.close()
        
    except Exception as e:
        logger.error(f"💥 File upload failed with exception: {str(e)}", exc_info=True)
        return jsonify({
            'success': False,
            'error': f'File upload failed: {str(e)}'
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

@user_data_import_bp.route('/session/<int:session_id>', methods=['GET'])
def get_session(session_id: int):
    """
    Get session details.
    
    Args:
        session_id: Import session ID
        
    Returns:
        JSON response with session data
    """
    try:
        db_session = next(get_db())
        try:
            session = db_session.query(ImportSession).filter(
                ImportSession.id == session_id
            ).first()
            
            if not session:
                return jsonify({
                    'status': 'error',
                    'message': 'Session not found'
                }), 404
            
            # Try to get summary_data from cache first
            summary_data = None
            try:
                from services.advanced_cache_service import advanced_cache_service
                cache_key = f"import_session_{session_id}_summary"
                summary_data = advanced_cache_service.get(cache_key)
                if summary_data:
                    logger.info(f"✅ Retrieved summary_data from cache: {cache_key}")
                else:
                    logger.info(f"📋 No summary_data in cache: {cache_key}")
            except Exception as e:
                logger.error(f"❌ Failed to get from cache: {str(e)}")
            
            # If not in cache, get from database
            if not summary_data and session.summary_data:
                summary_data = session.summary_data
                logger.info(f"📋 Retrieved summary_data from database")
            
            session_dict = session.to_dict()
            if summary_data:
                session_dict['summary_data'] = summary_data
            
            return jsonify({
                'status': 'success',
                'session': session_dict
            }), 200
            
        finally:
            db_session.close()
            
    except Exception as e:
        logger.error(f"Failed to get session: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'Failed to get session: {str(e)}'
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

@user_data_import_bp.route('/session/<int:session_id>/update-ticker', methods=['POST'])
def update_ticker(session_id: int):
    """
    Update session when a new ticker is added to the system.
    This triggers a recalculation of the preview data.
    
    Args:
        session_id: Import session ID
        
    Returns:
        JSON response with updated preview data
    """
    try:
        data = request.get_json()
        ticker_symbol = data.get('ticker_symbol')
        
        if not ticker_symbol:
            return jsonify({
                'status': 'error',
                'message': 'Ticker symbol is required'
            }), 400
        
        db_session = next(get_db())
        try:
            orchestrator = ImportOrchestrator(db_session)
            
            # Regenerate preview data with the new ticker
            result = orchestrator.generate_preview(session_id)
            
            if not result['success']:
                return jsonify({
                    'status': 'error',
                    'message': result['error']
                }), 400
            
            logger.info(f"✅ Preview recalculated for session {session_id} after adding ticker {ticker_symbol}")
            
            return jsonify({
                'status': 'success',
                'message': f'Ticker {ticker_symbol} added successfully',
                'preview_data': result['preview_data']
            }), 200
            
        finally:
            db_session.close()
            
    except Exception as e:
        logger.error(f"Error updating ticker for session {session_id}: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': 'Failed to update ticker'
        }), 500

@user_data_import_bp.route('/session/<int:session_id>/accept-duplicate', methods=['POST'])
def accept_duplicate(session_id):
    """
    Accept a duplicate record for import (move from skip to import list)
    
    Payload:
        {
            "record_index": int,
            "duplicate_type": "within_file" | "existing_record"
        }
    
    Returns:
        JSON response with success status
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                'success': False,
                'error': 'No data provided'
            }), 400
        
        record_index = data.get('record_index')
        duplicate_type = data.get('duplicate_type')
        
        if record_index is None or not duplicate_type:
            return jsonify({
                'success': False,
                'error': 'Missing required fields: record_index, duplicate_type'
            }), 400
        
        # Get database session
        db_session = next(get_db())
        try:
            # Create import orchestrator
            orchestrator = ImportOrchestrator(db_session)
            
            # Accept the duplicate
            result = orchestrator.accept_duplicate(
                session_id=session_id,
                record_index=record_index,
                duplicate_type=duplicate_type
            )
            
            if result['success']:
                return jsonify({
                    'success': True,
                    'message': 'Duplicate accepted for import'
                })
            else:
                return jsonify({
                    'success': False,
                    'error': result['error']
                }), 400
                
        finally:
            db_session.close()
            
    except Exception as e:
        logger.error(f"Accept duplicate failed: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Accept duplicate failed: {str(e)}'
        }), 500


@user_data_import_bp.route('/session/<int:session_id>/reject-duplicate', methods=['POST'])
def reject_duplicate(session_id):
    """
    Reject a duplicate record (keep in skip list)
    
    Payload:
        {
            "record_index": int,
            "duplicate_type": "within_file" | "existing_record"
        }
    
    Returns:
        JSON response with success status
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                'success': False,
                'error': 'No data provided'
            }), 400
        
        record_index = data.get('record_index')
        duplicate_type = data.get('duplicate_type')
        
        if record_index is None or not duplicate_type:
            return jsonify({
                'success': False,
                'error': 'Missing required fields: record_index, duplicate_type'
            }), 400
        
        # Get database session
        db_session = next(get_db())
        try:
            # Create import orchestrator
            orchestrator = ImportOrchestrator(db_session)
            
            # Reject the duplicate (keep in skip list)
            result = orchestrator.reject_duplicate(
                session_id=session_id,
                record_index=record_index,
                duplicate_type=duplicate_type
            )
            
            if result['success']:
                return jsonify({
                    'success': True,
                    'message': 'Duplicate rejected'
                })
            else:
                return jsonify({
                    'success': False,
                    'error': result['error']
                }), 400
                
        finally:
            db_session.close()
            
    except Exception as e:
        logger.error(f"Reject duplicate failed: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Reject duplicate failed: {str(e)}'
        }), 500


@user_data_import_bp.route('/session/<int:session_id>/refresh-preview', methods=['POST'])
def refresh_preview(session_id):
    """
    Refresh preview data after user actions (ticker added, duplicate accepted, etc.)
    
    Returns:
        JSON response with updated preview data
    """
    try:
        # Get database session
        db_session = next(get_db())
        try:
            # Create import orchestrator
            orchestrator = ImportOrchestrator(db_session)
            
            # Generate fresh preview
            result = orchestrator.generate_preview(session_id)
            
            if result['success']:
                return jsonify({
                    'success': True,
                    'preview_data': result['preview_data']
                })
            else:
                return jsonify({
                    'success': False,
                    'error': result['error']
                }), 400
                
        finally:
            db_session.close()
            
    except Exception as e:
        logger.error(f"Refresh preview failed: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Refresh preview failed: {str(e)}'
        }), 500


@user_data_import_bp.route('/session/<int:session_id>/allow-existing', methods=['POST'])
def allow_existing_record(session_id):
    """Allow importing a record that exists in the system"""
    try:
        data = request.get_json()
        record_index = data.get('record_index')
        
        # Get session
        session = db.session.query(ImportSession).filter_by(id=session_id).first()
        if not session:
            return jsonify({'status': 'error', 'message': 'Session not found'}), 404
        
        # Load preview data
        preview_data = session.preview_data
        if not preview_data:
            return jsonify({'status': 'error', 'message': 'No preview data'}), 400
        
        # Find the record in records_to_skip
        record_to_move = None
        new_skip_list = []
        for skip_record in preview_data.get('records_to_skip', []):
            if skip_record.get('record_index') == record_index and skip_record.get('reason') == 'existing_record':
                record_to_move = skip_record['record']
            else:
                new_skip_list.append(skip_record)
        
        if record_to_move:
            # Move to records_to_import
            preview_data['records_to_import'].append({'record': record_to_move})
            preview_data['records_to_skip'] = new_skip_list
            
            # Mark as "force import existing"
            if 'force_import_existing' not in preview_data:
                preview_data['force_import_existing'] = []
            preview_data['force_import_existing'].append(record_index)
            
            # Save updated preview
            session.preview_data = preview_data
            db.session.commit()
        
        return jsonify({'status': 'success', 'preview_data': preview_data})
        
    except Exception as e:
        logger.error(f"Error allowing existing record: {str(e)}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

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
                'session': result['session']
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
    - trading_account_id: Trading account ID (optional)
    - limit: Maximum number of records (default: 10)
    
    Returns:
        JSON response with import history
    """
    try:
        trading_account_id = request.args.get('trading_account_id', type=int)
        limit = request.args.get('limit', 10, type=int)
        
        if not trading_account_id:
            return jsonify({
                'status': 'error',
                'message': 'trading_account_id parameter is required'
            }), 400
        
        db_session = next(get_db())
        try:
            orchestrator = ImportOrchestrator(db_session)
            result = orchestrator.get_import_history(trading_account_id, limit)
            
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
