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
    
    def __init__(self, model_name: str = "models/gemini-2.5-flash"):
        """
        Initialize Gemini provider
        
        Args:
            model_name: Name of the Gemini model to use (default: models/gemini-2.5-flash)
        """
        if not GEMINI_AVAILABLE:
            raise ImportError("google-generativeai package is required for Gemini provider")
        self.model_name = model_name
        # Fallback models if primary fails (in order of preference)
        self.fallback_models = [
            "models/gemini-2.5-flash",
            "models/gemini-2.5-pro",
            "models/gemini-2.0-flash",
            "models/gemini-pro-latest"
        ]
    
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
        # Configure Gemini
        genai.configure(api_key=api_key)
        
        # Try primary model first, then fallback models
        models_to_try = [self.model_name] + getattr(self, 'fallback_models', [])
        
        last_error = None
        for model_name in models_to_try:
            try:
                # Get model
                model = genai.GenerativeModel(model_name)
                
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
                
                # Extract text - handle different response formats
                response_text = None
                finish_reason = 'unknown'
                
                # Try response.text first (preferred method)
                try:
                    if hasattr(response, 'text'):
                        response_text = response.text
                except (ValueError, AttributeError):
                    pass
                
                # If response.text failed, try to extract from candidates
                if not response_text and hasattr(response, 'candidates') and response.candidates:
                    candidate = response.candidates[0]
                    finish_reason_value = candidate.finish_reason
                    if hasattr(finish_reason_value, 'value'):
                        finish_reason = finish_reason_value.value
                    else:
                        finish_reason = finish_reason_value
                    
                    # Check if candidate has content with parts
                    if hasattr(candidate, 'content') and candidate.content:
                        if hasattr(candidate.content, 'parts') and candidate.content.parts:
                            text_parts = []
                            for part in candidate.content.parts:
                                if hasattr(part, 'text') and part.text:
                                    text_parts.append(part.text)
                            if text_parts:
                                response_text = ' '.join(text_parts)
                
                # If still no text, try response.parts
                if not response_text and hasattr(response, 'parts') and response.parts:
                    text_parts = []
                    for part in response.parts:
                        if hasattr(part, 'text') and part.text:
                            text_parts.append(part.text)
                    if text_parts:
                        response_text = ' '.join(text_parts)
                
                # If no text found, check finish_reason
                if not response_text:
                    if finish_reason == 2:  # RECITATION or SAFETY
                        error_msg = "Response was blocked by safety filters"
                    elif finish_reason == 3:  # OTHER
                        error_msg = "Response generation failed"
                    else:
                        error_msg = f"Response has no text content (finish_reason: {finish_reason})"
                    raise ValueError(error_msg)
                
                # Update model name if we used a fallback
                actual_model = model_name
                
                return {
                    'text': response_text,
                    'json': None,
                    'metadata': {
                        'model': actual_model,
                        'finish_reason': finish_reason
                    }
                }
                
            except Exception as e:
                last_error = e
                logger.warning(f"Gemini API error with model {model_name}: {e}")
                # Continue to next fallback model
                continue
        
        # All models failed
        logger.error(f"All Gemini models failed. Last error: {last_error}", exc_info=True)
        return self.handle_error(last_error or Exception("All Gemini models failed"))
    
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
            # Try primary model first, then fallback models
            models_to_try = [self.model_name] + getattr(self, 'fallback_models', [])
            
            for model_name in models_to_try:
                try:
                    model = genai.GenerativeModel(model_name)
                    # Make a minimal test request
                    response = model.generate_content("test", generation_config={"max_output_tokens": 1})
                    logger.info(f"Gemini API key validated successfully with model: {model_name}")
                    return True
                except Exception as e:
                    logger.debug(f"Gemini API key validation failed with model {model_name}: {e}")
                    continue
            
            # All models failed
            logger.warning(f"Gemini API key validation failed with all models")
            return False
        except Exception as e:
            logger.warning(f"Gemini API key validation failed: {e}")
            return False

