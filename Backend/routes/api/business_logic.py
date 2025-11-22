"""
Business Logic API Routes - TikTrack
=====================================

API endpoints for business logic services.
Provides centralized access to all business calculations and validations.

Documentation:
- documentation/02-ARCHITECTURE/BACKEND/BUSINESS_LOGIC_LAYER.md
"""

from flask import Blueprint, jsonify, request, g
from typing import Dict, Any
import logging

from services.business_logic import (
    TradeBusinessService,
    ExecutionBusinessService,
    AlertBusinessService,
    StatisticsBusinessService,
    CashFlowBusinessService
)

logger = logging.getLogger(__name__)

# Create blueprint
business_logic_bp = Blueprint('business_logic', __name__, url_prefix='/api/business')

# Initialize services
trade_service = TradeBusinessService()
execution_service = ExecutionBusinessService()
alert_service = AlertBusinessService()
statistics_service = StatisticsBusinessService()
cash_flow_service = CashFlowBusinessService()


# ============================================================================
# Trade Business Logic Endpoints
# ============================================================================

@business_logic_bp.route('/trade/calculate-stop-price', methods=['POST'])
def calculate_stop_price():
    """Calculate stop price based on percentage."""
    try:
        data = request.get_json() or {}
        
        current_price = float(data.get('current_price', 0))
        stop_percentage = float(data.get('stop_percentage', 0))
        side = data.get('side', 'Long')
        
        result = trade_service.calculate_stop_price(current_price, stop_percentage, side)
        
        if result['is_valid']:
            return jsonify({
                'status': 'success',
                'data': {
                    'stop_price': result['stop_price']
                }
            }), 200
        else:
            return jsonify({
                'status': 'error',
                'error': {
                    'message': result.get('error', 'Invalid calculation')
                }
            }), 400
            
    except Exception as e:
        logger.error(f"Error calculating stop price: {str(e)}")
        return jsonify({
            'status': 'error',
            'error': {
                'message': 'Internal server error'
            }
        }), 500


@business_logic_bp.route('/trade/calculate-target-price', methods=['POST'])
def calculate_target_price():
    """Calculate target price based on percentage."""
    try:
        data = request.get_json() or {}
        
        current_price = float(data.get('current_price', 0))
        target_percentage = float(data.get('target_percentage', 0))
        side = data.get('side', 'Long')
        
        result = trade_service.calculate_target_price(current_price, target_percentage, side)
        
        if result['is_valid']:
            return jsonify({
                'status': 'success',
                'data': {
                    'target_price': result['target_price']
                }
            }), 200
        else:
            return jsonify({
                'status': 'error',
                'error': {
                    'message': result.get('error', 'Invalid calculation')
                }
            }), 400
            
    except Exception as e:
        logger.error(f"Error calculating target price: {str(e)}")
        return jsonify({
            'status': 'error',
            'error': {
                'message': 'Internal server error'
            }
        }), 500


@business_logic_bp.route('/trade/calculate-percentage-from-price', methods=['POST'])
def calculate_percentage_from_price():
    """Calculate percentage from current price to target price."""
    try:
        data = request.get_json() or {}
        
        current_price = float(data.get('current_price', 0))
        target_price = float(data.get('target_price', 0))
        side = data.get('side', 'Long')
        
        result = trade_service.calculate_percentage_from_price(current_price, target_price, side)
        
        if result['is_valid']:
            return jsonify({
                'status': 'success',
                'data': {
                    'percentage': result['percentage']
                }
            }), 200
        else:
            return jsonify({
                'status': 'error',
                'error': {
                    'message': result.get('error', 'Invalid calculation')
                }
            }), 400
            
    except Exception as e:
        logger.error(f"Error calculating percentage: {str(e)}")
        return jsonify({
            'status': 'error',
            'error': {
                'message': 'Internal server error'
            }
        }), 500


