#!/usr/bin/env python3
"""
Complete SMTP System Test
בדיקה מקיפה של מערכת SMTP

This script performs comprehensive testing of the SMTP system including:
1. Database tables
2. Settings loading
3. API endpoints
4. Email sending
5. Password reset integration

Author: TikTrack Development Team
Version: 1.0.0
Last Updated: January 28, 2025
"""

import sys
import os
from pathlib import Path
import requests
import json

# Add Backend to path
backend_path = Path(__file__).parent.parent
sys.path.insert(0, str(backend_path))

from sqlalchemy.orm import Session
from config.database import SessionLocal
from services.email_service import EmailService
from services.smtp_settings_service import SMTPSettingsService
from services.password_reset_service import PasswordResetService
from models.email_log import EmailLog
from sqlalchemy import select, desc, inspect
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

API_BASE_URL = "http://localhost:8080/api"


def print_section(title: str):
    """Print a formatted section header"""
    print("\n" + "=" * 70)
    print(f"  {title}")
    print("=" * 70 + "\n")


def test_database_tables(db: Session):
    """Test database tables exist"""
    print_section("1. Testing Database Tables")
    
    try:
        inspector = inspect(db.bind)
        tables = inspector.get_table_names()
        
        required_tables = ['email_logs', 'system_setting_groups', 'system_setting_types', 'system_settings', 'password_reset_tokens']
        
        print("Checking required tables:")
        all_exist = True
        for table in required_tables:
            exists = table in tables
            status = "✅" if exists else "❌"
            print(f"  {status} {table}: {'Exists' if exists else 'MISSING'}")
            if not exists:
                all_exist = False
        
        return all_exist
    except Exception as e:
        print(f"❌ Error checking tables: {e}")
        return False


