# Archive — Market Data (SSOT §7.3)

**מקור:** MARKET_DATA_PIPE_SPEC §7.3; MARKET_DATA_COVERAGE_MATRIX Rule 7

## מדיניות

| מקור | Retention DB | Archive | מחיקת ארכיון |
|------|--------------|---------|---------------|
| **intraday** | 30 יום | CSV files | אחרי שנה (365 יום) |
| **daily** (ticker_prices) | 250 יום | CSV files | לא — נשמר לצמיתות |
| **fx_history** | 250 יום | CSV files | לא — נשמר לצמיתות |

## מבנה

```
archive/market_data/
├── intraday/     — ticker_prices_intraday (30d→archive; deleted after 1y)
├── daily/        — ticker_prices (250d→archive; no delete)
└── fx_history/   — exchange_rates_history (250d→archive; no delete)
```

## פורמט קבצים

`{source}_{cutoff_date}_{timestamp}.csv` — CSV with header.

## Evidence

`documentation/05-REPORTS/artifacts/TEAM_60_CLEANUP_EVIDENCE.json` — rows_archived, archive_paths.
