"""
AOS v3 HTTP surface — FastAPI application and routers.

**Browser entry (canonical port 8090):** ``GET /`` redirects (302) to ``/v3/`` so the Pipeline UI and its static assets resolve under the ``/v3/*`` mount (``agents_os_v3/ui``).
Shared v2-era CSS paths ``/agents_os/ui/*`` mount ``agents_os/ui`` so existing ``../../agents_os/ui/...`` links work.

**Routers**

* ``_api_router`` (prefix ``/api``): ``GET /health``, ``GET /events/stream`` (SSE).
* ``business_router`` (prefix ``/api``): run lifecycle, portfolio, ideas, admin CRUD,
  prompt assembly, FIP (feedback), and observability reads.

**Run lifecycle (mutations require ``X-Actor-Team-Id``)**

``POST /runs``, ``GET /runs``, ``GET /runs/{run_id}``, ``POST .../advance``, ``fail``,
``approve``, ``pause``, ``resume``, ``POST .../override`` (UC-12),
``POST .../feedback``, ``POST .../feedback/clear``.

**Reads / operator handoff**

``GET /state``, ``GET /history``, ``GET /runs/{run_id}/prompt``.

**Portfolio / admin**

Teams (list + ``GET /teams/{id}``), work packages, ideas, routing rules (incl. ``DELETE``),
templates, policies (incl. ``PUT /policies/{id}``); ``PUT /teams/{id}/engine`` (Principal).

Actor resolution for mutations is BUILD-stubbed in :mod:`agents_os_v3.modules.management.authority`.
"""

from __future__ import annotations

import asyncio
import logging
import psycopg2
import os
from collections.abc import AsyncIterator, Generator
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Any, Optional

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from fastapi import APIRouter, Depends, FastAPI, HTTPException, Query, Request
from starlette.responses import Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, RedirectResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from ulid import ULID

from agents_os_v3.modules.audit.sse import get_broadcaster, init_sse, shutdown_sse
from agents_os_v3.modules.definitions import constants as C
from agents_os_v3.modules.definitions.models import (
    AdvanceRunBody,
    ApproveRunBody,
    CreateRunBody,
    DEFAULT_IDEAS_DOMAIN_ID,
    FailRunBody,
    FeedbackIngestBody,
    IdeaCreateBody,
    IdeaUpdateBody,
    PauseRunBody,
    PolicyUpdateBody,
    PrincipalOverrideBody,
    RejectEntryBody,
    ResumeRunBody,
    RoutingRuleCreateBody,
    RoutingRuleUpdateBody,
    TeamEngineUpdateBody,
    TemplateUpdateBody,
)
from agents_os_v3.modules.management.authority import get_actor_team_id
from agents_os_v3.modules.management.db import connection
from agents_os_v3.modules.management import portfolio as PF
from agents_os_v3.modules.management import use_cases as UC
from agents_os_v3.modules.policy.settings import list_policies, update_policy_by_id
from agents_os_v3.modules.prompting.builder import GovernanceNotFoundError, assemble_prompt_for_run
from agents_os_v3.modules.state.errors import StateMachineError
from agents_os_v3.modules.state import machine as state_machine

logger = logging.getLogger(__name__)


def _repo_root() -> Path:
    """Repository root (parent of ``agents_os_v3/``)."""
    return Path(__file__).resolve().parent.parent.parent.parent


def _db_conn() -> Generator[Any, None, None]:
    conn = connection()
    try:
        yield conn
    finally:
        conn.close()


def _sm_http(exc: StateMachineError) -> HTTPException:
    return HTTPException(
        status_code=exc.status_code,
        detail={"code": exc.code, "message": str(exc), "details": exc.details},
    )


business_router = APIRouter()


@business_router.post("/runs", status_code=201)
def post_run(
    body: CreateRunBody,
    actor_team_id: str = Depends(get_actor_team_id),
    conn: Any = Depends(_db_conn),
) -> dict[str, Any]:
    try:
        return UC.uc_01_initiate_run(
            conn,
            actor_team_id=actor_team_id,
            work_package_id=body.work_package_id,
            domain_id=body.domain_id,
            process_variant=body.process_variant,
        )
    except StateMachineError as e:
        raise _sm_http(e) from e
    except psycopg2.Error as e:
        logging.getLogger(__name__).error("DB error in post_run: %s", e, exc_info=True)
        raise HTTPException(
            status_code=500,
            detail={"code": "DB_ERROR", "message": str(e).split("\n")[0], "details": {}},
        ) from e


