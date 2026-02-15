# TT2_ARCHITECTURE_AND_RUNTIME_FLOWS

**id:** `TT2_ARCHITECTURE_AND_RUNTIME_FLOWS`  
**owner:** Team 10 + Team 90  
**status:** ACTIVE  
**last_updated:** 2026-02-14  

---

## 1) System Topology (High-Level)
- **UI Layer:** Hybrid HTML + React
- **UAI:** UnifiedAppInit with staged boot flow
- **PDSC client:** `sharedServices.js` boundary for API access
- **Backend:** FastAPI routers/services
- **DB:** PostgreSQL (market_data / user_data / identity schemas)

## 2) Runtime Flow (UI -> UAI -> PDSC -> DB)
1. HTML loads config
2. UAI stages: DOM → Bridge → Data → Render → Ready
3. `sharedServices.js` performs API calls + transformers
4. TableInit / page modules render view
5. Header/filters/status widgets sync through bridge and handlers

## 3) Core Stages
- **DOM Stage:** base shell, header loader hooks
- **Bridge Stage:** filters/events and shared bridge coordination
- **Data Stage:** page data loaders via `sharedServices`
- **Render Stage:** table/page render init
- **Ready Stage:** final interactive readiness

## 4) Integration Contracts
- UAI config contract
- PDSC boundary contract
- EFR transformers lock
- CSS load verification
- Template contract v1.1 (single shell for non-auth and auth layout via config)

## 5) Failure Modes & Recovery
- Header loader failure -> broken global navigation
- Guard mismatch -> wrong redirect/access behavior
- Provider errors/429 -> stale-safe return path
- Token leakage risk -> masked logging policy

## 6) References (SSOT)
- `documentation/01-ARCHITECTURE/TT2_UAI_CONFIG_CONTRACT.md`
- `documentation/01-ARCHITECTURE/TT2_PDSC_BOUNDARY_CONTRACT.md`
- `documentation/01-ARCHITECTURE/TT2_EFR_HARDENED_TRANSFORMERS_LOCK.md`
- `documentation/01-ARCHITECTURE/TT2_CSS_LOAD_VERIFICATION_SPEC.md`
- `documentation/90_ARCHITECTS_DOCUMENTATION/TT2_PAGE_TEMPLATE_CONTRACT_v1.1.md`
- `documentation/01-ARCHITECTURE/MARKET_DATA_PIPE_SPEC.md`
- `ui/public/`
- `ui/src/`
- `ui/src/components/core/stages/DOMStage.js`
- `ui/src/components/core/stages/BridgeStage.js`
- `ui/src/components/core/stages/DataStage.js`
- `ui/src/components/core/stages/RenderStage.js`
- `ui/src/components/core/stages/ReadyStage.js`
- `ui/scripts/generate-pages.js`
- `ui/scripts/validate-pages.js`
