# TEAM 00 → TEAM 170 — Canonical Activation Prompt
## S003 Governance Alignment — Full Pending Task Package

```
from:           Team 00 — Chief Architect
to:             Team 170 — Documentation & Governance
date:           2026-03-03
re:             Complete governance alignment for S003 readiness
status:         ACTIVE — full task package, execute in order
authority:      Team 00 constitutional authority — all tasks Nimrod-approved
context:        Current teams (10/20/30/50/60) are executing S002-P003-WP002.
                This alignment prepares the governance infrastructure for S003.
                Do NOT interfere with the active WP.
```

---

## YOUR ROLE IN THIS PACKAGE

Team 170 (Documentation & Governance) is responsible for:
- Maintaining canonical governance documents
- Applying architect directives to roadmap, program registry, SSOT
- Ensuring consistency across all documentation
- Producing LOD contracts when requested

This prompt covers **7 distinct task groups** from multiple directives issued across sessions 2026-03-02 and 2026-03-03. Execute in the order presented. Report completion per group before proceeding to the next.

---

## STEP 1 — READ ALL PENDING DIRECTIVES (in order)

Before any action, read all source directives:

```
1. ARCHITECT_DIRECTIVE_ROADMAP_AMENDMENT_v1.0.0.md         — 5 amendments (2026-03-02)
2. ARCHITECT_DIRECTIVE_ROADMAP_AMENDMENT_v2.0.0.md         — 3 amendments (2026-03-03)
3. ARCHITECT_DIRECTIVE_SSOT_CORRECTIONS_v1.0.0.md          — 5 SSOT fixes (2026-03-03)
4. ARCHITECT_DIRECTIVE_TEAM_ROSTER_LOCK_v1.0.0.md          — canonical team roster (2026-03-02)
5. ARCHITECT_DIRECTIVE_S003_PREP_DECISIONS_v1.0.0.md       — D39/D40/D33/S008 (2026-03-03)
6. ARCHITECT_DIRECTIVE_PL_RECONCILIATION_POLICY_v1.0.0.md  — D36/D37 P&L policy (2026-03-03)
```

All are located in: `_COMMUNICATION/_Architects_Decisions/`

---

## TASK GROUP A — Apply Roadmap Amendments (v1 + v2)

**Source directives:** ROADMAP_AMENDMENT_v1.0.0 + ROADMAP_AMENDMENT_v2.0.0
**Target document:** `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_PORTFOLIO_ROADMAP_v1.0.0.md`

### A-01 through A-05 (from v1, if not yet applied)

Check if log entry `TEAM_170 | ROADMAP_AMENDED | 5_AMENDMENTS_PER_DIRECTIVE_v1.0.0` already exists.
If YES → skip A-01..A-05.
If NO → apply:

| Amendment | Action |
|---|---|
| A1 | D38 stage: S003 → S005 (page table + stage details + narrative) |
| A2 | Add D26-Phase2 work package entry in S005 |
| A3 | Add spec-first constraint note to D32 entry and S006 section |
| A4 | Update D37 description: dual import (executions + cash_flows), IBKR + IBI, BaseConnector |
| A5 | Add inline tag assignment rollout note to narrative (S004 onward) |

### B-01 through B-03 (from v2)

| Amendment | Action |
|---|---|
| B1 | Add S004-PXXX Indicators Infrastructure program to S004 stage (at end). Add prerequisite notes to D26-Phase2, D28, D25, D31 |
| B2 | Update D40 description: 7 sections, admin-only (see AMENDMENT_v2 §B2 for full section list) |
| B3 | Add D41 user_management page to S003 in roadmap + SSOT_MASTER_LIST |

### S008 Roadmap Entry (from PREP_DECISIONS §D4)

Add to roadmap under a "Future Stages" section (or S008 if stage exists):
- ID: S008-NOTIFICATION-TOAST-SYSTEM
- Per ARCHITECT_DIRECTIVE_S003_PREP_DECISIONS_v1.0.0 §Decision 4 — copy verbatim

### Checklist
- [ ] v1 amendments applied (or confirmed already applied)
- [ ] v2 amendments B1/B2/B3 applied
- [ ] S008-NOTIFICATION-TOAST-SYSTEM entry added
- [ ] Log entry appended to roadmap: `TEAM_170 | ROADMAP_AMENDMENTS_COMPLETE_v1+v2 | 2026-03-03`

---

## TASK GROUP B — Apply SSOT Corrections (5 fixes)

**Source directive:** ARCHITECT_DIRECTIVE_SSOT_CORRECTIONS_v1.0.0.md
**Target documents:**
- `documentation/docs-system/08-PRODUCT/LEGACY_TO_PHOENIX_MAPPING_V2.5.md`
- `documentation/docs-system/01-ARCHITECTURE/TT2_PAGES_SSOT_MASTER_LIST.md`
- `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_PORTFOLIO_ROADMAP_v1.0.0.md`

