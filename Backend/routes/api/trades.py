from flask import Blueprint, jsonify, request, g
from sqlalchemy.orm import Session
from config.database import get_db
from services.trade_service import TradeService
from services.trade_plan_matching_service import TradePlanMatchingService
from services.position_calculator_service import PositionCalculatorService
from services.date_normalization_service import DateNormalizationService
from services.preferences_service import PreferencesService
from services.advanced_cache_service import cache_for, cache_with_deps, invalidate_cache
from services.tag_service import TagService
import logging
from config import settings

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
preferences_service = PreferencesService()


def _get_date_normalizer():
    timezone_name = DateNormalizationService.resolve_timezone(
        request,
        preferences_service=preferences_service
    )
    return DateNormalizationService(timezone_name)


@trades_bp.route('/pending-plan/assignments', methods=['GET'])
@cache_with_deps(ttl=60, dependencies=['trades', 'trade-plans'])
@handle_database_session()
def get_trades_pending_plan_assignments():
    """Return ranked suggestions for linking trades to existing trade plans."""
    normalizer = None
    try:
        db: Session = g.db
        # Get user_id from Flask context (set by auth middleware)
        user_id = getattr(g, 'user_id', None)
        normalizer = _get_date_normalizer()
        limit = request.args.get('limit', type=int)
        suggestions_limit = request.args.get('suggestions', default=3, type=int)

        suggestions = TradePlanMatchingService.get_assignment_suggestions(
            db,
            user_id=user_id,
            max_items=limit,
            max_suggestions_per_trade=max(suggestions_limit or 1, 1),
        )

        payload = BaseEntityUtils.create_success_payload(
            normalizer,
            data=suggestions,
            extra={"count": len(suggestions)},
        )
        return jsonify(payload), 200
    except ValueError as exc:
        logger.warning(f"Invalid trade-plan assignment request: {exc}")
        error_payload = BaseEntityUtils.create_error_payload(normalizer, str(exc))
        return jsonify(error_payload), 400
    except Exception as exc:
        logger.error(f"Error building trade-plan assignment suggestions: {exc}")
        error_payload = BaseEntityUtils.create_error_payload(
            normalizer,
            "Failed to build assignment suggestions"
        )
        return jsonify(error_payload), 500


@trades_bp.route('/pending-plan/creations', methods=['GET'])
@cache_with_deps(ttl=60, dependencies=['trades', 'trade-plans'])
@handle_database_session()
def get_trades_pending_plan_creations():
    """Return suggestions for creating trade plans from trades without plans."""
    normalizer = None
    try:
        db: Session = g.db
        # Get user_id from Flask context (set by auth middleware)
        user_id = getattr(g, 'user_id', None)
        normalizer = _get_date_normalizer()
        limit = request.args.get('limit', type=int)

        assignment_preview = TradePlanMatchingService.get_assignment_suggestions(
            db,
            user_id=user_id,
            max_items=None,
            max_suggestions_per_trade=3,
        )
        assignment_index = {
            item["trade_id"]: item.get("best_score") or 0
            for item in assignment_preview
        }

        creations = TradePlanMatchingService.get_creation_suggestions(
            db,
            user_id=user_id,
            max_items=limit,
            assignment_index=assignment_index,
        )

        payload = BaseEntityUtils.create_success_payload(
            normalizer,
            data=creations,
            extra={
                "count": len(creations),
                "assignment_reference_count": len(assignment_index),
            },
        )
        return jsonify(payload), 200
    except ValueError as exc:
        logger.warning(f"Invalid trade-plan creation request: {exc}")
        error_payload = BaseEntityUtils.create_error_payload(normalizer, str(exc))
        return jsonify(error_payload), 400
    except Exception as exc:
        logger.error(f"Error building trade-plan creation suggestions: {exc}")
        error_payload = BaseEntityUtils.create_error_payload(
            normalizer,
            "Failed to build creation suggestions"
        )
        return jsonify(error_payload), 500

