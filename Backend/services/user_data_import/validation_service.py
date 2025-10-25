"""
Validation Service - Validates data integrity and business rules

This service performs comprehensive validation of normalized records
to ensure data quality and business rule compliance before import.

Author: TikTrack Development Team
Version: 1.0
Last Updated: 2025-01-16
"""

from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class ValidationService:
    """
    Service for validating normalized records.
    
    This service performs various validation checks including:
    - Data type validation
    - Business rule validation
    - Range validation
    - Format validation
    """
    
    def __init__(self):
        """Initialize the validation service"""
        self.validation_rules = {
            'symbol': self._validate_symbol,
            'action': self._validate_action,
            'date': self._validate_date,
            'quantity': self._validate_quantity,
            'price': self._validate_price,
            'fee': self._validate_fee,
            'external_id': self._validate_external_id,
            'source': self._validate_source
        }
    
    def validate_records(self, records: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Validate a list of normalized records.
        
        Args:
            records: List of normalized records to validate
            
        Returns:
            Dict[str, Any]: Validation results
        """
        valid_records = []
        invalid_records = []
        validation_errors = []
        
        for i, record in enumerate(records):
            try:
                errors = self._validate_single_record(record)
                
                if errors:
                    invalid_records.append(record)
                    validation_errors.append({
                        'record_index': i,
                        'record': record,
                        'errors': errors
                    })
                else:
                    valid_records.append(record)
                    
            except Exception as e:
                invalid_records.append(record)
                validation_errors.append({
                    'record_index': i,
                    'record': record,
                    'errors': [f"Validation error: {str(e)}"]
                })
                logger.error(f"Failed to validate record {i}: {str(e)}")
        
        return {
            'valid_records': valid_records,
            'invalid_records': invalid_records,
            'validation_errors': validation_errors,
            'total_records': len(records),
            'valid_count': len(valid_records),
            'invalid_count': len(invalid_records),
            'validation_rate': (len(valid_records) / len(records) * 100) if records else 0
        }
    
    def _validate_single_record(self, record: Dict[str, Any]) -> List[str]:
        """
        Validate a single record.
        
        Args:
            record: Record to validate
            
        Returns:
            List[str]: List of validation error messages
        """
        errors = []
        
        # Check required fields
        required_fields = ['symbol', 'action', 'date', 'quantity', 'price']
        for field in required_fields:
            if field not in record or record[field] is None:
                errors.append(f"Missing required field: {field}")
        
        # Validate each field
        for field, validator in self.validation_rules.items():
            if field in record:
                field_errors = validator(record[field], record)
                errors.extend(field_errors)
        
        return errors
    
    def _validate_symbol(self, value: Any, record: Dict[str, Any]) -> List[str]:
        """Validate symbol field"""
        errors = []
        
        if not value or not isinstance(value, str):
            errors.append("Symbol must be a non-empty string")
        elif len(value.strip()) == 0:
            errors.append("Symbol cannot be empty")
        elif len(value) > 10:
            errors.append("Symbol too long (max 10 characters)")
        elif not value.replace('-', '').replace('.', '').isalnum():
            errors.append("Symbol contains invalid characters")
        
        return errors
    
    def _validate_action(self, value: Any, record: Dict[str, Any]) -> List[str]:
        """Validate action field"""
        errors = []
        
        if not value or not isinstance(value, str):
            errors.append("Action must be a non-empty string")
        elif value not in ['buy', 'sell']:
            errors.append(f"Invalid action: {value}. Must be 'buy' or 'sell'")
        
        # Cross-validate with quantity
        if 'quantity' in record and 'action' in record:
            try:
                quantity = float(record['quantity'])
                action = record['action']
                
                if action == 'buy' and quantity <= 0:
                    errors.append("Buy action requires positive quantity")
                elif action == 'sell' and quantity <= 0:
                    errors.append("Sell action requires positive quantity")
            except (ValueError, TypeError):
                pass  # Quantity validation will catch this
        
        return errors
    
    def _validate_date(self, value: Any, record: Dict[str, Any]) -> List[str]:
        """Validate date field"""
        errors = []
        
        if not value:
            errors.append("Date is required")
            return errors
        
        if not isinstance(value, str):
            errors.append("Date must be a string")
            return errors
        
        try:
            # Try to parse ISO format
            dt = datetime.fromisoformat(value.replace('Z', '+00:00'))
            
            # Check if date is reasonable (not too far in past/future)
            now = datetime.now()
            if dt.year < 1900:
                errors.append("Date too far in the past")
            elif dt.year > now.year + 1:
                errors.append("Date too far in the future")
                
        except ValueError:
            errors.append(f"Invalid date format: {value}")
        
        return errors
    
    def _validate_quantity(self, value: Any, record: Dict[str, Any]) -> List[str]:
        """Validate quantity field"""
        errors = []
        
        if value is None:
            errors.append("Quantity is required")
            return errors
        
        try:
            qty = float(value)
            
            if qty <= 0:
                errors.append("Quantity must be positive")
            elif qty > 1000000:  # Reasonable upper limit
                errors.append("Quantity too large (max 1,000,000)")
            elif qty < 0.0001:  # Reasonable lower limit
                errors.append("Quantity too small (min 0.0001)")
                
        except (ValueError, TypeError):
            errors.append(f"Invalid quantity: {value}")
        
        return errors
    
    def _validate_price(self, value: Any, record: Dict[str, Any]) -> List[str]:
        """Validate price field"""
        errors = []
        
        if value is None:
            errors.append("Price is required")
            return errors
        
        try:
            price = float(value)
            
            if price <= 0:
                errors.append("Price must be positive")
            elif price > 1000000:  # Reasonable upper limit
                errors.append("Price too high (max 1,000,000)")
            elif price < 0.0001:  # Reasonable lower limit
                errors.append("Price too low (min 0.0001)")
                
        except (ValueError, TypeError):
            errors.append(f"Invalid price: {value}")
        
        return errors
    
    def _validate_fee(self, value: Any, record: Dict[str, Any]) -> List[str]:
        """Validate fee field"""
        errors = []
        
        if value is None:
            return errors  # Fee is optional
        
        try:
            fee = float(value)
            
            if fee < 0:
                errors.append("Fee cannot be negative")
            elif fee > 10000:  # Reasonable upper limit
                errors.append("Fee too high (max 10,000)")
                
        except (ValueError, TypeError):
            errors.append(f"Invalid fee: {value}")
        
        return errors
    
    def _validate_external_id(self, value: Any, record: Dict[str, Any]) -> List[str]:
        """Validate external_id field"""
        errors = []
        
        if not value or not isinstance(value, str):
            errors.append("External ID is required")
        elif len(value.strip()) == 0:
            errors.append("External ID cannot be empty")
        elif len(value) > 100:
            errors.append("External ID too long (max 100 characters)")
        
        return errors
    
    def _validate_source(self, value: Any, record: Dict[str, Any]) -> List[str]:
        """Validate source field"""
        errors = []
        
        if not value or not isinstance(value, str):
            errors.append("Source is required")
        elif len(value.strip()) == 0:
            errors.append("Source cannot be empty")
        elif len(value) > 50:
            errors.append("Source too long (max 50 characters)")
        
        return errors
    
    def get_validation_summary(self, result: Dict[str, Any]) -> Dict[str, Any]:
        """
        Get a summary of validation results.
        
        Args:
            result: Result from validate_records
            
        Returns:
            Dict[str, Any]: Validation summary
        """
        total = result.get('total_records', 0)
        valid = result.get('valid_count', 0)
        invalid = result.get('invalid_count', 0)
        
        # Categorize errors by type
        error_categories = {}
        for error_info in result.get('validation_errors', []):
            for error in error_info.get('errors', []):
                error_type = error.split(':')[0] if ':' in error else 'General'
                error_categories[error_type] = error_categories.get(error_type, 0) + 1
        
        return {
            'total_records': total,
            'valid_records': valid,
            'invalid_records': invalid,
            'validation_rate': result.get('validation_rate', 0),
            'error_categories': error_categories,
            'has_errors': invalid > 0,
            'is_valid': invalid == 0
        }
    
    def validate_business_rules(self, records: List[Dict[str, Any]]) -> List[str]:
        """
        Validate business rules across all records.
        
        Args:
            records: List of records to validate
            
        Returns:
            List[str]: List of business rule violations
        """
        violations = []
        
        # Check for duplicate external IDs within the batch
        external_ids = [r.get('external_id') for r in records if r.get('external_id')]
        if len(external_ids) != len(set(external_ids)):
            violations.append("Duplicate external IDs found within the batch")
        
        # Check for suspicious patterns
        symbols = [r.get('symbol') for r in records if r.get('symbol')]
        if len(set(symbols)) == 1 and len(records) > 100:
            violations.append("All records have the same symbol - possible data issue")
        
        # Check for date consistency
        dates = [r.get('date') for r in records if r.get('date')]
        if dates:
            try:
                parsed_dates = [datetime.fromisoformat(d.replace('Z', '+00:00')) for d in dates]
                date_range = max(parsed_dates) - min(parsed_dates)
                if date_range.days > 365:
                    violations.append("Date range spans more than one year")
            except ValueError:
                violations.append("Invalid date format in records")
        
        return violations
