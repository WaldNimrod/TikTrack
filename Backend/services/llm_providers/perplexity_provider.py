"""
Perplexity LLM Provider
Adapter for Perplexity AI API
"""

from .base_provider import BaseLLMProvider
from typing import Dict, Any
import logging
import httpx

logger = logging.getLogger(__name__)


class PerplexityProvider(BaseLLMProvider):
    """Perplexity AI LLM provider adapter"""
    
    API_URL = "https://api.perplexity.ai/chat/completions"
    
    def __init__(self, model_name: str = "sonar"):
        """
        Initialize Perplexity provider
        
        Args:
            model_name: Name of the Perplexity model to use
            Default: sonar (works reliably)
            Other options: llama-3.1-sonar-large-128k-online, llama-3.1-sonar-small-128k-online, llama-3.1-sonar-huge-128k-online
        """
        self.model_name = model_name
        # Fallback models if primary fails
        self.fallback_models = [
            "sonar",
            "llama-3.1-sonar-large-128k-online",
            "llama-3.1-sonar-small-128k-online",
            "llama-3.1-sonar-huge-128k-online"
        ]
    
    def send_prompt(self, prompt: str, api_key: str, **kwargs) -> Dict[str, Any]:
        """
        Send a prompt to Perplexity
        
        Args:
            prompt: The prompt text
            api_key: Perplexity API key
            **kwargs: Additional parameters (temperature, max_tokens, etc.)
            
        Returns:
            Dictionary with response text and metadata
        """
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        # Try primary model first, then fallback models
        models_to_try = [self.model_name] + getattr(self, 'fallback_models', [])
        
        last_error = None
        for model_name in models_to_try:
            try:
                data = {
                    "model": model_name,
                    "messages": [
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ],
                    "temperature": kwargs.get("temperature", 0.7),
                    "max_tokens": kwargs.get("max_tokens", 4096),
                    "top_p": kwargs.get("top_p", 0.9),
                }
                
                # Make request with timeout
                with httpx.Client(timeout=60.0) as client:
                    response = client.post(self.API_URL, headers=headers, json=data)
                    response.raise_for_status()
                    result = response.json()
                
                # Extract response text
                if 'choices' in result and len(result['choices']) > 0:
                    response_text = result['choices'][0]['message']['content']
                else:
                    response_text = str(result)
                
                return {
                    'text': response_text,
                    'json': None,
                    'metadata': {
                        'model': model_name,
                        'usage': result.get('usage', {}),
                        'id': result.get('id', '')
                    }
                }
                
            except httpx.HTTPStatusError as e:
                last_error = e
                # If it's a model error, try next model
                if e.response.status_code == 400:
                    error_text = e.response.text
                    if 'Invalid model' in error_text or 'invalid_model' in error_text:
                        logger.warning(f"Perplexity model {model_name} not available, trying next model")
                        continue
                # For other HTTP errors, return error
                logger.error(f"Perplexity API HTTP error: {e.response.status_code} - {e.response.text}")
                return self.handle_error(e)
            except Exception as e:
                last_error = e
                logger.warning(f"Perplexity API error with model {model_name}: {e}")
                continue
        
        # All models failed
        logger.error(f"All Perplexity models failed. Last error: {last_error}", exc_info=True)
        return self.handle_error(last_error or Exception("All Perplexity models failed"))
    
    def validate_api_key(self, api_key: str) -> bool:
        """
        Validate Perplexity API key by making a test request
        
        Args:
            api_key: API key to validate
            
        Returns:
            True if valid, False otherwise
        """
        try:
            headers = {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            }
            
            # Try primary model first, then fallback models
            models_to_try = [self.model_name] + getattr(self, 'fallback_models', [])
            
            for model_name in models_to_try:
                try:
                    data = {
                        "model": model_name,
                        "messages": [{"role": "user", "content": "test"}],
                        "max_tokens": 1
                    }
                    
                    with httpx.Client(timeout=10.0) as client:
                        response = client.post(self.API_URL, headers=headers, json=data)
                        response.raise_for_status()
                    logger.info(f"Perplexity API key validated successfully with model: {model_name}")
                    return True
                except httpx.HTTPStatusError as e:
                    # If it's a model error, try next model
                    if e.response.status_code == 400:
                        error_text = e.response.text
                        if 'Invalid model' in error_text or 'invalid_model' in error_text:
                            logger.debug(f"Perplexity model {model_name} not available, trying next model")
                            continue
                    # For other HTTP errors, return False
                    logger.warning(f"Perplexity API key validation failed with model {model_name}: {e}")
                    return False
                except Exception as e:
                    logger.debug(f"Perplexity API key validation failed with model {model_name}: {e}")
                    continue
            
            # All models failed
            logger.warning(f"Perplexity API key validation failed with all models")
            return False
        except Exception as e:
            logger.warning(f"Perplexity API key validation failed: {e}")
            return False

