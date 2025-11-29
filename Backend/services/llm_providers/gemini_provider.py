"""
Gemini LLM Provider
Adapter for Google Gemini API
"""

from .base_provider import BaseLLMProvider
from typing import Dict, Any
import logging
import os

logger = logging.getLogger(__name__)

try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False
    logger.warning("google-generativeai not installed. Gemini provider will not work.")


class GeminiProvider(BaseLLMProvider):
    """Google Gemini LLM provider adapter"""
    
    def __init__(self, model_name: str = "gemini-1.5-flash"):
        """
        Initialize Gemini provider
        
        Args:
            model_name: Name of the Gemini model to use
        """
        if not GEMINI_AVAILABLE:
            raise ImportError("google-generativeai package is required for Gemini provider")
        self.model_name = model_name
    
    def send_prompt(self, prompt: str, api_key: str, **kwargs) -> Dict[str, Any]:
        """
        Send a prompt to Gemini
        
        Args:
            prompt: The prompt text
            api_key: Gemini API key
            **kwargs: Additional parameters (temperature, max_tokens, etc.)
            
        Returns:
            Dictionary with response text and metadata
        """
        try:
            # Configure Gemini
            genai.configure(api_key=api_key)
            
            # Get model
            model = genai.GenerativeModel(self.model_name)
            
            # Generate content
            generation_config = {
                "temperature": kwargs.get("temperature", 0.7),
                "top_p": kwargs.get("top_p", 0.95),
                "top_k": kwargs.get("top_k", 40),
                "max_output_tokens": kwargs.get("max_tokens", 8192),
            }
            
            response = model.generate_content(
                prompt,
                generation_config=generation_config
            )
            
            # Extract text
            response_text = response.text if hasattr(response, 'text') else str(response)
            
            return {
                'text': response_text,
                'json': None,
                'metadata': {
                    'model': self.model_name,
                    'finish_reason': getattr(response, 'candidates', [{}])[0].get('finish_reason', 'unknown') if hasattr(response, 'candidates') else 'unknown'
                }
            }
            
        except Exception as e:
            logger.error(f"Gemini API error: {e}", exc_info=True)
            return self.handle_error(e)
    
    def validate_api_key(self, api_key: str) -> bool:
        """
        Validate Gemini API key by making a test request
        
        Args:
            api_key: API key to validate
            
        Returns:
            True if valid, False otherwise
        """
        try:
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel(self.model_name)
            # Make a minimal test request
            response = model.generate_content("test", generation_config={"max_output_tokens": 1})
            return True
        except Exception as e:
            logger.warning(f"Gemini API key validation failed: {e}")
            return False

