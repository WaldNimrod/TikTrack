#!/usr/bin/env python3
"""Check users in database."""
import asyncio
import sys
import os

# Add project root to path
project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, project_root)

from sqlalchemy import select
from api.core.database import AsyncSessionLocal
from api.models.identity import User


async def check_users():
    """Check users in database."""
    async with AsyncSessionLocal() as session:
        try:
            stmt = select(User).where(User.deleted_at.is_(None))
            result = await session.execute(stmt)
            users = result.scalars().all()

            print(f"Found {len(users)} users in database:")
            print("=" * 80)

            for user in users:
                print(f"Username: {user.username}")
                print(f"Email: {user.email}")
                print(f"Password hash (first 50): {user.password_hash[:50]}...")
                print(f"Is Active: {user.is_active}")
                print(f"Is Email Verified: {user.is_email_verified}")
                print(f"Role: {user.role}")
                print("-" * 80)

        except Exception as e:
            print(f"Error: {type(e).__name__}: {str(e)}", file=sys.stderr)
            import traceback

            traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(check_users())
