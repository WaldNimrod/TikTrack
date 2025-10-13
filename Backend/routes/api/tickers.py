"""
API Routes for Ticker Management - TikTrack

This module contains all API endpoints for managing tickers in the system.
Includes CRUD operations, linked items checking and more.

Endpoints:
    GET /api/tickers/ - Get all tickers
    GET /api/tickers/<id> - Get ticker by ID
    POST /api/tickers/ - Create new ticker
    PUT /api/tickers/<id> - Update ticker
    DELETE /api/tickers/<id> - Delete ticker
    GET /api/tickers/<id>/linked-items - Check linked items

Author: TikTrack Development Team
Version: 1.0
Date: August 2025
"""

from flask import Blueprint, jsonify, request, g
from sqlalchemy.orm import Session
from config.database import get_db
from services.ticker_service import TickerService
from services.advanced_cache_service import cache_for, cache_with_deps, invalidate_cache
import logging
from typing import Dict, Any, Optional

# Import base classes
from .base_entity import BaseEntityAPI
from .base_entity_decorators import api_endpoint, handle_database_session, validate_request
from .base_entity_utils import BaseEntityUtils

logger = logging.getLogger(__name__)

tickers_bp = Blueprint('tickers', __name__, url_prefix='/api/tickers')

# Initialize base API
base_api = BaseEntityAPI('tickers', TickerService, 'tickers')

@tickers_bp.route('/', methods=['GET'])
@api_endpoint(cache_ttl=5, rate_limit=60)
@handle_database_session()
def get_tickers():
    """Get all tickers - enhanced with market data, with pagination/filters"""
    db: Session = g.db
    try:
        # Parse query parameters
        limit_param = request.args.get('limit', default=None, type=int)
        offset_param = request.args.get('offset', default=None, type=int)
        q_param = request.args.get('q', default=None, type=str)
        type_param = request.args.get('type', default=None, type=str)
        currency_param = request.args.get('currency_id', default=None, type=int)
        sort_param = request.args.get('sort', default=None, type=str)
        fields_param = request.args.get('fields', default=None, type=str)

        fields_list = None
        if fields_param:
            fields_list = [f.strip() for f in fields_param.split(',') if f.strip()]

        tickers = TickerService.get_all(
            db,
            limit=limit_param,
            offset=offset_param,
            fields=fields_list,
            q=q_param,
            ticker_type=type_param,
            currency_id=currency_param,
            sort=sort_param
        )
        
        # Convert tickers to dict with market data
        tickers_data = []
        for ticker in tickers:
            ticker_dict = ticker.to_dict()
            
            # Add market data fields if they exist (dynamically added by TickerService)
            if hasattr(ticker, 'current_price'):
                ticker_dict['current_price'] = ticker.current_price
            if hasattr(ticker, 'change_percent'):
                ticker_dict['change_percent'] = ticker.change_percent
            if hasattr(ticker, 'change_amount'):
                ticker_dict['change_amount'] = ticker.change_amount
            if hasattr(ticker, 'volume'):
                ticker_dict['volume'] = ticker.volume
            if hasattr(ticker, 'yahoo_updated_at'):
                ticker_dict['yahoo_updated_at'] = ticker.yahoo_updated_at.isoformat() if ticker.yahoo_updated_at else None
            if hasattr(ticker, 'data_source'):
                ticker_dict['data_source'] = ticker.data_source
                
            tickers_data.append(ticker_dict)
        
        return jsonify({
            "status": "success",
            "data": tickers_data,
            "message": "Tickers retrieved successfully",
            "version": "1.0"
        })
    except Exception as e:
        logger.error(f"Error getting tickers: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": "Failed to retrieve tickers"},
            "version": "1.0"
        }), 500


