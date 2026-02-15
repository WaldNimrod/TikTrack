# PI-002 Business Narrative Pack

**id:** `PI-002_BUSINESS_NARRATIVE_PACK`  
**owner:** Team 70 (Product Intelligence)  
**status:** DRAFT (UPDATED AFTER MENU+DOC ALIGNMENT)  
**date:** 2026-02-15  
**scope:** ICP, value narrative, pains/jobs, strategic differentiation

---

## 1) Ideal Customer Profile (ICP)

### 1.1 Primary ICP
| Attribute | Description | Evidence |
|-----------|-------------|----------|
| Role | Traders, investors, portfolio-oriented users | `PRODUCT_POSITIONING.md`, `USER_EXPERIENCE_DOCUMENTATION.md` |
| Behavior | Account tracking, fees, cash-flow, ticker monitoring | D16/D18/D21 + user_tickers pages |
| Language/Locale | Hebrew RTL, ILS/USD/EUR context | `index.html` RTL, FX scope docs |

### 1.2 Secondary ICP
| Attribute | Description | Evidence |
|-----------|-------------|----------|
| Role | Semi-active investors / analysts | UX personas docs |
| Behavior | Dashboard and analysis consumption | research/tracking template pages now scaffolded |

---

## 2) Value Proposition

### 2.1 Core Message
- "יומן חכם למסחר מקצועי" with governed, modular delivery.

### 2.2 Value Pillars
| Pillar | Current Proof |
|--------|---------------|
| Operational core | D16/D18/D21 functional |
| Data layer | User tickers + market data pipeline functional baseline |
| Governance | Gate model + SSOT + Team 90 verification |
| Expansion readiness | 15 additional pages now available as structural templates |

### 2.3 Differentiation (Current)
- Professional governance discipline.
- Account-based financial model.
- Cache-first external data strategy.
- Clear separation between "live functional" and "template in-progress" scope.

---

## 3) Jobs to Be Done

| Job | User Statement | Capability | Status |
|-----|----------------|------------|--------|
| Manage accounts | "Track accounts and broker settings" | D16 | ✅ Functional |
| Manage fees | "Track fees per account" | D18 | ✅ Functional |
| Manage cash flow | "Track deposits/withdrawals/currency" | D21 | ✅ Functional |
| Manage watch universe | "Maintain my symbols" | User Tickers | ✅ Functional |
| Monitor market freshness | "Know if displayed data is current" | Data dashboard + staleness | ✅ Functional baseline |
| Plan trades | "Structure trade planning" | Trade Plans page | 🟡 Template shell |
| Track journal | "Capture execution and journaling" | Journal/Trades pages | 🟡 Template shell |
| Advanced analysis | "Analyze strategy/portfolio" | Research pages | 🟡 Template shell |
| Import operational data | "Import external files/data" | Data Import page | 🟡 Template shell |

---

## 4) Pain Coverage

| Pain | Mitigation | Status |
|------|------------|--------|
| Fragmented financial workflow | Unified core pages D16/D18/D21 | ✅ |
| Data provider instability | cache-first + fallback | ✅ |
| Scope confusion | explicit functional vs template mapping | ✅ (PI-001 update) |
| Overpromise risk | marketing must distinguish readiness levels | Open governance action |

---

## 5) Persona-to-Value Matrix

| Persona | Primary Value | Current Readiness |
|---------|---------------|-------------------|
| Trader | Fast operational control + market tracking | ✅ Core functional |
| Investor | Portfolio visibility + progressive analytics | 🟡 Partial (analytics template stage) |
| Portfolio manager | Multi-entity controls + disciplined workflow | 🟡 Partial |
| Admin | System/ticker management + governance visibility | ✅ Baseline functional |

---

## 6) Open Decision Requests

| # | Decision | Owner |
|---|----------|-------|
| 1 | Priority order for converting 15 templates to functional modules | Architect + Team 10 |
| 2 | Investor narrative phrasing for "template pages" (promise boundary) | Architect |
| 3 | Which template pages are mandatory before first external campaign | Architect + Marketing |

---

**log_entry | TEAM_70 | PI-002_UPDATED_AFTER_MENU_ALIGNMENT | 2026-02-15**
