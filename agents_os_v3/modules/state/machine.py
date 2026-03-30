"""
Pipeline state machine — run lifecycle and audit events (IR-8).

Each public mutator (``initiate_run``, ``advance_run``, ``fail_run``, ``approve_run``,
``pause_run``, ``resume_run``) runs work inside a single ``with conn:`` transaction,
persists ``events`` via :mod:`agents_os_v3.modules.audit.ledger`, then calls
``sync_pipeline_state`` and :func:`agents_os_v3.modules.audit.sse.notify_after_run_mutation`
**after** commit.

:func:`execute_transition` is the single entry used by :mod:`agents_os_v3.modules.management.use_cases`
for INITIATE / ADVANCE / FAIL / APPROVE_GATE / PAUSE / RESUME.
"""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import jsonschema
import ulid as _ulid_mod

def ULID() -> object:  # noqa: N802
    """Compat shim: works with both ulid-py 1.x (ulid.new()) and python-ulid 3.x (ULID()).

    api/venv uses ulid-py 1.x → ulid.new(); system Python / test venv uses python-ulid 3.x →
    ulid.ULID(). Try both so the code runs in either environment without import-time detection.
    """
    try:
        return _ulid_mod.new()  # ulid-py 1.x (api/venv)
    except AttributeError:
        return _ulid_mod.ULID()  # python-ulid 3.x (system Python / test venv)

from agents_os_v3.modules.audit.ledger import AuditLedgerError, append_event
from agents_os_v3.modules.audit.ingestion import FeedbackIngestor, IngestSource
from agents_os_v3.modules.audit.sse import notify_after_run_mutation
from agents_os_v3.modules.definitions import constants as C
from agents_os_v3.modules.routing.resolver import resolve_actor_team_id
from agents_os_v3.modules.state import repository as R
from agents_os_v3.modules.state.errors import StateMachineError

PIPELINE_STATE_PATH = Path(__file__).resolve().parents[2] / "pipeline_state.json"


def _merge_pipeline_state(domain_id: str, snapshot: dict[str, Any]) -> None:
    PIPELINE_STATE_PATH.parent.mkdir(parents=True, exist_ok=True)
    data: dict[str, Any] = {}
    if PIPELINE_STATE_PATH.is_file():
        data = json.loads(PIPELINE_STATE_PATH.read_text(encoding="utf-8"))
    data[domain_id] = snapshot
    PIPELINE_STATE_PATH.write_text(
        json.dumps(data, indent=2, sort_keys=True, default=str) + "\n",
        encoding="utf-8",
    )


def _team_for_role(role_id: str) -> str:
    if role_id == C.ORCHESTRATOR_ROLE_ID:
        return C.ORCHESTRATOR_TEAM_ID
    return C.TEAM_PRINCIPAL


def _assert_g02(
    cur: Any,
    *,
    work_package_id: str,
    actor_team_id: str,
    current_gate_id: str,
    domain_id: str,
    current_phase_id: str | None,
) -> dict[str, Any]:
    rule = R.resolve_routing_rule(cur, current_gate_id, domain_id, current_phase_id)
    if not rule:
        raise StateMachineError("ROUTING_UNRESOLVED", 500, details={"gate_id": current_gate_id})
    role_id = str(rule["role_id"])
    asg = R.assignment_for_role(cur, work_package_id, role_id)
    if not asg or str(asg["team_id"]) != actor_team_id:
        raise StateMachineError(
            "WRONG_ACTOR",
            403,
            details={"expected_role_id": role_id, "actor_team_id": actor_team_id},
        )
    return rule


def _emit(
    cur: Any,
    *,
    run: dict[str, Any],
    event_type: str,
    actor_team_id: str | None,
    actor_type: str,
    verdict: str | None,
    reason: str | None,
    payload: dict[str, Any],
) -> str:
    run_id = str(run["id"])
    seq = R.next_event_seq(cur, run_id)
    now = R.utc_now()
    ev_id = str(ULID())
    try:
        append_event(
            cur,
            event_id=ev_id,
            run_id=run_id,
            sequence_no=seq,
            event_type=event_type,
            gate_id=str(run["current_gate_id"]) if run.get("current_gate_id") else None,
            phase_id=str(run["current_phase_id"]) if run.get("current_phase_id") else None,
            domain_id=str(run["domain_id"]),
            work_package_id=str(run["work_package_id"]),
            actor_team_id=actor_team_id,
            actor_type=actor_type,
            verdict=verdict,
            reason=reason,
            payload=payload,
            occurred_at=now,
        )
    except AuditLedgerError as e:
        raise StateMachineError(
            "AUDIT_LEDGER_ERROR",
            500,
            details={"reason": str(e)},
        ) from e
    return ev_id


