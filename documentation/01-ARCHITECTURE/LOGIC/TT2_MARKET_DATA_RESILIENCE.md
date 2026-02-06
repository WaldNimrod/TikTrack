# 🛡️ Market Data Resilience

**id:** `TT2_MARKET_DATA_RESILIENCE`  
**owner:** Team 20 (Backend Implementation)  
**status:** 🔒 **SSOT - ACTIVE**  
**supersedes:** None (Master document)  
**last_updated:** 2026-02-05  
**version:** v1.0

---

- Hierarchy: Cache > EOD > LocalStore.
- Policy: Never block UI for external API.
- Staleness: Warning at 15 mins, N/A after 1 trading day.