#!/usr/bin/env python3
"""
Test Mailjet SMTP Connection - TikTrack
בדיקת חיבור SMTP ל-Mailjet

This script tests the SMTP connection to Mailjet.

Author: TikTrack Development Team
Version: 1.0.0
Last Updated: January 28, 2025
"""

import smtplib

# Mailjet SMTP settings
# According to Mailjet documentation:
# - Host: in-v3.mailjet.com (or smtp.mailjet.com)
# - Port: 587 (TLS) or 465 (SSL)
# - Username: API Key
# - Password: Secret Key
SMTP_HOST = 'in-v3.mailjet.com'
SMTP_PORT = 587
API_KEY = 'c1a3ffeae18f2b8a6ef523f9c78a3ee3'  # Mailjet API Key (username)
SECRET_KEY = 'd4b38137c8046e61e2e61c462585a749'  # Mailjet Secret Key (password)

print("=" * 70)
print("🧪 בדיקת חיבור SMTP ל-Mailjet")
print("=" * 70)
print()
print(f"Host: {SMTP_HOST}")
print(f"Port: {SMTP_PORT}")
print(f"API Key (Username): {API_KEY}")
print(f"Secret Key (Password): {SECRET_KEY[:10]}...")
print()

try:
    print("🔌 מתחבר לשרת...")
    server = smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=30)
    server.set_debuglevel(1)  # Enable verbose debugging
    
    print("🔐 מתחיל TLS...")
    server.starttls()
    
    print("🔑 מתחבר עם API Key + Secret Key...")
    server.login(API_KEY, SECRET_KEY)
    
    print()
    print("=" * 70)
    print("✅ חיבור SMTP תקין!")
    print("=" * 70)
    print()
    print("🎉 הכל מוכן! תוכל לשלוח מיילים דרך TikTrack.")
    
    server.quit()
    
except smtplib.SMTPAuthenticationError as e:
    print()
    print("=" * 70)
    print(f"❌ שגיאת אימות: {e}")
    print("=" * 70)
    print()
    print("🔧 פתרון בעיות:")
    print("1. ודא שה-API Key נכון")
    print("2. ודא שה-Secret Key נכון")
    print("3. ודא שכתובת האימייל מאומתת ב-Mailjet")
    
except smtplib.SMTPException as e:
    print()
    print("=" * 70)
    print(f"❌ שגיאת SMTP: {e}")
    print("=" * 70)
    
except Exception as e:
    print()
    print("=" * 70)
    print(f"❌ שגיאה: {e}")
    print("=" * 70)
    import traceback
    traceback.print_exc()

