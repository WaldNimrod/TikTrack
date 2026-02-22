# Team 20 → צוות האדריכלות: תוכנית — לוגיקת עדכונים חכמה (Smart Update Logic)
**project_domain:** TIKTRACK

**id:** `TEAM_20_TO_ARCHITECT_SMART_UPDATE_LOGIC_PROPOSAL`  
**from:** Team 20 (Backend)  
**to:** צוות האדריכלות (Chief Architect / Team 90)  
**date:** 2026-02-14  
**status:** PROPOSAL — ממתין לאישור  
**סוג:** תוכנית מפורטת — עדכונים, שגיאות, ולידציה, חיסכון בקריאות ספקים

---

## 1. רקע ורציונל

### 1.1 מגבלות ספקים (חינמיים)
- **Yahoo Finance:** 401/429 תכוף, User-Agent חובה, אין תיעוד רשמי  
- **Alpha Vantage:** 5 קריאות/דקה (12.5s), `outputsize=compact` (~100 ימים), API key  
- **הנחה:** אנחנו מוגבלים מאוד; חובה להיות **קמצניים** בקריאות

### 1.2 עקרון יסוד
**Gap-First כברירת מחדל.** בדרך־כלל היסטוריית OHLCV לא משתנה — מלבד splits/dividends.  
**Reload Admin נשמר:** לאפשר טעינה מלאה מחדש לטיפול ב־splits/dividends בלבד.  
**נתונים שמשתנים:** יום המסחר הנוכחי, מחיר אפסון, אינדיקטורים (ATR/MA — מחושבים).

---

## 2. מטרת התוכנית

בניית **לוגיקת עדכונים חכמה** שתכלול:
1. **עדכון מינימלי** — בקשה מהספק רק מה שחסר או שמתעדכן  
2. **התחשבות בשגיאות** — 429, timeout, ריק — without unnecessary retries  
3. **ולידציה מחזורית** — לא כל לילה; מספיק פעם ב־X  
4. **אופציות ידניות ואוטומטיות** — Admin יכול להפעיל; Cron רץ מינימלי  
5. **חיסכון מקסימלי** — zero redundant fetches; gap-only when possible

---

## 3. עמידה בסטנדרטים קיימים

| סטנדרט | מסמך | התוכנית |
|--------|------|---------|
| **Smart History Fill** | TEAM_20_TO_ARCHITECT_SMART_HISTORY_FILL_SPEC | Gap-First, date_from/date_to — **מיושם** |
| **Rate-Limit & Scaling** | MARKET_DATA_PIPE_SPEC §8 | Cache-First, Single-Flight, Cooldown 429 — **מיושם** |
| **Provider Guardrails** | MARKET_DATA_PIPE_SPEC §2.2 | Yahoo UA Rotation, Alpha 12.5s — **קיים** |
| **250d min** | MARKET_DATA_COVERAGE_MATRIX Rule 9 | MIN_HISTORY_DAYS=250 — **קיים** |
| **Never Block UI** | MARKET_DATA_PIPE_SPEC §3 | Cache-First, stale fallback — **קיים** |

---

## 4. רפרנסים לקוד ואפיון

| רכיב | נתיב | תפקיד |
|------|------|--------|
| Smart History Engine | `api/services/smart_history_engine.py` | Gap analysis, Decision |
| History Backfill Script | `scripts/sync_ticker_prices_history_backfill.py` | Gap-first, insert only missing |
| EOD Sync | `scripts/sync_ticker_prices_eod.py` | היום בלבד — get_ticker_price |
| Provider Cooldown | `api/integrations/market_data/provider_cooldown.py` | 429 → cooldown |
| Market Data Settings | `api/integrations/market_data/market_data_settings.py` | env controls |
| Yahoo Provider | `api/integrations/market_data/providers/yahoo_provider.py` | period1/period2 for gaps |
| Cache-First History | `api/integrations/market_data/cache_first_service.py` | DB≥250 → no fetch |
| Cron Schedule | `documentation/05-REPORTS/artifacts/TEAM_60_CRON_SCHEDULE.md` | 21:00, 22:05 UTC |

---

