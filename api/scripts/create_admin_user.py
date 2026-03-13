#!/usr/bin/env python3
"""
Create Admin User Script
-------------------------
Creates the primary admin user in the database.

Username: admin
Password: 418141
Role: ADMIN

Usage:
    python scripts/create_admin_user.py
"""

import asyncio
import sys
import os
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select

from api.core.config import settings
from api.models.identity import User
from api.models.enums import UserRole
from api.services.auth import AuthService
from api.utils.identity import uuid_to_ulid
import uuid

# Admin credentials
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "418141"
ADMIN_EMAIL = "admin@tiktrack.com"
ADMIN_ROLE = UserRole.ADMIN


async def create_admin_user():
    """Create admin user if it doesn't exist."""

    # Create database engine
    engine = create_async_engine(
        settings.database_url.replace("postgresql://", "postgresql+asyncpg://"), echo=False
    )

    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as db:
        try:
            # Check if admin user already exists
            result = await db.execute(select(User).where(User.username == ADMIN_USERNAME))
            existing_user = result.scalar_one_or_none()

            if existing_user:
                from api.utils.identity import uuid_to_ulid

                external_ulid = uuid_to_ulid(existing_user.id)
                print(f"✅ Admin user '{ADMIN_USERNAME}' already exists.")
                print(f"   Internal UUID: {existing_user.id}")
                print(f"   External ULID: {external_ulid}")
                print(f"   Email: {existing_user.email}")
                print(f"   Role: {existing_user.role.value}")
                return

            # Create auth service for password hashing
            auth_service = AuthService()

            # Hash password
            hashed_password = auth_service.hash_password(ADMIN_PASSWORD)

            # Create admin user (id will be auto-generated as UUID)
            admin_user = User(
                username=ADMIN_USERNAME,
                email=ADMIN_EMAIL,
                password_hash=hashed_password,
                role=ADMIN_ROLE,
                is_active=True,
                is_email_verified=True,
                phone_verified=False,
            )

            db.add(admin_user)
            await db.commit()
            await db.refresh(admin_user)

            # Get external ULID after commit
            from api.utils.identity import uuid_to_ulid

            external_ulid = uuid_to_ulid(admin_user.id)

            print("✅ Admin user created successfully!")
            print(f"   Username: {ADMIN_USERNAME}")
            print(f"   Password: {ADMIN_PASSWORD}")
            print(f"   Email: {ADMIN_EMAIL}")
            print(f"   Role: {ADMIN_ROLE.value}")
            print(f"   Internal UUID: {admin_user.id}")
            print(f"   External ULID: {external_ulid}")

        except Exception as e:
            await db.rollback()
            print(f"❌ Error creating admin user: {str(e)}")
            raise
        finally:
            await engine.dispose()


if __name__ == "__main__":
    print("🚀 Creating admin user...")
    print("=" * 50)
    asyncio.run(create_admin_user())
    print("=" * 50)
    print("✅ Done!")
