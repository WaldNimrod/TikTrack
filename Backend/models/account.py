"""
Account Model - Data Access Layer for Account Entity

This module defines the Account SQLAlchemy model, representing the accounts table
in the database. The model includes all account-related fields and relationships
with other entities in the system.

The Account model is part of the Data Access Layer in the new backend architecture,
providing the ORM interface for account data operations.

Author: TikTrack Development Team
Version: 1.0
Last Updated: 2025-01-16

🚨 CRITICAL REMINDERS:
- This is the MODEL LAYER - data structure only
- Never write business logic here - use services
- Never write API routes here - use blueprints
- Always follow: Models → Services → Routes → App architecture
"""

from sqlalchemy import Column, String, Float
from sqlalchemy.orm import relationship
from .base import BaseModel

class Account(BaseModel):
    """
    Account model representing a trading account in the system.
    
    An account represents a financial account used for trading activities.
    Each account can have multiple trades, trade plans, alerts, cash flows,
    and notes associated with it.
    
    Attributes:
        name (str): Account name/identifier (required)
        currency (str): Account currency code (default: 'USD')
        status (str): Account status - 'active' or 'inactive' (default: 'active')
        cash_balance (float): Current cash balance in the account
        total_value (float): Total account value (cash + positions)
        total_pl (float): Total profit/loss from all trades
        notes (str): Optional notes about the account
        
    Relationships:
        trades: One-to-many relationship with Trade model
        trade_plans: One-to-many relationship with TradePlan model
        alerts: One-to-many relationship with Alert model
        cash_flows: One-to-many relationship with CashFlow model
        notes_rel: One-to-many relationship with Note model
    """
    
    __tablename__ = "accounts"
    
    # Core account information
    name = Column(String(100), nullable=False, comment="Account name/identifier")
    currency = Column(String(3), default='USD', nullable=True, comment="Account currency code (ISO 4217)")
    status = Column(String(20), default='active', nullable=True, comment="Account status: active/inactive")
    
    # Financial data
    cash_balance = Column(Float, default=0, nullable=True, comment="Current cash balance in account")
    total_value = Column(Float, default=0, nullable=True, comment="Total account value (cash + positions)")
    total_pl = Column(Float, default=0, nullable=True, comment="Total profit/loss from all trades")
    
    # Additional information
    notes = Column(String(500), nullable=True, comment="Optional notes about the account")
    
    # Relationships with other entities
    # Each account can have multiple trades
    trades = relationship("Trade", back_populates="account", cascade="all, delete-orphan")
    
    # Each account can have multiple trade plans
    trade_plans = relationship("TradePlan", back_populates="account", cascade="all, delete-orphan")
    
    # Each account can have multiple alerts
    alerts = relationship("Alert", back_populates="account", cascade="all, delete-orphan")
    
    # Each account can have multiple cash flows
    cash_flows = relationship("CashFlow", back_populates="account", cascade="all, delete-orphan")
    
    # Each account can have multiple notes
    notes_rel = relationship("Note", back_populates="account", cascade="all, delete-orphan")
    
    def __repr__(self):
        """
        String representation of the Account object.
        
        Returns:
            str: Human-readable representation of the account
        """
        return f"<Account(name='{self.name}', currency='{self.currency}', status='{self.status}')>"
    
    def to_dict(self):
        """
        Convert Account object to dictionary for JSON serialization.
        
        Returns:
            dict: Dictionary representation of the account
        """
        result = {
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
        
        # Add updated_at if it exists
        if hasattr(self, 'updated_at'):
            result['updated_at'] = self.updated_at.isoformat() if self.updated_at else None
            
        return result
    
    def is_active(self):
        """
        Check if the account is active.
        
        Returns:
            bool: True if account status is 'active', False otherwise
        """
        return self.status == 'active'
    
    def get_balance_info(self):
        """
        Get formatted balance information for display.
        
        Returns:
            dict: Dictionary with formatted balance information
        """
        return {
            'cash_balance': f"{self.cash_balance:,.2f} {self.currency}" if self.cash_balance else "0.00",
            'total_value': f"{self.total_value:,.2f} {self.currency}" if self.total_value else "0.00",
            'total_pl': f"{self.total_pl:,.2f} {self.currency}" if self.total_pl else "0.00",
            'pl_percentage': f"{((self.total_pl / self.cash_balance) * 100):.2f}%" if self.cash_balance and self.cash_balance > 0 else "0.00%"
        }
