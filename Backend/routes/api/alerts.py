from flask import Blueprint, jsonify, request
from sqlalchemy.orm import Session
from config.database import get_db
from services.alert_service import AlertService
import logging

logger = logging.getLogger(__name__)

alerts_bp = Blueprint('alerts', __name__, url_prefix='/api/v1/alerts')

@alerts_bp.route('/', methods=['GET'])
def get_alerts():
    """קבלת כל ההתראות"""
    try:
        db: Session = next(get_db())
        alerts = AlertService.get_all(db)
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
        alert = AlertService.get_by_id(db, alert_id)
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
        alert = AlertService.create(db, data)
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
        alert = AlertService.update(db, alert_id, data)
        return jsonify({
            "status": "success",
            "data": alert.to_dict(),
            "message": "Alert updated successfully",
            "version": "v1"
        })
    except ValueError as e:
        logger.error(f"Alert not found {alert_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
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
        AlertService.delete(db, alert_id)
        return jsonify({
            "status": "success",
            "message": "Alert deleted successfully",
            "version": "v1"
        })
    except ValueError as e:
        logger.error(f"Alert not found {alert_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
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

@alerts_bp.route('/<int:alert_id>/trigger', methods=['POST'])
def mark_as_triggered(alert_id: int):
    """סימון התראה כמופעלת (new)"""
    try:
        db: Session = next(get_db())
        alert = AlertService.mark_as_triggered(db, alert_id)
        return jsonify({
            "status": "success",
            "data": alert.to_dict(),
            "message": "Alert marked as triggered successfully",
            "version": "v1"
        })
    except ValueError as e:
        logger.error(f"Alert not found {alert_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "version": "v1"
        }), 404
    except Exception as e:
        logger.error(f"Error marking alert {alert_id} as triggered: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "version": "v1"
        }), 400
    finally:
        db.close()

@alerts_bp.route('/<int:alert_id>/read', methods=['POST'])
def mark_as_read(alert_id: int):
    """סימון התראה כנקראה (true)"""
    try:
        db: Session = next(get_db())
        alert = AlertService.mark_as_read(db, alert_id)
        return jsonify({
            "status": "success",
            "data": alert.to_dict(),
            "message": "Alert marked as read successfully",
            "version": "v1"
        })
    except ValueError as e:
        logger.error(f"Alert not found {alert_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "version": "v1"
        }), 404
    except Exception as e:
        logger.error(f"Error marking alert {alert_id} as read: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "version": "v1"
        }), 400
    finally:
        db.close()

@alerts_bp.route('/unread', methods=['GET'])
def get_unread_alerts():
    """קבלת התראות שלא נקראו (new)"""
    try:
        db: Session = next(get_db())
        alerts = AlertService.get_unread_alerts(db)
        return jsonify({
            "status": "success",
            "data": [alert.to_dict() for alert in alerts],
            "message": "Unread alerts retrieved successfully",
            "version": "v1"
        })
    except Exception as e:
        logger.error(f"Error getting unread alerts: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": "Failed to retrieve unread alerts"},
            "version": "v1"
        }), 500
    finally:
        db.close()

@alerts_bp.route('/active', methods=['GET'])
def get_active_alerts():
    """קבלת התראות פעילות (is_triggered = false)"""
    try:
        db: Session = next(get_db())
        alerts = AlertService.get_active_alerts(db)
        return jsonify({
            "status": "success",
            "data": [alert.to_dict() for alert in alerts],
            "message": "Active alerts retrieved successfully",
            "version": "v1"
        })
    except Exception as e:
        logger.error(f"Error getting active alerts: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": "Failed to retrieve active alerts"},
            "version": "v1"
        }), 500
    finally:
        db.close()
