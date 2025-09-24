"""
Base Entity Utilities - TikTrack
===============================

Utility functions and classes for API modules providing common
functionality for validation, formatting, and data processing.

Features:
- Input validation
- Data sanitization
- Response formatting
- Error handling utilities
- Database utilities

Author: TikTrack Development Team
Version: 1.0
Date: September 23, 2025
"""

from typing import Dict, List, Any, Optional, Union
from datetime import datetime
import re
import logging


class BaseEntityUtils:
    """Utility functions for API modules"""
    
    @staticmethod
    def validate_required_fields(data: Dict, required_fields: List[str]) -> tuple[bool, List[str]]:
        """
        Validate that all required fields are present and not empty
        
        Args:
            data: Data to validate
            required_fields: List of required field names
            
        Returns:
            Tuple of (is_valid, missing_fields)
        """
        if not required_fields:
            return True, []
        
        missing_fields = []
        
        for field in required_fields:
            if field not in data:
                missing_fields.append(field)
            elif data[field] is None:
                missing_fields.append(f"{field} (null)")
            elif isinstance(data[field], str) and not data[field].strip():
                missing_fields.append(f"{field} (empty)")
        
        return len(missing_fields) == 0, missing_fields
    
    @staticmethod
    def validate_field_types(data: Dict, field_types: Dict[str, type]) -> tuple[bool, List[str]]:
        """
        Validate field types
        
        Args:
            data: Data to validate
            field_types: Dictionary mapping field names to expected types
            
        Returns:
            Tuple of (is_valid, invalid_fields)
        """
        invalid_fields = []
        
        for field, expected_type in field_types.items():
            if field in data and data[field] is not None:
                if not isinstance(data[field], expected_type):
                    invalid_fields.append(f"{field} (expected {expected_type.__name__}, got {type(data[field]).__name__})")
        
        return len(invalid_fields) == 0, invalid_fields
    
    @staticmethod
    def validate_string_lengths(data: Dict, max_lengths: Dict[str, int]) -> tuple[bool, List[str]]:
        """
        Validate string field lengths
        
        Args:
            data: Data to validate
            max_lengths: Dictionary mapping field names to maximum lengths
            
        Returns:
            Tuple of (is_valid, invalid_fields)
        """
        invalid_fields = []
        
        for field, max_length in max_lengths.items():
            if field in data and isinstance(data[field], str):
                if len(data[field]) > max_length:
                    invalid_fields.append(f"{field} (length {len(data[field])} exceeds maximum {max_length})")
        
        return len(invalid_fields) == 0, invalid_fields
    
    @staticmethod
    def validate_email(email: str) -> bool:
        """
        Validate email format
        
        Args:
            email: Email to validate
            
        Returns:
            True if valid email format, False otherwise
        """
        if not email:
            return False
        
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(pattern, email) is not None
    
    @staticmethod
    def validate_phone(phone: str) -> bool:
        """
        Validate phone number format
        
        Args:
            phone: Phone number to validate
            
        Returns:
            True if valid phone format, False otherwise
        """
        if not phone:
            return False
        
        # Remove all non-digit characters
        digits_only = re.sub(r'\D', '', phone)
        
        # Check if it's a valid length (7-15 digits)
        return 7 <= len(digits_only) <= 15
    
    @staticmethod
    def sanitize_input(data: Dict) -> Dict:
        """
        Sanitize input data by removing/cleaning potentially harmful content
        
        Args:
            data: Input data to sanitize
            
        Returns:
            Sanitized data
        """
        sanitized = {}
        
        for key, value in data.items():
            if value is None:
                continue
            
            if isinstance(value, str):
                # Strip whitespace and remove potentially harmful characters
                sanitized_value = value.strip()
                
                # Remove HTML tags
                sanitized_value = re.sub(r'<[^>]+>', '', sanitized_value)
                
                # Remove SQL injection patterns (basic)
                sanitized_value = re.sub(r'[\'";]', '', sanitized_value)
                
                sanitized[key] = sanitized_value
            elif isinstance(value, (int, float, bool)):
                sanitized[key] = value
            elif isinstance(value, list):
                sanitized[key] = [BaseEntityUtils.sanitize_input(item) if isinstance(item, dict) else item for item in value]
            elif isinstance(value, dict):
                sanitized[key] = BaseEntityUtils.sanitize_input(value)
            else:
                sanitized[key] = value
        
        return sanitized
    
    @staticmethod
    def format_response(data: Any, message: str = None, status: str = "success") -> Dict:
        """
        Format standardized API response
        
        Args:
            data: Response data
            message: Optional message
            status: Response status (success/error)
            
        Returns:
            Formatted response dictionary
        """
        response = {
            "status": status,
            "data": data,
            "timestamp": datetime.now().isoformat(),
            "version": "v1"
        }
        
        if message:
            response["message"] = message
        
        return response
    
    @staticmethod
    def format_error_response(message: str, error_code: str = None, details: Dict = None) -> Dict:
        """
        Format standardized error response
        
        Args:
            message: Error message
            error_code: Optional error code
            details: Optional error details
            
        Returns:
            Formatted error response dictionary
        """
        error_response = {
            "status": "error",
            "error": {
                "message": message,
                "timestamp": datetime.now().isoformat()
            },
            "version": "v1"
        }
        
        if error_code:
            error_response["error"]["code"] = error_code
        
        if details:
            error_response["error"]["details"] = details
        
        return error_response
    
    @staticmethod
    def paginate_data(data: List[Any], page: int = 1, per_page: int = 20) -> Dict:
        """
        Paginate data
        
        Args:
            data: List of data to paginate
            page: Page number (1-based)
            per_page: Items per page
            
        Returns:
            Paginated data with metadata
        """
        total = len(data)
        pages = (total + per_page - 1) // per_page
        
        # Validate page number
        if page < 1:
            page = 1
        elif page > pages and pages > 0:
            page = pages
        
        # Calculate offset
        offset = (page - 1) * per_page
        
        # Get page data
        page_data = data[offset:offset + per_page]
        
        return {
            "data": page_data,
            "pagination": {
                "total": total,
                "page": page,
                "per_page": per_page,
                "pages": pages,
                "has_next": page < pages,
                "has_prev": page > 1
            }
        }
    
    @staticmethod
    def extract_filters_from_request(request_args: Dict) -> Dict:
        """
        Extract filter parameters from request arguments
        
        Args:
            request_args: Request arguments dictionary
            
        Returns:
            Dictionary of filters
        """
        filters = {}
        
        # Common filter parameters
        filter_params = [
            'status', 'type', 'account_id', 'user_id', 'date_from', 'date_to',
            'search', 'sort_by', 'sort_order', 'limit', 'offset'
        ]
        
        for param in filter_params:
            if param in request_args and request_args[param] is not None:
                value = request_args[param]
                
                # Convert string numbers to integers
                if param in ['account_id', 'user_id', 'limit', 'offset'] and isinstance(value, str):
                    try:
                        value = int(value)
                    except ValueError:
                        continue
                
                filters[param] = value
        
        return filters
    
    @staticmethod
    def sort_data(data: List[Dict], sort_by: str = 'id', sort_order: str = 'asc') -> List[Dict]:
        """
        Sort data by specified field
        
        Args:
            data: List of dictionaries to sort
            sort_by: Field to sort by
            sort_order: Sort order (asc/desc)
            
        Returns:
            Sorted data
        """
        if not data:
            return data
        
        # Check if sort field exists in data
        if sort_by not in data[0]:
            return data
        
        # Sort data
        reverse = sort_order.lower() == 'desc'
        
        try:
            return sorted(data, key=lambda x: x.get(sort_by, ''), reverse=reverse)
        except (TypeError, ValueError):
            # If sorting fails, return original data
            return data
    
    @staticmethod
    def calculate_performance_metrics(start_time: datetime, end_time: datetime, record_count: int = 0) -> Dict:
        """
        Calculate performance metrics
        
        Args:
            start_time: Start time
            end_time: End time
            record_count: Number of records processed
            
        Returns:
            Performance metrics dictionary
        """
        duration = (end_time - start_time).total_seconds()
        
        metrics = {
            "duration_seconds": round(duration, 3),
            "records_processed": record_count,
            "records_per_second": round(record_count / duration, 2) if duration > 0 else 0,
            "start_time": start_time.isoformat(),
            "end_time": end_time.isoformat()
        }
        
        return metrics
    
    @staticmethod
    def log_operation(logger: logging.Logger, operation: str, entity_name: str, 
                     entity_id: int = None, user_id: int = None, details: Dict = None):
        """
        Log API operation
        
        Args:
            logger: Logger instance
            operation: Operation name
            entity_name: Entity name
            entity_id: Entity ID (optional)
            user_id: User ID (optional)
            details: Additional details (optional)
        """
        log_data = {
            "operation": operation,
            "entity": entity_name,
            "timestamp": datetime.now().isoformat()
        }
        
        if entity_id:
            log_data["entity_id"] = entity_id
        
        if user_id:
            log_data["user_id"] = user_id
        
        if details:
            log_data["details"] = details
        
        logger.info(f"API Operation: {operation} on {entity_name}", extra=log_data)
    
    @staticmethod
    def validate_date_range(date_from: str, date_to: str) -> tuple[bool, str]:
        """
        Validate date range
        
        Args:
            date_from: Start date string
            date_to: End date string
            
        Returns:
            Tuple of (is_valid, error_message)
        """
        try:
            from datetime import datetime
            
            if date_from:
                datetime.fromisoformat(date_from.replace('Z', '+00:00'))
            
            if date_to:
                datetime.fromisoformat(date_to.replace('Z', '+00:00'))
            
            if date_from and date_to:
                start_date = datetime.fromisoformat(date_from.replace('Z', '+00:00'))
                end_date = datetime.fromisoformat(date_to.replace('Z', '+00:00'))
                
                if start_date > end_date:
                    return False, "Start date cannot be after end date"
            
            return True, ""
            
        except ValueError as e:
            return False, f"Invalid date format: {str(e)}"
    
    @staticmethod
    def clean_numeric_value(value: Any, default: float = 0.0) -> float:
        """
        Clean and convert numeric value
        
        Args:
            value: Value to clean
            default: Default value if conversion fails
            
        Returns:
            Cleaned numeric value
        """
        if value is None:
            return default
        
        if isinstance(value, (int, float)):
            return float(value)
        
        if isinstance(value, str):
            # Remove common currency symbols and whitespace
            cleaned = re.sub(r'[₪$€£,\s]', '', value)
            try:
                return float(cleaned)
            except ValueError:
                return default
        
        return default
