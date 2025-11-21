from flask import Blueprint, jsonify, request, g
from sqlalchemy.orm import Session
from config.database import get_db
from services.alert_service import AlertService
from services.advanced_cache_service import cache_for, invalidate_cache
from services.date_normalization_service import DateNormalizationService
from services.preferences_service import PreferencesService
from services.tag_service import TagService
import logging

# Import base classes
from .base_entity import BaseEntityAPI
from .base_entity_decorators import api_endpoint, handle_database_session, validate_request
from .base_entity_utils import BaseEntityUtils

logger = logging.getLogger(__name__)

alerts_bp = Blueprint('alerts', __name__, url_prefix='/api/alerts')

# Initialize base API
base_api = BaseEntityAPI('alerts', AlertService, 'alerts')
preferences_service = PreferencesService()


def _get_date_normalizer() -> DateNormalizationService:
    timezone_name = DateNormalizationService.resolve_timezone(
        request,
        preferences_service=preferences_service
    )
    return DateNormalizationService(timezone_name)

@alerts_bp.route('/', methods=['GET'])
@handle_database_session()
def get_alerts():
    """Get all alerts using base API"""
    db: Session = g.db
    response, status_code = base_api.get_all(db)
    return jsonify(response), status_code

 

@alerts_bp.route('/<int:alert_id>', methods=['GET'])
@api_endpoint(cache_ttl=60, rate_limit=60)
@handle_database_session()
def get_alert(alert_id: int):
    """Get alert by ID using base API"""
    db: Session = g.db
    response, status_code = base_api.get_by_id(db, alert_id)
    return jsonify(response), status_code

@alerts_bp.route('/', methods=['POST'])
@handle_database_session(auto_commit=True, auto_close=True)
@invalidate_cache(['alerts'])
def create_alert():
    """Create new alert"""
    try:
        data = request.get_json()
        logger.info(f"🔍 [create_alert] Received data: {data}")
        logger.info(f"🔍 [create_alert] condition_attribute in data: {'condition_attribute' in data}")
        logger.info(f"🔍 [create_alert] condition_attribute value: {data.get('condition_attribute')}")
        logger.info(f"🔍 [create_alert] condition_attribute type: {type(data.get('condition_attribute'))}")
        
        # Sanitize HTML content for message field
        if 'message' in data and data['message']:
            data['message'] = BaseEntityUtils.sanitize_rich_text(data['message'])
        
        logger.info(f"🔍 [create_alert] After sanitize - condition_attribute: {data.get('condition_attribute')}")
        
        db: Session = g.db
        alert = AlertService.create(db, data)
        normalizer = _get_date_normalizer()
        alert_payload = normalizer.normalize_output(alert.to_dict())
        return jsonify({
            "status": "success",
            "data": alert_payload,
            "message": "Alert created successfully",
            "timestamp": normalizer.now_envelope(),
            "version": "1.0"
        }), 201
    except Exception as e:
        logger.error(f"Error creating alert: {str(e)}")
        normalizer = _get_date_normalizer()
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "timestamp": normalizer.now_envelope(),
            "version": "1.0"
        }), 400

@alerts_bp.route('/<int:alert_id>', methods=['PUT'])
@handle_database_session(auto_commit=True, auto_close=True)
@invalidate_cache(['alerts'])
def update_alert(alert_id: int):
    """Update alert"""
    try:
        data = request.get_json()
        # Sanitize HTML content for message field
        if 'message' in data and data['message']:
            data['message'] = BaseEntityUtils.sanitize_rich_text(data['message'])
        db: Session = g.db
        alert = AlertService.update(db, alert_id, data)
        normalizer = _get_date_normalizer()
        alert_payload = normalizer.normalize_output(alert.to_dict())
        return jsonify({
            "status": "success",
            "data": alert_payload,
            "message": "Alert updated successfully",
            "timestamp": normalizer.now_envelope(),
            "version": "1.0"
        })
    except ValueError as e:
        logger.error(f"Alert not found {alert_id}: {str(e)}")
        normalizer = _get_date_normalizer()
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "timestamp": normalizer.now_envelope(),
            "version": "1.0"
        }), 404
    except Exception as e:
        logger.error(f"Error updating alert {alert_id}: {str(e)}")
        normalizer = _get_date_normalizer()
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "timestamp": normalizer.now_envelope(),
            "version": "1.0"
        }), 400

