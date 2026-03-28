"""PostgreSQL connectivity for AOS v3 — isolated from TikTrack ``DATABASE_URL``."""

from __future__ import annotations

import os

import psycopg2
from psycopg2.extras import RealDictCursor


def get_database_url() -> str:
    """Return ``AOS_V3_DATABASE_URL`` or raise if unset."""
    u = (os.environ.get("AOS_V3_DATABASE_URL") or "").strip()
    if not u:
        raise RuntimeError("AOS_V3_DATABASE_URL is not set")
    return u


def connection():
    """New psycopg2 connection with :class:`RealDictCursor` for dict-like rows."""
    return psycopg2.connect(get_database_url(), cursor_factory=RealDictCursor)