def sync_pipeline_state(conn: Any, run_id: str) -> None:
    with conn.cursor() as cur:
        run = R.fetch_run(cur, run_id)
        if not run:
            return
        actor_team_id: str | None = None
        if str(run["status"]) in ("IN_PROGRESS", "CORRECTION"):
            actor_team_id = resolve_actor_team_id(cur, run)
        snap = {
            "run_id": str(run["id"]),
            "work_package_id": str(run["work_package_id"]),
            "status": str(run["status"]),
            "current_gate_id": str(run["current_gate_id"]),
            "current_phase_id": str(run["current_phase_id"]) if run.get("current_phase_id") else None,
            "actor_team_id": actor_team_id,
            "last_updated": R.utc_now().astimezone(timezone.utc).isoformat().replace("+00:00", "Z"),
        }
    _merge_pipeline_state(str(run["domain_id"]), snap)


def initiate_run(conn: Any, *, work_package_id: str, domain_id: str, process_variant: str | None) -> dict[str, Any]:
    run_id: str = ""
    gate0 = "GATE_0"
    first_phase: str | None = None
    with conn:
        with conn.cursor() as cur:
            if not R.principal_row_exists(cur):
                raise StateMachineError("D03_VIOLATION", 500, details={"missing": "team_00"})
            dom = R.fetch_domain(cur, domain_id)
            if not dom:
                raise StateMachineError("DOMAIN_NOT_FOUND", 400, details={"domain_id": domain_id})
            domain_id = str(dom["id"])  # resolve slug → canonical ULID for all downstream FK refs
            if int(dom["is_active"]) != 1:
                raise StateMachineError("DOMAIN_INACTIVE", 400, details={"domain_id": domain_id})
            active = R.in_progress_run_for_domain(cur, domain_id)
            if active:
                raise StateMachineError(
                    "DOMAIN_ALREADY_ACTIVE",
                    409,
                    details={"existing_run_id": str(active["id"]), "status": str(active["status"])},
                )
            wp = R.fetch_work_package(cur, work_package_id)
            if not wp:
                raise StateMachineError("UNKNOWN_WP", 400, details={"work_package_id": work_package_id})
            gate0 = "GATE_0"
            rule = R.resolve_routing_rule(cur, gate0, domain_id, None)
            if not rule:
                raise StateMachineError("ROUTING_UNRESOLVED", 500, details={"gate_id": gate0})
            first_phase = R.first_phase_for_gate(cur, gate0)
            if not first_phase:
                raise StateMachineError("PHASE_SEQUENCE_ERROR", 500, details={"gate_id": gate0})
            pv = process_variant or str(dom["default_variant"])
            run_id = str(ULID())
            now = R.utc_now()
            role_id = str(rule["role_id"])
            team_id = _team_for_role(role_id)
            R.insert_run(
                cur,
                run_id=run_id,
                work_package_id=work_package_id,
                domain_id=domain_id,
                process_variant=pv,
                current_gate_id=gate0,
                current_phase_id=first_phase,
                started_at=now,
            )
            R.update_work_package_linked_run(cur, work_package_id, run_id)
            R.insert_assignment(
                cur,
                assignment_id=str(ULID()),
                work_package_id=work_package_id,
                domain_id=domain_id,
                role_id=role_id,
                team_id=team_id,
                assigned_at=now,
            )
            run = R.fetch_run(cur, run_id)
            assert run
            _emit(
                cur,
                run=run,
                event_type="RUN_INITIATED",
                actor_team_id=None,
                actor_type=C.ACTOR_TYPE_SYSTEM,
                verdict=None,
                reason=None,
                payload={
                    "work_package_id": work_package_id,
                    "domain_id": domain_id,
                    "process_variant": pv,
                    "current_gate_id": gate0,
                    "current_phase_id": first_phase,
                },
            )
    sync_pipeline_state(conn, run_id)
    notify_after_run_mutation(conn, run_id, "NOT_STARTED")
    return {
        "run_id": run_id,
        "current_gate_id": gate0,
        "current_phase_id": first_phase,
        "status": "IN_PROGRESS",
    }


