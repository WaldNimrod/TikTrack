# סוגי תזרימי מזומנים (flow_type) — SSOT

**מטרה:** מקור אמת לרשימת סוגי התזרים במערכת.

---

## הרשימה הקנונית (6 סוגים)

| ערך | תיאור (UI) |
|-----|-------------|
| `DEPOSIT` | הפקדה |
| `WITHDRAWAL` | משיכה |
| `DIVIDEND` | דיבידנד |
| `INTEREST` | ריבית |
| `FEE` | עמלה |
| `OTHER` | אחר |

---

## מיקומי ההגדרה

| מיקום | קובץ |
|-------|------|
| **DB Schema** | `documentation/06-ENGINEERING/PHX_DB_SCHEMA_V2.5_FULL_DDL.sql` — CHECK על `flow_type` |
| **DB Table Script** | `scripts/create_d16_tables.sql` — CHECK |
| **API Model** | `api/models/cash_flows.py` — CheckConstraint |
| **API Service** | `api/services/cash_flows.py` — `valid_flow_types` |
| **UI Form** | `ui/src/views/financial/cashFlows/cashFlowsForm.js` — select options |