@tickers_bp.route('/active', methods=['GET'])
@handle_database_session()
def get_active_tickers():
    """Get active/open tickers with dynamic TTL based on refresh policy"""
    db: Session = g.db
    try:
        from services.external_data.policy_provider import get_refresh_policy_for_status
        # Parameters
        active_mode = request.args.get('active_mode', default='active', type=str)
        market_flag = request.args.get('market', default=None, type=str)
        fields_param = request.args.get('fields', default=None, type=str)

        fields_list = None
        if fields_param:
            fields_list = [f.strip() for f in fields_param.split(',') if f.strip()]

        # Determine TTL via provider
        market_hours = None
        if market_flag is not None:
            market_hours = market_flag.lower() in ('1', 'true', 'yes')
        ttl_seconds = get_refresh_policy_for_status(db, active_mode, market_hours)

        # Query tickers per mode
        base_query = db.query(TickerService).session.query  # keep style consistent
        from models.ticker import Ticker
        query = db.query(Ticker)
        if active_mode == 'active':
            query = query.filter(Ticker.active_trades == True, Ticker.status == 'open')
        elif active_mode == 'open':
            query = query.filter(Ticker.status == 'open')
        else:  # both
            query = query.filter(Ticker.status == 'open')

        tickers = TickerService.get_all(db, fields=fields_list)
        # Filter per query conditions above (keep projection logic in service)
        symbols_open = {t.id for t in query.all()}
        filtered = [t for t in tickers if t.id in symbols_open]

        # Build response JSON now
        data = []
        for t in filtered:
            d = t.to_dict()
            if hasattr(t, 'current_price'):
                d['current_price'] = t.current_price
            if hasattr(t, 'change_percent'):
                d['change_percent'] = t.change_percent
            if hasattr(t, 'change_amount'):
                d['change_amount'] = t.change_amount
            if hasattr(t, 'volume'):
                d['volume'] = t.volume
            if hasattr(t, 'yahoo_updated_at'):
                d['yahoo_updated_at'] = t.yahoo_updated_at.isoformat() if t.yahoo_updated_at else None
            if hasattr(t, 'data_source'):
                d['data_source'] = t.data_source
            data.append(d)

        # Manually apply backend cache with dependencies
        from services.advanced_cache_service import advanced_cache_service
        cache_key = f"tickers_active:{active_mode}:{fields_param}:{market_hours}"
        response_json = jsonify({
            "status": "success",
            "data": data,
            "message": "Active tickers retrieved successfully",
            "version": "1.0"
        })
        advanced_cache_service.set(cache_key, response_json, ttl=ttl_seconds, dependencies=['external_data', 'tickers'])
        return response_json
    except Exception as e:
        logger.error(f"Error getting active tickers: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": "Failed to retrieve active tickers"},
            "version": "1.0"
        }), 500

@tickers_bp.route('/<int:ticker_id>', methods=['GET'])
@api_endpoint(cache_ttl=300, rate_limit=60)
@handle_database_session()
def get_ticker(ticker_id: int):
    """Get ticker by ID with market data"""
    db: Session = g.db
    try:
        ticker = TickerService.get_by_id(db, ticker_id)
        if ticker:
            # Add market data like in get_all method
            from models.external_data import MarketDataQuote
            latest_quote = db.query(MarketDataQuote).filter(
                MarketDataQuote.ticker_id == ticker.id
            ).order_by(MarketDataQuote.fetched_at.desc()).first()
            
            ticker_dict = ticker.to_dict()
            
            if latest_quote:
                ticker_dict['current_price'] = latest_quote.price
                ticker_dict['change_percent'] = latest_quote.change_pct_day
                ticker_dict['change_amount'] = latest_quote.change_amount_day
                ticker_dict['volume'] = latest_quote.volume
                ticker_dict['yahoo_updated_at'] = latest_quote.fetched_at.isoformat() if latest_quote.fetched_at else None
                ticker_dict['data_source'] = latest_quote.source
            
            return jsonify({
                "status": "success",
                "data": ticker_dict,
                "message": "Ticker retrieved successfully",
                "version": "1.0"
            })
        return jsonify({
            "status": "error",
            "error": {"message": "Ticker not found"},
            "version": "1.0"
        }), 404
    except Exception as e:
        logger.error(f"Error getting ticker {ticker_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": "Failed to retrieve ticker"},
            "version": "1.0"
        }), 500

