# ייחוס: שלבים — עמודים ומודולים (TikTrack)

**project_domain:** TIKTRACK  
**id:** STAGES_PAGES_AND_MODULES_REFERENCE  
**version:** 1.1.0  
**date:** 2026-02-23  
**מטרה:** רשימת עמודים אחידה, הגדרת מודולים (שרת + לקוח) ותלויות, השכבות במערכת, וחלוקה מסודרת של מודולים ועמודים לשלבים.

---

## 1. רשימת עמודים מלאה — אחידות

**כן — הרשימה אחידה.** מקור האמת היחיד לרשימת העמודים המלאה הוא:

- **`documentation/docs-system/01-ARCHITECTURE/TT2_PAGES_SSOT_MASTER_LIST.md`** (SSOT - MANDATORY).

**יישור במסמכים:**

- **TEAM_31_WORKFLOW_PROCESS_V2** — הועבר לארכיון; מטריצת Blueprint הייתה ממוספרת לפי סדר עבודה; שמות העמודים תואמים ל־SSOT.

**כלל:** עדכון רשימת עמודים מתבצע ב־TT2_PAGES_SSOT_MASTER_LIST. חלוקת עמודים לשלבים — ב־PHOENIX_PORTFOLIO_ROADMAP (סעיף "חלוקת עמודים לשלבים"). אין מקור סותר. Page Tracker הועבר לארכיון.

---

## 2. הגדרת מודולים — שרת ולקוח, ותלויות

### 2.1 צד שרת (Backend)

**מסמך:** `documentation/docs-system/01-ARCHITECTURE/TT2_BACKEND_LEGO_SPEC.md`

- **שכבות:** Atoms (Core) → Molecules (Repositories) → Organisms (Modular Cubes).
- **תלות:** Organisms נשענים על Molecules; Molecules על Atoms. אין דילוג שכבות.

### 2.2 צד לקוח (Frontend — LEGO UI)

**מסמך:** `documentation/docs-system/01-ARCHITECTURE/TT2_SECTION_ARCHITECTURE_SPEC.md`

- **שכבות:** TtSection > TtSectionRow > TtSectionCol; קומפוננטות: `phoenix-components.css` (tt-container, tt-section, tt-section-row).
- **תלות:** סקשנים נבנים רק מקומפוננטות LEGO; ללא layout CSS מותאם; Logical Properties בלבד.

### 2.3 תלויות עמוד → מודולים (לגסי)

**מיקום:** `_COMMUNICATION/Legace_html_for_blueprint/Legace_DOM/…/dynamic-loader-config.js` — `PAGE_REQUIREMENTS`.

