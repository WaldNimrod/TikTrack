# GAP Closure Master List — GAP_CLOSURE_PRE_AGENT

**id:** GAP_CLOSURE_MASTER_LIST  
**owner:** Team 10 (The Gateway)  
**stage:** GAP_CLOSURE_PRE_AGENT  
**last_updated:** 2026-02-18

---

## 1. Carryover Items (current status)

Source: `_COMMUNICATION/team_10/TEAM_10_LEVEL2_COMPLETION_CARRYOVER_LIST.md`

| ID | Source (archived/current) | Open item | Target stage | Owner | Status |
|----|----------------------------|-----------|--------------|-------|--------|
| CARRY-001 | archive/…TT2_PHASE_2_IMPLEMENTATION_PLAN.md:259 | Manual/Visual approval checkpoint requires closure verification | Batch 3 readiness | Team 40 + Team 10 | **FORMALLY DECIDED** — TEAM_10_GAP_CLOSURE_FORMAL_DECISIONS.md §5 |
| CARRY-002 | archive/…TT2_PHASE_2_IMPLEMENTATION_PLAN.md:267 | Cash Flows response schema verification status not closed in legacy plan | Batch 3 readiness | Team 20 | **FORMALLY DECIDED** — TEAM_10_GAP_CLOSURE_FORMAL_DECISIONS.md §5 |
| CARRY-003 | archive/…TT2_PHASE_2_IMPLEMENTATION_PLAN.md:279 | Data loader update for currency_conversions marked pending in legacy plan | Batch 3 readiness | Team 30 | **FORMALLY DECIDED** — TEAM_10_GAP_CLOSURE_FORMAL_DECISIONS.md §5 |
| CARRY-004 | documentation/docs-system/01-ARCHITECTURE/TT2_OFFICIAL_PAGE_TRACKER.md:56 | D22 Tickers: data-integrity widget + integration completion | Batch 3 | Team 30 + Team 20 | **FORMALLY DECIDED** — TEAM_10_GAP_CLOSURE_FORMAL_DECISIONS.md §5 |
| CARRY-005 | documentation/docs-system/01-ARCHITECTURE/TT2_OFFICIAL_PAGE_TRACKER.md:57 | D23 Data Dashboard: move from template/draft to functional scope | Batch 3 | Team 30 | **FORMALLY DECIDED** — TEAM_10_GAP_CLOSURE_FORMAL_DECISIONS.md §5 |
| CARRY-006 | documentation/docs-system/…/TT2_OFFICIAL_PAGE_TRACKER.md:60 | D24 Trade Plans: implementation planning and execution gate | Batch 5 | Team 31 + Team 30 + Team 20 | **FORMALLY DECIDED** — TEAM_10_GAP_CLOSURE_FORMAL_DECISIONS.md §5 |
| CARRY-007 | documentation/docs-system/…/TT2_OFFICIAL_PAGE_TRACKER.md:61 | D25 AI Analysis: detailed spec required before build | Batch 5/6 | Team 31 + Team 30 + Team 70 | **FORMALLY DECIDED** — TEAM_10_GAP_CLOSURE_FORMAL_DECISIONS.md §5 |
| CARRY-008 | documentation/docs-system/…/TT2_OFFICIAL_PAGE_TRACKER.md:62 | D26 Watch Lists: spec + build plan missing | Batch 5 | Team 31 + Team 30 | **FORMALLY DECIDED** — TEAM_10_GAP_CLOSURE_FORMAL_DECISIONS.md §5 |
| CARRY-009 | documentation/docs-system/…/TT2_OFFICIAL_PAGE_TRACKER.md:63 | D27 Ticker Dashboard: spec + dependencies on historical data | Batch 6 | Team 31 + Team 30 + Team 20 | **FORMALLY DECIDED** — TEAM_10_GAP_CLOSURE_FORMAL_DECISIONS.md §5 |
| CARRY-010 | documentation/docs-system/…/TT2_OFFICIAL_PAGE_TRACKER.md:64 | D28 Trading Journal: spec + implementation plan missing | Batch 6 | Team 31 + Team 30 | **FORMALLY DECIDED** — TEAM_10_GAP_CLOSURE_FORMAL_DECISIONS.md §5 |
| CARRY-011 | documentation/docs-system/…/TT2_OFFICIAL_PAGE_TRACKER.md:66 | D30–D32 advanced research pages: full specs missing | Batch 6 | Team 31 + Team 30 + Team 70 | **FORMALLY DECIDED** — TEAM_10_GAP_CLOSURE_FORMAL_DECISIONS.md §5 |
| CARRY-012 | documentation/docs-system/…/TT2_OFFICIAL_PAGE_TRACKER.md:67 | D37 Data Import marked urgent | Batch 4 | Team 31 + Team 30 + Team 20 | **FORMALLY DECIDED** — TEAM_10_GAP_CLOSURE_FORMAL_DECISIONS.md §5 |
| CARRY-013 | documentation/docs-system/…/TT2_OFFICIAL_PAGE_TRACKER.md:68 | D38–D39 Settings pages require detailed spec | Batch 3/5 | Team 31 + Team 30 + Team 70 | **FORMALLY DECIDED** — TEAM_10_GAP_CLOSURE_FORMAL_DECISIONS.md §5 |
| CARRY-014 | documentation/docs-system/…/LOGIC/PENDING_LOGIC_ALERTS.md:17 | Pending undefined logic alert not triaged | Governance fix | Team 10 + Team 20 | **FORMALLY DECIDED** — TEAM_10_GAP_CLOSURE_FORMAL_DECISIONS.md §5 |
| CARRY-015 | documentation/docs-system/…/CASH_FLOW_PARSER_SPEC.md:75 | Precision rule conflict note still marked "decision required" | Stage-1 SSOT hygiene | Team 10 + Team 20 + Team 60 | **FORMALLY DECIDED** — TEAM_10_GAP_CLOSURE_FORMAL_DECISIONS.md §5 |

