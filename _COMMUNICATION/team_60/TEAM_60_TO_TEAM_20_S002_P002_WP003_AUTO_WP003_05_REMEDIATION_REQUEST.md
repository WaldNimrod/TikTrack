# Team 60 → Team 20 | S002-P002-WP003 — דרישת תיקון מפורטת: AUTO-WP003-05 (market_cap)

**project_domain:** TIKTRACK  
**id:** TEAM_60_TO_TEAM_20_S002_P002_WP003_AUTO_WP003_05_REMEDIATION_REQUEST  
**from:** Team 60 (Infrastructure)  
**to:** Team 20 (Backend) — צוות מקצועי לתיקון  
**cc:** Team 10 (Gateway) — לידיעה  
**date:** 2025-01-31  
**historical_record:** true
**status:** ACTION_REQUIRED  
**gate_id:** GATE_7  
**work_package_id:** S002-P002-WP003  
**חומרה:** BLOCK — חסימת שחרור GATE_7 Pre-Human Automation  

---

## 1) כלל המעבר (PASS Rule)

| Check | דרישה | מדידה |
|-------|--------|--------|
| **AUTO-WP003-05** | market_cap לא null עבור ANAU.MI, BTC-USD, TEVA.TA | בשורת המחיר האחרונה ב־`market_data.ticker_prices` לכל אחד מהסמלים — 3/3 non-null |

**אימות:** `python3 scripts/verify_g7_prehuman_automation.py` — מחזיר PASS רק אם לכל שלושת הסמלים יש `market_cap IS NOT NULL` בשורה האחרונה (לפי `price_timestamp DESC`).

---

## 2) מה בוצע באימות (Team 60)

| שלב | פקודה | תוצאה |
|-----|--------|--------|
| 1 | `make sync-ticker-prices` | הורצה; Yahoo החזיר **429** על הטיקר הראשון (AMZN) → cooldown 15 דק׳ (SOP-015); שאר הטיקרים טופלו בנתיב last-known (אין קריאה ל-Yahoo). |
| 2 | `python3 scripts/verify_g7_prehuman_automation.py` | **BLOCK** — market_cap null עבור: ANAU.MI, BTC-USD, TEVA.TA (3/3). |

---

## 3) לוג רלוונטי מהסנכרון (Evidence)

```
Yahoo v8/chart 429 for AMZN (attempt 1/3) — backing off 5s
Yahoo v8/chart 429 for AMZN (attempt 2/3) — backing off 10s
Yahoo 429 — cooldown 15 min (SOP-015)
...
📊 [FIX-4] Alpha Vantage quota: 0/25 used, 25 remaining (FX reserve: 8)
⚠️ ALPHA_VANTAGE in cooldown — skipping
📌 AMZN: using last-known price (providers unavailable)
⚠️ YAHOO_FINANCE in cooldown — skipping
📌 ANAU.MI: using last-known price (providers unavailable)
📌 BTC-USD: using last-known price (providers unavailable)
...
📌 TEVA.TA: using last-known price (providers unavailable)
✅ Upserted 9 ticker prices to market_data.ticker_prices
```

כלומר: לאחר 429 על AMZN, Yahoo נכנס ל-cooldown; **לא בוצעה אף קריאה מוצלחת ל-Yahoo** עבור ANAU.MI, BTC-USD, TEVA.TA. הנתיב שבו הם טופלו הוא **last-known** — שליפה מהטבלה הקיימת והכנסה מחדש בלי עדכון מ־provider.

---

## 4) סיבת הכשל (שורש)

- **תיקון Team 20 הקיים** (`TEAM_20_TO_TEAM_10_S002_P002_WP003_AUTO_WP003_05_COMPLETION`):  
  מילוי `market_cap` מתבצע רק כאשר **v8/chart מצליח** — בתוך `_fetch_last_close_via_v8_chart_inner` לפני החזרת `PriceResult`, עבור סמלים ב־`_AUTO_WP003_05_SYMBOLS` נקראת `_fetch_market_cap_only_v7(symbol)` וממלאים `market_cap`.
- **בהריצה הזו:** אף טיקר לא עבר בנתיב Yahoo המוצלח (Yahoo ב-cooldown אחרי הטיקר הראשון). כל הטיקרים, כולל ANAU.MI, BTC-USD, TEVA.TA, נכנסו לנתיב **last-known** ב־`scripts/sync_ticker_prices_eod.py` (שורות 166–170):  
  `last = _get_last_known_price(ticker_id, symbol)` → התוצאה היא העתקת שורה קיימת מ-DB, כולל `market_cap` כפי שהוא (null).
