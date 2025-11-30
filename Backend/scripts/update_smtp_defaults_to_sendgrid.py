#!/usr/bin/env python3
"""
Update SMTP Defaults to SendGrid - TikTrack
עדכון ברירות מחדל SMTP ל-SendGrid

This script updates the default SMTP settings to use SendGrid instead of Gmail.

Author: TikTrack Development Team
Version: 1.0.0
Last Updated: January 28, 2025
"""

import sys
import os
from pathlib import Path

# Add Backend to path
backend_path = Path(__file__).parent.parent
sys.path.insert(0, str(backend_path))

from sqlalchemy.orm import Session
from config.database import SessionLocal
from services.system_settings_service import SystemSettingsService
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def update_smtp_defaults_to_sendgrid():
    """
    Update SMTP default settings to SendGrid
    """
    print("=" * 70)
    print("🔄 עדכון ברירות מחדל SMTP ל-SendGrid")
    print("=" * 70)
    print()
    
    db: Session = SessionLocal()
    try:
        settings_service = SystemSettingsService(db)
        
        # Update default values for SendGrid
        updates = {
            'smtp_host': 'smtp.sendgrid.net',
            'smtp_port': 587,
            'smtp_user': 'apikey',  # This is the literal word "apikey"
            'smtp_from_name': 'TikTrack',
            'smtp_use_tls': True,
            'smtp_enabled': True
        }
        
        print("📝 מעדכן ברירות מחדל:")
        for key, value in updates.items():
            print(f"   {key}: {value}")
            success = settings_service.set_setting(key, value, updated_by='system_script')
            if success:
                print(f"   ✅ {key} עודכן")
            else:
                print(f"   ⚠️  {key} לא עודכן (אולי לא קיים)")
        
        print()
        print("=" * 70)
        print("✅ ברירות מחדל עודכנו ל-SendGrid")
        print("=" * 70)
        print()
        print("📋 מה הלאה:")
        print("1. היכנס ל-SendGrid → Settings → Sender Authentication")
        print("2. אמת כתובת אימייל (לדוגמה: nimrod@mezoo.co)")
        print("3. צור API Key ב-SendGrid → Settings → API Keys")
        print("4. עדכן ב-TikTrack דרך הממשק:")
        print("   - Host: smtp.sendgrid.net (כבר עודכן)")
        print("   - Port: 587 (כבר עודכן)")
        print("   - User: apikey (כבר עודכן)")
        print("   - Password: ה-API Key שלך מ-SendGrid")
        print("   - From Email: הכתובת שאימתת ב-SendGrid")
        print()
        
        return True
        
    except Exception as e:
        logger.error(f"❌ שגיאה בעדכון ברירות מחדל: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        db.close()


if __name__ == '__main__':
    success = update_smtp_defaults_to_sendgrid()
    sys.exit(0 if success else 1)

