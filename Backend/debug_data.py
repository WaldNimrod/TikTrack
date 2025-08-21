#!/usr/bin/env python3
"""
Debug script to check the issue
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from config.database import SessionLocal, init_db
from models import User, Role
from services.auth_service import AuthService
import traceback

def debug_create_user():
    """Test user creation"""
    print("🔍 Debugging user creation...")
    
    # Create database
    init_db()
    
    # Create session
    db = SessionLocal()
    
    try:
        # Create role
        print("📋 Creating role...")
        existing_role = db.query(Role).filter(Role.name == "admin").first()
        if not existing_role:
            role = Role(name="admin", description="System administrator", permissions='["read", "write", "delete", "admin"]')
            db.add(role)
            db.commit()
            print("✅ Role created")
        else:
            print("✅ Role already exists")
        
        # Create user
        print("👤 Creating user...")
        user = AuthService.create_user(db, "admin", "admin@tiktrack.com", "admin123", ["admin"])
        print(f"✅ User created: {user.username}")
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    debug_create_user()
