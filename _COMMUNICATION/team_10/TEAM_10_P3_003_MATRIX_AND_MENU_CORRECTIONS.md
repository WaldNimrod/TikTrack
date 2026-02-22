# Team 10 — תיקוני מטריצה ותפריט (P3-003 / SSOT עמודים)
**project_domain:** TIKTRACK

**id:** TEAM_10_P3_003_MATRIX_AND_MENU_CORRECTIONS  
**תאריך:** 2026-02-15  
**מקור:** החלטת G-Lead — יישור מלא ל-SSOT רשימת עמודים

---

## 1. תיקונים דחופים

### 1.1 trade_plans

- **חייב להיכנס למטריצה** כ־IN SCOPE.
- **קישור בתפריט:** **תוכניות טריידים** (לא "אנליזת AI").  
  כלומר: פריט תפריט "תוכניות טריידים" → `/trade_plans.html`.

### 1.2 אנליזת AI (ai_analysis)

- **עמוד נפרד** — קיים בלגסי; מחייב עמוד עצמאי בכל המקומות.
- **קישור בתפריט:** פריט **אנליזת AI** → `/ai_analysis.html` (לא לאותו עמוד כמו trade_plans).
- **routes.json:** נוסף `planning.ai_analysis: "/ai_analysis.html"`.

### 1.3 ניהול טריידים (trades)

- **עמוד חדש** — תחת תפריט **מעקב**; מציג ישויות מסוג טרייד.
- **הוספה ל־routes:** `tracking.trades: "/trades.html"` (בוצע).
- **הוספה לתפריט:** מעקב → **ניהול טריידים**.

---

## 2. עמודים חובה — בלופרינט ושלב במטריצה

כל העמודים הבאים **חובה**, קיימים בלגסי; נדרש Blueprint ושלב במטריצה. אם חסר אפיון — במטריצה: **נדרש אפיון**.

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
| trades | ניהול טריידים — תחת מעקב; אפיון קיים (WP_20_09, DB trades) |

---

## 3. עמודי ניהול — חיוניים, בלי Blueprint

| עמוד | הערה |
|------|------|
| system_management | חיוני — לא דורש Blueprint |
| design_system | כבר קיים |

---

## 4. לא נדרש

- **api_keys** — לא נדרש  
- **securities** — לא נדרש  
- **research** (כעמוד דשבורד ראשי) — לא נדרש Blueprint (דשבורד).

---

## 5. עקרון: דשבורדים ברמה 1

**כל הכפתורים ברמה 1:** בית, תכנון, מעקב, מחקר, נתונים, ניהול — **עמודי דשבורד**.

- **לא נדרש Blueprint** לכולם.
- **יבנו בבאץ' אחד** בשלב מתקדם — אחרי עמודי הבסיס.

---

## 6. SSOT רשימת עמודים

**מסמך מחייב:** `documentation/01-ARCHITECTURE/TT2_PAGES_SSOT_MASTER_LIST.md`

המטריצה, Page Tracker והתפריט **חייבים** להיות מתיישרים עם המסמך הזה.

---

**log_entry | TEAM_10 | P3_003_MATRIX_MENU_CORRECTIONS | 2026-02-15**
