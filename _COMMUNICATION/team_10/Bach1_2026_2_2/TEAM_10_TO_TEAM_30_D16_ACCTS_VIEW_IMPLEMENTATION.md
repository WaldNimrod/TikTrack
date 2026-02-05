# 📋 הודעה למימוש עמוד חשבונות מסחר (D16_ACCTS_VIEW)

**מאת:** Team 10 (The Gateway)  
**אל:** Team 30 (Frontend Implementation)  
**תאריך:** 2026-02-03  
**סטטוס:** 🟢 **READY TO START**  
**עדיפות:** 🔴 **CRITICAL - FOUNDATION FOR ALL TABLES**

---

## 🎯 מטרת המשימה

מימוש מלא של עמוד **D16_ACCTS_VIEW** בהתאם לבלופרינט המאושר מ-Team 31 (v1.0.13). עמוד זה מהווה **תבנית בסיס לכל הטבלאות במערכת** ולכן חייב להיות מושלם ומדויק.

---

## 📊 סקירה כללית

### **העמוד הקיים:**
- מיקום: `ui/src/views/financial/D16_ACCTS_VIEW.html`
- סטטוס: גרסה ישנה עם כרטיסים פשוטים בלבד, ללא טבלאות
- דרישה: **החלפה מלאה** בבלופרינט החדש

### **הבלופרינט המאושר:**
- מיקום: `_COMMUNICATION/team_31/team_31_staging/sandbox_v2/D16_ACCTS_VIEW.html`
- גרסה: v1.0.13
- סטטוס: ✅ **READY FOR IMPLEMENTATION**

### **⚠️ תלות קריטית - Backend API:**
- **Team 20** מפתח את ה-API endpoints הנדרשים
- **Endpoints נדרשים:**
  - `GET /api/v1/trading_accounts` - טבלת חשבונות מסחר
  - `GET /api/v1/cash_flows` - טבלת תנועות
  - `GET /api/v1/positions` - טבלת פוזיציות
- **תאריך יעד Backend:** 2026-02-05
- **הערה:** אינטגרציה עם Backend יכולה להתחיל רק לאחר סיום Backend API

---

## 🏗️ מבנה העמוד - 5 קונטיינרים

| קונטיינר | כותרת | תוכן | פילטרים | טבלאות |
|:---|:---|:---|:---|:---|
| **0** | סיכום מידע והתראות פעילות | התראות + סיכום מידע | אין | אין |
| **1** | ניהול חשבונות מסחר | טבלת חשבונות מסחר | אין (גלובליים בלבד) | ✅ 10 עמודות |
| **2** | סיכום תנועות לחשבון | כרטיסי סיכום | כן (טווח תאריכים) | אין |
| **3** | דף חשבון לתאריכים | טבלת תנועות | כן (תאריכים + חשבון) | ✅ 8 עמודות |
| **4** | פוזיציות לפי חשבון | טבלת פוזיציות | כן (חשבון) | ✅ 9 עמודות |

---

## 📋 משימות מפורטות

### **שלב 1: יישום פונקציונליות JavaScript** 🔴 **CRITICAL**

**תאריך יעד:** 2026-02-05

#### **משימה 1.1: יצירת PhoenixTableSortManager**
- **מיקום:** `ui/src/cubes/shared/PhoenixTableSortManager.js`
- **דרישות:**
  - מחזור סידור: ASC → DESC → NONE
  - Multi-sort עם Shift (רמת סידור שניה)
  - עדכון UI (אייקונים, מצבים)
  - תמיכה בכל סוגי הנתונים (string, numeric, date, boolean)

#### **משימה 1.2: יצירת PhoenixTableFilterManager**
- **מיקום:** `ui/src/cubes/shared/PhoenixTableFilterManager.js`
- **דרישות:**
  - אינטגרציה עם `header-filters` (פילטר גלובלי)
  - תמיכה בפילטרים פנימיים (`phoenix-table-filters`)
  - שילוב פילטרים (גלובלי + מקומי)
  - עדכון בזמן אמת
  - שמירת מצב (URL/LocalStorage)

#### **משימה 1.3: יצירת פונקציות עזר**
- **מיקום:** `ui/src/cubes/shared/tableFormatters.js`
- **דרישות:**
  - פורמט תצוגה: מספרים, מטבעות, תאריכים
  - פורמט באגטים: סטטוס, סוג פעולה
  - פורמט עמודות מיוחדות: נוכחי (`$155.34(+3.22%)`), P/L (`+$550.0(+3.5%)`)

---

### **שלב 2: בניית HTML - קונטיינר 0** 🟡 **PENDING**

**תאריך יעד:** 2026-02-05

