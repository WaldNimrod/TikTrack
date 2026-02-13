# P3-006: טיוטת עדכוני Field Maps לפי Precision Policy SSOT

**id:** `TEAM_20_P3_006_FIELD_MAP_UPDATES_DRAFT`  
**משימה:** P3-006 — יישור Field Maps  
**מקור:** documentation/01-ARCHITECTURE/PRECISION_POLICY_SSOT.md  
**תאריך:** 2026-01-31

---

## שינויים נדרשים (להחלה ע"י Team 10)

### 1. WP_20_08_C_FIELD_MAP_CASH_FLOWS.md

| שדה | נוכחי | Policy | שינוי |
|-----|-------|--------|-------|
| transaction_amounts | NUMERIC(20, 8) | (20,6) | **לעדכן ל־NUMERIC(20, 6)** |

### 2. WP_20_09_C_FIELD_MAP_TRADES.md

| שדה | נוכחי | Policy | שינוי |
|-----|-------|--------|-------|
| realized_pnl_amounts | NUMERIC(20, 8) | (20,6) | **לעדכן ל־NUMERIC(20, 6)** |

*הערה:* quantity, avg_entry_price, stop_loss, take_profit — (20,8) לפי Policy. אם לא מופיעים — להוסיף.

### 3. WP_20_08_C_FIELD_MAP_TRADING_ACCOUNTS.md

| פריט | נוכחי | Policy | שינוי |
|------|-------|--------|-------|
| כותרת דיוק | DECIMAL(20, 8) | יתרות → (20,6) | **לעדכן הכותרת או להבחין:** balances = (20,6) |

### 4. WP_20_08_C_FIELD_MAP_TRADING_ACCOUNTS_BALANCES.md

| שדה | נוכחי | Policy | שינוי |
|-----|-------|--------|-------|
| available_amounts | NUMERIC(20, 8) | (20,6) | **לעדכן ל־NUMERIC(20, 6)** |
| locked_amounts | NUMERIC(20, 8) | (20,6) | **לעדכן ל־NUMERIC(20, 6)** |
| opening_balance_amounts | NUMERIC(20, 8) | (20,6) | **לעדכן ל־NUMERIC(20, 6)** |

### 5. WP_20_07_FIELD_MAP_EXCHANGE_RATES.md

| שדה | נוכחי | Policy | שינוי |
|-----|-------|--------|-------|
| conversion_rates | NUMERIC(20, 8) | (20,8) | ✅ **ללא שינוי** |

---

## brokers_fees / trading_account_fees

*אין Field Map ייעודי נפרד ב-LOGIC.* המפרטים מפוזרים.  
**Policy:** commission_value, minimum → (20,6).  
**מודלים:** כבר מיושרים (Numeric(20,6)).

---

**בקשה ל-Team 10:** להחיל שינויים אלו ב־documentation/01-ARCHITECTURE/LOGIC/.

**log_entry | TEAM_20 | P3_006 | FIELD_MAP_UPDATES_DRAFT | 2026-01-31**
