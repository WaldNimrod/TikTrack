# Team 20 → Team 10: Phase 2 Mapping Submission (Debt Closure) - CORRECTED

**id:** `TEAM_20_PHASE_2_MAPPING_SUBMISSION`  
**from:** Team 20 (Backend Implementation)  
**to:** Team 10 (The Gateway)  
**date:** 2026-02-09  
**context:** ADR-011 — Debt Closure — Pre-coding Mapping  
**deadline:** 12 hours from mandate  
**status:** ✅ **SUBMITTED - COMPLETE - SSOT UPDATED**  
**version:** v3.0 (Scope: Phase 2 Only - D16, D18, D21 - SSOT Clean)

---

## 🎯 Executive Summary

קובץ מיפוי **סגור ל-Phase 2 בלבד** עבור Team 20 (Backend) לפי דרישות מפת הבעלות (ADR-011):
1. ✅ רשימת Endpoints סגורה ל-Phase 2 (D16, D18, D21) + חוזה/SSOT; קריטריון "API פעיל"
2. ✅ רשימת קבצי config לפורטים 8080/8082
3. ✅ רשימת טבלאות ועמודות — Precision 20,6 (NUMERIC(20,6)) **Phase 2 בלבד** + נתיב SSOT

**Scope:** Phase 2 Financial Core - D16 (Trading Accounts), D18 (Brokers Fees), D21 (Cash Flows)

---

## 1. רשימת Endpoints סגורה - Phase 2 בלבד

### 1.1 קריטריון "API פעיל"

**הגדרה:** Endpoint נחשב "פעיל" אם:
- ✅ קיים ב-router (`api/routers/*.py`)
- ✅ מחובר ל-`api/main.py` (router registration)
- ✅ יש לו service layer (`api/services/*.py`)
- ✅ יש לו schema/response model (`api/schemas/*.py`)
- ✅ עבר בדיקות Runtime (Team 50) או E2E (Team 50)

---

### 1.2 רשימת Endpoints - Phase 2 (D16, D18, D21)

#### **D16 - Trading Accounts (`/api/v1/trading_accounts`)**

| Method | Path | Description | Status | SSOT Contract |
|--------|------|-------------|--------|--------------|
| GET | `/api/v1/trading_accounts` | List trading accounts | ✅ Active | `documentation/07-CONTRACTS/OPENAPI_SPEC_V2.5.2.yaml` |
| GET | `/api/v1/trading_accounts/summary` | Get summary statistics | ✅ Active | `documentation/07-CONTRACTS/OPENAPI_SPEC_V2.5.2.yaml` |
| GET | `/api/v1/trading_accounts/{id}` | Get single account | ✅ Active | `documentation/07-CONTRACTS/OPENAPI_SPEC_V2.5.2.yaml` |
| POST | `/api/v1/trading_accounts` | Create account | ✅ Active | `documentation/07-CONTRACTS/OPENAPI_SPEC_V2.5.2.yaml` |
| PUT | `/api/v1/trading_accounts/{id}` | Update account | ✅ Active | `documentation/07-CONTRACTS/OPENAPI_SPEC_V2.5.2.yaml` |
| DELETE | `/api/v1/trading_accounts/{id}` | Delete account (soft) | ✅ Active | `documentation/07-CONTRACTS/OPENAPI_SPEC_V2.5.2.yaml` |

**Router:** `api/routers/trading_accounts.py`  
**Service:** `api/services/trading_accounts.py`  
**Schemas:** `api/schemas/trading_accounts.py`

---

#### **D18 - Brokers Fees (`/api/v1/brokers_fees`)**

| Method | Path | Description | Status | SSOT Contract |
|--------|------|-------------|--------|--------------|
| GET | `/api/v1/brokers_fees` | List broker fees | ✅ Active | `documentation/07-CONTRACTS/OPENAPI_SPEC_V2.5.2.yaml` |
| GET | `/api/v1/brokers_fees/summary` | Get summary statistics | ✅ Active | `documentation/07-CONTRACTS/OPENAPI_SPEC_V2.5.2.yaml` |
| GET | `/api/v1/brokers_fees/{id}` | Get single broker fee | ✅ Active | `documentation/07-CONTRACTS/OPENAPI_SPEC_V2.5.2.yaml` |
| POST | `/api/v1/brokers_fees` | Create broker fee | ✅ Active | `documentation/07-CONTRACTS/OPENAPI_SPEC_V2.5.2.yaml` |
| PUT | `/api/v1/brokers_fees/{id}` | Update broker fee | ✅ Active | `documentation/07-CONTRACTS/OPENAPI_SPEC_V2.5.2.yaml` |
| DELETE | `/api/v1/brokers_fees/{id}` | Delete broker fee (soft) | ✅ Active | `documentation/07-CONTRACTS/OPENAPI_SPEC_V2.5.2.yaml` |

**Router:** `api/routers/brokers_fees.py`  
**Service:** `api/services/brokers_fees_service.py`  
**Schemas:** `api/schemas/brokers_fees.py`

---

