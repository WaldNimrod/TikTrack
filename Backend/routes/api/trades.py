from flask import Blueprint, jsonify, request, g
from sqlalchemy.orm import Session
from config.database import get_db
from services.trade_service import TradeService
from services.position_calculator_service import PositionCalculatorService
from services.advanced_cache_service import cache_for, cache_with_deps, invalidate_cache
import logging

# Import base classes
from .base_entity import BaseEntityAPI
from .base_entity_decorators import api_endpoint, handle_database_session, validate_request
from .base_entity_utils import BaseEntityUtils

logger = logging.getLogger(__name__)

trades_bp = Blueprint('trades', __name__, url_prefix='/api/trades')

# Initialize base API
base_api = BaseEntityAPI('trades', TradeService, 'trades')

# Initialize position calculator
position_calculator = PositionCalculatorService()

@trades_bp.route('/', methods=['GET'])
@handle_database_session()
def get_trades():
    """Get all trades with filtering options - enhanced with market data"""
    db: Session = g.db
    
    # Get filtering parameters
    trading_account_id = request.args.get('trading_account_id', type=int)
    status = request.args.get('status')
    
    try:
        # If there are filtering parameters, use appropriate function
        if trading_account_id and status:
            logger.info(f"Filtering trades by trading_account_id={trading_account_id} and status={status}")
            trades = TradeService.get_by_account_and_status(db, trading_account_id, status)
            logger.info(f"Found {len(trades)} trades for account {trading_account_id} with status {status}")
        elif trading_account_id:
            trades = TradeService.get_by_account(db, trading_account_id)
        elif status:
            trades = TradeService.get_by_status(db, status)
        else:
            trades = TradeService.get_all(db)
        
        # Convert trades to dict with market data and position data
        trade_dicts = []
        trade_ids = [trade.id for trade in trades]
        
        # Calculate positions for all trades in batch
        positions = position_calculator.calculate_positions_batch(db, trade_ids)
        
        for trade in trades:
            trade_dict = trade.to_dict()
            
            # Add market data from ticker if available
            if hasattr(trade, 'ticker') and trade.ticker:
                # Get latest market data for the ticker
                from models.external_data import MarketDataQuote
                latest_quote = db.query(MarketDataQuote).filter(
                    MarketDataQuote.ticker_id == trade.ticker.id
                ).order_by(MarketDataQuote.fetched_at.desc()).first()
                
                if latest_quote:
                    trade_dict['current_price'] = latest_quote.price
                    trade_dict['daily_change'] = latest_quote.change_pct_day
                    trade_dict['change_amount'] = latest_quote.change_amount_day
                else:
                    trade_dict['current_price'] = None
                    trade_dict['daily_change'] = None
                    trade_dict['change_amount'] = None
            else:
                trade_dict['current_price'] = None
                trade_dict['daily_change'] = None
                trade_dict['change_amount'] = None
            
            # Add position data
            trade_dict['position'] = positions.get(trade.id)
            
            trade_dicts.append(trade_dict)
        
        if trade_dicts:
            logger.info(f"First trade data: {trade_dicts[0]}")
        
        return jsonify({
            "status": "success",
            "data": trade_dicts,
            "message": "Trades retrieved successfully",
            "version": "1.0"
        })
    except Exception as e:
        logger.error(f"Error getting trades: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": "Failed to retrieve trades"},
            "version": "1.0"
        }), 500

@trades_bp.route('/<int:trade_id>', methods=['GET'])
@api_endpoint(cache_ttl=60, dependencies=['trades'], rate_limit=60)
@handle_database_session()
def get_trade(trade_id: int):
    """Get trade by ID using base API"""
    db: Session = g.db
    response, status_code = base_api.get_by_id(db, trade_id)
    return jsonify(response), status_code

@trades_bp.route('/account/<int:trading_account_id>', methods=['GET'])
def get_trades_by_account(trading_account_id: int):
    """Get trades by account"""
    try:
        db: Session = next(get_db())
        trades = TradeService.get_by_account(db, trading_account_id)
        return jsonify({
            "status": "success",
            "data": [trade.to_dict() for trade in trades],
            "message": "TradingAccount trades retrieved successfully",
            "version": "1.0"
        })
    except Exception as e:
        logger.error(f"Error getting trades for account {trading_account_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": "Failed to retrieve account trades"},
            "version": "1.0"
        }), 500
    finally:
        db.close()

@trades_bp.route('/', methods=['POST'])
@handle_database_session(auto_commit=True, auto_close=True)
@invalidate_cache(['trades', 'tickers', 'dashboard'])  # Invalidate cache after creating trade
def create_trade():
    """Create a new trade"""
    try:
        data = request.get_json()
        
        # Handle backward compatibility for type field
        if 'type' in data:
            data['investment_type'] = data.pop('type')
        
        # Ensure investment_type has a default value
        if 'investment_type' not in data or not data['investment_type']:
            data['investment_type'] = 'swing'
        
        db: Session = g.db
        trade = TradeService.create(db, data)
        return jsonify({
            "status": "success",
            "data": trade.to_dict(),
            "message": "Trade created successfully",
            "version": "1.0"
        }), 201
    except Exception as e:
        logger.error(f"Error creating trade: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "version": "1.0"
        }), 400

