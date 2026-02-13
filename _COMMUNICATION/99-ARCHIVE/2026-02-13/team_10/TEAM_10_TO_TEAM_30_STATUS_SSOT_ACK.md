# Team 10 → Team 30: אישור נעילת סטטוסים ב-SSOT

**מאת:** Team 10 (The Gateway)  
**אל:** Team 30 (Frontend)  
**תאריך:** 2026-02-12  
**הקשר:** TEAM_30_TO_TEAM_10_STATUS_SSOT_ESCALATION

---

## 1. בוצע (Team 10)

1. **נעילה ב-SSOT:** נוצר מסמך רשמי — `documentation/09-GOVERNANCE/TT2_SYSTEM_STATUS_VALUES_SSOT.md`  
   - ארבעת הסטטוסים: `active` (פתוח), `inactive` (סגור), `pending` (ממתין), `cancelled` (מבוטל) — קבועים לכל הישויות.

2. **עדכון תיעוד:**  
   - `TT2_EFR_LOGIC_MAP.md` — נוספה הפניה ל-SSOT + טבלת עברית בסעיף Status Fields.  
   - `00_MASTER_INDEX.md` — נוספו הפניות ל-SSOT ולמיפוי הקוד.

3. **מיפוי מקומות בקוד:** `documentation/02-DEVELOPMENT/TT2_STATUS_VALUES_CODE_MAP.md`  
   - רשימת קבצים שדורשים תיקון/עדכון (unified-header, tradingAccounts filters/DataLoader, phoenixFilterBridge, blueprints).

4. **תוכנית לאדריכלית:** הוכנה והעברה לאישור — `_COMMUNICATION/team_10/TEAM_10_TO_ARCHITECT_SYSTEM_STATUS_VALUES_PLAN.md`.

---

## 2. נדרש מ-Team 30 (לפי מיפוי הקוד)

| עדיפות | פעולה | קובץ/פרט |
|--------|--------|-----------|
| P1 | הוספת אופציה **"ממתין"** בתפריט סינון הסטטוס | `ui/src/views/shared/unified-header.html` — בתוך `#statusFilterMenu` |
| P1 | הרחבת לוגיקת סינון ל-4 סטטוסים (מיפוי עברית↔קנוני) | `tradingAccountsFiltersIntegration.js`, `tradingAccountsDataLoader.js` |
| P2 | וידוא ש-phoenixFilterBridge ו-DataLoader שולחים ערך קנוני ל-API | לפי TT2_STATUS_VALUES_CODE_MAP.md |

---

## 3. סטטוס

**סטטוס:** ✅ **נעילה ב-SSOT ותיעוד הושלמו.** מיפוי הקוד מוכן; יישום התיקונים — לפי סדר העדיפות במסמך המיפוי. תוכנית רשימת סטטוסים מרכזית הועברה לאדריכלית לאישור.

---

**log_entry | TEAM_10 | STATUS_SSOT_ACK_TO_TEAM_30 | 2026-02-12**
