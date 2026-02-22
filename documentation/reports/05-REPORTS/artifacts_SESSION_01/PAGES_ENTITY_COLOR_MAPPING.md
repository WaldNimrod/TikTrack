# מיפוי עמודים לצבעי ישות — SSOT לצוות 10
**project_domain:** TIKTRACK

**id:** PAGES_ENTITY_COLOR_MAPPING  
**בעלים:** Team 30 (Frontend)  
**תאריך:** 2026-01-31  
**מטרה:** תיעוד מלא של שיוך עמוד → ישות → צבע להמשך עבודה

---

## 1. סקלת צבעי ישות (DNA — phoenix-base.css)

| ישות | CSS Var Base | צבע (hex) |
|------|--------------|-----------|
| trade | --entity-trade | #26baac |
| trade_plan | --entity-trade_plan | #28a745 |
| execution | --entity-execution | #17a2b8 |
| trading_account | --entity-trading_account | #28a745 |
| cash_flow | --entity-cash_flow | #ff9800 |
| ticker | --entity-ticker | #17a2b8 |
| alert | --entity-alert | #dc3545 |
| note | --entity-note | #6c757d |
| research | --entity-research | #9c27b0 |

---

## 2. מיפוי מלא: עמוד → ישות → צבע

| Route | שם העמוד (עברית) | ישות | CSS Var | הערות |
|-------|------------------|------|---------|--------|
| trading_accounts | חשבונות מסחר | trading_account | --entity-trading_account | קיים |
| brokers_fees | ברוקרים ועמלות | trading_account | --entity-trading_account | קיים — אותה ישות כמו חשבון |
| cash_flows | תזרימי מזומנים | cash_flow | --entity-cash_flow | קיים |
| tickers | ניהול טיקרים | alert | --entity-alert | קיים — עמוד ניהול |
| user_tickers | הטיקרים שלי | ticker | --entity-ticker | קיים |
| data_dashboard | דשבורד נתונים | ticker | --entity-ticker | קיים — נתוני שוק/שערים |
| trade_plans | תוכניות טריידים | trade_plan | --entity-trade_plan | חדש |
| ai_analysis | אנליזת AI | trade_plan | --entity-trade_plan | חדש — לפי החלטת משתמש |
| watch_lists | רשימות צפייה | ticker | --entity-ticker | חדש — מעקב טיקרים |
| ticker_dashboard | דשבורד טיקר | ticker | --entity-ticker | חדש |
| trading_journal | יומן מסחר | trade | --entity-trade | חדש |
| trades | ניהול טריידים | trade | --entity-trade | חדש |
| strategy_analysis | ניתוח אסטרטגיות | research | --entity-research | חדש |
| trades_history | היסטוריית טרייד | research | --entity-research | חדש |
| portfolio_state | מצב תיק | cash_flow | --entity-cash_flow | חדש — לפי החלטת משתמש |
| alerts | התראות | alert | --entity-alert | חדש |
| notes | הערות | note | --entity-note | חדש |
| executions | ביצועים | execution | --entity-execution | חדש |
| data_import | ייבוא נתונים | execution | --entity-execution | חדש — תהליכי ייבוא |
| tag_management | ניהול תגיות | note | --entity-note | חדש — מטא־נתונים |
| preferences | העדפות | cash_flow | --entity-cash_flow | חדש — לפי החלטת משתמש |
| system_management | ניהול מערכת | alert | --entity-alert | קיים — עמוד ניהול |

---

## 3. עמודים שסוג הישות הוגדר על ידי המשתמש

(רשימה זו נקבעה לאחר היוועצות עם המשתמש.)

- **ai_analysis** → research  
- **watch_lists** → ticker  
- **data_dashboard** → ticker  
- **tag_management** → note  
- **preferences** → note  
- **system_management** → אין ישות — message-info (כחול מערכת)

---

## 4. שימוש בפרויקט

- **body class:** `entity-{entity_id}` (למשל `entity-trade`, `entity-ticker`)
- **tt-section:** `data-entity="{entity_id}"` לקונטיינרים
- **CSS:** `[data-entity="trade"] .index-section__header { border-inline-start-color: var(--entity-trade); }`

---

**log_entry | TEAM_30 | PAGES_ENTITY_COLOR_MAPPING | CREATED | 2026-01-31**
