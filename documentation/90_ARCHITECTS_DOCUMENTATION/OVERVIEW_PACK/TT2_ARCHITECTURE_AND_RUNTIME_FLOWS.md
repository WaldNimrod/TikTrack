# TT2_ARCHITECTURE_AND_RUNTIME_FLOWS

**id:** `TT2_ARCHITECTURE_AND_RUNTIME_FLOWS`  
**owner:** Team 10 + Team 90  
**status:** DRAFT  
**last_updated:** 2026-02-12  

---

## 1) System Topology (High‑Level)
- **UI Layer**: HTML pages + React (Hybrid)
- **UAI**: Unified App Init orchestrator
- **PDSC**: Shared API client (Shared_Services)
- **Backend**: FastAPI
- **DB**: Postgres schema (SSOT DDL)

## 2) Runtime Flow (UI → UAI → PDSC → DB)
1. HTML loads config
2. UAI stages: DOM → Bridge → Data → Render → Ready
3. sharedServices.js (PDSC client) fetches API + transforms payload
4. UI tables render (HTML or React Tables via TablesReactStage)

## 3) Core Stages
- **DOM Stage**: loads base structure
- **Bridge Stage**: filters + header orchestration
- **Data Stage**: DataLoaders (Shared_Services)
- **Render Stage**: TableInit / React tables
- **Ready Stage**: UI stable

## 4) Integration Contracts
- **UAI Config Contract**
- **PDSC Boundary Contract**
- **EFR Transformers Lock**
- **CSS Load Verification**

## 5) Failure Modes & Recovery
- Header loader failures → UI navigation broken
- Auth redirect drift → guard issues
- Token leakage → maskedLog policy

## 6) References (SSOT)
- `documentation/01-ARCHITECTURE/TT2_UAI_CONFIG_CONTRACT.md`
- `documentation/01-ARCHITECTURE/TT2_PDSC_BOUNDARY_CONTRACT.md`
- `documentation/01-ARCHITECTURE/TT2_EFR_HARDENED_TRANSFORMERS_LOCK.md`
- `documentation/01-ARCHITECTURE/TT2_CSS_LOAD_VERIFICATION_SPEC.md`