@tickers_bp.route('/<int:ticker_id>/linked-items', methods=['GET'])
def check_linked_items(ticker_id: int):
    """Check linked items to ticker before deletion"""
    try:
        print(f"Starting check_linked_items for ticker {ticker_id}")
        db: Session = next(get_db())
        
        # Check that ticker exists
        ticker = TickerService.get_by_id(db, ticker_id)
        if not ticker:
            return jsonify({
                "status": "error",
                "error": {"message": "Ticker not found"},
                "version": "1.0"
            }), 404
        
        print(f"Ticker found: {ticker.symbol}")
        
        # Check linked items using the generic function
        try:
            print(f"About to call check_linked_items_generic for ticker {ticker_id}")
            linked_items = TickerService.check_linked_items_generic(db, 'ticker', ticker_id)
            print(f"Successfully called check_linked_items_generic, result: {linked_items}")
        except Exception as e:
            logger.error(f"Error in check_linked_items_generic: {str(e)}")
            print(f"Error in check_linked_items_generic: {str(e)}")
            import traceback
            traceback.print_exc()
            return jsonify({
                "status": "error",
                "error": {"message": f"Failed to check linked items: {str(e)}"},
                "version": "1.0"
            }), 500
        
        return jsonify({
            "status": "success",
            "data": linked_items,
            "message": "Linked items check completed",
            "version": "1.0"
        })
    except Exception as e:
        logger.error(f"Error checking linked items for ticker {ticker_id}: {str(e)}")
        print(f"Main error checking linked items for ticker {ticker_id}: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            "status": "error",
            "error": {"message": "Failed to check linked items"},
            "version": "1.0"
        }), 500
    finally:
        db.close()

@tickers_bp.route('/', methods=['POST'])
@invalidate_cache(['tickers', 'tickers:*', 'linked_items:ticker:*', 'dashboard'])  # Invalidate cache after creating ticker
def create_ticker():
    """Create new ticker"""
    db = None
    try:
        # Optional external fetch flag (opt-in to avoid blocking create)
        fetch_external = request.args.get('fetch_external') in ('1', 'true', 'True')
        data = request.get_json()
        if data is None:
            return jsonify({
                "status": "error",
                "error": {"message": "Invalid JSON data"},
                "version": "1.0"
            }), 400
        
        # Get database session first
        db: Session = next(get_db())
        
        # Create the ticker first
        ticker = TickerService.create(db, data)
        
        # AFTER creating the ticker, optionally fetch external data (non-blocking by default)
        external_data_available = False
        external_data_error = None
        quote_data = None
        
        if fetch_external:
            try:
                from services.external_data.yahoo_finance_adapter import YahooFinanceAdapter
                from models.external_data import ExternalDataProvider
                
                # Get or create Yahoo Finance provider
                provider = db.query(ExternalDataProvider).filter(
                    ExternalDataProvider.name == 'yahoo_finance'
                ).first()
                
                if not provider:
                    # Create provider if it doesn't exist
                    provider = ExternalDataProvider(
                        name='yahoo_finance',
                        display_name='Yahoo Finance',
                        is_active=True,
                        provider_type='finance',
                        base_url='https://query1.finance.yahoo.com',
                        rate_limit_per_hour=900,
                        timeout_seconds=20
                    )
                    db.add(provider)
                    db.commit()
                    db.refresh(provider)
                
                # Initialize adapter with database session
                yahoo_adapter = YahooFinanceAdapter(db, provider.id)
                
                # Try to get and cache quote for the newly created ticker
                quote_data = yahoo_adapter._get_enhanced_quote_data(data['symbol'])
                if quote_data and quote_data.price:
                    external_data_available = True
                    logger.info(f"✅ External data fetched and cached for new ticker {data['symbol']}: ${quote_data.price}")
                else:
                    external_data_error = "No external data available for this symbol"
                    logger.warning(f"⚠️ No external data available for new ticker {data['symbol']}")
            except Exception as e:
                external_data_error = f"Failed to fetch external data: {str(e)}"
                logger.warning(f"⚠️ Failed to fetch external data for new ticker {data['symbol']}: {e}")
        
        # CACHE DISABLED - No need to clear cache
        
        # Prepare response with external data status
        response_data = {
            "status": "success",
            "data": ticker.to_dict(),
            "message": "Ticker created successfully",
            "external_data": {
                "attempted": fetch_external,
                "available": external_data_available,
                "error": external_data_error,
                "quote": {
                    "price": quote_data.price if quote_data else None,
                    "currency": quote_data.currency if quote_data else None,
                    "volume": quote_data.volume if quote_data else None
                } if quote_data else None
            },
            "version": "1.0"
        }
        
        return jsonify(response_data), 201
    except Exception as e:
        logger.error(f"Error creating ticker: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "version": "1.0"
        }), 400
    finally:
        if db:
            db.close()

