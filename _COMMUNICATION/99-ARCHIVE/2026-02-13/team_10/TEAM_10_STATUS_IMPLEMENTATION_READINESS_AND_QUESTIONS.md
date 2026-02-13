# מימוש סטטוסים — בדיקת מידע ושאלות להשלמה

**מאת:** Team 10 (The Gateway)  
**תאריך:** 2026-02-12  
**מטרה:** לבחון האם קיים כל המידע הדרוש למימוש, ולהציג שאלות להשלמה במידת הצורך.

---

## 1. מה קיים (מוכן למימוש)

| פריט | סטטוס |
|------|--------|
| **SSOT** | `TT2_SYSTEM_STATUS_VALUES_SSOT.md` — 4 ערכים קנוניים + עברית, עקרון Single Source, Acceptance Criteria |
| **מקור קוד** | `ui/src/utils/statusValues.js` — STATUS_VALUES, STATUS_CANONICAL, STATUS_LABELS_HE |
| **Adapter** | `ui/src/utils/statusAdapter.js` — toCanonicalStatus(label), toHebrewStatus(value), getStatusOptions() |
| **מיפוי קוד** | `TT2_STATUS_VALUES_CODE_MAP.md` — רשימת קבצים, P1/P2/P3, בעלים מוצעים |
| **מנדט יישום** | `TEAM_10_SYSTEM_STATUS_IMPLEMENTATION_MANDATE.md` — מחייב לצוותים |
| **EFR Logic Map** | הפניה ל-SSOT + תרגום עברית בסעיף Status Fields |

---

## 2. החלטות (עודכן)

### 2.1 חובה — עדכון לסטנדרט סטטוסים

**כל מקום במערכת שמשתמש בסטטוס חייב לעבור לסטנדרט הסטטוסים שלנו** (TT2_SYSTEM_STATUS_VALUES_SSOT — active, inactive, pending, cancelled).  
- **Backend:** ישויות/endpoints שבהם קיים שדה סטטוס — לקבל ולהחזיר ערכים קנוניים בלבד.  
- **Frontend:** שימוש רק דרך `statusAdapter.js` (מקור משותף).

### 2.2 D16 — Trading Accounts

- **דרישה:** עדכון ה-API לסטנדרט — תמיכה ב-query param `status` עם ערכים קנוניים (active|inactive|pending|cancelled), או תיעוד מפורש של מיפוי is_active↔active/inactive כחלק מהסטנדרט.  
- **משימה ל-Team 20:** ליישר את trading_accounts list/summary לסטנדרט (קבלת/החזרת סטטוס קנוני).

### 2.3 D21 — Cash Flows

- **החלטה:** **לתזרים מזומנים אין סטטוס** — אין להוסיף סינון לפי סטטוס ב-D21.  
- לא נדרש שינוי ב-cash_flows API לצורך סטטוסים.

---

## 3. הבהרות Frontend

### 3.1 פונקציה מרכזית — קובץ משותף (Team 30)

- **דרישה:** **Team 30** — לייצר **פונקציה מרכזית קבועה בקובץ משותף** שתשמש את **כל הממשקים** באופן אחיד.  
- **מימוש קיים:** `ui/src/utils/statusAdapter.js` — toCanonicalStatus, toHebrewStatus, getStatusOptions.  
- **נדרש:** וידוא שכל הממשקים (Header, DataLoaders, מודולים, React) משתמשים **רק** ב-Adapter הזה; ואופציונלי — פונקציה אחת שממלאת את תפריט הסטטוס מ-`getStatusOptions()` כך שכל ה-UIs מקבלים את אותן אופציות מאותו מקור.

### 3.2 Header — אופציות בתפריט

- יש **להכניס** אופציה "ממתין" (הכול, פתוח, סגור, ממתין, מבוטל).  
- **אופטימלי:** תפריט הסטטוס נבנה דינמית מ-`getStatusOptions()` מקובץ משותף (פונקציה מרכזית) — כך שכל הממשקים משתמשים באותו מקור.

### 3.3 PhoenixFilterBridge ו-state

- **הבהרה:** מומלץ לאחסן ב-`state.filters.status` **ערך קנוני** (active/inactive/pending/cancelled או null). בהצגה ב-UI (למשל `#selectedStatus`): להציג `toHebrewStatus(state.filters.status)`.
- **קריאת בחירה:** בעת שליחה ל-API או ל-DataLoader — `toCanonicalStatus(selectedStatusText)`.

### 3.4 Badges / tableFormatters

- **הבהרה:** כשערך מהשרת הוא קנוני — להציג תג באמצעות `toHebrewStatus(value)`. אם קוראים ל-`formatStatusBadge` — להעביר טקסט עברית: `formatStatusBadge(toHebrewStatus(row.status), statusCategory)`.

---

## 4. סיכום משימות

| פעולה | בעלים | סטטוס |
|--------|--------|--------|
| Backend — עדכון לסטנדרט סטטוסים (D16: status קנוני) | Team 20 | ✅ **הושלם ואומת** — דוח QA: TEAM_50_TO_TEAM_20_STATUS_STANDARD_QA_REPORT.md |
| פונקציה מרכזית בקובץ משותף — שימוש אחיד בכל הממשקים | Team 30 | ✅ **הושלם** — ממתין ל-QA (דוח: TEAM_30_TO_TEAM_10_CENTRAL_STATUS_FUNCTION_COMPLETE.md) |
| Header: 4 אופציות כולל "ממתין"; תפריט מ-getStatusOptions() | Team 30 | ✅ הושלם |
| DataLoaders + Filters + PhoenixFilterBridge + badges — Adapter בלבד | Team 30 | ✅ הושלם |
| D21 — ללא שינוי (אין סטטוס לתזרימים) | — | לא רלוונטי |

---

**מסקנה:** החלטות התקבלו; תוכנית העבודה והודעות לצוותים מעודכנות בהתאם.

---

**log_entry | TEAM_10 | STATUS_IMPLEMENTATION_READINESS | 2026-02-12**
