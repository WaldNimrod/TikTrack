# 📋 ניתוח לגסי: D16_ACCTS_VIEW.html (ניהול חשבונות מסחר)
**project_domain:** TIKTRACK

**תאריך ניתוח:** 2026-02-01  
**צוות:** Team 31 (Blueprint)  
**סטטוס:** ⏳ מוכן לסריקה

## 🎯 מטרת העמוד

עמוד ניהול חשבונות מסחר - הצגה וניהול של חשבונות מסחר פעילים.

## 📐 מבנה הלגסי (מהקובץ המקורי)

### מבנה כללי:
```
<body>
  <GlobalPageTemplate entityContext="trading" pageTitle="ניהול חשבונות מסחר">
    <TtSection title="חשבונות מסחר פעילים:">
      <TtSectionRow>
        <div class="account-card">...</div>
        <div class="account-card">...</div>
      </TtSectionRow>
      <div class="section-actions-footer">
        <button class="btn-brand">+ הוסף חשבון מסחר</button>
      </div>
    </TtSection>
  </GlobalPageTemplate>
  <footer class="tt-system-footer">...</footer>
</body>
```

### רכיבים עיקריים:

#### 1. Account Card (כרטיס חשבון)
- **מבנה:**
  - `.card-title` - שם החשבון
  - `.balance-grid` - רשת יתרות
    - `.balance-item` - פריט יתרה
      - `.currency` - מטבע (USD, ILS)
      - `.amount` - סכום
  - `.card-footer` - סטטוס
    - `.tag-active` - תגית סטטוס "מחובר"

#### 2. דוגמאות נתונים:
- **חשבון 1:** חשבון מסחר מרכזי (Interactive Brokers)
  - USD: 142,500.42
  - ILS: 12,040.00
  - סטטוס: מחובר

- **חשבון 2:** חשבון גידור (Exante)
  - USD: 54,200.00
  - ILS: 0.00
  - סטטוס: מחובר

#### 3. פעולות:
- כפתור "הוסף חשבון מסחר" (`.btn-brand`)

## 🔍 מה צריך לסרוק בזמן ריצה

1. **מבנה HTML מלא** - כל האלמנטים וההיררכיה
2. **סגנונות CSS** - כל ה-classes והסגנונות
3. **אינטראקציות** - כפתורים, לינקים, אירועים
4. **נתונים** - מבנה הנתונים המוצגים
5. **Entity Context** - `entityContext="trading"` (צבעי ישות)
6. **תבנית GlobalPageTemplate** - איך היא עובדת

## 📝 הוראות שימוש בסקריפט

1. פתח את קובץ הלגסי בדפדפן: `ui/src/views/financial/D16_ACCTS_VIEW.html`
2. פתח את קונסולת הדפדפן (F12)
3. העתק והדבק את תוכן `legacy-scanner-D16_ACCTS_VIEW.js`
4. הסקריפט יריץ סריקה ויציג דוח מלא
5. העתק את התוצאה מ-`window.phoenixLegacyScan`

## 🎨 מיפוי ל-Phoenix V2

### תבנית בסיס:
- ✅ `D15_PAGE_TEMPLATE_STAGE_1.html` - תבנית בסיסית (ללא שינוי)

### מבנה עמוד:
- `page-wrapper` > `page-container` > `main` > `tt-container` > `tt-section`

### רכיבים:
- **Section Header:** עם כותרת "חשבונות מסחר פעילים"
- **Section Body:** כרטיסי חשבונות (Grid Layout)
- **Actions:** כפתור הוספה בתחתית הסקשן

### Entity Color:
- `entityContext="trading"` → צבע ישות Trading Account

## ✅ צעדים הבאים

1. ✅ סריקת קובץ הלגסי בזמן ריצה
2. ⏳ מיפוי מבנה הנתונים
3. ⏳ בניית עמוד Phoenix V2 על בסיס התבנית
4. ⏳ העברת תוכן מהלגסי
5. ⏳ ולידציה G-Bridge
