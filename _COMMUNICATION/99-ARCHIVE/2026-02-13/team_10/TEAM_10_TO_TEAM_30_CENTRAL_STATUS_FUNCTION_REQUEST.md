# Team 10 → Team 30: בקשת פונקציה מרכזית לסטטוסים — קובץ משותף

**מאת:** Team 10 (The Gateway)  
**אל:** Team 30 (Frontend)  
**תאריך:** 2026-02-12  
**הקשר:** יישום System Status Values — החלטה: מקור אחיד לכל הממשקים

---

## 1. דרישה

**לייצר פונקציה מרכזית קבועה בקובץ משותף שתשמש את כל הממשקים באופן אחיד.**

- כל מקום שמציג או מסנן סטטוסים (Header, DataLoaders, מודולים, PhoenixFilterBridge, badges) **חייב** להשתמש **רק** באותה פונקציה/מודול משותף.
- **מימוש קיים:** `ui/src/utils/statusAdapter.js` — `toCanonicalStatus`, `toHebrewStatus`, `getStatusOptions()`.
- **נדרש:** וידוא שכל הממשקים נשענים על Adapter זה; ואופציונלי — **פונקציה אחת** שממלאת את תפריט הסטטוס מ-`getStatusOptions()` כך שכל ה-UIs מקבלים את אותן אופציות מאותו מקור (למשל helper שמחזיר אופציות ל-dropdown/תפריט).

---

## 2. מקומות לעדכון (לפי מיפוי הקוד)

| מקום | שימוש חובה |
|------|------------|
| Header (`unified-header.html` + JS) | אופציות מ-`getStatusOptions()`; מיפוי סינון ב-`toCanonicalStatus` |
| DataLoaders (D16, D18) | מיפוי עברית↔קנוני רק דרך Adapter |
| PhoenixFilterBridge | תיאום ל-SSOT דרך Adapter |
| badges / tableFormatters | תצוגת עברית דרך `toHebrewStatus(value)` |

**הערה:** D21 (תזרימי מזומנים) — **אין סטטוס**; אין להוסיף סינון/תצוגת סטטוס ב-D21.

---

## 3. תיעוד

- **מנדט:** `_COMMUNICATION/team_10/TEAM_10_SYSTEM_STATUS_IMPLEMENTATION_MANDATE.md`
- **החלטות וסיכום משימות:** `_COMMUNICATION/team_10/TEAM_10_STATUS_IMPLEMENTATION_READINESS_AND_QUESTIONS.md`
- **מיפוי קוד:** `documentation/02-DEVELOPMENT/TT2_STATUS_VALUES_CODE_MAP.md`
- **SSOT:** `documentation/09-GOVERNANCE/TT2_SYSTEM_STATUS_VALUES_SSOT.md`

---

**log_entry | TEAM_10 | TO_TEAM_30_CENTRAL_STATUS_FUNCTION_REQUEST | 2026-02-12**
