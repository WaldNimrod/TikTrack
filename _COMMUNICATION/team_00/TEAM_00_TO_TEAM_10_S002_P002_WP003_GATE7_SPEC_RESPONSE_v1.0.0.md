# Team 00 → Team 10 | GATE_7 LOD400 Spec Response — WP003 GIN-001..006

**project_domain:** TIKTRACK
**id:** TEAM_00_TO_TEAM_10_S002_P002_WP003_GATE7_SPEC_RESPONSE_v1.0.0
**from:** Team 00 (Chief Architect)
**to:** Team 10 (Execution Orchestrator)
**cc:** Teams 20, 30, 50, 60, 90
**date:** 2026-03-11
**work_package_id:** S002-P002-WP003
**gate:** GATE_7 — In response to GIN-001..006

---

## ⚠️ SECTION 0 — DECISIONS REQUIRED FROM NIMROD (בלוק העברה)

**הוראה לצוות 10:** אין להתחיל פיתוח על הנקודות שמסומנות [NIMROD_DECISION] עד לאישור בעל פה או בכתב.

---

### [NIMROD_DECISION_A] — GIN-003 Q1.1: אופן פתיחת תפריט הפעולות

**ממצא #7:** תפריט הפעולות נסגר לפני שהמשתמש מגיע אליו.

**אופציה A (מומלץ): Hover-only עם zone משותפת**
- התפריט נפתח עם hover על השורה (delay 150ms)
- קיים CSS gap=0 בין השורה לפאנל — zone hover אחת רציפה
- נסגר רק כשהעכבר עוזב גם השורה וגם הפאנל (exit delay 100ms)
- פשוט יותר, מהיר, ללא click נוסף

**אופציה B: Click-to-open**
- אייקון `⋮` בסוף כל שורה — click → dropdown
- נסגר עם click מחוץ לתפריט
- מפורש יותר, פחות accidental

**→ נדרשת בחירה: A או B?**

---

### [NIMROD_DECISION_B] — GIN-004 Q2.3: פורמט היסטוריית ריצות

**ממצא #11:** הצגת היסטוריה לכל משימה.

**אופציה A (מומלץ): Inline expand**
- כפתור `▼ היסטוריה` מתחת/בצד כל משימה
- לחיצה פותחת שורות inline (5 ריצות אחרונות)
- ללא modal נוסף

**אופציה B: Modal**
- כפתור "הצג היסטוריה" → פותח phoenix-form modal עם טבלה פגינציה

**→ נדרשת בחירה: A או B?**

---

### [NIMROD_DECISION_C] — GIN-005 Q3.1+Q3.2: Heat Indicator — נוסחה וסף

**ממצא #14:** כרטיס load indicator להגדרות Market Data.

**נוסחה מוצעת (Option A — פשוטה ושקופה):**
```
load_pct = (active_tickers / max_active_tickers) × 100
```
- `active_tickers` = מ-GET /tickers/summary
- `max_active_tickers` = מ-GET /settings/market-data
- אינטואיטיבי: "אתה משתמש ב-X% מהקיבולת המוגדרת"

**נוסחה חלופית (Option B — משוקלל API):**
```
load_pct = (active_tickers × avg_calls_per_ticker × interval_overhead) / daily_quota × 100
```
- מורכב יותר, פחות שקוף לאדמין

**ספי תצוגה:**

| | 3-רמות (Option A — מומלץ) | 5-רמות (Option B) |
|--|--|--|
| ירוק | 0–49% | 0–39% (Very Low + Low) |
| צהוב | 50–79% | 40–69% (Medium) |
| אדום | ≥80% | 70–89% High + ≥90% Critical |

**→ נדרשת בחירה: נוסחה (A/B) + ספים (A/B)?**

---

*לאחר קבלת 3 ההחלטות לעיל — פיתוח מלא יכול להתחיל על כל GIN בו-זמנית.*

---

---

## SECTION 1 — GIN-001: Price Semantics and Traffic Light

### Q1.1 | current_price לעומת last_close_price — הגדרות סמנטיות

**ARCHITECTURAL ANSWER — LOCKED:**

| שדה | הגדרה | מקור |
|-----|--------|------|
| `current_price` | המחיר הטוב ביותר הזמין עכשיו: EOD row rn=1 (הסשן הנוכחי), או INTRADAY_FALLBACK אם EOD ישן | `_get_price_with_fallback()` → ticker_prices rn=1 / ticker_prices_intraday latest |
| `last_close_price` | סגירת הסשן הקודם: EOD row rn=2. אם רק שורה אחת קיימת (טיקר חדש) → שווה ל-current_price | `_get_price_with_fallback()` → ticker_prices rn=2 |
| `daily_change_pct` | `(current_price - last_close_price) / last_close_price × 100` | מחושב ב-service |

