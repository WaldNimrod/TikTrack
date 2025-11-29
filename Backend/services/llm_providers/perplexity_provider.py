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
    
    def __init__(self, model_name: str = "llama-3.1-sonar-large-128k-online"):
        """
        Initialize Perplexity provider
        
        Args:
            model_name: Name of the Perplexity model to use
        """
        self.model_name = model_name
    
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
        try:
            headers = {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            }
            
            data = {
                "model": self.model_name,
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
                    'model': self.model_name,
                    'usage': result.get('usage', {}),
                    'id': result.get('id', '')
                }
            }
            
        except httpx.HTTPStatusError as e:
            logger.error(f"Perplexity API HTTP error: {e.response.status_code} - {e.response.text}")
            return self.handle_error(e)
        except Exception as e:
            logger.error(f"Perplexity API error: {e}", exc_info=True)
            return self.handle_error(e)
    
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
            
            data = {
                "model": self.model_name,
                "messages": [{"role": "user", "content": "test"}],
                "max_tokens": 1
            }
            
            with httpx.Client(timeout=10.0) as client:
                response = client.post(self.API_URL, headers=headers, json=data)
                response.raise_for_status()
            return True
        except Exception as e:
            logger.warning(f"Perplexity API key validation failed: {e}")
            return False

