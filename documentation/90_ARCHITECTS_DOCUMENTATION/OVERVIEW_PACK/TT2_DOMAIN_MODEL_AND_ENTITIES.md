# TT2_DOMAIN_MODEL_AND_ENTITIES

**id:** `TT2_DOMAIN_MODEL_AND_ENTITIES`  
**owner:** Team 20 (Backend) + Team 30 (Frontend)  
**status:** DRAFT  
**last_updated:** 2026-02-12  

---

## 1) Domain Vocabulary (Canonical Terms)
- **User**: authenticated identity (JWT role/tier)
- **Trading Account**: the primary financial container
- **Broker**: metadata tied to a trading account (reference list)
- **Fees**: commissions linked to a trading account (one-to-many)
- **Cash Flow**: deposits/withdrawals per account
- **Currency Conversion**: FX entries per account
- **Position**: holdings linked to account

## 2) Entity Map (High‑Level)
| Entity | Purpose | Key Fields | Owner | Source |
|---|---|---|---|---|
| Trading Account | Base financial entity | id, broker, status | Backend | DB/SSOT |
| Broker | Reference list | id, display_name, is_supported, default_fees | Backend | API / reference |
| Fees | Per account commissions | id, trading_account_id, commission_type, commission_value | Backend | DB |
| Cash Flow | Movement of funds | id, trading_account_id, amount | Backend | DB |
| Conversion | FX conversion | id, trading_account_id, rate | Backend | DB |
| User | Identity | id, role, user_tier | Backend | Auth service |

## 3) Key Relationships
- **Trading Account → Fees**: one‑to‑many (ADR‑015)
- **Trading Account → Cash Flow**: one‑to‑many
- **Trading Account → Positions**: one‑to‑many
- **Broker → Trading Account**: reference association (metadata)

## 4) Critical Business Rules
- Fees belong to **Trading Accounts**, not Brokers.
- “Other broker” is only a selection in D16 (account creation).
- Status values are canonical: active/inactive/pending/cancelled.

## 5) Data Ownership & Sources
- **SSOT DB**: `PHX_DB_SCHEMA_V2.5_FULL_DDL.sql`
- **Reference Brokers**: API-based list
- **Seed Data**: must include `is_test_data` for non‑base data

## 6) References (SSOT)
- `documentation/06-ENGINEERING/PHX_DB_SCHEMA_V2.5_FULL_DDL.sql`
- `documentation/09-GOVERNANCE/TT2_SYSTEM_STATUS_VALUES_SSOT.md`
- `documentation/90_ARCHITECTS_DOCUMENTATION/ARCHITECT_PHASE_2_FINAL_GAPS_VERDICT.md`
- `_COMMUNICATION/90_Architects_comunication/ARCHITECT_PHASE_2_DATA_MODEL_PIVOT_VERDICT.md`
