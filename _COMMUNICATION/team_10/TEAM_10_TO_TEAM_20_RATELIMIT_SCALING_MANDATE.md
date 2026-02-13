# Team 10 → Team 20: Rate‑Limit & Scaling Policy — מנדט יישום

**from:** Team 10 (The Gateway)  
**to:** Team 20 (Backend)  
**date:** 2026-02-13  
**מקור:** TEAM_90_TO_TEAM_10_EXTERNAL_DATA_RATELIMIT_SCALING_LOCK  
**סטטוס:** 🔒 **LOCKED — implement now**  
**תוכנית עבודה:** TEAM_10_TO_TEAMS_20_30_60_EXTERNAL_DATA_FULL_MODULE_REVIEW_MANDATE §11

---

## 1. SSOT

- `documentation/01-ARCHITECTURE/MARKET_DATA_PIPE_SPEC.md` (§8)  
- `documentation/01-ARCHITECTURE/MARKET_DATA_COVERAGE_MATRIX.md` (Rule #8)

---

## 2. כללי ליבה (חובה ליישם)

1. **Cache‑First only** — אין קריאות חיצוניות לספקים מתוך request path.  
2. **Single‑Flight refresh** — job אחד מרענן; שאר הקריאות מחזירות stale.  
3. **Cooldown on 429** — עם קבלת 429, הספק נכנס ל־cooldown; אין קריאות נוספות אליו במהלך החלון.  
4. **Fallback enforced** — Prices: Yahoo→Alpha; FX: Alpha→Yahoo.  
5. **Never block UI** — בכישלון: להחזיר stale + `staleness=na`.

---

## 3. System Settings (בקרות נדרשות ב-API/Backend)

חובה לתמוך (קריאה/כתיבה או config) ב:

- `max_active_tickers`
- `intraday_interval_minutes`
- `provider_cooldown_minutes`
- `max_symbols_per_request`

---

## 4. תוצר / Evidence

לוודא יישור קוד ל-SSOT (§8, Rule #8); לדווח ל-Team 10 עם סיום (הודעה קצרה או Evidence log).  
Evidence ייאסף ב־Team 10 logs (TEAM_10_EXTERNAL_DATA_SSOT_EVIDENCE_LOG או מסמך ייעודי).

---

**log_entry | TEAM_10 | TO_TEAM_20 | RATELIMIT_SCALING_MANDATE | 2026-02-13**
