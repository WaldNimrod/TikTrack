# Evidence Log — External Data SSOT Integration (M1)

**id:** `TEAM_10_EXTERNAL_DATA_SSOT_EVIDENCE_LOG`  
**משימה:** P3-007 (M1) — SSOT Lock  
**מקור:** TEAM_90_TO_TEAM_10_EXTERNAL_DATA_DELIVERY_NOTICE.md  
**תאריך:** 2026-02-13

---

## שינויים שבוצעו

| מסמך | שינויים |
|------|---------|
| **MARKET_DATA_PIPE_SPEC** | §2.1 Providers & Priority (FX: Alpha→Yahoo, Prices: Yahoo→Alpha); §2.2 Guardrails; §2.3 Cache-First; §2.4 Cadence; §2.5 Data Freshness & UI (Clock + tooltip, אין באנר). §5 — ספקים Alpha/Yahoo. |
| **FOREX_MARKET_SPEC** | §2.5 Staleness & UI — הפניה ל־Clock + tooltip (אין באנר). שאר §2 כבר היה מעודכן (ADR-022). |
| **WP_20_09_FIELD_MAP_TICKERS_MAPPINGS** | provider_mapping_data — Yahoo Finance + Alpha Vantage בלבד (Stage-1); אין IBKR כספק market-data. |

---

## מקורות מקוריים

- TEAM_90_MARKET_DATA_SSOT_INTEGRATION_DRAFT.md  
- documentation/90_ARCHITECTS_DOCUMENTATION/ (ARCHITECT_MARKET_DATA_STRATEGY_ANALYSIS, EXTERNAL_PROVIDER_YAHOO_FINANCE_SPEC, EXTERNAL_PROVIDER_ALPHA_VANTAGE_SPEC)  
- ARCHITECT_VERDICT_MARKET_DATA_STAGE_1.md (ADR-022)

---

## Resubmission — SSOT Expansion (TEAM_90_RESUBMISSION_REQUIRED)

**תאריך:** 2026-02-13  
**מקור:** TEAM_90_TO_TEAM_10_EXTERNAL_DATA_RESUBMISSION_REQUIRED, TEAM_90_INDICATORS_ADDENDUM

| מסמך | שינויים |
|------|---------|
| **MARKET_DATA_PIPE_SPEC** | §2.4 — 250d historical, Market Cap EOD, Indicators (ATR/MA/CCI); הפניה ל־MARKET_DATA_COVERAGE_MATRIX. §4.1 — market_cap, 250d, Indicators; הפניה ל־MARKET_INDICATORS_AND_FUNDAMENTALS_SPEC. §5 — הסרת אזכור מספקים מלוג. |
| **MARKET_DATA_COVERAGE_MATRIX** | מסמך SSOT חדש — `documentation/01-ARCHITECTURE/MARKET_DATA_COVERAGE_MATRIX.md` (מקור: TEAM_90_MARKET_DATA_COVERAGE_MATRIX_SSOT_DRAFT). |
| **MARKET_INDICATORS_AND_FUNDAMENTALS_SPEC** | מסמך SSOT חדש — `documentation/01-ARCHITECTURE/MARKET_INDICATORS_AND_FUNDAMENTALS_SPEC.md` (מקור: TEAM_90_MARKET_INDICATORS_AND_FUNDAMENTALS_SSOT_DRAFT). |
| **PRECISION_POLICY_SSOT** | market_cap = (20,8) ב־ticker_prices. |
| **WP_20_09_FIELD_MAP_TICKERS_MAPPINGS** | יישור למטריצה — provider_mapping_data + הפניה ל־MARKET_DATA_COVERAGE_MATRIX. |
| **לוגים/חתימות** | הסרת אזכור מספקים ישן מלוגי MARKET_DATA_PIPE_SPEC. |

---

**log_entry | TEAM_10 | EVIDENCE_LOG | EXTERNAL_DATA_SSOT_M1 | 2026-02-13**  
**log_entry | TEAM_10 | EVIDENCE_LOG | EXTERNAL_DATA_RESUBMISSION_SSOT_EXPANSION | 2026-02-13**

**log_entry | TEAM_90 | EVIDENCE_LOG | EXTERNAL_DATA_MAINTENANCE_RETENTION_LOCK | 2026-02-13** — Added maintenance/cleanup policy to `MARKET_DATA_PIPE_SPEC.md` (§7), including: Intraday DB retention 30d → archive 1y → delete; EOD/FX 250d → archive; daily/weekly/monthly cleanup cycles. Coverage matrix updated with retention + archive summary.

**log_entry | TEAM_90 | EVIDENCE_LOG | EXTERNAL_DATA_RATELIMIT_SCALING_LOCK | 2026-02-13** — Added Rate‑Limit & Scaling Policy (§8) to `MARKET_DATA_PIPE_SPEC.md` (cache‑first, single‑flight, cooldown on 429, provider fallback, system settings controls). Coverage matrix updated with scaling note.

**log_entry | TEAM_10 | EVIDENCE_LOG | RATELIMIT_SCALING_MANDATES_DISTRIBUTED | 2026-02-13** — תוכנית העבודה עודכנה (§11 במנדט המלא). הודעות הפעלה: TEAM_10_TO_TEAM_20_RATELIMIT_SCALING_MANDATE, TEAM_10_TO_TEAM_60_RATELIMIT_SCALING_MANDATE, TEAM_10_TO_TEAM_30_RATELIMIT_SCALING_SETTINGS_MANDATE. איסוף Evidence — עם סיום הצוותים יירשם כאן או במסמך ייעודי.

**log_entry | TEAM_10 | EVIDENCE_LOG | EXTERNAL_DATA_VERIFICATION_FIXES | 2026-02-13**  
**log_entry | TEAM_10 | EVIDENCE_LOG | EXTERNAL_DATA_RESUBMISSION_CLOSED | 2026-02-13** — TEAM_90_TO_TEAM_10_EXTERNAL_DATA_RESUBMISSION_VERIFIED. שלב הגשה מחדש **סגור**. מותר להתקדם לביצוע P3-008–P3-015. מסמך סגירה: TEAM_10_EXTERNAL_DATA_RESUBMISSION_CLOSED.md. — WP_20_09: last_updated 2026-02-13, version v1.1. OPEN_TASKS_MASTER: P3-013, P3-014, P3-015 נוספו ל־§2.2 Team 20 (מקור: TEAM_90_RESUBMISSION_VERIFICATION_FIXES).  
**log_entry | TEAM_10 | EVIDENCE_LOG | EXTERNAL_DATA_MAINTENANCE_KICKOFF | 2026-02-13** — TEAM_90_MAINTENANCE_LOCKED_UPDATE. TT2_MARKET_DATA_RESILIENCE: staleness 15m/24h (v1.1). P3-016 (Intraday table), P3-017 (Cleanup jobs) נוספו. Kickoff מאושר: TEAM_10_TO_TEAM_90_EXTERNAL_DATA_MAINTENANCE_KICKOFF_CONFIRMED.
