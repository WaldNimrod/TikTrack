#!/usr/bin/env python3
"""
Plan Conditions List API Routes
Date: October 30, 2025
Description: API routes for listing all plan conditions from database table
Updated: 17 November 2025 - Migrated to SQLAlchemy
"""

from flask import Blueprint, request, jsonify, g
from sqlalchemy.orm import Session
from config.database import get_db
from models.plan_condition import PlanCondition
from services.advanced_cache_service import cache_for
from routes.api.base_entity_decorators import handle_database_session
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

# Create blueprint
plan_conditions_list_bp = Blueprint('plan_conditions_list', __name__, url_prefix='/api/plan-conditions')

@plan_conditions_list_bp.route('/', methods=['GET'])
@handle_database_session()
@cache_for(ttl=300)  # Cache for 5 minutes
def get_plan_conditions():
    """Get all plan conditions for authenticated user using SQLAlchemy"""
    db: Session = g.db
    
    # Get user_id from Flask context (set by auth middleware)
    user_id = getattr(g, 'user_id', None)
    
    if user_id is None:
        return jsonify({
            'status': 'error',
            'message': 'User authentication required',
            'version': '1.0'
        }), 401
    
    try:
        # Filter by user_id through trade_plan - plan conditions belong to trade plans
        from models.trade_plan import TradePlan
        conditions = db.query(PlanCondition).join(
            TradePlan, PlanCondition.trade_plan_id == TradePlan.id
        ).filter(
            TradePlan.user_id == user_id
        ).order_by(PlanCondition.id).all()
        
        # Convert to list of dictionaries
        result = [condition.to_dict() for condition in conditions]
        
        return jsonify({
            'status': 'success',
            'message': f'Retrieved {len(result)} plan_conditions records',
            'data': result,
            'count': len(result),
            'version': '1.0'
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting plan conditions: {e}")
        return jsonify({
            'status': 'error',
            'message': f'Error retrieving plan conditions: {str(e)}',
            'version': '1.0'
        }), 500