## 5. מה מיושם (כבר קיים)

| לוגיקה | מימוש | חיסכון |
|--------|--------|--------|
| **Gap-First** | `compute_gaps` → `date_from`/`date_to` | רק תאריכים חסרים מהספק |
| **Skip existing** | `insert_history_rows` — `if d_str in existing_dates: continue` | אין overwrite |
| **EOD = היום בלבד** | `get_ticker_price` (לא history) | 1 קריאה/טיקר/יום |
| **Cache-First** | `get_ticker_history_cache_first` — DB≥250 → return | אין fetch כשהמטמון מספיק (SSOT: MIN_HISTORY_DAYS) |
| **429 Cooldown** | `set_cooldown`, `is_in_cooldown` | עצירת קריאות מיותרות |
| **Single-Flight** | Lock file ב־scripts | אין ריצות מקבילות |
| **force_reload Admin only** | API 403 אם לא Admin | מונע טעינה מלאה אקראית |

---

## 6. מה חסר (הצעת השלמה)

### 6.1 שגיאות — מדיניות Retry מחמירה

| שגיאה | התנהגות נוכחית | התנהגות מוצעת |
|------|-----------------|----------------|
| **429** | Cooldown 15min, דילוג על ספק | ✅ כבר מימוש — אין שינוי |
| **Timeout** | Exception → batch לילה | **ניסיון מיידי אחד בלבד** — מעבר לכך רק Batch לילה; רישום ל־log |
| **Provider empty** | Fallback ל־Alpha | ✅ כבר — **ניסיון מיידי אחד** — מעבר לכך רק Batch לילה |
| **DB duplicate** | rollback, continue | ✅ כבר — skip על existing_dates |

**עיקרון (SSOT — נעול):** ניסיון מיידי **אחד** לכל טיקר + Batch לילה לכשלים. ה‑provider מנסה 3× בתוכו; אין להוסיף retry ברמת backfill לאותו טיקר באותה ריצה.

### 6.2 ולידציה מחזורית

| סוג | תדירות | פעולה | קריאות ספק |
|-----|---------|--------|------------|
| **Integrity check** | שבועי (למשל Sun 02:00 UTC) | COUNT rows, detect gaps | **אפס** — רק DB query |
| **Gap fill** | רק אם יש gaps | date_from/date_to | מינימלי |
| **Full 250d** | רק טיקר חדש (0 rows) | פעם אחת | 1 קריאה |

**הצעה:** Cron History Backfill — לא לבצע **גם** "verify" על כל טיקר כל לילה.  
במקום: query אחת — `SELECT ticker_id FROM ... HAVING COUNT < 250`; אם ריק → **exit מיד** (כבר מיושם).  
נוסף: **לא** להריץ gap analysis על טיקרים עם 250+ שורות. (כבר — load_tickers_needing_backfill מסנן)

### 6.3 אופציות ידניות

| אופציה | טריגר | קריאות ספק |
|--------|-------|------------|
| **Gap Fill** | Admin לוחץ "השלם פערים" / API `mode=gap_fill` | רק gaps |
| **Force Reload** | Admin לוחץ + אישור / API `mode=force_reload` | 250d מלא (נדיר) |
| **EOD Manual** | Admin "רענן מחירים" | היום בלבד — 1/טיקר |
| **Validate (no fetch)** | Admin "בדוק תקינות" | **אפס** — DB only |

**מימוש קיים:** `GET /tickers/{id}/data-integrity` — Admin-only, DB-only (COUNT + gaps). אין fetch לספק. אין צורך ב־`validate_only` — data-integrity כבר DB-only.

### 6.4 תזמון Cron — צמצום עומס

| Job | תדירות נוכחית | הצעה | הנמקה |
|-----|-----------------|------|--------|
| **History Backfill** | כל לילה 21:00 | **אותו** — exit אם אין טיקרים עם <250 | כבר optimal |
| **EOD** | כל לילה 22:05 | **אותו** | צריך את היום — אין חלופה |
| **Gap-only pass** | — | **אופציונלי:** ביום נפרד (למשל Wed) אם יש טיקרים עם gaps | להפחית ימים עם קריאות |

