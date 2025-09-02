from flask import Blueprint, jsonify, request
from sqlalchemy.orm import Session
from config.database import get_db
from services.trade_plan_service import TradePlanService
from services.advanced_cache_service import cache_for, invalidate_cache
import logging

logger = logging.getLogger(__name__)

trade_plans_bp = Blueprint('trade_plans', __name__, url_prefix='/api/v1/trade_plans')

@trade_plans_bp.route('/', methods=['GET'])
@cache_for(ttl=60)  # Cache for 1 minute - trade plans don't change frequently
def get_trade_plans():
    """Get all trade plans"""
    try:
        db: Session = next(get_db())
        logger.info("Fetching all trade plans from database")
        plans = TradePlanService.get_all(db)
        logger.info(f"Retrieved {len(plans)} trade plans")
        
        # Convert to dictionaries
        plans_data = []
        for plan in plans:
            try:
                plan_dict = plan.to_dict()
                plans_data.append(plan_dict)
                logger.debug(f"Converted plan {plan.id} to dict: {plan_dict}")
            except Exception as e:
                logger.error(f"Error converting plan {plan.id} to dict: {str(e)}")
                # Try basic conversion
                basic_dict = {
                    'id': plan.id,
                    'ticker_id': plan.ticker_id,
                    'account_id': plan.account_id,
                    'investment_type': plan.investment_type,
                    'side': plan.side,
                    'status': plan.status,
                    'planned_amount': plan.planned_amount,
                    'target_price': plan.target_price,
                    'stop_loss': plan.stop_loss,
                    'created_at': plan.created_at.strftime('%Y-%m-%d %H:%M:%S') if plan.created_at else None
                }
                plans_data.append(basic_dict)
        
        return jsonify({
            "status": "success",
            "data": plans_data,
            "message": "Trade plans retrieved successfully",
            "version": "v1"
        })
    except Exception as e:
        logger.error(f"Error getting trade plans: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": "שגיאה בטעינת תכנונים"},
            "version": "v1"
        }), 500
    finally:
        db.close()

@trade_plans_bp.route('/<int:plan_id>', methods=['GET'])
def get_trade_plan(plan_id: int):
    """Get trade plan by ID"""
    try:
        db: Session = next(get_db())
        plan = TradePlanService.get_by_id(db, plan_id)
        if plan:
            return jsonify({
                "status": "success",
                "data": plan.to_dict(),
                "message": "Trade plan retrieved successfully",
                "version": "v1"
            })
        return jsonify({
            "status": "error",
            "error": {"message": "תכנון לא נמצא"},
            "version": "v1"
        }), 404
    except Exception as e:
        logger.error(f"Error getting trade plan {plan_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": "שגיאה בטעינת התכנון"},
            "version": "v1"
        }), 500
    finally:
        db.close()

@trade_plans_bp.route('/account/<int:account_id>', methods=['GET'])
def get_trade_plans_by_account(account_id: int):
    """Get trade plans by account"""
    try:
        db: Session = next(get_db())
        plans = TradePlanService.get_by_account(db, account_id)
        return jsonify({
            "status": "success",
            "data": [plan.to_dict() for plan in plans],
            "message": "Account trade plans retrieved successfully",
            "version": "v1"
        })
    except Exception as e:
        logger.error(f"Error getting trade plans for account {account_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": "שגיאה בטעינת תכנונים לחשבון"},
            "version": "v1"
        }), 500
    finally:
        db.close()

@trade_plans_bp.route('/', methods=['POST'])
def create_trade_plan():
    """Create new trade plan"""
    try:
        data = request.get_json()
        db: Session = next(get_db())
        plan = TradePlanService.create(db, data)
        return jsonify({
            "status": "success",
            "data": plan.to_dict(),
            "message": "Trade plan created successfully",
            "version": "v1"
        }), 201
    except Exception as e:
        logger.error(f"Error creating trade plan: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "version": "v1"
        }), 400
    finally:
        db.close()

@trade_plans_bp.route('/<int:plan_id>', methods=['PUT'])
def update_trade_plan(plan_id: int):
    """Update trade plan"""
    try:
        data = request.get_json()
        db: Session = next(get_db())
        plan = TradePlanService.update(db, plan_id, data)
        if plan:
            return jsonify({
                "status": "success",
                "data": plan.to_dict(),
                "message": "Trade plan updated successfully",
                "version": "v1"
            })
        return jsonify({
            "status": "error",
            "error": {"message": "תכנון לא נמצא"},
            "version": "v1"
        }), 404
    except Exception as e:
        logger.error(f"Error updating trade plan {plan_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "version": "v1"
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
                "version": "v1"
            })
        return jsonify({
            "status": "error",
            "error": {"message": "תכנון לא נמצא או שכבר מבוטל"},
            "version": "v1"
        }), 404
    except Exception as e:
        logger.error(f"Error cancelling trade plan {plan_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "version": "v1"
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
                "version": "v1"
            })
        return jsonify({
            "status": "error",
            "error": {"message": "תכנון לא נמצא או שכבר פעיל"},
            "version": "v1"
        }), 404
    except Exception as e:
        logger.error(f"Error activating trade plan {plan_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "version": "v1"
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
            "version": "v1"
        })
    except Exception as e:
        logger.error(f"Error getting trade plan summary: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": "שגיאה בטעינת סיכום תכנונים"},
            "version": "v1"
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
            "version": "v1"
        })
    except Exception as e:
        logger.error(f"Error checking if trade plan {plan_id} can be cancelled: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "version": "v1"
        }), 400
    finally:
        db.close()



@trade_plans_bp.route('/<int:plan_id>', methods=['DELETE'])
def delete_trade_plan(plan_id: int):
    """Delete trade plan"""
    try:
        db: Session = next(get_db())
        success = TradePlanService.delete(db, plan_id)
        if success:
            return jsonify({
                "status": "success",
                "message": "Trade plan deleted successfully",
                "version": "v1"
            })
        
        # If deletion failed, it means there are linked items or plan not found
        return jsonify({
            "status": "error",
            "error": {
                "message": "לא ניתן למחוק תכנון זה - יש פריטים מקושרים אליו"
            },
            "version": "v1"
        }), 400
    except Exception as e:
        logger.error(f"Error deleting trade plan {plan_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "version": "v1"
        }), 400
    finally:
        db.close()
