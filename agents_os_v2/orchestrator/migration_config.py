"""
S003-P011-WP002 — Migration table for legacy gate IDs → canonical 5-gate model.
Module-level to avoid circular imports; consumed by state.py validator and pipeline.py.
BC-03: Single migration path; no duplicate _perform_migration() from LLD400 §1.
"""
from dataclasses import dataclass


@dataclass
class MigrationEntry:
    new_gate: str
    new_phase: str
    set_human_pending: bool = False
    increment_remediation: bool = False


# LLD400 §17.2 — legacy gate IDs only (no keys that collide with 5-gate canonical current_gate).
# Do NOT map GATE_1/GATE_2/GATE_4… here: those strings are valid in the new model and would
# corrupt active state on every load (WP002 BC-03 / Team 61 remediation).
_MIGRATION_TABLE: dict[str, MigrationEntry] = {
    "WAITING_GATE2_APPROVAL": MigrationEntry("GATE_2", "2.3", set_human_pending=True),
    "G3_PLAN":  MigrationEntry("GATE_2", "2.2"),  # BF-01 / CERT_14
    "G3_5":     MigrationEntry("GATE_2", "2.2v"),
    "G3_6_MANDATES": MigrationEntry("GATE_3", "3.1"),  # CERT_13
    "G3_REMEDIATION": MigrationEntry("GATE_3", "3.1", increment_remediation=True),
    "CURSOR_IMPLEMENTATION": MigrationEntry("GATE_3", "3.2"),
    "GATE_8":   MigrationEntry("GATE_5", "5.1"),  # legacy closure id → canonical GATE_5
}


def get_migration_table() -> dict[str, MigrationEntry]:
    """Return the migration table. Used by state validator."""
    return _MIGRATION_TABLE
