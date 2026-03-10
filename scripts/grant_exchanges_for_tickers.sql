-- Fix: BF-002 currency derivation requires Exchange.country
-- GET /tickers 500: permission denied for table exchanges
-- Run as superuser (postgres)
GRANT SELECT ON market_data.exchanges TO "TikTrackDbAdmin";
