"""
Base LLM Provider Interface
Abstract base class for LLM provider adapters
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)


class BaseLLMProvider(ABC):
    """Base class for LLM provider adapters"""
    
    @abstractmethod
    def send_prompt(self, prompt: str, api_key: str, **kwargs) -> Dict[str, Any]:
        """
        Send a prompt to the LLM provider
        
        Args:
            prompt: The prompt text to send
            api_key: API key for authentication
            **kwargs: Additional provider-specific parameters
            
        Returns:
            Dictionary with:
                - 'text': Response text
                - 'json': Parsed JSON (if applicable)
                - 'metadata': Additional metadata (optional)
                
        Raises:
            ValueError: If API key is invalid
            Exception: Provider-specific errors
        """
        pass
    
    @abstractmethod
    def validate_api_key(self, api_key: str) -> bool:
        """
        Validate an API key
        
        Args:
            api_key: API key to validate
            
        Returns:
            True if valid, False otherwise
        """
        pass
    
    def parse_response(self, response: Any) -> Dict[str, Any]:
        """
        Parse provider response to standard format
        
        Args:
            response: Raw response from provider
            
        Returns:
            Dictionary with 'text' and optional 'json'
        """
        return {
            'text': str(response),
            'json': None,
            'metadata': {}
        }
    
    def handle_error(self, error: Exception) -> Dict[str, Any]:
        """
        Handle provider-specific errors
        
        Args:
            error: Exception raised by provider
            
        Returns:
            Dictionary with error information including error_code
        """
        logger.error(f"LLM provider error: {error}", exc_info=True)
        
        # Import here to avoid circular dependency
        from services.ai_analysis_error_codes import categorize_error
        
        error_code = categorize_error(error, str(error))
        
        return {
            'text': None,
            'json': None,
            'error': str(error),
            'error_code': error_code,
            'error_type': type(error).__name__
        }