- **מסקנה:** כאשר EOD רץ תחת Yahoo cooldown (או כשל Yahoo על טיקרים ראשונים), שלושת הסמלים **לא עוברים דרך Yahoo** ולכן **לא מקבלים עדכון market_cap**; הנתיב last-known לא משנה את ה־market_cap.

---

## 5) מיקום רלוונטי בקוד

| קובץ | תיאור |
|------|--------|
| `api/integrations/market_data/providers/yahoo_provider.py` | `_AUTO_WP003_05_SYMBOLS`, `_fetch_market_cap_only_v7`, קריאה ב־`_fetch_last_close_via_v8_chart_inner` (כ־257–258) — **רק כשהנתיב v8/chart מצליח**. |
| `scripts/sync_ticker_prices_eod.py` | `fetch_prices_for_tickers` — כששני הספקים נכשלים/מדולגים: `last = _get_last_known_price(...)` (כ־167); אין קריאה ל־Yahoo או ל־`_fetch_market_cap_only_v7` בנתיב last-known. |

---

## 6) דרישת תיקון (לצוות 20)

**מטרה:** להבטיח ש־**בכל ריצת EOD** (כולל כאשר Yahoo ב-cooldown ורוב הטיקרים ב-last-known), לשלושת הסמלים ANAU.MI, BTC-USD, TEVA.TA יהיה **market_cap non-null** בשורת המחיר האחרונה ב־`ticker_prices` (כדי ש־`verify_g7_prehuman_automation.py` יחזיר PASS).

**אפשרויות (לבחירת הצוות המקצועי):**

1. **העשרת נתיב last-known ב-EOD:**  
   ב־`sync_ticker_prices_eod.py`, כאשר מזהים ש־`symbol in ("ANAU.MI", "BTC-USD", "TEVA.TA")` ואנחנו בנתיב last-known (או לפני הוספת last ל-results), אם Yahoo **לא** ב-cooldown — לקרוא ל־`_fetch_market_cap_only_v7(symbol)` (או ל־YahooProvider wrapper מתאים) ולשלב את ה־market_cap בתוך הטופל שמוכנס ל-results (כך שהשורה שנכתבת ל-DB תכלול market_cap מעודכן). עלות: עד 3 קריאות HTTP לריצה כשנכנסים ל-last-known עבור שלושת הסמלים.

2. **Backfill / job ייעודי:**  
   סקריפט או job (למשל אחרי EOD) שבודק עבור שלושת הסמלים את השורה האחרונה ב־`ticker_prices`; אם `market_cap IS NULL` — קורא ל־Yahoo v7/quote (או ל־`_fetch_market_cap_only_v7`) ומבצע UPDATE ל־market_cap באותה שורה. כך גם נתונים היסטוריים יקבלו מילוי כשהספק זמין.

3. **אפשרות אחרת** שמבטיחה 3/3 non-null תקף לאימות (למשל מילוי בעת קריאת API ל-D22, וכו׳) — בתנאי ש־`verify_g7_prehuman_automation.py` (ששואל את `ticker_prices`) יראה 3/3 non-null.

---

## 7) אימות אחרי תיקון

1. **אופציונלי — איפוס cooldown** (לצורך בדיקה): להריץ את הסנכרון כאשר Yahoo זמין, או להמתין ליציאה מ-cooldown.
2. **חובה:**  
   ```bash
   make sync-ticker-prices
   python3 scripts/verify_g7_prehuman_automation.py
   ```  
   **תוצאה מצופה:** `AUTO-WP003-05: PASS — market_cap non-null for 3/3: ['ANAU.MI', 'BTC-USD', 'TEVA.TA']`
3. **מומלץ:** להריץ גם תרחיש שבו Yahoo ב-cooldown (למשל אחרי 429 מכוון) ולוודא שאחרי התיקון עדיין מתקבל PASS (למשל בזכות העשרת last-known או backfill).

---

## 8) מסמכים קשורים

| מסמך | תיאור |
|------|--------|
| `TEAM_20_TO_TEAM_10_S002_P002_WP003_AUTO_WP003_05_COMPLETION.md` | תיאור התיקון הקיים (v8/chart + _fetch_market_cap_only_v7). |
| `TEAM_60_TO_TEAM_10_S002_P002_WP003_AUTO_WP003_05_RE_VERIFY_RESULT.md` | דוח אימות חוזר — BLOCK. |
| `scripts/verify_g7_prehuman_automation.py` | סקריפט האימות (שאילתת DB ל־3 הסמלים). |

---

**log_entry | TEAM_60 | TO_TEAM_20 | AUTO_WP003_05_REMEDIATION_REQUEST | CC_TEAM_10 | 2025-01-31**
