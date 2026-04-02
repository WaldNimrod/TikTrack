---
id: DM-004
historical_record: true
dm_type: DIRECT_MANDATE
from: Team 100 (authorized by Team 00)
to: Team 61 (AOS UI — Cursor Composer)
authority: Team 00 constitutional authority
classification: IRON_RULE
pipeline_impact: NONE
conflict_check: CLEAR — no active WP touches roadmap sidebar or dashboard header
scope_boundary: UI read-only display only; no state writes; no pipeline_state modifications
wsm_update_required: false
return_path: Team 100 architectural review → DM-004 CLOSED
status: ACTIVE
date: 2026-03-23
registry_ref: _COMMUNICATION/_Architects_Decisions/DIRECT_MANDATE_REGISTRY_v1.0.0.md---

# Direct Mandate DM-004 — UI Integration: DMP Registry
## מנדט ל-Team 61: הוספת ייצוג Direct Mandates לדשבורד ולמפת הדרכים

---

## §1 — הקשר

ה-Direct Mandate Protocol (DMP) הוא הנוהל הקנוני לעבודה bounded מחוץ לפייפליין.
ה-Registry שלו (`DIRECT_MANDATE_REGISTRY_v1.0.0.md`) הוא ה-SSOT.
כרגע — אין ייצוג ויזואלי של DMs בכלי הניהול.

**מנדט זה מוסיף שני רכיבים:**
1. **Panel בעמוד מפת הדרכים** — רשימה מלאה של DMs
2. **Badge בדשבורד** — אינדיקטור של DMs פעילים

---

## §2 — Deliverable A: Roadmap Sidebar Panel

### §2.1 — מיקום

ב-`PIPELINE_ROADMAP.html` / `pipeline-roadmap.js`:
- **sidebar** (העמודה הימנית, 300px)
- **מיקום:** לאחר "canonical files" section — סוף ה-sidebar
- **סגנון:** accordion panel קיים (toggleAccordion pattern) — **אל תמציא pattern חדש**

### §2.2 — מבנה ה-Panel

```
┌─────────────────────────────────────┐
│ 📋 Direct Mandates          [▼]     │
├─────────────────────────────────────┤
│  [Active (N)]   [Closed (N)]        │
│  ─────────────────────────────────  │
│  DM-004  Team 61  UI Integration  • │
│  DM-003  Team 101 Canary Sim      • │
│  (empty state: "No active mandates")│
└─────────────────────────────────────┘
```

**Active tab (ברירת מחדל):** status = ACTIVE  
**Closed tab:** status = CLOSED  
**כל שורה:** `DM-ID | to | scope (truncated 40 chars) | status pill`

### §2.3 — Data Source

```javascript
// fetch + parse from filesystem (same pattern as canonical files)
const DM_REGISTRY_PATH =
  '_COMMUNICATION/_Architects_Decisions/DIRECT_MANDATE_REGISTRY_v1.0.0.md';

// use existing extractTable(mdText, 'DM-ID') from pipeline-roadmap.js
// extract BOTH §3 Active table AND §4 Closed table
// merge into one array; field: status determines tab placement
```

**שמות עמודות בטבלה (exact):** `DM-ID`, `from`, `to`, `scope`, `status`, `pipeline_impact`, `doc_ref`, `created`

### §2.4 — Status Pill Colors

| status | צבע CSS class |
|---|---|
| ACTIVE | `pill-active` (כחול — קיים בפרויקט) |
| PENDING_REVIEW | `pill-warn` (כתום) |
| CLOSED | `pill-inactive` (אפור) |
| DRAFT | `pill-warn` (כתום מעומעם) |

### §2.5 — Error States

| מצב | תצוגה |
|---|---|
| Registry file לא נמצא | "DM Registry not available" (muted text) |
| No active DMs | "No active mandates" (empty state) |
| Parse error | "Registry parse error — see console" |

---

## §3 — Deliverable B: Dashboard Header Badge

### §3.1 — מיקום

ב-`PIPELINE_DASHBOARD.html` / `pipeline-dashboard.js`:
- **header row** (כותרת הדשבורד) — לידי ה-Last Updated indicator שנוסף ב-FIX-101-06
- **לא** ב-sidebar; **לא** ב-gate area

### §3.2 — לוגיקה

```javascript
// Count active DMs from registry
const activeDmCount = dmRows.filter(r => r.status === 'ACTIVE').length;

// Render:
// activeDmCount > 0  → <span class="dm-badge dm-badge--active">DM ●{N}</span>
// activeDmCount === 0 → <span class="dm-badge dm-badge--clear">DM ○</span>
```

