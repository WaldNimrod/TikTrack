# PI-005 Gap Register

**id:** `PI-005_GAP_REGISTER`  
**owner:** Team 70 (Product Intelligence)  
**status:** DRAFT (UPDATED AFTER MENU+DOC ALIGNMENT)  
**date:** 2026-02-15  
**scope:** Blockers, missing data, conflicting docs, decisions needed

---

## 1) Critical Gaps (Blocking)

| ID | Gap | Severity | Owner | Action | Due Stage |
|----|-----|----------|-------|--------|-----------|
| G-001 | 15 pages are template-shell only (served but not feature-complete) | High | Team 10 + Team 30 + Architect | Publish readiness policy and rollout order per page | Before external campaign |
| G-002 | Marketing/investor messaging does not yet enforce functional vs template split | High | Architect + Team 10 | Lock claim policy and canonical wording | Immediate |
| G-003 | Commercial model assumptions are not locked in SSOT | High | Architect | Define pricing/tier framing for investor pack | Investor deck prep |

---

## 2) Documentation / Scope Gaps

| ID | Gap | Severity | Owner | Action | Due Stage |
|----|-----|----------|-------|--------|-----------|
| G-004 | No canonical per-page readiness table in central SSOT (functional/template/planned) | Medium | Team 10 | Promote PI-001 matrix into central docs | Batch 3 governance cycle |
| G-005 | No KPI baseline pack for business communication | Medium | Architect + Team 10 | Define minimum KPI set and source of truth | Pre-marketing |
| G-006 | Missing explicit template-labeling rule in header/page shell | Medium | Architect + Team 30 | Approve and implement one label standard | Near-term |

---

## 3) Missing Decisions

| ID | Decision Needed | Owner | Impact |
|----|-----------------|-------|--------|
| D-001 | Guest homepage content policy (anonymous vs logged-in value framing) | Architect + Team 30 | Homepage conversion + trust |
| D-002 | Rollout priority for 15 template pages | Architect + Team 10 | Execution sequencing |
| D-003 | Investor narrative: which modules are "live" vs "roadmap" by wording | Architect | Partner/investor clarity |
| D-004 | Executions functional target (API+UI milestones) | Team 20 + Team 30 + Architect | Batch 4 plan integrity |

---

## 4) Resolved Issues (Post-Alignment)

| ID | Previous Gap | Current State |
|----|--------------|---------------|
| R-001 | Header pointed to non-implemented pages (404/redirect risk) | Resolved: all header links route to served pages |
| R-002 | Route/menu mismatch | Resolved at navigation/template level |
| R-003 | Missing physical page files for roadmap links | Resolved: template pages created and mapped |

---

## 5) Technical / Operational Gaps (Still Open)

| ID | Gap | Severity | Owner | Evidence Anchor |
|----|-----|----------|-------|-----------------|
| T-001 | Provider reliability/rate-limit scaling for growing data volume | Medium | Team 20 + Team 60 | External-data specs + QA artifacts |
| T-002 | Crypto symbol/provider parity in user-tickers flow | Medium | Team 20 + Team 50 | user-tickers QA evidence |
| T-003 | Status-driven scheduler hardening (`status` semantics) | Medium | Team 20 + Team 60 | ticker status SSOT |
| T-004 | Template pages need feature contracts before implementation | Medium | Team 10 + Team 31 + Team 20/30 | roadmap/task hierarchy |

---

## 6) Action Plan (Prioritized)

| Priority | Action | Owner | Timeline |
|----------|--------|-------|----------|
| P1 | Lock "functional vs template" communication policy | Architect + Team 90 | Immediate |
| P2 | Promote readiness matrix to central SSOT | Team 10 | Next governance cycle |
| P3 | Define rollout wave for 15 template pages | Team 10 + Architect | Before Batch 3 implementation waves |
| P4 | Close investor model assumptions (pricing/KPI/GTM) | Architect | Investor pack v1 |
| P5 | Convert top 3 template pages to functional MVP | Team 20 + Team 30 + Team 40 | Next execution wave |

---

**log_entry | TEAM_70 | PI-005_UPDATED_AFTER_MENU_ALIGNMENT | 2026-02-15**
