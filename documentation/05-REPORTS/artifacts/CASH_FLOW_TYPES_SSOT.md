# סוגי תזרימי מזומנים (flow_type) — SSOT

**מטרה:** מקור אמת לרשימת סוגי התזרים במערכת.

---

## הרשימה הקנונית (7 סוגים)

| ערך | תיאור (UI) |
|-----|-------------|
| `DEPOSIT` | הפקדה |
| `WITHDRAWAL` | משיכה |
| `DIVIDEND` | דיבידנד |
| `INTEREST` | ריבית |
| `FEE` | עמלה |
| `CURRENCY_CONVERSION` | **המרת מטבע** — מזהה ייעודי |
| `OTHER` | אחר |

### המרת מטבע (Currency Conversion)

מזהה ברור: `flow_type='CURRENCY_CONVERSION'` — לא להשתמש ב־OTHER.

- `currency` = מטבע יעד
- `metadata` = `{"from_currency": "USD", "from_amount": 1000, "rate": 1.05}`

מוצג ב־`GET /api/v1/cash_flows/currency_conversions`.

---

## מיקומי ההגדרה

| מיקום | קובץ |
|-------|------|
| **DB Schema** | `documentation/06-ENGINEERING/PHX_DB_SCHEMA_V2.5_FULL_DDL.sql` — CHECK על `flow_type` |
| **DB Table Script** | `scripts/create_d16_tables.sql` — CHECK |
| **API Model** | `api/models/cash_flows.py` — CheckConstraint |
| **API Service** | `api/services/cash_flows.py` — `valid_flow_types` |
| **UI Form** | `ui/src/views/financial/cashFlows/cashFlowsForm.js` — select options |
