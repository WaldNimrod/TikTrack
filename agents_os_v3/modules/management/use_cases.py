"""
Use-case orchestration for AOS v3 (UC-01–UC-16, UC-12 Principal Override).

**Mutations** must go through :func:`agents_os_v3.modules.state.machine.execute_transition`
(``uc_01`` … ``uc_08``) so every state change stays in one DB transaction with ledger rules.

**Reads / handoff**

* ``uc_13_get_current_state`` — Module Map §4.9 + UI §10.7 (``previous_event``,
  ``pending_feedback``, ``next_action``).
* ``uc_14_get_history`` — §4.10 wrapper with ``total`` and structured ``actor``.
* ``uc_15_ingest_feedback`` / ``uc_16_clear_pending_feedback`` — FIP (UI §10.1–10.2).

Portfolio idea authority checks use :func:`can_change_idea_status`.
"""

from __future__ import annotations

import json
import os
import shlex
from typing import Any

from ulid import ULID

from agents_os_v3.modules.audit.ingestion import FeedbackIngestor, IngestSource
from agents_os_v3.modules.audit.sse import notify_feedback_ingested
from agents_os_v3.modules.definitions import constants as C
from agents_os_v3.modules.definitions.event_registry import VALID_EVENT_TYPES
from agents_os_v3.modules.routing.resolver import resolve_actor_team_id
from agents_os_v3.modules.state import machine as M
from agents_os_v3.modules.state import repository as R
from agents_os_v3.modules.state.errors import StateMachineError


def _public_api_base() -> str:
    return (os.environ.get("AOS_V3_PUBLIC_API_BASE") or "http://127.0.0.1:8090").rstrip("/")


def _cli_hdr(actor: str) -> str:
    return f'-H "X-Actor-Team-Id: {actor}" -H "Content-Type: application/json"'


def _iso(v: Any) -> str | None:
    if v is None:
        return None
    if hasattr(v, "isoformat"):
        return v.isoformat().replace("+00:00", "Z")
    return str(v)


def _blocking_count(pending: dict[str, Any] | None) -> int | None:
    if not pending:
        return None
    try:
        arr = json.loads(pending.get("blocking_findings_json") or "[]")
        if isinstance(arr, list):
            return len(arr)
    except json.JSONDecodeError:
        return None
    return None


def _pending_block(pending: dict[str, Any] | None) -> dict[str, Any]:
    if not pending:
        return {
            "has_pending": False,
            "feedback_id": None,
            "verdict": None,
            "confidence": None,
            "proposed_action": None,
            "ingested_at": None,
        }
    return {
        "has_pending": True,
        "feedback_id": str(pending["id"]),
        "verdict": str(pending["verdict"]),
        "confidence": str(pending["confidence"]),
        "proposed_action": str(pending["proposed_action"]),
        "ingested_at": _iso(pending.get("ingested_at")),
    }


def _feedback_record_from_row(row: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": str(row["id"]),
        "run_id": str(row["run_id"]),
        "detection_mode": str(row["detection_mode"]),
        "ingestion_layer": str(row["ingestion_layer"]),
        "verdict": str(row["verdict"]),
        "summary": row.get("summary"),
        "blocking_findings_json": str(row.get("blocking_findings_json") or "[]"),
        "route_recommendation": row.get("route_recommendation"),
        "raw_text": row.get("raw_text"),
        "source_path": row.get("source_path"),
        "confidence": str(row["confidence"]),
        "proposed_action": str(row["proposed_action"]),
        "ingested_at": _iso(row.get("ingested_at")),
        "cleared_at": _iso(row.get("cleared_at")),
    }


def _previous_event_from_row(ev: dict[str, Any] | None) -> dict[str, Any] | None:
    if not ev:
        return None
    return {
        "event_type": str(ev.get("event_type")) if ev.get("event_type") is not None else None,
        "occurred_at": _iso(ev.get("occurred_at")),
        "actor_team_id": str(ev["actor_team_id"]) if ev.get("actor_team_id") else None,
        "gate_id": str(ev["gate_id"]) if ev.get("gate_id") else None,
        "phase_id": str(ev["phase_id"]) if ev.get("phase_id") else None,
        "verdict": str(ev["verdict"]) if ev.get("verdict") else None,
        "reason": str(ev["reason"]) if ev.get("reason") else None,
    }


