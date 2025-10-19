"""
Plan Condition Model
Model for conditions attached to trade plans
"""

from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .base import BaseModel
from typing import Dict, Any, Optional
import json

class PlanCondition(BaseModel):
    """Conditions for trade plans"""
    __tablename__ = "plan_conditions"
    
    # Foreign keys
    trade_plan_id = Column(Integer, ForeignKey('trade_plans.id'), nullable=False)
    method_id = Column(Integer, ForeignKey('trading_methods.id'), nullable=False)
    
    # Condition definition
    condition_group = Column(Integer, default=0, nullable=False)  # For grouping AND/OR logic
    parameters_json = Column(Text, nullable=False)  # JSON string of parameter values
    logical_operator = Column(String(10), default='NONE', nullable=False)  # AND, OR, NONE
    
    # Status
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Timestamps
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    trade_plan = relationship("TradePlan", back_populates="conditions")
    method = relationship("TradingMethod", back_populates="plan_conditions")
    inherited_trade_conditions = relationship("TradeCondition", back_populates="inherited_from_plan_condition")
    # alert_mappings relationship removed - will be handled via queries
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary with relationships"""
        result = {
            'id': self.id,
            'trade_plan_id': self.trade_plan_id,
            'method_id': self.method_id,
            'condition_group': self.condition_group,
            'parameters_json': self.parameters_json,
            'logical_operator': self.logical_operator,
            'is_active': self.is_active,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S') if self.created_at else None,
            'updated_at': self.updated_at.strftime('%Y-%m-%d %H:%M:%S') if self.updated_at else None
        }
        
        # Add parsed parameters
        try:
            if isinstance(self.parameters_json, str):
                result['parameters'] = json.loads(self.parameters_json) if self.parameters_json else {}
            else:
                # If it's already a dict, use it directly
                result['parameters'] = self.parameters_json if self.parameters_json else {}
        except json.JSONDecodeError:
            result['parameters'] = {}
        
        # Add method information if loaded
        if hasattr(self, 'method') and self.method:
            result['method'] = self.method.to_dict()
        
        # Add trade plan information if loaded
        if hasattr(self, 'trade_plan') and self.trade_plan:
            result['trade_plan'] = {
                'id': self.trade_plan.id,
                'name': getattr(self.trade_plan, 'name', f'Plan {self.trade_plan.id}')
            }
        
        return result
    
    def get_parameters(self) -> Dict[str, Any]:
        """Get parsed parameters as dictionary"""
        try:
            if isinstance(self.parameters_json, str):
                return json.loads(self.parameters_json) if self.parameters_json else {}
            else:
                # If it's already a dict, use it directly
                return self.parameters_json if self.parameters_json else {}
        except json.JSONDecodeError:
            return {}
    
    def set_parameters(self, parameters: Dict[str, Any]) -> None:
        """Set parameters from dictionary"""
        self.parameters_json = json.dumps(parameters, ensure_ascii=False)
    
    def get_condition_display_text(self, language: str = 'he') -> str:
        """Get human-readable condition description"""
        if not hasattr(self, 'method') or not self.method:
            return f"Condition {self.id}"
        
        method_name = self.method.get_display_name(language)
        parameters = self.get_parameters()
        
        # Build description based on method type and parameters
        if self.method.category == 'technical_indicators':
            if 'ma_period' in parameters:
                return f"{method_name} ({parameters.get('ma_period', 'N/A')})"
            elif 'rsi_period' in parameters:
                return f"{method_name} ({parameters.get('rsi_period', 'N/A')})"
        
        elif self.method.category == 'support_resistance':
            if 'level_price' in parameters:
                return f"{method_name} @ {parameters.get('level_price', 'N/A')}"
        
        # Default fallback
        return f"{method_name} {self.logical_operator}"
    
    def validate_parameters(self) -> tuple[bool, str]:
        """Validate parameters against method definition"""
        if not hasattr(self, 'method') or not self.method:
            return False, "Method not loaded"
        
        parameters = self.get_parameters()
        
        # Check required parameters
        for param in self.method.parameters:
            if param.is_required and param.parameter_key not in parameters:
                return False, f"Required parameter {param.parameter_key} is missing"
        
        # Validate parameter values
        for param in self.method.parameters:
            if param.parameter_key in parameters:
                is_valid, error_msg = param.validate_value(parameters[param.parameter_key])
                if not is_valid:
                    return False, f"Parameter {param.parameter_key}: {error_msg}"
        
        return True, ""
    
    def __repr__(self) -> str:
        return f"<PlanCondition(id={self.id}, trade_plan_id={self.trade_plan_id}, method_id={self.method_id})>"


class TradeCondition(BaseModel):
    """Conditions for trades (inherited from plans or custom)"""
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
    
    # Timestamps
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    trade = relationship("Trade", back_populates="conditions")
    method = relationship("TradingMethod", back_populates="trade_conditions")
    inherited_from_plan_condition = relationship("PlanCondition", back_populates="inherited_trade_conditions")
    # alert_mappings relationship removed - will be handled via queries
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary with relationships"""
        result = {
            'id': self.id,
            'trade_id': self.trade_id,
            'method_id': self.method_id,
            'inherited_from_plan_condition_id': self.inherited_from_plan_condition_id,
            'condition_group': self.condition_group,
            'parameters_json': self.parameters_json,
            'logical_operator': self.logical_operator,
            'is_active': self.is_active,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S') if self.created_at else None,
            'updated_at': self.updated_at.strftime('%Y-%m-%d %H:%M:%S') if self.updated_at else None
        }
        
        # Add parsed parameters
        try:
            if isinstance(self.parameters_json, str):
                result['parameters'] = json.loads(self.parameters_json) if self.parameters_json else {}
            else:
                # If it's already a dict, use it directly
                result['parameters'] = self.parameters_json if self.parameters_json else {}
        except json.JSONDecodeError:
            result['parameters'] = {}
        
        # Add method information if loaded
        if hasattr(self, 'method') and self.method:
            result['method'] = self.method.to_dict()
        
        # Add trade information if loaded
        if hasattr(self, 'trade') and self.trade:
            result['trade'] = {
                'id': self.trade.id,
                'status': self.trade.status
            }
        
        # Add inheritance information
        result['is_inherited'] = self.inherited_from_plan_condition_id is not None
        
        return result
    
    def get_parameters(self) -> Dict[str, Any]:
        """Get parsed parameters as dictionary"""
        try:
            if isinstance(self.parameters_json, str):
                return json.loads(self.parameters_json) if self.parameters_json else {}
            else:
                # If it's already a dict, use it directly
                return self.parameters_json if self.parameters_json else {}
        except json.JSONDecodeError:
            return {}
    
    def set_parameters(self, parameters: Dict[str, Any]) -> None:
        """Set parameters from dictionary"""
        self.parameters_json = json.dumps(parameters, ensure_ascii=False)
    
    def get_condition_display_text(self, language: str = 'he') -> str:
        """Get human-readable condition description"""
        if not hasattr(self, 'method') or not self.method:
            return f"Condition {self.id}"
        
        method_name = self.method.get_display_name(language)
        parameters = self.get_parameters()
        
        # Build description based on method type and parameters
        if self.method.category == 'technical_indicators':
            if 'ma_period' in parameters:
                return f"{method_name} ({parameters.get('ma_period', 'N/A')})"
            elif 'rsi_period' in parameters:
                return f"{method_name} ({parameters.get('rsi_period', 'N/A')})"
        
        elif self.method.category == 'support_resistance':
            if 'level_price' in parameters:
                return f"{method_name} @ {parameters.get('level_price', 'N/A')}"
        
        # Add inheritance indicator
        inheritance_text = " (inherited)" if self.inherited_from_plan_condition_id else " (custom)"
        return f"{method_name} {self.logical_operator}{inheritance_text}"
    
    def validate_parameters(self) -> tuple[bool, str]:
        """Validate parameters against method definition"""
        if not hasattr(self, 'method') or not self.method:
            return False, "Method not loaded"
        
        parameters = self.get_parameters()
        
        # Check required parameters
        for param in self.method.parameters:
            if param.is_required and param.parameter_key not in parameters:
                return False, f"Required parameter {param.parameter_key} is missing"
        
        # Validate parameter values
        for param in self.method.parameters:
            if param.parameter_key in parameters:
                is_valid, error_msg = param.validate_value(parameters[param.parameter_key])
                if not is_valid:
                    return False, f"Parameter {param.parameter_key}: {error_msg}"
        
        return True, ""
    
    def __repr__(self) -> str:
        return f"<TradeCondition(id={self.id}, trade_id={self.trade_id}, method_id={self.method_id})>"


class ConditionAlertMapping(BaseModel):
    """Mapping between conditions and alerts"""
    __tablename__ = "condition_alerts_mapping"
    
    # Foreign keys
    condition_id = Column(Integer, nullable=False)  # Can be plan or trade condition ID
    condition_type = Column(String(10), nullable=False)  # 'plan' or 'trade'
    alert_id = Column(Integer, ForeignKey('alerts.id'), nullable=False)
    
    # Properties
    auto_created = Column(Boolean, default=False, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Relationships
    alert = relationship("Alert")
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        result = {
            'id': self.id,
            'condition_id': self.condition_id,
            'condition_type': self.condition_type,
            'alert_id': self.alert_id,
            'auto_created': self.auto_created,
            'is_active': self.is_active,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S') if self.created_at else None
        }
        
        # Add alert information if loaded
        if hasattr(self, 'alert') and self.alert:
            result['alert'] = self.alert.to_dict()
        
        return result
    
    def __repr__(self) -> str:
        return f"<ConditionAlertMapping(id={self.id}, condition_type='{self.condition_type}', alert_id={self.alert_id})>"
