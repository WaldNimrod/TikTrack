---
id: TEAM_100_TO_TEAM_170_GATE_DRIFT_REMEDIATION_MANDATE_v1.0.0
from: Team 100 (Claude Code — Chief System Architect)
to: Team 170 (Documentation)
cc: Team 00 (Principal)
date: 2026-04-02
priority: HIGH
status: ACTIVE
subject: Gate drift remediation — mark GATE_6/7/8 as LEGACY in definition.yaml gate_authority
---

# Gate Drift Remediation Mandate
## Team 170 — Documentation

---

## 0. Background

The canonical gate sequence directive (`ARCHITECT_DIRECTIVE_GATE_SEQUENCE_CANON_v1.0.0.md`, locked 2026-03-19) establishes:

- **Active pipeline gates:** GATE_0 through GATE_5
- **GATE_6** = LEGACY (alias for GATE_4 in the 5-gate model)
- **GATE_7** = LEGACY (alias for GATE_4)
- **GATE_8** = LEGACY (alias for GATE_5)

A 2026-03-24 cleanup mandate added LEGACY annotations to governance documentation files. **Status of that cleanup:**

| File | LEGACY annotation | Status |
|------|-------------------|--------|
| `documentation/docs-governance/04-PROCEDURES/GATES_4_5_6_7_GOVERNANCE_POLICY_v1.0.0.md` | ✓ Present (header banner) | DONE |
| `documentation/docs-governance/01-FOUNDATIONS/GATE_LIFECYCLE_DESCRIPTION_AND_OWNERS_v1.1.0.md` | ✓ Present (inline + table) | DONE |
| `agents_os_v3/definition.yaml` — `gate_authority` fields | ✗ **Missing** — entries for GATE_6/7/8 have no LEGACY marker | **OPEN** |

---

## 1. Required Action — definition.yaml

**File:** `agents_os_v3/definition.yaml`

Two team entries contain GATE_6, GATE_7, and/or GATE_8 in `gate_authority` without LEGACY markers:

### team_90 (current state)
```yaml
  gate_authority:
    GATE_5: owner
    GATE_6: validator
    GATE_7: orchestrator
    GATE_8: owner
```

### team_90 (required state)
```yaml
  gate_authority:
    GATE_5: owner
    # LEGACY — GATE_6/7/8 are not active pipeline gates (superseded 2026-03-24)
    # In the 5-gate model: GATE_6 ≈ GATE_4 alias, GATE_7/8 ≈ GATE_5 alias
    GATE_6: validator  # LEGACY
    GATE_7: orchestrator  # LEGACY
    GATE_8: owner  # LEGACY
```

### team_100 (current state)
```yaml
  gate_authority:
    GATE_2: owner_for_aos_domain
    GATE_6: owner_for_aos_domain
```

### team_100 (required state)
```yaml
  gate_authority:
    GATE_2: owner_for_aos_domain
    GATE_6: owner_for_aos_domain  # LEGACY — not an active gate (superseded 2026-03-24)
```

---

## 2. Verification Step

After making changes, confirm:

```bash
grep -n "GATE_6\|GATE_7\|GATE_8" agents_os_v3/definition.yaml
```

Every line containing GATE_6/7/8 should now have `# LEGACY` in the same line or the block-level comment immediately above.

Also confirm no behavioral changes: `definition.yaml` is loaded by `agents_os_v3/modules/management/api.py` at startup — the YAML comment lines are ignored by the parser. No functional change occurs.

---

## 3. Why This Matters

The LOD Standard v0.2 (`TEAM_100_LOD_STANDARD_v0.2.md`) maps LOD500 documentation to **GATE_5 exit** in the §AOS overlay. If agents or teams consulting `definition.yaml` see `GATE_6: owner` for Team 100 without a LEGACY marker, they may route LOD500 sign-off through a gate that does not exist in the active pipeline — causing incorrect workflow behavior.

The LEGACY markers make `definition.yaml` self-consistent with the canonical gate directive and with the LEGACY annotations already present in the two governance docs above.

---

## 4. Scope Boundaries

**In scope:**
- `agents_os_v3/definition.yaml` — add LEGACY comments to GATE_6/7/8 entries in `gate_authority` for team_90 and team_100

**Not in scope (already done):**
- `GATES_4_5_6_7_GOVERNANCE_POLICY_v1.0.0.md` — LEGACY banner already present
- `GATE_LIFECYCLE_DESCRIPTION_AND_OWNERS_v1.1.0.md` — LEGACY markers already present
- Any other `definition.yaml` keys — do not touch gate sequences, iron rules, role descriptions, or any other section

---

## 5. Result Report

File: `_COMMUNICATION/team_170/TEAM_170_GATE_DRIFT_REMEDIATION_RESULT_v1.0.0.md`

Report:
- Files changed: N
- GATE_6/7/8 entries annotated: list
- Grep output confirming annotations
- Confirm no YAML parse error after change

---

**log_entry | TEAM_100 | GATE_DRIFT_REMEDIATION_MANDATE_ISSUED | TO_TEAM_170 | 2026-04-02**

historical_record: true
