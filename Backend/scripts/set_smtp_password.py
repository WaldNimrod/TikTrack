#!/usr/bin/env python3
"""
Set SMTP Password Script
הגדרת סיסמת SMTP

This script sets the SMTP password in the database (encrypted).

Usage:
    python3 scripts/set_smtp_password.py [password]

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
from services.smtp_settings_service import SMTPSettingsService
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def set_smtp_password(password: str):
    """Set SMTP password in database"""
    db: Session = None
    try:
        db = SessionLocal()
        smtp_service = SMTPSettingsService()
        
        # Update password
        result = smtp_service.update_smtp_settings(
            db_session=db,
            settings={'smtp_password': password},
            updated_by='setup_script'
        )
        
        if result['success']:
            logger.info("✅ SMTP password set successfully")
            return True
        else:
            logger.error(f"❌ Failed to set SMTP password: {result.get('error')}")
            return False
    except Exception as e:
        logger.error(f"❌ Error setting SMTP password: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        if db:
            db.close()


if __name__ == "__main__":
    if len(sys.argv) > 1:
        password = sys.argv[1]
    else:
        # Default password
        password = "Nim027425677!"
        logger.info(f"Using default password (set via argument to use different password)")
    
    success = set_smtp_password(password)
    sys.exit(0 if success else 1)

