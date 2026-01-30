# 🛡️ Market Data Resilience

- Hierarchy: Cache > EOD > LocalStore.
- Policy: Never block UI for external API.
- Staleness: Warning at 15 mins, N/A after 1 trading day.