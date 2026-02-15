# PI-004 Investor/Partner Input Pack

**id:** `PI-004_INVESTOR_PARTNER_INPUT_PACK`  
**owner:** Team 70 (Product Intelligence)  
**status:** DRAFT  
**date:** 2026-02-15  
**scope:** Business model assumptions, GTM hypotheses, integration value map

---

## 1) Business Model Assumptions (Traceable to System)

### 1.1 Current Capabilities (Evidence-Based)
| Capability | Implementation | Evidence |
|------------|----------------|----------|
| **B2C SaaS core** | Auth, multi-user, account-centric | identity, trading_accounts |
| **Financial data layer** | Accounts, fees, cash flows, tickers | D16, D18, D21, user_tickers |
| **Market data pipeline** | Yahoo + Alpha, cache-first, multi-asset | MARKET_DATA_PIPE_SPEC, Stage-1 |
| **Governance & quality** | SSOT, gates, Team 90 audits | TT2_WORK_OPERATING_MODEL |
| **Locale** | Hebrew RTL, ILS/USD/EUR | routes.json, FOREX_MARKET_SPEC |
| **Tier structure (planned)** | user_tier in roadmap | TT2_ROADMAP_NEXT_STEPS § Mid‑Term |

### 1.2 Monetization Levers (from Roadmap)
| Lever | Stage | Evidence |
|-------|-------|----------|
| **Premium tiers** | Long-term | TT2_ROADMAP_NEXT_STEPS § Long‑Term Vision |
| **Tier-based routing** | Mid-term | user_tier hardening |
| **Automated broker ingestion** | Long-term | TT2_ROADMAP_NEXT_STEPS |
| **Free tier** | Current | No paywall in implemented scope |

**Note:** No explicit pricing or revenue model in SSOT. Assumptions only.

---

## 2) GTM Hypotheses

### 2.1 Target Segment
- **Primary:** Israeli/Hebrew-speaking traders and investors
- **Secondary:** Portfolio managers, financial analysts
- **Evidence:** RTL, Hebrew UI, ILS in FX scope, PRODUCT_POSITIONING ICP

### 2.2 Channel Hypotheses (Not in SSOT)
- Direct signup via homepage
- Possible broker partnerships (IBKR referenced as "Broker only" in Stage-1)
- No evidence of paid acquisition, affiliate, or partnership GTM in docs

### 2.3 Integration Value (for Partners)

| Partner Type | Value Proposition | System Support | Evidence |
|--------------|-------------------|----------------|----------|
| **Broker** | White-label or data sync | "Other broker" path, future broker sync | ADR-018, TT2_ROADMAP |
| **Data provider** | Embedded market data | Yahoo, Alpha; extensible pipeline | MARKET_DATA_PIPE_SPEC |
| **Institutional** | Multi-account, audit trail | Governance, evidence, JWT roles | TT2_SYSTEM_OVERVIEW, TT2_WORK_OPERATING_MODEL |

---

## 3) Integration Value Map

### 3.1 Current Integrations
| Integration | Role | Status |
|-------------|------|--------|
| Yahoo Finance | Prices primary | ✅ Stage-1 |
| Alpha Vantage | FX primary, Prices fallback | ✅ Stage-1 |
| PostgreSQL | Persistence, cache | ✅ |
| JWT Auth | Identity | ✅ |

### 3.2 Planned / Referenced
| Integration | Role | Evidence |
|-------------|------|----------|
| IBKR | Broker only (not market data in Stage-1) | MARKET_DATA_PIPE_SPEC §2.1 |
| Broker sync | Automated ingestion | TT2_ROADMAP Long‑Term |
| Additional providers | Extensible | Provider-agnostic mapping |

### 3.3 Partner Onboarding (Technical)
- **API boundary:** PDSC/sharedServices — no direct UI→API
- **Auth:** JWT, roles (user, admin, superadmin)
- **Data model:** Account-centric; clear entity boundaries
- **Evidence:** TT2_DOMAIN_MODEL, TT2_SYSTEM_OVERVIEW

---

## 4) Risks for Investor Narrative

| Risk | Mitigation | Owner |
|------|------------|-------|
| 13 header links to non-implemented pages | Scope honesty; fix or hide links | Team 30 |
| No explicit business model in SSOT | Architect to define revenue assumptions | Architect |
| Provider dependency (Yahoo rate limits) | Fallback, cooldown; documented | TT2_CURRENT_STATE_AND_GAPS |
| Crypto mapping complexity | provider_mapping_data, provider-specific | MARKET_DATA_PIPE_SPEC §2.2.1 |

---

## 5) What Investors/Partners Can Rely On

1. **Governance:** Evidence gates, SSOT, no closure without proof.
2. **Architecture:** Modular, cache-first, non-blocking UI.
3. **Locale:** Hebrew-first, RTL, multi-currency.
4. **Scope honesty:** PI-001 provides accurate implemented vs planned matrix.
5. **Roadmap:** Batch structure, Stage-1 closure, Batch 3–6 pipeline.

---

## 6) Open Questions

| # | Question | Owner |
|---|----------|-------|
| 1 | Revenue model assumptions for investor deck? | Architect |
| 2 | GTM channel priorities? | Architect |
| 3 | Partner integration roadmap (brokers, data)? | Architect |
| 4 | Target metrics (DAU, retention, ARPU)? | Architect |

---

**log_entry | TEAM_70 | PI-004_DRAFT | 2026-02-15**
