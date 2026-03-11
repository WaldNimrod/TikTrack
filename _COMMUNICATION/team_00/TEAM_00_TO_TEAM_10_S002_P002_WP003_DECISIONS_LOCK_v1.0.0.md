# Team 00 → Team 10 | WP003 GATE_7 — Decisions Locked + Document Review Request

**project_domain:** TIKTRACK
**id:** TEAM_00_TO_TEAM_10_S002_P002_WP003_DECISIONS_LOCK_v1.0.0
**from:** Team 00 (Chief Architect)
**to:** Team 10 (Execution Orchestrator)
**cc:** Teams 20, 30, 50, 60, 90
**date:** 2026-03-11
**work_package_id:** S002-P002-WP003
**gate:** GATE_7 — Decision Lock + Document Request

---

## 1. DECISIONS LOCKED — כל 3 ההחלטות מאושרות

### [A] ✅ LOCKED — GIN-003: תפריט פעולות — Hover-only

**החלטה:** Hover-only (אופציה A מאושרת).

**UX Precision Spec — ודאו שהצוות מיישם בדיוק:**

| פרמטר | ערך | הסבר |
|--------|-----|-------|
| Hover-in delay | **150ms** | מונע trigger בטעות בגלישה מהירה בטבלה |
| Exit delay | **100ms** | מונע flicker בעת מעבר מהשורה לפאנל |
| CSS gap שורה↔פאנל | **0px** (ללא margin-top) | zone hover רציפה — חייב להיות zero gap |
| Trigger element | כל ה-`<tr>` (כל רוחב השורה) | לא רק עמודת ה-actions |
| Keep-open zone | שורה OR פאנל | כל עוד עכבר על אחד מהם — פאנל נשאר פתוח |
| Close triggers | (1) exit מ-zone + 100ms; (2) Escape; (3) בחירת פעולה; (4) click מחוץ | כל 4 תרחישי סגירה חייבים לעבוד |
| Nested hover logic | `row.matches(':hover') \|\| panel.matches(':hover')` | הפאנל נסגר רק כאשר שניהם false |
| Z-index | 100+ | מעל כל שאר אלמנטי הטבלה |
| מיקום פאנל | `position: absolute; top: 100%; right: 0;` | צמוד לצד ימין של השורה, מתחתיה |
| RTL consideration | הפאנל נפתח לכיוון **שמאל** אם השורה קרובה לקצה ימין | בדיקת overflow + flip אם נחוץ |

**בדיקת UX קריטית:**
- [ ] מעבר מהיר בין שורות: פאנל לא מהבהב
- [ ] פאנל נשאר פתוח בעת מעבר עכבר מהשורה לפאנל
- [ ] לחיצה על פעולה בפאנל: פאנל נסגר + פעולה מתבצעת
- [ ] Escape סוגר פאנל ומחזיר focus לשורה

---

### [B] ✅ LOCKED — GIN-004: היסטוריית ריצות — Inline Expand

**החלטה:** Inline expand (אופציה A מאושרת).

**Spec:**
- כפתור `▼ היסטוריה (N)` ← N = מספר ריצות ב-24h (מ-`GET /admin/background-jobs/{job}`)
- לחיצה: שורות inline נפתחות מתחת לשורת ה-job (5 ריצות אחרונות)
- לחיצה שנייה: קריסה
- עמודות ב-inline history: תאריך/שעה | סטטוס | משך (ms) | רשומות | שגיאות

---

### [B] 🔵 ANALYSIS — שאלת ה-Log Viewer

**שאלת נמרוד:** *"איפה נשמר המידע על ההיסטוריה? האם יש לנו קובץ לוג שאפשר להוסיף ממשק גנרי שמציג אותו?"*

**תשובת Team 00 — ניתוח מערכת Phoenix (V2):**

**מה קיים כיום:**

| רכיב | סוג אחסון | קיים? |
|-------|-----------|-------|
| Job run history | `admin_data.job_run_log` (PostgreSQL) | ✅ כן — API קיים |
| Application logs (errors/warnings) | stdout/stderr → uvicorn → **ללא קובץ** | ❌ לא — רק בזיכרון |
| Market data sync logs | Python logger → stdout | ❌ אין קובץ בפרויקט Phoenix |
| Legacy V1 | קבצי app.log/errors.log/database.log בתיקיית `Backend/logs/` | ✅ אך ב-V1 בלבד |

**ממצא:** ב-Phoenix V2 אין log files — כל logging עובר ל-stdout (נכון לarכיטקטורת Docker/uvicorn). קיימת רק היסטוריית ריצות ב-DB.

**הערכת הפיצ'ר — Generic Log Viewer:**