@business_logic_bp.route('/trade/calculate-investment', methods=['POST'])
def calculate_investment():
    """Calculate investment values (price, quantity, amount)."""
    try:
        data = request.get_json() or {}
        
        price = data.get('price')
        quantity = data.get('quantity')
        amount = data.get('amount')
        
        # Convert to float if provided
        price = float(price) if price is not None else None
        quantity = float(quantity) if quantity is not None else None
        amount = float(amount) if amount is not None else None
        
        result = trade_service.calculate_investment(price=price, quantity=quantity, amount=amount)
        
        if result['is_valid']:
            return jsonify({
                'status': 'success',
                'data': {
                    'price': result['price'],
                    'quantity': result['quantity'],
                    'amount': result['amount']
                }
            }), 200
        else:
            return jsonify({
                'status': 'error',
                'error': {
                    'message': result.get('error', 'Invalid calculation')
                }
            }), 400
            
    except Exception as e:
        logger.error(f"Error calculating investment: {str(e)}")
        return jsonify({
            'status': 'error',
            'error': {
                'message': 'Internal server error'
            }
        }), 500


@business_logic_bp.route('/trade/calculate-pl', methods=['POST'])
def calculate_pl():
    """Calculate profit/loss for a trade."""
    try:
        data = request.get_json() or {}
        
        entry_price = float(data.get('entry_price', 0))
        exit_price = float(data.get('exit_price', 0))
        quantity = float(data.get('quantity', 0))
        side = data.get('side', 'Long')
        
        result = trade_service.calculate_pl(entry_price, exit_price, quantity, side)
        
        if result['is_valid']:
            return jsonify({
                'status': 'success',
                'data': {
                    'pl': result['pl'],
                    'pl_percent': result['pl_percent']
                }
            }), 200
        else:
            return jsonify({
                'status': 'error',
                'error': {
                    'message': result.get('error', 'Invalid calculation')
                }
            }), 400
            
    except Exception as e:
        logger.error(f"Error calculating P/L: {str(e)}")
        return jsonify({
            'status': 'error',
            'error': {
                'message': 'Internal server error'
            }
        }), 500


@business_logic_bp.route('/trade/calculate-risk-reward', methods=['POST'])
def calculate_risk_reward():
    """Calculate risk/reward ratio for a trade."""
    try:
        data = request.get_json() or {}
        
        entry_price = float(data.get('entry_price', 0))
        stop_price = float(data.get('stop_price', 0))
        target_price = float(data.get('target_price', 0))
        quantity = float(data.get('quantity', 0))
        side = data.get('side', 'Long')
        
        result = trade_service.calculate_risk_reward(
            entry_price, stop_price, target_price, quantity, side
        )
        
        if result['is_valid']:
            return jsonify({
                'status': 'success',
                'data': {
                    'risk': result['risk'],
                    'reward': result['reward'],
                    'ratio': result['ratio']
                }
            }), 200
        else:
            return jsonify({
                'status': 'error',
                'error': {
                    'message': result.get('error', 'Invalid calculation')
                }
            }), 400
            
    except Exception as e:
        logger.error(f"Error calculating risk/reward: {str(e)}")
        return jsonify({
            'status': 'error',
            'error': {
                'message': 'Internal server error'
            }
        }), 500


@business_logic_bp.route('/trade/validate', methods=['POST'])
def validate_trade():
    """Validate trade data."""
    try:
        data = request.get_json() or {}
        
        result = trade_service.validate(data)
        
        if result['is_valid']:
            return jsonify({
                'status': 'success',
                'data': {
                    'is_valid': True
                }
            }), 200
        else:
            return jsonify({
                'status': 'error',
                'error': {
                    'message': 'Validation failed',
                    'errors': result['errors']
                }
            }), 400
            
    except Exception as e:
        logger.error(f"Error validating trade: {str(e)}")
        return jsonify({
            'status': 'error',
            'error': {
                'message': 'Internal server error'
            }
        }), 500


# ============================================================================
# Execution Business Logic Endpoints
# ============================================================================

