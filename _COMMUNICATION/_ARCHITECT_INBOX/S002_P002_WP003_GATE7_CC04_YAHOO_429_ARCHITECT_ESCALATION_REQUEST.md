# דוח הסלמה — GATE_7 Part A CC-04: Yahoo 429 Rate Limit (בקשה לבחינה אדריכלית)

**project_domain:** TIKTRACK  
**id:** S002_P002_WP003_GATE7_CC04_YAHOO_429_ARCHITECT_ESCALATION_REQUEST  
**from:** Team 50 (QA/FAV), Team 20 (Backend Implementation), Team 10 (Gateway)  
**to:** האדריכלית הראשית (Team 00 / Chief Architect)  
**cc:** Team 90 (Validation)  
**date:** 2026-01-31  
**historical_record:** true
**status:** PENDING_REVIEW — הסלמה לבדיקה מקצועית  
**gate_id:** GATE_7  
**work_package_id:** S002-P002-WP003  
**priority:** P1 — חסימת מעבר Gate  

---

## 0) מטרת המסמך

**בקשה לבחינה מעמיקה ויעוץ מקצועי** — Team 20 השקיע מאמצים משמעותיים בתיקון בעיית Yahoo 429 (CC-WP003-04) אך הבעיה נמשכת. אנו מפנים להאדריכלית הראשית לצורך:

1. בחינת שורש הבעיה מזווית אדריכלית  
2. המלצות טכניות מעשיות  
3. החלטה על כיוון — המשך ניסיונות בתוך אילוצי Yahoo הנוכחיים, או שינוי אסטרטגיה (מקור חלופי, ארכיטקטורה אחרת)  

---

## 1) תיאור הבעיה

### 1.1 הקריטריון שלא מתקיים (CC-WP003-04)

**דרישה:** אפס מופעי HTTP 429 מ־Yahoo ב־4 מחזורי EOD רצופים.

**מצב נוכחי:** בכל הרצת `scripts/run_g7_part_a_evidence.py` (4 מחזורים, 60 שניות בין מחזורים) — מתקבלים **3 מופעי 429** לפחות. `pass_04=False`, המעבר ל־Team 60 חסום.

### 1.2 תסמינים בלוג

```
Yahoo v8/chart 429 for ANAU.MI (attempt 1/3) — backing off 5s
Yahoo v8/chart 429 for ANAU.MI (attempt 2/3) — backing off 10s
Yahoo 429 — cooldown 15 min (SOP-015)
...
⚠️ Yahoo batch failed: Client error '401 Unauthorized' for url '...v7/finance/quote?symbols=ANAU.MI%2CBTC-USD%2C...'
⚠️ ALPHA_VANTAGE in cooldown — skipping
⚠️ YAHOO_FINANCE in cooldown — skipping
⚠️ No prices fetched. Exit 0.
```

**תצפיות:**
- **429** מופיע על `v8/finance/chart/{symbol}` — endpoint per-ticker.
- **401** מופיע על `v7/finance/quote` — endpoint multi-symbol (batch).
- **ANAU.MI** (מילאנו) מופיע בעקביות כסימבול שמפעיל 429.
- כאשר Yahoo ב־cooldown — אין fallback יעיל (Alpha לעיתים גם ב־cooldown).

---

## 2) זרימת הקוד הרלוונטית

```
sync_ticker_prices_eod.main()
  → fetch_prices_for_tickers(tickers)
      [1] Yahoo batch: get_ticker_prices_batch(symbols)  → v7/finance/quote (1 HTTP לכל הטיקרים)
      [2] אם batch נכשל (401/429) או symbol חסר בתשובה → yahoo_batch[symbol] = None
      [3] לולאה per-ticker: עבור כל symbol שאינו ב־yahoo_batch
          → provider.get_ticker_price(symbol)  [Yahoo]
              → _fetch_price_sync(symbol)
                  → Primary: _fetch_last_close_via_v8_chart(symbol)   ← 429 כאן (v8/chart)
                  → Fallback: yfinance.history()
                  → Final:  _fetch_price_via_quote_api(symbol)        [v7/quote]
```