| היבט | הערכה |
|-------|--------|
| ערך למנהל מערכת | **גבוה** — ממשק ידידותי ללוגים = שקיפות תפעולית מלאה |
| מורכבות ב-WP003 | **גבוהה** — דורש: (1) הוספת file logging לFastAPI, (2) API חדש לקריאת לוגים, (3) UI viewer |
| היכן שייך | **D40 System Management — S003-P003** (Section 6 הנוכחי — "היסטוריית פעולות מערכת") |
| גישה מומלצת | **שלב א':** Job run history (DB) = WP003 (כפי שתוכנן). **שלב ב':** Generic log viewer = D40 בS003 |

**המלצת Team 00 — החלטה ל-Nimrod:**

> **לא לשלב ב-WP003.** הפיצ'ר מתאים ל-D40 (System Management, S003-P003) שם Section 6 "היסטוריית פעולות" נמצאת כבר בscope. ב-D40 נגדיר: (a) הפעלת file logging מובנה ב-FastAPI, (b) API endpoint `GET /admin/logs?type=app|market|alerts`, (c) UI log viewer עם פילטרים.

**לעת עתה ב-WP003:** הinline history מ-`admin_data.job_run_log` הוא הפתרון הנכון והמלא.

*[Nimrod: אם אתה מאשר להוסיף זאת ל-D40 scope — Team 170 יעדכן את ה-LOD200 של D40 בהתאם. אין צורך בפעולה עכשיו.]*

---

### [C] ✅ LOCKED — GIN-005: Heat Indicator

**החלטה:** אופציה A בשתיהן.

| פרמטר | ערך |
|--------|-----|
| נוסחה | `load_pct = (active_tickers / max_active_tickers) × 100` |
| ירוק | 0–49% |
| צהוב | 50–79% |
| אדום | ≥80% |

---

## 2. Gate Status — PRE_DEVELOPMENT_GATE פתוח

כל 3 ההחלטות נעולות. כל 4 תנאי ה-gate-opening מתקיימים:

| # | תנאי | סטטוס |
|---|------|--------|
| 1 | NIMROD_DECISION_A (hover-only) | ✅ LOCKED |
| 2 | NIMROD_DECISION_B (inline expand) | ✅ LOCKED |
| 3 | NIMROD_DECISION_C (heat formula + thresholds) | ✅ LOCKED |
| 4 | Team 60: אישור ticker_prices לא ריק | ⏳ נדרש מ-Team 60 |

**[Team 60 — urgent]:** יש לאשר שsync jobs רצו בסביבה ו-`market_data.ticker_prices` מאוכלסת. אם לא — יש להריץ `sync_ticker_prices_eod.py` ידנית לפני תחילת QA.

---

## 3. Document Review Request — ממצאי צוות 10

**לצוות 10:**

לאחר קבלת ה-GIN responses (v1.0.0 שנשלח) ועדכון ההחלטות — ייתכן שיצרתם או עדכנתם מסמכים.

**נדרש מצוות 10 — בתוך 24 שעות:**

שלחו לתיבת ה-inbox של Team 00 (`_COMMUNICATION/_ARCHITECT_INBOX/`) את כל המסמכים הבאים שיצרתם:

| מסמך | תיאור |
|------|--------|
| LOD400 / spec מעודכן לGIN answers | כל שינוי ב-spec שנגזר מה-GIN responses |
| Implementation plan / תוכנית ביצוע | כיצד מחלקים עבודה בין Teams 20, 30, 50 |
| כל מסמך שנוצר בתגובה ל-GINs | כולל מסמכי קואורדינציה בין-צוותית |

**פורמט הגשה:**
```
_COMMUNICATION/_ARCHITECT_INBOX/
  └── TEAM_10_TO_TEAM_00_WP003_GATE7_IMPLEMENTATION_DOCS_v1.0.0.md
```

**Team 00 יעביר review ואישור תוך 24 שעות מקבלת המסמכים.**

---

## 4. Priority Order — סדר ביצוע מומלץ

לאחר קבלת ה-gate opening condition מ-Team 60:

| סדר | פעולה | צוות | עדיפות |
|-----|-------|------|---------|
| 1 | TASE agorot fix (yahoo/alpha provider) | Team 20 | P0 |
| 2 | Run EOD sync, verify ticker_prices populated | Team 60 | P0 |
| 3 | Traffic light tooltip update (null → "אין נתונים") | Team 30 | P0 |
| 4 | Summary filter-aware display fix | Team 30 | P0 |
| 5 | Actions menu hover zone (Decision A spec) | Team 30 | P1 |
| 6 | Settings: add 2 missing fields + fix 2 defaults | Team 30 | P1 |
| 7 | Background jobs: toggle + inline history + heat card | Team 30 | P1/P2 |
| 8 | Modal skeleton loading | Team 30 | P1 |
| 9 | Runtime E2E assertions (Phase 2) | Team 50 | P1 |
| 10 | Status legend after ticker table | Team 30 | P2 |
| 11 | Refresh buttons | Team 30 | P2 |

---

**log_entry | TEAM_00 | WP003_DECISIONS_LOCK | ALL_3_LOCKED + DOC_REQUEST | TO_TEAM_10 | 2026-03-11**
