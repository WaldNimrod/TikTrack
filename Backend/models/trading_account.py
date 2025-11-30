"""
TradingAccount Model - Data Access Layer for Trading Account Entity

This module defines the TradingAccount SQLAlchemy model, representing the trading_accounts table
in the database. The model includes all trading account-related fields and relationships
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

from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey, event
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .base import BaseModel
from typing import Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)

class TradingAccount(BaseModel):
    """
    TradingAccount model representing a trading account in the system.
    
    This model matches the actual database table structure exactly as defined
    in the backend architecture documentation.
    """
    
    __tablename__ = "trading_accounts"
    __table_args__ = {'extend_existing': True}
    
    # Database columns - matching actual database schema
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False, index=True,
                    comment="User who owns this trading account")
    name = Column(String(100), nullable=False)
    currency_id = Column(Integer, ForeignKey('currencies.id'), nullable=False)  # Foreign key to currencies table
    status = Column(String(20), default='open')
    cash_balance = Column(Float, default=0)  # Exists in DB - deprecated, use /api/account-activity/<account_id>/balances for real-time calculation
    opening_balance = Column(Float, default=0.0, nullable=True)  # Opening balance in base currency
    total_value = Column(Float, default=0)
    total_pl = Column(Float, default=0)  # Not updated - shows "בפיתוח" in UI
    notes = Column(String(5000))
    
    # Relationships with other entities
    # Currency relationship
    currency = relationship("Currency", back_populates="trading_accounts")
    
    # Each account can have multiple trades
    trades = relationship("Trade", back_populates="account", cascade="all, delete-orphan")
    
    # Each account can have multiple trade plans
    trade_plans = relationship("TradePlan", back_populates="account", cascade="all, delete-orphan")
    
    # Each account can have multiple alerts (through related_type_id and related_id)
    # alerts = relationship("Alert", back_populates="account", cascade="all, delete-orphan")
    
    # Each account can have multiple cash flows
    cash_flows = relationship("CashFlow", back_populates="account", cascade="all, delete-orphan")
    
    # Each account can have multiple import sessions
    import_sessions = relationship("ImportSession", back_populates="trading_account", cascade="all, delete-orphan")
    
    # Notes relationship removed - notes now use related_type and related_id
    
    def __repr__(self) -> str:
        """String representation of the TradingAccount object."""
        currency_symbol = self.currency.symbol if self.currency else 'USD'
        return f"<TradingAccount(name='{self.name}', currency_id='{self.currency_id}', status='{self.status}')>"
    
    def to_dict(self) -> Dict[str, Any]:
        """
        Convert TradingAccount object to dictionary for JSON serialization.
        
        Returns:
            dict: Dictionary representation of the account
        """
        return {
            'id': self.id,
            'name': self.name,
            'currency_id': self.currency_id,
            'currency_symbol': self.currency.symbol if self.currency else None,
            'currency_name': self.currency.name if self.currency else None,
            'status': self.status,
            # cash_balance removed - use /api/account-activity/<account_id>/balances for real-time calculation
            'opening_balance': self.opening_balance if self.opening_balance is not None else 0.0,
            'total_value': self.total_value,
            'total_pl': self.total_pl,  # Not updated - shows "בפיתוח" in UI
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
    
    def is_active(self) -> bool:
        """
        Check if the account is active.
        
        Note: All status values are now in English:
        - 'open': TradingAccount is active and operational
        - 'closed': TradingAccount is closed but can be reopened
        - 'cancelled': TradingAccount is permanently cancelled
        """
        return self.status == 'open'
    
    def get_balance_info(self) -> Dict[str, str]:
        """Get formatted balance information for display."""
        currency_symbol = self.currency.symbol if self.currency else 'USD'
        return {
            'balance': f"{self.cash_balance:,.2f} {currency_symbol}" if self.cash_balance else "0.00",
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


# ========================================
# SQLAlchemy Event Listeners for Tag Links Cleanup
# ========================================

@event.listens_for(TradingAccount, 'after_delete')
def trading_account_deleted(mapper, connection, target):
    """
    Event listener for when a trading account is deleted.
    Automatically removes all associated tag links.
    """
    try:
        from services.tag_service import TagService
        from sqlalchemy.orm import Session
        
        session = Session(bind=connection)
        TagService.remove_all_tags_for_entity(
            session, 'trading_account', target.id
        )
        session.close()
    except Exception as e:
        logger.error(f"Error cleaning up tags for trading_account {target.id}: {e}")
        # Don't raise - allow deletion to proceed even if tag cleanup fails
