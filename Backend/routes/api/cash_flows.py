from flask import Blueprint, jsonify, request
from sqlalchemy.orm import Session, joinedload
from config.database import get_db
from models.cash_flow import CashFlow
import logging

logger = logging.getLogger(__name__)

cash_flows_bp = Blueprint('cash_flows', __name__, url_prefix='/api/v1/cash_flows')

@cash_flows_bp.route('/', methods=['GET'])
def get_cash_flows():
    """קבלת כל תזרימי המזומנים"""
    try:
        db: Session = next(get_db())
        cash_flows = db.query(CashFlow).options(
            joinedload(CashFlow.account),
            joinedload(CashFlow.currency)
        ).all()
        
        # המרה למילון עם מידע נוסף
        cash_flows_data = []
        for cf in cash_flows:
            cf_dict = cf.to_dict()
            if cf.account:
                cf_dict['account_name'] = cf.account.name
            if cf.currency:
                cf_dict['currency_symbol'] = cf.currency.symbol
                cf_dict['currency_name'] = cf.currency.name
            cash_flows_data.append(cf_dict)
        
        return jsonify({
            "status": "success",
            "data": cash_flows_data,
            "message": "Cash flows retrieved successfully",
            "version": "v1"
        })
    except Exception as e:
        logger.error(f"Error getting cash flows: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": "Failed to retrieve cash flows"},
            "version": "v1"
        }), 500
    finally:
        db.close()

@cash_flows_bp.route('/<int:cash_flow_id>', methods=['GET'])
def get_cash_flow(cash_flow_id: int):
    """קבלת תזרים מזומנים לפי מזהה"""
    try:
        db: Session = next(get_db())
        cash_flow = db.query(CashFlow).options(
            joinedload(CashFlow.account),
            joinedload(CashFlow.currency)
        ).filter(CashFlow.id == cash_flow_id).first()
        
        if cash_flow:
            cf_dict = cash_flow.to_dict()
            if cash_flow.account:
                cf_dict['account_name'] = cash_flow.account.name
            if cash_flow.currency:
                cf_dict['currency_symbol'] = cash_flow.currency.symbol
                cf_dict['currency_name'] = cash_flow.currency.name
            
            return jsonify({
                "status": "success",
                "data": cf_dict,
                "message": "Cash flow retrieved successfully",
                "version": "v1"
            })
        return jsonify({
            "status": "error",
            "error": {"message": "Cash flow not found"},
            "version": "v1"
        }), 404
    except Exception as e:
        logger.error(f"Error getting cash flow {cash_flow_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": "Failed to retrieve cash flow"},
            "version": "v1"
        }), 500
    finally:
        db.close()

@cash_flows_bp.route('/', methods=['POST'])
def create_cash_flow():
    """יצירת תזרים מזומנים חדש"""
    try:
        data = request.get_json()
        db: Session = next(get_db())
        
        # הגדרת ערכי ברירת מחדל
        if 'currency_id' not in data:
            data['currency_id'] = 1  # USD
        if 'usd_rate' not in data:
            data['usd_rate'] = 1.000000
        if 'source' not in data:
            data['source'] = 'manual'
        if 'external_id' not in data:
            data['external_id'] = '0'
        
        cash_flow = CashFlow(**data)
        db.add(cash_flow)
        db.commit()
        db.refresh(cash_flow)
        
        # החזרת הנתונים עם מידע נוסף
        cf_dict = cash_flow.to_dict()
        if cash_flow.account:
            cf_dict['account_name'] = cash_flow.account.name
        if cash_flow.currency:
            cf_dict['currency_symbol'] = cash_flow.currency.symbol
            cf_dict['currency_name'] = cash_flow.currency.name
        
        return jsonify({
            "status": "success",
            "data": cf_dict,
            "message": "Cash flow created successfully",
            "version": "v1"
        }), 201
    except Exception as e:
        logger.error(f"Error creating cash flow: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "version": "v1"
        }), 400
    finally:
        db.close()

@cash_flows_bp.route('/<int:cash_flow_id>', methods=['PUT'])
def update_cash_flow(cash_flow_id: int):
    """עדכון תזרים מזומנים"""
    try:
        data = request.get_json()
        db: Session = next(get_db())
        cash_flow = db.query(CashFlow).filter(CashFlow.id == cash_flow_id).first()
        
        if cash_flow:
            for key, value in data.items():
                if hasattr(cash_flow, key):
                    setattr(cash_flow, key, value)
            
            db.commit()
            db.refresh(cash_flow)
            
            # החזרת הנתונים עם מידע נוסף
            cf_dict = cash_flow.to_dict()
            if cash_flow.account:
                cf_dict['account_name'] = cash_flow.account.name
            if cash_flow.currency:
                cf_dict['currency_symbol'] = cash_flow.currency.symbol
                cf_dict['currency_name'] = cash_flow.currency.name
            
            return jsonify({
                "status": "success",
                "data": cf_dict,
                "message": "Cash flow updated successfully",
                "version": "v1"
            })
        return jsonify({
            "status": "error",
            "error": {"message": "Cash flow not found"},
            "version": "v1"
        }), 404
    except Exception as e:
        logger.error(f"Error updating cash flow {cash_flow_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": "Failed to update cash flow"},
            "version": "v1"
        }), 500
    finally:
        db.close()

@cash_flows_bp.route('/<int:cash_flow_id>', methods=['DELETE'])
def delete_cash_flow(cash_flow_id: int):
    """מחיקת תזרים מזומנים"""
    try:
        db: Session = next(get_db())
        cash_flow = db.query(CashFlow).filter(CashFlow.id == cash_flow_id).first()
        
        if cash_flow:
            db.delete(cash_flow)
            db.commit()
            return jsonify({
                "status": "success",
                "message": "Cash flow deleted successfully",
                "version": "v1"
            })
        return jsonify({
            "status": "error",
            "error": {"message": "Cash flow not found"},
            "version": "v1"
        }), 404
    except Exception as e:
        logger.error(f"Error deleting cash flow {cash_flow_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": "Failed to delete cash flow"},
            "version": "v1"
        }), 500
    finally:
        db.close()
