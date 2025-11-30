"""
LLM Provider Manager
Manages LLM provider adapters and routes requests
"""

from typing import Dict, Any, Optional
import logging
from .base_provider import BaseLLMProvider
from .gemini_provider import GeminiProvider
from .perplexity_provider import PerplexityProvider

logger = logging.getLogger(__name__)


class LLMProviderManager:
    """Manager for LLM provider adapters"""
    
    # Registry of available providers
    _providers: Dict[str, type] = {
        'gemini': GeminiProvider,
        'perplexity': PerplexityProvider
    }
    
    def __init__(self):
        """Initialize provider manager"""
        self._instances: Dict[str, BaseLLMProvider] = {}
    
    def get_provider_adapter(self, provider: str) -> BaseLLMProvider:
        """
        Get provider adapter instance
        
        Args:
            provider: Provider name ('gemini' or 'perplexity')
            
        Returns:
            Provider adapter instance
            
        Raises:
            ValueError: If provider is not supported
        """
        provider = provider.lower()
        
        if provider not in self._providers:
            raise ValueError(f"Unsupported provider: {provider}. Supported: {list(self._providers.keys())}")
        
        # Create instance if not exists
        if provider not in self._instances:
            provider_class = self._providers[provider]
            self._instances[provider] = provider_class()
        
        return self._instances[provider]
    
    def send_prompt(self, provider: str, prompt: str, api_key: str, **kwargs) -> Dict[str, Any]:
        """
        Send prompt to specified provider
        
        Args:
            provider: Provider name ('gemini' or 'perplexity')
            prompt: Prompt text
            api_key: API key for provider
            **kwargs: Additional provider-specific parameters
            
        Returns:
            Response dictionary with 'text' and optional 'json'
        """
        adapter = self.get_provider_adapter(provider)
        return adapter.send_prompt(prompt, api_key, **kwargs)
    
    def validate_api_key(self, provider: str, api_key: str) -> bool:
        """
        Validate API key for provider
        
        Args:
            provider: Provider name ('gemini' or 'perplexity')
            api_key: API key to validate
            
        Returns:
            True if valid, False otherwise
        """
        try:
            adapter = self.get_provider_adapter(provider)
            return adapter.validate_api_key(api_key)
        except Exception as e:
            logger.error(f"Error validating API key for {provider}: {e}")
            return False
    
    @classmethod
    def get_supported_providers(cls) -> list:
        """Get list of supported providers"""
        return list(cls._providers.keys())
    
    @classmethod
    def register_provider(cls, name: str, provider_class: type):
        """
        Register a new provider (for extensibility)
        
        Args:
            name: Provider name
            provider_class: Provider class (must inherit from BaseLLMProvider)
        """
        if not issubclass(provider_class, BaseLLMProvider):
            raise ValueError("Provider class must inherit from BaseLLMProvider")
        cls._providers[name.lower()] = provider_class
        logger.info(f"Registered new LLM provider: {name}")