@alerts_bp.route('/<int:alert_id>', methods=['DELETE'])
@handle_database_session(auto_commit=True, auto_close=True)
@invalidate_cache(['alerts'])
def delete_alert(alert_id: int):
    """Delete alert"""
    try:
        db: Session = g.db
        try:
            TagService.remove_all_tags_for_entity(db, 'alert', alert_id)
        except ValueError as tag_error:
            logger.warning(
                "Failed to remove tags for alert %s before deletion: %s",
                alert_id,
                tag_error,
            )

        AlertService.delete(db, alert_id)
        normalizer = _get_date_normalizer()
        return jsonify({
            "status": "success",
            "message": "Alert deleted successfully",
            "timestamp": normalizer.now_envelope(),
            "version": "1.0"
        })
    except ValueError as e:
        logger.error(f"Alert not found {alert_id}: {str(e)}")
        normalizer = _get_date_normalizer()
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "timestamp": normalizer.now_envelope(),
            "version": "1.0"
        }), 404
    except Exception as e:
        logger.error(f"Error deleting alert {alert_id}: {str(e)}")
        logger.error(f"Error type: {type(e).__name__}")
        logger.error(f"Error details: {str(e)}")
        normalizer = _get_date_normalizer()
        return jsonify({
            "status": "error",
            "error": {"message": f"Failed to delete alert: {str(e)}"},
            "timestamp": normalizer.now_envelope(),
            "version": "1.0"
        }), 500

@alerts_bp.route('/<int:alert_id>/trigger', methods=['POST'])
def mark_as_triggered(alert_id: int):
    """Activate alert (change to new)"""
    try:
        db: Session = next(get_db())
        alert = AlertService.mark_as_triggered(db, alert_id)
        normalizer = _get_date_normalizer()
        return jsonify({
            "status": "success",
            "data": normalizer.normalize_output(alert.to_dict()),
            "message": "Alert triggered successfully",
            "timestamp": normalizer.now_envelope(),
            "version": "1.0"
        })
    except ValueError as e:
        logger.error(f"Alert not found {alert_id}: {str(e)}")
        normalizer = _get_date_normalizer()
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "timestamp": normalizer.now_envelope(),
            "version": "1.0"
        }), 404
    except Exception as e:
        logger.error(f"Error triggering alert {alert_id}: {str(e)}")
        normalizer = _get_date_normalizer()
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "timestamp": normalizer.now_envelope(),
            "version": "1.0"
        }), 400
    finally:
        db.close()

@alerts_bp.route('/unread', methods=['GET'])
def get_unread_alerts():
    """Get unread alerts (new)"""
    try:
        db: Session = next(get_db())
        alerts = AlertService.get_unread_alerts_with_symbols(db)
        normalizer = _get_date_normalizer()
        return jsonify({
            "status": "success",
            "data": normalizer.normalize_output(alerts),
            "message": "Unread alerts retrieved successfully",
            "timestamp": normalizer.now_envelope(),
            "version": "1.0"
        })
    except Exception as e:
        logger.error(f"Error getting unread alerts: {str(e)}")
        normalizer = _get_date_normalizer()
        return jsonify({
            "status": "error",
            "error": {"message": "Failed to retrieve unread alerts"},
            "timestamp": normalizer.now_envelope(),
            "version": "1.0"
        }), 500
    finally:
        db.close()



