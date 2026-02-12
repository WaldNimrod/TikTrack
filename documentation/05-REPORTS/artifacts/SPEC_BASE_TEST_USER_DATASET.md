# 📋 מפרט — סט בסיס למשתמש test_user

**id:** SPEC_BASE_TEST_USER  
**owner:** Team 20 (Backend)  
**מטרה:** סט נתוני בסיס מייצג (`is_test_data = false`) — מינימלי אך מספק מגוון אופציות להצגה בממשק.

---

## 1. עקרונות

| עקרון | הסבר |
|-------|------|
| **מינימלי** | מספר רשומות קטן — רק מה שנדרש להצגת מגוון |
| **מייצג** | כל סוג/אופציה מופיע לפחות פעם אחת |
| **בסיס** | `is_test_data = false` — לא יימחק ב-`make db-test-clean` |
| **משתמש** | `test_user` (משתמש בסיס קבוע) |

---

## 2. טבלאות וכמויות

### 2.1 trading_accounts (2 חשבונות)

| # | account_name | broker | currency | is_active | מטרה |
|---|--------------|--------|----------|-----------|------|
| 1 | חשבון מרכזי | Interactive Brokers | USD | true | הצגת חשבון פעיל |
| 2 | חשבון אירופה | eToro | EUR | false | הצגת חשבון לא פעיל + סינון status |

**סה״כ:** 2 רשומות.

---

### 2.2 brokers_fees (4 עמלות — 2 לכל חשבון)

| # | trading_account | commission_type | commission_value | minimum |
|---|-----------------|-----------------|------------------|---------|
| 1–2 | חשבון 1 | TIERED, FLAT | 0.005, 1.00 | 0.50, 1.00 |
| 3–4 | חשבון 2 | TIERED, FLAT | 0.005, 1.00 | 0.50, 1.00 |

**סה״כ:** 4 רשומות (קשר: trading_account_id — ADR-015).

---

### 2.3 cash_flows (6 תזרימים — אחד מכל סוג)

| # | flow_type | amount | account |
|---|-----------|--------|---------|
| 1 | DEPOSIT | 1000.00 | חשבון 1 |
| 2 | WITHDRAWAL | -200.00 | חשבון 1 |
| 3 | DIVIDEND | 50.00 | חשבון 1 |
| 4 | INTEREST | 2.50 | חשבון 1 |
| 5 | FEE | -5.00 | חשבון 2 |
| 6 | OTHER | 10.00 | חשבון 1 |

**רשימת סוגים:** ראה `CASH_FLOW_TYPES_SSOT.md` — DEPOSIT, WITHDRAWAL, DIVIDEND, INTEREST, FEE, OTHER.

---

## 3. סיכום כמויות

| טבלה | כמות | הערה |
|------|------|------|
| trading_accounts | 2 | 1 פעיל, 1 לא פעיל |
| brokers_fees | 4 | 2 לכל חשבון (TIERED + FLAT) |
| cash_flows | 6 | אחד מכל flow_type |
| **סה״כ** | **12** | מינימלי מספק |

---

## 4. איורים לממשק

- **D16 (חשבונות):** 2 שורות; סינון `status=active` יציג 1, `status=inactive` יציג 1.
- **D18 (עמלות):** 4 שורות (2 לכל חשבון); סינון `commission_type=TIERED` / `FLAT` — כל אחד יציג 2.
- **D21 (תזרים):** 6 שורות — אחד מכל סוג: DEPOSIT, WITHDRAWAL, DIVIDEND, INTEREST, FEE, OTHER.

---

## 5. סקריפט

- **קובץ:** `scripts/seed_base_test_user.py`
- **הרצה:** אחרי `seed_qa_test_user.py` (אם נדרש); idempotent — מטפל ב-test_user קיים.
- **נוהל:** `make db-backup` לפני הרצה; הנתונים הם בסיס — לא נמחקים ב-clean.
