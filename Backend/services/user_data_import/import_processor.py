"""
Import Processor - Handles data processing with caching

This service manages the core data processing pipeline with intelligent
caching to avoid reprocessing the same data multiple times.

Author: TikTrack Development Team
Version: 1.0
Last Updated: 2025-01-27
"""

from typing import Dict, Any, Optional, List
from datetime import datetime
import logging
from sqlalchemy.orm import Session

from .normalization_service import NormalizationService
from .validation_service import ValidationService
from .duplicate_detection_service import DuplicateDetectionService

logger = logging.getLogger(__name__)

class ImportProcessor:
    """
    Handles data processing with intelligent caching.
    
    This service manages:
    - File parsing and normalization
    - Data validation and duplicate detection
    - Result caching for performance
    - Step-by-step processing pipeline
    """
    
    def __init__(self, db_session: Session, cache_service):
        """
        Initialize the import processor.
        
        Args:
            db_session: Database session for operations
            cache_service: Cache service instance (advanced_cache_service)
        """
        self.db_session = db_session
        self.cache_service = cache_service
        self.normalization_service = NormalizationService()
        self.validation_service = ValidationService(db_session)
        self.duplicate_service = DuplicateDetectionService(db_session)
    
    def get_cache_key(self, session_id: int, step: str) -> str:
        """
        Generate cache key for a processing step.
        
        Args:
            session_id: Import session ID
            step: Processing step name
            
        Returns:
            Cache key string
        """
        return f"import_session_{session_id}_{step}"
    
    def get_cached_results(self, session_id: int, step: str) -> Optional[Dict[str, Any]]:
        """
        Get cached results for a processing step.
        
        Args:
            session_id: Import session ID
            step: Processing step name
            
        Returns:
            Cached results or None if not found
        """
        try:
            cache_key = self.get_cache_key(session_id, step)
            results = self.cache_service.get(cache_key)
            
            if results:
                logger.debug(f"✅ Retrieved cached results for session {session_id}, step: {step}")
                return results
            else:
                logger.debug(f"📋 No cached results for session {session_id}, step: {step}")
                return None
                
        except Exception as e:
            logger.error(f"❌ Failed to get cached results: {str(e)}")
            return None
    
    def cache_results(self, session_id: int, step: str, data: Dict[str, Any], 
                     ttl: int = 3600) -> bool:
        """
        Cache results for a processing step.
        
        Args:
            session_id: Import session ID
            step: Processing step name
            data: Data to cache
            ttl: Time to live in seconds (default: 1 hour)
            
        Returns:
            True if cached successfully, False otherwise
        """
        try:
            cache_key = self.get_cache_key(session_id, step)
            success = self.cache_service.set(cache_key, data, ttl)
            
            if success:
                logger.debug(f"✅ Cached results for session {session_id}, step: {step}")
            else:
                logger.warning(f"⚠️ Failed to cache results for session {session_id}, step: {step}")
            
            return success
            
        except Exception as e:
            logger.error(f"❌ Failed to cache results: {str(e)}")
            return False
    
    def process_file(self, session_id: int, file_content: str, 
                    connector, trading_account_id: int) -> Dict[str, Any]:
        """
        Process file through the complete pipeline.
        
        Args:
            session_id: Import session ID
            file_content: File content as string
            connector: Connector instance
            trading_account_id: Trading account ID
            
        Returns:
            Dict with processing results
        """
        try:
            logger.info(f"🔄 Starting file processing for session {session_id}")
            
            # Step 1: Parse file
            parse_results = self._process_step(
                session_id, 'parse', 
                lambda: self._parse_file(file_content, connector)
            )
            
            if not parse_results['success']:
                return parse_results
            
            raw_records = parse_results['data']['raw_records']
            
            # Step 2: Normalize records
            normalize_results = self._process_step(
                session_id, 'normalize',
                lambda: self._normalize_records(raw_records, connector)
            )
            
            if not normalize_results['success']:
                return normalize_results
            
            normalized_records = normalize_results['data']['normalized_records']
            
            # Step 3: Validate records
            validation_results = self._process_step(
                session_id, 'validate',
                lambda: self._validate_records(normalized_records)
            )
            
            if not validation_results['success']:
                return validation_results
            
            valid_records = validation_results['data']['valid_records']
            missing_tickers = validation_results['data']['missing_tickers']
            
            # Step 4: Detect duplicates
            duplicate_results = self._process_step(
                session_id, 'duplicates',
                lambda: self._detect_duplicates(valid_records, trading_account_id)
            )
            
            if not duplicate_results['success']:
                return duplicate_results
            
            # Combine all results
            final_results = {
                'success': True,
                'session_id': session_id,
                'total_records': len(raw_records),
                'parsed_records': len(raw_records),
                'normalized_records': len(normalized_records),
                'valid_records': len(valid_records),
                'invalid_records': len(normalized_records) - len(valid_records),
                'clean_records': len(duplicate_results['data']['clean_records']),
                'duplicate_records': len(duplicate_results['data']['within_file_duplicates']) + 
                                   len(duplicate_results['data']['existing_records']),
                'missing_tickers': missing_tickers,
                'existing_records': len(duplicate_results['data']['existing_records']),
                'processing_timestamp': datetime.now().isoformat(),
                'steps': {
                    'parse': parse_results['data'],
                    'normalize': normalize_results['data'],
                    'validate': validation_results['data'],
                    'duplicates': duplicate_results['data']
                }
            }
            
            # Cache final results
            self.cache_results(session_id, 'final', final_results, ttl=7200)  # 2 hours
            
            logger.info(f"✅ File processing completed for session {session_id}")
            return final_results
            
        except Exception as e:
            logger.error(f"❌ File processing failed for session {session_id}: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'session_id': session_id
            }
    
    def _process_step(self, session_id: int, step: str, processor_func) -> Dict[str, Any]:
        """
        Process a single step with caching.
        
        Args:
            session_id: Import session ID
            step: Step name
            processor_func: Function to execute for processing
            
        Returns:
            Dict with step results
        """
        try:
            # Check cache first
            cached_results = self.get_cached_results(session_id, step)
            if cached_results:
                return {
                    'success': True,
                    'cached': True,
                    'data': cached_results
                }
            
            # Process step
            logger.debug(f"🔄 Processing step: {step} for session {session_id}")
            step_data = processor_func()
            
            # Cache results
            self.cache_results(session_id, step, step_data)
            
            return {
                'success': True,
                'cached': False,
                'data': step_data
            }
            
        except Exception as e:
            logger.error(f"❌ Step {step} failed for session {session_id}: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'step': step
            }
    
    def _parse_file(self, file_content: str, connector) -> Dict[str, Any]:
        """Parse file using connector"""
        try:
            raw_records = connector.parse_file(file_content)
            return {
                'raw_records': raw_records,
                'record_count': len(raw_records),
                'connector_type': connector.get_provider_name()
            }
        except Exception as e:
            raise Exception(f"File parsing failed: {str(e)}")
    
    def _normalize_records(self, raw_records: List[Dict[str, Any]], connector) -> Dict[str, Any]:
        """Normalize records using connector"""
        try:
            result = self.normalization_service.normalize_records(raw_records, connector)
            return {
                'normalized_records': result['normalized_records'],
                'normalization_errors': result['errors'],
                'successful_count': result['successful'],
                'failed_count': result['failed']
            }
        except Exception as e:
            raise Exception(f"Record normalization failed: {str(e)}")
    
    def _validate_records(self, normalized_records: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Validate normalized records"""
        try:
            result = self.validation_service.validate_records(normalized_records)
            return {
                'valid_records': result['valid_records'],
                'invalid_records': result['invalid_records'],
                'validation_errors': result['validation_errors'],
                'missing_tickers': result['missing_tickers'],
                'valid_count': result['valid_count'],
                'invalid_count': result['invalid_count']
            }
        except Exception as e:
            raise Exception(f"Record validation failed: {str(e)}")
    
    def _detect_duplicates(self, valid_records: List[Dict[str, Any]], trading_account_id: int) -> Dict[str, Any]:
        """Detect duplicates in valid records"""
        try:
            result = self.duplicate_service.detect_duplicates(valid_records, trading_account_id)
            return {
                'clean_records': result['clean_records'],
                'within_file_duplicates': result['within_file_duplicates'],
                'existing_records': result['existing_records'],
                'clean_count': result['clean_count'],
                'duplicate_count': result['duplicate_count']
            }
        except Exception as e:
            raise Exception(f"Duplicate detection failed: {str(e)}")
    
    def generate_preview_data(self, session_id: int) -> Dict[str, Any]:
        """
        Generate preview data from cached processing results.
        
        Args:
            session_id: Import session ID
            
        Returns:
            Dict with preview data
        """
        try:
            # Get cached final results
            final_results = self.get_cached_results(session_id, 'final')
            if not final_results:
                return {
                    'success': False,
                    'error': 'No cached processing results found. Please run analysis first.'
                }
            
            # Extract data from final results
            clean_records = final_results['steps']['duplicates']['clean_records']
            within_file_duplicates = final_results['steps']['duplicates']['within_file_duplicates']
            existing_records = final_results['steps']['duplicates']['existing_records']
            validation_errors = final_results['steps']['validate']['validation_errors']
            missing_tickers = final_results['steps']['validate']['missing_tickers']
            
            # Prepare records to import (clean records only, excluding missing tickers)
            records_to_import = []
            for record_info in clean_records:
                record = record_info['record']
                if record.get('symbol') not in missing_tickers:
                    records_to_import.append({
                        'symbol': record.get('symbol'),
                        'action': record.get('action'),
                        'quantity': record.get('quantity'),
                        'price': record.get('price'),
                        'fee': record.get('fee'),
                        'date': record.get('date'),
                        'external_id': record.get('external_id')
                    })
            
            # Prepare records to skip
            records_to_skip = []
            
            # Add invalid records
            for error_info in validation_errors:
                records_to_skip.append({
                    'symbol': error_info['record'].get('symbol'),
                    'action': error_info['record'].get('action'),
                    'quantity': error_info['record'].get('quantity'),
                    'price': error_info['record'].get('price'),
                    'fee': error_info['record'].get('fee'),
                    'date': error_info['record'].get('date'),
                    'reason': 'validation_error',
                    'details': error_info['errors']
                })
            
            # Add records with missing tickers
            valid_records = final_results['steps']['validate']['valid_records']
            for record in valid_records:
                if record.get('symbol') in missing_tickers:
                    records_to_skip.append({
                        'symbol': record.get('symbol'),
                        'action': record.get('action'),
                        'quantity': record.get('quantity'),
                        'price': record.get('price'),
                        'fee': record.get('fee'),
                        'date': record.get('date'),
                        'reason': 'missing_ticker',
                        'missing_ticker': record.get('symbol')
                    })
            
            # Add duplicate records
            for duplicate in within_file_duplicates:
                records_to_skip.append({
                    'symbol': duplicate['record'].get('symbol'),
                    'action': duplicate['record'].get('action'),
                    'quantity': duplicate['record'].get('quantity'),
                    'price': duplicate['record'].get('price'),
                    'fee': duplicate['record'].get('fee'),
                    'date': duplicate['record'].get('date'),
                    'reason': 'within_file_duplicate',
                    'confidence_score': duplicate.get('confidence_score', 0),
                    'match_count': len(duplicate.get('within_file_matches', [])),
                    'details': duplicate
                })
            
            # Add existing records
            for existing in existing_records:
                records_to_skip.append({
                    'record_index': existing['record_index'],
                    'symbol': existing['record'].get('symbol'),
                    'action': existing['record'].get('action'),
                    'quantity': existing['record'].get('quantity'),
                    'price': existing['record'].get('price'),
                    'fee': existing['record'].get('fee'),
                    'date': existing['record'].get('date'),
                    'reason': 'existing_record',
                    'matches': existing.get('system_matches', [])
                })
            
            # Generate preview data
            preview_data = {
                'records_to_import': records_to_import,
                'records_to_skip': records_to_skip,
                'summary': {
                    'total_records': final_results['total_records'],
                    'records_to_import': len(records_to_import),
                    'records_to_skip': len(records_to_skip),
                    'import_rate': (len(records_to_import) / final_results['total_records'] * 100) if final_results['total_records'] > 0 else 0,
                    'missing_tickers': missing_tickers,
                    'duplicate_records': len(within_file_duplicates),
                    'existing_records': len(existing_records)
                }
            }
            
            # Cache preview data
            self.cache_results(session_id, 'preview', preview_data, ttl=3600)
            
            logger.info(f"✅ Generated preview data for session {session_id}")
            return {
                'success': True,
                'preview_data': preview_data
            }
            
        except Exception as e:
            logger.error(f"❌ Failed to generate preview data for session {session_id}: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def clear_session_cache(self, session_id: int) -> bool:
        """
        Clear all cached data for a session.
        
        Args:
            session_id: Import session ID
            
        Returns:
            True if cleared successfully, False otherwise
        """
        try:
            steps = ['parse', 'normalize', 'validate', 'duplicates', 'final', 'preview']
            cleared_count = 0
            
            for step in steps:
                cache_key = self.get_cache_key(session_id, step)
                if self.cache_service.delete(cache_key):
                    cleared_count += 1
            
            logger.info(f"✅ Cleared {cleared_count} cache entries for session {session_id}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to clear cache for session {session_id}: {str(e)}")
            return False

