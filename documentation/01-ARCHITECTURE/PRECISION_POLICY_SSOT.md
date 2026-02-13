# Precision Policy — SSOT (מפת דיוק מספרי)

**id:** `PRECISION_POLICY_SSOT`  
**בעלים:** Team 10 (The Gateway)  
**מקור:** תיקון חסימת שער ב' 1-004 — `TEAM_90_STAGE1_1_001_1_003_1_004_GATE_B_REVIEW.md`  
**תאריך:** 2026-02-13  
**סטטוס:** 🔒 **נעול — חובה יישור Field Maps, Models, DB ו־Specs לפי מסמך זה**

---

## 1. עקרון

**כל השכבות** — Field Maps, API Models, DB/Schema, ו־Specs (כולל CASH_FLOW_PARSER_SPEC) — **מתיישרות לפי מסמך זה**. אין סתירה בין מקורות; בסיס הנתונים והקוד משקפים את המפה להלן.

---

## 2. כללי ברירת מחדל

| סוג שדה | Precision | דוגמאות |
|---------|-----------|---------|
| **מחירים, שערים, כמויות** (prices, rates, quantity) | **NUMERIC(20,8)** | ticker_prices, exchange_rates.conversion_rate, trades.quantity, avg_entry_price, stop_loss, take_profit |
| **יתרות, סכומים, תזרימים, רווח/הפסד, עמלות** (balances, amounts, P/L, fees) | **NUMERIC(20,6)** | cash_flows.amount, trading_accounts.*, trades.realized_pl, commission, fees, brokers_fees.* |

---

## 3. מפת החלטות לכל ישות (חובה יישור)

### 3.1 market_data

| טבלה | שדה | NUMERIC | הערה |
|------|-----|--------|------|
| exchange_rates | conversion_rate | **(20,8)** | שער המרה |
| ticker_prices | price, open_price, high_price, low_price, close_price | **(20,8)** | מחירי נייר |
| ticker_prices | **market_cap** | **(20,8)** | שווי שוק — Stage-1 (מקור: TEAM_90_INDICATORS_ADDENDUM) |

### 3.2 user_data — cash_flows

| שדה | NUMERIC | הערה |
|-----|--------|------|
| amount | **(20,6)** | סכום תזרים — מתיישר ל־DB ול־Models |

### 3.3 user_data — trading_accounts

| שדה | NUMERIC | הערה |
|-----|--------|------|
| initial_balance, cash_balance, total_deposits, total_withdrawals | **(20,6)** | יתרות וסכומי חשבון |

### 3.4 user_data — brokers_fees (ו־trading_account_fees)

| שדה | NUMERIC | הערה |
|-----|--------|------|
| commission_value | **(20,6)** | עמלה |
| minimum | **(20,6)** | מינימום — **DB שיש בו 20,8 חייב מיגרציה ל־20,6** |

### 3.5 user_data — trades

| שדה | NUMERIC | הערה |
|-----|--------|------|
| quantity, avg_entry_price, avg_exit_price, stop_loss, take_profit | **(20,8)** | מחירים וכמות |
| realized_pl, unrealized_pl, total_pl, commission, fees | **(20,6)** | רווח/הפסד ועמלות |

---

## 4. תוצרים נדרשים (יישור)

| צוות | חובה |
|------|------|
| **Team 20** | יישור Field Maps ו־API Models למפה למעלה; Evidence P3-006 |
| **Team 60** | יישור DB/Schema למפה (כולל brokers_fees.minimum → 20,6 אם כיום 20,8); Evidence P3-006 |
| **Team 10** | עדכון CASH_FLOW_PARSER_SPEC — שדה `amount` = NUMERIC(20,6) |

---

## 5. הפניות

| מסמך | נתיב |
|------|------|
| דוח שער ב' | _COMMUNICATION/team_90/TEAM_90_STAGE1_1_001_1_003_1_004_GATE_B_REVIEW.md |
| Evidence 20 | _COMMUNICATION/team_20/TEAM_20_STAGE1_1_004_PRECISION_AUDIT_EVIDENCE.md |
| Evidence 60 | _COMMUNICATION/team_60/TEAM_60_STAGE1_1_004_PRECISION_AUDIT_EVIDENCE.md |
| CASH_FLOW_PARSER_SPEC | documentation/01-ARCHITECTURE/CASH_FLOW_PARSER_SPEC.md |

---

**log_entry | TEAM_10 | PRECISION_POLICY_SSOT | PUBLISHED | 2026-02-13** — יישור הכול לפי SSOT ובסיס הנתונים; 20/60 משלימים יישור + Evidence.
