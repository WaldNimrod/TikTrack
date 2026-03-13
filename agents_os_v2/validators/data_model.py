"""
DM-S-01..DM-S-08: Data Model Spec Validator
DM-E-01..DM-E-03: Data Model Execution Validator
Validates schema changes in spec documents and migration files.
Domain isolation: stdlib only — no imports from api/, ui/, orchestrator/, conversations/.
"""

from __future__ import annotations

import os
import re
from dataclasses import dataclass
from pathlib import Path

FINANCIAL_COLUMN_PATTERNS = frozenset({
    "price", "amount", "commission", "fee", "value",
    "balance", "pnl", "profit", "loss", "cost", "rate",
})

FORBIDDEN_TYPES = ("FLOAT", "DOUBLE PRECISION", "REAL", "DOUBLE")

SQL_RESERVED = frozenset({
    "select", "from", "where", "table", "column", "index",
    "order", "group", "key", "default", "check", "constraint",
})

DDL_MARKERS = [
    "ALTER TABLE", "CREATE TABLE", "ADD COLUMN",
    "alembic", "DDL",
]

# Negation patterns: if spec explicitly says NO schema change, skip validation
NO_SCHEMA_PATTERNS = [
    "no schema change", "no migration", "no new backend",
    "no backend", "no db change", "no database change",
    "schema changes: none", "backend requirement: none",
]

# Default alembic versions path (relative to repo root)
DEFAULT_ALEMBIC_VERSIONS = "api/alembic/versions"


class DataModelValidatorError(Exception):
    """Raised when migration path discovery fails (BF-06 — BLOCK, not SKIP)."""


@dataclass
class Finding:
    check_id: str
    status: str  # PASS / BLOCK / SKIP
    message: str
    path: str = ""


def _is_financial_column(col_name: str) -> bool:
    """Return True if the column's last name token is a known financial term (BF-09)."""
    last_token = col_name.lower().split("_")[-1]
    return last_token in FINANCIAL_COLUMN_PATTERNS


def _has_schema_change(content: str) -> bool:
    """
    Check if spec content implies schema change per DDL_MARKERS.
    Returns False if spec explicitly declares no schema change (negation guard).
    Only fires on actual SQL DDL keywords (ALTER TABLE, CREATE TABLE, ADD COLUMN, alembic).
    Does NOT fire on plain English mentions of 'migration' or 'schema change' words.
    """
    lower = content.lower()
    # Negation guard: explicit "no schema change" statements suppress all checks
    if any(pat in lower for pat in NO_SCHEMA_PATTERNS):
        return False
    upper = content.upper()
    return any(marker.upper() in upper for marker in DDL_MARKERS)


def _extract_ddl_blocks(content: str) -> list[str]:
    """Extract DDL-like blocks from spec (simplified — look for COLUMN patterns)."""
    blocks = []
    # Match ADD COLUMN, column definitions, CREATE TABLE block
    for pattern in [
        r"ADD\s+COLUMN\s+[\w\s,()]+",
        r"CREATE\s+TABLE\s+[\w\s,()]+",
        r"(\w+)\s+(FLOAT|DOUBLE|REAL|NUMERIC|INTEGER|TEXT|VARCHAR|DECIMAL|BIGINT)\s*[,\s\)]",
    ]:
        for m in re.finditer(pattern, content, re.IGNORECASE | re.DOTALL):
            blocks.append(m.group(0))
    return blocks if blocks else [content] if _has_schema_change(content) else []


def _parse_columns_from_ddl(ddl_text: str) -> list[tuple[str, str]]:
    """Extract (column_name, type) pairs from DDL text."""
    results = []
    # Pattern: column_name TYPE — broad match to catch value_date DATE, price FLOAT, etc.
    for m in re.finditer(
        r"(?:ADD\s+COLUMN\s+)?(\w+)\s+(\w+(?:\s*\(\s*\d+\s*,\s*\d+\s*\))?)\s*(?=[,\s\)\n]|$)",
        ddl_text,
        re.IGNORECASE
    ):
        col_name, col_type = m.group(1), m.group(2).upper().strip()
        if col_name.lower() not in ("add", "table", "column"):
            results.append((col_name, col_type))
    return results