@alerts_bp.route('/<int:alert_id>/mark-read', methods=['PATCH'])
def mark_read(alert_id: int):
    """Mark alert as read (true)"""
    try:
        db: Session = next(get_db())
        alert = AlertService.mark_as_read(db, alert_id)
        normalizer = _get_date_normalizer()
        return jsonify({
            "status": "success",
            "data": normalizer.normalize_output(alert.to_dict()),
            "message": "Alert marked as read successfully",
            "timestamp": normalizer.now_envelope(),
            "version": "1.0"
        })
    except ValueError as e:
        logger.error(f"Alert not found {alert_id}: {str(e)}")
        normalizer = _get_date_normalizer()
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "timestamp": normalizer.now_envelope(),
            "version": "1.0"
        }), 404
    except Exception as e:
        logger.error(f"Error marking alert {alert_id} as read: {str(e)}")
        normalizer = _get_date_normalizer()
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "timestamp": normalizer.now_envelope(),
            "version": "1.0"
        }), 400
    finally:
        db.close()

@alerts_bp.route('/<int:alert_id>/reactivate', methods=['PATCH'])
def reactivate_alert(alert_id: int):
    """Return alert to active state"""
    try:
        db: Session = next(get_db())
        alert = AlertService.reactivate(db, alert_id)
        normalizer = _get_date_normalizer()
        return jsonify({
            "status": "success",
            "data": normalizer.normalize_output(alert.to_dict()),
            "message": "Alert reactivated successfully",
            "timestamp": normalizer.now_envelope(),
            "version": "1.0"
        })
    except ValueError as e:
        logger.error(f"Alert not found {alert_id}: {str(e)}")
        normalizer = _get_date_normalizer()
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "timestamp": normalizer.now_envelope(),
            "version": "1.0"
        }), 404
    except Exception as e:
        logger.error(f"Error reactivating alert {alert_id}: {str(e)}")
        normalizer = _get_date_normalizer()
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "timestamp": normalizer.now_envelope(),
            "version": "1.0"
        }), 400
    finally:
        db.close()

@alerts_bp.route('/<int:alert_id>/cancel', methods=['PATCH'])
def cancel_alert(alert_id: int):
    """Cancel alert"""
    try:
        db: Session = next(get_db())
        alert = AlertService.cancel(db, alert_id)
        normalizer = _get_date_normalizer()
        return jsonify({
            "status": "success",
            "data": normalizer.normalize_output(alert.to_dict()),
            "message": "Alert cancelled successfully",
            "timestamp": normalizer.now_envelope(),
            "version": "1.0"
        })
    except ValueError as e:
        logger.error(f"Alert not found {alert_id}: {str(e)}")
        normalizer = _get_date_normalizer()
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "timestamp": normalizer.now_envelope(),
            "version": "1.0"
        }), 404
    except Exception as e:
        logger.error(f"Error cancelling alert {alert_id}: {str(e)}")
        normalizer = _get_date_normalizer()
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "timestamp": normalizer.now_envelope(),
            "version": "1.0"
        }), 400
    finally:
        db.close()

# New endpoints for getting alerts by entity
@alerts_bp.route('/entity/<entity_type>/<int:entity_id>', methods=['GET'])
def get_alerts_by_entity(entity_type: str, entity_id: int):
    """Get alerts by entity type and ID"""
    try:
        db: Session = next(get_db())
        alerts = AlertService.get_alerts_by_entity(db, entity_type, entity_id)
        normalizer = _get_date_normalizer()
        return jsonify({
            "status": "success",
            "data": normalizer.normalize_output([alert.to_dict() for alert in alerts]),
            "message": f"Alerts for {entity_type} {entity_id} retrieved successfully",
            "timestamp": normalizer.now_envelope(),
            "version": "1.0"
        })
    except ValueError as e:
        logger.error(f"Entity not found {entity_type} {entity_id}: {str(e)}")
        normalizer = _get_date_normalizer()
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "timestamp": normalizer.now_envelope(),
            "version": "1.0"
        }), 404
    except Exception as e:
        logger.error(f"Error getting alerts for {entity_type} {entity_id}: {str(e)}")
        normalizer = _get_date_normalizer()
        return jsonify({
            "status": "error",
            "error": {"message": str(e)},
            "timestamp": normalizer.now_envelope(),
            "version": "1.0"
        }), 500
    finally:
        db.close()


