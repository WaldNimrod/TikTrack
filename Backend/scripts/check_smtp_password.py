#!/usr/bin/env python3
"""
Check SMTP Password Storage - TikTrack
בדיקת שמירת סיסמת SMTP במסד הנתונים

This script checks if SMTP password is stored correctly in the database.

Usage:
    python3 Backend/scripts/check_smtp_password.py
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
from services.email_service import EmailService

def check_smtp_password():
    """Check SMTP password storage and decryption"""
    print("=" * 70)
    print("🔍 Checking SMTP Password Storage")
    print("=" * 70)
    
    db: Session = SessionLocal()
    try:
        # 1. Get SMTP settings from database
        print("\n1️⃣ Getting SMTP settings from database...")
        smtp_service = SMTPSettingsService()
        settings = smtp_service.get_smtp_settings(db)
        
        if not settings:
            print("❌ No SMTP settings found in database!")
            return
        
        print(f"✅ Found {len(settings)} SMTP settings")
        
        # 2. Check password field
        print("\n2️⃣ Checking password field...")
        password_encrypted = settings.get('smtp_password', '')
        
        if not password_encrypted:
            print("❌ No password found in settings!")
            return
        
        print(f"✅ Password found (encrypted): {password_encrypted[:50]}...")
        
        # 3. Try to decrypt password
        print("\n3️⃣ Testing password decryption...")
        try:
            decrypted_password = smtp_service.decrypt_password(password_encrypted)
            print(f"✅ Password decrypted successfully")
            print(f"   Length: {len(decrypted_password)} characters")
            print(f"   First 3 chars: {decrypted_password[:3]}***")
            print(f"   Last 3 chars: ***{decrypted_password[-3:]}")
            
            # Check for whitespace
            if decrypted_password != decrypted_password.strip():
                print("⚠️  WARNING: Password contains leading/trailing whitespace!")
                print(f"   Original length: {len(decrypted_password)}")
                print(f"   Trimmed length: {len(decrypted_password.strip())}")
            else:
                print("✅ Password has no leading/trailing whitespace")
                
        except Exception as e:
            print(f"❌ Error decrypting password: {e}")
            return
        
        # 4. Test EmailService loading
        print("\n4️⃣ Testing EmailService password loading...")
        email_service = EmailService()
        loaded = email_service.load_settings_from_db(db)
        
        if not loaded:
            print("❌ EmailService failed to load settings from database!")
            return
        
        print("✅ EmailService loaded settings from database")
        print(f"   SMTP Host: {email_service.smtp_host}")
        print(f"   SMTP Port: {email_service.smtp_port}")
        print(f"   SMTP User: {email_service.smtp_user}")
        print(f"   Password loaded: {'Yes' if email_service.smtp_password else 'No'}")
        print(f"   Password length: {len(email_service.smtp_password) if email_service.smtp_password else 0}")
        
        # 5. Compare passwords
        print("\n5️⃣ Comparing passwords...")
        if email_service.smtp_password == decrypted_password:
            print("✅ Passwords match!")
        else:
            print("❌ Passwords DO NOT match!")
            print(f"   Decrypted length: {len(decrypted_password)}")
            print(f"   EmailService length: {len(email_service.smtp_password)}")
            if len(decrypted_password) == len(email_service.smtp_password):
                print("   Same length - checking character by character...")
                for i, (c1, c2) in enumerate(zip(decrypted_password, email_service.smtp_password)):
                    if c1 != c2:
                        print(f"   First difference at position {i}: '{c1}' != '{c2}'")
                        break
        
        # 6. Test connection (optional)
        print("\n6️⃣ Testing SMTP connection...")
        try:
            result = email_service.test_connection(db)
            if result.get('success'):
                print("✅ SMTP connection successful!")
            else:
                print(f"❌ SMTP connection failed: {result.get('error', 'Unknown error')}")
        except Exception as e:
            print(f"❌ Error testing connection: {e}")
        
        print("\n" + "=" * 70)
        print("✅ Check complete!")
        print("=" * 70)
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == '__main__':
    check_smtp_password()