**מתי הם שונים:**
- כאשר ≥2 שורות EOD קיימות ב-`market_data.ticker_prices` לאותו ticker_id
- בפועל: מהיום השני לאחר הסנכרון הראשון, יש ≥2 שורות → הם ייפרדו

**מתי הם שווים:**
- טיקר חדש עם שורת EOD אחת בלבד (Fallback: `last_close = close_price or price_val`)
- בעת intraday בלבד (אין EOD): `last_close` מהשמור בעת קריאת EOD הקודמת

**הצגה בעמוד:**
- `current_price` = עמודת "מחיר" (עם currency symbol)
- `last_close_price` = בdetail modal בלבד (לא בטבלה ראשית)
- `daily_change_pct` = עמודת "%שינוי" (ירוק אם חיובי, אדום אם שלילי)

---

### Q1.2 | price_as_of_utc לעומת last_close_as_of_utc

| שדה | הגדרה | עמודה בUI |
|-----|--------|-----------|
| `price_as_of_utc` | timestamp של current_price (UTC) | "עודכן ב" בטבלה הראשית |
| `last_close_as_of_utc` | timestamp של last_close_price (UTC) | בdetail modal בלבד |

**פורמט תצוגה (he-IL):** `DD/MM/YYYY HH:MM` — כמו `formatPriceAsOf()` הקיים

---

### Q2.1+Q2.2 | TASE — המרת אגורות לשקלים (BUG — CODE FIX REQUIRED)

**ממצא #6: סטטוס — BUG CONFIRMED, CODE CHANGE REQUIRED**

**הבעיה:** Yahoo Finance מחזיר מחירי TASE (סיומת `.TA`, כגון TEVA.TA) ביחידות **אגורות** (ILA — Israeli Agorot), לא שקלים. 1 ש"ח = 100 אגורות.

**אין המרה בקוד הנוכחי.** לא ב-yahoo_provider.py ולא ב-alpha_provider.py.

**Fix — Team 20:**

**קובץ:** `api/integrations/market_data/providers/yahoo_provider.py`

**פונקציה 1:** `_fetch_prices_batch_sync()` — לאחר `price = _to_decimal(raw_price)`:
```python
# TASE agorot-to-ILS conversion: Yahoo returns TASE prices in ILA (agorot)
# 1 ILS = 100 ILA. Detection: symbol ends with '.TA'
if sym.upper().endswith('.TA') and price and price > 0:
    price = (price / Decimal("100")).quantize(Decimal("0.00000001"))
# Also apply to close_price if present
if sym.upper().endswith('.TA') and close_raw:
    close_raw_dec = _to_decimal(close_raw)
    if close_raw_dec:
        close_raw = str(close_raw_dec / Decimal("100"))
```

**פונקציה 2:** `_fetch_last_close_via_v8_chart()` — אותה לוגיקה, apply ÷100 על כל price fields אחרי parse.

**גם לבדוק:** `api/integrations/market_data/providers/alpha_provider.py` — פונקציה `_get_price_from_timeseries_daily()` מטפלת ב-TEVA.TA ו-ANAU.MI — יש לבדוק ולהוסיף המרה גם שם אם Alpha גם מחזיר אגורות (בדיקה: value > 500 לסימבול TEVA.TA כנראה = אגורות).

**כלל detection:**
- חל על כל symbol שמסתיים ב-`.TA`
- חל גם על high/low/open/close אם מחושבים מ-v8 chart
- חל על `regularMarketPreviousClose` בנוסף ל-`regularMarketPrice`

---

### Q3.1+Q3.2 | price_source null — תנאי הופעת traffic light

**ARCHITECTURAL ANSWER — LOCKED:**

**מתי `price_source = null`:**
אין שורות ב-`market_data.ticker_prices` (EOD) **וגם** אין שורות ב-`market_data.ticker_prices_intraday` עבור ticker_id זה.

**מקרים:**
1. טיקר חדש — טרם בוצע EOD sync אחד
2. כל הטיקרים אדומים = **אין נתונים ב-DB** = ה-sync jobs לא רצו מאז הקמת הסביבה (runtime issue, לא code bug)

**טבלת traffic light (קיים, לא לשנות):**

