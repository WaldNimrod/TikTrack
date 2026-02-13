# Team 60: Precision Audit (1-004) — Evidence

**id:** `TEAM_60_STAGE1_1_004_PRECISION_AUDIT_EVIDENCE`  
**משימה:** 1-004 Precision Audit  
**תאריך:** 2026-02-13  
**מקור:** TEAM_10_TO_TEAM_60_STAGE1_COORDINATION.md; TEAM_10_TO_TEAM_20_STAGE1_MANDATE.md

---

## 1. מטרה

ביקורת Precision — אימות שדות כספיים/מספריים ב-DB; Evidence ל-Team 10 (איסוף) ול-Team 90.

---

## 2. מתודולוגיה

**שאילתה:** `information_schema.columns` — `data_type IN ('numeric','decimal')`  
**סכמות:** `user_data`, `market_data`  
**סביבה:** TikTrack-phoenix-db (tiktrack-postgres-dev)

---

## 3. תוצאות אימות

### 3.1 טבלה — שדות NUMERIC

| Schema | Table | Column | Precision | Scale | SSOT Expected | סטטוס |
|--------|-------|--------|-----------|-------|---------------|--------|
| market_data | ticker_prices | price | 20 | 8 | NUMERIC(20,8) | ✅ |
| market_data | ticker_prices | open_price | 20 | 8 | NUMERIC(20,8) | ✅ |
| market_data | ticker_prices | high_price | 20 | 8 | NUMERIC(20,8) | ✅ |
| market_data | ticker_prices | low_price | 20 | 8 | NUMERIC(20,8) | ✅ |
| market_data | ticker_prices | close_price | 20 | 8 | NUMERIC(20,8) | ✅ |
| user_data | brokers_fees | commission_value | 20 | 6 | NUMERIC(20,6) | ✅ |
| user_data | brokers_fees | minimum | 20 | 8 | NUMERIC(20,6) per SSOT | ⚠️ סטייה |
| user_data | cash_flows | amount | 20 | 6 | NUMERIC(20,6) | ✅ |
| user_data | trading_account_fees | commission_value | 20 | 6 | NUMERIC(20,6) | ✅ |
| user_data | trading_account_fees | minimum | 20 | 6 | NUMERIC(20,6) | ✅ |
| user_data | trading_accounts | initial_balance | 20 | 6 | NUMERIC(20,6) | ✅ |
| user_data | trading_accounts | cash_balance | 20 | 6 | NUMERIC(20,6) | ✅ |
| user_data | trading_accounts | total_deposits | 20 | 6 | NUMERIC(20,6) | ✅ |
| user_data | trading_accounts | total_withdrawals | 20 | 6 | NUMERIC(20,6) | ✅ |
| user_data | trades | quantity | 20 | 8 | NUMERIC(20,8) | ✅ |
| user_data | trades | avg_entry_price | 20 | 8 | NUMERIC(20,8) | ✅ |
| user_data | trades | avg_exit_price | 20 | 8 | NUMERIC(20,8) | ✅ |
| user_data | trades | stop_loss | 20 | 8 | NUMERIC(20,8) | ✅ |
| user_data | trades | take_profit | 20 | 8 | NUMERIC(20,8) | ✅ |
| user_data | trades | realized_pl | 20 | 6 | NUMERIC(20,6) | ✅ |
| user_data | trades | unrealized_pl | 20 | 6 | NUMERIC(20,6) | ✅ |
| user_data | trades | total_pl | 20 | 6 | NUMERIC(20,6) | ✅ |
| user_data | trades | commission | 20 | 6 | NUMERIC(20,6) | ✅ |
| user_data | trades | fees | 20 | 6 | NUMERIC(20,6) | ✅ |

### 3.2 סטיות (Deviations)

| טבלה | עמודה | בפועל | SSOT | הערה |
|------|--------|-------|------|------|
| user_data.brokers_fees | minimum | NUMERIC(20,8) | NUMERIC(20,6) | סטייה קלה; Scale 8 vs 6 — לא קריטי |

---

## 4. סיכום

- **סה"כ שדות NUMERIC נבדקו:** 24  
- **תואם SSOT:** 23  
- **סטיות:** 1 (brokers_fees.minimum — 20,8 vs 20,6)

**המלצה:** לסמן brokers_fees.minimum לתיקון עתידי (מיגרציה ל-NUMERIC(20,6)) אם יידרש יישור מלא. כרגע לא חוסם.

---

## 5. Evidence לאיסוף Team 10

**קובץ:** `_COMMUNICATION/team_60/TEAM_60_STAGE1_1_004_PRECISION_AUDIT_EVIDENCE.md`

---

**log_entry | TEAM_60 | STAGE1_1_004 | PRECISION_AUDIT | 2026-02-13**
