#!/usr/bin/env python3
"""
Set SendGrid API Key - TikTrack
הגדרת API Key של SendGrid

This script sets the SendGrid API key in the SMTP settings.

Usage:
    python3 Backend/scripts/set_sendgrid_api_key.py <api_key> [from_email]

Examples:
    python3 Backend/scripts/set_sendgrid_api_key.py "SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
    python3 Backend/scripts/set_sendgrid_api_key.py "SG.xxxxx" "nimrod@mezoo.co"
"""

import sys
import os
from pathlib import Path

# Add Backend to path
backend_path = Path(__file__).parent.parent
sys.path.insert(0, str(backend_path))

from sqlalchemy.orm import Session
from config.database import SessionLocal
from services.smtp_settings_service import SMTPSettingsService
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def set_sendgrid_api_key(api_key: str, from_email: str = None):
    """
    Set SendGrid API key in SMTP settings
    
    Args:
        api_key: SendGrid API key
        from_email: From email address (optional)
    """
    print("=" * 70)
    print("🔑 הגדרת API Key של SendGrid")
    print("=" * 70)
    print()
    
    if not api_key or not api_key.strip():
        print("❌ שגיאה: API Key לא יכול להיות ריק")
        return False
    
    api_key = api_key.strip()
    
    db: Session = SessionLocal()
    try:
        smtp_service = SMTPSettingsService()
        
        # Prepare settings
        settings = {
            'smtp_host': 'smtp.sendgrid.net',
            'smtp_port': 587,
            'smtp_user': 'apikey',  # This is the literal word "apikey"
            'smtp_password': api_key,  # This will be encrypted automatically
            'smtp_use_tls': True,
            'smtp_enabled': True,
            'smtp_from_name': 'TikTrack'
        }
        
        # Add from_email if provided
        if from_email:
            settings['smtp_from_email'] = from_email.strip()
        
        print("📝 מעדכן הגדרות SMTP:")
        print(f"   Host: {settings['smtp_host']}")
        print(f"   Port: {settings['smtp_port']}")
        print(f"   User: {settings['smtp_user']}")
        print(f"   Password: {'*' * min(len(api_key), 20)}... (מוצפן)")
        if from_email:
            print(f"   From Email: {settings['smtp_from_email']}")
        print(f"   From Name: {settings['smtp_from_name']}")
        print(f"   Use TLS: {settings['smtp_use_tls']}")
        print(f"   Enabled: {settings['smtp_enabled']}")
        print()
        
        # Update settings
        result = smtp_service.update_smtp_settings(
            db_session=db,
            settings=settings,
            updated_by='system_script'
        )
        
        if result['success']:
            print("=" * 70)
            print("✅ הגדרות SMTP עודכנו בהצלחה!")
            print("=" * 70)
            print()
            print("📋 מה הלאה:")
            print("1. ודא שכתובת האימייל אומתה ב-SendGrid")
            print("   (Settings → Sender Authentication → Verify a Single Sender)")
            print("2. פתח TikTrack: http://localhost:8080/user-profile.html")
            print("3. גלול לסקשן 'הגדרות SMTP'")
            print("4. לחץ 'בדיקת חיבור' לוודא שהכל עובד")
            print("5. לחץ 'שליחת מייל בדיקה' לבדיקה")
            print()
            return True
        else:
            print("=" * 70)
            print(f"❌ שגיאה בעדכון הגדרות: {result.get('error', 'Unknown error')}")
            print("=" * 70)
            return False
        
    except Exception as e:
        logger.error(f"❌ שגיאה: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        db.close()


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("שימוש: python3 set_sendgrid_api_key.py <api_key> [from_email]")
        print()
        print("דוגמאות:")
        print('  python3 set_sendgrid_api_key.py "SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"')
        print('  python3 set_sendgrid_api_key.py "SG.xxxxx" "nimrod@mezoo.co"')
        sys.exit(1)
    
    api_key = sys.argv[1]
    from_email = sys.argv[2] if len(sys.argv) > 2 else None
    
    success = set_sendgrid_api_key(api_key, from_email)
    sys.exit(0 if success else 1)

