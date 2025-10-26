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
import os
import json
from sqlalchemy.orm import Session

from models.import_session import ImportSession
from models.trading_account import TradingAccount
from models.ticker import Ticker
from .normalization_service import NormalizationService
from .validation_service import ValidationService
from .duplicate_detection_service import DuplicateDetectionService
from services.user_data_import.report_generator import ImportReportGenerator
from connectors.user_data_import.ibkr_connector import IBKRConnector
from connectors.user_data_import.demo_connector import DemoConnector

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
        self.validation_service = ValidationService(db_session)
        self.duplicate_detection_service = DuplicateDetectionService(db_session)
        self.report_generator = ImportReportGenerator()
        
        # Available connectors
        self.connectors = {
            'ibkr': IBKRConnector(),
            'demo': DemoConnector()
        }
    
    def create_live_report(self, session_id: int, user_id: int, 
                          step: str, data: Dict[str, Any] = None) -> str:
        """
        Create or update a live import report.
        
        Args:
            session_id: Import session ID
            user_id: User ID
            step: Current step name
            data: Step-specific data
            
        Returns:
            str: Path to the report file
        """
        try:
            # Get or create report file
            user_dir = self.report_generator.get_user_report_dir(user_id)
            report_filename = f"import_live_report_{session_id}.json"
            report_path = os.path.join(user_dir, report_filename)
            
            # Load existing report or create new one
            if os.path.exists(report_path):
                with open(report_path, 'r', encoding='utf-8') as f:
                    report = json.load(f)
            else:
                report = {
                    "session_info": {
                        "session_id": session_id,
                        "user_id": user_id,
                        "created_at": datetime.now().isoformat(),
                        "report_version": "1.0"
                    },
                    "steps": {},
                    "summary": {
                        "current_step": step,
                        "total_steps": 6,
                        "progress_percentage": 0
                    }
                }
            
            # Update current step
            report["steps"][step] = {
                "timestamp": datetime.now().isoformat(),
                "data": data or {}
            }
            
            # Update progress
            step_number = self._get_step_number(step)
            report["summary"]["current_step"] = step
            report["summary"]["progress_percentage"] = (step_number / 6) * 100
            
            # Save updated report
            with open(report_path, 'w', encoding='utf-8') as f:
                json.dump(report, f, indent=2, ensure_ascii=False)
            
            logger.info(f"Updated live report for session {session_id}, step: {step}")
            return report_path
            
        except Exception as e:
            logger.error(f"Failed to create/update live report: {str(e)}")
            raise
    
    def _get_step_number(self, step: str) -> int:
        """Get step number for progress calculation."""
        step_mapping = {
            "file_upload": 1,
            "account_selection": 2,
            "analysis": 3,
            "problem_resolution": 4,
            "preview": 5,
            "confirmation": 6
        }
        return step_mapping.get(step, 0)
    
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
            self.db_session.commit()
            
            # Create live report for this session
            user_id = 1  # TODO: Get actual user ID from session/auth
            self.create_live_report(
                session_id=session.id,
                user_id=user_id,
                step="file_upload",
                data={
                    "file_name": file_name,
                    "provider": connector.get_provider_name(),
                    "connector_info": connector.get_connector_info()
                }
            )
            
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
            raw_records = connector.parse_file(file_content, session.file_name)
            session.total_records = len(raw_records)
            
            # Normalize records
            normalization_result = self.normalization_service.normalize_records(
                raw_records, connector
            )
            
            # Validate records
            logger.info(f"🔍 Starting validation for {len(normalization_result['normalized_records'])} records")
            validation_result = self.validation_service.validate_records(
                normalization_result['normalized_records']
            )
            logger.info(f"📊 Validation result: {validation_result.get('missing_tickers', 'NOT_FOUND')}")
            
            # Detect duplicates
            duplicate_result = self.duplicate_detection_service.detect_duplicates(
                validation_result['valid_records'],
                session.account_id
            )
            
            # Prepare analysis results for API response (detailed)
            analysis_results = {
                'total_records': session.total_records,
                'parsed_records': len(raw_records),
                'normalized_records': len(normalization_result['normalized_records']),
                'valid_records': len(validation_result['valid_records']),
                'invalid_records': len(validation_result['invalid_records']),
                'clean_records': len(duplicate_result['clean_records']),
                'duplicate_records': len(duplicate_result['within_file_duplicates']) + 
                                   len(duplicate_result['system_duplicates']),
                'missing_tickers': validation_result['missing_tickers'],
                'normalization_errors': normalization_result['errors'],
                'validation_errors': validation_result['validation_errors'],
                'duplicate_details': duplicate_result,
                'analysis_timestamp': datetime.now().isoformat()
            }
            
            # Save only essential summary data to database (not detailed results)
            missing_tickers_data = validation_result.get('missing_tickers', [])
            logger.info(f"🔍 Missing tickers from validation_result: {missing_tickers_data}")
            
            summary_data = {
                'total_records': session.total_records,
                'valid_records': len(validation_result['valid_records']),
                'invalid_records': len(validation_result['invalid_records']),
                'duplicate_records': len(duplicate_result['within_file_duplicates']) + 
                                   len(duplicate_result['system_duplicates']),
                'missing_tickers': missing_tickers_data,
                'analysis_timestamp': datetime.now().isoformat(),
                # Add detailed data for step 4
                'normalization_errors': normalization_result.get('errors', []),
                'validation_errors': validation_result.get('errors', []),
                'duplicate_details': duplicate_result
            }
            logger.info(f"📊 Summary data before saving: missing_tickers={summary_data.get('missing_tickers')}")
            
            # Update session with minimal data
            session.add_summary_data(summary_data)
            session.update_status('ready')
            self.db_session.commit()
            
            # Save to advanced cache service
            try:
                from services.advanced_cache_service import advanced_cache_service
                cache_key = f"import_session_{session_id}_summary"
                advanced_cache_service.set(cache_key, summary_data, ttl=3600)  # 1 hour TTL
                logger.info(f"✅ Saved summary_data to advanced_cache_service: {cache_key}")
            except Exception as e:
                logger.error(f"❌ Failed to save to advanced_cache_service: {str(e)}")
            
            # Update live report with analysis results
            user_id = 1  # TODO: Get actual user ID from session/auth
            self.create_live_report(
                session_id=session.id,
                user_id=user_id,
                step="analysis",
                data=analysis_results
            )
            
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
            logger.info(f"🔍 Starting generate_preview for session {session_id} - NEW CODE VERSION!")
            # Get session
            session = self.db_session.query(ImportSession).filter(
                ImportSession.id == session_id
            ).first()
            
            if not session:
                logger.error(f"❌ Session {session_id} not found")
                return {'success': False, 'error': 'Session not found'}
            
            logger.info(f"✅ Session {session_id} found, status: {session.status}")
            
            # Re-analyze the file to get current data (since we don't store detailed results)
            file_content = session.get_summary_data('file_content')
            connector_type = session.get_summary_data('connector_type')
            logger.info(f"📁 File content length: {len(file_content) if file_content else 0}, connector: {connector_type}")
            
            connector = self.connectors.get(connector_type)
            
            if not connector:
                logger.error(f"❌ Connector {connector_type} not found")
                return {'success': False, 'error': 'Connector not found'}
            
            logger.info(f"✅ Connector {connector_type} found")
            
            # Parse and process the file again
            logger.info(f"🔄 Parsing file: {session.file_name}")
            raw_records = connector.parse_file(file_content, session.file_name)
            logger.info(f"📊 Parsed {len(raw_records)} raw records")
            
            # Normalize records
            logger.info("🔄 Normalizing records...")
            normalization_result = self.normalization_service.normalize_records(
                raw_records, connector
            )
            logger.info(f"📊 Normalized {len(normalization_result['normalized_records'])} records")
            
            # Validate records
            logger.info("🔄 Validating records...")
            validation_result = self.validation_service.validate_records(
                normalization_result['normalized_records']
            )
            logger.info(f"📊 Valid: {len(validation_result['valid_records'])}, Invalid: {len(validation_result['invalid_records'])}, Missing tickers: {len(validation_result.get('missing_tickers', []))}")
            
            # Detect duplicates
            logger.info("🔄 Detecting duplicates...")
            duplicate_result = self.duplicate_detection_service.detect_duplicates(
                validation_result['valid_records'],
                session.account_id
            )
            logger.info(f"📊 Clean: {len(duplicate_result['clean_records'])}, Duplicates: {len(duplicate_result['within_file_duplicates']) + len(duplicate_result['system_duplicates'])}")
            
            # Prepare records for import (clean records only, excluding missing tickers)
            clean_records = duplicate_result['clean_records']
            missing_tickers = validation_result.get('missing_tickers', [])
            
            # Filter out records with missing tickers from clean_records
            original_clean_count = len(clean_records)
            clean_records = [
                record for record in clean_records 
                if record['record'].get('symbol') not in missing_tickers
            ]
            logger.info(f"📊 Clean records: {original_clean_count} -> {len(clean_records)} (filtered out {original_clean_count - len(clean_records)} with missing tickers)")
            
            # Prepare records to skip (duplicates, invalid, and missing tickers)
            records_to_skip = []
            
            # Add invalid records
            validation_errors = validation_result['validation_errors']
            for error_info in validation_errors:
                records_to_skip.append({
                    'record': error_info['record'],
                    'reason': 'validation_error',
                    'errors': error_info['errors']
                })
            
            # Add records with missing tickers
            missing_tickers = validation_result.get('missing_tickers', [])
            valid_records = validation_result['valid_records']
            for record in valid_records:
                if record.get('symbol') in missing_tickers:
                    records_to_skip.append({
                        'record': record,
                        'reason': 'missing_ticker',
                        'missing_ticker': record.get('symbol')
                    })
            
            # Add duplicate records (main record + all matching records)
            within_file_duplicates = duplicate_result['within_file_duplicates']
            for duplicate in within_file_duplicates:
                # Add main duplicate record
                records_to_skip.append({
                    'record': duplicate['record'],
                    'reason': 'within_file_duplicate',
                    'confidence_score': duplicate.get('confidence_score', 0),
                    'match_count': len(duplicate.get('within_file_matches', [])),
                    'details': duplicate  # Add full duplicate details
                })
                
                # Add all matching records
                for match in duplicate.get('within_file_matches', []):
                    records_to_skip.append({
                        'record': match['record'],
                        'reason': 'within_file_duplicate_match',
                        'confidence_score': match.get('confidence', 0),
                        'match_count': 1,
                        'details': match  # Add match details
                    })
            
            system_duplicates = duplicate_result['system_duplicates']
            for duplicate in system_duplicates:
                # Add main duplicate record
                records_to_skip.append({
                    'record': duplicate['record'],
                    'reason': 'system_duplicate',
                    'confidence_score': duplicate.get('confidence_score', 0),
                    'match_count': len(duplicate.get('system_matches', [])),
                    'details': duplicate  # Add full duplicate details
                })
                
                # Add all matching records
                for match in duplicate.get('system_matches', []):
                    records_to_skip.append({
                        'record': match['record'],
                        'reason': 'system_duplicate_match',
                        'confidence_score': match.get('confidence', 0),
                        'match_count': 1,
                        'details': match  # Add match details
                    })
            
            # Calculate total records
            total_records = len(raw_records)
            logger.info(f"📊 Total records: {total_records}")
            logger.info(f"📊 Records to import: {len(clean_records)}")
            logger.info(f"📊 Records to skip: {len(records_to_skip)}")
            
            # Generate preview data
            logger.info("🔄 Generating preview data...")
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
                        'details': record.get('errors', []) if record['reason'] == 'validation_error' else record.get('details'),
                        'confidence_score': record.get('confidence_score', 0) if record['reason'].endswith('_duplicate') else None
                    }
                    for record in records_to_skip
                ],
                'summary': {
                    'total_records': total_records,
                    'records_to_import': len(clean_records),
                    'records_to_skip': len(records_to_skip),
                    'import_rate': (len(clean_records) / total_records * 100) if total_records > 0 else 0,
                    'missing_tickers': validation_result.get('missing_tickers', [])
                }
            }
            
            # Update session with preview data
            logger.info("🔄 Updating session with preview data...")
            session.add_summary_data({'preview_data': preview_data})
            
            logger.info(f"✅ Preview generated successfully: {len(preview_data['records_to_import'])} to import, {len(preview_data['records_to_skip'])} to skip")
            
            return {
                'success': True,
                'preview_data': preview_data,
                'session_id': session_id
            }
            
        except Exception as e:
            logger.error(f"❌ Failed to generate preview: {str(e)}")
            logger.error(f"❌ Exception type: {type(e).__name__}")
            import traceback
            logger.error(f"❌ Traceback: {traceback.format_exc()}")
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
            logger.info(f"🔍 Starting execute_import for session {session_id} - NEW CODE VERSION!")
            
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
            
            # Get preview data by regenerating it
            preview_result = self.generate_preview(session_id)
            if not preview_result['success']:
                return {'success': False, 'error': 'Failed to generate preview data'}
            
            preview_data = preview_result['preview_data']
            
            # Import clean records
            records_to_import = preview_data.get('records_to_import', [])
            imported_count = 0
            import_errors = []
            
            # Enrich records with ticker_ids
            logger.info(f"🔄 Enriching {len(records_to_import)} records with ticker_ids...")
            from services.ticker_service import TickerService
            enriched_records = TickerService.enrich_records_with_ticker_ids(
                self.db_session, records_to_import
            )
            logger.info(f"✅ Enriched {len(enriched_records)} records with ticker_ids")
            
            # Group executions by ticker_id for trade creation
            from collections import defaultdict
            executions_by_ticker = defaultdict(list)
            
            for record_data in enriched_records:
                ticker_id = record_data.get('ticker_id')
                if ticker_id:
                    executions_by_ticker[ticker_id].append(record_data)
                else:
                    logger.warning(f"⚠️ Skipping record without ticker_id: {record_data.get('symbol')}")
            
            logger.info(f"📊 Grouped executions into {len(executions_by_ticker)} tickers")
            
            # Create trades and executions
            for ticker_id, executions in executions_by_ticker.items():
                try:
                    # Create or find trade for this ticker
                    from models.trade import Trade
                    from models.execution import Execution
                    
                    # Create a single trade for all executions of this ticker
                    trade = Trade(
                        ticker_id=ticker_id,
                        trading_account_id=session.account_id,
                        status='active',
                        created_at=datetime.now()
                    )
                    self.db_session.add(trade)
                    self.db_session.flush()  # Get the trade ID
                    
                    # Create executions for this trade
                    for execution_data in executions:
                        # Convert date string to datetime object
                        date_str = execution_data.get('date')
                        if isinstance(date_str, str):
                            from datetime import datetime as dt
                            execution_date = dt.fromisoformat(date_str.replace('Z', '+00:00'))
                        else:
                            execution_date = date_str
                        
                        execution = Execution(
                            trade_id=trade.id,
                            action=execution_data.get('action'),
                            quantity=execution_data.get('quantity'),
                            price=execution_data.get('price'),
                            fee=execution_data.get('fee', 0),
                            date=execution_date,
                            external_id=execution_data.get('external_id'),
                            created_at=datetime.now()
                        )
                        self.db_session.add(execution)
                        imported_count += 1
                    
                    logger.info(f"✅ Created trade {trade.id} with {len(executions)} executions for ticker_id {ticker_id}")
                    
                except Exception as e:
                    import_errors.append({
                        'ticker_id': ticker_id,
                        'executions_count': len(executions),
                        'error': str(e)
                    })
                    logger.error(f"❌ Failed to create trade for ticker_id {ticker_id}: {str(e)}")
            
            # Commit all changes
            self.db_session.commit()
            logger.info(f"✅ Successfully imported {imported_count} executions")
            
            # Update session
            session.imported_records = imported_count
            session.skipped_records = len(preview_data.get('records_to_skip', []))
            session.update_status('completed')
            
            # Save original file to server
            user_id = 1  # TODO: Get actual user ID from session/auth
            file_content = session.get_summary_data('file_content')
            file_name = session.file_name
            
            try:
                saved_file_path = self.report_generator.save_import_file(
                    user_id=user_id,
                    session_id=session_id,
                    file_content=file_content,
                    file_name=file_name,
                    status='completed'
                )
                logger.info(f"Saved import file: {saved_file_path}")
            except Exception as e:
                logger.error(f"Failed to save import file: {str(e)}")
                # Don't fail the import if file saving fails
            
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
            
            # Save original file even if import failed
            try:
                user_id = 1  # TODO: Get actual user ID from session/auth
                file_content = session.get_summary_data('file_content')
                file_name = session.file_name
                
                saved_file_path = self.report_generator.save_import_file(
                    user_id=user_id,
                    session_id=session_id,
                    file_content=file_content,
                    file_name=file_name,
                    status='failed'
                )
                logger.info(f"Saved import file (failed): {saved_file_path}")
            except Exception as save_error:
                logger.error(f"Failed to save import file after error: {str(save_error)}")
            
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
            if connector.identify_file(file_content, 'test.csv'):
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