| Correction | Action |
|---|---|
| C1 | Remove 'general' from notes parent_type in LEGACY_MAPPING + SSOT. Add deprecation note |
| C2 | Fix S003 narrative in ROADMAP: remove D34/D35 references, correct to D33/D39/D40/D26 |
| C3 | Add D26-Phase2 entry to SSOT_MASTER_LIST under S005 |
| C4 | Add stage note + relocation note to D38 entry in SSOT_MASTER_LIST |
| C5 | Add canonical path header to TT2_PAGES_SSOT_MASTER_LIST.md |

### Checklist
- [ ] C1: 'general' removed from both documents
- [ ] C2: S003 narrative corrected
- [ ] C3: D26-Phase2 added to SSOT
- [ ] C4: D38 stage note added to SSOT
- [ ] C5: Canonical path header added to SSOT
- [ ] Log entries appended to modified documents

---

## TASK GROUP C — Update TEAM_DEVELOPMENT_ROLE_MAPPING

**Source directive:** ARCHITECT_DIRECTIVE_TEAM_ROSTER_LOCK_v1.0.0.md
**Target document:** `documentation/docs-governance/01-FOUNDATIONS/TEAM_DEVELOPMENT_ROLE_MAPPING_v1.0.0.md`

**Problem:** The current document only lists Teams 20/30/40/60. Teams 50/70/90/100/170/190 are entirely missing. This is the root cause of recurring Team 40/50 confusion across all generated documents.

**Required additions:**

| Team | Role | Add to document |
|---|---|---|
| **Team 50** | QA + FAV (Final Acceptance Validation) | All testing, E2E suites, SOP-013 seals |
| **Team 70** | Technical Writing & Documentation | User-facing documentation, release notes |
| **Team 90** | Validation & Gate Management | GATE_5 submission packages; quality gate coordinator |
| **Team 100** | Architectural Review | GATE_6 architectural review and program authority |
| **Team 170** | Spec & Governance (you) | LOD contracts, canonical document maintenance, registry updates |
| **Team 190** | Constitutional Validation | GATE_0–GATE_2 activation; constitutional integrity review |

**Iron Rule (add to document header):**
```
IRON RULE: Team 50 = QA + FAV. NEVER assign QA/testing/FAV to Team 40.
Team 40 = UI Assets & Design ONLY.
Source: ARCHITECT_DIRECTIVE_TEAM_ROSTER_LOCK_v1.0.0.md (2026-03-02, Nimrod-approved)
```

### Checklist
- [ ] Teams 50/70/90/100/170/190 added with correct roles
- [ ] Iron Rule note added to document header
- [ ] Log entry appended

---

## TASK GROUP D — Update Program Registry

**Source directives:** ROADMAP_AMENDMENT_v2 + S003_PREP_DECISIONS
**Target document:** `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_PROGRAM_REGISTRY_v1.0.0.md`

| Update | Action |
|---|---|
| D-01 | Add S004-PXXX Indicators Infrastructure program entry (status: PLANNED) |
| D-02 | Update S003-P003 scope: now includes D39 + D40 + D41 |
| D-03 | Verify S002-P003 name includes D33 (confirmed earlier — verify log entry exists) |
| D-04 | Verify S003-P005 shows D38 note relocated to S005 |

### Checklist
- [ ] S004-PXXX Indicators Infrastructure added
- [ ] S003-P003 scope updated (D39 + D40 + D41)
- [ ] S002-P003 D33 note confirmed
- [ ] Log entry appended

---

## TASK GROUP E — Note S003 Architectural Decisions (for future LOD200 preparation)

**Source directive:** ARCHITECT_DIRECTIVE_S003_PREP_DECISIONS_v1.0.0.md

The following decisions affect future LOD200 documents. Team 170 does NOT write the LOD200s — but must record that these decisions exist and point to the source directive.

Add a "Pending LOD200 Inputs" section to the relevant program or a governance notes document:

**D39 Preferences (S003-P003):**
- Canonical field set: 23 fields, 6 groups — per ARCHITECT_DIRECTIVE_S003_PREP_DECISIONS §Decision 2
- JSONB-based storage (flexible extension — no migration for new fields)
- Commission field EXCLUDED (separate system exists)
- Trading hours EXCLUDED (moved to D40)
- `primary_currency` added to Group A
- Group B trading defaults: 6 fields (account, stop_loss, target, risk, trade_amount, pl_method)

**D40 System Management (S003-P003):**
- 7 sections (per ROADMAP_AMENDMENT_v2 §B2)
- `trading_hours_start`, `trading_hours_end`, `trading_timezone` → Market Data Settings section
- Per ARCHITECT_DIRECTIVE_S003_PREP_DECISIONS §Decision 3

**D33 User Tickers (S003-P004):**
- Iron Rule: last_price + last_change displayed in table (display-only)
- Additional scope vs G7 remediation: filtering, sorting, pagination
- Live price is INCLUDED in D33 (per final decision 2026-03-03, overrides earlier draft)

