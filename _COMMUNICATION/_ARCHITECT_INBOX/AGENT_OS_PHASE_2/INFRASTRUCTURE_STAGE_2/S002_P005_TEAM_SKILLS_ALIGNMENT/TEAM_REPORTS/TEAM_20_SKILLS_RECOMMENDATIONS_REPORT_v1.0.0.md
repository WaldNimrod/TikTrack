# Team 20 | Skills Recommendations Report

---
project_domain: TIKTRACK (Backend)
id: TEAM_20_SKILLS_RECOMMENDATIONS_REPORT_v1.0.0
from: Team 20 (Backend Implementation)
to: Team 190 (Constitutional Validator)
cc: Team 10, Team 00, Team 100, Nimrod
date: 2026-03-15
status: SUBMITTED_FOR_ARCH_REVIEW
scope: Team 20 skill recommendation package for S002-P005
---

## Mandatory Identity Header

| Field | Value |
|-------|-------|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P005 |
| task_id | TEAM_SKILLS_DISCOVERY_AND_SUBMISSION |
| gate_id | GOVERNANCE_PROGRAM |
| phase_owner | Team 20 |

---

## 1) Team Context

### Operating domain(s)
- **Primary:** TikTrack Backend — API (FastAPI), DB (PostgreSQL/SQLAlchemy), market data integrations (Yahoo, Alpha Vantage)
- **Secondary:** Sync scripts (EOD, intraday, backfill, seed), rate limiting/cooldown logic, provider fallback chains
- **Scope:** `api/`, `scripts/` (sync/seed/backfill), no frontend, no Agents_OS build

### Primary toolchain/runtime
- Python 3.9+, FastAPI, SQLAlchemy 2.x, asyncpg, psycopg2
- Pydantic schemas, ULID/UUID identity layer
- External: Yahoo Finance v7/v8, Alpha Vantage OVERVIEW/CRYPTO, CoinGecko (fallback)

### Recurring blockers (from actual execution)
1. **API verification mandates** — re-parsing handoff docs to extract exact endpoint/params/response shape; e.g. S001-P002 WP001 Alerts Widget required manual code trace to confirm `trigger_status`, `sort=triggered_at`, `condition_summary`. Repeated for each mandate.
2. **Provider debugging cycles** — Yahoo 401/429, Alpha quota; debug required instrumentation, run backfill, analyze logs; iteration is token-heavy (GATE7 Part A CC-03 market_cap).
3. **Schema/DB drift** — migrations, enum changes, column adds; sometimes discovered late by tests.
4. **Mandate handoff parsing** — Team 10/50 mandates arrive as prose; extracting actionable checklist (files, params, acceptance) is manual.
5. **Completion deliverable formatting** — KB-018, GATE7 fixes require specific deliverable structure; copy-paste from prior completion risks missing fields.

---

## 2) Skill Options Table

