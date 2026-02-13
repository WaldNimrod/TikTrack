# ADR-015 — READY FOR DISTRIBUTION

**מאת:** Team 10 (The Gateway)  
**תאריך:** 2026-02-12  
**נושא:** סגירת חסימות SSOT (Team 90) — הודעה אחת להפצה.

---

## ✅ READY FOR DISTRIBUTION

**חסימות SSOT נסגרו. ניתן להוציא את המנדטים לצוותים 20/30 ולהתחיל ביצוע.**

---

## 1. הוכחת SSOT — שלושת התיקונים

### 1) SSOT DB — trading_account_id בעמלות

- **קובץ:** `documentation/06-ENGINEERING/PHX_DB_SCHEMA_V2.5_FULL_DDL.sql`
- **עדכון:** טבלת `user_data.brokers_fees`:
  - **נוסף:** `trading_account_id UUID NOT NULL REFERENCES user_data.trading_accounts(id) ON DELETE CASCADE`
  - **הוסר:** עמודת `broker` (ברוקר נגזר מחשבון בלבד)
  - **אינדקסים:** `idx_brokers_fees_trading_account_id`, `idx_brokers_fees_account_deleted`; הוסר `idx_brokers_fees_broker`
- **קריטריון:** DDL מציג Account→Fees כ-SSOT.

### 2) "Other broker" — החלטה נעולה

- **מסמך:** `_COMMUNICATION/team_10/ADR_015_FINAL_FOR_ARCHITECT_APPROVAL.md` — **§8. SSOT — פריט "אחר" (נעול)**
- **החלטה:** "אחר" **מגיע מה-API** (defaults_brokers.json): `value`: **`"other"`**, `display_name`/label: "אחר", `is_supported`: **`false`**. Frontend משתמש באותה רשומה.
- **קריטריון:** אין שאלות פתוחות במסמך final.

### 3) הודעת משילות — placeholder סגור

- **מסמך SSOT:** `documentation/06-ENGINEERING/ADR_015_GOVERNANCE_MESSAGE_SSOT.md`
- **ערך קבוע:** מפתח `primary_admin_contact` = `mailto:support@tiktrack.app` (ניתן להחלפה ב-env `PRIMARY_ADMIN_EMAIL`). טקסט ההודעה המלא מתועד שם.
- **קריטריון:** אין placeholders לפני הפצה; כל המסמכים מפנים ל-SSOT.

### 4) commission_value — NUMERIC(20,6) (סבב 2)

- **קובץ:** `documentation/06-ENGINEERING/PHX_DB_SCHEMA_V2.5_FULL_DDL.sql`
- **עדכון:** `commission_value` מוגדר **NUMERIC(20, 6)** (לא VARCHAR). הערת SSOT מפנה ל־`_COMMUNICATION/team_10/TEAM_10_COMMISSION_VALUE_NUMERIC_DECISIONS.md`.
- **קריטריון:** DDL מציג NUMERIC(20,6).

### 5) מיגרציה Account↔Fees (סבב 2)

- **תוכנית עבודה:** `TEAM_10_ADR_015_BROKER_REFERENCE_WORK_PLAN.md` — **§6א. מיגרציה Account↔Fees** (כללי מיפוי, התאמה יחידה/כפולה/אין התאמה, commission_value, תוצר).
- **מנדט Team 20:** `TEAM_10_TO_TEAM_20_ADR_015_BROKER_REFERENCE_MANDATE.md` — **§2.3 מיגרציה Account↔Fees** (ביצוע בפועל).
- **קריטריון:** סעיף מיגרציה קיים בתוכנית ובמנדט, עם כללי החלטה ברורים.

---

## 2. קישורים לקבצים (הוכחת SSOT)

| פריט | קישור |
|------|--------|
| **DDL מעודכן** | `documentation/06-ENGINEERING/PHX_DB_SCHEMA_V2.5_FULL_DDL.sql` — brokers_fees: trading_account_id, commission_value NUMERIC(20,6), ללא broker |
| **החלטת commission_value** | `_COMMUNICATION/team_10/TEAM_10_COMMISSION_VALUE_NUMERIC_DECISIONS.md` |
| **סעיף מיגרציה** | תוכנית עבודה §6א; מנדט Team 20 §2.3 |
| **סעיף "אחר"** | `_COMMUNICATION/team_10/ADR_015_FINAL_FOR_ARCHITECT_APPROVAL.md` — §8 |
| **טקסט משילות סגור** | `documentation/06-ENGINEERING/ADR_015_GOVERNANCE_MESSAGE_SSOT.md` |

---

## 3. מסמכי הפצה מעודכנים

- [TEAM_10_ADR_015_BROKER_REFERENCE_WORK_PLAN.md](./TEAM_10_ADR_015_BROKER_REFERENCE_WORK_PLAN.md)
- [TEAM_10_TO_TEAM_20_ADR_015_BROKER_REFERENCE_MANDATE.md](./TEAM_10_TO_TEAM_20_ADR_015_BROKER_REFERENCE_MANDATE.md)
- [TEAM_10_TO_TEAM_30_ADR_015_BROKER_REFERENCE_MANDATE.md](./TEAM_10_TO_TEAM_30_ADR_015_BROKER_REFERENCE_MANDATE.md)
- [ADR_015_FINAL_FOR_ARCHITECT_APPROVAL.md](./ADR_015_FINAL_FOR_ARCHITECT_APPROVAL.md)

---

**Team 10 (The Gateway)**  
**log_entry | ADR_015 | READY_FOR_DISTRIBUTION | 2026-02-12**  
**log_entry | ADR_015 | SSOT_BLOCKERS_ROUND2_CLOSED | 2026-02-12** (commission_value NUMERIC(20,6); מיגרציה §6א + מנדט 20 §2.3)
