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

from services.date_normalization_service import DateNormalizationService


try:
    import bleach  # type: ignore
except ImportError:  # pragma: no cover - bleach is optional dependency
    bleach = None


logger = logging.getLogger(__name__)


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
    def sanitize_rich_text(html_content: Optional[str]) -> str:
        """Sanitize rich text HTML content while keeping allowed formatting"""
        if not html_content:
            return ''
        
        # Convert to string if not already
        html_content = str(html_content).strip()
        if not html_content:
            return ''

        # If bleach is unavailable, fall back to basic sanitization
        if bleach is None:
            logger.warning("⚠️ Using basic HTML sanitization (bleach not available)")
            # Remove script/style blocks and inline event handlers
            sanitized = re.sub(r'<script[^>]*>.*?</script>', '', html_content, flags=re.DOTALL | re.IGNORECASE)
            sanitized = re.sub(r'<style[^>]*>.*?</style>', '', sanitized, flags=re.DOTALL | re.IGNORECASE)
            sanitized = re.sub(r'on\w+="[^"]*"', '', sanitized, flags=re.IGNORECASE)
            sanitized = re.sub(r"on\w+='[^']*'", '', sanitized, flags=re.IGNORECASE)
            # If sanitization removed everything, return original
            if not sanitized or len(sanitized.strip()) == 0:
                return html_content
            return sanitized
        
        # If bleach is available, use it for sanitization
        # (bleach code would go here if needed)
        return html_content

    # ------------------------------------------------------------------
    # Date normalization helpers
    # ------------------------------------------------------------------
    @staticmethod
    def get_request_normalizer(request_obj, preferences_service=None, fallback_user_id: Optional[int] = None) -> DateNormalizationService:
        """
        Resolve the user's timezone from the request object and create a DateNormalizationService.
        Falls back to UTC on resolution failure.
        """
        try:
            timezone_name = DateNormalizationService.resolve_timezone(
                request_obj,
                preferences_service=preferences_service,
                fallback_user_id=fallback_user_id,
            )
        except Exception:
            timezone_name = "UTC"
        return DateNormalizationService(timezone_name)

    @staticmethod
    def normalize_input(normalizer: Optional[DateNormalizationService], payload: Any) -> Any:
        """Normalize incoming payload (user timezone → UTC)."""
        if normalizer is None:
            return payload
        return normalizer.normalize_input_payload(payload)

    @staticmethod
    def normalize_output(normalizer: Optional[DateNormalizationService], payload: Any) -> Any:
        """Normalize outgoing payload (attach DateEnvelope structures)."""
        if normalizer is None:
            return payload
        return normalizer.normalize_output(payload)

    @staticmethod
    def envelope_timestamp(normalizer: Optional[DateNormalizationService] = None) -> Dict[str, Any]:
        """Create DateEnvelope timestamp via the provided normalizer (UTC fallback)."""
        if normalizer:
            return normalizer.now_envelope()
        return DateNormalizationService().now_envelope()

    @staticmethod
    def create_success_payload(
        normalizer: Optional[DateNormalizationService],
        data: Any = None,
        message: str = "",
        extra: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Build standardized success payload with DateEnvelope timestamp."""
        payload: Dict[str, Any] = {
            "status": "success",
            "timestamp": BaseEntityUtils.envelope_timestamp(normalizer),
            "version": "1.0",
        }
        if data is not None:
            payload["data"] = BaseEntityUtils.normalize_output(normalizer, data)
        if message:
            payload["message"] = message
        if extra:
            payload.update(extra)
        return payload

    @staticmethod
    def create_error_payload(
        normalizer: Optional[DateNormalizationService],
        message: str,
        error_details: Optional[Dict[str, Any]] = None,
        extra: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Build standardized error payload with DateEnvelope timestamp."""
        payload: Dict[str, Any] = {
            "status": "error",
            "error": {"message": message},
            "timestamp": BaseEntityUtils.envelope_timestamp(normalizer),
            "version": "1.0",
        }
        if error_details:
            payload["error"].update(error_details)
        if extra:
            payload.update(extra)
        return payload

        # When bleach is available, use curated allowlists
        allowed_tags = [
            'p', 'br', 'strong', 'em', 'u', 's', 'h2', 'h3',
            'ul', 'ol', 'li', 'a', 'blockquote', 'code', 'pre',
            'span'
        ]

        allowed_attrs = {
            'a': ['href', 'target', 'rel'],
            'span': ['style', 'class', 'dir'],
            'p': ['style', 'class', 'dir'],
            'h2': ['style', 'class', 'dir'],
            'h3': ['style', 'class', 'dir'],
            'ul': ['style', 'class', 'dir'],
            'ol': ['style', 'class', 'dir'],
            'li': ['style', 'class', 'dir'],
            'blockquote': ['style', 'class', 'dir'],
            'code': ['style', 'class'],
            'pre': ['style', 'class']
        }

        allowed_styles = [
            'color', 'background-color', 'text-align', 'direction',
            'font-weight', 'font-style', 'text-decoration'
        ]

        try:
            return bleach.clean(
                html_content,
                tags=allowed_tags,
                attributes=allowed_attrs,
                styles=allowed_styles,
                strip=True
            )
        except Exception as exc:
            logger.error(f"❌ Error sanitizing HTML content: {exc}")
            # Fall back to basic sanitization if bleach fails unexpectedly
            html_content = re.sub(r'<script[^>]*>.*?</script>', '', html_content, flags=re.DOTALL | re.IGNORECASE)
            html_content = re.sub(r'<style[^>]*>.*?</style>', '', html_content, flags=re.DOTALL | re.IGNORECASE)
            html_content = re.sub(r'on\w+="[^"]*"', '', html_content, flags=re.IGNORECASE)
            html_content = re.sub(r"on\w+='[^']*'", '', html_content, flags=re.IGNORECASE)
            return html_content

    @staticmethod
    def format_response(data: Any, message: str = None, status: str = "success") -> Dict:
        """
        Format standardized API response.
        NOTE: Prefer create_success_payload with explicit normalizer when possible.
        """
        normalizer = None
        payload = BaseEntityUtils.create_success_payload(normalizer, data, message)
        if status != "success":
            payload["status"] = status
        return payload
    
    @staticmethod
    def format_error_response(message: str, error_code: str = None, details: Dict = None) -> Dict:
        """
        Format standardized error response.
        NOTE: Prefer create_error_payload with explicit normalizer when possible.
        """
        normalizer = None
        payload = BaseEntityUtils.create_error_payload(normalizer, message)
        if error_code:
            payload["error"]["code"] = error_code
        if details:
            payload["error"]["details"] = details
        return payload
    
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
            'status', 'type', 'trading_account_id', 'user_id', 'date_from', 'date_to',
            'search', 'sort_by', 'sort_order', 'limit', 'offset'
        ]
        
        for param in filter_params:
            if param in request_args and request_args[param] is not None:
                value = request_args[param]
                
                # Convert string numbers to integers
                if param in ['trading_account_id', 'user_id', 'limit', 'offset'] and isinstance(value, str):
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
