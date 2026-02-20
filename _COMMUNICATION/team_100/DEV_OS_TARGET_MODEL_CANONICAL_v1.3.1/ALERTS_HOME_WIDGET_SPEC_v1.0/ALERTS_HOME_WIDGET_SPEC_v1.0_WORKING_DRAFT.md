---
id: SPEC-ALERTS-HOME-WIDGET-001
owner: Team 100 (Spec Engineering) + Nimrod
status: WORKING_DRAFT
decision_type: SPEC
context: Alerts / Home Active Alerts Widget API Binding + Debug Trigger
sv: PHOENIX_V2.121
effective_date: 2026-02-19
last_updated: 2026-02-19
related:
  - _COMMUNICATION/team_170/ALERTS_ENTITY_KNOWLEDGE_BASELINE_v1.0.md
  - docs-governance/00-FOUNDATIONS/ADR_TEMPLATE_CANONICAL.md
---

# Alerts Home Widget — Spec v1.0 (Working Draft)

## 1) Objective
לחבר את ווידג'ט **"התראות פעילות"** בדף הבית לנתונים אמיתיים מה־API, ולספק פונקציונליות מלאה ברמת הווידג'ט (מצבים, רענון, פעולות בסיסיות), כולל **מנגנון בדיקה דטרמיניסטי** ל־DEV/TEST: כפתור שמקפיץ N התראות לסטטוס **NEW** כדי לאפשר בדיקות חוזרות גם ללא נתוני שוק.

> הערה: עמוד ההתראות והישות כבר קיימים ועובדים, כולל ממשקי CRUD מלאים. הסקופ כאן הוא הווידג'ט בלבד.

## 2) Scope
### In scope
- Binding מלא של הווידג'ט ל־Alerts API:
  - Summary (מונה/סיכום)
  - List (רשימת NEW, limit קטן)
- UI states מלאים: loading / empty / error / data / mutating
- פעולות בווידג'ט:
  - Refresh
  - Navigate to Alerts page (View all)
  - Mark-as-read (אם קיים ב־API; אם לא — יוגדר כ-gap)
- Debug/Test Trigger (DEV/TEST בלבד):
  - כפתור: "Bump NEW"
  - פעולה: מקפיץ N התראות ל־NEW + refetch

### Out of scope
- יצירה/עריכה של התראות מהדף הבית (קיים בעמוד Alerts)
- תלות/אינטגרציה לנתוני שוק לצורך שינוי סטטוס

## 3) API Contract
> שמות ה-endpoints ושדות התגובה יינעלו בגרסה v1.0.1 לאחר הצלבה מול baseline של Team 170 (אין ניחושים).

### Required endpoints (logical)
- GET `/api/alerts/summary`
  - Purpose: counters per status (כולל NEW)
- GET `/api/alerts?status=NEW&limit=5&sort=created_at_desc`
  - Purpose: rows shown in widget
- PATCH `/api/alerts/{id}` **or** POST `/api/alerts/{id}/mark-read`
  - Purpose: mark-as-read

### DEV ONLY endpoint (Option A — APPROVED)
- POST `/api/dev/alerts/bump-new`
  - Request: `{ "count": 3 }` (default count=3; allowed range 1..20)
  - Effect (preferred): לבחור alerts קיימות ולהעביר ל-NEW (לא לייצר חדשות), כדי להימנע מזיהום DB
  - Response: `{
      "requested": 3,
      "updated": 3,
      "alert_ids": ["..."],
      "new_count_after": 7
    }`

#### Security / availability (MUST)
- endpoint debug זמין רק כאשר:
  - `ENV in {"dev","test"}` **AND**
  - `FEATURE_DEBUG_ALERTS_BUMP=true`
- אחרת: 404 (מועדף) או 403 — להחלטת backend (אבל אחיד בכל השירות)

#### UI exposure (MUST)
- כפתור "Bump NEW" מוצג רק אם flag פעיל (נבדק בצד לקוח/שרת בהתאם למימוש קיים).

## 4) UI Structural Contract (DOM/CSS)
### DOM anchors (MUST)
- Root container: `data-section="active-alerts-widget"`
- Summary container: `data-role="alerts-summary"`
- List container: `data-role="alerts-list"`
- Row element: `data-alert-id="<id>"` + class `.js-alert-row`
- State markers:
  - loading: `data-state="loading"`
  - empty: `data-state="empty"`
  - error: `data-state="error"`
  - data: `data-state="data"`
  - mutating: `data-state="mutating"`

### JS-safe selectors (MUST NOT BREAK)
- `.js-active-alerts-refresh`
- `.js-active-alerts-bump-new`
- `.js-alert-row`
- `.js-mark-as-read` (אם מופיע ב-widget)

### CSS/LEGO rule
כל LEGO classes קיימים נשמרים; מוסיפים *רק* hooks נדרשים (data-*, js-*), ללא שינוי לאחור.

## 5) state_definitions (REQUIRED)
הווידג'ט חייב לתמוך במצבים הבאים:

1. **loading**
   - מוצג skeleton/placeholder במאונט ראשוני וברענון
2. **empty**
   - אין התראות NEW להצגה
3. **error**
   - שגיאת API (summary או list) עם CTA "Retry"
4. **data**
   - רשימת התראות תקינה + סיכום
5. **mutating**
   - פעולה רצה (mark-as-read / bump-new)
   - כפתורים disabled + spinner קטן

> Optional (אם summary/list נפרדים): **partial_error** (ננעל רק אם נדרש ביישום בפועל)

## 6) Functional behavior
### On mount
- Fetch summary + list (parallel allowed)
- Set UI state based on results

### Refresh
- Clicking refresh triggers refetch of summary + list

### Mark-as-read (if supported)
- Clicking row action triggers API mutation
- After success:
  - remove row from widget OR refetch list
  - update summary OR refetch summary

### Navigate
- “View all” navigates to Alerts page

### Debug: Bump NEW (DEV/TEST only)
- Clicking bump triggers POST `/api/dev/alerts/bump-new`
- After success: refetch summary + list

## 7) Acceptance Criteria (MUST)
1. Home widget displays real data from API (summary + list).
2. All UI states reproducible:
   - Loading (initial load + refresh)
   - Empty (0 NEW)
   - Error (simulate failure)
   - Data (>=1 NEW)
3. Refresh works.
4. Debug bump works (dev/test + flag):
   - increases NEW count deterministically
   - allows repeated test cycles
5. Mark-as-read works (if endpoint exists); otherwise documented as explicit gap.
6. DOM contract holds:
   - all anchors/selectors exist
   - validation uses DOM/CSS structural inspection (NO screenshots)

## 8) QA / Test Plan (high level)
- Unit: widget state machine transitions
- Integration: API fetch + render
- E2E (preferred): Selenium/Playwright
  - Validate DOM anchors exist
  - Validate state transitions and mutation outcomes

## 9) Required Orchestration Artifacts (for Engine-ready package)
- `EXEC_SUMMARY.md` (¼–½ page)
- `TECHNICAL_CHANGE_REPORT.md` (≤2 pages)
- `MATERIALIZATION_EVIDENCE.json` (see taxonomy)
- `STATE_SNAPSHOT.json` (optional for debugging)

## 10) Open items to lock for v1.0.1 (No guessing)
- Exact endpoint paths and response schemas from baseline
- Exact mark-as-read endpoint + payload
- Exact existing LEGO classes/markup constraints for widget

**log_entry | TEAM_100 | ALERTS_HOME_WIDGET_SPEC_v1.0 | WORKING_DRAFT_CREATED | 2026-02-19**
