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

from typing import List, Dict, Any, Optional, Tuple, Set
from datetime import datetime, timezone
from decimal import Decimal
import logging
import os
import json
import re
from collections import Counter
from html import escape
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from models.import_session import ImportSession
from models.trading_account import TradingAccount
from models.ticker import Ticker
from models.cash_flow import CashFlow
from models.execution import Execution
from .normalization_service import NormalizationService
from .validation_service import ValidationService
from .duplicate_detection_service import DuplicateDetectionService
from .symbol_metadata_service import SymbolMetadataService
from services.user_data_import.report_generator import ImportReportGenerator
from services.user_data_import.session_manager import ImportSessionManager
from services.user_data_import.import_processor import ImportProcessor
from connectors.user_data_import.ibkr_connector import IBKRConnector
from connectors.user_data_import.demo_connector import DemoConnector
from services.date_normalization_service import DateNormalizationService
from services.advanced_cache_service import advanced_cache_service
from services.ticker_service import TickerService
from services.currency_service import CurrencyService

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
        self.symbol_metadata_service = SymbolMetadataService(db_session)
        self.session_manager = ImportSessionManager(db_session)
        self.processor = ImportProcessor(db_session, advanced_cache_service)
        
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
            sanitized_step_data = self._make_payload_json_safe(data) if data else {}
            report["steps"][step] = {
                "timestamp": self.utc_normalizer.now_envelope(),
                "data": self.utc_normalizer.normalize_output(sanitized_step_data) if sanitized_step_data else {}
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
    
    def _make_payload_json_safe(self, payload: Any) -> Any:
        """Recursively convert payload values to JSON-serializable primitives."""
        if payload is None:
            return None
        if isinstance(payload, Decimal):
            try:
                return float(payload)
            except (ValueError, TypeError):
                return str(payload)
        if isinstance(payload, (str, int, float, bool)):
            return payload
        if isinstance(payload, dict):
            return {key: self._make_payload_json_safe(value) for key, value in payload.items()}
        if isinstance(payload, (list, tuple, set)):
            return [self._make_payload_json_safe(item) for item in payload]
        return payload
    
    def create_import_session(
        self,
        trading_account_id: int,
        file_name: str,
        file_content: str,
        connector_type: str,
        task_type: str = 'executions'
    ) -> Dict[str, Any]:
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
        task_type_normalized = (task_type or 'executions').lower()
        logger.info(
            "🔧 [Session Creation] Starting import session creation",
            extra={
                'trading_account_id': trading_account_id,
                'file_name': file_name,
                'connector_type': connector_type,
                'task_type': task_type_normalized
            })
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
                status='analyzing',
                connector_type=connector_type,
                task_type=task_type_normalized
            )
            
            self.db_session.add(session)
            self.db_session.commit()
            logger.info(f"✅ Import session created in database: {session.id}")
            
            # Store file content for processing
            logger.info("💾 Storing file content and connector info...")
            session.add_summary_data({
                'file_content': file_content,
                'connector_type': connector_type,
                'task_type': task_type_normalized
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
                    "connector_info": connector.get_connector_info(),
                    "task_type": task_type_normalized
                }
            )
            
            return {
                'success': True,
                'session_id': session.id,
                'provider': connector.get_provider_name(),
                'connector_info': connector.get_connector_info(),
                'task_type': task_type_normalized
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

    def _process_import_pipeline(
        self,
        session: ImportSession,
        connector,
        file_content: str,
        task_type: str
    ) -> Dict[str, Any]:
        """
        Parse, normalize, validate and detect duplicates for the given session.
        """
        logger.info(
            "📊 [Import Pipeline] Parsing file for task=%s",
            task_type,
            extra={'session_id': session.id, 'file_name': session.file_name}
        )
        raw_records = connector.parse_file(
            file_content,
            session.file_name,
            task_type=task_type
        )
        session.total_records = len(raw_records)
        logger.info("✅ Parsed %s records", len(raw_records))

        if task_type == 'executions':
            symbol_metadata = self.symbol_metadata_service.build_metadata_map(
                connector=connector,
                file_content=file_content,
                raw_records=raw_records
            )
        else:
            symbol_metadata = session.get_summary_data('symbol_metadata') or {}

        logger.info(
            "🔄 [Import Pipeline] Normalizing records",
            extra={'session_id': session.id, 'raw_records_count': len(raw_records)}
        )
        normalization_result = self.normalization_service.normalize_records(
            raw_records,
            connector,
            task_type=task_type
        )
        logger.info(
            "✅ Normalization completed: %s records",
            len(normalization_result.get('normalized_records', []))
        )

        if (task_type or '').lower() == 'cashflows':
            self._ensure_cashflow_account_binding(
                normalization_result.get('normalized_records', []),
                session.trading_account_id
            )

        logger.info(
            "🔍 [Import Pipeline] Validating records",
            extra={'session_id': session.id, 'normalized_records_count': len(normalization_result.get('normalized_records', []))}
        )
        validation_result = self.validation_service.validate_records(
            normalization_result.get('normalized_records', []),
            task_type=task_type
        )

        logger.info(
            "🔍 [Import Pipeline] Detecting duplicates",
            extra={'session_id': session.id, 'valid_records_count': len(validation_result.get('valid_records', []))}
        )
        duplicate_result = self.duplicate_detection_service.detect_duplicates(
            validation_result.get('valid_records', []),
            session.trading_account_id,
            task_type=task_type
        )
        logger.info(
            "✅ Duplicate detection completed: %s clean records",
            len(duplicate_result.get('clean_records', []))
        )

        return {
            'raw_records': raw_records,
            'normalization_result': normalization_result,
            'validation_result': validation_result,
            'duplicate_result': duplicate_result,
            'symbol_metadata': symbol_metadata
        }

    # ------------------------------------------------------------------
    # Account linking helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _normalize_account_identifier(value: Optional[Any]) -> Optional[str]:
        if value is None:
            return None
        normalized = str(value).strip().upper()
        return normalized or None

    def _resolve_file_account_metadata(
        self,
        session: ImportSession,
        connector,
        file_content: str
    ) -> Dict[str, Any]:
        cached_metadata = session.get_summary_data('account_metadata')
        if cached_metadata:
            return cached_metadata

        metadata: Dict[str, Any] = {}
        try:
            if hasattr(connector, 'extract_account_metadata'):
                metadata = connector.extract_account_metadata(file_content) or {}
            elif hasattr(connector, 'parse_sections'):
                sections = connector.parse_sections(file_content) or {}
                metadata = sections.get('account_reconciliation') or {}
        except Exception as exc:
            logger.warning(
                "⚠️ Failed to resolve account metadata from file: %s",
                exc,
                exc_info=True
            )
            metadata = {}

        if metadata:
            safe_metadata = self._make_payload_json_safe(metadata)
            session.add_summary_data({'account_metadata': safe_metadata})
            self.db_session.flush()

        return metadata

    def _build_account_link_error(
        self,
        session: ImportSession,
        status: str,
        message: str,
        file_account_number: Optional[str],
        current_account_number: Optional[str]
    ) -> Dict[str, Any]:
        return {
            'success': False,
            'error': message,
            'error_code': 'ACCOUNT_LINK_REQUIRED',
            'session_id': session.id,
            'linking': {
                'status': status,
                'session_id': session.id,
                'trading_account_id': session.trading_account_id,
                'file_account_number': file_account_number,
                'current_account_number': current_account_number
            }
        }

    def _enforce_account_link(
        self,
        session: ImportSession,
        connector,
        file_content: str
    ) -> Optional[Dict[str, Any]]:
        trading_account = self.db_session.query(TradingAccount).filter(
            TradingAccount.id == session.trading_account_id
        ).first()

        if not trading_account:
            return self._build_account_link_error(
                session,
                status='missing_account',
                message='Trading account not found. Please refresh and select a valid account.',
                file_account_number=None,
                current_account_number=None
            )

        metadata = self._resolve_file_account_metadata(session, connector, file_content)
        file_account_number = self._normalize_account_identifier(metadata.get('account_id'))

        if file_account_number:
            session.add_summary_data({'file_account_number': file_account_number})
            self.db_session.flush()
        else:
            return self._build_account_link_error(
                session,
                status='missing_in_file',
                message='Account number is missing in the uploaded file. Run the account check task or verify the report.',
                file_account_number=None,
                current_account_number=self._normalize_account_identifier(trading_account.external_account_number)
            )

        existing_binding = self.db_session.query(TradingAccount).filter(
            TradingAccount.external_account_number == file_account_number
        ).first()
        if existing_binding and existing_binding.id != session.trading_account_id:
            return self._build_account_link_error(
                session,
                status='mismatch',
                message=(
                    f"מספר החשבון בקובץ כבר משויך לחשבון המסחר \"{existing_binding.name}\". "
                    f"נא לבחור את החשבון הזה או לנתק את השיוך לפני המשך הייבוא."
                ),
                file_account_number=file_account_number,
                current_account_number=self._normalize_account_identifier(trading_account.external_account_number)
            )

        existing_number = self._normalize_account_identifier(trading_account.external_account_number)

        if not existing_number:
            return self._build_account_link_error(
                session,
                status='unlinked',
                message='This trading account is not linked to a broker account yet. Please link it before continuing.',
                file_account_number=file_account_number,
                current_account_number=None
            )

        if existing_number != file_account_number:
            return self._build_account_link_error(
                session,
                status='mismatch',
                message='The broker account number in the file does not match the linked account. Please review and update the linkage.',
                file_account_number=file_account_number,
                current_account_number=existing_number
            )

        return None

    def link_trading_account_to_file(
        self,
        session_id: int,
        override_account_number: Optional[str] = None
    ) -> Dict[str, Any]:
        session = self.db_session.query(ImportSession).filter(
            ImportSession.id == session_id
        ).first()

        if not session:
            return {'success': False, 'error': 'Session not found'}

        connector_type = session.get_summary_data('connector_type')
        file_content = session.get_summary_data('file_content')
        connector = self.connectors.get(connector_type)

        if not connector or not file_content:
            return {'success': False, 'error': 'Session is missing connector or content data'}

        metadata = self._resolve_file_account_metadata(session, connector, file_content)
        file_account_number = override_account_number or metadata.get('account_id')
        normalized_number = self._normalize_account_identifier(file_account_number)

        if not normalized_number:
            return {'success': False, 'error': 'Unable to determine account number from file'}

        trading_account = self.db_session.query(TradingAccount).filter(
            TradingAccount.id == session.trading_account_id
        ).first()

        if not trading_account:
            return {'success': False, 'error': 'Trading account not found'}

        existing_binding = self.db_session.query(TradingAccount).filter(
            TradingAccount.external_account_number == normalized_number,
            TradingAccount.id != trading_account.id
        ).first()
        if existing_binding:
            return {
                'success': False,
                'error': (
                    f"מספר החשבון כבר משויך לחשבון \"{existing_binding.name}\" (ID {existing_binding.id}). "
                    f"נא להשתמש בחשבון זה או לנתק את השיוך לפני המשך הפעולה."
                )
            }

        trading_account.external_account_number = normalized_number

        try:
            self.db_session.commit()
        except IntegrityError:
            self.db_session.rollback()
            return {
                'success': False,
                'error': 'מספר החשבון כבר משויך לחשבון מסחר אחר במערכת'
            }

        session.add_summary_data({'file_account_number': normalized_number})
        self.db_session.flush()

        return {
            'success': True,
            'linked_account_number': normalized_number,
            'trading_account_id': trading_account.id
        }

    @staticmethod
    def _ensure_cashflow_account_binding(
        normalized_records: List[Dict[str, Any]],
        trading_account_id: Optional[int]
    ) -> None:
        """
        Ensure that normalized cashflow records are bound to the selected trading account.

        Args:
            normalized_records: Cashflow records after normalization
            trading_account_id: Active trading account ID for the session
        """
        if not normalized_records or trading_account_id is None:
            return

        account_identifier = str(trading_account_id)

        for record in normalized_records:
            original_account = record.get('source_account')
            metadata = record.get('metadata')
            if metadata is None or not isinstance(metadata, dict):
                metadata = {}
                record['metadata'] = metadata
            if 'original_source_account' not in metadata and original_account not in (None, '', account_identifier):
                metadata['original_source_account'] = original_account
            record['source_account'] = account_identifier

    def _build_analysis_payload(
        self,
        task_type: str,
        session: ImportSession,
        raw_records: List[Dict[str, Any]],
        normalization_result: Dict[str, Any],
        validation_result: Dict[str, Any],
        duplicate_result: Dict[str, Any],
        symbol_metadata: Dict[str, Any]
    ) -> Tuple[Dict[str, Any], Dict[str, Any]]:
        """
        Build analysis results and summary payloads based on the active task.
        """
        task = (task_type or 'executions').lower()
        analysis_timestamp = datetime.now(timezone.utc)
        file_account_number = session.get_summary_data('file_account_number')

        base_stats = {
            'task_type': task,
            'total_records': session.total_records,
            'parsed_records': len(raw_records),
            'normalized_records': len(normalization_result.get('normalized_records', [])),
            'valid_records': len(validation_result.get('valid_records', [])),
            'invalid_records': len(validation_result.get('invalid_records', [])),
            'clean_records': len(duplicate_result.get('clean_records', [])),
            'duplicate_records': len(duplicate_result.get('within_file_duplicates', [])),
            'existing_records': len(duplicate_result.get('existing_records', [])),
            'normalization_errors': normalization_result.get('errors', []),
            'validation_errors': validation_result.get('validation_errors', []),
            'duplicate_details': duplicate_result,
            'analysis_timestamp': analysis_timestamp
        }
        if file_account_number:
            base_stats['file_account_number'] = file_account_number

        if task == 'cashflows':
            type_stats = validation_result.get('type_stats', {})
            cashflow_summary = self._summarize_cashflows(
                validation_result.get('valid_records', []),
                type_stats=type_stats
            )
            cashflow_records = len(validation_result.get('valid_records', []))
            analysis_results = {
                **base_stats,
                'missing_accounts': validation_result.get('missing_accounts', []),
                'missing_account_details': validation_result.get('missing_account_details', []),
                'currency_issues': validation_result.get('currency_issues', []),
                'cashflow_summary': cashflow_summary,
                'cashflow_records': cashflow_records,
                'cashflow_type_stats': cashflow_summary.get('type_stats', {}),
                'cashflow_issues_by_type': validation_result.get('issues_by_type', {})
            }
            summary_data = {
                'task_type': task,
                'analysis_timestamp': analysis_timestamp,
                'file_account_number': file_account_number,
                'valid_records': len(validation_result.get('valid_records', [])),
                'invalid_records': len(validation_result.get('invalid_records', [])),
                'clean_records': len(duplicate_result.get('clean_records', [])),
                'duplicate_records': len(duplicate_result.get('within_file_duplicates', [])),
                'missing_accounts': validation_result.get('missing_accounts', []),
                'missing_account_details': validation_result.get('missing_account_details', []),
                'currency_issues': validation_result.get('currency_issues', []),
                'cashflow_summary': cashflow_summary,
                'cashflow_records': cashflow_records,
                'cashflow_type_stats': cashflow_summary.get('type_stats', {}),
                'cashflow_issues_by_type': validation_result.get('issues_by_type', {}),
                'duplicate_details': duplicate_result
            }
            return analysis_results, summary_data

        if task == 'account_reconciliation':
            account_validation_results = {
                'missing_accounts': validation_result.get('missing_accounts', []),
                'base_currency_mismatches': validation_result.get('base_currency_mismatches', []),
                'entitlement_warnings': validation_result.get('entitlement_warnings', []),
                'missing_documents_report': validation_result.get('missing_documents_report', [])
            }
            accounts_detected = len(validation_result.get('valid_records', []))
            analysis_results = {
                **base_stats,
                'missing_accounts': account_validation_results['missing_accounts'],
                'base_currency_mismatches': account_validation_results['base_currency_mismatches'],
                'entitlement_warnings': account_validation_results['entitlement_warnings'],
                'missing_documents_report': account_validation_results['missing_documents_report'],
                'account_validation_results': account_validation_results,
                'accounts_detected': accounts_detected
            }
            summary_data = {
                'task_type': task,
                'analysis_timestamp': analysis_timestamp,
                'file_account_number': file_account_number,
                'valid_records': len(validation_result.get('valid_records', [])),
                'invalid_records': len(validation_result.get('invalid_records', [])),
                'missing_accounts': account_validation_results['missing_accounts'],
                'base_currency_mismatches': account_validation_results['base_currency_mismatches'],
                'entitlement_warnings': account_validation_results['entitlement_warnings'],
                'missing_documents_report': account_validation_results['missing_documents_report'],
                'accounts_detected': accounts_detected,
                'account_validation_results': account_validation_results,
                'duplicate_details': duplicate_result
            }
            return analysis_results, summary_data

        # Default: executions (legacy behavior)
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
        for record in validation_result.get('valid_records', []):
            if record.get('symbol') in missing_ticker_symbols:
                missing_ticker_records += 1

        analysis_results = {
            **base_stats,
            'missing_tickers': missing_tickers,
            'missing_ticker_records': missing_ticker_records,
            'symbol_metadata': symbol_metadata
        }
        summary_data = {
            'task_type': task,
            'analysis_timestamp': analysis_timestamp,
            'file_account_number': file_account_number,
            'total_records': session.total_records,
            'valid_records': len(validation_result.get('valid_records', [])),
            'invalid_records': len(validation_result.get('invalid_records', [])),
            'duplicate_records': len(duplicate_result.get('within_file_duplicates', [])),
            'existing_records': len(duplicate_result.get('existing_records', [])),
            'missing_tickers': missing_tickers,
            'symbol_metadata': symbol_metadata,
            'normalization_errors': normalization_result.get('errors', []),
            'validation_errors': validation_result.get('validation_errors', []),
            'duplicate_details': duplicate_result
        }

        return analysis_results, summary_data

    def _summarize_cashflows(
        self,
        records: List[Dict[str, Any]],
        type_stats: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        totals_by_type: Dict[str, float] = {}
        totals_by_currency: Dict[str, float] = {}
        accounts: Set[str] = set()

        for record in records:
            cashflow_type = str(record.get('cashflow_type') or 'unknown').lower()
            currency = str(record.get('currency') or '').upper()
            source_account = record.get('source_account')

            try:
                amount = float(record.get('amount', 0))
            except (TypeError, ValueError):
                amount = 0.0

            totals_by_type[cashflow_type] = totals_by_type.get(cashflow_type, 0.0) + amount
            totals_by_currency[currency] = totals_by_currency.get(currency, 0.0) + amount

            if source_account:
                accounts.add(str(source_account))

        net_amount = sum(totals_by_type.values())
        type_breakdown = self._build_type_breakdown(records) if type_stats is None else type_stats

        return {
            'record_count': len(records),
            'totals_by_type': totals_by_type,
            'totals_by_currency': totals_by_currency,
            'unique_accounts': sorted(accounts),
            'net_amount': net_amount,
            'type_stats': type_breakdown
        }

    def _build_type_breakdown(self, records: List[Dict[str, Any]]) -> Dict[str, Dict[str, Any]]:
        stats: Dict[str, Dict[str, Any]] = {}
        for record in records:
            cashflow_type = str(record.get('cashflow_type') or 'unknown').lower()
            currency = str(record.get('currency') or '').upper()
            section = str(record.get('section') or '').strip() or 'unknown_section'

            try:
                amount = float(record.get('amount', 0))
            except (TypeError, ValueError):
                amount = 0.0

            entry = stats.setdefault(
                cashflow_type,
                {
                    'total_records': 0,
                    'valid_records': 0,
                    'invalid_records': 0,
                    'total_amount': 0.0,
                    'currencies': Counter(),
                    'sections': Counter()
                }
            )
            entry['total_records'] += 1
            entry['valid_records'] += 1
            entry['total_amount'] += amount
            entry['currencies'][currency] += amount
            entry['sections'][section] += 1

        serializable: Dict[str, Dict[str, Any]] = {}
        for cf_type, entry in stats.items():
            serializable[cf_type] = {
                **entry,
                'currencies': dict(entry['currencies']),
                'sections': dict(entry['sections'])
            }

        return serializable

    @staticmethod
    def _resolve_cashflow_storage_type(
        record: Dict[str, Any]
    ) -> Tuple[str, Optional[str]]:
        """
        Translate normalized cashflow types into system enum values.

        Returns:
            Tuple[str, Optional[str]]: (storage_type, mapping_note)
        """
        raw_type = str(record.get('cashflow_type') or 'cash_adjustment').lower()
        mapping_note: Optional[str] = None

        try:
            amount_value = float(record.get('amount', 0))
        except (TypeError, ValueError):
            amount_value = 0.0

        is_positive = amount_value >= 0

        if raw_type == 'deposit':
            storage_type = 'deposit'
        elif raw_type == 'withdrawal':
            storage_type = 'withdrawal'
        elif raw_type == 'transfer':
            storage_type = 'transfer_in' if is_positive else 'transfer_out'
        elif raw_type == 'forex_conversion':
            storage_type = 'transfer_in' if is_positive else 'transfer_out'
            mapping_note = 'Forex conversion'
        elif raw_type == 'dividend':
            storage_type = 'dividend'
        elif raw_type == 'dividend_accrual':
            storage_type = 'other_positive' if is_positive else 'other_negative'
            mapping_note = 'Dividend accrual'
        elif raw_type == 'interest':
            storage_type = 'interest'
        elif raw_type == 'interest_accrual':
            storage_type = 'other_positive' if is_positive else 'other_negative'
            mapping_note = 'Interest accrual'
        elif raw_type == 'tax':
            storage_type = 'tax'
        elif raw_type == 'fee':
            storage_type = 'fee'
        elif raw_type == 'borrow_fee':
            storage_type = 'fee'
            mapping_note = 'Borrow fee'
        elif raw_type == 'syep_interest':
            storage_type = 'interest'
            mapping_note = 'SYEP interest'
        elif raw_type == 'cash_adjustment':
            storage_type = 'other_positive' if is_positive else 'other_negative'
        else:
            known_direct = {
                'transfer_in',
                'transfer_out',
                'other_positive',
                'other_negative'
            }
            if raw_type in known_direct:
                storage_type = raw_type
            else:
                storage_type = 'other_positive' if is_positive else 'other_negative'
                if raw_type:
                    mapping_note = raw_type

        return storage_type, mapping_note

    def _build_preview_payload(self, task_type: str, pipeline_result: Dict[str, Any]) -> Dict[str, Any]:
        """
        Construct preview payload based on task type.
        """
        task = (task_type or 'executions').lower()
        validation_result = pipeline_result['validation_result']
        duplicate_result = pipeline_result['duplicate_result']
        raw_records = pipeline_result['raw_records']
        symbol_metadata = pipeline_result.get('symbol_metadata', {})

        if task == 'cashflows':
            clean_records = duplicate_result.get('clean_records', [])
            records_to_import: List[Dict[str, Any]] = []
            for entry in clean_records:
                record = entry['record']
                storage_type, mapping_note = self._resolve_cashflow_storage_type(record)

                metadata = dict(record.get('metadata') or {})
                if 'original_cashflow_type' not in metadata and record.get('cashflow_type'):
                    metadata['original_cashflow_type'] = record.get('cashflow_type')
                metadata['storage_cashflow_type'] = storage_type
                if mapping_note:
                    existing_notes = metadata.get('notes')
                    if isinstance(existing_notes, list):
                        if mapping_note not in existing_notes:
                            existing_notes.append(mapping_note)
                    elif existing_notes in (None, ''):
                        metadata['notes'] = [mapping_note]
                    else:
                        metadata['notes'] = [existing_notes, mapping_note]

                    metadata['mapping_note'] = mapping_note

                record_payload = {
                    'cashflow_type': record.get('cashflow_type'),
                    'storage_type': storage_type,
                    'mapping_note': mapping_note,
                    'amount': record.get('amount'),
                    'currency': record.get('currency'),
                    'effective_date': record.get('effective_date'),
                    'source_account': record.get('source_account'),
                    'target_account': record.get('target_account'),
                    'asset_symbol': record.get('asset_symbol'),
                    'memo': record.get('memo'),
                    'tax_country': record.get('tax_country'),
                    'external_id': record.get('external_id'),
                    'section': record.get('section'),
                    'metadata': metadata
                }
                records_to_import.append(record_payload)

            records_to_skip: List[Dict[str, Any]] = []
            for error_info in validation_result.get('validation_errors', []):
                storage_type, mapping_note = self._resolve_cashflow_storage_type(error_info.get('record') or {})
                records_to_skip.append({
                    'record': error_info['record'],
                    'reason': 'validation_error',
                    'errors': error_info['errors'],
                    'cashflow_type': (error_info['record'] or {}).get('cashflow_type'),
                    'section': (error_info['record'] or {}).get('section'),
                    'metadata': (error_info['record'] or {}).get('metadata', {}),
                    'storage_type': storage_type,
                    'mapping_note': mapping_note
                })

            for account in validation_result.get('missing_accounts', []):
                records_to_skip.append({
                    'record': None,
                    'reason': 'missing_account',
                    'account_id': account
                })

            for detail in validation_result.get('missing_account_details', []):
                records_to_skip.append({
                    'record': None,
                    'reason': 'missing_account_detail',
                    'detail': detail
                })

            for issue in validation_result.get('currency_issues', []):
                records_to_skip.append({
                    'record_index': issue.get('record_index'),
                    'reason': 'currency_issue',
                    'currency': issue.get('currency'),
                    'message': issue.get('message')
                })

            for duplicate in duplicate_result.get('within_file_duplicates', []):
                storage_type, mapping_note = self._resolve_cashflow_storage_type(duplicate.get('record') or {})
                records_to_skip.append({
                'record_index': duplicate.get('record_index'),
                    'record': duplicate['record'],
                    'reason': 'within_file_duplicate',
                    'confidence_score': duplicate.get('confidence_score'),
                    'details': duplicate,
                    'cashflow_type': (duplicate.get('record') or {}).get('cashflow_type'),
                    'section': (duplicate.get('record') or {}).get('section'),
                    'metadata': (duplicate.get('record') or {}).get('metadata', {}),
                    'storage_type': storage_type,
                    'mapping_note': mapping_note
                })

            for duplicate in duplicate_result.get('existing_records', []):
                storage_type, mapping_note = self._resolve_cashflow_storage_type(duplicate.get('record') or {})
                records_to_skip.append({
                'record_index': duplicate.get('record_index'),
                    'record': duplicate['record'],
                    'reason': 'existing_record',
                    'details': duplicate,
                    'cashflow_type': (duplicate.get('record') or {}).get('cashflow_type'),
                    'section': (duplicate.get('record') or {}).get('section'),
                    'metadata': (duplicate.get('record') or {}).get('metadata', {}),
                    'storage_type': storage_type,
                    'mapping_note': mapping_note
                })

            cashflow_summary = self._summarize_cashflows(
                validation_result.get('valid_records', []),
                type_stats=validation_result.get('type_stats', {})
            )

            return {
                'task_type': task,
                'records_to_import': records_to_import,
                'records_to_skip': records_to_skip,
                'summary': {
                    'total_records': len(raw_records),
                    'records_to_import': len(records_to_import),
                    'records_to_skip': len(records_to_skip),
                    'cashflow_records': len(records_to_import),
                    'net_amount': cashflow_summary.get('net_amount', 0),
                    'totals_by_type': cashflow_summary.get('totals_by_type', {}),
                    'totals_by_currency': cashflow_summary.get('totals_by_currency', {}),
                    'missing_accounts': validation_result.get('missing_accounts', []),
                    'currency_issues': validation_result.get('currency_issues', []),
                    'type_stats': cashflow_summary.get('type_stats', {}),
                    'issues_by_type': validation_result.get('issues_by_type', {})
                },
                'cashflow_summary': cashflow_summary,
                'cashflow_records': len(records_to_import)
            }

        if task == 'account_reconciliation':
            valid_records = validation_result.get('valid_records', [])

            issues = {
                'missing_accounts': validation_result.get('missing_accounts', []),
                'base_currency_mismatches': validation_result.get('base_currency_mismatches', []),
                'entitlement_warnings': validation_result.get('entitlement_warnings', []),
                'missing_documents_report': validation_result.get('missing_documents_report', []),
                'duplicates': duplicate_result.get('within_file_duplicates', []),
            }

            return {
                'task_type': task,
                'records_to_import': valid_records,
                'records_to_skip': validation_result.get('validation_errors', []),
                'summary': {
                    'total_records': len(raw_records),
                    'valid_records': len(valid_records),
                    'invalid_records': len(validation_result.get('invalid_records', [])),
                    'issues': issues,
                    'accounts_detected': len(valid_records)
                },
                'account_validation_results': issues,
                'accounts_detected': len(valid_records)
            }

        # Default executions preview
        clean_records = duplicate_result.get('clean_records', [])
        raw_missing_tickers = validation_result.get('missing_tickers') or []
        if isinstance(raw_missing_tickers, (list, tuple, set)):
            missing_tickers = [item for item in raw_missing_tickers if item not in (None, '')]
        elif raw_missing_tickers in (None, ''):
            missing_tickers = []
        else:
            missing_tickers = [raw_missing_tickers]

        missing_ticker_symbols = []
        for entry in missing_tickers:
            if isinstance(entry, dict):
                symbol = entry.get('symbol')
                if symbol:
                    missing_ticker_symbols.append(symbol)
            elif isinstance(entry, str) and entry:
                missing_ticker_symbols.append(entry)

        filtered_clean_records = [
            entry for entry in clean_records
            if entry['record'].get('symbol') not in missing_ticker_symbols
        ]

        records_to_import = [
            {
                'symbol': entry['record'].get('symbol'),
                'action': entry['record'].get('action'),
                'quantity': entry['record'].get('quantity'),
                'price': entry['record'].get('price'),
                'fee': entry['record'].get('fee'),
                'date': entry['record'].get('date'),
                'external_id': entry['record'].get('external_id'),
                'realized_pl': entry['record'].get('realized_pl'),
                'mtm_pl': entry['record'].get('mtm_pl')
            }
            for entry in filtered_clean_records
        ]

        records_to_skip = []
        for error_info in validation_result.get('validation_errors', []):
            records_to_skip.append({
                'record': error_info['record'],
                'reason': 'validation_error',
                'errors': error_info['errors']
            })

        for record in validation_result.get('valid_records', []):
            if record.get('symbol') in missing_ticker_symbols:
                records_to_skip.append({
                    'record': record,
                    'reason': 'missing_ticker',
                    'missing_ticker': record.get('symbol')
                })

        for duplicate in duplicate_result.get('within_file_duplicates', []):
            records_to_skip.append({
                'record_index': duplicate.get('record_index'),
                'record': duplicate['record'],
                'reason': 'within_file_duplicate',
                'confidence_score': duplicate.get('confidence_score', 0),
                'details': duplicate
            })
            for match in duplicate.get('within_file_matches', []):
                records_to_skip.append({
                    'record_index': match.get('record_index'),
                    'record': match['record'],
                    'reason': 'within_file_duplicate_match',
                    'confidence_score': match.get('confidence', 0),
                    'details': match
                })

        for existing in duplicate_result.get('existing_records', []):
            records_to_skip.append({
                'record_index': existing.get('record_index'),
                'record': existing.get('record'),
                'reason': 'existing_record',
                'matches': existing.get('system_matches', [])
            })

        total_records = len(raw_records)
        return {
            'task_type': task,
            'records_to_import': records_to_import,
            'records_to_skip': records_to_skip,
            'summary': {
                'total_records': total_records,
                'records_to_import': len(records_to_import),
                'records_to_skip': len(records_to_skip),
                'import_rate': (len(records_to_import) / total_records * 100) if total_records else 0,
                'missing_tickers': missing_tickers,
                'duplicate_records': len(duplicate_result.get('within_file_duplicates', [])),
                'existing_records': len(duplicate_result.get('existing_records', []))
            },
            'symbol_metadata': symbol_metadata
        }
    
    def analyze_file(self, session_id: int, task_type: Optional[str] = None) -> Dict[str, Any]:
        """
        Analyze the uploaded file and prepare import data.
        
        Args:
            session_id: Import session ID
            task_type: Optional override for task type
            
        Returns:
            Dict[str, Any]: Analysis results
        """
        logger.info(f"🔍 [File Analysis] Starting file analysis", 
                   extra={'session_id': session_id, 'task_type': task_type})
        try:
            # Get session
            session = self.db_session.query(ImportSession).filter(
                ImportSession.id == session_id
            ).first()
            
            if not session:
                logger.error(f"❌ Session {session_id} not found")
                return {'success': False, 'error': 'Session not found'}
            
            logger.info(f"✅ Session found: {session.id}, status: {session.status}")

            # Ensure connector/task metadata columns are populated for legacy sessions
            if not session.connector_type:
                connector_from_summary = session.get_summary_data('connector_type')
                if connector_from_summary:
                    session.connector_type = connector_from_summary
            if not session.task_type:
                session.task_type = (task_type or session.get_summary_data('task_type') or 'executions').lower()
            
            if task_type:
                normalized_task = task_type.lower()
                session.add_summary_data({'task_type': normalized_task})
            else:
                normalized_task = (session.get_summary_data('task_type') or 'executions').lower()
            
            # Get file content and connector
            file_content = session.get_summary_data('file_content')
            connector_type = session.get_summary_data('connector_type')
            logger.info(
                "📄 File content length: %s, connector: %s, task_type: %s",
                len(file_content) if file_content else 0,
                connector_type,
                normalized_task
            )
            
            connector = self.connectors.get(connector_type)
            
            if not connector:
                logger.error(f"❌ Connector {connector_type} not found")
                return {'success': False, 'error': 'Connector not found'}
            
            logger.info(f"✅ Connector found: {connector.get_provider_name()}")

            account_link_error = self._enforce_account_link(session, connector, file_content)
            if account_link_error:
                logger.warning(
                    "⚠️ Account linking required before analysis",
                    extra={'session_id': session.id, 'linking': account_link_error.get('linking')}
                )
                return account_link_error
            
            pipeline_result = self._process_import_pipeline(
                session=session,
                connector=connector,
                file_content=file_content,
                task_type=normalized_task
            )

            raw_records = pipeline_result['raw_records']
            normalization_result = pipeline_result['normalization_result']
            validation_result = pipeline_result['validation_result']
            duplicate_result = pipeline_result['duplicate_result']
            symbol_metadata = pipeline_result['symbol_metadata']
            
            analysis_results_raw, summary_data_raw = self._build_analysis_payload(
                task_type=normalized_task,
                session=session,
                raw_records=raw_records,
                normalization_result=normalization_result,
                validation_result=validation_result,
                duplicate_result=duplicate_result,
                symbol_metadata=symbol_metadata
            )

            analysis_results_serializable = self._make_payload_json_safe(analysis_results_raw)
            summary_data_serializable = self._make_payload_json_safe(summary_data_raw)
            summary_data_storage = self.utc_normalizer.normalize_output(summary_data_serializable)
            session.add_summary_data(summary_data_storage)
            session.add_summary_data({'task_type': normalized_task})
            session.total_records = summary_data_raw.get('total_records', session.total_records)
            session.status = 'ready'
            session.last_activity = datetime.now(timezone.utc)
            cache_key = f"import_summary:{session.id}:{normalized_task}"
            logger.info(f"💾 Saving summary_data to advanced_cache_service: {cache_key}")
            try:
                advanced_cache_service.set(cache_key, summary_data_storage, ttl=3600)  # 1 hour TTL
                logger.info(f"✅ Saved summary_data to advanced_cache_service: {cache_key}")
            except Exception as cache_error:
                logger.warning(
                    "⚠️ Failed to store summary_data in cache",
                    extra={'error': str(cache_error), 'cache_key': cache_key}
                )
            self.db_session.commit()
 
            logger.info(f"✅ [File Analysis] Analysis completed for session {session_id}")
 
            return {
                'success': True,
                'analysis_results': analysis_results_serializable,
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
    
    def generate_preview(self, session_id: int, task_type: Optional[str] = None) -> Dict[str, Any]:
        """
        Generate preview data for user confirmation.
        
        Args:
            session_id: Import session ID
            task_type: Optional override for task type
            
        Returns:
            Dict[str, Any]: Preview data
        """
        try:
            logger.info(f"🔍 Starting generate_preview for session {session_id} - NEW CODE VERSION!", extra={'task_type': task_type})
            session = self.db_session.query(ImportSession).filter(
                ImportSession.id == session_id
            ).first()
            
            if not session:
                logger.error(f"❌ Session {session_id} not found")
                return {'success': False, 'error': 'Session not found'}
            
            normalized_task = (task_type or session.get_summary_data('task_type') or 'executions').lower()
            session.add_summary_data({'task_type': normalized_task})
            
            file_content = session.get_summary_data('file_content')
            connector_type = session.get_summary_data('connector_type')
            logger.info(
                "📁 File content length: %s, connector: %s, task_type: %s",
                len(file_content) if file_content else 0,
                connector_type,
                normalized_task
            )
            
            connector = self.connectors.get(connector_type)
            
            if not connector:
                logger.error(f"❌ Connector {connector_type} not found")
                return {'success': False, 'error': 'Connector not found'}
            
            logger.info(f"✅ Connector {connector_type} found")

            account_link_error = self._enforce_account_link(session, connector, file_content)
            if account_link_error:
                logger.warning(
                    "⚠️ Account linking required before preview",
                    extra={'session_id': session.id, 'linking': account_link_error.get('linking')}
                )
                return account_link_error
            
            pipeline_result = self._process_import_pipeline(
                session=session,
                connector=connector,
                file_content=file_content,
                task_type=normalized_task
            )

            preview_data_raw = self._build_preview_payload(normalized_task, pipeline_result)
            preview_data_raw['task_type'] = normalized_task

            logger.info("🔄 Updating session with preview data...")
            preview_data_serializable = self._make_payload_json_safe(preview_data_raw)
            preview_data_storage = self.utc_normalizer.normalize_output(preview_data_serializable)
            session.add_summary_data({'preview_data': preview_data_storage, 'task_type': normalized_task})
            self.db_session.commit()

            logger.info(
                "✅ Preview generated successfully (task=%s, import_count=%s, skip_count=%s)",
                normalized_task,
                len(preview_data_raw.get('records_to_import', [])),
                len(preview_data_raw.get('records_to_skip', []))
            )

            return {
                'success': True,
                'preview_data': preview_data_serializable,
                'session_id': session_id,
                'task_type': normalized_task
            }
        except Exception as e:
            logger.error(f"❌ Failed to generate preview: {str(e)}", exc_info=True)
            return {
                'success': False,
                'error': str(e)
            }
    
    def execute_import(self, session_id: int, task_type: Optional[str] = None) -> Dict[str, Any]:
        """
        Execute the import process and persist records according to the active task type.
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
                logger.warning(
                    "⚠️ Session %s is not ready for import (status=%s)",
                    session_id,
                    import_session.status
                )
                return {'success': False, 'error': 'Session not ready for import'}
            
            requested_task_type = (task_type or import_session.task_type or import_session.get_summary_data('task_type') or 'executions').lower()
            import_session.task_type = requested_task_type
            import_session.update_status('importing')
            self.db_session.flush()

            preview_result = self.generate_preview(session_id, requested_task_type)
            if not preview_result['success']:
                error_message = preview_result.get('error', 'Failed to regenerate preview data')
                logger.error(
                    "❌ Failed to regenerate preview for session %s: %s",
                    session_id,
                    error_message
                )
                import_session.update_status('failed')
                self.db_session.commit()
                return {'success': False, 'error': error_message}
            
            preview_data = preview_result['preview_data']
            records_to_import = preview_data.get('records_to_import', []) or []
            logger.info(
                "📦 Session %s: %s records ready for enrichment",
                session_id,
                len(records_to_import)
            )

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

            if requested_task_type == 'cashflows':
                task_result = self._execute_import_cashflows(import_session, preview_data)
            elif requested_task_type == 'account_reconciliation':
                task_result = self._execute_import_account_reconciliation(import_session, preview_data)
            else:
                task_result = self._execute_import_executions(import_session, preview_data)

            if not task_result.get('success'):
                import_session.imported_records = task_result.get('imported_count', 0)
                import_session.skipped_records = task_result.get('skipped_count', 0)
                import_session.update_status('failed')
                self.db_session.commit()
                return {
                    'success': False,
                    'error': task_result.get('error', 'Import failed'),
                    'import_errors': task_result.get('errors', [])
                }

            import_session.imported_records = task_result.get('imported_count', 0)
            import_session.skipped_records = task_result.get('skipped_count', 0)
            import_session.update_status('completed')
            self.db_session.commit()

            for pattern in task_result.get('cache_patterns', []):
                try:
                    advanced_cache_service.invalidate_pattern(pattern)
                except Exception as cache_error:
                    logger.warning(
                        "⚠️ Cache invalidation failed for pattern %s: %s",
                        pattern,
                        cache_error
                    )

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

            response_payload = {
                'success': True,
                'imported_count': task_result.get('imported_count', 0),
                'skipped_count': task_result.get('skipped_count', 0),
                'import_errors': task_result.get('errors', []),
                'session_status': import_session.status,
                'task_type': requested_task_type
            }

            if requested_task_type == 'cashflows':
                response_payload['cashflow_summary'] = task_result.get('cashflow_summary', {})
                response_payload['cashflow_records'] = task_result.get('cashflow_records', 0)
            elif requested_task_type == 'account_reconciliation':
                response_payload['account_validation_results'] = task_result.get('account_validation_results', {})
                response_payload['accounts_detected'] = task_result.get('accounts_detected', 0)

            return response_payload

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

    def _execute_import_executions(
        self,
        import_session: ImportSession,
        preview_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        raw_entries = preview_data.get('records_to_import', []) or []
        skipped_count = len(preview_data.get('records_to_skip', []) or [])

        if not raw_entries:
            error_message = 'No records available for import. Resolve validation issues or add missing tickers before retrying.'
            return {
                'success': False,
                'error': error_message,
                'errors': [error_message],
                'imported_count': 0,
                'skipped_count': skipped_count
            }

        execution_payloads: List[Dict[str, Any]] = []
        for entry in raw_entries:
            if isinstance(entry, dict) and 'record' in entry:
                execution_payloads.append(entry['record'])
            else:
                execution_payloads.append(entry)

        enriched_records = TickerService.enrich_records_with_ticker_ids(self.db_session, execution_payloads)
        if not enriched_records:
            error_message = 'Ticker enrichment failed for all records. Ensure all tickers exist in the system.'
            return {
                'success': False,
                'error': error_message,
                'errors': [error_message],
                'imported_count': 0,
                'skipped_count': skipped_count
            }

        symbol_metadata = preview_data.get('symbol_metadata')
        try:
            self._update_ticker_metadata(enriched_records, symbol_metadata)
        except Exception as metadata_error:
            logger.warning(
                "⚠️ Session %s: failed to update ticker metadata: %s",
                import_session.id,
                metadata_error,
                exc_info=True
            )

        from sqlalchemy import func
        from models.execution import Execution

        initial_execution_count = self.db_session.query(func.count(Execution.id)).scalar() or 0

        imported_count = 0
        import_errors: List[str] = []

        for index, record in enumerate(enriched_records):
            try:
                execution_date = self._resolve_datetime(record.get('date'))
                if not execution_date:
                    raise ValueError(f"Invalid execution date: {record.get('date')}")

                filename = import_session.file_name or 'unknown_file'
                import_timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
                unique_execution_id = f"{filename}_{import_timestamp}_{record.get('external_id', 'exec')}"
                execution = Execution(
                    ticker_id=record.get('ticker_id'),
                    trading_account_id=import_session.trading_account_id,
                    trade_id=None,
                    action=record.get('action'),
                    quantity=record.get('quantity'),
                    price=record.get('price'),
                    fee=record.get('fee', 0),
                    date=execution_date,
                    external_id=unique_execution_id,
                    source='file_import',
                    realized_pl=record.get('realized_pl'),
                    mtm_pl=record.get('mtm_pl'),
                    created_at=datetime.utcnow()
                )
                self.db_session.add(execution)
                imported_count += 1
            except Exception as record_error:
                logger.error(
                    "❌ Failed to prepare execution #%s: %s",
                    index + 1,
                    record_error,
                    exc_info=True
                )
                import_errors.append(f"Execution #{index + 1} failed: {record_error}")

        if imported_count == 0:
            self.db_session.rollback()
            return {
                'success': False,
                'error': 'No execution records were created during import.',
                'errors': import_errors or ['Failed to create execution records.'],
                'imported_count': 0,
                'skipped_count': skipped_count
            }

        self.db_session.flush()
        current_execution_count = self.db_session.query(func.count(Execution.id)).scalar() or 0
        actual_inserted = current_execution_count - initial_execution_count

        if actual_inserted != imported_count:
            error_message = (
                f"Imported {imported_count} records but detected {actual_inserted} new executions in database."
            )
            self.db_session.rollback()
            return {
                'success': False,
                'error': error_message,
                'errors': [error_message],
                'imported_count': imported_count,
                'skipped_count': skipped_count
            }

        return {
            'success': True,
            'imported_count': imported_count,
            'skipped_count': skipped_count,
            'errors': import_errors,
            'cache_patterns': ['executions', 'trades', 'dashboard']
        }

    def _execute_import_cashflows(
        self,
        import_session: ImportSession,
        preview_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        raw_entries = preview_data.get('records_to_import', []) or []
        skipped_count = len(preview_data.get('records_to_skip', []) or [])

        if not raw_entries:
            error_message = 'No cashflow records available for import.'
            return {
                'success': False,
                'error': error_message,
                'errors': [error_message],
                'imported_count': 0,
                'skipped_count': skipped_count
            }

        cashflow_records: List[Dict[str, Any]] = []
        for entry in raw_entries:
            if isinstance(entry, dict) and 'record' in entry:
                cashflow_records.append(entry['record'])
            else:
                cashflow_records.append(entry)

        imported_count = 0
        import_errors: List[str] = []

        for index, record in enumerate(cashflow_records):
            try:
                storage_type = record.get('storage_type')
                mapping_note = record.get('mapping_note')

                if not storage_type:
                    storage_type, inferred_note = self._resolve_cashflow_storage_type(record)
                    if mapping_note is None:
                        mapping_note = inferred_note

                amount = float(record.get('amount', 0))
                if amount == 0:
                    raise ValueError('Amount cannot be zero')

                effective_dt = self._resolve_datetime(record.get('effective_date'))
                effective_date = effective_dt.date() if effective_dt else None

                currency_symbol = record.get('currency')
                currency = None
                currency_id = None
                usd_rate = 1.0

                if currency_symbol:
                    currency = CurrencyService.get_by_symbol(self.db_session, currency_symbol)
                    if not currency:
                        raise ValueError(f"Currency '{currency_symbol}' not found")
                    currency_id = currency.id
                    usd_rate = float(currency.usd_rate or 1.0)

                description_parts = []
                if record.get('memo'):
                    description_parts.append(str(record['memo']))
                if record.get('target_account'):
                    description_parts.append(f"Target: {record['target_account']}")
                if record.get('asset_symbol'):
                    description_parts.append(f"Asset: {record['asset_symbol']}")
                if mapping_note:
                    description_parts.append(f"מקור תזרים: {mapping_note}")
                description = ' | '.join(description_parts) if description_parts else None

                external_id = record.get('external_id') or (
                    f"cashflow_{import_session.id}_{index + 1}"
                )

                cashflow = CashFlow(
                    trading_account_id=import_session.trading_account_id,
                    type=storage_type or record.get('cashflow_type', 'cash_adjustment'),
                    amount=amount,
                    fee_amount=0.0,
                    date=effective_date,
                    description=description,
                    currency_id=currency_id,
                    usd_rate=usd_rate,
                    source='file_import',
                    external_id=external_id,
                    trade_id=None
                )
                self.db_session.add(cashflow)
                imported_count += 1
            except Exception as record_error:
                logger.error(
                    "❌ Failed to create cashflow #%s: %s",
                    index + 1,
                    record_error,
                    exc_info=True
                )
                import_errors.append(f"Cashflow #{index + 1} failed: {record_error}")

        if imported_count == 0:
            self.db_session.rollback()
            return {
                'success': False,
                'error': 'No cashflow records were created during import.',
                'errors': import_errors or ['Failed to create cashflow records.'],
                'imported_count': 0,
                'skipped_count': skipped_count
            }

        self.db_session.flush()

        preview_summary = preview_data.get('summary', {})
        type_stats = (
            (preview_summary or {}).get('type_stats')
            or preview_data.get('cashflow_summary', {}).get('type_stats')
        )
        cashflow_summary = self._summarize_cashflows(
            cashflow_records,
            type_stats=type_stats
        )

        return {
            'success': True,
            'imported_count': imported_count,
            'skipped_count': skipped_count,
            'errors': import_errors,
            'cache_patterns': ['cash_flows', 'dashboard'],
            'cashflow_summary': cashflow_summary,
            'cashflow_records': len(cashflow_records)
        }

    def _execute_import_account_reconciliation(
        self,
        import_session: ImportSession,
        preview_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        raw_entries = preview_data.get('records_to_import', []) or []
        skipped_count = len(preview_data.get('records_to_skip', []) or [])
        summary = preview_data.get('summary', {})

        records: List[Dict[str, Any]] = []
        for entry in raw_entries:
            if isinstance(entry, dict) and 'record' in entry:
                records.append(entry['record'])
            else:
                records.append(entry)

        result_payload = {
            'reconciled_accounts': records,
            'issues': summary.get('issues', {}),
            'generated_at': self.utc_normalizer.now_envelope()
        }

        safe_result_payload = self._make_payload_json_safe(result_payload)
        import_session.add_summary_data({'account_reconciliation_result': safe_result_payload})

        return {
            'success': True,
            'imported_count': len(records),
            'skipped_count': skipped_count,
            'errors': [],
            'cache_patterns': [],
            'account_validation_results': summary.get('issues', {}),
            'accounts_detected': len(records)
        }

    # ------------------------------------------------------------------
    # Metadata helpers
    # ------------------------------------------------------------------
    _AUTO_LINK_BLOCK_PATTERN = re.compile(
        r'<div[^>]+data-auto-generated="import-links"[^>]*>.*?</div>',
        re.IGNORECASE | re.DOTALL
    )

    def _update_ticker_metadata(
        self,
        enriched_records: List[Dict[str, Any]],
        symbol_metadata: Optional[Any]
    ) -> None:
        if not enriched_records or not symbol_metadata:
            return

        symbol_map = self._normalise_symbol_metadata(symbol_metadata)
        if not symbol_map:
            return

        ticker_ids = {
            record.get('ticker_id')
            for record in enriched_records
            if record.get('ticker_id')
        }

        if not ticker_ids:
            return

        tickers = self.db_session.query(Ticker).filter(
            Ticker.id.in_(ticker_ids)
        ).all()

        updated = False
        for ticker in tickers:
            symbol_key = (ticker.symbol or '').upper()
            metadata = symbol_map.get(symbol_key)
            if not metadata:
                continue

            # Update ticker name if missing and metadata provides one
            company_name = metadata.get('company_name')
            if company_name and not (ticker.name and ticker.name.strip()):
                ticker.name = company_name.strip()
                updated = True

            rich_text_block = self._build_links_rich_text(metadata)
            if not rich_text_block:
                continue

            existing_remarks = ticker.remarks or ''
            merged = self._merge_rich_text(existing_remarks, rich_text_block)
            if merged is None:
                continue

            if merged != existing_remarks:
                ticker.remarks = merged
                updated = True

        if updated:
            self.db_session.flush()

    def _normalise_symbol_metadata(self, metadata: Any) -> Dict[str, Dict[str, Any]]:
        if isinstance(metadata, dict):
            return {
                symbol.upper(): value
                for symbol, value in metadata.items()
                if isinstance(symbol, str) and isinstance(value, dict)
            }

        if isinstance(metadata, list):
            normalised: Dict[str, Dict[str, Any]] = {}
            for entry in metadata:
                if not isinstance(entry, dict):
                    continue
                symbol = (entry.get('symbol') or '').upper()
                if not symbol:
                    continue
                normalised[symbol] = entry
            return normalised

        return {}

    def _build_links_rich_text(self, metadata: Dict[str, Any]) -> Optional[str]:
        links = metadata.get('links') or {}
        google_url = links.get('google_finance')
        yahoo_url = links.get('yahoo_finance')
        status = links.get('status')
        company_name = metadata.get('company_name')

        if not company_name and not google_url and not yahoo_url:
            return None

        parts: List[str] = ['<div data-auto-generated="import-links">']

        if company_name:
            parts.append(
                f'<p><strong>Company:</strong> {escape(str(company_name), quote=True)}</p>'
            )

        if google_url or yahoo_url:
            parts.append('<ul>')
            if google_url:
                parts.append(
                    '<li>'
                    f'<a href="{escape(str(google_url), quote=True)}" '
                    'target="_blank" rel="noopener noreferrer">Google Finance</a>'
                    '</li>'
                )
            if yahoo_url:
                parts.append(
                    '<li>'
                    f'<a href="{escape(str(yahoo_url), quote=True)}" '
                    'target="_blank" rel="noopener noreferrer">Yahoo Finance</a>'
                    '</li>'
                )
            parts.append('</ul>')
        else:
            parts.append('<p>No external links available.</p>')

        if status:
            parts.append(
                f'<p><small>Link status: {escape(str(status), quote=True)}</small></p>'
            )

        parts.append('</div>')
        html_block = ''.join(parts)

        if len(html_block) > TickerService.MAX_REMARKS_LENGTH:
            logger.warning(
                "Generated remarks block exceeds max length (%s > %s)",
                len(html_block),
                TickerService.MAX_REMARKS_LENGTH
            )
            return None

        return html_block

    def _merge_rich_text(self, existing_html: str, new_block: str) -> Optional[str]:
        if not new_block:
            return None

        existing_html = existing_html or ''

        if self._AUTO_LINK_BLOCK_PATTERN.search(existing_html):
            merged = self._AUTO_LINK_BLOCK_PATTERN.sub(new_block, existing_html)
        elif existing_html.strip():
            merged = f"{existing_html.strip()}\n<hr />\n{new_block}"
        else:
            merged = new_block

        if len(merged) > TickerService.MAX_REMARKS_LENGTH:
            logger.warning(
                "Merged remarks block exceeds max length (%s > %s); skipping update",
                len(merged),
                TickerService.MAX_REMARKS_LENGTH
            )
            return None

        return merged

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
            
            # Get current preview data (with fallback)
            preview_data = self._ensure_preview_data(session_id, session)
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
            self._update_preview_cache(session_id, preview_data, session=session)
            
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
            
            # Get current preview data (with fallback)
            preview_data = self._ensure_preview_data(session_id, session)
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
            self._update_preview_cache(session_id, preview_data, session=session)
            
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
            
            # Get current preview data (with fallback)
            preview_data = self._ensure_preview_data(session_id, session)
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
            self._update_preview_cache(session_id, preview_data, session=session)
            
            logger.info(f"✅ Allowed existing record {record_index} for session {session_id}")
            return {'success': True}
            
        except Exception as e:
            logger.error(f"❌ Failed to allow existing record for session {session_id}: {str(e)}")
            return {'success': False, 'error': str(e)}

    def get_preview_snapshot(self, session_id: int) -> Dict[str, Any]:
        """
        Return the latest preview data without regenerating the entire pipeline.
        """
        try:
            session = self.session_manager.get_session(session_id)
            if not session:
                return {'success': False, 'error': 'Session not found'}

            preview_data = self._ensure_preview_data(session_id, session=session)
            if not preview_data:
                return {'success': False, 'error': 'Preview data not available'}

            return {'success': True, 'preview_data': preview_data}

        except Exception as error:
            logger.error(f"❌ Failed to load preview snapshot for session {session_id}: {error}")
            return {'success': False, 'error': str(error)}

    def _upgrade_preview_data_structure(self, preview_data: Optional[Dict[str, Any]]) -> bool:
        """
        Upgrade legacy preview payloads (missing record_index values) to the new structure.
        Returns True when mutating the preview_data dict.
        """
        if not preview_data:
            return False

        changed = False
        buckets = ['records_to_skip', 'records_to_import']
        existing_indexes: Set[int] = set()

        for bucket in buckets:
            for entry in preview_data.get(bucket, []) or []:
                idx = entry.get('record_index')
                if isinstance(idx, int):
                    existing_indexes.add(idx)

        next_index = (max(existing_indexes) + 1) if existing_indexes else 0

        for bucket in buckets:
            for entry in preview_data.get(bucket, []) or []:
                idx = entry.get('record_index')
                if not isinstance(idx, int):
                    entry['record_index'] = next_index
                    next_index += 1
                    changed = True

        return changed

    def _finalize_preview_data(
        self,
        session_id: int,
        preview_data: Optional[Dict[str, Any]],
        session: Optional[ImportSession] = None
    ) -> Optional[Dict[str, Any]]:
        if preview_data and self._upgrade_preview_data_structure(preview_data):
            self._update_preview_cache(session_id, preview_data, session=session)
        return preview_data

    def _ensure_preview_data(self, session_id: int, session: Optional[ImportSession] = None) -> Optional[Dict[str, Any]]:
        """
        Ensure preview data is available by checking cache, session summary, or regenerating as needed.
        Returns a deep-copied structure safe for mutation.
        """
        # Attempt to read from cache
        cached_preview = self.processor.get_cached_results(session_id, 'preview')
        if cached_preview:
            preview_copy = json.loads(json.dumps(cached_preview))
            return self._finalize_preview_data(session_id, preview_copy, session=session)

        session = session or self.session_manager.get_session(session_id)
        if session:
            stored_preview = session.get_summary_data('preview_data')
            if stored_preview:
                preview_copy = json.loads(json.dumps(stored_preview))
                self.processor.cache_results(session_id, 'preview', preview_copy, ttl=3600)
                return self._finalize_preview_data(session_id, preview_copy, session=session)

        # Regenerate preview data when nothing cached or persisted
        regenerate_result = self.generate_preview(session_id)
        if not regenerate_result.get('success'):
            logger.error(
                "❌ Unable to regenerate preview data for session %s: %s",
                session_id,
                regenerate_result.get('error')
            )
            return None

        regenerated_preview = regenerate_result.get('preview_data')
        if not regenerated_preview:
            logger.error("❌ Regenerated preview data was empty for session %s", session_id)
            return None

        preview_copy = json.loads(json.dumps(regenerated_preview))
        self.processor.cache_results(session_id, 'preview', preview_copy, ttl=3600)

        session = session or self.session_manager.get_session(session_id)
        if session:
            session.add_summary_data({'preview_data': self.utc_normalizer.normalize_output(preview_copy)})
            self.db_session.commit()

        return self._finalize_preview_data(session_id, preview_copy, session=session)

    def _update_preview_cache(self, session_id: int, preview_data: Dict[str, Any], session: Optional[ImportSession] = None) -> None:
        """
        Persist updated preview data into the cache system and session summary.
        """
        preview_copy = json.loads(json.dumps(preview_data))
        self.processor.cache_results(session_id, 'preview', preview_copy, ttl=3600)

        session = session or self.session_manager.get_session(session_id)
        if session:
            session.add_summary_data({'preview_data': self.utc_normalizer.normalize_output(preview_copy)})
            self.db_session.commit()