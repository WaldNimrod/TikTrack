# 🔴 הודעה: צוות 20 → צוות 60 (D16_ACCTS_VIEW - טבלאות חסרות במסד הנתונים)

**From:** Team 20 (Backend Implementation)  
**To:** Team 60 (DevOps & Platform)  
**Date:** 2026-02-03  
**Session:** SESSION_01 - Phase 1.6  
**Subject:** D16_TABLES_MISSING | Status: 🔴 **CRITICAL - BLOCKING**  
**Priority:** 🔴 **CRITICAL - DATABASE SETUP REQUIRED**

---

## 🔴 Executive Summary

**Issue:** Database tables for D16_ACCTS_VIEW endpoints are missing  
**Impact:** All D16_ACCTS_VIEW endpoints return 500 Internal Server Error  
**Action Required:** Create missing tables in database

---

## 🔍 Issue Analysis

### **Error:**
```
sqlalchemy.exc.ProgrammingError: relation "user_data.trading_accounts" does not exist
```

### **Missing Tables:**
1. ❌ `user_data.trading_accounts` - Trading accounts table
2. ❌ `user_data.cash_flows` - Cash flows table  
3. ❌ `user_data.trades` - Trades table (for positions calculation)
4. ❌ `market_data.tickers` - Tickers table (for positions)
5. ❌ `market_data.ticker_prices` - Ticker prices table (for positions)

---

## 📋 Required Database Actions

### **1. Create Trading Accounts Table** 🔴 **CRITICAL**

**Table:** `user_data.trading_accounts`  
**DDL Location:** `documentation/06-ENGINEERING/PHX_DB_SCHEMA_V2.5_FULL_DDL.sql` (lines 593-641)

**SQL Script:**
```sql
CREATE TABLE user_data.trading_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_data.users(id) ON DELETE CASCADE,
    
    -- Account Details
    account_name VARCHAR(100) NOT NULL,
    broker VARCHAR(100),
    account_number VARCHAR(50),
    
    -- External Integration
    external_account_id VARCHAR(100),
    last_sync_at TIMESTAMPTZ,
    
    -- Balances
    initial_balance NUMERIC(20, 6) NOT NULL,
    cash_balance NUMERIC(20, 6) NOT NULL DEFAULT 0,
    total_deposits NUMERIC(20, 6) NOT NULL DEFAULT 0,
    total_withdrawals NUMERIC(20, 6) NOT NULL DEFAULT 0,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    
    -- Status
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- Audit
    created_by UUID NOT NULL REFERENCES user_data.users(id),
    updated_by UUID NOT NULL REFERENCES user_data.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    version INTEGER NOT NULL DEFAULT 1,
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::JSONB,
    
    CONSTRAINT trading_accounts_unique_name 
        UNIQUE (user_id, account_name) WHERE deleted_at IS NULL
);

CREATE INDEX idx_trading_accounts_user 
    ON user_data.trading_accounts(user_id, created_at DESC) 
    WHERE deleted_at IS NULL;
    
CREATE INDEX idx_trading_accounts_active 
    ON user_data.trading_accounts(is_active) 
    WHERE is_active = TRUE AND deleted_at IS NULL;
```

---

### **2. Create Cash Flows Table** 🔴 **CRITICAL**

**Table:** `user_data.cash_flows`  
**DDL Location:** `documentation/06-ENGINEERING/PHX_DB_SCHEMA_V2.5_FULL_DDL.sql` (lines 974-1018)

**SQL Script:**
```sql
CREATE TABLE user_data.cash_flows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_data.users(id) ON DELETE CASCADE,
    trading_account_id UUID NOT NULL REFERENCES user_data.trading_accounts(id) ON DELETE CASCADE,
    
    -- Type
    flow_type VARCHAR(20) NOT NULL CHECK (flow_type IN ('DEPOSIT', 'WITHDRAWAL', 'DIVIDEND', 'INTEREST', 'FEE', 'OTHER')),
    
    -- Amount
    amount NUMERIC(20, 6) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    
    -- Details
    description TEXT,
    transaction_date DATE NOT NULL,
    
    -- External
    external_reference VARCHAR(100),
    
    -- Audit
    created_by UUID NOT NULL REFERENCES user_data.users(id),
    updated_by UUID NOT NULL REFERENCES user_data.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::JSONB
);

CREATE INDEX idx_cash_flows_account 
    ON user_data.cash_flows(trading_account_id, transaction_date DESC) 
    WHERE deleted_at IS NULL;
    
CREATE INDEX idx_cash_flows_user 
    ON user_data.cash_flows(user_id, transaction_date DESC) 
    WHERE deleted_at IS NULL;
    
CREATE INDEX idx_cash_flows_type 
    ON user_data.cash_flows(flow_type) 
    WHERE deleted_at IS NULL;
```

