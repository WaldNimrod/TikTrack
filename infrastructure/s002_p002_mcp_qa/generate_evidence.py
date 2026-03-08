#!/usr/bin/env python3
"""
S002-P002 MATERIALIZATION_EVIDENCE.json generator (Team 60).
Builds payload with provenance, gate context, artifact path; optionally signs via sign_evidence.py.

Usage:
  python generate_evidence.py --provenance TARGET_RUNTIME --gate GATE_3_PREPARATION --artifact path/to/artifact.json [--sign] [--out path]

Env:
  SIGN_EVIDENCE=1 or --sign: run scripts/signing/sign_evidence.py and merge signature_block into output.
"""

import argparse
import json
import os
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
SIGNING_SCRIPT = REPO_ROOT / "scripts" / "signing" / "sign_evidence.py"


def main() -> int:
    parser = argparse.ArgumentParser(description="Generate MATERIALIZATION_EVIDENCE.json")
    parser.add_argument("--provenance", "-p", required=True, choices=["TARGET_RUNTIME", "LOCAL_DEV_NON_AUTHORITATIVE", "SIMULATION"], help="Provenance tag")
    parser.add_argument("--gate", "-g", default="GATE_3_PREPARATION", help="Gate context")
    parser.add_argument("--artifact", "-a", required=True, help="Traceable artifact path (relative to repo or absolute)")
    parser.add_argument("--program", default="S002-P002", help="Program id")
    parser.add_argument("--sign", "-s", action="store_true", help="Sign payload and add signature_block")
    parser.add_argument("--out", "-o", help="Write output to file (default: stdout)")
    parser.add_argument("--extra", type=str, help="JSON string of extra keys to merge into payload")
    args = parser.parse_args()

    payload = {
        "program_id": args.program,
        "gate_id": args.gate,
        "provenance": args.provenance,
        "artifact_path": args.artifact,
        "generated_at_utc": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
    }
    if args.extra:
        try:
            payload.update(json.loads(args.extra))
        except json.JSONDecodeError as e:
            print(f"ERROR: --extra invalid JSON: {e}", file=sys.stderr)
            return 1

    payload_bytes = json.dumps(payload, indent=2).encode("utf-8")

    if args.sign and SIGNING_SCRIPT.exists():
        proc = subprocess.run(
            [sys.executable, str(SIGNING_SCRIPT)],
            input=payload_bytes,
            capture_output=True,
            cwd=str(REPO_ROOT),
        )
        if proc.returncode != 0:
            print(proc.stderr.decode("utf-8", errors="replace"), file=sys.stderr)
            return proc.returncode
        sig_json = json.loads(proc.stdout.decode("utf-8"))
        payload["signature_block"] = sig_json["signature_block"]

    out = json.dumps(payload, indent=2)
    if args.out:
        Path(args.out).write_text(out, encoding="utf-8")
        print(f"Wrote {args.out}", file=sys.stderr)
    else:
        print(out)
    return 0


if __name__ == "__main__":
    sys.exit(main())
