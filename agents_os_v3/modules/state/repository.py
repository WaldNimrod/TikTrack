"""Persistence helpers — DDL v1.0.2 column names only; used inside one DB transaction (IR-8)."""

from __future__ import annotations

import json
from datetime import datetime, timezone
from typing import Any

from agents_os_v3.modules.state.errors import StateMachineError

RunRow = dict[str, Any]

# ``update_run_position``: omit paused_* kwargs to leave columns unchanged; pass ``None`` to SET NULL.
_PAUSE_FIELDS_UNSET = object()


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def fetch_run(cur: Any, run_id: str) -> RunRow | None:
    cur.execute("SELECT * FROM runs WHERE id = %s", (run_id,))
    row = cur.fetchone()
    return dict(row) if row else None


def resolve_domain_id(cur: Any, domain_id_or_slug: str) -> str:
    """Return the canonical ULID for a domain, accepting either ULID or slug.

    Raises StateMachineError("DOMAIN_NOT_FOUND", 404) for unknown values.
    """
    cur.execute(
        "SELECT id FROM domains WHERE id = %s OR slug = %s",
        (domain_id_or_slug, domain_id_or_slug),
    )
    row = cur.fetchone()
    if not row:
        raise StateMachineError(
            "DOMAIN_NOT_FOUND", 404, details={"domain_id": domain_id_or_slug}
        )
    return str(row["id"])


def fetch_domain(cur: Any, domain_id: str) -> RunRow | None:
    resolved = resolve_domain_id(cur, domain_id)
    cur.execute("SELECT * FROM domains WHERE id = %s", (resolved,))
    row = cur.fetchone()
    return dict(row) if row else None


def fetch_work_package(cur: Any, wp_id: str) -> RunRow | None:
    cur.execute("SELECT * FROM work_packages WHERE id = %s", (wp_id,))
    row = cur.fetchone()
    return dict(row) if row else None


def in_progress_run_for_domain(cur: Any, domain_id: str) -> RunRow | None:
    domain_ulid = resolve_domain_id(cur, domain_id)
    cur.execute(
        "SELECT id, status, current_gate_id FROM runs WHERE domain_id = %s AND status = 'IN_PROGRESS'",
        (domain_ulid,),
    )
    row = cur.fetchone()
    return dict(row) if row else None


def principal_row_exists(cur: Any) -> bool:
    cur.execute("SELECT 1 FROM teams WHERE id = 'team_00' LIMIT 1")
    return cur.fetchone() is not None


def resolve_routing_rule(
    cur: Any, gate_id: str, domain_id: str, phase_id: str | None
) -> RunRow | None:
    cur.execute(
        """
        SELECT * FROM routing_rules
        WHERE gate_id = %s
          AND (domain_id = %s OR domain_id IS NULL)
          AND (phase_id = %s OR phase_id IS NULL)
        ORDER BY
          CASE WHEN domain_id IS NOT NULL THEN 0 ELSE 1 END,
          CASE WHEN phase_id IS NOT NULL THEN 0 ELSE 1 END,
          priority DESC
        LIMIT 1
        """,
        (gate_id, domain_id, phase_id),
    )
    row = cur.fetchone()
    return dict(row) if row else None


def assignment_for_role(
    cur: Any, work_package_id: str, role_id: str
) -> RunRow | None:
    cur.execute(
        """
        SELECT id, team_id, role_id FROM assignments
        WHERE work_package_id = %s AND role_id = %s AND status = 'ACTIVE'
        LIMIT 1
        """,
        (work_package_id, role_id),
    )
    row = cur.fetchone()
    return dict(row) if row else None


def pipeline_role(cur: Any, role_id: str) -> RunRow | None:
    cur.execute("SELECT * FROM pipeline_roles WHERE id = %s", (role_id,))
    row = cur.fetchone()
    return dict(row) if row else None


