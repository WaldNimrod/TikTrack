#!/usr/bin/env python3
"""
Ensure Active User Script
=========================
Creates an active user if one doesn't exist, or activates an existing user.
"""

import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from config.settings import DATABASE_URL
from models.user import User

def ensure_active_user():
    """
    Ensures there's a user in the system
    
    Note: No full user system yet - only basic infrastructure.
    User should be created manually in the database.
    """
    engine = create_engine(DATABASE_URL)
    Session = sessionmaker(bind=engine)
    db = Session()
    
    try:
        # Check for any user (no full user system yet)
        any_user = db.query(User).first()
        if any_user:
            print(f'✅ נמצא משתמש: {any_user.username} (ID: {any_user.id})')
            # Make sure it's active if it has the field
            if hasattr(any_user, 'is_active') and not any_user.is_active:
                any_user.is_active = True
                db.commit()
                print(f'✅ הופעל משתמש: {any_user.username}')
            return any_user
        
        # No user found - must be created manually
        print('❌ לא נמצא משתמש במערכת')
        print('💡 יש ליצור משתמש ידנית בבסיס הנתונים לפני יצירת נתוני דוגמה')
        print('   לדוגמה: INSERT INTO users (username, email, first_name, last_name, is_active) VALUES (...)')
        return None
        
    except Exception as e:
        print(f'❌ שגיאה: {e}')
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == '__main__':
    ensure_active_user()

