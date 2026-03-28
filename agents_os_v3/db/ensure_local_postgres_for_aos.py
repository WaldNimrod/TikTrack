#!/usr/bin/env python3
"""
Auto-provision Postgres role + database for AOS v3 on local Docker (Team 61).

Reads AOS_V3_DATABASE_URL and, when host is localhost, discovers a running
container whose image looks like Postgres and exposes the URL port, reads
POSTGRES_USER / POSTGRES_PASSWORD from the container, connects to the server
from the host, and ensures:
  - application role exists (LOGIN + password from URL)
  - database exists (OWNER = application user)

No TikTrack coupling — only AOS_V3_DATABASE_URL.

If Docker is unavailable, host is remote, or no Postgres container matches: prints INFO and exits 0 (operator must create DB manually).
"""
from __future__ import annotations

import json
import os
import subprocess
import sys
import urllib.parse


def _run(cmd: list[str], *, check: bool = True) -> subprocess.CompletedProcess[str]:
    return subprocess.run(cmd, capture_output=True, text=True, check=check)


def _discover_postgres_container(url_port: int) -> str | None:
    try:
        r = _run(["docker", "ps", "--format", "{{.Names}}\t{{.Image}}\t{{.Ports}}"], check=False)
    except FileNotFoundError:
        return None
    if r.returncode != 0 or not r.stdout.strip():
        return None
    best: tuple[int, str] | None = None  # (score, name)
    for line in r.stdout.strip().splitlines():
        parts = line.split("\t", 2)
        if len(parts) < 2:
            continue
        name, image = parts[0], parts[1]
        ports = parts[2] if len(parts) > 2 else ""
        if "postgres" not in image.lower():
            continue
        score = 0
        if f":{url_port}->" in ports or f"0.0.0.0:{url_port}->" in ports:
            score = 10
        elif not ports.strip():
            score = 1
        else:
            score = 0
        if best is None or score > best[0]:
            best = (score, name)
    return best[1] if best else None


def _container_postgres_creds(container: str) -> tuple[str, str]:
    r = _run(
        ["docker", "inspect", container, "--format", "{{json .Config.Env}}"],
        check=False,
    )
    if r.returncode != 0:
        return "postgres", ""
    env_list = json.loads(r.stdout or "[]")
    env: dict[str, str] = {}
    for item in env_list:
        if "=" in item:
            k, _, v = item.partition("=")
            env[k] = v
    return (
        env.get("POSTGRES_USER", "postgres"),
        env.get("POSTGRES_PASSWORD", ""),
    )


def main() -> int:
    raw = (os.environ.get("AOS_V3_DATABASE_URL") or "").strip()
    if not raw:
        print("INFO: ensure_local_postgres_for_aos: AOS_V3_DATABASE_URL empty — skip.", file=sys.stderr)
        return 0

    p = urllib.parse.urlparse(raw)
    host = (p.hostname or "localhost").lower()
    if host not in ("127.0.0.1", "localhost", "::1"):
        print(
            f"INFO: ensure_local_postgres_for_aos: host={host!r} — skip Docker auto-provision.",
            file=sys.stderr,
        )
        return 0

    port = p.port or 5432
    app_user = p.username
    app_pass = p.password or ""
    dbname = (p.path or "").lstrip("/").split("?")[0]
    if not app_user or not dbname:
        print(
            "ERROR: AOS_V3_DATABASE_URL must include username and database path.",
            file=sys.stderr,
        )
        return 1

    container = os.environ.get("AOS_V3_DOCKER_PG_CONTAINER", "").strip()
    if not container:
        container = _discover_postgres_container(port) or ""
    if not container:
        print(
            "INFO: ensure_local_postgres_for_aos: no Postgres Docker container found — "
            "create DB/role manually or set AOS_V3_DOCKER_PG_CONTAINER.",
            file=sys.stderr,
        )
        return 0

    super_user, super_pass = _container_postgres_creds(container)
    print(f"INFO: ensure_local_postgres_for_aos: using container={container!r} admin={super_user!r}")

    try:
        import psycopg2
        from psycopg2 import sql
    except ImportError:
        print("ERROR: psycopg2 required (pip install psycopg2-binary).", file=sys.stderr)
        return 1

    try:
        conn = psycopg2.connect(
            host="127.0.0.1",
            port=port,
            user=super_user,
            password=super_pass,
            dbname="postgres",
        )
    except Exception as e:
        print(
            f"ERROR: cannot connect as Docker admin to 127.0.0.1:{port} ({e}). "
            "Check POSTGRES_USER/PASSWORD in the container.",
            file=sys.stderr,
        )
        return 1

    conn.autocommit = True
    try:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT 1 FROM pg_roles WHERE rolname = %s",
                (app_user,),
            )
            if cur.fetchone() is None:
                cur.execute(
                    sql.SQL("CREATE ROLE {} WITH LOGIN PASSWORD {}").format(
                        sql.Identifier(app_user),
                        sql.Literal(app_pass),
                    )
                )
                print(f"INFO: created role {app_user!r}")
            elif app_pass:
                cur.execute(
                    sql.SQL("ALTER ROLE {} WITH PASSWORD {}").format(
                        sql.Identifier(app_user),
                        sql.Literal(app_pass),
                    )
                )
                print(f"INFO: updated password for role {app_user!r}")
            cur.execute(
                "SELECT 1 FROM pg_database WHERE datname = %s",
                (dbname,),
            )
            if cur.fetchone() is None:
                cur.execute(
                    sql.SQL("CREATE DATABASE {} OWNER {} ENCODING 'UTF8'").format(
                        sql.Identifier(dbname),
                        sql.Identifier(app_user),
                    )
                )
                print(f"INFO: created database {dbname!r} owner {app_user!r}")
            else:
                print(f"INFO: database {dbname!r} already exists")
    finally:
        conn.close()

    print("OK: ensure_local_postgres_for_aos — role + database ready.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