@business_logic_bp.route('/execution/calculate-values', methods=['POST'])
def calculate_execution_values():
    """Calculate execution values."""
    try:
        data = request.get_json() or {}
        
        quantity = float(data.get('quantity', 0))
        price = float(data.get('price', 0))
        commission = float(data.get('commission', 0))
        action = data.get('action')
        is_edit = data.get('is_edit', False)
        
        result = execution_service.calculate_execution_values(
            quantity, price, commission, action, is_edit
        )
        
        if result['is_valid']:
            return jsonify({
                'status': 'success',
                'data': {
                    'total': result['total'],
                    'label': result['label']
                }
            }), 200
        else:
            return jsonify({
                'status': 'error',
                'error': {
                    'message': result.get('error', 'Invalid calculation')
                }
            }), 400
            
    except Exception as e:
        logger.error(f"Error calculating execution values: {str(e)}")
        return jsonify({
            'status': 'error',
            'error': {
                'message': 'Internal server error'
            }
        }), 500


@business_logic_bp.route('/execution/calculate-average-price', methods=['POST'])
def calculate_average_price():
    """Calculate average price from multiple executions."""
    try:
        data = request.get_json() or {}
        
        executions = data.get('executions', [])
        
        result = execution_service.calculate_average_price(executions)
        
        if result['is_valid']:
            return jsonify({
                'status': 'success',
                'data': {
                    'average_price': result['average_price'],
                    'total_quantity': result['total_quantity'],
                    'total_amount': result['total_amount']
                }
            }), 200
        else:
            return jsonify({
                'status': 'error',
                'error': {
                    'message': result.get('error', 'Invalid calculation')
                }
            }), 400
            
    except Exception as e:
        logger.error(f"Error calculating average price: {str(e)}")
        return jsonify({
            'status': 'error',
            'error': {
                'message': 'Internal server error'
            }
        }), 500


@business_logic_bp.route('/execution/validate', methods=['POST'])
def validate_execution():
    """Validate execution data."""
    try:
        data = request.get_json() or {}
        
        result = execution_service.validate(data)
        
        if result['is_valid']:
            return jsonify({
                'status': 'success',
                'data': {
                    'is_valid': True
                }
            }), 200
        else:
            return jsonify({
                'status': 'error',
                'error': {
                    'message': 'Validation failed',
                    'errors': result['errors']
                }
            }), 400
            
    except Exception as e:
        logger.error(f"Error validating execution: {str(e)}")
        return jsonify({
            'status': 'error',
            'error': {
                'message': 'Internal server error'
            }
        }), 500


# ============================================================================
# Alert Business Logic Endpoints
# ============================================================================

@business_logic_bp.route('/alert/validate', methods=['POST'])
def validate_alert():
    """Validate alert data."""
    try:
        data = request.get_json() or {}
        
        result = alert_service.validate(data)
        
        if result['is_valid']:
            return jsonify({
                'status': 'success',
                'data': {
                    'is_valid': True
                }
            }), 200
        else:
            return jsonify({
                'status': 'error',
                'error': {
                    'message': 'Validation failed',
                    'errors': result['errors']
                }
            }), 400
            
    except Exception as e:
        logger.error(f"Error validating alert: {str(e)}")
        return jsonify({
            'status': 'error',
            'error': {
                'message': 'Internal server error'
            }
        }), 500


@business_logic_bp.route('/alert/validate-condition-value', methods=['POST'])
def validate_condition_value():
    """Validate condition value."""
    try:
        data = request.get_json() or {}
        
        condition_attribute = data.get('condition_attribute')
        condition_number = data.get('condition_number')
        
        if condition_number is not None:
            try:
                condition_number = float(condition_number)
            except (ValueError, TypeError):
                condition_number = None
        
        result = alert_service.validate_condition_value(condition_attribute, condition_number)
        
        if result['is_valid']:
            return jsonify({
                'status': 'success',
                'data': {
                    'is_valid': True
                }
            }), 200
        else:
            return jsonify({
                'status': 'error',
                'error': {
                    'message': result.get('error', 'Invalid condition value')
                }
            }), 400
            
    except Exception as e:
        logger.error(f"Error validating condition value: {str(e)}")
        return jsonify({
            'status': 'error',
            'error': {
                'message': 'Internal server error'
            }
        }), 500


