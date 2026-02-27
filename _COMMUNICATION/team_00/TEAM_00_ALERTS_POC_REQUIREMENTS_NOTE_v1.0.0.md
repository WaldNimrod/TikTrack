---
id: TEAM_00_ALERTS_POC_REQUIREMENTS_NOTE
from: Team 00 (Chief Architect — Nimrod)
to: Team 100 (Agents_OS Domain Architect)
cc: Team 10 (Gateway)
program: S001-P002
gate: PRE-GATE_0 (LOD200 authoring brief)
sv: 1.0.0
effective_date: 2026-02-27
project_domain: AGENTS_OS / TIKTRACK
---

# TEAM_00_ALERTS_POC_REQUIREMENTS_NOTE
## S001-P002 — Active Alerts Widget on D15.I (Home Dashboard)

---

## Mandatory Identity Header

| Field | Value |
|-------|-------|
| roadmap_id | TIKTRACK_ROADMAP_LOCKED (sv 1.0.0, 2026-02-26) |
| stage_id | S001 |
| program_id | S001-P002 |
| work_package_id | N/A (pre-GATE_0, LOD200 authoring brief) |
| task_id | N/A |
| gate_id | PRE-GATE_0 |
| phase_owner | Team 100 (Agents_OS Domain Architect) |
| required_ssm_version | 1.0.0 |
| required_active_stage | S001 (AGENTS_OS domain — parallel to TIKTRACK S002/S003) |
| project_domain | AGENTS_OS / TIKTRACK |

---

## 1) מטרת מסמך זה

מסמך זה מסכם את **דרישות Team 00** כתנאי מוקדם לפתיחת LOD200 של S001-P002.

מוגש בהתאם ל-§7 של `_COMMUNICATION/_Architects_Decisions/TEAM_00_AGENTS_OS_CONTINUATION_STRATEGIC_DECISIONS_v1.0.0.md`:

> "לפני שTeam 100 מתחיל בכתיבת LOD200 של S001-P002 — Team 00 חייב להוציא TEAM_00_ALERTS_POC_REQUIREMENTS_NOTE_v1.0.0.md."

כל ההחלטות האסטרטגיות (A-1 עד B-3) **נעולות**. מסמך זה מספק את הקשר הפיצ'ר שTeam 100 צריך כדי לנסח את ה-LOD200.

---

## 2) סקופ הפיצ'ר — מה S001-P002 כן ומה לא

### ✅ מה זה כן

**ווידג'ט "התראות פעילות" ב-D15.I** (דשבורד הבית, route: `home`):
- הצגת סיכום ספירת התראות פעילות (summary counts)
- הצגת 5 ההתראות האחרונות בסטטוס NEW עם סמל הטיקר והודעה
- קישור ל-D34 (alerts.html) לניהול מלא
- קישור לכל הנתונים ב-Real TikTrack APIs (ללא mock data)

**מטרת ה-POC:** להריץ פיצ'ר TikTrack אמיתי דרך ה-Agents_OS pipeline המלא (GATE_0 → GATE_8) כהדגמה ראשונה של הדומיין.

### ❌ מה זה לא

| מה שנשמר מחוץ לסקופ | סיבה |
|---------------------|------|
| בנייה מחדש של D34 | D34 (alerts.html) כבר ממומש במלואו — Gate-A PASS |
| יצירת/עריכת התראות מהבית | זה נשאר ב-D34 בלבד |
| עמוד חדש | זה ווידג'ט בתוך D15.I — לא עמוד עצמאי |
| שינוי backend | שני ה-APIs הנדרשים כבר פעילים — אין צורך בבניית backend |

---

## 3) ארטיפקטי Spec קיימים

### [1] Working Draft — המסמך הראשי לפיצ'ר

```
_COMMUNICATION/team_100/DEV_OS_TARGET_MODEL_CANONICAL_v1.3.1/
  ALERTS_HOME_WIDGET_SPEC_v1.0/
    ALERTS_HOME_WIDGET_SPEC_v1.0_WORKING_DRAFT.md
```

**תוכן:** חוזה API מלא, DOM anchors קנוניים, מצבי UI (loading/empty/error/data/mutating), קריטריוני קבלה. **קרא זאת ראשון.**

### [2] D34 — ישום קיים (Reference)

```
ui/src/views/data/alerts/
  alertsTableInit.js
  alertsDataLoader.js
  alert.content.html
```

מודל נתונים reference — D34 משתמש באותם APIs שהווידג'ט ישתמש בהם.

### [3] החלטות אסטרטגיות — ההקשר המלא

```
_COMMUNICATION/_Architects_Decisions/
  TEAM_00_AGENTS_OS_CONTINUATION_STRATEGIC_DECISIONS_v1.0.0.md
```

