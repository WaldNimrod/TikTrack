# טבלת השוואה — רשימות עמודים (מטריצה, תיעוד רשמי, סקופ 31, תפריט ראשי)

**id:** TEAM_10_P3_003_PAGES_COMPARISON_TABLE  
**מקור SSOT:** `documentation/01-ARCHITECTURE/TT2_PAGES_SSOT_MASTER_LIST.md`  
**תאריך:** 2026-02-15  
**עדכון:** יישור להחלטת G-Lead — trade_plans/ai_analysis/trades, עמודים חובה, דשבורדים רמה 1

---

## מקורות העמודות

| עמודה | מקור |
|--------|------|
| **#** | מזהה SSOT (D15.L … D41) |
| **מטריצה** | TT2_PAGES_SSOT_MASTER_LIST — IN SCOPE / לא נדרש |
| **תיעוד רשמי** | TT2_OFFICIAL_PAGE_TRACKER / routes.json |
| **סקופ 31** | Blueprint / נדרש אפיון (מתיישר ל-SSOT) |
| **תפריט ראשי** | unified-header — תפריט/תת־תפריט |

---

## טבלה ממוספרת (מתיישרת ל-SSOT)

| # | Route | מטריצה | תיעוד רשמי | סקופ 31 | תפריט ראשי |
|---|--------|---------|-------------|---------|-------------|
| D15.L | login | IN SCOPE | D15_LOGIN | קיים | — (public) |
| D15.R | register | IN SCOPE | D15_REGISTER | קיים | — (public) |
| D15.P | reset_password | IN SCOPE | D15_RESET_PWD | קיים | — (public) |
| D15.I | home | IN SCOPE (דשבורד) | D15_INDEX | דשבורד | בית |
| D15.V | profile | IN SCOPE | D15_PROF_VIEW | קיים | הגדרות → פרופיל |
| D24 | **trade_plans** | **IN SCOPE** | planning.trade_plans | ✅ נדרש | תכנון → **תוכניות טריידים** |
| D25 | **ai_analysis** | **IN SCOPE** (עמוד נפרד) | planning.ai_analysis | ✅ נדרש | תכנון → **אנליזת AI** |
| D26 | watch_lists | IN SCOPE | tracking.watch_lists | ✅ נדרש אפיון | מעקב → רשימות צפייה |
| D27 | ticker_dashboard | IN SCOPE | tracking.ticker_dashboard | ✅ נדרש אפיון | מעקב → דשבורד טיקר |
| D28 | trading_journal | IN SCOPE | tracking.trading_journal | ✅ נדרש אפיון | מעקב → יומן מסחר |
| D29 | **trades** | **IN SCOPE** | tracking.trades | ✅ נדרש | מעקב → **ניהול טריידים** |
| D30 | strategy_analysis | IN SCOPE | research.strategy_analysis | ✅ נדרש אפיון | מחקר → ניתוח אסטרטגיות |
| D31 | trades_history | IN SCOPE | research.trades_history | ✅ נדרש אפיון | מחקר → היסטוריית טרייד |
| D32 | portfolio_state | IN SCOPE | research.portfolio_state | ✅ נדרש אפיון | מחקר → מצב תיק |
| D16 | trading_accounts | IN SCOPE | D16 | קיים | נתונים → חשבונות מסחר |
| D18 | brokers_fees | IN SCOPE | D18 | קיים | נתונים → ברוקרים ועמלות |
| D21 | cash_flows | IN SCOPE | D21 | קיים | נתונים → תזרימי מזומנים |
| D22 | tickers | IN SCOPE | D22 | קיים | ניהול → ניהול טיקרים |
| D23 | data_dashboard | IN SCOPE | D23 | קיים | נתונים → דשבורד נתונים |
| D33 | user_tickers | IN SCOPE | data.user_tickers | קיים | נתונים → הטיקרים שלי |
| D34 | alerts | IN SCOPE | data.alerts | ✅ נדרש אפיון | נתונים → התראות |
| D35 | notes | IN SCOPE | data.notes | ✅ נדרש אפיון | נתונים → הערות |
| D36 | executions | IN SCOPE | data.executions | ✅ נדרש | נתונים → ביצועים |
| D37 | data_import | IN SCOPE (דחוף) | settings.data_import | ✅ נדרש | הגדרות → ייבוא נתונים |
| D38 | tag_management | IN SCOPE | settings.tag_management | ✅ נדרש אפיון | הגדרות → ניהול תגיות |
| D39 | preferences | IN SCOPE | settings.preferences | ✅ נדרש אפיון | הגדרות → העדפות |
| D40 | system_management | IN SCOPE (ללא Blueprint) | management | חיוני | ניהול → ניהול מערכת |
| D41 | design_system | IN SCOPE (קיים) | management.design_system | קיים | ניהול → ניהול עיצובים |
| — | **תכנון** (דשבורד) | דשבורד רמה 1 | — | לא נדרש | תכנון |
| — | **מעקב** (דשבורד) | דשבורד רמה 1 | — | לא נדרש | מעקב |
| — | **מחקר** (דשבורד) | דשבורד רמה 1 | — | לא נדרש | מחקר |
| — | **נתונים** (דשבורד) | דשבורד רמה 1 | — | לא נדרש | נתונים |
| — | **ניהול** (דשבורד) | דשבורד רמה 1 | — | לא נדרש | ניהול |
| — | api_keys | **לא נדרש** | — | — | — |
| — | securities | **לא נדרש** | — | — | — |

---

## הערות

- **trade_plans:** קישור בתפריט = **תוכניות טריידים** (לא אנליזת AI). **ai_analysis** = עמוד נפרד, קישור **אנליזת AI**.
- **trades:** עמוד **ניהול טריידים** — תחת מעקב; נוסף ל-routes ולתפריט.
- **דשבורדים רמה 1:** בית, תכנון, מעקב, מחקר, נתונים, ניהול — כולם דשבורדים; לא נדרש Blueprint; באץ' אחד מאוחר יותר.

---

**log_entry | TEAM_10 | P3_003_PAGES_COMPARISON_TABLE | ALIGNED_TO_SSOT | 2026-02-15**
