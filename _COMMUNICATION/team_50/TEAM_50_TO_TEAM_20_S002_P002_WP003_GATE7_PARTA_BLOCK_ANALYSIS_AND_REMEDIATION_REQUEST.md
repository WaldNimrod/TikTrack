# Team 50 → Team 20 | S002-P002-WP003 GATE_7 Part A — חקירה מעמיקה, דרישת תיקון וקריטריונים להצלחה

**project_domain:** TIKTRACK  
**id:** TEAM_50_TO_TEAM_20_S002_P002_WP003_GATE7_PARTA_BLOCK_ANALYSIS_AND_REMEDIATION_REQUEST  
**from:** Team 50 (QA/FAV)  
**to:** Team 20 (Backend Implementation)  
**cc:** Team 10, Team 90  
**date:** 2026-01-31  
**historical_record:** true
**status:** ACTIVE — חסימה נמשכת  
**gate_id:** GATE_7  
**work_package_id:** S002-P002-WP003  
**in_response_to:** TEAM_20_TO_TEAM_10_S002_P002_WP003_GATE7_PARTA_REMEDIATION_COMPLETION  

---

## 1) סיכום מנהלים

**CC-04 עדיין BLOCK.** אין העברה ל־Team 60 כל עוד החסימה קיימת.

בדיקות חוזרות לאחר תיקוני Team 20: **3 מופעי 429** בלוג (`pass_04=False`). נדרשת חקירה מעמיקה ומסגור תיקונים ברורים לפני הגשה חוזרת ל־Team 50.

---

## 2) תוצאות הבדיקה החוזרת

| פריט | תוצאה |
|------|--------|
| `scripts/run_g7_part_a_evidence.py` (4 EOD cycles, 60s delay) | cc_wp003_04_yahoo_429_count=**3**, pass_04=**False** |
| AUTO-WP003 Phase 2 | 4/4 PASS |

**לוגים לדוגמה:**
- `documentation/05-REPORTS/artifacts/G7_PART_A_RUNTIME_EVIDENCE_2026-03-11_212850.log`
- `documentation/05-REPORTS/artifacts/G7_PART_A_RUNTIME_EVIDENCE_2026-03-11_221540.log`

---

## 3) ניתוח שורש הבעיה (Root Cause)

### 3.1 זרימת הקוד שנכשלת

```
sync_ticker_prices_eod.main()
  → fetch_prices_for_tickers(tickers)
      → Yahoo batch: get_ticker_prices_batch(symbols)  [v7/finance/quote]
      → אם batch נכשל (401) או symbol חסר → yahoo_batch[symbol] = None
      → לולאה per-ticker: עבור symbol שאינו ב־yahoo_batch
          → provider.get_ticker_price(symbol)  [Yahoo]
              → _fetch_price_sync(symbol)
                  → **Primary: _fetch_last_close_via_v8_chart(symbol)**  ← 429 כאן
                  → Fallback: yfinance
                  → Final: _fetch_price_via_quote_api(symbol)  [v7]
```

### 3.2 חמש השערות מרכזיות

| # | השערה | מיקום קוד | מצב |
|---|-------|-----------|-----|
| **H1** | **v8/chart מופעל ראשון** — ב־`_fetch_price_sync` ה-primary הוא v8/chart; v8 נתון ל־rate limit גבוה יותר מ־v7. | `yahoo_provider.py` ~374–377 | **אושר** |
| **H2** | **v7 batch לא מחזיר ANAU.MI** — v7/quote לפעמים לא מחזיר מניות אירופאיות (לדוגמה איטליה) בבאצ' מרובה־סימבולים. | `_fetch_prices_batch_sync` | **סביר** |
| **H3** | **401 על v7/quote** — Yahoo מחזיר 401 Unauthorized לבאצ'; כשל זה מרוקן את yahoo_batch ומוביל ל־per-ticker. | `yahoo_provider.py` v7 quote | **אושר (לוג)** |
| **H4** | **Cooldown לא נשמר בין subprocess** — `run_g7_part_a_evidence` מריץ 4 subprocessים; cooldown ב־memory בלבד ואינו עובר בין תהליכים. | `provider_cooldown.py`, `run_g7_part_a_evidence.py` | **אושר** |
| **H5** | **ANAU.MI ממוקד ב־429** — סימבול ספציפי (מילאנו) מועד יותר ל־429 ב־v8/chart. | לוג — "429 for ANAU.MI" | **אושר** |

### 3.3 ציטוטים מהלוג

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

---

## 4) המלצות ל־Team 20

### 4.1 שינוי סדר ה־API ב־`_fetch_price_sync` (עיקרי)

**בעיה:** v8/chart (primary) גורם ל־429 לפני שנוגעים ב־v7/quote.

**המלצה:** ב-EOD path (לפחות עבור per-ticker fallback), נסה **v7/quote לפני v8/chart**:

- v7/quote: קריאה אחת לסימבול, פחות חשוף ל־429.
- v8/chart: יותר רגיש ל־rate limit.

**מיקום:** `api/integrations/market_data/providers/yahoo_provider.py` — `_fetch_price_sync`.

**אפשרויות יישום:**
- אופציה א': היפוך סדר — קודם `_fetch_price_via_quote_api`, אחר כך v8/chart.
- אופציה ב': פרמטר/flag ל־EOD path שמפעיל v7-first.
- אופציה ג': לנסות v7 עבור symbol בודד לפני v8 בכל per-ticker fallback.

