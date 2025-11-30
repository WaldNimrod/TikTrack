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
from sqlalchemy.orm import Session
import logging
import time

from routes.api.base_entity_decorators import monitor_performance, handle_database_session
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
    TagBusinessService,
    PreferencesBusinessService,
    AIAnalysisBusinessService
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
ai_analysis_business_service = AIAnalysisBusinessService()


# ============================================================================
# Trade Business Logic Endpoints
# ============================================================================

@business_logic_bp.route('/trade/calculate-stop-price', methods=['POST'])
@monitor_performance(log_slow_queries=True, slow_query_threshold=0.2)
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
@monitor_performance(log_slow_queries=True, slow_query_threshold=0.2)
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
@monitor_performance(log_slow_queries=True, slow_query_threshold=0.2)
@handle_database_session(auto_commit=False, auto_close=True)
def validate_trade():
    """Validate trade data."""
    try:
        data = request.get_json() or {}
        db: Session = g.db
        
        # Normalize side to lowercase for consistency with other endpoints
        if 'side' in data and data['side']:
            data['side'] = data['side'].lower()
        
        # Initialize service with DB session
        service = TradeBusinessService(db_session=db)
        result = service.validate(data)
        
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
@monitor_performance(log_slow_queries=True, slow_query_threshold=0.2)
@handle_database_session(auto_commit=False, auto_close=True)
def validate_execution():
    """Validate execution data."""
    try:
        data = request.get_json() or {}
        db: Session = g.db
        
        # Normalize action to lowercase for consistency with business rules registry
        # The registry expects lowercase values: 'buy', 'sell', 'short', 'cover'
        # This matches the pattern used in /trade/validate for 'side' field
        if 'action' in data and data['action']:
            data['action'] = data['action'].lower()
        
        # Initialize service with DB session
        service = ExecutionBusinessService(db_session=db)
        result = service.validate(data)
        
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
@monitor_performance(log_slow_queries=True, slow_query_threshold=0.2)
@handle_database_session(auto_commit=False, auto_close=True)
def validate_alert():
    """Validate alert data."""
    try:
        data = request.get_json() or {}
        db: Session = g.db
        
        # Initialize service with DB session
        service = AlertBusinessService(db_session=db)
        result = service.validate(data)
        
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
        
        # Validate that condition_attribute is provided and is a string
        if not condition_attribute or not isinstance(condition_attribute, str):
            return jsonify({
                'status': 'error',
                'error': {
                    'message': 'condition_attribute is required and must be a string'
                }
            }), 400
        
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


