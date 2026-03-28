"""
Portfolio and list reads backing HTTP routes under ``/api/teams``, ``/api/runs``,
``/api/work-packages``, ``/api/ideas``.

Aligned with Stage 8A UI spec: team list (with hierarchy hints from ``definition.yaml`` for
seed teams), paginated runs, work packages, and ideas (used by ``api.py`` handlers).
"""

from __future__ import annotations

from pathlib import Path
from typing import Any

import yaml

from agents_os_v3.modules.management import use_cases as UC

_ROOT = Path(__file__).resolve().parents[2]
_DEFINITION = _ROOT / "definition.yaml"


def _def_team_meta() -> dict[str, dict[str, Any]]:
    data = yaml.safe_load(_DEFINITION.read_text(encoding="utf-8"))
    out: dict[str, dict[str, Any]] = {}
    for key in ("team_00", "team_10", "team_11"):
        block = data.get(key)
        if isinstance(block, dict) and block.get("id"):
            tid = str(block["id"])
            out[tid] = {
                "parent_team_id": block.get("parent_team_id"),
                "children": list(block.get("children") or []),
            }
    return out


def list_teams_response(conn: Any) -> dict[str, Any]:
    hierarchy = _def_team_meta()
    with conn.cursor() as cur:
        cur.execute(
            """
            SELECT id, label, name, engine, "group", profession, domain_scope, in_gate_process
            FROM teams
            ORDER BY id ASC
            """
        )
        rows = cur.fetchall() or []
        teams_out: list[dict[str, Any]] = []
        for r in rows:
            d = dict(r)
            tid = str(d["id"])
            h = hierarchy.get(tid, {})
            cur.execute(
                """
                SELECT 1 FROM assignments
                WHERE team_id = %s AND status = 'ACTIVE'
                LIMIT 1
                """,
                (tid,),
            )
            has_asg = cur.fetchone() is not None
            teams_out.append(
                {
                    "team_id": tid,
                    "label": str(d["label"]),
                    "name": str(d["name"]),
                    "engine": str(d["engine"]),
                    "group": str(d["group"]),
                    "profession": str(d["profession"]),
                    "domain_scope": str(d["domain_scope"]),
                    "parent_team_id": h.get("parent_team_id"),
                    "children": h.get("children") or [],
                    "has_active_assignment": bool(has_asg),
                }
            )
        return {"teams": teams_out}


def get_team_detail(conn: Any, team_id: str) -> dict[str, Any]:
    """Single team — same shape as each element of ``list_teams_response`` ``teams`` list."""
    from agents_os_v3.modules.state.errors import StateMachineError

    hierarchy = _def_team_meta()
    with conn.cursor() as cur:
        cur.execute(
            """
            SELECT id, label, name, engine, "group", profession, domain_scope, in_gate_process
            FROM teams
            WHERE id = %s
            """,
            (team_id,),
        )
        r = cur.fetchone()
        if not r:
            raise StateMachineError("NOT_FOUND", 404, details={"team_id": team_id})
        d = dict(r)
        tid = str(d["id"])
        h = hierarchy.get(tid, {})
        cur.execute(
            """
            SELECT 1 FROM assignments
            WHERE team_id = %s AND status = 'ACTIVE'
            LIMIT 1
            """,
            (tid,),
        )
        has_asg = cur.fetchone() is not None
        return {
            "team_id": tid,
            "label": str(d["label"]),
            "name": str(d["name"]),
            "engine": str(d["engine"]),
            "group": str(d["group"]),
            "profession": str(d["profession"]),
            "domain_scope": str(d["domain_scope"]),
            "parent_team_id": h.get("parent_team_id"),
            "children": h.get("children") or [],
            "has_active_assignment": bool(has_asg),
        }


def update_team_engine(conn: Any, *, team_id: str, engine: str) -> dict[str, Any]:
    """Persist teams.engine (BUILD — team_00 actor enforced at route)."""
    from agents_os_v3.modules.state.errors import StateMachineError

    with conn:
        with conn.cursor() as cur:
            cur.execute(
                "UPDATE teams SET engine = %s WHERE id = %s",
                (engine, team_id),
            )
            if cur.rowcount == 0:
                raise StateMachineError(
                    "NOT_FOUND",
                    404,
                    details={"team_id": team_id},
                )
    return {"team_id": team_id, "engine": engine}


