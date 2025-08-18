"""
Account Model - Data Access Layer for Account Entity

This module defines the Account SQLAlchemy model, representing the accounts table
in the database. The model includes all account-related fields and relationships
with other entities in the system.

Author: TikTrack Development Team
Version: 1.0
Last Updated: 2025-08-16

🚨 CRITICAL REMINDERS:
- This is the MODEL LAYER - data structure only
- Never write business logic here - use services
- Never write API routes here - use blueprints
- Always follow: Models → Services → Routes → App architecture
"""

from sqlalchemy import Column, String, Float, Integer, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from models.base import BaseModel

class Account(BaseModel):
    """
    Account model representing a trading account in the system.
    
    This model matches the actual database table structure exactly as defined
    in the backend architecture documentation.
    """
    
    __tablename__ = "accounts"
    
    # Database columns - matching actual database schema
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    currency = Column(String(3), default='USD')
    status = Column(String(20), default='open')
    cash_balance = Column(Float, default=0)
    total_value = Column(Float, default=0)
    total_pl = Column(Float, default=0)
    notes = Column(String(500))
    created_at = Column(DateTime, server_default=func.now())
    
    # Relationships with other entities
    # Each account can have multiple trades
    trades = relationship("Trade", back_populates="account", cascade="all, delete-orphan")
    
    # Each account can have multiple trade plans
    trade_plans = relationship("TradePlan", back_populates="account", cascade="all, delete-orphan")
    
    # Each account can have multiple alerts
    alerts = relationship("Alert", back_populates="account", cascade="all, delete-orphan")
    
    # Each account can have multiple cash flows
    cash_flows = relationship("CashFlow", back_populates="account", cascade="all, delete-orphan")
    
    # Notes relationship removed - notes now use related_type and related_id
    
    def __repr__(self):
        """String representation of the Account object."""
        return f"<Account(name='{self.name}', currency='{self.currency}', status='{self.status}')>"
    
    def to_dict(self):
        """
        Convert Account object to dictionary for JSON serialization.
        
        Returns:
            dict: Dictionary representation of the account
        """
        return {
            'id': self.id,
            'name': self.name,
            'currency': self.currency,
            'status': self.status,
            'cash_balance': self.cash_balance,
            'total_value': self.total_value,
            'total_pl': self.total_pl,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
    
    def is_active(self):
        """Check if the account is active."""
        return self.status == 'open'
    
    def get_balance_info(self):
        """Get formatted balance information for display."""
        return {
            'cash_balance': f"{self.cash_balance:,.2f} {self.currency}" if self.cash_balance else "0.00",
            'total_value': f"{self.total_value:,.2f} {self.currency}" if self.total_value else "0.00",
            'total_pl': f"{self.total_pl:,.2f} {self.currency}" if self.total_pl else "0.00",
            'pl_percentage': f"{((self.total_pl / self.cash_balance) * 100):.2f}%" if self.cash_balance and self.cash_balance > 0 else "0.00%"
        }
