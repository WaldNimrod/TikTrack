#!/usr/bin/env python3
"""
Constraints API Routes
Date: August 23, 2025
Description: API routes for managing database constraints dynamically
"""

from flask import Blueprint, request, jsonify
from typing import Dict, Any, List
import logging
import sys
import os

# Add the services directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..', 'services'))
from constraint_service import ConstraintService

# Create blueprint
constraints_bp = Blueprint('constraints', __name__)

# Initialize constraint service
constraint_service = ConstraintService()

logger = logging.getLogger(__name__)

@constraints_bp.route('/api/v1/constraints/', methods=['GET'])
def get_constraints():
    """
    Get all constraints or constraints for a specific table
    
    Query parameters:
    - table: Optional table name to filter constraints
    """
    try:
        table_name = request.args.get('table')
        
        if table_name:
            constraints = constraint_service.get_constraints_for_table(table_name)
            message = f"Retrieved constraints for table {table_name}"
        else:
            constraints = constraint_service.get_all_constraints()
            message = "Retrieved all constraints"
        
        return jsonify({
            'status': 'success',
            'message': message,
            'data': constraints,
            'count': len(constraints),
            'version': 'v1'
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting constraints: {e}")
        return jsonify({
            'status': 'error',
            'message': f'Error retrieving constraints: {str(e)}',
            'version': 'v1'
        }), 500

@constraints_bp.route('/api/v1/constraints/table/<table_name>', methods=['GET'])
def get_table_constraints(table_name: str):
    """
    Get all constraints for a specific table
    
    Args:
        table_name: Name of the table
    """
    try:
        constraints = constraint_service.get_constraints_for_table(table_name)
        
        return jsonify({
            'status': 'success',
            'message': f'Retrieved constraints for table {table_name}',
            'data': constraints,
            'count': len(constraints),
            'table_name': table_name,
            'version': 'v1'
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting constraints for table {table_name}: {e}")
        return jsonify({
            'status': 'error',
            'message': f'Error retrieving constraints for table {table_name}: {str(e)}',
            'version': 'v1'
        }), 500

@constraints_bp.route('/api/v1/constraints/column/<table_name>/<column_name>', methods=['GET'])
def get_column_constraints(table_name: str, column_name: str):
    """
    Get all constraints for a specific column
    
    Args:
        table_name: Name of the table
        column_name: Name of the column
    """
    try:
        constraints = constraint_service.get_constraints_for_column(table_name, column_name)
        
        return jsonify({
            'status': 'success',
            'message': f'Retrieved constraints for {table_name}.{column_name}',
            'data': constraints,
            'count': len(constraints),
            'table_name': table_name,
            'column_name': column_name,
            'version': 'v1'
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting constraints for {table_name}.{column_name}: {e}")
        return jsonify({
            'status': 'error',
            'message': f'Error retrieving constraints for {table_name}.{column_name}: {str(e)}',
            'version': 'v1'
        }), 500

@constraints_bp.route('/api/v1/constraints/validate', methods=['POST'])
def validate_field():
    """
    Validate a field value against its constraints
    
    Request body:
    {
        "table": "table_name",
        "column": "column_name", 
        "value": "value_to_validate"
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'status': 'error',
                'message': 'Request body is required',
                'version': 'v1'
            }), 400
        
        table_name = data.get('table')
        column_name = data.get('column')
        value = data.get('value')
        
        if not table_name or not column_name:
            return jsonify({
                'status': 'error',
                'message': 'Table name and column name are required',
                'version': 'v1'
            }), 400
        
        is_valid, error_message = constraint_service.validate_field_value(table_name, column_name, value)
        
        return jsonify({
            'status': 'success',
            'data': {
                'is_valid': is_valid,
                'error_message': error_message if not is_valid else None,
                'table_name': table_name,
                'column_name': column_name,
                'value': value
            },
            'version': 'v1'
        }), 200
        
    except Exception as e:
        logger.error(f"Error validating field: {e}")
        return jsonify({
            'status': 'error',
            'message': f'Error validating field: {str(e)}',
            'version': 'v1'
        }), 500

@constraints_bp.route('/api/v1/constraints/enum/<table_name>/<column_name>', methods=['GET'])
def get_enum_values(table_name: str, column_name: str):
    """
    Get enum values for a specific column
    
    Args:
        table_name: Name of the table
        column_name: Name of the column
    """
    try:
        enum_values = constraint_service.get_enum_values(table_name, column_name)
        
        return jsonify({
            'status': 'success',
            'message': f'Retrieved enum values for {table_name}.{column_name}',
            'data': enum_values,
            'count': len(enum_values),
            'table_name': table_name,
            'column_name': column_name,
            'version': 'v1'
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting enum values for {table_name}.{column_name}: {e}")
        return jsonify({
            'status': 'error',
            'message': f'Error retrieving enum values for {table_name}.{column_name}: {str(e)}',
            'version': 'v1'
        }), 500

@constraints_bp.route('/api/v1/constraints/', methods=['POST'])
def add_constraint():
    """
    Add a new constraint
    
    Request body:
    {
        "table_name": "table_name",
        "column_name": "column_name",
        "constraint_type": "ENUM|NOT_NULL|RANGE|UNIQUE",
        "constraint_name": "constraint_name",
        "constraint_definition": "constraint_definition",
        "enum_values": [  // Optional, for ENUM constraints
            {
                "value": "value1",
                "display_name": "Display Name 1",
                "sort_order": 1
            }
        ]
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'status': 'error',
                'message': 'Request body is required',
                'version': 'v1'
            }), 400
        
        required_fields = ['table_name', 'column_name', 'constraint_type', 'constraint_name', 'constraint_definition']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'status': 'error',
                    'message': f'Field {field} is required',
                    'version': 'v1'
                }), 400
        
        success, message = constraint_service.add_constraint(data)
        
        if success:
            return jsonify({
                'status': 'success',
                'message': message,
                'data': data,
                'version': 'v1'
            }), 201
        else:
            return jsonify({
                'status': 'error',
                'message': message,
                'version': 'v1'
            }), 400
        
    except Exception as e:
        logger.error(f"Error adding constraint: {e}")
        return jsonify({
            'status': 'error',
            'message': f'Error adding constraint: {str(e)}',
            'version': 'v1'
        }), 500

@constraints_bp.route('/api/v1/constraints/<int:constraint_id>', methods=['PUT'])
def update_constraint(constraint_id: int):
    """
    Update an existing constraint
    
    Args:
        constraint_id: ID of the constraint to update
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'status': 'error',
                'message': 'Request body is required',
                'version': 'v1'
            }), 400
        
        success, message = constraint_service.update_constraint(constraint_id, data)
        
        if success:
            return jsonify({
                'status': 'success',
                'message': message,
                'constraint_id': constraint_id,
                'version': 'v1'
            }), 200
        else:
            return jsonify({
                'status': 'error',
                'message': message,
                'version': 'v1'
            }), 400
        
    except Exception as e:
        logger.error(f"Error updating constraint {constraint_id}: {e}")
        return jsonify({
            'status': 'error',
            'message': f'Error updating constraint: {str(e)}',
            'version': 'v1'
        }), 500

@constraints_bp.route('/api/v1/constraints/<int:constraint_id>', methods=['DELETE'])
def delete_constraint(constraint_id: int):
    """
    Delete a constraint (soft delete)
    
    Args:
        constraint_id: ID of the constraint to delete
    """
    try:
        success, message = constraint_service.delete_constraint(constraint_id)
        
        if success:
            return jsonify({
                'status': 'success',
                'message': message,
                'constraint_id': constraint_id,
                'version': 'v1'
            }), 200
        else:
            return jsonify({
                'status': 'error',
                'message': message,
                'version': 'v1'
            }), 400
        
    except Exception as e:
        logger.error(f"Error deleting constraint {constraint_id}: {e}")
        return jsonify({
            'status': 'error',
            'message': f'Error deleting constraint: {str(e)}',
            'version': 'v1'
        }), 500

@constraints_bp.route('/api/v1/constraints/tables', methods=['GET'])
def get_tables_with_constraints():
    """
    Get list of tables that have constraints defined
    """
    try:
        tables = constraint_service.get_tables_with_constraints()
        
        return jsonify({
            'status': 'success',
            'message': 'Retrieved tables with constraints',
            'data': tables,
            'count': len(tables),
            'version': 'v1'
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting tables with constraints: {e}")
        return jsonify({
            'status': 'error',
            'message': f'Error retrieving tables with constraints: {str(e)}',
            'version': 'v1'
        }), 500

@constraints_bp.route('/api/v1/constraints/health', methods=['GET'])
def health_check():
    """
    Health check for constraints API
    """
    try:
        # Test basic functionality
        tables = constraint_service.get_tables_with_constraints()
        total_constraints = len(constraint_service.get_all_constraints())
        
        return jsonify({
            'status': 'success',
            'message': 'Constraints API is healthy',
            'data': {
                'tables_with_constraints': len(tables),
                'total_constraints': total_constraints,
                'service_status': 'operational'
            },
            'version': 'v1'
        }), 200
        
    except Exception as e:
        logger.error(f"Constraints API health check failed: {e}")
        return jsonify({
            'status': 'error',
            'message': f'Constraints API health check failed: {str(e)}',
            'version': 'v1'
        }), 500

@constraints_bp.route('/api/v1/constraints/active-trades/validate', methods=['GET'])
def validate_active_trades_constraint():
    """
    Validate active_trades constraint for all tickers
    """
    try:
        is_valid, errors = constraint_service.validate_active_trades_constraint()
        
        return jsonify({
            'status': 'success',
            'data': {
                'is_valid': is_valid,
                'error_count': len(errors),
                'errors': errors
            },
            'message': f'Active trades constraint validation completed. Found {len(errors)} errors.',
            'version': 'v1'
        }), 200
        
    except Exception as e:
        logger.error(f"Error validating active_trades constraint: {e}")
        return jsonify({
            'status': 'error',
            'message': f'Error validating active_trades constraint: {str(e)}',
            'version': 'v1'
        }), 500

@constraints_bp.route('/api/v1/constraints/active-trades/fix', methods=['POST'])
def fix_active_trades_constraint():
    """
    Fix active_trades constraint for all tickers
    """
    try:
        success, fixed_count = constraint_service.fix_active_trades_constraint()
        
        if success:
            return jsonify({
                'status': 'success',
                'data': {
                    'fixed_count': fixed_count
                },
                'message': f'Fixed active_trades for {fixed_count} tickers',
                'version': 'v1'
            }), 200
        else:
            return jsonify({
                'status': 'error',
                'message': 'Failed to fix active_trades constraint',
                'version': 'v1'
            }), 500
        
    except Exception as e:
        logger.error(f"Error fixing active_trades constraint: {e}")
        return jsonify({
            'status': 'error',
            'message': f'Error fixing active_trades constraint: {str(e)}',
            'version': 'v1'
        }), 500
