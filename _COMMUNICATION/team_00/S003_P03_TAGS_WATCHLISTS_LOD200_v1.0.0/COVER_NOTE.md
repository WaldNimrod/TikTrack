---
id: S003_P03_TAGS_WATCHLISTS_LOD200_COVER_NOTE
from: Team 00 (Chief Architect — Nimrod)
to: Team 10 (Gateway), Team 190 (Constitutional Architectural Validator)
cc: Team 30 (Development), Team 50 (QA), Team 100 (visibility)
program: S003-P03
gate: LOD200 — Architectural Concept (pre-GATE_0)
sv: 1.0.0
effective_date: 2026-02-27
project_domain: TIKTRACK
---

# COVER NOTE — LOD200 Architectural Concept
## S003-P03: Tags + Watchlists (D38 + D26)

---

## Mandatory Identity Header

| Field | Value |
|-------|--------|
| roadmap_id | TIKTRACK_ROADMAP_LOCKED (sv 1.0.0, 2026-02-26) |
| stage_id | S003 |
| program_id | S003-P03 |
| work_package_id | N/A (pre-gate, program-level concept) |
| task_id | N/A |
| gate_id | PRE-GATE_0 — LOD200 Activation Package |
| phase_owner | Team 00 (until GATE_0 opens; then Team 190) |
| required_ssm_version | 1.0.0 |
| required_active_stage | S003 (activates after S002-P003 COMPLETE) |
| project_domain | TIKTRACK |

---

## 1) הצהרת הפעלה

Team 00 (Chief Architect) מפעיל את חבילת S003-P03: **Tags + Watchlists**.

חבילה זו מכילה שני עמודים חדשים לחלוטין:
- **D38** — ניהול תגיות (`/tag_management.html`) — Settings menu
- **D26** — רשימות צפייה (`/watch_lists.html`) — Tracking menu

שניהם **full new builds** — backend + frontend + tests. שניהם user-scoped (לא admin).

---

## 2) תנאי הפעלה

חבילה זו **לא מתחילה לפני** שמתקיימים כל התנאים הבאים:

| תנאי | מצב | הערה |
|------|-----|------|
| S002-P003 COMPLETE | ⏳ ממתין | D22 + D34 + D35 SOP-013 Seal |
| D33 FAV PASS + SOP-013 | ⏳ ממתין | חובה לפני D26 בלבד |
| S003 GATE_0 OPEN | ⏳ ממתין | Team 190 מאמת LOD200 זה |

**D38 תלות:** אין — יכול להתחיל מיד כש-S003 GATE_0 נפתח.
**D26 תלות:** D33 FAV + SOP-013 Seal חייב לפני פתיחת WP002.

---

## 3) מבנה חבילות עבודה

| WP | שם | צוות | תוכן | תלות |
|----|-----|------|------|------|
| S003-P03-WP001 | D38 Tag Management Build | Team 30 | Backend + Frontend + UAI integration | אין (ישיר לS003 GATE_0) |
| S003-P03-WP002 | D26 Watchlists Build | Team 30 | Backend + Frontend + Master-detail UI | D33 FAV PASS sealed |
| S003-P03-WP003 | D38 + D26 FAV Validation | Team 50 | Full CRUD E2E + API scripts + error contracts + XSS | WP001 + WP002 feature-complete |

---

## 4) ניתוב צוותים

| שלב | צוות | פעולה |
|-----|------|-------|
| PRE-GATE_0 | Team 190 | מאמת LOD200 זה (ARCHITECTURAL_CONCEPT.md) |
| GATE_0 PASS | Team 10 | מפעיל Team 30 ל-WP001 |
| D33 SEALED | Team 10 | מפעיל Team 30 ל-WP002 |
| WP001+WP002 DONE | Team 10 | מפעיל Team 50 ל-WP003 (FAV) |
| FAV PASS | Team 90 | Gate sign-off; SOP-013 Seal per page |
| S003-P03 SEALED | Team 70 | Documentation; S003 P-ADMIN cycle opens |

---

## 5) מסמכי ייחוס מחייבים

```
_COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_TIKTRACK_ROADMAP_LOCKED.md
_COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_FAV_PROTOCOL.md
_COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_QA_PROTOCOL_STANDARD.md
_COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_TEST_INFRASTRUCTURE.md
_COMMUNICATION/team_00/S003_P03_TAGS_WATCHLISTS_LOD200_v1.0.0/ARCHITECTURAL_CONCEPT.md  ← הspec המלא
documentation/docs-system/01-ARCHITECTURE/TT2_PAGES_SSOT_MASTER_LIST.md  (D26, D38)
documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md
```

---

## 6) תנאי השלמה — S003-P03

```
✅ D38: GET/POST/PUT/DELETE /me/tags + /me/tags/summary — פונקציונלי
✅ D38: Color picker — HEX תקין נשמר
✅ D38: Unique name per user enforced (409 on duplicate)
✅ D38: E2E Create→Read→Edit→Deactivate→Delete — PASS
✅ D38: API script 100% PASS
✅ D38: SOP-013 Seal

✅ D26: Full CRUD watchlists (create/rename/delete)
✅ D26: Add/remove tickers (from market_data catalog)
✅ D26: "מהרשימה שלי" quick-add tab (D33 integration — UX)
✅ D26: Item note edit + sort_order
✅ D26: Ticker data (price/change%) loads via JOIN
✅ D26: Master-detail UI — selecting watchlist loads items panel
✅ D26: Soft delete cascade (watchlist → items)
✅ D26: E2E Create→Add 3 tickers→Edit note→Remove→Delete — PASS
✅ D26: API script 100% PASS
✅ D26: SOP-013 Seal

✅ PROGRAM: P-ADMIN cycle opens (D22/D40/D41 review)
```

---

**log_entry | TEAM_00 | S003_P03_TAGS_WATCHLISTS_LOD200 | COVER_NOTE_ISSUED | 2026-02-27**
