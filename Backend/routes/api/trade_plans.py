from flask import Blueprint, jsonify, request, g
from sqlalchemy.orm import Session
from config.database import get_db
from services.trade_plan_service import TradePlanService
from services.advanced_cache_service import cache_for, invalidate_cache
from services.preferences_service import PreferencesService
from services.tag_service import TagService
import logging

# Import base classes
from .base_entity import BaseEntityAPI
from .base_entity_decorators import api_endpoint, handle_database_session, validate_request
from .base_entity_utils import BaseEntityUtils

logger = logging.getLogger(__name__)

trade_plans_bp = Blueprint('trade_plans', __name__, url_prefix='/api/trade-plans')

# Initialize base API
base_api = BaseEntityAPI('trade_plans', TradePlanService, 'trade_plans')
preferences_service = PreferencesService()


def _get_date_normalizer():
    return BaseEntityUtils.get_request_normalizer(request, preferences_service=preferences_service)

@trade_plans_bp.route('/', methods=['GET'])
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

@trade_plans_bp.route('/account/<int:trading_account_id>', methods=['GET'])
def get_trade_plans_by_account(trading_account_id: int):
    """Get trade plans by account"""
    try:
        db: Session = next(get_db())
        plans = TradePlanService.get_by_account(db, trading_account_id)
        normalizer = _get_date_normalizer()
        payload = BaseEntityUtils.create_success_payload(
            normalizer,
            [plan.to_dict() for plan in plans],
            "TradingAccount trade plans retrieved successfully"
        )
        return jsonify(payload)
    except Exception as e:
        logger.error(f"Error getting trade plans for account {trading_account_id}: {str(e)}")
        normalizer = _get_date_normalizer()
        payload = BaseEntityUtils.create_error_payload(
            normalizer,
            "שגיאה בטעינת תכנונים לחשבון"
        )
        return jsonify(payload), 500
    finally:
        db.close()

@trade_plans_bp.route('/', methods=['POST'])
@handle_database_session(auto_commit=True, auto_close=True)
@invalidate_cache(['trade_plans'])
def create_trade_plan():
    """Create new trade plan"""
    try:
        data = request.get_json() or {}
        # Sanitize HTML content for notes field
        if 'notes' in data and data['notes']:
            data['notes'] = BaseEntityUtils.sanitize_rich_text(data['notes'])
        db: Session = g.db
        normalizer = _get_date_normalizer()
        normalized_payload = BaseEntityUtils.normalize_input(normalizer, data)
        plan = TradePlanService.create(db, normalized_payload)
        payload = BaseEntityUtils.create_success_payload(
            normalizer,
            plan.to_dict(),
            "Trade plan created successfully"
        )
        return jsonify(payload), 201
    except Exception as e:
        logger.error(f"Error creating trade plan: {str(e)}")
        normalizer = _get_date_normalizer()
        payload = BaseEntityUtils.create_error_payload(
            normalizer,
            str(e)
        )
        return jsonify(payload), 400

@trade_plans_bp.route('/<int:plan_id>', methods=['PUT'])
@handle_database_session(auto_commit=True, auto_close=True)
@invalidate_cache(['trade_plans'])
def update_trade_plan(plan_id: int):
    """Update trade plan"""
    try:
        data = request.get_json() or {}
        db: Session = g.db
        normalizer = _get_date_normalizer()
        
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
                    "timestamp": BaseEntityUtils.envelope_timestamp(normalizer),
                    "version": "1.0"
                })
            elif new_status == 'cancelled':
                return jsonify({
                    "status": "question",
                    "question": "האם למחוק גם התראות תנאים?",
                    "question_type": "confirm_delete_alerts",
                    "message": "התכנית תבוטל. האם למחוק גם התראות תנאים?",
                    "timestamp": BaseEntityUtils.envelope_timestamp(normalizer),
                    "version": "1.0"
                })
        
        # Sanitize HTML content for notes field
        if 'notes' in data and data['notes']:
            data['notes'] = BaseEntityUtils.sanitize_rich_text(data['notes'])
        
        # עדכון רגיל של התכנית
        normalized_payload = BaseEntityUtils.normalize_input(normalizer, data)
        plan = TradePlanService.update(db, plan_id, normalized_payload)
        if plan:
            payload = BaseEntityUtils.create_success_payload(
                normalizer,
                plan.to_dict(),
                "Trade plan updated successfully"
            )
            return jsonify(payload)
        payload = BaseEntityUtils.create_error_payload(
            normalizer,
            "תכנון לא נמצא"
        )
        return jsonify(payload), 404
    except Exception as e:
        logger.error(f"Error updating trade plan {plan_id}: {str(e)}")
        normalizer = _get_date_normalizer()
        payload = BaseEntityUtils.create_error_payload(
            normalizer,
            str(e)
        )
        return jsonify(payload), 400

@trade_plans_bp.route('/<int:plan_id>/confirm-status-change', methods=['POST'])
def confirm_status_change(plan_id: int):
    """Confirm status change with user response"""
    try:
        data = request.get_json() or {}
        db: Session = next(get_db())
        normalizer = _get_date_normalizer()
        
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
        
        payload = BaseEntityUtils.create_success_payload(
            normalizer,
            plan.to_dict(),
            message
        )
        return jsonify(payload)
        
    except Exception as e:
        logger.error(f"Error confirming status change for trade plan {plan_id}: {str(e)}")
        normalizer = _get_date_normalizer()
        payload = BaseEntityUtils.create_error_payload(
            normalizer,
            str(e)
        )
        return jsonify(payload), 400
    finally:
        db.close()

