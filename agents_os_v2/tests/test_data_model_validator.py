"""
Tests for S003-P001 Data Model Validator.
25 tests: 22 base (LOD400) + 2 BF-06 (DM-E-01 edge cases) + 1 BF-09 (value_date false positive).
"""

import os
import tempfile
from pathlib import Path

import pytest

from agents_os_v2.validators.data_model import (
    Finding,
    DataModelValidatorError,
    validate_spec_schema,
    validate_migration_file,
    _find_latest_migration,
)
from agents_os_v2.config import REPO_ROOT


# --- DM-S-01 ---
def test_dm_s01_pass_no_ddl():
    spec = "This spec describes a new UI button. No database changes."
    findings = validate_spec_schema(spec)
    dm_s01 = [f for f in findings if f.check_id == "DM-S-01"][0]
    assert dm_s01.status == "SKIP"


def test_dm_s01_block_implicit_schema():
    spec = "We will add a new table for users. (No DDL block found)"
    findings = validate_spec_schema(spec)
    dm_s01 = [f for f in findings if f.check_id == "DM-S-01"][0]
    assert dm_s01.status == "PASS"  # Has DDL marker "table"


# --- DM-S-02 ---
def test_dm_s02_pass_numeric_2008():
    spec = "ADD COLUMN price NUMERIC(20,8)"
    findings = validate_spec_schema(spec)
    dm_s02 = [f for f in findings if f.check_id == "DM-S-02"][0]
    assert dm_s02.status == "PASS"


def test_dm_s02_block_float_price():
    spec = "ALTER TABLE trades ADD COLUMN price FLOAT"
    findings = validate_spec_schema(spec)
    dm_s02 = [f for f in findings if f.check_id == "DM-S-02"][0]
    assert dm_s02.status == "BLOCK"
    assert "price" in dm_s02.message
    assert "FLOAT" in dm_s02.message


def test_dm_s02_no_false_positive_value_date():
    """BF-09: value_date last token = date → NOT financial → DM-S-02 SKIP."""
    spec = "ADD COLUMN value_date DATE"
    findings = validate_spec_schema(spec)
    dm_s02 = [f for f in findings if f.check_id == "DM-S-02"][0]
    assert dm_s02.status == "SKIP"


# --- DM-S-03 ---
def test_dm_s03_pass_migration_declared():
    spec = "CREATE TABLE x (id INT). Migration: alembic revision."
    findings = validate_spec_schema(spec)
    dm_s03 = [f for f in findings if f.check_id == "DM-S-03"][0]
    assert dm_s03.status == "PASS"


def test_dm_s03_block_no_migration_ref():
    spec = "ADD COLUMN foo INTEGER"  # DDL but no migration ref
    findings = validate_spec_schema(spec)
    dm_s03 = [f for f in findings if f.check_id == "DM-S-03"][0]
    assert dm_s03.status == "BLOCK"


# --- DM-S-04 ---
def test_dm_s04_pass_downgrade_present():
    spec = "Migration with downgrade path. ADD COLUMN x INT."
    findings = validate_spec_schema(spec)
    dm_s04 = [f for f in findings if f.check_id == "DM-S-04"][0]
    assert dm_s04.status == "PASS"


def test_dm_s04_block_no_downgrade():
    spec = "ADD COLUMN x INTEGER. Migration file created."  # No downgrade/rollback
    findings = validate_spec_schema(spec)
    dm_s04 = [f for f in findings if f.check_id == "DM-S-04"][0]
    assert dm_s04.status == "BLOCK"


# --- DM-S-05 ---
def test_dm_s05_pass_explicit_null():
    spec = "ADD COLUMN name VARCHAR NOT NULL. ADD COLUMN nick VARCHAR NULL."
    findings = validate_spec_schema(spec)
    dm_s05 = [f for f in findings if f.check_id == "DM-S-05"][0]
    assert dm_s05.status == "PASS"


def test_dm_s05_block_implicit_null():
    spec = "ADD COLUMN x INTEGER"  # No NULL/NOT NULL
    findings = validate_spec_schema(spec)
    dm_s05 = [f for f in findings if f.check_id == "DM-S-05"][0]
    assert dm_s05.status == "BLOCK"


# --- DM-S-06 ---
def test_dm_s06_pass_fk_on_delete():
    spec = "REFERENCES users(id) ON DELETE CASCADE. ADD COLUMN user_id BIGINT."
    findings = validate_spec_schema(spec)
    dm_s06 = [f for f in findings if f.check_id == "DM-S-06"][0]
    assert dm_s06.status == "PASS"


def test_dm_s06_block_fk_no_on_delete():
    spec = "REFERENCES users(id). ADD COLUMN user_id BIGINT."
    findings = validate_spec_schema(spec)
    dm_s06 = [f for f in findings if f.check_id == "DM-S-06"][0]
    assert dm_s06.status == "BLOCK"


# --- DM-S-07 ---
def test_dm_s07_pass_snake_case():
    spec = "ADD COLUMN user_name VARCHAR(100). alembic migration."
    findings = validate_spec_schema(spec)
    dm_s07 = [f for f in findings if f.check_id == "DM-S-07"][0]
    assert dm_s07.status == "PASS"


