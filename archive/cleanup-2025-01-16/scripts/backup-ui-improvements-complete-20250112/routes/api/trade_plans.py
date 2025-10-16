from flask import Blueprint, jsonify, request, g
from sqlalchemy.orm import Session, joinedload
from config.database import get_db
from models.trade_plan import TradePlan
from models.external_data import MarketDataQuote
from services.trade_plan_service import TradePlanService
from services.advanced_cache_service import cache_for, invalidate_cache
import logging

# Import base classes
from .base_entity import BaseEntityAPI
from .base_entity_decorators import api_endpoint, handle_database_session, validate_request
from .base_entity_utils import BaseEntityUtils

logger = logging.getLogger(__name__)

trade_plans_bp = Blueprint('trade_plans', __name__, url_prefix='/api/trade_plans')

# Initialize base API
base_api = BaseEntityAPI('trade_plans', TradePlanService, 'trade_plans')

@trade_plans_bp.route('/', methods=['GET'])
@api_endpoint(cache_ttl=60, rate_limit=60)
@handle_database_session()
def get_trade_plans():
    """Get all trade plans with ticker and account relationship data"""
    db: Session = g.db
    
    # Use joinedload to get ticker and account data
    plans = db.query(TradePlan).options(
        joinedload(TradePlan.ticker),
        joinedload(TradePlan.account)
    ).all()
    
    # Add market data to tickers (like TickerService.get_all does)
    for plan in plans:
        if hasattr(plan, 'ticker') and plan.ticker:
            latest_quote = db.query(MarketDataQuote).filter(
                MarketDataQuote.ticker_id == plan.ticker.id
            ).order_by(MarketDataQuote.fetched_at.desc()).first()
            
            if latest_quote:
                plan.ticker.current_price = latest_quote.price
                plan.ticker.change_percent = latest_quote.change_pct_day
                plan.ticker.change_amount = latest_quote.change_amount_day
                logger.debug(f"Added market data to ticker {plan.ticker.symbol}: price={latest_quote.price}")
    
    enhanced_data = []
    for plan in plans:
        plan_dict = plan.to_dict()
        
        # Add ticker details if not already in to_dict
        if hasattr(plan, 'ticker') and plan.ticker:
            if 'ticker_symbol' not in plan_dict:
                plan_dict['ticker_symbol'] = plan.ticker.symbol
            if 'ticker_name' not in plan_dict:
                plan_dict['ticker_name'] = plan.ticker.name
        
        # Add account details
        if hasattr(plan, 'account') and plan.account:
            plan_dict['account_name'] = plan.account.name
        
        enhanced_data.append(plan_dict)
    
    return jsonify({
        "status": "success",
        "data": enhanced_data,
        "message": f"Retrieved {len(enhanced_data)} trade plans",
        "version": "1.0"
    }), 200

@trade_plans_bp.route('/<int:plan_id>', methods=['GET'])
@api_endpoint(cache_ttl=60, rate_limit=60)
@handle_database_session()
def get_trade_plan(plan_id: int):
    """Get trade plan by ID using base API"""
    db: Session = g.db
    response, status_code = base_api.get_by_id(db, plan_id)
    return jsonify(response), status_code

@trade_plans_bp.route('/account/<int:account_id>', methods=['GET'])
def get_trade_plans_by_account(account_id: int):
    """Get trade plans by account"""
    try:
        db: Session = next(get_db())
        plans = TradePlanService.get_by_account(db, account_id)
        return jsonify({
            "status": "success",
            "data": [plan.to_dict() for plan in plans],
            "message": "TradingAccount trade plans retrieved successfully",
            "version": "1.0"
        })
    except Exception as e:
        logger.error(f"Error getting trade plans for account {account_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": "שגיאה בטעינת תכנונים לחשבון"},
            "version": "1.0"
        }), 500
    finally:
        db.close()

@trade_plans_bp.route('/', methods=['POST'])
@invalidate_cache(['trade_plans'])
def create_trade_plan():
    """Create new trade plan with metadata tracking"""
    try:
        data = request.get_json()
        db: Session = next(get_db())
        
        # Note: Percentages are converted to prices in frontend before sending
        # Metadata fields (amount_input_mode, stop_input_mode, target_input_mode) 
        # are passed through and saved as-is
        
        # Remove any percentage fields (not stored in DB)
        data.pop('stop_percentage', None)
        data.pop('target_percentage', None)
        
        # Create plan (with prices only)
        plan = TradePlanService.create(db, data)
        return jsonify({
            "status": "success",
            "data": plan.to_dict(),
            "message": "Trade plan created successfully",
            "version": "1.0"
        }), 201
    except Exception as e:
        logger.error(f"Error creating trade plan: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "version": "1.0"
        }), 400
    finally:
        db.close()

