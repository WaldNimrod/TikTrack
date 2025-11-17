"""
Trade Conditions API Routes
API endpoints for trade conditions management
"""

from flask import Blueprint, request, jsonify
import logging
import json
from typing import Dict, Any

from models.trade_condition import TradeCondition
from models.trade import Trade
from models.plan_condition import PlanCondition
from services.conditions_validation_service import ConditionsValidationService
from services.preferences_service import PreferencesService
from config.database import get_db
from .base_entity_utils import BaseEntityUtils

logger = logging.getLogger(__name__)
preferences_service = PreferencesService()


def _get_date_normalizer():
    return BaseEntityUtils.get_request_normalizer(request, preferences_service=preferences_service)

# Create blueprint
trade_conditions_bp = Blueprint('trade_conditions', __name__, url_prefix='/api/trade-conditions')

@trade_conditions_bp.route('/trades/<int:trade_id>/conditions', methods=['GET'])
def get_trade_conditions(trade_id):
    """Get all conditions for a specific trade"""
    try:
        # Get database session
        db_session = next(get_db())
        
        try:
            normalizer = _get_date_normalizer()

            # Check if trade exists
            trade = db_session.query(Trade).filter(Trade.id == trade_id).first()
            if not trade:
                payload = BaseEntityUtils.create_error_payload(
                    normalizer,
                    f'Trade with ID {trade_id} not found',
                    {"code": "TRADE_NOT_FOUND"}
                )
                return jsonify(payload), 404
            
            # Get conditions
            conditions = db_session.query(TradeCondition).filter(
                TradeCondition.trade_id == trade_id
            ).order_by(TradeCondition.condition_group, TradeCondition.created_at).all()
            
            # Convert to dictionary
            result = []
            for condition in conditions:
                condition_dict = condition.to_dict()
                result.append(condition_dict)
            
            payload = BaseEntityUtils.create_success_payload(
                normalizer,
                result,
                extra={
                    'count': len(result),
                    'trade_id': trade_id
                }
            )
            return jsonify(payload), 200
            
        finally:
            db_session.close()
            
    except Exception as e:
        logger.error(f"Error getting trade conditions for trade {trade_id}: {e}")
        normalizer = _get_date_normalizer()
        payload = BaseEntityUtils.create_error_payload(
            normalizer,
            str(e)
        )
        return jsonify(payload), 500

@trade_conditions_bp.route('/trades/<int:trade_id>/conditions', methods=['POST'])
def create_trade_condition(trade_id):
    """Create new condition for a trade"""
    try:
        data = request.get_json()
        if not data:
            normalizer = _get_date_normalizer()
            payload = BaseEntityUtils.create_error_payload(
                normalizer,
                'No data provided',
                {"code": "NO_DATA"}
            )
            return jsonify(payload), 400
        
        # Add trade_id to data
        data['trade_id'] = trade_id
        
        # Get database session
        db_session = next(get_db())
        
        try:
            normalizer = _get_date_normalizer()
            # Check if trade exists
            trade = db_session.query(Trade).filter(Trade.id == trade_id).first()
            if not trade:
                payload = BaseEntityUtils.create_error_payload(
                    normalizer,
                    f'Trade with ID {trade_id} not found',
                    {"code": "TRADE_NOT_FOUND"}
                )
                return jsonify(payload), 404
            
            # Validate data
            validator = ConditionsValidationService(db_session)
            normalized_payload = BaseEntityUtils.normalize_input(normalizer, data)
            is_valid, validation_result = validator.validate_condition_data(normalized_payload, 'trade')
            
            if not is_valid:
                errors = validation_result.get('errors', {})
                payload = BaseEntityUtils.create_error_payload(
                    normalizer,
                    errors.get('general', 'Validation failed'),
                    {"fields": errors.get('fields')}
                )
                return jsonify(payload), 400
            
            # Create condition
            # Convert parameters_json to string if it's a dict
            parameters_json = normalized_payload['parameters_json']
            if isinstance(parameters_json, dict):
                parameters_json = json.dumps(parameters_json, ensure_ascii=False)

            sanitized_action_notes = BaseEntityUtils.sanitize_rich_text(
                normalized_payload.get('action_notes')
            ) if normalized_payload.get('action_notes') else None
            
            condition = TradeCondition(
                trade_id=trade_id,
                method_id=normalized_payload['method_id'],
                condition_group=normalized_payload.get('condition_group', 0),
                parameters_json=parameters_json,
                logical_operator=normalized_payload.get('logical_operator', 'NONE'),
                inherited_from_plan_condition_id=normalized_payload.get('inherited_from_plan_condition_id'),
                is_active=normalized_payload.get('is_active', True),
                auto_generate_alerts=normalized_payload.get('auto_generate_alerts', True),
                trigger_action=normalized_payload.get('trigger_action', 'enter_trade_positive'),
                action_notes=sanitized_action_notes
            )
            
            db_session.add(condition)
            db_session.commit()
            
            # Return created condition
            condition_dict = condition.to_dict()
            
            payload = BaseEntityUtils.create_success_payload(
                normalizer,
                condition_dict,
                "Trade condition created successfully"
            )
            return jsonify(payload), 201
            
        except Exception as e:
            db_session.rollback()
            raise e
        finally:
            db_session.close()
            
    except Exception as e:
        logger.error(f"Error creating trade condition for trade {trade_id}: {e}")
        normalizer = _get_date_normalizer()
        payload = BaseEntityUtils.create_error_payload(
            normalizer,
            str(e)
        )
        return jsonify(payload), 500

