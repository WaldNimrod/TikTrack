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
from datetime import datetime, timezone
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
from services.date_normalization_service import DateNormalizationService
from services.advanced_cache_service import advanced_cache_service

from config.logging import get_logger
logger = get_logger(__name__)

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
        self.utc_normalizer = DateNormalizationService("UTC")
        
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
                        "created_at": self.utc_normalizer.now_envelope(),
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
                "timestamp": self.utc_normalizer.now_envelope(),
                "data": self.utc_normalizer.normalize_output(data) if data else {}
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
    
    def create_import_session(self, trading_account_id: int, file_name: str, 
                            file_content: str, connector_type: str) -> Dict[str, Any]:
        """
        Create a new import session with specified connector.
        
        Args:
            trading_account_id: Trading account ID
            file_name: Original file name
            file_content: File content as string
            connector_type: Type of connector to use ('ibkr', 'demo', etc.)
            
        Returns:
            Dict[str, Any]: Session creation results
        """
        logger.info(f"🔧 [Session Creation] Starting import session creation", 
                   extra={'trading_account_id': trading_account_id, 'file_name': file_name, 'connector_type': connector_type})
        try:
            # Get connector by type
            connector = self.connectors.get(connector_type)
            if not connector:
                logger.error(f"❌ Unsupported connector type: {connector_type}. Supported: {list(self.connectors.keys())}")
                return {
                    'success': False,
                    'error': f'Unsupported connector type: {connector_type}',
                    'supported_formats': list(self.connectors.keys())
                }
            
            logger.info(f"✅ Connector found: {connector.get_provider_name()}")
            
            # Validate file format with selected connector
            logger.info("🔍 Validating file format with selected connector...")
            if not connector.identify_file(file_content, file_name):
                logger.error(f"❌ File format does not match connector {connector_type}")
                return {
                    'success': False,
                    'error': f'File format does not match selected connector ({connector_type}). Please check your file format or select a different connector.',
                    'connector_type': connector_type,
                    'expected_format': connector.get_connector_info().get('format_description', 'Unknown format')
                }
            
            logger.info("✅ File format validated successfully")
            
            # Create import session
            logger.info("📝 Creating database session...")
            session = ImportSession(
                trading_account_id=trading_account_id,
                provider=connector.get_provider_name(),
                file_name=file_name,
                status='analyzing'
            )
            
            self.db_session.add(session)
            self.db_session.commit()
            logger.info(f"✅ Import session created in database: {session.id}")
            
            # Store file content for processing
            logger.info("💾 Storing file content and connector info...")
            session.add_summary_data({
                'file_content': file_content,
                'connector_type': connector_type
            })
            self.db_session.commit()
            logger.info("✅ File content stored successfully")
            
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

    def _resolve_datetime(self, value: Any) -> Optional[datetime]:
        """
        Normalize date/time values (DateEnvelope, ISO string, datetime) to a datetime object.
        """
        if value is None:
            return None

        if isinstance(value, datetime):
            return value

        if isinstance(value, str):
            cleaned = value.replace('Z', '+00:00')
            try:
                return datetime.fromisoformat(cleaned)
            except ValueError:
                try:
                    return datetime.strptime(cleaned, '%Y-%m-%d')
                except ValueError:
                    return None

        if isinstance(value, dict):
            for key in ('utc', 'iso', 'value'):
                if value.get(key):
                    resolved = self._resolve_datetime(value[key])
                    if resolved:
                        return resolved
            if value.get('local'):
                resolved = self._resolve_datetime(value['local'])
                if resolved:
                    return resolved

        return None
    
    def analyze_file(self, session_id: int) -> Dict[str, Any]:
        """
        Analyze the uploaded file and prepare import data.
        
        Args:
            session_id: Import session ID
            
        Returns:
            Dict[str, Any]: Analysis results
        """
        logger.info(f"🔍 [File Analysis] Starting file analysis", 
                   extra={'session_id': session_id})
        try:
            # Get session
            session = self.db_session.query(ImportSession).filter(
                ImportSession.id == session_id
            ).first()
            
            if not session:
                logger.error(f"❌ Session {session_id} not found")
                return {'success': False, 'error': 'Session not found'}
            
            logger.info(f"✅ Session found: {session.id}, status: {session.status}")
            
            # Get file content and connector
            file_content = session.get_summary_data('file_content')
            connector_type = session.get_summary_data('connector_type')
            logger.info(f"📄 File content length: {len(file_content) if file_content else 0}, connector: {connector_type}")
            
            connector = self.connectors.get(connector_type)
            
            if not connector:
                logger.error(f"❌ Connector {connector_type} not found")
                return {'success': False, 'error': 'Connector not found'}
            
            logger.info(f"✅ Connector found: {connector.get_provider_name()}")
            
            # Parse file
            logger.info("📊 [File Analysis] Parsing file", 
                       extra={'session_id': session_id, 'file_name': session.file_name})
            raw_records = connector.parse_file(file_content, session.file_name)
            session.total_records = len(raw_records)
            logger.info(f"✅ File parsed: {len(raw_records)} records found")
            
            # Normalize records
            logger.info("🔄 [File Analysis] Normalizing records", 
                       extra={'session_id': session_id, 'raw_records_count': len(raw_records)})
            normalization_result = self.normalization_service.normalize_records(
                raw_records, connector
            )
            logger.info(f"✅ Normalization completed: {len(normalization_result['normalized_records'])} records")
            
            # Validate records
            logger.info("🔍 [File Analysis] Validating records", 
                       extra={'session_id': session_id, 'normalized_records_count': len(normalization_result['normalized_records'])})
            validation_result = self.validation_service.validate_records(
                normalization_result['normalized_records']
            )
            logger.info(f"📊 Validation result: {validation_result.get('missing_tickers', 'NOT_FOUND')}")
            
            # Detect duplicates
            logger.info("🔍 [File Analysis] Detecting duplicates", 
                       extra={'session_id': session_id, 'valid_records_count': len(validation_result['valid_records'])})
            duplicate_result = self.duplicate_detection_service.detect_duplicates(
                validation_result['valid_records'],
                session.trading_account_id
            )
            logger.info(f"✅ Duplicate detection completed: {len(duplicate_result['clean_records'])} clean records")
            
            # Prepare analysis results for API response (detailed)
            # Calculate missing ticker records count
            raw_missing_tickers = validation_result.get('missing_tickers') or []
            if isinstance(raw_missing_tickers, (list, tuple, set)):
                missing_tickers = [item for item in raw_missing_tickers if item not in (None, '')]
            elif raw_missing_tickers in (None, ''):
                missing_tickers = []
            else:
                missing_tickers = [raw_missing_tickers]

            first_missing_entry = next(
                (item for item in missing_tickers if item is not None),
                None
            )

            if isinstance(first_missing_entry, dict):
                missing_ticker_symbols = [
                    ticker.get('symbol')
                    for ticker in missing_tickers
                    if isinstance(ticker, dict) and ticker.get('symbol')
                ]
            else:
                missing_ticker_symbols = [
                    str(symbol) for symbol in missing_tickers
                    if isinstance(symbol, str) and symbol
                ]
            missing_ticker_records = 0
            for record in validation_result['valid_records']:
                if record.get('symbol') in missing_ticker_symbols:
                    missing_ticker_records += 1
            
            logger.info(f"📊 Missing ticker analysis: {len(missing_tickers)} missing tickers, {missing_ticker_records} records with missing tickers")
            
            analysis_timestamp = datetime.now(timezone.utc)

            analysis_results_raw = {
                'total_records': session.total_records,
                'parsed_records': len(raw_records),
                'normalized_records': len(normalization_result['normalized_records']),
                'valid_records': len(validation_result['valid_records']),
                'invalid_records': len(validation_result['invalid_records']),
                'clean_records': len(duplicate_result['clean_records']),
                'duplicate_records': len(duplicate_result['within_file_duplicates']),
                'missing_tickers': missing_tickers,
                'missing_ticker_records': missing_ticker_records,
                'existing_records': len(duplicate_result['existing_records']),
                'normalization_errors': normalization_result['errors'],
                'validation_errors': validation_result['validation_errors'],
                'duplicate_details': duplicate_result,
                'analysis_timestamp': analysis_timestamp
            }

            analysis_results_storage = self.utc_normalizer.normalize_output(analysis_results_raw)
            
            # Save only essential summary data to database (not detailed results)
            missing_tickers_data = missing_tickers
            logger.info(f"🔍 Missing tickers from validation_result: {missing_tickers_data}")
            
            summary_data_raw = {
                'total_records': session.total_records,
                'valid_records': len(validation_result['valid_records']),
                'invalid_records': len(validation_result['invalid_records']),
                'duplicate_records': len(duplicate_result['within_file_duplicates']),
                'existing_records': len(duplicate_result['existing_records']),
                'missing_tickers': missing_tickers_data,
                'analysis_timestamp': analysis_timestamp,
                # Add detailed data for step 4
                'normalization_errors': normalization_result.get('errors', []),
                'validation_errors': validation_result.get('validation_errors', []),
                'duplicate_details': duplicate_result
            }

            summary_data_storage = self.utc_normalizer.normalize_output(summary_data_raw)
            logger.info(f"📊 Summary data before saving: missing_tickers={summary_data_storage.get('missing_tickers')}")
            
            # Update session with minimal data
            session.add_summary_data(summary_data_storage)
            session.update_status('ready')
            self.db_session.commit()
            
            # Save to advanced cache service
            try:
                from services.advanced_cache_service import advanced_cache_service
                cache_key = f"import_session_{session_id}_summary"
                advanced_cache_service.set(cache_key, summary_data_storage, ttl=3600)  # 1 hour TTL
                logger.info(f"✅ Saved summary_data to advanced_cache_service: {cache_key}")
            except Exception as e:
                logger.error(f"❌ Failed to save to advanced_cache_service: {str(e)}")
            
            # Update live report with analysis results
            user_id = 1  # TODO: Get actual user ID from session/auth
            self.create_live_report(
                session_id=session.id,
                user_id=user_id,
                step="analysis",
                data=analysis_results_storage
            )
            
            logger.info("🎉 [File Analysis] Analysis completed successfully", 
                       extra={'session_id': session_id, 'total_records': analysis_results_raw['total_records'], 
                             'valid_records': analysis_results_raw['valid_records'], 
                             'duplicate_records': analysis_results_raw['duplicate_records'],
                             'missing_tickers_count': len(analysis_results_raw['missing_tickers'])})
            
            return {
                'success': True,
                'analysis_results': analysis_results_raw,
                'session_status': session.status
            }
            
        except Exception as e:
            logger.error("💥 [File Analysis] Analysis failed", 
                        extra={'session_id': session_id, 'error': str(e), 'error_type': type(e).__name__}, 
                        exc_info=True)
            if 'session' in locals():
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
                session.trading_account_id
            )
            logger.info(f"📊 Clean: {len(duplicate_result['clean_records'])}, Duplicates: {len(duplicate_result['within_file_duplicates']) + len(duplicate_result['existing_records'])}")
            
            # Prepare records for import (clean records only, excluding missing tickers)
            clean_records = duplicate_result['clean_records']
            raw_missing_tickers_preview = validation_result.get('missing_tickers') or []
            if isinstance(raw_missing_tickers_preview, (list, tuple, set)):
                missing_tickers = [
                    item for item in raw_missing_tickers_preview
                    if item not in (None, '')
                ]
            elif raw_missing_tickers_preview in (None, ''):
                missing_tickers = []
            else:
                missing_tickers = [raw_missing_tickers_preview]

            missing_ticker_symbols = []
            for entry in missing_tickers:
                if isinstance(entry, dict):
                    symbol = entry.get('symbol')
                    if symbol:
                        missing_ticker_symbols.append(symbol)
                elif isinstance(entry, str) and entry:
                    missing_ticker_symbols.append(entry)
            
            # Filter out records with missing tickers from clean_records
            original_clean_count = len(clean_records)
            clean_records = [
                record for record in clean_records 
                if record['record'].get('symbol') not in missing_ticker_symbols
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
            valid_records = validation_result['valid_records']
            for record in valid_records:
                if record.get('symbol') in missing_ticker_symbols:
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
            
            # Add records with existing matches
            for existing in duplicate_result.get('existing_records', []):
                records_to_skip.append({
                    'record_index': existing['record_index'],
                    'record': existing['record'],
                    'reason': 'existing_record',
                    'matches': existing.get('system_matches', [])
                })
            
            # Calculate total records
            total_records = len(raw_records)
            logger.info(f"📊 Total records: {total_records}")
            logger.info(f"📊 Records to import: {len(clean_records)}")
            logger.info(f"📊 Records to skip: {len(records_to_skip)}")
            
            # Generate preview data
            logger.info("🔄 Generating preview data...")
            preview_data_raw = {
                'records_to_import': [
                    {
                        'symbol': record['record'].get('symbol'),
                        'action': record['record'].get('action'),
                        'quantity': record['record'].get('quantity'),
                        'price': record['record'].get('price'),
                        'fee': record['record'].get('fee'),
                        'date': record['record'].get('date'),
                        'external_id': record['record'].get('external_id'),
                        'realized_pl': record['record'].get('realized_pl'),
                        'mtm_pl': record['record'].get('mtm_pl')
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
                        'confidence_score': record.get('confidence_score', 0) if record['reason'].endswith('_duplicate') else None,
                        'realized_pl': record['record'].get('realized_pl'),
                        'mtm_pl': record['record'].get('mtm_pl')
                    }
                    for record in records_to_skip
                ],
                'summary': {
                    'total_records': total_records,
                    'records_to_import': len(clean_records),
                    'records_to_skip': len(records_to_skip),
                    'import_rate': (len(clean_records) / total_records * 100) if total_records > 0 else 0,
                    'missing_tickers': validation_result.get('missing_tickers', []),
                    'duplicate_records': len(duplicate_result.get('within_file_duplicates', [])),
                    'existing_records': len(duplicate_result.get('existing_records', []))
                }
            }
            
            # Update session with preview data
            logger.info("🔄 Updating session with preview data...")
            preview_data_storage = self.utc_normalizer.normalize_output(preview_data_raw)
            session.add_summary_data({'preview_data': preview_data_storage})
            
            logger.info(f"✅ Preview generated successfully: {len(preview_data_raw['records_to_import'])} to import, {len(preview_data_raw['records_to_skip'])} to skip")
            
            return {
                'success': True,
                'preview_data': preview_data_raw,
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
        Execute the import process and persist executions.
        """
        try:
            logger.info(f"🔍 Starting execute_import for session {session_id}")
            
            import_session = self.db_session.query(ImportSession).filter(
                ImportSession.id == session_id
            ).first()
            
            if not import_session:
                logger.error(f"❌ Session {session_id} not found")
                return {'success': False, 'error': 'Session not found'}
            
            if import_session.status not in ['ready', 'importing']:
                logger.warning(f"⚠️ Session {session_id} is not ready for import (status={import_session.status})")
                return {'success': False, 'error': 'Session not ready for import'}
            
            import_session.update_status('importing')
            self.db_session.flush()
            
            preview_result = self.generate_preview(session_id)
            if not preview_result['success']:
                error_message = preview_result.get('error', 'Failed to generate preview data')
                logger.error(f"❌ Failed to regenerate preview for session {session_id}: {error_message}")
                import_session.update_status('failed')
                self.db_session.commit()
                return {'success': False, 'error': error_message}
            
            preview_data = preview_result['preview_data']
            records_to_import = preview_data.get('records_to_import', []) or []
            logger.info(f"📦 Session {session_id}: {len(records_to_import)} records ready for enrichment")
            
            if not records_to_import:
                logger.warning(f"⚠️ No records_to_import found for session {session_id}")
                import_session.imported_records = 0
                import_session.skipped_records = len(preview_data.get('records_to_skip', []))
                import_session.update_status('failed')
                self.db_session.commit()
                return {
                    'success': False,
                    'error': 'No records available for import. Resolve validation issues or add missing tickers before retrying.',
                    'import_errors': ['No records available for import after preview regeneration.']
                }
            
            from sqlalchemy import func
            from models.execution import Execution
            from services.ticker_service import TickerService
            
            initial_execution_count = self.db_session.query(func.count(Execution.id)).scalar() or 0
            
            enriched_records = TickerService.enrich_records_with_ticker_ids(
                self.db_session, records_to_import
            )
            logger.info(f"✅ Session {session_id}: {len(enriched_records)} records enriched with ticker IDs")
            
            if not enriched_records:
                logger.warning(f"⚠️ Enrichment returned zero records for session {session_id}")
                import_session.imported_records = 0
                import_session.skipped_records = len(preview_data.get('records_to_skip', []))
                import_session.update_status('failed')
                self.db_session.commit()
                return {
                    'success': False,
                    'error': 'No records were ready for import after enrichment. Ensure all tickers exist in the system.',
                    'import_errors': ['Ticker enrichment failed for all records.']
                }
            
            imported_count = 0
            import_errors: List[str] = []
            
            for index, execution_data in enumerate(enriched_records):
                try:
                    execution_date = self._resolve_datetime(execution_data.get('date'))
                    if not execution_date:
                        raise ValueError(f"Invalid execution date: {execution_data.get('date')}")
                    
                    filename = import_session.file_name or 'unknown_file'
                    import_timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
                    unique_execution_id = f"{filename}_{import_timestamp}_{execution_data.get('external_id', 'exec')}"
                    
                    execution = Execution(
                        ticker_id=execution_data.get('ticker_id'),
                        trading_account_id=import_session.trading_account_id,
                        trade_id=None,
                        action=execution_data.get('action'),
                        quantity=execution_data.get('quantity'),
                        price=execution_data.get('price'),
                        fee=execution_data.get('fee', 0),
                        date=execution_date,
                        external_id=unique_execution_id,
                        source='ibkr_import',
                        realized_pl=execution_data.get('realized_pl'),
                        mtm_pl=execution_data.get('mtm_pl'),
                        created_at=datetime.utcnow()
                    )
                    self.db_session.add(execution)
                    imported_count += 1
                except Exception as record_error:
                    logger.error(f"❌ Failed to prepare execution #{index + 1}: {record_error}", exc_info=True)
                    import_errors.append(f"Execution #{index + 1} failed: {record_error}")
            
            if imported_count == 0:
                raise ValueError("No execution records were created during import.")
            
            import_session.imported_records = imported_count
            import_session.skipped_records = len(preview_data.get('records_to_skip', []))
            
            self.db_session.flush()
            current_execution_count = self.db_session.query(func.count(Execution.id)).scalar() or 0
            actual_inserted = current_execution_count - initial_execution_count
            
            if actual_inserted != imported_count:
                raise ValueError(
                    f"Imported {imported_count} records but detected {actual_inserted} new executions in database."
                )
            
            import_session.update_status('completed')
            self.db_session.commit()
            logger.info(f"✅ Session {session_id}: imported {imported_count} executions successfully")
            
            if import_errors:
                logger.warning(f"⚠️ Session {session_id} completed with warnings: {import_errors}")
            
            try:
                advanced_cache_service.invalidate_pattern('executions')
                advanced_cache_service.invalidate_pattern('trades')
                advanced_cache_service.invalidate_pattern('dashboard')
                logger.info(f"♻️ Cache invalidated after import for session {session_id}")
            except Exception as cache_error:
                logger.warning(f"⚠️ Cache invalidation failed after import: {cache_error}")
            
            try:
                saved_file_path = self.report_generator.save_import_file(
                    user_id=1,
                    session_id=session_id,
                    file_content=import_session.get_summary_data('file_content'),
                    file_name=import_session.file_name,
                    status='completed'
                )
                logger.info(f"🗂️ Saved import file for session {session_id}: {saved_file_path}")
            except Exception as save_error:
                logger.error(f"Failed to save import file after completion: {save_error}")
            
            return {
                'success': True,
                'imported_count': imported_count,
                'skipped_count': len(preview_data.get('records_to_skip', [])),
                'import_errors': import_errors,
                'session_status': import_session.status
            }
        
        except Exception as error:
            logger.error(f"Failed to execute import for session {session_id}: {error}", exc_info=True)
            self.db_session.rollback()
            
            try:
                failure_session = self.db_session.query(ImportSession).filter(
                    ImportSession.id == session_id
                ).first()
                if failure_session:
                    failure_session.update_status('failed')
                    self.db_session.commit()
            except Exception as status_error:
                logger.error(f"Failed to update session status after error: {status_error}", exc_info=True)
                self.db_session.rollback()
            
            try:
                file_content = None
                file_name = None
                if 'import_session' in locals():
                    file_content = import_session.get_summary_data('file_content')
                    file_name = import_session.file_name
                saved_file_path = self.report_generator.save_import_file(
                    user_id=1,
                    session_id=session_id,
                    file_content=file_content,
                    file_name=file_name,
                    status='failed'
                )
                logger.info(f"🗂️ Saved import file for failed session {session_id}: {saved_file_path}")
            except Exception as save_error:
                logger.error(f"Failed to save import file after failure: {save_error}")
            
            return {
                'success': False,
                'error': str(error)
            }

    def reset_session(self, session_id: int) -> Dict[str, Any]:
        """
        Reset (cancel) an import session and remove cached data.
        """
        logger.info(f"🔄 Resetting import session {session_id} and cancelling all active sessions")
        
        try:
            active_statuses = ['created', 'analyzing', 'ready', 'importing']
            active_sessions = self.db_session.query(ImportSession).filter(
                ImportSession.status.in_(active_statuses)
            ).all()
            
            if not active_sessions:
                logger.info("ℹ️ No active import sessions found to cancel")
                return {'success': True, 'cancelled_sessions': []}
            
            cancelled_sessions = []
            cancellation_timestamp = datetime.now(timezone.utc).isoformat()
            cancellation_reason = f'Reset triggered via session {session_id}'
            
            for active_session in active_sessions:
                try:
                    cache_keys = [
                        f"import_session_{active_session.id}_summary",
                        f"import_session_{active_session.id}_analysis",
                        f"import_session_{active_session.id}_preview"
                    ]
                    for cache_key in cache_keys:
                        try:
                            advanced_cache_service.delete(cache_key)
                        except Exception as cache_error:
                            logger.debug(
                                "Cache cleanup failed for session %s: %s",
                                active_session.id,
                                cache_error
                            )
                    
                    # Add cancellation metadata and mark as cancelled
                    metadata = {
                        'cancelled_at': cancellation_timestamp,
                        'cancelled_reason': cancellation_reason
                    }
                    try:
                        active_session.add_summary_data(metadata)
                    except Exception as summary_error:
                        logger.debug(
                            "Failed to persist cancellation metadata for session %s: %s",
                            active_session.id,
                            summary_error
                        )
                    
                    if active_session.update_status('cancelled'):
                        cancelled_sessions.append(active_session.id)
                    else:
                        # If status did not change (already cancelled/completed), skip adding to list
                        logger.debug(
                            "Session %s status unchanged during cancellation (current status: %s)",
                            active_session.id,
                            active_session.status
                        )
                except Exception as session_error:
                    logger.error(
                        "Failed to cancel session %s during reset cascade: %s",
                        active_session.id,
                        session_error,
                        exc_info=True
                    )
            
            self.db_session.commit()
            
            logger.info("✅ Cancelled %d active import sessions", len(cancelled_sessions))
            
            return {
                'success': True,
                'cancelled_sessions': cancelled_sessions
            }
        
        except Exception as error:
            self.db_session.rollback()
            logger.error(f"Failed to reset session {session_id}: {error}", exc_info=True)
            return {'success': False, 'error': str(error)}
    
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
    
    def get_import_history(self, trading_account_id: int, limit: int = 10) -> Dict[str, Any]:
        """
        Get import history for an account.
        
        Args:
            trading_account_id: Trading account ID
            limit: Maximum number of records to return
            
        Returns:
            Dict[str, Any]: Import history
        """
        try:
            sessions = self.db_session.query(ImportSession).filter(
                ImportSession.trading_account_id == trading_account_id
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
    
    def accept_duplicate(self, session_id: int, record_index: int, duplicate_type: str) -> Dict[str, Any]:
        """
        Accept a duplicate record for import (move from skip to import list)
        
        Args:
            session_id: Import session ID
            record_index: Index of the duplicate record
            duplicate_type: Type of duplicate ('within_file' or 'existing_record')
            
        Returns:
            Dict with success status
        """
        try:
            # Get session
            session = self.session_manager.get_session(session_id)
            if not session:
                return {'success': False, 'error': 'Session not found'}
            
            # Get current preview data
            preview_data = self.processor.get_cached_results(session_id, 'preview')
            if not preview_data:
                return {'success': False, 'error': 'No preview data found'}
            
            # Find the record in records_to_skip
            record_to_move = None
            new_skip_list = []
            
            for skip_record in preview_data.get('records_to_skip', []):
                if (skip_record.get('record_index') == record_index and 
                    skip_record.get('reason') == duplicate_type):
                    record_to_move = skip_record
                else:
                    new_skip_list.append(skip_record)
            
            if not record_to_move:
                return {'success': False, 'error': 'Record not found in skip list'}
            
            # Move to records_to_import
            import_record = {
                'symbol': record_to_move.get('symbol'),
                'action': record_to_move.get('action'),
                'quantity': record_to_move.get('quantity'),
                'price': record_to_move.get('price'),
                'fee': record_to_move.get('fee'),
                'date': record_to_move.get('date'),
                'external_id': record_to_move.get('external_id')
            }
            
            preview_data['records_to_import'].append(import_record)
            preview_data['records_to_skip'] = new_skip_list
            
            # Update summary
            preview_data['summary']['records_to_import'] = len(preview_data['records_to_import'])
            preview_data['summary']['records_to_skip'] = len(preview_data['records_to_skip'])
            preview_data['summary']['import_rate'] = (
                len(preview_data['records_to_import']) / 
                preview_data['summary']['total_records'] * 100
            ) if preview_data['summary']['total_records'] > 0 else 0
            
            # Cache updated preview data
            self.processor.cache_results(session_id, 'preview', preview_data, ttl=3600)
            
            logger.info(f"✅ Accepted duplicate record {record_index} for session {session_id}")
            return {'success': True}
            
        except Exception as e:
            logger.error(f"❌ Failed to accept duplicate for session {session_id}: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def reject_duplicate(self, session_id: int, record_index: int, duplicate_type: str) -> Dict[str, Any]:
        """
        Reject a duplicate record (keep in skip list)
        
        Args:
            session_id: Import session ID
            record_index: Index of the duplicate record
            duplicate_type: Type of duplicate ('within_file' or 'existing_record')
            
        Returns:
            Dict with success status
        """
        try:
            # Get session
            session = self.session_manager.get_session(session_id)
            if not session:
                return {'success': False, 'error': 'Session not found'}
            
            # Get current preview data
            preview_data = self.processor.get_cached_results(session_id, 'preview')
            if not preview_data:
                return {'success': False, 'error': 'No preview data found'}
            
            # Find the record in records_to_skip and mark as rejected
            for skip_record in preview_data.get('records_to_skip', []):
                if (skip_record.get('record_index') == record_index and 
                    skip_record.get('reason') == duplicate_type):
                    skip_record['rejected'] = True
                    skip_record['rejected_at'] = self.utc_normalizer.now_envelope()
                    break
            
            # Cache updated preview data
            self.processor.cache_results(session_id, 'preview', preview_data, ttl=3600)
            
            logger.info(f"✅ Rejected duplicate record {record_index} for session {session_id}")
            return {'success': True}
            
        except Exception as e:
            logger.error(f"❌ Failed to reject duplicate for session {session_id}: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def allow_existing_record(self, session_id: int, record_index: int) -> Dict[str, Any]:
        """
        Allow importing an existing record (move from skip to import list)
        
        Args:
            session_id: Import session ID
            record_index: Index of the existing record
            
        Returns:
            Dict with success status
        """
        try:
            # Get session
            session = self.session_manager.get_session(session_id)
            if not session:
                return {'success': False, 'error': 'Session not found'}
            
            # Get current preview data
            preview_data = self.processor.get_cached_results(session_id, 'preview')
            if not preview_data:
                return {'success': False, 'error': 'No preview data found'}
            
            # Find the record in records_to_skip
            record_to_move = None
            new_skip_list = []
            
            for skip_record in preview_data.get('records_to_skip', []):
                if (skip_record.get('record_index') == record_index and 
                    skip_record.get('reason') == 'existing_record'):
                    record_to_move = skip_record
                else:
                    new_skip_list.append(skip_record)
            
            if not record_to_move:
                return {'success': False, 'error': 'Record not found in skip list'}
            
            # Move to records_to_import
            import_record = {
                'symbol': record_to_move.get('symbol'),
                'action': record_to_move.get('action'),
                'quantity': record_to_move.get('quantity'),
                'price': record_to_move.get('price'),
                'fee': record_to_move.get('fee'),
                'date': record_to_move.get('date'),
                'external_id': record_to_move.get('external_id'),
                'force_import_existing': True
            }
            
            preview_data['records_to_import'].append(import_record)
            preview_data['records_to_skip'] = new_skip_list
            
            # Update summary
            preview_data['summary']['records_to_import'] = len(preview_data['records_to_import'])
            preview_data['summary']['records_to_skip'] = len(preview_data['records_to_skip'])
            preview_data['summary']['import_rate'] = (
                len(preview_data['records_to_import']) / 
                preview_data['summary']['total_records'] * 100
            ) if preview_data['summary']['total_records'] > 0 else 0
            
            # Cache updated preview data
            self.processor.cache_results(session_id, 'preview', preview_data, ttl=3600)
            
            logger.info(f"✅ Allowed existing record {record_index} for session {session_id}")
            return {'success': True}
            
        except Exception as e:
            logger.error(f"❌ Failed to allow existing record for session {session_id}: {str(e)}")
            return {'success': False, 'error': str(e)}