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

### 2.2 brokers_fees (2 עמלות)

| # | trading_account | commission_type | commission_value | minimum | מטרה |
|---|-----------------|-----------------|------------------|---------|------|
| 1 | חשבון 1 | TIERED | 0.005 | 0.50 | הצגת עמלת TIERED |
| 2 | חשבון 2 | FLAT | 1.00 | 1.00 | הצגת עמלת FLAT |

**סה״כ:** 2 רשומות (קשר: trading_account_id — ADR-015).

---

### 2.3 cash_flows (5 תזרימים)

| # | flow_type | amount | account | מטרה |
|---|-----------|--------|---------|------|
| 1 | DEPOSIT | 1000.00 | חשבון 1 | הצגת הפקדה |
| 2 | WITHDRAWAL | -200.00 | חשבון 1 | הצגת משיכה |
| 3 | DIVIDEND | 50.00 | חשבון 1 | הצגת דיבידנד |
| 4 | INTEREST | 2.50 | חשבון 1 | הצגת ריבית |
| 5 | FEE | -5.00 | חשבון 2 | הצגת עמלה |

**סה״כ:** 5 רשומות.

---

## 3. סיכום כמויות

| טבלה | כמות | הערה |
|------|------|------|
| trading_accounts | 2 | 1 פעיל, 1 לא פעיל |
| brokers_fees | 2 | TIERED + FLAT |
| cash_flows | 5 | כל flow_type מרכזי |
| **סה״כ** | **9** | מינימלי מספק |

---

## 4. איורים לממשק

- **D16 (חשבונות):** 2 שורות; סינון `status=active` יציג 1, `status=inactive` יציג 1.
- **D18 (עמלות):** 2 שורות; סינון `commission_type=TIERED` / `FLAT` — כל אחד יציג 1.
- **D21 (תזרים):** 5 שורות; מגוון flow_type — DEPOSIT, WITHDRAWAL, DIVIDEND, INTEREST, FEE.

---

## 5. סקריפט

- **קובץ:** `scripts/seed_base_test_user.py`
- **הרצה:** אחרי `seed_qa_test_user.py` (אם נדרש); idempotent — מטפל ב-test_user קיים.
- **נוהל:** `make db-backup` לפני הרצה; הנתונים הם בסיס — לא נמחקים ב-clean.
