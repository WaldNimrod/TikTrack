from flask import Blueprint, jsonify, request, g
from sqlalchemy.orm import Session
from config.database import get_db
from services.alert_service import AlertService
from services.advanced_cache_service import cache_for, invalidate_cache
from services.date_normalization_service import DateNormalizationService
from services.preferences_service import PreferencesService
from services.tag_service import TagService
from datetime import datetime
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
        # Get user_id from Flask context (set by auth middleware)
        user_id = getattr(g, 'user_id', None)
        
        # Get raw request data for debugging
        raw_data = request.get_data(as_text=True)
        logger.info(f"🔍 [create_alert] Raw request data: {raw_data[:500]}")
        
        data = request.get_json()
        logger.info(f"🔍 [create_alert] Received data: {data}")
        
        # Set user_id if authenticated
        if user_id is not None and 'user_id' not in data:
            data['user_id'] = user_id
        logger.info(f"🔍 [create_alert] condition_attribute in data: {'condition_attribute' in data if data else False}")
        logger.info(f"🔍 [create_alert] condition_attribute value: {data.get('condition_attribute') if data else 'N/A'}")
        logger.info(f"🔍 [create_alert] condition_attribute type: {type(data.get('condition_attribute')) if data else 'N/A'}")
        logger.info(f"🔍 [create_alert] All keys in data: {list(data.keys()) if data else 'No data'}")
        
        # Check if condition_attribute is explicitly None or missing
        if data and 'condition_attribute' in data:
            if data['condition_attribute'] is None:
                logger.warning(f"⚠️ [create_alert] condition_attribute is explicitly None in request!")
            elif data['condition_attribute'] == '':
                logger.warning(f"⚠️ [create_alert] condition_attribute is empty string in request!")
            else:
                logger.info(f"✅ [create_alert] condition_attribute has value: {data['condition_attribute']}")
        else:
            logger.warning(f"⚠️ [create_alert] condition_attribute not in data!")
        
        # Sanitize HTML content for message field
        if 'message' in data and data['message']:
            data['message'] = BaseEntityUtils.sanitize_rich_text(data['message'])
        
        logger.info(f"🔍 [create_alert] After sanitize - condition_attribute: {data.get('condition_attribute')}")
        
        # Convert expiry_date to date object (accepts YYYY-MM-DD, ISO datetime, DateEnvelope, or datetime)
        # Following the same pattern as cash_flows.py
        if 'expiry_date' in data and data['expiry_date']:
            try:
                expiry_input = data['expiry_date']
                date_obj = None
                normalizer = _get_date_normalizer()
                
                if isinstance(expiry_input, dict):
                    # DateEnvelope format - normalize it
                    normalized = normalizer.normalize_input_payload({"expiry_date": expiry_input})
                    dt = normalized.get("expiry_date") if isinstance(normalized, dict) else None
                    if isinstance(dt, datetime):
                        date_obj = dt.date()
                elif isinstance(expiry_input, datetime):
                    # Already a datetime object (from normalize_input_payload)
                    date_obj = expiry_input.date()
                elif isinstance(expiry_input, str):
                    # String format - try parsing
                    try:
                        date_obj = datetime.strptime(expiry_input, '%Y-%m-%d').date()
                    except ValueError:
                        try:
                            date_obj = datetime.fromisoformat(expiry_input.replace('Z', '+00:00')).date()
                        except ValueError:
                            date_obj = None
                
                if date_obj:
                    data['expiry_date'] = date_obj
                    logger.info(f"✅ [create_alert] Converted expiry_date to date object: {date_obj}")
                else:
                    # If conversion failed, set to None (optional field)
                    logger.warning(f"⚠️ [create_alert] Could not convert expiry_date, setting to None")
                    data['expiry_date'] = None
            except Exception as e:
                logger.warning(f"⚠️ [create_alert] Error converting expiry_date: {e}, setting to None")
                data['expiry_date'] = None
        elif 'expiry_date' in data and not data['expiry_date']:
            # Empty string or None - set to None
            data['expiry_date'] = None
        
        db: Session = g.db
        alert = AlertService.create(db, data, user_id=user_id)
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
        # Get user_id from Flask context (set by auth middleware)
        user_id = getattr(g, 'user_id', None)
        
        data = request.get_json()
        # Sanitize HTML content for message field
        if 'message' in data and data['message']:
            data['message'] = BaseEntityUtils.sanitize_rich_text(data['message'])
        
        # Convert expiry_date to date object (same as create_alert)
        if 'expiry_date' in data and data['expiry_date']:
            try:
                expiry_input = data['expiry_date']
                date_obj = None
                normalizer = _get_date_normalizer()
                
                if isinstance(expiry_input, dict):
                    # DateEnvelope format - normalize it
                    normalized = normalizer.normalize_input_payload({"expiry_date": expiry_input})
                    dt = normalized.get("expiry_date") if isinstance(normalized, dict) else None
                    if isinstance(dt, datetime):
                        date_obj = dt.date()
                elif isinstance(expiry_input, datetime):
                    # Already a datetime object (from normalize_input_payload)
                    date_obj = expiry_input.date()
                elif isinstance(expiry_input, str):
                    # String format - try parsing
                    try:
                        date_obj = datetime.strptime(expiry_input, '%Y-%m-%d').date()
                    except ValueError:
                        try:
                            date_obj = datetime.fromisoformat(expiry_input.replace('Z', '+00:00')).date()
                        except ValueError:
                            date_obj = None
                
                if date_obj:
                    data['expiry_date'] = date_obj
                    logger.info(f"✅ [update_alert] Converted expiry_date to date object: {date_obj}")
                else:
                    # If conversion failed, set to None (optional field)
                    logger.warning(f"⚠️ [update_alert] Could not convert expiry_date, setting to None")
                    data['expiry_date'] = None
            except Exception as e:
                logger.warning(f"⚠️ [update_alert] Error converting expiry_date: {e}, setting to None")
                data['expiry_date'] = None
        elif 'expiry_date' in data and not data['expiry_date']:
            # Empty string or None - set to None
            data['expiry_date'] = None
        
        db: Session = g.db
        
        # Verify alert belongs to user before updating
        if user_id is not None:
            existing_alert = AlertService.get_by_id(db, alert_id, user_id=user_id)
            if not existing_alert:
                normalizer = _get_date_normalizer()
                return jsonify({
                    "status": "error",
                    "error": {"message": "Alert not found or does not belong to user"},
                    "timestamp": normalizer.now_envelope(),
                    "version": "1.0"
                }), 404
        
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
        # Get user_id from Flask context (set by auth middleware)
        user_id = getattr(g, 'user_id', None)
        
        db: Session = g.db
        
        # Verify alert belongs to user before deleting
        if user_id is not None:
            existing_alert = AlertService.get_by_id(db, alert_id, user_id=user_id)
            if not existing_alert:
                normalizer = _get_date_normalizer()
                return jsonify({
                    "status": "error",
                    "error": {"message": "Alert not found or does not belong to user"},
                    "timestamp": normalizer.now_envelope(),
                    "version": "1.0"
                }), 404
        
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
        # Get user_id from Flask context (set by auth middleware)
        from flask import g
        user_id = getattr(g, 'user_id', None)
        
        db: Session = next(get_db())
        
        # Verify alert belongs to user
        if user_id is not None:
            existing_alert = AlertService.get_by_id(db, alert_id, user_id=user_id)
            if not existing_alert:
                normalizer = _get_date_normalizer()
                return jsonify({
                    "status": "error",
                    "error": {"message": "Alert not found or does not belong to user"},
                    "timestamp": normalizer.now_envelope(),
                    "version": "1.0"
                }), 404
        
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
    """Get unread alerts (new) - filtered by user_id if available"""
    try:
        db: Session = next(get_db())
        # Get user_id from Flask context (set by auth middleware)
        user_id = getattr(g, 'user_id', None)
        alerts = AlertService.get_unread_alerts_with_symbols(db, user_id=user_id)
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
        # Get user_id from Flask context (set by auth middleware)
        from flask import g
        user_id = getattr(g, 'user_id', None)
        
        db: Session = next(get_db())
        
        # Verify alert belongs to user
        if user_id is not None:
            existing_alert = AlertService.get_by_id(db, alert_id, user_id=user_id)
            if not existing_alert:
                normalizer = _get_date_normalizer()
                return jsonify({
                    "status": "error",
                    "error": {"message": "Alert not found or does not belong to user"},
                    "timestamp": normalizer.now_envelope(),
                    "version": "1.0"
                }), 404
        
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
        # Get user_id from Flask context (set by auth middleware)
        from flask import g
        user_id = getattr(g, 'user_id', None)
        
        db: Session = next(get_db())
        
        # Verify alert belongs to user
        if user_id is not None:
            existing_alert = AlertService.get_by_id(db, alert_id, user_id=user_id)
            if not existing_alert:
                normalizer = _get_date_normalizer()
                return jsonify({
                    "status": "error",
                    "error": {"message": "Alert not found or does not belong to user"},
                    "timestamp": normalizer.now_envelope(),
                    "version": "1.0"
                }), 404
        
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
        # Get user_id from Flask context (set by auth middleware)
        from flask import g
        user_id = getattr(g, 'user_id', None)
        
        db: Session = next(get_db())
        
        # Verify alert belongs to user
        if user_id is not None:
            existing_alert = AlertService.get_by_id(db, alert_id, user_id=user_id)
            if not existing_alert:
                normalizer = _get_date_normalizer()
                return jsonify({
                    "status": "error",
                    "error": {"message": "Alert not found or does not belong to user"},
                    "timestamp": normalizer.now_envelope(),
                    "version": "1.0"
                }), 404
        
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
@handle_database_session()
def get_alerts_by_entity(entity_type: str, entity_id: int):
    """Get alerts by entity type and ID (filtered by user_id)"""
    try:
        # Get user_id from Flask context (set by auth middleware)
        user_id = getattr(g, 'user_id', None)
        
        if user_id is None:
            normalizer = _get_date_normalizer()
            return jsonify({
                "status": "error",
                "error": {"message": "User authentication required"},
                "timestamp": normalizer.now_envelope(),
                "version": "1.0"
            }), 401
        
        db: Session = g.db
        # Pass user_id to service for proper filtering
        alerts = AlertService.get_alerts_by_entity(db, entity_type, entity_id, user_id=user_id)
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


