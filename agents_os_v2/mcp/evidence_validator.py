"""
Evidence Validator — validates MATERIALIZATION_EVIDENCE.json artifacts.
Used by V2 Orchestrator to verify evidence before gate advancement.
"""

import json
import hashlib
from dataclasses import dataclass
from pathlib import Path

from ..config import REPO_ROOT


REQUIRED_FIELDS = ["program_id", "gate_id", "provenance", "artifact_path", "generated_at_utc"]
VALID_PROVENANCE = {"TARGET_RUNTIME", "LOCAL_DEV_NON_AUTHORITATIVE", "SIMULATION"}
SIGNATURE_FIELDS = ["algorithm", "key_id", "signature_base64", "signed_payload_sha256", "signed_at_utc", "signed_by_team"]


@dataclass
class EvidenceValidationResult:
    valid: bool
    errors: list[str]
    warnings: list[str]


def validate_evidence(evidence_path: str) -> EvidenceValidationResult:
    """Validate a MATERIALIZATION_EVIDENCE.json file."""
    errors = []
    warnings = []
    full_path = REPO_ROOT / evidence_path

    if not full_path.exists():
        return EvidenceValidationResult(valid=False, errors=[f"File not found: {evidence_path}"], warnings=[])

    try:
        data = json.loads(full_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as e:
        return EvidenceValidationResult(valid=False, errors=[f"Invalid JSON: {e}"], warnings=[])

    for field in REQUIRED_FIELDS:
        if field not in data:
            errors.append(f"Missing required field: {field}")

    prov = data.get("provenance", "")
    if prov and prov not in VALID_PROVENANCE:
        errors.append(f"Invalid provenance: '{prov}'. Must be one of: {VALID_PROVENANCE}")

    artifact_path = data.get("artifact_path", "")
    if artifact_path:
        artifact_full = REPO_ROOT / artifact_path
        if not artifact_full.exists():
            warnings.append(f"Referenced artifact not found: {artifact_path}")

    sig = data.get("signature_block")
    if sig:
        for sf in SIGNATURE_FIELDS:
            if sf not in sig:
                errors.append(f"Signature block missing field: {sf}")
        if sig.get("algorithm") != "Ed25519":
            errors.append(f"Signature algorithm must be Ed25519, got: {sig.get('algorithm')}")
    else:
        warnings.append("No signature_block — unsigned evidence (acceptable for LOCAL_DEV_NON_AUTHORITATIVE)")

    return EvidenceValidationResult(
        valid=len(errors) == 0,
        errors=errors,
        warnings=warnings,
    )
