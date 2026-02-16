#!/usr/bin/env python3
"""
Debug script — reproduce POST /notes 500 and print traceback.
Run: python3 scripts/debug_notes_post.py
"""
import asyncio
import sys
import os

# Ensure api is importable
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


async def main():
    from api.core.database import AsyncSessionLocal
    from api.services.notes_service import get_notes_service
    from api.models.identity import User

    # Get TikTrackAdmin user_id
    from sqlalchemy import select
    from api.models.identity import User

    async with AsyncSessionLocal() as db:
        result = await db.execute(select(User).where(User.username == "TikTrackAdmin").limit(1))
        admin = result.scalar_one_or_none()
        if not admin:
            print("❌ TikTrackAdmin not found")
            return

        user_id = admin.id
        data = {
            "parent_type": "general",
            "content": "<p>Test note for D35 QA</p>",
            "category": "GENERAL",
        }
        try:
            service = get_notes_service()
            note = await service.create_note(db=db, user_id=user_id, data=data)
            await db.commit()
            print("✅ Success:", note.get("id"))
        except Exception as e:
            import traceback
            print("❌ Exception:", e)
            traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(main())
