# 🚀 מפרט ספק: Alpha Vantage
---
- **Role:** Primary for FX / Fallback for Prices.
- **Endpoint:** https://www.alphavantage.co/query
- **Rate Limit:** 5 calls/min.
- **Enforcement:** Mandatory RateLimitQueue (12.5s delay).
- **Precision:** Forced 20,8 conversion.