@business_router.get("/runs/{run_id}")
def get_run(run_id: str, conn: Any = Depends(_db_conn)) -> dict[str, Any]:
    try:
        return state_machine.get_run(conn, run_id)
    except StateMachineError as e:
        raise _sm_http(e) from e


@business_router.post("/runs/{run_id}/advance")
def post_advance(
    run_id: str,
    body: AdvanceRunBody,
    actor_team_id: str = Depends(get_actor_team_id),
    conn: Any = Depends(_db_conn),
) -> dict[str, Any]:
    try:
        return UC.uc_02_advance_run(
            conn,
            actor_team_id=actor_team_id,
            run_id=run_id,
            verdict=body.verdict,
            summary=body.summary,
            feedback_json=body.feedback_json,
        )
    except StateMachineError as e:
        raise _sm_http(e) from e


@business_router.post("/runs/{run_id}/reject-entry", status_code=200)
def post_reject_entry(
    run_id: str,
    body: RejectEntryBody,
    actor_team_id: str = Depends(get_actor_team_id),
    conn: Any = Depends(_db_conn),
) -> dict[str, Any]:
    """GATE_0 terminal rejection (Entry Quality Gate).
    Only team_190 or team_00. Terminates run (status=FAILED) and resets WP to PLANNED.
    """
    try:
        return UC.uc_gate0_reject(
            conn,
            actor_team_id=actor_team_id,
            run_id=run_id,
            reason=body.reason.strip(),
        )
    except StateMachineError as e:
        raise _sm_http(e) from e


@business_router.post("/runs/{run_id}/fail")
def post_fail(
    run_id: str,
    body: FailRunBody,
    actor_team_id: str = Depends(get_actor_team_id),
    conn: Any = Depends(_db_conn),
) -> dict[str, Any]:
    try:
        return UC.uc_03_fail_gate(
            conn,
            actor_team_id=actor_team_id,
            run_id=run_id,
            reason=body.reason.strip(),
            findings=body.findings,
        )
    except StateMachineError as e:
        raise _sm_http(e) from e


@business_router.post("/runs/{run_id}/approve")
def post_approve(
    run_id: str,
    body: ApproveRunBody,
    actor_team_id: str = Depends(get_actor_team_id),
    conn: Any = Depends(_db_conn),
) -> dict[str, Any]:
    try:
        return UC.uc_06_approve_gate(
            conn,
            actor_team_id=actor_team_id,
            run_id=run_id,
            approval_notes=body.approval_notes,
        )
    except StateMachineError as e:
        raise _sm_http(e) from e


@business_router.post("/runs/{run_id}/pause")
def post_pause(
    run_id: str,
    body: PauseRunBody,
    actor_team_id: str = Depends(get_actor_team_id),
    conn: Any = Depends(_db_conn),
) -> dict[str, Any]:
    try:
        return UC.uc_07_pause_run(
            conn,
            actor_team_id=actor_team_id,
            run_id=run_id,
            pause_reason=body.pause_reason,
        )
    except StateMachineError as e:
        raise _sm_http(e) from e


@business_router.post("/runs/{run_id}/feedback")
def post_run_feedback(
    run_id: str,
    body: FeedbackIngestBody,
    actor_team_id: str = Depends(get_actor_team_id),
    conn: Any = Depends(_db_conn),
) -> dict[str, Any]:
    try:
        return UC.uc_15_ingest_feedback(
            conn,
            actor_team_id=actor_team_id,
            run_id=run_id,
            detection_mode=body.detection_mode,
            file_path=body.file_path,
            raw_text=body.raw_text,
            structured_json=body.structured_json.model_dump() if body.structured_json else None,
        )
    except StateMachineError as e:
        raise _sm_http(e) from e


@business_router.post("/runs/{run_id}/feedback/clear")
def post_run_feedback_clear(
    run_id: str,
    conn: Any = Depends(_db_conn),
) -> dict[str, Any]:
    try:
        return UC.uc_16_clear_pending_feedback(conn, run_id=run_id)
    except StateMachineError as e:
        raise _sm_http(e) from e


@business_router.get("/state")
def get_api_state(
    run_id: Optional[str] = Query(default=None),
    domain_id: Optional[str] = Query(default=None),
    actor_team_id: str = Depends(get_actor_team_id),
    conn: Any = Depends(_db_conn),
) -> dict[str, Any]:
    try:
        return UC.uc_13_get_current_state(
            conn,
            run_id=run_id,
            domain_id=domain_id,
            actor_header_team=actor_team_id,
        )
    except StateMachineError as e:
        raise _sm_http(e) from e


