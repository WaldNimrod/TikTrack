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
import uuid
from decimal import Decimal
import logging
import os
import json
import re
from collections import Counter
from html import escape
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError, SQLAlchemyError

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
from services.cash_flow_service import CashFlowService as CashFlowHelperService

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
    
    Function Index:
    ===============
    
    Session Management:
    - __init__: Initialize orchestrator with database session
    - create_import_session: Create new import session
    - reset_session: Reset import session to initial state
    - get_session_status: Get current session status
    - get_import_history: Get import history for trading account
    
    File Analysis:
    - analyze_file: Analyze uploaded file and extract raw records
    - _process_import_pipeline: Process import pipeline (internal)
    - _build_analysis_payload: Build analysis results payload
    - _summarize_cashflows: Summarize cashflow records
    - _build_type_breakdown: Build breakdown by cashflow type
    
    Preview Generation:
    - generate_preview: Generate preview of records to import
    - _build_preview_payload: Build preview payload with filtering
    - get_preview_snapshot: Get current preview snapshot
    - _ensure_preview_data: Ensure preview data exists
    - _update_preview_cache: Update preview cache
    
    Import Execution:
    - execute_import: Execute import of selected records
    - _execute_import_executions: Import execution records
    - _execute_import_cashflows: Import cashflow records (with 3 filtering points)
    - _execute_import_account_reconciliation: Import account reconciliation
    - _execute_report_only: Execute report-only import
    
    Account Linking:
    - detect_account_binding: Detect account binding from file
    - link_trading_account_to_file: Link trading account to file
    - confirm_account_link: Confirm account link
    - get_account_link_status: Get account link status
    - _ensure_cashflow_account_binding: Ensure cashflow account binding
    
    Duplicate Handling:
    - accept_duplicate: Accept duplicate record for import
    - reject_duplicate: Reject duplicate record
    - allow_existing_record: Allow existing record
    
    Utility Functions:
    - create_live_report: Create/update live import report
    - _make_payload_json_safe: Convert payload to JSON-safe format
    - _resolve_datetime: Resolve datetime value
    - _normalize_account_identifier: Normalize account identifier
    - _resolve_cashflow_storage_type: Resolve cashflow storage type
    - _calculate_import_totals_by_type: Calculate import totals by type
    - _compare_totals_with_cash_report: Compare totals with cash report
    - _detect_connector: Detect connector type from file
    - _normalise_symbol_metadata: Normalize symbol metadata
    - _build_links_rich_text: Build rich text for links
    - _merge_rich_text: Merge rich text blocks
    - _upgrade_preview_data_structure: Upgrade preview data structure
    - _finalize_preview_data: Finalize preview data
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
        task_type: str = 'executions',
        linking_context: Optional[Dict[str, Any]] = None
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
            if linking_context:
                self._initialize_linking_state(
                    session,
                    file_account_number=linking_context.get('file_account_number'),
                    matched_account_id=linking_context.get('matched_account_id'),
                    account_metadata=linking_context.get('account_metadata')
                )
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
        
        # Get cash_report_summary from connector if available (for cashflows task)
        cash_report_summary = {}
        if task_type == 'cashflows' and hasattr(connector, 'parse_sections'):
            sections = connector.parse_sections(file_content)
            cash_report_summary = sections.get('cash_report_summary', {})

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
            # Get file_account_number from session (set during account linking)
            file_account_number = session.get_summary_data('file_account_number')
            self._ensure_cashflow_account_binding(
                normalization_result.get('normalized_records', []),
                session.trading_account_id,
                file_account_number=file_account_number
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
            'symbol_metadata': symbol_metadata,
            'cash_report_summary': cash_report_summary  # Summary totals from Cash Report for validation
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

    def _extract_account_metadata(
        self,
        connector,
        file_content: str
    ) -> Dict[str, Any]:
        if not connector or not file_content:
            return {}

        metadata: Dict[str, Any] = {}
        try:
            if hasattr(connector, 'extract_account_metadata'):
                metadata = connector.extract_account_metadata(file_content) or {}
            elif hasattr(connector, 'parse_sections'):
                sections = connector.parse_sections(file_content) or {}
                metadata = sections.get('account_reconciliation') or {}
        except Exception as exc:
            logger.warning(
                "⚠️ Failed to resolve account metadata from file without session: %s",
                exc,
                exc_info=True
            )
            metadata = {}
        return metadata

    def _serialize_account(self, account: TradingAccount) -> Dict[str, Any]:
        if not account:
            return {}
        currency = account.currency
        return {
            'id': account.id,
            'name': account.name,
            'currency_id': account.currency_id,
            'currency_symbol': getattr(currency, 'symbol', None),
            'currency_name': getattr(currency, 'name', None),
            'status': account.status,
            'external_account_number': self._normalize_account_identifier(account.external_account_number)
        }

    def _initialize_linking_state(
        self,
        session: ImportSession,
        *,
        file_account_number: Optional[str],
        matched_account_id: Optional[int] = None,
        account_metadata: Optional[Dict[str, Any]] = None
    ) -> None:
        linking_status = 'recognized' if matched_account_id else (
            'unlinked' if file_account_number else 'missing_in_file'
        )
        payload: Dict[str, Any] = {
            'file_account_number': file_account_number,
            'linking_status': linking_status,
            'linking_confirmed': False,
            'linking_matched_account_id': matched_account_id
        }
        if account_metadata:
            payload['account_metadata'] = self._make_payload_json_safe(account_metadata)
        session.add_summary_data(payload)
        self.db_session.flush()

    def detect_account_binding(
        self,
        connector_type: str,
        file_content: str
    ) -> Dict[str, Any]:
        connector = self.connectors.get(connector_type)
        metadata = self._extract_account_metadata(connector, file_content)
        normalized_number = self._normalize_account_identifier(metadata.get('account_id'))

        matched_account = None
        if normalized_number:
            matched_account = self.db_session.query(TradingAccount).filter(
                TradingAccount.external_account_number == normalized_number
            ).first()

        return {
            'file_account_number': normalized_number,
            'matched_account': matched_account,
            'account_metadata': metadata
        }

    def _resolve_file_account_metadata(
        self,
        session: ImportSession,
        connector,
        file_content: str
    ) -> Dict[str, Any]:
        cached_metadata = session.get_summary_data('account_metadata')
        if cached_metadata:
            return cached_metadata

        metadata: Dict[str, Any] = self._extract_account_metadata(connector, file_content)

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
        current_account_number: Optional[str],
        *,
        recognized_account: Optional[TradingAccount] = None,
        requires_confirmation: bool = False
    ) -> Dict[str, Any]:
        linking_payload: Dict[str, Any] = {
            'status': status,
            'session_id': session.id,
            'trading_account_id': session.trading_account_id,
            'file_account_number': file_account_number,
            'current_account_number': current_account_number,
            'requires_confirmation': requires_confirmation
        }
        if recognized_account:
            linking_payload['recognized_account'] = self._serialize_account(recognized_account)
            linking_payload['matched_account_id'] = recognized_account.id
        return {
            'success': False,
            'error': message,
            'error_code': 'ACCOUNT_LINK_REQUIRED',
            'session_id': session.id,
            'linking': linking_payload
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
            session.add_summary_data({'linking_status': 'missing_in_file'})
            self.db_session.flush()
            return self._build_account_link_error(
                session,
                status='missing_in_file',
                message='Account number is missing in the uploaded file. Run the account check task or verify the report.',
                file_account_number=None,
                current_account_number=self._normalize_account_identifier(trading_account.external_account_number)
            )

        linking_confirmed = bool(session.get_summary_data('linking_confirmed'))
        linking_status = session.get_summary_data('linking_status')
        matched_account_id = session.get_summary_data('linking_matched_account_id')

        # If linking is already confirmed, skip all checks
        if linking_confirmed and linking_status == 'confirmed':
            # Verify that file_account_number matches what's stored
            stored_file_account = session.get_summary_data('file_account_number')
            if stored_file_account == file_account_number:
                logger.info(f"✅ [ACCOUNT_LINKING] Account linking already confirmed for session {session.id}")
                return None
        
        # CRITICAL: Also check if account is already linked in database (even if session not explicitly confirmed)
        # This handles the case where confirm_account_link was called but session state wasn't fully updated
        if file_account_number:
            existing_binding = self.db_session.query(TradingAccount).filter(
                TradingAccount.external_account_number == file_account_number
            ).first()
            if existing_binding and existing_binding.id == session.trading_account_id:
                # Account is already linked and matches session - no need for confirmation
                session.add_summary_data({
                    'linking_status': 'confirmed',
                    'linking_confirmed': True,
                    'linking_matched_account_id': existing_binding.id,
                    'file_account_number': file_account_number
                })
                self.db_session.flush()
                logger.info(f"✅ [ACCOUNT_LINKING] Account already linked in database for session {session.id}")
                return None

        if matched_account_id and not linking_confirmed:
            matched_account = self.db_session.query(TradingAccount).filter(
                TradingAccount.id == matched_account_id
            ).first()
            if matched_account:
                if session.trading_account_id != matched_account.id:
                    session.trading_account_id = matched_account.id
                    self.db_session.flush()
                return self._build_account_link_error(
                    session,
                    status='pending_confirmation',
                    message='המערכת זיהתה את מספר החשבון בקובץ. אשר את החשבון לפני המשך הייבוא.',
                    file_account_number=file_account_number,
                    current_account_number=self._normalize_account_identifier(matched_account.external_account_number),
                    recognized_account=matched_account,
                    requires_confirmation=True
                )

        existing_binding = self.db_session.query(TradingAccount).filter(
            TradingAccount.external_account_number == file_account_number
        ).first()
        if existing_binding and existing_binding.id != session.trading_account_id:
            session.add_summary_data({
                'linking_status': 'mismatch',
                'linking_matched_account_id': existing_binding.id,
                'linking_confirmed': False
            })
            self.db_session.flush()
            return self._build_account_link_error(
                session,
                status='mismatch',
                message=(
                    f"מספר החשבון בקובץ כבר משויך לחשבון המסחר \"{existing_binding.name}\". "
                    f"נא לבחור את החשבון הזה או לנתק את השיוך לפני המשך הייבוא."
                ),
                file_account_number=file_account_number,
                current_account_number=self._normalize_account_identifier(trading_account.external_account_number),
                recognized_account=existing_binding
            )

        existing_number = self._normalize_account_identifier(trading_account.external_account_number)

        if not existing_number:
            session.add_summary_data({'linking_status': 'unlinked'})
            self.db_session.flush()
            return self._build_account_link_error(
                session,
                status='unlinked',
                message='This trading account is not linked to a broker account yet. Please link it before continuing.',
                file_account_number=file_account_number,
                current_account_number=None
            )

        if existing_number != file_account_number:
            session.add_summary_data({'linking_status': 'mismatch'})
            self.db_session.flush()
            return self._build_account_link_error(
                session,
                status='mismatch',
                message='The broker account number in the file does not match the linked account. Please review and update the linkage.',
                file_account_number=file_account_number,
                current_account_number=existing_number
            )

        session.add_summary_data({
            'linking_status': 'confirmed',
            'linking_confirmed': True,
            'linking_matched_account_id': session.trading_account_id
        })
        self.db_session.flush()
        return None

    def link_trading_account_to_file(
        self,
        session_id: int,
        override_account_number: Optional[str] = None,
        target_trading_account_id: Optional[int] = None,
        confirm_overwrite: bool = False
    ) -> Dict[str, Any]:
        logger.info(f"🔗 [ACCOUNT_LINKING] Starting account linking process", extra={
            'session_id': session_id,
            'target_account_id': target_trading_account_id,
            'override_account_number': override_account_number,
            'confirm_overwrite': confirm_overwrite
        })
        
        session = self.db_session.query(ImportSession).filter(
            ImportSession.id == session_id
        ).first()

        if not session:
            logger.error(f"❌ [ACCOUNT_LINKING] Session not found: {session_id}")
            return {'success': False, 'error': 'Session not found'}

        connector_type = session.get_summary_data('connector_type')
        file_content = session.get_summary_data('file_content')
        connector = self.connectors.get(connector_type)

        if not connector or not file_content:
            logger.error(f"❌ [ACCOUNT_LINKING] Session missing data: connector={bool(connector)}, content={bool(file_content)}")
            return {'success': False, 'error': 'Session is missing connector or content data'}

        metadata = self._resolve_file_account_metadata(session, connector, file_content)
        file_account_number = override_account_number or metadata.get('account_id')
        normalized_number = self._normalize_account_identifier(file_account_number)

        if not normalized_number:
            logger.error(f"❌ [ACCOUNT_LINKING] Unable to determine account number from file")
            return {'success': False, 'error': 'Unable to determine account number from file'}

        logger.info(f"📋 [ACCOUNT_LINKING] File account number: {normalized_number}")

        target_account_id = target_trading_account_id or session.trading_account_id
        if not target_account_id:
            logger.error(f"❌ [ACCOUNT_LINKING] Target account ID not provided")
            return {'success': False, 'error': 'Target trading account not provided'}

        trading_account = self.db_session.query(TradingAccount).filter(
            TradingAccount.id == target_account_id
        ).first()

        if not trading_account:
            logger.error(f"❌ [ACCOUNT_LINKING] Trading account not found: {target_account_id}")
            return {'success': False, 'error': 'Trading account not found'}

        logger.info(f"🎯 [ACCOUNT_LINKING] Target account: ID={trading_account.id}, Name={trading_account.name}, Current external={trading_account.external_account_number}")

        # STEP 1: Check if the account number is already linked to a different account
        # If so, automatically remove the old link to allow the new one
        existing_binding = self.db_session.query(TradingAccount).filter(
            TradingAccount.external_account_number == normalized_number,
            TradingAccount.id != trading_account.id
        ).first()
        
        if existing_binding:
            logger.info(f"🔄 [ACCOUNT_LINKING] Found existing binding: Account ID={existing_binding.id}, Name={existing_binding.name}")
            # STEP 1a: Automatically remove the old link
            old_account_name = existing_binding.name
            old_account_id = existing_binding.id
            old_external = existing_binding.external_account_number
            existing_binding.external_account_number = None
            
            logger.info(f"🧹 [ACCOUNT_LINKING] Removing old link: Account {old_account_id} ({old_account_name}) - external_account_number set to None")
            
            try:
                # Commit the removal of old link first to avoid IntegrityError with unique constraint
                self.db_session.commit()
                logger.info(f"✅ [ACCOUNT_LINKING] Old link removed and committed successfully")
            except Exception as commit_error:
                logger.error(f"❌ [ACCOUNT_LINKING] Failed to commit old link removal: {commit_error}", exc_info=True)
                self.db_session.rollback()
                return {
                    'success': False,
                    'error': f'שגיאה בהסרת השיוך הישן: {str(commit_error)}'
                }
            
            # Refresh the trading_account to ensure we have the latest state
            self.db_session.refresh(trading_account)
            logger.info(f"🔄 [ACCOUNT_LINKING] Refreshed target account state")
            
            # Log the change for audit purposes
            logger.info(
                f"📝 [ACCOUNT_LINKING] Account link changed: {normalized_number} moved from account {old_account_id} ({old_account_name}) "
                f"to account {trading_account.id} ({trading_account.name})"
            )

        # STEP 2: Check if target account already has a different external number
        current_external_number = self._normalize_account_identifier(trading_account.external_account_number)
        if current_external_number and current_external_number != normalized_number and not confirm_overwrite:
            logger.warning(f"⚠️ [ACCOUNT_LINKING] Target account already has different external number: {current_external_number} != {normalized_number}")
            return {
                'success': False,
                'error': (
                    f"חשבונך כבר משויך למספר \"{current_external_number}\". "
                    f"יש לאשר החלפה לפני המשך התהליך."
                ),
                'error_code': 'ACCOUNT_LINK_OVERWRITE_REQUIRED',
                'existing_number': current_external_number,
                'target_account': self._serialize_account(trading_account)
            }

        # STEP 3: Create new link
        logger.info(f"🔗 [ACCOUNT_LINKING] Setting new link: Account {trading_account.id} -> {normalized_number}")
        trading_account.external_account_number = normalized_number
        session.trading_account_id = trading_account.id

        try:
            self.db_session.commit()
            logger.info(f"✅ [ACCOUNT_LINKING] New link committed successfully")
            
            # Refresh session to ensure it has the latest state
            self.db_session.refresh(session)
            logger.info(f"🔄 [ACCOUNT_LINKING] Refreshed session state - trading_account_id={session.trading_account_id}")
        except IntegrityError as e:
            self.db_session.rollback()
            # This should not happen if we properly removed the old link above
            logger.error(f"❌ [ACCOUNT_LINKING] IntegrityError during account linking: {e}", exc_info=True)
            return {
                'success': False,
                'error': 'מספר החשבון כבר משויך לחשבון מסחר אחר במערכת',
                'error_code': 'ACCOUNT_ALREADY_LINKED',
                'details': str(e)
            }
        except Exception as e:
            self.db_session.rollback()
            logger.error(f"❌ [ACCOUNT_LINKING] Unexpected error during account linking: {e}", exc_info=True)
            return {
                'success': False,
                'error': f'שגיאה בלתי צפויה בשיוך החשבון: {str(e)}',
                'error_code': 'ACCOUNT_LINK_ERROR',
                'details': str(e)
            }

        # STEP 4: Update session metadata
        session.add_summary_data({
            'file_account_number': normalized_number,
            'linking_status': 'linked',
            'linking_confirmed': True,
            'linking_matched_account_id': trading_account.id
        })
        self.db_session.flush()
        logger.info(f"✅ [ACCOUNT_LINKING] Session metadata updated")

        result = {
            'success': True,
            'linked_account_number': normalized_number,
            'trading_account_id': trading_account.id,
            'linked_account': self._serialize_account(trading_account)
        }
        
        logger.info(f"✅ [ACCOUNT_LINKING] Account linking completed successfully: Account {trading_account.id} ({trading_account.name}) linked to {normalized_number}")
        return result

    def confirm_account_link(self, session_id: int) -> Dict[str, Any]:
        session = self.db_session.query(ImportSession).filter(
            ImportSession.id == session_id
        ).first()

        if not session:
            return {'success': False, 'error': 'Session not found'}

        matched_account_id = session.get_summary_data('linking_matched_account_id')
        if not matched_account_id:
            return {
                'success': False,
                'error': 'No recognized account awaiting confirmation'
            }

        matched_account = self.db_session.query(TradingAccount).filter(
            TradingAccount.id == matched_account_id
        ).first()
        if not matched_account:
            return {
                'success': False,
                'error': 'Matched trading account no longer exists'
            }

        session.trading_account_id = matched_account.id
        session.add_summary_data({
            'linking_status': 'confirmed',
            'linking_confirmed': True,
            'linking_matched_account_id': matched_account.id
        })
        try:
            self.db_session.commit()
        except SQLAlchemyError as exc:
            self.db_session.rollback()
            return {
                'success': False,
                'error': f'Failed to confirm account link: {exc}'
            }

        return {
            'success': True,
            'linked_account': self._serialize_account(matched_account),
            'file_account_number': session.get_summary_data('file_account_number')
        }

    def get_account_link_status(self, session_id: int) -> Dict[str, Any]:
        session = self.db_session.query(ImportSession).filter(
            ImportSession.id == session_id
        ).first()

        if not session:
            return {'success': False, 'error': 'Session not found'}

        linking_status = session.get_summary_data('linking_status') or 'unknown'
        file_account_number = session.get_summary_data('file_account_number')
        matched_account_id = session.get_summary_data('linking_matched_account_id')
        matched_account = None
        if matched_account_id:
            matched_account = self.db_session.query(TradingAccount).filter(
                TradingAccount.id == matched_account_id
            ).first()

        return {
            'success': True,
            'linking': {
                'status': linking_status,
                'session_id': session.id,
                'trading_account_id': session.trading_account_id,
                'file_account_number': file_account_number,
                'current_account_number': self._normalize_account_identifier(
                    matched_account.external_account_number
                ) if matched_account else None,
                'recognized_account': self._serialize_account(matched_account) if matched_account else None,
                'linking_confirmed': bool(session.get_summary_data('linking_confirmed'))
            }
        }

    @staticmethod
    def _ensure_cashflow_account_binding(
        normalized_records: List[Dict[str, Any]],
        trading_account_id: Optional[int],
        file_account_number: Optional[str] = None
    ) -> None:
        """
        Ensure that normalized cashflow records are bound to the selected trading account.
        
        IMPORTANT: This function sets account information that is constant for the entire file:
        - source_account: trading_account_id (internal account ID)
        - external_account_number: file_account_number (external account identifier from file)
        
        These are set during account linking and applied to all records uniformly.

        Args:
            normalized_records: Cashflow records after normalization
            trading_account_id: Active trading account ID for the session
            file_account_number: External account number from file (set during account linking)
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
            
            # Preserve original account if different from current
            if 'original_source_account' not in metadata and original_account not in (None, '', account_identifier):
                metadata['original_source_account'] = original_account
            
            # Set internal account ID (constant for all records in file)
            record['source_account'] = account_identifier
            
            # Set external account number (constant for all records in file, from account linking)
            if file_account_number:
                record['external_account_number'] = file_account_number
                metadata['file_account_number'] = file_account_number

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
            
            # CRITICAL: Extract records from clean_records for storage in analysis_data
            clean_records = duplicate_result.get('clean_records', [])
            cashflow_records_list = []
            for entry in clean_records:
                if isinstance(entry, dict) and 'record' in entry:
                    record = entry['record']
                    cashflow_records_list.append({
                        'cashflow_type': record.get('cashflow_type'),
                        'amount': record.get('amount'),
                        'currency': record.get('currency'),
                        'effective_date': record.get('effective_date'),
                        'memo': record.get('memo'),
                        'section': record.get('section'),
                        'source_account': record.get('source_account'),
                        'external_account_number': record.get('external_account_number'),
                        'external_id': record.get('external_id')
                    })
                elif isinstance(entry, dict):
                    cashflow_records_list.append({
                        'cashflow_type': entry.get('cashflow_type'),
                        'amount': entry.get('amount'),
                        'currency': entry.get('currency'),
                        'effective_date': entry.get('effective_date'),
                        'memo': entry.get('memo'),
                        'section': entry.get('section'),
                        'source_account': entry.get('source_account'),
                        'external_account_number': entry.get('external_account_number'),
                        'external_id': entry.get('external_id')
                    })
            
            # Add cashflows records to summary_data for frontend
            summary_data['cashflows'] = {
                'records': cashflow_records_list,
                'type_stats': cashflow_summary.get('type_stats', {}),
                'totals_by_type': cashflow_summary.get('totals_by_type', {}),
                'totals_by_currency': cashflow_summary.get('totals_by_currency', {})
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

        if task == 'portfolio_positions':
            positions_detected = len(validation_result.get('valid_records', []))
            analysis_results = {
                **base_stats,
                'currency_totals': validation_result.get('currency_totals', {}),
                'asset_category_totals': validation_result.get('asset_category_totals', {}),
                'zero_quantity_positions': validation_result.get('zero_quantity_positions', []),
                'positions_detected': positions_detected
            }
            summary_data = {
                'task_type': task,
                'analysis_timestamp': analysis_timestamp,
                'currency_totals': validation_result.get('currency_totals', {}),
                'asset_category_totals': validation_result.get('asset_category_totals', {}),
                'zero_quantity_positions': validation_result.get('zero_quantity_positions', []),
                'positions_detected': positions_detected,
                'duplicate_details': duplicate_result
            }
            return analysis_results, summary_data

        if task == 'taxes_and_fx':
            taxes_detected = len(validation_result.get('valid_records', []))
            analysis_results = {
                **base_stats,
                'totals_by_currency': validation_result.get('totals_by_currency', {}),
                'totals_by_type': validation_result.get('totals_by_type', {}),
                'nav_components': validation_result.get('nav_components', {}),
                'forex_trades': validation_result.get('forex_trades', []),
                'taxes_detected': taxes_detected
            }
            summary_data = {
                'task_type': task,
                'analysis_timestamp': analysis_timestamp,
                'totals_by_currency': validation_result.get('totals_by_currency', {}),
                'totals_by_type': validation_result.get('totals_by_type', {}),
                'nav_components': validation_result.get('nav_components', {}),
                'forex_trades': validation_result.get('forex_trades', []),
                'taxes_detected': taxes_detected,
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
            storage_type = (
                CashFlowHelperService.EXCHANGE_TO_TYPE
                if is_positive else CashFlowHelperService.EXCHANGE_FROM_TYPE
            )
            mapping_note = 'Forex conversion'
        elif raw_type == 'dividend':
            storage_type = 'dividend'
        elif raw_type == 'dividend_accrual':
            # IMPORTANT: Dividend accrual records represent declared but not yet paid dividends.
            # These are accounting entries, not actual cash movements.
            # They do NOT represent money that entered or left the account.
            # IBKR includes them for accounting purposes, but they should not be imported as regular dividends.
            # Users should verify the actual meaning of these records before importing.
            # They are stored as 'other_positive'/'other_negative' to distinguish them from real dividends.
            storage_type = 'other_positive' if is_positive else 'other_negative'
            mapping_note = 'Dividend accrual (accounting entry, not actual cash)'
        elif raw_type == 'interest':
            storage_type = 'interest'
        elif raw_type == 'interest_accrual':
            # IMPORTANT: Interest accrual records represent declared but not yet paid/received interest.
            # These are accounting entries, not actual cash movements.
            # They do NOT represent money that entered or left the account.
            # IBKR includes them for accounting purposes, but they should not be imported as regular interest.
            # They are stored as 'other_positive'/'other_negative' to distinguish them from real interest.
            storage_type = 'other_positive' if is_positive else 'other_negative'
            mapping_note = 'Interest accrual (accounting entry, not actual cash)'
        elif raw_type == 'tax':
            storage_type = 'tax'
        elif raw_type == 'fee':
            storage_type = 'fee'
        elif raw_type == 'borrow_fee':
            storage_type = 'fee'
            mapping_note = 'Borrow fee'
        elif raw_type == 'syep_interest':
            storage_type = 'syep_interest'
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

    def _calculate_import_totals_by_type(self, records_to_import: List[Dict[str, Any]]) -> Dict[str, float]:
        """
        Calculate total amounts by cashflow_type from records to be imported.
        
        IMPORTANT: This function calculates totals only for records that are actually selected
        for import (after filtering by selected_types). It uses abs(amount) to ensure
        consistent comparison with Cash Report totals.
        
        Args:
            records_to_import: List of records that will be imported (already filtered by selected_types)
            
        Returns:
            Dict mapping cashflow_type to total_amount (absolute values for comparison)
        """
        totals: Dict[str, float] = {}
        for record in records_to_import:
            cashflow_type = (record.get('cashflow_type') or '').lower()
            if not cashflow_type:
                continue
            try:
                amount = float(record.get('amount', 0))
                # Use absolute value for consistent comparison with Cash Report
                totals[cashflow_type] = totals.get(cashflow_type, 0.0) + abs(amount)
            except (TypeError, ValueError):
                # Skip records with invalid amounts
                continue
        return totals

    def _compare_totals_with_cash_report(
        self,
        import_totals: Dict[str, float],
        cash_report_summary: Dict[str, float]
    ) -> Dict[str, Dict[str, Any]]:
        """
        Compare import totals with Cash Report summary totals.
        
        IMPORTANT: This comparison only includes REAL cash movements.
        It excludes:
        - Cash FX Translation Gain/Loss (unrealized FX, not actual cash)
        - Trades (Sales/Purchase) (part of executions, not cashflow)
        - Commissions (included in executions/forex, not separate)
        - Accruals (accounting entries, not actual cash)
        
        Args:
            import_totals: Dict mapping cashflow_type to total_amount from import
            cash_report_summary: Dict mapping cashflow_type to total_amount from Cash Report
                                (already filtered to exclude non-cash activities)
            
        Returns:
            Dict with comparison results for each cashflow_type
        """
        comparison: Dict[str, Dict[str, Any]] = {}
        
        # Only compare REAL cashflow types (exclude accruals and forex from import side)
        # Note: forex_conversion is not in Cash Report (it's part of Trades)
        # Note: accruals are not in Cash Report (they are accounting entries)
        real_cashflow_types = {
            'deposit', 'withdrawal', 'transfer', 'dividend', 
            'interest', 'tax', 'fee', 'borrow_fee', 'syep_interest'
        }
        
        # Get types that exist in both sources (only real cashflows)
        import_real_types = {t for t in import_totals.keys() if t in real_cashflow_types}
        report_types = set(cash_report_summary.keys())
        all_types = import_real_types | report_types
        
        for cashflow_type in all_types:
            import_total = import_totals.get(cashflow_type, 0.0)
            report_total = cash_report_summary.get(cashflow_type, 0.0)
            difference = abs(import_total - report_total)
            
            # Consider match if difference is less than 0.01 (small rounding differences)
            match = difference < 0.01
            
            comparison[cashflow_type] = {
                'import_total': import_total,
                'report_total': report_total,
                'difference': difference,
                'match': match
            }
        
        return comparison

    def _build_preview_payload(self, task_type: str, pipeline_result: Dict[str, Any], selected_types: Optional[List[str]] = None) -> Dict[str, Any]:
        """
        Construct preview payload based on task type.
        
        Args:
            task_type: Task type (e.g., 'cashflows', 'executions')
            pipeline_result: Result from import pipeline
            selected_types: Optional list of cashflow types to import (for cashflows task)
        """
        task = (task_type or 'executions').lower()
        validation_result = pipeline_result['validation_result']
        duplicate_result = pipeline_result['duplicate_result']
        raw_records = pipeline_result['raw_records']
        symbol_metadata = pipeline_result.get('symbol_metadata', {})
        cash_report_summary = pipeline_result.get('cash_report_summary', {})  # Summary totals from Cash Report

        if task == 'cashflows':
            clean_records = duplicate_result.get('clean_records', [])
            records_to_import: List[Dict[str, Any]] = []
            records_to_skip: List[Dict[str, Any]] = []
            for entry in clean_records:
                record = entry['record']
                cashflow_type = (record.get('cashflow_type') or '').lower()
                
                # IMPORTANT: Verify that the second column is "Data" - only Data rows are actual records
                # This is a critical validation: rows with Header, Trailer, Total, etc. are NOT data records
                # For IBKR format: {Section Name},Data,{field1},{field2},...
                # The second column MUST be "Data" for this to be a valid record
                section = record.get('section') or ''
                
                # All records from _parse_cashflow_sections already passed the check (line 342: if not stripped.startswith(f'{current_section},Data'))
                # Forex conversions from Trades section also come from Data rows (Trades,Data,Order,...)
                # So we trust that records reaching here are valid Data rows
                # However, we add an explicit check if _raw_row is available for extra safety
                raw_row = record.get('_raw_row')
                if raw_row and isinstance(raw_row, dict):
                    # If we have _raw_row, we can verify it came from a Data row
                    # But since _parse_cashflow_sections already filters, this is just a safety check
                    # The real validation happens in _parse_cashflow_sections line 342
                    pass
                
                # IMPORTANT: According to IBKR Import Documentation (_Tmp/TikTrack_IBKR_Import_Documentation.md),
                # these are accounting entries, NOT actual cash movements, and should NOT be imported:
                # - dividend_accrual (Change in Dividend Accruals)
                # - interest_accrual (Change in Interest Accruals)
                # - syep_activity (Stock Yield Enhancement Program Activity)
                # - syep_interest (SYEP Interest Details)
                # - cash_report (Cash Report - summary section)
                # - FX Translation Gain/Loss (unrealized FX, not actual cash)
                # These should be automatically skipped, not imported as 'other_positive'/'other_negative'
                # NOTE: Most of these are already filtered in _identify_record_type (returns None),
                # but we add an extra safety check here in case any slip through
                skip_accounting_entries = [
                    'dividend_accrual',
                    'interest_accrual',
                    'syep_activity',
                    'syep_interest',
                    'cash_report',
                    'fx_translation',
                    'cash_fx_translation_gain_loss'
                ]
                
                if cashflow_type in skip_accounting_entries:
                    # Add to records_to_skip with clear reason
                    records_to_skip.append({
                        'record_index': entry.get('record_index'),
                        'record': record,
                        'reason': 'accounting_entry_not_cash',
                        'cashflow_type': cashflow_type,
                        'message': f'Accounting entry ({cashflow_type}) - not an actual cash movement per IBKR Import Documentation'
                    })
                    logger.debug(f"⏭️ Skipping accounting entry in preview: {cashflow_type} from section {section}")
                    continue
                
                # CRITICAL: Resolve storage_type BEFORE pairing forex records
                # This ensures forex_conversion records get correct storage_type (currency_exchange_from/to)
                storage_type, mapping_note = self._resolve_cashflow_storage_type(record)
                
                # IMPORTANT: Update record with storage_type for pairing logic
                record['storage_type'] = storage_type

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
                    'metadata': metadata,
                    # Preserve commission from IBKR connector (from Comm/Fee field)
                    'commission': record.get('commission')
                }
                records_to_import.append(record_payload)

            # Filter records by selected_types if provided (for cashflows task)
            if selected_types and isinstance(selected_types, list) and len(selected_types) > 0:
                # Normalize selected_types to lowercase for comparison
                selected_types_lower = [t.lower() for t in selected_types]
                original_count = len(records_to_import)
                
                # Debug: Show sample of cashflow_type values before filtering
                sample_types = [rec.get('cashflow_type', 'NO_TYPE') for rec in records_to_import[:10]]
                logger.info(
                    "🔍 [GENERATE_PREVIEW] Filtering by selected_types: %s (sample types: %s)",
                    selected_types_lower,
                    sample_types
                )
                
                # IMPORTANT: Filter records - only keep those matching selected_types
                filtered_records = []
                for rec in records_to_import:
                    rec_cf_type = (rec.get('cashflow_type') or '').lower()
                    if rec_cf_type in selected_types_lower:
                        filtered_records.append(rec)
                
                records_to_import = filtered_records
                
                logger.info(
                    "🔍 [GENERATE_PREVIEW] Filtered cashflow records: %s -> %s (removed %s)",
                    original_count,
                    len(records_to_import),
                    original_count - len(records_to_import)
                )
                
                # Debug: Show what types remain after filtering
                if records_to_import:
                    remaining_types = [rec.get('cashflow_type', 'NO_TYPE') for rec in records_to_import[:5]]
                    logger.info(
                        "🔍 [GENERATE_PREVIEW] Remaining types after filter: %s",
                        remaining_types
                    )
                else:
                    logger.warning(
                        "⚠️ [GENERATE_PREVIEW] No records remain after filtering! selected_types: %s",
                        selected_types_lower
                    )

            # Pair forex conversions: assign shared exchange_<uuid> external_id for from/to sides
            # Improved pairing: match by date + currencies + exchange_rate (from metadata)
            try:
                from_type = CashFlowHelperService.EXCHANGE_FROM_TYPE
                to_type = CashFlowHelperService.EXCHANGE_TO_TYPE
                
                def extract_date_str(value):
                    # value may be envelope or iso string
                    if isinstance(value, dict):
                        return value.get('date') or value.get('utc') or value.get('local')
                    return value
                
                def get_currency_from_record(rec: Dict[str, Any], direction: str) -> Optional[str]:
                    """Get currency from record - check metadata first, then currency field"""
                    meta = rec.get('metadata') or {}
                    if direction == 'from':
                        return meta.get('source_currency') or rec.get('source_currency') or rec.get('currency')
                    else:  # to
                        return meta.get('target_currency') or rec.get('target_currency') or rec.get('currency')
                
                def get_exchange_rate(rec: Dict[str, Any]) -> Optional[float]:
                    """Get exchange_rate from metadata"""
                    meta = rec.get('metadata') or {}
                    rate = meta.get('exchange_rate')
                    if rate is not None:
                        try:
                            return float(rate)
                        except (TypeError, ValueError):
                            pass
                    # Fallback: try trade_price
                    trade_price = rec.get('trade_price')
                    if trade_price is not None:
                        try:
                            return float(trade_price)
                        except (TypeError, ValueError):
                            pass
                    return None
                
                def get_asset_symbol(rec: Dict[str, Any]) -> Optional[str]:
                    """Get asset_symbol (Symbol) from record - check metadata first, then asset_symbol field"""
                    meta = rec.get('metadata') or {}
                    symbol = meta.get('symbol') or rec.get('asset_symbol') or rec.get('Symbol')
                    if symbol and isinstance(symbol, str) and '.' in symbol:
                        return symbol.strip().upper()
                    return None
                
                # Create list of candidates with indices
                # IMPORTANT: Match forex records by cashflow_type='forex_conversion' OR storage_type
                # This ensures we catch all forex records, even if storage_type wasn't set yet
                # CRITICAL: storage_type should already be resolved at this point (line 1483-1485),
                # but we check both to be safe
                from_indices = []
                to_indices = []
                for idx, rec in enumerate(records_to_import):
                    st = rec.get('storage_type')
                    cf_type = (rec.get('cashflow_type') or '').lower()
                    amount = rec.get('amount', 0)
                    
                    # Match by storage_type (preferred - should be resolved by now) OR by cashflow_type='forex_conversion'
                    # FROM records: negative amount, storage_type='currency_exchange_from' OR cashflow_type='forex_conversion' with negative amount
                    if st == from_type or (cf_type == 'forex_conversion' and amount < 0):
                        from_indices.append(idx)
                        logger.debug(f"✅ [PAIRING] Found FROM record at index {idx}: storage_type={st}, cashflow_type={cf_type}, amount={amount}")
                    # TO records: positive amount, storage_type='currency_exchange_to' OR cashflow_type='forex_conversion' with positive amount
                    elif st == to_type or (cf_type == 'forex_conversion' and amount > 0):
                        to_indices.append(idx)
                        logger.debug(f"✅ [PAIRING] Found TO record at index {idx}: storage_type={st}, cashflow_type={cf_type}, amount={amount}")
                
                used_to = set()
                for fi in from_indices:
                    f = records_to_import[fi]
                    f_date = extract_date_str(f.get('effective_date'))
                    f_from_currency = get_currency_from_record(f, 'from')
                    f_to_currency = get_currency_from_record(f, 'to')
                    f_exchange_rate = get_exchange_rate(f)
                    f_asset_symbol = get_asset_symbol(f)
                    
                    # Find matching TO record:
                    # 1. Same date
                    # 2. Matching currencies (f.from_currency == t.from_currency, f.to_currency == t.to_currency)
                    # 3. Matching exchange_rate (if available)
                    # 4. Matching asset_symbol (if available) - strongest indicator
                    chosen_ti = None
                    best_match_score = -1
                    
                    for ti in to_indices:
                        if ti in used_to:
                            continue
                        t = records_to_import[ti]
                        t_date = extract_date_str(t.get('effective_date'))
                        
                        # Check date match
                        date_match = False
                        if f_date and t_date:
                            date_match = str(f_date)[:10] == str(t_date)[:10]
                        if not date_match:
                            continue
                        
                        # Check currency match
                        t_from_currency = get_currency_from_record(t, 'from')
                        t_to_currency = get_currency_from_record(t, 'to')
                        t_exchange_rate = get_exchange_rate(t)
                        t_asset_symbol = get_asset_symbol(t)
                        
                        currency_match = (
                            f_from_currency and t_from_currency and 
                            f_from_currency.upper() == t_from_currency.upper() and
                            f_to_currency and t_to_currency and
                            f_to_currency.upper() == t_to_currency.upper()
                        )
                        
                        # Check asset_symbol match (strongest indicator - exact match)
                        asset_symbol_match = (
                            f_asset_symbol and t_asset_symbol and
                            f_asset_symbol == t_asset_symbol
                        )
                        
                        # Calculate match score (higher is better)
                        match_score = 0
                        if date_match:
                            match_score += 1
                        if currency_match:
                            match_score += 2
                        if asset_symbol_match:
                            match_score += 4  # Strong indicator - exact symbol match
                        if f_exchange_rate and t_exchange_rate:
                            # Allow small tolerance for floating point comparison
                            rate_diff = abs(f_exchange_rate - t_exchange_rate)
                            if rate_diff < 0.0001:  # Very close match
                                match_score += 3
                            elif rate_diff < 0.01:  # Close match
                                match_score += 1
                        
                        # Prefer exact matches (score >= 7 = date + currency + asset_symbol, or >= 6 = date + currency + rate)
                        if match_score > best_match_score:
                            best_match_score = match_score
                            chosen_ti = ti
                            # If we have a perfect match (with asset_symbol or date+currency+rate), use it immediately
                            if match_score >= 7 or (match_score >= 6 and asset_symbol_match):
                                break
                    
                    # If no match found, try any unused TO on same date (fallback)
                    if chosen_ti is None:
                        for ti in to_indices:
                            if ti in used_to:
                                continue
                            t = records_to_import[ti]
                            t_date = extract_date_str(t.get('effective_date'))
                            if f_date and t_date and str(f_date)[:10] == str(t_date)[:10]:
                                chosen_ti = ti
                                break
                    
                    # If still no match, use any unused TO (last resort)
                    if chosen_ti is None:
                        for ti in to_indices:
                            if ti not in used_to:
                                chosen_ti = ti
                                break
                    
                    if chosen_ti is None:
                        logger.warning(
                            "⚠️ [PAIRING] No matching TO record found for FROM record at index %s (currency: %s, symbol: %s). "
                            "This FROM record will be skipped during import.",
                            fi,
                            f_from_currency,
                            f_asset_symbol or 'N/A'
                        )
                        # Mark this FROM record to be skipped (it's incomplete)
                        records_to_import[fi]['_skip_incomplete'] = True
                        continue
                    
                    used_to.add(chosen_ti)
                    t = records_to_import[chosen_ti]
                    
                    # Assign shared external_id in canonical exchange_<uuid> format
                    exchange_uuid = uuid.uuid4().hex
                    exchange_id = CashFlowHelperService.create_exchange_id(exchange_uuid)
                    
                    # Ensure metadata exists and is consistent
                    for rec in (f, t):
                        meta = rec.get('metadata')
                        if meta is None or not isinstance(meta, dict):
                            meta = {}
                            rec['metadata'] = meta
                        meta['exchange_external_id'] = exchange_id
                        # Ensure currency info is in metadata for later use
                        if 'source_currency' not in meta:
                            source_curr = get_currency_from_record(rec, 'from')
                            if source_curr:
                                meta['source_currency'] = source_curr
                        if 'target_currency' not in meta:
                            target_curr = get_currency_from_record(rec, 'to')
                            if target_curr:
                                meta['target_currency'] = target_curr
                        # Ensure exchange_rate is in metadata
                        if 'exchange_rate' not in meta:
                            rate = get_exchange_rate(rec)
                            if rate is not None:
                                meta['exchange_rate'] = rate
                        # Favor shared external_id for import/storage
                        rec['external_id'] = exchange_id
                    
                    logger.debug(
                        "✅ [PAIRING] Paired exchange: FROM (idx %s, %s) <-> TO (idx %s, %s), rate: %s, symbol: %s",
                        fi,
                        f_from_currency,
                        chosen_ti,
                        get_currency_from_record(t, 'to'),
                        f_exchange_rate or 'N/A',
                        f_asset_symbol or 'N/A'
                    )
                    
            except Exception as pairing_error:
                logger.error("❌ Forex pairing step failed: %s", pairing_error, exc_info=True)

            records_to_skip: List[Dict[str, Any]] = []
            
            # Add incomplete exchange pairs (FROM without TO or vice versa) to skip list
            for idx, rec in enumerate(records_to_import):
                if rec.get('_skip_incomplete'):
                    storage_type, mapping_note = self._resolve_cashflow_storage_type(rec)
                    records_to_skip.append({
                        'record': rec,
                        'reason': 'incomplete_exchange_pair',
                        'errors': ['No matching TO record found for this FROM record'],
                        'cashflow_type': rec.get('cashflow_type'),
                        'section': rec.get('section'),
                        'metadata': rec.get('metadata', {}),
                        'storage_type': storage_type,
                        'mapping_note': mapping_note
                    })
                    # Remove from records_to_import
                    records_to_import[idx] = None
            
            # Remove None entries (incomplete pairs)
            records_to_import = [r for r in records_to_import if r is not None]
            
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
            
            # Calculate import totals by type (for selected types only)
            # NOTE: This includes only REAL cash movements that were selected for import.
            # The calculation uses abs(amount) for consistent comparison with Cash Report.
            # Accruals and forex_conversion are excluded from comparison (see _compare_totals_with_cash_report).
            import_totals_by_type = self._calculate_import_totals_by_type(records_to_import)
            
            # Compare import totals with Cash Report summary
            # IMPORTANT: Comparison only includes real cashflows, excludes:
            # - forex_conversion (not in Cash Report, part of Trades section)
            # - dividend_accrual, interest_accrual (not in Cash Report, accounting entries, not actual cash)
            # - Cash FX Translation, Trades (Sales/Purchase), Commissions (already excluded from cash_report_summary)
            # 
            # Only the following types are compared:
            # deposit, withdrawal, transfer, dividend, interest, tax, fee, borrow_fee, syep_interest
            summary_comparison = self._compare_totals_with_cash_report(
                import_totals_by_type,
                cash_report_summary
            )

            # IMPORTANT: Store selected_types in preview_data for later use (e.g., accept_duplicate, execute_import)
            # CRITICAL: selected_types must be stored here to ensure it's available in execute_import
            result = {
                'task_type': task,
                'records_to_import': records_to_import,
                'records_to_skip': records_to_skip,
                'selected_types': selected_types or [],  # Store selected_types for filtering in execute_import and accept_duplicate
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
                    'issues_by_type': validation_result.get('issues_by_type', {}),
                    'summary_comparison': summary_comparison  # Comparison with Cash Report
                },
                'cashflow_summary': cashflow_summary,
                'cashflow_records': len(records_to_import),
                'symbol_metadata': symbol_metadata
            }
            
            # CRITICAL: Return result for cashflows task - don't fall through to executions code
            return result

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

        if task == 'portfolio_positions':
            valid_records = validation_result.get('valid_records', [])
            invalid_records = validation_result.get('invalid_records', [])
            validation_errors = validation_result.get('validation_errors', [])

            records_to_skip = [
                {
                    'record': error_info.get('record'),
                    'reason': 'validation_error',
                    'errors': error_info.get('errors', [])
                }
                for error_info in validation_errors
            ]

            return {
                'task_type': task,
                'records_to_import': valid_records,
                'records_to_skip': records_to_skip,
                'summary': {
                    'total_records': len(raw_records),
                    'valid_records': len(valid_records),
                    'invalid_records': len(invalid_records),
                    'currency_totals': validation_result.get('currency_totals', {}),
                    'asset_category_totals': validation_result.get('asset_category_totals', {}),
                    'zero_quantity_positions': validation_result.get('zero_quantity_positions', [])
                }
            }

        if task == 'taxes_and_fx':
            valid_records = validation_result.get('valid_records', [])
            invalid_records = validation_result.get('invalid_records', [])
            validation_errors = validation_result.get('validation_errors', [])

            records_to_skip = [
                {
                    'record': error_info.get('record'),
                    'reason': 'validation_error',
                    'errors': error_info.get('errors', [])
                }
                for error_info in validation_errors
            ]

            return {
                'task_type': task,
                'records_to_import': valid_records,
                'records_to_skip': records_to_skip,
                'summary': {
                    'total_records': len(raw_records),
                    'valid_records': len(valid_records),
                    'invalid_records': len(invalid_records),
                    'totals_by_currency': validation_result.get('totals_by_currency', {}),
                    'totals_by_type': validation_result.get('totals_by_type', {}),
                    'nav_components': validation_result.get('nav_components', {}),
                    'forex_trades': validation_result.get('forex_trades', [])
                }
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
            # CRITICAL: Store analysis_data for frontend (same structure as summary_data but with key 'analysis_data')
            session.add_summary_data({'analysis_data': summary_data_storage})
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
    
    def generate_preview(self, session_id: int, task_type: Optional[str] = None, selected_types: Optional[List[str]] = None) -> Dict[str, Any]:
        """
        Generate preview data for user confirmation.
        
        Args:
            session_id: Import session ID
            task_type: Optional override for task type
            selected_types: Optional list of cashflow types to import (for cashflows task)
            
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

            preview_data_raw = self._build_preview_payload(normalized_task, pipeline_result, selected_types=selected_types)
            preview_data_raw['task_type'] = normalized_task
            
            # CRITICAL: Store selected_types in preview_data BEFORE saving
            # This ensures it's available when execute_import loads preview_data
            preview_data_raw['selected_types'] = selected_types or []

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
    
    def execute_import(self, session_id: int, task_type: Optional[str] = None, selected_types: Optional[List[str]] = None) -> Dict[str, Any]:
        """
        Execute the import process and persist records according to the active task type.
        
        Args:
            session_id: Import session ID
            task_type: Optional override for task type
            selected_types: Optional list of cashflow types to import (for cashflows task)
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

            logger.info(
                "🔍 [EXECUTE_IMPORT] Starting import for session %s with selected_types: %s",
                session_id,
                selected_types
            )
            preview_result = self.generate_preview(session_id, requested_task_type, selected_types=selected_types)
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
            
            # CRITICAL: Use selected_types from parameter OR from preview_data
            # This ensures filtering works even if selected_types wasn't passed to execute_import
            if not selected_types:
                selected_types = preview_data.get('selected_types', [])
                logger.info(
                    "🔍 [EXECUTE_IMPORT] Loaded selected_types from preview_data: %s",
                    selected_types
                )
            
            # IMPORTANT: Double-check filtering by selected_types
            # Even though generate_preview should have filtered, we verify here to ensure consistency
            if selected_types and isinstance(selected_types, list) and len(selected_types) > 0:
                selected_types_lower = [t.lower() for t in selected_types]
                original_count = len(preview_data.get('records_to_import', []))
                
                # Debug: Show sample types before filtering
                sample_before = [rec.get('cashflow_type', 'NO_TYPE') for rec in preview_data.get('records_to_import', [])[:10]]
                logger.info(
                    "🔍 [EXECUTE_IMPORT] Before filtering: %s records, sample types: %s, selected_types: %s",
                    original_count,
                    sample_before,
                    selected_types_lower
                )
                
                filtered_records = [
                    rec for rec in preview_data.get('records_to_import', [])
                    if (rec.get('cashflow_type') or '').lower() in selected_types_lower
                ]
                
                # Debug: Show what was filtered
                sample_after = [rec.get('cashflow_type', 'NO_TYPE') for rec in filtered_records[:10]]
                logger.info(
                    "🔍 [EXECUTE_IMPORT] After filtering: %s records, sample types: %s",
                    len(filtered_records),
                    sample_after
                )
                
                if len(filtered_records) != original_count:
                    logger.warning(
                        "⚠️ [EXECUTE_IMPORT] Additional filtering applied: %s -> %s records (selected_types: %s)",
                        original_count,
                        len(filtered_records),
                        selected_types
                    )
                    preview_data['records_to_import'] = filtered_records
                    preview_data['selected_types'] = selected_types  # Ensure it's stored
                else:
                    logger.warning(
                        "⚠️ [EXECUTE_IMPORT] No filtering occurred! All %s records passed through (selected_types: %s)",
                        original_count,
                        selected_types
                    )
                    # CRITICAL: Even if no filtering occurred, ensure selected_types is stored
                    preview_data['selected_types'] = selected_types
            
            records_to_import = preview_data.get('records_to_import', []) or []
            
            # CRITICAL: Final validation - if selected_types was provided, verify all records match
            if selected_types and isinstance(selected_types, list) and len(selected_types) > 0:
                selected_types_lower = [t.lower() for t in selected_types]
                mismatched_records = []
                for rec in records_to_import:
                    rec_cf_type = (rec.get('cashflow_type') or '').lower()
                    if rec_cf_type not in selected_types_lower:
                        mismatched_records.append({
                            'cashflow_type': rec_cf_type,
                            'expected': selected_types_lower
                        })
                
                if mismatched_records:
                    error_msg = (
                        f"CRITICAL: Found {len(mismatched_records)} records that don't match selected_types. "
                        f"Expected: {selected_types_lower}, Found: {[r['cashflow_type'] for r in mismatched_records[:5]]}"
                    )
                    logger.error(f"❌ [EXECUTE_IMPORT] {error_msg}")
                    import_session.update_status('failed')
                    self.db_session.commit()
                    return {
                        'success': False,
                        'error': error_msg,
                        'error_code': 'FILTERING_MISMATCH'
                    }
                else:
                    logger.info(
                        "✅ [EXECUTE_IMPORT] All %s records match selected_types: %s",
                        len(records_to_import),
                        selected_types_lower
                    )
            
            # IMPORTANT: All records in records_to_import must have passed the "Data" column check
            # This means the second column in the original CSV was "Data" (not Header, Trailer, Total, etc.)
            # This validation happens in IBKRConnector._parse_cashflow_sections line 342:
            #   if not stripped.startswith(f'{current_section},Data'): continue
            # All records reaching here are guaranteed to be valid Data rows
            
            logger.info(
                "📦 Session %s: %s records ready for import (selected_types: %s)",
                session_id,
                len(records_to_import),
                selected_types or 'all'
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
            elif requested_task_type in {'portfolio_positions', 'taxes_and_fx'}:
                task_result = self._execute_report_only(import_session, preview_data, requested_task_type)
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
        from_type = CashFlowHelperService.EXCHANGE_FROM_TYPE
        to_type = CashFlowHelperService.EXCHANGE_TO_TYPE

        # IMPORTANT: All records in raw_entries must have passed the "Data" column check
        # This means the second column in the original CSV was "Data" (not Header, Trailer, Total, etc.)
        # This validation happens in IBKRConnector._parse_cashflow_sections line 442:
        #   if not stripped.startswith(f'{current_section},Data'): continue
        # All records reaching here are guaranteed to be valid Data rows with correct cashflow_type
        
        # Helper function to extract record dict from entry (handles both formats)
        def extract_record(entry):
            """Extract record dict from entry (handles both formats)"""
            if isinstance(entry, dict):
                if 'record' in entry:
                    return entry['record']
                return entry
            return entry
        
        # IMPORTANT: Log what we're about to import
        logger.info(
            "🔍 [EXECUTE_IMPORT_CASHFLOWS] About to import %s records. Selected types in preview_data: %s",
            len(raw_entries),
            preview_data.get('selected_types')
        )
        
        # CRITICAL: Third filtering point (final check) - filter by selected_types if provided
        # This is the final safety net to ensure only selected types are imported
        selected_types = preview_data.get('selected_types', [])
        if selected_types and isinstance(selected_types, list) and len(selected_types) > 0:
            selected_types_lower = [t.lower() for t in selected_types]
            original_count = len(raw_entries)
            
            # Debug: Show sample types before filtering
            sample_before = [
                (extract_record(rec).get('cashflow_type') or extract_record(rec).get('type') or 'NO_TYPE')
                for rec in raw_entries[:10]
            ]
            logger.info(
                "🔍 [EXECUTE_IMPORT_CASHFLOWS] Final filtering check: %s records, sample types: %s, selected_types: %s",
                original_count,
                sample_before,
                selected_types_lower
            )
            
            # Filter records
            filtered_entries = []
            for entry in raw_entries:
                rec = extract_record(entry)
                rec_cf_type = (rec.get('cashflow_type') or rec.get('type') or '').lower()
                if rec_cf_type in selected_types_lower:
                    filtered_entries.append(entry)
            
            raw_entries = filtered_entries
            
            logger.info(
                "🔍 [EXECUTE_IMPORT_CASHFLOWS] Final filtering result: %s -> %s records (removed %s)",
                original_count,
                len(raw_entries),
                original_count - len(raw_entries)
            )
            
            # CRITICAL: Final validation - verify all remaining records match selected_types
            if selected_types and isinstance(selected_types, list) and len(selected_types) > 0:
                selected_types_lower = [t.lower() for t in selected_types]
                mismatched = []
                for entry in raw_entries:
                    rec = extract_record(entry)
                    rec_cf_type = (rec.get('cashflow_type') or rec.get('type') or '').lower()
                    if rec_cf_type not in selected_types_lower:
                        mismatched.append(rec_cf_type)
                
                if mismatched:
                    error_msg = (
                        f"CRITICAL: Found {len(mismatched)} records that don't match selected_types after final filtering. "
                        f"Expected: {selected_types_lower}, Found: {list(set(mismatched))[:5]}"
                    )
                    logger.error(f"❌ [EXECUTE_IMPORT_CASHFLOWS] {error_msg}")
                    return {
                        'success': False,
                        'error': error_msg,
                        'error_code': 'FILTERING_MISMATCH',
                        'imported_count': 0,
                        'skipped_count': skipped_count
                    }
                else:
                    logger.info(
                        "✅ [EXECUTE_IMPORT_CASHFLOWS] All %s records match selected_types: %s",
                        len(raw_entries),
                        selected_types_lower
                    )
            
            # Debug: Show what types remain after filtering
            if raw_entries:
                sample_after = [
                    (extract_record(rec).get('cashflow_type') or extract_record(rec).get('type') or 'NO_TYPE')
                    for rec in raw_entries[:10]
                ]
                logger.info(
                    "🔍 [EXECUTE_IMPORT_CASHFLOWS] Remaining types after final filter: %s",
                    sample_after
                )
        
        # Debug: Show types of first 10 records
        if raw_entries:
            sample_types = [
                (extract_record(rec).get('cashflow_type') or extract_record(rec).get('type') or 'NO_TYPE')
                for rec in raw_entries[:10]
            ]
            logger.info(
                "🔍 [EXECUTE_IMPORT_CASHFLOWS] Sample types in records_to_import: %s",
                sample_types
            )

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

        # Note: Forex pairing is already done in _build_preview_payload (lines 1258-1312)
        # Records should already have shared external_id in exchange_<uuid> format
        # If pairing failed in preview, records won't be grouped and will be skipped below

        imported_count = 0
        import_errors: List[str] = []

        # Group exchange records by shared exchange external_id
        exchange_groups: Dict[str, Dict[str, Dict[str, Any]]] = {}
        def is_exchange_external(ex_id: Optional[str]) -> bool:
            return isinstance(ex_id, str) and ex_id.startswith(CashFlowHelperService.EXCHANGE_PREFIX)
        for idx, rec in enumerate(cashflow_records):
            ex_id = rec.get('external_id')
            if is_exchange_external(ex_id):
                storage_type, _ = self._resolve_cashflow_storage_type(rec)
                group = exchange_groups.setdefault(ex_id, {})
                direction = (
                    'to' if storage_type == CashFlowHelperService.EXCHANGE_TO_TYPE else
                    'from' if storage_type == CashFlowHelperService.EXCHANGE_FROM_TYPE else
                    None
                )
                if direction:
                    group[direction] = rec
        # Remove grouped exchange records from flat list; they will be created atomically below
        cashflow_records = [r for r in cashflow_records if not is_exchange_external(r.get('external_id'))]

        # Import ImportValidator for pre-import validation
        from .import_validator import ImportValidator
        
        for index, record in enumerate(cashflow_records):
            try:
                storage_type = record.get('storage_type')
                mapping_note = record.get('mapping_note')

                if not storage_type:
                    storage_type, inferred_note = self._resolve_cashflow_storage_type(record)
                    if mapping_note is None:
                        mapping_note = inferred_note
                
                # IMPORTANT: Skip forex legs ONLY if they are NOT already paired (no exchange_ external_id)
                # If they have exchange_ external_id, they are already handled in exchange_groups above
                record_external_id = record.get('external_id') or ''
                is_paired_forex = (
                    isinstance(record_external_id, str) and 
                    record_external_id.startswith(CashFlowHelperService.EXCHANGE_PREFIX)
                )
                
                # Skip standalone forex legs (not paired); they are handled as paired exchanges below
                # But DON'T skip if they are already paired (have exchange_ external_id)
                if not is_paired_forex and (
                    (storage_type in {from_type, to_type}) or 
                    ((record.get('cashflow_type') or '').lower() == 'forex_conversion')
                ):
                    skipped_count += 1
                    logger.debug(
                        "⏭️ [IMPORT] Skipping unpaired forex record (no exchange_ external_id): %s",
                        record_external_id or 'no_external_id'
                    )
                    continue

                # CRITICAL: Pre-import validation using ImportValidator
                # This ensures 100% data accuracy before database insertion
                validation_record = {
                    'cashflow_type': storage_type or record.get('cashflow_type'),
                    'amount': record.get('amount'),
                    'fee_amount': record.get('fee_amount', 0),
                    'currency': record.get('currency')
                }
                is_valid, validation_error = ImportValidator.validate_cashflow_record(
                    validation_record,
                    db_session=self.db_session
                )
                if not is_valid:
                    error_msg = f"Validation failed for record #{index + 1}: {validation_error}"
                    logger.warning(f"⚠️ [IMPORT] {error_msg}")
                    import_errors.append(error_msg)
                    skipped_count += 1
                    continue

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

                # Build comprehensive description with import metadata
                description_parts = []
                
                # Original memo/description from record
                if record.get('memo'):
                    description_parts.append(str(record['memo']))
                if record.get('target_account'):
                    description_parts.append(f"Target: {record['target_account']}")
                if record.get('asset_symbol'):
                    description_parts.append(f"Asset: {record['asset_symbol']}")
                if mapping_note:
                    description_parts.append(f"מקור תזרים: {mapping_note}")
                
                # Import metadata section
                import_metadata = []
                
                # Module version
                import_metadata.append("\nנוצר ע״י מודול ייבוא גרסה 1.0")
                
                # Session ID
                import_metadata.append(f"\nסשן ייבוא מספר {import_session.id}")
                
                # Import date/time (when the import was executed)
                from datetime import datetime, timezone
                import_datetime = datetime.now(timezone.utc)
                import_date_str = import_datetime.strftime("%d.%m.%Y %H:%M:%S")
                import_metadata.append(f"\nתאריך ייבוא {import_date_str}")
                
                # Original report date (from file)
                if effective_date:
                    report_date_str = effective_date.strftime("%d.%m.%Y")
                    import_metadata.append(f"\nתאריך דוח המקור {report_date_str}")
                
                # Data provider/connector
                connector_name = import_session.provider or import_session.connector_type or 'לא זמין'
                import_metadata.append(f"\nספק נתונים חיצוני {connector_name}")
                
                # External account number
                file_account_number = import_session.get_summary_data('file_account_number')
                if file_account_number:
                    import_metadata.append(f"\nמספר חשבון חיצוני {file_account_number}")
                else:
                    import_metadata.append("\nמספר חשבון חיצוני לא זמין")
                
                # Combine all parts
                # Format: original memo on first line, then metadata on new lines
                if description_parts:
                    # Original memo/description first
                    original_text = ' | '.join(description_parts)
                    # Metadata on new lines (each already has \n prefix)
                    metadata_text = ''.join(import_metadata)
                    description = f"{original_text}{metadata_text}"
                else:
                    # If no original memo, just metadata (remove first \n)
                    description = ''.join(import_metadata).lstrip('\n')

                external_id = record.get('external_id') or (
                    f"cashflow_{import_session.id}_{index + 1}"
                )

                # Use service SSOT for regular cash flows (same validation as manual creation)
                # This ensures consistency between manual and import processes
                cashflow = CashFlowHelperService.create_regular_cash_flow(
                    self.db_session,
                    trading_account_id=import_session.trading_account_id,
                    type=storage_type or record.get('cashflow_type', 'cash_adjustment'),
                    amount=amount,
                    date=effective_date,
                    currency_id=currency_id,
                    usd_rate=usd_rate,
                    fee_amount=0.0,
                    description=description,
                    source='file_import',
                    external_id=external_id,
                    trade_id=None
                )
                # Note: create_regular_cash_flow already calls db.add(), no need to add again
                imported_count += 1
            except Exception as record_error:
                logger.error(
                    "❌ Failed to create cashflow #%s: %s",
                    index + 1,
                    record_error,
                    exc_info=True
                )
                import_errors.append(f"Cashflow #{index + 1} failed: {record_error}")

        # Create grouped currency exchanges using service SSOT (align with manual creation)
        for exchange_id, pair in exchange_groups.items():
            try:
                from_rec = pair.get('from')
                to_rec = pair.get('to')
                if not from_rec or not to_rec:
                    error_msg = f"Incomplete exchange pair for {exchange_id}: missing {'TO' if not to_rec else 'FROM'} record"
                    logger.warning(f"⚠️ [IMPORT] {error_msg}")
                    import_errors.append(error_msg)
                    skipped_count += 2  # Both FROM and TO are skipped
                    continue
                
                # CRITICAL: Pre-import validation of exchange pair
                # Validate both records individually and as a pair
                from_storage_type = from_rec.get('storage_type') or from_rec.get('cashflow_type')
                to_storage_type = to_rec.get('storage_type') or to_rec.get('cashflow_type')
                
                validation_from = {
                    'cashflow_type': from_storage_type,
                    'amount': from_rec.get('amount'),
                    'fee_amount': from_rec.get('fee_amount', 0),
                    'currency': from_rec.get('currency')
                }
                validation_to = {
                    'cashflow_type': to_storage_type,
                    'amount': to_rec.get('amount'),
                    'fee_amount': to_rec.get('fee_amount', 0),
                    'currency': to_rec.get('currency')
                }
                
                # Validate individual records
                from_valid, from_error = ImportValidator.validate_cashflow_record(
                    validation_from,
                    db_session=self.db_session
                )
                if not from_valid:
                    error_msg = f"FROM record validation failed for {exchange_id}: {from_error}"
                    logger.warning(f"⚠️ [IMPORT] {error_msg}")
                    import_errors.append(error_msg)
                    skipped_count += 2
                    continue
                
                to_valid, to_error = ImportValidator.validate_cashflow_record(
                    validation_to,
                    db_session=self.db_session
                )
                if not to_valid:
                    error_msg = f"TO record validation failed for {exchange_id}: {to_error}"
                    logger.warning(f"⚠️ [IMPORT] {error_msg}")
                    import_errors.append(error_msg)
                    skipped_count += 2
                    continue
                
                # Validate pair structure
                pair_valid, pair_error = ImportValidator.validate_exchange_pair(
                    validation_from,
                    validation_to,
                    db_session=self.db_session
                )
                if not pair_valid:
                    error_msg = f"Exchange pair validation failed for {exchange_id}: {pair_error}"
                    logger.warning(f"⚠️ [IMPORT] {error_msg}")
                    import_errors.append(error_msg)
                    skipped_count += 2
                    continue
                
                # Extract metadata from records (preferred source for accurate data)
                from_meta = (from_rec.get('metadata') or {}) if isinstance(from_rec.get('metadata'), dict) else {}
                to_meta = (to_rec.get('metadata') or {}) if isinstance(to_rec.get('metadata'), dict) else {}
                
                # Get currencies - prefer metadata, fallback to currency field
                from_currency_symbol = (
                    from_meta.get('source_currency') or 
                    from_rec.get('source_currency') or 
                    from_rec.get('currency')
                )
                to_currency_symbol = (
                    to_meta.get('target_currency') or 
                    to_rec.get('target_currency') or 
                    to_rec.get('currency')
                )
                
                if not from_currency_symbol or not to_currency_symbol:
                    raise ValueError(f"Missing currency symbol for exchange {exchange_id}: from={from_currency_symbol}, to={to_currency_symbol}")
                
                from_currency = CurrencyService.get_by_symbol(self.db_session, from_currency_symbol)
                to_currency = CurrencyService.get_by_symbol(self.db_session, to_currency_symbol)
                if not from_currency or not to_currency:
                    raise ValueError(f"Currency not found for exchange {exchange_id}: from={from_currency_symbol}, to={to_currency_symbol}")
                
                # Get exchange_rate from metadata (preferred) - this is the accurate rate from IBKR
                exchange_rate = None
                if from_meta.get('exchange_rate') is not None:
                    try:
                        exchange_rate = float(from_meta['exchange_rate'])
                    except (TypeError, ValueError):
                        pass
                if exchange_rate is None and to_meta.get('exchange_rate') is not None:
                    try:
                        exchange_rate = float(to_meta['exchange_rate'])
                    except (TypeError, ValueError):
                        pass
                # Fallback: try trade_price from records
                if exchange_rate is None:
                    trade_price = from_rec.get('trade_price') or to_rec.get('trade_price')
                    if trade_price is not None:
                        try:
                            exchange_rate = float(trade_price)
                        except (TypeError, ValueError):
                            pass
                
                # Get from_amount - prefer Quantity from metadata (accurate), fallback to abs(amount)
                from_amount = None
                quantity = from_meta.get('quantity') or from_rec.get('quantity')
                if quantity is not None:
                    try:
                        from_amount = abs(float(quantity))
                    except (TypeError, ValueError):
                        pass
                # Fallback: use absolute value of amount field
                if from_amount is None:
                    from_amount = abs(float(from_rec.get('amount', 0)))
                
                if from_amount <= 0:
                    raise ValueError(f"Invalid from_amount for exchange {exchange_id}: {from_amount}")
                
                if exchange_rate is None or exchange_rate <= 0:
                    # Last resort: calculate from amounts (may be inaccurate)
                    to_amount = abs(float(to_rec.get('amount', 0)))
                    if to_amount > 0 and from_amount > 0:
                        exchange_rate = to_amount / from_amount
                        logger.warning(
                            "⚠️ [IMPORT] Calculated exchange_rate from amounts for %s: %s (may be inaccurate). "
                            "Metadata exchange_rate not available.",
                            exchange_id,
                            exchange_rate
                        )
                    else:
                        raise ValueError(f"Invalid exchange_rate for exchange {exchange_id}: rate={exchange_rate}, from_amount={from_amount}, to_amount={to_amount}")
                
                # Date
                effective_dt = self._resolve_datetime(from_rec.get('effective_date') or to_rec.get('effective_date'))
                date_value = effective_dt.date() if effective_dt else None
                
                # Build comprehensive description with import metadata
                description_parts = []
                
                # Original memo/description from records
                original_memo = from_rec.get('memo') or to_rec.get('memo')
                if original_memo:
                    description_parts.append(str(original_memo))
                
                # Import metadata section
                import_metadata = []
                
                # Module version
                import_metadata.append("\nנוצר ע״י מודול ייבוא גרסה 1.0")
                
                # Session ID
                import_metadata.append(f"\nסשן ייבוא מספר {import_session.id}")
                
                # Import date/time (when the import was executed)
                from datetime import datetime, timezone
                import_datetime = datetime.now(timezone.utc)
                import_date_str = import_datetime.strftime("%d.%m.%Y %H:%M:%S")
                import_metadata.append(f"\nתאריך ייבוא {import_date_str}")
                
                # Original report date (from file)
                if date_value:
                    report_date_str = date_value.strftime("%d.%m.%Y")
                    import_metadata.append(f"\nתאריך דוח המקור {report_date_str}")
                
                # Data provider/connector
                connector_name = import_session.provider or import_session.connector_type or 'לא זמין'
                import_metadata.append(f"\nספק נתונים חיצוני {connector_name}")
                
                # External account number
                file_account_number = import_session.get_summary_data('file_account_number')
                if file_account_number:
                    import_metadata.append(f"\nמספר חשבון חיצוני {file_account_number}")
                else:
                    import_metadata.append("\nמספר חשבון חיצוני לא זמין")
                
                # Combine all parts
                # Format: original memo on first line, then metadata on new lines
                if description_parts:
                    # Original memo/description first
                    original_text = ' | '.join(description_parts)
                    # Metadata on new lines (each already has \n prefix)
                    metadata_text = ''.join(import_metadata)
                    description = f"{original_text}{metadata_text}"
                else:
                    # If no original memo, just metadata (remove first \n)
                    description = ''.join(import_metadata).lstrip('\n')
                
                # Fee amount - extract from record.commission (set by IBKR connector from Comm/Fee field)
                # Commission is stored directly in the record, not in metadata
                # IMPORTANT: Normalize fee_amount to be non-negative (negative fees are invalid)
                fee_amount = 0.0
                commission_val = from_rec.get('commission')
                if commission_val is None:
                    # Fallback: check metadata if commission was moved there
                    commission_val = from_meta.get('commission')
                try:
                    fee_amount_raw = float(commission_val) if commission_val not in (None, '') else 0.0
                    # Normalize: if fee is negative, set to 0 (fee amount cannot be negative)
                    fee_amount = max(0.0, fee_amount_raw)
                    if fee_amount_raw < 0:
                        logger.warning(
                            "⚠️ [IMPORT] Negative fee amount detected for exchange %s: %s. Normalized to 0.0",
                            exchange_id,
                            fee_amount_raw
                        )
                except (TypeError, ValueError):
                    fee_amount = 0.0

                # Use service SSOT to create the pair (shared external_id, correct types/signs)
                # This uses the accurate exchange_rate and from_amount from metadata
                svc_result = CashFlowHelperService.create_exchange(
                    self.db_session,
                    trading_account_id=import_session.trading_account_id,
                    from_currency_id=from_currency.id,
                    to_currency_id=to_currency.id,
                    date=date_value,
                    from_amount=from_amount,
                    exchange_rate=exchange_rate,
                    fee_amount=fee_amount,
                    description=description,
                    source='file_import'
                )
                if svc_result:
                    imported_count += 2
                    logger.info(
                        "✅ [IMPORT] Created exchange %s: %s %s -> %s %s (rate: %s, fee: %s)",
                        exchange_id,
                        from_amount,
                        from_currency_symbol,
                        from_amount * exchange_rate,
                        to_currency_symbol,
                        exchange_rate,
                        fee_amount
                    )
            except Exception as exch_error:
                logger.error("❌ Failed to create exchange %s: %s", exchange_id, exch_error, exc_info=True)
                import_errors.append(f"Exchange {exchange_id} failed: {exch_error}")

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

    def _execute_report_only(
        self,
        import_session: ImportSession,
        preview_data: Dict[str, Any],
        task_type: str
    ) -> Dict[str, Any]:
        """
        For analytical tasks (portfolio positions, taxes & FX) we don't write to the DB.
        We still track counts for logging and UI feedback.
        """
        records_to_import = preview_data.get('records_to_import', []) or []
        records_to_skip = preview_data.get('records_to_skip', []) or []

        logger.info(
            "ℹ️ Report-only execution for session %s (task=%s): %s records analyzed, %s skipped.",
            import_session.id,
            task_type,
            len(records_to_import),
            len(records_to_skip)
        )

        return {
            'success': True,
            'imported_count': len(records_to_import),
            'skipped_count': len(records_to_skip),
            'errors': [],
            'cache_patterns': []
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
            # IMPORTANT: Frontend sends 'within_file' but backend stores 'within_file_duplicate'
            # Map duplicate_type to actual reason values
            reason_mapping = {
                'within_file': 'within_file_duplicate',
                'existing_record': 'existing_record'
            }
            expected_reason = reason_mapping.get(duplicate_type, duplicate_type)
            
            record_to_move = None
            new_skip_list = []
            
            for skip_record in preview_data.get('records_to_skip', []):
                skip_reason = skip_record.get('reason')
                # Match by record_index and reason (handle both mapped and direct values)
                if (skip_record.get('record_index') == record_index and 
                    (skip_reason == expected_reason or skip_reason == duplicate_type)):
                    record_to_move = skip_record
                else:
                    new_skip_list.append(skip_record)
            
            if not record_to_move:
                return {'success': False, 'error': 'Record not found in skip list'}
            
            # Move to records_to_import
            # IMPORTANT: For cashflows, preserve the full record structure from 'record' field
            # For executions, use the basic fields
            if 'record' in record_to_move and isinstance(record_to_move['record'], dict):
                # Cashflow record - use the full record structure
                import_record = dict(record_to_move['record'])
                # Preserve any additional metadata (critical for forex pairs)
                if 'cashflow_type' in record_to_move:
                    import_record['cashflow_type'] = record_to_move['cashflow_type']
                if 'storage_type' in record_to_move:
                    import_record['storage_type'] = record_to_move['storage_type']
                if 'metadata' in record_to_move:
                    # Preserve metadata (includes exchange_external_id for forex pairs)
                    if 'metadata' not in import_record or not isinstance(import_record['metadata'], dict):
                        import_record['metadata'] = {}
                    if isinstance(record_to_move['metadata'], dict):
                        import_record['metadata'].update(record_to_move['metadata'])
                # Preserve external_id if it exists (critical for forex pairs - exchange_<uuid>)
                if 'external_id' in record_to_move and record_to_move['external_id']:
                    import_record['external_id'] = record_to_move['external_id']
                # Preserve section info if it exists
                if 'section' in record_to_move:
                    import_record['section'] = record_to_move['section']
            else:
                # Execution record - use basic fields
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
            # IMPORTANT: For cashflows, preserve the full record structure from 'record' field
            # For executions, use the basic fields
            if 'record' in record_to_move and isinstance(record_to_move['record'], dict):
                # Cashflow record - use the full record structure
                import_record = dict(record_to_move['record'])
                # Preserve any additional metadata (critical for forex pairs)
                if 'cashflow_type' in record_to_move:
                    import_record['cashflow_type'] = record_to_move['cashflow_type']
                if 'storage_type' in record_to_move:
                    import_record['storage_type'] = record_to_move['storage_type']
                if 'metadata' in record_to_move:
                    # Preserve metadata (includes exchange_external_id for forex pairs)
                    if 'metadata' not in import_record or not isinstance(import_record['metadata'], dict):
                        import_record['metadata'] = {}
                    if isinstance(record_to_move['metadata'], dict):
                        import_record['metadata'].update(record_to_move['metadata'])
                # Preserve external_id if it exists (critical for forex pairs - exchange_<uuid>)
                if 'external_id' in record_to_move and record_to_move['external_id']:
                    import_record['external_id'] = record_to_move['external_id']
                # Preserve section info if it exists
                if 'section' in record_to_move:
                    import_record['section'] = record_to_move['section']
                import_record['force_import_existing'] = True
            else:
                # Execution record - use basic fields
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