| price_source | צבע | Hebrew tooltip |
|---|---|---|
| `EOD` | ● ירוק | "נתונים מסגירה — מעודכן" |
| `EOD_STALE` | ● צהוב | "נתוני סגירה ישנים (>48 שעות)" |
| `INTRADAY_FALLBACK` | ● צהוב | "נתונים תוך-יומיים (EOD ישן)" |
| `null` | ● אדום | "אין נתונים — ממתין לסנכרון" |

**התיקון הנדרש לממצא #1 ו-#2:**
- **אין code bug בלוגיקת traffic light**
- הצגת "—" ב"מקור" ו"עודכן ב" היא התנהגות תקינה כאשר `price_source=null`
- **Fix נדרש:** אחרי הרצת sync jobs (intraday/EOD) הנתונים יאוכלסו → traffic light ייצבע

**ה-tooltip על traffic light אדום** צריך לאמר: **"אין נתונים — יש לרוץ EOD sync"** (עדכון priceReliabilityLabels.js)

**מינימום להצגת green:** שורה ב-`market_data.ticker_prices` שנוצרה לפני פחות מ-48 שעות

---

## SECTION 2 — GIN-002: Ticker Status and Summary

### Q1.1 | status vs is_active — מיפוי קנוני

**LOCKED — מקור: TT2_TICKER_STATUS_MARKET_DATA_LOADING_SSOT + schemas/tickers.py**

| status (DB/API) | עברית | is_active (bool) | טעינת נתונים |
|---|---|---|---|
| `pending` | ממתין | `false` | EOD + היסטוריה בלבד (אין Intraday) |
| `active` | פתוח | `true` | Intraday + EOD + היסטוריה (קצב מלא) |
| `inactive` | סגור | `false` | EOD + היסטוריה בלבד |
| `cancelled` | מבוטל | `false` | **לא טוען נתונים כלל** |

**מה קיים עכשיו בקוד:**
- `TickerResponse` מחזיר גם `status: str` וגם `is_active: bool`
- `tickers_service.py` מגדיר: `active_ids = {t.id for t in tickers if t.is_active}` — אם is_active=True → מקבל intraday
- `t.status or "active"` — fallback אם status=NULL

**עמודת status בטבלה:**
- מקור: `t.status` מה-API
- המרה: `toHebrewStatus()` (statusAdapter.js קיים)
- סינון: `is_active` filter כבר קיים (3-button group: הכל / פעיל / לא פעיל)

---

### Q2.1 | Hebrew legend text — לאחר הטבלה

**LOCKED — לצרף legend אחרי טבלת הטיקרים:**

```html
<div class="ticker-status-legend" role="note" aria-label="מקרא סטטוסים">
  <span class="legend__title">מקרא סטטוס:</span>
  <span class="legend__item">
    <span class="status-badge status--pending">ממתין</span> — EOD + היסטוריה בלבד, אין Intraday
  </span>
  <span class="legend__item">
    <span class="status-badge status--active">פתוח</span> — נתונים מלאים: Intraday + EOD + היסטוריה
  </span>
  <span class="legend__item">
    <span class="status-badge status--inactive">סגור</span> — EOD + היסטוריה בלבד
  </span>
  <span class="legend__item">
    <span class="status-badge status--cancelled">מבוטל</span> — לא טוען נתונים
  </span>
</div>
```

---

### Q3.1+Q3.2 | Summary element — מה מוצג ומהיכן

**LOCKED — מקור: `tickers_service.get_summary()` + `TickerSummaryResponse`:**

```python
# tickers_service.py line 567-575
# total_tickers = COUNT(tickers WHERE deleted_at IS NULL)
# active_tickers = COUNT(tickers WHERE is_active=True AND deleted_at IS NULL)
```

| שדה בUI | ID element | מקור API | משמעות |
|---|---|---|---|
| "סה"כ טיקרים" | `#totalTickers` | `total_tickers` | כל הטיקרים (גם לא פעילים) |
| "טיקרים פעילים" | `#activeTickers` | `active_tickers` | is_active=True |

**ממצא #9 — Summary mismatched data:**
הסיכום מציג **נתוני global** (כל הטיקרים) גם כאשר **פילטר** פעיל. זהו ה-mismatch.

**Fix:**
- כאשר יש פילטר פעיל (ticker_type/is_active/search): הסיכום יציג `${tableData.total} טיקרים מוצגים מתוך ${summary.total_tickers} (${summary.active_tickers} פעילים)`
- כאשר אין פילטר: `סה"כ: ${summary.total_tickers} טיקרים | פעילים: ${summary.active_tickers}`

