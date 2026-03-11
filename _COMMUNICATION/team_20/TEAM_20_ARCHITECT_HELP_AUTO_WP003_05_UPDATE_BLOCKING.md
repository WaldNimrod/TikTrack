# Team 20 → Architect | עדכון — סיבת החסימה נמצאה

**מ:** Team 20  
**תאריך:** 2026-03-11  
**סטטוס:** **נפתר** — Lock contention מתהליכים קודמים

---

## 1) תסכום

בדיקת `pg_stat_activity` הראתה ש־**מספר תהליכים** (כולל runs קודמים של הבדיקות שלנו) ממתינים ל־**Lock/tuple** ו־**Lock/transactionid** על `ticker_prices`. אין באג בקוד — החסימה נגרמת מ־**lock contention** מתהליכים שרצו במקביל ולא הסתיימו.

---

## 2) מה נבדק (שלב אחר שלב)

| שלב | תוצאה |
|-----|--------|
| SELECT (CTE) על ticker_prices | ✅ מהיר, מחזיר 3 שורות |
| UPDATE ... WHERE id = X | ❌ נתקע |
| UPDATE על פרטיציה ישירה (ticker_prices_2026_03) | ❌ נתקע |
| UPDATE עם price_timestamp ב־WHERE (partition pruning) | ❌ נתקע |
| statement_timeout = 5s | מחזיר "canceling statement due to statement timeout" — ה־UPDATE לא מסתיים תוך 5 שניות |
| חיבור חדש, רק UPDATE בודד, בלי SELECT | ❌ נתקע |

---

## 3) מבנה DB (מתוך pg_inherits, pg_indexes, pg_stat)

- **פרטיציות:** ticker_prices מחולקת לפי `price_timestamp` (חודשי)
- **אינדקס:** `ticker_prices_2026_03_pkey` על `(id, price_timestamp)` — Unique
- **EXPLAIN (ללא ביצוע):** Seq Scan, cost 2.73, 60 שורות בפרטיציה
- **גודל פרטיציות:** קטן (~60–230 שורות לפרטיציה)

---

## 4) דוגמת SQL שנתקעת

```sql
UPDATE market_data.ticker_prices_2026_03
SET market_cap = 111
WHERE id = '198cc2fa-954e-44b9-8738-79df70eef380'::uuid
```

או:

```sql
UPDATE market_data.ticker_prices
SET market_cap = 111
WHERE id = '198cc2fa-954e-44b9-8738-79df70eef380'::uuid
  AND price_timestamp = '2026-03-09 15:29:53+00'::timestamptz
```

---

## 5) פתרון

**סיבה:** Process (למשל pid 67415) מחזיק RowExclusiveLock על ticker_prices — כנראה transaction ארוך (DELETE/UPDATE) שנתקע ב־COMMIT (WALWrite/WALSync). ייתכן שרת API או connection pool שמתחברים מחדש.

**פעולות:**
1. **להפסיק שרתים/שירותים** שפותחים connections ל־DB (backend, cron, workers)
2. **להריץ:** `python3 scripts/terminate_ticker_prices_blockers.py` — מפסיק pids שמחזיקים locks על ticker_prices
3. **מיד אחרי** (לפני שיחדשו): `python3 scripts/backfill_market_cap_auto_wp003_05.py`
4. אם 67415 חוזר — יש תהליך חיצוני שצריך להפסיקו לפני ה-backfill

---

## 6) קבצי debug שנוצרו

- `scripts/debug_backfill_step_by_step.py` — הרצה שלב־אחר־שלב
- `scripts/debug_update_only.py` — UPDATE בודד, חיבור נקי
- `scripts/debug_db_inspect.py` — בדיקת מבנה, פרטיציות, אינדקסים

---

**log_entry | TEAM_20 | ARCHITECT_HELP_REQUEST | AUTO_WP003_05_UPDATE_BLOCKING | 2026-03-11**
