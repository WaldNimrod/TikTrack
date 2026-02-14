# Evidence: Team 30 — User Tickers Crypto + Exchange Corrective

**Date:** 2026-02-14  
**Squad:** Team 30 (Frontend)  
**Type:** Corrective implementation per Team 10 mandate

## Summary

מימוש הודעת התיקון TEAM_10_TO_TEAM_30_USER_TICKERS_CRYPTO_EXCHANGE_CORRECTIVE:
- סוג נכס (STOCK/CRYPTO/ETF)
- שדה Market (קריפטו בלבד)
- בורסה/סיומת (TASE, Milan, LSE)

## Files Modified

| File | Change |
|------|--------|
| `userTickerAddForm.js` | Asset type select, Market select (conditional), Exchange select, payload logic |
| `sharedServices.js` | `options.useQueryParams` for POST with query params |

## Handoff Document

`_COMMUNICATION/team_30/TEAM_30_TO_TEAM_10_USER_TICKERS_CRYPTO_EXCHANGE_CORRECTIVE_COMPLETE.md`

## Dependencies

- Crypto (BTC-USD) → requires Team 20: provider mapping + Alpha DIGITAL_CURRENCY_DAILY
- European/TASE tickers → symbol+suffix sent (ANAU.MI); Backend must support
