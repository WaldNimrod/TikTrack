---
**project_domain:** AGENTS_OS
**id:** AGENTS_OS_CORE_VALIDATION_ENGINE_LOD200_DOMAIN_ISOLATION_v1.0.0
**gate_id:** GATE_0
**architectural_approval_type:** SPEC
---

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P001 |
| gate_id | GATE_0 |
| phase_owner | Team 100 |
| required_ssm_version | 1.0.0 |
| required_active_stage | S002 |

---

## 1) Domain Root

**Agents_OS domain root:** `agents_os/` (repo root level)

All runtime code, validators, orchestrator, and LLM gate components live exclusively under this root. No exceptions.

---

## 2) Folder Hierarchy

```
agents_os/                          ← DOMAIN ROOT (isolation boundary)
├── __init__.py
├── validators/                     ← All validation logic
│   ├── base/                       ← Shared infrastructure
│   ├── spec/                       ← 170→190 spec validation
│   └── execution/                  ← 10→90 execution validation
├── llm_gate/                       ← LLM quality judgment
├── orchestrator/                   ← CLI runner + tier sequencing
├── runtime/                        ← Future: execution engine (S002-P002)
├── tests/                          ← Test suite
└── docs-governance/                ← Agents_OS-specific governance docs
    ├── AGENTS_OS_PHASE_1_CONCEPT_PACKAGE_v1.0.0/  (existing)
    └── 99-QUARANTINE_STAGE3/                        (existing)
```

Shared governance documentation (templates, gate model) lives at:
```
documentation/docs-governance/AGENTS_OS_GOVERNANCE/
├── 01-FOUNDATIONS/                 ← Gate model, SSM, WSM refs
└── 02-TEMPLATES/                   ← LOD200_TEMPLATE, LLD400_TEMPLATE (T001 output)
```

---

## 3) Isolation Enforcement Rules

| Rule | Enforcement |
|---|---|
| No TikTrack imports | AST scan in TIER E2 (E-11); CI check |
| No code outside `agents_os/` | Path validation check V-30 |
| No canonical governance edits | Team 70 exclusive write authority (not overridden) |
| Templates stored in canonical path | V-38/V-39 reference `documentation/docs-governance/AGENTS_OS_GOVERNANCE/02-TEMPLATES/` |
| WSM/SSM = read-only for validators | WSMStateReader is read-only; no write methods |
| Validation results → `_COMMUNICATION/` only | ResponseGenerator writes to team communication paths, not to `documentation/` |

---

## 4) Domain Boundary: What This Program Touches

| Area | This Program | Future Programs |
|---|---|---|
| `agents_os/validators/` | ✓ Creates | Extends |
| `agents_os/llm_gate/` | ✓ Creates | Extends |
| `agents_os/orchestrator/` | ✓ Creates runner | Full orchestrator later |
| `agents_os/runtime/` | No change | S002-P002 |
| `documentation/docs-governance/AGENTS_OS_GOVERNANCE/02-TEMPLATES/` | ✓ Creates (T001) | Maintained |
| `documentation/docs-governance/` (other) | Read-only | Read-only |
| TikTrack runtime (`api/`, `ui/`) | **ZERO CONTACT** | ZERO CONTACT |
| `_COMMUNICATION/` | Writes results only | Writes results only |

---

**log_entry | TEAM_100 | AGENTS_OS_CORE_VALIDATION_ENGINE_LOD200_DOMAIN_ISOLATION | GATE_0 | 2026-02-24**
