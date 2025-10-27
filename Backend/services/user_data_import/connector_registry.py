"""
Connector Registry - Central registry for import connectors with auto-discovery

This module provides a centralized registry for all import connectors with
auto-discovery capabilities and lazy loading for optimal performance.

Author: TikTrack Development Team
Version: 1.0
Last Updated: 2025-01-27
"""

import os
import importlib
import logging
from typing import Dict, Any, Optional, Type, List
from pathlib import Path

logger = logging.getLogger(__name__)

class ConnectorRegistry:
    """
    Central registry for import connectors with auto-discovery.
    
    This registry manages all available connectors and provides:
    - Auto-discovery of connectors in the directory
    - Lazy loading for optimal performance
    - Metadata management for each connector
    - Format detection and connector selection
    """
    
    def __init__(self):
        """Initialize the connector registry"""
        self.connectors: Dict[str, Type] = {}
        self.connector_metadata: Dict[str, Dict[str, Any]] = {}
        self.connector_instances: Dict[str, Any] = {}  # Lazy-loaded instances
        self.auto_discover()
    
    def register(self, connector_class: Type) -> None:
        """
        Register a connector class with metadata.
        
        Args:
            connector_class: Connector class to register
        """
        try:
            # Create temporary instance to get metadata
            temp_instance = connector_class()
            provider_name = temp_instance.get_provider_name()
            
            # Store class and metadata
            self.connectors[provider_name] = connector_class
            self.connector_metadata[provider_name] = {
                'class_name': connector_class.__name__,
                'provider_name': provider_name,
                'source_value': temp_instance.get_source_value(),
                'supports_external_id': True,
                'supports_validation': True,
                'file_extensions': getattr(temp_instance, 'get_supported_file_types', lambda: ['.csv'])(),
                'description': getattr(temp_instance, 'get_expected_format', lambda: {})().get('description', ''),
                'module': connector_class.__module__
            }
            
            logger.info(f"✅ Registered connector: {provider_name}")
            
        except Exception as e:
            logger.error(f"❌ Failed to register connector {connector_class.__name__}: {str(e)}")
    
    def auto_discover(self) -> None:
        """
        Auto-discover connectors in the connectors directory.
        
        This method scans the connectors directory and automatically
        registers all connector classes found.
        """
        try:
            # Get the connectors directory path
            current_dir = Path(__file__).parent
            connectors_dir = current_dir.parent / 'connectors' / 'user_data_import'
            
            if not connectors_dir.exists():
                logger.warning(f"Connectors directory not found: {connectors_dir}")
                return
            
            # Import the connectors module
            connectors_module = importlib.import_module('connectors.user_data_import')
            
            # Get all classes in the module
            for name in dir(connectors_module):
                obj = getattr(connectors_module, name)
                
                # Check if it's a class and has the required methods
                if (isinstance(obj, type) and 
                    hasattr(obj, 'detect_format') and
                    hasattr(obj, 'parse_file') and
                    hasattr(obj, 'normalize_record') and
                    hasattr(obj, 'get_provider_name') and
                    name != 'BaseConnector'):  # Skip base class
                    
                    self.register(obj)
            
            logger.info(f"🔍 Auto-discovery completed. Found {len(self.connectors)} connectors")
            
        except Exception as e:
            logger.error(f"❌ Auto-discovery failed: {str(e)}")
    
    def get_connector(self, provider_name: str) -> Optional[Any]:
        """
        Get a connector instance with lazy loading.
        
        Args:
            provider_name: Name of the provider (e.g., 'IBKR', 'Demo')
            
        Returns:
            Connector instance or None if not found
        """
        if provider_name not in self.connectors:
            logger.warning(f"Connector not found: {provider_name}")
            return None
        
        # Lazy load instance
        if provider_name not in self.connector_instances:
            try:
                connector_class = self.connectors[provider_name]
                self.connector_instances[provider_name] = connector_class()
                logger.debug(f"Lazy loaded connector: {provider_name}")
            except Exception as e:
                logger.error(f"Failed to create connector instance {provider_name}: {str(e)}")
                return None
        
        return self.connector_instances[provider_name]
    
    def detect_connector(self, file_content: str, file_name: str = None) -> Optional[Any]:
        """
        Auto-detect the appropriate connector for a file.
        
        Args:
            file_content: File content to analyze
            file_name: Optional file name for additional context
            
        Returns:
            Connector instance or None if no match found
        """
        logger.info(f"🔍 Detecting connector for file: {file_name or 'unknown'}")
        
        for provider_name, connector_class in self.connectors.items():
            try:
                # Create temporary instance for detection
                temp_instance = connector_class()
                
                # Try to detect format
                if hasattr(temp_instance, 'identify_file'):
                    # Use identify_file if available (newer method)
                    if temp_instance.identify_file(file_content, file_name or ''):
                        logger.info(f"✅ Detected connector: {provider_name}")
                        return self.get_connector(provider_name)
                elif hasattr(temp_instance, 'detect_format'):
                    # Fallback to detect_format
                    if temp_instance.detect_format(file_content):
                        logger.info(f"✅ Detected connector: {provider_name}")
                        return self.get_connector(provider_name)
                        
            except Exception as e:
                logger.debug(f"Connector {provider_name} detection failed: {str(e)}")
                continue
        
        logger.warning(f"❌ No connector detected for file: {file_name or 'unknown'}")
        return None
    
    def get_available_connectors(self) -> List[Dict[str, Any]]:
        """
        Get list of all available connectors with metadata.
        
        Returns:
            List of connector metadata dictionaries
        """
        return [
            {
                'provider_name': provider_name,
                **metadata
            }
            for provider_name, metadata in self.connector_metadata.items()
        ]
    
    def get_connector_info(self, provider_name: str) -> Optional[Dict[str, Any]]:
        """
        Get detailed information about a specific connector.
        
        Args:
            provider_name: Name of the provider
            
        Returns:
            Connector metadata or None if not found
        """
        if provider_name not in self.connector_metadata:
            return None
        
        metadata = self.connector_metadata[provider_name].copy()
        
        # Add runtime info if connector is loaded
        if provider_name in self.connector_instances:
            connector = self.connector_instances[provider_name]
            metadata['is_loaded'] = True
            metadata['connector_info'] = connector.get_connector_info()
        else:
            metadata['is_loaded'] = False
        
        return metadata
    
    def reload_connector(self, provider_name: str) -> bool:
        """
        Reload a specific connector (useful for development).
        
        Args:
            provider_name: Name of the provider to reload
            
        Returns:
            True if reloaded successfully, False otherwise
        """
        if provider_name not in self.connectors:
            logger.warning(f"Cannot reload unknown connector: {provider_name}")
            return False
        
        try:
            # Remove cached instance
            if provider_name in self.connector_instances:
                del self.connector_instances[provider_name]
            
            # Reload the module
            connector_class = self.connectors[provider_name]
            module_name = connector_class.__module__
            importlib.reload(importlib.import_module(module_name))
            
            logger.info(f"✅ Reloaded connector: {provider_name}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to reload connector {provider_name}: {str(e)}")
            return False
    
    def get_stats(self) -> Dict[str, Any]:
        """
        Get registry statistics.
        
        Returns:
            Dictionary with registry statistics
        """
        return {
            'total_connectors': len(self.connectors),
            'loaded_connectors': len(self.connector_instances),
            'available_providers': list(self.connectors.keys()),
            'loaded_providers': list(self.connector_instances.keys())
        }