| Option | What it solves | Benefits | Risks/tradeoffs | Impact | Effort | Token saving |
|--------|----------------|----------|-----------------|--------|--------|--------------|
| **api-mandate-contract-extractor** | Parses Team 10 mandate prose → structured {endpoint, params, response_shape, acceptance} | Single trace instead of re-reading mandate; consistent doc output | Needs stable mandate format; false negatives if prose varies | HIGH | MEDIUM | HIGH |
| **provider-debug-log-injector** | Injects NDJSON debug logs at provider call boundaries (Yahoo/Alpha); configurable session ID | Runtime evidence without manual instrumentation; reusable for GATE7-style debugging | Adds log volume; needs log path contract | HIGH | LOW | MEDIUM |
| **schema-pydantic-drift-checker** | Compares SQLAlchemy model columns vs Pydantic schema fields; flags missing/mismatched | Catch schema drift before tests; reduce "why did test fail" cycles | May flag intentional differences (e.g. computed fields) | MEDIUM | MEDIUM | MEDIUM |
| **sync-script-smoke-runner** | Runs `sync_ticker_prices_eod`, `backfill_market_cap_auto_wp003_05`, `seed_market_data_tickers` in sequence with env check; reports success/fail | Fast sanity check post-change; reduces "did I break sync?" uncertainty | Requires DB; mock mode would need design | MEDIUM | LOW | LOW |
| **completion-deliverable-template** | Fills TEAM_20_TO_TEAM_X_COMPLETION from mandate id + checks_run + verdict; enforces bug_id, action_taken, files_changed | Fewer formatting BLOCK_FOR_FIX from Team 10 | Template may drift from evolving contract | MEDIUM | LOW | LOW |
| **yahoo-alpha-mock-fixture-builder** | Generates httpx/fixture responses for Yahoo v7/quote, Alpha OVERVIEW from sample JSON | Deterministic provider tests; no live 401/429 during unit run | Maintenance when provider response shape changes | HIGH | MEDIUM | HIGH |
| **db-migration-ordering-validator** | Validates migration files: no duplicate timestamps, no backward-incompatible drop before add | Catch migration ordering bugs before deploy | Limited to structural checks | LOW | LOW | LOW |

---

## 3) Priority Recommendation (Top 3)

1. **api-mandate-contract-extractor** — Highest ROI; mandates recur often; manual extraction is repetitive.
2. **provider-debug-log-injector** — Reusable for GATE7-style debugging; low effort; immediate value.
3. **yahoo-alpha-mock-fixture-builder** — Enables deterministic tests; reduces dependency on live providers during validation.

---

## 4) Dependencies and Prerequisites

| Skill | Depends on | Prerequisites |
|-------|------------|---------------|
| api-mandate-contract-extractor | Stable mandate doc format; Team 10 contract | Markdown/header parse conventions |
| provider-debug-log-injector | Log path contract (.cursor/debug-*.log); session ID | Existing debug_mode_logging infra |
| schema-pydantic-drift-checker | SQLAlchemy + Pydantic in same repo | Introspection access |
| sync-script-smoke-runner | DATABASE_URL; tickers seed | scripts/ paths |
| completion-deliverable-template | Mandate id, check list, verdict enum | Team 10 completion contract |
| yahoo-alpha-mock-fixture-builder | Sample JSON responses | Provider response capture |

---

## 5) Suggested Owner per Option

| Option | Suggested owner | Rationale |
|--------|-----------------|-----------|
| api-mandate-contract-extractor | Team 170 or Team 10 | Cross-team format; gateway owns mandate flow |
| provider-debug-log-injector | Team 20 | Backend-specific; Team 20 consumes it |
| schema-pydantic-drift-checker | Team 20 or Team 60 | Backend/CI domain |
| sync-script-smoke-runner | Team 20 | Scripts owned by Team 20 |
| completion-deliverable-template | Team 10 or Team 170 | Completion contract ownership |
| yahoo-alpha-mock-fixture-builder | Team 20 | Provider integration is Team 20 |
| db-migration-ordering-validator | Team 20 or Team 60 | DB/CI domain |

---

## 6) Open Clarification Questions

- **api-mandate-contract-extractor:** Is there an existing canonical mandate template (e.g. TEAM_10_TO_TEAM_20_*_MANDATE) that we can anchor parsing on, or do formats vary by team?
- **provider-debug-log-injector:** Is the `.cursor/debug-<session>.log` path and NDJSON format already canonical for debug sessions, or should Team 20 propose a contract?

---

## 7) Return Contract

| Field | Value |
|-------|-------|
| overall_result | SUBMITTED_FOR_ARCH_REVIEW |
| top3_skills | api-mandate-contract-extractor, provider-debug-log-injector, yahoo-alpha-mock-fixture-builder |
| blocking_uncertainties | NONE |
| remaining_blockers | NONE |

---

log_entry | TEAM_20 | SKILLS_RECOMMENDATIONS_REPORT | SUBMITTED_FOR_ARCH_REVIEW | 2026-03-15
