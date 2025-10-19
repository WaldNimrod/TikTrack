"""
Plan Conditions API Routes
API endpoints for plan conditions management
"""

from flask import Blueprint, request, jsonify
from datetime import datetime
import logging
import json
from typing import Dict, Any

from models.plan_condition import PlanCondition
from models.trade_plan import TradePlan
from services.conditions_validation_service import ConditionsValidationService
from config.database import get_db

logger = logging.getLogger(__name__)

# Create blueprint
plan_conditions_bp = Blueprint('plan_conditions', __name__, url_prefix='/api/plan-conditions')

@plan_conditions_bp.route('/trade-plans/<int:plan_id>/conditions', methods=['GET'])
def get_plan_conditions(plan_id):
    """Get all conditions for a specific trade plan"""
    try:
        # Get database session
        db_session = next(get_db())
        
        try:
            # Check if trade plan exists
            plan = db_session.query(TradePlan).filter(TradePlan.id == plan_id).first()
            if not plan:
                return jsonify({
                    'status': 'error',
                    'message': f'Trade plan with ID {plan_id} not found',
                    'error_code': 'PLAN_NOT_FOUND'
                }), 404
            
            # Get conditions
            conditions = db_session.query(PlanCondition).filter(
                PlanCondition.trade_plan_id == plan_id
            ).order_by(PlanCondition.condition_group, PlanCondition.created_at).all()
            
            # Convert to dictionary
            result = []
            for condition in conditions:
                condition_dict = condition.to_dict()
                result.append(condition_dict)
            
            return jsonify({
                'status': 'success',
                'data': result,
                'count': len(result),
                'trade_plan_id': plan_id,
                'timestamp': datetime.now().isoformat()
            }), 200
            
        finally:
            db_session.close()
            
    except Exception as e:
        logger.error(f"Error getting plan conditions for plan {plan_id}: {e}")
        return jsonify({
            'status': 'error',
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@plan_conditions_bp.route('/trade-plans/<int:plan_id>/conditions', methods=['POST'])
def create_plan_condition(plan_id):
    """Create new condition for a trade plan"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                'status': 'error',
                'message': 'No data provided',
                'error_code': 'NO_DATA'
            }), 400
        
        # Add trade_plan_id to data
        data['trade_plan_id'] = plan_id
        
        # Get database session
        db_session = next(get_db())
        
        try:
            # Check if trade plan exists
            plan = db_session.query(TradePlan).filter(TradePlan.id == plan_id).first()
            if not plan:
                return jsonify({
                    'status': 'error',
                    'message': f'Trade plan with ID {plan_id} not found',
                    'error_code': 'PLAN_NOT_FOUND'
                }), 404
            
            # Validate data
            validator = ConditionsValidationService(db_session)
            is_valid, validation_result = validator.validate_condition_data(data, 'plan')
            
            if not is_valid:
                return jsonify(validation_result), 400
            
            # Create condition
            # Convert parameters_json to string if it's a dict
            parameters_json = data['parameters_json']
            if isinstance(parameters_json, dict):
                import json
                parameters_json = json.dumps(parameters_json, ensure_ascii=False)
            
            condition = PlanCondition(
                trade_plan_id=plan_id,
                method_id=data['method_id'],
                condition_group=data.get('condition_group', 0),
                parameters_json=parameters_json,
                logical_operator=data.get('logical_operator', 'NONE'),
                is_active=data.get('is_active', True)
            )
            
            db_session.add(condition)
            db_session.commit()
            
            # Return created condition
            condition_dict = condition.to_dict()
            
            return jsonify({
                'status': 'success',
                'data': condition_dict,
                'message': 'Plan condition created successfully',
                'timestamp': datetime.now().isoformat()
            }), 201
            
        except Exception as e:
            db_session.rollback()
            raise e
        finally:
            db_session.close()
            
    except Exception as e:
        logger.error(f"Error creating plan condition for plan {plan_id}: {e}")
        return jsonify({
            'status': 'error',
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@plan_conditions_bp.route('/<int:condition_id>', methods=['GET'])
def get_plan_condition(condition_id):
    """Get specific plan condition"""
    try:
        # Get database session
        db_session = next(get_db())
        
        try:
            condition = db_session.query(PlanCondition).filter(
                PlanCondition.id == condition_id
            ).first()
            
            if not condition:
                return jsonify({
                    'status': 'error',
                    'message': f'Plan condition with ID {condition_id} not found',
                    'error_code': 'CONDITION_NOT_FOUND'
                }), 404
            
            # Convert to dictionary
            condition_dict = condition.to_dict()
            
            return jsonify({
                'status': 'success',
                'data': condition_dict,
                'timestamp': datetime.now().isoformat()
            }), 200
            
        finally:
            db_session.close()
            
    except Exception as e:
        logger.error(f"Error getting plan condition {condition_id}: {e}")
        return jsonify({
            'status': 'error',
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@plan_conditions_bp.route('/<int:condition_id>', methods=['PUT'])
def update_plan_condition(condition_id):
    """Update plan condition"""
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
            condition = db_session.query(PlanCondition).filter(
                PlanCondition.id == condition_id
            ).first()
            
            if not condition:
                return jsonify({
                    'status': 'error',
                    'message': f'Plan condition with ID {condition_id} not found',
                    'error_code': 'CONDITION_NOT_FOUND'
                }), 404
            
            # Add trade_plan_id to data for validation
            data['trade_plan_id'] = condition.trade_plan_id
            
            # Validate data
            validator = ConditionsValidationService(db_session)
            is_valid, validation_result = validator.validate_condition_data(data, 'plan')
            
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
            condition.is_active = data.get('is_active', condition.is_active)
            
            db_session.commit()
            
            # Return updated condition
            condition_dict = condition.to_dict()
            
            return jsonify({
                'status': 'success',
                'data': condition_dict,
                'message': 'Plan condition updated successfully',
                'timestamp': datetime.now().isoformat()
            }), 200
            
        except Exception as e:
            db_session.rollback()
            raise e
        finally:
            db_session.close()
            
    except Exception as e:
        logger.error(f"Error updating plan condition {condition_id}: {e}")
        return jsonify({
            'status': 'error',
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@plan_conditions_bp.route('/<int:condition_id>', methods=['DELETE'])
def delete_plan_condition(condition_id):
    """Delete plan condition"""
    try:
        # Get database session
        db_session = next(get_db())
        
        try:
            condition = db_session.query(PlanCondition).filter(
                PlanCondition.id == condition_id
            ).first()
            
            if not condition:
                return jsonify({
                    'status': 'error',
                    'message': f'Plan condition with ID {condition_id} not found',
                    'error_code': 'CONDITION_NOT_FOUND'
                }), 404
            
            # Check if condition is inherited by trade conditions
            from models.plan_condition import TradeCondition
            inherited_count = db_session.query(TradeCondition).filter(
                TradeCondition.inherited_from_plan_condition_id == condition_id
            ).count()
            
            if inherited_count > 0:
                return jsonify({
                    'status': 'error',
                    'message': f'Cannot delete condition. It is inherited by {inherited_count} trade conditions',
                    'error_code': 'CONDITION_INHERITED'
                }), 400
            
            # Delete condition
            db_session.delete(condition)
            db_session.commit()
            
            return jsonify({
                'status': 'success',
                'message': 'Plan condition deleted successfully',
                'timestamp': datetime.now().isoformat()
            }), 200
            
        except Exception as e:
            db_session.rollback()
            raise e
        finally:
            db_session.close()
            
    except Exception as e:
        logger.error(f"Error deleting plan condition {condition_id}: {e}")
        return jsonify({
            'status': 'error',
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@plan_conditions_bp.route('/<int:condition_id>/test', methods=['POST'])
def test_plan_condition(condition_id):
    """Test plan condition against current market data"""
    try:
        # Get database session
        db_session = next(get_db())
        
        try:
            condition = db_session.query(PlanCondition).filter(
                PlanCondition.id == condition_id
            ).first()
            
            if not condition:
                return jsonify({
                    'status': 'error',
                    'message': f'Plan condition with ID {condition_id} not found',
                    'error_code': 'CONDITION_NOT_FOUND'
                }), 404
            
            # Get trade plan to get ticker
            plan = db_session.query(TradePlan).filter(
                TradePlan.id == condition.trade_plan_id
            ).first()
            
            if not plan:
                return jsonify({
                    'status': 'error',
                    'message': 'Trade plan not found',
                    'error_code': 'PLAN_NOT_FOUND'
                }), 404
            
            # TODO: Implement condition evaluation service
            # For now, return a placeholder response
            return jsonify({
                'status': 'success',
                'data': {
                    'condition_id': condition_id,
                    'ticker_id': plan.ticker_id,
                    'evaluation_result': 'pending',
                    'message': 'Condition evaluation not yet implemented'
                },
                'timestamp': datetime.now().isoformat()
            }), 200
            
        finally:
            db_session.close()
            
    except Exception as e:
        logger.error(f"Error testing plan condition {condition_id}: {e}")
        return jsonify({
            'status': 'error',
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@plan_conditions_bp.route('/validate', methods=['POST'])
def validate_plan_condition():
    """Validate plan condition data without creating it"""
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
            is_valid, validation_result = validator.validate_condition_data(data, 'plan')
            
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
        logger.error(f"Error validating plan condition: {e}")
        return jsonify({
            'status': 'error',
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@plan_conditions_bp.route('/bulk', methods=['POST'])
def create_bulk_plan_conditions():
    """Create multiple plan conditions at once"""
    try:
        data = request.get_json()
        if not data or 'conditions' not in data:
            return jsonify({
                'status': 'error',
                'message': 'No conditions data provided',
                'error_code': 'NO_DATA'
            }), 400
        
        conditions_data = data['conditions']
        plan_id = data.get('trade_plan_id')
        
        if not plan_id:
            return jsonify({
                'status': 'error',
                'message': 'trade_plan_id is required',
                'error_code': 'MISSING_PLAN_ID'
            }), 400
        
        # Get database session
        db_session = next(get_db())
        
        try:
            # Check if trade plan exists
            plan = db_session.query(TradePlan).filter(TradePlan.id == plan_id).first()
            if not plan:
                return jsonify({
                    'status': 'error',
                    'message': f'Trade plan with ID {plan_id} not found',
                    'error_code': 'PLAN_NOT_FOUND'
                }), 404
            
            # Validate all conditions
            validator = ConditionsValidationService(db_session)
            is_valid, validation_result = validator.validate_bulk_conditions(conditions_data, 'plan')
            
            if not is_valid:
                return jsonify(validation_result), 400
            
            # Create conditions
            created_conditions = []
            for condition_data in conditions_data:
                condition_data['trade_plan_id'] = plan_id
                
                # Convert parameters_json to string if it's a dict
                parameters_json = condition_data['parameters_json']
                if isinstance(parameters_json, dict):
                    import json
                    parameters_json = json.dumps(parameters_json, ensure_ascii=False)
                
                condition = PlanCondition(
                    trade_plan_id=plan_id,
                    method_id=condition_data['method_id'],
                    condition_group=condition_data.get('condition_group', 0),
                    parameters_json=parameters_json,
                    logical_operator=condition_data.get('logical_operator', 'NONE'),
                    is_active=condition_data.get('is_active', True)
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
                'message': f'{len(result)} plan conditions created successfully',
                'timestamp': datetime.now().isoformat()
            }), 201
            
        except Exception as e:
            db_session.rollback()
            raise e
        finally:
            db_session.close()
            
    except Exception as e:
        logger.error(f"Error creating bulk plan conditions: {e}")
        return jsonify({
            'status': 'error',
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500
