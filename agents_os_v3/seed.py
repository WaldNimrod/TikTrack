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
            for team_key in ("team_00", "team_10", "team_11"):
                t = data.get(team_key)
                if not t:
                    continue
                cur.execute(
                    """
                    INSERT INTO teams (
                      id, label, name, engine, domain_scope, in_gate_process,
                      "group", profession, operating_mode, roster_version, created_at
                    ) VALUES (
                      %(id)s, %(label)s, %(name)s, %(engine)s, %(domain_scope)s, %(in_gate_process)s,
                      %(group)s, %(profession)s, %(operating_mode)s, %(roster_version)s, %(created_at)s::timestamptz
                    )
                    ON CONFLICT (id) DO NOTHING
                    """,
                    {**t, "group": t["group"]},
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
                      id, label, domain_id, status, linked_run_id, created_at, updated_at
                    ) VALUES (
                      %(id)s, %(label)s, %(domain_id)s, %(status)s, %(linked_run_id)s, NOW(), NOW()
                    )
                    ON CONFLICT (id) DO NOTHING
                    """,
                    wp,
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
