"""
Trade Conditions API Routes
API endpoints for trade conditions management
"""

from flask import Blueprint, request, jsonify
import logging
import json
from datetime import datetime
from typing import Dict, Any, Optional

from models.trade_condition import TradeCondition
from models.trade import Trade
from models.plan_condition import PlanCondition
from services.conditions_validation_service import ConditionsValidationService
from services.preferences_service import PreferencesService
from services.alert_service import AlertService
from config.database import get_db
from .base_entity_utils import BaseEntityUtils

logger = logging.getLogger(__name__)
preferences_service = PreferencesService()


def _get_date_normalizer():
    return BaseEntityUtils.get_request_normalizer(request, preferences_service=preferences_service)

# Create blueprint
trade_conditions_bp = Blueprint('trade_conditions', __name__, url_prefix='/api/trade-conditions')


def _build_condition_alert_stats(
    stats_map: Optional[Dict[int, Dict[str, Any]]],
    condition_id: Optional[int]
) -> Dict[str, Any]:
    base_stats = AlertService.default_condition_stats()
    if not condition_id or not stats_map:
        return base_stats
    stats = stats_map.get(condition_id)
    if not stats:
        return base_stats
    merged = base_stats.copy()
    merged.update(stats)
    return merged

@trade_conditions_bp.route('/trades/<int:trade_id>/conditions', methods=['GET'])
def get_trade_conditions(trade_id):
    """Get all conditions for a specific trade"""
    try:
        # Get database session
        db_session = next(get_db())
        
        try:
            normalizer = _get_date_normalizer()
            
            # Get user_id from Flask context (set by auth middleware)
            from flask import g
            user_id = getattr(g, 'user_id', None)

            # Check if trade exists and belongs to user
            query = db_session.query(Trade).filter(Trade.id == trade_id)
            if user_id is not None:
                query = query.filter(Trade.user_id == user_id)
            trade = query.first()
            if not trade:
                payload = BaseEntityUtils.create_error_payload(
                    normalizer,
                    f'Trade with ID {trade_id} not found or does not belong to user',
                    {"code": "TRADE_NOT_FOUND"}
                )
                return jsonify(payload), 404
            
            # Get conditions
            conditions = db_session.query(TradeCondition).filter(
                TradeCondition.trade_id == trade_id
            ).order_by(TradeCondition.condition_group, TradeCondition.created_at).all()
            condition_ids = [condition.id for condition in conditions if condition.id]
            stats_map = {}
            if condition_ids:
                stats_map = AlertService.get_condition_alert_stats(db_session, condition_ids, 'trade')
            
            # Convert to dictionary
            result = []
            for condition in conditions:
                condition_dict = condition.to_dict()
                condition_dict['alert_stats'] = _build_condition_alert_stats(stats_map, condition.id)
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
            
            # Get user_id from Flask context (set by auth middleware)
            from flask import g
            user_id = getattr(g, 'user_id', None)
            
            # Check if trade exists and belongs to user
            query = db_session.query(Trade).filter(Trade.id == trade_id)
            if user_id is not None:
                query = query.filter(Trade.user_id == user_id)
            trade = query.first()
            if not trade:
                payload = BaseEntityUtils.create_error_payload(
                    normalizer,
                    f'Trade with ID {trade_id} not found or does not belong to user',
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
            condition_dict['alert_stats'] = AlertService.default_condition_stats()
            
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
            
            # Get user_id from Flask context (set by auth middleware)
            from flask import g
            user_id = getattr(g, 'user_id', None)
            
            # Get condition and verify trade belongs to user
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
            
            # Verify trade belongs to user
            if user_id is not None:
                trade = db_session.query(Trade).filter(
                    Trade.id == condition.trade_id,
                    Trade.user_id == user_id
                ).first()
                if not trade:
                    payload = BaseEntityUtils.create_error_payload(
                        normalizer,
                        f'Trade condition with ID {condition_id} does not belong to user',
                        {"code": "ACCESS_DENIED"}
                    )
                    return jsonify(payload), 403
            
            # Convert to dictionary with alert stats
            stats_map = AlertService.get_condition_alert_stats(db_session, [condition.id], 'trade')
            condition_dict = condition.to_dict()
            condition_dict['alert_stats'] = _build_condition_alert_stats(stats_map, condition.id)
            
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
    normalizer = _get_date_normalizer()
    try:
        data = request.get_json()
        if not data:
            payload = BaseEntityUtils.create_error_payload(
                normalizer,
                'No data provided',
                {"code": "NO_DATA"}
            )
            return jsonify(payload), 400
        
        # Get database session
        db_session = next(get_db())
        
        try:
            # Get user_id from Flask context (set by auth middleware)
            from flask import g
            user_id = getattr(g, 'user_id', None)
            
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
            
            # Verify trade belongs to user
            if user_id is not None:
                trade = db_session.query(Trade).filter(
                    Trade.id == condition.trade_id,
                    Trade.user_id == user_id
                ).first()
                if not trade:
                    payload = BaseEntityUtils.create_error_payload(
                        normalizer,
                        f'Trade condition with ID {condition_id} does not belong to user',
                        {"code": "ACCESS_DENIED"}
                    )
                    return jsonify(payload), 403
            
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
            
            # Return updated condition with alert stats
            stats_map = AlertService.get_condition_alert_stats(db_session, [condition.id], 'trade')
            condition_dict = condition.to_dict()
            condition_dict['alert_stats'] = _build_condition_alert_stats(stats_map, condition.id)
            
            # Normalize dates in condition dict
            normalized_dict = normalizer.normalize_output(condition_dict)
            
            payload = BaseEntityUtils.create_success_payload(
                normalizer,
                normalized_dict,
                'Trade condition updated successfully'
            )
            return jsonify(payload), 200
            
        except Exception as e:
            db_session.rollback()
            raise e
        finally:
            db_session.close()
            
    except Exception as e:
        logger.error(f"Error updating trade condition {condition_id}: {e}")
        payload = BaseEntityUtils.create_error_payload(
            normalizer,
            str(e)
        )
        return jsonify(payload), 500

@trade_conditions_bp.route('/<int:condition_id>', methods=['DELETE'])
def delete_trade_condition(condition_id):
    """Delete trade condition"""
    normalizer = _get_date_normalizer()
    try:
        # Get database session
        db_session = next(get_db())
        
        try:
            # Get user_id from Flask context (set by auth middleware)
            from flask import g
            user_id = getattr(g, 'user_id', None)
            
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
            
            # Verify trade belongs to user
            if user_id is not None:
                trade = db_session.query(Trade).filter(
                    Trade.id == condition.trade_id,
                    Trade.user_id == user_id
                ).first()
                if not trade:
                    payload = BaseEntityUtils.create_error_payload(
                        normalizer,
                        f'Trade condition with ID {condition_id} does not belong to user',
                        {"code": "ACCESS_DENIED"}
                    )
                    return jsonify(payload), 403
            
            # Delete condition
            db_session.delete(condition)
            db_session.commit()
            
            payload = BaseEntityUtils.create_success_payload(
                normalizer,
                None,
                'Trade condition deleted successfully'
            )
            return jsonify(payload), 200
            
        except Exception as e:
            db_session.rollback()
            raise e
        finally:
            db_session.close()
            
    except Exception as e:
        logger.error(f"Error deleting trade condition {condition_id}: {e}")
        payload = BaseEntityUtils.create_error_payload(
            normalizer,
            str(e)
        )
        return jsonify(payload), 500

@trade_conditions_bp.route('/<int:condition_id>/test', methods=['POST'])
def test_trade_condition(condition_id):
    """Test trade condition against current market data"""
    normalizer = _get_date_normalizer()
    try:
        # Get database session
        db_session = next(get_db())
        
        try:
            # Get user_id from Flask context (set by auth middleware)
            from flask import g
            user_id = getattr(g, 'user_id', None)
            
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
            
            # Verify trade belongs to user
            query = db_session.query(Trade).filter(Trade.id == condition.trade_id)
            if user_id is not None:
                query = query.filter(Trade.user_id == user_id)
            trade = query.first()
            
            if not trade:
                payload = BaseEntityUtils.create_error_payload(
                    normalizer,
                    'Trade not found or does not belong to user',
                    {"code": "TRADE_NOT_FOUND"}
                )
                return jsonify(payload), 404
            
            # TODO: Implement condition evaluation service
            # For now, return a placeholder response
            data = {
                'condition_id': condition_id,
                'ticker_id': trade.ticker_id,
                'evaluation_result': 'pending',
                'message': 'Condition evaluation not yet implemented'
            }
            payload = BaseEntityUtils.create_success_payload(
                normalizer,
                data,
                "Condition test completed"
            )
            return jsonify(payload), 200
            
        finally:
            db_session.close()
            
    except Exception as e:
        logger.error(f"Error testing trade condition {condition_id}: {e}")
        payload = BaseEntityUtils.create_error_payload(
            normalizer,
            str(e)
        )
        return jsonify(payload), 500

@trade_conditions_bp.route('/validate', methods=['POST'])
def validate_trade_condition():
    """Validate trade condition data without creating it"""
    normalizer = _get_date_normalizer()
    try:
        data = request.get_json()
        if not data:
            payload = BaseEntityUtils.create_error_payload(
                normalizer,
                'No data provided',
                {"code": "NO_DATA"}
            )
            return jsonify(payload), 400
        
        # Get database session
        db_session = next(get_db())
        
        try:
            # Validate data
            validator = ConditionsValidationService(db_session)
            is_valid, validation_result = validator.validate_condition_data(data, 'trade')
            
            if is_valid:
                payload = BaseEntityUtils.create_success_payload(
                    normalizer,
                    None,
                    'Validation passed'
                )
                return jsonify(payload), 200
            else:
                # Normalize validation_result if it contains dates
                normalized_result = normalizer.normalize_output(validation_result)
                payload = BaseEntityUtils.create_error_payload(
                    normalizer,
                    'Validation failed',
                    normalized_result
                )
                return jsonify(payload), 400
            
        finally:
            db_session.close()
            
    except Exception as e:
        logger.error(f"Error validating trade condition: {e}")
        payload = BaseEntityUtils.create_error_payload(
            normalizer,
            str(e)
        )
        return jsonify(payload), 500

@trade_conditions_bp.route('/inherit-from-plan', methods=['POST'])
def inherit_conditions_from_plan():
    """Inherit conditions from a trade plan to a trade"""
    try:
        # Get user_id from Flask context (set by auth middleware)
        from flask import g
        user_id = getattr(g, 'user_id', None)
        
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
            # Check if trade exists and belongs to user
            query = db_session.query(Trade).filter(Trade.id == trade_id)
            if user_id is not None:
                query = query.filter(Trade.user_id == user_id)
            trade = query.first()
            if not trade:
                return jsonify({
                    'status': 'error',
                    'message': f'Trade with ID {trade_id} not found or does not belong to user',
                    'error_code': 'TRADE_NOT_FOUND'
                }), 404
            
            # Check if plan exists and belongs to user
            from models.trade_plan import TradePlan
            query = db_session.query(TradePlan).filter(TradePlan.id == plan_id)
            if user_id is not None:
                query = query.filter(TradePlan.user_id == user_id)
            plan = query.first()
            if not plan:
                return jsonify({
                    'status': 'error',
                    'message': f'Trade plan with ID {plan_id} not found or does not belong to user',
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
            
            # Normalize dates in result
            normalizer = _get_date_normalizer()
            normalized_result = normalizer.normalize_output(result)
            
            payload = BaseEntityUtils.create_success_payload(
                normalizer,
                normalized_result,
                f'{len(result)} conditions inherited from plan',
                extra={'count': len(result)}
            )
            return jsonify(payload), 201
            
        except Exception as e:
            db_session.rollback()
            raise e
        finally:
            db_session.close()
            
    except Exception as e:
        logger.error(f"Error inheriting conditions from plan: {e}")
        normalizer = _get_date_normalizer()
        payload = BaseEntityUtils.create_error_payload(
            normalizer,
            str(e)
        )
        return jsonify(payload), 500

@trade_conditions_bp.route('/bulk', methods=['POST'])
def create_bulk_trade_conditions():
    """Create multiple trade conditions at once"""
    try:
        # Get user_id from Flask context (set by auth middleware)
        from flask import g
        user_id = getattr(g, 'user_id', None)
        
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
            # Check if trade exists and belongs to user
            query = db_session.query(Trade).filter(Trade.id == trade_id)
            if user_id is not None:
                query = query.filter(Trade.user_id == user_id)
            trade = query.first()
            if not trade:
                return jsonify({
                    'status': 'error',
                    'message': f'Trade with ID {trade_id} not found or does not belong to user',
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
            
            # Normalize dates in result
            normalizer = _get_date_normalizer()
            normalized_result = normalizer.normalize_output(result)
            
            payload = BaseEntityUtils.create_success_payload(
                normalizer,
                normalized_result,
                f'{len(result)} trade conditions created successfully',
                extra={'count': len(result)}
            )
            return jsonify(payload), 201
            
        except Exception as e:
            db_session.rollback()
            raise e
        finally:
            db_session.close()
            
    except Exception as e:
        logger.error(f"Error creating bulk trade conditions: {e}")
        normalizer = _get_date_normalizer()
        payload = BaseEntityUtils.create_error_payload(
            normalizer,
            str(e)
        )
        return jsonify(payload), 500

@trade_conditions_bp.route('/<int:condition_id>/evaluate', methods=['POST'])
def evaluate_condition(condition_id):
    """Evaluate a single trade condition"""
    normalizer = _get_date_normalizer()
    try:
        # Get database session
        db_session = next(get_db())
        
        try:
            # Get user_id from Flask context (set by auth middleware)
            from flask import g
            user_id = getattr(g, 'user_id', None)
            
            # Get condition with relationships
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
            
            # Verify trade belongs to user
            if user_id is not None:
                trade = db_session.query(Trade).filter(
                    Trade.id == condition.trade_id,
                    Trade.user_id == user_id
                ).first()
                if not trade:
                    payload = BaseEntityUtils.create_error_payload(
                        normalizer,
                        f'Trade condition with ID {condition_id} does not belong to user',
                        {"code": "ACCESS_DENIED"}
                    )
                    return jsonify(payload), 403
            
            # Import and use ConditionEvaluator
            from services.condition_evaluator import ConditionEvaluator
            evaluator = ConditionEvaluator(db_session)
            
            # Evaluate condition
            result = evaluator.evaluate_condition(condition)
            
            # Normalize dates in result
            normalized_result = normalizer.normalize_output(result)
            
            payload = BaseEntityUtils.create_success_payload(
                normalizer,
                normalized_result,
                'Condition evaluated successfully'
            )
            return jsonify(payload), 200
            
        except Exception as e:
            raise e
        finally:
            db_session.close()
            
    except Exception as e:
        logger.error(f"Error evaluating condition {condition_id}: {str(e)}")
        payload = BaseEntityUtils.create_error_payload(
            normalizer,
            f'Error evaluating condition: {str(e)}',
            {"code": "EVALUATION_ERROR"}
        )
        return jsonify(payload), 500

@trade_conditions_bp.route('/evaluate-all', methods=['POST'])
def evaluate_all_conditions():
    """Evaluate all active trade conditions"""
    normalizer = _get_date_normalizer()
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
            
            # Normalize dates in results
            normalized_results = normalizer.normalize_output(trade_results)
            
            payload = BaseEntityUtils.create_success_payload(
                normalizer,
                normalized_results,
                f'{len(trade_results)} trade conditions evaluated',
                extra={'count': len(trade_results)}
            )
            return jsonify(payload), 200
            
        except Exception as e:
            raise e
        finally:
            db_session.close()
            
    except Exception as e:
        logger.error(f"Error evaluating all conditions: {str(e)}")
        payload = BaseEntityUtils.create_error_payload(
            normalizer,
            f'Error evaluating all conditions: {str(e)}',
            {"code": "EVALUATION_ERROR"}
        )
        return jsonify(payload), 500

@trade_conditions_bp.route('/<int:condition_id>/evaluation-history', methods=['GET'])
def get_evaluation_history(condition_id):
    """Get evaluation history for a condition (from alerts)"""
    normalizer = _get_date_normalizer()
    try:
        # Get database session
        db_session = next(get_db())
        
        try:
            # Get user_id from Flask context (set by auth middleware)
            from flask import g
            user_id = getattr(g, 'user_id', None)
            
            # Check if condition exists
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
            
            # Verify trade belongs to user
            if user_id is not None:
                trade = db_session.query(Trade).filter(
                    Trade.id == condition.trade_id,
                    Trade.user_id == user_id
                ).first()
                if not trade:
                    payload = BaseEntityUtils.create_error_payload(
                        normalizer,
                        f'Trade condition with ID {condition_id} does not belong to user',
                        {"code": "ACCESS_DENIED"}
                    )
                    return jsonify(payload), 403
            
            # Get alerts related to this condition (filtered by user_id)
            from models.alert import Alert
            query = db_session.query(Alert).filter(
                Alert.related_id == condition_id
            )
            if user_id is not None:
                query = query.filter(Alert.user_id == user_id)
            alerts = query.order_by(Alert.triggered_at.desc()).limit(50).all()
            
            # Convert to evaluation history format
            history = []
            for alert in alerts:
                if alert.triggered_at:  # Only include triggered alerts
                    history.append({
                        'evaluation_time': alert.triggered_at,  # Keep as datetime for normalization
                        'condition_met': True,
                        'alert_id': alert.id,
                        'message': alert.message,
                        'price': float(alert.condition_number) if alert.condition_number else 0
                    })
            
            # Normalize dates in history
            normalized_history = normalizer.normalize_output(history)
            
            payload = BaseEntityUtils.create_success_payload(
                normalizer,
                normalized_history,
                f'Found {len(history)} evaluation records',
                extra={'count': len(history)}
            )
            return jsonify(payload), 200
            
        except Exception as e:
            raise e
        finally:
            db_session.close()
            
    except Exception as e:
        logger.error(f"Error getting evaluation history for condition {condition_id}: {str(e)}")
        payload = BaseEntityUtils.create_error_payload(
            normalizer,
            f'Error getting evaluation history: {str(e)}',
            {"code": "HISTORY_ERROR"}
        )
        return jsonify(payload), 500

@trade_conditions_bp.route('/<int:condition_id>/create-alert', methods=['POST'])
def create_condition_alert(condition_id):
    """Create alert manually for a condition"""
    try:
        # Get user_id from Flask context (set by auth middleware)
        from flask import g
        user_id = getattr(g, 'user_id', None)
        
        db_session = next(get_db())
        try:
            condition = db_session.query(TradeCondition).filter(TradeCondition.id == condition_id).first()
            if not condition:
                return jsonify({'status': 'error', 'message': f'Trade condition with ID {condition_id} not found'}), 404
            
            # Verify trade belongs to user
            if user_id is not None:
                trade = db_session.query(Trade).filter(
                    Trade.id == condition.trade_id,
                    Trade.user_id == user_id
                ).first()
                if not trade:
                    return jsonify({'status': 'error', 'message': f'Trade condition with ID {condition_id} does not belong to user'}), 403
            
            # Check if alert already exists
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
        # Get user_id from Flask context (set by auth middleware)
        from flask import g
        user_id = getattr(g, 'user_id', None)
        
        db_session = next(get_db())
        try:
            # Verify condition belongs to user
            condition = db_session.query(TradeCondition).filter(TradeCondition.id == condition_id).first()
            if condition and user_id is not None:
                trade = db_session.query(Trade).filter(
                    Trade.id == condition.trade_id,
                    Trade.user_id == user_id
                ).first()
                if not trade:
                    return jsonify({'status': 'error', 'message': f'Trade condition with ID {condition_id} does not belong to user'}), 403
            
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
        # Get user_id from Flask context (set by auth middleware)
        from flask import g
        user_id = getattr(g, 'user_id', None)
        
        db_session = next(get_db())
        try:
            condition = db_session.query(TradeCondition).filter(TradeCondition.id == condition_id).first()
            if not condition:
                return jsonify({'status': 'error', 'message': f'Trade condition with ID {condition_id} not found'}), 404
            
            # Verify trade belongs to user
            if user_id is not None:
                trade = db_session.query(Trade).filter(
                    Trade.id == condition.trade_id,
                    Trade.user_id == user_id
                ).first()
                if not trade:
                    return jsonify({'status': 'error', 'message': f'Trade condition with ID {condition_id} does not belong to user'}), 403
            
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
