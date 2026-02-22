# Team 10 → Team 50 | בקשת Evidence — 403 non-admin (MD-SETTINGS)
**project_domain:** TIKTRACK

**משימה:** MD-SETTINGS  
**הקשר:** Gate-B נדחה (BLOCKED) — ממצא P1: קריטריון 403 לא אומת בפועל  
**תאריך:** 2026-02-15

---

## בקשה

להריץ **בדיקת 403 אמיתית** עבור GET ו-PATCH `/settings/market-data` עם **משתמש שאינו Admin** (תפקיד USER פעיל).

- **צעדים:** התחברות כמשתמש USER → קריאת GET /settings/market-data → צפייה ב-**403 Forbidden**. התחברות כמשתמש USER → שליחת PATCH /settings/market-data (גוף תקף) → צפייה ב-**403 Forbidden**.
- **תוצר:** Evidence מתועד (צילום מסך / דוח בדיקה / קובץ Evidence) — **לא "skip" או "לא נבדק"**. לצרף לקובץ דוח או ל-Evidence log.

---

## הפניה

- **דרישות סגירה Gate-B:** [TEAM_10_GATE_B_MD_SETTINGS_BLOCKED_AND_CLOSURE_REQUIREMENTS.md](TEAM_10_GATE_B_MD_SETTINGS_BLOCKED_AND_CLOSURE_REQUIREMENTS.md)
- **AC מנדט 50:** non-admin נדחה (403).

לאחר קבלת Evidence — Team 10 יוכל להגיש Gate-B חוזר ל-Team 90.

---

**log_entry | TEAM_10 | TO_TEAM_50 | MD_SETTINGS_403_EVIDENCE_REQUEST | 2026-02-15**
