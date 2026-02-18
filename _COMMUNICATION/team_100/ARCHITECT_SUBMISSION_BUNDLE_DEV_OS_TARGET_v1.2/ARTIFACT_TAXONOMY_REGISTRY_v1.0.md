# ARTIFACT_TAXONOMY_REGISTRY_v1.0.md

Version: 1.0 (DRAFT)
Date: 2026-02-18
Owner: Team 100
Status: FOR_TEAM_190_REVIEW

---

## 1) Purpose
Define the **authorized artifact identifiers** that the Engine may generate.
Anything not listed here is **not allowed** (prevents artifact drift).

---

## 2) Engine-Authorized Artifacts (initial set)

### 2.1 State & discovery
- `STATE_SNAPSHOT.json` — current stage/gate/team state reconstruction
- `GATE_STATUS_BOARD.json` — normalized gate status map
- `ARTIFACT_DISCOVERY_REPORT.md` — what was found, where, and why it matters

### 2.2 Gate 0 completeness & clarifications
- `GATE_0_COMPLETENESS_REPORT.md` — missing fields, contradictions, ambiguity list
- `CLARIFICATION_REQUEST.md` — request to Architecture for missing info
- `CLARIFICATION_RESPONSE.md` — merged response package reference (not authored by Engine)

### 2.3 Planning
- `WORKPLAN_DRAFT.md` — step plan, gates, owners, evidence requirements
- `RISK_REGISTER.md` — risks + mitigations + owners

### 2.4 Evidence bundling
- `EVIDENCE_BUNDLE_INDEX.md` — index of evidence artifacts for a gate submission
- `VALIDATION_CHECKLIST.md` — gate-specific checklist used by validators

### 2.5 Seal / Knowledge promotion (draft-only)
- `KP_UPDATE_PROPOSAL.md` — proposed doc/index updates (executed by Team 170)

---

## 3) Naming standard (MUST)
- Engine artifacts must include `stage_id` in metadata header.
- When stored under team folders, follow: `TEAM_<id>_<ARTIFACT_NAME>_<stage_id>.<ext>`

---

**log_entry | TEAM_100 | ARTIFACT_TAXONOMY_REGISTRY_DRAFTED | 2026-02-18**
