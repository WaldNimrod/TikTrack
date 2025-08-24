from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from .base import BaseModel
from typing import Dict, Any, Optional
import re

class Alert(BaseModel):
    __tablename__ = "alerts"
    
    type = Column(String(50), nullable=False, default='price')  # Default per constraints
    status = Column(String(20), default='open', nullable=True)
    condition = Column(String(500), nullable=False)
    message = Column(String(500), nullable=True)
    triggered_at = Column(DateTime, nullable=True)
    is_triggered = Column(String(20), default='false', nullable=True)  # false, new, true
    related_type_id = Column(Integer, ForeignKey('note_relation_types.id'), nullable=False, default=4)  # Default ticker per constraints
    related_id = Column(Integer, nullable=False)
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        if 'condition' in kwargs:
            self.validate_condition(kwargs['condition'])
    
    def validate_condition(self, condition: str) -> bool:
        """
        Validate condition format: [string1]&" | "&[string2]&" |"&[Number]
        
        string1: price, change, ma, volume
        string2: lessThen, moreThen, cross, crossUp, crossDown, upBy, downBy, changeBy, upByPre, downByPre, changeByPre
        """
        if not condition:
            raise ValueError("Condition cannot be empty")
        
        # Split by " | " to get the three parts
        parts = condition.split(" | ")
        if len(parts) != 3:
            raise ValueError("Condition must have exactly 3 parts separated by ' | '")
        
        string1, string2, number_str = parts
        
        # Validate string1
        valid_string1 = ['price', 'change', 'ma', 'volume']
        if string1 not in valid_string1:
            raise ValueError(f"string1 must be one of: {valid_string1}")
        
        # Validate string2
        valid_string2 = [
            'lessThen', 'moreThen', 'cross', 'crossUp', 'crossDown',
            'upBy', 'downBy', 'changeBy', 'upByPre', 'downByPre', 'changeByPre'
        ]
        if string2 not in valid_string2:
            raise ValueError(f"string2 must be one of: {valid_string2}")
        
        # Validate number
        try:
            float(number_str)
        except ValueError:
            raise ValueError("Third part must be a valid number")
        
        return True
    
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
