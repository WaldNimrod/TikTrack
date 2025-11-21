"""
Base Import Connector - Abstract base class for all data import connectors

This module defines the base interface that all import connectors must implement.
It provides common functionality and enforces a consistent API across all connectors.

Author: TikTrack Development Team
Version: 1.0
Last Updated: 2025-01-16
"""

from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
import hashlib
import re

from services.date_normalization_service import DateNormalizationService

class BaseConnector(ABC):
    """
    Abstract base class for all data import connectors.
    
    This class defines the interface that all import connectors must implement,
    ensuring consistency across different data sources and formats.
    """
    
    def __init__(self):
        """Initialize the connector"""
        self.provider_name = self.get_provider_name()
        self.source_value = self.get_source_value()
        self._date_normalizer = DateNormalizationService()
    
    @abstractmethod
    def detect_format(self, file_content: str) -> bool:
        """
        Detect if the file content matches this connector's format.
        
        Args:
            file_content: Raw file content as string
            
        Returns:
            bool: True if format matches, False otherwise
        """
        pass
    
    @abstractmethod
    def parse_file(self, file_content: str, file_name: str = None) -> List[Dict[str, Any]]:
        """
        Parse the file content and extract raw data records.
        
        Args:
            file_content: Raw file content as string
            
        Returns:
            List[Dict[str, Any]]: List of raw data records
        """
        pass
    
    @abstractmethod
    def normalize_record(self, raw_record: Dict[str, Any]) -> Dict[str, Any]:
        """
        Normalize a raw record to the standard format.
        
        Args:
            raw_record: Raw data record from parse_file
            
        Returns:
            Dict[str, Any]: Normalized record with standard fields
        """
        pass
    
    @abstractmethod
    def get_provider_name(self) -> str:
        """
        Get the provider name for this connector.
        
        Returns:
            str: Provider name (e.g., "IBKR", "Demo")
        """
        pass
    
    def get_source_value(self) -> str:
        """
        Get the source value for imported records.
        
        Returns:
            str: Source value (e.g., "ibkr_import", "demo_import")
        """
        provider = self.get_provider_name().lower()
        return f"{provider}_import"
    
    def generate_external_id(self, record: Dict[str, Any]) -> str:
        """
        Generate a unique external ID for a record.
        
        This method creates a unique identifier that can be used to:
        - Detect duplicates in future imports
        - Link back to the original data source
        - Track record provenance
        
        Args:
            record: Normalized record data
            
        Returns:
            str: Unique external ID
        """
        # Extract key fields for ID generation
        symbol = record.get('symbol', '')
        date = record.get('date', '')
        quantity = record.get('quantity', 0)
        price = record.get('price', 0)
        action = record.get('action', '')
        
        # Create a unique identifier
        # Format: {date}_{symbol}_{action}_{quantity}_{price}
        date_str = self._format_date_for_id(date)
        quantity_str = str(abs(quantity))  # Use absolute value
        price_str = f"{price:.2f}" if isinstance(price, (int, float)) else str(price)
        
        external_id = f"{date_str}_{symbol}_{action}_{quantity_str}_{price_str}"
        
        # Ensure ID is not too long and contains only safe characters
        external_id = re.sub(r'[^a-zA-Z0-9_-]', '_', external_id)
        external_id = external_id[:100]  # Limit length
        
        return external_id
    
    def _format_date_for_id(self, date_value: Any) -> str:
        """
        Format date value for use in external ID.
        
        Args:
            date_value: Date value (string, datetime, or other)
            
        Returns:
            str: Formatted date string
        """
        normalized_dt = self._coerce_to_datetime(date_value)
        if normalized_dt:
            if normalized_dt.tzinfo is None:
                normalized_dt = normalized_dt.replace(tzinfo=timezone.utc)
            return normalized_dt.isoformat().replace('+00:00', 'Z')

        if isinstance(date_value, dict):
            if date_value.get('utc'):
                return re.sub(r'[^a-zA-Z0-9_-]', '_', str(date_value['utc']))
            if date_value.get('local'):
                return re.sub(r'[^a-zA-Z0-9_-]', '_', str(date_value['local']))

        if isinstance(date_value, str):
            return re.sub(r'[^a-zA-Z0-9_-]', '_', date_value)

        return re.sub(r'[^a-zA-Z0-9_-]', '_', str(date_value))
    
    def validate_record(self, record: Dict[str, Any]) -> List[str]:
        """
        Validate a normalized record for common issues.
        
        Args:
            record: Normalized record to validate
            
        Returns:
            List[str]: List of validation error messages (empty if valid)
        """
        errors = []
        
        # Check required fields
        required_fields = ['symbol', 'action', 'date', 'quantity', 'price']
        for field in required_fields:
            if field not in record or record[field] is None:
                errors.append(f"Missing required field: {field}")
        
        # Validate action
        if 'action' in record and record['action'] not in ['buy', 'sell']:
            errors.append(f"Invalid action: {record['action']}. Must be 'buy' or 'sell'")
        
        # Validate quantity
        if 'quantity' in record:
            try:
                qty = float(record['quantity'])
                if qty == 0:
                    errors.append("Quantity cannot be zero")
                elif qty < 0 and record.get('action') == 'buy':
                    errors.append("Buy action cannot have negative quantity")
                # Note: Sell actions can have positive quantities (normalized from negative)
            except (ValueError, TypeError):
                errors.append(f"Invalid quantity: {record['quantity']}")
        
        # Validate price
        if 'price' in record:
            try:
                price = float(record['price'])
                if price <= 0:
                    errors.append(f"Price must be positive: {price}")
            except (ValueError, TypeError):
                errors.append(f"Invalid price: {record['price']}")
        
        # Validate date
        if 'date' in record and record['date']:
            if self._coerce_to_datetime(record['date']) is None:
                errors.append("Invalid date value: expected ISO string or DateEnvelope")
        
        return errors

    def _coerce_to_datetime(self, value: Any) -> Optional[datetime]:
        """
        Convert supported date inputs (ISO string or DateEnvelope) into datetime.
        """
        if value is None:
            return None

        if isinstance(value, datetime):
            return value

        try:
            normalized = self._date_normalizer.normalize_input_payload({'date': value})
            if isinstance(normalized, dict):
                candidate = normalized.get('date')
                if isinstance(candidate, datetime):
                    return candidate
        except Exception:
            return None

        return None
    
    def process_file(self, file_content: str) -> Dict[str, Any]:
        """
        Process a complete file through the connector pipeline.
        
        Args:
            file_content: Raw file content as string
            
        Returns:
            Dict[str, Any]: Processing results with normalized records and metadata
        """
        # Parse file
        raw_records = self.parse_file(file_content)
        
        # Normalize records
        normalized_records = []
        validation_errors = []
        
        for i, raw_record in enumerate(raw_records):
            try:
                # Normalize record
                normalized = self.normalize_record(raw_record)
                
                # Add external ID and source
                normalized['external_id'] = self.generate_external_id(normalized)
                normalized['source'] = self.source_value
                
                # Validate record
                errors = self.validate_record(normalized)
                if errors:
                    validation_errors.append({
                        'record_index': i,
                        'record': normalized,
                        'errors': errors
                    })
                else:
                    normalized_records.append(normalized)
                    
            except Exception as e:
                validation_errors.append({
                    'record_index': i,
                    'record': raw_record,
                    'errors': [f"Processing error: {str(e)}"]
                })
        
        return {
            'provider': self.provider_name,
            'source': self.source_value,
            'total_records': len(raw_records),
            'valid_records': len(normalized_records),
            'invalid_records': len(validation_errors),
            'normalized_records': normalized_records,
            'validation_errors': validation_errors,
            'processing_timestamp': datetime.now().isoformat()
        }
    
    def precheck_file(
        self,
        file_content: str,
        *,
        file_name: Optional[str] = None,
        task_type: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Lightweight validation hook that runs immediately after the user selects a file.
        
        Connectors can override this to add custom structural checks. The default implementation
        verifies the file is non-empty and matches the connector format via identify_file().
        """
        errors = []
        warnings: List[str] = []
        
        if not file_content or not file_content.strip():
            errors.append('The uploaded file is empty or unreadable.')
            return {
                'success': False,
                'errors': errors,
                'warnings': warnings
            }
        
        try:
            if not self.identify_file(file_content, file_name or ''):
                errors.append('File format does not match the selected data provider.')
        except Exception as exc:
            errors.append(str(exc))
        
        if errors:
            return {
                'success': False,
                'errors': errors,
                'warnings': warnings
            }
        
        return {
            'success': True,
            'message': 'File structure looks valid.',
            'warnings': warnings
        }
    
    def get_connector_info(self) -> Dict[str, Any]:
        """
        Get information about this connector.
        
        Returns:
            Dict[str, Any]: Connector information
        """
        return {
            'provider_name': self.provider_name,
            'source_value': self.source_value,
            'class_name': self.__class__.__name__,
            'supports_external_id': True,
            'supports_validation': True
        }

    def extract_symbol_metadata(
        self,
        file_content: str,
        raw_records: Optional[List[Dict[str, Any]]] = None
    ) -> List[Dict[str, Any]]:
        """
        Optional hook for connectors to expose symbol-level metadata.

        Returns a list of dictionaries that may include the following keys:
        - symbol (required)
        - display_symbol
        - company_name
        - exchange_code
        - currency
        - source (identifier for the originating system/section)

        Default implementation returns an empty list; connectors can override.
        """
        return []