def list_runs_paginated(
    conn: Any,
    *,
    status_csv: str | None,
    domain_id: str | None,
    current_gate_id: str | None = None,
    limit: int,
    offset: int,
) -> dict[str, Any]:
    if limit < 1 or limit > 100:
        from agents_os_v3.modules.state.errors import StateMachineError

        raise StateMachineError("INVALID_LIMIT", 400, details={"limit": limit})
    if offset < 0:
        from agents_os_v3.modules.state.errors import StateMachineError

        raise StateMachineError("INVALID_HISTORY_PARAMS", 400, details={"offset": offset})

    statuses: list[str] | None = None
    if status_csv:
        statuses = [s.strip() for s in status_csv.split(",") if s.strip()]

    with conn.cursor() as cur:
        where = ["1=1"]
        args: list[Any] = []
        if statuses:
            where.append("status = ANY(%s)")
            args.append(statuses)
        if domain_id:
            where.append("domain_id = %s")
            args.append(domain_id)
        if current_gate_id:
            where.append("current_gate_id = %s")
            args.append(current_gate_id)
        wsql = " AND ".join(where)
        cur.execute(f"SELECT COUNT(*) AS c FROM runs WHERE {wsql}", args)
        total = int(cur.fetchone()["c"])
        cur.execute(
            f"""
            SELECT r.id, r.work_package_id, r.domain_id, r.status, r.process_variant,
                   r.current_gate_id, r.current_phase_id, r.correction_cycle_count,
                   r.started_at, r.completed_at
            FROM runs r
            WHERE {wsql}
            ORDER BY r.last_updated DESC
            LIMIT %s OFFSET %s
            """,
            [*args, limit, offset],
        )
        runs_out: list[dict[str, Any]] = []
        for row in cur.fetchall() or []:
            r = dict(row)
            rid = str(r["id"])
            cur.execute("SELECT * FROM runs WHERE id = %s", (rid,))
            full = dict(cur.fetchone())
            from agents_os_v3.modules.routing.resolver import resolve_actor_team_id

            aid = None
            if str(full["status"]) in ("IN_PROGRESS", "CORRECTION"):
                aid = resolve_actor_team_id(cur, full)
            def _iso(v: Any) -> str | None:
                if v is None:
                    return None
                return v.isoformat().replace("+00:00", "Z") if hasattr(v, "isoformat") else str(v)

            runs_out.append(
                {
                    "run_id": rid,
                    "work_package_id": str(r["work_package_id"]),
                    "domain_id": str(r["domain_id"]),
                    "status": str(r["status"]),
                    "process_variant": str(r["process_variant"]),
                    "current_gate_id": str(r["current_gate_id"]) if r.get("current_gate_id") else None,
                    "current_phase_id": str(r["current_phase_id"]) if r.get("current_phase_id") else None,
                    "correction_cycle_count": int(r["correction_cycle_count"]),
                    "started_at": _iso(r.get("started_at")) or "",
                    "completed_at": _iso(r.get("completed_at")),
                    "current_actor_team_id": aid,
                }
            )
        return {"total": total, "limit": limit, "offset": offset, "runs": runs_out}


def list_work_packages(conn: Any) -> dict[str, Any]:
    with conn.cursor() as cur:
        cur.execute(
            """
            SELECT w.id, w.label, w.domain_id, w.status, w.linked_run_id
            FROM work_packages w
            ORDER BY w.id ASC
            """
        )
        wps: list[dict[str, Any]] = []
        for row in cur.fetchall() or []:
            w = dict(row)
            wps.append(
                {
                    "wp_id": str(w["id"]),
                    "label": str(w["label"]),
                    "domain_id": str(w["domain_id"]),
                    "status": str(w["status"]),
                    "linked_run_id": str(w["linked_run_id"]) if w.get("linked_run_id") else None,
                }
            )
        return {"work_packages": wps}