@trades_bp.route('/', methods=['GET'])
@cache_with_deps(ttl=60, dependencies=['trades', 'tickers', 'market-data'])
@handle_database_session()
def get_trades():
    """Get all trades with filtering options - enhanced with market data (OPTIMIZED)"""
    db: Session = g.db
    
    # Get user_id from Flask context (set by auth middleware)
    user_id = getattr(g, 'user_id', None)
    
    # Get filtering parameters
    trading_account_id = request.args.get('trading_account_id', type=int)
    ticker_id = request.args.get('ticker_id', type=int)
    status = request.args.get('status')
    
    # Pagination parameters
    page = request.args.get('page', type=int, default=1)
    per_page = request.args.get('per_page', type=int, default=100)
    per_page = min(per_page, 500)  # Max 500 per page
    
    try:
        normalizer = _get_date_normalizer()
        
        # If there are filtering parameters, use appropriate function
        if ticker_id:
            logger.info(f"Filtering trades by ticker_id={ticker_id}")
            trades = TradeService.get_by_ticker(db, ticker_id, user_id=user_id)
            logger.info(f"Found {len(trades)} trades for ticker {ticker_id}")
        elif trading_account_id and status:
            logger.info(f"Filtering trades by trading_account_id={trading_account_id} and status={status}")
            trades = TradeService.get_by_account_and_status(db, trading_account_id, status, user_id=user_id)
            logger.info(f"Found {len(trades)} trades for account {trading_account_id} with status {status}")
        elif trading_account_id:
            trades = TradeService.get_by_account(db, trading_account_id, user_id=user_id)
        elif status:
            trades = TradeService.get_by_status(db, status, user_id=user_id)
        else:
            trades = TradeService.get_all(db, user_id=user_id)
        
        # Apply pagination
        total_count = len(trades)
        start_idx = (page - 1) * per_page
        end_idx = start_idx + per_page
        paginated_trades = trades[start_idx:end_idx]
        
        # Convert trades to dict with market data and position data
        trade_dicts = []
        trade_ids = [trade.id for trade in paginated_trades]
        
        # Calculate positions for all trades in batch
        positions = position_calculator.calculate_positions_batch(db, trade_ids)
        
        # OPTIMIZATION: Batch fetch market data for all tickers (fixes N+1 problem)
        ticker_ids = list(set([trade.ticker_id for trade in paginated_trades if hasattr(trade, 'ticker_id') and trade.ticker_id]))
        market_data_map = {}
        
        if ticker_ids:
            try:
                from models.external_data import MarketDataQuote
                from sqlalchemy import text, func
                
                # Get latest market data for all tickers in one query using window function
                # This is more efficient than N+1 queries
                placeholders = ','.join([str(tid) for tid in ticker_ids])
                query = text(f"""
                    SELECT ticker_id, price, change_pct_day, change_amount_day
                    FROM (
                        SELECT ticker_id, price, change_pct_day, change_amount_day,
                               ROW_NUMBER() OVER (PARTITION BY ticker_id ORDER BY fetched_at DESC) as rn
                        FROM market_data_quotes
                        WHERE ticker_id IN ({placeholders})
                    ) ranked
                    WHERE rn = 1
                """)
                
                result = db.execute(query)
                for row in result:
                    market_data_map[row.ticker_id] = {
                        'current_price': float(row.price) if row.price is not None else None,
                        'daily_change': float(row.change_pct_day) if row.change_pct_day is not None else None,
                        'change_amount': float(row.change_amount_day) if row.change_amount_day is not None else None
                    }
            except Exception as market_error:
                logger.warning(f"Error batch fetching market data: {str(market_error)}")
                # Fallback: try simple query without window function
                try:
                    from models.external_data import MarketDataQuote
                    for ticker_id in ticker_ids:
                        latest_quote = db.query(MarketDataQuote).filter(
                            MarketDataQuote.ticker_id == ticker_id
                        ).order_by(MarketDataQuote.fetched_at.desc()).first()
                        if latest_quote:
                            market_data_map[ticker_id] = {
                                'current_price': latest_quote.price,
                                'daily_change': latest_quote.change_pct_day,
                                'change_amount': latest_quote.change_amount_day
                            }
                except:
                    pass
        
        for trade in paginated_trades:
            trade_dict = trade.to_dict()
            
            # Add market data from batch map
            if trade.ticker_id in market_data_map:
                market_data = market_data_map[trade.ticker_id]
                trade_dict['current_price'] = market_data['current_price']
                trade_dict['daily_change'] = market_data['daily_change']
                trade_dict['change_amount'] = market_data['change_amount']
            else:
                trade_dict['current_price'] = None
                trade_dict['daily_change'] = None
                trade_dict['change_amount'] = None
            
            # Add position data
            trade_dict['position'] = positions.get(trade.id)
            
            trade_dicts.append(trade_dict)
        
        trade_dicts = normalizer.normalize_output(trade_dicts)
        
        return jsonify({
            "status": "success",
            "data": trade_dicts,
            "pagination": {
                "page": page,
                "per_page": per_page,
                "total": total_count,
                "pages": (total_count + per_page - 1) // per_page
            },
            "message": "Trades retrieved successfully",
            "timestamp": normalizer.now_envelope(),
            "version": "1.0"
        })
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        logger.error(f"Error getting trades: {str(e)}\nTraceback:\n{error_trace}")
        normalizer = _get_date_normalizer()
        return jsonify({
            "status": "error",
            "error": {"message": f"Failed to retrieve trades: {str(e)}"},
            "timestamp": normalizer.now_envelope(),
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
@handle_database_session()
def get_trades_by_account(trading_account_id: int):
    """Get trades by account"""
    try:
        db: Session = g.db
        # Get user_id from Flask context (set by auth middleware)
        user_id = getattr(g, 'user_id', None)
        trades = TradeService.get_by_account(db, trading_account_id, user_id=user_id)
        normalizer = _get_date_normalizer()
        data = normalizer.normalize_output([trade.to_dict() for trade in trades])
        return jsonify({
            "status": "success",
            "data": data,
            "message": "TradingAccount trades retrieved successfully",
            "timestamp": normalizer.now_envelope(),
            "version": "1.0"
        })
    except Exception as e:
        logger.error(f"Error getting trades for account {trading_account_id}: {str(e)}")
        normalizer = _get_date_normalizer()
        return jsonify({
            "status": "error",
            "error": {"message": "Failed to retrieve account trades"},
            "timestamp": normalizer.now_envelope(),
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
        # Get user_id from Flask context (set by auth middleware)
        user_id = getattr(g, 'user_id', None)
        
        normalizer = _get_date_normalizer()
        data = request.get_json() or {}
        
        # Handle backward compatibility for type field
        if 'type' in data:
            data['investment_type'] = data.pop('type')
        
        # Ensure investment_type has a default value
        if 'investment_type' not in data or not data['investment_type']:
            data['investment_type'] = 'swing'
        
        # Sanitize HTML content for notes field
        if 'notes' in data and data['notes']:
            data['notes'] = BaseEntityUtils.sanitize_rich_text(data['notes'])
        
        db: Session = g.db
        
        # Verify trading_account belongs to user if provided
        if 'trading_account_id' in data and user_id is not None:
            from models.trading_account import TradingAccount
            account = db.query(TradingAccount).filter(
                TradingAccount.id == data['trading_account_id'],
                TradingAccount.user_id == user_id
            ).first()
            if not account:
                return jsonify({
                    "status": "error",
                    "error": {"message": "Trading account not found or does not belong to user"},
                    "timestamp": normalizer.now_envelope(),
                    "version": "1.0"
                }), 404
        
        # Verify ticker belongs to user if provided
        if 'ticker_id' in data and user_id is not None:
            from models.ticker import Ticker
            from models.user_ticker import UserTicker
            # Check if user has access to this ticker
            user_ticker = db.query(UserTicker).filter(
                UserTicker.user_id == user_id,
                UserTicker.ticker_id == data['ticker_id']
            ).first()
            if not user_ticker:
                return jsonify({
                    "status": "error",
                    "error": {"message": "Ticker not found or does not belong to user"},
                    "timestamp": normalizer.now_envelope(),
                    "version": "1.0"
                }), 404
        
        normalized_payload = normalizer.normalize_input_payload(data)
        trade = TradeService.create(db, normalized_payload, user_id=user_id)
        trade_dict = normalizer.normalize_output(trade.to_dict() if hasattr(trade, 'to_dict') else {})
        return jsonify({
            "status": "success",
            "data": trade_dict,
            "message": "Trade created successfully",
            "timestamp": normalizer.now_envelope(),
            "version": "1.0"
        }), 201
    except Exception as e:
        logger.error(f"Error creating trade: {str(e)}")
        normalizer = _get_date_normalizer()
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "timestamp": normalizer.now_envelope(),
            "version": "1.0"
        }), 400


@trades_bp.route('/<int:trade_id>/link-plan', methods=['POST'])
@handle_database_session(auto_commit=True, auto_close=True)
@invalidate_cache(['trades', 'trade-plans', 'dashboard', 'positions', 'portfolio'])
def link_trade_to_plan(trade_id: int):
    """Link a trade without a plan to an existing trade plan."""
    normalizer = None
    try:
        db: Session = g.db
        normalizer = _get_date_normalizer()
        payload = request.get_json() or {}
        plan_id = payload.get('trade_plan_id')

        if not isinstance(plan_id, int):
            raise ValueError("trade_plan_id is required")

        updated_trade = TradePlanMatchingService.link_trade_to_plan(db, trade_id, plan_id)

        success_payload = BaseEntityUtils.create_success_payload(
            normalizer,
            data=updated_trade,
            message="Trade linked to trade plan successfully",
        )
        return jsonify(success_payload), 200
    except ValueError as exc:
        logger.warning(f"Cannot link trade {trade_id} to trade plan: {exc}")
        error_payload = BaseEntityUtils.create_error_payload(normalizer, str(exc))
        return jsonify(error_payload), 400
    except Exception as exc:
        logger.error(f"Error linking trade {trade_id} to trade plan: {exc}")
        error_payload = BaseEntityUtils.create_error_payload(
            normalizer,
            "Failed to link trade to trade plan"
        )
        return jsonify(error_payload), 500

@trades_bp.route('/<int:trade_id>', methods=['PUT'])
@handle_database_session(auto_commit=True, auto_close=True)
@invalidate_cache(['trades', 'tickers', 'dashboard'])  # Invalidate cache after updating trade
def update_trade(trade_id: int):
    """Update trade"""
    try:
        normalizer = _get_date_normalizer()
        data = request.get_json() or {}
        
        # Handle backward compatibility for type field
        if 'type' in data:
            data['investment_type'] = data.pop('type')
        
        # Ensure investment_type has a default value
        if 'investment_type' not in data or not data['investment_type']:
            data['investment_type'] = 'swing'
        
        # Sanitize HTML content for notes field
        if 'notes' in data and data['notes']:
            data['notes'] = BaseEntityUtils.sanitize_rich_text(data['notes'])
        
        db: Session = g.db
        normalized_payload = normalizer.normalize_input_payload(data)
        trade = TradeService.update(db, trade_id, normalized_payload)
        if trade:
            # Commit the transaction
            db.commit()
            logger.info(f"Transaction committed for trade {trade_id}")
            try:
                trade_dict = normalizer.normalize_output(trade.to_dict())
                return jsonify({
                    "status": "success",
                    "data": trade_dict,
                    "message": "Trade updated successfully",
                    "timestamp": normalizer.now_envelope(),
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
                basic_data = normalizer.normalize_output(basic_data)
                return jsonify({
                    "status": "success",
                    "data": basic_data,
                    "message": "Trade updated successfully (basic data only)",
                    "timestamp": normalizer.now_envelope(),
                    "version": "1.0"
                })
        return jsonify({
            "status": "error",
            "error": {"message": "Trade not found"},
            "timestamp": normalizer.now_envelope(),
            "version": "1.0"
        }), 404
    except Exception as e:
        logger.error(f"Error updating trade {trade_id}: {str(e)}")
        normalizer = _get_date_normalizer()
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "timestamp": normalizer.now_envelope(),
            "version": "1.0"
        }), 400

@trades_bp.route('/<int:trade_id>/close', methods=['POST'])
@handle_database_session(auto_commit=True, auto_close=True)
@invalidate_cache(['trades', 'tickers', 'dashboard'])  # Invalidate cache after closing trade
def close_trade(trade_id: int):
    """Close trade"""
    try:
        normalizer = _get_date_normalizer()
        data = request.get_json() if request.is_json else {}
        normalized_payload = normalizer.normalize_input_payload(data)
        db: Session = g.db
        trade = TradeService.close_trade(db, trade_id, normalized_payload or {})
        if trade:
            trade_dict = normalizer.normalize_output(trade.to_dict())
            return jsonify({
                "status": "success",
                "data": trade_dict,
                "message": "Trade closed successfully",
                "timestamp": normalizer.now_envelope(),
                "version": "1.0"
            })
        return jsonify({
            "status": "error",
            "error": {"message": "Trade not found or already closed"},
            "timestamp": normalizer.now_envelope(),
            "version": "1.0"
        }), 404
    except Exception as e:
        logger.error(f"Error closing trade {trade_id}: {str(e)}")
        normalizer = _get_date_normalizer()
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "timestamp": normalizer.now_envelope(),
            "version": "1.0"
        }), 400

