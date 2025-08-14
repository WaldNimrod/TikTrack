from flask import Blueprint, jsonify, request
from sqlalchemy.orm import Session
from config.database import get_db
from models.cash_flow import CashFlow
from utils.auth import require_auth
import logging

logger = logging.getLogger(__name__)

cash_flows_bp = Blueprint('cash_flows', __name__, url_prefix='/api/v1/cash_flows')

@cash_flows_bp.route('/', methods=['GET'])
@require_auth
def get_cash_flows():
    """קבלת כל תזרימי המזומנים"""
    try:
        db: Session = next(get_db())
        cash_flows = db.query(CashFlow).all()
        return jsonify({
            "status": "success",
            "data": [cf.to_dict() for cf in cash_flows],
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
@require_auth
def get_cash_flow(cash_flow_id: int):
    """קבלת תזרים מזומנים לפי מזהה"""
    try:
        db: Session = next(get_db())
        cash_flow = db.query(CashFlow).filter(CashFlow.id == cash_flow_id).first()
        if cash_flow:
            return jsonify({
                "status": "success",
                "data": cash_flow.to_dict(),
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
@require_auth
def create_cash_flow():
    """יצירת תזרים מזומנים חדש"""
    try:
        data = request.get_json()
        db: Session = next(get_db())
        cash_flow = CashFlow(**data)
        db.add(cash_flow)
        db.commit()
        db.refresh(cash_flow)
        return jsonify({
            "status": "success",
            "data": cash_flow.to_dict(),
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
@require_auth
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
            return jsonify({
                "status": "success",
                "data": cash_flow.to_dict(),
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
            "error": {"message": str(e)},
            "version": "v1"
        }), 400
    finally:
        db.close()

@cash_flows_bp.route('/<int:cash_flow_id>', methods=['DELETE'])
@require_auth
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
            "error": {"message": str(e)},
            "version": "v1"
        }), 500
    finally:
        db.close()
