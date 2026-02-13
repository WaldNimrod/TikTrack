# 🕵️ UAI Retrofit Mapping — Phase 1.8 (Pre-Work Scan)

**Team:** 90 (The Spy)
**Date:** 2026-02-07
**Scope:** ui/src/views/**/*.html (static scan)
**Purpose:** Provide precise mapping to help teams retrofit to UAI and remove legacy script loading.

## 📊 Summary
- Total HTML files scanned: **5**
- Files with UAI entry (`UnifiedAppInit.js`): **3**
- Files with external config-like script (heuristic): **3**
- Files with inline `<script>` (no src): **0**

## 🧭 Mapping Table
| HTML File | UAI Entry | Config Script (heuristic) | Inline Script Tag | Script Count |
| --- | --- | --- | --- | --- |
| `ui/src/views/financial/tradingAccounts/trading_accounts.html` | ✅ | ✅ | ❌ | 17 |
| `ui/src/views/financial/brokersFees/brokers_fees.html` | ✅ | ✅ | ❌ | 12 |
| `ui/src/views/financial/cashFlows/cash_flows.html` | ✅ | ✅ | ❌ | 13 |
| `ui/src/views/shared/unified-header.html` | ❌ | ❌ | ❌ | 0 |
| `ui/src/views/shared/footer.html` | ❌ | ❌ | ❌ | 0 |

## 🔎 Notes / Heuristics
- **UAI Entry:** searched for `UnifiedAppInit.js` inside HTML.
- **Config Script:** any `<script src>` containing `config` or `Config` and ending with `.js` (heuristic only).
- **Inline Script:** `<script>` tag without `src` attribute (violates Hybrid Policy unless explicitly allowed).

## ✅ Required Actions (Per File)
1. Add external UAI config file (JS/JSON) and load it **before** UAI entry point.
2. Replace hardcoded script stacks with single UAI entry point (as per mandate).
3. Remove any inline `<script>` tags (Hybrid Policy).

## ⚠️ Critical Reminder
- Per mandate: **Any HTML file without external UAI config receives RED automatically.**
- DOMStage must enforce CSS load verification; ensure CSS order is compliant with chosen rule.

**log_entry | [Team 90] | UAI_RETROFIT_MAPPING | PHASE_1_8 | YELLOW | 2026-02-07**