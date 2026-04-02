---
id: TEAM_00_DEPARTMENT_DEFINITION_SCHEMA_SPEC_v1.0.0
historical_record: true
from: Team 00 (Nimrod — System Designer)
to: Team 61 (implementation — pipeline_state schema + pipeline.py)
cc: Team 170 (WSM schema update), Team 100
date: 2026-03-21
status: SPEC — implement as part of S003-P012-WP001 or WP002
authority: ARCHITECT_DIRECTIVE_ORG_AND_PIPELINE_ARCHITECTURE_v1.0.0 §4---

# Department Definition — Pipeline State Schema Spec

## §1 — Purpose

The `program_department` field in `pipeline_state_{domain}.json` defines which team fills each canonical role for the active Work Package. This eliminates all hardcoded routing in `pipeline.py` and makes routing fully WP-specific and domain+variant-aware.

---

## §2 — Schema

### Addition to `pipeline_state_{domain}.json`

```json
{
  "program_department": {
    "domain": "tiktrack",
    "variant": "TRACK_FULL",
    "roles": {
      "domain_gateway":       "team_10",
      "backend_impl":         "team_20",
      "frontend_impl":        "team_30",
      "qa_authority":         "team_50",
      "validation_authority": "team_90",
      "doc_closure":          "team_70",
      "spec_author":          "team_101",
      "arch_reviewer":        "team_100"
    },
    "optional_active": {
      "design_advisory":      false,
      "devops":               false
    },
    "fixed": {
      "adversarial_validator": "team_190"
    }
  }
}
```

### Role IDs (canonical)

| role_id | required | gates using it |
|---|---|---|
| `domain_gateway` | YES | GATE_2/2.2, GATE_3/3.1, correction cycle |
| `backend_impl` | YES (TRACK_FULL) | GATE_3/3.2 |
| `frontend_impl` | YES (TRACK_FULL) | GATE_3/3.2 |
| `qa_authority` | YES | GATE_3/3.3, GATE_4, correction cycle |
| `validation_authority` | YES | GATE_4/4.1, GATE_5/5.2 |
| `doc_closure` | YES | GATE_5/5.1 |
| `spec_author` | YES | GATE_1/1.1 |
| `arch_reviewer` | YES | GATE_2/2.3, GATE_4/4.2 |
| `design_advisory` | optional | GATE_3/3.2 (when `optional_active.design_advisory = true`) |
| `devops` | optional | GATE_3/3.2 (when `optional_active.devops = true`) |
| `adversarial_validator` | FIXED = team_190 | GATE_1/1.2, GATE_2/2.1v |

---

## §3 — Resolution Logic (pipeline.py changes)

### Replace `_DOMAIN_PHASE_ROUTING` lookups

Current code (hardcoded):
```python
owner = _DOMAIN_PHASE_ROUTING["GATE_3"]["3.3"]["tiktrack"]  # → "team_50"
```

New code (department-driven):
```python
def _resolve_role(state: PipelineState, role_id: str) -> str:
    """Resolve team ID for a role from program_department. Falls back to _DOMAIN_PHASE_ROUTING."""
    dept = getattr(state, "program_department", None)
    if dept and role_id in dept.get("roles", {}):
        return dept["roles"][role_id]
    if role_id in dept.get("optional_active", {}) and dept["optional_active"][role_id]:
        return dept["roles"].get(role_id, "")
    # Fallback: _DOMAIN_PHASE_ROUTING (legacy support during migration)
    return _DOMAIN_PHASE_ROUTING_fallback(state, role_id)
```

### GATE_0 validation

```python
def _validate_program_department(state: PipelineState) -> list[str]:
    """Returns list of BLOCKING errors if department is missing required roles."""
    required_roles = ["domain_gateway","backend_impl","frontend_impl",
                      "qa_authority","validation_authority","doc_closure",
                      "spec_author","arch_reviewer"]
    dept = getattr(state, "program_department", None)
    if dept is None:
        return ["BLOCKING: program_department not defined in pipeline_state. Cannot advance past GATE_0."]
    missing = [r for r in required_roles if r not in dept.get("roles", {})]
    return [f"BLOCKING: program_department missing role: {r}" for r in missing]
```

Call `_validate_program_department()` in `advance_gate()` when current_gate == "GATE_0".

---

## §4 — Default Population at GATE_0

When a WP is initialized (GATE_0), the pipeline auto-populates `program_department` from the default table in `ARCHITECT_DIRECTIVE_TEAM_ROSTER_v3.0.0.md §3`:

```python
DEFAULT_DEPARTMENTS = {
    ("tiktrack", "TRACK_FULL"):    { "domain_gateway": "team_10", "backend_impl": "team_20", ... },
    ("tiktrack", "TRACK_FOCUSED"): { "domain_gateway": "team_10", "backend_impl": "team_30", ... },
    ("agents_os", "TRACK_FULL"):   { "domain_gateway": "team_11", "backend_impl": "team_21", ... },
    ("agents_os", "TRACK_FOCUSED"):{ "domain_gateway": "team_11", "backend_impl": "team_61", ... },
}
```

LOD200 can override any individual role by specifying `program_department.roles[role_id] = "team_XX"` in the WP spec.

---

## §5 — PipelineState Schema Addition (Pydantic)

```python
class ProgramDepartment(BaseModel):
    domain: str
    variant: str
    roles: dict[str, str]                    # role_id → team_id
    optional_active: dict[str, bool] = {}    # optional roles active/inactive
    fixed: dict[str, str] = {"adversarial_validator": "team_190"}

class PipelineState(BaseModel):
    # ... existing fields ...
    program_department: Optional[ProgramDepartment] = None
```

---

## §6 — Mandate Template Injection

When generating any mandate, inject department context:

```
## Team Assignment (this Work Package)
| Role | Team |
|---|---|
| Domain Gateway | team_10 |
| Implementation (Backend) | team_20 |
| Implementation (Frontend) | team_30 |
| QA Authority | team_50 |
| Validation | team_90 |
| Documentation | team_70 |
```

This injection satisfies KB-62 (roster context at routing decision points).

---

## §7 — Implementation Priority

- **Phase 1 (WP001):** Add `program_department` field to PipelineState Pydantic model + default population at GATE_0 + GATE_0 validation
- **Phase 2 (WP002):** Replace `_DOMAIN_PHASE_ROUTING` lookups with `_resolve_role()` + mandate template injection
- **Phase 3 (WP004):** Add to JSON schema contract validation (CI check)
- **Phase 4 (WP005):** Simulation harness uses `program_department` in all fixture WPs

---

**log_entry | TEAM_00 | DEPARTMENT_DEFINITION_SCHEMA_SPEC | v1.0.0 | PIPELINE_STATE_SCHEMA_EXTENSION | ROLE_RESOLUTION_LOGIC | GATE0_VALIDATION | 2026-03-21**
