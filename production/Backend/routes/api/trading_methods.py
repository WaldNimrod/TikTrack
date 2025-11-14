"""
Trading Methods API Routes
API endpoints for trading methods management
"""

from flask import Blueprint, request, jsonify
from datetime import datetime
import logging
from typing import Dict, Any

from models.trading_method import TradingMethod, MethodParameter
from services.conditions_validation_service import ConditionsValidationService
from config.database import get_db
from services.trading_methods_seed_data import METHODS_DEFINITION

logger = logging.getLogger(__name__)

# Create blueprint
trading_methods_bp = Blueprint('trading_methods', __name__, url_prefix='/api/trading-methods')

def _seed_trading_methods_if_empty(db_session) -> bool:
    """Ensure trading methods master data exists"""
    existing_count = db_session.query(TradingMethod).count()
    if existing_count > 0:
        return False

    timestamp = datetime.utcnow()
    for method_def in METHODS_DEFINITION:
        method = TradingMethod(
            name_en=method_def['name_en'],
            name_he=method_def['name_he'],
            category=method_def['category'],
            description_en=method_def.get('description_en'),
            description_he=method_def.get('description_he'),
            icon_class=method_def.get('icon_class'),
            is_active=True,
            sort_order=method_def.get('sort_order', 0),
        )
        method.created_at = timestamp
        method.updated_at = timestamp
        db_session.add(method)
        db_session.flush()

        for param_def in method_def.get('parameters', []):
            parameter = MethodParameter(
                method_id=method.id,
                parameter_key=param_def['parameter_key'],
                parameter_name_en=param_def['parameter_name_en'],
                parameter_name_he=param_def['parameter_name_he'],
                parameter_type=param_def['parameter_type'],
                default_value=param_def.get('default_value'),
                min_value=param_def.get('min_value'),
                max_value=param_def.get('max_value'),
                validation_rule=param_def.get('validation_rule'),
                is_required=param_def.get('is_required', True),
                sort_order=param_def.get('sort_order', 0),
                help_text_en=param_def.get('help_text_en'),
                help_text_he=param_def.get('help_text_he'),
            )
            parameter.created_at = timestamp
            parameter.updated_at = timestamp
            db_session.add(parameter)

    db_session.commit()
    logger.info("Seeded trading methods master data (auto-recovery)")
    return True


