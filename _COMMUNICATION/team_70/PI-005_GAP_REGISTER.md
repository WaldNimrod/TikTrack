# PI-005 Gap Register

**id:** `PI-005_GAP_REGISTER`  
**owner:** Team 70 (Product Intelligence)  
**status:** DRAFT  
**date:** 2026-02-15  
**scope:** Blockers, missing data, conflicting docs, decisions needed

---

## 1) Critical Gaps (Blocking)

| ID | Gap | Severity | Owner | Action | Due Stage |
|----|-----|----------|-------|--------|-----------|
| G-001 | **Header links to 13 non-implemented pages** — Users clicking menu get 404 or redirect to home | **High** | Team 30 + Team 10 | Hide links or add placeholder pages with "בקרוב"; align header with implemented scope | Stage-1 / Batch 3 |
| G-002 | **Marketing homepage risk** — Promising features not yet live (trade plans, journal, etc.) | **High** | Team 10 + Architect | Limit homepage/ads to implemented scope only | Pre-campaign |
| G-003 | **Executions page in menu** — No UI; API status unclear | **Medium** | Team 20 + Team 30 | Clarify executions API; implement or remove from menu | Batch 4 |

---

## 2) Documentation / Scope Gaps

| ID | Gap | Severity | Owner | Action | Due Stage |
|----|-----|----------|-------|--------|-----------|
| G-004 | ** routes.json vs implemented pages** — routes.json lists 26+ pages; only 13 implemented | Medium | Team 10 | Align routes.json with Page Tracker and actual implementation | Batch 3 |
| G-005 | **Legacy DESIGN_FREEZE vs Phoenix** — 27 pages in DESIGN_FREEZE; Phoenix batch structure differs | Low | Team 10 | Map DESIGN_FREEZE to Roadmap v2.1; archive or reconcile | Ongoing |
| G-006 | **User Management** — In DESIGN_FREEZE Phase 1; not in current AppRouter or header | Low | Architect | Decide: in scope for Phoenix or deferred | Batch 3 |
| G-007 | **Legacy artifacts** — Reports in artifacts describe pre-fix state | Low | Team 10 | Cleanup; align artifacts with current SSOT | TT2_CURRENT_STATE_AND_GAPS |

---

## 3) Missing Decisions

| ID | Decision Needed | Owner | Impact |
|----|-----------------|-------|--------|
| D-001 | Guest vs logged-in content on `/` (HomePage) | Architect + Team 30 | Marketing CTA, first impression |
| D-002 | Revenue model / premium tiers for investor narrative | Architect | Investor pack completeness |
| D-003 | Header strategy: hide non-implemented vs show "בקרוב" | Team 10 | UX consistency |
| D-004 | AI Analysis / Trade Plans — prioritization for narrative | Architect | Marketing differentiation |
| D-005 | User Management — in or out of Phoenix user scope | Architect | Page inventory accuracy |

---

## 4) Conflicting or Unclear Sources

| ID | Conflict | Resolution |
|----|----------|------------|
| C-001 | **Page count** — Page Tracker emphasizes D16/D18/D21/D22/D23; header has many more links | SSOT: Page Tracker + implemented files. Header is aspirational; needs alignment. |
| C-002 | **User Ticker vs User Tickers** — DESIGN_FREEZE uses `/user_ticker`; routes use `/user_tickers.html` | routes.json and implemented path use `user_tickers`; legacy doc inconsistent. |
| C-003 | **Strategy Analysis** — New in DESIGN_FREEZE; route `strategy-analysis.html` in header | Implemented: no. Planned: Roadmap Batch 6. Header shows link. |

---

## 5) Technical / Operational Gaps (from SSOT)

| ID | Gap | Severity | Owner | Evidence |
|----|-----|----------|-------|----------|
| T-001 | Yahoo rate limit under full nightly load | Non-blocking (fallback exists) | Team 20 + Team 60 | TT2_CURRENT_STATE_AND_GAPS |
| T-002 | Crypto add flow E2E verification (3 symbols) | Open | Team 20 + Team 50 | TT2_CURRENT_STATE_AND_GAPS |
| T-003 | Status-driven scheduler migration (`status` vs `is_active`) | Open | Team 20 + Team 60 | TT2_CURRENT_STATE_AND_GAPS |
| T-004 | PDSC boundary hardening | Open | Team 20 + Team 30 | TT2_CURRENT_STATE_AND_GAPS |
| T-005 | D22 Ticker data-integrity UI (dropdown, gaps, last_updates) | In progress | Team 30 | TEAM_20_TO_TEAMS_10_30, Page Tracker |

---

## 6) Marketing & Investor Blockers Summary

| Blocker | Blocks | Action |
|---------|--------|--------|
| Header → non-implemented pages | Trust, UX, campaign honesty | Fix menu or add placeholders |
| No guest homepage definition | CTA clarity | Architect + Team 30 |
| No revenue model in SSOT | Investor narrative | Architect |
| Proof assets (screenshots, demo) | Campaign readiness | Team 40 + Team 30 |

---

## 7) Action Plan (Prioritized)

| Priority | Action | Owner | Timeline |
|----------|--------|-------|----------|
| P1 | Align header with implemented scope (hide or placeholder) | Team 30 | Stage-1 closure |
| P2 | Define guest HomePage content and CTA | Architect + Team 30 | Pre-campaign |
| P3 | Clarify Executions API and UI plan | Team 20 + Team 30 | Batch 4 kickoff |
| P4 | Align routes.json with Page Tracker | Team 10 | Batch 3 |
| P5 | Collect proof assets (screenshots, demo flow) | Team 40 | Pre-campaign |
| P6 | Revenue / GTM assumptions for investor pack | Architect | As needed |

---

**log_entry | TEAM_70 | PI-005_DRAFT | 2026-02-15**
