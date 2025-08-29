"""
Base Model - External Data Integration
Base class for all models in the external data integration system.

This module provides the foundation for all database models used in the
external data integration system. It uses SQLAlchemy's declarative base
to ensure consistent model behavior across the application.

Author: TikTrack Development Team
Created: January 2025
Version: 1.0
"""

from sqlalchemy.ext.declarative import declarative_base

# Create the declarative base that all models will inherit from
# This ensures consistent behavior and metadata management across all models
Base = declarative_base()