def gate_row(cur: Any, gate_id: str) -> RunRow | None:
    cur.execute("SELECT * FROM gates WHERE id = %s", (gate_id,))
    row = cur.fetchone()
    return dict(row) if row else None


def has_blocking_authority(
    cur: Any,
    gate_id: str,
    phase_id: str | None,
    domain_id: str,
    role_id: str,
) -> bool:
    cur.execute(
        """
        SELECT 1 FROM gate_role_authorities
        WHERE gate_id = %s
          AND role_id = %s
          AND may_block_verdict = 1
          AND (phase_id = %s OR phase_id IS NULL)
          AND (domain_id = %s OR domain_id IS NULL)
        LIMIT 1
        """,
        (gate_id, role_id, phase_id, domain_id),
    )
    return cur.fetchone() is not None


def max_correction_cycles(cur: Any) -> int:
    cur.execute(
        """
        SELECT (policy_value_json::jsonb->>'max')::integer AS m
        FROM policies
        WHERE policy_key = 'max_correction_cycles' AND scope_type = 'GLOBAL'
        ORDER BY priority DESC
        LIMIT 1
        """
    )
    row = cur.fetchone()
    if row and row.get("m") is not None:
        return int(row["m"])
    return 5


def first_phase_for_gate(cur: Any, gate_id: str) -> str | None:
    cur.execute(
        """
        SELECT id FROM phases
        WHERE gate_id = %s
        ORDER BY sequence_order ASC
        LIMIT 1
        """,
        (gate_id,),
    )
    row = cur.fetchone()
    return str(row["id"]) if row else None


def next_gate_phase(cur: Any, current_gate_id: str, current_phase_id: str) -> tuple[str | None, str | None]:
    cur.execute(
        "SELECT sequence_order FROM phases WHERE id = %s AND gate_id = %s",
        (current_phase_id, current_gate_id),
    )
    prow = cur.fetchone()
    if not prow:
        return None, None
    seq = int(prow["sequence_order"])
    cur.execute(
        """
        SELECT id, gate_id FROM phases
        WHERE gate_id = %s AND sequence_order > %s
        ORDER BY sequence_order ASC
        LIMIT 1
        """,
        (current_gate_id, seq),
    )
    nxt = cur.fetchone()
    if nxt:
        return str(nxt["gate_id"]), str(nxt["id"])
    cur.execute("SELECT sequence_order FROM gates WHERE id = %s", (current_gate_id,))
    grow = cur.fetchone()
    if not grow:
        return None, None
    gseq = int(grow["sequence_order"])
    cur.execute(
        """
        SELECT p.id AS phase_id, p.gate_id AS gate_id FROM phases p
        JOIN gates g ON p.gate_id = g.id
        WHERE g.sequence_order > %s
        ORDER BY g.sequence_order ASC, p.sequence_order ASC
        LIMIT 1
        """,
        (gseq,),
    )
    n2 = cur.fetchone()
    if n2:
        return str(n2["gate_id"]), str(n2["phase_id"])
    return None, None


def is_terminal_position(cur: Any, gate_id: str, phase_id: str) -> bool:
    ng, np = next_gate_phase(cur, gate_id, phase_id)
    return ng is None and np is None


def active_assignments_for_wp(cur: Any, work_package_id: str) -> list[RunRow]:
    cur.execute(
        """
        SELECT id, role_id, team_id FROM assignments
        WHERE work_package_id = %s AND status = 'ACTIVE'
        """,
        (work_package_id,),
    )
    rows = cur.fetchall() or []
    return [dict(r) for r in rows]


