from flask import Blueprint, jsonify, request
from sqlalchemy.orm import Session
from config.database import get_db
from services.trade_plan_service import TradePlanService
import logging

logger = logging.getLogger(__name__)

trade_plans_bp = Blueprint('trade_plans', __name__, url_prefix='/api/v1/trade_plans')

@trade_plans_bp.route('/', methods=['GET'])
def get_trade_plans():
    """קבלת כל תוכניות הטרייד"""
    try:
        db: Session = next(get_db())
        logger.info("Fetching all trade plans from database")
        plans = TradePlanService.get_all(db)
        logger.info(f"Retrieved {len(plans)} trade plans")
        
        # המרה למילונים
        plans_data = []
        for plan in plans:
            try:
                plan_dict = plan.to_dict()
                plans_data.append(plan_dict)
                logger.debug(f"Converted plan {plan.id} to dict: {plan_dict}")
            except Exception as e:
                logger.error(f"Error converting plan {plan.id} to dict: {str(e)}")
                # ננסה המרה בסיסית
                basic_dict = {
                    'id': plan.id,
                    'ticker_id': plan.ticker_id,
                    'account_id': plan.account_id,
                    'investment_type': plan.investment_type,
                    'side': plan.side,
                    'status': plan.status,
                    'planned_amount': plan.planned_amount,
                    'target_price': plan.target_price,
                    'stop_price': plan.stop_price,
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
            "error": {"message": "Failed to retrieve trade plans"},
            "version": "v1"
        }), 500
    finally:
        db.close()

@trade_plans_bp.route('/<int:plan_id>', methods=['GET'])
def get_trade_plan(plan_id: int):
    """קבלת תוכנית טרייד לפי מזהה"""
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
            "error": {"message": "Trade plan not found"},
            "version": "v1"
        }), 404
    except Exception as e:
        logger.error(f"Error getting trade plan {plan_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": "Failed to retrieve trade plan"},
            "version": "v1"
        }), 500
    finally:
        db.close()

@trade_plans_bp.route('/account/<int:account_id>', methods=['GET'])
def get_trade_plans_by_account(account_id: int):
    """קבלת תוכניות טרייד לפי חשבון"""
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
            "error": {"message": "Failed to retrieve account trade plans"},
            "version": "v1"
        }), 500
    finally:
        db.close()

@trade_plans_bp.route('/', methods=['POST'])
def create_trade_plan():
    """יצירת תוכנית טרייד חדשה"""
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
    """עדכון תוכנית טרייד"""
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
            "error": {"message": "Trade plan not found"},
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
    """ביטול תוכנית טרייד"""
    try:
        data = request.get_json()
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
            "error": {"message": "Trade plan not found or already cancelled"},
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
        db.close()

@trade_plans_bp.route('/<int:plan_id>/activate', methods=['POST'])
def activate_trade_plan(plan_id: int):
    """הפעלת תוכנית טרייד"""
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
            "error": {"message": "Trade plan not found or already open"},
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
    """קבלת סיכום תוכניות טרייד"""
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
            "error": {"message": "Failed to retrieve trade plan summary"},
            "version": "v1"
        }), 500
    finally:
        db.close()
