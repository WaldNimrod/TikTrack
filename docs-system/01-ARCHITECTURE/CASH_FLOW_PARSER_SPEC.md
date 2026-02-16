# CASH_FLOW_PARSER_SPEC — SSOT

**id:** `CASH_FLOW_PARSER_SPEC`  
**משימה:** 1-003 (Stage-1)  
**בעלים:** Team 20 (לוגיקה) + Team 10 (SSOT)  
**תלות:** MARKET_DATA_PIPE (שערים להמרת מטבע); PRECISION_POLICY_SSOT (שדה amount — 20,6)  
**מפת דרכים:** Roadmap v2.1 — Stage-1 (BLOCKING BATCH 3)  
**רקע:** תנאי מחייב לפני Data Import (Cash Flows + Executions) — Batch 4  
**סטטוס:** SSOT — קודם מטיוטת Team 20 ע"י Team 10 (Knowledge Promotion)  
**תאריך קידום:** 2026-02-13

---

## 1. מטרה

אפיון פיענוח (Parsing) של תזרימי מזומן — קבצים/נתונים מיובאים לעסקאות Cash Flow תקינות. Spec זה מגדיר את חוקי המיפוי, הולידציה והתאמה ל-Field Map.

---

## 2. קלטים צפויים (Input Sources)

| מקור | פורמט | הערות |
|------|--------|--------|
| CSV | עמודות: date, amount, flow_type, description, ... | ייבוא ידני / ברוקר |
| JSON | מערך רשומות | API / Broker sync |
| XLSX | גיליון | ייבוא ידני |

---

## 3. מיפוי שדות (Field Mapping)

**מקור SSOT:** `documentation/01-ARCHITECTURE/LOGIC/WP_20_08_C_FIELD_MAP_CASH_FLOWS.md`

| שדה API/DB | טיפוס | כלל פרסור |
|------------|-------|------------|
| `trading_account_id` | ULID | חובה — מיפוי מ־account name/code או ברירת מחדל |
| `flow_type` | ENUM | DEPOSIT, WITHDRAWAL, DIVIDEND, INTEREST, FEE, CURRENCY_CONVERSION, OTHER |
| `amount` | NUMERIC(20,6) | המרה ל־Decimal; דיוק 6 ספרות — **SSOT:** PRECISION_POLICY_SSOT (cash_flows.amount) |
| `currency` | VARCHAR(3) | ISO 4217; ברירת מחדל USD |
| `transaction_date` | DATE | ISO 8601 / dd/mm/yyyy — נורמליזציה |
| `description` | TEXT | אופציונלי; sanitize Rich Text |
| `external_reference` | VARCHAR(100) | מזהה חיצוני אם קיים |
| `metadata` | JSONB | מידע נוסף (למשל CURRENCY_CONVERSION: from_currency, rate) |

---

## 4. סוגי תזרים (flow_type)

**מקור SSOT:** `documentation/05-REPORTS/artifacts/CASH_FLOW_TYPES_SSOT.md`

| ערך | תיאור |
|-----|--------|
| DEPOSIT | הפקדה |
| WITHDRAWAL | משיכה |
| DIVIDEND | דיבידנד |
| INTEREST | ריבית |
| FEE | עמלה |
| CURRENCY_CONVERSION | המרת מטבע |
| OTHER | אחר |

**חוק Parsing:** מיפוי מחרוזות קלט (למשל "Deposit", "הפקדה") לערך קנוני.

---

## 5. ולידציה (Validation Rules)

| כלל | פעולה |
|-----|--------|
| `amount` שלילי ב-WITHDRAWAL | מותר (מייצג משיכה) |
| `amount` שלילי ב-DEPOSIT | שגיאה — Invalid amount |
| `flow_type` לא מוכר | שגיאה — Invalid flow_type |
| `trading_account_id` חסר/לא תקף | שגיאה — Account not found |
| `transaction_date` עתידי | אזהרה / שגיאה לפי מדיניות |
| `currency` לא ISO 4217 | שגיאה — Invalid currency |
| דיוק amount > 8 ספרות | קיטוע/עיגול ל־8 ספרות (החלטה נדרשת) |

---

## 6. שגיאות (Error Codes)

**מקור:** `api/utils/exceptions.py`, PDSC Boundary Contract

| קוד | HTTP | תיאור |
|-----|------|--------|
| FINANCIAL_CASH_FLOW_INVALID_AMOUNT | 400 | Invalid amount |
| FINANCIAL_CASH_FLOW_INVALID_DATE | 400 | Invalid date |
| FINANCIAL_CASH_FLOW_INVALID_FORMAT | 400 | Parse/format error |
| USER_NOT_FOUND / Resource not found | 404 | Account not found |

---

## 7. תוכנית ולידציה

1. וידוא Field Map תואם ל־API/DB.
2. וידוא Error Codes ממומשים.
3. בדיקות יחידה/אינטגרציה ל-Parser (כשימומש).

---

## 8. הפניות

| מסמך | נתיב |
|------|------|
| Cash Flows Field Map | documentation/01-ARCHITECTURE/LOGIC/WP_20_08_C_FIELD_MAP_CASH_FLOWS.md |
| Cash Flow Types SSOT | documentation/05-REPORTS/artifacts/CASH_FLOW_TYPES_SSOT.md |
| PDSC Boundary Contract | documentation/01-ARCHITECTURE/TT2_PDSC_BOUNDARY_CONTRACT.md |
| Cash Flows model | api/models/cash_flows.py |
| Cash Flows service | api/services/cash_flows.py |
| Roadmap v2.1 | _COMMUNICATION/_Architects_Decisions/PHOENIX_UNIFIED_MODULAR_ROADMAP_V2_1.md |

---

**log_entry | TEAM_10 | KNOWLEDGE_PROMOTION | CASH_FLOW_PARSER_SPEC_SSOT | 2026-02-13**
