from flask import Blueprint, jsonify, request, g
from sqlalchemy.orm import Session
from config.database import get_db
from services.trade_plan_service import TradePlanService
from services.advanced_cache_service import cache_for, invalidate_cache
from services.preferences_service import PreferencesService
import logging

# Import base classes
from .base_entity import BaseEntityAPI
from .base_entity_decorators import api_endpoint, handle_database_session, validate_request, require_authentication
from .base_entity_utils import BaseEntityUtils

logger = logging.getLogger(__name__)

trade_plans_bp = Blueprint('trade_plans', __name__, url_prefix='/api/trade-plans')

# Initialize base API
base_api = BaseEntityAPI('trade_plans', TradePlanService, 'trade_plans')
preferences_service = PreferencesService()


def _get_date_normalizer():
    return BaseEntityUtils.get_request_normalizer(request, preferences_service=preferences_service)

@trade_plans_bp.route('/', methods=['GET'])
@require_authentication()
@api_endpoint(cache_ttl=60, rate_limit=60)
@handle_database_session()
def get_trade_plans():
    """Get all trade plans using base API"""
    print(f"DEBUG: get_trade_plans called, user_id={getattr(g, 'user_id', None)}")
    db: Session = g.db
    response, status_code = base_api.get_all(db)
    print(f"DEBUG: get_trade_plans returning {len(response.get('data', []))} items")
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
@handle_database_session()
def get_trade_plans_by_account(trading_account_id: int):
    """Get trade plans by account"""
    try:
        db: Session = g.db
        # Get user_id from Flask context (set by auth middleware)
        user_id = getattr(g, 'user_id', None)
        plans = TradePlanService.get_by_account(db, trading_account_id, user_id=user_id)
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

@trade_plans_bp.route('/', methods=['POST'])
@handle_database_session(auto_commit=True, auto_close=True)
@invalidate_cache(['trade_plans'])
def create_trade_plan():
    """Create new trade plan"""
    try:
        # Get user_id from Flask context (set by auth middleware)
        user_id = getattr(g, 'user_id', None)

        data = request.get_json() or {}

        # #region agent log
        import json
        with open('/Users/nimrod/Documents/TikTrack/TikTrackApp/.cursor/debug.log', 'a') as f:
            f.write(json.dumps({
                "location": "trade_plans.py:create_trade_plan",
                "message": "Backend create_trade_plan called",
                "data": {
                    "user_id": user_id,
                    "data_keys": list(data.keys()),
                    "data_types": {k: str(type(v)) for k, v in data.items()},
                    "entry_price": data.get('entry_price'),
                    "has_entry_price": 'entry_price' in data
                },
                "timestamp": __import__('time').time() * 1000,
                "sessionId": "debug-session",
                "runId": "server-crash-debug",
                "hypothesisId": "H1,H2,H3,H4,H5"
            }) + '\n')
        # #endregion

        print(f"DEBUG: create_trade_plan received data: {data}")
        print(f"DEBUG: entry_price in data: {'entry_price' in data}")
        print(f"DEBUG: entry_price value: {data.get('entry_price')}")
        print(f"DEBUG: entry_price type: {type(data.get('entry_price'))}")
        print(f"DEBUG: data keys: {list(data.keys())}")
        print(f"DEBUG: all data items: {[(k, v, type(v)) for k, v in data.items()]}")

        # Validate required field: entry_price
        entry_price = data.get('entry_price')
        if 'entry_price' not in data or entry_price is None or entry_price == '' or str(entry_price).strip() == '':
            print(f"DEBUG: entry_price validation failed - key exists: {'entry_price' in data}, value: {entry_price}, type: {type(entry_price)}")
            # For debugging, let's be more lenient and accept any non-empty entry_price
            if entry_price is not None and str(entry_price).strip() != '':
                print(f"DEBUG: entry_price would pass with more lenient check: {entry_price}")
                # Temporarily accept this to see if the rest of the logic works
                pass
            else:
                normalizer = _get_date_normalizer()
                return jsonify({
                    "status": "error",
                    "error": {"message": "entry_price is required"},
                    "timestamp": normalizer.now_envelope(),
                    "version": "1.0"
                }), 400
        else:
            print(f"DEBUG: entry_price validation passed - value: {entry_price}")

        # Keep the original validation but make it more lenient for debugging
        if 'entry_price' not in data or data['entry_price'] is None or data['entry_price'] == '' or str(data['entry_price']).strip() == '':
            normalizer = _get_date_normalizer()
            return jsonify({
                "status": "error",
                "error": {"message": "entry_price is required"},
                "timestamp": normalizer.now_envelope(),
                "version": "1.0"
            }), 400
        
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
                normalizer = _get_date_normalizer()
                return jsonify({
                    "status": "error",
                    "error": {"message": "Trading account not found or does not belong to user"},
                    "timestamp": normalizer.now_envelope(),
                    "version": "1.0"
                }), 404
        
        # Verify ticker belongs to user if provided
        if 'ticker_id' in data and user_id is not None:
            from models.user_ticker import UserTicker
            user_ticker = db.query(UserTicker).filter(
                UserTicker.user_id == user_id,
                UserTicker.ticker_id == data['ticker_id']
            ).first()
            if not user_ticker:
                normalizer = _get_date_normalizer()
                return jsonify({
                    "status": "error",
                    "error": {"message": "Ticker not found or does not belong to user"},
                    "timestamp": normalizer.now_envelope(),
                    "version": "1.0"
                }), 404
        
        normalizer = _get_date_normalizer()
        normalized_payload = BaseEntityUtils.normalize_input(normalizer, data)
        plan = TradePlanService.create(db, normalized_payload, user_id=user_id)
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
