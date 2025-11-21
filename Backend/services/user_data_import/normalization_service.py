"""
Normalization Service - Converts raw data to standard format

This service handles the normalization of raw data from various connectors
into a standardized format that can be processed by the rest of the system.
It ensures data consistency and provides a unified interface.

Author: TikTrack Development Team
Version: 1.0
Last Updated: 2025-01-16
"""

from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
import logging
import re

logger = logging.getLogger(__name__)

from services.date_normalization_service import DateNormalizationService

class NormalizationService:
    """
    Service for normalizing raw data records to standard format.
    
    This service ensures that data from different sources is converted
    to a consistent format that can be processed by validation and
    duplicate detection services.
    """
    
    def __init__(self):
        """Initialize the normalization service"""
        self.standard_fields = [
            'symbol', 'action', 'date', 'quantity', 'price', 'fee',
            'external_id', 'source', 'currency'
        ]
        self.date_normalizer = DateNormalizationService()
        self.utc_normalizer = DateNormalizationService("UTC")
    
    def normalize_records(
        self,
        raw_records: List[Dict[str, Any]],
        connector,
        task_type: str = 'executions'
    ) -> Dict[str, Any]:
        """
        Normalize a list of raw records using the specified connector.
        
        Args:
            raw_records: List of raw data records
            connector: Connector instance with normalization methods
            task_type: Type of import task (executions | cashflows | account_reconciliation)
            
        Returns:
            List[Dict[str, Any]]: List of normalized records
        """
        normalized_records = []
        errors = []
        
        for i, raw_record in enumerate(raw_records):
            try:
                if task_type == 'cashflows':
                    normalized = self._normalize_cashflow_record(raw_record, connector)
                    validation_errors = self._validate_cashflow_record(normalized)
                elif task_type == 'account_reconciliation':
                    normalized = self._normalize_account_record(raw_record, connector)
                    validation_errors = self._validate_account_record(normalized)
                elif task_type == 'portfolio_positions':
                    normalized = self._normalize_portfolio_record(raw_record, connector)
                    validation_errors = self._validate_portfolio_record(normalized)
                elif task_type == 'taxes_and_fx':
                    normalized = self._normalize_tax_fx_record(raw_record, connector)
                    validation_errors = self._validate_tax_fx_record(normalized)
                else:
                    normalized = connector.normalize_record(raw_record)
                    normalized['external_id'] = connector.generate_external_id(normalized)
                    normalized['source'] = connector.get_source_value()
                    normalized['task_type'] = 'executions'
                    validation_errors = connector.validate_record(normalized)

                # Validate the normalized record
                if validation_errors:
                    errors.append({
                        'record_index': i,
                        'record': normalized,
                        'errors': validation_errors
                    })
                else:
                    normalized_records.append(normalized)
                    
            except Exception as e:
                errors.append({
                    'record_index': i,
                    'record': raw_record,
                    'errors': [f"Normalization error: {str(e)}"]
                })
                logger.error(f"Failed to normalize record {i}: {str(e)}")
        
        return {
            'normalized_records': normalized_records,
            'errors': errors,
            'total_processed': len(raw_records),
            'successful': len(normalized_records),
            'failed': len(errors)
        }

    # ------------------------------------------------------------------
    # Task-specific normalization helpers
    # ------------------------------------------------------------------

    def _normalize_cashflow_record(self, raw_record: Dict[str, Any], connector) -> Dict[str, Any]:
        if raw_record is None:
            raise ValueError("Cashflow record is empty")

        amount = raw_record.get('amount')
        if amount is None:
            raise ValueError("Cashflow amount is missing")

        try:
            amount = float(amount)
        except (ValueError, TypeError):
            raise ValueError(f"Invalid cashflow amount: {amount}")

        effective_date = raw_record.get('effective_date')
        effective_envelope = self._normalize_date_envelope(effective_date)

        normalized = {
            'task_type': 'cashflows',
            'cashflow_type': str(raw_record.get('cashflow_type') or 'cash_adjustment').lower(),
            'amount': amount,
            'currency': str(raw_record.get('currency') or '').upper(),
            'effective_date': effective_envelope,
            'source_account': raw_record.get('source_account') or '',
            'target_account': raw_record.get('target_account') or '',
            'asset_symbol': raw_record.get('asset_symbol') or '',
            'memo': raw_record.get('memo') or '',
            'tax_country': raw_record.get('tax_country') or '',
            'section': raw_record.get('section') or '',
            'source': connector.get_source_value(),
            'raw_row': raw_record.get('_raw_row') or raw_record
        }

        metadata = self._extract_cashflow_metadata(raw_record)
        if metadata is None:
            metadata = {}

        if 'original_cashflow_type' not in metadata and normalized.get('cashflow_type'):
            metadata['original_cashflow_type'] = normalized['cashflow_type']

        if metadata:
            normalized['metadata'] = metadata

        normalized['external_id'] = self._generate_cashflow_external_id(normalized)
        return normalized

    def _normalize_account_record(self, raw_record: Dict[str, Any], connector) -> Dict[str, Any]:
        if raw_record is None:
            raise ValueError("Account reconciliation record is empty")

        account_id = raw_record.get('account_id') or ''
        base_currency = raw_record.get('base_currency') or ''
        as_of = raw_record.get('as_of') or datetime.utcnow()
        as_of_envelope = self._normalize_date_envelope(as_of)

        normalized = {
            'task_type': 'account_reconciliation',
            'account_id': account_id,
            'base_currency': base_currency.upper() if base_currency else '',
            'margin_status': raw_record.get('margin_status') or '',
            'entitlements': list(raw_record.get('entitlements', [])),
            'missing_documents': list(raw_record.get('missing_documents', [])),
            'account_aliases': list(raw_record.get('account_aliases', [])),
            'summary_values': raw_record.get('summary_values', {}),
            'raw_sections': raw_record.get('raw_sections', {}),
            'source': connector.get_source_value(),
            'as_of': as_of_envelope
        }

        normalized['external_id'] = self._generate_account_external_id(normalized)
        return normalized

    def _normalize_portfolio_record(self, raw_record: Dict[str, Any], connector) -> Dict[str, Any]:
        if raw_record is None:
            raise ValueError("Portfolio record is empty")

        statement_end = raw_record.get('statement_period_end')
        statement_envelope = self._normalize_date_envelope(statement_end)

        normalized = {
            'task_type': 'portfolio_positions',
            'record_type': raw_record.get('record_type') or 'open_position',
            'account_id': raw_record.get('account_id') or '',
            'symbol': raw_record.get('symbol') or '',
            'description': raw_record.get('description') or '',
            'asset_category': raw_record.get('asset_category') or '',
            'currency': str(raw_record.get('currency') or '').upper(),
            'quantity': self._coerce_float_value(raw_record.get('quantity')),
            'multiplier': self._coerce_float_value(raw_record.get('multiplier')),
            'cost_price': self._coerce_float_value(raw_record.get('cost_price')),
            'cost_basis': self._coerce_float_value(raw_record.get('cost_basis')),
            'close_price': self._coerce_float_value(raw_record.get('close_price')),
            'market_value': self._coerce_float_value(raw_record.get('market_value')),
            'unrealized_pl': self._coerce_float_value(raw_record.get('unrealized_pl')),
            'code': raw_record.get('code') or '',
            'statement_period': raw_record.get('statement_period'),
            'statement_period_end': statement_envelope,
            'source': connector.get_source_value(),
            'raw_row': raw_record.get('_raw_row') or raw_record
        }

        normalized['external_id'] = self._generate_portfolio_external_id(normalized)
        return normalized

    def _normalize_tax_fx_record(self, raw_record: Dict[str, Any], connector) -> Dict[str, Any]:
        if raw_record is None:
            raise ValueError("Tax/FX record is empty")

        effective_envelope = self._normalize_date_envelope(raw_record.get('effective_date'))
        statement_envelope = self._normalize_date_envelope(raw_record.get('statement_period_end'))

        normalized = {
            'task_type': 'taxes_and_fx',
            'record_type': raw_record.get('record_type') or 'tax_cashflow',
            'currency': str(raw_record.get('currency') or '').upper(),
            'amount': self._coerce_float_value(raw_record.get('amount')),
            'effective_date': effective_envelope,
            'description': raw_record.get('description') or '',
            'component': raw_record.get('component') or '',
            'tax_code': raw_record.get('tax_code') or '',
            'symbol': raw_record.get('symbol') or '',
            'statement_period': raw_record.get('statement_period'),
            'statement_period_end': statement_envelope,
            'source_account': raw_record.get('source_account') or '',
            'source_currency': str(raw_record.get('source_currency') or '').upper(),
            'target_currency': str(raw_record.get('target_currency') or '').upper(),
            'quantity': self._coerce_float_value(raw_record.get('quantity')),
            'trade_price': self._coerce_float_value(raw_record.get('trade_price')),
            'commission': self._coerce_float_value(raw_record.get('commission')),
            'basis': self._coerce_float_value(raw_record.get('basis')),
            'realized_pl': self._coerce_float_value(raw_record.get('realized_pl')),
            'mtm_pl': self._coerce_float_value(raw_record.get('mtm_pl')),
            'record_metadata': raw_record.get('metadata') or {},
            'source': connector.get_source_value(),
            'raw_row': raw_record.get('_raw_row') or raw_record
        }

        normalized['external_id'] = self._generate_tax_fx_external_id(normalized)
        return normalized

    # ------------------------------------------------------------------
    # Validation helpers
    # ------------------------------------------------------------------

    def _validate_cashflow_record(self, record: Dict[str, Any]) -> List[str]:
        errors: List[str] = []

        if not record.get('cashflow_type'):
            errors.append("Missing cashflow_type")
        if record.get('amount') is None:
            errors.append("Missing amount")
        if record.get('currency') in (None, ''):
            errors.append("Missing currency")
        if not record.get('effective_date'):
            errors.append("Missing effective_date")

        return errors

    @staticmethod
    def _extract_cashflow_metadata(raw_record: Dict[str, Any]) -> Dict[str, Any]:
        base_keys = {
            'section',
            'cashflow_type',
            'amount',
            'currency',
            'effective_date',
            'source_account',
            'target_account',
            'asset_symbol',
            'memo',
            'tax_country',
            '_raw_row'
        }

        metadata: Dict[str, Any] = {}
        for key, value in raw_record.items():
            if key not in base_keys and value not in (None, ''):
                metadata[key] = value

        return metadata

    def _validate_account_record(self, record: Dict[str, Any]) -> List[str]:
        errors: List[str] = []

        if not record.get('account_id'):
            errors.append("Missing account_id")
        if not record.get('base_currency'):
            errors.append("Missing base_currency")
        if not record.get('as_of'):
            errors.append("Missing as_of date")

        return errors

    def _validate_portfolio_record(self, record: Dict[str, Any]) -> List[str]:
        errors: List[str] = []
        record_type = record.get('record_type') or 'open_position'

        if record_type == 'open_position' and not record.get('symbol'):
            errors.append("symbol is required for position records")
        if not record.get('currency'):
            errors.append("currency is required")
        if not record.get('account_id'):
            errors.append("account_id is required")
        if not record.get('statement_period_end'):
            errors.append("statement_period_end envelope is required")

        return errors

    def _validate_tax_fx_record(self, record: Dict[str, Any]) -> List[str]:
        errors: List[str] = []
        record_type = record.get('record_type') or 'tax_cashflow'
        amount_required = record_type in {'withholding_tax', 'tax_cashflow', 'forex_conversion'}

        if amount_required and record.get('amount') is None:
            errors.append("amount is required")
        if amount_required and not record.get('currency'):
            errors.append("currency is required")
        if record_type == 'forex_conversion':
            if not record.get('source_currency') or not record.get('target_currency'):
                errors.append("forex conversion requires source and target currencies")
        if record_type in {'tax_cashflow', 'withholding_tax'} and not record.get('description'):
            errors.append("description is required for tax records")

        return errors

    # ------------------------------------------------------------------
    # External ID helpers
    # ------------------------------------------------------------------

    def _generate_cashflow_external_id(self, record: Dict[str, Any]) -> str:
        date_iso = self._coerce_date_to_iso(record.get('effective_date'))
        amount = record.get('amount') or 0.0
        parts = [
            date_iso or 'na',
            record.get('cashflow_type', 'cashflow'),
            record.get('currency', ''),
            f"{abs(float(amount)):.2f}",
            record.get('source_account', '')
        ]
        candidate = '_'.join(filter(None, parts))
        return self._sanitize_external_id(candidate)

    def _generate_account_external_id(self, record: Dict[str, Any]) -> str:
        date_iso = self._coerce_date_to_iso(record.get('as_of'))
        parts = [
            record.get('account_id', 'account'),
            record.get('base_currency', ''),
            date_iso or datetime.utcnow().strftime('%Y-%m-%d')
        ]
        candidate = '_'.join(filter(None, parts))
        return self._sanitize_external_id(candidate)

    def _generate_portfolio_external_id(self, record: Dict[str, Any]) -> str:
        date_iso = self._coerce_date_to_iso(record.get('statement_period_end'))
        parts = [
            record.get('account_id') or 'portfolio',
            record.get('record_type') or 'position',
            record.get('symbol') or record.get('description') or '',
            record.get('currency') or '',
            date_iso or ''
        ]
        candidate = '_'.join(filter(None, parts))
        return self._sanitize_external_id(candidate)

    def _generate_tax_fx_external_id(self, record: Dict[str, Any]) -> str:
        date_iso = self._coerce_date_to_iso(record.get('effective_date') or record.get('statement_period_end'))
        amount = record.get('amount') or 0.0
        parts = [
            record.get('record_type') or 'tax_fx',
            record.get('currency') or '',
            f"{abs(float(amount)):.2f}",
            record.get('symbol') or record.get('component') or '',
            date_iso or ''
        ]
        candidate = '_'.join(filter(None, parts))
        return self._sanitize_external_id(candidate)

    @staticmethod
    def _coerce_float_value(value: Any) -> float:
        if value in (None, ''):
            return 0.0
        try:
            return float(value)
        except (TypeError, ValueError):
            return 0.0

    @staticmethod
    def _sanitize_external_id(value: str) -> str:
        sanitized = re.sub(r'[^a-zA-Z0-9_-]', '_', value)
        return sanitized[:120] if len(sanitized) > 120 else sanitized

    def _normalize_date_envelope(self, value: Any) -> Optional[Dict[str, Any]]:
        if not value:
            return None

        if isinstance(value, dict):
            # Assume already DateEnvelope
            return value

        if isinstance(value, datetime):
            dt = value if value.tzinfo else value.replace(tzinfo=timezone.utc)
            return self.utc_normalizer.normalize_output(dt)

        try:
            normalized = self.date_normalizer.normalize_input_payload({'date': value})
            dt = normalized.get('date') if isinstance(normalized, dict) else None
            if isinstance(dt, datetime):
                if dt.tzinfo is None:
                    dt = dt.replace(tzinfo=timezone.utc)
                return self.utc_normalizer.normalize_output(dt)
        except Exception:
            return None

        return None
    
    def ensure_standard_format(self, record: Dict[str, Any]) -> Dict[str, Any]:
        """
        Ensure a record has all standard fields in the correct format.
        
        Args:
            record: Record to standardize
            
        Returns:
            Dict[str, Any]: Standardized record
        """
        standardized = {}
        
        # Ensure all standard fields are present
        for field in self.standard_fields:
            if field in record:
                standardized[field] = record[field]
            else:
                # Set default values for missing fields
                if field == 'fee':
                    standardized[field] = 0.0
                elif field == 'external_id':
                    standardized[field] = self._generate_fallback_id(record)
                elif field == 'source':
                    standardized[field] = 'unknown'
                else:
                    standardized[field] = None
        
        # Ensure data types are correct
        standardized = self._ensure_data_types(standardized)
        
        return standardized
    
    def _generate_fallback_id(self, record: Dict[str, Any]) -> str:
        """
        Generate a fallback external ID if none exists.
        
        Args:
            record: Record to generate ID for
            
        Returns:
            str: Fallback external ID
        """
        symbol = record.get('symbol', 'UNKNOWN')
        date = record.get('date')
        quantity = record.get('quantity', 0)
        price = record.get('price', 0)
        
        date_iso = self._coerce_date_to_iso(date)
        date_str = date_iso[:10] if date_iso else 'unknown'
        return f"fallback_{symbol}_{date_str}_{quantity}_{price}"
    
    def _ensure_data_types(self, record: Dict[str, Any]) -> Dict[str, Any]:
        """
        Ensure all fields have the correct data types.
        
        Args:
            record: Record to type-check
            
        Returns:
            Dict[str, Any]: Type-corrected record
        """
        corrected = record.copy()
        
        # Ensure string fields
        string_fields = ['symbol', 'action', 'external_id', 'source']
        for field in string_fields:
            if field in corrected and corrected[field] is not None:
                corrected[field] = str(corrected[field])
        
        # Ensure numeric fields
        numeric_fields = ['quantity', 'price', 'fee']
        for field in numeric_fields:
            if field in corrected and corrected[field] is not None:
                try:
                    corrected[field] = float(corrected[field])
                except (ValueError, TypeError):
                    corrected[field] = 0.0
        
        # Ensure date field
        if 'date' in corrected and corrected['date'] is not None:
            if isinstance(corrected['date'], str):
                # Date is already in ISO format
                pass
            elif isinstance(corrected['date'], datetime):
                corrected['date'] = corrected['date'].isoformat()
            else:
                corrected['date'] = str(corrected['date'])
        
        return corrected

    def _coerce_date_to_iso(self, value: Any) -> Optional[str]:
        """
        Convert supported date inputs (ISO string or DateEnvelope) into ISO string.
        """
        if value is None:
            return None

        if isinstance(value, datetime):
            dt = value
        else:
            try:
                normalized = self.date_normalizer.normalize_input_payload({'date': value})
                dt = normalized.get('date') if isinstance(normalized, dict) else None
            except Exception:
                dt = None

        if isinstance(dt, datetime):
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            return dt.isoformat().replace('+00:00', 'Z')

        if isinstance(value, dict):
            if value.get('utc'):
                return str(value['utc'])
            if value.get('local'):
                return str(value['local'])

        if isinstance(value, str):
            return value

        return str(value)
    
    def get_normalization_stats(self, result: Dict[str, Any]) -> Dict[str, Any]:
        """
        Get statistics about the normalization process.
        
        Args:
            result: Result from normalize_records
            
        Returns:
            Dict[str, Any]: Normalization statistics
        """
        total = result.get('total_processed', 0)
        successful = result.get('successful', 0)
        failed = result.get('failed', 0)
        
        return {
            'total_records': total,
            'successful_records': successful,
            'failed_records': failed,
            'success_rate': (successful / total * 100) if total > 0 else 0,
            'error_count': len(result.get('errors', [])),
            'has_errors': failed > 0
        }
    
    def validate_normalized_record(self, record: Dict[str, Any]) -> List[str]:
        """
        Validate a normalized record for completeness and correctness.
        
        Args:
            record: Normalized record to validate
            
        Returns:
            List[str]: List of validation error messages
        """
        errors = []
        
        # Check required fields
        required_fields = ['symbol', 'action', 'date', 'quantity', 'price']
        for field in required_fields:
            if field not in record or record[field] is None:
                errors.append(f"Missing required field: {field}")
        
        # Validate action
        if 'action' in record and record['action'] not in ['buy', 'sell']:
            errors.append(f"Invalid action: {record['action']}")
        
        # Validate quantity
        if 'quantity' in record:
            try:
                qty = float(record['quantity'])
                if qty <= 0:
                    errors.append(f"Invalid quantity: {qty}")
            except (ValueError, TypeError):
                errors.append(f"Invalid quantity type: {record['quantity']}")
        
        # Validate price
        if 'price' in record:
            try:
                price = float(record['price'])
                if price <= 0:
                    errors.append(f"Invalid price: {price}")
            except (ValueError, TypeError):
                errors.append(f"Invalid price type: {record['price']}")
        
        # Validate date format
        if 'date' in record and record['date']:
            try:
                datetime.fromisoformat(record['date'].replace('Z', '+00:00'))
            except ValueError:
                errors.append(f"Invalid date format: {record['date']}")
        
        # Validate external_id
        if 'external_id' not in record or not record['external_id']:
            errors.append("Missing external_id")
        
        # Validate source
        if 'source' not in record or not record['source']:
            errors.append("Missing source")
        
        return errors
