"""
Conditions Validation Service
Service for validating conditions system data
"""

import json
import logging
from typing import Dict, Tuple, Any, List
from sqlalchemy.orm import Session
from models.trading_method import TradingMethod, MethodParameter
from models.plan_condition import PlanCondition, TradeCondition
from services.constraint_service import ConstraintService
from services.validation_service import ValidationService

logger = logging.getLogger(__name__)

class ConditionsValidationService:
    """Validation service for conditions system"""
    
    def __init__(self, db_session: Session = None):
        self.db_session = db_session
        self.constraint_service = ConstraintService()
        self.validation_service = ValidationService()
    
    def validate_trading_method(self, data: Dict[str, Any]) -> Tuple[bool, Dict[str, Any]]:
        """Validate trading method data"""
        errors = {}
        
        # Required fields validation
        required_fields = ['name_en', 'name_he', 'category']
        for field in required_fields:
            if field not in data or not data[field]:
                errors[field] = f"{field} is required"
        
        # Validate against constraints
        for field in ['name_en', 'name_he', 'category']:
            if field in data and data[field]:
                is_valid, msg = self.constraint_service.validate_field_value(
                    'trading_methods', field, data[field]
                )
                if not is_valid:
                    errors[field] = msg
        
        # Business logic validation
        if 'name_en' in data and data['name_en']:
            if len(data['name_en']) < 3:
                errors['name_en'] = "English name must be at least 3 characters"
        
        if 'name_he' in data and data['name_he']:
            if len(data['name_he']) < 2:
                errors['name_he'] = "Hebrew name must be at least 2 characters"
        
        if 'category' in data and data['category']:
            valid_categories = ['technical_indicators', 'price_patterns', 'support_resistance', 
                              'trend_analysis', 'volume_analysis', 'fibonacci']
            if data['category'] not in valid_categories:
                errors['category'] = f"Invalid category. Must be one of: {', '.join(valid_categories)}"
        
        # Check for duplicate names (if updating, exclude current record)
        if self.db_session:
            method_id = data.get('id')
            if 'name_en' in data and data['name_en']:
                query = self.db_session.query(TradingMethod).filter(
                    TradingMethod.name_en == data['name_en']
                )
                if method_id:
                    query = query.filter(TradingMethod.id != method_id)
                if query.first():
                    errors['name_en'] = "English name already exists"
            
            if 'name_he' in data and data['name_he']:
                query = self.db_session.query(TradingMethod).filter(
                    TradingMethod.name_he == data['name_he']
                )
                if method_id:
                    query = query.filter(TradingMethod.id != method_id)
                if query.first():
                    errors['name_he'] = "Hebrew name already exists"
        
        if errors:
            return False, {
                'status': 'error',
                'errors': {
                    'general': 'Validation failed',
                    'fields': errors
                }
            }
        
        return True, {'status': 'success'}
    
    def validate_method_parameter(self, data: Dict[str, Any]) -> Tuple[bool, Dict[str, Any]]:
        """Validate method parameter data"""
        errors = {}
        
        # Required fields validation
        required_fields = ['method_id', 'parameter_key', 'parameter_name_en', 'parameter_name_he', 'parameter_type']
        for field in required_fields:
            if field not in data or not data[field]:
                errors[field] = f"{field} is required"
        
        # Validate against constraints
        for field in ['parameter_key', 'parameter_type']:
            if field in data and data[field]:
                is_valid, msg = self.constraint_service.validate_field_value(
                    'method_parameters', field, data[field]
                )
                if not is_valid:
                    errors[field] = msg
        
        # Business logic validation
        if 'parameter_key' in data and data['parameter_key']:
            import re
            if not re.match(r'^[a-z0-9_]+$', data['parameter_key']):
                errors['parameter_key'] = "Parameter key must contain only lowercase letters, numbers, and underscores"
        
        if 'parameter_type' in data and data['parameter_type']:
            valid_types = ['number', 'price', 'percentage', 'period', 'boolean', 'dropdown', 'date']
            if data['parameter_type'] not in valid_types:
                errors['parameter_type'] = f"Invalid parameter type. Must be one of: {', '.join(valid_types)}"
        
        # Validate method_id exists
        if 'method_id' in data and data['method_id'] and self.db_session:
            method = self.db_session.query(TradingMethod).filter(
                TradingMethod.id == data['method_id']
            ).first()
            if not method:
                errors['method_id'] = "Trading method not found"
        
        # Check for duplicate parameter_key within method
        if 'method_id' in data and 'parameter_key' in data and self.db_session:
            param_id = data.get('id')
            query = self.db_session.query(MethodParameter).filter(
                MethodParameter.method_id == data['method_id'],
                MethodParameter.parameter_key == data['parameter_key']
            )
            if param_id:
                query = query.filter(MethodParameter.id != param_id)
            if query.first():
                errors['parameter_key'] = "Parameter key already exists for this method"
        
        if errors:
            return False, {
                'status': 'error',
                'errors': {
                    'general': 'Validation failed',
                    'fields': errors
                }
            }
        
        return True, {'status': 'success'}
    
    def validate_condition_data(self, data: Dict[str, Any], condition_type: str) -> Tuple[bool, Dict[str, Any]]:
        """Validate plan or trade condition data"""
        errors = {}
        table_name = 'plan_conditions' if condition_type == 'plan' else 'trade_conditions'
        
        # Required fields validation
        required_fields = ['method_id', 'parameters_json']
        if condition_type == 'plan':
            required_fields.append('trade_plan_id')
        else:
            required_fields.append('trade_id')
        
        for field in required_fields:
            if field not in data or not data[field]:
                errors[field] = f"{field} is required"
        
        # Validate JSON format
        if 'parameters_json' in data and data['parameters_json']:
            try:
                if isinstance(data['parameters_json'], str):
                    json.loads(data['parameters_json'])
                elif isinstance(data['parameters_json'], dict):
                    # If it's already a dict, validate it's serializable
                    json.dumps(data['parameters_json'])
                else:
                    errors['parameters_json'] = "parameters_json must be a string or dictionary"
            except (json.JSONDecodeError, TypeError):
                errors['parameters_json'] = "Invalid JSON format"
        
        # Validate against constraints
        for field, value in data.items():
            # Skip parameters_json - it's validated separately above
            if field == 'parameters_json':
                continue
            if value is not None:
                is_valid, msg = self.constraint_service.validate_field_value(
                    table_name, field, value
                )
                if not is_valid:
                    errors[field] = msg
        
        # Business logic validation
        if 'logical_operator' in data and data['logical_operator']:
            valid_operators = ['AND', 'OR', 'NONE']
            if data['logical_operator'] not in valid_operators:
                errors['logical_operator'] = f"Invalid logical operator. Must be one of: {', '.join(valid_operators)}"
        
        if 'condition_group' in data and data['condition_group'] is not None:
            if data['condition_group'] < 0:
                errors['condition_group'] = "Condition group must be non-negative"
        
        # Validate method_id exists
        if 'method_id' in data and data['method_id'] and self.db_session:
            method = self.db_session.query(TradingMethod).filter(
                TradingMethod.id == data['method_id']
            ).first()
            if not method:
                errors['method_id'] = "Trading method not found"
            else:
                # Validate parameters against method definition
                if 'parameters_json' in data and data['parameters_json']:
                    try:
                        if isinstance(data['parameters_json'], str):
                            parameters = json.loads(data['parameters_json'])
                        else:
                            parameters = data['parameters_json']
                        param_errors = self._validate_parameters_against_method(method, parameters)
                        if param_errors:
                            errors['parameters_json'] = param_errors
                    except (json.JSONDecodeError, TypeError):
                        pass  # Already handled above
        
        # Validate entity ID exists
        if condition_type == 'plan' and 'trade_plan_id' in data and data['trade_plan_id'] and self.db_session:
            from models.trade_plan import TradePlan
            plan = self.db_session.query(TradePlan).filter(
                TradePlan.id == data['trade_plan_id']
            ).first()
            if not plan:
                errors['trade_plan_id'] = "Trade plan not found"
        
        elif condition_type == 'trade' and 'trade_id' in data and data['trade_id'] and self.db_session:
            from models.trade import Trade
            trade = self.db_session.query(Trade).filter(
                Trade.id == data['trade_id']
            ).first()
            if not trade:
                errors['trade_id'] = "Trade not found"
        
        if errors:
            return False, {
                'status': 'error',
                'errors': {
                    'general': 'Validation failed',
                    'fields': errors
                }
            }
        
        return True, {'status': 'success'}
    
    def _validate_parameters_against_method(self, method: TradingMethod, parameters: Dict[str, Any]) -> str:
        """Validate parameters against method definition"""
        errors = []
        
        # Check required parameters
        for param in method.parameters:
            if param.is_required and param.parameter_key not in parameters:
                errors.append(f"Required parameter {param.parameter_key} is missing")
        
        # Validate parameter values
        for param in method.parameters:
            if param.parameter_key in parameters:
                is_valid, error_msg = param.validate_value(parameters[param.parameter_key])
                if not is_valid:
                    errors.append(f"Parameter {param.parameter_key}: {error_msg}")
        
        return "; ".join(errors) if errors else ""
    
    def validate_condition_alert_mapping(self, data: Dict[str, Any]) -> Tuple[bool, Dict[str, Any]]:
        """Validate condition alert mapping data"""
        errors = {}
        
        # Required fields validation
        required_fields = ['condition_id', 'condition_type', 'alert_id']
        for field in required_fields:
            if field not in data or not data[field]:
                errors[field] = f"{field} is required"
        
        # Validate against constraints
        for field, value in data.items():
            if value is not None:
                is_valid, msg = self.constraint_service.validate_field_value(
                    'condition_alerts_mapping', field, value
                )
                if not is_valid:
                    errors[field] = msg
        
        # Business logic validation
        if 'condition_type' in data and data['condition_type']:
            valid_types = ['plan', 'trade']
            if data['condition_type'] not in valid_types:
                errors['condition_type'] = f"Invalid condition type. Must be one of: {', '.join(valid_types)}"
        
        if 'condition_id' in data and data['condition_id']:
            if data['condition_id'] <= 0:
                errors['condition_id'] = "Condition ID must be positive"
        
        # Validate alert_id exists
        if 'alert_id' in data and data['alert_id'] and self.db_session:
            from models.alert import Alert
            alert = self.db_session.query(Alert).filter(
                Alert.id == data['alert_id']
            ).first()
            if not alert:
                errors['alert_id'] = "Alert not found"
        
        # Validate condition exists
        if 'condition_id' in data and 'condition_type' in data and self.db_session:
            condition_id = data['condition_id']
            condition_type = data['condition_type']
            
            if condition_type == 'plan':
                condition = self.db_session.query(PlanCondition).filter(
                    PlanCondition.id == condition_id
                ).first()
            else:  # trade
                condition = self.db_session.query(TradeCondition).filter(
                    TradeCondition.id == condition_id
                ).first()
            
            if not condition:
                errors['condition_id'] = f"{condition_type.title()} condition not found"
        
        if errors:
            return False, {
                'status': 'error',
                'errors': {
                    'general': 'Validation failed',
                    'fields': errors
                }
            }
        
        return True, {'status': 'success'}
    
    def validate_bulk_conditions(self, conditions_data: List[Dict[str, Any]], condition_type: str) -> Tuple[bool, Dict[str, Any]]:
        """Validate multiple conditions at once"""
        all_errors = {}
        
        for i, condition_data in enumerate(conditions_data):
            is_valid, result = self.validate_condition_data(condition_data, condition_type)
            if not is_valid:
                all_errors[f"condition_{i}"] = result['errors']
        
        if all_errors:
            return False, {
                'status': 'error',
                'errors': {
                    'general': 'Multiple validation errors found',
                    'conditions': all_errors
                }
            }
        
        return True, {'status': 'success'}
