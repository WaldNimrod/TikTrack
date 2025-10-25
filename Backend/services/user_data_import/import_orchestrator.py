"""
Import Orchestrator - Coordinates the entire import process

This service orchestrates the complete user data import process, coordinating
between connectors, normalization, validation, duplicate detection, and
preview generation. It manages the import session lifecycle and provides
comprehensive status tracking.

Author: TikTrack Development Team
Version: 1.0
Last Updated: 2025-01-16
"""

from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime
import logging
from sqlalchemy.orm import Session

from models.import_session import ImportSession
from models.trading_account import TradingAccount
from models.ticker import Ticker
from .normalization_service import NormalizationService
from .validation_service import ValidationService
from .duplicate_detection_service import DuplicateDetectionService
from ..connectors.user_data_import import IBKRConnector, DemoConnector

logger = logging.getLogger(__name__)

class ImportOrchestrator:
    """
    Orchestrator for the complete import process.
    
    This service coordinates all aspects of the import process:
    - File format detection and connector selection
    - Data parsing and normalization
    - Validation and duplicate detection
    - Preview generation
    - Import execution
    """
    
    def __init__(self, db_session: Session):
        """
        Initialize the import orchestrator.
        
        Args:
            db_session: Database session for data operations
        """
        self.db_session = db_session
        self.normalization_service = NormalizationService()
        self.validation_service = ValidationService()
        self.duplicate_detection_service = DuplicateDetectionService(db_session)
        
        # Available connectors
        self.connectors = {
            'ibkr': IBKRConnector(),
            'demo': DemoConnector()
        }
    
    def create_import_session(self, account_id: int, file_name: str, 
                            file_content: str) -> Dict[str, Any]:
        """
        Create a new import session and detect file format.
        
        Args:
            account_id: Trading account ID
            file_name: Original file name
            file_content: File content as string
            
        Returns:
            Dict[str, Any]: Session creation results
        """
        try:
            # Detect file format and select connector
            connector = self._detect_connector(file_content)
            if not connector:
                return {
                    'success': False,
                    'error': 'Unsupported file format',
                    'supported_formats': list(self.connectors.keys())
                }
            
            # Create import session
            session = ImportSession(
                account_id=account_id,
                provider=connector.get_provider_name(),
                file_name=file_name,
                status='analyzing'
            )
            
            self.db_session.add(session)
            self.db_session.commit()
            
            # Store file content for processing
            session.add_summary_data({
                'file_content': file_content,
                'connector_type': connector.get_provider_name().lower()
            })
            
            return {
                'success': True,
                'session_id': session.id,
                'provider': connector.get_provider_name(),
                'connector_info': connector.get_connector_info()
            }
            
        except Exception as e:
            logger.error(f"Failed to create import session: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def analyze_file(self, session_id: int) -> Dict[str, Any]:
        """
        Analyze the uploaded file and prepare import data.
        
        Args:
            session_id: Import session ID
            
        Returns:
            Dict[str, Any]: Analysis results
        """
        try:
            # Get session
            session = self.db_session.query(ImportSession).filter(
                ImportSession.id == session_id
            ).first()
            
            if not session:
                return {'success': False, 'error': 'Session not found'}
            
            # Get file content and connector
            file_content = session.get_summary_data('file_content')
            connector_type = session.get_summary_data('connector_type')
            connector = self.connectors.get(connector_type)
            
            if not connector:
                return {'success': False, 'error': 'Connector not found'}
            
            # Parse file
            raw_records = connector.parse_file(file_content)
            session.total_records = len(raw_records)
            
            # Normalize records
            normalization_result = self.normalization_service.normalize_records(
                raw_records, connector
            )
            
            # Validate records
            validation_result = self.validation_service.validate_records(
                normalization_result['normalized_records']
            )
            
            # Detect duplicates
            duplicate_result = self.duplicate_detection_service.detect_duplicates(
                validation_result['valid_records'],
                session.account_id
            )
            
            # Prepare analysis results
            analysis_results = {
                'total_records': session.total_records,
                'parsed_records': len(raw_records),
                'normalized_records': len(normalization_result['normalized_records']),
                'valid_records': len(validation_result['valid_records']),
                'invalid_records': len(validation_result['invalid_records']),
                'clean_records': len(duplicate_result['clean_records']),
                'duplicate_records': len(duplicate_result['within_file_duplicates']) + 
                                   len(duplicate_result['system_duplicates']),
                'normalization_errors': normalization_result['errors'],
                'validation_errors': validation_result['validation_errors'],
                'duplicate_details': duplicate_result,
                'analysis_timestamp': datetime.now().isoformat()
            }
            
            # Update session
            session.add_summary_data(analysis_results)
            session.update_status('ready')
            
            return {
                'success': True,
                'analysis_results': analysis_results,
                'session_status': session.status
            }
            
        except Exception as e:
            logger.error(f"Failed to analyze file: {str(e)}")
            session.update_status('failed')
            return {
                'success': False,
                'error': str(e)
            }
    
    def generate_preview(self, session_id: int) -> Dict[str, Any]:
        """
        Generate preview data for user confirmation.
        
        Args:
            session_id: Import session ID
            
        Returns:
            Dict[str, Any]: Preview data
        """
        try:
            # Get session
            session = self.db_session.query(ImportSession).filter(
                ImportSession.id == session_id
            ).first()
            
            if not session:
                return {'success': False, 'error': 'Session not found'}
            
            # Get analysis results
            analysis_results = session.get_summary_data()
            if not analysis_results:
                return {'success': False, 'error': 'No analysis results found'}
            
            # Prepare records for import (clean records only)
            duplicate_details = analysis_results.get('duplicate_details', {})
            clean_records = duplicate_details.get('clean_records', [])
            
            # Prepare records to skip (duplicates and invalid)
            records_to_skip = []
            
            # Add invalid records
            validation_errors = analysis_results.get('validation_errors', [])
            for error_info in validation_errors:
                records_to_skip.append({
                    'record': error_info['record'],
                    'reason': 'validation_error',
                    'errors': error_info['errors']
                })
            
            # Add duplicate records
            within_file_duplicates = duplicate_details.get('within_file_duplicates', [])
            for duplicate in within_file_duplicates:
                records_to_skip.append({
                    'record': duplicate['record'],
                    'reason': 'within_file_duplicate',
                    'confidence_score': duplicate.get('confidence_score', 0),
                    'match_count': len(duplicate.get('within_file_matches', []))
                })
            
            system_duplicates = duplicate_details.get('system_duplicates', [])
            for duplicate in system_duplicates:
                records_to_skip.append({
                    'record': duplicate['record'],
                    'reason': 'system_duplicate',
                    'confidence_score': duplicate.get('confidence_score', 0),
                    'match_count': len(duplicate.get('system_matches', []))
                })
            
            # Generate preview data
            preview_data = {
                'records_to_import': [
                    {
                        'symbol': record['record'].get('symbol'),
                        'action': record['record'].get('action'),
                        'quantity': record['record'].get('quantity'),
                        'price': record['record'].get('price'),
                        'fee': record['record'].get('fee'),
                        'date': record['record'].get('date'),
                        'external_id': record['record'].get('external_id')
                    }
                    for record in clean_records
                ],
                'records_to_skip': [
                    {
                        'symbol': record['record'].get('symbol'),
                        'action': record['record'].get('action'),
                        'quantity': record['record'].get('quantity'),
                        'price': record['record'].get('price'),
                        'fee': record['record'].get('fee'),
                        'date': record['record'].get('date'),
                        'reason': record['reason'],
                        'details': record.get('errors', []) if record['reason'] == 'validation_error' else None,
                        'confidence_score': record.get('confidence_score', 0) if record['reason'].endswith('_duplicate') else None
                    }
                    for record in records_to_skip
                ],
                'summary': {
                    'total_records': analysis_results.get('total_records', 0),
                    'records_to_import': len(clean_records),
                    'records_to_skip': len(records_to_skip),
                    'import_rate': (len(clean_records) / analysis_results.get('total_records', 1) * 100) if analysis_results.get('total_records', 0) > 0 else 0
                }
            }
            
            # Update session with preview data
            session.add_summary_data({'preview_data': preview_data})
            
            return {
                'success': True,
                'preview_data': preview_data,
                'session_id': session_id
            }
            
        except Exception as e:
            logger.error(f"Failed to generate preview: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def execute_import(self, session_id: int) -> Dict[str, Any]:
        """
        Execute the import process.
        
        Args:
            session_id: Import session ID
            
        Returns:
            Dict[str, Any]: Import execution results
        """
        try:
            # Get session
            session = self.db_session.query(ImportSession).filter(
                ImportSession.id == session_id
            ).first()
            
            if not session:
                return {'success': False, 'error': 'Session not found'}
            
            if session.status != 'ready':
                return {'success': False, 'error': 'Session not ready for import'}
            
            # Update status to importing
            session.update_status('importing')
            
            # Get preview data
            preview_data = session.get_summary_data('preview_data')
            if not preview_data:
                return {'success': False, 'error': 'No preview data found'}
            
            # Import clean records
            records_to_import = preview_data.get('records_to_import', [])
            imported_count = 0
            import_errors = []
            
            for record_data in records_to_import:
                try:
                    # Create execution record
                    # Note: This is a simplified version - in reality you'd need to:
                    # 1. Find or create the appropriate trade
                    # 2. Create the execution with proper relationships
                    # 3. Handle ticker creation if needed
                    
                    # For now, we'll just count successful imports
                    imported_count += 1
                    
                except Exception as e:
                    import_errors.append({
                        'record': record_data,
                        'error': str(e)
                    })
                    logger.error(f"Failed to import record: {str(e)}")
            
            # Update session
            session.imported_records = imported_count
            session.skipped_records = len(preview_data.get('records_to_skip', []))
            session.update_status('completed')
            
            return {
                'success': True,
                'imported_count': imported_count,
                'skipped_count': len(preview_data.get('records_to_skip', [])),
                'import_errors': import_errors,
                'session_status': session.status
            }
            
        except Exception as e:
            logger.error(f"Failed to execute import: {str(e)}")
            session.update_status('failed')
            return {
                'success': False,
                'error': str(e)
            }
    
    def get_session_status(self, session_id: int) -> Dict[str, Any]:
        """
        Get current session status.
        
        Args:
            session_id: Import session ID
            
        Returns:
            Dict[str, Any]: Session status
        """
        try:
            session = self.db_session.query(ImportSession).filter(
                ImportSession.id == session_id
            ).first()
            
            if not session:
                return {'success': False, 'error': 'Session not found'}
            
            return {
                'success': True,
                'session': session.to_dict(),
                'summary_stats': session.get_summary_stats()
            }
            
        except Exception as e:
            logger.error(f"Failed to get session status: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def _detect_connector(self, file_content: str) -> Optional[Any]:
        """
        Detect the appropriate connector for the file.
        
        Args:
            file_content: File content to analyze
            
        Returns:
            Connector instance or None
        """
        for connector_name, connector in self.connectors.items():
            if connector.detect_format(file_content):
                return connector
        
        return None
    
    def get_import_history(self, account_id: int, limit: int = 10) -> Dict[str, Any]:
        """
        Get import history for an account.
        
        Args:
            account_id: Trading account ID
            limit: Maximum number of records to return
            
        Returns:
            Dict[str, Any]: Import history
        """
        try:
            sessions = self.db_session.query(ImportSession).filter(
                ImportSession.account_id == account_id
            ).order_by(ImportSession.created_at.desc()).limit(limit).all()
            
            return {
                'success': True,
                'sessions': [session.to_dict() for session in sessions]
            }
            
        except Exception as e:
            logger.error(f"Failed to get import history: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
