from flask import Blueprint, jsonify, request, g
from sqlalchemy.orm import Session
from config.database import get_db
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
    """Get all trade plans using base API"""
    db: Session = g.db
    response, status_code = base_api.get_all(db)
    return jsonify(response), status_code

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
def update_trade_plan(plan_id: int):
    """Update trade plan"""
    try:
        data = request.get_json()
        db: Session = next(get_db())
        
        # בדיקה אם המשתמש רוצה לסגור או לבטל את התכנית
        new_status = data.get('status')
        if new_status in ['closed', 'cancelled']:
            # החזרת שאלה למשתמש
            if new_status == 'closed':
                return jsonify({
                    "status": "question",
                    "question": "האם לבטל גם התראות תנאים?",
                    "question_type": "confirm_cancel_alerts",
                    "message": "התכנית תיסגר. האם לבטל גם התראות תנאים?",
                    "version": "1.0"
                })
            elif new_status == 'cancelled':
                return jsonify({
                    "status": "question",
                    "question": "האם למחוק גם התראות תנאים?",
                    "question_type": "confirm_delete_alerts",
                    "message": "התכנית תבוטל. האם למחוק גם התראות תנאים?",
                    "version": "1.0"
                })
        
        # עדכון רגיל של התכנית
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

@trade_plans_bp.route('/<int:plan_id>/confirm-status-change', methods=['POST'])
def confirm_status_change(plan_id: int):
    """Confirm status change with user response"""
    try:
        data = request.get_json()
        db: Session = next(get_db())
        
        new_status = data.get('status')
        user_response = data.get('user_response', False)
        
        # עדכון התכנית
        plan = TradePlanService.update(db, plan_id, {'status': new_status})
        
        if plan and user_response:
            # המשתמש בחר לבטל/למחוק התראות
            if new_status == 'closed':
                # ביטול התראות תנאים
                from services.alert_service import AlertService
                alert_service = AlertService(db)
                cancelled_count = alert_service.cancel_condition_alerts(plan_condition_id=plan_id)
                message = f"Trade plan closed and {cancelled_count} condition alerts cancelled"
            elif new_status == 'cancelled':
                # מחיקת התראות תנאים
                from services.alert_service import AlertService
                alert_service = AlertService(db)
                deleted_count = alert_service.delete_condition_alerts(plan_condition_id=plan_id)
                message = f"Trade plan cancelled and {deleted_count} condition alerts deleted"
        else:
            message = f"Trade plan {new_status} successfully"
        
        return jsonify({
            "status": "success",
            "data": plan.to_dict(),
            "message": message,
            "version": "1.0"
        })
        
    except Exception as e:
        logger.error(f"Error confirming status change for trade plan {plan_id}: {str(e)}")
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
