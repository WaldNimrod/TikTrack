# פרומטים להפעלת צוותים — Market Data Settings UI (MD-SETTINGS)

**משימה:** MD-SETTINGS  
**נוהל:** TEAM_10_GATEWAY_ROLE_AND_PROCESS, TEAM_10_MASTER_TASK_LIST_PROTOCOL §1.2.1  
**סטטוס:** אישור ביצוע התקבל — מוכן להפעלה  
**תאריך:** 2026-02-15

---

להלן הפרומטים (הודעות ההפעלה) להעברה לכל צוות. כל הודעה מפנה למנדט הייעודי עם משימות ברורות, תוצרים נדרשים ו-AC. שמירת הקבצים ב-`_COMMUNICATION/team_10/`; העברת ההודעה הרלוונטית לצוות היעד.

---

## Team 20 (Backend)

**קובץ מנדט:** [TEAM_10_TO_TEAM_20_MARKET_DATA_SETTINGS_UI_MANDATE.md](TEAM_10_TO_TEAM_20_MARKET_DATA_SETTINGS_UI_MANDATE.md)

**פרומט להפעלה:**

```
Team 10 → Team 20 | הפעלה — Market Data Settings UI (MD-SETTINGS)

אישור ביצוע התוכנית התקבל. אתם מופעלים.

משימה: מימוש API GET + PATCH /settings/market-data; שכבת שירות DB>env; ולידציה קשיחה (min/max); audit; Admin-only. סקריפטי sync קוראים הגדרות מהשירות.

מנדט מלא (היקף, SSOT, Acceptance Criteria): TEAM_10_TO_TEAM_20_MARKET_DATA_SETTINGS_UI_MANDATE.md
תוכנית עבודה: TEAM_10_MARKET_DATA_SETTINGS_UI_WORK_PLAN.md
SSOT: documentation/09-GOVERNANCE/TT2_MARKET_DATA_SYSTEM_SETTINGS_SSOT.md

תיאום DDL עם Team 60 (טבלת market_data.system_settings). דיווח ל-Team 10 עם Evidence. סגירה רק עם Seal (SOP-013) לאחר Gate-A.
```

---

## Team 30 (Frontend)

**קובץ מנדט:** [TEAM_10_TO_TEAM_30_MARKET_DATA_SETTINGS_UI_MANDATE.md](TEAM_10_TO_TEAM_30_MARKET_DATA_SETTINGS_UI_MANDATE.md)

**פרומט להפעלה:**

```
Team 10 → Team 30 | הפעלה — Market Data Settings UI (MD-SETTINGS)

אישור ביצוע התוכנית התקבל. אתם מופעלים.

משימה: UI עריכה + שמירה (PATCH) בעמוד ניהול מערכת; הצגת שגיאות 400/403/422; state reload אחרי שמירה.

מנדט מלא (היקף, AC): TEAM_10_TO_TEAM_30_MARKET_DATA_SETTINGS_UI_MANDATE.md
תוכנית עבודה: TEAM_10_MARKET_DATA_SETTINGS_UI_WORK_PLAN.md
SSOT (טווחים לתצוגה): documentation/09-GOVERNANCE/TT2_MARKET_DATA_SYSTEM_SETTINGS_SSOT.md

דיווח ל-Team 10. סגירה רק עם Seal (SOP-013) לאחר Gate-A.
```

---

## Team 50 (QA)

**קובץ מנדט:** [TEAM_10_TO_TEAM_50_MARKET_DATA_SETTINGS_UI_MANDATE.md](TEAM_10_TO_TEAM_50_MARKET_DATA_SETTINGS_UI_MANDATE.md)

**פרומט להפעלה:**

```
Team 10 → Team 50 | הפעלה — Market Data Settings UI (MD-SETTINGS)

אישור ביצוע התוכנית התקבל. אתם מופעלים.

משימה: Gate-A — תרחישי קצה (טווח, role, השפעה runtime, stale/no-crash). דוח Gate-A + Seal (SOP-013).

מנדט מלא (AC לוידוא): TEAM_10_TO_TEAM_50_MARKET_DATA_SETTINGS_UI_MANDATE.md
תוכנית עבודה: TEAM_10_MARKET_DATA_SETTINGS_UI_WORK_PLAN.md

תוצרים: TEAM_50_TO_TEAM_10_*_MARKET_DATA_SETTINGS_QA_REPORT; Seal. דוח בלבד לא מספיק — Seal חובה.
```

---

## Team 60 (DB/Infra)

**קובץ מנדט:** [TEAM_10_TO_TEAM_60_MARKET_DATA_SETTINGS_UI_MANDATE.md](TEAM_10_TO_TEAM_60_MARKET_DATA_SETTINGS_UI_MANDATE.md)

**פרומט להפעלה:**

```
Team 10 → Team 60 | הפעלה — Market Data Settings UI (MD-SETTINGS)

אישור ביצוע התוכנית התקבל. אתם מופעלים.

משימה: Migration טבלת market_data.system_settings; אינטגרציית Cron/Job — טעינת הגדרות מהשירות; intraday_enabled=false → skip אמיתי של Intraday job + לוג + Evidence.

מנדט מלא (היקף, AC): TEAM_10_TO_TEAM_60_MARKET_DATA_SETTINGS_UI_MANDATE.md
תוכנית עבודה: TEAM_10_MARKET_DATA_SETTINGS_UI_WORK_PLAN.md
SSOT: documentation/09-GOVERNANCE/TT2_MARKET_DATA_SYSTEM_SETTINGS_SSOT.md

תיאום DDL עם Team 20. דיווח ל-Team 10 עם Evidence (migration, runtime skip). סגירה רק עם Seal (SOP-013) לאחר Gate-A.
```

---

## סדר מומלץ להעברה

1. **Team 60** — DDL/migration ראשון (תלות 20 ב-migration).
2. **Team 20** — API + שירות (תלות 30 ב-API).
3. **Team 30** — UI (אחרי/במקביל ל-20).
4. **Team 50** — הפעלה לאחר Build מוכן (Gate-A).

או: 60 ו-20 במקביל (עם תיאום על מבנה הטבלה); 30 אחרי ש-PATCH זמין; 50 כשהמערכת מוכנה ל-QA.

---

**log_entry | TEAM_10 | MD_SETTINGS | ACTIVATION_PROMPTS_ISSUED | 2026-02-15**
