# Team 50 → Team 30 | S002-P002-WP003 GATE_7 — Canonical Execution Prompt (Frontend)

**project_domain:** TIKTRACK  
**id:** TEAM_50_TO_TEAM_30_S002_P002_WP003_GATE7_CANONICAL_PROMPT  
**from:** Team 50 (QA & Fidelity)  
**to:** Team 30 (Frontend)  
**cc:** Team 10  
**date:** 2026-03-11  
**status:** CANONICAL — use as primary execution instruction  
**gate_id:** GATE_7  
**work_package_id:** S002-P002-WP003  

---

## Role & Context

אתה **Team 30 (Frontend)**. משימתך: ליישם את התיקונים ל-BF-001, BF-002, BF-003, BF-004 בדף ניהול הטיקרים (D22). הקבצים הרלוונטיים: `ui/src/views/management/tickers/tickersTableInit.js`, `tickers.html`, `priceReliabilityLabels.js`, `eodStalenessCheck.js`.

**SSOT:**
- `_COMMUNICATION/team_00/TEAM_00_TO_TEAM_10_WP003_GATE7_REMEDIATION_ANSWERS_v1.0.0.md`
- `_COMMUNICATION/team_10/TEAM_10_TO_TEAM_30_S002_P002_WP003_GATE7_REMEDIATION_MANDATE.md`
- `_COMMUNICATION/team_10/TEAM_10_S002_P002_WP003_GATE7_REMEDIATION_SCOPE_LOCK_v1.0.0.md`

---

## Prompt — Step-by-Step Execution

### Step 1: BF-001 — Bind Per-Row Fields & Add price_as_of_utc Column

**דרישה:** כל שורה מציגה בבירור: current_price, last_close_price, price_source, price_as_of_utc. אין "-" כשהנתון קיים ב-payload.

**ביצוע:**
1. פתח `ui/src/views/management/tickers/tickersTableInit.js`.
2. בפונקציה `updateTable`, עבור כל `t` ב-pageData:
   - `current_price` / `currentPrice` → תא מחיר (עמודה "מחיר")
   - `last_close_price` / `lastClosePrice` → תא "סגירה"
   - `price_source` / `priceSource` → תא "מקור" (getPriceSourceLabel) — אל תציג "-" כש-source קיים
   - `price_as_of_utc` / `priceAsOfUtc` → תא "עודכן ב" (formatPriceAsOf)
3. ודא שהעמודות קיימות ב-HTML: `tickers.html` / `tickers.content.html` — headers: סמל, מחיר, מקור, סגירה, עודכן ב, שינוי יומי, שם חברה, סוג, סטטוס, פעולות.
4. ודא ש-current_price ו-last_close_price מוצגים בנפרד — אין fallback שמאחד אותם.

**Acceptance:** ≥3 טיקרים עם current≠last_close; מקור לא ריק; עמודת "עודכן ב" נראית.

---

### Step 2: BF-002 — Currency Per Row

**דרישה:** הפסק hardcoded USD. השתמש ב-`currency` מה-API payload לכל שורה. הצג €, ₪, $ לפי מטבע.

**ביצוע:**
1. ב-`tickersTableInit.js` — מפה `CURRENCY_SYMBOLS = { USD: '$', EUR: '€', ILS: '₪', GBP: '£', ... }`.
2. פונקציה `formatCurrency(amount, currency)` — משתמשת ב-`currency` מהשורה.
3. עבור תא מחיר ותא סגירה: `formatCurrency(priceVal, t.currency ?? 'USD')`.
4. ודא ש-`currency` מקורו ב-`t.currency ?? t.currencyCode` (תואם ל-TickerResponse).

**Acceptance:** TEVA.TA → ₪, BTC-USD → $, ANAU.MI → €.

---

### Step 3: BF-003 — Details Action & Traffic Light

**דרישה:**
1. תוספת action "פרטים" בתפריט הפעולות של כל שורה.
2. Traffic light per row: EOD→🟢, EOD_STALE/INTRADAY_FALLBACK→🟡, null→🔴.
3. Details modal → GET `/tickers/{id}/data-integrity`.