def _find_latest_migration(repo_root: Path, alembic_versions: str = DEFAULT_ALEMBIC_VERSIONS) -> str:
    """
    Find the most recently modified migration file.
    BF-06: BLOCK (not SKIP) if directory missing or empty.
    """
    versions_dir = repo_root / alembic_versions
    if not versions_dir.exists():
        raise DataModelValidatorError(
            "DM-E-01: BLOCK — alembic versions directory not found"
        )
    files = [f for f in os.listdir(versions_dir) if f.endswith(".py")]
    if not files:
        raise DataModelValidatorError(
            "DM-E-01: BLOCK — no migration files in alembic versions directory"
        )
    return str(max(
        (versions_dir / f for f in files),
        key=lambda p: os.path.getmtime(p)
    ))


def validate_spec_schema(content: str, source_path: str = "") -> list[Finding]:
    """Run DM-S-01..DM-S-08 on a spec document."""
    findings: list[Finding] = []

    if not _has_schema_change(content):
        for i in range(1, 9):
            findings.append(Finding(
                check_id=f"DM-S-{i:02d}",
                status="SKIP",
                message="No schema change declared in spec",
                path=source_path,
            ))
        return findings

    # DM-S-01: Schema change declared — we have DDL markers, so implied
    findings.append(Finding(
        check_id="DM-S-01",
        status="PASS",
        message="Schema change declared with DDL markers",
        path=source_path,
    ))

    # DM-S-02: Financial columns use NUMERIC(20,8) — token matching (BF-09)
    ddl_blocks = _extract_ddl_blocks(content)
    dm_s02_block = None
    has_financial = False
    for block in ddl_blocks:
        for col_name, col_type in _parse_columns_from_ddl(block):
            if _is_financial_column(col_name):
                has_financial = True
                if any(ft in col_type for ft in FORBIDDEN_TYPES):
                    dm_s02_block = Finding(
                        check_id="DM-S-02",
                        status="BLOCK",
                        message=f"Financial column '{col_name}' uses {col_type}. Iron Rule: NUMERIC(20,8) required.",
                        path=source_path,
                    )
                    break
                elif "NUMERIC" not in col_type and "DECIMAL" not in col_type:
                    dm_s02_block = Finding(
                        check_id="DM-S-02",
                        status="BLOCK",
                        message=f"Financial column '{col_name}' uses {col_type}. Iron Rule: NUMERIC(20,8) required.",
                        path=source_path,
                    )
                    break
        if dm_s02_block:
            break
    if dm_s02_block:
        findings.append(dm_s02_block)
    elif has_financial:
        findings.append(Finding(
            check_id="DM-S-02",
            status="PASS",
            message="Financial columns use NUMERIC/appropriate type",
            path=source_path,
        ))
    else:
        findings.append(Finding(
            check_id="DM-S-02",
            status="SKIP",
            message="No financial columns in DDL — check skipped",
            path=source_path,
        ))

    # DM-S-03: Migration declared
    if "migration" in content.lower() or "alembic" in content.lower():
        findings.append(Finding(check_id="DM-S-03", status="PASS", message="Migration declared", path=source_path))
    else:
        findings.append(Finding(
            check_id="DM-S-03",
            status="BLOCK",
            message="Spec proposes schema change but no migration reference found",
            path=source_path,
        ))

    # DM-S-04: Downgrade path declared
    if "downgrade" in content.lower() or "rollback" in content.lower():
        findings.append(Finding(check_id="DM-S-04", status="PASS", message="Downgrade/rollback declared", path=source_path))
    else:
        findings.append(Finding(
            check_id="DM-S-04",
            status="BLOCK",
            message="Spec declares migration but no downgrade/rollback section",
            path=source_path,
        ))

    # DM-S-05: Column nullability explicit (simplified — check for NULL/NOT NULL)
    if "NULL" in content.upper() or "NOT NULL" in content.upper():
        findings.append(Finding(check_id="DM-S-05", status="PASS", message="Nullability declarations present", path=source_path))
    else:
        findings.append(Finding(
            check_id="DM-S-05",
            status="BLOCK",
            message="New columns without explicit NULL/NOT NULL declaration",
            path=source_path,
        ))

    # DM-S-06: FK ON DELETE declared
    if "ON DELETE" in content.upper() or "REFERENCES" not in content.upper():
        findings.append(Finding(check_id="DM-S-06", status="PASS", message="FK ON DELETE or no FK in spec", path=source_path))
    elif "REFERENCES" in content.upper():
        findings.append(Finding(
            check_id="DM-S-06",
            status="BLOCK",
            message="FK without ON DELETE clause",
            path=source_path,
        ))
    else:
        findings.append(Finding(check_id="DM-S-06", status="PASS", message="No FK in spec", path=source_path))

    # DM-S-07: Naming convention
    dm_s07_block = None
    for col_name, _ in sum((_parse_columns_from_ddl(b) for b in ddl_blocks), []):
        if col_name.lower() == "id":
            continue
        if not re.match(r"^[a-z][a-z0-9_]*$", col_name.lower()):
            dm_s07_block = Finding(
                check_id="DM-S-07",
                status="BLOCK",
                message=f"Column '{col_name}' fails snake_case pattern",
                path=source_path,
            )
            break
        if col_name.lower() in SQL_RESERVED:
            dm_s07_block = Finding(
                check_id="DM-S-07",
                status="BLOCK",
                message=f"Column '{col_name}' is SQL reserved word",
                path=source_path,
            )
            break
    findings.append(dm_s07_block if dm_s07_block else Finding(
        check_id="DM-S-07", status="PASS", message="Naming convention satisfied", path=source_path
    ))

    # DM-S-08: No FLOAT/DOUBLE
    upper = content.upper()
    dm_s08_block = None
    for ft in FORBIDDEN_TYPES:
        if ft in upper:
            dm_s08_block = Finding(
                check_id="DM-S-08",
                status="BLOCK",
                message=f"Forbidden type '{ft}' in DDL — use NUMERIC(20,8) for financial",
                path=source_path,
            )
            break
    findings.append(dm_s08_block if dm_s08_block else Finding(
        check_id="DM-S-08", status="PASS", message="No FLOAT/DOUBLE/REAL in DDL", path=source_path
    ))

    return findings


