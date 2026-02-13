# Precision Audit (1-004) — Evidence

**id:** `TEAM_20_STAGE1_1_004_PRECISION_AUDIT_EVIDENCE`  
**משימה:** 1-004 Precision Audit  
**בעלים:** Team 20 (מימוש) + Team 60 (DB) + Team 10 (Evidence)  
**תאריך:** 2026-01-31  
**מקור:** .cursorrules — "Precision: Decimal(20,8) for money"  
**מפת דרכים:** Roadmap v2.1 — Stage-1

---

## 1. סטנדרט פרויקט

| מקור | דיוק |
|------|------|
| .cursorrules | Decimal(20,8) for money |
| WP_20_08_C_FIELD_MAP_CASH_FLOWS | transaction_amounts: NUMERIC(20, 8) |
| WP_20_07_FIELD_MAP_EXCHANGE_RATES | conversion_rates: NUMERIC(20, 8) |

---

## 2. מטריצת שדות כספיים (API Models)

| מודל | שדה | נוכחי | סטנדרט | הערה |
|------|-----|-------|--------|------|
| cash_flows | amount | Numeric(20, **6**) | (20,8) | **סטייה** — Field Map מציין 20,8 |
| trading_accounts | initial_balance, cash_balance, total_deposits, total_withdrawals | Numeric(20, **6**) | (20,8) | **סטייה** |
| brokers_fees | commission_value, minimum | Numeric(20, **6**) | SSOT נפרד (20,6) | TEAM_10_COMMISSION_VALUE — 20,6 מאושר |
| ticker_prices | price, open/high/low/close | Numeric(20, **8**) | (20,8) | ✅ |
| trades | quantity, avg_entry/exit, stop_loss, take_profit | Numeric(20, **8**) | (20,8) | ✅ |
| trades | realized_pl, unrealized_pl, commission, fees | Numeric(20, **6**) | (20,8) | **סטייה** — כסף |

---

## 3. מטריצת DB (create_d16 / PHX_DB_SCHEMA)

| טבלה | שדה | נוכחי | הערה |
|------|-----|-------|------|
| cash_flows | amount | NUMERIC(20,6) | סטייה מ-Field Map 20,8 |
| trading_accounts | initial_balance, cash_balance, total_deposits, total_withdrawals | NUMERIC(20,6) | |
| brokers_fees (trading_account_fees) | commission_value, minimum | NUMERIC(20,6) | מאושר SSOT |
| ticker_prices | price, open/high/low/close | NUMERIC(20,8) | ✅ |
| trades | quantity, prices, stop/take | NUMERIC(20,8) | ✅ |
| trades | realized_pl, unrealized_pl, commission, fees | NUMERIC(20,6) | |

---

## 4. סיכום סטיות

| ישות | שדות | פעולה מומלצת |
|------|------|---------------|
| cash_flows.amount | 20,6 | החלטה: 20,8 (Field Map) או 20,6 (קיים) — דורש מיגרציה אם 20,8 |
| trading_accounts.* | balances, deposits, withdrawals | החלטה — מיגרציה משמעותית |
| trades | commission, fees, P/L | החלטה — 20,6 נפוץ ב-P/L/עמלות |

---

## 5. החלטות SSOT קיימות

| מסמך | החלטה |
|------|--------|
| TEAM_10_COMMISSION_VALUE_NUMERIC_DECISIONS | commission_value, minimum: NUMERIC(20,6) |
| WP_20_08_C | transaction_amounts: NUMERIC(20,8) |

**סתירה:** cash_flows.amount — Field Map 20,8 vs DB/Model 20,6.

---

## 6. Evidence — קבצים שנבדקו

| קובץ | תוצאה |
|------|--------|
| api/models/cash_flows.py | amount: Numeric(20,6) |
| api/models/trading_accounts.py | 4 שדות: Numeric(20,6) |
| api/models/brokers_fees.py | commission_value, minimum: Numeric(20,6) ✅ SSOT |
| api/models/ticker_prices.py | price*: Numeric(20,8) ✅ |
| api/models/trades.py | mixed — 20,8 ל-prices/qty; 20,6 ל-P/L/commission |
| scripts/create_d16_tables.sql | תואם למודלים |
| documentation/06-ENGINEERING/PHX_DB_SCHEMA_V2.5_FULL_DDL.sql | תואם |

---

## 7. המלצה ל-Team 10 / אדריכל

1. **לאחד סטנדרט:** 20,8 לכל "money" או להשאיר 20,6 ל־balances/commission (בהתאם להחלטה קיימת).
2. **cash_flows.amount:** ליישר Field Map (20,8) עם DB/Model — דורש מיגרציה אם משנים.
3. **תיעוד:** ליצור מסמך SSOT מרכזי ל-Precision (למשל PRECISION_POLICY_SSOT) שיגדיר 20,8 vs 20,6 לכל סוג שדה.

---

## 8. הגשה ל-Team 90

**Evidence זה** — מוגש דרך Team 10 — מהווה פלט Precision Audit. Team 60 יאמת את ה-DB בפועל; Team 10 יאסוף Evidence סופי ויגיש ל-Team 90.

---

**log_entry | TEAM_20 | STAGE1_1_004 | PRECISION_AUDIT_EVIDENCE | 2026-01-31**
