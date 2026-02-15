# Team 20: P3-006 Precision Evidence — לאחר יישור

**id:** `TEAM_20_P3_006_PRECISION_EVIDENCE`  
**משימה:** P3-006 (תיקון 1-004 Gate-B)  
**מקור:** documentation/01-ARCHITECTURE/PRECISION_POLICY_SSOT.md  
**תאריך:** 2026-01-31

---

## 1. API Models — יישור ל-Precision Policy

| מודל | שדה | Precision | Policy | סטטוס |
|------|-----|-----------|--------|--------|
| cash_flows | amount | Numeric(20, 6) | (20,6) | ✅ |
| trading_accounts | initial_balance, cash_balance, total_deposits, total_withdrawals | Numeric(20, 6) | (20,6) | ✅ |
| brokers_fees (BrokerFee) | commission_value, minimum | Numeric(20, 6) | (20,6) | ✅ |
| exchange_rates | conversion_rate | Numeric(20, 8) | (20,8) | ✅ |
| ticker_prices | price, open_price, high_price, low_price, close_price | Numeric(20, 8) | (20,8) | ✅ |
| trades | quantity, avg_entry_price, avg_exit_price, stop_loss, take_profit | Numeric(20, 8) | (20,8) | ✅ |
| trades | realized_pl, unrealized_pl, commission, fees | Numeric(20, 6) | (20,6) | ✅ |

**מסקנה:** כל המודלים ב־api/models מיושרים ל-Precision Policy. **אין שינוי קוד נדרש.**

---

## 2. Field Maps — טיוטת עדכונים

| מסמך | שינויים מוצעים | מיקום |
|------|----------------|--------|
| WP_20_08_C_FIELD_MAP_CASH_FLOWS | transaction_amounts → NUMERIC(20, 6) | TEAM_20_P3_006_FIELD_MAP_UPDATES_DRAFT.md |
| WP_20_09_C_FIELD_MAP_TRADES | realized_pnl_amounts → NUMERIC(20, 6) | above |
| WP_20_08_C_FIELD_MAP_TRADING_ACCOUNTS_BALANCES | available_amounts, locked_amounts, opening_balance_amounts → NUMERIC(20, 6) | above |

**בקשה ל-Team 10:** להחיל את הטיוטה ב־documentation/ (GOV-MANDATE — Team 20 כותב ב-_COMMUNICATION בלבד).

---

## 3. קבצי Evidence

| קובץ | תיאור |
|------|--------|
| TEAM_20_P3_006_FIELD_MAP_UPDATES_DRAFT.md | טיוטת שינויים ל-Field Maps |
| TEAM_20_P3_006_PRECISION_EVIDENCE.md | מסמך זה |

---

## 4. סיכום

- **Models:** מיושרים — ללא פעולה.
- **Field Maps:** טיוטה הוגשה; החלה ב-Team 10.
- **DB/Schema:** באחריות Team 60 (brokers_fees.minimum אם 20,8 → מיגרציה ל־20,6).

---

**log_entry | TEAM_20 | P3_006 | PRECISION_EVIDENCE | 2026-01-31**
