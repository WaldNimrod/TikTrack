from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from .base import BaseModel
from typing import Dict, Any, Optional
import re

class Alert(BaseModel):
    __tablename__ = "alerts"
    
    type = Column(String(50), nullable=False, default='price')  # Default per constraints
    status = Column(String(20), default='open', nullable=True)
    condition = Column(String(500), nullable=True)  # Legacy field - will be removed
    condition_attribute = Column(String(50), nullable=False, default='price')
    condition_operator = Column(String(50), nullable=False, default='more_than')
    condition_number = Column(String(20), nullable=False, default='0')
    message = Column(String(500), nullable=True)
    triggered_at = Column(DateTime, nullable=True)
    is_triggered = Column(String(20), default='false', nullable=True)  # false, new, true
    related_type_id = Column(Integer, ForeignKey('note_relation_types.id'), nullable=False, default=4)  # Default ticker per constraints
    related_id = Column(Integer, nullable=False)
    
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
        valid_attributes = ['price', 'change', 'ma', 'volume']
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
            'volume': 'נפח'
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
        number = self.condition_number
        
        return f"{attribute} {operator} {number}"
    
    def __repr__(self) -> str:
        return f"<Alert(id={self.id}, type='{self.type}', active={self.is_active})>"
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary with backward compatibility"""
        result: Dict[str, Any] = super().to_dict()
        
        # Determine related_type based on related_type_id
        if self.related_type_id == 1:
            result['related_type'] = 'account'
        elif self.related_type_id == 2:
            result['related_type'] = 'trade'
        elif self.related_type_id == 3:
            result['related_type'] = 'trade_plan'
        else:
            result['related_type'] = None
        
        result['related_id'] = self.related_id
        
        # Add new condition fields
        result['condition_attribute'] = self.condition_attribute
        result['condition_operator'] = self.condition_operator
        result['condition_number'] = self.condition_number
        result['condition_display_text'] = self.get_condition_display_text()
        
        # Add legacy condition field for backward compatibility
        if self.condition:
            result['condition'] = self.condition
        else:
            # Create legacy condition string from new fields
            result['condition'] = f"{self.condition_attribute} | {self.condition_operator} | {self.condition_number}"
        
        # Add fields for backward compatibility
        if self.related_type_id == 1:  # account
            result['account_id'] = self.related_id
            result['trade_id'] = None
            result['trade_plan_id'] = None
        elif self.related_type_id == 2:  # trade
            result['account_id'] = None
            result['trade_id'] = self.related_id
            result['trade_plan_id'] = None
        elif self.related_type_id == 3:  # trade_plan
            result['account_id'] = None
            result['trade_id'] = None
            result['trade_plan_id'] = self.related_id
        
        return result