#### **D21 - Cash Flows (`/api/v1/cash_flows`)**

| Method | Path | Description | Status | SSOT Contract |
|--------|------|-------------|--------|--------------|
| GET | `/api/v1/cash_flows` | List cash flows | ✅ Active | `documentation/07-CONTRACTS/OPENAPI_SPEC_V2.5.2.yaml` |
| GET | `/api/v1/cash_flows/summary` | Get summary statistics | ✅ Active | `documentation/07-CONTRACTS/OPENAPI_SPEC_V2.5.2.yaml` |
| GET | `/api/v1/cash_flows/currency_conversions` | Get currency conversions | ✅ Active | `documentation/07-CONTRACTS/OPENAPI_SPEC_V2.5.2.yaml` |
| GET | `/api/v1/cash_flows/{id}` | Get single cash flow | ✅ Active | `documentation/07-CONTRACTS/OPENAPI_SPEC_V2.5.2.yaml` |
| POST | `/api/v1/cash_flows` | Create cash flow | ✅ Active | `documentation/07-CONTRACTS/OPENAPI_SPEC_V2.5.2.yaml` |
| PUT | `/api/v1/cash_flows/{id}` | Update cash flow | ✅ Active | `documentation/07-CONTRACTS/OPENAPI_SPEC_V2.5.2.yaml` |
| DELETE | `/api/v1/cash_flows/{id}` | Delete cash flow (soft) | ✅ Active | `documentation/07-CONTRACTS/OPENAPI_SPEC_V2.5.2.yaml` |

**Router:** `api/routers/cash_flows.py`  
**Service:** `api/services/cash_flows.py`  
**Schemas:** `api/schemas/cash_flows.py`

---

### 1.3 SSOT Contract Reference

**OpenAPI Specification (SSOT):**
- `documentation/07-CONTRACTS/OPENAPI_SPEC_V2.5.2.yaml` — Master API contract (SSOT)

**PDSC Boundary Contract (SSOT):**
- `documentation/01-ARCHITECTURE/TT2_PDSC_BOUNDARY_CONTRACT.md` — Server-Client contract (SSOT)

**סה"כ Endpoints Phase 2:** 19 endpoints (D16: 6, D18: 6, D21: 7)

---

## 2. רשימת קבצי Config לפורטים 8080/8082

### 2.1 Port 8080 (Frontend)

| File | Path | Purpose | Port Config |
|------|------|---------|-------------|
| Vite Config | `ui/vite.config.js` | Frontend dev server | `port: 8080` (line 211) |
| Proxy Config | `ui/vite.config.js` | API proxy to backend | `target: 'http://localhost:8082'` (line 214) |

**קובץ ראשי:** `ui/vite.config.js`
- **שורה 211:** `port: 8080` — Frontend V2 port (per Master Blueprint)
- **שורה 214:** `target: 'http://localhost:8082'` — Backend API proxy

---

### 2.2 Port 8082 (Backend)

| File | Path | Purpose | Port Config |
|------|------|---------|-------------|
| Main Entry | `api/main.py` | FastAPI app entry point | `port=8082` (line 225) |
| Startup Script | `scripts/start-backend.sh` | Backend startup script | `--port 8082` (line 74) |

**קבצים ראשיים:**
1. **`api/main.py`** (שורה 225):
   ```python
   uvicorn.run(app, host="0.0.0.0", port=8082)
   ```

2. **`scripts/start-backend.sh`** (שורה 74):
   ```bash
   uvicorn api.main:app --reload --host 0.0.0.0 --port 8082
   ```

---

### 2.3 CORS Configuration

**קובץ:** `api/main.py` (שורות 52-62)

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"],  # Frontend port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**הגדרה:** CORS מאפשר גישה מ-`http://localhost:8080` (Frontend) ל-`http://localhost:8082` (Backend)

---

## 3. רשימת טבלאות ועמודות — Precision 20,6 (NUMERIC(20,6)) - Phase 2 בלבד

### 3.1 SSOT Reference

**מסמך SSOT:**
- `documentation/06-ENGINEERING/PHX_DB_SCHEMA_V2.5_FULL_DDL.sql` — Full DDL v2.5 (SSOT)

---

### 3.2 טבלאות Phase 2 עם NUMERIC(20,6) — רשימה ממוספרת

#### **1. D16 - `user_data.trading_accounts`**

| # | Column | Type | Precision | SSOT Line | ORM Model |
|---|--------|------|-----------|-----------|-----------|
| 1 | `initial_balance` | NUMERIC(20,6) | 20,6 | 609 | `api/models/trading_accounts.py` |
| 2 | `cash_balance` | NUMERIC(20,6) | 20,6 | 610 | `api/models/trading_accounts.py` |
| 3 | `total_deposits` | NUMERIC(20,6) | 20,6 | 611 | `api/models/trading_accounts.py` |
| 4 | `total_withdrawals` | NUMERIC(20,6) | 20,6 | 612 | `api/models/trading_accounts.py` |