@trade_conditions_bp.route('/<int:condition_id>', methods=['GET'])
def get_trade_condition(condition_id):
    """Get specific trade condition"""
    try:
        # Get database session
        db_session = next(get_db())
        
        try:
            normalizer = _get_date_normalizer()
            condition = db_session.query(TradeCondition).filter(
                TradeCondition.id == condition_id
            ).first()
            
            if not condition:
                payload = BaseEntityUtils.create_error_payload(
                    normalizer,
                    f'Trade condition with ID {condition_id} not found',
                    {"code": "CONDITION_NOT_FOUND"}
                )
                return jsonify(payload), 404
            
            # Convert to dictionary
            condition_dict = condition.to_dict()
            
            payload = BaseEntityUtils.create_success_payload(
                normalizer,
                condition_dict
            )
            return jsonify(payload), 200
            
        finally:
            db_session.close()
            
    except Exception as e:
        logger.error(f"Error getting trade condition {condition_id}: {e}")
        normalizer = _get_date_normalizer()
        payload = BaseEntityUtils.create_error_payload(
            normalizer,
            str(e)
        )
        return jsonify(payload), 500

@trade_conditions_bp.route('/<int:condition_id>', methods=['PUT'])
def update_trade_condition(condition_id):
    """Update trade condition"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                'status': 'error',
                'message': 'No data provided',
                'error_code': 'NO_DATA'
            }), 400
        
        # Get database session
        db_session = next(get_db())
        
        try:
            condition = db_session.query(TradeCondition).filter(
                TradeCondition.id == condition_id
            ).first()
            
            if not condition:
                return jsonify({
                    'status': 'error',
                    'message': f'Trade condition with ID {condition_id} not found',
                    'error_code': 'CONDITION_NOT_FOUND'
                }), 404
            
            # Add trade_id to data for validation
            data['trade_id'] = condition.trade_id
            
            # Validate data
            validator = ConditionsValidationService(db_session)
            is_valid, validation_result = validator.validate_condition_data(data, 'trade')
            
            if not is_valid:
                return jsonify(validation_result), 400
            
            # Update condition
            # Convert parameters_json to string if it's a dict
            parameters_json = data['parameters_json']
            if isinstance(parameters_json, dict):
                import json
                parameters_json = json.dumps(parameters_json, ensure_ascii=False)
            
            condition.method_id = data['method_id']
            condition.condition_group = data.get('condition_group', condition.condition_group)
            condition.parameters_json = parameters_json
            condition.logical_operator = data.get('logical_operator', condition.logical_operator)
            condition.inherited_from_plan_condition_id = data.get('inherited_from_plan_condition_id', condition.inherited_from_plan_condition_id)
            condition.is_active = data.get('is_active', condition.is_active)
            condition.auto_generate_alerts = data.get('auto_generate_alerts', condition.auto_generate_alerts)
            condition.trigger_action = data.get('trigger_action', condition.trigger_action)
            if 'action_notes' in data:
                sanitized_action_notes = BaseEntityUtils.sanitize_rich_text(
                    data.get('action_notes')
                ) if data.get('action_notes') else None
                condition.action_notes = sanitized_action_notes
            
            db_session.commit()
            
            # Return updated condition
            condition_dict = condition.to_dict()
            
            return jsonify({
                'status': 'success',
                'data': condition_dict,
                'message': 'Trade condition updated successfully',
                'timestamp': datetime.now().isoformat()
            }), 200
            
        except Exception as e:
            db_session.rollback()
            raise e
        finally:
            db_session.close()
            
    except Exception as e:
        logger.error(f"Error updating trade condition {condition_id}: {e}")
        return jsonify({
            'status': 'error',
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@trade_conditions_bp.route('/<int:condition_id>', methods=['DELETE'])
def delete_trade_condition(condition_id):
    """Delete trade condition"""
    try:
        # Get database session
        db_session = next(get_db())
        
        try:
            condition = db_session.query(TradeCondition).filter(
                TradeCondition.id == condition_id
            ).first()
            
            if not condition:
                return jsonify({
                    'status': 'error',
                    'message': f'Trade condition with ID {condition_id} not found',
                    'error_code': 'CONDITION_NOT_FOUND'
                }), 404
            
            # Delete condition
            db_session.delete(condition)
            db_session.commit()
            
            return jsonify({
                'status': 'success',
                'message': 'Trade condition deleted successfully',
                'timestamp': datetime.now().isoformat()
            }), 200
            
        except Exception as e:
            db_session.rollback()
            raise e
        finally:
            db_session.close()
            
    except Exception as e:
        logger.error(f"Error deleting trade condition {condition_id}: {e}")
        return jsonify({
            'status': 'error',
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@trade_conditions_bp.route('/<int:condition_id>/test', methods=['POST'])
def test_trade_condition(condition_id):
    """Test trade condition against current market data"""
    try:
        # Get database session
        db_session = next(get_db())
        
        try:
            condition = db_session.query(TradeCondition).filter(
                TradeCondition.id == condition_id
            ).first()
            
            if not condition:
                return jsonify({
                    'status': 'error',
                    'message': f'Trade condition with ID {condition_id} not found',
                    'error_code': 'CONDITION_NOT_FOUND'
                }), 404
            
            # Get trade to get ticker
            trade = db_session.query(Trade).filter(
                Trade.id == condition.trade_id
            ).first()
            
            if not trade:
                return jsonify({
                    'status': 'error',
                    'message': 'Trade not found',
                    'error_code': 'TRADE_NOT_FOUND'
                }), 404
            
            # TODO: Implement condition evaluation service
            # For now, return a placeholder response
            return jsonify({
                'status': 'success',
                'data': {
                    'condition_id': condition_id,
                    'ticker_id': trade.ticker_id,
                    'evaluation_result': 'pending',
                    'message': 'Condition evaluation not yet implemented'
                },
                'timestamp': datetime.now().isoformat()
            }), 200
            
        finally:
            db_session.close()
            
    except Exception as e:
        logger.error(f"Error testing trade condition {condition_id}: {e}")
        return jsonify({
            'status': 'error',
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@trade_conditions_bp.route('/validate', methods=['POST'])
def validate_trade_condition():
    """Validate trade condition data without creating it"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                'status': 'error',
                'message': 'No data provided',
                'error_code': 'NO_DATA'
            }), 400
        
        # Get database session
        db_session = next(get_db())
        
        try:
            # Validate data
            validator = ConditionsValidationService(db_session)
            is_valid, validation_result = validator.validate_condition_data(data, 'trade')
            
            if is_valid:
                return jsonify({
                    'status': 'success',
                    'message': 'Validation passed',
                    'timestamp': datetime.now().isoformat()
                }), 200
            else:
                return jsonify(validation_result), 400
            
        finally:
            db_session.close()
            
    except Exception as e:
        logger.error(f"Error validating trade condition: {e}")
        return jsonify({
            'status': 'error',
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@trade_conditions_bp.route('/inherit-from-plan', methods=['POST'])
def inherit_conditions_from_plan():
    """Inherit conditions from a trade plan to a trade"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                'status': 'error',
                'message': 'No data provided',
                'error_code': 'NO_DATA'
            }), 400
        
        trade_id = data.get('trade_id')
        plan_id = data.get('plan_id')
        
        if not trade_id or not plan_id:
            return jsonify({
                'status': 'error',
                'message': 'Both trade_id and plan_id are required',
                'error_code': 'MISSING_IDS'
            }), 400
        
        # Get database session
        db_session = next(get_db())
        
        try:
            # Check if trade exists
            trade = db_session.query(Trade).filter(Trade.id == trade_id).first()
            if not trade:
                return jsonify({
                    'status': 'error',
                    'message': f'Trade with ID {trade_id} not found',
                    'error_code': 'TRADE_NOT_FOUND'
                }), 404
            
            # Check if plan exists
            from models.trade_plan import TradePlan
            plan = db_session.query(TradePlan).filter(TradePlan.id == plan_id).first()
            if not plan:
                return jsonify({
                    'status': 'error',
                    'message': f'Trade plan with ID {plan_id} not found',
                    'error_code': 'PLAN_NOT_FOUND'
                }), 404
            
            # Get plan conditions
            plan_conditions = db_session.query(PlanCondition).filter(
                PlanCondition.trade_plan_id == plan_id
            ).all()
            
            if not plan_conditions:
                return jsonify({
                    'status': 'error',
                    'message': 'No conditions found in the trade plan',
                    'error_code': 'NO_PLAN_CONDITIONS'
                }), 404
            
            # Create trade conditions from plan conditions
            created_conditions = []
            for plan_condition in plan_conditions:
                # Check if condition already exists
                existing_condition = db_session.query(TradeCondition).filter(
                    TradeCondition.trade_id == trade_id,
                    TradeCondition.inherited_from_plan_condition_id == plan_condition.id
                ).first()
                
                if existing_condition:
                    continue  # Skip if already inherited
                
                trade_condition = TradeCondition(
                    trade_id=trade_id,
                    method_id=plan_condition.method_id,
                    condition_group=plan_condition.condition_group,
                    parameters_json=plan_condition.parameters_json,
                    logical_operator=plan_condition.logical_operator,
                    inherited_from_plan_condition_id=plan_condition.id,
                    is_active=plan_condition.is_active,
                    auto_generate_alerts=plan_condition.auto_generate_alerts,
                    trigger_action=plan_condition.trigger_action,
                    action_notes=plan_condition.action_notes
                )
                
                db_session.add(trade_condition)
                created_conditions.append(trade_condition)
            
            db_session.commit()
            
            # Return created conditions
            result = []
            for condition in created_conditions:
                condition_dict = condition.to_dict()
                result.append(condition_dict)
            
            return jsonify({
                'status': 'success',
                'data': result,
                'count': len(result),
                'message': f'{len(result)} conditions inherited from plan',
                'timestamp': datetime.now().isoformat()
            }), 201
            
        except Exception as e:
            db_session.rollback()
            raise e
        finally:
            db_session.close()
            
    except Exception as e:
        logger.error(f"Error inheriting conditions from plan: {e}")
        return jsonify({
            'status': 'error',
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@trade_conditions_bp.route('/bulk', methods=['POST'])
def create_bulk_trade_conditions():
    """Create multiple trade conditions at once"""
    try:
        data = request.get_json()
        if not data or 'conditions' not in data:
            return jsonify({
                'status': 'error',
                'message': 'No conditions data provided',
                'error_code': 'NO_DATA'
            }), 400
        
        conditions_data = data['conditions']
        trade_id = data.get('trade_id')
        
        if not trade_id:
            return jsonify({
                'status': 'error',
                'message': 'trade_id is required',
                'error_code': 'MISSING_TRADE_ID'
            }), 400
        
        # Get database session
        db_session = next(get_db())
        
        try:
            # Check if trade exists
            trade = db_session.query(Trade).filter(Trade.id == trade_id).first()
            if not trade:
                return jsonify({
                    'status': 'error',
                    'message': f'Trade with ID {trade_id} not found',
                    'error_code': 'TRADE_NOT_FOUND'
                }), 404
            
            # Validate all conditions
            validator = ConditionsValidationService(db_session)
            is_valid, validation_result = validator.validate_bulk_conditions(conditions_data, 'trade')
            
            if not is_valid:
                return jsonify(validation_result), 400
            
            # Create conditions
            created_conditions = []
            for condition_data in conditions_data:
                condition_data['trade_id'] = trade_id
                
                # Convert parameters_json to string if it's a dict
                parameters_json = condition_data['parameters_json']
                if isinstance(parameters_json, dict):
                    import json
                    parameters_json = json.dumps(parameters_json, ensure_ascii=False)

                sanitized_action_notes = BaseEntityUtils.sanitize_rich_text(
                    condition_data.get('action_notes')
                ) if condition_data.get('action_notes') else None
                
                condition = TradeCondition(
                    trade_id=trade_id,
                    method_id=condition_data['method_id'],
                    condition_group=condition_data.get('condition_group', 0),
                    parameters_json=parameters_json,
                    logical_operator=condition_data.get('logical_operator', 'NONE'),
                    inherited_from_plan_condition_id=condition_data.get('inherited_from_plan_condition_id'),
                    is_active=condition_data.get('is_active', True),
                    auto_generate_alerts=condition_data.get('auto_generate_alerts', True),
                    trigger_action=condition_data.get('trigger_action', 'enter_trade_positive'),
                    action_notes=sanitized_action_notes
                )
                
                db_session.add(condition)
                created_conditions.append(condition)
            
            db_session.commit()
            
            # Return created conditions
            result = []
            for condition in created_conditions:
                condition_dict = condition.to_dict()
                result.append(condition_dict)
            
            return jsonify({
                'status': 'success',
                'data': result,
                'count': len(result),
                'message': f'{len(result)} trade conditions created successfully',
                'timestamp': datetime.now().isoformat()
            }), 201
            
        except Exception as e:
            db_session.rollback()
            raise e
        finally:
            db_session.close()
            
    except Exception as e:
        logger.error(f"Error creating bulk trade conditions: {e}")
        return jsonify({
            'status': 'error',
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@trade_conditions_bp.route('/<int:condition_id>/evaluate', methods=['POST'])
def evaluate_condition(condition_id):
    """Evaluate a single trade condition"""
    try:
        # Get database session
        db_session = next(get_db())
        
        try:
            # Get condition with relationships
            condition = db_session.query(TradeCondition).filter(
                TradeCondition.id == condition_id
            ).first()
            
            if not condition:
                return jsonify({
                    'status': 'error',
                    'message': f'Trade condition with ID {condition_id} not found',
                    'error_code': 'CONDITION_NOT_FOUND'
                }), 404
            
            # Import and use ConditionEvaluator
            from services.condition_evaluator import ConditionEvaluator
            evaluator = ConditionEvaluator(db_session)
            
            # Evaluate condition
            result = evaluator.evaluate_condition(condition)
            
            return jsonify({
                'status': 'success',
                'data': result,
                'message': 'Condition evaluated successfully',
                'timestamp': datetime.now().isoformat()
            }), 200
            
        except Exception as e:
            raise e
        finally:
            db_session.close()
            
    except Exception as e:
        logger.error(f"Error evaluating condition {condition_id}: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'Error evaluating condition: {str(e)}',
            'error_code': 'EVALUATION_ERROR'
        }), 500

@trade_conditions_bp.route('/evaluate-all', methods=['POST'])
def evaluate_all_conditions():
    """Evaluate all active trade conditions"""
    try:
        # Get database session
        db_session = next(get_db())
        
        try:
            # Import and use ConditionEvaluator
            from services.condition_evaluator import ConditionEvaluator
            evaluator = ConditionEvaluator(db_session)
            
            # Evaluate all active conditions
            results = evaluator.evaluate_all_active_conditions()
            
            # Filter only trade conditions
            trade_results = [r for r in results if r.get('condition_type') == 'trade']
            
            return jsonify({
                'status': 'success',
                'data': trade_results,
                'count': len(trade_results),
                'message': f'{len(trade_results)} trade conditions evaluated',
                'timestamp': datetime.now().isoformat()
            }), 200
            
        except Exception as e:
            raise e
        finally:
            db_session.close()
            
    except Exception as e:
        logger.error(f"Error evaluating all conditions: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'Error evaluating all conditions: {str(e)}',
            'error_code': 'EVALUATION_ERROR'
        }), 500

@trade_conditions_bp.route('/<int:condition_id>/evaluation-history', methods=['GET'])
def get_evaluation_history(condition_id):
    """Get evaluation history for a condition (from alerts)"""
    try:
        # Get database session
        db_session = next(get_db())
        
        try:
            # Check if condition exists
            condition = db_session.query(TradeCondition).filter(
                TradeCondition.id == condition_id
            ).first()
            
            if not condition:
                return jsonify({
                    'status': 'error',
                    'message': f'Trade condition with ID {condition_id} not found',
                    'error_code': 'CONDITION_NOT_FOUND'
                }), 404
            
            # Get alerts related to this condition
            from models.alert import Alert
            alerts = db_session.query(Alert).filter(
                Alert.related_id == condition_id
            ).order_by(Alert.triggered_at.desc()).limit(50).all()
            
            # Convert to evaluation history format
            history = []
            for alert in alerts:
                if alert.triggered_at:  # Only include triggered alerts
                    history.append({
                        'evaluation_time': alert.triggered_at.isoformat(),
                        'condition_met': True,
                        'alert_id': alert.id,
                        'message': alert.message,
                        'price': float(alert.condition_number) if alert.condition_number else 0
                    })
            
            return jsonify({
                'status': 'success',
                'data': history,
                'count': len(history),
                'message': f'Found {len(history)} evaluation records',
                'timestamp': datetime.now().isoformat()
            }), 200
            
        except Exception as e:
            raise e
        finally:
            db_session.close()
            
    except Exception as e:
        logger.error(f"Error getting evaluation history for condition {condition_id}: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'Error getting evaluation history: {str(e)}',
            'error_code': 'HISTORY_ERROR'
        }), 500

@trade_conditions_bp.route('/<int:condition_id>/create-alert', methods=['POST'])
def create_condition_alert(condition_id):
    """Create alert manually for a condition"""
    try:
        db_session = next(get_db())
        try:
            condition = db_session.query(TradeCondition).filter(TradeCondition.id == condition_id).first()
            if not condition:
                return jsonify({'status': 'error', 'message': f'Trade condition with ID {condition_id} not found'}), 404
            
            # Check if alert already exists
            from services.alert_service import AlertService
            alert_service = AlertService(db_session)
            existing_alert = alert_service.get_alert_by_condition(db_session, trade_condition_id=condition_id)
            
            if existing_alert:
                return jsonify({
                    'status': 'error', 
                    'message': f'Alert already exists for condition {condition_id}',
                    'alert_id': existing_alert.id
                }), 400
            
            # Create alert data
            alert_data = {
                'message': f'Manual alert for condition {condition_id}',
                'related_id': condition.trade_id,
                'related_type_id': 2,  # trade
                'condition_attribute': 'price',
                'condition_operator': 'more_than',
                'condition_number': '0',
                'status': 'open',
                'is_triggered': 'false'
            }
            
            alert = alert_service.create_or_update_alert_for_condition(
                db_session, condition_id, 'trade', alert_data
            )
            
            return jsonify({
                'status': 'success',
                'data': alert.to_dict(),
                'message': 'Alert created successfully'
            }), 201
            
        except Exception as e:
            raise e
        finally:
            db_session.close()
            
    except Exception as e:
        logger.error(f"Error creating alert for condition {condition_id}: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'Error creating alert: {str(e)}'
        }), 500

@trade_conditions_bp.route('/<int:condition_id>/alert', methods=['DELETE'])
def delete_condition_alert(condition_id):
    """Delete alert for a condition"""
    try:
        db_session = next(get_db())
        try:
            from services.alert_service import AlertService
            alert_service = AlertService(db_session)
            
            deleted_count = alert_service.delete_condition_alerts(db_session, trade_condition_id=condition_id)
            
            return jsonify({
                'status': 'success',
                'deleted_count': deleted_count,
                'message': f'Deleted {deleted_count} alerts for condition {condition_id}'
            }), 200
            
        except Exception as e:
            raise e
        finally:
            db_session.close()
            
    except Exception as e:
        logger.error(f"Error deleting alert for condition {condition_id}: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'Error deleting alert: {str(e)}'
        }), 500

@trade_conditions_bp.route('/<int:condition_id>/alert/toggle', methods=['POST'])
def toggle_condition_alert(condition_id):
    """Toggle alert creation for a condition"""
    try:
        db_session = next(get_db())
        try:
            condition = db_session.query(TradeCondition).filter(TradeCondition.id == condition_id).first()
            if not condition:
                return jsonify({'status': 'error', 'message': f'Trade condition with ID {condition_id} not found'}), 404
            
            # Toggle auto_generate_alerts
            condition.auto_generate_alerts = not condition.auto_generate_alerts
            db_session.commit()
            
            return jsonify({
                'status': 'success',
                'data': {
                    'condition_id': condition_id,
                    'auto_generate_alerts': condition.auto_generate_alerts
                },
                'message': f'Alert generation {"enabled" if condition.auto_generate_alerts else "disabled"} for condition {condition_id}'
            }), 200
            
        except Exception as e:
            raise e
        finally:
            db_session.close()
            
    except Exception as e:
        logger.error(f"Error toggling alert for condition {condition_id}: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'Error toggling alert: {str(e)}'
        }), 500
