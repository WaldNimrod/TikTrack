from flask import Blueprint, jsonify, request
from sqlalchemy.orm import Session
from config.database import get_db
from models.alert import Alert
import logging

logger = logging.getLogger(__name__)

alerts_bp = Blueprint('alerts', __name__, url_prefix='/api/v1/alerts')

@alerts_bp.route('/', methods=['GET'])
def get_alerts():
    """קבלת כל ההתראות"""
    try:
        db: Session = next(get_db())
        alerts = db.query(Alert).all()
        return jsonify({
            "status": "success",
            "data": [alert.to_dict() for alert in alerts],
            "message": "Alerts retrieved successfully",
            "version": "v1"
        })
    except Exception as e:
        logger.error(f"Error getting alerts: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": "Failed to retrieve alerts"},
            "version": "v1"
        }), 500
    finally:
        db.close()

@alerts_bp.route('/<int:alert_id>', methods=['GET'])
def get_alert(alert_id: int):
    """קבלת התראה לפי מזהה"""
    try:
        db: Session = next(get_db())
        alert = db.query(Alert).filter(Alert.id == alert_id).first()
        if alert:
            return jsonify({
                "status": "success",
                "data": alert.to_dict(),
                "message": "Alert retrieved successfully",
                "version": "v1"
            })
        return jsonify({
            "status": "error",
            "error": {"message": "Alert not found"},
            "version": "v1"
        }), 404
    except Exception as e:
        logger.error(f"Error getting alert {alert_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": "Failed to retrieve alert"},
            "version": "v1"
        }), 500
    finally:
        db.close()

@alerts_bp.route('/', methods=['POST'])
def create_alert():
    """יצירת התראה חדשה"""
    try:
        data = request.get_json()
        db: Session = next(get_db())
        alert = Alert(**data)
        db.add(alert)
        db.commit()
        db.refresh(alert)
        return jsonify({
            "status": "success",
            "data": alert.to_dict(),
            "message": "Alert created successfully",
            "version": "v1"
        }), 201
    except Exception as e:
        logger.error(f"Error creating alert: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "version": "v1"
        }), 400
    finally:
        db.close()

@alerts_bp.route('/<int:alert_id>', methods=['PUT'])
def update_alert(alert_id: int):
    """עדכון התראה"""
    try:
        data = request.get_json()
        db: Session = next(get_db())
        alert = db.query(Alert).filter(Alert.id == alert_id).first()
        if alert:
            for key, value in data.items():
                if hasattr(alert, key):
                    setattr(alert, key, value)
            db.commit()
            db.refresh(alert)
            return jsonify({
                "status": "success",
                "data": alert.to_dict(),
                "message": "Alert updated successfully",
                "version": "v1"
            })
        return jsonify({
            "status": "error",
            "error": {"message": "Alert not found"},
            "version": "v1"
        }), 404
    except Exception as e:
        logger.error(f"Error updating alert {alert_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "version": "v1"
        }), 400
    finally:
        db.close()

@alerts_bp.route('/<int:alert_id>', methods=['DELETE'])
def delete_alert(alert_id: int):
    """מחיקת התראה"""
    try:
        db: Session = next(get_db())
        alert = db.query(Alert).filter(Alert.id == alert_id).first()
        if alert:
            db.delete(alert)
            db.commit()
            return jsonify({
                "status": "success",
                "message": "Alert deleted successfully",
                "version": "v1"
            })
        return jsonify({
            "status": "error",
            "error": {"message": "Alert not found"},
            "version": "v1"
        }), 404
    except Exception as e:
        logger.error(f"Error deleting alert {alert_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "version": "v1"
        }), 500
    finally:
        db.close()
