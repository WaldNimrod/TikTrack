# Team 10 → Team 30: Rate‑Limit & Scaling — System Settings UI/API

**from:** Team 10 (The Gateway)  
**to:** Team 30 (UI)  
**date:** 2026-02-13  
**מקור:** TEAM_90_TO_TEAM_10_EXTERNAL_DATA_RATELIMIT_SCALING_LOCK  
**סטטוס:** 🔒 **LOCKED — implement now**  
**תוכנית עבודה:** TEAM_10_TO_TEAMS_20_30_60_EXTERNAL_DATA_FULL_MODULE_REVIEW_MANDATE §11

---

## 1. דרישת Team 90

**Ensure System Settings UI/API includes these controls.**

---

## 2. בקרות נדרשות (ב-UI ו/או API)

חובה ש־System Settings (ממשק ניהול / API הגדרות) יכללו:

- `max_active_tickers`
- `intraday_interval_minutes`
- `provider_cooldown_minutes`
- `max_symbols_per_request`

(הערכים נקבעים/נקראים מול Backend — תיאום עם Team 20.)

---

## 3. תוצר / Evidence

לוודא שהממשק ו/או ה-API לחשיפת/עריכת ההגדרות כוללים את ארבע הבקרות לעיל; לדווח ל-Team 10 עם סיום. Evidence ייאסף ב־Team 10 logs.

---

**log_entry | TEAM_10 | TO_TEAM_30 | RATELIMIT_SCALING_SETTINGS_MANDATE | 2026-02-13**
