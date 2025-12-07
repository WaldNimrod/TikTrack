#!/usr/bin/env python3
"""
Verify Test Users Script
סקריפט לבדיקת משתמשי test קיימים ואימות credentials

בודק:
1. שמשתמשי test קיימים במסד הנתונים
2. שאימות credentials עובד
3. יוצר משתמשים חסרים אם צריך
"""

import sys
import os
from pathlib import Path

# Add Backend to path
backend_path = Path(__file__).parent.parent
sys.path.insert(0, str(backend_path))

from sqlalchemy import select, text
from config.database import get_db
from models.user import User
from services.auth_service import AuthService
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# הגדרת משתמשי test
TEST_USERS = [
    {
        "username": "nimrod",
        "password": "nimw",
        "email": "nimrod@tiktrack.com",
        "first_name": "נימרוד",
        "last_name": "",
        "is_default": True,
        "description": "מנהל ראשי של המערכת"
    },
    {
        "username": "admin",
        "password": "admin123",
        "email": "admin@tiktrack.com",
        "first_name": "מנהל",
        "last_name": "מערכת",
        "is_default": False,
        "description": "משתמש מנהל"
    },
    {
        "username": "user",
        "password": "user123",
        "email": "user@tiktrack.com",
        "first_name": "משתמש",
        "last_name": "רגיל",
        "is_default": False,
        "description": "משתמש רגיל"
    }
]


def verify_user_exists(db, username):
    """בדיקה אם משתמש קיים"""
    try:
        user = db.scalars(
            select(User).where(User.username == username)
        ).first()
        return user is not None, user
    except Exception as e:
        logger.error(f"❌ שגיאה בבדיקת משתמש '{username}': {e}")
        return False, None


def verify_user_credentials(db, username, password):
    """בדיקת אימות credentials"""
    try:
        user = db.scalars(
            select(User).where(User.username == username)
        ).first()
        
        if not user:
            return False, "User not found"
        
        if not user.is_active:
            return False, "User is not active"
        
        if user.check_password(password):
            return True, "Credentials valid"
        else:
            return False, "Invalid password"
    except Exception as e:
        logger.error(f"❌ שגיאה באימות credentials למשתמש '{username}': {e}")
        return False, str(e)


def create_missing_user(db, user_config):
    """יצירת משתמש חסר"""
    try:
        from datetime import datetime
        
        logger.info(f"   יוצר משתמש '{user_config['username']}' ({user_config['description']})...")
        
        new_user = User(
            username=user_config["username"],
            email=user_config["email"],
            first_name=user_config["first_name"],
            last_name=user_config["last_name"],
            is_active=True,
            is_default=user_config.get("is_default", False),
            updated_at=datetime.utcnow()
        )
        new_user.set_password(user_config["password"])
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        logger.info(f"   ✅ משתמש '{user_config['username']}' נוצר בהצלחה (ID: {new_user.id})")
        return True
    except Exception as e:
        logger.error(f"   ❌ שגיאה ביצירת משתמש '{user_config['username']}': {e}")
        db.rollback()
        return False


def verify_test_users(create_missing=False):
    """בדיקת כל משתמשי test"""
    logger.info("=" * 70)
    logger.info("🔍 בדיקת משתמשי test")
    logger.info("=" * 70)
    
    db = None
    try:
        db = next(get_db())
        
        all_verified = True
        results = []
        
        for user_config in TEST_USERS:
            username = user_config["username"]
            password = user_config["password"]
            
            logger.info(f"\n📋 בודק משתמש: {username}")
            logger.info("-" * 70)
            
            # בדיקה אם המשתמש קיים
            exists, user = verify_user_exists(db, username)
            
            if not exists:
                logger.warning(f"⚠️  משתמש '{username}' לא קיים")
                if create_missing:
                    if create_missing_user(db, user_config):
                        # בדיקה שוב אחרי יצירה
                        exists, user = verify_user_exists(db, username)
                    else:
                        all_verified = False
                        results.append({
                            "username": username,
                            "status": "failed",
                            "error": "Failed to create user"
                        })
                        continue
                else:
                    all_verified = False
                    results.append({
                        "username": username,
                        "status": "missing",
                        "error": "User does not exist"
                    })
                    continue
            
            logger.info(f"✅ משתמש '{username}' קיים (ID: {user.id if user else 'N/A'})")
            
            # בדיקת credentials
            credentials_valid, message = verify_user_credentials(db, username, password)
            
            if credentials_valid:
                logger.info(f"✅ Credentials תקינים למשתמש '{username}'")
                results.append({
                    "username": username,
                    "status": "verified",
                    "user_id": user.id if user else None
                })
            else:
                logger.error(f"❌ Credentials לא תקינים למשתמש '{username}': {message}")
                all_verified = False
                results.append({
                    "username": username,
                    "status": "failed",
                    "error": message
                })
        
        logger.info("\n" + "=" * 70)
        logger.info("📊 סיכום תוצאות")
        logger.info("=" * 70)
        
        for result in results:
            status_icon = "✅" if result["status"] == "verified" else "❌"
            logger.info(f"{status_icon} {result['username']}: {result['status']}")
            if "error" in result:
                logger.info(f"   שגיאה: {result['error']}")
        
        if all_verified:
            logger.info("\n🎉 כל משתמשי test מאומתים בהצלחה!")
            return True
        else:
            logger.warning("\n⚠️  חלק ממשתמשי test לא מאומתים")
            if not create_missing:
                logger.info("💡 טיפ: הרץ עם --create-missing כדי ליצור משתמשים חסרים")
            return False
            
    except Exception as e:
        logger.error(f"❌ שגיאה כללית בבדיקת משתמשי test: {e}", exc_info=True)
        return False
    finally:
        if db:
            db.close()


def main():
    """Main function"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Verify test users exist and credentials work')
    parser.add_argument(
        '--create-missing',
        action='store_true',
        help='Create missing users if they do not exist'
    )
    
    args = parser.parse_args()
    
    success = verify_test_users(create_missing=args.create_missing)
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()

