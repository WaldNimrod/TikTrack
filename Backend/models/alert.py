from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from .base import BaseModel
from typing import Dict, Any, Optional
import re

class Alert(BaseModel):
    __tablename__ = "alerts"
    
    # Fields that exist in the database
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False, index=True,
                    comment="User who owns this alert")
    ticker_id = Column(Integer, ForeignKey('tickers.id'), nullable=True)
    message = Column(String(5000), nullable=True)
    triggered_at = Column(DateTime, nullable=True)
    status = Column(String(20), default='open', nullable=True)
    is_triggered = Column(String(20), default='false', nullable=True)  # false, new, true
    related_type_id = Column(Integer, ForeignKey('note_relation_types.id'), nullable=False, default=4)
    related_id = Column(Integer, nullable=True)
    condition_attribute = Column(String(50), nullable=False, default='price')
    condition_operator = Column(String(50), nullable=False, default='more_than')
    condition_number = Column(String(20), nullable=False, default='0')
    
    # New condition linking fields
    plan_condition_id = Column(Integer, ForeignKey('plan_conditions.id'), nullable=True)
    trade_condition_id = Column(Integer, ForeignKey('trade_conditions.id'), nullable=True)
    
    # Expiry date field (DATE only, stored as VARCHAR(10) in YYYY-MM-DD format)
    expiry_date = Column(String(10), nullable=True)  # NULL = no expiration
    
    # Relationships
    # ticker = relationship("Ticker", back_populates="alerts")  # Removed - not in database
    plan_condition = relationship("PlanCondition", foreign_keys=[plan_condition_id], back_populates="alerts")
    trade_condition = relationship("TradeCondition", foreign_keys=[trade_condition_id], back_populates="alerts")
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Validate new condition fields if provided
        if any(key in kwargs for key in ['condition_attribute', 'condition_operator', 'condition_number']):
            self.validate_condition_fields()
    
    def validate_condition_fields(self) -> bool:
        """
        Validate the new condition fields format
        """
        # Validate condition_attribute
        valid_attributes = ['price', 'change', 'ma', 'volume', 'balance']
        if self.condition_attribute not in valid_attributes:
            raise ValueError(f"condition_attribute must be one of: {valid_attributes}")
        
        # Validate condition_operator
        valid_operators = [
            'more_than', 'less_than', 'cross', 'cross_up', 'cross_down',
            'change', 'change_up', 'change_down', 'equals'
        ]
        if self.condition_operator not in valid_operators:
            raise ValueError(f"condition_operator must be one of: {valid_operators}")
        
        # Validate condition_number
        try:
            float(self.condition_number)
        except ValueError:
            raise ValueError("condition_number must be a valid number")
        
        return True
    
    def get_condition_display_text(self) -> str:
        """
        Get formatted condition text for display
        Returns a Hebrew formatted string of the condition
        """
        # Attribute translations
        attribute_translations = {
            'price': 'מחיר',
            'change': 'שינוי',
            'ma': 'ממוצע',
            'volume': 'נפח',
            'balance': 'יתרה'
        }
        
        # Operator translations
        operator_translations = {
            'more_than': 'יותר מ',
            'less_than': 'פחות מ',
            'cross': 'חוצה',
            'cross_up': 'חוצה למעלה',
            'cross_down': 'חוצה למטה',
            'change': 'שינוי',
            'change_up': 'שינוי למעלה',
            'change_down': 'שינוי למטה',
            'equals': 'שווה'
        }
        
        attribute = attribute_translations.get(self.condition_attribute, self.condition_attribute)
        operator = operator_translations.get(self.condition_operator, self.condition_operator)
        number = self._format_condition_number(self.condition_number)
        
        return f"{attribute} {operator} {number}"
    
    def __repr__(self) -> str:
        return f"<Alert(id={self.id}, condition='{self.get_condition_display_text()}', triggered={self.is_triggered})>"
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary with backward compatibility"""
        # Create result dictionary manually to avoid accessing non-existent columns
        result: Dict[str, Any] = {
            'id': self.id,
            'message': self.message,
            'ticker_id': self.ticker_id,
            'triggered_at': self.triggered_at,
            'status': self.status,
            'is_triggered': self.is_triggered,
            'related_type_id': self.related_type_id,
            'related_id': self.related_id,
            'created_at': self.created_at,
            'condition_attribute': self.condition_attribute,
            'condition_operator': self.condition_operator,
            'condition_number': self.condition_number,
            'condition_display_text': self.get_condition_display_text(),
            'plan_condition_id': self.plan_condition_id,
            'trade_condition_id': self.trade_condition_id,
            'expiry_date': self.expiry_date  # Stored as YYYY-MM-DD string if present
        }
        
        # Determine related_type based on related_type_id
        if self.related_type_id == 1:
            result['related_type'] = 'trading_account'
        elif self.related_type_id == 2:
            result['related_type'] = 'trade'
        elif self.related_type_id == 3:
            result['related_type'] = 'trade_plan'
        else:
            result['related_type'] = None
        
        # Create legacy condition string from new fields for backward compatibility
        result['condition'] = f"{self.condition_attribute} | {self.condition_operator} | {self.condition_number}"
        
        # Add fields for backward compatibility
        if self.related_type_id == 1:  # trading_account
            result['trade_id'] = None
            result['trade_plan_id'] = None
        elif self.related_type_id == 2:  # trade
            result['trade_id'] = self.related_id
            result['trade_plan_id'] = None
        elif self.related_type_id == 3:  # trade_plan
            result['trade_id'] = None
            result['trade_plan_id'] = self.related_id
        
        return result

    @staticmethod
    def _format_condition_number(value: Optional[str]) -> str:
        if value is None:
            return '-'
        try:
            numeric = float(value)
            if numeric.is_integer():
                return f"{int(numeric):,}"
            formatted = f"{numeric:,.2f}"
            return formatted.rstrip('0').rstrip('.')
        except (ValueError, TypeError):
            return str(value)
