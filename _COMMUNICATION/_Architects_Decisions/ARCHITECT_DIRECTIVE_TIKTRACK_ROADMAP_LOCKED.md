---
id: ARCHITECT_DIRECTIVE_TIKTRACK_ROADMAP_LOCKED
owner: Chief Architect (Team 00)
status: LOCKED - CANONICAL
decision_type: ROADMAP_LOCK
context: TikTrack Domain Roadmap S002–S006 — Locked Stage/Program/Page Map
sv: 1.0.0
doc_schema_version: 1.0
effective_date: 2026-02-26
last_updated: 2026-02-26
supersedes: PHOENIX_PORTFOLIO_ROADMAP_v1.0.0 (stage-level only; this document adds program-level lock)
related:
  - documentation/docs-governance/01-FOUNDATIONS/PHOENIX_PORTFOLIO_ROADMAP_v1.0.0.md
  - documentation/docs-system/01-ARCHITECTURE/TT2_PAGES_SSOT_MASTER_LIST.md
  - _COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_S002_P003_TIKTRACK_ALIGNMENT.md
  - _COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_FAV_PROTOCOL.md
  - _COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_QA_PROTOCOL_STANDARD.md
  - _COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_TEST_INFRASTRUCTURE.md
  - _COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_CATS.md
---
**project_domain:** TIKTRACK

# ARCHITECT DIRECTIVE — TIKTRACK ROADMAP LOCKED (S002–S006)

---

## 1) Context

Following full verification of the roadmap against:
- TT2_PAGES_SSOT_MASTER_LIST (canonical page registry)
- PHOENIX_PORTFOLIO_ROADMAP_v1.0.0 (stage assignments)
- routes.json v1.2.0 (all routes confirmed)
- unified-header.html v1.1.0 (all menu paths confirmed)
- PI_STRATEGIC_NARRATIVE_REPORT (architectural module planning)
- Direct codebase investigation (implementation status per page)

...and following explicit architectural decisions by Chief Architect (Nimrod, 2026-02-26),
this directive locks the TikTrack program-level roadmap.

Coverage verified: **100%** — all 27 numbered pages from SSOT are accounted for.

---

## 2) Locked Decisions (summary)

| Decision | Detail |
|----------|--------|
| D36 before D37 | Executions builds the foundation for Data Import |
| D33 before D26 | הטיקרים שלי must be FAV-complete before רשימות צפייה development begins |
| D26 + D38 same package | Watchlists and Tags are interdependent — moved D26 from S005 to S003-P03 |
| D39 + D40 same package | User preferences and system admin settings are complementary — precise integration required |
| D40 enters formal scope | Previously "no stage / admin utility" — now formally S003-P02 |
| D27 + D25 same package | Both work against market data, not user data |
| D28 + D31 same package | Trading journal and trade history are architecturally unified; D31 moves S006→S005-P03 |
| D29+D24 flagged | ⚠️ REQUIRES ARCHITECTURAL DEEP-DIVE SESSION before GATE_0 — new entity structure thinking |
| D32 priority ⭐ | Portfolio State is super-critical; implement ASAP once D36+D29+D31 are sealed |
| D30 = final package | Strategy analysis is last, together with system-wide completion pass |
| Admin package per stage | Every stage ends with a dedicated Admin Review & Update package (P-ADMIN) |
| D23 deferred | Data dashboard deferred — no stage assigned; excluded from S003 |
| D31 moves to S005-P03 | Builds together with D28; was previously S006 |

---

## 3) Admin Review Packages — Binding Protocol

**Every stage ends with a P-ADMIN package.** This is mandatory.

### What P-ADMIN covers per stage

P-ADMIN is NOT a page build — it is a structured review-and-update cycle for all admin/management pages.

Three branches reviewed in every P-ADMIN:

| Branch | Page | Route | Menu |
|--------|------|--------|------|
| Branch A — ניהול טיקרים | D22 | /tickers.html | ניהול → ניהול טיקרים |
| Branch B — ניהול מערכת | D40 | /system_management.html | ניהול → ניהול מערכת |
| Branch C — ניהול עיצובים | D41 | /admin/design-system | ניהול → ניהול עיצובים |

### P-ADMIN scope per cycle

For each branch, per stage:
1. **Review:** What new functionality does this admin page need in light of the stage just completed?
2. **Gap analysis:** What is missing vs. what the system now requires?
3. **Update:** Implement required additions/changes (bounded scope — no new architecture)
4. **QA:** Targeted regression + new functionality tests
5. **Document:** Update admin page docs

### P-ADMIN activation rule

P-ADMIN activates AFTER all substantive programs in the stage are sealed.
P-ADMIN sealing is required before the NEXT stage GATE_0 may open.

---

## 4) Full Locked Roadmap

### S001 — הושלם (COMPLETE)

