#!/usr/bin/env python3
"""
TikTrack Post-Update Validation
===============================

Runs core verification scripts and optional HTTP health checks after a release.
"""

from __future__ import annotations

import argparse
import http.client
import subprocess
import sys
from pathlib import Path
from typing import Iterable, Tuple

PROJECT_ROOT = Path(__file__).resolve().parents[3]
PYTHON = sys.executable


def run_command(cmd: Iterable[str], label: str) -> bool:
    print(f"▶️  {label}")
    print(f"    {' '.join(cmd)}")
    result = subprocess.run(cmd, cwd=PROJECT_ROOT)
    if result.returncode == 0:
        print(f"    ✅ {label}\n")
        return True
    print(f"    ❌ {label} failed with return code {result.returncode}\n")
    return False


def check_health(url: str) -> Tuple[bool, str]:
    if not url.startswith(("http://", "https://")):
        return False, "URL must start with http:// or https://"
    parsed = http.client.urlsplit(url)
    connection_class = http.client.HTTPSConnection if parsed.scheme == "https" else http.client.HTTPConnection
    try:
        conn = connection_class(parsed.netloc, timeout=5)
        path = parsed.path or "/"
        if parsed.query:
            path = f"{path}?{parsed.query}"
        conn.request("GET", path)
        response = conn.getresponse()
        body = response.read(256)
        conn.close()
    except Exception as exc:  # noqa: BLE001
        return False, f"Request error: {exc}"

    if 200 <= response.status < 300:
        return True, f"{response.status} {response.reason} ({body.decode('utf-8', 'ignore')})"
    return False, f"{response.status} {response.reason} ({body.decode('utf-8', 'ignore')})"


def parse_args(argv):
    parser = argparse.ArgumentParser(description="Run post-update validation.")
    parser.add_argument(
        "--health-url",
        help="Optional URL to ping (e.g., http://localhost:5001/api/health).",
    )
    parser.add_argument(
        "--skip-schema",
        action="store_true",
        help="Skip schema verification if already executed.",
    )
    parser.add_argument(
        "--skip-isolation",
        action="store_true",
        help="Skip verify_production_isolation.sh.",
    )
    return parser.parse_args(argv)


def main(argv) -> int:
    args = parse_args(argv)

    print("✅ TikTrack Post-Update Validation")
    print("=================================\n")

    if not args.skip_schema:
        if not run_command(
            [PYTHON, str(PROJECT_ROOT / "scripts" / "release" / "verify_schema.py")],
            "Schema validation",
        ):
            return 1

    if not args.skip_isolation:
        if not run_command(
            [str(PROJECT_ROOT / "scripts" / "verify_production_isolation.sh")],
            "Isolation verification",
        ):
            return 1

    if not run_command(
        [str(PROJECT_ROOT / "scripts" / "verify_production.sh")],
        "Production file verification",
    ):
        return 1

    if args.health_url:
        ok, message = check_health(args.health_url)
        if ok:
            print(f"🌐 Health check succeeded: {message}\n")
        else:
            print(f"🌐 Health check failed: {message}\n")
            return 1

    print("🎉 Post-update validation completed successfully!")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))

