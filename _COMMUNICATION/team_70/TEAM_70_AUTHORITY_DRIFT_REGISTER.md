# Team 70 | Authority Drift Register

**id:** TEAM_70_AUTHORITY_DRIFT_REGISTER  
**owner:** Team 70 (Knowledge Librarian)  
**to:** Team 90 (Validation), Team 10 (Gateway)  
**date:** 2026-02-17  
**context:** TEAM_90_TO_TEAM_70_MIGRATION_PACKAGE_CORRECTIONS_V3  
**source:** TEAM_90_AUTHORITY_DRIFT_REGISTER_2026_02_16 (Phase A)  
**status:** SUBMITTED V4.1 — Model B paths; ARCHIVED_CONTEXT for historical entries

---

## 1) Authority Anchors (Canonical)

**Authority chain per Corrections V2 — use only:**

| Anchor | Path | Rule |
|--------|------|------|
| Global index | `00_MASTER_INDEX.md` (root — canonical path per MASTER_INDEX_ALIGNMENT_DRAFT) | Single source of truth for navigation |
| Architect decisions | `_COMMUNICATION/_Architects_Decisions/` | Binding SSOT; no `90_Architects_comunication` as authority |

**Rule:** References to `_COMMUNICATION/90_Architects_comunication/` are communication context only, never binding SSOT. Outdated anchor references (e.g. `documentation/00-MANAGEMENT/00_MASTER_INDEX.md` as authority) removed from drift register.

---

## 2) Drift Register (file | issue | required_fix | context)

*All file paths aligned to Model B or archive. Historical entries marked ARCHIVED_CONTEXT.*