### §3.3 — Interaction

- **לחיצה על badge** → `window.location.href = 'PIPELINE_ROADMAP.html#dm-panel'`
- ה-Roadmap page יפתח את ה-DM panel אוטומטית (auto-open accordion) אם fragment = `#dm-panel`
- אין modal; אין popup — ניווט ישיר

### §3.4 — CSS (הוסף ל-pipeline-dashboard.css ו-pipeline-roadmap.css)

```css
/* DM Badge — Dashboard */
.dm-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  transition: opacity 0.15s;
}
.dm-badge:hover { opacity: 0.8; }
.dm-badge--active {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
  border: 1px solid rgba(245, 158, 11, 0.3);
}
.dm-badge--clear {
  background: rgba(148, 163, 184, 0.1);
  color: #94a3b8;
  border: 1px solid rgba(148, 163, 184, 0.2);
  cursor: default;
}
```

---

## §4 — Refresh Logic

- **Roadmap panel:** refresh בכל `loadAll()` call (הנוכחי — כל 60 שניות)
- **Dashboard badge:** refresh בכל `refreshDashboard()` call הקיים
- **אין** dedicated polling — תלוי ב-refresh הקיים
- Registry file הוא static MD — לא משתנה תכופות

---

## §5 — Acceptance Criteria

| # | AC | PASS condition |
|---|---|---|
| AC-01 | Roadmap panel מציג DMs | Panel מופיע ב-sidebar; Active tab = DM-003 + DM-004; Closed tab = DM-001 + DM-002 |
| AC-02 | Tab switching | לחיצה על "Closed" מציג DM-001/002; לחיצה על "Active" חוזר |
| AC-03 | Empty state | כשאין DMs ב-tab: "No active mandates" / "No closed mandates" |
| AC-04 | Dashboard badge Active | כשיש DM בסטטוס ACTIVE: badge כתום עם ספירה נכונה |
| AC-05 | Dashboard badge Clear | כשאין DMs ב-ACTIVE: badge אפור `DM ○` |
| AC-06 | Badge click navigates | לחיצה → PIPELINE_ROADMAP.html#dm-panel; panel פתוח |
| AC-07 | Read-only | אין כפתורי עריכה, אין שינויי state, אין כתיבה לקבצים |
| AC-08 | Error handling | registry חסר → "DM Registry not available"; אין crash |
| AC-09 | Existing tests עוברים | 0 regressions ב-pytest ו-Selenium suite הקיים |

---

## §6 — Implementation Notes

**⚠ כלל קיים: אל תשנה extractTable() ב-pipeline-roadmap.js**
הפונקציה קיימת; קרא אותה בלבד. אל תשכתב או "תשפר" אותה.

**⚠ כלל קיים: Classic `<script src>` בלבד — ללא ES modules**
(מוגדר ב-`ARCHITECT_DIRECTIVE_ORG_AND_PIPELINE_ARCHITECTURE_v1.0.0.md` §5)

**⚠ הפרדת קבצים:** CSS לפי הקובץ הרלוונטי:
- `pipeline-roadmap.css` ← panel styles
- `pipeline-dashboard.css` ← badge styles

**⚠ שמות IDs ב-HTML:**
- Panel accordion ID: `dm-registry-panel`
- Badge element ID: `dm-active-badge`
- Active tab content: `dm-tab-active`
- Closed tab content: `dm-tab-closed`

---

## §7 — Deliverables Required

1. `agents_os/ui/js/pipeline-roadmap.js` — DM panel function + loadAll integration
2. `agents_os/ui/js/pipeline-dashboard.js` — badge render + refresh integration
3. `agents_os/ui/css/pipeline-roadmap.css` — panel styles
4. `agents_os/ui/css/pipeline-dashboard.css` — badge styles
5. `agents_os/ui/PIPELINE_ROADMAP.html` — DM panel HTML anchor (if needed)
6. `agents_os/ui/PIPELINE_DASHBOARD.html` — badge anchor (if needed)
7. Completion report → `_COMMUNICATION/team_61/TEAM_61_DM_004_COMPLETION_REPORT_v1.0.0.md`

---

## §8 — Return Path

תוצר → Team 61 submits completion report → Team 100 reviews (AC-01..09) → DM-004 CLOSED (bridge: ABSORB)

---

**log_entry | DM-004 | TEAM_100 | DMP_UI_INTEGRATION_MANDATE_ISSUED | TEAM_61_ACTIVATED | 2026-03-23**
