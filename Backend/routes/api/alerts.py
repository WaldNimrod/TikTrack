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
    """הפעלת התראה (שינוי ל-new)"""
    try:
        db: Session = next(get_db())
        alert = AlertService.mark_as_triggered(db, alert_id)
        return jsonify({
            "status": "success",
            "data": alert.to_dict(),
            "message": "Alert triggered successfully",
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
        logger.error(f"Error triggering alert {alert_id}: {str(e)}")
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
        alerts = AlertService.get_unread_alerts_with_symbols(db)
        return jsonify({
            "status": "success",
            "data": alerts,
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



@alerts_bp.route('/<int:alert_id>/mark-read', methods=['PATCH'])
def mark_read(alert_id: int):
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

@alerts_bp.route('/<int:alert_id>/reactivate', methods=['PATCH'])
def reactivate_alert(alert_id: int):
    """החזרת התראה למצב פעיל"""
    try:
        db: Session = next(get_db())
        alert = AlertService.reactivate(db, alert_id)
        return jsonify({
            "status": "success",
            "data": alert.to_dict(),
            "message": "Alert reactivated successfully",
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
        logger.error(f"Error reactivating alert {alert_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "version": "v1"
        }), 400
    finally:
        db.close()

@alerts_bp.route('/<int:alert_id>/cancel', methods=['PATCH'])
def cancel_alert(alert_id: int):
    """ביטול התראה"""
    try:
        db: Session = next(get_db())
        alert = AlertService.cancel(db, alert_id)
        return jsonify({
            "status": "success",
            "data": alert.to_dict(),
            "message": "Alert cancelled successfully",
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
        logger.error(f"Error cancelling alert {alert_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "version": "v1"
        }), 400
    finally:
        db.close()

# Endpoints חדשים לקבלת התראות לפי ישות
@alerts_bp.route('/entity/<entity_type>/<int:entity_id>', methods=['GET'])
def get_alerts_by_entity(entity_type: str, entity_id: int):
    """קבלת התראות לפי סוג ישות ומזהה"""
    try:
        db: Session = next(get_db())
        alerts = AlertService.get_alerts_by_entity(db, entity_type, entity_id)
        return jsonify({
            "status": "success",
            "data": [alert.to_dict() for alert in alerts],
            "message": f"Alerts for {entity_type} {entity_id} retrieved successfully",
            "version": "v1"
        })
    except ValueError as e:
        logger.error(f"Entity not found {entity_type} {entity_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "version": "v1"
        }), 404
    except Exception as e:
        logger.error(f"Error getting alerts for {entity_type} {entity_id}: {str(e)}")
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "version": "v1"
        }), 500
    finally:
        db.close()