---

### **3. Create Trades Table** 🔴 **CRITICAL**

**Table:** `user_data.trades`  
**DDL Location:** `documentation/06-ENGINEERING/PHX_DB_SCHEMA_V2.5_FULL_DDL.sql` (lines 811-901)

**Note:** This table is required for positions calculation. Full DDL is in the schema file.

---

### **4. Create Tickers Table** 🔴 **CRITICAL**

**Table:** `market_data.tickers`  
**DDL Location:** `documentation/06-ENGINEERING/PHX_DB_SCHEMA_V2.5_FULL_DDL.sql` (lines 143-183)

**Note:** This table is required for positions (symbol lookup). Full DDL is in the schema file.

---

### **5. Create Ticker Prices Table** 🔴 **CRITICAL**

**Table:** `market_data.ticker_prices`  
**DDL Location:** `documentation/06-ENGINEERING/PHX_DB_SCHEMA_V2.5_FULL_DDL.sql` (lines 224-267)

**Note:** This table is partitioned by month. Full DDL is in the schema file.

---

## 📋 Recommended Approach

### **Option 1: Execute Full DDL Script** ✅ **RECOMMENDED**

Execute the complete DDL script:
```bash
psql -d tiktrack -f documentation/06-ENGINEERING/PHX_DB_SCHEMA_V2.5_FULL_DDL.sql
```

**Advantages:**
- ✅ Creates all tables at once
- ✅ Includes all indexes and constraints
- ✅ Ensures consistency

---

### **Option 2: Execute Individual Table Scripts** ⚠️ **IF NEEDED**

If you need to create tables individually, extract the relevant sections from the DDL file.

---

## ✅ Verification Steps

After creating the tables, verify:

1. ✅ **Table Existence:**
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'user_data' 
   AND table_name IN ('trading_accounts', 'cash_flows', 'trades');
   ```

2. ✅ **Table Structure:**
   ```sql
   \d user_data.trading_accounts
   \d user_data.cash_flows
   \d user_data.trades
   ```

3. ✅ **Indexes:**
   ```sql
   SELECT indexname FROM pg_indexes 
   WHERE schemaname = 'user_data' 
   AND tablename IN ('trading_accounts', 'cash_flows', 'trades');
   ```

---

## 🔗 References

- **Full DDL:** `documentation/06-ENGINEERING/PHX_DB_SCHEMA_V2.5_FULL_DDL.sql`
- **Trading Accounts:** Lines 593-641
- **Cash Flows:** Lines 974-1018
- **Trades:** Lines 811-901
- **Tickers:** Lines 143-183
- **Ticker Prices:** Lines 224-267

---

## ⚠️ Impact

**Current Status:**
- ❌ `GET /api/v1/trading_accounts` → 500 Internal Server Error
- ❌ `GET /api/v1/cash_flows` → 500 Internal Server Error
- ❌ `GET /api/v1/positions` → 500 Internal Server Error

**After Fix:**
- ✅ All endpoints will work correctly
- ✅ Frontend can load data from Backend API

---

## ✅ Status

**Action Required:** 🔴 **CRITICAL - CREATE TABLES**  
**Blocking:** ✅ **YES - BLOCKING FRONTEND INTEGRATION**  
**Priority:** 🔴 **HIGHEST**

---

**Team 20 (Backend Implementation)**  
**Date:** 2026-02-03  
**Status:** 🔴 **CRITICAL - BLOCKING DATABASE SETUP**

**log_entry | [Team 20] | D16_TABLES_MISSING | CRITICAL | BLOCKING | 2026-02-03**
