"""Shared helpers for Module Map integration TC-01..TC-14 (Remediation Phase 2.1)."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any
from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from ulid import ULID

from agents_os_v3.modules.audit.ledger import AuditLedgerError, append_event
from agents_os_v3.modules.routing.resolver import resolve_actor_team_id
from agents_os_v3.modules.state import machine as M
from agents_os_v3.modules.state.errors import StateMachineError

ORCH_ROLE_ID = "01JK8AOSV3ROLE0000000001"

# Gates/phases after GATE_0 on the linear TRACK_FULL seed path (definition.yaml).
LINEAR_TRACK_GATES_PHASES: list[tuple[str, str]] = [
    ("GATE_1", "1.1"),
    ("GATE_2", "2.1"),
    ("GATE_3", "3.1"),
    ("GATE_4", "4.1"),
    ("GATE_5", "5.1"),
]


def insert_linear_track_routing_rules(conn: Any, domain_id: str) -> list[str]:
    """Seed routing_rules for GATE_1..GATE_5 so advances past GATE_0 resolve (returns new rule ids)."""
    ids: list[str] = []
    with conn.cursor() as cur:
        for gate_id, phase_id in LINEAR_TRACK_GATES_PHASES:
            rid = str(ULID())
            ids.append(rid)
            cur.execute(
                """
                INSERT INTO routing_rules (
                  id, gate_id, phase_id, domain_id, variant, role_id, priority, resolve_from_state_key, created_at
                ) VALUES (%s, %s, %s, %s, NULL, %s, 10, NULL, NOW())
                """,
                (rid, gate_id, phase_id, domain_id, ORCH_ROLE_ID),
            )
    conn.commit()
    return ids


def delete_routing_rules_by_ids(conn: Any, rule_ids: list[str]) -> None:
    if not rule_ids:
        return
    with conn.cursor() as cur:
        for rid in rule_ids:
            cur.execute("DELETE FROM routing_rules WHERE id = %s", (rid,))
    conn.commit()


def hdr(team_id: str) -> dict[str, str]:
    return {"X-Actor-Team-Id": team_id}


def http_feedback_pass(client: TestClient, run_id: str, actor: str = "team_10") -> None:
    body = """```json
{"verdict": "PASS", "summary": "tc module map"}
```
"""
    r = client.post(
        f"/api/runs/{run_id}/feedback",
        headers=hdr(actor),
        json={"detection_mode": "RAW_PASTE", "raw_text": body},
    )
    assert r.status_code == 200, r.text


def http_advance_pass(client: TestClient, run_id: str, actor: str = "team_10") -> dict[str, Any]:
    r = client.post(
        f"/api/runs/{run_id}/advance",
        headers=hdr(actor),
        json={"verdict": "pass"},
    )
    assert r.status_code == 200, r.text
    return r.json()


def http_clear_pending_feedback(client: TestClient, run_id: str, actor: str = "team_10") -> None:
    """Clear Mode B/C/D pending row after advance so the next phase can ingest new feedback."""
    r = client.post(f"/api/runs/{run_id}/feedback/clear", headers=hdr(actor))
    assert r.status_code == 200, r.text


def drive_from_0_1_to_4_1(client: TestClient, run_id: str) -> None:
    """Five pass cycles: 0.1→0.2→1.1→2.1→3.1→4.1 (human gate)."""
    for _ in range(5):
        http_feedback_pass(client, run_id)
        http_advance_pass(client, run_id)
        http_clear_pending_feedback(client, run_id)


def assert_ad_s7_01_atomic_rollback(conn: Any, domain_id: str) -> None:
    """AD-S7-01 / TC-09 — advance rolls back when ledger append fails."""
    from .gate2_db_helpers import clear_in_progress_runs_for_domain, insert_temp_wp, purge_work_package

    clear_in_progress_runs_for_domain(conn, domain_id)
    wp = insert_temp_wp(conn, domain_id)
    try:
        started = M.initiate_run(conn, work_package_id=wp, domain_id=domain_id, process_variant=None)
        rid = str(started["run_id"])
        with conn.cursor() as cur:
            cur.execute(
                "SELECT current_gate_id, current_phase_id, status FROM runs WHERE id = %s",
                (rid,),
            )
            before = dict(cur.fetchone())

        with patch(
            "agents_os_v3.modules.state.machine.append_event",
            side_effect=AuditLedgerError("forced ledger fail"),
        ):
            with pytest.raises(StateMachineError) as ei:
                M.advance_run(
                    conn,
                    run_id=rid,
                    actor_team_id="team_10",
                    verdict="pass",
                    summary=None,
                )
            assert ei.value.code == "AUDIT_LEDGER_ERROR"

        with conn.cursor() as cur:
            cur.execute(
                "SELECT current_gate_id, current_phase_id, status FROM runs WHERE id = %s",
                (rid,),
            )
            after = dict(cur.fetchone())
        assert after["current_gate_id"] == before["current_gate_id"]
        assert after["current_phase_id"] == before["current_phase_id"]
        assert after["status"] == before["status"]
    finally:
        purge_work_package(conn, wp)


def assert_tc07_sentinel_bypass_resolver() -> None:
    """TC-07 — SENTINEL_LEGACY: lod200_author_team wins; assignment lookup skipped."""
    cur = MagicMock()
    cur.fetchone.return_value = {
        "resolve_from_state_key": "lod200_author_team",
        "role_id": ORCH_ROLE_ID,
    }
    run = {
        "status": "IN_PROGRESS",
        "current_gate_id": "GATE_2",
        "domain_id": "01JK8AOSV3DOMAIN00000001",
        "current_phase_id": "2.1",
        "work_package_id": "01JK8AOSV3WP0000000001",
        "process_variant": "TRACK_FULL",
        "lod200_author_team": "team_111",
    }
    with patch("agents_os_v3.modules.routing.resolver.R.assignment_for_role") as m_asg:
        out = resolve_actor_team_id(cur, run)
    assert out == "team_111"
    m_asg.assert_not_called()


def insert_blocking_authority_for_gate0(conn: Any, *, domain_id: str, gra_id: str) -> int:
    """Enable blocking fail for orchestrator at GATE_0/0.1; returns previous can_block_gate."""
    with conn.cursor() as cur:
        cur.execute(
            "SELECT can_block_gate FROM pipeline_roles WHERE id = %s",
            (ORCH_ROLE_ID,),
        )
        row = cur.fetchone()
        prev_block = int(row["can_block_gate"]) if row else 0
        cur.execute(
            """
            UPDATE pipeline_roles SET can_block_gate = 1 WHERE id = %s
            """,
            (ORCH_ROLE_ID,),
        )
        cur.execute(
            """
            INSERT INTO gate_role_authorities (
              id, gate_id, phase_id, domain_id, role_id, may_block_verdict, created_at
            ) VALUES (%s, 'GATE_0', '0.1', %s, %s, 1, NOW())
            """,
            (gra_id, domain_id, ORCH_ROLE_ID),
        )
    conn.commit()
    return prev_block


def restore_pipeline_role_block_and_delete_gra(
    conn: Any, *, gra_id: str, prev_can_block: int
) -> None:
    with conn.cursor() as cur:
        cur.execute("DELETE FROM gate_role_authorities WHERE id = %s", (gra_id,))
        cur.execute(
            "UPDATE pipeline_roles SET can_block_gate = %s WHERE id = %s",
            (prev_can_block, ORCH_ROLE_ID),
        )
    conn.commit()


def seed_extra_phase_passed_events(
    conn: Any,
    *,
    run_id: str,
    work_package_id: str,
    domain_id: str,
    count: int,
    start_seq: int = 2,
) -> None:
    """Append synthetic PHASE_PASSED rows for history pagination (TC-13)."""
    now_base = datetime.now(timezone.utc)
    with conn:
        with conn.cursor() as cur:
            for i in range(count):
                seq = start_seq + i
                ev_id = str(ULID())
                append_event(
                    cur,
                    event_id=ev_id,
                    run_id=run_id,
                    sequence_no=seq,
                    event_type="PHASE_PASSED",
                    gate_id="GATE_1",
                    phase_id="1.1",
                    domain_id=domain_id,
                    work_package_id=work_package_id,
                    actor_team_id="team_10",
                    actor_type="AGENT",
                    verdict="PASS",
                    reason=None,
                    payload={"synthetic": True, "i": i},
                    occurred_at=now_base,
                )
    conn.commit()