#### **משימה 2.1: מבנה LEGO בסיסי**
- מבנה: `tt-container` > `tt-section` > `index-section__header` + `index-section__body`
- ⚠️ **קריטי:** `tt-section` חייב להיות שקוף (רקע על header/body נפרד)

#### **משימה 2.2: התראות פעילות**
- וויגיט התראות עם באגט ספירה
- כפתור "הצג הכל"
- פונקציונליות הצגה/הסתרה

#### **משימה 2.3: סיכום מידע (Portfolio Summary)**
- שורה ראשונה: סיכום בסיסי
- שורה שנייה: סיכום מורחב (מוסתר בהתחלה)
- כפתור עין להצגה/הסתרה
- פונקציונליות `portfolio-summary.js`

---

### **שלב 3: בניית HTML - קונטיינר 1 (טבלת חשבונות מסחר)** 🔴 **CRITICAL**

**תאריך יעד:** 2026-02-06

#### **משימה 3.1: מבנה HTML בסיסי**
- מבנה LEGO: `tt-section` > `index-section__header` + `index-section__body`
- `phoenix-table-wrapper` > `phoenix-table`
- כל העמודות עם מחלקות נכונות

#### **משימה 3.2: עמודות הטבלה (10 עמודות)**
1. שם החשבון (`col-name`)
2. מטבע (`col-currency`)
3. יתרה (`col-balance`) - **מרכז, monospace**
4. פוזיציות (`col-positions`) - **מרכז**
5. רווח/הפסד (`col-total-pl`) - **מרכז**
6. שווי חשבון (`col-account-value`) ⚠️ **חדש - חובה** - **מרכז**
7. שווי אחזקות (`col-holdings-value`) ⚠️ **חדש - חובה** - **מרכז**
8. סטטוס (`col-status`) - באגט צבעוני
9. עודכן (`col-updated`) - `DD/MM/YYYY` - **מרכז**
10. פעולות (`col-actions`) - תפריט hover

#### **משימה 3.3: אינטגרציה עם Backend API**
- קריאה ל-`/api/v1/trading_accounts`
- שימוש ב-`transformers.js` (snake_case ↔ camelCase)
- טיפול בשגיאות

---

### **שלב 4: בניית HTML - קונטיינר 2 (סיכום תנועות)** 🟡 **PENDING**

**תאריך יעד:** 2026-02-06

#### **משימה 4.1: מבנה HTML בסיסי**
- מבנה LEGO: `tt-section` > `index-section__header` + `index-section__body`
- כרטיסי סיכום (Grid layout)

#### **משימה 4.2: פילטרים פנימיים**
- טווח תאריכים: תאריך התחלה + תאריך סיום
- ⚠️ **קריטי:** `phoenix-table-filters` עם `width: auto` (לא `100%`)

#### **משימה 4.3: כרטיסי סיכום**
- Grid: `repeat(auto-fit, minmax(200px, 1fr))`
- כל כרטיס: רקע לבן, מסגרת, border-radius

---

### **שלב 5: בניית HTML - קונטיינר 3 (טבלת תנועות)** 🟡 **PENDING**

**תאריך יעד:** 2026-02-07

#### **משימה 5.1: מבנה HTML בסיסי**
- מבנה LEGO: `tt-section` > `index-section__header` + `index-section__body`
- `phoenix-table-wrapper` > `phoenix-table`

#### **משימה 5.2: עמודות הטבלה (8 עמודות)**
1. תאריך פעולה (`col-date`)
2. סוג פעולה (`col-type`) - באגט לפי חיובי/שלילי
3. תת-סוג פעולה (`col-subtype`) - באגט עם מניפת צבעים
4. חשבון (`col-account`)
5. סכום (`col-amount`) - **מרכז**
6. מטבע (`col-currency`) - **מרכז**
7. סטטוס (`col-status`)
8. פעולות (`col-actions`)

#### **משימה 5.3: פילטרים פנימיים**
- תאריכים: תאריך התחלה + תאריך סיום
- חשבון: dropdown בחירת חשבון

#### **משימה 5.4: אינטגרציה עם Backend API**
- קריאה ל-`/api/v1/cash_flows`
- שימוש ב-`transformers.js`
- טיפול בשגיאות

---

### **שלב 6: בניית HTML - קונטיינר 4 (טבלת פוזיציות)** 🟡 **PENDING**

**תאריך יעד:** 2026-02-07

#### **משימה 6.1: מבנה HTML בסיסי**
- מבנה LEGO: `tt-section` > `index-section__header` + `index-section__body`
- `phoenix-table-wrapper` > `phoenix-table`

