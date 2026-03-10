# Team 50 → Team 20 | S002-P002-WP003 GATE_7 — Canonical Execution Prompt (Backend)

**project_domain:** TIKTRACK  
**id:** TEAM_50_TO_TEAM_20_S002_P002_WP003_GATE7_CANONICAL_PROMPT  
**from:** Team 50 (QA & Fidelity)  
**to:** Team 20 (Backend)  
**cc:** Team 10  
**date:** 2026-03-11  
**status:** CANONICAL — use as primary execution instruction  
**gate_id:** GATE_7  
**work_package_id:** S002-P002-WP003  

---

## Role & Context

אתה **Team 20 (Backend)**. משימתך: ליישם את התיקונים ל-BF-001, BF-002 בהתאם למנדט GATE_7 ולמסמכי ה-SSOT. BF-003: אפס שינוי. BF-004: ה-API תקין; Team 30 מתקן את ה-staleness clock.

**SSOT:**
- `_COMMUNICATION/team_00/TEAM_00_TO_TEAM_10_WP003_GATE7_REMEDIATION_ANSWERS_v1.0.0.md`
- `_COMMUNICATION/team_10/TEAM_10_TO_TEAM_20_S002_P002_WP003_GATE7_REMEDIATION_MANDATE.md`
- `_COMMUNICATION/team_10/TEAM_10_S002_P002_WP003_GATE7_REMEDIATION_SCOPE_LOCK_v1.0.0.md`

---

## Prompt — Step-by-Step Execution

### Step 1: BF-001 — Last Close Price (Window Function)

**בעיה:** ב-`_get_price_with_fallback`, כשאין `close_price` נפרד או כששווה ל-`price`, שני השדות `current_price` ו-`last_close_price` מקבלים אותו ערך.

**פתרון (per SSOT):** Window function — שלוף שני רשומות EOD לכל ticker; rank=2 = `last_close_price` (סגירת הסשן הקודם).

**ביצוע:**
1. פתח `api/services/tickers_service.py`.
2. אימות שהשאילתה `_get_price_with_fallback` משתמשת ב-`ROW_NUMBER() OVER (PARTITION BY ticker_id ORDER BY price_timestamp DESC)` ושמחזירה rn≤2.
3. אימות: עבור rn=1 (current session) — `current_price` = price; עבור rn=2 — `last_close_price` = close_price OR price של הרשומה השנייה.
4. אם יש רק רשומה אחת (rn=1): `last_close` = close_p OR price_val של אותה רשומה (fallback לסשן יחיד).
5. ודא ש-`_ticker_to_response` מעבירה `last_close_price` ו-`last_close_as_of_utc` מה-price_map ל-TickerResponse.

**Acceptance:** GET /api/v1/tickers — עבור ≥3 טיקרים עם נתוני EOD, `current_price` ו-`last_close_price` מובחנים כשיש 2+ רשומות EOD לכל ticker.

---

### Step 2: BF-002 — Per-Ticker Currency

**דרישה:** `TickerResponse` חייב לכלול שדה `currency` לכל שורה. ללא migration.

**פתרון (Option D per SSOT):**
- **COUNTRY_TO_CURRENCY:** מפה סטטית `IL→ILS`, `IT→EUR`, `US→USD`, וכו'.
- **CRYPTO / אין exchange_id:** פרסור סמל: `BTC-USD` → USD, `ETH-EUR` → EUR.
- **Outerjoin** של `Exchange` ב-get_tickers query — אין שינוי סכמה.

**ביצוע:**
1. ודא ש-`api/schemas/tickers.py` — `TickerResponse` כולל `currency: Optional[str]`.
2. ודא ש-`api/services/tickers_service.py` — פונקציה `_derive_currency(ticker, country, ticker_type)`:
   - אם `country` קיים: `COUNTRY_TO_CURRENCY[country]` (IL→ILS, IT→EUR, US→USD).
   - אם `ticker_type == "CRYPTO"` או סמל מכיל `-`: פרסור `SYMBOL-XXX` → XXX (3 תווים).
   - ברירת מחדל: USD.
3. ב-`get_tickers` ו-`get_ticker_by_id`: קריאה ל-`_derive_currency(ticker, country, ticker_type)` והעברת `currency` ל-`_ticker_to_response`.
4. ודא ש-`stmt` כולל `.outerjoin(Exchange, Ticker.exchange_id == Exchange.id)` ושמועבר `Exchange.country` לכל ticker.

**Acceptance:** GET /api/v1/tickers — TEVA.TA (ILS), BTC-USD (USD), ANAU.MI (EUR) מחזירים `currency` נכון.

---

### Step 3: BF-003 — Zero Backend Change

אין שינוי נדרש. Traffic light נגזר מ-`price_source` (EOD/EOD_STALE/INTRADAY_FALLBACK). Details modal משתמש ב-`GET /tickers/{id}/data-integrity` הקיים.

---

### Step 4: BF-004 — API Already Correct

ה-API מחזיר `price_as_of_utc` נכון. Team 30 אחראי על עדכון מקור ה-staleness clock ב-UI.

---

### Step 5: Seed Test Data (Optional but Recommended)

לצורך בדיקות Team 50 + Nimrod, יש לוודא קיום טיקרים לדוגמה:
- TEVA.TA (ILS, TASE)
- BTC-USD (USD, CRYPTO)
- ANAU.MI (EUR, Borsa Italiana)
- AAPL (USD)

אם אין נתונים — יצור seed script או הוספה ידנית דרך API (POST /tickers) עם `SKIP_LIVE_DATA_CHECK=true` או סמלים תקפים.

---

### Step 6: Deliverable

**נתיב:** `_COMMUNICATION/team_20/TEAM_20_TO_TEAM_10_S002_P002_WP003_GATE7_REMEDIATION_COMPLETION.md`

**תוכן חובה:**
- status: DONE | BLOCKED
- Per-BF evidence:
  - BF-001: path ל-_get_price_with_fallback, snippet של Window function והלוגיקה rank=2.
  - BF-002: path ל-_derive_currency, COUNTRY_TO_CURRENCY map, דוגמת API response עם currency.
- Open questions (אם יש)

---

**log_entry | TEAM_50 | WP003_G7_CANONICAL_PROMPT | TO_TEAM_20 | cc_TEAM_10 | 2026-03-11**