**פורמט HTML מוצע:**
```html
<!-- כאשר אין פילטר -->
<div>סה"כ טיקרים: <strong id="totalTickers">0</strong></div>
<div>טיקרים פעילים: <strong id="activeTickers">0</strong></div>

<!-- כאשר פילטר פעיל (class="summary--filtered") -->
<div>מוצגים: <strong id="tableTickersCount">0</strong> מתוך <strong id="totalTickers">0</strong></div>
<div>פעילים (global): <strong id="activeTickers">0</strong></div>
```

---

## SECTION 3 — GIN-003: Table Actions Menu UX

### Q1.2 | Hover delay — ערך בmilliseconds

**LOCKED — 150ms hover-in, 100ms exit:**

```javascript
// Trigger time: 150ms after hover enters row → menu appears
// Exit time: 100ms after hover leaves BOTH row AND menu panel → menu closes
// This prevents flicker on accidental mouse movement
const HOVER_DELAY_MS = 150;
const EXIT_DELAY_MS = 100;
```

Rationale: 150ms מפחית trigger בטעות; 100ms exit מונע flicker כשהעכבר עובר מהשורה לפאנל.

---

### Q2.1 | CSS gap fix — hover zone רציפה

**LOCKED — בין השורה לפאנל חייב להיות gap=0:**

```css
/* עמוד הטיקרים — actions menu */
.phoenix-table__row--has-actions {
  position: relative;
}

.table-actions-menu {
  position: absolute;
  top: 100%;      /* מיד אחרי השורה — ללא gap */
  right: 0;
  margin-top: 0;  /* ✅ 0px gap */
  z-index: 100;
}

/* ⚠️ לא להוסיף margin-top או padding-top על הפאנל */
/* gap גורם לבעיית "מעבר אוויר" שסוגר את הפאנל */
```

**Alternative (אם Hover-A נבחר):** ה-hover zone כוללת גם שורה וגם פאנל:
```javascript
// Pseudo-code:
row.addEventListener('mouseenter', () => scheduleOpen(HOVER_DELAY_MS));
row.addEventListener('mouseleave', () => {
  // רק אם העכבר לא על הפאנל
  if (!menuPanel.matches(':hover')) scheduleClose(EXIT_DELAY_MS);
});
menuPanel.addEventListener('mouseenter', () => cancelClose());
menuPanel.addEventListener('mouseleave', () => {
  if (!row.matches(':hover')) scheduleClose(EXIT_DELAY_MS);
});
```

---

### Q3.1 | Exit rules — מתי הפאנל נסגר

**LOCKED:**
1. כשה-hover עוזב גם השורה וגם הפאנל (exit delay 100ms) [אם Hover-A]
2. כש-click מחוץ לפאנל [תמיד]
3. כשנבחרת פעולה מהפאנל
4. כשהמשתמש לוחץ Escape

---

### Q2.2 | Active area — מה נחשב "בתוך" ה-hover zone

**LOCKED:**
- השורה כולה (כל ה-`<tr>`)
- פאנל הפעולות
- לא כולל: שאר הטבלה, header, footer

---

## SECTION 4 — GIN-004: System Management

### Q1.1+Q1.2 | מיפוי תרחישים → UI

**LOCKED — מקור: `api/background/scheduler_registry.py`**

שלושה jobs רשומים ב-JOB_REGISTRY:

| job_name | תרחיש | כפתור verify | כפתור run |
|---|---|---|---|
| `sync_ticker_prices_intraday` | CC-WP003-01/02/04 (Yahoo call count, 429 check) | `last_status` + `last_run_at` columns | `POST /admin/background-jobs/sync_ticker_prices_intraday/trigger` |
| `sync_exchange_rates_eod` | Exchange rates sync | `last_status` + `last_run_at` | `POST /admin/background-jobs/sync_exchange_rates_eod/trigger` |
| `check_alert_conditions` | Alert conditions | `last_status` + `last_run_at` | `POST /admin/background-jobs/check_alert_conditions/trigger` |

**הגדרת "אימות" vs "הרצה" (Q1.3):**
- **אימות** = צפייה בסטטוס: `last_status` (COMPLETED/FAILED/RUNNING) + `last_run_at` + indicator צבע
- **הרצה** = trigger ידני: `POST /{job}/trigger` → מחזיר `{"triggered": true}`

---

### Q2.1+Q2.2 | Job Run History API — קיים!

**LOCKED — API קיים ב-`api/routers/background_jobs.py`:**