@tickers_bp.route('/<int:ticker_id>', methods=['PUT'])
@invalidate_cache(['tickers', 'tickers:*', 'linked_items:ticker:*', 'dashboard'])  # Invalidate cache after updating ticker
def update_ticker(ticker_id: int):
    """Update ticker"""
    db = None
    try:
        data = request.get_json()
        if data is None:
            return jsonify({
                "status": "error",
                "error": {"message": "Invalid JSON data"},
                "version": "1.0"
            }), 400
        
        db: Session = next(get_db())
        
        # Check that ticker exists
        ticker = TickerService.get_by_id(db, ticker_id)
        if not ticker:
            return jsonify({
                "status": "error",
                "error": {"message": "Ticker not found"},
                "version": "1.0"
            }), 404
        
        # Check active_trades constraint - prevent cancellation if ticker has active trades
        if 'status' in data and data['status'] == 'cancelled':
            # Check both active_trades field and actual open trades
            from models.trade import Trade
            from models.trade_plan import TradePlan
            
            # Check actual open trades
            open_trades_count = db.query(Trade).filter(
                Trade.ticker_id == ticker_id,
                Trade.status == 'open'
            ).count()
            
            # Check actual open trade plans
            open_plans_count = db.query(TradePlan).filter(
                TradePlan.ticker_id == ticker_id,
                TradePlan.status == 'open'
            ).count()
            
            if ticker.active_trades or open_trades_count > 0 or open_plans_count > 0:
                return jsonify({
                    "status": "error",
                    "error": {"message": "Cannot cancel ticker with active trades. Please close all open trades first."},
                    "version": "1.0"
                }), 400
        
        # Update ticker
        ticker = TickerService.update(db, ticker_id, data)
        if ticker:
            return jsonify({
                "status": "success",
                "data": ticker.to_dict(),
                "message": "Ticker updated successfully",
                "version": "1.0"
            })
        return jsonify({
            "status": "error",
            "error": {"message": "Ticker not found"},
            "version": "1.0"
        }), 404
    except Exception as e:
        logger.error(f"Error updating ticker {ticker_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "version": "1.0"
        }), 400
    finally:
        if db:
            db.close()

@tickers_bp.route('/<int:ticker_id>', methods=['DELETE'])
@invalidate_cache(['tickers', 'tickers:*', 'linked_items:ticker:*', 'dashboard'])  # Invalidate cache after deleting ticker
def delete_ticker(ticker_id: int):
    """Delete ticker"""
    try:
        db: Session = next(get_db())
        
        # Check that ticker exists
        ticker = TickerService.get_by_id(db, ticker_id)
        if not ticker:
            return jsonify({
                "status": "error",
                "error": {"message": "Ticker not found"},
                "version": "1.0"
            }), 404
        
        # Check active_trades constraint - prevent deletion if ticker has active trades
        if ticker.active_trades:
            return jsonify({
                "status": "error",
                "error": {"message": "Cannot delete ticker with active trades. Please close all open trades first."},
                "version": "1.0"
            }), 400
        
        # Check linked items
        linked_items = TickerService.check_linked_items(db, ticker_id)
        if linked_items['has_linked_items']:
            return jsonify({
                "status": "error",
                "error": {"message": "Cannot delete ticker with linked items (trades, trade plans, notes, or alerts)"},
                "version": "1.0"
            }), 400
        
        # Delete ticker
        success = TickerService.delete(db, ticker_id)
        if success:
            # CACHE DISABLED - No need to clear cache
            
            # Prepare response
            response_data = {
                "status": "success",
                "message": "Ticker deleted successfully",
                "version": "1.0"
            }
            
            return jsonify(response_data)
        return jsonify({
            "status": "error",
            "error": {"message": "Failed to delete ticker"},
            "version": "1.0"
        }), 500
    except Exception as e:
        logger.error(f"Error deleting ticker {ticker_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "version": "1.0"
        }), 500
    finally:
        db.close()