def test_smtp_settings_service(db: Session):
    """Test SMTP Settings Service"""
    print_section("2. Testing SMTP Settings Service")
    
    try:
        smtp_service = SMTPSettingsService()
        settings = smtp_service.get_smtp_settings(db)
        
        if not settings:
            print("❌ No SMTP settings found")
            return False
        
        print("✅ SMTP settings loaded:")
        print(f"   Host: {settings.get('smtp_host')}")
        print(f"   Port: {settings.get('smtp_port')}")
        print(f"   User: {settings.get('smtp_user')}")
        print(f"   Enabled: {settings.get('smtp_enabled')}")
        print(f"   Password set: {'Yes' if settings.get('smtp_password') else 'No'}")
        
        return True
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_email_service(db: Session):
    """Test Email Service"""
    print_section("3. Testing Email Service")
    
    try:
        email_service = EmailService()
        loaded = email_service.load_settings_from_db(db)
        
        if not loaded:
            print("⚠️  Settings not loaded from DB, using environment")
        
        print(f"✅ EmailService initialized:")
        print(f"   Host: {email_service.smtp_host}")
        print(f"   Port: {email_service.smtp_port}")
        print(f"   User: {email_service.smtp_user}")
        print(f"   Enabled: {email_service.smtp_enabled}")
        print(f"   Password set: {'Yes' if email_service.smtp_password else 'No'}")
        
        return True
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_api_endpoints():
    """Test API endpoints"""
    print_section("4. Testing API Endpoints")
    
    results = {}
    
    # Test GET /api/system-settings/smtp
    try:
        response = requests.get(f"{API_BASE_URL}/system-settings/smtp", timeout=5)
        results['get_settings'] = {
            'success': response.status_code == 200,
            'status': response.status_code,
            'data': response.json() if response.status_code == 200 else None
        }
        status = "✅" if response.status_code == 200 else "❌"
        print(f"{status} GET /api/system-settings/smtp: {response.status_code}")
    except Exception as e:
        results['get_settings'] = {'success': False, 'error': str(e)}
        print(f"❌ GET /api/system-settings/smtp: {e}")
    
    # Test POST /api/system-settings/smtp/test
    try:
        response = requests.post(f"{API_BASE_URL}/system-settings/smtp/test", timeout=10)
        results['test_connection'] = {
            'success': response.status_code == 200,
            'status': response.status_code,
            'data': response.json() if response.status_code == 200 else None
        }
        status = "✅" if response.status_code == 200 else "⚠️"
        print(f"{status} POST /api/system-settings/smtp/test: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            if not data.get('success'):
                print(f"   Note: {data.get('error', 'Connection test failed')}")
    except Exception as e:
        results['test_connection'] = {'success': False, 'error': str(e)}
        print(f"❌ POST /api/system-settings/smtp/test: {e}")
    
    # Test POST /api/system-settings/smtp/test-email
    try:
        response = requests.post(
            f"{API_BASE_URL}/system-settings/smtp/test-email",
            json={'email': 'test@example.com'},
            timeout=10
        )
        results['test_email'] = {
            'success': response.status_code == 200,
            'status': response.status_code,
            'data': response.json() if response.status_code == 200 else None
        }
        status = "✅" if response.status_code == 200 else "❌"
        print(f"{status} POST /api/system-settings/smtp/test-email: {response.status_code}")
    except Exception as e:
        results['test_email'] = {'success': False, 'error': str(e)}
        print(f"❌ POST /api/system-settings/smtp/test-email: {e}")
    
    # Test POST /api/auth/password-reset/request
    try:
        response = requests.post(
            f"{API_BASE_URL}/auth/password-reset/request",
            json={'email': 'test@example.com'},
            timeout=10
        )
        results['password_reset_request'] = {
            'success': response.status_code in [200, 400],  # 400 is OK if email doesn't exist
            'status': response.status_code,
            'data': response.json() if response.status_code in [200, 400] else None
        }
        status = "✅" if response.status_code in [200, 400] else "❌"
        print(f"{status} POST /api/auth/password-reset/request: {response.status_code}")
    except Exception as e:
        results['password_reset_request'] = {'success': False, 'error': str(e)}
        print(f"❌ POST /api/auth/password-reset/request: {e}")
    
    return results


def test_email_logs(db: Session):
    """Test email logs"""
    print_section("5. Testing Email Logs")
    
    try:
        logs = db.scalars(
            select(EmailLog).order_by(desc(EmailLog.sent_at)).limit(5)
        ).all()
        
        print(f"📧 Recent email logs ({len(logs)}):")
        for log in logs:
            status_icon = "✅" if log.status == 'sent' else "❌"
            print(f"\n   {status_icon} {log.sent_at.strftime('%Y-%m-%d %H:%M:%S')}")
            print(f"      To: {log.recipient}")
            print(f"      Subject: {log.subject}")
            print(f"      Status: {log.status}")
            print(f"      Type: {log.email_type}")
            if log.error_message:
                print(f"      Error: {log.error_message[:100]}")
        
        return True
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_password_reset_service(db: Session):
    """Test Password Reset Service"""
    print_section("6. Testing Password Reset Service")
    
    try:
        service = PasswordResetService()
        
        # Test token generation
        token = service.generate_reset_token()
        print(f"✅ Token generated: {token[:20]}...")
        
        # Test email service integration
        if service.email_service:
            print("✅ EmailService integrated")
        else:
            print("❌ EmailService not integrated")
            return False
        
        return True
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False


def main():
    """Main test function"""
    print("\n" + "=" * 70)
    print("  TikTrack SMTP System - Complete Test")
    print("  =====================================")
    print("=" * 70)
    
    db: Session = None
    try:
        db = SessionLocal()
        
        # Run all tests
        results = {
            'database_tables': test_database_tables(db),
            'smtp_settings_service': test_smtp_settings_service(db),
            'email_service': test_email_service(db),
            'api_endpoints': test_api_endpoints(),
            'email_logs': test_email_logs(db),
            'password_reset_service': test_password_reset_service(db)
        }
        
        # Summary
        print_section("Test Summary")
        
        total = 0
        passed = 0
        
        for test_name, result in results.items():
            if isinstance(result, bool):
                total += 1
                if result:
                    passed += 1
                    print(f"✅ {test_name}")
                else:
                    print(f"❌ {test_name}")
            elif isinstance(result, dict):
                # API endpoints
                for endpoint, endpoint_result in result.items():
                    total += 1
                    if endpoint_result.get('success'):
                        passed += 1
                        print(f"✅ {test_name}.{endpoint}")
                    else:
                        print(f"❌ {test_name}.{endpoint}")
        
        print(f"\n📊 Results: {passed}/{total} tests passed")
        
        if passed == total:
            print("🎉 All tests passed!")
            return 0
        else:
            print(f"⚠️  {total - passed} test(s) failed")
            return 1
        
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