---

## 2. Drift Items

### 2.1 SOP-013 naming / path (Team 90 POC note)

| Item | Current state | Status |
|------|----------------|--------|
| Referenced policy file | **RESOLVED.** Canonical closure rule: `_COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_GOVERNANCE_STRENGTHENING.md`. Directive updated to self-reference; Evidence logs + Team 90 indexes updated. No active reference to archived 07-POLICIES file. | **RESOLVED** |

### 2.2 Authority Drift Register (AD-001 … AD-019)

Source: `documentation/reports/_POC_TEMP/DEV_ORCH_POC_PACKAGE_2026-02-18/C_reality_map/TEAM_90_AUTHORITY_DRIFT_REGISTER.md`

- **P1 (8):** Wrong architect authority path; non-authority doc marked "locked SSOT"; governance directive from comm folder; binding mandate from communication channel; Smart History Fill spec as SSOT in comm; deprecated index.
- **P2 (8):** Roadmap/protocol/policy points to `90_Architects_comunication` instead of `_Architects_Decisions`; SOP closure gate policy (AD-015) links directive through comm path; PHOENIX_MASTER_BIBLE, SSOT Registry, table responsivity same.
- **P3 (1):** Historical consolidation references comm folder as architect endpoint.

**Status:** **RESOLVED** per TEAM_10_GAP_CLOSURE_FORMAL_DECISIONS.md §4. Canonical = _Architects_Decisions; key active files updated (Architect Directive, Evidence logs, PHOENIX_DOCUMENTATION_GOVERNANCE_INDEX, TEAM_90_GOVERNANCE_ROLE_RESET). Remaining references in archived/docs POC package unchanged.

---

## 3. Open Authority Ambiguities

(From Authority Drift Register §6 and POC README)

| # | Ambiguity | Current state | Decision needed |
|---|------------|----------------|-----------------|
| 1 | Smart History Fill spec | **FORMALLY DECIDED** — SSOT: MARKET_DATA_PIPE_SPEC §5 + MARKET_DATA_COVERAGE_MATRIX Rule 9; comm file = communication only (TEAM_10_GAP_CLOSURE_FORMAL_DECISIONS.md §3). |
| 2 | Header architecture decision | **FORMALLY DECIDED** — Canonical: _Architects_Decisions/ARCHITECT_HEADER_UNIFICATION_MANDATE.md; procedures point to _Architects_Decisions only (TEAM_10_GAP_CLOSURE_FORMAL_DECISIONS.md §3). |
| 3 | P3_003 SSOT alignment | **FORMALLY DECIDED** — Historical context only; not decision authority (TEAM_10_GAP_CLOSURE_FORMAL_DECISIONS.md §3). |
| 4 | ACTIVE_STAGE.md | **RESOLVED** — Created; Team 90 re-validate. |
| 5 | TEAM_90_ARTIFACT_GOVERNANCE_REALITY_MAP.md | **RESOLVED** — Naming: PHOENIX_GOVERNANCE_ALIGNMENT_PLAN + GOVERNANCE_SOURCE_MATRIX + TEAM_90_AUTHORITY_DRIFT_REGISTER. |

---

## 4. Documentation Inconsistencies

| # | Inconsistency | Location / note |
|---|----------------|-----------------|
| 1 | Dual documentation roots | **FORMALLY DECIDED** — Model B: docs-system + docs-governance (00_MASTER_INDEX); Page Tracker/SSOT בנתיבים פעילים; Carryover מפנה ל-docs-system. |
| 2 | docs-governance vs documentation | **FORMALLY DECIDED** — Governance standards ב-docs-governance; SOP-013 קנון ב-_Architects_Decisions; עד סיום מיגרציה — מפורש ב-GOVERNANCE_SOURCE_MATRIX. |
| 3 | 00_MASTER_INDEX path | **RESOLVED** — Canonical Master Index = `00_MASTER_INDEX.md` (repo root). TEAM_10_GAP_CLOSURE_FORMAL_DECISIONS.md §2; PHOENIX_DOCUMENTATION_GOVERNANCE_INDEX updated. |
| 4 | Seal (SOP-013) wording | **RESOLVED** — Single policy path: _Architects_Decisions/ARCHITECT_DIRECTIVE_GOVERNANCE_STRENGTHENING.md. All active refs updated. |

---

## 5. Status Summary

| Category | Count OPEN | Count RESOLVED/DECIDED |
|----------|-----------|-------------------------|
| Carryover (CARRY-001 … CARRY-015) | 0 | 15 (FORMALLY DECIDED) |
| Drift (SOP-013 + AD-001 … AD-019) | 0 | Resolved per §2; formal decisions §4 |
| Authority ambiguities | 0 | 5 (FORMALLY DECIDED / RESOLVED) |
| Documentation inconsistencies | 0 | 4 (RESOLVED — Master Index + SOP-013) |

**Evidence:** TEAM_10_GAP_CLOSURE_FORMAL_DECISIONS.md; תיקוני קבצים: ARCHITECT_DIRECTIVE, Evidence logs, PHOENIX_DOCUMENTATION_GOVERNANCE_INDEX, TEAM_90_GOVERNANCE_ROLE_RESET. הגשה חוזרת ל-Team 90 — Gate חוזר.

---

**log_entry | TEAM_10 | GAP_CLOSURE_MASTER_LIST | UPDATED_RESOLVED | 2026-02-18**
