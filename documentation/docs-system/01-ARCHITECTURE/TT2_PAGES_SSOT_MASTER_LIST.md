# רשימת עמודים במערכת — SSOT (מאסטר)
**project_domain:** TIKTRACK

**id:** TT2_PAGES_SSOT_MASTER_LIST  
**owner:** Team 10 (The Gateway)  
**status:** 🔒 **SSOT - MANDATORY**  
**תאריך:** 2026-02-15  
**מקור:** החלטת G-Lead — יישור מטריצה, תפריט, סקופ צוות 31. חלוקה לשלבים: PHOENIX_PORTFOLIO_ROADMAP (סעיף "חלוקת עמודים לשלבים").
**canonical_location:** documentation/docs-system/01-ARCHITECTURE/TT2_PAGES_SSOT_MASTER_LIST.md  
**cross_reference:** PHOENIX_PORTFOLIO_ROADMAP_v1.0.0.md governs stage assignments

---

## 1. עקרון: דשבורדים ברמה 1

**כל הכפתורים ברמה 1 של התפריט** — בית, תכנון, מעקב, מחקר, נתונים, ניהול — הם **עמודי דשבורד**.

- **לא נדרש Blueprint** לדשבורדים אלה.
- **יבנו בבאץ' אחד** בשלב מתקדם — אחרי עמודי הבסיס, לפני עמודים מתקדמים.

---

## 2. מטריצת עמודים ממוספרת (SSOT)

### 2.1 Auth + דשבורד בית + פרופיל

| # | מזהה | Route | תיאור | בלופרינט? | תפריט | אפיון |
|---|------|--------|--------|------------|--------|--------|
| D15.L | D15.L | login | כניסה | ✅ קיים | — (public) | קיים |
| D15.R | D15.R | register | הרשמה | ✅ קיים | — (public) | קיים |
| D15.P | D15.P | reset_password | שחזור סיסמה | ✅ קיים | — (public) | קיים |
| D15.I | D15.I | home | דשבורד בית | **דשבורד — לא נדרש** | בית | קיים |
| D15.V | D15.V | profile | פרופיל משתמש | ✅ קיים | הגדרות → פרופיל | קיים |

### 2.2 תכנון (Planning)

| # | מזהה | Route | תיאור | בלופרינט? | תפריט | אפיון |
|---|------|--------|--------|------------|--------|--------|
| D24 | D24 | trade_plans | **תוכניות טריידים** | ✅ נדרש | תכנון → **תוכניות טריידים** | קיים (DB trade_plans) |
| D25 | D25 | ai_analysis | **אנליזת AI** (עמוד נפרד) | ✅ נדרש | תכנון → **אנליזת AI** | **נדרש אפיון** (קיים בלגסי) |

**חובה:** קישור **תוכניות טריידים** → trade_plans; קישור **אנליזת AI** → ai_analysis (עמוד עצמאי).

### 2.3 מעקב (Tracking)

| # | מזהה | Route | תיאור | בלופרינט? | תפריט | אפיון |
|---|------|--------|--------|------------|--------|--------|
| — | — | **תכנון** (דשבורד) | דשבורד תכנון | דשבורד — לא נדרש | תכנון (רמה 1) | — |
| D26 | D26 | watch_lists | רשימות צפייה | ✅ נדרש | מעקב → רשימות צפייה | **נדרש אפיון** |
| D27 | D27 | ticker_dashboard | דשבורד טיקר | ✅ נדרש | מעקב → דשבורד טיקר | **נדרש אפיון** |
| D28 | D28 | trading_journal | יומן מסחר | ✅ נדרש | מעקב → יומן מסחר | **נדרש אפיון** |
| D29 | D29 | trades | **ניהול טריידים** (ישויות טרייד) | ✅ נדרש | מעקב → **ניהול טריידים** | קיים (WP_20_09, DB trades) |

**חובה:** עמוד **trades** (ניהול טריידים) — תחת מעקב; הצגת ישויות מסוג טרייד. הוספה ל־routes ולתפריט.

### 2.4 מחקר (Research)

| # | מזהה | Route | תיאור | בלופרינט? | תפריט | אפיון |
|---|------|--------|--------|------------|--------|--------|
| — | — | **מעקב** (דשבורד) | דשבורד מעקב | דשבורד — לא נדרש | מעקב (רמה 1) | — |
| — | — | **מחקר** (דשבורד) | דשבורד מחקר ראשי | **דשבורד — לא נדרש** | מחקר (רמה 1) | — |
| D30 | D30 | strategy_analysis | ניתוח אסטרטגיות | ✅ נדרש | מחקר → ניתוח אסטרטגיות | **נדרש אפיון** |
| D31 | D31 | trades_history | היסטוריית טרייד | ✅ נדרש | מחקר → היסטוריית טרייד | **נדרש אפיון** |
| D32 | D32 | portfolio_state | מצב תיק היסטורי | ✅ נדרש | מחקר → מצב תיק | **נדרש אפיון** |

### 2.5 נתונים (Data)