§1–§6: רקע מלא | §7: מנדט המסמך הזה.

---

## 4) מספר D צפוי

| שדה | ערך |
|-----|-----|
| D-Number | **D15.I** |
| שם | דשבורד בית |
| Route | `home` |
| תפריט | בית (רמה 1) |
| מקור | `documentation/docs-system/01-ARCHITECTURE/TT2_PAGES_SSOT_MASTER_LIST.md` §2.1 |
| SSOT Status | "קיים"; "דשבורד — לא נדרש Blueprint" |

**הערה קריטית ל-LOD200:** המטרה היא **ווידג'ט בתוך D15.I** — לא spec של עמוד חדש. ה-LOD200 צריך להגדיר את רכיב הווידג'ט, מצבי UI שלו, וה-integration עם ה-APIs הקיימים. לא להגדיר מבנה עמוד חדש.

---

## 5) חוזה API (מהWorking Draft — לעיון Team 100)

```
GET  /api/alerts/summary             → {active_count, new_today, ...}
GET  /api/alerts?status=NEW&limit=5  → [{id, ticker_symbol, message, created_at, ...}]
POST /api/dev/alerts/bump-new        → DEV/TEST בלבד (דורש feature flag)
```

**שניהם GET endpoints פעילים ועובדים כבר.** D34 משתמש בהם. אין work backend חדש הנדרש ל-POC זה.

---

## 6) אילוצי ישום ידועים

| אילוץ | פרטים |
|-------|--------|
| **maskedLog** | חובה לכל logging ב-JS — Iron Rule ללא יוצא מן הכלל |
| **LEGO/UAI Pattern** | D15.I משתמש ב-UAI pattern — הווידג'ט חייב להשתלב כ-UAI component |
| **DOM Anchors קנוניים** | מוגדרים ב-Working Draft: `data-section="active-alerts-widget"`, `data-role="alerts-summary"`, `data-role="alerts-list"`, `data-alert-id`, `.js-alert-row`, `.js-active-alerts-refresh`, `.js-active-alerts-bump-new` — אין לשנות |
| **DEV Endpoint אבטחה** | `POST /api/dev/alerts/bump-new` דורש `FEATURE_DEBUG_ALERTS_BUMP=true` ב-env; אסור להיות ניתן להפעלה ב-production |
| **אין APIs חדשים** | שני ה-GET endpoints קיימים — backend work = אפס עבור POC זה |
| **D15.I = Dashboard Page** | SSOT: לא נדרש Blueprint; ה-LOD200 מסתכם בסקופ ווידג'ט בלבד |

---

## 7) הקשר חזון מוצר

- **D15.I הוא ה-First View של המשתמש** בכניסה למערכת — התראות פעילות צריכות להופיע מיידית מבלי לנווט ל-D34
- הווידג'ט הוא **read-only summary → action point**: קריאת מצב + קישור ל-D34 לניהול מלא
- **POC זה הוא הריצה הראשונה** של ה-Agents_OS pipeline מקצה לקצה — Team 100 מחזיקה ב-LOD200 דרך GATE_8 עבור דומיין זה
- כישלון הPOC לא פוגע ב-TikTrack core (D34 ממשיך לעבוד ללא תלות בווידג'ט)

---

## 8) פעולות הבאות לTeam 100

| # | פעולה | הפניה |
|---|-------|-------|
| 1 | קרא Working Draft (§3.1 למעלה) כחוזה הפיצ'ר המפורט | `ALERTS_HOME_WIDGET_SPEC_v1.0_WORKING_DRAFT.md` |
| 2 | כתוב LOD200 ל-S001-P002 (נושא: ווידג'ט Active Alerts ב-D15.I) | Team 100 authority |
| 3 | הגש לTeam 190 לאימות GATE_0 (Agents_OS domain path) | Gate Model v2.3.0 |
| 4 | ביצוע מקביל ל-TikTrack S002-P003 implementation | per decision B-3 |

**אין המתנה ל-S002-P003 COMPLETE** — parallel execution מאושר (B-3).

---

## 9) תנאי שחרור

Team 100 **רשאי לפתוח S001-P002 LOD200 authoring** מיד עם קבלת מסמך זה.

תנאי ההפעלה הנותרים (מ-§7 של Strategic Decisions):
- ✅ TEAM_00_ALERTS_POC_REQUIREMENTS_NOTE מונפק — **מסמך זה**
- ✅ A-1 → B-3 decisions נעולות — `TEAM_00_AGENTS_OS_CONTINUATION_STRATEGIC_DECISIONS_v1.0.0.md`

---

**log_entry | TEAM_00 | ALERTS_POC_REQUIREMENTS_NOTE | S001-P002 | ISSUED | 2026-02-27**
