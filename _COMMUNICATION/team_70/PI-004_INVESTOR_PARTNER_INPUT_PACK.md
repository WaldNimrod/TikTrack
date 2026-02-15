# PI-004 Investor/Partner Input Pack

**id:** `PI-004_INVESTOR_PARTNER_INPUT_PACK`  
**owner:** Team 70 (Product Intelligence)  
**status:** DRAFT (UPDATED AFTER MENU+DOC ALIGNMENT)  
**date:** 2026-02-15  
**scope:** Business model assumptions, GTM hypotheses, integration value map

---

## 1) Business Model Assumptions (Evidence-Based)

| Capability Layer | Current State | Evidence |
|------------------|---------------|----------|
| Product runtime | 28 served pages (6 React + 22 HTML) | routes + AppRouter + vite route map |
| Functional core | 13 pages functional baseline | PI-001 classification |
| Expansion scope | 15 template-shell pages prepared | physical HTML scaffolds + mapped routes |
| Data backbone | market data providers + cache-first policy | market data specs and routers |
| Governance | gate/evidence architecture in operation | operating model + QA artifacts |

Note: pricing, ARPU, and hard revenue model are not locked in current SSOT.

---

## 2) GTM Hypotheses (Current)

| Hypothesis | Support Level | Notes |
|------------|---------------|-------|
| Hebrew-first retail/prosumer trading audience | Strong | RTL + Hebrew UI + current docs |
| Operational wedge via D16/D18/D21 + User Tickers | Strong | Functional pages live |
| Expansion into advanced analytics | Medium | Template shells exist, feature logic pending |
| Partnership value through provider/broker integrations | Medium | data-provider pipeline active; broker expansion staged |

---

## 3) Integration Value Map

### 3.1 Live integrations
- Yahoo Finance / Alpha Vantage data-provider layer.
- JWT-based auth and role controls.
- PostgreSQL-driven cache/history model.

### 3.2 Prepared (template) product surfaces
- Planning, tracking, research, and settings modules are scaffolded and routable.
- These surfaces support staged feature rollout without restructuring navigation/template architecture.

---

## 4) Investor Narrative Risks (Updated)

| Risk | Mitigation |
|------|------------|
| Confusion between routable page and functional module | enforce readiness labeling (functional vs template) |
| No locked commercial model in SSOT | architect decision pack required |
| Advanced modules visible before feature completion | messaging policy must define roadmap disclosure language |
| External-data operational cost assumptions not yet investor-modeled | add ops-cost sheet in next iteration |

---

## 5) What Can Be Claimed Reliably Today

1. Governance and quality discipline is active and evidence-based.
2. Financial operational core is functional.
3. External-data pipeline baseline is operational.
4. Full product surface template architecture is in place for phased rollout.

---

## 6) Decisions Required for Investor-Ready Version

| # | Decision | Owner |
|---|----------|-------|
| 1 | Commercial model framing (tiers, packaging, timeline) | Architect |
| 2 | "Template-shell" disclosure standard in investor deck | Architect + Team 90 |
| 3 | Priority wave for template-to-functional conversion | Architect + Team 10 |
| 4 | KPI baseline set for investor communication | Architect + Team 10 |

---

**log_entry | TEAM_70 | PI-004_UPDATED_AFTER_MENU_ALIGNMENT | 2026-02-15**
