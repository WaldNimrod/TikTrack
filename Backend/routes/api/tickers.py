"""
API Routes for Ticker Management - TikTrack

This module contains all API endpoints for managing tickers in the system.
Includes CRUD operations, linked items checking and more.

Endpoints:
    GET /api/v1/tickers/ - Get all tickers
    GET /api/v1/tickers/<id> - Get ticker by ID
    POST /api/v1/tickers/ - Create new ticker
    PUT /api/v1/tickers/<id> - Update ticker
    DELETE /api/v1/tickers/<id> - Delete ticker
    GET /api/v1/tickers/<id>/linked-items - Check linked items

Author: TikTrack Development Team
Version: 1.0
Date: August 2025
"""

from flask import Blueprint, jsonify, request
from sqlalchemy.orm import Session
from config.database import get_db
from services.ticker_service import TickerService
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

tickers_bp = Blueprint('tickers', __name__, url_prefix='/api/v1/tickers')

@tickers_bp.route('/', methods=['GET'])
def get_tickers():
    """Get all tickers"""
    try:
        db: Session = next(get_db())
        tickers = TickerService.get_all(db)
        return jsonify({
            "status": "success",
            "data": [ticker.to_dict() for ticker in tickers],
            "message": "Tickers retrieved successfully",
            "version": "v1"
        })
    except Exception as e:
        logger.error(f"Error getting tickers: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": "Failed to retrieve tickers"},
            "version": "v1"
        }), 500
    finally:
        db.close()

@tickers_bp.route('/<int:ticker_id>', methods=['GET'])
def get_ticker(ticker_id: int):
    """Get ticker by ID"""
    try:
        db: Session = next(get_db())
        ticker = TickerService.get_by_id(db, ticker_id)
        if ticker:
            return jsonify({
                "status": "success",
                "data": ticker.to_dict(),
                "message": "Ticker retrieved successfully",
                "version": "v1"
            })
        return jsonify({
            "status": "error",
            "error": {"message": "Ticker not found"},
            "version": "v1"
        }), 404
    except Exception as e:
        logger.error(f"Error getting ticker {ticker_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": "Failed to retrieve ticker"},
            "version": "v1"
        }), 500
    finally:
        db.close()

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
                "version": "v1"
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
                "version": "v1"
            }), 500
        
        return jsonify({
            "status": "success",
            "data": linked_items,
            "message": "Linked items check completed",
            "version": "v1"
        })
    except Exception as e:
        logger.error(f"Error checking linked items for ticker {ticker_id}: {str(e)}")
        print(f"Main error checking linked items for ticker {ticker_id}: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            "status": "error",
            "error": {"message": "Failed to check linked items"},
            "version": "v1"
        }), 500
    finally:
        db.close()

@tickers_bp.route('/', methods=['POST'])
def create_ticker():
    """Create new ticker"""
    try:
        data = request.get_json()
        db: Session = next(get_db())
        ticker = TickerService.create(db, data)
        return jsonify({
            "status": "success",
            "data": ticker.to_dict(),
            "message": "Ticker created successfully",
            "version": "v1"
        }), 201
    except Exception as e:
        logger.error(f"Error creating ticker: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "version": "v1"
        }), 400
    finally:
        db.close()

@tickers_bp.route('/<int:ticker_id>', methods=['PUT'])
def update_ticker(ticker_id: int):
    """Update ticker"""
    try:
        data = request.get_json()
        db: Session = next(get_db())
        
        # Check that ticker exists
        ticker = TickerService.get_by_id(db, ticker_id)
        if not ticker:
            return jsonify({
                "status": "error",
                "error": {"message": "Ticker not found"},
                "version": "v1"
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
                    "version": "v1"
                }), 400
        
        # Update ticker
        ticker = TickerService.update(db, ticker_id, data)
        if ticker:
            return jsonify({
                "status": "success",
                "data": ticker.to_dict(),
                "message": "Ticker updated successfully",
                "version": "v1"
            })
        return jsonify({
            "status": "error",
            "error": {"message": "Ticker not found"},
            "version": "v1"
        }), 404
    except Exception as e:
        logger.error(f"Error updating ticker {ticker_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "version": "v1"
        }), 400
    finally:
        db.close()

@tickers_bp.route('/<int:ticker_id>', methods=['DELETE'])
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
                "version": "v1"
            }), 404
        
        # Check active_trades constraint - prevent deletion if ticker has active trades
        if ticker.active_trades:
            return jsonify({
                "status": "error",
                "error": {"message": "Cannot delete ticker with active trades. Please close all open trades first."},
                "version": "v1"
            }), 400
        
        # Check linked items
        linked_items = TickerService.check_linked_items(db, ticker_id)
        if linked_items['has_linked_items']:
            return jsonify({
                "status": "error",
                "error": {"message": "Cannot delete ticker with linked items (trades, trade plans, notes, or alerts)"},
                "version": "v1"
            }), 400
        
        # Delete ticker
        success = TickerService.delete(db, ticker_id)
        if success:
            return jsonify({
                "status": "success",
                "message": "Ticker deleted successfully",
                "version": "v1"
            })
        return jsonify({
            "status": "error",
            "error": {"message": "Failed to delete ticker"},
            "version": "v1"
        }), 500
    except Exception as e:
        logger.error(f"Error deleting ticker {ticker_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "version": "v1"
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
                "version": "v1"
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
            "version": "v1"
        })
        
    except Exception as e:
        logger.error(f"Error updating active_trades for ticker {ticker_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "version": "v1"
        }), 500
    finally:
        db.close()

@tickers_bp.route('/update-all-active-trades', methods=['POST'])
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
            "version": "v1"
        })
        
    except Exception as e:
        logger.error(f"Error updating all active_trades: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "version": "v1"
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
                "version": "v1"
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
                "version": "v1"
            })
        else:
            return jsonify({
                "status": "error",
                "error": {"message": "Failed to update ticker status"},
                "version": "v1"
            }), 500
        
    except Exception as e:
        logger.error(f"Error updating ticker status auto {ticker_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "version": "v1"
        }), 500
    finally:
        db.close()

@tickers_bp.route('/update-all-statuses-auto', methods=['POST'])
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
            "version": "v1"
        })
        
    except Exception as e:
        logger.error(f"Error updating all ticker statuses auto: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "version": "v1"
        }), 500
    finally:
        db.close()

# Endpoint removed - status updates automatically now
