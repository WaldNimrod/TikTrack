# TEAM_90 -> TEAM_10 | S002-P003-WP002 G7 Remediation Activation
**project_domain:** TIKTRACK

**id:** TEAM_90_TO_TEAM_10_S002_P003_WP002_G7_REMEDIATION_ACTIVATION_v1.0.0
**from:** Team 90 (GATE_5-8 owner)
**to:** Team 10 (Execution Orchestrator)
**cc:** Team 20, Team 30, Team 50, Team 60, Team 100, Team 00
**date:** 2026-03-04
**status:** ACTION_REQUIRED
**gate_id:** GATE_3
**work_package_id:** S002-P003-WP002
**in_response_to:** _COMMUNICATION/_Architects_Decisions/NIMROD_GATE7_S002_P003_WP002_DECISION_v1.3.0.md

---

## 1) Activation scope

This activation opens remediation execution for all 26 blocking findings from GATE_7 rejection.

No partial closure is allowed. Full scope required: D22 + D33 + D34 + D35 + shared UI behavior.

---

## 2) Streams and ownership

- **Stream A (UI consistency):** Team 30 (owner), Team 60 (asset support)
- **Stream B (Ticker domain integrity):** Team 20 (owner), Team 30 (UI wiring)
- **Stream C (Alerts/Notes semantics + forms):** Team 20 (owner), Team 30 (UI), Team 50 (QA proofs)
- **Stream D (Attachments + pagination + live refresh):** Team 30 (owner), Team 20 (API if needed), Team 50 (QA proofs)

---

## 3) Blocking findings matrix (must all close)

| ID | Finding | Owner | Closure proof (minimum) |
|---|---|---|---|
| BF-G7-001 | Favicon missing | Team 30/60 | favicon visible in browser tab + path in app HTML |
| BF-G7-002 | D22 wrong entity color | Team 30 | D22 visual uses ticker entity color |
| BF-G7-003 | D22 validation messaging unclear | Team 30 | concise inline validation summary |
| BF-G7-004 | D22 filter buttons not canonical | Team 30 | canonical CSS size/icons applied |
| BF-G7-005 | Missing action tooltips | Team 30 | tooltips on all row action buttons |
| BF-G7-006 | `לבטל` text | Team 30 | all modal cancel labels are `ביטול` |
| BF-G7-007 | D22 modal entity color missing | Team 30 | modal header/buttons use ticker entity color |
| BF-G7-008 | No ticker symbol validation | Team 20 | invalid symbols blocked by provider validation |
| BF-G7-009 | Duplicate symbol allowed | Team 20 | unique symbol enforcement (API + DB) |
| BF-G7-010 | Delete ticker ignores user_tickers refs | Team 20 | delete guard + clear error message |
| BF-G7-011 | Ticker status update not persisted | Team 20 | status update persists and returns in list |
| BF-G7-012 | linked_to lacks record name | Team 30/20 | linked type + linked record name rendered |
| BF-G7-013 | Alert without condition allowed | Team 20/30 | save blocked unless condition valid |
| BF-G7-014 | `general` linkage still allowed | Team 20/30 | create/edit blocks `general` |
| BF-G7-015 | Alert message not rich text | Team 30/20 | rich-text editor + persisted content |
| BF-G7-016 | `#alertsSummaryToggleSize` alignment | Team 30 | aligned to row end |
| BF-G7-017 | Linked entity optional | Team 20/30 | linked entity mandatory (alert/note) |
| BF-G7-018 | Cannot edit linked entity | Team 20/30 | edit flow supports linked entity change |
| BF-G7-019 | `#notesPageNumbers` wraps lines | Team 30 | no line break; horizontal pagination |
| BF-G7-020 | File error closes modal | Team 30 | inline error; modal stays open |
| BF-G7-021 | File error not styled as error | Team 30 | error style token used |
| BF-G7-022 | New attachment not shown immediately | Team 30 | optimistic/instant list update |
| BF-G7-023 | Attachments not shown in table | Team 30 | attachment indicator/render in rows |
| BF-G7-024 | No attachment preview/open action in details | Team 30 | preview + open action implemented |
| BF-G7-025 | Max file size too small | Team 20/30 | size limit raised to 2.5MB |
| BF-G7-026 | Table not refreshed after any update | Team 30/20 | post-CRUD table state refresh is immediate |

---

## 4) QA and validation gate

- Team 50 must produce one consolidated rerun report covering all 26 BF IDs.
- Team 90 validates closure at GATE_5 only after Team 50 confirms all BF IDs PASS.

---

## 5) Gate sequence lock

`GATE_3 remediation -> GATE_4 QA -> GATE_5 Team 90 validation -> GATE_6 package -> GATE_7 re-test`

No skip, no partial promotion.

---

**log_entry | TEAM_90 | G7_REMEDIATION_ACTIVATION | S002_P003_WP002 | 26_BLOCKERS_ASSIGNED | 2026-03-04**