def get_work_package(conn: Any, wp_id: str) -> dict[str, Any]:
    from agents_os_v3.modules.routing.resolver import resolve_actor_team_id
    from agents_os_v3.modules.state.errors import StateMachineError

    with conn.cursor() as cur:
        cur.execute("SELECT * FROM work_packages WHERE id = %s", (wp_id,))
        row = cur.fetchone()
        if not row:
            raise StateMachineError("NOT_FOUND", 404, details={"wp_id": wp_id})
        w = dict(row)
        linked_run = None
        lr = w.get("linked_run_id")
        if lr:
            cur.execute("SELECT * FROM runs WHERE id = %s", (str(lr),))
            rr = cur.fetchone()
            if rr:
                r = dict(rr)
                aid = None
                if str(r["status"]) in ("IN_PROGRESS", "CORRECTION"):
                    aid = resolve_actor_team_id(cur, r)
                linked_run = {
                    "run_id": str(r["id"]),
                    "status": str(r["status"]),
                    "current_gate_id": str(r["current_gate_id"]) if r.get("current_gate_id") else None,
                    "current_phase_id": str(r["current_phase_id"]) if r.get("current_phase_id") else None,
                    "current_actor_team_id": aid,
                }
        return {
            "wp_id": str(w["id"]),
            "label": str(w["label"]),
            "domain_id": str(w["domain_id"]),
            "status": str(w["status"]),
            "linked_run_id": str(w["linked_run_id"]) if w.get("linked_run_id") else None,
            "linked_run": linked_run,
        }


def list_ideas(
    conn: Any,
    *,
    status: str | None,
    priority: str | None,
    limit: int,
    offset: int,
) -> dict[str, Any]:
    if limit < 1 or limit > 200:
        from agents_os_v3.modules.state.errors import StateMachineError

        raise StateMachineError("INVALID_LIMIT", 400, details={"limit": limit})
    if offset < 0:
        from agents_os_v3.modules.state.errors import StateMachineError

        raise StateMachineError("INVALID_HISTORY_PARAMS", 400, details={"offset": offset})

    with conn.cursor() as cur:
        where = ["1=1"]
        args: list[Any] = []
        if status:
            where.append("status = %s")
            args.append(status)
        if priority:
            where.append("priority = %s")
            args.append(priority)
        wsql = " AND ".join(where)
        cur.execute(f"SELECT COUNT(*) AS c FROM ideas WHERE {wsql}", args)
        total = int(cur.fetchone()["c"])
        cur.execute(
            f"""
            SELECT id, title, description, domain_id, idea_type, status, priority, submitted_by, submitted_at,
                   decision_notes, target_program_id, updated_at
            FROM ideas
            WHERE {wsql}
            ORDER BY updated_at DESC
            LIMIT %s OFFSET %s
            """,
            [*args, limit, offset],
        )
        ideas: list[dict[str, Any]] = []
        for row in cur.fetchall() or []:
            i = dict(row)
            ideas.append(
                {
                    "idea_id": str(i["id"]),
                    "title": str(i["title"]),
                    "description": i.get("description"),
                    "domain_id": str(i["domain_id"]) if i.get("domain_id") else None,
                    "idea_type": str(i["idea_type"]) if i.get("idea_type") else "FEATURE",
                    "status": str(i["status"]),
                    "priority": str(i["priority"]),
                    "submitted_by": str(i["submitted_by"]),
                    "submitted_at": i["submitted_at"].isoformat().replace("+00:00", "Z")
                    if i.get("submitted_at")
                    else "",
                    "decision_notes": i.get("decision_notes"),
                    "target_program_id": str(i["target_program_id"]) if i.get("target_program_id") else None,
                    "updated_at": i["updated_at"].isoformat().replace("+00:00", "Z")
                    if i.get("updated_at")
                    else "",
                }
            )
        return {"total": total, "limit": limit, "offset": offset, "ideas": ideas}


_IDEA_TYPES_FK = frozenset(
    {"BUG", "FEATURE", "IMPROVEMENT", "TECH_DEBT", "RESEARCH"}
)


