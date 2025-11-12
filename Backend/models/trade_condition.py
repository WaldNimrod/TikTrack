"""
Trade Condition Model
Model for conditions attached to trades
"""

from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .base import BaseModel
from typing import Dict, Any, Optional
import json

class TradeCondition(BaseModel):
    """Conditions for trades"""
    __tablename__ = "trade_conditions"
    
    # Foreign keys
    trade_id = Column(Integer, ForeignKey('trades.id'), nullable=False)
    method_id = Column(Integer, ForeignKey('trading_methods.id'), nullable=False)
    inherited_from_plan_condition_id = Column(Integer, ForeignKey('plan_conditions.id'), nullable=True)
    
    # Condition definition
    condition_group = Column(Integer, default=0, nullable=False)  # For grouping AND/OR logic
    parameters_json = Column(Text, nullable=False)  # JSON string of parameter values
    logical_operator = Column(String(10), default='NONE', nullable=False)  # AND, OR, NONE
    
    # Status
    is_active = Column(Boolean, default=True, nullable=False)
    auto_generate_alerts = Column(Boolean, default=True, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    trade = relationship("Trade", back_populates="conditions")
    method = relationship("TradingMethod", back_populates="trade_conditions")
    inherited_from_plan_condition = relationship("PlanCondition", back_populates="inherited_trade_conditions")
    alerts = relationship("Alert", back_populates="trade_condition")
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Validate parameters_json if provided
        if 'parameters_json' in kwargs and kwargs['parameters_json']:
            self.validate_parameters_json()
    
    def validate_parameters_json(self) -> bool:
        """
        Validate that parameters_json is valid JSON
        """
        try:
            if isinstance(self.parameters_json, str):
                json.loads(self.parameters_json)
            elif isinstance(self.parameters_json, dict):
                json.dumps(self.parameters_json)
            return True
        except (json.JSONDecodeError, TypeError):
            raise ValueError("parameters_json must be valid JSON")
    
    def get_parameters(self) -> Dict[str, Any]:
        """
        Get parameters as dictionary
        """
        if not self.parameters_json:
            return {}
        
        try:
            if isinstance(self.parameters_json, str):
                return json.loads(self.parameters_json)
            elif isinstance(self.parameters_json, dict):
                return self.parameters_json
            else:
                return {}
        except (json.JSONDecodeError, TypeError):
            return {}
    
    def set_parameters(self, parameters: Dict[str, Any]) -> None:
        """
        Set parameters from dictionary
        """
        if not isinstance(parameters, dict):
            raise ValueError("parameters must be a dictionary")
        
        self.parameters_json = json.dumps(parameters)
        self.validate_parameters_json()
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        result = {
            'id': self.id,
            'trade_id': self.trade_id,
            'method_id': self.method_id,
            'inherited_from_plan_condition_id': self.inherited_from_plan_condition_id,
            'condition_group': self.condition_group,
            'parameters': self.get_parameters(),
            'logical_operator': self.logical_operator,
            'is_active': self.is_active,
            'auto_generate_alerts': self.auto_generate_alerts,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
        
        # Add method information if available
        if self.method:
            result['method'] = {
                'id': self.method.id,
                'name_en': self.method.name_en,
                'name_he': self.method.name_he,
                'category': self.method.category
            }
        
        # Add inherited condition information if available
        if self.inherited_from_plan_condition:
            result['inherited_from_plan_condition'] = {
                'id': self.inherited_from_plan_condition.id,
                'trade_plan_id': self.inherited_from_plan_condition.trade_plan_id
            }
        
        return result
    
    def __repr__(self):
        return f"<TradeCondition(id={self.id}, trade_id={self.trade_id}, method_id={self.method_id})>"




