def insert_run(
    cur: Any,
    *,
    run_id: str,
    work_package_id: str,
    domain_id: str,
    process_variant: str,
    current_gate_id: str,
    current_phase_id: str,
    started_at: datetime,
) -> None:
    cur.execute(
        """
        INSERT INTO runs (
          id, work_package_id, domain_id, process_variant,
          current_gate_id, current_phase_id, status,
          paused_at, paused_routing_snapshot_json,
          execution_mode, correction_cycle_count,
          gates_completed_json, gates_failed_json,
          started_at, last_updated, completed_at
        ) VALUES (
          %s, %s, %s, %s,
          %s, %s, 'IN_PROGRESS',
          NULL, NULL,
          'MANUAL', 0,
          '[]', '[]',
          %s, %s, NULL
        )
        """,
        (
            run_id,
            work_package_id,
            domain_id,
            process_variant,
            current_gate_id,
            current_phase_id,
            started_at,
            started_at,
        ),
    )


def update_work_package_linked_run(cur: Any, wp_id: str, run_id: str) -> None:
    cur.execute(
        """
        UPDATE work_packages
        SET linked_run_id = %s, status = 'ACTIVE', updated_at = NOW()
        WHERE id = %s
        """,
        (run_id, wp_id),
    )


def insert_assignment(
    cur: Any,
    *,
    assignment_id: str,
    work_package_id: str,
    domain_id: str,
    role_id: str,
    team_id: str,
    assigned_at: datetime,
) -> None:
    cur.execute(
        """
        INSERT INTO assignments (
          id, work_package_id, domain_id, role_id, team_id,
          assigned_at, assigned_by, status, superseded_by, notes, created_at
        ) VALUES (
          %s, %s, %s, %s, %s,
          %s, 'team_00', 'ACTIVE', NULL, NULL, %s
        )
        ON CONFLICT (work_package_id, role_id) WHERE status = 'ACTIVE'
        DO UPDATE SET
          team_id     = EXCLUDED.team_id,
          domain_id   = EXCLUDED.domain_id,
          assigned_at = EXCLUDED.assigned_at
        """,
        (
            assignment_id,
            work_package_id,
            domain_id,
            role_id,
            team_id,
            assigned_at,
            assigned_at,
        ),
    )


def fetch_latest_event(cur: Any, run_id: str) -> RunRow | None:
    cur.execute(
        """
        SELECT * FROM events
        WHERE run_id = %s
        ORDER BY sequence_no DESC
        LIMIT 1
        """,
        (run_id,),
    )
    row = cur.fetchone()
    return dict(row) if row else None


def has_active_assignment_for_role(cur: Any, team_id: str, role_id: str) -> bool:
    cur.execute(
        """
        SELECT 1 FROM assignments
        WHERE team_id = %s AND role_id = %s AND status = 'ACTIVE'
        LIMIT 1
        """,
        (team_id, role_id),
    )
    return cur.fetchone() is not None


def next_event_seq(cur: Any, run_id: str) -> int:
    cur.execute(
        "SELECT COALESCE(MAX(sequence_no), 0) + 1 AS n FROM events WHERE run_id = %s",
        (run_id,),
    )
    row = cur.fetchone()
    return int(row["n"]) if row else 1


def insert_event(
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
    prev_hash: str | None,
    event_hash: str,
) -> None:
    cur.execute(
        """
        INSERT INTO events (
          id, run_id, sequence_no, event_type, gate_id, phase_id, domain_id, work_package_id,
          actor_team_id, actor_type, verdict, reason, payload_json, occurred_at, prev_hash, event_hash
        ) VALUES (
          %s, %s, %s, %s, %s, %s, %s, %s,
          %s, %s, %s, %s, %s, %s, %s, %s
        )
        """,
        (
            event_id,
            run_id,
            sequence_no,
            event_type,
            gate_id,
            phase_id,
            domain_id,
            work_package_id,
            actor_team_id,
            actor_type,
            verdict,
            reason,
            json.dumps(payload, default=str),
            occurred_at,
            prev_hash,
            event_hash,
        ),
    )