def _compute_next_action(
    cur: Any,
    row: dict[str, Any],
    pending: dict[str, Any] | None,
    actor_header_team: str,
) -> dict[str, Any]:
    st = str(row["status"])
    rid = str(row["id"])
    cg = str(row["current_gate_id"]) if row.get("current_gate_id") else None
    cp = str(row["current_phase_id"]) if row.get("current_phase_id") else None
    base = _public_api_base()
    actor_cli = resolve_actor_team_id(cur, row) or actor_header_team
    hdr = _cli_hdr(actor_cli)

    if st == "COMPLETE":
        return {
            "type": "IDLE",
            "label": "Run completed.",
            "target_gate": None,
            "target_phase": None,
            "blocking_count": None,
            "cli_command": None,
        }

    if st == "PAUSED":
        body = json.dumps({"resume_notes": ""})
        return {
            "type": "RESUME",
            "label": "Pipeline is paused — Principal may resume.",
            "target_gate": cg,
            "target_phase": cp,
            "blocking_count": None,
            "cli_command": f"curl -sS -X POST {base}/api/runs/{rid}/resume {_cli_hdr(C.TEAM_PRINCIPAL)} -d {shlex.quote(body)}",
        }

    g = R.gate_row(cur, cg) if cg else None
    human = bool(g and int(g.get("is_human_gate") or 0) == 1)

    if st == "IN_PROGRESS" and human:
        body = json.dumps({"approval_notes": ""})
        return {
            "type": "HUMAN_APPROVE",
            "label": "Human gate — Principal approval required.",
            "target_gate": cg,
            "target_phase": cp,
            "blocking_count": None,
            "cli_command": f"curl -sS -X POST {base}/api/runs/{rid}/approve {_cli_hdr(C.TEAM_PRINCIPAL)} -d {shlex.quote(body)}",
        }

    has_p = pending is not None
    pv = str(pending["verdict"]) if pending else None

    if st in ("IN_PROGRESS", "CORRECTION"):
        if not has_p:
            body = json.dumps({"detection_mode": "OPERATOR_NOTIFY"})
            return {
                "type": "AWAIT_FEEDBACK",
                "label": f"Awaiting agent completion at gate {cg} phase {cp}.",
                "target_gate": cg,
                "target_phase": cp,
                "blocking_count": None,
                "cli_command": f"curl -sS -X POST {base}/api/runs/{rid}/feedback {hdr} -d {shlex.quote(body)}",
            }
        if pv == "PASS":
            body = json.dumps(
                {"verdict": "pass", "summary": (pending.get("summary") or "")},
                ensure_ascii=False,
            )
            return {
                "type": "CONFIRM_ADVANCE",
                "label": "Feedback PASS — confirm advance.",
                "target_gate": cg,
                "target_phase": cp,
                "blocking_count": None,
                "cli_command": f"curl -sS -X POST {base}/api/runs/{rid}/advance {hdr} -d {shlex.quote(body)}",
            }
        if pv == "FAIL":
            body = json.dumps({"reason": "Blocking findings from feedback", "findings": []})
            return {
                "type": "CONFIRM_FAIL",
                "label": "Feedback FAIL — confirm fail gate.",
                "target_gate": cg,
                "target_phase": cp,
                "blocking_count": _blocking_count(pending),
                "cli_command": f"curl -sS -X POST {base}/api/runs/{rid}/fail {hdr} -d {shlex.quote(body)}",
            }
        return {
            "type": "MANUAL_REVIEW",
            "label": "PENDING_REVIEW or low confidence — choose pass or fail manually.",
            "target_gate": cg,
            "target_phase": cp,
            "blocking_count": _blocking_count(pending),
            "cli_command": None,
        }

    return {
        "type": "IDLE",
        "label": "No operator action.",
        "target_gate": cg,
        "target_phase": cp,
        "blocking_count": None,
        "cli_command": None,
    }