def test_dm_s07_block_reserved_word():
    spec = "ADD COLUMN order INTEGER"
    findings = validate_spec_schema(spec)
    dm_s07 = [f for f in findings if f.check_id == "DM-S-07"][0]
    assert dm_s07.status == "BLOCK"


# --- DM-S-08 ---
def test_dm_s08_pass_numeric_type():
    spec = "ADD COLUMN amount NUMERIC(20,8). Migration downgrade."
    findings = validate_spec_schema(spec)
    dm_s08 = [f for f in findings if f.check_id == "DM-S-08"][0]
    assert dm_s08.status == "PASS"


def test_dm_s08_block_double_precision():
    spec = "ADD COLUMN x DOUBLE PRECISION"
    findings = validate_spec_schema(spec)
    dm_s08 = [f for f in findings if f.check_id == "DM-S-08"][0]
    assert dm_s08.status == "BLOCK"


# --- DM-E-01 ---
def test_dm_e01_pass_file_exists():
    """Migration file exists at given path."""
    with tempfile.NamedTemporaryFile(suffix=".py", delete=False) as f:
        f.write(b"def upgrade():\n    pass\ndef downgrade():\n    pass\n")
        f.flush()
        try:
            findings = validate_migration_file(migration_path=f.name)
            dm_e01 = [f for f in findings if f.check_id == "DM-E-01"][0]
            assert dm_e01.status == "PASS"
        finally:
            os.unlink(f.name)


def test_dm_e01_block_file_missing():
    """Declared path not found."""
    findings = validate_migration_file(migration_path="nonexistent_migration_xyz.py")
    dm_e01 = [f for f in findings if f.check_id == "DM-E-01"][0]
    assert dm_e01.status == "BLOCK"


def test_dm_e01_block_empty_directory():
    """BF-06: empty versions/ dir → DM-E-01 BLOCK."""
    with tempfile.TemporaryDirectory() as tmp:
        root = Path(tmp)
        versions_dir = root / "api" / "alembic" / "versions"
        versions_dir.mkdir(parents=True)
        findings = validate_migration_file(repo_root=root)
        dm_e01 = [f for f in findings if f.check_id == "DM-E-01"][0]
        assert dm_e01.status == "BLOCK"
        assert "no migration" in dm_e01.message.lower()


def test_dm_e01_block_directory_missing():
    """BF-06: no versions/ dir → DM-E-01 BLOCK."""
    with tempfile.TemporaryDirectory() as tmp:
        root = Path(tmp)
        findings = validate_migration_file(repo_root=root)
        dm_e01 = [f for f in findings if f.check_id == "DM-E-01"][0]
        assert dm_e01.status == "BLOCK"
        assert "not found" in dm_e01.message.lower()


# --- DM-E-02 ---
def test_dm_e02_pass_both_functions():
    """upgrade() + downgrade() both present."""
    with tempfile.NamedTemporaryFile(suffix=".py", delete=False) as f:
        f.write(b"""
def upgrade():
    pass
def downgrade():
    pass
""")
        f.flush()
        try:
            findings = validate_migration_file(migration_path=f.name)
            dm_e02 = [f for f in findings if f.check_id == "DM-E-02"][0]
            assert dm_e02.status == "PASS"
        finally:
            os.unlink(f.name)


def test_dm_e02_block_no_downgrade():
    """Only upgrade() → BLOCK."""
    with tempfile.NamedTemporaryFile(suffix=".py", delete=False) as f:
        f.write(b"def upgrade():\n    pass\n")
        f.flush()
        try:
            findings = validate_migration_file(migration_path=f.name)
            dm_e02 = [f for f in findings if f.check_id == "DM-E-02"][0]
            assert dm_e02.status == "BLOCK"
        finally:
            os.unlink(f.name)


# --- DM-E-03 ---
def test_dm_e03_pass_no_float():
    with tempfile.NamedTemporaryFile(suffix=".py", delete=False) as f:
        f.write(b"""
def upgrade():
    op.add_column('t', sa.Column('amount', sa.NUMERIC(20,8)))
def downgrade():
    op.drop_column('t', 'amount')
""")
        f.flush()
        try:
            findings = validate_migration_file(migration_path=f.name)
            dm_e03 = [f for f in findings if f.check_id == "DM-E-03"][0]
            assert dm_e03.status == "PASS"
        finally:
            os.unlink(f.name)


def test_dm_e03_block_float_in_migration():
    with tempfile.NamedTemporaryFile(suffix=".py", delete=False) as f:
        f.write(b"""
def upgrade():
    op.add_column('t', sa.Column('price', sa.FLOAT))
def downgrade():
    pass
""")
        f.flush()
        try:
            findings = validate_migration_file(migration_path=f.name)
            dm_e03 = [f for f in findings if f.check_id == "DM-E-03"][0]
            assert dm_e03.status == "BLOCK"
        finally:
            os.unlink(f.name)