- לכל עמוד: רשימת מודולים (core-systems, data-basic, ui-basic, business-module וכו') ותיאור.
- **הבנת תלויות:** עמוד שתלוי ב־business-module תלוי גם ב־data-basic ו־ui-basic; core-systems משותף לכל העמודים.

---

## 3. השכבות במערכת — כפי שמיוצגות בשמות השלבים

| stage_id | שם שלב | שכבה לוגית (משמעות) |
|----------|--------|----------------------|
| S001 | שלב 1 — Foundations Sealed | חיתום יסודות — Auth, תשתית, פיננסי ליבה, Alerts/Notes, טיקרים בסיס. |
| S002 | שלב 2 | השלמת מה שפתוח משלב 1 + הכנה לשלב 3 (השלב הפעיל). |
| S003 | שלב 3 — Essential Data | שכבת נתונים יסודית — Preferences, Alerts & Notes, User Tickers & Tickers Mgr. |
| S004 | שלב 4 — Financial Execution | המעגל הפיננסי — Executions, Import Center (Cash Flows). |
| S005 | שלב 5 — Trades/Plans | ישויות מורכבות — Trade Plans, Trades, Watch Lists, דשבורד טיקר, יומן מסחר. |
| S006 | שלב 6 — Advanced Analytics | תובנות וניתוח — Strategy Analysis, Trades History, Portfolio State. |

**דשבורדים (כולל דף הבית):** כרגע קיים **עמוד placeholder** בלבד לכל דשבורד. **מימוש תוכן הדשבורדים** יבוצע **בשלבים מאוחרים** (לא בשלב 2).

---

## 4. חלוקה מסודרת: מודולים ועמודים לשלבים (סדר נכון)

### עקרונות

- **שלב 1 (S001):** רובו סגור. כל מה שלא סגור הועבר לשלב 2.
- **שלב 2 (S002):** **השלב הפעיל** מעכשיו. כולל: (א) כל מה שפתוח משלב 1, (ב) תוכניות נוספות שנדרש לממש לפני מעבר לשלב 3 והשלמת המודולים שישויכו אליו.
- **דשבורדים:** בית, תכנון, מעקב, מחקר, נתונים, ניהול — כרגע placeholder; מימוש בשלבים מאוחרים.

### טבלת שיוך (עמודים ומודולים לשלבים)

| stage_id | סטטוס | עמודים / מודולים בשיוך |
|----------|--------|--------------------------|
| **S001** | **COMPLETED** | Auth (D15.L/R/P), פרופיל (D15.V); D16, D18, D21 (Batch 2); D34 Alerts, D35 Notes. דשבורד בית (D15.I) — **placeholder קיים**. |
| **S002** | **ACTIVE** | **מה שפתוח משלב 1:** D22 (tickers — IN PROGRESS), D23 (data_dashboard — תבנית/placeholder). **+ הכנה לשלב 3:** עמודים ומודולים שנדרש להשלים לפני S003 (לפי TT2_PAGES_SSOT_MASTER_LIST ו־PHOENIX_PORTFOLIO_ROADMAP (חלוקת עמודים)). אין מימוש תוכן דשבורדים ב־S002. |
| **S003** | PLANNED | D39 preferences; D34, D35 (מלא); D33 user_tickers; D22 tickers (מלא); D23 data_dashboard (תוכן). שכבת נתונים יסודית. |
| **S004** | PLANNED | D36 executions; D37 data_import; D21 (הרחבה אם נדרש). המעגל הפיננסי. |
| **S005** | PLANNED | D24 trade_plans, D29 trades, D26 watch_lists; D27 ticker_dashboard, D28 trading_journal. ישויות מורכבות. |
| **S006** | PLANNED | D30, D31, D32; **מימוש דשבורדים רמה 1** (בית, תכנון, מעקב, מחקר, נתונים, ניהול). תובנות וניתוח. |

### מקורות לחלוקה

- רשימת עמודים: **TT2_PAGES_SSOT_MASTER_LIST**.
- סטטוס Batch: היסטוריה ב־ארכיון (TT2_OFFICIAL_PAGE_TRACKER); מקור נוכחי: **PHOENIX_PORTFOLIO_ROADMAP** + **TT2_PAGES_SSOT_MASTER_LIST**.
- מפת דרכים אחת (קטלוג + נרטיב + חלוקת עמודים): **PHOENIX_PORTFOLIO_ROADMAP**.

---

## 5. מקורות קנוניים — איפה מוגדר מה

| מה מחפשים | מסמך / מיקום |
|------------|---------------|
| מפת דרכים (שלבים, נרטיב, Level-2, טבלת עמודים) | `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_PORTFOLIO_ROADMAP_v1.0.0.md` |
| רשימת עמודים SSOT | `documentation/docs-system/01-ARCHITECTURE/TT2_PAGES_SSOT_MASTER_LIST.md` |
| חלוקת עמודים לשלבים | `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_PORTFOLIO_ROADMAP_v1.0.0.md` (סעיף חלוקת עמודים) |
| LEGO UI (Section) | `documentation/docs-system/01-ARCHITECTURE/TT2_SECTION_ARCHITECTURE_SPEC.md` |
| LEGO Backend | `documentation/docs-system/01-ARCHITECTURE/TT2_BACKEND_LEGO_SPEC.md` |
| עמוד → מודולים (דרישות) | `_COMMUNICATION/Legace_html_for_blueprint/…/dynamic-loader-config.js` (PAGE_REQUIREMENTS) |

---

**log_entry | STAGES_PAGES_AND_MODULES_REFERENCE | v1.1.0 | 2026-02-23 — אחידות רשימת עמודים; מודולים ותלויות; חלוקה לשלבים; S001 COMPLETED, S002 ACTIVE; דשבורדים placeholder.**
