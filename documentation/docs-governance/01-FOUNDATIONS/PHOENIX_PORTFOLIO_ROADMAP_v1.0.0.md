# PHOENIX_PORTFOLIO_ROADMAP_v1.0.0

**project_domain:** SHARED (TIKTRACK + AGENTS_OS)  
**id:** PHOENIX_PORTFOLIO_ROADMAP  
**version:** 1.0.0  
**owner:** Team 100 / Team 00 (architectural); maintained by Team 170 per consolidation  
**date:** 2026-02-23  
**directive:** TEAM_190_TO_TEAM_170_PORTFOLIO_CANONICALIZATION_MIGRATION_WORK_PACKAGE_v1.0.0  
**מפת דרכים אחת:** אין כפילות. מסמך נרטיב/חבילות ישן הועבר לארכיון: `archive/2026-02-23_roadmap_and_batch_superseded/`.

---

## Boundary

This document is the **single canonical roadmap** for Portfolio (Stage-level only). **Operational state** (which stage is active, current gate) is **only** in WSM `CURRENT_OPERATIONAL_STATE`. No duplicate runtime state here.

---

## Schema (Stage-level only)

| Field | Description |
|-------|-------------|
| stage_id | S{NNN} (e.g. S001) |
| stage_name | Short label |
| planned_scope | Text scope |
| status | ACTIVE \| PLANNED \| COMPLETED \| HOLD |

---

## Stages (catalog)

סדר השורות = סדר התצוגה (היררכיה ראשית). שמות קנוניים: שלב 1, שלב 2, … חבילות העבודה הקיימות שתיהן תחת שלב 1 (S001).



| stage_id | stage_name | planned_scope | status |
| --- | --- | --- | --- |
| S001 | שלב 1 — Foundations Sealed | חיתום יסודות; Stage 1 | COMPLETED |
| S002 | שלב 2 — השלב הפעיל | מה שפתוח משלב 1 + הכנה לשלב 3 | ACTIVE |
| S003 | שלב 3 — Essential Data | שכבת נתונים יסודית | PLANNED |
| S004 | שלב 4 — Financial Execution | המעגל הפיננסי | PLANNED |
| S005 | שלב 5 — Trades/Plans | ישויות מורכבות | PLANNED |
| S006 | שלב 6 — Advanced Analytics | תובנות וניתוח | PLANNED |



**Note:** S001 = שלב 1 (סגור). S002 = שלב 2 — השלב הפעיל מעכשיו. חלוקת עמודים/מודולים: STAGES_PAGES_AND_MODULES_REFERENCE.md.

---

## נרטיב וסקופ (לפי שלבים)

**טקסונומיה:** רק שלבים (Stages) — אין שימוש במונח "באץ'". **דשבורדים** (כולל דף הבית): כרגע עמוד placeholder בלבד; מימוש תוכן בשלבים מאוחרים.

### Prerequisites (תלויות תשתית)

חובה לנעול לפני פיתוח UI רלוונטי: FOREX_MARKET_SPEC, MARKET_DATA_PIPE, CASH_FLOW_PARSER.

### שלב 3 — שכבת נתונים יסודית (Essential Data)

D15_SETTINGS (Preferences), ALERTS & NOTES, USER_TICKERS & TICKERS_MGR.

### שלב 4 — המעגל הפיננסי (Financial Execution)

EXECUTIONS & IMPORT CENTER (Cash Flows).

### שלב 5 — ישויות מורכבות (Trades/Plans)

תוכניות טריידים, טריידים, רשימות צפייה, דשבורד טיקר, יומן מסחר.

### שלב 6 — תובנות וניתוח (Advanced Analytics)

ניתוח אסטרטגיות, היסטוריית טרייד, מצב תיק; מימוש דשבורדים רמה 1.

---

## Level-2 Task Lists (קישורים חובה)

| Level-2 list | Path | Final status |
|---|---|---|
| Registry (all Level-2 lists) | `_COMMUNICATION/team_10/TEAM_10_LEVEL2_LISTS_REGISTRY.md` | ACTIVE |
| Master Task List | `_COMMUNICATION/team_10/TEAM_10_MASTER_TASK_LIST.md` | ACTIVE |
| Completion Carryover List | `_COMMUNICATION/team_10/TEAM_10_LEVEL2_COMPLETION_CARRYOVER_LIST.md` | ACTIVE |

---

## חלוקת עמודים לשלבים (סדר תצוגה)

מקור רשימת עמודים: **TT2_PAGES_SSOT_MASTER_LIST**. כל העמודים מופיעים בסדר הנכון לפי שלב.

| סדר | מזהה | Route | תיאור | stage_id |
|-----|------|--------|--------|----------|
| 1 | D15.L | login | כניסה | S001 |
| 2 | D15.R | register | הרשמה | S001 |
| 3 | D15.P | reset_password | שחזור סיסמה | S001 |
| 4 | D15.I | home | דשבורד בית (placeholder) | S001 |
| 5 | D15.V | profile | פרופיל משתמש | S001 |
| 6 | D16 | trading_accounts | חשבונות מסחר | S001 |
| 7 | D18 | brokers_fees | עמלות ברוקרים | S001 |
| 8 | D21 | cash_flows | תזרימי מזומנים | S001 |
| 9 | D34 | alerts | התראות | S001 |
| 10 | D35 | notes | הערות | S001 |
| 11 | D22 | tickers | ניהול טיקרים | S002 |
| 12 | D23 | data_dashboard | דשבורד נתונים (תבנית/placeholder) | S002 |
| 13 | D33 | user_tickers | הטיקרים שלי | S003 |
| 14 | D39 | preferences | העדפות | S003 |
| 15 | D36 | executions | ביצועים | S004 |
| 16 | D37 | data_import | ייבוא נתונים | S004 |
| 17 | D24 | trade_plans | תוכניות טריידים | S005 |
| 18 | D25 | ai_analysis | אנליזת AI | S005 |
| 19 | D26 | watch_lists | רשימות צפייה | S005 |
| 20 | D27 | ticker_dashboard | דשבורד טיקר | S005 |
| 21 | D28 | trading_journal | יומן מסחר | S005 |
| 22 | D29 | trades | ניהול טריידים | S005 |
| 23 | D30 | strategy_analysis | ניתוח אסטרטגיות | S006 |
| 24 | D31 | trades_history | היסטוריית טרייד | S006 |
| 25 | D32 | portfolio_state | מצב תיק היסטורי | S006 |
| 26 | D38 | tag_management | ניהול תגיות | S003 |
| 27 | D40 | system_management | ניהול מערכת | — |
| 28 | D41 | design_system | ניהול עיצובים | — |

**דשבורדים רמה 1** (בית, תכנון, מעקב, מחקר, נתונים, ניהול): מימוש תוכן — **שלב 6 ומאוחר יותר**.

---

**log_entry | TEAM_170 | PHOENIX_PORTFOLIO_ROADMAP | v1.0.0_CREATED | 2026-02-23**
**log_entry | TEAM_170 | PHOENIX_PORTFOLIO_ROADMAP | SINGLE_ROADMAP_NARRATIVE_AND_PAGES | 2026-02-23**