**D41 User Management (S003-P003 companion):**
- Per ROADMAP_AMENDMENT_v2 §B3

**D36/D37 P&L Policy:**
- Option B (Delta-Reset via enhanced D37 import) — locked
- Option C (Direct broker API) — S006+ roadmap entry
- Per ARCHITECT_DIRECTIVE_PL_RECONCILIATION_POLICY_v1.0.0.md

### Checklist
- [ ] D39 decision reference note added to S003-P003 program entry (or governance notes)
- [ ] D40 decision reference note added
- [ ] D33 decision reference note added (including live price override)
- [ ] D36/D37 policy reference note added

---

## TASK GROUP F — WSM Alignment

**Target document:** `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md`

Append a log note to the WSM operational state recording the completion of this alignment package:

```
GOVERNANCE_ALIGNMENT_S003_PREP_COMPLETE:
  date: 2026-03-03
  directive_package:
    - ROADMAP_AMENDMENT_v1.0.0 (confirmed)
    - ROADMAP_AMENDMENT_v2.0.0 (applied)
    - SSOT_CORRECTIONS_v1.0.0 (applied)
    - TEAM_ROSTER_LOCK_v1.0.0 (applied to ROLE_MAPPING)
    - S003_PREP_DECISIONS_v1.0.0 (noted in registry)
    - PL_RECONCILIATION_POLICY_v1.0.0 (noted in registry)
  next_governance_event: S003 GATE_0 (after S002-P003-WP002 GATE_8 PASS)
```

**DO NOT modify:**
- `current_gate` or `active_stage` fields (owned by Team 10)
- Any current WP operational fields
- Any team communication folders

### Checklist
- [ ] WSM log note appended

---

## TASK GROUP G — Output Report to Team 00

After completing all task groups, write a completion report to:
```
_COMMUNICATION/team_170/TEAM_170_GOVERNANCE_ALIGNMENT_S003_COMPLETION_REPORT_v1.0.0.md
```

**Required format:**

```markdown
# TEAM 170 — Governance Alignment Completion Report
## S003 Preparation Package

[header block: from, to, date, relates_to]

## TASK STATUS TABLE
| Group | Tasks | Status | Notes |
|---|---|---|---|
| A — Roadmap Amendments | A-01..A-05, B-01..B-03, S008 | COMPLETE / PARTIAL | ... |
| B — SSOT Corrections | C1..C5 | COMPLETE / PARTIAL | ... |
| C — Role Mapping | Teams 50/70/90/100/170/190 | COMPLETE | ... |
| D — Program Registry | D-01..D-04 | COMPLETE | ... |
| E — LOD200 Input Notes | D39/D40/D33/D41/D36+D37 | NOTED | ... |
| F — WSM Alignment | WSM log note | COMPLETE | ... |

## BLOCKERS (if any)
[List any documents that could not be modified, or any ambiguities found]

## NEXT ACTIONS FOR TEAM 00
[Any items that require Team 00 input or approval]

[log_entry | TEAM_170 | GOVERNANCE_ALIGNMENT_S003_COMPLETE | 2026-03-03]
```

---

## IRON RULES (must be upheld in all documents you touch)

1. **Team 50 = QA + FAV** — never Team 40
2. **Financial precision: NUMERIC(20,8)** — zero rounding — never mention other precisions
3. **Status values: `pending | active | inactive | cancelled`** everywhere — never `open/closed`
4. **notes parent_type: NO 'general'** — valid: ticker/user_ticker/alert/trade/trade_plan/account/datetime
5. **D38 is S005** — not S003, not S004
6. **D33 shows last_price + last_change** — this is now a display requirement, not optional

---

## KEY REFERENCE DOCUMENTS

```
All directives:
_COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_ROADMAP_AMENDMENT_v1.0.0.md
_COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_ROADMAP_AMENDMENT_v2.0.0.md
_COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_SSOT_CORRECTIONS_v1.0.0.md
_COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_TEAM_ROSTER_LOCK_v1.0.0.md
_COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_S003_PREP_DECISIONS_v1.0.0.md
_COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_PL_RECONCILIATION_POLICY_v1.0.0.md

Target governance documents:
documentation/docs-governance/01-FOUNDATIONS/PHOENIX_PORTFOLIO_ROADMAP_v1.0.0.md
documentation/docs-governance/01-FOUNDATIONS/PHOENIX_PROGRAM_REGISTRY_v1.0.0.md
documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md
documentation/docs-governance/01-FOUNDATIONS/TEAM_DEVELOPMENT_ROLE_MAPPING_v1.0.0.md
documentation/docs-system/01-ARCHITECTURE/TT2_PAGES_SSOT_MASTER_LIST.md
documentation/docs-system/08-PRODUCT/LEGACY_TO_PHOENIX_MAPPING_V2.5.md
```

---

*log_entry | TEAM_00 | TEAM_170_GOVERNANCE_ALIGNMENT_S003_PROMPT | ISSUED | 2026-03-03*