def create_idea(
    conn: Any,
    *,
    actor_team_id: str,
    title: str,
    description: str | None,
    priority: str,
    domain_id: str,
    idea_type: str = "FEATURE",
) -> dict[str, Any]:
    from agents_os_v3.modules.state.errors import StateMachineError

    t = (title or "").strip()
    if not t:
        raise StateMachineError("IDEA_TITLE_REQUIRED", 400, details={})
    pr = priority.upper()
    if pr not in ("LOW", "MEDIUM", "HIGH", "CRITICAL"):
        raise StateMachineError("INVALID_ACTION", 400, details={"priority": priority})
    it = (idea_type or "FEATURE").strip().upper()
    if it not in _IDEA_TYPES_FK:
        raise StateMachineError("INVALID_IDEA_TYPE", 400, details={"idea_type": idea_type})

    from ulid import ULID

    iid = str(ULID())
    with conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO ideas (
                  id, title, description, domain_id, idea_type, status, priority,
                  submitted_by, submitted_at, decision_notes, target_program_id, updated_at
                ) VALUES (
                  %s, %s, %s, %s, %s, 'NEW', %s,
                  %s, NOW(), NULL, NULL, NOW()
                )
                """,
                (iid, t, description, domain_id, it, pr, actor_team_id),
            )
            cur.execute("SELECT submitted_at FROM ideas WHERE id = %s", (iid,))
            sa = cur.fetchone()["submitted_at"]
    sa_s = sa.isoformat().replace("+00:00", "Z") if hasattr(sa, "isoformat") else str(sa)
    return {
        "idea_id": iid,
        "title": t,
        "description": description,
        "domain_id": domain_id,
        "idea_type": it,
        "status": "NEW",
        "priority": pr,
        "submitted_by": actor_team_id,
        "submitted_at": sa_s,
    }


def update_idea(
    conn: Any,
    *,
    idea_id: str,
    actor_team_id: str,
    body: dict[str, Any],
) -> dict[str, Any]:
    """PUT ideas — AD-S8A-04: if body contains `status` key and caller lacks authority → 403 whole request."""
    from agents_os_v3.modules.state.errors import StateMachineError

    with conn.cursor() as cur:
        if "status" in body and not UC.can_change_idea_status(cur, actor_team_id):
            raise StateMachineError("INSUFFICIENT_AUTHORITY", 403, details={"field": "status"})
        cur.execute("SELECT * FROM ideas WHERE id = %s", (idea_id,))
        row = cur.fetchone()
        if not row:
            raise StateMachineError("IDEA_NOT_FOUND", 404, details={"idea_id": idea_id})

    sets: list[str] = []
    vals: list[Any] = []
    allowed = ("title", "description", "status", "priority", "decision_notes", "target_program_id")
    for k in allowed:
        if k not in body:
            continue
        v = body[k]
        sets.append(f"{k} = %s")
        vals.append(v)
    if not sets:
        with conn.cursor() as cur2:
            cur2.execute("SELECT * FROM ideas WHERE id = %s", (idea_id,))
            r = cur2.fetchone()
            return _idea_row_to_api(dict(r))
    sets.append("updated_at = NOW()")
    vals.append(idea_id)
    with conn:
        with conn.cursor() as cur3:
            cur3.execute(
                f"UPDATE ideas SET {', '.join(sets)} WHERE id = %s",
                vals,
            )
            cur3.execute("SELECT * FROM ideas WHERE id = %s", (idea_id,))
            return _idea_row_to_api(dict(cur3.fetchone()))


def _idea_row_to_api(i: dict[str, Any]) -> dict[str, Any]:
    return {
        "idea_id": str(i["id"]),
        "title": str(i["title"]),
        "description": i.get("description"),
        "domain_id": str(i["domain_id"]) if i.get("domain_id") else None,
        "idea_type": str(i["idea_type"]) if i.get("idea_type") else "FEATURE",
        "status": str(i["status"]),
        "priority": str(i["priority"]),
        "submitted_by": str(i["submitted_by"]),
        "submitted_at": i["submitted_at"].isoformat().replace("+00:00", "Z")
        if i.get("submitted_at")
        else "",
        "decision_notes": i.get("decision_notes"),
        "target_program_id": str(i["target_program_id"]) if i.get("target_program_id") else None,
        "updated_at": i["updated_at"].isoformat().replace("+00:00", "Z") if i.get("updated_at") else "",
    }
