# TT2_DOMAIN_MODEL_AND_ENTITIES

**id:** `TT2_DOMAIN_MODEL_AND_ENTITIES`  
**owner:** Team 20 (Backend) + Team 30 (Frontend)  
**status:** ACTIVE  
**last_updated:** 2026-02-14  

---

## 1) Domain Vocabulary (Canonical Terms)
- **User**: authenticated identity (JWT role/tier)
- **Trading Account**: the primary financial container
- **Broker**: metadata tied to a trading account (reference list)
- **Fees**: commissions linked to a trading account (one-to-many)
- **Cash Flow**: deposits/withdrawals per account
- **Currency Conversion**: FX entries per account
- **Ticker**: system tradable asset metadata
- **User Ticker**: user-to-ticker junction ("My Tickers")

## 2) Entity Map (High‑Level)
| Entity | Purpose | Key Fields | Owner | Source |
|---|---|---|---|---|
| Trading Account | Base financial entity | id, broker, status | Backend | DB/SSOT |
| Broker | Reference list | id, display_name, is_supported, default_fees | Backend | API / reference |
| Fees | Per account commissions | id, trading_account_id, commission_type, commission_value | Backend | DB |
| Cash Flow | Movement of funds | id, trading_account_id, amount | Backend | DB |
| Conversion | FX conversion | id, trading_account_id, rate | Backend | DB |
| Ticker | Market asset metadata | id, symbol, ticker_type, status, metadata | Backend | DB |
| User Ticker | User-owned ticker list | user_id, ticker_id, deleted_at | Backend | DB |
| User | Identity | id, role, user_tier | Backend | Auth service |

## 3) Key Relationships
- **Trading Account → Fees**: one‑to‑many (ADR‑015)
- **Trading Account → Cash Flow**: one‑to‑many
- **Trading Account → Positions**: one‑to‑many
- **Broker → Trading Account**: reference association (metadata)
- **User → UserTicker → Ticker**: many-to-many via junction table
- **Ticker → Price tables**: one-to-many daily/EOD and intraday rows

## 4) Critical Business Rules
- Fees belong to **Trading Accounts**, not Brokers.
- “Other broker” is only a selection in D16 (account creation).
- Status values are canonical: active/inactive/pending/cancelled.
- **ADR‑017/ADR‑014:** Full refactor to account‑based fees (`trading_account_fees`) is mandatory.
- **ADR‑018:** Selecting “Other” sets `is_supported=false` and blocks API/import; UI shows contact notice.
- **ADR‑018:** Selecting a broker injects default fees into the form.
- New ticker from "My Tickers" is created as `status=pending`.
- Crypto ticker provider calls must use `provider_mapping_data` (Yahoo `BASE-QUOTE`; Alpha `symbol+market`).

## 5) Data Ownership & Sources
- **SSOT DB**: `PHX_DB_SCHEMA_V2.5_FULL_DDL.sql`
- **Reference Brokers**: API-based list
- **User Tickers API**: `/api/v1/me/tickers` (GET/POST/DELETE)
- **Seed Data**: must include `is_test_data` for non-base data

## 6) References (SSOT)
- `documentation/06-ENGINEERING/PHX_DB_SCHEMA_V2.5_FULL_DDL.sql`
- `documentation/09-GOVERNANCE/TT2_SYSTEM_STATUS_VALUES_SSOT.md`
- `documentation/09-GOVERNANCE/TT2_TICKER_STATUS_MARKET_DATA_LOADING_SSOT.md`
- `documentation/01-ARCHITECTURE/LOGIC/WP_20_09_FIELD_MAP_TICKERS_MAPPINGS.md`
- `documentation/01-ARCHITECTURE/MARKET_DATA_PIPE_SPEC.md`
- `documentation/90_ARCHITECTS_DOCUMENTATION/BATCH_2_5_COMPLETIONS_MANDATE.md`
- `documentation/90_ARCHITECTS_DOCUMENTATION/ARCHITECT_BROKER_REFERENCE_AND_OTHER_LOGIC.md`
