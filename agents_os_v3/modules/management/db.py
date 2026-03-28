"""Database connection for AOS v3 API (isolated from TikTrack)."""

from __future__ import annotations

import os

import psycopg2
from psycopg2.extras import RealDictCursor


def get_database_url() -> str:
    u = (os.environ.get("AOS_V3_DATABASE_URL") or "").strip()
    if not u:
        raise RuntimeError("AOS_V3_DATABASE_URL is not set")
    return u


def connection():
    return psycopg2.connect(get_database_url(), cursor_factory=RealDictCursor)
