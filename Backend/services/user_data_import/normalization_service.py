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
    
    def normalize_records(self, raw_records: List[Dict[str, Any]], 
                         connector) -> List[Dict[str, Any]]:
        """
        Normalize a list of raw records using the specified connector.
        
        Args:
            raw_records: List of raw data records
            connector: Connector instance with normalization methods
            
        Returns:
            List[Dict[str, Any]]: List of normalized records
        """
        normalized_records = []
        errors = []
        
        for i, raw_record in enumerate(raw_records):
            try:
                # Use connector's normalization method
                normalized = connector.normalize_record(raw_record)
                
                # Add external ID and source
                normalized['external_id'] = connector.generate_external_id(normalized)
                normalized['source'] = connector.get_source_value()
                
                # Validate the normalized record
                validation_errors = connector.validate_record(normalized)
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
