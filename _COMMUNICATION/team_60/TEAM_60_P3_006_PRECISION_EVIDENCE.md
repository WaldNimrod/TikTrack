# Team 60: Evidence P3-006 — Precision Audit (Post Policy SSOT)

**id:** `TEAM_60_P3_006_PRECISION_EVIDENCE`  
**משימה:** P3-006 (תיקון 1-004)  
**מקור:** PRECISION_POLICY_SSOT.md; TEAM_10_TO_TEAM_60_PRECISION_POLICY_PUBLISHED.md  
**date:** 2026-02-13

---

## 1. יישור DB/Schema

**מיגרציה:** `scripts/migrations/p3_006_brokers_fees_minimum_precision_20_6.sql`  
**שינוי:** `user_data.brokers_fees.minimum` — NUMERIC(20,8) → NUMERIC(20,6)  
**הרצה:** exit code 0

---

## 2. מטריצת NUMERIC — אימות מול PRECISION_POLICY_SSOT

| Schema | Table | Column | Precision | Scale | Policy | סטטוס |
|--------|-------|--------|-----------|-------|--------|--------|
| market_data | exchange_rates | conversion_rate | 20 | 8 | 20,8 | ✅ |
| market_data | ticker_prices | price, open, high, low, close | 20 | 8 | 20,8 | ✅ |
| user_data | brokers_fees | commission_value | 20 | 6 | 20,6 | ✅ |
| user_data | brokers_fees | minimum | 20 | 6 | 20,6 | ✅ תוקן |
| user_data | cash_flows | amount | 20 | 6 | 20,6 | ✅ |
| user_data | trading_account_fees | commission_value, minimum | 20 | 6 | 20,6 | ✅ |
| user_data | trading_accounts | initial_balance, cash_balance, total_deposits, total_withdrawals | 20 | 6 | 20,6 | ✅ |
| user_data | trades | quantity, avg_entry_price, avg_exit_price, stop_loss, take_profit | 20 | 8 | 20,8 | ✅ |
| user_data | trades | realized_pl, unrealized_pl, total_pl, commission, fees | 20 | 6 | 20,6 | ✅ |

**סה"כ:** 24 עמודות — כולן תואמות ל-PRECISION_POLICY_SSOT.

---

## 3. Evidence — PASS

אין סתירה בין DB/SSOT ל-Precision Policy.

---

**log_entry | TEAM_60 | P3_006 | PRECISION_EVIDENCE | 2026-02-13**