### 4.2 טיפול ב־401 Unauthorized

**בעיה:** v7/quote מחזיר 401 לפעמים — יש לבדוק User-Agent, cookies, ו־headers.

**המלצה:** לוודא:
- rotation של User-Agent.
- בדיקה אם Yahoo דורש headers נוספים.
- logging מפורט ל־401 (URL, headers בסיסיים) לצורך דיבוג.

### 4.3 בדיקת תמיכת v7 ב־ANAU.MI

**המלצה:** הרצת בדיקה נקודתית:

```
curl -s "https://query1.finance.yahoo.com/v7/finance/quote?symbols=ANAU.MI" -H "User-Agent: Mozilla/5.0..."
```

- אם v7 מחזיר מחיר תקין → להשתמש ב־v7 לפני v8.
- אם v7 לא תומך → לשקול Alpha/מקור אחר עבור ANAU.MI.

### 4.4 Cooldown בין מחזורים

**בעיה:** `run_g7_part_a_evidence` מריץ subprocess לכל מחזור; cooldown לא נשמר.

**המלצה:**
- אופציה א': להריץ את 4 המחזורים **בתוך תהליך אחד** (לולאה ב־Python) במקום subprocess.
- אופציה ב': לשמור cooldown ב־DB / קבצי מערכת (כמו Alpha) — יותר מורכב.
- אופציה ג': להשאיר 4 subprocessים אבל להבטיח שאין 429 בכלל (דרך v7-first וצמצום קריאות).

---

## 5) קריטריונים להצלחה (חובה לפני הגשה חוזרת)

| # | קריטריון | אימות |
|---|----------|-------|
| **C1** | **אפס 429 בלוג** | `grep -c "429" <log> == 0` לאחר `python3 scripts/run_g7_part_a_evidence.py` |
| **C2** | **pass_04=True** | `pass_04=True` בדפדוף ה-JSON/משתנים |
| **C3** | **בדיקה נקודתית מקומית** | Team 20 מריץ `run_g7_part_a_evidence` **במקום** ועובר C1+C2 לפני כל שליחה ל־Team 50 |
| **C4** | **אין הרצת QA ללא אישור C1–C3** | Team 50 לא יריץ QA חוזר עד שהקריטריונים מסומנים כ־PASS |

---

## 6) בדיקות נקודתיות חובה לפני הגשה

**דרישה:** Team 20 חייב להריץ את הבדיקות הבאות **במקום**, ולוודא שהן עוברות, **לפני** כל הגשה חוזרת ל־Team 50.

### 6.1 בדיקה 1 — EOD full run (4 cycles)

```bash
cd <project_root>
GATE7_CC_EVIDENCE=1 python3 scripts/run_g7_part_a_evidence.py
```

**תנאי הצלחה:** הפלט כולל `pass_04=True`, ו־`cc_wp003_04_yahoo_429_count=0`.

### 6.2 בדיקה 2 — ספירת 429 בלוג

```bash
LOG=<path_from_run_g7_output>
grep -c "429" "$LOG"
```

**תנאי הצלחה:** תוצאה = 0.

### 6.3 בדיקה 3 — ANAU.MI נקודתי (אופציונלי)

```bash
python3 -c "
# Run from project root
from api.integrations.market_data.providers.yahoo_provider import _fetch_price_via_quote_api, _fetch_last_close_via_v8_chart
r7 = _fetch_price_via_quote_api('ANAU.MI')
r8 = _fetch_last_close_via_v8_chart('ANAU.MI')
print('v7:', r7)
print('v8:', r8)
"
```

**מטרה:** לוודא אם v7 תומך ב־ANAU.MI לפני v8.

---

## 7) דרישת הגשה חוזרת

**לא תעבור העברה ל־Team 60 כל עוד CC-04 חסום.**

**תהליך חובה:**
1. Team 20 מיישם את ההמלצות ומבצע את הבדיקות הנקודתיות (§6).
2. Team 20 מאשר שכל קריטריוני ההצלחה (§5) מסומנים כ־PASS.
3. Team 20 שולח ל־Team 50 מסמך השלמת תיקון מעודכן הכולל:
   - פירוט השינויים
   - תוצאות הבדיקות הנקודתיות
   - הפניה ללוג עם `pass_04=True`, `count_429=0`
4. Team 50 מריץ QA חוזר על בסיס המסמך המעודכן.

---

## 8) מסמכים רלוונטיים

| מסמך | תפקיד |
|------|--------|
| TEAM_20_TO_TEAM_10_S002_P002_WP003_GATE7_PARTA_REMEDIATION_COMPLETION | דוח השלמת התיקון הקודם |
| TEAM_10_TO_TEAM_20_S002_P002_WP003_GATE7_PARTA_REMEDIATION_CANONICAL_PROMPT_v1.0.0 | פרומפט קנוני |
| yahoo_provider.py (374–404) | _fetch_price_sync — סדר v7 vs v8 |
| provider_cooldown.py | Cooldown in-memory; אין persistence ל־Yahoo |

---

**log_entry | TEAM_50 | GATE7_PARTA_BLOCK_ANALYSIS | TO_TEAM_20 | ACTIVE | 2026-01-31**