| # | מזהה | Route | תיאור | בלופרינט? | תפריט | אפיון |
|---|------|--------|--------|------------|--------|--------|
| — | — | **נתונים** (דשבורד) | דשבורד נתונים | דשבורד — לא נדרש | נתונים (רמה 1) | — |
| D16 | D16 | trading_accounts | חשבונות מסחר | ✅ קיים | נתונים → חשבונות מסחר | קיים |
| D18 | D18 | brokers_fees | עמלות ברוקרים | ✅ קיים | נתונים → ברוקרים ועמלות | קיים |
| D21 | D21 | cash_flows | תזרימי מזומנים | ✅ קיים | נתונים → תזרימי מזומנים | קיים |
| D22 | D22 | tickers | ניהול טיקרים | ✅ קיים | ניהול → ניהול טיקרים | קיים |
| D23 | D23 | data_dashboard | דשבורד נתונים (תוכן) | ✅ קיים | נתונים → דשבורד נתונים | קיים |
| D33 | D33 | user_tickers | הטיקרים שלי | ✅ קיים | נתונים → הטיקרים שלי | קיים |
| D34 | D34 | alerts | התראות | ✅ קיים | נתונים → התראות | קיים (Blueprint מסופק; MB3A Phase 2 — Gate-0 Alerts הופעל) |
| D35 | D35 | notes | הערות | ✅ קיים | נתונים → הערות | קיים (Blueprint מסופק; D35 Lock — Rich Text/Attachments — במנדטים 20/30/60) |
| D36 | D36 | executions | ביצועים | ✅ נדרש | נתונים → ביצועים | קיים (WP_20_09 Executions) |
| D37 | D37 | data_import | **ייבוא נתונים** (CSV → תזרימים/ביצועים) | ✅ נדרש — **דחוף** | הגדרות → ייבוא נתונים | קיים (CASH_FLOW_PARSER_SPEC, data_import_logs) |

**הערה:** data_import — ייבוא קבצי CSV מברוקרים לתזרימי מזומן וביצועים; תהליכים מתוכננים במטריצה/באצ'ים.

### 2.6 הגדרות (Settings)

| # | מזהה | Route | תיאור | בלופרינט? | תפריט | אפיון |
|---|------|--------|--------|------------|--------|--------|
| D38 | D38 | tag_management | ניהול תגיות | ✅ נדרש | הגדרות → ניהול תגיות | **נדרש אפיון** |
| D39 | D39 | preferences | העדפות | ✅ נדרש | הגדרות → העדפות | **נדרש אפיון** |

**הערת שלב D38:** Stage: S005. Originally S003; relocated to S005 per `ARCHITECT_DIRECTIVE_ROADMAP_AMENDMENT_v1.0.0` Amendment A1 (2026-03-02, Nimrod-approved). Rationale: tag registry is effective after taggable entities exist (D29, D30, D36).

### 2.7 ניהול (Management) — ללא Blueprint

| # | מזהה | Route | תיאור | בלופרינט? | תפריט | אפיון |
|---|------|--------|--------|------------|--------|--------|
| — | — | **ניהול** (דשבורד) | דשבורד ניהול | דשבורד — לא נדרש | ניהול (רמה 1) | — |
| D40 | D40 | system_management | ניהול מערכת | ✅ נדרש | ניהול → ניהול מערכת | נדרש אפיון |
| — | — | tickers | ניהול טיקרים | ✅ קיים | ניהול → ניהול טיקרים | (D22) |
| D41 | D41 | user_management | ניהול משתמשים (Admin User Control) | ✅ נדרש | ניהול → ניהול משתמשים | נדרש אפיון (admin-only; users list, status, role changes) |

### 2.8 S005 Enhancement Entries (SSOT alignment)

| # | מזהה | Route | תיאור | Stage | Type | Trigger | Scope |
|---|------|-------|-------|-------|------|---------|-------|
| 26.1 | D26-Phase2 | watch_lists (enhancement) | הרחבת רשימות צפייה | S005 | Enhancement WP (not a new page) | D29 (trades) GATE_8 PASS | ATR(14), Position, P/L%, P/L columns + flag-color filter enhancement |

---

## Notes parent_type canonical lock

Valid `parent_type` values for notes (canonical — Nimrod-locked 2026-03-02): `ticker | user_ticker | alert | trade | trade_plan | account | datetime`.

Note: `general` parent_type was deprecated per `ARCHITECT_DIRECTIVE_G7_REMEDIATION_S002_P003_WP002_v1.0.0` and locked as invalid per Team 00 Iron Rule (2026-03-02).

### 2.9 לא נדרש (Out of Scope)

| Route | הערה |
|--------|------|
| api_keys | לא נדרש |
| securities | לא נדרש |

---

## 3. יישור תפריט (חובה)

- **תכנון:** פריט **תוכניות טריידים** → `/trade_plans.html` (לא "אנליזת AI"). פריט **אנליזת AI** → `/ai_analysis.html` (עמוד נפרד).
- **מעקב:** להוסיף **ניהול טריידים** → `/trades.html` (עמוד חדש).
- **רמה 1:** בית, תכנון, מעקב, מחקר, נתונים, ניהול = דשבורדים (באץ' אחד מאוחר יותר).

---

## 4. הפניות

| מסמך | נתיב |
|------|------|
| חלוקת עמודים לשלבים | documentation/docs-governance/01-FOUNDATIONS/PHOENIX_PORTFOLIO_ROADMAP_v1.0.0.md (סעיף "חלוקת עמודים לשלבים") |
| מטריצה P3-003 | _COMMUNICATION/team_10/TEAM_10_P3_003_BLUEPRINT_SCOPE_AND_DRIFT_MATRIX.md |
| טבלת השוואה | _COMMUNICATION/team_10/TEAM_10_P3_003_PAGES_COMPARISON_TABLE.md |
| routes.json | ui/public/routes.json |
| unified-header | ui/src/views/shared/unified-header.html |

---

**log_entry | TEAM_10 | TT2_PAGES_SSOT_MASTER_LIST | CREATED | 2026-02-15**
**log_entry | TEAM_170 | SSOT_CORRECTIONS | per_ARCHITECT_DIRECTIVE_SSOT_CORRECTIONS_v1.0.0 | 2026-03-03**
**log_entry | TEAM_170 | TT2_PAGES_SSOT_MASTER_LIST | ROADMAP_AMENDMENT_v2_B3_APPLIED_D41_USER_MANAGEMENT | 2026-03-03**