def advance_run(
    conn: Any,
    *,
    run_id: str,
    actor_team_id: str,
    verdict: str,
    summary: str | None,
    feedback_json: dict[str, Any] | None = None,
) -> dict[str, Any]:
    with conn.cursor() as cur:
        r0 = R.fetch_run(cur, run_id)
    prev_status = str(r0["status"]) if r0 else None

    with conn:
        with conn.cursor() as cur:
            run = R.fetch_run(cur, run_id)
            if not run:
                raise StateMachineError("NOT_FOUND", 404, details={"run_id": run_id})

            if feedback_json is not None:
                if R.fetch_active_pending_feedback(cur, run_id):
                    raise StateMachineError(
                        "FEEDBACK_ALREADY_INGESTED",
                        409,
                        details={"run_id": run_id},
                    )
                ing = FeedbackIngestor()
                src = IngestSource(
                    run_id=run_id,
                    gate_id=str(run["current_gate_id"]),
                    team_id="",
                    wp_id=str(run["work_package_id"]),
                    detection_mode="CANONICAL_AUTO",
                    structured_json=feedback_json,
                )
                rec = ing.ingest(src)
                fid = str(ULID())
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

            if summary is None:
                pf = R.fetch_active_pending_feedback(cur, run_id)
                if pf and pf.get("summary"):
                    summary = str(pf["summary"])

            payload_notes = {"summary": summary} if summary else {}
            st = str(run["status"])
            cg = str(run["current_gate_id"])
            cp = str(run["current_phase_id"]) if run.get("current_phase_id") else None
            wp = str(run["work_package_id"])
            dom = str(run["domain_id"])

            if verdict == "resubmit":
                if st != "CORRECTION":
                    raise StateMachineError("INVALID_STATE", 409, details={"status": st})
                _assert_g02(
                    cur,
                    work_package_id=wp,
                    actor_team_id=actor_team_id,
                    current_gate_id=cg,
                    domain_id=dom,
                    current_phase_id=cp,
                )
                max_c = R.max_correction_cycles(cur)
                cc = int(run["correction_cycle_count"])
                if cc >= max_c:
                    _emit(
                        cur,
                        run=run,
                        event_type="CORRECTION_ESCALATED",
                        actor_team_id=actor_team_id,
                        actor_type=C.ACTOR_TYPE_AGENT,
                        verdict=None,
                        reason=None,
                        payload={"cycle": cc, "max": max_c, **payload_notes},
                    )
                else:
                    R.update_run_position(cur, run_id, status="IN_PROGRESS", last_updated=R.utc_now())
                    run2 = R.fetch_run(cur, run_id)
                    assert run2
                    _emit(
                        cur,
                        run=run2,
                        event_type="CORRECTION_RESUBMITTED",
                        actor_team_id=actor_team_id,
                        actor_type=C.ACTOR_TYPE_AGENT,
                        verdict=None,
                        reason=None,
                        payload=payload_notes,
                    )
            elif st == "IN_PROGRESS" and verdict == "pass":
                _assert_g02(cur, work_package_id=wp, actor_team_id=actor_team_id, current_gate_id=cg, domain_id=dom, current_phase_id=cp)
                if not cp:
                    raise StateMachineError("INVALID_STATE", 409, details={"phase": None})
                if R.is_terminal_position(cur, cg, cp):
                    now = R.utc_now()
                    R.update_run_position(
                        cur,
                        run_id,
                        status="COMPLETE",
                        completed_at=now,
                        paused_routing_snapshot_json=None,
                        last_updated=now,
                    )
                    run2 = R.fetch_run(cur, run_id)
                    assert run2
                    _emit(
                        cur,
                        run=run2,
                        event_type="RUN_COMPLETED",
                        actor_team_id=actor_team_id,
                        actor_type=C.ACTOR_TYPE_AGENT,
                        verdict="PASS",
                        reason=None,
                        payload={"work_package_id": wp, "domain_id": dom, **payload_notes},
                    )
                else:
                    ng, np = R.next_gate_phase(cur, cg, cp)
                    if not ng or not np:
                        raise StateMachineError("PHASE_SEQUENCE_ERROR", 500, details={"from_gate": cg, "from_phase": cp})
                    R.update_run_position(
                        cur,
                        run_id,
                        current_gate_id=ng,
                        current_phase_id=np,
                        last_updated=R.utc_now(),
                    )
                    run2 = R.fetch_run(cur, run_id)
                    assert run2
                    _emit(
                        cur,
                        run=run,
                        event_type="PHASE_PASSED",
                        actor_team_id=actor_team_id,
                        actor_type=C.ACTOR_TYPE_AGENT,
                        verdict="PASS",
                        reason=None,
                        payload={
                            "from_gate_id": cg,
                            "from_phase_id": cp,
                            "to_gate_id": ng,
                            "to_phase_id": np,
                            **payload_notes,
                        },
                    )
            elif st == "CORRECTION" and verdict == "pass":
                _assert_g02(cur, work_package_id=wp, actor_team_id=actor_team_id, current_gate_id=cg, domain_id=dom, current_phase_id=cp)
                if not cp:
                    raise StateMachineError("INVALID_STATE", 409, details={"phase": None})
                ng, np = R.next_gate_phase(cur, cg, cp)
                if not ng or not np:
                    raise StateMachineError("PHASE_SEQUENCE_ERROR", 500, details={"from_gate": cg, "from_phase": cp})
                R.update_run_position(
                    cur,
                    run_id,
                    status="IN_PROGRESS",
                    current_gate_id=ng,
                    current_phase_id=np,
                    last_updated=R.utc_now(),
                )
                run2 = R.fetch_run(cur, run_id)
                assert run2
                _emit(
                    cur,
                    run=run2,
                    event_type="CORRECTION_RESOLVED",
                    actor_team_id=actor_team_id,
                    actor_type=C.ACTOR_TYPE_AGENT,
                    verdict="PASS",
                    reason=None,
                    payload={"to_gate_id": ng, "to_phase_id": np, **payload_notes},
                )
            else:
                raise StateMachineError("INVALID_STATE", 409, details={"status": st, "verdict": verdict})
    sync_pipeline_state(conn, run_id)
    notify_after_run_mutation(conn, run_id, prev_status)
    with conn.cursor() as cur:
        final = R.fetch_run(cur, run_id)
    assert final
    return {
        "run_id": run_id,
        "status": str(final["status"]),
        "current_gate_id": str(final["current_gate_id"]),
        "current_phase_id": str(final["current_phase_id"]) if final.get("current_phase_id") else None,
    }