@business_router.get("/history")
def get_api_history(
    run_id: Optional[str] = Query(default=None),
    domain_id: Optional[str] = Query(default=None),
    gate_id: Optional[str] = Query(default=None),
    event_type: Optional[str] = Query(default=None),
    actor_team_id: Optional[str] = Query(default=None),
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    order: str = Query(default="desc"),
    conn: Any = Depends(_db_conn),
) -> dict[str, Any]:
    try:
        return UC.uc_14_get_history(
            conn,
            run_id=run_id,
            domain_id=domain_id,
            gate_id=gate_id,
            event_type=event_type,
            actor_team_id=actor_team_id,
            limit=limit,
            offset=offset,
            order=order,
        )
    except StateMachineError as e:
        raise _sm_http(e) from e


@business_router.post("/runs/{run_id}/resume")
def post_resume(
    run_id: str,
    body: ResumeRunBody,
    actor_team_id: str = Depends(get_actor_team_id),
    conn: Any = Depends(_db_conn),
) -> dict[str, Any]:
    try:
        return UC.uc_08_resume_run(
            conn,
            actor_team_id=actor_team_id,
            run_id=run_id,
            resume_notes=body.resume_notes,
        )
    except StateMachineError as e:
        raise _sm_http(e) from e


@business_router.post("/runs/{run_id}/override")
def post_run_override(
    run_id: str,
    body: PrincipalOverrideBody,
    actor_team_id: str = Depends(get_actor_team_id),
    conn: Any = Depends(_db_conn),
) -> dict[str, Any]:
    if body.actor_team_id.strip() != actor_team_id:
        raise HTTPException(
            status_code=400,
            detail={
                "code": "ACTOR_MISMATCH",
                "message": "body.actor_team_id must match X-Actor-Team-Id",
                "details": {},
            },
        )
    try:
        return UC.uc_12_principal_override(
            conn,
            actor_team_id=actor_team_id,
            run_id=run_id,
            action=body.action,
            reason=body.reason,
            snapshot=body.snapshot,
        )
    except StateMachineError as e:
        raise _sm_http(e) from e


@business_router.get("/runs/{run_id}/prompt")
def get_run_prompt(
    run_id: str,
    bust_cache: bool = Query(default=False),
    conn: Any = Depends(_db_conn),
) -> dict[str, Any]:
    try:
        return assemble_prompt_for_run(conn, run_id=run_id, bust_cache=bust_cache)
    except StateMachineError as e:
        raise _sm_http(e) from e
    except GovernanceNotFoundError as e:
        raise HTTPException(
            status_code=404,
            detail={
                "code": "GOVERNANCE_NOT_FOUND",
                "message": f"Governance markdown missing for actor team '{e.team_id}'. "
                           f"Create agents_os_v3/governance/{e.team_id}.md to resolve.",
                "details": {"team_id": e.team_id},
            },
        ) from e


@business_router.get("/teams")
def get_teams(conn: Any = Depends(_db_conn)) -> dict[str, Any]:
    return PF.list_teams_response(conn)


@business_router.get("/teams/{team_id}")
def get_team(team_id: str, conn: Any = Depends(_db_conn)) -> dict[str, Any]:
    try:
        return PF.get_team_detail(conn, team_id)
    except StateMachineError as e:
        raise _sm_http(e) from e


@business_router.put("/teams/{team_id}/engine")
def put_team_engine(
    team_id: str,
    body: TeamEngineUpdateBody,
    actor_team_id: str = Depends(get_actor_team_id),
    conn: Any = Depends(_db_conn),
) -> dict[str, Any]:
    if actor_team_id != C.TEAM_PRINCIPAL:
        raise HTTPException(
            status_code=403,
            detail={
                "code": "INSUFFICIENT_AUTHORITY",
                "message": "Only team_00 may update team engine",
                "details": {},
            },
        )
    try:
        return PF.update_team_engine(conn, team_id=team_id, engine=body.engine)
    except StateMachineError as e:
        raise _sm_http(e) from e


@business_router.get("/runs")
def get_runs_list(
    status: Optional[str] = Query(default=None),
    domain_id: Optional[str] = Query(default=None),
    current_gate_id: Optional[str] = Query(default=None),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    conn: Any = Depends(_db_conn),
) -> dict[str, Any]:
    try:
        return PF.list_runs_paginated(
            conn,
            status_csv=status,
            domain_id=domain_id,
            current_gate_id=current_gate_id,
            limit=limit,
            offset=offset,
        )
    except StateMachineError as e:
        raise _sm_http(e) from e


