"""
conftest.py — session-scoped state-file guard.

KB-75: PipelineState.advance_gate() auto-calls save(), and some tests
(e.g. test_integration.py::TestG35G36Chain) construct PipelineState objects
with the default project_domain="tiktrack" and call advance_gate() in-memory
without monkeypatching get_state_file(). This silently overwrites the canonical
live state files during a pytest run, corrupting any active monitored pipeline run.

FIX: Snapshot all canonical domain state files at session start and restore
them at session end — even when tests fail or raise.  This is a pure safety net;
individual test files that already use monkeypatch continue to do so.

Iron Rule: no test run may permanently alter the live pipeline state.
"""

from __future__ import annotations

import sys
from pathlib import Path
from typing import Generator

import pytest

# Resolve repo root so we can import config without installing the package.
_REPO = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(_REPO))


@pytest.fixture(scope="session", autouse=True)
def _guard_canonical_state_files() -> Generator[None, None, None]:
    """
    Snapshot all canonical domain state files before the session starts,
    restore them unconditionally when the session ends.

    Scope: session — runs once for the entire pytest invocation.
    autouse: True — active for every test without opt-in.
    """
    from agents_os_v2.config import DOMAIN_STATE_FILES

    # Build {path: original_bytes | None} map.  None means file did not exist.
    snapshots: dict[Path, bytes | None] = {}
    for path in DOMAIN_STATE_FILES.values():
        if path.exists():
            snapshots[path] = path.read_bytes()
        else:
            snapshots[path] = None

    yield  # ← all tests run here

    # Restore phase — unconditional (runs even on KeyboardInterrupt / exception).
    for path, original in snapshots.items():
        try:
            if original is None:
                # File did not exist before tests; remove it if tests created it.
                if path.exists():
                    path.unlink()
            else:
                # Restore original content (atomic write via temp file).
                import os
                import tempfile

                path.parent.mkdir(parents=True, exist_ok=True)
                fd, tmp = tempfile.mkstemp(
                    suffix=".json", dir=path.parent, prefix=".conftest_restore_"
                )
                try:
                    os.write(fd, original)
                    os.close(fd)
                    os.replace(tmp, path)
                except Exception:
                    try:
                        os.close(fd)
                    except Exception:
                        pass
                    try:
                        os.unlink(tmp)
                    except Exception:
                        pass
                    # Last-resort direct write — still better than leaving corruption.
                    path.write_bytes(original)
        except Exception as exc:  # pragma: no cover
            # Never let restore errors crash the session report.
            print(f"\nWARN conftest: failed to restore {path}: {exc}")
