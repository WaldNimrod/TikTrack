# API Surface (High Level)

## Patterns

- REST-style JSON endpoints under `/api/*`, served by blueprints in `Backend/routes/api/`.
- Business Logic wrappers are consumed by frontend data services; use them instead of raw fetches.
- Rate limiting and date normalization are applied centrally in `app.py`; responses optimized via
  ResponseOptimizer.

## Domain Endpoints (representative)

- **Auth & Users:** `/api/auth/login`, `/api/auth/me`, `/api/auth/me/password`,
  `/api/auth/register`, password reset.
- **Trading Accounts:** `/api/trading-accounts/*`
- **Trades & Plans:** `/api/trades/*`, `/api/trade-plans/*`, `/api/executions/*`,
  `/api/trade-history/*`, `/api/portfolio-state/*`, `/api/trading-journal/*`
- **Alerts & Conditions:** `/api/alerts/*`, `/api/plan-conditions/list`, `/api/trade-conditions/*`
- **Tickers:** `/api/tickers/*`, `/api/tickers/my`, `/api/quotes-last/*`,
  `/api/external-data/providers/*`
- **Cash Flows:** `/api/cash-flows/*`
- **Notes:** `/api/notes/*`, `/api/note-relation-types/*`
- **Tags:** `/api/tags/*`, `/api/tag-categories/*`, `/api/tag-links/*`
- **Watch Lists:** `/api/watch-lists/*`
- **Preferences & Settings:** `/api/preferences/*`, `/api/preferences-v4/*`,
  `/api/system-settings/*`, `/api/preference-groups/*`, `/api/system-setting-groups/*`
- **External Data:** `/api/external-data/status/*`, `/api/eod-metrics/*`
- **AI Analysis:** `/api/ai-analysis/*`
- **Monitoring/Ops:** `/api/health`, `/api/cache/*`, `/api/cache-changes/*`, `/api/server-logs/*`,
  `/api/email-logs/*`, `/api/background/*`, `/api/wal/*`, `/api/query-optimization/*`,
  `/api/database/schema/*`
- **Quality/Tools:** `/api/quality-check/*`, `/api/quality-lint/*`, `/api/file-scanner/*`,
  `/api/css/*`

## Response/Request Notes

- Date envelopes normalized via `BaseEntityUtils.normalize_input`; UTC default.
- Business Logic wrappers perform validation/calculations server-side; clients reuse via data
  services to keep parity.
- User scoping: most entity endpoints expect/return user-specific data; ensure auth is enforced
  before production exposure.