@trades_bp.route('/<int:trade_id>', methods=['PUT'])
@handle_database_session(auto_commit=True, auto_close=True)
@invalidate_cache(['trades', 'tickers', 'dashboard'])  # Invalidate cache after updating trade
def update_trade(trade_id: int):
    """Update trade"""
    try:
        data = request.get_json()
        
        # Handle backward compatibility for type field
        if 'type' in data:
            data['investment_type'] = data.pop('type')
        
        # Ensure investment_type has a default value
        if 'investment_type' not in data or not data['investment_type']:
            data['investment_type'] = 'swing'
        
        db: Session = g.db
        trade = TradeService.update(db, trade_id, data)
        if trade:
            # Commit the transaction
            db.commit()
            logger.info(f"Transaction committed for trade {trade_id}")
            try:
                trade_dict = trade.to_dict()
                return jsonify({
                    "status": "success",
                    "data": trade_dict,
                    "message": "Trade updated successfully",
                    "version": "1.0"
                })
            except Exception as e:
                logger.error(f"Error converting trade to dict: {str(e)}")
                # Return basic trade data without relationships
                basic_data = {
                    "id": trade.id,
                    "trading_trading_account_id": trade.trading_trading_account_id,
                    "ticker_id": trade.ticker_id,
                    "trade_plan_id": trade.trade_plan_id,
                    "status": trade.status,
                    "investment_type": trade.investment_type,
                    "side": trade.side,
                    "created_at": trade.created_at.strftime('%Y-%m-%d %H:%M:%S') if trade.created_at else None,
                    "closed_at": trade.closed_at.strftime('%Y-%m-%d %H:%M:%S') if trade.closed_at else None,
                    "notes": trade.notes
                }
                return jsonify({
                    "status": "success",
                    "data": basic_data,
                    "message": "Trade updated successfully (basic data only)",
                    "version": "1.0"
                })
        return jsonify({
            "status": "error",
            "error": {"message": "Trade not found"},
            "version": "1.0"
        }), 404
    except Exception as e:
        logger.error(f"Error updating trade {trade_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "version": "1.0"
        }), 400

@trades_bp.route('/<int:trade_id>/close', methods=['POST'])
@handle_database_session(auto_commit=True, auto_close=True)
@invalidate_cache(['trades', 'tickers', 'dashboard'])  # Invalidate cache after closing trade
def close_trade(trade_id: int):
    """Close trade"""
    try:
        data = request.get_json() if request.is_json else {}
        db: Session = g.db
        trade = TradeService.close_trade(db, trade_id, data)
        if trade:
            return jsonify({
                "status": "success",
                "data": trade.to_dict(),
                "message": "Trade closed successfully",
                "version": "1.0"
            })
        return jsonify({
            "status": "error",
            "error": {"message": "Trade not found or already closed"},
            "version": "1.0"
        }), 404
    except Exception as e:
        logger.error(f"Error closing trade {trade_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "version": "1.0"
        }), 400

@trades_bp.route('/<int:trade_id>/cancel', methods=['POST'])
@handle_database_session(auto_commit=True, auto_close=True)
@invalidate_cache(['trades', 'tickers', 'dashboard'])  # Invalidate cache after cancelling trade
def cancel_trade(trade_id: int):
    """Cancel trade"""
    try:
        data = request.get_json() if request.is_json else {}
        cancel_reason = data.get('cancel_reason', 'Cancelled by user')
        db: Session = g.db
        trade = TradeService.cancel_trade(db, trade_id, cancel_reason)
        if trade:
            return jsonify({
                "status": "success",
                "data": trade.to_dict(),
                "message": "Trade cancelled successfully",
                "version": "1.0"
            })
        return jsonify({
            "status": "error",
            "error": {"message": "Trade not found or already cancelled"},
            "version": "1.0"
        }), 404
    except Exception as e:
        logger.error(f"Error cancelling trade {trade_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "version": "1.0"
        }), 400

@trades_bp.route('/<int:trade_id>', methods=['DELETE'])
@handle_database_session(auto_commit=True, auto_close=True)
@invalidate_cache(['trades', 'tickers', 'dashboard'])  # Invalidate cache after deleting trade
def delete_trade(trade_id: int):
    """Delete trade"""
    try:
        db: Session = g.db
        success = TradeService.delete(db, trade_id)
        if success:
            return jsonify({
                "status": "success",
                "message": "Trade deleted successfully",
                "version": "1.0"
            })
        
        # If deletion failed, it means there are linked items or trade not found
        return jsonify({
            "status": "error",
            "error": {
                "message": "Cannot delete trade - it has linked executions or other items"
            },
            "version": "1.0"
        }), 400
    except Exception as e:
        logger.error(f"Error deleting trade {trade_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "version": "1.0"
        }), 400

@trades_bp.route('/summary', methods=['GET'])
def get_trade_summary():
    """Get trade summary"""
    try:
        trading_account_id = request.args.get('trading_account_id', type=int)
        db: Session = next(get_db())
        summary = TradeService.get_trade_summary(db, trading_account_id)
        return jsonify({
            "status": "success",
            "data": summary,
            "message": "Trade summary retrieved successfully",
            "version": "1.0"
        })
    except Exception as e:
        logger.error(f"Error getting trade summary: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": "Failed to retrieve trade summary"},
            "version": "1.0"
        }), 500
    finally:
        db.close()
