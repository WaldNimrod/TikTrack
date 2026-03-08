#!/usr/bin/env python3
"""
S002-P002 Evidence Signing Service (Team 60).
Signs a payload (e.g. MATERIALIZATION_EVIDENCE.json) with Ed25519.
Outputs the signature block required by the Evidence Contract.

Usage:
  python sign_evidence.py < payload.json
  python sign_evidence.py --file path/to/evidence.json

Env:
  ED25519_PRIVATE_KEY_PATH  — path to PEM file (default: ./keys/ed25519_team60.pem)
  ED25519_KEY_ID            — key identifier (default: team60-s002-p002-001)
  SIGNED_BY_TEAM            — signed_by_team value (default: Team_60)

Output (stdout): JSON object with signature_block (Ed25519, key_id, signature_base64,
  signed_payload_sha256, signed_at_utc, signed_by_team).
"""

import argparse
import hashlib
import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

# Ed25519 from cryptography (already in api/requirements.txt; run from repo root or set PYTHONPATH)
try:
    from cryptography.hazmat.primitives import serialization
    from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey
except ImportError:
    print("ERROR: cryptography required. Install: pip install cryptography", file=sys.stderr)
    sys.exit(1)


def load_private_key(path: str) -> Ed25519PrivateKey:
    with open(path, "rb") as f:
        return serialization.load_pem_private_key(f.read(), password=None)


def sign_payload(payload_bytes: bytes, key: Ed25519PrivateKey) -> bytes:
    return key.sign(payload_bytes)


def main() -> int:
    parser = argparse.ArgumentParser(description="Sign evidence payload (Ed25519)")
    parser.add_argument("--file", "-f", help="Path to payload JSON file (default: stdin)")
    parser.add_argument("--key-path", "-k", default=os.environ.get("ED25519_PRIVATE_KEY_PATH", "keys/ed25519_team60.pem"), help="Path to Ed25519 private key PEM")
    parser.add_argument("--key-id", default=os.environ.get("ED25519_KEY_ID", "team60-s002-p002-001"), help="Key identifier")
    parser.add_argument("--signed-by", default=os.environ.get("SIGNED_BY_TEAM", "Team_60"), help="signed_by_team value")
    args = parser.parse_args()

    if args.file:
        with open(args.file, "rb") as f:
            payload_bytes = f.read()
    else:
        payload_bytes = sys.stdin.buffer.read()

    if not payload_bytes.strip():
        print("ERROR: Empty payload", file=sys.stderr)
        return 1

    # Normalize to canonical JSON for deterministic hash (optional: re-serialize if input is JSON)
    try:
        obj = json.loads(payload_bytes.decode("utf-8"))
        payload_bytes = json.dumps(obj, sort_keys=True, separators=(",", ":")).encode("utf-8")
    except (json.JSONDecodeError, UnicodeDecodeError):
        pass

    key_path = Path(args.key_path)
    if not key_path.is_absolute():
        key_path = Path(__file__).resolve().parent / key_path
    if not key_path.exists():
        print(f"ERROR: Key file not found: {key_path}", file=sys.stderr)
        print("Generate with: openssl genpkey -algorithm Ed25519 -out keys/ed25519_team60.pem", file=sys.stderr)
        return 1

    key = load_private_key(str(key_path))
    signature = sign_payload(payload_bytes, key)
    signature_base64 = __import__("base64").b64encode(signature).decode("ascii")
    signed_payload_sha256 = hashlib.sha256(payload_bytes).hexdigest()
    signed_at_utc = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    block = {
        "signature_block": {
            "algorithm": "Ed25519",
            "key_id": args.key_id,
            "signature_base64": signature_base64,
            "signed_payload_sha256": signed_payload_sha256,
            "signed_at_utc": signed_at_utc,
            "signed_by_team": args.signed_by,
        }
    }
    print(json.dumps(block, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