def _assemble_state_body(
    cur: Any,
    row: dict[str, Any],
    *,
    actor_header_team: str,
) -> dict[str, Any]:
    rid = str(row["id"])
    st = str(row["status"])
    actor: dict[str, str] | None = None
    if st != "PAUSED":
        cur.execute(
            """
            SELECT DISTINCT ON (a.role_id)
              t.id AS team_id, t.label AS team_label, t.engine AS team_engine
            FROM assignments a
            JOIN pipeline_roles pr ON pr.id = a.role_id
            JOIN teams t ON t.id = a.team_id
            WHERE a.work_package_id = %s AND a.domain_id = %s AND a.status = 'ACTIVE'
            ORDER BY a.role_id, a.assigned_at DESC
            """,
            (str(row["work_package_id"]), str(row["domain_id"])),
        )
        actor_row = cur.fetchone()
        if actor_row:
            actor = {
                "team_id": str(actor_row["team_id"]),
                "label": str(actor_row["team_label"]),
                "engine": str(actor_row["team_engine"]),
            }

    lod = row.get("lod200_author_team")
    if lod:
        sentinel: dict[str, Any] = {"active": True, "override_team": str(lod)}
    else:
        sentinel = {"active": False, "override_team": None}

    pending = R.fetch_active_pending_feedback(cur, rid)
    ev = R.fetch_latest_event(cur, rid)
    prev_ev = _previous_event_from_row(dict(ev) if ev else None)

    return {
        "run_id": rid,
        "work_package_id": str(row["work_package_id"]),
        "domain_id": str(row["domain_id"]),
        "process_variant": str(row["process_variant"]),
        "status": st,
        "current_gate_id": str(row["current_gate_id"]) if row.get("current_gate_id") else None,
        "current_phase_id": str(row["current_phase_id"]) if row.get("current_phase_id") else None,
        "correction_cycle_count": int(row["correction_cycle_count"]),
        "paused_at": _iso(row.get("paused_at")),
        "completed_at": _iso(row.get("completed_at")),
        "started_at": _iso(row.get("started_at")),
        "last_updated": _iso(row.get("last_updated")),
        "actor": actor,
        "sentinel": sentinel,
        "execution_mode": str(row["execution_mode"]) if row.get("execution_mode") else None,
        "previous_event": prev_ev,
        "pending_feedback": _pending_block(pending),
        "next_action": _compute_next_action(cur, row, pending, actor_header_team),
    }


def uc_01_initiate_run(
    conn: Any,
    *,
    actor_team_id: str,
    work_package_id: str,
    domain_id: str,
    process_variant: str | None,
) -> dict[str, Any]:
    _ = actor_team_id
    summary, _ev = M.execute_transition(
        conn,
        transition=C.TRANS_INITIATE,
        actor_team_id=actor_team_id,
        payload={
            "work_package_id": work_package_id,
            "domain_id": domain_id,
            "process_variant": process_variant,
        },
    )
    return summary


def uc_02_advance_run(
    conn: Any,
    *,
    actor_team_id: str,
    run_id: str,
    verdict: str,
    summary: str | None,
    feedback_json: dict[str, Any] | None = None,
) -> dict[str, Any]:
    pl: dict[str, Any] = {"verdict": verdict, "summary": summary}
    if feedback_json is not None:
        pl["feedback_json"] = feedback_json
    out, _ev = M.execute_transition(
        conn,
        transition=C.TRANS_ADVANCE,
        actor_team_id=actor_team_id,
        run_id=run_id,
        payload=pl,
    )
    return out


def uc_03_fail_gate(
    conn: Any,
    *,
    actor_team_id: str,
    run_id: str,
    reason: str,
    findings: list[dict[str, Any]] | None,
) -> dict[str, Any]:
    out, _ev = M.execute_transition(
        conn,
        transition=C.TRANS_FAIL,
        actor_team_id=actor_team_id,
        run_id=run_id,
        payload={"reason": reason, "findings": findings},
    )
    return out


def uc_06_approve_gate(
    conn: Any,
    *,
    actor_team_id: str,
    run_id: str,
    approval_notes: str | None,
) -> dict[str, Any]:
    out, _ev = M.execute_transition(
        conn,
        transition=C.TRANS_APPROVE_GATE,
        actor_team_id=actor_team_id,
        run_id=run_id,
        payload={"approval_notes": approval_notes},
    )
    return out