**ביצוע:**
1. **Details action:** בתא actions, הוסף כפתור "פרטים" (js-action-details) עם `data-ticker-id`. קישור ל-`handleDetails(tickerId)`.
2. **handleDetails:** קריאה ל-`sharedServices.get(`/tickers/${tickerId}/data-integrity`)`, בניית HTML מהתשובה (eod_prices, intraday_prices, history_250d), הצגה ב-modal (createModal).
3. **Traffic light:** ב-`ui/src/utils/priceReliabilityLabels.js` — `getTrafficLightFromSource(source)`:
   - `EOD` → `green`
   - `EOD_STALE` / `INTRADAY_FALLBACK` → `yellow`
   - `null` → `red`
4. בתא סמל (col-symbol): הוסף `<span class="traffic-light traffic-light--${trafficLight}">` ליד הסמל, עם aria-label/title מ-getPriceSourceLabel.

**Acceptance:** משתמש לוחץ "פרטים" → modal נפתח עם נתוני data-integrity; כל שורה מציגה נקודת צבע (ירוק/צהוב/אדום).

---

### Step 4: BF-004 — Staleness Clock Source

**בעיה:** `eodStalenessCheck.js` קורא ל-`/reference/exchange-rates` ומשתמש ב-`last_sync_time` — לא מעודכן (24 ימים). השעון לא משקף טריות נתוני הטיקרים.

**פתרון (per SSOT):** ב-`loadAllData()` — אחרי קבלת נתוני טיקרים, קרא ל-`window.updateStalenessClock()` עם `max(price_as_of_utc)` מרשימת הטיקרים. כך השעון משקף טריות מחירים אמיתית.

**ביצוע:**
1. פתח `ui/src/views/management/tickers/tickersTableInit.js`.
2. בפונקציה `loadAllData`, אחרי `updateTable`:
   ```js
   if (typeof window.updateStalenessClock === 'function' && tableData.data?.length > 0) {
     let maxTs = null;
     for (const t of tableData.data) {
       const ts = t.price_as_of_utc ?? t.priceAsOfUtc ?? null;
       if (ts && (!maxTs || new Date(ts) > new Date(maxTs))) maxTs = ts;
     }
     if (maxTs) {
       window.updateStalenessClock('ok', { price_timestamp: maxTs, fetched_at: maxTs }, null);
     }
   }
   ```
3. ודא ש-`stalenessClockCard` מתעדכן לפי קריאה זו (לא רק מ-eodStalenessCheck).

**Acceptance:** כשקיימים טיקרים — השעון "עודכן ב" משקף את max(price_as_of_utc) של הטיקרים, לא של exchange-rates.

---

### Step 5: Coordination with Team 20

- BF-001/002: ה-API (TickerResponse) חייב לכלול `current_price`, `last_close_price`, `price_source`, `price_as_of_utc`, `currency`.
- BF-003: Traffic light מ-`price_source` — אין API חדש.
- BF-004: `price_as_of_utc` מה-API — אין שינוי ב-API.

---

### Step 6: Deliverable

**נתיב:** `_COMMUNICATION/team_30/TEAM_30_TO_TEAM_10_S002_P002_WP003_GATE7_REMEDIATION_COMPLETION.md`

**תוכן חובה:**
- status: DONE | BLOCKED
- Per-BF evidence:
  - BF-001: paths, snippet של updateTable עם binding לכל השדות.
  - BF-002: snippet של formatCurrency + CURRENCY_SYMBOLS.
  - BF-003: path ל-handleDetails, snippet של traffic-light ב-col-symbol.
  - BF-004: path ל-loadAllData, snippet של קריאת updateStalenessClock.
- Blockers (אם יש תלות ב-API/עיצוב)

---

**log_entry | TEAM_50 | WP003_G7_CANONICAL_PROMPT | TO_TEAM_30 | cc_TEAM_10 | 2026-03-11**
