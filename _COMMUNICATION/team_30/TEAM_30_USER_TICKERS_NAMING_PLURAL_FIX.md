# Team 30 → Team 10: תיקון שם לרבים — user_tickers

**תאריך:** 2026-01-31  
**מקור:** ARCHITECT_RESOLUTION_NAMING_FINAL.md, .cursorrules §Naming  
**חוק:** Entity Names = **Plural Always**

---

## 1. השינוי

| לפני (יחיד) | אחרי (רבים) |
|-------------|-------------|
| user_ticker | **user_tickers** |
| user_ticker.html | **user_tickers.html** |
| data-table-type="user_ticker" | data-table-type="**user_tickers**" |
| entity: 'user_ticker' | entity: '**user_tickers**' |

---

## 2. קבצים שעודכנו (Frontend)

| קובץ | שינוי |
|------|--------|
| `user_tickers.content.html` | שונה מ-user_ticker.content.html |
| `user_tickers.html` | יוצר מ-build:pages |
| `userTickerPageConfig.js` | type: 'user_tickers' |
| `userTickerAddForm.js` | entity: 'user_tickers' |
| `page-manifest.json` | id, outputFile, contentFile, bodyClass |
| `routes.json` | user_tickers → /user_tickers.html |
| `unified-header.html` | href, data-page |
| `vite.config.js` | routeToFileMap |
| `headerLinksUpdater.js` | userTickersLinks |
| `phoenix-modal.css` | entity user_tickers |
| `validate-pages.js` | path |
| `TT2_PAGE_TEMPLATE_CONTRACT.md` | עמודים |
| `user-tickers-qa.e2e.test.js` | URL + selectors |

---

## 3. Team 20 — אין שינוי נדרש

- טבלה: `user_data.user_tickers` ✅ (כבר רבים)
- API: `GET/POST/DELETE /me/tickers` ✅ (כבר רבים)
- Service: `user_tickers_service.py` ✅

---

**log_entry | [Team 30] | USER_TICKERS_NAMING_PLURAL | 2026-01-31**
