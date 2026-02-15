# Team 10 → Team 31: תיקוני סקופ ויישור ל-SSOT רשימת עמודים

**from:** Team 10 (The Gateway)  
**to:** Team 31 (Blueprint)  
**date:** 2026-02-15  
**re:** TEAM_31_TO_TEAM_10_P3_003_SCOPE_AND_DRIFT_RESPONSE + החלטת G-Lead

---

## 1. תיקונים דחופים

### 1.1 trade_plans

- **חייב** להיכנס למטריצה כ־IN SCOPE.
- **קישור בתפריט:** **תוכניות טריידים** (לא "אנליזת AI").  
  כלומר: פריט "תוכניות טריידים" → `/trade_plans.html`.

### 1.2 אנליזת AI (ai_analysis)

- **עמוד נפרד** — קיים בלגסי; מחייב עמוד עצמאי בכל המקומות.
- **קישור בתפריט:** פריט **אנליזת AI** → `/ai_analysis.html` (עמוד נפרד מ־trade_plans).
- **נדרש Blueprint** לעמוד אנליזת AI.

---

## 2. עמודים חובה — בלופרינט ושלב במטריצה

כל העמודים הבאים **חובה** (קיימים בלגסי); נדרש Blueprint ושלב במטריצה. אם חסר אפיון — במטריצה: **נדרש אפיון**.

| עמוד | הערה |
|------|------|
| trading_journal | נדרש אפיון |
| watch_lists | נדרש אפיון |
| ticker_dashboard | נדרש אפיון |
| strategy_analysis | נדרש אפיון |
| trades_history | נדרש אפיון |
| portfolio_state | נדרש אפיון |
| tag_management | נדרש אפיון |
| data_import | **דחוף** — ייבוא CSV מברוקרים לתזרימים וביצועים; אפיון קיים (CASH_FLOW_PARSER_SPEC, data_import_logs) |
| trades | **ניהול טריידים** — תחת תפריט מעקב; הצגת ישויות טרייד; אפיון קיים (WP_20_09, DB trades) |

---

## 3. עמודי ניהול — חיוניים, בלי Blueprint

- **system_management** — חיוני; לא דורש Blueprint.
- **design_system** — כבר קיים.

---

## 4. לא נדרש

- **api_keys** — לא נדרש  
- **securities** — לא נדרש  
- **research** (כעמוד דשבורד ראשי) — לא נדרש Blueprint (דשבורד).

---

## 5. עקרון: דשבורדים ברמה 1

**כל הכפתורים ברמה 1:** בית, תכנון, מעקב, מחקר, נתונים, ניהול — **עמודי דשבורד**.

- **לא נדרש Blueprint** לכולם.
- **יבנו בבאץ' אחד** בשלב מתקדם.

---

## 6. SSOT מחייב

**רשימת עמודים — מקור אמת:** `documentation/01-ARCHITECTURE/TT2_PAGES_SSOT_MASTER_LIST.md`

נא ליישר את הסקופ והבלופרינטים ל-SSOT: מטריצה, תפריט ו־Page Tracker מתיישרים למסמך זה.

---

**log_entry | TEAM_10 | TO_TEAM_31 | P3_003_SCOPE_CORRECTIONS_SSOT | 2026-02-15**
