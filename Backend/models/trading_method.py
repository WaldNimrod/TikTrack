"""
Trading Method Model
Model for trading methods catalog with parameters
"""

from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .base import BaseModel
from typing import Dict, Any, List

class TradingMethod(BaseModel):
    """Trading method catalog with parameters"""
    __tablename__ = "trading_methods"
    
    # Basic information
    name_en = Column(String(100), nullable=False, unique=True)
    name_he = Column(String(100), nullable=False, unique=True)
    category = Column(String(50), nullable=False)
    description_en = Column(Text, nullable=True)
    description_he = Column(Text, nullable=True)
    
    # UI properties
    icon_class = Column(String(50), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    sort_order = Column(Integer, default=0, nullable=False)
    
    # Timestamps
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    parameters = relationship("MethodParameter", back_populates="method", cascade="all, delete-orphan")
    plan_conditions = relationship("PlanCondition", back_populates="method")
    trade_conditions = relationship("TradeCondition", back_populates="method")
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary with relationships"""
        result = {
            'id': self.id,
            'name_en': self.name_en,
            'name_he': self.name_he,
            'category': self.category,
            'description_en': self.description_en,
            'description_he': self.description_he,
            'icon_class': self.icon_class,
            'is_active': self.is_active,
            'sort_order': self.sort_order,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S') if self.created_at else None,
            'updated_at': self.updated_at.strftime('%Y-%m-%d %H:%M:%S') if self.updated_at else None
        }
        
        # Add parameters if loaded
        if hasattr(self, 'parameters') and self.parameters:
            result['parameters'] = [param.to_dict() for param in self.parameters]
        
        return result
    
    def get_display_name(self, language: str = 'he') -> str:
        """Get display name in specified language"""
        return self.name_he if language == 'he' else self.name_en
    
    def get_description(self, language: str = 'he') -> str:
        """Get description in specified language"""
        return self.description_he if language == 'he' else self.description_en
    
    def __repr__(self) -> str:
        return f"<TradingMethod(id={self.id}, name_en='{self.name_en}', category='{self.category}')>"


class MethodParameter(BaseModel):
    """Parameters for trading methods"""
    __tablename__ = "method_parameters"
    
    # Foreign key
    method_id = Column(Integer, ForeignKey('trading_methods.id'), nullable=False)
    
    # Parameter definition
    parameter_key = Column(String(50), nullable=False)
    parameter_name_en = Column(String(100), nullable=False)
    parameter_name_he = Column(String(100), nullable=False)
    parameter_type = Column(String(20), nullable=False)  # number, price, percentage, period, boolean, dropdown, date
    
    # Default values and constraints
    default_value = Column(String(100), nullable=True)
    min_value = Column(String(50), nullable=True)  # Can be number or date
    max_value = Column(String(50), nullable=True)  # Can be number or date
    validation_rule = Column(Text, nullable=True)
    
    # UI properties
    is_required = Column(Boolean, default=True, nullable=False)
    sort_order = Column(Integer, default=0, nullable=False)
    help_text_en = Column(Text, nullable=True)
    help_text_he = Column(Text, nullable=True)
    
    # Timestamps
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    method = relationship("TradingMethod", back_populates="parameters")
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            'id': self.id,
            'method_id': self.method_id,
            'parameter_key': self.parameter_key,
            'parameter_name_en': self.parameter_name_en,
            'parameter_name_he': self.parameter_name_he,
            'parameter_type': self.parameter_type,
            'default_value': self.default_value,
            'min_value': self.min_value,
            'max_value': self.max_value,
            'validation_rule': self.validation_rule,
            'is_required': self.is_required,
            'sort_order': self.sort_order,
            'help_text_en': self.help_text_en,
            'help_text_he': self.help_text_he,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S') if self.created_at else None,
            'updated_at': self.updated_at.strftime('%Y-%m-%d %H:%M:%S') if self.updated_at else None
        }
    
    def get_display_name(self, language: str = 'he') -> str:
        """Get display name in specified language"""
        return self.parameter_name_he if language == 'he' else self.parameter_name_en
    
    def get_help_text(self, language: str = 'he') -> str:
        """Get help text in specified language"""
        return self.help_text_he if language == 'he' else self.help_text_en
    
    def validate_value(self, value: Any) -> tuple[bool, str]:
        """Validate parameter value"""
        if self.is_required and (value is None or value == ''):
            return False, f"{self.parameter_name_en} is required"
        
        if value is None or value == '':
            return True, ""  # Optional field, empty is OK
        
        # Type-specific validation
        if self.parameter_type == 'number':
            try:
                num_value = float(value)
                if self.min_value and num_value < float(self.min_value):
                    return False, f"Value must be >= {self.min_value}"
                if self.max_value and num_value > float(self.max_value):
                    return False, f"Value must be <= {self.max_value}"
            except ValueError:
                return False, "Invalid number format"
        
        elif self.parameter_type == 'period':
            try:
                period_value = int(value)
                if period_value <= 0:
                    return False, "Period must be positive"
                if self.min_value and period_value < int(self.min_value):
                    return False, f"Period must be >= {self.min_value}"
                if self.max_value and period_value > int(self.max_value):
                    return False, f"Period must be <= {self.max_value}"
            except ValueError:
                return False, "Invalid period format"
        
        elif self.parameter_type == 'boolean':
            if value not in ['true', 'false', True, False, '1', '0', 1, 0]:
                return False, "Invalid boolean value"
        
        # Add more type validations as needed
        
        return True, ""
    
    def __repr__(self) -> str:
        return f"<MethodParameter(id={self.id}, key='{self.parameter_key}', type='{self.parameter_type}')>"
