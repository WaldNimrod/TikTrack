"""
D33-IR-05 / LLD §3.5 — Server-side logging without raw user identifiers.
"""

from __future__ import annotations

import hashlib
import logging
import uuid
from typing import Optional


def log_subject(
    logger: logging.Logger,
    level: int,
    message: str,
    *,
    user_id: Optional[uuid.UUID] = None,
) -> None:
    """Append a short non-reversible subject token instead of raw user id."""
    suffix = ""
    if user_id is not None:
        h = hashlib.sha256(str(user_id).encode()).hexdigest()[:12]
        suffix = f" subject_ref={h}"
    logger.log(level, "%s%s", message, suffix)