```
GET /admin/background-jobs/runs
  → {items: [{job_name, id, started_at, status, duration_ms}], count: N}
  Query: ?limit=20 (default), max=100

GET /admin/background-jobs/{job_name}/history
  → {job_name, items: [{id, started_at, status, duration_ms, records_processed, error_count}]}
  Query: ?limit=20

GET /admin/background-jobs/{job_name}
  → {job_name, description, history: [last 20 runs in 24h, incl. completed_at, records_updated, error_count]}
```

**Schema per run item:**
```json
{
  "id": "UUID string",
  "started_at": "ISO8601 UTC",
  "completed_at": "ISO8601 UTC | null",
  "status": "COMPLETED | FAILED | RUNNING | PENDING",
  "duration_ms": 1234,
  "records_processed": 10,
  "records_updated": 8,
  "error_count": 0
}
```

**אין צורך בAPI חדש.** API קיים. רק UI לממש.

---

### Q3.1 | Enable/Disable Timer API — קיים!

**LOCKED — `POST /admin/background-jobs/{job_name}/toggle`:**

```javascript
// Response: {"job_name": "sync_ticker_prices_intraday", "enabled": true/false}
// Logic: job.pause() / job.resume() via APScheduler
// job.next_run_time === null → job is paused
```

**UI toggle:** כפתור "הפסק/הפעל" לכל job. אם `is_scheduled=false` בtrigger → disabled state + tooltip "Job not in scheduler".

---

### Q3.2 | שדות ניתנים לעריכה במודל Edit

**LOCKED:**

| שדה | ניתן לעריכה | מקום השמירה | הערה |
|-----|------------|-------------|------|
| `description` / label | לא (read-only) | scheduler_registry.py | iron rule — labels מה-registry בלבד |
| interval (minutes) | **כן** — עבור `sync_ticker_prices_intraday` | `market_data.system_settings.intraday_interval_minutes` | עדכון דרך `PATCH /settings/market-data` |
| enabled/disabled | **כן** | APScheduler runtime (volatile) | **לא נשמר בין restarts** — Iron Rule |
| trigger (cron/interval type) | **לא** | scheduler_registry.py | שינוי דורש code change |

**UI Edit modal — שדות להציג:**
1. `job_name` — read-only
2. `description` — read-only
3. `trigger_type` — read-only ("interval")
4. `interval_minutes` — editable (רק עבור sync_ticker_prices_intraday, ו-off_hours_interval_minutes)
5. `enabled` — toggle (volatile, runtime only)

**כפתורי פעולה לכל job:**
- `הפעל עכשיו` (trigger) — זמין כאשר enabled=true
- `הפסק/הפעל טיימר` (toggle) — תמיד זמין
- `עריכה` (interval edit) — רק לjobs שה-interval מגיע מ-settings

---

### Q3.3 | Labels — מאיפה באים

**LOCKED — `scheduler_registry.py` הוא SSOT:**

```python
# כל job יש description:
"description": "Syncs intraday price data for active tickers"
"description": "EOD sync of exchange rates (Alpha→Yahoo)..."
"description": "Evaluates alert conditions against latest market data"
```

אלה הtextים שיוצגו בUI. **לא להוסיף labels חדשים ב-DB** — Iron Rule.

**Hebrew translation table:**

| job_name | תיאור עברי |
|---|---|
| `sync_ticker_prices_intraday` | סנכרון מחירי טיקרים (Intraday) |
| `sync_exchange_rates_eod` | סנכרון שערי חליפין (EOD) |
| `check_alert_conditions` | בדיקת תנאי התראות |

---

### UI Design — Background Jobs Table (Full Spec)

**עמודות הטבלה המורחבת:**

| עמודה | תוכן | מקור API |
|---|---|---|
| משימה | job_name + description עברי | `job_name`, `description` |
| מרווח | interval (אם קיים) | מ-`description` / settings |
| הרצה אחרונה | `last_run_at` formatted he-IL | `last_run_at` |
| סטטוס | `last_status` badge (ירוק/אדום/אפור) | `last_status` |
| Enabled | toggle (on/off indicator) | `is_scheduled` |
| פעולות | [הפעל] [עצור/הפעל] [עריכה] [היסטוריה] | — |

**Status badge mapping:**
- `COMPLETED` → badge ירוק "הסתיים"
- `FAILED` → badge אדום "נכשל"
- `RUNNING` → badge כחול "פועל"
- `null` → badge אפור "טרם רץ"
- `is_scheduled=false` → badge אפור "לא מתוזמן"

---

## SECTION 5 — GIN-005: Market Data Settings