def validate_migration_file(
    migration_path: Path | str | None = None,
    repo_root: Path | None = None,
) -> list[Finding]:
    """Run DM-E-01..DM-E-03 on the migration file."""
    from ..config import REPO_ROOT
    root = repo_root or REPO_ROOT
    findings: list[Finding] = []

    # DM-E-01: Migration file exists — discover path if not given
    try:
        if migration_path is None or (isinstance(migration_path, str) and not migration_path):
            migration_path = _find_latest_migration(root)
        path = Path(migration_path) if isinstance(migration_path, str) else migration_path
        if not path.is_absolute():
            path = root / path
    except DataModelValidatorError as e:
        findings.append(Finding(
            check_id="DM-E-01",
            status="BLOCK",
            message=str(e),
            path=DEFAULT_ALEMBIC_VERSIONS,
        ))
        findings.append(Finding(check_id="DM-E-02", status="SKIP", message="Skipped (no migration file)", path=""))
        findings.append(Finding(check_id="DM-E-03", status="SKIP", message="Skipped (no migration file)", path=""))
        return findings

    if not path.exists():
        findings.append(Finding(
            check_id="DM-E-01",
            status="BLOCK",
            message=f"Migration file not found: {path}",
            path=str(path),
        ))
        return findings

    findings.append(Finding(
        check_id="DM-E-01",
        status="PASS",
        message=f"Migration file exists: {path.name}",
        path=str(path),
    ))

    # DM-E-02: upgrade() and downgrade() present
    content = path.read_text(encoding="utf-8")
    has_upgrade = "def upgrade(" in content or "def upgrade()" in content
    has_downgrade = "def downgrade(" in content or "def downgrade()" in content

    if has_upgrade and has_downgrade:
        findings.append(Finding(
            check_id="DM-E-02",
            status="PASS",
            message="upgrade() and downgrade() both present",
            path=str(path),
        ))
    else:
        missing = []
        if not has_upgrade:
            missing.append("upgrade()")
        if not has_downgrade:
            missing.append("downgrade()")
        findings.append(Finding(
            check_id="DM-E-02",
            status="BLOCK",
            message=f"Migration missing: {', '.join(missing)}",
            path=str(path),
        ))

    # DM-E-03: No FLOAT/DOUBLE in migration
    upper = content.upper()
    found_forbidden = False
    for ft in FORBIDDEN_TYPES:
        if ft in upper:
            findings.append(Finding(
                check_id="DM-E-03",
                status="BLOCK",
                message=f"Forbidden type '{ft}' in migration — use NUMERIC(20,8)",
                path=str(path),
            ))
            found_forbidden = True
            break
    if not found_forbidden:
        findings.append(Finding(
            check_id="DM-E-03",
            status="PASS",
            message="No FLOAT/DOUBLE/REAL in migration",
            path=str(path),
        ))

    return findings
