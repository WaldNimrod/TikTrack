#!/usr/bin/env python3
"""
Plan Conditions List API Routes
Date: October 30, 2025
Description: API routes for listing all plan conditions from database table
Updated: 17 November 2025 - Migrated to SQLAlchemy
"""

from flask import Blueprint, request, jsonify
from sqlalchemy.orm import Session
from config.database import get_db
from models.plan_condition import PlanCondition
from services.advanced_cache_service import cache_for
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

# Create blueprint
plan_conditions_list_bp = Blueprint('plan_conditions_list', __name__, url_prefix='/api/plan-conditions')

@plan_conditions_list_bp.route('/', methods=['GET'])
@cache_for(ttl=300)  # Cache for 5 minutes
def get_plan_conditions():
    """Get all plan conditions using SQLAlchemy"""
    db: Session = next(get_db())
    try:
        conditions = db.query(PlanCondition).order_by(PlanCondition.id).all()
        
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
    finally:
        db.close()