def uc_07_pause_run(
    conn: Any,
    *,
    actor_team_id: str,
    run_id: str,
    pause_reason: str,
) -> dict[str, Any]:
    out, _ev = M.execute_transition(
        conn,
        transition=C.TRANS_PAUSE,
        actor_team_id=actor_team_id,
        run_id=run_id,
        payload={"pause_reason": pause_reason},
    )
    return out


def uc_08_resume_run(
    conn: Any,
    *,
    actor_team_id: str,
    run_id: str,
    resume_notes: str | None,
) -> dict[str, Any]:
    out, _ev = M.execute_transition(
        conn,
        transition=C.TRANS_RESUME,
        actor_team_id=actor_team_id,
        run_id=run_id,
        payload={"resume_notes": resume_notes},
    )
    return out


def uc_12_principal_override(
    conn: Any,
    *,
    actor_team_id: str,
    run_id: str,
    action: str,
    reason: str,
    snapshot: dict[str, Any] | None,
) -> dict[str, Any]:
    """UC-12 — Module Map §4.8."""
    return M.principal_override_run(
        conn,
        run_id=run_id,
        actor_team_id=actor_team_id,
        action=action.strip(),
        reason=reason,
        snapshot=snapshot,
    )


def uc_13_get_current_state(
    conn: Any,
    *,
    run_id: str | None,
    domain_id: str | None,
    actor_header_team: str = C.ORCHESTRATOR_TEAM_ID,
) -> dict[str, Any]:
    """UC-13 — Module Map §4.9 + UI §10.7 (Operator Handoff fields)."""
    if not run_id and not domain_id:
        raise StateMachineError(
            "INVALID_HISTORY_PARAMS",
            400,
            details={"need": "run_id or domain_id"},
        )

    with conn.cursor() as cur:
        row: dict[str, Any] | None
        if run_id:
            row = R.fetch_run(cur, run_id)
            if not row:
                raise StateMachineError("RUN_NOT_FOUND", 404, details={"run_id": run_id})
        else:
            assert domain_id is not None
            cur.execute(
                """
                SELECT * FROM runs
                WHERE domain_id = %s AND status IN ('IN_PROGRESS','CORRECTION','PAUSED')
                ORDER BY last_updated DESC
                LIMIT 1
                """,
                (domain_id,),
            )
            r = cur.fetchone()
            row = dict(r) if r else None
            if not row:
                return {
                    "run_id": None,
                    "work_package_id": None,
                    "domain_id": domain_id,
                    "process_variant": None,
                    "status": "IDLE",
                    "current_gate_id": None,
                    "current_phase_id": None,
                    "correction_cycle_count": 0,
                    "paused_at": None,
                    "completed_at": None,
                    "started_at": None,
                    "last_updated": None,
                    "actor": None,
                    "sentinel": {"active": False, "override_team": None},
                    "execution_mode": None,
                    "previous_event": None,
                    "pending_feedback": _pending_block(None),
                    "next_action": {
                        "type": "IDLE",
                        "label": "No active run for this domain.",
                        "target_gate": None,
                        "target_phase": None,
                        "blocking_count": None,
                        "cli_command": None,
                    },
                }

        return _assemble_state_body(cur, row, actor_header_team=actor_header_team)