#### **משימה 6.2: עמודות הטבלה (9 עמודות)**
1. סמל (`col-symbol`)
2. כמות (`col-quantity`) - **מרכז**
3. מחיר ממוצע (`col-avg-price`) - **מרכז**
4. **נוכחי (`col-current_price`)** - `$155.34(+3.22%)` ⚠️ **פורמט מיוחד** - **מרכז**
5. שווי שוק (`col-market-value`) - **מרכז**
6. **P/L לא ממומש (`col-unrealized-pl`)** - `+$550.0(+3.5%)` ⚠️ **פורמט מיוחד** - **מרכז**
7. אחוז מהחשבון (`col-percent-account`) - **מרכז**
8. סטטוס (`col-status`)
9. פעולות (`col-actions`)

#### **משימה 6.3: פילטרים פנימיים**
- חשבון: dropdown בחירת חשבון

#### **משימה 6.4: אינטגרציה עם Backend API**
- קריאה ל-`/api/v1/positions`
- שימוש ב-`transformers.js`
- טיפול בשגיאות

---

### **שלב 7: אינטגרציה מלאה ובדיקות** 🔴 **CRITICAL**

**תאריך יעד:** 2026-02-08

#### **משימה 7.1: אינטגרציה עם Header**
- Unified Header: כל הפונקציונליות פעילה
- פילטרים גלובליים: אינטגרציה עם טבלאות

#### **משימה 7.2: אינטגרציה עם Footer**
- Footer מודולרי: טעינה דינמית
- `footer-loader.js` פעיל

#### **משימה 7.3: בדיקות פונקציונליות**
- כל הטבלאות: סידור, פילטרים, תפריט פעולות
- כל הקונטיינרים: פונקציונליות מלאה
- אינטגרציה עם Backend: קריאות API, טיפול בשגיאות

---

## ⚠️ כללים קריטיים

### **1. מבנה HTML - LEGO System**
- כל הסקשנים מוקפים ב-`tt-section` (שקוף)
- כל הסקשנים מכילים `.index-section__header` ו-`.index-section__body` (עם רקע נפרד)
- כל הטבלאות מוקפות ב-`.phoenix-table-wrapper`

### **2. סדר טעינת CSS (CRITICAL - DO NOT CHANGE)**
```html
<!-- 1. Pico CSS FIRST (Framework) -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@picocss/pico@1/css/pico.min.css">

<!-- 2. Phoenix Base Styles -->
<link rel="stylesheet" href="../../../../ui/src/styles/phoenix-base.css">

<!-- 3. LEGO Components -->
<link rel="stylesheet" href="../../../../ui/src/styles/phoenix-components.css">

<!-- 4. Header Component -->
<link rel="stylesheet" href="../../../../ui/src/styles/phoenix-header.css">

<!-- 5. Page-Specific Styles -->
<link rel="stylesheet" href="../../../../ui/src/styles/D15_DASHBOARD_STYLES.css">
```

### **3. ריווח (Spacing) - כלל מערכתי יסודי**
- ברירת מחדל: כל האלמנטים מקבלים `margin: 0` ו-`padding: 0`
- ריווח חייב להיות מוחל במפורש באמצעות מחלקות ריווח סטנדרטיות

### **4. יישור עמודות**
- כל העמודות המספריות: `text-align: center` (לא ימין/שמאל)
- כל כותרות העמודות: `text-align: center`

### **5. פילטרים פנימיים**
- אין `width: 100%` - יש להשתמש ב-`width: auto` עם `min-width` מתאים

### **6. תפריט פעולות**
- נפתח במעבר עכבר (hover) - **לא** מוצג קבוע
- דיליי לסגירה: `0.5s`
- פדינג לקונטיינר: `4px`

### **7. Clean Slate Rule**
- כל ה-JavaScript חייב להיות בקובצי JS חיצוניים
- אין תגי `<script>` inline
- שימוש ב-`js-` prefixed classes

---

## 📞 קישורים רלוונטיים

- **בלופרינט מאושר:** `_COMMUNICATION/team_31/team_31_staging/sandbox_v2/D16_ACCTS_VIEW.html`
- **הוראות מימוש:** `_COMMUNICATION/team_31/team_31_staging/sandbox_v2/TEAM_31_TO_TEAM_10_30_D16_ACCTS_VIEW_IMPLEMENTATION_REQUEST.md`
- **מפרט טבלאות:** `_COMMUNICATION/team_31/team_31_staging/PHOENIX_TABLES_SPECIFICATION.md`
- **תוכנית עבודה:** `_COMMUNICATION/team_10/TEAM_10_D16_ACCTS_VIEW_IMPLEMENTATION_PLAN.md`

---

**Team 10 (The Gateway)**  
**תאריך:** 2026-02-03  
**סטטוס:** 🟢 **READY TO START**  
**עדיפות:** 🔴 **CRITICAL**
