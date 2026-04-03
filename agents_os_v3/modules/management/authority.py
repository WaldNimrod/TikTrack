"""
BUILD-phase actor identity (Team 00 Q3): single header, single swap point before PROD.

TODO AUTH_STUB: Replace with API key → team_id resolution.
"""

from __future__ import annotations

from typing import Annotated, Optional

from fastapi import Header, HTTPException


def get_actor_team_id(
    x_actor_team_id: Annotated[Optional[str], Header(alias="X-Actor-Team-Id")] = None,
) -> str:
    if x_actor_team_id is None or not str(x_actor_team_id).strip():
        raise HTTPException(
            status_code=400,
            detail={
                "code": "MISSING_ACTOR_HEADER",
                "message": "X-Actor-Team-Id header is required",
                "details": {},
            },
        )
    return str(x_actor_team_id).strip()
