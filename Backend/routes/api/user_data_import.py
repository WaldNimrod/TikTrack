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
from services.user_data_import.session_manager import ImportSessionManager
from models.import_session import ImportSession
from models.trading_account import TradingAccount
from services.date_normalization_service import DateNormalizationService
from services.preferences_service import PreferencesService

logger = logging.getLogger(__name__)

# Create blueprint
user_data_import_bp = Blueprint('user_data_import', __name__, url_prefix='/api/user-data-import')

_preferences_service = PreferencesService()
_utc_storage_normalizer = DateNormalizationService("UTC")


def _get_date_normalizer():
    timezone_name = DateNormalizationService.resolve_timezone(
        request,
        preferences_service=_preferences_service
    )
    return DateNormalizationService(timezone_name)


def _project_storage_payload(payload):
    if payload is None:
        return None
    try:
        raw_payload = _utc_storage_normalizer.normalize_input_payload(payload)
    except Exception:
        raw_payload = payload
    normalizer = _get_date_normalizer()
    return normalizer.normalize_output(raw_payload)

# Allowed file extensions
ALLOWED_EXTENSIONS = {'csv', 'txt'}

def allowed_file(filename: str) -> bool:
    """Check if file extension is allowed"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def _resolve_default_trading_account(db_session):
    """Return the first available trading account (preferring open accounts)."""
    account = db_session.query(TradingAccount).filter(
        TradingAccount.status == 'open'
    ).order_by(TradingAccount.id.asc()).first()
    if not account:
        account = db_session.query(TradingAccount).order_by(TradingAccount.id.asc()).first()
    return account

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

    task_type = (request.form.get('task_type') or 'executions').strip().lower()
    connector_type = (request.form.get('connector_type') or 'ibkr').strip().lower()

    file_content = file.read().decode('utf-8')
    file_name = file.filename

    try:
        # Create database session
        from sqlalchemy import create_engine
        from sqlalchemy.orm import sessionmaker
        engine = create_engine('sqlite:///db/simpleTrade_new.db')
        Session = sessionmaker(bind=engine)
        db_session = Session()
        
        orchestrator = ImportOrchestrator(db_session)
        
        # Create import session first
        session_data = orchestrator.create_import_session(
            trading_account_id,
            file_name,
            file_content,
            connector_type=connector_type,
            task_type=task_type
        )
        session_id = session_data['session_id']
        
        # Analyze the file
        analysis_data_raw = orchestrator.analyze_file(session_id, task_type)
        if not analysis_data_raw.get('success'):
            status_code = 400 if analysis_data_raw.get('error_code') == 'ACCOUNT_LINK_REQUIRED' else 500
            analysis_data_raw.setdefault('session_id', session_id)
            return jsonify(analysis_data_raw), status_code
        
        # Generate preview
        preview_data_raw = orchestrator.generate_preview(session_id, task_type)
        if not preview_data_raw.get('success'):
            status_code = 400 if preview_data_raw.get('error_code') == 'ACCOUNT_LINK_REQUIRED' else 500
            preview_data_raw.setdefault('session_id', session_id)
            return jsonify(preview_data_raw), status_code

        normalizer = _get_date_normalizer()
        analysis_data = normalizer.normalize_output(analysis_data_raw)
        preview_data = normalizer.normalize_output(preview_data_raw)
        
        # Combine results
        result = {
            'session_id': session_id,
            'file_name': file_name,
            'task_type': task_type,
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
    - connector_type: Selected connector key (ibkr/demo/…)
    - task_type: Selected task key (executions/cashflows/account_reconciliation)
    
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
        
        # Get connector/task type
        connector_type = (request.form.get('connector_type') or 'ibkr').strip().lower()
        task_type = (request.form.get('task_type') or 'executions').strip().lower()
        logger.info(f"🔌 Connector type: {connector_type}, Task: {task_type}")
        
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

            binding_info = orchestrator.detect_account_binding(connector_type, file_content)
            matched_account = binding_info.get('matched_account')
            trading_account = matched_account or _resolve_default_trading_account(db_session)
            if not trading_account:
                logger.error("❌ No trading accounts found while preparing session")
                return jsonify({
                    'success': False,
                    'error': 'No trading accounts found'
                }), 400
            trading_account_id = trading_account.id
            linking_context = {
                'file_account_number': binding_info.get('file_account_number'),
                'matched_account_id': matched_account.id if matched_account else None,
                'account_metadata': binding_info.get('account_metadata')
            }
            
            result = orchestrator.create_import_session(
                trading_account_id=trading_account_id,
                file_name=file.filename,
                file_content=file_content,
                connector_type=connector_type,
                task_type=task_type,
                linking_context=linking_context
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
            analysis_result_raw = orchestrator.analyze_file(result['session_id'], task_type)
            logger.info(f"📊 Analysis result: {analysis_result_raw}")
            
            if not analysis_result_raw.get('success'):
                logger.warning(
                    "⚠️ File analysis did not complete",
                    extra={'session_id': result['session_id'], 'details': analysis_result_raw}
                )
                error_payload = dict(analysis_result_raw)
                error_payload['success'] = False
                error_payload.setdefault('session_id', result['session_id'])
                status_code = 400 if error_payload.get('error_code') == 'ACCOUNT_LINK_REQUIRED' else 500
                return jsonify(error_payload), status_code
            
            logger.info("✅ File analysis completed successfully")
            
            normalizer = _get_date_normalizer()
            analysis_result = normalizer.normalize_output(analysis_result_raw)
            
            response_data = {
                'success': True,
                'session_id': result['session_id'],
                'provider': result['provider'],
                'task_type': task_type,
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

@user_data_import_bp.route('/precheck', methods=['POST'])
def precheck_import_file():
    """
    Lightweight file validation triggered immediately after the user selects a file.
    Each connector can run its own structural checks before the full analysis pipeline begins.
    """
    if 'file' not in request.files:
        return jsonify({
            'success': False,
            'error': 'No file provided'
        }), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({
            'success': False,
            'error': 'No file selected'
        }), 400

    if not allowed_file(file.filename):
        return jsonify({
            'success': False,
            'error': 'Invalid file type. Only CSV files are allowed'
        }), 400

    connector_type = (request.form.get('connector_type') or 'ibkr').strip().lower()
    task_type = (request.form.get('task_type') or 'executions').strip().lower()

    try:
        file_content = file.read().decode('utf-8')
    except UnicodeDecodeError:
        file_content = file.read().decode('utf-8', errors='ignore')

    db_session = next(get_db())
    try:
        orchestrator = ImportOrchestrator(db_session)
        connector = orchestrator.connectors.get(connector_type)
        if not connector:
            return jsonify({
                'success': False,
                'error': f'Unsupported connector type: {connector_type}'
            }), 400

        result = connector.precheck_file(
            file_content=file_content,
            file_name=file.filename,
            task_type=task_type
        )
        if not isinstance(result, dict):
            result = {'success': False, 'error': 'Connector precheck returned an invalid response'}

        success = bool(result.get('success'))
        payload = {
            'success': success,
            'message': result.get('message') or ('הקובץ עבר בדיקה ראשונית בהצלחה.' if success else ''),
            'warnings': result.get('warnings') or [],
            'errors': result.get('errors') or []
        }
        status_code = 200 if success else 400
        return jsonify(payload), status_code
    except Exception as exc:
        logger.error("File precheck failed: %s", exc, exc_info=True)
        return jsonify({
            'success': False,
            'error': 'בדיקת הקובץ נכשלה. נסה שוב או בדוק את הקובץ.'
        }), 500
    finally:
        db_session.close()

@user_data_import_bp.route('/session/<int:session_id>/analyze', methods=['GET'])
def analyze_session(session_id: int):
    """
    Get analysis results for a session.
    
    Args:
        session_id: Import session ID
    """
    try:
        task_type = request.args.get('task_type')
        db_session = next(get_db())
        try:
            orchestrator = ImportOrchestrator(db_session)
            result_raw = orchestrator.analyze_file(session_id, task_type)
            
            if not result_raw.get('success'):
                status_code = 400 if result_raw.get('error_code') == 'ACCOUNT_LINK_REQUIRED' else 500
                return jsonify(result_raw), status_code

            normalizer = _get_date_normalizer()
            result = normalizer.normalize_output(result_raw)
            
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
            
            session_dict = _project_storage_payload(session.to_dict())
            if summary_data:
                session_dict['summary_data'] = _project_storage_payload(summary_data)
            
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


@user_data_import_bp.route('/session/<int:session_id>/link-account', methods=['POST'])
def link_trading_account(session_id: int):
    """
    Link the selected trading account to the broker account number detected in the uploaded file.
    The request body may include an optional `account_number` to override the detected value,
    but the server will still validate that a number exists.
    """
    payload = request.get_json(silent=True) or {}
    override_account_number = payload.get('account_number')
    target_trading_account_id = payload.get('trading_account_id')
    confirm_overwrite = bool(payload.get('confirm_overwrite'))

    try:
        db_session = next(get_db())
        try:
            orchestrator = ImportOrchestrator(db_session)
            result = orchestrator.link_trading_account_to_file(
                session_id,
                override_account_number,
                target_trading_account_id=target_trading_account_id,
                confirm_overwrite=confirm_overwrite
            )
            status_code = 200 if result.get('success') else 400
            return jsonify(result), status_code
        finally:
            db_session.close()
    except Exception as exc:
        logger.error("Failed to link trading account: %s", exc, exc_info=True)
        return jsonify({
            'success': False,
            'error': f'Failed to link account: {exc}'
        }), 500

@user_data_import_bp.route('/session/<int:session_id>/account-link/status', methods=['GET'])
def get_account_link_status(session_id: int):
    """Return the current account-linking status for a session."""
    try:
        db_session = next(get_db())
        try:
            orchestrator = ImportOrchestrator(db_session)
            result = orchestrator.get_account_link_status(session_id)
            status_code = 200 if result.get('success') else 400
            return jsonify(result), status_code
        finally:
            db_session.close()
    except Exception as exc:
        logger.error("Failed to fetch account link status: %s", exc, exc_info=True)
        return jsonify({
            'success': False,
            'error': f'Failed to fetch account link status: {exc}'
        }), 500

@user_data_import_bp.route('/session/<int:session_id>/account-link/confirm', methods=['POST'])
def confirm_account_link(session_id: int):
    """Confirm a recognized trading account before continuing the import."""
    try:
        db_session = next(get_db())
        try:
            orchestrator = ImportOrchestrator(db_session)
            result = orchestrator.confirm_account_link(session_id)
            status_code = 200 if result.get('success') else 400
            return jsonify(result), status_code
        finally:
            db_session.close()
    except Exception as exc:
        logger.error("Failed to confirm account link: %s", exc, exc_info=True)
        return jsonify({
            'success': False,
            'error': f'Failed to confirm account link: {exc}'
        }), 500

@user_data_import_bp.route('/session/<int:session_id>/account-link/select', methods=['POST'])
def select_account_link(session_id: int):
    """Link the session to a user-selected trading account and set the broker number."""
    payload = request.get_json(silent=True) or {}
    override_account_number = payload.get('account_number')
    target_trading_account_id = payload.get('trading_account_id')
    confirm_overwrite = bool(payload.get('confirm_overwrite'))

    try:
        db_session = next(get_db())
        try:
            orchestrator = ImportOrchestrator(db_session)
            result = orchestrator.link_trading_account_to_file(
                session_id,
                override_account_number,
                target_trading_account_id=target_trading_account_id,
                confirm_overwrite=confirm_overwrite
            )
            status_code = 200 if result.get('success') else 400
            return jsonify(result), status_code
        finally:
            db_session.close()
    except Exception as exc:
        logger.error("Failed to select trading account: %s", exc, exc_info=True)
        return jsonify({
            'success': False,
            'error': f'Failed to select account: {exc}'
        }), 500

@user_data_import_bp.route('/sessions/active', methods=['GET'])
def get_active_import_session():
    """
    Get the latest active import session (ready/importing/analyzing).
    """
    try:
        statuses_param = request.args.get('statuses')
        if statuses_param:
            statuses = [status.strip() for status in statuses_param.split(',') if status.strip()]
        else:
            statuses = None
        
        db_session = next(get_db())
        try:
            manager = ImportSessionManager(db_session)
            session = manager.get_latest_active_session(statuses)
            
            if not session:
                return jsonify({
                    'success': True,
                    'session': None
                }), 200
            
            session_dict = session.to_dict()
            summary_stats = session.get_summary_stats()

            session_payload = _project_storage_payload(session_dict)
            summary_payload = _project_storage_payload(summary_stats)

            return jsonify({
                'success': True,
                'session': session_payload,
                'summary': summary_payload
            }), 200
        
        finally:
            db_session.close()
    
    except Exception as e:
        logger.error(f"Failed to fetch active import session: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Failed to fetch active session: {str(e)}'
        }), 500

@user_data_import_bp.route('/session/<int:session_id>/preview', methods=['GET'])
def get_preview(session_id: int):
    """
    Get preview data for user confirmation.
    
    Args:
        session_id: Import session ID
    
    Query params:
        task_type: Optional override for task type
    
    Returns:
        JSON response with preview data
    """
    try:
        task_type = request.args.get('task_type')
        db_session = next(get_db())
        try:
            orchestrator = ImportOrchestrator(db_session)
            result_raw = orchestrator.generate_preview(session_id, task_type)
            
            if not result_raw.get('success'):
                status_code = 400 if result_raw.get('error_code') == 'ACCOUNT_LINK_REQUIRED' else 500
                return jsonify(result_raw), status_code

            normalizer = _get_date_normalizer()
            result = normalizer.normalize_output(result_raw)
            
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
            result_raw = orchestrator.generate_preview(session_id)
            
            if not result_raw['success']:
                return jsonify({
                    'status': 'error',
                    'message': result_raw['error']
                }), 400
            
            logger.info(f"✅ Preview recalculated for session {session_id} after adding ticker {ticker_symbol}")

            normalizer = _get_date_normalizer()
            result = normalizer.normalize_output(result_raw)
            
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
            orchestrator = ImportOrchestrator(db_session)

            snapshot = orchestrator.get_preview_snapshot(session_id)
            if not snapshot or not snapshot.get('success'):
                # Fallback: regenerate preview if snapshot unavailable
                snapshot = orchestrator.generate_preview(session_id)

            if snapshot and snapshot.get('success'):
                normalizer = _get_date_normalizer()
                normalized_preview = normalizer.normalize_output({
                    'preview_data': snapshot['preview_data']
                })
                return jsonify({
                    'success': True,
                    'preview_data': normalized_preview['preview_data']
                })

            status_code = 400 if snapshot and snapshot.get('error_code') == 'ACCOUNT_LINK_REQUIRED' else 500
            return jsonify(snapshot or {
                'success': False,
                'error': 'Failed to refresh preview'
            }), status_code
                
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
        try:
            preview_data = _utc_storage_normalizer.normalize_input_payload(preview_data)
        except Exception:
            # Fallback to original structure if normalization fails
            preview_data = session.preview_data
        
        # Find the record in records_to_skip
        record_to_move = None
        new_skip_list = []
        for skip_record in preview_data.get('records_to_skip', []):
            if skip_record.get('record_index') == record_index and skip_record.get('reason') == 'existing_record':
                record_to_move = skip_record.get('record') or skip_record
            else:
                new_skip_list.append(skip_record)
        
        if record_to_move:
            records_to_import = preview_data.get('records_to_import', []) or []
            use_wrapped_format = any(isinstance(item, dict) and 'record' in item for item in records_to_import)

            if use_wrapped_format:
                records_to_import.append({'record': record_to_move})
            else:
                records_to_import.append(record_to_move)

            preview_data['records_to_import'] = records_to_import
            preview_data['records_to_skip'] = new_skip_list
            
            # Mark as "force import existing"
            if 'force_import_existing' not in preview_data:
                preview_data['force_import_existing'] = []
            preview_data['force_import_existing'].append(record_index)
            
            # Save updated preview
            session.preview_data = _utc_storage_normalizer.normalize_output(preview_data)
            db.session.commit()
        
        projected_preview = _project_storage_payload(preview_data)
        return jsonify({'status': 'success', 'preview_data': projected_preview})
        
    except Exception as e:
        logger.error(f"Error allowing existing record: {str(e)}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

@user_data_import_bp.route('/session/<int:session_id>/execute', methods=['POST'])
def execute_import(session_id: int):
    """
    Execute the import process.
    
    Args:
        session_id: Import session ID
    
    Body params:
        task_type: Optional override for task type
        generate_report: Whether to generate a report after import
    
    Returns:
        JSON response with import results
    """
    try:
        payload = request.get_json(silent=True) or {}
        task_type = payload.get('task_type')
        db_session = next(get_db())
        try:
            orchestrator = ImportOrchestrator(db_session)
            result_raw = orchestrator.execute_import(session_id, task_type)
            
            if not result_raw.get('success'):
                status_code = 400 if result_raw.get('error_code') == 'ACCOUNT_LINK_REQUIRED' else 400
                return jsonify(result_raw), status_code

            normalizer = _get_date_normalizer()
            result = normalizer.normalize_output(result_raw)
            
            return jsonify({
                'status': 'success',
                'imported_count': result['imported_count'],
                'skipped_count': result['skipped_count'],
                'import_errors': result['import_errors'],
                'task_type': result.get('task_type')
            }), 200
            
        finally:
            db_session.close()
        
    except Exception as e:
        logger.error(f"Import execution failed: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'Import execution failed: {str(e)}'
        }), 500

@user_data_import_bp.route('/session/<int:session_id>/reset', methods=['POST'])
def reset_import_session(session_id: int):
    """
    Reset (cancel) an import session and clear cached artifacts.
    """
    try:
        db_session = next(get_db())
        try:
            orchestrator = ImportOrchestrator(db_session)
            result = orchestrator.reset_session(session_id)
            
            if not result['success']:
                status_code = 404 if result.get('error') == 'Session not found' else 400
                return jsonify({
                    'status': 'error',
                    'message': result.get('error', 'Failed to reset session')
                }), status_code
            
            return jsonify({
                'status': 'success',
                'cancelled_sessions': result.get('cancelled_sessions', [])
            }), 200
        
        finally:
            db_session.close()
    
    except Exception as e:
        logger.error(f"Failed to reset import session {session_id}: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'Failed to reset session: {str(e)}'
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
            result_raw = orchestrator.get_session_status(session_id)
            
            if not result_raw['success']:
                return jsonify({
                    'status': 'error',
                    'message': result_raw['error']
                }), 404

            session_payload = _project_storage_payload(result_raw.get('session'))
            summary_stats_payload = _project_storage_payload(result_raw.get('summary_stats'))
            result = result_raw.copy()
            result['session'] = session_payload
            result['summary_stats'] = summary_stats_payload
            
            return jsonify({
                'status': 'success',
                'session': result['session'],
                'summary_stats': result.get('summary_stats')
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
            result_raw = orchestrator.get_import_history(trading_account_id, limit)
            
            if not result_raw['success']:
                return jsonify({
                    'status': 'error',
                    'message': result_raw['error']
                }), 400

            sessions_payload = _project_storage_payload(result_raw.get('sessions'))
            
            return jsonify({
                'status': 'success',
                'sessions': sessions_payload
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