| # | עמוד | נתיב | תפריט |
|---|------|-------|--------|
| D15.L | כניסה | /login | — ציבורי |
| D15.R | הרשמה | /register | — ציבורי |
| D15.P | שחזור סיסמה | /reset-password | — ציבורי |
| D15.I | דשבורד בית | / | בית |
| D15.V | פרופיל משתמש | /profile | הגדרות → פרופיל |
| D16 | חשבונות מסחר | /trading_accounts.html | נתונים → חשבונות מסחר |
| D18 | עמלות ברוקרים | /brokers_fees.html | נתונים → ברוקרים ועמלות |
| D21 | תזרימי מזומנים | /cash_flows.html | נתונים → תזרימי מזומנים |
| D34 | התראות | /alerts.html | נתונים → התראות |
| D35 | הערות | /notes.html | נתונים → הערות |

---

### S002 — פעיל (ACTIVE)

**P001 — Agents_OS Validation Engine** *(external to TikTrack scope, Team 100)*

| # | עמוד | מצב |
|---|------|-----|
| WP001 | Spec Validator | ✅ GATE_8 |
| WP002 | Execution Validator | GATE_3 INTAKE_OPEN |

**P003 — TikTrack Alignment** *(active — this directive activates it)*

| # | עמוד | נתיב | מצב |
|---|------|-------|-----|
| D22 | ניהול טיקרים | /tickers.html | ✅ ממומש — filter UI + FAV ⏳ |
| D34 | התראות | /alerts.html | Gate-A ✅ — FAV ⏳ |
| D35 | הערות | /notes.html | Gate-A ✅ — FAV ⏳ |

**P-ADMIN — Admin Review S002**
Review post-alignment state of D22 (primary). Baseline documentation of D40 current state.
D41 design system check in context of alignment changes.

**⏸️ D23 — דשבורד נתונים** | DEFERRED — שלב TBD | לא חלק מS002

---

### S003 — מתוכנן

**P01 — הגדרות מערכת** *(D39 + D40 — user preferences + system settings, integrated build)*

| # | עמוד | נתיב | תפריט | מצב |
|---|------|-------|--------|-----|
| D39 | העדפות משתמש | /preferences.html | הגדרות → העדפות | 🔲 Shell — בניה מלאה |
| D40 | ניהול מערכת (Admin) | /system_management.html | ניהול → ניהול מערכת | 🔲 נכנס לסקופ |

*Note: D39 = user-level settings; D40 = admin-level global settings. Must be designed as an
integrated settings system with shared data model and precise integration points.*

**P02 — הטיקרים שלי** *(FAV only — prerequisite for D26)*

| # | עמוד | נתיב | תפריט | מצב |
|---|------|-------|--------|-----|
| D33 | הטיקרים שלי | /user_tickers.html | נתונים → הטיקרים שלי | ✅ ממומש — FAV בלבד |

*Must be sealed before D26 development begins.*

**P03 — תגיות ורשימות צפייה** *(D38 + D26 — D26 requires D33 sealed)*

| # | עמוד | נתיב | תפריט | מצב | תלות |
|---|------|-------|--------|-----|------|
| D38 | ניהול תגיות | /tag_management.html | הגדרות → ניהול תגיות | 🔲 Shell — בניה מלאה | עצמאי |
| D26 | רשימות צפייה | /watch_lists.html | מעקב → רשימות צפייה | 🔲 Shell — בניה מלאה | D33 sealed ✓ |

*D38 development may begin in parallel with P02. D26 starts only after P02 (D33 FAV) complete.*

**P-ADMIN — Admin Review S003**
Review D22 in context of new tags + watchlists.
Review D40 post-build integration check.
Review D41 for any new component needs from S003 pages.

---

### S004 — מתוכנן

**P01 — ביצועים** *(D36 — must come before D37)*

| # | עמוד | נתיב | תפריט | מצב |
|---|------|-------|--------|-----|
| D36 | ביצועים | /executions.html | נתונים → ביצועים | 📋 מתוכנן |

**P02 — ייבוא נתונים** *(D37 — requires D36 sealed)*

| # | עמוד | נתיב | תפריט | מצב | תלות |
|---|------|-------|--------|-----|------|
| D37 | ייבוא נתונים | /data_import.html | הגדרות → ייבוא נתונים | 📋 מתוכנן | D36 sealed ✓ |

**P-ADMIN — Admin Review S004**
Review D22: any execution-related ticker admin features needed?
Review D40: any import/execution system config needed?
Review D41: any new component patterns from execution/import UI?

---

### S005 — מתוכנן

**P01 — ישויות טרייד** ⚠️ **דיון ארכיטקטוני מעמיק נדרש לפני GATE_0**

| # | עמוד | נתיב | תפריט | מצב |
|---|------|-------|--------|-----|
| D29 | ניהול טריידים | /trades.html | מעקב → ניהול טריידים | ⚠️ ARCH SESSION REQUIRED |
| D24 | תוכניות טריידים | /trade_plans.html | תכנון → תוכניות טריידים | ⚠️ ARCH SESSION REQUIRED |

