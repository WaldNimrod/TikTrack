# 🕵️ Team 90 → Team 10: SSOT Integration Draft — External Market Data (Stage‑1)

**id:** `TEAM_90_MARKET_DATA_SSOT_INTEGRATION_DRAFT`  
**from:** Team 90 (The Spy)  
**to:** Team 10 (The Gateway)  
**date:** 2026-02-13  
**status:** 📌 **DRAFT FOR SSOT INSERTION**

---

## 0) Primary Sources (Architect — mandatory)

- `documentation/90_ARCHITECTS_DOCUMENTATION/ARCHITECT_MARKET_DATA_STRATEGY_ANALYSIS.md` (ARCH‑STRAT‑002)
- `documentation/90_ARCHITECTS_DOCUMENTATION/EXTERNAL_PROVIDER_YAHOO_FINANCE_SPEC.md`
- `documentation/90_ARCHITECTS_DOCUMENTATION/EXTERNAL_PROVIDER_ALPHA_VANTAGE_SPEC.md`
- `_COMMUNICATION/90_Architects_comunication/ARCHITECT_VERDICT_MARKET_DATA_STAGE_1.md` (ADR‑022)

---

## 1) **INSERT** into `MARKET_DATA_PIPE_SPEC.md` (Stage‑1 Section)

### 1.1 Providers + Priority (LOCKED)
```markdown
## Providers & Priority (Stage‑1 — LOCKED)

| Domain | Primary | Fallback |
|--------|---------|----------|
| FX (Exchange Rates) | Alpha Vantage | Yahoo Finance |
| Prices (Ticker Prices) | Yahoo Finance | Alpha Vantage |

**No Frankfurter.** IBKR is **Broker only** (not market‑data provider in Stage‑1).
```

### 1.2 Provider Guardrails (LOCKED)
```markdown
## Provider Guardrails (LOCKED)

- **Yahoo Finance:** User‑Agent Rotation **required**.
- **Alpha Vantage:** RateLimitQueue **required** (12.5s delay → 5 calls/min).
```

### 1.3 Cache‑First Enforcement (LOCKED)
```markdown
## Cache‑First (Mandatory)

1. **Always check local cache (DB)** before any external API call.
2. Cache HIT → return immediately.
3. Cache MISS → Provider (Primary → Fallback).
4. Both fail → return stale (if exists) + `staleness=na`. **Never block UI.**
```

### 1.4 Cadence Policy (Domain + Ticker Status)
```markdown
## Cadence Policy

- **FX:** EOD בלבד.
- **Prices:** Intraday for **Active tickers**; EOD for inactive.
- Cadence is controlled via **System Settings** per domain + ticker status.
```

### 1.5 Data Freshness (Clock‑based UI)
```markdown
## Data Freshness & UI Indicator (No Banner)

- UI must show **Last Update Clock** for prices.
- If stale/EOD → clock changes color + tooltip explains staleness.
- Fields: `price_timestamp` (as_of), `fetched_at`, `is_stale`.
```

---

## 2) **INSERT** into `FOREX_MARKET_SPEC.md`

### 2.1 Providers + Scope (LOCKED)
```markdown
## Providers (FX — Stage‑1)

- **Primary:** Alpha Vantage
- **Fallback:** Yahoo Finance
- **Scope:** USD / EUR / ILS
- **Cadence:** EOD בלבד
```

### 2.2 Cache‑First + Staleness
```markdown
## Cache‑First & Staleness

- No external API call before DB cache check.
- `staleness`: ok | warning (>15 min) | na (>24h)
```

---

## 3) **INSERT** into `WP_20_09_FIELD_MAP_TICKERS_MAPPINGS.md`

```markdown
- `provider_mapping_data`: **Yahoo Finance + Alpha Vantage** בלבד (Stage‑1).
```

---

## 4) (Optional) New SSOT — Provider Registry / Connector Contract

If `MARKET_DATA_PIPE_SPEC.md` is too crowded, create:

**`MARKET_DATA_PROVIDER_REGISTRY_SSOT.md`**
- Provider list, priority, fallback
- Guardrails (rate limits, UA rotation)
- Health flags
- Config‑only swap (no engine changes)

---

**log_entry | TEAM_90 | SSOT_INSERT_DRAFT | 2026-02-13**