def fail_run(
    conn: Any,
    *,
    run_id: str,
    actor_team_id: str,
    reason: str,
    findings: list[dict[str, Any]] | None,
) -> dict[str, Any]:
    with conn.cursor() as cur:
        r0 = R.fetch_run(cur, run_id)
    prev_status = str(r0["status"]) if r0 else None

    r = (reason or "").strip()
    if not r:
        raise StateMachineError("MISSING_REASON", 400, details={})
    payload_base: dict[str, Any] = {"findings": findings or [], "reason": r}
    with conn:
        with conn.cursor() as cur:
            run = R.fetch_run(cur, run_id)
            if not run:
                raise StateMachineError("NOT_FOUND", 404, details={"run_id": run_id})
            if str(run["status"]) != "IN_PROGRESS":
                raise StateMachineError("INVALID_STATE", 409, details={"status": str(run["status"])})
            cg = str(run["current_gate_id"])
            cp = str(run["current_phase_id"]) if run.get("current_phase_id") else None
            wp = str(run["work_package_id"])
            dom = str(run["domain_id"])
            rule = _assert_g02(cur, work_package_id=wp, actor_team_id=actor_team_id, current_gate_id=cg, domain_id=dom, current_phase_id=cp)
            role_id = str(rule["role_id"])
            pr = R.pipeline_role(cur, role_id)
            can_block = bool(pr and int(pr["can_block_gate"]) == 1)
            g3 = can_block and R.has_blocking_authority(cur, cg, cp, dom, role_id)
            if g3:
                cc = int(run["correction_cycle_count"]) + 1
                R.update_run_position(
                    cur,
                    run_id,
                    status="CORRECTION",
                    correction_cycle_count=cc,
                    last_updated=R.utc_now(),
                )
                run2 = R.fetch_run(cur, run_id)
                assert run2
                _emit(
                    cur,
                    run=run2,
                    event_type="GATE_FAILED_BLOCKING",
                    actor_team_id=actor_team_id,
                    actor_type=C.ACTOR_TYPE_AGENT,
                    verdict="FAIL",
                    reason=r,
                    payload={**payload_base, "cycle_number": cc},
                )
            else:
                _emit(
                    cur,
                    run=run,
                    event_type="GATE_FAILED_ADVISORY",
                    actor_team_id=actor_team_id,
                    actor_type=C.ACTOR_TYPE_AGENT,
                    verdict="FAIL",
                    reason=r,
                    payload={**payload_base, "advisory": True},
                )
    sync_pipeline_state(conn, run_id)
    notify_after_run_mutation(conn, run_id, prev_status)
    with conn.cursor() as cur:
        final = R.fetch_run(cur, run_id)
    assert final
    return {
        "run_id": run_id,
        "status": str(final["status"]),
        "correction_cycle_count": int(final["correction_cycle_count"]),
        "advisory_logged": str(final["status"]) == "IN_PROGRESS",
    }


