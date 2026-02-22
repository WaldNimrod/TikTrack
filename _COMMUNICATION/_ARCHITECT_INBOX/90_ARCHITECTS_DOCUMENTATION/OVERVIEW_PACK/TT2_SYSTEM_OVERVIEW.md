# TT2_SYSTEM_OVERVIEW
**project_domain:** TIKTRACK

**id:** `TT2_SYSTEM_OVERVIEW`  
**owner:** Team 10 (The Gateway)  
**status:** ACTIVE  
**last_updated:** 2026-02-14  

---

## 1) Purpose
TikTrack Phoenix (TT2) is a governance-first financial platform with hybrid UI (HTML + React), unified runtime (UAI), strict API boundary (PDSC/sharedServices), and auditable delivery gates (A/B/C).  
This overview reflects current implemented code and locked SSOT decisions.

## 2) Implemented Scope (Current)
### Phase 2 / Batch 1+2 (+2.5 hardening)
- Auth model A/B/C/D (Open/Shared/Auth-only/Admin-only)
- D16 Trading Accounts
- D18 Brokers Fees (account-based fees model)
- D21 Cash Flows + currency conversions
- Unified header + header loader + auth icon rules
- ADR-017/018 hardening: 1.0.0 alignment, redirect enforcement, "Other broker" constraints

### Active Stage-1 (External Data + User Tickers)
- External providers: Yahoo + Alpha only
- Cache-first + fallback pipeline
- Smart history fill (`gap_fill` / `force_reload`)
- User Tickers page (`/user_tickers.html`) with add existing / add new / remove

## 3) Core System Principles
- **Account-centric financial model:** fees and flows anchored to trading accounts.
- **No UI blocking on provider failures:** stale-safe behavior with freshness indicators.
- **Provider-agnostic mapping:** per-ticker `provider_mapping_data` for cross-provider symbols.
- **Evidence-based governance:** no closure without gate evidence.

## 4) Auth & Access Summary
- **A Open:** `/login`, `/register`, `/reset-password` (header hidden)
- **B Shared:** `/` (guest/logged-in containers in one page)
- **C Auth-only:** protected pages redirect guest to `/`
- **D Admin-only:** `/admin/design-system` and admin actions (JWT role)

## 5) Current Constraints
- System version locked to `1.0.0` (no 2.x in active flow)
- Rich text must use locked class set + FE/BE sanitization
- No direct API calls from UI; use sharedServices boundary
- No external market-data call before local cache check

## 6) References (SSOT)
- `documentation/90_ARCHITECTS_DOCUMENTATION/BATCH_2_5_COMPLETIONS_MANDATE.md`
- `documentation/90_ARCHITECTS_DOCUMENTATION/ARCHITECT_BROKER_REFERENCE_AND_OTHER_LOGIC.md`
- `_COMMUNICATION/_Architects_Decisions/ARCHITECT_VERDICT_MARKET_DATA_STAGE_1.md`
- `documentation/90_ARCHITECTS_DOCUMENTATION/TT2_VERSION_MATRIX_v1.0.md`
- `documentation/01-ARCHITECTURE/MARKET_DATA_PIPE_SPEC.md`
- `documentation/01-ARCHITECTURE/TT2_AUTH_GUARDS_AND_ROUTE_SSOT.md`
- `documentation/09-GOVERNANCE/TT2_TICKER_STATUS_MARKET_DATA_LOADING_SSOT.md`
- `documentation/05-PROCEDURES/TT2_QUALITY_ASSURANCE_GATE_PROTOCOL.md`
