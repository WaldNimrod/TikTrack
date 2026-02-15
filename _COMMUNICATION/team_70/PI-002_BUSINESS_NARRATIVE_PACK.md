# PI-002 Business Narrative Pack

**id:** `PI-002_BUSINESS_NARRATIVE_PACK`  
**owner:** Team 70 (Product Intelligence)  
**status:** DRAFT  
**date:** 2026-02-15  
**scope:** ICP, value narrative, pains/jobs, strategic differentiation

---

## 1) Ideal Customer Profile (ICP)

### 1.1 Primary ICP
| Attribute | Description | Evidence |
|-----------|-------------|----------|
| **Role** | Traders, Investors, Portfolio Managers | PRODUCT_POSITIONING.md § קהל יעד |
| **Behavior** | Active traders managing positions and performance | USER_EXPERIENCE_DOCUMENTATION.md § Persona Trader |
| **Technical level** | Medium–high; expects professional tools | PRODUCT_POSITIONING.md § Positioning Map |
| **Locale** | Hebrew RTL; ILS, USD, EUR support | routes.json, FOREX_MARKET_SPEC scope |

### 1.2 Secondary ICP
| Attribute | Description | Evidence |
|-----------|-------------|----------|
| **Role** | Trading enthusiasts, Financial analysts | PRODUCT_POSITIONING.md |
| **Behavior** | Analysis and journaling; lower frequency | USER_EXPERIENCE_DOCUMENTATION.md § Persona Investor |

### 1.3 Source
- `_COMMUNICATION/90_Architects_comunication/EXTERNAL_AUDIT_v1/03_MARKETING/PRODUCT_POSITIONING.md`
- `_COMMUNICATION/90_Architects_comunication/EXTERNAL_AUDIT_v1/02_PRODUCT/USER_EXPERIENCE_DOCUMENTATION.md`

---

## 2) Value Proposition

### 2.1 Core Message
**"יומן חכם למסחר מקצועי"** — Smart Trading Journal for professional trading.

### 2.2 Value Pillars (from SSOT)
| Pillar | Description | Traceability |
|--------|-------------|--------------|
| **יומן חכם** | Smart journal with automated analysis | PRODUCT_POSITIONING, TT2 scope |
| **ניהול מקצועי** | Professional trade and position management | TT2_DOMAIN_MODEL, D16/D18/D21 |
| **ניתוח מתקדם** | Advanced performance analytics | Roadmap Batch 6 (TRADING_JOURNAL, STRATEGY_ANALYSIS) |
| **עיצוב מודרני** | Modern, accessible UI | USER_EXPERIENCE_DOCUMENTATION, Fluid Design |
| **אמינות** | Reliable, governed system | TT2_SYSTEM_OVERVIEW, evidence gates |

### 2.3 Differentiation (from positioning)
- **X-axis (מורכבות):** Medium–High — professional but usable
- **Y-axis (מקצועיות):** High — standards, QA, governance
- **Architecture:** Modular (LEGO), Fidelity LOD 400, strict QA

**Source:** `PRODUCT_POSITIONING.md` § Positioning Map, § יתרונות תחרותיים

---

## 3) Jobs to Be Done

| Job | User Statement | System Capability | Status |
|-----|----------------|-------------------|--------|
| Manage trading accounts | "I need to track my accounts and brokers" | D16 Trading Accounts | ✅ |
| Track fees | "I need to see commissions per account" | D18 Brokers Fees | ✅ |
| Track cash flows | "I need deposits/withdrawals and FX" | D21 Cash Flows | ✅ |
| Follow my tickers | "I need a list of symbols I care about" | User Tickers | ✅ |
| Get market data | "I need prices and freshness" | Stage-1 Yahoo+Alpha, cache-first | ✅ |
| Plan trades | "I need to plan entries/exits" | Trade Plans | ❌ UI not implemented |
| Execute and log | "I need to log executions and journal" | Executions, Journal | ❌ UI not implemented |
| Analyze performance | "I need strategy/portfolio analysis" | Strategy Analysis, Portfolio State | ❌ UI not implemented |
| Import data | "I need to import broker data" | Data Import | ❌ UI not implemented |

---

## 4) Pains Addressed

| Pain | Current Mitigation | Evidence |
|------|--------------------|----------|
| UI blocking on provider failures | Stale-safe; never block UI | MARKET_DATA_PIPE_SPEC §2.3, §3 |
| Inconsistent data | Cache-first, provider fallback | MARKET_DATA_PIPE_SPEC |
| Complex setup | Unified header, auth flows | unified-header.html, auth |
| Fragmented UX | Single design system, RTL | phoenix-base, D15_IDENTITY_STYLES |
| Governance drift | SSOT, evidence gates, Team 90 | TT2_WORK_OPERATING_MODEL |

---

## 5) Persona-to-Value Matrix

| Persona | Primary Value | Implemented | Missing |
|---------|---------------|-------------|---------|
| **Trader** | Fast access, real-time, journaling | Auth, accounts, fees, cash flows, user tickers | Executions, journal, plans |
| **Investor** | Clear info, reports, portfolio view | Auth, accounts, user tickers | Portfolio state, strategy analysis |
| **Portfolio Manager** | Multi-account, fees, import | Auth, accounts, fees, cash flows | Data import, advanced analytics |
| **Admin** | System management, tickers | Design system, system_management, tickers | User management (if in scope) |

**Source:** USER_EXPERIENCE_DOCUMENTATION.md § User Personas; PI-001 for implementation status.

---

## 6) Strategic Context (Legacy → Phoenix)

- **Legacy (POC):** 26 pages, Strangler migration, code bloat addressed
- **Phoenix:** Governance-first, hybrid HTML+React, PDSC boundary, audit gates
- **Roadmap v2.1:** Batch 3 (Essential Data) → Batch 4 (Financial Execution) → Batch 5/6 (Complex, Analytics)

**Source:** EXECUTIVE_SUMMARY.md, TT2_ROADMAP_NEXT_STEPS, TT2_SYSTEM_OVERVIEW

---

## 7) Open Questions

| # | Question | Owner |
|---|----------|-------|
| 1 | Is "AI Analysis" / trade_plans a differentiator to highlight in narrative? | Architect |
| 2 | Premium tiers / GTM assumptions for investor narrative? | Architect |
| 3 | Broker integrations (IBKR etc.) — when in narrative? | Architect |

---

**log_entry | TEAM_70 | PI-002_DRAFT | 2026-02-15**