def approve_run(conn: Any, *, run_id: str, actor_team_id: str, approval_notes: str | None) -> dict[str, Any]:
    if actor_team_id != C.TEAM_PRINCIPAL:
        raise StateMachineError("INSUFFICIENT_AUTHORITY", 403, details={})
    payload_notes: dict[str, Any] = {}
    if approval_notes:
        payload_notes["approval_notes"] = approval_notes
    with conn.cursor() as cur:
        r0 = R.fetch_run(cur, run_id)
    prev_status = str(r0["status"]) if r0 else None

    with conn:
        with conn.cursor() as cur:
            run = R.fetch_run(cur, run_id)
            if not run:
                raise StateMachineError("NOT_FOUND", 404, details={"run_id": run_id})
            if str(run["status"]) != "IN_PROGRESS":
                raise StateMachineError("INVALID_STATE", 409, details={"status": str(run["status"])})
            cg = str(run["current_gate_id"])
            cp = str(run["current_phase_id"]) if run.get("current_phase_id") else None
            g = R.gate_row(cur, cg)
            if not g or int(g["is_human_gate"]) != 1:
                raise StateMachineError("NOT_HITL_GATE", 400, details={"gate_id": cg})
            wp = str(run["work_package_id"])
            dom = str(run["domain_id"])
            if not cp:
                raise StateMachineError("INVALID_STATE", 409, details={"phase": None})
            ng, np = R.next_gate_phase(cur, cg, cp)
            if not ng or not np:
                raise StateMachineError("PHASE_SEQUENCE_ERROR", 500, details={"from_gate": cg, "from_phase": cp})
            R.update_run_position(
                cur,
                run_id,
                current_gate_id=ng,
                current_phase_id=np,
                last_updated=R.utc_now(),
            )
            run2 = R.fetch_run(cur, run_id)
            assert run2
            _emit(
                cur,
                run=run,
                event_type="GATE_APPROVED",
                actor_team_id=actor_team_id,
                actor_type=C.ACTOR_TYPE_HUMAN,
                verdict="PASS",
                reason=None,
                payload=payload_notes,
            )
    sync_pipeline_state(conn, run_id)
    notify_after_run_mutation(conn, run_id, prev_status)
    with conn.cursor() as cur:
        final = R.fetch_run(cur, run_id)
    assert final
    return {
        "run_id": run_id,
        "current_gate_id": str(final["current_gate_id"]),
        "current_phase_id": str(final["current_phase_id"]) if final.get("current_phase_id") else None,
    }


def pause_run(conn: Any, *, run_id: str, actor_team_id: str, pause_reason: str) -> dict[str, Any]:
    if actor_team_id != C.TEAM_PRINCIPAL:
        raise StateMachineError("INSUFFICIENT_AUTHORITY", 403, details={})
    with conn.cursor() as cur:
        r0 = R.fetch_run(cur, run_id)
    prev_status = str(r0["status"]) if r0 else None

    with conn:
        with conn.cursor() as cur:
            run = R.fetch_run(cur, run_id)
            if not run:
                raise StateMachineError("NOT_FOUND", 404, details={"run_id": run_id})
            if str(run["status"]) != "IN_PROGRESS":
                raise StateMachineError(
                    "INVALID_STATE_TRANSITION",
                    409,
                    details={"status": str(run["status"])},
                )
            now = R.utc_now()
            captured = now.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")
            assigns: dict[str, Any] = {}
            for row in R.active_assignments_for_wp(cur, str(run["work_package_id"])):
                assigns[str(row["role_id"])] = {
                    "assignment_id": str(row["id"]),
                    "team_id": str(row["team_id"]),
                }
            snapshot = {
                "captured_at": captured,
                "gate_id": str(run["current_gate_id"]),
                "phase_id": str(run["current_phase_id"]) if run.get("current_phase_id") else "",
                "assignments": assigns,
            }
            jsonschema.Draft202012Validator(C.PAUSE_SNAPSHOT_SCHEMA).validate(snapshot)
            snap_json = json.dumps(snapshot, sort_keys=True)
            R.update_run_position(
                cur,
                run_id,
                status="PAUSED",
                paused_at=now,
                paused_routing_snapshot_json=snap_json,
                last_updated=now,
            )
            run2 = R.fetch_run(cur, run_id)
            assert run2
            _emit(
                cur,
                run=run2,
                event_type="RUN_PAUSED",
                actor_team_id=actor_team_id,
                actor_type=C.ACTOR_TYPE_HUMAN,
                verdict=None,
                reason=pause_reason,
                payload={"snapshot_captured_at": captured},
            )
    sync_pipeline_state(conn, run_id)
    notify_after_run_mutation(conn, run_id, prev_status)
    with conn.cursor() as cur:
        final = R.fetch_run(cur, run_id)
    assert final
    return {
        "run_id": run_id,
        "status": str(final["status"]),
        "paused_at": final["paused_at"].isoformat() if final.get("paused_at") else None,
    }