### Q1.1 | טבלת Validation Boundaries — מלאה

**LOCKED — מקור: `api/integrations/market_data/market_data_settings.py`**

```python
_SSOT = {
    "max_active_tickers": (min=1, max=500, default=50),
    "intraday_interval_minutes": (min=5, max=240, default=15),
    "off_hours_interval_minutes": (min=15, max=240, default=60),
    "provider_cooldown_minutes": (min=5, max=120, default=15),
    "alpha_quota_cooldown_hours": (min=6, max=48, default=24),
    "max_symbols_per_request": (min=1, max=50, default=50),
    "delay_between_symbols_seconds": (min=0, max=30, default=1),
    "intraday_enabled": (None, None, default=True),
}
```

**⚠️ Gap ב-UI הנוכחי — REQUIRED FIX (Team 30):**

| שדה | UI נוכחי | SSOT | Action |
|-----|---------|------|--------|
| `max_active_tickers` | ✅ min=1 max=500 default=50 | ✅ | — |
| `intraday_interval_minutes` | ✅ min=5 max=240 default=15 | ✅ | — |
| `off_hours_interval_minutes` | ❌ **חסר לחלוטין** | min=15 max=240 default=60 | **הוסף שדה** |
| `provider_cooldown_minutes` | ✅ min=5 max=120 default=15 | ✅ | — |
| `alpha_quota_cooldown_hours` | ❌ **חסר לחלוטין** | min=6 max=48 default=24 | **הוסף שדה** |
| `max_symbols_per_request` | ⚠️ default=5 בUI, 50 בSSO | min=1 max=50 default=**50** | **תקן default** |
| `delay_between_symbols_seconds` | ⚠️ default=0 בUI, 1 בSSO | min=0 max=30 default=**1** | **תקן default** |
| `intraday_enabled` | ✅ boolean | ✅ | — |

**סה"כ: 2 שדות חסרים, 2 default שגויים.**

---

### Q1.2 | validation_errors Schema

**LOCKED — כאשר PATCH /settings/market-data מחזיר 422:**

```json
{
  "status_code": 422,
  "detail": "Validation failed",
  "validation_errors": [
    {
      "key": "intraday_interval_minutes",
      "value": 300,
      "error": "ערך 300 מחוץ לטווח. מותר: 5–240",
      "min": 5,
      "max": 240
    }
  ]
}
```

**UI Error Display — per field (Team 30 Fix):**
```javascript
// כיום: msg = e.validation_errors.map(v => `${v.key}: ${v.error}`).join('; ')
// שיפור: highlight השדה הספציפי + הצגת error inline מתחת לshדה:

// לכל validation_error:
const input = form.querySelector(`[data-key="${v.key}"]`);
if (input) {
  input.classList.add('input--error');
  const errMsg = document.createElement('span');
  errMsg.className = 'field-error-message';
  errMsg.textContent = v.error;
  input.parentNode.appendChild(errMsg);
}
```

---

### Q4.1 | Recommendations — טקסט הסבר לכל שדה

**LOCKED — לצרף tooltip/hint לכל שדה (עברית):**

| שדה | hint text |
|-----|-----------|
| `max_active_tickers` | "מספר מקסימלי של טיקרים שמקבלים עדכון Intraday בו-זמנית. ≥50 = עומס גבוה." |
| `intraday_interval_minutes` | "כל כמה דקות מתבצע עדכון Intraday. ערך נמוך = עומס API גבוה." |
| `off_hours_interval_minutes` | "מרווח בין עדכונים מחוץ לשעות המסחר. ניתן לקבוע ערך גבוה יותר לחיסכון בAPI." |
| `provider_cooldown_minutes` | "המתנה אחרי קבלת שגיאת 429 (Rate Limit). ערך נמוך = סיכון לחסימה חוזרת." |
| `alpha_quota_cooldown_hours` | "המתנה לאחר ניצול quota יומי של Alpha Vantage. ברירת מחדל: 24 שעות." |
| `max_symbols_per_request` | "כמה סימבולים שולחים בבקשה אחת ל-Yahoo. Yahoo מגביל לפחות מ-50 במקביל." |
| `delay_between_symbols_seconds` | "השהייה בין בקשות. ערך גבוה = פחות 429, זמן sync ארוך יותר." |
| `intraday_enabled` | "כיבוי → Intraday sync לא פועל כלל. EOD עדיין פועל." |

---

### Q3.1+Q3.2 | Heat Indicator Card — [PENDING NIMROD_DECISION_C]

