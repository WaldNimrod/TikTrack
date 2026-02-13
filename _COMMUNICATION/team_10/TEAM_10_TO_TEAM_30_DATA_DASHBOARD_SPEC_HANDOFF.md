# Team 10 → Team 30: מפרט דשבורד נתונים — הפניה ליישום

**id:** `TEAM_10_TO_TEAM_30_DATA_DASHBOARD_SPEC_HANDOFF`  
**from:** Team 10 (The Gateway)  
**to:** Team 30 (UI)  
**date:** 2026-01-30  
**re:** עמוד "דשבורד נתונים" — טבלת שערים + טבלת היסטוריה

---

## 1. הקשר

בעקבות פערי Gate B (External Data) נדרש מקום בממשק להצגת **נתוני שוק** — שערי חליפין וערך עדכני, ובהמשך היסטוריה.  
הוגדר מפרט לעמוד **"דשבורד נתונים"** והתפריט/ה-routing עודכנו. נדרש יישום העמוד והטבלאות.

---

## 2. מפרט מלא

**מסמך מפרט:** `documentation/04-DESIGN_UX_UI/DATA_DASHBOARD_SPEC.md`

**עיקרי המפרט:**
- **ניווט:** כפתור **"נתונים"** בתפריט הראשי → פריט **"דשבורד נתונים"**.
- **טבלה 1:** רשימת שערי חליפין שהמערכת מחזיקה — זוג מטבעות, שער עדכני, זמן עדכון אחרון. מקור: `GET /api/v1/reference/exchange-rates`.
- **טבלה 2:** היסטוריה של שער נבחר — בכותרת **דרופדאון** לבחירת השער; עמודות: תאריך/שעה, שער.  
  **הערה:** היסטוריה מלאה מותנית ב-backend (כרגע ב-DB רק ערך עדכני לכל זוג). עד שייושם API היסטוריה — להציג "היסטוריה תתווסף" או את השורה הנוכחית בלבד.

---

## 3. מה כבר בוצע (לא על ידי Team 30)

- **תפריט:** נוסף פריט **"דשבורד נתונים"** ב־dropdown "נתונים" ב־`ui/src/views/shared/unified-header.html` (קישור: `/data_dashboard.html`).
- **Routes:** נוסף `data.data_dashboard` → `/data_dashboard.html` ב־`ui/public/routes.json`.

---

## 4. משימות ל-Team 30

- [ ] **יצירת עמוד:** קובץ/view לעמוד דשבורד נתונים — `data_dashboard.html` (או React view לפי ארכיטקטורת הפרויקט).
- [ ] **טבלה 1:** הצגת רשימת שערים — קריאה ל־GET /api/v1/reference/exchange-rates; עמודות: זוג מטבעות, שער עדכני, זמן עדכון אחרון.
- [ ] **טבלה 2:** כותרת + דרופדאון לבחירת שער (זוג מטבעות); טבלת היסטוריה — מוכנה ל-API היסטוריה (או מציגה הודעה/שורה נוכחית עד שייושם Backend).
- [ ] **עיצוב/תאימות:** RTL, GIN_004, phoenix-table וסטנדרטים קיימים.

---

## 5. תלויות

- **API שערים נוכחי:** קיים — GET /reference/exchange-rates.
- **API היסטוריית שער:** כרגע חסר — בהמשך ייתכן endpoint מסוג `GET /reference/exchange-rates/{from}/{to}/history` (תלוי החלטת אדריכלות — ראו הודעת התייעצות נפרדת).

---

## 6. מסמכים

| מסמך | נתיב |
|------|------|
| מפרט דשבורד נתונים | documentation/04-DESIGN_UX_UI/DATA_DASHBOARD_SPEC.md |
| תגובת פערי Gate B | _COMMUNICATION/team_10/TEAM_10_EXTERNAL_DATA_GATE_B_GAPS_RESPONSE.md |

---

**log_entry | TEAM_10 | TO_TEAM_30 | DATA_DASHBOARD_SPEC_HANDOFF | 2026-01-30**