**בעיה מרכזית:** ב־per-ticker fallback, **v8/chart מופעל ראשון**. v8/chart רגיש מאוד ל־rate limit; v7/quote לא נבדק לפני שנגרם 429.

---

## 3) התיקונים שניסה Team 20

### 3.1 סבב ראשון (GATE_7 Part A Remediation)

| # | תיקון | מיקום | תוצאה |
|---|-------|--------|--------|
| 1 | **Batch-first EOD** | `sync_ticker_prices_eod.py` | קודם 1 קריאת v7/quote לכל הטיקרים; per-ticker רק לחסרים |
| 2 | **ביטול prefetch נפרד** | `sync_ticker_prices_eod.py` | `pre_fetched_market_caps` נמלא מהבאצ' — חיסכון 1 HTTP |
| 3 | **דיליי 60s בין מחזורים** | `run_g7_part_a_evidence.py` | 60 שניות בין כל subprocess למשנהו |
| 4 | **תיקון הזחה בלולאה** | `sync_ticker_prices_eod.py` | תיקון לוגי־קוד |
| 5 | **Instrumentation GATE7_CC** | `yahoo_provider.py` | ספירת קריאות Yahoo ללוג |

### 3.2 ניתוח מדוע עדיין נכשל

1. **Batch נכשל (401)** — Yahoo מחזיר 401 Unauthorized ל־v7/quote לפעמים. כשזה קורה — `yahoo_batch` ריק; כל הטיקרים עוברים ל־per-ticker.
2. **Per-ticker משתמש ב־v8 קודם** — `_fetch_price_sync` מנסה v8/chart לפני v7/quote. v8 רגיש ל־429.
3. **v7 batch אולי לא מחזיר ANAU.MI** — גם כשהבאצ' מצליח, ייתכן ש־v7 לא מחזיר מניות אירופאיות (כמו ANAU.MI) בבאצ' מרובה־סימבולים; במקרה כזה יש fallback ל־per-ticker.
4. **Cooldown לא נשמר בין subprocess** — `run_g7_part_a_evidence` מריץ 4 subprocessים; cooldown ב־memory בלבד. כל מחזור מתחיל ללא cooldown מהמחזור הקודם.

### 3.3 ניסיונות נוספים (אם בוצעו)

- הוספת headers ל־v7 (User-Agent, Accept, Origin, Referer) — נבדק; 401 עדיין מופיע.
- Exponential backoff ב־v8 (5s→10s→20s) — קיים; לא מונע 429 בגלל שהבעיה היא עצם השימוש ב־v8.

---

## 4) הקשר אדריכלי — ARCHITECT_DIRECTIVE_MARKET_DATA_OPTIMIZATION

ה־Architect Directive (v1.0.0) קבע:
- **Layer 1:** Priority filtering (fetch רק טיקרים שצריכים רענון).
- **Layer 2:** Batch fetch via v7/finance/quote.

Team 20 יישם batch-first ב־EOD. אך:
- **EOD** טוען את **כל** הטיקרים בכל מחזור (ללא priority filter כמו ב־intraday).
- **Per-ticker fallback** עדיין משתמש ב־`get_ticker_price` שמוביל ל־v8-first.
- **v7/quote** — לפי ה־Directive — אמור להיות הנתיב הראשי; בפועל ב־per-ticker ה־primary הוא v8/chart.

**הסתירה:** ה־Directive ממליץ על v7/quote כ־batch; ה־YahooProvider מגדיר ל־EOD per-ticker את v8/chart כ־primary (לפי YAHOO_FINANCE_DATA_AND_REQUEST_LOGIC — "history first, less 429").

---

## 5) מיקומי קוד מרכזיים