**בהמתנה להחלטה C לעיל.**

**ברגע שהחלטה C מתקבלת — Spec מלא:**

**Component:** `<div class="market-data-heat-card">` בתוך ה-market-data-settings container.

```html
<div class="market-data-heat-card" aria-label="עומס נתוני שוק">
  <div class="heat-card__title">עומס מערכת</div>
  <div class="heat-card__value">
    <span class="heat-indicator heat-indicator--[low|medium|high]">XX%</span>
  </div>
  <div class="heat-card__detail">
    <span>טיקרים פעילים: <strong id="heatActiveTickers">–</strong></span>
    <span>מקסימום: <strong id="heatMaxTickers">–</strong></span>
  </div>
</div>
```

**Data fetch:** שאר שדות כבר נטענים. רק לחשב load_pct מ-`active_tickers / max_active_tickers × 100`.

**CSS classes per threshold (לאחר קבלת החלטה C):**
```css
.heat-indicator--low    { color: var(--apple-green); }
.heat-indicator--medium { color: var(--apple-orange); }
.heat-indicator--high   { color: var(--apple-red); }
```

---

## SECTION 6 — GIN-006: QA Automation

### Q1.1 | Runtime Assertions — E2E spec

**LOCKED — assertsions חדשים נדרשים:**

**AUTO-WP003-01 UPDATE** (לאחר trigger sync, assert runtime data):
```javascript
// After POST /admin/background-jobs/sync_ticker_prices_intraday/trigger + poll for COMPLETED:
// 1. GET /tickers → for each active ticker: assert price_source !== null
// 2. GET /tickers → for TEVA.TA: assert current_price < 200 (shekel range, not agorot range)
// 3. GET /admin/background-jobs/sync_ticker_prices_intraday → assert last_status === 'COMPLETED'
// 4. GET /admin/background-jobs/sync_ticker_prices_intraday → assert last_run_at within last 5 minutes
```

**AUTO-WP003-02 UPDATE** (market_cap assertion):
```javascript
// After EOD sync:
// DB query via test endpoint: assert market_cap IS NOT NULL for ANAU.MI, BTC-USD, TEVA.TA
// (mirrors CC-WP003-03)
```

**AUTO-WP003-03 NEW** (settings validation):
```javascript
// PATCH /settings/market-data with {intraday_interval_minutes: 999}
// Assert: 422 response
// Assert: validation_errors[0].key === 'intraday_interval_minutes'
// Assert: validation_errors[0].error includes "240"
```

**AUTO-WP003-04 NEW** (actions menu stability):
```javascript
// Navigate to /tickers
// Hover row → wait 200ms → assert menu panel is visible (aria-hidden=false)
// Move mouse to menu panel → assert menu panel still visible
// Press Escape → assert menu panel not visible
```

---

### Q2.1 | AUTO-WP003 Update Decision — LOCKED

**Decision:** AUTO-WP003 scripts update to Phase 2 (Runtime Data) assertions.

**Approach:**
- **לא לשנות** את הassertions הקיימים (Phase 1 — code presence checks) — הם תקינים
- **להוסיף** Phase 2 assertions כ-separate test file: `tests/auto-wp003-runtime.test.js`
- שתי קבוצות: Phase 1 (code) + Phase 2 (runtime) — מריצים בנפרד

**Reasoning:** Phase 2 דורש running server + sync jobs + live data. Phase 1 יכול לרוץ ב-isolation. הפרדה = testability + speed.

---

### Q3.1 | Timing — מתי auto tests מתעדכנים

**LOCKED:**
- Phase 2 tests נכתבים **לאחר** ממצאי #1, #2, #5, #6 תוקנו (sync jobs רצו)
- Auto tests חדשים = GATE_4 artifact עבור re-entry WP003
- Team 50: כותב את `tests/auto-wp003-runtime.test.js`

---

## SECTION 7 — ממצא #3: Detail Modal — Loading Indicator

### Spec (Finding #3 — P1)

**הבעיה:** Modal פותח אחרי fetch → נראה כבד.
**Fix:** Modal נפתח **מיד** עם skeleton; fetch רץ async בתוך Modal שכבר פתוח.

```javascript
// Pattern:
function openTickerModal(tickerId) {
  // 1. פתח modal עם skeleton מיד
  modal.open({
    content: renderSkeletonContent()  // placeholder rows
  });

  // 2. Fetch async (לא block)
  fetchTickerDetail(tickerId).then(data => {
    modal.updateContent(renderFullContent(data));
  }).catch(err => {
    modal.updateContent(renderErrorContent(err));
  });
}
```