| ID | file | issue | required_fix | context |
|----|------|-------|--------------|---------|
| AD-001 | `archive/documentation_legacy/snapshots/2026-02-17_0000/00-MANAGEMENT/00_LEGACY_INDEX_SNAPSHOT_2026-02-17.md` | Wrong architect authority path (line 16) | Replace `_COMMUNICATION/90_Architects_comunication/00_MASTER_INDEX.md` with `_COMMUNICATION/_Architects_Decisions/00_MASTER_INDEX.md` | ARCHIVED_CONTEXT |
| AD-002 | `archive/documentation_legacy/snapshots/2026-02-17_0000/00-MANAGEMENT/00_LEGACY_INDEX_SNAPSHOT_2026-02-17.md` | Non-authority comm doc marked "locked SSOT" (line 113) — TEAM_20_TO_ARCHITECT_SMART_HISTORY_FILL_SPEC | Demote to communication reference or promote canonical spec to _Architects_Decisions | ARCHIVED_CONTEXT |
| AD-003 | `archive/documentation_legacy/snapshots/2026-02-17_0000/00-MANAGEMENT/00_LEGACY_INDEX_SNAPSHOT_2026-02-17.md` | Governance directive from comm folder (line 219) | Point to `_COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_GOVERNANCE_STRENGTHENING.md` | ARCHIVED_CONTEXT |
| AD-004 | `_COMMUNICATION/team_10/TEAM_10_OPEN_TASKS_MASTER.md` | Binding mandate from communication channel | Point to `_Architects_Decisions/BATCH_2_5_COMPLETIONS_MANDATE.md` and `ARCHITECT_BROKER_REFERENCE_AND_OTHER_LOGIC.md` | ACTIVE |
| AD-005 | `_COMMUNICATION/team_10/TEAM_10_OPEN_TASKS_MASTER.md` | "Source of truth" points to team-to-architect submission | Replace with canonical SSOT in documentation/ or _Architects_Decisions | ACTIVE |
| AD-006 | `documentation/docs-system/01-ARCHITECTURE/MARKET_DATA_PIPE_SPEC.md` | "Source of truth" points to communication draft | Replace with canonical SSOT in documentation/ or architect-locked decision | ACTIVE |
| AD-007 | `documentation/docs-system/01-ARCHITECTURE/MARKET_DATA_COVERAGE_MATRIX.md` | Locked rule references comm submission | Replace with canonical SSOT source | ACTIVE |
| AD-008 | `_COMMUNICATION/_ARCHITECT_INBOX/90_ARCHITECTS_DOCUMENTATION/PHOENIX_ARCHITECT_MASTER_INDEX.md` | Deprecated index asserts authority via old comm path | Mark deprecated; pointer to _Architects_Decisions/00_MASTER_INDEX.md | ACTIVE |
| AD-009 | `_COMMUNICATION/team_10/TEAM_10_MASTER_TASK_LIST_PROTOCOL.md` | Protocol points roadmap to communication folder | Replace with `_Architects_Decisions/PHOENIX_UNIFIED_MODULAR_ROADMAP_V2_1.md` | ACTIVE |
| AD-010 | `documentation/docs-system/01-ARCHITECTURE/FOREX_MARKET_SPEC.md` | Roadmap source in communication folder | Replace with _Architects_Decisions path | ACTIVE |
| AD-011 | `documentation/docs-system/01-ARCHITECTURE/CASH_FLOW_PARSER_SPEC.md` | Roadmap source in communication folder | Replace with _Architects_Decisions path | ACTIVE |
| AD-012 | `documentation/docs-system/01-ARCHITECTURE/MARKET_DATA_PIPE_SPEC.md` | Roadmap source in communication folder | Replace with _Architects_Decisions path | ACTIVE |
| AD-013 | `documentation/docs-governance/01-POLICIES/TT2_FORM_VALIDATION_FRAMEWORK.md` | Policy points to comm folder | Replace with `_Architects_Decisions/ARCHITECT_DIRECTIVE_VALIDATION_FINAL.md` | ACTIVE |
| AD-014 | `archive/documentation_legacy/snapshots/2026-02-17_0000/02-DEVELOPMENT/TT2_VALIDATION_DEVELOPER_GUIDE.md` | Dev guide points to comm folder | Replace with `_Architects_Decisions/ARCHITECT_DIRECTIVE_VALIDATION_HYBRID.md` | ARCHIVED_CONTEXT |
| AD-015 | `archive/documentation_legacy/snapshots/2026-02-17_0000/07-POLICIES/TT2_GOVERNANCE_V2_102_SOP_013_CLOSURE_GATE.md` | Policy links directive via comm path | Replace with _Architects_Decisions path | ARCHIVED_CONTEXT |
| AD-016 | `documentation/docs-governance/09-GOVERNANCE/standards/PHOENIX_MASTER_BIBLE.md` | Governance links directive via comm path | Replace with _Architects_Decisions path | ACTIVE |
| AD-017 | `documentation/docs-system/01-ARCHITECTURE/TT2_SSOT_REGISTRY.md` | Mandate linked from comm path | Replace with `_Architects_Decisions/ARCHITECT_HEADER_UNIFICATION_MANDATE.md` | ACTIVE |
| AD-018 | `documentation/docs-governance/09-GOVERNANCE/ARCHITECT_TABLE_RESPONSIVITY_DECISIONS.md` | Self-reference to comm copy | Replace with _Architects_Decisions path | ACTIVE |
| AD-019 | `_COMMUNICATION/team_10/CONSOLIDATION_P3_003_SSOT_ALIGNMENT_2026_02_15.md` | Historical consolidation references comm as architect endpoint | Mark as historical context only; add footnote to current decision authority | ACTIVE |

---

## 3) Priority Order (Correction Waves)

| Wave | IDs | Owner |
|------|-----|-------|
| Wave 1 (P1) | AD-001..AD-008 | Team 70 (+ Architect for AD-002, AD-005) |
| Wave 2 (P2) | AD-009..AD-018 | Team 70 |
| Wave 3 (P3) | AD-019 | Team 70 |

---

## 4) Gaps Requiring Team 10 + Architect Decision

1. **TEAM_20_TO_ARCHITECT_SMART_HISTORY_FILL_SPEC.md** — Appears as "locked SSOT" in active docs; not in _Architects_Decisions. Resolution: promote to documentation/ or _Architects_Decisions, or demote to reference.
2. ~~**TEAM_10_TO_ARCHITECT_HEADER_ARCHITECTURE_DECISION.md**~~ — **RESOLVED.** Canonical `_COMMUNICATION/_Architects_Decisions/HEADER_ARCHITECTURE_DECISION.md` exists and is locked.
3. **TEAM_10_TO_ARCHITECT_P3_003_SSOT_ALIGNMENT_UPDATE.md** — Communication update; should not be authority link.

---

## 5) Zero-Outcome Statement

- **Zero** authority references to `90_Architects_comunication` as binding SSOT after corrections.
- **All** governance/system docs reference only the two authority anchors where relevant.

---

**log_entry | TEAM_70 | AUTHORITY_DRIFT_REGISTER_V4.1_SUBMITTED | MODEL_B_PATHS | 2026-02-17**
