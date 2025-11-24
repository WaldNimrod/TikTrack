"""
Trading Methods API Routes
API endpoints for trading methods management
"""

from flask import Blueprint, request, jsonify
import logging
from typing import Dict, Any, List
from sqlalchemy.orm import Session

from models.trading_method import TradingMethod, MethodParameter
from .base_entity_decorators import handle_database_session
from .base_entity_utils import BaseEntityUtils
from services.preferences_service import PreferencesService

logger = logging.getLogger(__name__)
preferences_service = PreferencesService()


def _get_date_normalizer():
    return BaseEntityUtils.get_request_normalizer(request, preferences_service=preferences_service)


# Create blueprint
trading_methods_bp = Blueprint('trading_methods', __name__, url_prefix='/api/trading-methods')


@trading_methods_bp.route('/', methods=['GET'])
@handle_database_session()
def get_trading_methods():
    """Get all trading methods with optional parameters"""
    from flask import g
    try:
        db: Session = g.db
        
        # Check if parameters should be included
        include_parameters = request.args.get('include_parameters', 'false').lower() == 'true'
        
        # Query trading methods
        query = db.query(TradingMethod).filter(TradingMethod.is_active == True)
        query = query.order_by(TradingMethod.sort_order, TradingMethod.name_en)
        
        methods = query.all()
        
        # Convert to dictionaries
        methods_data = []
        for method in methods:
            method_dict = method.to_dict()
            
            # Include parameters if requested
            if include_parameters and hasattr(method, 'parameters'):
                method_dict['parameters'] = [param.to_dict() for param in method.parameters]
            
            methods_data.append(method_dict)
        
        normalizer = _get_date_normalizer()
        payload = BaseEntityUtils.create_success_payload(
            normalizer,
            data=methods_data,
            extra={"count": len(methods_data)}
        )
        
        return jsonify(payload), 200
        
    except Exception as e:
        logger.error(f"Error getting trading methods: {e}", exc_info=True)
        return jsonify({
            'status': 'error',
            'message': f'Failed to get trading methods: {str(e)}'
        }), 500


@trading_methods_bp.route('/<int:method_id>', methods=['GET'])
@handle_database_session()
def get_trading_method(method_id: int):
    """Get a specific trading method by ID"""
    from flask import g
    try:
        db: Session = g.db
        
        method = db.query(TradingMethod).filter(
            TradingMethod.id == method_id,
            TradingMethod.is_active == True
        ).first()
        
        if not method:
            return jsonify({
                'status': 'error',
                'message': f'Trading method with ID {method_id} not found'
            }), 404
        
        method_dict = method.to_dict()
        
        # Always include parameters for single method
        if hasattr(method, 'parameters'):
            method_dict['parameters'] = [param.to_dict() for param in method.parameters]
        
        normalizer = _get_date_normalizer()
        payload = BaseEntityUtils.create_success_payload(
            normalizer,
            data=method_dict
        )
        
        return jsonify(payload), 200
        
    except Exception as e:
        logger.error(f"Error getting trading method {method_id}: {e}", exc_info=True)
        return jsonify({
            'status': 'error',
            'message': f'Failed to get trading method: {str(e)}'
        }), 500

