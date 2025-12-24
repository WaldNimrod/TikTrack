#!/usr/bin/env python3
"""
Ensure All Users Have Profiles Script
=====================================
Ensures that every user in the system has at least one active profile.
Creates a profile with name format: username + " פרופיל 1" if missing.
"""

import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker
from config.settings import DATABASE_URL
from models.user import User
from models.preferences import PreferenceProfile
from datetime import datetime
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def ensure_all_users_have_profiles():
    """
    Ensures every user has at least one active profile.
    Creates profiles with name format: username + " פרופיל 1" if missing.
    """
    engine = create_engine(DATABASE_URL)
    Session = sessionmaker(bind=engine)
    session = Session()
    
    try:
        # Get all users
        users = session.scalars(select(User)).all()
        logger.info(f"Found {len(users)} users in the system")
        
        users_fixed = 0
        profiles_created = 0
        profiles_activated = 0
        
        for user in users:
            # Check if user has any profiles
            user_profiles = session.scalars(
                select(PreferenceProfile)
                .where(PreferenceProfile.user_id == user.id)
            ).all()
            
            if not user_profiles:
                # No profiles - create one
                profile_name = f"{user.username} פרופיל 1"
                new_profile = PreferenceProfile(
                    user_id=user.id,
                    profile_name=profile_name,
                    is_active=True,
                    is_default=False,
                    description=f"פרופיל ברירת מחדל למשתמש {user.username}",
                    created_by=user.id,
                )
                session.add(new_profile)
                session.flush()
                profiles_created += 1
                logger.info(f"✅ Created profile '{profile_name}' for user {user.username} (ID: {user.id})")
                users_fixed += 1
            else:
                # Check if user has an active profile
                active_profiles = [p for p in user_profiles if p.is_active]
                
                if not active_profiles:
                    # No active profile - activate the first one
                    first_profile = user_profiles[0]
                    first_profile.is_active = True
                    profiles_activated += 1
                    logger.info(f"✅ Activated profile '{first_profile.profile_name}' for user {user.username} (ID: {user.id})")
                    users_fixed += 1
                else:
                    # User has active profile(s) - check if multiple are active
                    if len(active_profiles) > 1:
                        # Multiple active profiles - keep only the first one active
                        for profile in active_profiles[1:]:
                            profile.is_active = False
                        logger.info(f"✅ Fixed multiple active profiles for user {user.username} (ID: {user.id}) - kept '{active_profiles[0].profile_name}' active")
                        users_fixed += 1
        
        session.commit()
        
        logger.info("=" * 60)
        logger.info(f"✅ Summary:")
        logger.info(f"   - Users checked: {len(users)}")
        logger.info(f"   - Users fixed: {users_fixed}")
        logger.info(f"   - Profiles created: {profiles_created}")
        logger.info(f"   - Profiles activated: {profiles_activated}")
        logger.info("=" * 60)
        
        return {
            'users_checked': len(users),
            'users_fixed': users_fixed,
            'profiles_created': profiles_created,
            'profiles_activated': profiles_activated,
        }
        
    except Exception as e:
        logger.error(f"❌ Error: {e}")
        session.rollback()
        raise
    finally:
        session.close()

if __name__ == '__main__':
    ensure_all_users_have_profiles()


