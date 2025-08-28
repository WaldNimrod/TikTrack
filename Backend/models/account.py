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

from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from models.base import BaseModel
from typing import Dict, Any, Optional

class Account(BaseModel):
    """
    Account model representing a trading account in the system.
    
    This model matches the actual database table structure exactly as defined
    in the backend architecture documentation.
    """
    
    __tablename__ = "accounts"
    __table_args__ = {'extend_existing': True}
    
    # Database columns - matching actual database schema
    name = Column(String(100), nullable=False)
    currency_id = Column(Integer, ForeignKey('currencies.id'), default=1)  # Foreign key to currencies table
    status = Column(String(20), default='active')
    balance = Column(Float, default=0)  # cash_balance in model but balance in DB
    
    # Relationships
    currency = relationship("Currency", back_populates="accounts")
    
    # Relationships with other entities
    # Currency is now a simple string field, not a relationship
    
    # Each account can have multiple trades
    trades = relationship("Trade", back_populates="account", cascade="all, delete-orphan")
    
    # Each account can have multiple trade plans
    trade_plans = relationship("TradePlan", back_populates="account", cascade="all, delete-orphan")
    
    # Each account can have multiple alerts (through related_type_id and related_id)
    # alerts = relationship("Alert", back_populates="account", cascade="all, delete-orphan")
    
    # Each account can have multiple cash flows
    cash_flows = relationship("CashFlow", back_populates="account", cascade="all, delete-orphan")
    
    # Notes relationship removed - notes now use related_type and related_id
    
    def __repr__(self) -> str:
        """String representation of the Account object."""
        currency_symbol = self.currency.symbol if self.currency else 'USD'
        return f"<Account(name='{self.name}', currency='{currency_symbol}', status='{self.status}')>"
    
    def to_dict(self) -> Dict[str, Any]:
        """
        Convert Account object to dictionary for JSON serialization.
        
        Returns:
            dict: Dictionary representation of the account
        """
        return {
            'id': self.id,
            'name': self.name,
            'currency': self.currency.symbol if self.currency else 'USD',
            'currency_id': self.currency_id,
            'status': self.status,
            'balance': self.balance,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
    
    def is_open(self) -> bool:
        """
        Check if the account is open/active.
        
        Note: All status values are now in English:
        - 'active': Account is open and operational
        - 'closed': Account is closed but can be reopened
        - 'cancelled': Account is permanently cancelled
        """
        return self.status == 'active'
    
    def get_balance_info(self) -> Dict[str, str]:
        """Get formatted balance information for display."""
        currency_symbol = self.currency.symbol if self.currency else 'USD'
        return {
            'balance': f"{self.balance:,.2f} {currency_symbol}" if self.balance else "0.00",
            'currency': currency_symbol
        }
    
    @classmethod
    def is_last_account(cls, db_session) -> bool:
        """Check if this is the last account in the system"""
        from sqlalchemy.orm import Session
        if isinstance(db_session, Session):
            count = db_session.query(cls).count()
            return count == 1
        return False
    
    def can_be_deleted(self, db_session) -> bool:
        """Check if this account can be deleted (not the last account)"""
        return not self.is_last_account(db_session)
    
    def is_protected(self, db_session) -> bool:
        """Check if this account is protected from deletion (last account)"""
        return self.is_last_account(db_session)