def resume_run(conn: Any, *, run_id: str, actor_team_id: str, resume_notes: str | None) -> dict[str, Any]:
    if actor_team_id != C.TEAM_PRINCIPAL:
        raise StateMachineError("INSUFFICIENT_AUTHORITY", 403, details={})
    branch = "A"
    with conn.cursor() as cur:
        r0 = R.fetch_run(cur, run_id)
    prev_status = str(r0["status"]) if r0 else None

    with conn:
        with conn.cursor() as cur:
            run = R.fetch_run(cur, run_id)
            if not run:
                raise StateMachineError("NOT_FOUND", 404, details={"run_id": run_id})
            if str(run["status"]) != "PAUSED":
                raise StateMachineError("INVALID_STATE", 409, details={"status": str(run["status"])})
            snap_raw = run.get("paused_routing_snapshot_json")
            if not snap_raw:
                raise StateMachineError("SNAPSHOT_MISSING", 409, details={})
            paused_at = run["paused_at"]
            if not paused_at:
                raise StateMachineError("SNAPSHOT_MISSING", 409, details={})
            n_changed = R.count_team_assignment_changed_after(cur, run_id, paused_at)
            branch = "B" if n_changed > 0 else "A"
            et = "RUN_RESUMED_WITH_NEW_ASSIGNMENT" if branch == "B" else "RUN_RESUMED"
            now = R.utc_now()
            R.update_run_position(
                cur,
                run_id,
                status="IN_PROGRESS",
                paused_at=None,
                paused_routing_snapshot_json=None,
                last_updated=now,
            )
            run2 = R.fetch_run(cur, run_id)
            assert run2
            payload: dict[str, Any] = {"branch_used": branch}
            if resume_notes:
                payload["resume_notes"] = resume_notes
            _emit(
                cur,
                run=run2,
                event_type=et,
                actor_team_id=actor_team_id,
                actor_type=C.ACTOR_TYPE_HUMAN,
                verdict=None,
                reason=None,
                payload=payload,
            )
    sync_pipeline_state(conn, run_id)
    notify_after_run_mutation(conn, run_id, prev_status)
    with conn.cursor() as cur:
        final = R.fetch_run(cur, run_id)
    assert final
    return {
        "run_id": run_id,
        "status": str(final["status"]),
        "current_gate_id": str(final["current_gate_id"]),
        "current_phase_id": str(final["current_phase_id"]) if final.get("current_phase_id") else None,
        "branch_used": branch,
    }