@tickers_bp.route('/<int:ticker_id>/update-active-trades', methods=['PUT'])
def update_active_trades(ticker_id: int):
    """Update only the active_trades field for a ticker"""
    try:
        db: Session = next(get_db())
        ticker = TickerService.get_by_id(db, ticker_id)
        
        if not ticker:
            return jsonify({
                "status": "error",
                "error": {"message": "Ticker not found"},
                "version": "1.0"
            }), 404
        
        # Check if there are active plans or trades for this ticker
        from models.trade import Trade
        from models.trade_plan import TradePlan
        
        # Check active trades
        active_trades = db.query(Trade).filter(
            Trade.ticker_id == ticker_id,
            Trade.status == 'open'
        ).count()
        
        # Check active trade plans
        active_plans = db.query(TradePlan).filter(
            TradePlan.ticker_id == ticker_id,
            TradePlan.status == 'open'
        ).count()
        
        # Update active_trades field
        ticker.active_trades = (active_trades > 0 or active_plans > 0)
        db.commit()
        
        logger.info(f"Updated active_trades for ticker {ticker_id} to {ticker.active_trades} (trades: {active_trades}, plans: {active_plans})")
        
        return jsonify({
            "status": "success",
            "data": ticker.to_dict(),
            "message": "Active trades field updated successfully",
            "version": "1.0"
        })
        
    except Exception as e:
        logger.error(f"Error updating active_trades for ticker {ticker_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "version": "1.0"
        }), 500
    finally:
        db.close()

@tickers_bp.route('/update-all-active-trades', methods=['POST'])
@invalidate_cache(['tickers', 'tickers:*', 'dashboard'])  # Invalidate cache after updating all active trades
def update_all_active_trades():
    """Update active_trades field for all tickers based on open trades and plans"""
    try:
        db: Session = next(get_db())
        
        # Get all tickers
        tickers = TickerService.get_all(db)
        
        updated_count = 0
        
        for ticker in tickers:
            # Check active trades
            from models.trade import Trade
            from models.trade_plan import TradePlan
            
            active_trades = db.query(Trade).filter(
                Trade.ticker_id == ticker.id,
                Trade.status == 'open'
            ).count()
            
            # Check active trade plans
            active_plans = db.query(TradePlan).filter(
                TradePlan.ticker_id == ticker.id,
                TradePlan.status == 'open'
            ).count()
            
            # Update active_trades field
            new_active_trades = (active_trades > 0 or active_plans > 0)
            
            if ticker.active_trades != new_active_trades:
                ticker.active_trades = new_active_trades
                updated_count += 1
                logger.info(f"Updated ticker {ticker.symbol}: active_trades = {new_active_trades} (trades: {active_trades}, plans: {active_plans})")
        
        db.commit()
        
        logger.info(f"Updated active_trades for {updated_count} tickers")
        
        return jsonify({
            "status": "success",
            "data": {
                "updated_count": updated_count,
                "total_tickers": len(tickers)
            },
            "message": f"Updated active_trades for {updated_count} tickers",
            "version": "1.0"
        })
        
    except Exception as e:
        logger.error(f"Error updating all active_trades: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "version": "1.0"
        }), 500
    finally:
        db.close()

