"""
System Settings API - Administrative
Provides GET/POST for system-level settings (non-user) with cache invalidation.
"""

from flask import Blueprint, jsonify, request
from sqlalchemy.orm import Session
from config.database import get_db
from services.system_settings_service import SystemSettingsService
from services.advanced_cache_service import invalidate_cache

system_settings_bp = Blueprint('system_settings', __name__, url_prefix='/api/system-settings')


@system_settings_bp.route('/external-data', methods=['GET'])
def get_external_data_settings():
    db: Session = next(get_db())
    try:
        svc = SystemSettingsService(db)
        data = svc.get_group_settings('external_data_settings')
        return jsonify({
            'success': True,
            'data': data
        })
    finally:
        db.close()


@system_settings_bp.route('/external-data', methods=['POST'])
@invalidate_cache(['external_data', 'tickers'])
def update_external_data_settings():
    db: Session = next(get_db())
    try:
        payload = request.get_json() or {}
        svc = SystemSettingsService(db)

        allowed_keys = {
            'ttlActiveSeconds', 'ttlOpenSeconds', 'ttlClosedSeconds', 'ttlCancelledSeconds',
            'ttlActiveOffHoursSeconds', 'ttlOpenOffHoursSeconds',
            'externalDataSchedulerEnabled', 'externalDataMaxBatchSize'
        }

        updated = {}
        for key, value in payload.items():
            if key in allowed_keys:
                ok = svc.set_setting(key, value, updated_by='system_api')
                updated[key] = ok

        return jsonify({
            'success': True,
            'updated': updated
        })
    finally:
        db.close()