| קובץ | פונקציה/שורות | תפקיד |
|------|---------------|--------|
| `api/integrations/market_data/providers/yahoo_provider.py` | `_fetch_price_sync` (374–403) | סדר: v8 → yfinance → v7 |
| `api/integrations/market_data/providers/yahoo_provider.py` | `_fetch_last_close_via_v8_chart_inner` (211–297) | v8/chart — המקור ל־429 |
| `api/integrations/market_data/providers/yahoo_provider.py` | `_fetch_prices_batch_sync` (69–154) | v7 batch — לפעמים 401 |
| `api/integrations/market_data/providers/yahoo_provider.py` | `_fetch_price_via_quote_api` (321–371) | v7 per-symbol |
| `scripts/sync_ticker_prices_eod.py` | `fetch_prices_for_tickers` (174–338) | Batch-first + per-ticker fallback |
| `api/integrations/market_data/provider_cooldown.py` | `_cooldowns` dict | In-memory; לא נשמר בין processes |

---

## 6) שאלות להאדריכלית

### 6.1 טקטי

1. **סדר API ב־per-ticker:** האם להפוך את הסדר ב־`_fetch_price_sync` — לנסות **v7/quote לפני v8/chart** עבור EOD? (v7 נוטה פחות ל־429.)
2. **401 על v7:** האם קיימת המלצה מוכרת להתמודדות עם 401 מ־Yahoo (cookies, crumb, session)?
3. **ANAU.MI:** האם יש עמדה — להשתמש במקור חלופי (Alpha, מניות אירופאיות) עבור סימבולים ש־Yahoo לא מחזיר יציב?

### 6.2 אסטרטגי

4. **Yahoo כ־primary:** בהתחשב ב־429/401 החוזרים — האם נכון להמשיך להסתמך על Yahoo כ־primary ל־EOD, או שיש לשקול מעבר ל־Alpha/מקור אחר לחלק מהסימבולים?
5. **גישה מבנית:** האם מומלץ:
   - **א)** להמשיך לשפר את היישום מול Yahoo (v7-first, טיפול ב־401),
   - **ב)** להגדיר Symbol-to-Provider mapping (למשל ANAU.MI → Alpha),
   - **ג)** לאמץ ארכיטקטורה שמפרידה בין "batch-success path" ל־"fallback path" עם מדיניות שונה (למשל v7-only ב־fallback)?

### 6.3 אימות

6. **GATE_7 evidence:** כיצד לאמת CC-04 באופן אמין? האם 4 subprocessים עם 60s delay מספיקים, או שצריך single-process עם 4 מחזורים כדי שצבירת cooldown תעבוד?

---

## 7) מסמכים מצורפים

| מסמך | נתיב |
|------|------|
| Team 20 Remediation Completion | `_COMMUNICATION/team_20/TEAM_20_TO_TEAM_10_S002_P002_WP003_GATE7_PARTA_REMEDIATION_COMPLETION.md` |
| Team 50 Block Analysis | `_COMMUNICATION/team_50/TEAM_50_TO_TEAM_20_S002_P002_WP003_GATE7_PARTA_BLOCK_ANALYSIS_AND_REMEDIATION_REQUEST.md` |
| Architect Directive Market Data | `_COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_MARKET_DATA_OPTIMIZATION_v1.0.0.md` |
| Sample log | `documentation/05-REPORTS/artifacts/G7_PART_A_RUNTIME_EVIDENCE_2026-03-11_221540.log` |
| Market Data Resilience (SSOT) | `documentation/docs-system/01-ARCHITECTURE/LOGIC/TT2_MARKET_DATA_RESILIENCE.md` |

---

## 8) סיכום

Team 20 מיישם את ההנחיות הקיימות (batch-first, דיליי, צמצום קריאות) אך CC-04 עדיין נכשל. החסימה מונעת מעבר ל־Team 60 וליתר שלבי GATE_7.

**מבקשים מהאדריכלית הראשית:**
- בחינה מעמיקה של הבעיה וההקשר
- המלצות טכניות ואסטרטגיות מעשיות
- כיוון ברור — המשך אופטימיזציה מול Yahoo, או שינוי אסטרטגיה

---

**log_entry | ESCALATION | GATE7_CC04_YAHOO_429 | TO_CHIEF_ARCHITECT | PENDING | 2026-01-31**
