#!/usr/bin/env python3
"""
Verify PostgreSQL connectivity for both product domains — strictly isolated URLs.

  - TikTrack app DB: DATABASE_URL from api/.env only (never used for AOS DDL/seed).
  - AOS v3 DB: AOS_V3_DATABASE_URL from agents_os_v3/.env only.

Exit 0 only if both connections succeed. Exit 1 on any failure or missing config.

Usage (from repo root):
  python3 scripts/verify_dual_domain_database_connectivity.py

Optional env overrides (if a key is missing from the corresponding .env file):
  DATABASE_URL, AOS_V3_DATABASE_URL
"""
from __future__ import annotations

import os
import sys
from pathlib import Path

import psycopg2

ROOT = Path(__file__).resolve().parents[1]


def _parse_env_file(path: Path) -> dict[str, str]:
    out: dict[str, str] = {}
    if not path.is_file():
        return out
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, val = line.partition("=")
        key = key.strip()
        val = val.strip().strip('"').strip("'")
        if key:
            out[key] = val
    return out


def _ping(url: str, label: str, *, aos_schema_check: bool) -> None:
    conn = psycopg2.connect(url)
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT 1")
            cur.fetchone()
            if aos_schema_check:
                cur.execute(
                    "SELECT 1 FROM information_schema.tables "
                    "WHERE table_schema = 'public' AND table_name = 'teams'"
                )
                if cur.fetchone() is None:
                    raise RuntimeError("public.teams missing — not an AOS v3 schema on this URL?")
                cur.execute("SELECT 1 FROM teams WHERE id = 'team_00'")
                if cur.fetchone() is None:
                    raise RuntimeError("D-03 seed missing: teams.id = team_00 not found")
    finally:
        conn.close()
    print(f"OK  [{label}] SELECT 1" + (" + AOS schema sanity" if aos_schema_check else ""))


def main() -> int:
    api_env = _parse_env_file(ROOT / "api" / ".env")
    aos_env = _parse_env_file(ROOT / "agents_os_v3" / ".env")

    # File SSOT first; optional env override for CI / one-off checks (same isolation rules apply).
    tt_url = (api_env.get("DATABASE_URL") or os.environ.get("DATABASE_URL") or "").strip()
    aos_url = (
        aos_env.get("AOS_V3_DATABASE_URL") or os.environ.get("AOS_V3_DATABASE_URL") or ""
    ).strip()

    if tt_url and aos_url and tt_url == aos_url:
        print(
            "FAIL [isolation] DATABASE_URL and AOS_V3_DATABASE_URL must not be identical.",
            file=sys.stderr,
        )
        return 1

    fail = False
    if not tt_url:
        print("FAIL [TikTrack app DB] DATABASE_URL missing in api/.env", file=sys.stderr)
        fail = True
    else:
        try:
            _ping(tt_url, "TikTrack app DB (api/.env DATABASE_URL)", aos_schema_check=False)
        except Exception as e:
            print(f"FAIL [TikTrack app DB] {e}", file=sys.stderr)
            fail = True

    if not aos_url:
        print(
            "FAIL [AOS v3 DB] AOS_V3_DATABASE_URL missing in agents_os_v3/.env",
            file=sys.stderr,
        )
        fail = True
    else:
        try:
            _ping(aos_url, "AOS v3 DB (agents_os_v3/.env AOS_V3_DATABASE_URL)", aos_schema_check=True)
        except Exception as e:
            print(f"FAIL [AOS v3 DB] {e}", file=sys.stderr)
            fail = True

    if fail:
        print(
            "\nIsolation rule: do not point AOS_V3_DATABASE_URL at the TikTrack application database.",
            file=sys.stderr,
        )
        return 1
    print("PASS — both domain databases reachable with correct separation.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