def update_run_position(
    cur: Any,
    run_id: str,
    *,
    current_gate_id: str | None = None,
    current_phase_id: str | None = None,
    status: str | None = None,
    correction_cycle_count: int | None = None,
    paused_at: datetime | None | object = _PAUSE_FIELDS_UNSET,
    paused_routing_snapshot_json: str | None | object = _PAUSE_FIELDS_UNSET,
    completed_at: datetime | None = None,
    last_updated: datetime | None = None,
) -> None:
    lu = last_updated or utc_now()
    parts: list[str] = ["last_updated = %s"]
    vals: list[Any] = [lu]
    if current_gate_id is not None:
        parts.append("current_gate_id = %s")
        vals.append(current_gate_id)
    if current_phase_id is not None:
        parts.append("current_phase_id = %s")
        vals.append(current_phase_id)
    if status is not None:
        parts.append("status = %s")
        vals.append(status)
    if correction_cycle_count is not None:
        parts.append("correction_cycle_count = %s")
        vals.append(correction_cycle_count)
    if paused_at is not _PAUSE_FIELDS_UNSET:
        parts.append("paused_at = %s")
        vals.append(paused_at)
    if paused_routing_snapshot_json is not _PAUSE_FIELDS_UNSET:
        parts.append("paused_routing_snapshot_json = %s")
        vals.append(paused_routing_snapshot_json)
    if completed_at is not None:
        parts.append("completed_at = %s")
        vals.append(completed_at)
    vals.append(run_id)
    cur.execute(f"UPDATE runs SET {', '.join(parts)} WHERE id = %s", vals)


def count_team_assignment_changed_after(
    cur: Any, run_id: str, paused_at: datetime
) -> int:
    cur.execute(
        """
        SELECT COUNT(*) AS c FROM events
        WHERE run_id = %s
          AND event_type = 'TEAM_ASSIGNMENT_CHANGED'
          AND occurred_at > %s
        """,
        (run_id, paused_at),
    )
    row = cur.fetchone()
    return int(row["c"]) if row else 0


def fetch_active_pending_feedback(cur: Any, run_id: str) -> RunRow | None:
    cur.execute(
        """
        SELECT * FROM pending_feedbacks
        WHERE run_id = %s AND cleared_at IS NULL
        ORDER BY ingested_at DESC
        LIMIT 1
        """,
        (run_id,),
    )
    row = cur.fetchone()
    return dict(row) if row else None


def insert_pending_feedback(
    cur: Any,
    *,
    feedback_id: str,
    run_id: str,
    detection_mode: str,
    ingestion_layer: str,
    verdict: str,
    summary: str | None,
    blocking_findings_json: str,
    route_recommendation: str | None,
    raw_text: str | None,
    source_path: str | None,
    confidence: str,
    proposed_action: str,
) -> None:
    cur.execute(
        """
        INSERT INTO pending_feedbacks (
          id, run_id, detection_mode, ingestion_layer, verdict, summary,
          blocking_findings_json, route_recommendation, raw_text, source_path,
          confidence, proposed_action, ingested_at, cleared_at
        ) VALUES (
          %s, %s, %s, %s, %s, %s,
          %s, %s, %s, %s,
          %s, %s, NOW(), NULL
        )
        """,
        (
            feedback_id,
            run_id,
            detection_mode,
            ingestion_layer,
            verdict,
            summary,
            blocking_findings_json,
            route_recommendation,
            raw_text,
            source_path,
            confidence,
            proposed_action,
        ),
    )


def clear_active_pending_feedback(cur: Any, run_id: str) -> datetime | None:
    cur.execute(
        """
        UPDATE pending_feedbacks
        SET cleared_at = NOW()
        WHERE run_id = %s AND cleared_at IS NULL
        RETURNING cleared_at
        """,
        (run_id,),
    )
    row = cur.fetchone()
    if not row:
        return None
    return row["cleared_at"]


def count_events_filtered(cur: Any, wsql: str, params: list[Any]) -> int:
    cur.execute(
        f"SELECT COUNT(*) AS c FROM events e WHERE {wsql}",
        params,
    )
    row = cur.fetchone()
    return int(row["c"]) if row else 0