@business_logic_bp.route('/statistics/calculate-sum', methods=['POST'])
def calculate_sum():
    """Calculate sum of a field."""
    try:
        data = request.get_json() or {}
        
        records = data.get('data', [])
        field = data.get('field')
        
        if not field:
            return jsonify({
                'status': 'error',
                'error': {
                    'message': 'Field is required'
                }
            }), 400
        
        result = statistics_service.calculate_sum(records, field)
        
        if result.get('is_valid', True):
            return jsonify({
                'status': 'success',
                'data': {
                    'sum': result.get('sum', 0.0)
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
        logger.error(f"Error calculating sum: {str(e)}")
        return jsonify({
            'status': 'error',
            'error': {
                'message': 'Internal server error'
            }
        }), 500


@business_logic_bp.route('/statistics/calculate-average', methods=['POST'])
def calculate_average():
    """Calculate average of a field."""
    try:
        data = request.get_json() or {}
        
        records = data.get('data', [])
        field = data.get('field')
        
        if not field:
            return jsonify({
                'status': 'error',
                'error': {
                    'message': 'Field is required'
                }
            }), 400
        
        result = statistics_service.calculate_average(records, field)
        
        if result.get('is_valid', True):
            return jsonify({
                'status': 'success',
                'data': {
                    'average': result.get('average', 0.0)
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
        logger.error(f"Error calculating average: {str(e)}")
        return jsonify({
            'status': 'error',
            'error': {
                'message': 'Internal server error'
            }
        }), 500


@business_logic_bp.route('/statistics/count-records', methods=['POST'])
def count_records():
    """Count records."""
    try:
        data = request.get_json() or {}
        
        records = data.get('data', [])
        
        result = statistics_service.count_records(records)
        
        if result.get('is_valid', True):
            return jsonify({
                'status': 'success',
                'data': {
                    'count': result.get('count', 0)
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
        logger.error(f"Error counting records: {str(e)}")
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
@monitor_performance(log_slow_queries=True, slow_query_threshold=0.2)
@handle_database_session(auto_commit=False, auto_close=True)
def validate_cash_flow():
    """Validate cash flow data."""
    try:
        data = request.get_json() or {}
        db: Session = g.db
        
        # Initialize service with DB session
        service = CashFlowBusinessService(db_session=db)
        result = service.validate(data)
        
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
@monitor_performance(log_slow_queries=True, slow_query_threshold=0.2)
@handle_database_session(auto_commit=False, auto_close=True)
def validate_note():
    """Validate note data."""
    try:
        data = request.get_json() or {}
        db: Session = g.db
        
        # Initialize service with DB session
        service = NoteBusinessService(db_session=db)
        result = service.validate(data)
        
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
@monitor_performance(log_slow_queries=True, slow_query_threshold=0.2)
@handle_database_session(auto_commit=False, auto_close=True)
def validate_trading_account():
    """Validate trading account data."""
    try:
        data = request.get_json() or {}
        db: Session = g.db
        
        # Initialize service with DB session
        service = TradingAccountBusinessService(db_session=db)
        result = service.validate(data)
        
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
@monitor_performance(log_slow_queries=True, slow_query_threshold=0.2)
@handle_database_session(auto_commit=False, auto_close=True)
def validate_trade_plan():
    """Validate trade plan data."""
    try:
        data = request.get_json() or {}
        db: Session = g.db
        
        # Initialize service with DB session
        service = TradePlanBusinessService(db_session=db)
        result = service.validate(data)
        
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
@monitor_performance(log_slow_queries=True, slow_query_threshold=0.2)
@handle_database_session(auto_commit=False, auto_close=True)
def validate_ticker():
    """Validate ticker data."""
    try:
        data = request.get_json() or {}
        db: Session = g.db
        
        # Initialize service with DB session
        service = TickerBusinessService(db_session=db)
        result = service.validate(data)
        
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
# Preferences Business Logic Endpoints
# ============================================================================

@business_logic_bp.route('/preferences/validate', methods=['POST'])
@monitor_performance(log_slow_queries=True, slow_query_threshold=0.2)
@handle_database_session(auto_commit=False, auto_close=True)
def validate_preference():
    """Validate preference value."""
    try:
        data = request.get_json() or {}
        db: Session = g.db
        
        preference_name = data.get('preference_name')
        value = data.get('value')
        data_type = data.get('data_type', 'string')
        
        if not preference_name:
            return jsonify({
                'status': 'error',
                'error': {
                    'message': 'preference_name is required'
                }
            }), 400
        
        # Initialize service with DB session
        service = PreferencesBusinessService(db_session=db)
        result = service.validate_preference(preference_name, value, data_type)
        
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
        logger.error(f"Error validating preference: {str(e)}")
        return jsonify({
            'status': 'error',
            'error': {
                'message': 'Internal server error'
            }
        }), 500


@business_logic_bp.route('/preferences/validate-profile', methods=['POST'])
@monitor_performance(log_slow_queries=True, slow_query_threshold=0.2)
@handle_database_session(auto_commit=False, auto_close=True)
def validate_profile():
    """Validate profile data."""
    try:
        data = request.get_json() or {}
        db: Session = g.db
        
        # Initialize service with DB session
        service = PreferencesBusinessService(db_session=db)
        result = service.validate_profile(data)
        
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
        logger.error(f"Error validating profile: {str(e)}")
        return jsonify({
            'status': 'error',
            'error': {
                'message': 'Internal server error'
            }
        }), 500


@business_logic_bp.route('/preferences/validate-dependencies', methods=['POST'])
@monitor_performance(log_slow_queries=True, slow_query_threshold=0.2)
@handle_database_session(auto_commit=False, auto_close=True)
def validate_dependencies():
    """Validate dependencies between preferences."""
    try:
        data = request.get_json() or {}
        db: Session = g.db
        
        preferences = data.get('preferences', {})
        
        if not preferences:
            return jsonify({
                'status': 'error',
                'error': {
                    'message': 'preferences dictionary is required'
                }
            }), 400
        
        # Initialize service with DB session
        service = PreferencesBusinessService(db_session=db)
        result = service.validate_dependencies(preferences)
        
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
        logger.error(f"Error validating dependencies: {str(e)}")
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
@monitor_performance(log_slow_queries=True, slow_query_threshold=0.2)
@handle_database_session(auto_commit=False, auto_close=True)
def validate_tag():
    """Validate tag data."""
    try:
        data = request.get_json() or {}
        db: Session = g.db
        
        # Initialize service with DB session
        service = TagBusinessService(db_session=db)
        result = service.validate(data)
        
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


# ============================================================================
# AI Analysis Business Logic Endpoints
# ============================================================================

@business_logic_bp.route('/ai-analysis/validate', methods=['POST'])
@monitor_performance(log_slow_queries=True, slow_query_threshold=0.2)
@handle_database_session(auto_commit=False, auto_close=True)
def validate_ai_analysis():
    """Validate AI analysis request data."""
    try:
        data = request.get_json() or {}
        
        # Set db_session for business service
        ai_analysis_business_service.db_session = g.db
        
        result = ai_analysis_business_service.validate(data)
        
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
        logger.error(f"Error validating AI analysis: {str(e)}")
        return jsonify({
            'status': 'error',
            'error': {
                'message': 'Internal server error'
            }
        }), 500


@business_logic_bp.route('/ai-analysis/validate-variables', methods=['POST'])
def validate_ai_analysis_variables():
    """Validate AI analysis variables dictionary."""
    try:
        data = request.get_json() or {}
        variables = data.get('variables', {})
        
        result = ai_analysis_business_service.validate_variables(variables)
        
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
                    'message': 'Variables validation failed',
                    'errors': result['errors']
                }
            }), 400
            
    except Exception as e:
        logger.error(f"Error validating AI analysis variables: {str(e)}")
        return jsonify({
            'status': 'error',
            'error': {
                'message': 'Internal server error'
            }
        }), 500


# ============================================================================
# Batch Operations Endpoint
# ============================================================================

@business_logic_bp.route('/batch', methods=['POST'])
@monitor_performance(log_slow_queries=True, slow_query_threshold=1.0)
def batch_operations():
    """
    Execute multiple business logic operations in a single request.
    
    Request format:
    {
        "operations": [
            {
                "operation": "calculate-stop-price",
                "service": "trade",
                "data": {...}
            },
            {
                "operation": "validate-trade",
                "service": "trade",
                "data": {...}
            }
        ]
    }
    
    Response format:
    {
        "status": "success",
        "results": [
            {
                "operation": "calculate-stop-price",
                "status": "success",
                "data": {...}
            },
            {
                "operation": "validate-trade",
                "status": "error",
                "error": {...}
            }
        ],
        "total": 2,
        "successful": 1,
        "failed": 1
    }
    """
    try:
        data = request.get_json() or {}
        operations = data.get('operations', [])
        
        if not operations or not isinstance(operations, list):
            return jsonify({
                'status': 'error',
                'error': {
                    'message': 'Operations list is required and must be an array'
                }
            }), 400
        
        if len(operations) > 50:  # Limit batch size
            return jsonify({
                'status': 'error',
                'error': {
                    'message': 'Maximum 50 operations per batch request'
                }
            }), 400
        
        results = []
        
        # Service mapping
        service_map = {
            'trade': trade_service,
            'execution': execution_service,
            'alert': alert_service,
            'statistics': statistics_service,
            'cash-flow': cash_flow_service,
            'note': note_service,
            'trading-account': trading_account_service,
            'trade-plan': trade_plan_service,
            'ticker': ticker_service,
            'currency': currency_service,
            'tag': tag_service
        }
        
        # Operation mapping
        operation_map = {
            # Trade operations
            'calculate-stop-price': lambda svc, d: svc.calculate_stop_price(
                float(d.get('current_price', 0)),
                float(d.get('stop_percentage', 0)),
                d.get('side', 'Long')
            ),
            'calculate-target-price': lambda svc, d: svc.calculate_target_price(
                float(d.get('current_price', 0)),
                float(d.get('target_percentage', 0)),
                d.get('side', 'Long')
            ),
            'calculate-percentage-from-price': lambda svc, d: svc.calculate_percentage_from_price(
                float(d.get('current_price', 0)),
                float(d.get('target_price', 0)),
                d.get('side', 'Long')
            ),
            'calculate-investment': lambda svc, d: svc.calculate_investment(
                float(d.get('price', 0)),
                float(d.get('quantity', 0))
            ),
            'validate-trade': lambda svc, d: svc.validate_trade(d),
            
            # Execution operations
            'calculate-execution-values': lambda svc, d: svc.calculate_execution_values(d),
            'calculate-average-price': lambda svc, d: svc.calculate_average_price(d.get('executions', [])),
            'validate-execution': lambda svc, d: svc.validate_execution(d),
            
            # Alert operations
            'validate-alert': lambda svc, d: svc.validate_alert(d),
            'validate-condition-value': lambda svc, d: svc.validate_condition_value(
                d.get('condition_attribute'),
                d.get('condition_operator'),
                d.get('condition_number')
            ),
            
            # Statistics operations
            'calculate-statistics': lambda svc, d: svc.calculate_statistics(
                d.get('entity_type'),
                d.get('calculation_type'),
                d.get('field'),
                d.get('filters', {})
            ),
            'calculate-sum': lambda svc, d: svc.calculate_sum(
                d.get('entity_type'),
                d.get('field'),
                d.get('filters', {})
            ),
            'calculate-average': lambda svc, d: svc.calculate_average(
                d.get('entity_type'),
                d.get('field'),
                d.get('filters', {})
            ),
            'count-records': lambda svc, d: svc.count_records(
                d.get('entity_type'),
                d.get('filters', {})
            ),
            
            # Cash Flow operations
            'calculate-account-balance': lambda svc, d: svc.calculate_account_balance(
                d.get('account_id'),
                d.get('as_of_date')
            ),
            'validate-cash-flow': lambda svc, d: svc.validate_cash_flow(d),
            
            # Note operations
            'validate-note': lambda svc, d: svc.validate_note(d),
            
            # Trading Account operations
            'validate-trading-account': lambda svc, d: svc.validate_trading_account(d),
            
            # Trade Plan operations
            'validate-trade-plan': lambda svc, d: svc.validate_trade_plan(d),
            
            # Ticker operations
            'validate-ticker': lambda svc, d: svc.validate_ticker(d),
            
            # Tag operations
            'validate-tag': lambda svc, d: svc.validate_tag(d),
        }
        
        # Process each operation
        for op_data in operations:
            operation = op_data.get('operation')
            service_name = op_data.get('service')
            op_payload = op_data.get('data', {})
            
            try:
                # Get service
                service = service_map.get(service_name)
                if not service:
                    results.append({
                        'operation': operation,
                        'status': 'error',
                        'error': {
                            'message': f'Unknown service: {service_name}'
                        }
                    })
                    continue
                
                # Get operation handler
                op_handler = operation_map.get(operation)
                if not op_handler:
                    results.append({
                        'operation': operation,
                        'status': 'error',
                        'error': {
                            'message': f'Unknown operation: {operation}'
                        }
                    })
                    continue
                
                # Execute operation
                result = op_handler(service, op_payload)
                
                # Format result
                if isinstance(result, dict) and result.get('is_valid') is not None:
                    # Validation result
                    results.append({
                        'operation': operation,
                        'status': 'success' if result.get('is_valid') else 'error',
                        'data': result
                    })
                elif isinstance(result, dict) and 'error' in result:
                    # Error result
                    results.append({
                        'operation': operation,
                        'status': 'error',
                        'error': result.get('error', {})
                    })
                else:
                    # Success result
                    results.append({
                        'operation': operation,
                        'status': 'success',
                        'data': result
                    })
                    
            except Exception as e:
                logger.error(f"Error executing batch operation {operation}: {str(e)}")
                results.append({
                    'operation': operation,
                    'status': 'error',
                    'error': {
                        'message': str(e)
                    }
                })
        
        # Return batch results
        return jsonify({
            'status': 'success',
            'results': results,
            'total': len(results),
            'successful': len([r for r in results if r.get('status') == 'success']),
            'failed': len([r for r in results if r.get('status') == 'error'])
        }), 200
        
    except Exception as e:
        logger.error(f"Error processing batch request: {str(e)}")
        return jsonify({
            'status': 'error',
            'error': {
                'message': 'Internal server error'
            }
        }), 500

