#!/usr/bin/env python3
"""
Test Send Email - TikTrack
בדיקת שליחת מייל

This script tests sending an actual email through the SMTP service.

Usage:
    python3 Backend/scripts/test_send_email.py <to_email>

Example:
    python3 Backend/scripts/test_send_email.py "nimrod@mezoo.co"
"""

import sys
import os
from pathlib import Path

# Add Backend to path
backend_path = Path(__file__).parent.parent
sys.path.insert(0, str(backend_path))

from sqlalchemy.orm import Session
from config.database import SessionLocal
from services.email_service import EmailService
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def test_send_email(to_email: str):
    """
    Test sending an email
    
    Args:
        to_email: Email address to send test email to
    """
    print("=" * 70)
    print("📧 בדיקת שליחת מייל")
    print("=" * 70)
    print()
    
    if not to_email or not to_email.strip():
        print("❌ שגיאה: כתובת אימייל לא יכולה להיות ריקה")
        return False
    
    to_email = to_email.strip()
    
    db: Session = SessionLocal()
    try:
        email_service = EmailService()
        
        # Load settings from database
        print("📥 טוען הגדרות ממסד הנתונים...")
        loaded = email_service.load_settings_from_db(db)
        
        if not loaded:
            print("❌ לא הצלחתי לטעון הגדרות ממסד הנתונים")
            return False
        
        print("✅ הגדרות נטענו:")
        print(f"   Host: {email_service.smtp_host}")
        print(f"   Port: {email_service.smtp_port}")
        print(f"   From Email: {email_service.from_email}")
        print(f"   From Name: {email_service.from_name}")
        print()
        
        # Test connection first
        print("🔌 בודק חיבור SMTP...")
        connection_result = email_service.test_connection(db_session=db)
        
        if not connection_result.get('success'):
            print(f"❌ חיבור SMTP נכשל: {connection_result.get('error', 'Unknown error')}")
            return False
        
        print("✅ חיבור SMTP תקין!")
        print()
        
        # Send test email
        print(f"📧 שולח מייל בדיקה ל-{to_email}...")
        
        subject = "מייל בדיקה מ-TikTrack"
        body_html = """
        <h2>מייל בדיקה מ-TikTrack</h2>
        <p>שלום,</p>
        <p>זהו מייל בדיקה מהמערכת TikTrack.</p>
        <p>אם קיבלת את המייל הזה, זה אומר שהגדרות SMTP עובדות כהלכה! ✅</p>
        <p>בברכה,<br>צוות TikTrack</p>
        """
        
        result = email_service.send_email(
            to_email=to_email,
            subject=subject,
            body_html=body_html,
            db_session=db,
            email_type='test',
            user_id=None
        )
        
        print()
        print("=" * 70)
        if result.get('success'):
            print("✅ מייל נשלח בהצלחה!")
            print("=" * 70)
            print()
            print(f"📬 בדוק את תיבת הדואר של {to_email}")
            print("   (גם בתיקיית הספאם אם לא מופיע בתיבה הראשית)")
            return True
        else:
            print(f"❌ שגיאה בשליחת מייל: {result.get('error', 'Unknown error')}")
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
        print("שימוש: python3 test_send_email.py <to_email>")
        print()
        print("דוגמאות:")
        print('  python3 test_send_email.py "nimrod@mezoo.co"')
        sys.exit(1)
    
    to_email = sys.argv[1]
    success = test_send_email(to_email)
    sys.exit(0 if success else 1)

