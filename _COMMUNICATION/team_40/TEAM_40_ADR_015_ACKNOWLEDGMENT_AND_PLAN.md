# Team 40 → Team 10: אישור קבלה ותכנון — ADR-015

**מאת:** Team 40 (Presentational / DNA)  
**אל:** Team 10 (The Gateway)  
**תאריך:** 2026-02-12  
**מקור:** `ADR_015_DISTRIBUTION_PACKAGE.md`, `TEAM_10_TO_TEAM_30_ADR_015_BROKER_REFERENCE_MANDATE.md`, `TEAM_10_ADR_015_BROKER_REFERENCE_WORK_PLAN.md`  
**מטרה:** אישור קבלת המשימות ותכנון מימוש

---

## 1. הבנת המשימות — Team 40

### 1.1 אחריות לפי SLA 30/40

**לפי המנדט והתוכנית:**
- **Team 30:** Containers (לוגיקה, API, אינטגרציה) — D16 "אחר" + הודעה; D18 בחירת חשבון + עמלות
- **Team 40:** Presentational (CSS, עיצוב) — אם נדרש רכיב Presentational חדש להודעת המשילות, Team 40 מספק; Team 30 משלב

**משימה ספציפית ל-Team 40:**
- יצירת רכיב Presentational להודעת המשילות ב-D16 (בחירת ברוקר "אחר")
- עיצוב CSS של הודעת המשילות לפי DNA Palette
- שימוש ב-CSS Variables מה-DNA Palette (Message & Status Colors)

---

## 2. ניתוח דרישות

### 2.1 הודעת המשילות — D16 בלבד

**מתי מוצגת:**
- בבחירת ברוקר "אחר" (value: "other", is_supported: false) ב-D16

**תוכן (מ-SSOT):**
- טקסט: "במידה ולא מצאתם את הברוקר שלכם במערכת, עדין ניתן לייצר את החשבון מסחר — אבל לא ניתן יהיה לייבא אוטומטית נתונים. מומלץ ליצור איתנו קשר ולבקש הוספת הברוקר למערכת, [קישור למייל מנהל ראשי]."
- קישור: `primary_admin_contact` = `mailto:support@tiktrack.app` (או מ-env `PRIMARY_ADMIN_EMAIL`)

**מיקום:**
- D16 — `ui/src/views/financial/tradingAccounts/trading_accounts.html`
- להצגה בתנאי (Conditional Rendering) — רק בבחירת "אחר"

---

### 2.2 סגנון עיצובי — DNA Palette

**CSS Variables רלוונטיים:**
- `--message-warning-light` / `--message-warning` / `--message-warning-dark` — לצבע אזהרה
- `--message-info-light` / `--message-info` / `--message-info-dark` — לצבע מידע (אופציונלי)
- `--color-text` / `--color-text-secondary` — לטקסט
- `--color-border` / `--color-border-light` — לגבולות

**סגנון מוצע:**
- הודעת אזהרה (warning) — רקע בהיר, גבול, טקסט כהה
- עיצוב עקבי עם רכיבי הודעות אחרים במערכת
- RTL support מלא
- Fluid Design (clamp(), min(), max()) — ללא media queries

---

## 3. תכנון מימוש

### 3.1 רכיב Presentational

**אפשרות 1: CSS Classes בלבד (מומלץ)**
- יצירת CSS classes להודעת המשילות
- Team 30 יוסיף את ה-HTML עם ה-classes
- פשוט יותר, עקבי עם מערכת ה-CSS הקיימת

**אפשרות 2: React Component**
- יצירת רכיב React Presentational
- Team 30 משלב את הרכיב
- יותר מורכב, דורש תיאום נוסף

**המלצה:** אפשרות 1 — CSS Classes בלבד

---

### 3.2 קבצים למימוש

**קובץ CSS:**
- `ui/src/styles/phoenix-components.css` — הוספת CSS classes להודעת המשילות

**CSS Classes מוצעים:**
```css
/* Governance Message (ADR-015) - D16 "Other Broker" */
.governance-message {
  /* Base styles */
}

.governance-message--warning {
  /* Warning variant */
}

.governance-message__text {
  /* Text styles */
}

.governance-message__link {
  /* Link styles */
}
```

---

### 3.3 תיאום עם Team 30

**נדרש:**
- תיאום עם Team 30 על מבנה HTML הנדרש
- וידוא שהרכיב מתאים לשילוב ב-D16
- בדיקה משותפת של התוצאה הסופית

---

## 4. שאלות להבהרה

### שאלה 1: סוג הודעה
**שאלה:** האם ההודעה צריכה להיות מסוג **warning** (אזהרה) או **info** (מידע)?