@trade_plans_bp.route('/<int:plan_id>', methods=['PUT'])
@invalidate_cache(['trade_plans'])
def update_trade_plan(plan_id: int):
    """Update trade plan with percentage/price conversion support"""
    try:
        data = request.get_json()
        db: Session = next(get_db())
        
        # Note: Percentages are converted to prices in frontend before sending
        # Metadata fields (amount_input_mode, stop_input_mode, target_input_mode) 
        # are passed through and saved as-is
        
        # Remove any percentage fields (not stored in DB)
        data.pop('stop_percentage', None)
        data.pop('target_percentage', None)
        
        # Update plan (with prices only)
        plan = TradePlanService.update(db, plan_id, data)
        if plan:
            return jsonify({
                "status": "success",
                "data": plan.to_dict(),
                "message": "Trade plan updated successfully",
                "version": "1.0"
            })
        return jsonify({
            "status": "error",
            "error": {"message": "תכנון לא נמצא"},
            "version": "1.0"
        }), 404
    except Exception as e:
        logger.error(f"Error updating trade plan {plan_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "version": "1.0"
        }), 400
    finally:
        db.close()

@trade_plans_bp.route('/<int:plan_id>/cancel', methods=['POST'])
def cancel_trade_plan(plan_id: int):
    """Cancel trade plan"""
    db = None
    try:
        data = request.get_json() if request.is_json else {}
        cancel_reason = data.get('cancel_reason', 'Cancelled by user')
        db: Session = next(get_db())
        plan = TradePlanService.cancel_plan(db, plan_id, cancel_reason)
        if plan:
            return jsonify({
                "status": "success",
                "data": plan.to_dict(),
                "message": "Trade plan cancelled successfully",
                "version": "1.0"
            })
        return jsonify({
            "status": "error",
            "error": {"message": "תכנון לא נמצא או שכבר מבוטל"},
            "version": "1.0"
        }), 404
    except Exception as e:
        logger.error(f"Error cancelling trade plan {plan_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "version": "1.0"
        }), 400
    finally:
        if db:
            db.close()

@trade_plans_bp.route('/<int:plan_id>/activate', methods=['POST'])
def activate_trade_plan(plan_id: int):
    """Activate trade plan"""
    try:
        db: Session = next(get_db())
        plan = TradePlanService.activate_plan(db, plan_id)
        if plan:
            return jsonify({
                "status": "success",
                "data": plan.to_dict(),
                "message": "Trade plan activated successfully",
                "version": "1.0"
            })
        return jsonify({
            "status": "error",
            "error": {"message": "תכנון לא נמצא או שכבר פעיל"},
            "version": "1.0"
        }), 404
    except Exception as e:
        logger.error(f"Error activating trade plan {plan_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "version": "1.0"
        }), 400
    finally:
        db.close()

@trade_plans_bp.route('/summary', methods=['GET'])
def get_trade_plan_summary():
    """Get trade plan summary"""
    try:
        account_id = request.args.get('account_id', type=int)
        db: Session = next(get_db())
        summary = TradePlanService.get_plan_summary(db, account_id)
        return jsonify({
            "status": "success",
            "data": summary,
            "message": "Trade plan summary retrieved successfully",
            "version": "1.0"
        })
    except Exception as e:
        logger.error(f"Error getting trade plan summary: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": "שגיאה בטעינת סיכום תכנונים"},
            "version": "1.0"
        }), 500
    finally:
        db.close()

@trade_plans_bp.route('/<int:plan_id>/can-cancel', methods=['GET'])
def can_cancel_trade_plan(plan_id: int):
    """Check if trade plan can be cancelled"""
    try:
        db: Session = next(get_db())
        cancel_check = TradePlanService.can_cancel_plan(db, plan_id)
        return jsonify({
            "status": "success",
            "data": cancel_check,
            "message": "Trade plan cancellation check completed",
            "version": "1.0"
        })
    except Exception as e:
        logger.error(f"Error checking if trade plan {plan_id} can be cancelled: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "version": "1.0"
        }), 400
    finally:
        db.close()



@trade_plans_bp.route('/<int:plan_id>', methods=['DELETE'])
@invalidate_cache(['trade_plans'])
def delete_trade_plan(plan_id: int):
    """Delete trade plan"""
    try:
        db: Session = next(get_db())
        success = TradePlanService.delete(db, plan_id)
        if success:
            return jsonify({
                "status": "success",
                "message": "Trade plan deleted successfully",
                "version": "1.0"
            })
        
        # If deletion failed, it means there are linked items or plan not found
        return jsonify({
            "status": "error",
            "error": {
                "message": "לא ניתן למחוק תכנון זה - יש פריטים מקושרים אליו"
            },
            "version": "1.0"
        }), 400
    except Exception as e:
        logger.error(f"Error deleting trade plan {plan_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "version": "1.0"
        }), 400
    finally:
        db.close()
