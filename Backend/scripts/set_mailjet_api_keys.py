#!/usr/bin/env python3
"""
Set Mailjet API Keys - TikTrack
הגדרת מפתחות API של Mailjet

This script sets the Mailjet API keys in the SMTP settings.

Usage:
    python3 Backend/scripts/set_mailjet_api_keys.py <api_key> <secret_key> [from_email]

Examples:
    python3 Backend/scripts/set_mailjet_api_keys.py "c1a3ffeae18f2b8a6ef523f9c78a3ee3" "d4b38137c8046e61e2e61c462585a749"
    python3 Backend/scripts/set_mailjet_api_keys.py "c1a3ffeae18f2b8a6ef523f9c78a3ee3" "d4b38137c8046e61e2e61c462585a749" "nimrod@mezoo.co"
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
from services.system_settings_service import SystemSettingsService
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def set_mailjet_api_keys(api_key: str, secret_key: str, from_email: str = None):
    """
    Set Mailjet API keys in SMTP settings
    
    Args:
        api_key: Mailjet API Key (used as username)
        secret_key: Mailjet Secret Key (used as password)
        from_email: From email address (optional)
    """
    print("=" * 70)
    print("🔑 הגדרת מפתחות API של Mailjet")
    print("=" * 70)
    print()
    
    if not api_key or not api_key.strip():
        print("❌ שגיאה: API Key לא יכול להיות ריק")
        return False
    
    if not secret_key or not secret_key.strip():
        print("❌ שגיאה: Secret Key לא יכול להיות ריק")
        return False
    
    api_key = api_key.strip()
    secret_key = secret_key.strip()
    
    db: Session = SessionLocal()
    try:
        smtp_service = SMTPSettingsService()
        settings_service = SystemSettingsService(db)
        
        # Encrypt the secret key (password)
        encrypted_secret = smtp_service.encrypt_password(secret_key)
        
        # Prepare settings for Mailjet
        settings = {
            'smtp_host': 'in-v3.mailjet.com',  # Mailjet SMTP host
            'smtp_port': 587,
            'smtp_user': api_key,  # Mailjet uses API Key as username
            'smtp_password': encrypted_secret,  # Mailjet uses Secret Key as password (encrypted)
            'smtp_use_tls': True,
            'smtp_enabled': True,
            'smtp_from_name': 'TikTrack'
        }
        
        # Add from_email if provided
        if from_email:
            settings['smtp_from_email'] = from_email.strip()
        
        print("📝 מעדכן הגדרות SMTP ל-Mailjet:")
        print(f"   Host: {settings['smtp_host']}")
        print(f"   Port: {settings['smtp_port']}")
        print(f"   User (API Key): {settings['smtp_user']}")
        print(f"   Password (Secret Key): {'*' * min(len(secret_key), 20)}... (מוצפן)")
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
            updated_by='system_script_mailjet'
        )
        
        if result['success']:
            db.commit()
            print("=" * 70)
            print("✅ הגדרות SMTP עודכנו בהצלחה ל-Mailjet!")
            print("=" * 70)
            print()
            print("📋 מה הלאה:")
            print("1. ודא שכתובת האימייל מאומתת ב-Mailjet")
            print("   (Sender & Domains → Sender Addresses)")
            print("2. פתח TikTrack: http://localhost:8080/user_profile.html")
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
    if len(sys.argv) < 3:
        print("שימוש: python3 set_mailjet_api_keys.py <api_key> <secret_key> [from_email]")
        print()
        print("דוגמאות:")
        print('  python3 set_mailjet_api_keys.py "c1a3ffeae18f2b8a6ef523f9c78a3ee3" "d4b38137c8046e61e2e61c462585a749"')
        print('  python3 set_mailjet_api_keys.py "c1a3ffeae18f2b8a6ef523f9c78a3ee3" "d4b38137c8046e61e2e61c462585a749" "nimrod@mezoo.co"')
        sys.exit(1)
    
    api_key = sys.argv[1]
    secret_key = sys.argv[2]
    from_email = sys.argv[3] if len(sys.argv) > 3 else None
    
    success = set_mailjet_api_keys(api_key, secret_key, from_email)
    sys.exit(0 if success else 1)

