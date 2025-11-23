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
    CashFlowBusinessService,
    NoteBusinessService,
    TradingAccountBusinessService,
    TradePlanBusinessService,
    TickerBusinessService,
    CurrencyBusinessService,
    TagBusinessService
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
note_service = NoteBusinessService()
trading_account_service = TradingAccountBusinessService()
trade_plan_service = TradePlanBusinessService()
ticker_service = TickerBusinessService()
currency_service = CurrencyBusinessService()
tag_service = TagBusinessService()


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
        
        # Normalize side to lowercase for consistency with other endpoints
        if 'side' in data and data['side']:
            data['side'] = data['side'].lower()
        
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
        
        # Normalize action to lowercase for consistency with business rules registry
        # The registry expects lowercase values: 'buy', 'sell', 'short', 'cover'
        # This matches the pattern used in /trade/validate for 'side' field
        if 'action' in data and data['action']:
            data['action'] = data['action'].lower()
        
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
            # Extract only calculated fields, exclude internal service fields
            response_data = {}
            for key, value in result.items():
                if key not in ['is_valid', 'error']:
                    response_data[key] = value
            
            return jsonify({
                'status': 'success',
                'data': response_data
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


# ============================================================================
# Note Business Logic Endpoints
# ============================================================================

@business_logic_bp.route('/note/validate', methods=['POST'])
def validate_note():
    """Validate note data."""
    try:
        data = request.get_json() or {}
        
        result = note_service.validate(data)
        
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
        logger.error(f"Error validating note: {str(e)}")
        return jsonify({
            'status': 'error',
            'error': {
                'message': 'Internal server error'
            }
        }), 500


@business_logic_bp.route('/note/validate-relation', methods=['POST'])
def validate_note_relation():
    """Validate note relation (related_type_id and related_id)."""
    try:
        data = request.get_json() or {}
        
        related_type_id = data.get('related_type_id')
        related_id = data.get('related_id')
        
        # Convert to int if provided
        if related_type_id is not None:
            try:
                related_type_id = int(related_type_id)
            except (ValueError, TypeError):
                related_type_id = None
        
        if related_id is not None:
            try:
                related_id = int(related_id)
            except (ValueError, TypeError):
                related_id = None
        
        result = note_service.validate_relation(related_type_id, related_id)
        
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
        logger.error(f"Error validating note relation: {str(e)}")
        return jsonify({
            'status': 'error',
            'error': {
                'message': 'Internal server error'
            }
        }), 500


# ============================================================================
# TradingAccount Business Logic Endpoints
# ============================================================================

@business_logic_bp.route('/trading-account/validate', methods=['POST'])
def validate_trading_account():
    """Validate trading account data."""
    try:
        data = request.get_json() or {}
        
        result = trading_account_service.validate(data)
        
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
        logger.error(f"Error validating trading account: {str(e)}")
        return jsonify({
            'status': 'error',
            'error': {
                'message': 'Internal server error'
            }
        }), 500


# ============================================================================
# TradePlan Business Logic Endpoints
# ============================================================================

@business_logic_bp.route('/trade-plan/validate', methods=['POST'])
def validate_trade_plan():
    """Validate trade plan data."""
    try:
        data = request.get_json() or {}
        
        result = trade_plan_service.validate(data)
        
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
        logger.error(f"Error validating trade plan: {str(e)}")
        return jsonify({
            'status': 'error',
            'error': {
                'message': 'Internal server error'
            }
        }), 500


# ============================================================================
# Ticker Business Logic Endpoints
# ============================================================================

@business_logic_bp.route('/ticker/validate', methods=['POST'])
def validate_ticker():
    """Validate ticker data."""
    try:
        data = request.get_json() or {}
        
        result = ticker_service.validate(data)
        
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
        logger.error(f"Error validating ticker: {str(e)}")
        return jsonify({
            'status': 'error',
            'error': {
                'message': 'Internal server error'
            }
        }), 500


@business_logic_bp.route('/ticker/validate-symbol', methods=['POST'])
def validate_ticker_symbol():
    """Validate ticker symbol format."""
    try:
        data = request.get_json() or {}
        
        symbol = data.get('symbol')
        
        result = ticker_service.validate_symbol(symbol)
        
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
        logger.error(f"Error validating ticker symbol: {str(e)}")
        return jsonify({
            'status': 'error',
            'error': {
                'message': 'Internal server error'
            }
        }), 500


# ============================================================================
# Currency Business Logic Endpoints
# ============================================================================

@business_logic_bp.route('/currency/validate-rate', methods=['POST'])
def validate_currency_rate():
    """Validate currency exchange rate."""
    try:
        data = request.get_json() or {}
        
        rate = data.get('exchange_rate')
        
        result = currency_service.validate_exchange_rate(rate)
        
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
        logger.error(f"Error validating currency rate: {str(e)}")
        return jsonify({
            'status': 'error',
            'error': {
                'message': 'Internal server error'
            }
        }), 500


# ============================================================================
# Tag Business Logic Endpoints
# ============================================================================

@business_logic_bp.route('/tag/validate', methods=['POST'])
def validate_tag():
    """Validate tag data."""
    try:
        data = request.get_json() or {}
        
        result = tag_service.validate(data)
        
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
        logger.error(f"Error validating tag: {str(e)}")
        return jsonify({
            'status': 'error',
            'error': {
                'message': 'Internal server error'
            }
        }), 500


@business_logic_bp.route('/tag/validate-category', methods=['POST'])
def validate_tag_category():
    """Validate tag category."""
    try:
        data = request.get_json() or {}
        
        category = data.get('category')
        
        result = tag_service.validate_category(category)
        
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
        logger.error(f"Error validating tag category: {str(e)}")
        return jsonify({
            'status': 'error',
            'error': {
                'message': 'Internal server error'
            }
        }), 500