@business_router.get("/work-packages")
def get_work_packages(conn: Any = Depends(_db_conn)) -> dict[str, Any]:
    return PF.list_work_packages(conn)


@business_router.get("/work-packages/{wp_id}")
def get_work_package(wp_id: str, conn: Any = Depends(_db_conn)) -> dict[str, Any]:
    try:
        return PF.get_work_package(conn, wp_id)
    except StateMachineError as e:
        raise _sm_http(e) from e


@business_router.post("/work-packages/{wp_id}/cancel", status_code=200)
def post_wp_cancel(
    wp_id: str,
    actor_team_id: str = Depends(get_actor_team_id),
    conn: Any = Depends(_db_conn),
) -> dict[str, Any]:
    try:
        return PF.cancel_work_package(conn, wp_id)
    except StateMachineError as e:
        raise _sm_http(e) from e


@business_router.post("/work-packages/{wp_id}/start", status_code=201)
def post_wp_start(
    wp_id: str,
    body: CreateRunBody,
    actor_team_id: str = Depends(get_actor_team_id),
    conn: Any = Depends(_db_conn),
) -> dict[str, Any]:
    """Convenience endpoint: start a run for a specific WP (equivalent to POST /api/runs)."""
    try:
        return UC.uc_01_initiate_run(
            conn,
            actor_team_id=actor_team_id,
            work_package_id=wp_id,
            domain_id=body.domain_id,
            process_variant=body.process_variant,
        )
    except StateMachineError as e:
        raise _sm_http(e) from e
    except psycopg2.Error as e:
        logging.getLogger(__name__).error("DB error in post_wp_start: %s", e, exc_info=True)
        raise HTTPException(
            status_code=500,
            detail={"code": "DB_ERROR", "message": str(e).split("\n")[0], "details": {}},
        ) from e


@business_router.get("/ideas")
def get_ideas(
    status: Optional[str] = Query(default=None),
    priority: Optional[str] = Query(default=None),
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    conn: Any = Depends(_db_conn),
) -> dict[str, Any]:
    try:
        return PF.list_ideas(conn, status=status, priority=priority, limit=limit, offset=offset)
    except StateMachineError as e:
        raise _sm_http(e) from e


@business_router.post("/ideas", status_code=201)
def post_idea(
    body: IdeaCreateBody,
    actor_team_id: str = Depends(get_actor_team_id),
    conn: Any = Depends(_db_conn),
) -> dict[str, Any]:
    try:
        dom = body.domain_id or DEFAULT_IDEAS_DOMAIN_ID
        return PF.create_idea(
            conn,
            actor_team_id=actor_team_id,
            title=body.title,
            description=body.description,
            priority=body.priority,
            domain_id=dom,
            idea_type=body.idea_type,
        )
    except StateMachineError as e:
        raise _sm_http(e) from e


@business_router.put("/ideas/{idea_id}")
def put_idea(
    idea_id: str,
    body: IdeaUpdateBody,
    actor_team_id: str = Depends(get_actor_team_id),
    conn: Any = Depends(_db_conn),
) -> dict[str, Any]:
    try:
        patch = body.model_dump(exclude_unset=True)
        return PF.update_idea(conn, idea_id=idea_id, actor_team_id=actor_team_id, body=patch)
    except StateMachineError as e:
        raise _sm_http(e) from e


@business_router.get("/routing-rules")
def get_routing_rules(conn: Any = Depends(_db_conn)) -> dict[str, Any]:
    with conn.cursor() as cur:
        cur.execute(
            """
            SELECT id, gate_id, phase_id, domain_id, variant, role_id, priority,
                   resolve_from_state_key, created_at
            FROM routing_rules
            ORDER BY gate_id, priority DESC
            """
        )
        rows = [dict(r) for r in (cur.fetchall() or [])]
    return {"routing_rules": rows}


