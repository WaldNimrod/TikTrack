# Team 10 → Team 60: Rate‑Limit & Scaling Policy — מנדט יישום

**from:** Team 10 (The Gateway)  
**to:** Team 60 (Infrastructure)  
**date:** 2026-02-13  
**מקור:** TEAM_90_TO_TEAM_10_EXTERNAL_DATA_RATELIMIT_SCALING_LOCK  
**סטטוס:** 🔒 **LOCKED — implement now**  
**תוכנית עבודה:** TEAM_10_TO_TEAMS_20_30_60_EXTERNAL_DATA_FULL_MODULE_REVIEW_MANDATE §11

---

## 1. SSOT

- `documentation/01-ARCHITECTURE/MARKET_DATA_PIPE_SPEC.md` (§8)  
- `documentation/01-ARCHITECTURE/MARKET_DATA_COVERAGE_MATRIX.md` (Rule #8)

---

## 2. כללי ליבה (רלוונטיים לתשתית)

1. **Cache‑First only** — אין קריאות חיצוניות מתוך request path (תיאום עם 20).  
2. **Single‑Flight refresh** — job אחד מרענן.  
3. **Cooldown on 429** — ספק ב-cooldown ללא קריאות במהלך החלון.  
4. **Fallback enforced** — Prices: Yahoo→Alpha; FX: Alpha→Yahoo.  
5. **Never block UI** — stale + `staleness=na` בכישלון.

---

## 3. System Settings (תשתית / סביבה)

לוודא שהסביבה (env/config/cron) תומכת בערכי ברירת מחדל ובשליטה ב:

- `max_active_tickers`
- `intraday_interval_minutes`
- `provider_cooldown_minutes`
- `max_symbols_per_request`

תיאום עם Team 20 על ערכים ו־cron/jobs.

---

## 4. תוצר / Evidence

יישור תשתית ל-SSOT (§8); דיווח ל-Team 10 עם סיום. Evidence ייאסף ב־Team 10 logs.

---

**log_entry | TEAM_10 | TO_TEAM_60 | RATELIMIT_SCALING_MANDATE | 2026-02-13**
