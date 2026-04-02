"""Canonical coordination filename builder (S003-P011-WP002 D-09 / LLD400 §12)."""

from __future__ import annotations

import re
from typing import Any


class CanonicalPathBuilder:
    """Build and parse canonical `_COMMUNICATION` artifact filenames."""

    @staticmethod
    def build(
        sender: str,
        wp_id: str,
        gate: str,
        doc_type: str,
        version: str,
        recipient: str | None = None,
        phase: str | None = None,
    ) -> str:
        """Return canonical filename (not full path). wp_id may use - or _."""
        wp_u = wp_id.replace("-", "_")
        g = gate.upper().replace(" ", "_")
        suffix = f"{doc_type}_v{version}"
        if recipient:
            suffix = f"{suffix}_{recipient}"
        # phase reserved for future extended pattern; not appended in v1 filename shape
        _ = phase  # noqa: F841 — API parity with LLD400 §12
        return f"TEAM_{sender}_{wp_u}_{g}_{suffix}.md"

    @staticmethod
    def parse(filename: str) -> dict[str, Any]:
        """Parse canonical filename; raises ValueError if not matched."""
        name = filename.split("/")[-1]
        m = re.match(
            r"^TEAM_(?P<sender>\d+)_(?P<wp>S\d{3}_P\d{3}_WP\d{3})_(?P<gate>GATE_\d+)_(?P<rest>.+)\.md$",
            name,
        )
        if not m:
            raise ValueError(f"Not a canonical coordination filename: {filename}")
        sender, wp, gate, rest = m.group("sender"), m.group("wp"), m.group("gate"), m.group("rest")
        vm = re.match(
            r"^(?P<dtype>[A-Z][A-Z0-9_]+)_v(?P<ver>\d+\.\d+\.\d+)(?:_(?P<recip>TEAM_\d+))?$",
            rest,
        )
        if not vm:
            raise ValueError(f"Cannot parse type/version tail: {rest}")
        return {
            "sender": sender,
            "recipient": vm.group("recip"),
            "wp_id": wp.replace("_", "-"),
            "gate": gate,
            "phase": None,
            "type": vm.group("dtype"),
            "version": vm.group("ver"),
        }
