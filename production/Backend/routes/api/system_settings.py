"""
System Settings API - Administrative
Provides GET/POST for system-level settings (non-user) with cache invalidation.
"""

from flask import Blueprint, jsonify, request
from sqlalchemy.orm import Session
from config.database import get_db
from services.system_settings_service import SystemSettingsService
from services.smtp_settings_service import SMTPSettingsService
from services.email_service import EmailService
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


@system_settings_bp.route('/smtp', methods=['GET'])
def get_smtp_settings():
    """Get SMTP settings"""
    db: Session = next(get_db())
    try:
        smtp_service = SMTPSettingsService()
        settings = smtp_service.get_smtp_settings(db)
        
        # Don't return password in response (security)
        if 'smtp_password' in settings:
            settings['smtp_password'] = '***' if settings['smtp_password'] else ''
        
        return jsonify({
            'success': True,
            'data': settings
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
    finally:
        db.close()


@system_settings_bp.route('/smtp', methods=['POST'])
@invalidate_cache(['system_settings'])
def update_smtp_settings():
    """Update SMTP settings"""
    db: Session = next(get_db())
    try:
        payload = request.get_json() or {}
        smtp_service = SMTPSettingsService()
        
        # Get current user from session (if available)
        updated_by = request.headers.get('X-User-Id') or 'system_api'
        
        result = smtp_service.update_smtp_settings(
            db_session=db,
            settings=payload,
            updated_by=updated_by
        )
        
        if result['success']:
            return jsonify({
                'success': True,
                'message': result.get('message', 'SMTP settings updated successfully')
            })
        else:
            return jsonify({
                'success': False,
                'error': result.get('error', 'Failed to update SMTP settings')
            }), 400
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
    finally:
        db.close()


@system_settings_bp.route('/smtp/test', methods=['POST'])
def test_smtp_connection():
    """Test SMTP connection"""
    db: Session = next(get_db())
    try:
        email_service = EmailService()
        email_service.load_settings_from_db(db)
        
        result = email_service.test_connection(db_session=db)
        
        return jsonify(result)
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
    finally:
        db.close()


@system_settings_bp.route('/smtp/test-email', methods=['POST'])
def send_test_email():
    """Send a test email"""
    db: Session = next(get_db())
    try:
        payload = request.get_json() or {}
        test_email = payload.get('email')
        
        if not test_email:
            return jsonify({
                'success': False,
                'error': 'Email address is required'
            }), 400
        
        email_service = EmailService()
        email_service.load_settings_from_db(db)
        
        # Send test email
        result = email_service.send_email(
            to_email=test_email,
            subject='TikTrack - Test Email',
            body_html='<h2>זהו מייל בדיקה מ-TikTrack</h2><p>אם קיבלת את המייל הזה, הגדרות SMTP פועלות כהלכה.</p>',
            body_text='זהו מייל בדיקה מ-TikTrack. אם קיבלת את המייל הזה, הגדרות SMTP פועלות כהלכה.',
            email_type='test',
            db_session=db
        )
        
        return jsonify(result)
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
    finally:
        db.close()


