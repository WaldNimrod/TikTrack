"""
AOS v3 FastAPI — GATE_0 shell + GATE_1/GATE_2 business routes on ``business_router``.

GATE_3: full SSE (audit/sse.py), FIP feedback routes, GET /api/state, GET /api/history.
Actor identity: X-Actor-Team-Id (BUILD stub — TODO AUTH_STUB).
"""

from __future__ import annotations

import asyncio
import logging
import os
from collections.abc import AsyncIterator, Generator
from contextlib import asynccontextmanager
from typing import Any

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from fastapi import APIRouter, Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
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
from agents_os_v3.modules.policy.settings import list_policies
from agents_os_v3.modules.prompting.builder import GovernanceNotFoundError, assemble_prompt_for_run
from agents_os_v3.modules.state.errors import StateMachineError
from agents_os_v3.modules.state import machine as state_machine

logger = logging.getLogger(__name__)


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
    if body.detection_mode == "NATIVE_FILE" and not body.file_path:
        raise HTTPException(
            status_code=400,
            detail={
                "code": "INVALID_ACTION",
                "message": "file_path required for NATIVE_FILE",
                "details": {},
            },
        )
    if body.detection_mode == "RAW_PASTE" and not body.raw_text:
        raise HTTPException(
            status_code=400,
            detail={
                "code": "INVALID_ACTION",
                "message": "raw_text required for RAW_PASTE",
                "details": {},
            },
        )
    try:
        return UC.uc_15_ingest_feedback(
            conn,
            actor_team_id=actor_team_id,
            run_id=run_id,
            detection_mode=body.detection_mode,
            file_path=body.file_path,
            raw_text=body.raw_text,
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
    run_id: str | None = Query(default=None),
    domain_id: str | None = Query(default=None),
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
    run_id: str | None = Query(default=None),
    domain_id: str | None = Query(default=None),
    gate_id: str | None = Query(default=None),
    event_type: str | None = Query(default=None),
    actor_team_id: str | None = Query(default=None),
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
                "code": "GovernanceNotFound",
                "message": f"Governance markdown missing for team {e.team_id}",
                "details": {"team_id": e.team_id},
            },
        ) from e


@business_router.get("/teams")
def get_teams(conn: Any = Depends(_db_conn)) -> dict[str, Any]:
    return PF.list_teams_response(conn)


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
    status: str | None = Query(default=None),
    domain_id: str | None = Query(default=None),
    current_gate_id: str | None = Query(default=None),
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


@business_router.get("/ideas")
def get_ideas(
    status: str | None = Query(default=None),
    priority: str | None = Query(default=None),
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


_api_router = APIRouter()


@_api_router.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@_api_router.get("/events/stream")
async def events_stream(
    run_id: str | None = Query(default=None),
    domain_id: str | None = Query(default=None),
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


@asynccontextmanager
async def lifespan(app: FastAPI):
    loop = asyncio.get_running_loop()
    init_sse(loop)
    app.state.sse_broadcaster = get_broadcaster()
    scheduler = AsyncIOScheduler()
    scheduler.start()
    logger.info("APScheduler started (GATE_0 — no jobs registered)")
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
    return application


app = create_app()
