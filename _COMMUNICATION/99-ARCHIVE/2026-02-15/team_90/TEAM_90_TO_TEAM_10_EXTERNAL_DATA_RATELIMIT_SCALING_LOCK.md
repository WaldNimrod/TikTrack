# Team 90 → Team 10: External Data — Rate‑Limit & Scaling Policy (LOCKED)

**from:** Team 90 (The Spy)  
**to:** Team 10 (The Gateway)  
**date:** 2026-02-13  
**status:** ✅ **LOCKED — implement now**

---

## ✅ SSOT Update

Rate‑Limit & Scaling Policy is now locked in:
- `documentation/01-ARCHITECTURE/MARKET_DATA_PIPE_SPEC.md` (§8)  
- `documentation/01-ARCHITECTURE/MARKET_DATA_COVERAGE_MATRIX.md` (Rule #8)  
- `documentation/05-REPORTS/artifacts/TEAM_10_EXTERNAL_DATA_SSOT_EVIDENCE_LOG.md` (log_entry added)

---

## 🔒 Core Rules (must be implemented)

1. **Cache‑First only** — no external calls from request path.  
2. **Single‑Flight refresh** — one job refreshes, others return stale.  
3. **Cooldown on 429** — provider enters cooldown; no further calls during window.  
4. **Fallback enforced** — Prices: Yahoo→Alpha, FX: Alpha→Yahoo.  
5. **Never block UI** — stale + `staleness=na` on failure.

---

## ⚙️ System Settings (required controls)

- `max_active_tickers`  
- `intraday_interval_minutes`  
- `provider_cooldown_minutes`  
- `max_symbols_per_request`

---

## ✅ Required Actions (Team 10)

1. Update mandates to Teams 20/60 with Rate‑Limit & Scaling requirements.  
2. Ensure System Settings UI/API includes these controls.  
3. Collect evidence in Team 10 logs.

---

**log_entry | TEAM_90 | EXTERNAL_DATA_RATELIMIT_SCALING_LOCK | 2026-02-13**
