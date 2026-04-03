#!/usr/bin/env python3
"""
Apply AOS v3 DDL migrations using psycopg2 (no psql required).

- --fresh: agents_os_v3/db/migrations/001_aos_v3_fresh_schema_v1.0.2.sql
  Requires an empty public schema (or use --create-db with a new database name).
- --delta: agents_os_v3/db/migrations/002_aos_v3_delta_v1.0.1_to_v1.0.2.sql
  Run pre-flight queries manually first on non-empty DBs (see stage map §0.3).

Environment:
  AOS_V3_DATABASE_URL only (postgresql://…/aos_v3). Do not use TikTrack DATABASE_URL — AOS DB is isolated.

Usage (from repo root):
  export AOS_V3_DATABASE_URL=postgresql://user:pass@localhost:5432/aos_v3
  python3 agents_os_v3/db/run_migration.py --fresh
"""
from __future__ import annotations

import argparse
import os
import sys
from pathlib import Path
from urllib.parse import urlparse, urlunparse

import psycopg2
from psycopg2 import sql as pgsql

ROOT = Path(__file__).resolve().parents[2]
MIGRATIONS = ROOT / "agents_os_v3" / "db" / "migrations"


def _database_url() -> str:
    url = (os.environ.get("AOS_V3_DATABASE_URL") or "").strip()
    if not url:
        print("ERROR: set AOS_V3_DATABASE_URL (AOS v3 DB only; not TikTrack DATABASE_URL).", file=sys.stderr)
        sys.exit(1)
    return url


def _maintenance_url(base: str, maintenance_db: str) -> str:
    p = urlparse(base)
    # Replace path with /maintenance_db
    path = "/" + maintenance_db.lstrip("/")
    return urlunparse((p.scheme, p.netloc, path, "", "", ""))


def ensure_database_exists(base_url: str, target_db: str, maintenance_db: str) -> None:
    murl = _maintenance_url(base_url, maintenance_db)
    conn = psycopg2.connect(murl)
    conn.autocommit = True
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT 1 FROM pg_database WHERE datname = %s", (target_db,))
            if cur.fetchone():
                return
            cur.execute(pgsql.SQL("CREATE DATABASE {}").format(pgsql.Identifier(target_db)))
    finally:
        conn.close()


def _public_table_count(conn) -> int:
    with conn.cursor() as cur:
        cur.execute(
            """
            SELECT COUNT(*) FROM information_schema.tables
            WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
            """
        )
        return int(cur.fetchone()[0])


def run_fresh(url: str, *, allow_nonempty: bool, create_db: str | None, maintenance_db: str) -> None:
    if create_db:
        ensure_database_exists(url, create_db, maintenance_db)
        p = urlparse(url)
        path = "/" + create_db
        url = urlunparse((p.scheme, p.netloc, path, "", "", ""))

    # Fresh install applies the base schema then all structural delta migrations in order.
    # NOTE: data-only migrations (002_wp_id_format_migration, 002_aos_v3_delta) are
    # for upgrading existing installs and are NOT applied in fresh mode.
    fresh_migrations = [
        MIGRATIONS / "001_aos_v3_fresh_schema_v1.0.2.sql",
        MIGRATIONS / "002_add_stage_program_to_work_packages.sql",
        MIGRATIONS / "002_add_failed_run_status.sql",
        MIGRATIONS / "003_add_team_context_columns.sql",
    ]

    conn = psycopg2.connect(url)
    conn.autocommit = False
    try:
        if not allow_nonempty and _public_table_count(conn) > 0:
            print(
                "ERROR: public schema is not empty. Use a dedicated DB or --allow-nonempty (unsafe).",
                file=sys.stderr,
            )
            sys.exit(1)
        for sql_path in fresh_migrations:
            sql = sql_path.read_text(encoding="utf-8")
            with conn.cursor() as cur:
                cur.execute(sql)
            conn.commit()
            print(f"OK: applied {sql_path.name}")
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def run_delta(url: str) -> None:
    sql_path = MIGRATIONS / "002_aos_v3_delta_v1.0.1_to_v1.0.2.sql"
    sql = sql_path.read_text(encoding="utf-8")
    conn = psycopg2.connect(url)
    conn.autocommit = False
    try:
        with conn.cursor() as cur:
            cur.execute(sql)
        conn.commit()
        print(f"OK: applied {sql_path.name}")
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def main() -> None:
    ap = argparse.ArgumentParser(description="Apply AOS v3 SQL migrations.")
    ap.add_argument("--fresh", action="store_true", help="Apply 001 fresh schema (+ embedded seed).")
    ap.add_argument("--delta", action="store_true", help="Apply 002 delta v1.0.1→v1.0.2.")
    ap.add_argument(
        "--create-db",
        metavar="NAME",
        help="Create database NAME on the same server (connects via --maintenance-db first).",
    )
    ap.add_argument(
        "--maintenance-db",
        default="postgres",
        help="Database name for CREATE DATABASE (default: postgres).",
    )
    ap.add_argument(
        "--allow-nonempty",
        action="store_true",
        help="Allow --fresh on non-empty public schema (unsafe).",
    )
    args = ap.parse_args()
    if args.fresh == args.delta:
        print("ERROR: specify exactly one of --fresh or --delta", file=sys.stderr)
        sys.exit(1)

    url = _database_url()
    if args.fresh:
        run_fresh(
            url,
            allow_nonempty=args.allow_nonempty,
            create_db=args.create_db,
            maintenance_db=args.maintenance_db,
        )
    else:
        run_delta(url)


if __name__ == "__main__":
    main()