**הנחיה:** אם `load_tickers_needing_backfill()` ריק — exit ב-&lt;100ms. אין query מיותרת.

---

## 7. מטריצת החלטות — מתי לקרוא לספק

| מצב | פעולה | קריאות |
|-----|--------|--------|
| טיקר 250+ שורות, אין gaps | **NO_OP** | 0 |
| טיקר 250+ שורות, יש gap | **GAP_FILL** (date_from..date_to) | 1 (טווח מינימלי) |
| טיקר 0 שורות (חדש) | **FULL_FETCH** 250d | 1 |
| טיקר 1–249 שורות | **GAP_FILL** או **FULL_FETCH** לפי gaps | 1 |
| EOD — מחיר היום | **get_ticker_price** | 1/טיקר/יום |
| Indicators (ATR/MA) | **compute from DB** — אין fetch | 0 |
| Data Integrity UI | **DB only** — אין fetch | 0 |

---

## 8. שגיאות — טיפול מוצע

| שגיאה | פעולה | Evidence |
|-------|--------|----------|
| **429** | `set_cooldown`; דילוג לספק הבא; אם שניהם → batch לילה | קיים |
| **Timeout** | log; ניסיון מיידי אחד בלבד — מעבר לכך batch לילה | להוסיף timeout 15s ל-history fetch |
| **Empty result** | log; fallback Alpha; אם שניהם → defer | קיים |
| **Duplicate key** | skip (idempotent) | קיים |
| **Partition missing** | `ensure_partition` לפני INSERT | קיים |

---

## 9. ולידציה — מתי ולמה

| סוג | מתי | איך | ספק |
|-----|-----|-----|------|
| **Post-insert** | אחרי backfill | `COUNT >= MIN_HISTORY_DAYS` | לא |
| **Gap detection** | לפני fetch | `compute_gaps(existing)` | לא |
| **Data integrity API** | on-demand (Admin) | DB query + gaps | לא |
| **Spot-check** | אופציונלי — חודשי | השוואת 1 טיקר מול ספק | 1 (sample) |

**עיקרון:** רוב הולידציה — **ללא** קריאה לספק.

---

## 10. סיכום עמידה בסטנדרטים

| סטנדרט | עמידה |
|--------|--------|
| TEAM_20_TO_ARCHITECT_SMART_HISTORY_FILL_SPEC | Gap-First, Admin reload, Post-run verification |
| MARKET_DATA_PIPE_SPEC §5, §8 | Cache-First, Cooldown, Single-Flight |
| MARKET_DATA_COVERAGE_MATRIX Rule 9 | 250d min, Gap-First, mode API |
| PHOENIX_MASTER_BIBLE (ארכיטקטורה) | No invention, Naming, Precision |
| ADR-022 (Stage-1 providers) | Yahoo + Alpha בלבד |

---

## 11. שאלות לאישור האדריכלית

1. **Retry policy (נעול — SSOT):** ניסיון מיידי אחד + Batch לילה. ה‑provider מנסה 3×; ברמת backfill — אין retry לאותו טיקר באותה ריצה.  
2. **Validation frequency:** integrity check = DB only (no provider call).  
3. **Cron:** האם להשאיר History Backfill כל לילה (עם exit מהיר) או להציע יום ייעודי (למשל רביעי) ל־gap-only pass?  
4. **validate_only:** הוסר מההצעה — data-integrity כבר DB-only, Admin-only.

---

## 12. טבלת יישום מוצע (לאחר אישור)

| פריט | עדיפות | הערכת מאמץ | צוות |
|------|--------|-------------|------|
| אכוף ניסיון מיידי אחד — מעבר לכך batch לילה | P1 | נמוך | 20 |
| Timeout 15s ל-history fetch | P1 | נמוך | 20 |
| Evidence log ל־post-run | P2 | נמוך | 20 |
| תיעוד ב-MARKET_DATA_PIPE_SPEC §5 | P2 | נמוך | 10 |

---

**log_entry | TEAM_20 | TO_ARCHITECT | SMART_UPDATE_LOGIC_PROPOSAL | 2026-02-14**  
**ממתין לאישור צוות האדריכלות**