@trades_bp.route('/<int:trade_id>/cancel', methods=['POST'])
@handle_database_session(auto_commit=True, auto_close=True)
@invalidate_cache(['trades', 'tickers', 'dashboard'])  # Invalidate cache after cancelling trade
def cancel_trade(trade_id: int):
    """Cancel trade"""
    try:
        normalizer = _get_date_normalizer()
        data = request.get_json() if request.is_json else {}
        cancel_reason = data.get('cancel_reason', 'Cancelled by user')
        db: Session = g.db
        trade = TradeService.cancel_trade(db, trade_id, cancel_reason)
        if trade:
            trade_dict = normalizer.normalize_output(trade.to_dict())
            return jsonify({
                "status": "success",
                "data": trade_dict,
                "message": "Trade cancelled successfully",
                "timestamp": normalizer.now_envelope(),
                "version": "1.0"
            })
        return jsonify({
            "status": "error",
            "error": {"message": "Trade not found or already cancelled"},
            "timestamp": normalizer.now_envelope(),
            "version": "1.0"
        }), 404
    except Exception as e:
        logger.error(f"Error cancelling trade {trade_id}: {str(e)}")
        normalizer = _get_date_normalizer()
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "timestamp": normalizer.now_envelope(),
            "version": "1.0"
        }), 400