**Skeleton HTML:**
```html
<div class="modal-skeleton">
  <div class="skeleton-row"></div>
  <div class="skeleton-row skeleton-row--short"></div>
  <div class="skeleton-row"></div>
</div>
```

**CSS:**
```css
.skeleton-row {
  height: 20px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
  margin-bottom: 8px;
}
@keyframes shimmer {
  0% { background-position: 200% center; }
  100% { background-position: -200% center; }
}
```

---

## SECTION 8 — ממצא #4: Manual Refresh Buttons

### Spec (Finding #4 — P2)

**מיקום:** בdetail modal של טיקר + בvaldiation UI.

**כפתור "רענן נתונים":**
- Label: `↺ רענן` (icon + text)
- Class: `.js-refresh-ticker-data`
- Action: `GET /tickers/{id}` + re-render table row + re-render modal
- State: disabled + spinner text "מרענן..." בזמן fetch
- Success: flash ירוק "עודכן" למשך 2 שניות
- Error: flash אדום "שגיאה ברענון"

**כפתור "בדיקת שלמות נתונים":**
- Label: `✓ בדיקת נתונים`
- Class: `.js-check-data-integrity`
- Action: `GET /tickers/{id}/data-integrity` + render integrity report
- (endpoint קיים בbackend)

---

## SECTION 9 — Implementation Requirements Summary

### Team 20 (Backend):
1. **[P0] TASE agorot fix:** `yahoo_provider.py` + `alpha_provider.py` — detect `.TA` + ÷100
2. **[P1] Verify** `off_hours_interval_minutes` ו-`alpha_quota_cooldown_hours` expose מ-`GET /settings/market-data` (check PATCH endpoint accepts them too)

### Team 30 (Frontend):
1. **[P0] Summary fix:** הצגה נכונה כאשר פילטר פעיל (Section 2 Q3.2)
2. **[P1] Traffic light tooltip update:** null → "אין נתונים — יש לרוץ EOD sync" (priceReliabilityLabels.js)
3. **[P1] Actions menu fix:** gap=0, hover zone רציפה, delay params (Section 3) — [await NIMROD_DECISION_A]
4. **[P2] Status legend:** הוספת legend אחרי טבלת הטיקרים (Section 2 Q2.1)
5. **[P1] Settings form:** הוסף `off_hours_interval_minutes` + `alpha_quota_cooldown_hours`; תקן defaults של max_symbols_per_request (50) ו-delay_between_symbols_seconds (1)
6. **[P1] Settings validation:** per-field error highlighting (Section 5 Q1.2)
7. **[P1] Background jobs table expansion:** toggle, history, edit modal (Section 4) — [await NIMROD_DECISION_B]
8. **[P2] Heat indicator card** — [await NIMROD_DECISION_C]
9. **[P1] Modal skeleton loading** (Section 7)
10. **[P2] Refresh buttons** (Section 8)

### Team 50 (QA):
1. **[P1] `tests/auto-wp003-runtime.test.js`** — Phase 2 runtime assertions (Section 6)
2. **[P0] Re-run existing tests** after TASE fix applied (validate TEVA.TA price is in shekel range)

### Team 60 (Infrastructure):
1. **[P0] Verify sync jobs ran** in current environment — if ticker_prices empty, trigger EOD sync manually or via scheduler
2. **[P1] Confirm `sync_ticker_prices_eod.py`** cron is active (this script is NOT in APScheduler registry — it's a standalone cron script)

### Team 90 (QA/Validation):
1. **CC-WP003-01..04 evidence** — re-verify after TASE fix applied
2. Update AUTO-WP003 scripts to Phase 2 assertions (per Section 6)

---

## SECTION 10 — Gate-Opening Conditions

**PRE_DEVELOPMENT_GATE פותח לאחר:**

| # | תנאי | מי מספק |
|---|------|---------|
| 1 | NIMROD_DECISION_A (actions menu hover vs click) | נמרוד |
| 2 | NIMROD_DECISION_B (job history format) | נמרוד |
| 3 | NIMROD_DECISION_C (heat formula + thresholds) | נמרוד |
| 4 | Team 60: אישור שsync jobs רצו בסביבה (ticker_prices לא ריק) | Team 60 |

**לאחר קבלת כל 4 התנאים — צוות 10 מתחיל ב-P0 items במקביל.**

---

**log_entry | TEAM_00 | GIN_RESPONSE_S002_P002_WP003 | ALL_GINS_ANSWERED | 2026-03-11**