@tickers_bp.route('/<int:ticker_id>/update-status-auto', methods=['PUT'])
def update_ticker_status_auto(ticker_id: int):
    """Update ticker status automatically based on linked trades and trade plans"""
    try:
        db: Session = next(get_db())
        
        # Check that ticker exists
        ticker = TickerService.get_by_id(db, ticker_id)
        if not ticker:
            return jsonify({
                "status": "error",
                "error": {"message": "Ticker not found"},
                "version": "1.0"
            }), 404
        
        # Update ticker status automatically
        success = TickerService.update_ticker_status_auto(db, ticker_id)
        if success:
            # Get updated ticker
            updated_ticker = TickerService.get_by_id(db, ticker_id)
            return jsonify({
                "status": "success",
                "data": updated_ticker.to_dict(),
                "message": "Ticker status updated automatically",
                "version": "1.0"
            })
        else:
            return jsonify({
                "status": "error",
                "error": {"message": "Failed to update ticker status"},
                "version": "1.0"
            }), 500
        
    except Exception as e:
        logger.error(f"Error updating ticker status auto {ticker_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "version": "1.0"
        }), 500
    finally:
        db.close()

@tickers_bp.route('/update-all-statuses-auto', methods=['POST'])
@invalidate_cache(['tickers', 'dashboard'])  # Invalidate cache after updating all statuses
def update_all_statuses_auto():
    """Update status for all non-cancelled tickers automatically"""
    try:
        db: Session = next(get_db())
        
        # Update all ticker statuses automatically
        updated_count = TickerService.update_all_ticker_statuses_auto(db)
        
        # Get updated tickers for response
        tickers = TickerService.get_all(db)
        
        return jsonify({
            "status": "success",
            "data": {
                "updated_count": updated_count,
                "total_tickers": len(tickers),
                "tickers": [ticker.to_dict() for ticker in tickers]
            },
            "message": f"Updated status for {updated_count} tickers automatically",
            "version": "1.0"
        })
        
    except Exception as e:
        logger.error(f"Error updating all ticker statuses auto: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "version": "1.0"
        }), 500
    finally:
        db.close()

@tickers_bp.route('/<int:ticker_id>/cancel', methods=['POST'])
@invalidate_cache(['tickers', 'tickers:*', 'linked_items:ticker:*', 'dashboard'])  # Invalidate cache after cancelling ticker
def cancel_ticker(ticker_id: int):
    """Cancel ticker"""
    db = None
    try:
        data = request.get_json() if request.is_json else {}
        cancel_reason = data.get('cancel_reason', 'Cancelled by user')
        db: Session = next(get_db())
        
        # Check that ticker exists
        ticker = TickerService.get_by_id(db, ticker_id)
        if not ticker:
            return jsonify({
                "status": "error",
                "error": {"message": "Ticker not found"},
                "version": "1.0"
            }), 404
        
        # Check if ticker is already cancelled
        if ticker.status == 'cancelled':
            return jsonify({
                "status": "error",
                "error": {"message": "Ticker is already cancelled"},
                "version": "1.0"
            }), 400
        
        # Check active_trades constraint - prevent cancellation if ticker has active trades
        from models.trade import Trade
        from models.trade_plan import TradePlan
        
        # Check actual open trades
        open_trades_count = db.query(Trade).filter(
            Trade.ticker_id == ticker_id,
            Trade.status == 'open'
        ).count()
        
        # Check actual open trade plans
        open_plans_count = db.query(TradePlan).filter(
            TradePlan.ticker_id == ticker_id,
            TradePlan.status == 'open'
        ).count()
        
        if ticker.active_trades or open_trades_count > 0 or open_plans_count > 0:
            return jsonify({
                "status": "error",
                "error": {"message": "Cannot cancel ticker with active trades. Please close all open trades first."},
                "version": "1.0"
            }), 400
        
        # Update ticker status to cancelled
        success = TickerService.update(db, ticker_id, {
            'status': 'cancelled'
        })
        
        if success:
            # Get updated ticker
            updated_ticker = TickerService.get_by_id(db, ticker_id)
            return jsonify({
                "status": "success",
                "data": updated_ticker.to_dict(),
                "message": "Ticker cancelled successfully",
                "version": "1.0"
            })
        else:
            return jsonify({
                "status": "error",
                "error": {"message": "Failed to cancel ticker"},
                "version": "1.0"
            }), 500
        
    except Exception as e:
        logger.error(f"Error cancelling ticker {ticker_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "version": "1.0"
        }), 400
    finally:
        if db:
            db.close()

# Endpoint removed - status updates automatically now
