"""
Audit ledger — canonical ``event_hash`` (Team 00 GATE_2) and append-only ``events`` INSERT (AD-S7-01).

:func:`append_event` computes hash from id, run, sequence, type, occurred_at ISO, and payload;
links ``prev_hash`` to the previous row on the same run. Failures raise :class:`AuditLedgerError`
so the state machine can roll back the enclosing transaction.
"""

from __future__ import annotations

import hashlib
import json
from datetime import datetime, timezone
from typing import Any

from agents_os_v3.modules.state import repository as R


class AuditLedgerError(Exception):
    """DB failure during event INSERT — caller must rollback run mutation."""


def _occurred_iso(dt: datetime) -> str:
    return dt.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")


def compute_event_hash(
    event_id: str,
    run_id: str,
    sequence_no: int,
    event_type: str,
    occurred_at_iso: str,
    payload_json: str,
) -> str:
    """Canonical §3.1 string (Team 00 resolution) — no JSON blob."""
    blob = (
        event_id
        + run_id
        + str(sequence_no)
        + event_type
        + occurred_at_iso
        + (payload_json or "")
    )
    return hashlib.sha256(blob.encode("utf-8")).hexdigest()


def _prev_hash_for_run(cur: Any, run_id: str) -> str | None:
    cur.execute(
        """
        SELECT event_hash FROM events
        WHERE run_id = %s
        ORDER BY sequence_no DESC
        LIMIT 1
        """,
        (run_id,),
    )
    row = cur.fetchone()
    if not row:
        return None
    return str(row["event_hash"])


def append_event(
    cur: Any,
    *,
    event_id: str,
    run_id: str,
    sequence_no: int,
    event_type: str,
    gate_id: str | None,
    phase_id: str | None,
    domain_id: str,
    work_package_id: str,
    actor_team_id: str | None,
    actor_type: str,
    verdict: str | None,
    reason: str | None,
    payload: dict[str, Any],
    occurred_at: datetime,
) -> str:
    """
    INSERT one events row. Computes event_hash per §3.1 after id/seq known.
    prev_hash links to prior row's event_hash, or NULL for first event.
    """
    payload_json_str = json.dumps(payload, default=str)
    occurred_iso = _occurred_iso(occurred_at)
    ev_hash = compute_event_hash(
        event_id,
        run_id,
        sequence_no,
        event_type,
        occurred_iso,
        payload_json_str,
    )
    prev = _prev_hash_for_run(cur, run_id)
    try:
        R.insert_event(
            cur,
            event_id=event_id,
            run_id=run_id,
            sequence_no=sequence_no,
            event_type=event_type,
            gate_id=gate_id,
            phase_id=phase_id,
            domain_id=domain_id,
            work_package_id=work_package_id,
            actor_team_id=actor_team_id,
            actor_type=actor_type,
            verdict=verdict,
            reason=reason,
            payload=payload,
            occurred_at=occurred_at,
            prev_hash=prev,
            event_hash=ev_hash,
        )
    except Exception as e:
        raise AuditLedgerError(str(e)) from e
    return event_id
