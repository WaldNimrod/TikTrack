"""
User Data Import Connectors Package

This package contains connectors for importing user data from various brokers
and data sources. Each connector handles a specific format and normalizes
data to a common structure.

Supported Connectors:
- IBKR: Interactive Brokers CSV format
- Demo: Simple CSV for testing

Author: TikTrack Development Team
Version: 1.0
Last Updated: 2025-01-16
"""

from .base_connector import BaseConnector
from .ibkr_connector import IBKRConnector
from .demo_connector import DemoConnector

__all__ = [
    'BaseConnector',
    'IBKRConnector', 
    'DemoConnector'
]
