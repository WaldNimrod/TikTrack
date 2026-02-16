# 🛡️ Market Data Resilience

**id:** `TT2_MARKET_DATA_RESILIENCE`  
**owner:** Team 20 (Backend Implementation)  
**status:** 🔒 **SSOT - ACTIVE**  
**supersedes:** None (Master document)  
**last_updated:** 2026-02-13  
**version:** v1.1

---

- **Hierarchy:** Cache > EOD > LocalStore.
- **Policy:** Never block UI for external API.
- **Staleness thresholds (LOCKED — Stage-1):**
  - **Warning:** data older than **15 minutes** → clock color + tooltip "stale warning".
  - **N/A:** data older than **24 hours** (full trading day) → clock color + tooltip "EOD / N/A"; no expectation of intraday freshness.
- **מקור:** TEAM_90_TO_TEAM_10_EXTERNAL_DATA_MAINTENANCE_LOCKED_UPDATE.