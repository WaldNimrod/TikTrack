# Team 170 — Domain Refactor Directive Intake v1.0.0

**id:** TEAM_170_DOMAIN_REFACTOR_DIRECTIVE_INTAKE_v1.0.0  
**from:** Team 170 (Librarian & Structural Custodian)  
**to:** Team 100 (Development Architecture Lead), Team 190  
**re:** TEAM_100_TO_TEAM_170_DOMAIN_REFACTOR_DIRECTIVE_v1.0.0  
**date:** 2026-02-21  
**status:** INTAKE_CONFIRMED | EXECUTION_IN_PROGRESS  
**project_domain:** AGENTS_OS

---

## 1) Directive received

- **Objective:** Full structural domain isolation between TIKTRACK | AGENTS_OS | SHARED. Structural refactor, not documentation-only.
- **Mandatory actions:** Create `/agents_os/` root; create required subfolders; scan repo for Agent_OS/Agents_OS/Governance runtime references; classify TIKTRACK/AGENTS_OS/SHARED; MOVE AGENTS_OS artifacts under `/agents_os/`; add `project_domain` header to all markdown; consolidate legacy `_ARCHITECTURAL_INBOX` into `_COMMUNICATION/_ARCHITECT_INBOX`; produce DOMAIN_REFACTOR_COMPLETION_REPORT_v1.0.0.md.
- **Constraints:** No deletions without archive placement; no duplication; provenance trail for every moved artifact; no governance logic outside domain root.
- **Deliverable:** Validated structural report to Team 190.

---

## 2) Current state (pre-refactor)

| Item | Status |
|------|--------|
| **agents_os/ (lowercase) at root** | Did not exist; created per directive with required structure. |
| **Agents_OS/ (existing)** | Exists at repo root with `AGENTS_OS_FOUNDATION_v1.0.0.md` (already has `project_domain: AGENTS_OS`). To be consolidated into `agents_os/` per directive (move, not copy). |
| **_ARCHITECTURAL_INBOX at root** | Not present as physical folder at repo root. References in docs point to legacy path; canonical is `_COMMUNICATION/_ARCHITECT_INBOX`. Consolidation = update all references and ensure no new content under root inbox. |
| **_COMMUNICATION/_ARCHITECT_INBOX** | Exists; contains submission packages (e.g. SSM_LOCK_AND_STRUCTURE_ALIGNMENT_SPEC_APPROVAL_REQUEST, AGENT_OS_PHASE_1/...). |

---

## 3) Execution plan (order of operations)

**Scoping (צמצום היקף):** ראה `TEAM_170_DOMAIN_REFACTOR_SCOPING_v1.0.0.md`. קבצים זמניים/ישנים (מלפני 7+ ימים) → ארכיון או סימון legacy; **רק** תוכניות פעילות, קבצים קבועים/קנוניים ושלבים שלא נסגרו — עוברים עדכון מלא (project_domain + נתיבים).

0. **Phase 0 — Scoping** — ארכיון או סימון legacy לקבצים שלא in-scope; רשימת קבצים חובה לעדכון (active WP S001-P001-WP001, canonical, stages not closed).  
1. **Create physical structure** — `agents_os/` + subdirs. ✅  
2. **Scan repository** — Agent_OS/Agents_OS/Governance references; classification (TIKTRACK | AGENTS_OS | SHARED).  
3. **Move AGENTS_OS artifacts** — MOVE into `agents_os/` with provenance trail.  
4. **Add project_domain header** — **In-scope only** (active programs, canonical, incomplete stages); legacy/archived = no structural edit or single-line marker.  
5. **Consolidate inbox** — All references to `_COMMUNICATION/_ARCHITECT_INBOX`; no content under root `_ARCHITECTURAL_INBOX`.  
6. **Produce report** — DOMAIN_REFACTOR_COMPLETION_REPORT_v1.0.0.md.  
7. **Submit to Team 190** — בקשת ולידציה (סקופ + דרישה מקורית + קישור למסמך Team 100): `TEAM_170_TO_TEAM_190_DOMAIN_REFACTOR_VALIDATION_REQUEST_v1.0.0.md`.

**תוכנית ביצוע ממוקדת:** `DOMAIN_REFACTOR_EXECUTION_PLAYBOOK_v1.0.0.md` — סריקה אחת, סיווג באצווה, ביצוע לפי שלבים עם נקודות בדיקה.

---

## 4) Constraints compliance

- No deletions without explicit archive placement.  
- No duplication.  
- Every moved artifact: provenance trail (e.g. MOVED_FROM in header or REFACTOR_LOG).  
- No governance logic outside its domain root.

---

**log_entry | TEAM_170 | DOMAIN_REFACTOR_DIRECTIVE | INTAKE_CONFIRMED | 2026-02-21**
