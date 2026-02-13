# Team 20 → Team 10: עדכון — CURRENCY_CONVERSION flow_type

**מאת:** Team 20 (Backend)  
**אל:** Team 10 (The Gateway)  
**תאריך:** 2026-02-12  
**הקשר:** מזהה ברור להמרת מטבע — לא להשתמש ב-OTHER

---

## 1. סיכום השינוי

הוספנו `flow_type` ייעודי **`CURRENCY_CONVERSION`** להמרת מטבע — במקום שימוש ב-OTHER (פתח לבעיות).

| לפני | אחרי |
|------|------|
| המרת מטבע = flow_type=OTHER + metadata | המרת מטבע = **flow_type=CURRENCY_CONVERSION** |

---

## 2. קבצים שהשתנו

| אזור | קבצים |
|------|-------|
| **DB** | מיגרציה: `scripts/migrations/add_currency_conversion_flow_type.sql` |
| **API** | `api/models/cash_flows.py`, `api/services/cash_flows.py`, `api/schemas/cash_flows.py` |
| **UI** | `cashFlowsForm.js`, `cashFlowsTableInit.js`, `cash_flows.html`, `tradingAccountsDataLoader.js` |
| **Seed** | `seed_base_test_user.py`, `reduce_admin_base_to_minimal.py` |
| **תיעוד** | `CASH_FLOW_TYPES_SSOT.md`, `SPEC_BASE_TEST_USER_DATASET.md`, DDL |

---

## 3. תלות במיגרציה

**חובה להריץ מיגרציה** לפני שה-API וה-Seed יפעלו.

- **בקשת הרצה:** `_COMMUNICATION/team_20/TEAM_20_TO_TEAM_60_CURRENCY_CONVERSION_MIGRATION_REQUEST.md`
- **לאחר הרצה:** להפעיל בקשה ל-QA לפי הנוהל — `_COMMUNICATION/team_10/TEAM_10_TO_TEAM_50_CURRENCY_CONVERSION_QA_REQUEST.md`

---

## 4. צעדים לך (Team 10)

1. **עדכון Index:** להוסיף פריט על השינוי ל-D15_SYSTEM_INDEX / Master Index אם קיים
2. **לאחר אישור Team 60:** לשלוח את בקשת ה-QA ל-Team 50 (`TEAM_10_TO_TEAM_50_CURRENCY_CONVERSION_QA_REQUEST.md`)

---

**log_entry | TEAM_20 | CURRENCY_CONVERSION_FLOW_TYPE_UPDATE | TO_TEAM_10 | 2026-02-12**