def principal_override_run(
    conn: Any,
    *,
    run_id: str,
    actor_team_id: str,
    action: str,
    reason: str,
    snapshot: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """UC-12 — Principal override; emits ``PRINCIPAL_OVERRIDE`` only (Module Map §4.8)."""
    if actor_team_id != C.TEAM_PRINCIPAL:
        raise StateMachineError("INSUFFICIENT_AUTHORITY", 403, details={})
    reason_s = (reason or "").strip()
    if not reason_s:
        raise StateMachineError("MISSING_REASON", 400, details={})
    if action not in C.PRINCIPAL_OVERRIDE_ACTIONS:
        raise StateMachineError("INVALID_ACTION", 400, details={"action": action})

    with conn.cursor() as cur:
        r0 = R.fetch_run(cur, run_id)
    prev_status = str(r0["status"]) if r0 else None

    from_st: str = ""
    to_st: str = ""

    with conn:
        with conn.cursor() as cur:
            run = R.fetch_run(cur, run_id)
            if not run:
                raise StateMachineError("NOT_FOUND", 404, details={"run_id": run_id})
            from_st = str(run["status"])
            if from_st == "COMPLETE":
                raise StateMachineError("TERMINAL_STATE", 409, details={"status": from_st})
            now = R.utc_now()
            cg = str(run["current_gate_id"])
            cp = str(run["current_phase_id"]) if run.get("current_phase_id") else None

            if action == C.FORCE_PASS:
                if from_st not in ("IN_PROGRESS", "CORRECTION"):
                    raise StateMachineError("INVALID_STATE", 409, details={"status": from_st})
                if not cp:
                    raise StateMachineError("INVALID_STATE", 409, details={"phase": None})
                if from_st == "IN_PROGRESS":
                    if R.is_terminal_position(cur, cg, cp):
                        R.update_run_position(
                            cur,
                            run_id,
                            status="COMPLETE",
                            completed_at=now,
                            last_updated=now,
                        )
                        to_st = "COMPLETE"
                    else:
                        ng, np = R.next_gate_phase(cur, cg, cp)
                        if not ng or not np:
                            raise StateMachineError(
                                "PHASE_SEQUENCE_ERROR",
                                500,
                                details={"from_gate": cg, "from_phase": cp},
                            )
                        R.update_run_position(
                            cur,
                            run_id,
                            current_gate_id=ng,
                            current_phase_id=np,
                            last_updated=now,
                        )
                        to_st = "IN_PROGRESS"
                else:
                    ng, np = R.next_gate_phase(cur, cg, cp)
                    if not ng or not np:
                        raise StateMachineError(
                            "PHASE_SEQUENCE_ERROR",
                            500,
                            details={"from_gate": cg, "from_phase": cp},
                        )
                    R.update_run_position(
                        cur,
                        run_id,
                        status="IN_PROGRESS",
                        current_gate_id=ng,
                        current_phase_id=np,
                        last_updated=now,
                    )
                    to_st = "IN_PROGRESS"

            elif action in (C.FORCE_FAIL, C.FORCE_CORRECTION):
                if from_st != "IN_PROGRESS":
                    raise StateMachineError("INVALID_STATE", 409, details={"status": from_st})
                cc = int(run["correction_cycle_count"]) + 1
                R.update_run_position(
                    cur,
                    run_id,
                    status="CORRECTION",
                    correction_cycle_count=cc,
                    last_updated=now,
                )
                to_st = "CORRECTION"

            elif action == C.FORCE_PAUSE:
                if snapshot is None:
                    raise StateMachineError("SNAPSHOT_REQUIRED", 400, details={})
                if from_st != "IN_PROGRESS":
                    raise StateMachineError("INVALID_STATE", 409, details={"status": from_st})
                try:
                    jsonschema.Draft202012Validator(C.PAUSE_SNAPSHOT_SCHEMA).validate(snapshot)
                except jsonschema.exceptions.ValidationError as e:
                    raise StateMachineError(
                        "SNAPSHOT_VALIDATION_FAILED",
                        422,
                        details={"error": str(e)},
                    ) from e
                snap_json = json.dumps(snapshot, sort_keys=True)
                R.update_run_position(
                    cur,
                    run_id,
                    status="PAUSED",
                    paused_at=now,
                    paused_routing_snapshot_json=snap_json,
                    last_updated=now,
                )
                to_st = "PAUSED"

            elif action == C.FORCE_RESUME:
                if from_st != "PAUSED":
                    raise StateMachineError("INVALID_STATE", 409, details={"status": from_st})
                snap_raw = run.get("paused_routing_snapshot_json")
                if not snap_raw:
                    raise StateMachineError("SNAPSHOT_MISSING", 409, details={})
                paused_at = run["paused_at"]
                if not paused_at:
                    raise StateMachineError("SNAPSHOT_MISSING", 409, details={})
                cur.execute(
                    """
                    UPDATE runs
                    SET status = 'IN_PROGRESS',
                        paused_at = NULL,
                        paused_routing_snapshot_json = NULL,
                        last_updated = %s
                    WHERE id = %s
                    """,
                    (now, run_id),
                )
                to_st = "IN_PROGRESS"
            else:
                raise StateMachineError("INVALID_ACTION", 400, details={"action": action})

            run2 = R.fetch_run(cur, run_id)
            assert run2
            po_payload = {"action": action, "from_state": from_st, "to_state": to_st}
            _emit(
                cur,
                run=run2,
                event_type="PRINCIPAL_OVERRIDE",
                actor_team_id=actor_team_id,
                actor_type=C.ACTOR_TYPE_HUMAN,
                verdict=None,
                reason=reason_s,
                payload=po_payload,
            )

    sync_pipeline_state(conn, run_id)
    notify_after_run_mutation(conn, run_id, prev_status)
    return {
        "run_id": run_id,
        "from_status": from_st,
        "to_status": to_st,
        "action": action,
        "event_type": "PRINCIPAL_OVERRIDE",
    }


def _event_row_public(row: dict[str, Any]) -> dict[str, Any]:
    out = dict(row)
    for k, v in list(out.items()):
        if isinstance(v, datetime):
            out[k] = v.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")
    return out


def execute_transition(
    conn: Any,
    *,
    transition: str,
    actor_team_id: str,
    run_id: str | None = None,
    payload: dict[str, Any] | None = None,
) -> tuple[dict[str, Any], dict[str, Any]]:
    """
    Canonical mutation entry (Team 00 Q6). ``use_cases`` must call this only for state changes.

    ``transition`` is one of ``TRANS_INITIATE``, ``TRANS_ADVANCE``, ``TRANS_FAIL``,
    ``TRANS_APPROVE_GATE``, ``TRANS_PAUSE``, ``TRANS_RESUME`` (see ``constants``).

    Returns:
        Tuple of (operation summary dict, latest event row dict or empty dict for OpenAPI/logging).
    """
    pl = payload or {}
    rid = run_id or pl.get("run_id")

    if transition == C.TRANS_INITIATE:
        summary = initiate_run(
            conn,
            work_package_id=str(pl["work_package_id"]),
            domain_id=str(pl["domain_id"]),
            process_variant=pl.get("process_variant"),
        )
        rid = str(summary["run_id"])
    elif transition == C.TRANS_ADVANCE:
        if not rid:
            raise StateMachineError(
                "INVALID_ACTION",
                400,
                details={"transition": transition, "missing": "run_id"},
            )
        summary = advance_run(
            conn,
            run_id=str(rid),
            actor_team_id=actor_team_id,
            verdict=str(pl.get("verdict", "pass")),
            summary=pl.get("summary"),
            feedback_json=pl.get("feedback_json"),
        )
    elif transition == C.TRANS_FAIL:
        if not rid:
            raise StateMachineError(
                "INVALID_ACTION",
                400,
                details={"transition": transition, "missing": "run_id"},
            )
        summary = fail_run(
            conn,
            run_id=str(rid),
            actor_team_id=actor_team_id,
            reason=str(pl.get("reason", "")),
            findings=pl.get("findings"),
        )
    elif transition == C.TRANS_APPROVE_GATE:
        if not rid:
            raise StateMachineError(
                "INVALID_ACTION",
                400,
                details={"transition": transition, "missing": "run_id"},
            )
        summary = approve_run(
            conn,
            run_id=str(rid),
            actor_team_id=actor_team_id,
            approval_notes=pl.get("approval_notes"),
        )
    elif transition == C.TRANS_PAUSE:
        if not rid:
            raise StateMachineError(
                "INVALID_ACTION",
                400,
                details={"transition": transition, "missing": "run_id"},
            )
        summary = pause_run(
            conn,
            run_id=str(rid),
            actor_team_id=actor_team_id,
            pause_reason=str(pl.get("pause_reason", "")),
        )
    elif transition == C.TRANS_RESUME:
        if not rid:
            raise StateMachineError(
                "INVALID_ACTION",
                400,
                details={"transition": transition, "missing": "run_id"},
            )
        summary = resume_run(
            conn,
            run_id=str(rid),
            actor_team_id=actor_team_id,
            resume_notes=pl.get("resume_notes"),
        )
    else:
        raise StateMachineError("INVALID_ACTION", 400, details={"transition": transition})

    with conn.cursor() as cur:
        ev = R.fetch_latest_event(cur, rid)
    ev_out: dict[str, Any] = _event_row_public(ev) if ev else {}
    return summary, ev_out


def get_run(conn: Any, run_id: str) -> dict[str, Any]:
    with conn.cursor() as cur:
        run = R.fetch_run(cur, run_id)
        if not run:
            raise StateMachineError("NOT_FOUND", 404, details={"run_id": run_id})
        out = dict(run)
        for k, v in list(out.items()):
            if isinstance(v, datetime):
                out[k] = v.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")
        return out
