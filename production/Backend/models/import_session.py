"""
ImportSession Model - Data Access Layer for User Data Import Sessions

This module defines the ImportSession SQLAlchemy model, representing the import_sessions table
in the database. The model tracks user data import sessions including file analysis,
validation results, and import statistics.

Author: TikTrack Development Team
Version: 1.0
Last Updated: 2025-01-16

🚨 CRITICAL REMINDERS:
- This is the MODEL LAYER - data structure only
- Never write business logic here - use services
- Never write API routes here - use blueprints
- Always follow: Models → Services → Routes → App architecture
"""

from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .base import BaseModel
from typing import Dict, Any, Optional
from datetime import datetime, timezone

class ImportSession(BaseModel):
    """
    ImportSession model representing a user data import session.
    
    This model tracks the complete lifecycle of a data import process,
    from file upload through analysis to final execution.
    """
    
    __tablename__ = "import_sessions"
    __table_args__ = {'extend_existing': True}
    
    # Database columns - matching import session requirements
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False, index=True,
                    comment="User who owns this import session")
    trading_account_id = Column(Integer, ForeignKey('trading_accounts.id'), nullable=False, 
                               comment="Trading account ID for the import")
    provider = Column(String(50), nullable=False, 
                     comment="Data provider: ibkr, demo, etc.")
    connector_type = Column(String(50), nullable=True,
                     comment="Connector key used for this import")
    task_type = Column(String(50), nullable=False, default='executions',
                     comment="Import task key: executions/cashflows/account_reconciliation")
    file_name = Column(String(255), nullable=False, 
                      comment="Original uploaded file name")
    total_records = Column(Integer, default=0, nullable=False, 
                          comment="Total records found in file")
    imported_records = Column(Integer, default=0, nullable=False, 
                             comment="Records successfully imported")
    skipped_records = Column(Integer, default=0, nullable=False, 
                            comment="Records skipped due to errors/duplicates")
    status = Column(String(20), default='analyzing', nullable=False, 
                   comment="Session status: created, analyzing, ready, importing, completed, failed, cancelled")
    summary_data = Column(JSON, nullable=True, 
                         comment="Detailed analysis results and preview data")
    completed_at = Column(DateTime, nullable=True, 
                         comment="When import was completed")
    
    # Relationships
    trading_account = relationship("TradingAccount", foreign_keys=[trading_account_id], back_populates="import_sessions")
    
    def __repr__(self) -> str:
        """String representation of the ImportSession object."""
        return f"<ImportSession(id={self.id}, provider='{self.provider}', status='{self.status}')>"
    
    def to_dict(self) -> Dict[str, Any]:
        """
        Convert ImportSession object to dictionary for JSON serialization.
        
        Returns:
            dict: Dictionary representation of the session
        """
        return {
            'id': self.id,
            'trading_account_id': self.trading_account_id,
            'provider': self.provider,
            'connector_type': self.connector_type,
            'task_type': self.task_type,
            'file_name': self.file_name,
            'total_records': self.total_records,
            'imported_records': self.imported_records,
            'skipped_records': self.skipped_records,
            'status': self.status,
            'summary_data': self.summary_data,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None
        }
    
    def is_active(self) -> bool:
        """
        Check if the session is currently active (not completed or failed).
        
        Returns:
            bool: True if session is active, False otherwise
        """
        return self.status in ['analyzing', 'ready', 'importing']
    
    def can_execute(self) -> bool:
        """
        Check if the session is ready for execution.
        
        Returns:
            bool: True if session can be executed, False otherwise
        """
        return self.status == 'ready'
    
    def get_progress_percentage(self) -> float:
        """
        Calculate import progress percentage.
        
        Returns:
            float: Progress percentage (0-100)
        """
        if self.total_records == 0:
            return 0.0
        
        processed = self.imported_records + self.skipped_records
        return min(100.0, (processed / self.total_records) * 100)
    
    def get_summary_stats(self) -> Dict[str, Any]:
        """
        Get summary statistics for the import session.
        
        Returns:
            dict: Summary statistics
        """
        return {
            'total_records': self.total_records,
            'imported_records': self.imported_records,
            'skipped_records': self.skipped_records,
            'success_rate': (self.imported_records / self.total_records * 100) if self.total_records > 0 else 0,
            'progress_percentage': self.get_progress_percentage(),
            'status': self.status,
            'is_completed': self.status == 'completed',
            'is_failed': self.status == 'failed'
        }
    
    def update_status(self, new_status: str) -> bool:
        """
        Update session status with validation.
        
        Args:
            new_status: The new status to set
            
        Returns:
            bool: True if status was updated, False otherwise
        """
        valid_statuses = ['created', 'analyzing', 'ready', 'importing', 'completed', 'failed', 'cancelled']
        
        if new_status not in valid_statuses:
            return False
        
        if self.status != new_status:
            self.status = new_status
            
            # Set completed_at when status changes to completed or failed
            if new_status in ['completed', 'failed', 'cancelled']:
                self.completed_at = datetime.now(timezone.utc)
            
            return True
        
        return False
    
    def add_summary_data(self, data: Dict[str, Any]) -> None:
        """
        Add or update summary data for the session.
        
        Args:
            data: Dictionary containing summary information
        """
        from sqlalchemy import inspect
        from sqlalchemy.orm.attributes import flag_modified
        
        if self.summary_data is None:
            self.summary_data = {}
        
        # Update the dictionary
        self.summary_data.update(data)
        
        # Mark the column as modified so SQLAlchemy will update it
        flag_modified(self, 'summary_data')
    
    def get_summary_data(self, key: str = None) -> Any:
        """
        Get summary data for the session.
        
        Args:
            key: Specific key to retrieve, or None for all data
            
        Returns:
            Any: Summary data value or entire dictionary
        """
        if self.summary_data is None:
            return None if key else {}
        
        if key:
            return self.summary_data.get(key)
        
        return self.summary_data
