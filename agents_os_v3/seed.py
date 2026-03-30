#!/usr/bin/env python3
"""
Idempotent operational seed for AOS v3 (GATE_0).

Loads ``definition.yaml`` and upserts minimal rows per DDL Spec §3 + Entity Dictionary v2.0.2.
Fresh install: ``001_aos_v3_fresh_schema_v1.0.2.sql`` already embeds the same seed; this script
re-applies safely after migrations or for drift repair.

Environment:
  AOS_V3_DATABASE_URL — postgresql://… (AOS v3 database only; isolated from TikTrack app DB).
"""
from __future__ import annotations

import os
import sys
from pathlib import Path

import psycopg2
import yaml

ROOT = Path(__file__).resolve().parent
DEFINITION = ROOT / "definition.yaml"


def _url() -> str:
    u = (os.environ.get("AOS_V3_DATABASE_URL") or "").strip()
    if not u:
        print("ERROR: set AOS_V3_DATABASE_URL (AOS v3 DB only).", file=sys.stderr)
        sys.exit(1)
    return u


def main() -> None:
    data = yaml.safe_load(DEFINITION.read_text(encoding="utf-8"))
    url = _url()
    conn = psycopg2.connect(url)
    conn.autocommit = True
    try:
        with conn.cursor() as cur:
            import json as _json

            team_keys = sorted(
                k for k in data if str(k).startswith("team_") and isinstance(data.get(k), dict)
            )
            for team_key in team_keys:
                t = data.get(team_key)
                if not t or not t.get("id"):
                    continue
                # Serialise JSONB fields (dicts/lists → JSON strings for psycopg2)
                gate_authority = t.get("gate_authority") or {}
                writes_to = t.get("writes_to") or []
                iron_rules = t.get("iron_rules") or []
                mandatory_reads = t.get("mandatory_reads") or []
                cur.execute(
                    """
                    INSERT INTO teams (
                      id, label, name, engine, domain_scope, in_gate_process,
                      "group", profession, operating_mode, roster_version,
                      role_description, gate_authority, writes_to, iron_rules,
                      mandatory_reads, created_at
                    ) VALUES (
                      %(id)s, %(label)s, %(name)s, %(engine)s, %(domain_scope)s, %(in_gate_process)s,
                      %(group)s, %(profession)s, %(operating_mode)s, %(roster_version)s,
                      %(role_description)s, %(gate_authority)s::jsonb, %(writes_to)s::jsonb,
                      %(iron_rules)s::jsonb, %(mandatory_reads)s::jsonb, %(created_at)s::timestamptz
                    )
                    ON CONFLICT (id) DO UPDATE SET
                      name             = EXCLUDED.name,
                      engine           = EXCLUDED.engine,
                      domain_scope     = EXCLUDED.domain_scope,
                      in_gate_process  = EXCLUDED.in_gate_process,
                      "group"          = EXCLUDED."group",
                      profession       = EXCLUDED.profession,
                      operating_mode   = EXCLUDED.operating_mode,
                      roster_version   = EXCLUDED.roster_version,
                      role_description = EXCLUDED.role_description,
                      gate_authority   = EXCLUDED.gate_authority,
                      writes_to        = EXCLUDED.writes_to,
                      iron_rules       = EXCLUDED.iron_rules,
                      mandatory_reads  = EXCLUDED.mandatory_reads
                    """,
                    {
                        **t,
                        "group": t["group"],
                        "role_description": t.get("role_description"),
                        "gate_authority": _json.dumps(gate_authority),
                        "writes_to": _json.dumps(writes_to),
                        "iron_rules": _json.dumps(iron_rules),
                        "mandatory_reads": _json.dumps(mandatory_reads),
                    },
                )

            for d in data["domains"]:
                cur.execute(
                    """
                    INSERT INTO domains (id, slug, display_name, default_variant, doc_team_id, is_active, created_at)
                    VALUES (%(id)s, %(slug)s, %(display_name)s, %(default_variant)s, %(doc_team_id)s, %(is_active)s, NOW())
                    ON CONFLICT (id) DO NOTHING
                    """,
                    d,
                )

            for g in data["gates"]:
                cur.execute(
                    """
                    INSERT INTO gates (id, sequence_order, name, is_human_gate, description)
                    VALUES (%(id)s, %(sequence_order)s, %(name)s, %(is_human_gate)s, %(description)s)
                    ON CONFLICT (id) DO NOTHING
                    """,
                    g,
                )

            for ph in data["phases"]:
                cur.execute(
                    """
                    INSERT INTO phases (id, gate_id, sequence_order, name, allow_auto, display_in_ui)
                    VALUES (%(id)s, %(gate_id)s, %(sequence_order)s, %(name)s, %(allow_auto)s, %(display_in_ui)s)
                    ON CONFLICT (id) DO NOTHING
                    """,
                    ph,
                )

            for pr in data["pipeline_roles"]:
                cur.execute(
                    """
                    INSERT INTO pipeline_roles (id, name, display_name, description, can_block_gate, is_seeded, created_at)
                    VALUES (%(id)s, %(name)s, %(display_name)s, %(description)s, %(can_block_gate)s, %(is_seeded)s, NOW())
                    ON CONFLICT (id) DO NOTHING
                    """,
                    pr,
                )

            for tpl in data.get("templates", []):
                cur.execute(
                    """
                    INSERT INTO templates (
                      id, gate_id, phase_id, domain_id, name, body_markdown, version, is_active, updated_at
                    ) VALUES (
                      %(id)s, %(gate_id)s, %(phase_id)s, %(domain_id)s, %(name)s, %(body_markdown)s,
                      %(version)s, %(is_active)s, NOW()
                    )
                    ON CONFLICT (id) DO NOTHING
                    """,
                    tpl,
                )

            for pol in data["policies"]:
                cur.execute(
                    """
                    INSERT INTO policies (
                      id, scope_type, domain_id, gate_id, phase_id,
                      policy_key, policy_value_json, priority, updated_at
                    ) VALUES (
                      %(id)s, %(scope_type)s, %(domain_id)s, %(gate_id)s, %(phase_id)s,
                      %(policy_key)s, %(policy_value_json)s, %(priority)s, NOW()
                    )
                    ON CONFLICT (id) DO NOTHING
                    """,
                    pol,
                )

            for rr in data.get("routing_rules", []):
                cur.execute(
                    """
                    INSERT INTO routing_rules (
                      id, gate_id, phase_id, domain_id, variant, role_id,
                      priority, resolve_from_state_key, created_at
                    ) VALUES (
                      %(id)s, %(gate_id)s, %(phase_id)s, %(domain_id)s, %(variant)s, %(role_id)s,
                      %(priority)s, %(resolve_from_state_key)s, NOW()
                    )
                    ON CONFLICT (id) DO NOTHING
                    """,
                    rr,
                )

            for wp in data.get("work_packages", []):
                cur.execute(
                    """
                    INSERT INTO work_packages (
                      id, label, domain_id, status, linked_run_id, stage_id, program_id, created_at, updated_at
                    ) VALUES (
                      %(id)s, %(label)s, %(domain_id)s, %(status)s, %(linked_run_id)s,
                      %(stage_id)s, %(program_id)s, NOW(), NOW()
                    )
                    ON CONFLICT (id) DO NOTHING
                    """,
                    wp,
                )

            for idea in data.get("ideas", []):
                cur.execute(
                    """
                    INSERT INTO ideas (
                      id, title, description, domain_id, idea_type, status,
                      priority, submitted_by, decision_notes, target_program_id,
                      submitted_at, updated_at
                    ) VALUES (
                      %(id)s, %(title)s, %(description)s, %(domain_id)s, %(idea_type)s, %(status)s,
                      %(priority)s, %(submitted_by)s, %(decision_notes)s, %(target_program_id)s,
                      NOW(), NOW()
                    )
                    ON CONFLICT (id) DO NOTHING
                    """,
                    {
                        "id": idea["id"],
                        "title": idea["title"],
                        "description": idea.get("description"),
                        "domain_id": idea["domain_id"],
                        "idea_type": idea.get("idea_type", "FEATURE"),
                        "status": idea["status"],
                        "priority": idea["priority"],
                        "submitted_by": idea.get("submitted_by", "team_00"),
                        "decision_notes": idea.get("decision_notes"),
                        "target_program_id": idea.get("target_program_id"),
                    },
                )

            cur.execute("SELECT id FROM teams WHERE id = %s", ("team_00",))
            row = cur.fetchone()
            if not row:
                print("ERROR: D-03 validation failed — team_00 missing after seed", file=sys.stderr)
                sys.exit(1)
        print("OK: seed.py completed (idempotent inserts + D-03 check)")
    finally:
        conn.close()


if __name__ == "__main__":
    main()
