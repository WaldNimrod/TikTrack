"""Layer 0 — definitions (models, constants, pause snapshot schema)."""

from __future__ import annotations

import jsonschema
import pytest
from pydantic import ValidationError

from agents_os_v3.modules.definitions import constants as C
from agents_os_v3.modules.definitions.models import (
    AdvanceRunBody,
    CreateRunBody,
    FailRunBody,
)


def test_create_run_body_defaults() -> None:
    b = CreateRunBody(work_package_id="wp1", domain_id="dom1")
    assert b.process_variant is None


def test_advance_run_body_summary_field() -> None:
    b = AdvanceRunBody(verdict="pass", summary="gate note")
    assert b.summary == "gate note"


def test_fail_run_body_rejects_empty_reason() -> None:
    with pytest.raises(ValidationError):
        FailRunBody(reason="")


def test_pause_snapshot_schema_accepts_canonical_shape() -> None:
    instance = {
        "captured_at": "2026-03-28T12:00:00Z",
        "gate_id": "GATE_0",
        "phase_id": "0.1",
        "assignments": {
            "01JK8AOSV3ROLE0000000001": {
                "assignment_id": "01JASN0ASSIGN0000000001",
                "team_id": "team_10",
            }
        },
    }
    jsonschema.Draft202012Validator(C.PAUSE_SNAPSHOT_SCHEMA).validate(instance)


def test_pause_snapshot_schema_rejects_extra_top_level_key() -> None:
    instance = {
        "captured_at": "2026-03-28T12:00:00Z",
        "gate_id": "GATE_0",
        "phase_id": "0.1",
        "assignments": {},
        "extra": 1,
    }
    with pytest.raises(jsonschema.ValidationError):
        jsonschema.Draft202012Validator(C.PAUSE_SNAPSHOT_SCHEMA).validate(instance)


def test_orchestrator_constants() -> None:
    assert C.ORCHESTRATOR_TEAM_ID == "team_10"
    assert C.TEAM_PRINCIPAL == "team_00"