def uc_14_get_history(
    conn: Any,
    *,
    run_id: str | None,
    domain_id: str | None,
    gate_id: str | None,
    event_type: str | None,
    actor_team_id: str | None,
    limit: int,
    offset: int,
    order: str = "desc",
) -> dict[str, Any]:
    if limit < 1 or limit > 200:
        raise StateMachineError("INVALID_LIMIT", 400, details={"limit": limit})
    if offset < 0:
        raise StateMachineError("INVALID_HISTORY_PARAMS", 400, details={"offset": offset})
    o = order.lower()
    if o not in ("asc", "desc"):
        raise StateMachineError("INVALID_HISTORY_PARAMS", 400, details={"order": order})
    if event_type is not None and event_type not in VALID_EVENT_TYPES:
        raise StateMachineError(
            "INVALID_EVENT_TYPE",
            400,
            details={"event_type": event_type},
        )

    conds: list[str] = ["1=1"]
    filter_params: list[Any] = []
    if run_id is not None:
        conds.append("e.run_id = %s")
        filter_params.append(run_id)
    # domain_id: deferred — resolved inside cursor via resolve_domain_id
    if gate_id is not None:
        conds.append("e.gate_id = %s")
        filter_params.append(gate_id)
    if event_type is not None:
        conds.append("e.event_type = %s")
        filter_params.append(event_type)
    if actor_team_id is not None:
        conds.append("e.actor_team_id = %s")
        filter_params.append(actor_team_id)
    ord_sql = "ASC" if o == "asc" else "DESC"

    with conn.cursor() as cur:
        if domain_id is not None:
            domain_ulid = R.resolve_domain_id(cur, domain_id)
            conds.append("e.domain_id = %s")
            filter_params.append(domain_ulid)
        wsql = " AND ".join(conds)
        total = R.count_events_filtered(cur, wsql, list(filter_params))
        cur.execute(
            f"""
            SELECT e.id, e.run_id, e.sequence_no, e.event_type, e.gate_id, e.phase_id, e.domain_id,
                   e.work_package_id, e.actor_team_id, e.actor_type, e.verdict, e.reason,
                   e.payload_json, e.occurred_at, t.label AS actor_label
            FROM events e
            LEFT JOIN teams t ON t.id = e.actor_team_id
            WHERE {wsql}
            ORDER BY e.sequence_no {ord_sql}, e.occurred_at {ord_sql}
            LIMIT %s OFFSET %s
            """,
            [*filter_params, limit, offset],
        )
        rows = cur.fetchall() or []

    events_out: list[dict[str, Any]] = []
    for r in rows:
        d = dict(r)
        occurred = d.get("occurred_at")
        if occurred is not None and hasattr(occurred, "isoformat"):
            occurred = occurred.isoformat().replace("+00:00", "Z")
        raw_payload = d.get("payload_json")
        pj: Any = None
        if raw_payload is not None:
            if isinstance(raw_payload, (dict, list)):
                pj = raw_payload
            else:
                try:
                    pj = json.loads(str(raw_payload))
                except json.JSONDecodeError:
                    pj = None
        aid = d.get("actor_team_id")
        alabel = d.get("actor_label")
        events_out.append(
            {
                "id": str(d["id"]),
                "run_id": str(d["run_id"]),
                "sequence_no": int(d["sequence_no"]),
                "event_type": str(d["event_type"]),
                "gate_id": str(d["gate_id"]) if d.get("gate_id") else None,
                "phase_id": str(d["phase_id"]) if d.get("phase_id") else None,
                "domain_id": str(d["domain_id"]),
                "work_package_id": str(d["work_package_id"]),
                "actor": {
                    "team_id": str(aid) if aid else None,
                    "label": str(alabel) if alabel else None,
                    "type": str(d["actor_type"]) if d.get("actor_type") else None,
                },
                "verdict": str(d["verdict"]) if d.get("verdict") else None,
                "reason": str(d["reason"]) if d.get("reason") else None,
                "payload_json": pj,
                "occurred_at": occurred,
            }
        )

    return {"total": total, "limit": limit, "offset": offset, "events": events_out}