*GATE_0 for this program MUST NOT open until Chief Architect (Nimrod) + Team 00 deep-dive session
on entity structure is complete and decisions are locked. New entity structure thinking is pending.*

**P02 — אינטיליגנציית שוק** *(D27 + D25 — both market data, not user data)*

| # | עמוד | נתיב | תפריט | מצב |
|---|------|-------|--------|-----|
| D27 | דשבורד טיקר | /ticker_dashboard.html | מעקב → דשבורד טיקר | 📋 מתוכנן |
| D25 | אנליזת AI | /ai_analysis.html | תכנון → אנליזת AI | 📋 מתוכנן |

**P03 — יומן והיסטוריה** *(D28 + D31 — joint development, cross-stage)*

| # | עמוד | נתיב | תפריט | מצב | תלות |
|---|------|-------|--------|-----|------|
| D28 | יומן מסחר | /trading_journal.html | מעקב → יומן מסחר | 📋 מתוכנן | D29+D38 sealed ✓ |
| D31 | היסטוריית טרייד | /trades_history.html | מחקר → היסטוריית טרייד | 📋 מתוכנן | D29 sealed ✓ |

*D31 moved from canonical S006 to S005-P03 by architectural decision. Designed and built jointly
with D28 as a unified journaling+history system.*

**P-ADMIN — Admin Review S005**
Review D22: trade-related ticker management features?
Review D40: trade entity config, journal settings?
Review D41: complex entity UI patterns, journal editor components?

---

### S006 — מתוכנן

**P01 — מצב פורטפוליו** ⭐ **עדיפות גבוהה — לבצע ברגע שהנתונים מוכנים**

| # | עמוד | נתיב | תפריט | מצב | תלות |
|---|------|-------|--------|-----|------|
| D32 | מצב פורטפוליו | /portfolio-state.html | מחקר → מצב תיק | ⭐ עדיפות גבוהה | D36+D29+D31 sealed ✓ |

*This is the most complex and most important analytics page. GATE_0 opens immediately once
D36 (executions), D29 (trades), and D31 (trade history) are all sealed.
Requires deep prior study of the domain model before LOD200 is written.*

**P02 — ניתוח וסגירה**

| # | עמוד | נתיב | תפריט | מצב |
|---|------|-------|--------|-----|
| D30 | ניתוח אסטרטגיות | /strategy-analysis.html | מחקר → ניתוח אסטרטגיות | 📋 מתוכנן |
| — | השלמות כלל-מערכת | — | — | cleanup pass + known gaps |

**P03 — דשבורדים רמה 1**

| # | עמוד | נתיב | תפריט | מצב |
|---|------|-------|--------|-----|
| L1×5 | תכנון / מעקב / מחקר / נתונים / ניהול | level-1 routes | רמה 1 | 📋 מתוכנן |

**P-ADMIN — Admin Review S006** *(FINAL — COMPREHENSIVE)*
Full audit of all three admin branches in context of complete system.
Final integration check: D22 / D40 / D41 at system maturity.
Any remaining admin gaps closed before production readiness.

---

## 5) Complete Page Count

| שלב | עמודים חדשים לבניה | הערה |
|-----|-------------------|------|
| S001 | 10 | ✅ הושלמו |
| S002 | 0 חדשים (D22 ממומש) | P003 = alignment + FAV |
| S003 | 4 חדשים (D39, D40, D38, D26) + 1 FAV (D33) | D40 נכנס לסקופ |
| S004 | 2 (D36, D37) | |
| S005 | 6 (D29, D24, D27, D25, D28, D31) | D31 מS006 |
| S006 | 3 (D32, D30) + L1×5 dashboards | |
| **סה"כ** | **~22 עמודים לבניה + 5 דשבורדים** | + 6 P-ADMIN cycles |

---

## 6) Binding Rules

1. MUST NOT open GATE_0 for any program without this document being the current roadmap authority.
2. MUST NOT start D26 before D33 FAV is sealed.
3. MUST NOT start D37 before D36 is sealed.
4. MUST NOT open GATE_0 for S005-P01 before Nimrod+Team00 architectural deep-dive session.
5. MUST run P-ADMIN at the end of every stage before next stage GATE_0 opens.
6. MUST activate D32 GATE_0 as soon as D36+D29+D31 are sealed — do not wait for D30.
7. D31 is developed in S005-P03 (not S006). SSOT stage column update required (Team 170).
8. D40 is formally in scope as S003-P01. SSOT + Portfolio Roadmap update required (Team 170).

---

## 7) Deferred / Out of Scope

| Item | Status |
|------|--------|
| D23 (דשבורד נתונים) | ⏸️ DEFERRED — no stage assigned |
| D40 old status ("no stage") | SUPERSEDED — now S003-P01 per this directive |
| Gemini v2.5 roadmap descriptions | INVALID — superseded by this directive |
| api_keys, securities routes | OUT OF SCOPE per SSOT |

---

**log_entry | TEAM_00 | ARCHITECT_DIRECTIVE_TIKTRACK_ROADMAP_LOCKED | LOCKED | 2026-02-26**
