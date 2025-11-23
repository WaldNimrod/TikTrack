"""
Edge Cases Utilities - TikTrack
=================================

Utility functions for handling edge cases consistently across all business services.

This module provides standardized functions for handling common edge cases like:
- None values
- Empty strings
- Zero values
- Negative values
- Type conversions

All business services should use these utilities to ensure consistent behavior.
"""

from typing import Any, Optional, Union


def is_empty_value(value: Any) -> bool:
    """
    Check if a value is considered "empty" for validation purposes.
    
    A value is considered empty if it is:
    - None
    - Empty string ('')
    - Whitespace-only string (after strip)
    
    Note: Zero (0) and False are NOT considered empty - they are valid values.
    
    Args:
        value: The value to check
        
    Returns:
        True if the value is empty, False otherwise
        
    Examples:
        >>> is_empty_value(None)
        True
        >>> is_empty_value('')
        True
        >>> is_empty_value('   ')
        True
        >>> is_empty_value(0)
        False
        >>> is_empty_value(False)
        False
        >>> is_empty_value('value')
        False
    """
    if value is None:
        return True
    
    if isinstance(value, str):
        return value.strip() == ''
    
    return False


def normalize_value(value: Any, default: Any = None) -> Any:
    """
    Normalize a value for consistent handling.
    
    This function:
    - Converts empty strings to None
    - Trims whitespace from strings
    - Returns the default value if the value is empty
    
    Args:
        value: The value to normalize
        default: Default value to return if value is empty (default: None)
        
    Returns:
        Normalized value or default if empty
        
    Examples:
        >>> normalize_value('  ')
        None
        >>> normalize_value('  value  ')
        'value'
        >>> normalize_value('', default=0)
        0
        >>> normalize_value(None, default='default')
        'default'
        >>> normalize_value(0)
        0
    """
    if is_empty_value(value):
        return default
    
    if isinstance(value, str):
        return value.strip()
    
    return value


def is_positive_number(value: Any) -> bool:
    """
    Check if a value is a positive number.
    
    Args:
        value: The value to check
        
    Returns:
        True if the value is a positive number, False otherwise
        
    Examples:
        >>> is_positive_number(10)
        True
        >>> is_positive_number(0)
        False
        >>> is_positive_number(-5)
        False
        >>> is_positive_number('10')
        False
    """
    if not isinstance(value, (int, float)):
        return False
    
    return value > 0


def is_non_negative_number(value: Any) -> bool:
    """
    Check if a value is a non-negative number (>= 0).
    
    Args:
        value: The value to check
        
    Returns:
        True if the value is a non-negative number, False otherwise
        
    Examples:
        >>> is_non_negative_number(10)
        True
        >>> is_non_negative_number(0)
        True
        >>> is_non_negative_number(-5)
        False
    """
    if not isinstance(value, (int, float)):
        return False
    
    return value >= 0