def uc_15_ingest_feedback(
    conn: Any,
    *,
    actor_team_id: str,
    run_id: str,
    detection_mode: str,
    file_path: str | None,
    raw_text: str | None,
) -> dict[str, Any]:
    """POST /api/runs/{run_id}/feedback — UI §10.1."""
    ing = FeedbackIngestor()
    fid = str(ULID())
    domain_id: str | None = None

    with conn:
        with conn.cursor() as cur:
            run = R.fetch_run(cur, run_id)
            if not run:
                raise StateMachineError("RUN_NOT_FOUND", 404, details={"run_id": run_id})
            domain_id = str(run["domain_id"])
            st = str(run["status"])
            if st not in ("IN_PROGRESS", "CORRECTION"):
                raise StateMachineError(
                    "INVALID_STATE",
                    409,
                    details={"status": st, "run_id": run_id},
                )
            if R.fetch_active_pending_feedback(cur, run_id):
                raise StateMachineError(
                    "FEEDBACK_ALREADY_INGESTED",
                    409,
                    details={"run_id": run_id},
                )

            path_team = resolve_actor_team_id(cur, run)
            if not path_team:
                raise StateMachineError(
                    "ROUTING_UNRESOLVED",
                    500,
                    details={"run_id": run_id, "hint": "actor_team_for_mode_b"},
                )

            src = IngestSource(
                run_id=run_id,
                gate_id=str(run["current_gate_id"]),
                team_id=path_team,
                wp_id=str(run["work_package_id"]),
                detection_mode=detection_mode,
                file_path=file_path,
                raw_text=raw_text,
            )
            try:
                rec = ing.ingest(src, run_started_at=run.get("started_at"))
            except FileNotFoundError as e:
                raise StateMachineError(
                    "FILE_NOT_FOUND",
                    404,
                    details={"path": str(e)},
                ) from e
            except ValueError as e:
                raise StateMachineError(
                    "INVALID_ACTION",
                    400,
                    details={"message": str(e)},
                ) from e

            if rec.get("_fallback_required"):
                body = _assemble_state_body(cur, run, actor_header_team=actor_team_id)
                return {
                    "feedback_record": {
                        "id": None,
                        "run_id": run_id,
                        "detection_mode": detection_mode,
                        "ingestion_layer": str(rec["ingestion_layer"]),
                        "verdict": str(rec["verdict"]),
                        "summary": rec.get("summary"),
                        "blocking_findings_json": str(rec["blocking_findings_json"]),
                        "route_recommendation": rec.get("route_recommendation"),
                        "raw_text": rec.get("raw_text"),
                        "source_path": rec.get("source_path"),
                        "confidence": str(rec["confidence"]),
                        "proposed_action": str(rec["proposed_action"]),
                        "ingested_at": None,
                        "cleared_at": None,
                    },
                    "fallback_required": True,
                    "next_action": body["next_action"],
                }

            R.insert_pending_feedback(
                cur,
                feedback_id=fid,
                run_id=run_id,
                detection_mode=str(rec["detection_mode"]),
                ingestion_layer=str(rec["ingestion_layer"]),
                verdict=str(rec["verdict"]),
                summary=rec.get("summary"),
                blocking_findings_json=str(rec["blocking_findings_json"]),
                route_recommendation=rec.get("route_recommendation"),
                raw_text=rec.get("raw_text"),
                source_path=rec.get("source_path"),
                confidence=str(rec["confidence"]),
                proposed_action=str(rec["proposed_action"]),
            )
            row = R.fetch_active_pending_feedback(cur, run_id)
            assert row
            na = _compute_next_action(cur, run, row, actor_team_id)
            out = {
                "feedback_record": _feedback_record_from_row(row),
                "fallback_required": False,
                "next_action": na,
            }

    assert domain_id is not None
    notify_feedback_ingested(
        run_id,
        domain_id,
        fid,
        str(row["verdict"]),
        str(row["confidence"]),
        str(row["proposed_action"]),
    )
    return out


def uc_16_clear_pending_feedback(conn: Any, *, run_id: str) -> dict[str, Any]:
    """POST /api/runs/{run_id}/feedback/clear — UI §10.2."""
    with conn:
        with conn.cursor() as cur:
            run = R.fetch_run(cur, run_id)
            if not run:
                raise StateMachineError("RUN_NOT_FOUND", 404, details={"run_id": run_id})
            cleared_at = R.clear_active_pending_feedback(cur, run_id)
            if cleared_at is None:
                raise StateMachineError(
                    "NO_PENDING_FEEDBACK",
                    404,
                    details={"run_id": run_id},
                )
            iso = cleared_at.isoformat().replace("+00:00", "Z") if hasattr(cleared_at, "isoformat") else str(cleared_at)
    return {"cleared": True, "cleared_at": iso}


def can_change_idea_status(cur: Any, caller_team_id: str) -> bool:
    if caller_team_id == C.TEAM_PRINCIPAL:
        return True
    return R.has_active_assignment_for_role(cur, caller_team_id, C.IDEA_STATUS_AUTHORITY_ROLE_ID)