"""
External Data API Routes Package
Provides REST API endpoints for external data integration
"""

from .quotes import quotes_bp
from .status import status_bp

__all__ = [
    'quotes_bp',
    'status_bp'
]






