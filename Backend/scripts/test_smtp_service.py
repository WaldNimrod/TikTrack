#!/usr/bin/env python3
"""
SMTP Service Test Script
סקריפט בדיקה לשירות SMTP

This script tests the SMTP service by:
1. Loading SMTP settings from database
2. Testing SMTP connection
3. Sending a test email
4. Checking email logs

Author: TikTrack Development Team
Version: 1.0.0
Last Updated: January 28, 2025
"""

import sys
import os
from pathlib import Path
from datetime import datetime

# Add Backend to path
backend_path = Path(__file__).parent.parent
sys.path.insert(0, str(backend_path))

from sqlalchemy.orm import Session
from config.database import SessionLocal
from services.email_service import EmailService
from services.smtp_settings_service import SMTPSettingsService
from models.email_log import EmailLog
from sqlalchemy import select, desc
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def print_section(title: str):
    """Print a formatted section header"""
    print("\n" + "=" * 70)
    print(f"  {title}")
    print("=" * 70 + "\n")


def test_load_settings(db: Session):
    """Test loading SMTP settings from database"""
    print_section("1. Testing SMTP Settings Loading")
    
    try:
        smtp_service = SMTPSettingsService()
        settings = smtp_service.get_smtp_settings(db)
        
        if not settings:
            print("❌ No SMTP settings found in database")
            print("   Run migration script: Backend/scripts/migrations/add_smtp_settings.py")
            return False
        
        print("✅ SMTP settings loaded from database:")
        print(f"   Host: {settings.get('smtp_host', 'N/A')}")
        print(f"   Port: {settings.get('smtp_port', 'N/A')}")
        print(f"   User: {settings.get('smtp_user', 'N/A')}")
        print(f"   From Email: {settings.get('smtp_from_email', 'N/A')}")
        print(f"   From Name: {settings.get('smtp_from_name', 'N/A')}")
        print(f"   Use TLS: {settings.get('smtp_use_tls', 'N/A')}")
        print(f"   Enabled: {settings.get('smtp_enabled', 'N/A')}")
        print(f"   Password: {'***' if settings.get('smtp_password') else 'Not set'}")
        
        return True
    except Exception as e:
        print(f"❌ Error loading SMTP settings: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_email_service_loading(db: Session):
    """Test EmailService loading settings from database"""
    print_section("2. Testing EmailService Settings Loading")
    
    try:
        email_service = EmailService()
        success = email_service.load_settings_from_db(db)
        
        if not success:
            print("⚠️  Could not load settings from database, using environment variables")
            print("   Settings from environment:")
            print(f"   Host: {email_service.smtp_host}")
            print(f"   Port: {email_service.smtp_port}")
            print(f"   User: {email_service.smtp_user}")
            print(f"   From Email: {email_service.from_email}")
            print(f"   Enabled: {email_service.smtp_enabled}")
        else:
            print("✅ EmailService loaded settings from database successfully")
            print(f"   Host: {email_service.smtp_host}")
            print(f"   Port: {email_service.smtp_port}")
            print(f"   User: {email_service.smtp_user}")
            print(f"   From Email: {email_service.from_email}")
            print(f"   Enabled: {email_service.smtp_enabled}")
        
        return email_service
    except Exception as e:
        print(f"❌ Error loading EmailService settings: {e}")
        import traceback
        traceback.print_exc()
        return None


def test_connection(email_service: EmailService, db: Session):
    """Test SMTP connection"""
    print_section("3. Testing SMTP Connection")
    
    try:
        if not email_service.smtp_enabled:
            print("⚠️  SMTP service is disabled")
            return False
        
        result = email_service.test_connection(db_session=db)
        
        if result.get('success'):
            print("✅ SMTP connection test successful!")
            print(f"   Message: {result.get('message', 'N/A')}")
            return True
        else:
            print("❌ SMTP connection test failed!")
            print(f"   Error: {result.get('error', 'Unknown error')}")
            return False
    except Exception as e:
        print(f"❌ Error testing SMTP connection: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_send_email(email_service: EmailService, db: Session, test_email: str = None):
    """Test sending an email"""
    print_section("4. Testing Email Sending")
    
    if not test_email:
        test_email = input("Enter test email address (or press Enter to skip): ").strip()
        if not test_email:
            print("⚠️  Skipping email send test")
            return False
    
    try:
        if not email_service.smtp_enabled:
            print("⚠️  SMTP service is disabled, email will be logged only")
        
        print(f"📧 Sending test email to: {test_email}")
        
        result = email_service.send_email(
            to_email=test_email,
            subject='TikTrack - Test Email',
            body_html='''
            <h2>זהו מייל בדיקה מ-TikTrack</h2>
            <p>אם קיבלת את המייל הזה, הגדרות SMTP פועלות כהלכה.</p>
            <p>תאריך: {}</p>
            '''.format(datetime.now().strftime('%Y-%m-%d %H:%M:%S')),
            body_text='זהו מייל בדיקה מ-TikTrack. אם קיבלת את המייל הזה, הגדרות SMTP פועלות כהלכה.',
            email_type='test',
            db_session=db
        )
        
        if result.get('success'):
            print("✅ Test email sent successfully!")
            print(f"   Message: {result.get('message', 'N/A')}")
            print(f"   Email ID: {result.get('email_id', 'N/A')}")
            return True
        else:
            print("❌ Failed to send test email!")
            print(f"   Error: {result.get('error', 'Unknown error')}")
            return False
    except Exception as e:
        print(f"❌ Error sending test email: {e}")
        import traceback
        traceback.print_exc()
        return False


def check_email_logs(db: Session, limit: int = 5):
    """Check recent email logs"""
    print_section("5. Checking Email Logs")
    
    try:
        # Get recent email logs
        recent_logs = db.scalars(
            select(EmailLog)
            .order_by(desc(EmailLog.sent_at))
            .limit(limit)
        ).all()
        
        if not recent_logs:
            print("⚠️  No email logs found")
            return
        
        print(f"📋 Recent email logs (last {len(recent_logs)}):")
        for log in recent_logs:
            status_icon = "✅" if log.status == 'sent' else "❌"
            print(f"\n   {status_icon} {log.sent_at.strftime('%Y-%m-%d %H:%M:%S')}")
            print(f"      To: {log.recipient}")
            print(f"      Subject: {log.subject}")
            print(f"      Status: {log.status}")
            print(f"      Type: {log.email_type}")
            if log.error_message:
                print(f"      Error: {log.error_message}")
    except Exception as e:
        print(f"❌ Error checking email logs: {e}")
        import traceback
        traceback.print_exc()


def main():
    """Main test function"""
    print("\n" + "=" * 70)
    print("  TikTrack SMTP Service Test Script")
    print("  ==================================")
    print("=" * 70)
    
    db: Session = None
    try:
        db = SessionLocal()
        
        # Test 1: Load settings
        if not test_load_settings(db):
            print("\n❌ Cannot continue without SMTP settings")
            return 1
        
        # Test 2: Load EmailService
        email_service = test_email_service_loading(db)
        if not email_service:
            print("\n❌ Cannot continue without EmailService")
            return 1
        
        # Test 3: Test connection
        if not test_connection(email_service, db):
            print("\n⚠️  Connection test failed, but continuing...")
        
        # Test 4: Send test email (optional)
        import sys
        test_email = None
        if len(sys.argv) > 1:
            test_email = sys.argv[1]
        
        test_send_email(email_service, db, test_email)
        
        # Test 5: Check logs
        check_email_logs(db)
        
        print_section("Test Complete")
        print("✅ All tests completed!")
        print("\nNext steps:")
        print("1. Check the test email inbox (and spam folder)")
        print("2. Review email logs in the database")
        print("3. If issues persist, check SMTP settings and network connectivity")
        
        return 0
        
    except KeyboardInterrupt:
        print("\n\n⚠️  Test interrupted by user")
        return 1
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        return 1
    finally:
        if db:
            db.close()


if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)