**SSOT:** `documentation/06-ENGINEERING/PHX_DB_SCHEMA_V2.5_FULL_DDL.sql` (שורות 609-612)  
**ORM:** `api/models/trading_accounts.py`

---

#### **2. D21 - `user_data.cash_flows`**

| # | Column | Type | Precision | SSOT Line | ORM Model |
|---|--------|------|-----------|-----------|-----------|
| 5 | `amount` | NUMERIC(20,6) | 20,6 | 985 | `api/models/cash_flows.py` |

**SSOT:** `documentation/06-ENGINEERING/PHX_DB_SCHEMA_V2.5_FULL_DDL.sql` (שורה 985)

---

#### **3. D18 - `user_data.brokers_fees`**

| # | Column | Type | Precision | SSOT Line | ORM Model |
|---|--------|------|-----------|-----------|-----------|
| 6 | `minimum` | NUMERIC(20,6) | 20,6 | 1031 | `api/models/brokers_fees.py` (שורה 74) |

**SSOT:** `documentation/06-ENGINEERING/PHX_DB_SCHEMA_V2.5_FULL_DDL.sql` (שורה 1031)

---

### 3.3 סיכום NUMERIC(20,6) Fields - Phase 2

**סה"כ:** 6 עמודות עם NUMERIC(20,6) (Phase 2 בלבד)

**פירוט לפי טבלה:**
- `trading_accounts` (D16): 4 עמודות
- `cash_flows` (D21): 1 עמודה
- `brokers_fees` (D18): 1 עמודה

---

## ✅ Verification Checklist

- [x] ✅ כל ה-Endpoints Phase 2 (D16, D18, D21) מפורטים עם method, path, status, SSOT contract
- [x] ✅ כל קבצי ה-config לפורטים 8080/8082 מפורטים
- [x] ✅ כל הטבלאות והעמודות Phase 2 עם NUMERIC(20,6) מפורטות עם SSOT reference מדויק (שורות)
- [x] ✅ קריטריון "API פעיל" מוגדר
- [x] ✅ כל ה-Contracts/SSOT references מפורטים (לא _COMMUNICATION)
- [x] ✅ Scope סגור ל-Phase 2 בלבד (D16, D18, D21)
- [x] ✅ כל המידע מרוכז בקובץ זה בלבד (לא מפוזר בדוחות אחרים)

---

## 📋 SSOT Files Referenced

### **SSOT Documents (רשמיים בלבד):**
- `documentation/06-ENGINEERING/PHX_DB_SCHEMA_V2.5_FULL_DDL.sql` — DDL Schema v2.5 (SSOT)
- `documentation/07-CONTRACTS/OPENAPI_SPEC_V2.5.2.yaml` — OpenAPI Contract (SSOT)
- `documentation/01-ARCHITECTURE/TT2_PDSC_BOUNDARY_CONTRACT.md` — PDSC Contract (SSOT)

### **Config Files:**
- `ui/vite.config.js` — Frontend port 8080
- `api/main.py` — Backend port 8082
- `scripts/start-backend.sh` — Backend startup script

---

## 📊 Summary

**Phase 2 Endpoints:** 19 endpoints (D16: 6, D18: 6, D21: 7)  
**Phase 2 NUMERIC(20,6) Fields:** 6 עמודות (D16: 4, D18: 1, D21: 1)  
**SSOT Contracts:** 3 מסמכים רשמיים  
**Config Files:** 3 קבצים (8080, 8082, CORS)

---

## ✅ FINAL SUBMISSION (Single Document)

**קובץ הגשה יחיד:** `_COMMUNICATION/team_20/TEAM_20_PHASE_2_MAPPING_SUBMISSION.md`

**מקור אמת יחיד (SSOT):**
- **DDL Schema:** `documentation/06-ENGINEERING/PHX_DB_SCHEMA_V2.5_FULL_DDL.sql` — כולל `user_data.brokers_fees` (שורה 1031)
- **OpenAPI Contract:** `documentation/07-CONTRACTS/OPENAPI_SPEC_V2.5.2.yaml`
- **PDSC Contract:** `documentation/01-ARCHITECTURE/TT2_PDSC_BOUNDARY_CONTRACT.md`

**אימות SSOT DDL:**
- ✅ `user_data.trading_accounts` — שורות 609-612 (4 עמודות NUMERIC(20,6))
- ✅ `user_data.cash_flows` — שורה 985 (1 עמודה NUMERIC(20,6))
- ✅ `user_data.brokers_fees` — שורה 1031 (1 עמודה NUMERIC(20,6))

**אין הפניות ל:**
- ❌ ORM בלבד (ללא SSOT)
- ❌ דוחות אחרים ב-`_COMMUNICATION`
- ❌ מסמכי Addendum זמניים

**כל המידע מרוכז בקובץ זה בלבד.**

---

**Prepared by:** Team 20 (Backend Implementation)  
**Date:** 2026-02-09  
**Status:** ✅ **FINAL SUBMISSION - SSOT COMPLETE - READY FOR REVIEW**  
**Version:** v3.0 (Scope: Phase 2 Only - SSOT Clean - Single Document)