@trading_methods_bp.route('/', methods=['GET'])
def get_trading_methods():
    """Get all trading methods with optional filtering"""
    try:
        # Query parameters
        category = request.args.get('category')
        is_active = request.args.get('is_active', type=bool)
        include_parameters = request.args.get('include_parameters', 'false').lower() == 'true'
        
        # Get database session
        db_session = next(get_db())
        
        try:
            # Build query
            query = db_session.query(TradingMethod)
            
            if category:
                query = query.filter(TradingMethod.category == category)
            
            if is_active is not None:
                query = query.filter(TradingMethod.is_active == is_active)
            
            # Order by sort_order and name
            query = query.order_by(TradingMethod.sort_order, TradingMethod.name_en)
            
            methods = query.all()

            if not methods:
                seeded = _seed_trading_methods_if_empty(db_session)
                if seeded:
                    methods = query.all()
            
            # Convert to dictionary
            result = []
            for method in methods:
                method_dict = method.to_dict()
                
                # Include parameters if requested
                if include_parameters:
                    method_dict['parameters'] = [param.to_dict() for param in method.parameters]
                
                result.append(method_dict)
            
            return jsonify({
                'status': 'success',
                'data': result,
                'count': len(result),
                'timestamp': datetime.now().isoformat()
            }), 200
            
        finally:
            db_session.close()
            
    except Exception as e:
        logger.error(f"Error getting trading methods: {e}")
        return jsonify({
            'status': 'error',
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@trading_methods_bp.route('/<int:method_id>', methods=['GET'])
def get_trading_method(method_id):
    """Get specific trading method with parameters"""
    try:
        # Get database session
        db_session = next(get_db())
        
        try:
            method = db_session.query(TradingMethod).filter(
                TradingMethod.id == method_id
            ).first()
            
            if not method:
                return jsonify({
                    'status': 'error',
                    'message': f'Trading method with ID {method_id} not found',
                    'error_code': 'METHOD_NOT_FOUND'
                }), 404
            
            # Convert to dictionary with parameters
            method_dict = method.to_dict()
            method_dict['parameters'] = [param.to_dict() for param in method.parameters]
            
            return jsonify({
                'status': 'success',
                'data': method_dict,
                'timestamp': datetime.now().isoformat()
            }), 200
            
        finally:
            db_session.close()
            
    except Exception as e:
        logger.error(f"Error getting trading method {method_id}: {e}")
        return jsonify({
            'status': 'error',
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@trading_methods_bp.route('/categories', methods=['GET'])
def get_categories():
    """Get all available categories"""
    try:
        # Get database session
        db_session = next(get_db())
        
        try:
            # Get distinct categories
            categories = db_session.query(TradingMethod.category).distinct().all()
            
            # Convert to list
            category_list = [cat[0] for cat in categories]
            
            # Add category display names
            category_display = {
                'technical_indicators': 'Technical Indicators',
                'price_patterns': 'Price Patterns',
                'support_resistance': 'Support & Resistance',
                'trend_analysis': 'Trend Analysis',
                'volume_analysis': 'Volume Analysis',
                'fibonacci': 'Fibonacci'
            }
            
            result = []
            for category in category_list:
                result.append({
                    'value': category,
                    'display_name': category_display.get(category, category.title()),
                    'display_name_he': _get_category_hebrew_name(category)
                })
            
            return jsonify({
                'status': 'success',
                'data': result,
                'timestamp': datetime.now().isoformat()
            }), 200
            
        finally:
            db_session.close()
            
    except Exception as e:
        logger.error(f"Error getting categories: {e}")
        return jsonify({
            'status': 'error',
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@trading_methods_bp.route('/', methods=['POST'])
def create_trading_method():
    """Create new trading method"""
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
            is_valid, validation_result = validator.validate_trading_method(data)
            
            if not is_valid:
                return jsonify(validation_result), 400
            
            # Create method
            method = TradingMethod(
                name_en=data['name_en'],
                name_he=data['name_he'],
                category=data['category'],
                description_en=data.get('description_en'),
                description_he=data.get('description_he'),
                icon_class=data.get('icon_class'),
                is_active=data.get('is_active', True),
                sort_order=data.get('sort_order', 0)
            )
            
            db_session.add(method)
            db_session.flush()  # Get the ID
            
            # Add parameters if provided
            if 'parameters' in data:
                for param_data in data['parameters']:
                    param = MethodParameter(
                        method_id=method.id,
                        parameter_key=param_data['parameter_key'],
                        parameter_name_en=param_data['parameter_name_en'],
                        parameter_name_he=param_data['parameter_name_he'],
                        parameter_type=param_data['parameter_type'],
                        default_value=param_data.get('default_value'),
                        min_value=param_data.get('min_value'),
                        max_value=param_data.get('max_value'),
                        validation_rule=param_data.get('validation_rule'),
                        is_required=param_data.get('is_required', True),
                        sort_order=param_data.get('sort_order', 0),
                        help_text_en=param_data.get('help_text_en'),
                        help_text_he=param_data.get('help_text_he')
                    )
                    db_session.add(param)
            
            db_session.commit()
            
            # Return created method
            method_dict = method.to_dict()
            method_dict['parameters'] = [param.to_dict() for param in method.parameters]
            
            return jsonify({
                'status': 'success',
                'data': method_dict,
                'message': 'Trading method created successfully',
                'timestamp': datetime.now().isoformat()
            }), 201
            
        except Exception as e:
            db_session.rollback()
            raise e
        finally:
            db_session.close()
            
    except Exception as e:
        logger.error(f"Error creating trading method: {e}")
        return jsonify({
            'status': 'error',
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@trading_methods_bp.route('/<int:method_id>', methods=['PUT'])
def update_trading_method(method_id):
    """Update trading method"""
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
            method = db_session.query(TradingMethod).filter(
                TradingMethod.id == method_id
            ).first()
            
            if not method:
                return jsonify({
                    'status': 'error',
                    'message': f'Trading method with ID {method_id} not found',
                    'error_code': 'METHOD_NOT_FOUND'
                }), 404
            
            # Add ID to data for validation
            data['id'] = method_id
            
            # Validate data
            validator = ConditionsValidationService(db_session)
            is_valid, validation_result = validator.validate_trading_method(data)
            
            if not is_valid:
                return jsonify(validation_result), 400
            
            # Update method
            method.name_en = data['name_en']
            method.name_he = data['name_he']
            method.category = data['category']
            method.description_en = data.get('description_en')
            method.description_he = data.get('description_he')
            method.icon_class = data.get('icon_class')
            method.is_active = data.get('is_active', method.is_active)
            method.sort_order = data.get('sort_order', method.sort_order)
            
            # Update parameters if provided
            if 'parameters' in data:
                # Delete existing parameters
                db_session.query(MethodParameter).filter(
                    MethodParameter.method_id == method_id
                ).delete()
                
                # Add new parameters
                for param_data in data['parameters']:
                    param = MethodParameter(
                        method_id=method.id,
                        parameter_key=param_data['parameter_key'],
                        parameter_name_en=param_data['parameter_name_en'],
                        parameter_name_he=param_data['parameter_name_he'],
                        parameter_type=param_data['parameter_type'],
                        default_value=param_data.get('default_value'),
                        min_value=param_data.get('min_value'),
                        max_value=param_data.get('max_value'),
                        validation_rule=param_data.get('validation_rule'),
                        is_required=param_data.get('is_required', True),
                        sort_order=param_data.get('sort_order', 0),
                        help_text_en=param_data.get('help_text_en'),
                        help_text_he=param_data.get('help_text_he')
                    )
                    db_session.add(param)
            
            db_session.commit()
            
            # Return updated method
            method_dict = method.to_dict()
            method_dict['parameters'] = [param.to_dict() for param in method.parameters]
            
            return jsonify({
                'status': 'success',
                'data': method_dict,
                'message': 'Trading method updated successfully',
                'timestamp': datetime.now().isoformat()
            }), 200
            
        except Exception as e:
            db_session.rollback()
            raise e
        finally:
            db_session.close()
            
    except Exception as e:
        logger.error(f"Error updating trading method {method_id}: {e}")
        return jsonify({
            'status': 'error',
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@trading_methods_bp.route('/<int:method_id>', methods=['DELETE'])
def delete_trading_method(method_id):
    """Delete trading method"""
    try:
        # Get database session
        db_session = next(get_db())
        
        try:
            method = db_session.query(TradingMethod).filter(
                TradingMethod.id == method_id
            ).first()
            
            if not method:
                return jsonify({
                    'status': 'error',
                    'message': f'Trading method with ID {method_id} not found',
                    'error_code': 'METHOD_NOT_FOUND'
                }), 404
            
            # Check if method is in use
            from models.plan_condition import PlanCondition
            from models.trade_condition import TradeCondition
            
            plan_conditions_count = db_session.query(PlanCondition).filter(
                PlanCondition.method_id == method_id
            ).count()
            
            trade_conditions_count = db_session.query(TradeCondition).filter(
                TradeCondition.method_id == method_id
            ).count()
            
            if plan_conditions_count > 0 or trade_conditions_count > 0:
                return jsonify({
                    'status': 'error',
                    'message': f'Cannot delete method. It is used by {plan_conditions_count + trade_conditions_count} conditions',
                    'error_code': 'METHOD_IN_USE'
                }), 400
            
            # Delete method (parameters will be deleted by cascade)
            db_session.delete(method)
            db_session.commit()
            
            return jsonify({
                'status': 'success',
                'message': 'Trading method deleted successfully',
                'timestamp': datetime.now().isoformat()
            }), 200
            
        except Exception as e:
            db_session.rollback()
            raise e
        finally:
            db_session.close()
            
    except Exception as e:
        logger.error(f"Error deleting trading method {method_id}: {e}")
        return jsonify({
            'status': 'error',
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

def _get_category_hebrew_name(category: str) -> str:
    """Get Hebrew name for category"""
    category_names = {
        'technical_indicators': 'אינדיקטורים טכניים',
        'price_patterns': 'מבני מחיר',
        'support_resistance': 'תמיכה והתנגדות',
        'trend_analysis': 'ניתוח מגמות',
        'volume_analysis': 'ניתוח נפח',
        'fibonacci': 'פיבונאצ\'י'
    }
    return category_names.get(category, category.title())