@trade_plans_bp.route('/<int:plan_id>/cancel', methods=['POST'])
@invalidate_cache(['trade_plans'])
def cancel_trade_plan(plan_id: int):
    """Cancel trade plan"""
    db = None
    try:
        data = request.get_json() if request.is_json else {}
        cancel_reason = data.get('cancel_reason', 'Cancelled by user')
        db: Session = next(get_db())
        plan = TradePlanService.cancel_plan(db, plan_id, cancel_reason)
        if plan:
            normalizer = _get_date_normalizer()
            payload = BaseEntityUtils.create_success_payload(
                normalizer,
                plan.to_dict(),
                "Trade plan cancelled successfully"
            )
            return jsonify(payload)
        normalizer = _get_date_normalizer()
        payload = BaseEntityUtils.create_error_payload(
            normalizer,
            "תכנון לא נמצא או שכבר מבוטל"
        )
        return jsonify(payload), 404
    except Exception as e:
        logger.error(f"Error cancelling trade plan {plan_id}: {str(e)}")
        normalizer = _get_date_normalizer()
        payload = BaseEntityUtils.create_error_payload(
            normalizer,
            str(e)
        )
        return jsonify(payload), 400
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
            normalizer = _get_date_normalizer()
            payload = BaseEntityUtils.create_success_payload(
                normalizer,
                plan.to_dict(),
                "Trade plan activated successfully"
            )
            return jsonify(payload)
        normalizer = _get_date_normalizer()
        payload = BaseEntityUtils.create_error_payload(
            normalizer,
            "תכנון לא נמצא או שכבר פעיל"
        )
        return jsonify(payload), 404
    except Exception as e:
        logger.error(f"Error activating trade plan {plan_id}: {str(e)}")
        normalizer = _get_date_normalizer()
        payload = BaseEntityUtils.create_error_payload(
            normalizer,
            str(e)
        )
        return jsonify(payload), 400
    finally:
        db.close()

@trade_plans_bp.route('/summary', methods=['GET'])
def get_trade_plan_summary():
    """Get trade plan summary"""
    try:
        trading_account_id = request.args.get('trading_account_id', type=int)
        db: Session = next(get_db())
        summary = TradePlanService.get_plan_summary(db, trading_account_id)
        normalizer = _get_date_normalizer()
        payload = BaseEntityUtils.create_success_payload(
            normalizer,
            summary,
            "Trade plan summary retrieved successfully"
        )
        return jsonify(payload)
    except Exception as e:
        logger.error(f"Error getting trade plan summary: {str(e)}")
        normalizer = _get_date_normalizer()
        payload = BaseEntityUtils.create_error_payload(
            normalizer,
            "שגיאה בטעינת סיכום תכנונים"
        )
        return jsonify(payload), 500
    finally:
        db.close()

@trade_plans_bp.route('/<int:plan_id>/can-cancel', methods=['GET'])
def can_cancel_trade_plan(plan_id: int):
    """Check if trade plan can be cancelled"""
    try:
        db: Session = next(get_db())
        cancel_check = TradePlanService.can_cancel_plan(db, plan_id)
        normalizer = _get_date_normalizer()
        payload = BaseEntityUtils.create_success_payload(
            normalizer,
            cancel_check,
            "Trade plan cancellation check completed"
        )
        return jsonify(payload)
    except Exception as e:
        logger.error(f"Error checking if trade plan {plan_id} can be cancelled: {str(e)}")
        normalizer = _get_date_normalizer()
        payload = BaseEntityUtils.create_error_payload(
            normalizer,
            str(e)
        )
        return jsonify(payload), 400
    finally:
        db.close()



@trade_plans_bp.route('/<int:plan_id>', methods=['DELETE'])
@handle_database_session(auto_commit=True, auto_close=True)
@invalidate_cache(['trade_plans'])
def delete_trade_plan(plan_id: int):
    """Delete trade plan"""
    try:
        db: Session = g.db

        try:
            TagService.remove_all_tags_for_entity(db, 'trade_plan', plan_id)
        except ValueError as tag_error:
            logger.warning(
                "Failed to remove tags for trade_plan %s before deletion: %s",
                plan_id,
                tag_error,
            )

        success = TradePlanService.delete(db, plan_id)
        if success:
            normalizer = _get_date_normalizer()
            payload = BaseEntityUtils.create_success_payload(
                normalizer,
                None,
                "Trade plan deleted successfully"
            )
            return jsonify(payload)
        
        # If deletion failed, it means there are linked items or plan not found
        normalizer = _get_date_normalizer()
        payload = BaseEntityUtils.create_error_payload(
            normalizer,
            "לא ניתן למחוק תכנון זה - יש פריטים מקושרים אליו"
        )
        return jsonify(payload), 400
    except Exception as e:
        logger.error(f"Error deleting trade plan {plan_id}: {str(e)}")
        normalizer = _get_date_normalizer()
        payload = BaseEntityUtils.create_error_payload(
            normalizer,
            str(e)
        )
        return jsonify(payload), 400