# ============================================================================
# Statistics Business Logic Endpoints
# ============================================================================

@business_logic_bp.route('/statistics/calculate', methods=['POST'])
def calculate_statistics():
    """Calculate statistics."""
    try:
        data = request.get_json() or {}
        
        calculation_type = data.get('calculation_type', 'kpi')
        records = data.get('data', [])
        params = data.get('params', {})
        
        result = statistics_service.calculate_kpi(calculation_type, records, params)
        
        if result.get('is_valid', True):
            return jsonify({
                'status': 'success',
                'data': result
            }), 200
        else:
            return jsonify({
                'status': 'error',
                'error': {
                    'message': result.get('error', 'Invalid calculation')
                }
            }), 400
            
    except Exception as e:
        logger.error(f"Error calculating statistics: {str(e)}")
        return jsonify({
            'status': 'error',
            'error': {
                'message': 'Internal server error'
            }
        }), 500


# ============================================================================
# Cash Flow Business Logic Endpoints
# ============================================================================

@business_logic_bp.route('/cash-flow/calculate-balance', methods=['POST'])
def calculate_account_balance():
    """Calculate account balance from cash flows."""
    try:
        data = request.get_json() or {}
        
        initial_balance = float(data.get('initial_balance', 0))
        cash_flows = data.get('cash_flows', [])
        
        result = cash_flow_service.calculate_account_balance(initial_balance, cash_flows)
        
        if result['is_valid']:
            return jsonify({
                'status': 'success',
                'data': {
                    'balance': result['balance'],
                    'total_income': result['total_income'],
                    'total_expenses': result['total_expenses']
                }
            }), 200
        else:
            return jsonify({
                'status': 'error',
                'error': {
                    'message': result.get('error', 'Invalid calculation')
                }
            }), 400
            
    except Exception as e:
        logger.error(f"Error calculating account balance: {str(e)}")
        return jsonify({
            'status': 'error',
            'error': {
                'message': 'Internal server error'
            }
        }), 500


@business_logic_bp.route('/cash-flow/calculate-currency-conversion', methods=['POST'])
def calculate_currency_conversion():
    """Calculate currency conversion."""
    try:
        data = request.get_json() or {}
        
        amount = float(data.get('amount', 0))
        from_currency_rate = float(data.get('from_currency_rate', 1.0))
        to_currency_rate = float(data.get('to_currency_rate', 1.0))
        
        result = cash_flow_service.calculate_currency_conversion(
            amount, from_currency_rate, to_currency_rate
        )
        
        if result['is_valid']:
            return jsonify({
                'status': 'success',
                'data': {
                    'converted_amount': result['converted_amount']
                }
            }), 200
        else:
            return jsonify({
                'status': 'error',
                'error': {
                    'message': result.get('error', 'Invalid calculation')
                }
            }), 400
            
    except Exception as e:
        logger.error(f"Error calculating currency conversion: {str(e)}")
        return jsonify({
            'status': 'error',
            'error': {
                'message': 'Internal server error'
            }
        }), 500


@business_logic_bp.route('/cash-flow/validate', methods=['POST'])
def validate_cash_flow():
    """Validate cash flow data."""
    try:
        data = request.get_json() or {}
        
        result = cash_flow_service.validate(data)
        
        if result['is_valid']:
            return jsonify({
                'status': 'success',
                'data': {
                    'is_valid': True
                }
            }), 200
        else:
            return jsonify({
                'status': 'error',
                'error': {
                    'message': 'Validation failed',
                    'errors': result['errors']
                }
            }), 400
            
    except Exception as e:
        logger.error(f"Error validating cash flow: {str(e)}")
        return jsonify({
            'status': 'error',
            'error': {
                'message': 'Internal server error'
            }
        }), 500

