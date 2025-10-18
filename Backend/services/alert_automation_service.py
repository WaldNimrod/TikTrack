"""
Alert Automation Service
Service for creating and managing alerts from conditions
"""

import logging
from typing import Dict, Any, List, Optional
from datetime import datetime
from sqlalchemy.orm import Session

import json
from models.alert import Alert
from models.plan_condition import PlanCondition, TradeCondition, ConditionAlertMapping
from models.trade_plan import TradePlan
from models.trade import Trade
from models.trading_method import TradingMethod
from services.condition_evaluation_service import ConditionEvaluationService

logger = logging.getLogger(__name__)

class AlertAutomationService:
    """Service for automating alert creation from conditions"""
    
    def __init__(self, db_session: Session):
        self.db_session = db_session
        self.condition_evaluator = ConditionEvaluationService(db_session)
    
    def create_alert_from_condition(self, condition_id: int, condition_type: str, user_settings: Dict[str, Any] = None) -> Dict[str, Any]:
        """Create an alert from a condition"""
        try:
            # Get condition
            if condition_type == 'plan':
                condition = self.db_session.query(PlanCondition).filter(
                    PlanCondition.id == condition_id
                ).first()
            else:
                condition = self.db_session.query(TradeCondition).filter(
                    TradeCondition.id == condition_id
                ).first()
            
            if not condition:
                return {
                    'status': 'error',
                    'message': f'Condition {condition_id} not found',
                    'condition_id': condition_id
                }
            
            # Get entity information
            entity_info = self._get_entity_info(condition, condition_type)
            if not entity_info:
                return {
                    'status': 'error',
                    'message': 'Entity information not found',
                    'condition_id': condition_id
                }
            
            # Create alert
            alert_data = self._build_alert_data(condition, entity_info, user_settings)
            alert = Alert(**alert_data)
            
            self.db_session.add(alert)
            self.db_session.flush()  # Get the ID
            
            # Create mapping
            mapping = ConditionAlertMapping(
                condition_id=condition_id,
                condition_type=condition_type,
                alert_id=alert.id,
                auto_created=True,
                is_active=True
            )
            
            self.db_session.add(mapping)
            self.db_session.commit()
            
            return {
                'status': 'success',
                'alert_id': alert.id,
                'condition_id': condition_id,
                'condition_type': condition_type,
                'message': 'Alert created successfully',
                'alert_data': alert.to_dict()
            }
            
        except Exception as e:
            logger.error(f"Error creating alert from condition {condition_id}: {e}")
            self.db_session.rollback()
            return {
                'status': 'error',
                'message': str(e),
                'condition_id': condition_id
            }
    
    def sync_conditions_to_alerts(self, entity_id: int, entity_type: str) -> Dict[str, Any]:
        """Sync all conditions for an entity to alerts"""
        try:
            if entity_type == 'plan':
                conditions = self.db_session.query(PlanCondition).filter(
                    PlanCondition.trade_plan_id == entity_id
                ).all()
            else:
                conditions = self.db_session.query(TradeCondition).filter(
                    TradeCondition.trade_id == entity_id
                ).all()
            
            if not conditions:
                return {
                    'status': 'success',
                    'message': 'No conditions found',
                    'alerts_created': 0
                }
            
            alerts_created = 0
            alerts_updated = 0
            
            for condition in conditions:
                # Check if alert already exists
                existing_mapping = self.db_session.query(ConditionAlertMapping).filter(
                    ConditionAlertMapping.condition_id == condition.id,
                    ConditionAlertMapping.condition_type == entity_type
                ).first()
                
                if existing_mapping:
                    # Update existing alert
                    alert = self.db_session.query(Alert).filter(
                        Alert.id == existing_mapping.alert_id
                    ).first()
                    
                    if alert:
                        # Update alert data
                        entity_info = self._get_entity_info(condition, entity_type)
                        if entity_info:
                            alert_data = self._build_alert_data(condition, entity_info)
                            for key, value in alert_data.items():
                                if hasattr(alert, key):
                                    setattr(alert, key, value)
                            alerts_updated += 1
                else:
                    # Create new alert
                    result = self.create_alert_from_condition(condition.id, entity_type)
                    if result['status'] == 'success':
                        alerts_created += 1
            
            self.db_session.commit()
            
            return {
                'status': 'success',
                'message': f'Sync completed: {alerts_created} alerts created, {alerts_updated} alerts updated',
                'alerts_created': alerts_created,
                'alerts_updated': alerts_updated,
                'total_conditions': len(conditions)
            }
            
        except Exception as e:
            logger.error(f"Error syncing conditions to alerts: {e}")
            self.db_session.rollback()
            return {
                'status': 'error',
                'message': str(e)
            }
    
    def update_alert_from_condition(self, condition_id: int, condition_type: str) -> Dict[str, Any]:
        """Update an existing alert from a condition"""
        try:
            # Get mapping
            mapping = self.db_session.query(ConditionAlertMapping).filter(
                ConditionAlertMapping.condition_id == condition_id,
                ConditionAlertMapping.condition_type == condition_type
            ).first()
            
            if not mapping:
                return {
                    'status': 'error',
                    'message': 'No alert mapping found for condition',
                    'condition_id': condition_id
                }
            
            # Get alert
            alert = self.db_session.query(Alert).filter(
                Alert.id == mapping.alert_id
            ).first()
            
            if not alert:
                return {
                    'status': 'error',
                    'message': 'Alert not found',
                    'alert_id': mapping.alert_id
                }
            
            # Get condition
            if condition_type == 'plan':
                condition = self.db_session.query(PlanCondition).filter(
                    PlanCondition.id == condition_id
                ).first()
            else:
                condition = self.db_session.query(TradeCondition).filter(
                    TradeCondition.id == condition_id
                ).first()
            
            if not condition:
                return {
                    'status': 'error',
                    'message': 'Condition not found',
                    'condition_id': condition_id
                }
            
            # Update alert
            entity_info = self._get_entity_info(condition, condition_type)
            if entity_info:
                alert_data = self._build_alert_data(condition, entity_info)
                for key, value in alert_data.items():
                    if hasattr(alert, key):
                        setattr(alert, key, value)
                
                self.db_session.commit()
                
                return {
                    'status': 'success',
                    'message': 'Alert updated successfully',
                    'alert_id': alert.id,
                    'condition_id': condition_id,
                    'alert_data': alert.to_dict()
                }
            else:
                return {
                    'status': 'error',
                    'message': 'Entity information not found',
                    'condition_id': condition_id
                }
            
        except Exception as e:
            logger.error(f"Error updating alert from condition {condition_id}: {e}")
            self.db_session.rollback()
            return {
                'status': 'error',
                'message': str(e),
                'condition_id': condition_id
            }
    
    def delete_alert_mapping(self, condition_id: int, condition_type: str) -> Dict[str, Any]:
        """Delete alert mapping for a condition"""
        try:
            # Get mapping
            mapping = self.db_session.query(ConditionAlertMapping).filter(
                ConditionAlertMapping.condition_id == condition_id,
                ConditionAlertMapping.condition_type == condition_type
            ).first()
            
            if not mapping:
                return {
                    'status': 'error',
                    'message': 'No alert mapping found for condition',
                    'condition_id': condition_id
                }
            
            # Delete alert if it was auto-created
            if mapping.auto_created:
                alert = self.db_session.query(Alert).filter(
                    Alert.id == mapping.alert_id
                ).first()
                
                if alert:
                    self.db_session.delete(alert)
            
            # Delete mapping
            self.db_session.delete(mapping)
            self.db_session.commit()
            
            return {
                'status': 'success',
                'message': 'Alert mapping deleted successfully',
                'condition_id': condition_id
            }
            
        except Exception as e:
            logger.error(f"Error deleting alert mapping for condition {condition_id}: {e}")
            self.db_session.rollback()
            return {
                'status': 'error',
                'message': str(e),
                'condition_id': condition_id
            }
    
    def _get_entity_info(self, condition, condition_type: str) -> Optional[Dict[str, Any]]:
        """Get entity information for a condition"""
        try:
            if condition_type == 'plan':
                plan = self.db_session.query(TradePlan).filter(
                    TradePlan.id == condition.trade_plan_id
                ).first()
                
                if plan:
                    return {
                        'entity_id': plan.id,
                        'entity_type': 'plan',
                        'ticker_id': plan.ticker_id,
                        'entity_name': f'Plan {plan.id}',
                        'related_type_id': 3  # Trade plan related type
                    }
            else:
                trade = self.db_session.query(Trade).filter(
                    Trade.id == condition.trade_id
                ).first()
                
                if trade:
                    return {
                        'entity_id': trade.id,
                        'entity_type': 'trade',
                        'ticker_id': trade.ticker_id,
                        'entity_name': f'Trade {trade.id}',
                        'related_type_id': 2  # Trade related type
                    }
            
            return None
            
        except Exception as e:
            logger.error(f"Error getting entity info: {e}")
            return None
    
    def _build_alert_data(self, condition, entity_info: Dict[str, Any], user_settings: Dict[str, Any] = None) -> Dict[str, Any]:
        """Build alert data from condition and entity info"""
        try:
            # Get method information
            method = self.db_session.query(TradingMethod).filter(
                TradingMethod.id == condition.method_id
            ).first()
            
            if not method:
                raise ValueError("Trading method not found")
            
            # Parse parameters
            parameters = condition.get_parameters()
            
            # Build alert name
            alert_name = f"{method.name_en} - {entity_info['entity_name']}"
            
            # Build alert description
            description = f"Condition: {method.name_en}\n"
            description += f"Entity: {entity_info['entity_name']}\n"
            description += f"Parameters: {json.dumps(parameters, indent=2)}"
            
            # Determine alert type and condition
            alert_type, condition_attribute, condition_operator, condition_number = self._determine_alert_condition(
                method, parameters
            )
            
            # Apply user settings if provided
            if user_settings:
                alert_name = user_settings.get('name', alert_name)
                description = user_settings.get('description', description)
                alert_type = user_settings.get('type', alert_type)
            
            return {
                'name': alert_name,
                'description': description,
                'type': alert_type,
                'status': 'active',
                'related_type_id': entity_info['related_type_id'],
                'related_id': entity_info['entity_id'],
                'condition_attribute': condition_attribute,
                'condition_operator': condition_operator,
                'condition_number': condition_number,
                'created_at': datetime.now(),
                'updated_at': datetime.now()
            }
            
        except Exception as e:
            logger.error(f"Error building alert data: {e}")
            raise e
    
    def _determine_alert_condition(self, method: TradingMethod, parameters: Dict[str, Any]) -> tuple:
        """Determine alert condition from method and parameters"""
        try:
            if method.category == 'technical_indicators':
                if method.name_en == 'Moving Averages':
                    ma_period = parameters.get('ma_period', 50)
                    return 'price_condition', 'price', 'above', str(ma_period)
            
            elif method.category == 'support_resistance':
                level_price = parameters.get('level_price', 0)
                return 'price_condition', 'price', 'equals', str(level_price)
            
            elif method.category == 'volume_analysis':
                volume_threshold = parameters.get('volume_threshold', 1000000)
                return 'volume_condition', 'volume', 'above', str(volume_threshold)
            
            elif method.category == 'fibonacci':
                swing_high = parameters.get('swing_high', 0)
                return 'price_condition', 'price', 'above', str(swing_high)
            
            # Default fallback
            return 'price_condition', 'price', 'above', '0'
            
        except Exception as e:
            logger.error(f"Error determining alert condition: {e}")
            return 'price_condition', 'price', 'above', '0'
    
    def get_condition_alert_mappings(self, condition_id: int, condition_type: str) -> List[Dict[str, Any]]:
        """Get all alert mappings for a condition"""
        try:
            mappings = self.db_session.query(ConditionAlertMapping).filter(
                ConditionAlertMapping.condition_id == condition_id,
                ConditionAlertMapping.condition_type == condition_type
            ).all()
            
            result = []
            for mapping in mappings:
                mapping_dict = mapping.to_dict()
                
                # Add alert information
                alert = self.db_session.query(Alert).filter(
                    Alert.id == mapping.alert_id
                ).first()
                
                if alert:
                    mapping_dict['alert'] = alert.to_dict()
                
                result.append(mapping_dict)
            
            return result
            
        except Exception as e:
            logger.error(f"Error getting condition alert mappings: {e}")
            return []
    
    def evaluate_and_trigger_alerts(self, ticker_id: int) -> Dict[str, Any]:
        """Evaluate all conditions for a ticker and trigger alerts if needed"""
        try:
            # Get all active conditions for the ticker
            # This would require joining with trade_plans and trades tables
            # For now, this is a placeholder implementation
            
            return {
                'status': 'success',
                'message': 'Alert evaluation not yet fully implemented',
                'ticker_id': ticker_id,
                'alerts_triggered': 0
            }
            
        except Exception as e:
            logger.error(f"Error evaluating and triggering alerts: {e}")
            return {
                'status': 'error',
                'message': str(e)
            }