@business_router.post("/routing-rules", status_code=201)
def post_routing_rule(
    body: RoutingRuleCreateBody,
    actor_team_id: str = Depends(get_actor_team_id),
    conn: Any = Depends(_db_conn),
) -> dict[str, Any]:
    _ = actor_team_id
    rid = str(ULID())
    with conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO routing_rules (
                  id, gate_id, phase_id, domain_id, variant, role_id, priority,
                  resolve_from_state_key, created_at
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, NOW())
                """,
                (
                    rid,
                    body.gate_id,
                    body.phase_id,
                    body.domain_id,
                    body.variant,
                    body.role_id,
                    body.priority,
                    body.resolve_from_state_key,
                ),
            )
    return {"id": rid}


@business_router.put("/routing-rules/{rule_id}")
def put_routing_rule(
    rule_id: str,
    body: RoutingRuleUpdateBody,
    actor_team_id: str = Depends(get_actor_team_id),
    conn: Any = Depends(_db_conn),
) -> dict[str, Any]:
    _ = actor_team_id
    data = body.model_dump(exclude_unset=True)
    if not data:
        return {"id": rule_id, "updated": False}
    cols = []
    vals: list[Any] = []
    for k, v in data.items():
        cols.append(f"{k} = %s")
        vals.append(v)
    vals.append(rule_id)
    with conn:
        with conn.cursor() as cur:
            cur.execute(
                f"UPDATE routing_rules SET {', '.join(cols)} WHERE id = %s",
                vals,
            )
    return {"id": rule_id, "updated": True}


@business_router.delete("/routing-rules/{rule_id}")
def delete_routing_rule(
    rule_id: str,
    actor_team_id: str = Depends(get_actor_team_id),
    conn: Any = Depends(_db_conn),
) -> dict[str, Any]:
    if actor_team_id != C.TEAM_PRINCIPAL:
        raise HTTPException(
            status_code=403,
            detail={
                "code": "INSUFFICIENT_AUTHORITY",
                "message": "Only team_00 may delete routing rules",
                "details": {},
            },
        )
    try:
        with conn:
            with conn.cursor() as cur:
                cur.execute("DELETE FROM routing_rules WHERE id = %s", (rule_id,))
                if cur.rowcount == 0:
                    raise StateMachineError(
                        "NOT_FOUND",
                        404,
                        details={"rule_id": rule_id},
                    )
    except StateMachineError as e:
        raise _sm_http(e) from e
    return {"id": rule_id, "deleted": True}


@business_router.get("/templates")
def list_templates(conn: Any = Depends(_db_conn)) -> dict[str, Any]:
    """List templates for Configuration UI (GATE_4)."""
    with conn.cursor() as cur:
        cur.execute(
            """
            SELECT id, name, gate_id, phase_id, domain_id, version, is_active,
                   body_markdown, updated_at
            FROM templates
            ORDER BY gate_id ASC, COALESCE(domain_id, '') ASC, id ASC
            """
        )
        rows = cur.fetchall() or []
    out: list[dict[str, Any]] = []
    for raw in rows:
        d = dict(raw)
        ua = d.get("updated_at")
        if ua is not None and hasattr(ua, "isoformat"):
            d["updated_at"] = ua.isoformat().replace("+00:00", "Z")
        out.append(d)
    return {"templates": out}


@business_router.get("/templates/{template_id}")
def get_template(template_id: str, conn: Any = Depends(_db_conn)) -> dict[str, Any]:
    with conn.cursor() as cur:
        cur.execute("SELECT * FROM templates WHERE id = %s", (template_id,))
        row = cur.fetchone()
        if not row:
            raise HTTPException(
                status_code=404,
                detail={"code": "NOT_FOUND", "message": "template not found", "details": {}},
            )
        return dict(row)


@business_router.put("/templates/{template_id}")
def put_template(
    template_id: str,
    body: TemplateUpdateBody,
    actor_team_id: str = Depends(get_actor_team_id),
    conn: Any = Depends(_db_conn),
) -> dict[str, Any]:
    _ = actor_team_id
    data = body.model_dump(exclude_unset=True)
    if not data:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM templates WHERE id = %s", (template_id,))
            r = cur.fetchone()
            if not r:
                raise HTTPException(status_code=404, detail={"code": "NOT_FOUND"})
            return dict(r)
    cols = []
    vals: list[Any] = []
    for k, v in data.items():
        cols.append(f"{k} = %s")
        vals.append(v)
    cols.append("updated_at = NOW()")
    vals.append(template_id)
    with conn:
        with conn.cursor() as cur:
            cur.execute(
                f"UPDATE templates SET {', '.join(cols)} WHERE id = %s",
                vals,
            )
            cur.execute("SELECT * FROM templates WHERE id = %s", (template_id,))
            return dict(cur.fetchone())


@business_router.get("/policies")
def get_policies(conn: Any = Depends(_db_conn)) -> dict[str, Any]:
    with conn.cursor() as cur:
        rows = list_policies(cur)
    for r in rows:
        if r.get("updated_at") is not None and hasattr(r["updated_at"], "isoformat"):
            r["updated_at"] = r["updated_at"].isoformat().replace("+00:00", "Z")
    return {"policies": rows}


@business_router.get("/runs/{run_id}/context")
def get_run_context(
    run_id: str,
    conn: Any = Depends(_db_conn),
    actor_team_id: str = Depends(get_actor_team_id),
) -> dict[str, Any]:
    """P3-A1 — Run context bundle: run state + governance + token budget meta."""
    try:
        prompt_out = assemble_prompt_for_run(conn, run_id=run_id, bust_cache=True)
    except StateMachineError as e:
        raise _sm_http(e) from e
    except GovernanceNotFoundError as e:
        raise HTTPException(
            status_code=404,
            detail={
                "code": "GOVERNANCE_NOT_FOUND",
                "message": f"Governance markdown missing for actor team '{e.team_id}'.",
                "details": {"team_id": e.team_id},
            },
        ) from e
    return {
        "run_id": run_id,
        "meta": prompt_out.get("meta"),
        "token_budget_warning": prompt_out.get("meta", {}).get("token_budget_warning"),
        "approx_tokens": prompt_out.get("meta", {}).get("approx_tokens"),
    }


@business_router.get("/teams/{team_id}/context")
def get_team_context(
    team_id: str,
    conn: Any = Depends(_db_conn),
) -> dict[str, Any]:
    """P3-A3 — Team context: governance file contents + routing rules for team."""
    from agents_os_v3.modules.prompting.builder import GOVERNANCE_DIR
    gov_path = GOVERNANCE_DIR / f"{team_id}.md"
    has_file = gov_path.is_file()
    governance_md: Optional[str] = None
    if has_file:
        governance_md = gov_path.read_text(encoding="utf-8")

    with conn.cursor() as cur:
        cur.execute("SELECT id, engine FROM teams WHERE id = %s", (team_id,))
        team_row = cur.fetchone()
        if not team_row:
            raise HTTPException(
                status_code=404,
                detail={"code": "NOT_FOUND", "message": f"Team '{team_id}' not found.", "details": {}},
            )
        cur.execute(
            "SELECT gate_id, phase_id, domain_id, variant, priority FROM routing_rules WHERE role_id = %s ORDER BY priority",
            (team_id,),
        )
        rules = [dict(r) for r in (cur.fetchall() or [])]

    return {
        "team_id": team_id,
        "engine": team_row["engine"],
        "has_governance_file": has_file,
        "governance_md": governance_md,
        "routing_rules": rules,
    }


@business_router.get("/feedback/stats")
def get_feedback_stats(
    actor_team_id: str = Depends(get_actor_team_id),
    run_id: Optional[str] = Query(default=None),
    conn: Any = Depends(_db_conn),
) -> dict[str, Any]:
    """§I-0 — KPI aggregation from pending_feedbacks.
    Auth: X-Actor-Team-Id required. Phase 0: global aggregate (no PII).
    """
    with conn.cursor() as cur:
        if run_id:
            cur.execute(
                """
                SELECT detection_mode, ingestion_layer, COUNT(*) AS cnt
                FROM pending_feedbacks
                WHERE run_id = %s
                GROUP BY detection_mode, ingestion_layer
                ORDER BY cnt DESC
                """,
                (run_id,),
            )
        else:
            cur.execute(
                """
                SELECT detection_mode, ingestion_layer, COUNT(*) AS cnt
                FROM pending_feedbacks
                GROUP BY detection_mode, ingestion_layer
                ORDER BY cnt DESC
                """
            )
        rows = [dict(r) for r in (cur.fetchall() or [])]
        cur.execute("SELECT COUNT(*) AS total FROM pending_feedbacks" + (" WHERE run_id = %s" if run_id else ""),
                    (run_id,) if run_id else ())
        total_row = cur.fetchone()
        total = int(total_row["total"]) if total_row else 0

    return {
        "total_feedbacks": total,
        "run_id_filter": run_id,
        "breakdown": [
            {"detection_mode": r["detection_mode"], "ingestion_layer": r["ingestion_layer"], "count": int(r["cnt"])}
            for r in rows
        ],
        "phase": "0 — collection only (N<20 threshold not yet reached)",
    }


@business_router.get("/governance/status")
def get_governance_status(conn: Any = Depends(_db_conn)) -> dict[str, Any]:
    """P2-F06 — Governance matrix: all teams vs. governance file presence.
    Returns teams with engine, role_count, has_governance_file, file_size_bytes.
    """
    governance_dir = Path(__file__).resolve().parents[2] / "governance"
    with conn.cursor() as cur:
        cur.execute("SELECT id, engine FROM teams ORDER BY id")
        teams = [dict(r) for r in (cur.fetchall() or [])]
        cur.execute("SELECT role_id, COUNT(*) AS rule_count FROM routing_rules GROUP BY role_id")
        rule_counts = {str(r["role_id"]): int(r["rule_count"]) for r in (cur.fetchall() or [])}

    matrix = []
    total_teams = len(teams)
    teams_with_gov = 0
    for t in teams:
        tid = str(t["id"])
        gov_path = governance_dir / f"{tid}.md"
        has_file = gov_path.is_file()
        if has_file:
            teams_with_gov += 1
        matrix.append({
            "team_id": tid,
            "engine": t.get("engine"),
            "routing_rule_count": rule_counts.get(tid, 0),
            "has_governance_file": has_file,
            "file_size_bytes": gov_path.stat().st_size if has_file else None,
        })

    return {
        "summary": {
            "total_teams": total_teams,
            "teams_with_governance": teams_with_gov,
            "teams_without_governance": total_teams - teams_with_gov,
            "routed_without_governance": sum(
                1 for m in matrix if m["routing_rule_count"] > 0 and not m["has_governance_file"]
            ),
        },
        "matrix": matrix,
    }


@business_router.put("/policies/{policy_id}")
def put_policy(
    policy_id: str,
    body: PolicyUpdateBody,
    actor_team_id: str = Depends(get_actor_team_id),
    conn: Any = Depends(_db_conn),
) -> dict[str, Any]:
    if actor_team_id != C.TEAM_PRINCIPAL:
        raise HTTPException(
            status_code=403,
            detail={
                "code": "INSUFFICIENT_AUTHORITY",
                "message": "Only team_00 may update policies",
                "details": {},
            },
        )
    patch = body.model_dump(exclude_unset=True)
    try:
        with conn:
            with conn.cursor() as cur:
                row = update_policy_by_id(cur, policy_id, patch)
    except StateMachineError as e:
        raise _sm_http(e) from e
    r = dict(row)
    if r.get("updated_at") is not None and hasattr(r["updated_at"], "isoformat"):
        r["updated_at"] = r["updated_at"].isoformat().replace("+00:00", "Z")
    return r


_api_router = APIRouter()


@_api_router.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@_api_router.get("/events/stream")
async def events_stream(
    run_id: Optional[str] = Query(default=None),
    domain_id: Optional[str] = Query(default=None),
) -> StreamingResponse:
    """SSE — UI §10.4 (pipeline_event, heartbeat, run_state_changed, feedback_ingested)."""

    broadcaster = get_broadcaster()

    async def _gen() -> AsyncIterator[bytes]:
        if broadcaster is None:
            yield b": sse-not-initialized\n\n"
            return
        async for chunk in broadcaster.subscribe(run_id, domain_id):
            yield chunk.encode("utf-8")

    return StreamingResponse(_gen(), media_type="text/event-stream")


_LAYER2_POLL_INTERVAL_DEFAULT = 60  # seconds


def _get_layer2_poll_interval() -> int:
    """Read layer2_polling_interval_seconds policy from DB; fall back to default."""
    try:
        conn = connection()
        with conn:
            with conn.cursor() as cur:
                cur.execute(
                    "SELECT policy_value_json FROM policies WHERE policy_key = %s LIMIT 1",
                    ("layer2_polling_interval_seconds",),
                )
                row = cur.fetchone()
                if row:
                    val = row[0]
                    if isinstance(val, (int, float)) and val > 0:
                        return int(val)
                    try:
                        import json as _json
                        parsed = _json.loads(str(val))
                        if isinstance(parsed, (int, float)) and parsed > 0:
                            return int(parsed)
                    except Exception:
                        pass
        conn.close()
    except Exception:
        pass
    return _LAYER2_POLL_INTERVAL_DEFAULT


async def _scan_layer2_feedback() -> None:
    """§F — Layer 2 APScheduler scan: auto-ingest OPERATOR_NOTIFY feedback files."""
    import asyncio as _asyncio
    try:
        conn = connection()
        with conn:
            with conn.cursor() as cur:
                # Fetch all IN_PROGRESS runs without pending feedback
                cur.execute(
                    """
                    SELECT r.id AS run_id, r.current_gate_id, r.work_package_id, r.started_at
                    FROM runs r
                    WHERE r.status IN ('IN_PROGRESS', 'CORRECTION')
                      AND NOT EXISTS (
                        SELECT 1 FROM pending_feedbacks pf
                        WHERE pf.run_id = r.id AND pf.cleared_at IS NULL
                      )
                    LIMIT 50
                    """
                )
                active_runs = [dict(row) for row in (cur.fetchall() or [])]
        conn.close()

        for run_info in active_runs:
            rid = str(run_info["run_id"])
            try:
                conn2 = connection()
                UC.uc_15_ingest_feedback(
                    conn2,
                    actor_team_id="team_system",
                    run_id=rid,
                    detection_mode="OPERATOR_NOTIFY",
                    file_path=None,
                    raw_text=None,
                )
                conn2.close()
            except Exception as scan_exc:
                # FEEDBACK_ALREADY_INGESTED, ROUTING_UNRESOLVED, etc. — skip silently
                logger.debug("layer2_scan skip run %s: %s", rid, scan_exc)
    except Exception as exc:
        logger.warning("layer2_scan error: %s", exc)


@asynccontextmanager
async def lifespan(app: FastAPI):
    loop = asyncio.get_running_loop()
    init_sse(loop)
    app.state.sse_broadcaster = get_broadcaster()
    scheduler = AsyncIOScheduler()
    interval_s = _get_layer2_poll_interval()
    scheduler.add_job(
        _scan_layer2_feedback,
        "interval",
        seconds=interval_s,
        id="layer2_scan",
        coalesce=True,
        max_instances=1,
        replace_existing=True,
    )
    scheduler.start()
    logger.info("APScheduler started — layer2_scan every %ds", interval_s)
    yield
    scheduler.shutdown(wait=False)
    shutdown_sse()
    logger.info("APScheduler stopped; SSE heartbeat cancelled")


def _allowed_origins() -> list[str]:
    raw = os.getenv("ALLOWED_ORIGINS", "").strip()
    if raw:
        return [o.strip() for o in raw.split(",") if o.strip()]
    return [
        "http://localhost:8090",
        "http://127.0.0.1:8090",
        "http://localhost:8092",
        "http://127.0.0.1:8092",
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        "http://localhost:8778",
        "http://127.0.0.1:8778",
        "http://localhost:8766",
        "http://127.0.0.1:8766",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]


def create_app() -> FastAPI:
    """Build the FastAPI app with CORS, lifespan (SSE + scheduler), and both API routers."""
    application = FastAPI(
        title="Agents OS v3 API",
        version="3.0.0",
        lifespan=lifespan,
        docs_url="/docs",
        redoc_url="/redoc",
    )
    application.add_middleware(
        CORSMiddleware,
        allow_origins=_allowed_origins(),
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        allow_headers=["*"],
        expose_headers=["*"],
    )
    application.include_router(_api_router, prefix="/api")
    application.include_router(business_router, prefix="/api")

    @application.get("/api", include_in_schema=False, response_model=None)
    @application.get("/api/", include_in_schema=False, response_model=None)
    async def aos_v3_redirect_bare_api_prefix(request: Request) -> Response:
        """Avoid raw ``{"detail":"Not Found"}`` when users open ``/api`` in a browser."""
        accept = (request.headers.get("accept") or "").lower()
        target = "/" if "text/html" in accept else "/docs"
        return RedirectResponse(url=target, status_code=307)

    repo = _repo_root()
    v3_ui = repo / "agents_os_v3" / "ui"
    _idx = v3_ui / "index.html"

    @application.get("/", include_in_schema=False, response_model=None)
    async def aos_v3_root_index() -> Response:
        """Redirect root to canonical /v3/ entry point (assets resolve correctly there)."""
        return RedirectResponse(url="/v3/", status_code=302)

    shared_ui = repo / "agents_os" / "ui"
    if v3_ui.is_dir():
        application.mount(
            "/v3",
            StaticFiles(directory=str(v3_ui), html=True),
            name="aos_v3_ui",
        )
    if shared_ui.is_dir():
        application.mount(
            "/agents_os/ui",
            StaticFiles(directory=str(shared_ui)),
            name="agents_os_shared_ui",
        )
    return application


app = create_app()