**הקשר:**
- הטקסט מציין הגבלה (לא ניתן לייבא אוטומטית נתונים) — נראה כמו warning
- אבל גם מציע פתרון (ליצור קשר) — נראה כמו info

**המלצה:** warning — כי יש הגבלה פונקציונלית

---

### שאלה 2: מיקום הודעה
**שאלה:** איפה בדיוק ב-D16 ההודעה צריכה להופיע?

**אפשרויות:**
- בתוך טופס הוספת/עריכת חשבון מסחר — ליד שדה בחירת ברוקר
- מעל הטופס — אזהרה כללית
- מתחת לשדה בחירת ברוקר — הודעה ספציפית

**נדרש:** הבהרה מ-Team 30 או Team 10

---

### שאלה 3: סגנון ויזואלי
**שאלה:** האם יש דוגמה או blueprint להודעת המשילות?

**אם לא:**
- האם להשתמש בסגנון דומה ל-alert cards הקיימים במערכת?
- האם להוסיף אייקון (warning/info icon)?

---

## 5. תוצר נדרש

### 5.1 CSS Classes להודעת המשילות

**קובץ:** `ui/src/styles/phoenix-components.css`

**תכונות:**
- ✅ שימוש ב-CSS Variables מה-DNA Palette
- ✅ RTL support מלא
- ✅ Fluid Design (clamp(), min(), max())
- ✅ עיצוב עקבי עם מערכת ה-DNA
- ✅ Responsive (אוטומטי דרך Fluid Design)

---

### 5.2 תיעוד

**קובץ:** `_COMMUNICATION/team_40/TEAM_40_ADR_015_GOVERNANCE_MESSAGE_COMPLETE.md`

**תוכן:**
- תיאור הרכיב שנוצר
- CSS Classes שנוספו
- דוגמת שימוש
- הפניה ל-Team 30 לשילוב

---

## 6. לוח זמנים

### שלב 1: הבהרות ✅ **הושלם**
- [x] קבלת תשובות לשאלות ההבהרה — החליטו על warning variant
- [x] תיאום עם Team 30 על מבנה HTML — דוגמה מוכנה

### שלב 2: מימוש CSS ✅ **הושלם**
- [x] יצירת CSS Classes להודעת המשילות
- [x] בדיקת RTL support
- [x] בדיקת Fluid Design
- [x] בדיקת עמידה ב-DNA Palette

### שלב 3: תיעוד והגשה ✅ **הושלם**
- [x] יצירת מסמך השלמה — `TEAM_40_ADR_015_GOVERNANCE_MESSAGE_COMPLETE.md`
- [x] הפניה ל-Team 30 לשילוב — `TEAM_40_TO_TEAM_30_ADR_015_GOVERNANCE_MESSAGE_COORDINATION.md`
- [x] דיווח ל-Team 10 — מסמך זה

---

## 7. תלותיות

**תלוי ב:**
- ✅ SSOT טקסט הודעה — קיים (`ADR_015_GOVERNANCE_MESSAGE_SSOT.md`)
- ✅ CSS Variables — קיימים ב-`phoenix-base.css`
- ⏳ הבהרות מ-Team 10/30 — ממתין

**תלויות אחרות:**
- Team 30 צריך לשלב את הרכיב ב-D16 — אחרי ש-Team 40 מספק את ה-CSS

---

## 8. סיכום

**מצב:** ✅ **הושלם — CSS Classes מוכנים לשימוש**

**משימות Team 40:**
1. ✅ יצירת CSS Classes להודעת המשילות ב-D16
2. ✅ עיצוב לפי DNA Palette
3. ✅ תיעוד והגשה ל-Team 30

**תוצר:**
- ✅ CSS Classes ב-`phoenix-components.css`
- ✅ דוגמת HTML לשימוש
- ✅ דוגמת JavaScript ל-Conditional Rendering
- ✅ מסמך תיאום ל-Team 30

**נדרש מ-Team 30:**
- שילוב ה-HTML ב-`tradingAccountsForm.js`
- מימוש Conditional Rendering
- שימוש ב-SSOT לטקסט וקישור

---

## 9. הפניות

- **מנדט:** `TEAM_10_TO_TEAM_30_ADR_015_BROKER_REFERENCE_MANDATE.md`
- **תוכנית עבודה:** `TEAM_10_ADR_015_BROKER_REFERENCE_WORK_PLAN.md`
- **SSOT הודעה:** `documentation/06-ENGINEERING/ADR_015_GOVERNANCE_MESSAGE_SSOT.md`
- **ADR סופי:** `ADR_015_FINAL_FOR_ARCHITECT_APPROVAL.md`

---

**Team 40 (Presentational / DNA)**  
**log_entry | ADR_015 | ACKNOWLEDGMENT_AND_PLAN | 2026-02-12**
