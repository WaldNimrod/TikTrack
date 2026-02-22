# Team 10 — P3-003 Blueprint Scope + Drift (מטריצה ותיעוד)
**project_domain:** TIKTRACK

**id:** TEAM_10_P3_003_BLUEPRINT_SCOPE_AND_DRIFT_MATRIX  
**from:** Team 10 (The Gateway)  
**date:** 2026-02-15  
**re:** רשימת המשימות המרכזית — סגירת P3-003  
**מקור:** TEAM_10_TO_TEAM_90_ROADMAP_V2_1_RESPONSE_AND_STAGE1_PLAN.md  
**עדכון 2026-02-15:** יישור להחלטת G-Lead — **SSOT רשימת עמודים:** `documentation/01-ARCHITECTURE/TT2_PAGES_SSOT_MASTER_LIST.md`

---

## 1. SSOT רשימת עמודים (מחייב)

**מטריצת העמודים המלאה** — מקור אמת יחיד: **`documentation/01-ARCHITECTURE/TT2_PAGES_SSOT_MASTER_LIST.md`**

המטריצה להלן היא תמצית; לכל מזהה, Route, בלופרינט, תפריט ואפיון — ראה SSOT.

### עקרון: דשבורדים ברמה 1

כל הכפתורים ברמה 1 (בית, תכנון, מעקב, מחקר, נתונים, ניהול) = **עמודי דשבורד**. **לא נדרש Blueprint**; יבנו בבאץ' אחד בשלב מתקדם.

### IN SCOPE — עמודים חובה (תמצית)

| מזהה | Route | בלופרינט? | תפריט | אפיון |
|------|--------|------------|--------|--------|
| D15.L/R/P/I/V | login, register, reset, home, profile | ✅ / דשבורד | Auth, בית, הגדרות | קיים |
| D24 | trade_plans | ✅ | תכנון → **תוכניות טריידים** | קיים |
| D25 | ai_analysis | ✅ (עמוד נפרד) | תכנון → **אנליזת AI** | נדרש אפיון |
| D26–D29 | watch_lists, ticker_dashboard, trading_journal, **trades** | ✅ | מעקב → רשימות צפייה, דשבורד טיקר, יומן מסחר, **ניהול טריידים** | נדרש אפיון / קיים (trades) |
| D30–D32 | strategy_analysis, trades_history, portfolio_state | ✅ | מחקר → … | נדרש אפיון |
| D16, D18, D21, D22, D23 | trading_accounts … data_dashboard | ✅ | נתונים, ניהול | קיים |
| D33–D37 | user_tickers, alerts, notes, executions, **data_import** | ✅ | נתונים, הגדרות → ייבוא נתונים | קיים / נדרש אפיון (data_import דחוף) |
| D38–D39 | tag_management, preferences | ✅ | הגדרות | נדרש אפיון |
| D40–D41 | system_management, design_system | לא נדרש / קיים | ניהול | — |

### לא נדרש

api_keys, securities — **לא נדרש**. research (דשבורד ראשי) — לא נדרש Blueprint.

---

## 2. Evidence

- **SSOT רשימת עמודים:** [TT2_PAGES_SSOT_MASTER_LIST.md](../../documentation/01-ARCHITECTURE/TT2_PAGES_SSOT_MASTER_LIST.md) — מקור אמת לרשימה, תפריט ובלופרינט.
- **תיקונים (תפריט + מטריצה):** [TEAM_10_P3_003_MATRIX_AND_MENU_CORRECTIONS.md](TEAM_10_P3_003_MATRIX_AND_MENU_CORRECTIONS.md).
- **Routes:** `routes.json` — נוספו ai_analysis, trades. תפריט — תוכניות טריידים ↔ trade_plans; אנליזת AI ↔ ai_analysis; מעקב → ניהול טריידים.
- **טבלת השוואה:** [TEAM_10_P3_003_PAGES_COMPARISON_TABLE.md](TEAM_10_P3_003_PAGES_COMPARISON_TABLE.md) — מתיישרת ל-SSOT.

---

## 3. סגירה

**P3-003** — מסומן **CLOSED** ברשימה המרכזית עם תיעוד זה.  
קריטריוני קבלה: Evidence (routes/menu), מטריצת Blueprint + טיפול Drift מתועד — **מתקיים**.

---

**log_entry | TEAM_10 | P3_003_BLUEPRINT_SCOPE_DRIFT_CLOSED | 2026-02-15**