@trades_bp.route('/<int:trade_id>', methods=['DELETE'])
@handle_database_session(auto_commit=True, auto_close=True)
@invalidate_cache(['trades', 'tickers', 'dashboard'])  # Invalidate cache after deleting trade
def delete_trade(trade_id: int):
    """Delete trade"""
    try:
        normalizer = _get_date_normalizer()
        db: Session = g.db
        # Tag cleanup is handled automatically by SQLAlchemy event listeners
        
        success = TradeService.delete(db, trade_id)
        if success:
            return jsonify({
                "status": "success",
                "message": "Trade deleted successfully",
                "timestamp": normalizer.now_envelope(),
                "version": "1.0"
            })
        
        # If deletion failed, it means there are linked items or trade not found
        return jsonify({
            "status": "error",
            "error": {
                "message": "Cannot delete trade - it has linked executions or other items"
            },
            "timestamp": normalizer.now_envelope(),
            "version": "1.0"
        }), 400
    except Exception as e:
        logger.error(f"Error deleting trade {trade_id}: {str(e)}")
        normalizer = _get_date_normalizer()
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "timestamp": normalizer.now_envelope(),
            "version": "1.0"
        }), 400

@trades_bp.route('/summary', methods=['GET'])
def get_trade_summary():
    """Get trade summary"""
    try:
        normalizer = _get_date_normalizer()
        trading_account_id = request.args.get('trading_account_id', type=int)
        db: Session = next(get_db())
        summary = TradeService.get_trade_summary(db, trading_account_id)
        return jsonify({
            "status": "success",
            "data": summary,
            "message": "Trade summary retrieved successfully",
            "timestamp": normalizer.now_envelope(),
            "version": "1.0"
        })
    except Exception as e:
        logger.error(f"Error getting trade summary: {str(e)}")
        normalizer = _get_date_normalizer()
        return jsonify({
            "status": "error",
            "error": {"message": "Failed to retrieve trade summary"},
            "timestamp": normalizer.now_envelope(),
            "version": "1.0"
        }), 500
    finally:
        db.close()
