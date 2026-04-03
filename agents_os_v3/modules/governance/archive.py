"""Archive transitions — depends on artifact_index (Process Map §10); GATE_5 flows extend here."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from agents_os_v3.modules.governance import artifact_index as ai


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def mark_archive_pending(cur: Any, artifact_id: str) -> None:
    """Flag artifact for Team 191 cleanup (status ARCHIVE_PENDING)."""
    ai.mark_status(cur, artifact_id, "ARCHIVE_PENDING")


def supersede(cur: Any, old_id: str, new_id: str) -> None:
    """Caller inserts ``new_id`` first; old row marked SUPERSEDED; new row points back via ``supersedes``."""
    now = utc_now()
    cur.execute(
        """
        UPDATE wp_artifact_index
        SET status = 'SUPERSEDED', last_updated = %s
        WHERE id = %s
        """,
        (now, old_id),
    )
    cur.execute(
        """
        UPDATE wp_artifact_index
        SET supersedes = %s, last_updated = %s
        WHERE id = %s
        """,
        (old_id, now, new_id),
    )
