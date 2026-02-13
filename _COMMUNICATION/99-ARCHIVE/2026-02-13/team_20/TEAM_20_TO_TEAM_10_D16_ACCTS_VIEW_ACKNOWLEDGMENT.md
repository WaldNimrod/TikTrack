# ✅ הודעה: צוות 20 → צוות 10 (D16 ACCTS VIEW Backend - Acknowledgment)

**From:** Team 20 (Backend Implementation)  
**To:** Team 10 (The Gateway)  
**Date:** 2026-02-03  
**Session:** SESSION_01 - Phase 1.6  
**Subject:** D16_ACCTS_VIEW_BACKEND_ACKNOWLEDGMENT | Status: ✅ **ACKNOWLEDGED**  
**Priority:** 🔴 **CRITICAL - WORK IN PROGRESS**

---

## ✅ Executive Summary

**Task:** Backend API Implementation for D16_ACCTS_VIEW ✅ **ACKNOWLEDGED**

Team 20 acknowledges receipt of the task and confirms understanding of requirements. Work has started immediately.

---

## 📋 Task Understanding

### **3 API Endpoints Required:**
1. ✅ `GET /api/v1/trading_accounts` - Trading accounts list with calculated fields
2. ✅ `GET /api/v1/cash_flows` - Cash flows list with filters and summary
3. ✅ `GET /api/v1/positions` - Positions derived from trades

### **Components to Create:**
- ✅ Models (3 files)
- ✅ Schemas (3 files)
- ✅ Services (3 files)
- ✅ Routers (3 files)
- ✅ Update main.py

---

## 📅 Timeline Commitment

| שלב | תאריך יעד | סטטוס |
|:---|:---|:---|
| שלב 1: Models | 2026-02-04 | ⏳ **IN PROGRESS** |
| שלב 2: Schemas | 2026-02-04 | ⏳ **PENDING** |
| שלב 3: Services | 2026-02-05 | ⏳ **PENDING** |
| שלב 4: Routers | 2026-02-05 | ⏳ **PENDING** |
| שלב 5: OpenAPI Spec | 2026-02-06 | ⏳ **PENDING** |

---

## ✅ Compliance Confirmation

### **Naming Convention:**
- ✅ Plural names only: `trading_accounts`, `cash_flows`, `positions`
- ✅ External IDs: ULID strings only (`VARCHAR(26)`)
- ✅ Internal IDs: BIGINT (not exposed in API)

### **Field Mapping:**
- ✅ Backend: snake_case (`account_name`, `trading_account_id`)
- ✅ Frontend: camelCase (handled by `transformers.js`)

### **Precision:**
- ✅ Financial amounts: `NUMERIC(20, 8)` in database
- ✅ API Response: Decimal strings or numbers (per OpenAPI spec)

### **Authentication & Authorization:**
- ✅ JWT token required for all endpoints
- ✅ User isolation: only current user's data (`user_id` from JWT token)

### **Error Handling:**
- ✅ Error codes: using `ErrorCodes` from `api/utils/exceptions.py`
- ✅ Error format: `{"detail": "...", "error_code": "..."}`

---

## 🔍 Key Technical Points

### **1. Trading Accounts API**
- **Calculated Fields:**
  - `positions_count`: COUNT of open trades
  - `total_pl`: SUM of unrealized_pl from trades
  - `account_value`: cash_balance + SUM(unrealized_pl)
  - `holdings_value`: SUM(unrealized_pl)

### **2. Cash Flows API**
- **Filters:** trading_account_id, date_from, date_to, flow_type
- **Summary:** total_deposits, total_withdrawals, net_flow
- **Metadata:** subtype and status from JSONB metadata field

### **3. Positions API**
- **Derived from:** `trades` table (WHERE status != 'CLOSED')
- **Aggregation:** GROUP BY ticker_id, trading_account_id
- **JOIN:** `market_data.tickers` for current_price and symbol
- **Calculated Fields:** daily_change, unrealized_pl_percent, percent_of_account

---

## 📋 Implementation Plan

### **Phase 1: Models (2026-02-04)**
1. ✅ `api/models/trading_accounts.py` - TradingAccount model
2. ✅ `api/models/cash_flows.py` - CashFlow model
3. ✅ `api/models/positions.py` - Position view/query model

### **Phase 2: Schemas (2026-02-04)**
1. ✅ `api/schemas/trading_accounts.py` - Response schemas
2. ✅ `api/schemas/cash_flows.py` - Response schemas with summary
3. ✅ `api/schemas/positions.py` - Response schemas

### **Phase 3: Services (2026-02-05)**
1. ✅ `api/services/trading_accounts.py` - Business logic + calculations
2. ✅ `api/services/cash_flows.py` - Business logic + summary calculation
3. ✅ `api/services/positions.py` - Business logic + aggregation

### **Phase 4: Routers (2026-02-05)**
1. ✅ `api/routers/trading_accounts.py` - GET endpoint
2. ✅ `api/routers/cash_flows.py` - GET + GET /summary endpoints
3. ✅ `api/routers/positions.py` - GET endpoint
4. ✅ Update `api/main.py` - Register routers

### **Phase 5: OpenAPI Spec (2026-02-06)**
1. ✅ Update `OPENAPI_SPEC_V2_FINAL.yaml` - Add full schemas

---

## ⚠️ Critical Requirements

1. **User Isolation:** All queries must filter by `user_id` from JWT token
2. **Calculated Fields:** Complex calculations required (positions_count, total_pl, etc.)
3. **JOINs:** Multiple JOINs required (trades, tickers, trading_accounts)
4. **Aggregation:** Positions require GROUP BY and aggregation functions
5. **Metadata:** Cash flows require JSONB metadata extraction

---

## 🔗 References

- **DB Schema:** `documentation/06-ENGINEERING/PHX_DB_SCHEMA_V2.5_FULL_DDL.sql`
- **Field Maps:** 
  - `documentation/01-ARCHITECTURE/LOGIC/WP_20_08_C_FIELD_MAP_TRADING_ACCOUNTS.md`
  - `documentation/01-ARCHITECTURE/LOGIC/WP_20_08_C_FIELD_MAP_CASH_FLOWS.md`
- **Implementation Plan:** `_COMMUNICATION/team_10/TEAM_10_D16_ACCTS_VIEW_IMPLEMENTATION_PLAN.md`

---

## ✅ Status

**Task:** ✅ **ACKNOWLEDGED**  
**Work Started:** ✅ **YES**  
**Timeline:** ✅ **COMMITTED**  
**Next Update:** After Phase 1 completion (2026-02-04)

---

**Team 20 (Backend Implementation)**  
**Date:** 2026-02-03  
**Status:** 🔴 **CRITICAL - WORK IN PROGRESS**

**log_entry | [Team 20] | D16_ACCTS_VIEW_BACKEND | ACKNOWLEDGED | WORK_STARTED | 2026-02-03**
