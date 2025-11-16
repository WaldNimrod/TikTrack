from __future__ import annotations

import hashlib
from typing import Any, Dict, Iterable


def _normalize(value: Any) -> bytes:
    if value is None:
        return b"null"
    if isinstance(value, (bytes, bytearray)):
        return bytes(value)
    if isinstance(value, str):
        return value.encode("utf-8", errors="ignore")
    if isinstance(value, (int, float, bool)):
        return str(value).encode("utf-8")
    # fallback: repr for deterministic textual form
    return repr(value).encode("utf-8", errors="ignore")


def compute_etag_for_group(
    user_id: int,
    profile_id: int,
    group_name: str,
    registry_version: int,
    last_updated_ts: str,
    payload_digest_seed: Iterable[bytes] | None = None,
) -> str:
    """
    Compute a stable ETag for a group's payload using core attributes and an optional payload seed.
    """
    h = hashlib.sha256()
    h.update(str(user_id).encode())
    h.update(b":")
    h.update(str(profile_id).encode())
    h.update(b":")
    h.update(group_name.encode())
    h.update(b":")
    h.update(str(registry_version).encode())
    h.update(b":")
    h.update(_normalize(last_updated_ts))
    if payload_digest_seed:
        for chunk in payload_digest_seed:
            h.update(b":")
            h.update(chunk)
    return f"W/\"{h.hexdigest()}\""


def compute_etag_for_bootstrap(
    user_id: int,
    profile_id: int,
    registry_version: int,
    group_etags: Dict[str, str],
    generated_at: str,
) -> str:
    """
    Compute a bootstrap ETag from constituent group ETags and context.
    """
    h = hashlib.sha256()
    h.update(str(user_id).encode())
    h.update(b":")
    h.update(str(profile_id).encode())
    h.update(b":")
    h.update(str(registry_version).encode())
    for group in sorted(group_etags.keys()):
        h.update(b":")
        h.update(group.encode())
        h.update(b"=")
        h.update(group_etags[group].encode())
    h.update(b":")
    h.update(generated_at.encode())
    return f"W/\"{h.hexdigest()}\""



