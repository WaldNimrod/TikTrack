# ✅ עדכון Blueprint - עמוד חשבונות מסחר

**תאריך:** 2026-02-01  
**סטטוס:** ✅ Blueprint עודכן לפי מיפוי מלא מהלגסי

---

## 📊 סיכום עדכונים

עודכנו **3 טבלאות** לפי המיפוי המדויק מהלגסי (`http://127.0.0.1:8090/trading_accounts`):

### ✅ Container 1: ניהול חשבונות מסחר (`accountsTable`)

**עמודות עודכנו:**
1. ✅ שם החשבון מסחר (`col-name`)
2. ✅ מטבע (`col-currency`)
3. ✅ יתרה (`col-balance`)
4. ✅ פוזיציות (`col-positions`) - **נוסף**
5. ✅ רווח/הפסד (`col-total-pl`) - **נוסף**
6. ✅ סטטוס (`col-status`)
7. ✅ עודכן (`col-updated`) - **שונה מ-"תאריך יצירה"**
8. ✅ פעולות (`col-actions`)

**שינויים:**
- ❌ הוסר: "ברוקר" (לא נמצא בלגסי)
- ✅ נוסף: "פוזיציות"
- ✅ נוסף: "רווח/הפסד"
- ✅ שונה: "תאריך יצירה" → "עודכן"

---

### ✅ Container 3: דף חשבון לתאריכים (`accountActivityTable`)

**עמודות עודכנו:**
1. ✅ תאריך (`col-date`)
2. ✅ סוג (`col-type`) - **נוסף**
3. ✅ תת-סוג (`col-subtype`) - **נוסף**
4. ✅ טיקר (`col-ticker`) - **נוסף**
5. ✅ סכום (`col-amount`)
6. ✅ מטבע (`col-currency`)
7. ✅ יתרה שוטפת (`col-balance`)
8. ✅ פעולות (`col-actions`) - **נוסף**

**שינויים:**
- ❌ הוסר: "תיאור" (לא נמצא בלגסי)
- ✅ נוסף: "סוג"
- ✅ נוסף: "תת-סוג"
- ✅ נוסף: "טיקר"
- ✅ נוסף: "פעולות"

---

### ✅ Container 4: פוזיציות לפי חשבון (`positionsTable`)

**עמודות עודכנו:**
1. ✅ סימבול (`col-symbol`)
2. ✅ נוכחי (`col-ticker`) - **נוסף**
3. ✅ כמות (`col-quantity`)
4. ✅ צד (`col-side`) - **נוסף**
5. ✅ מחיר ממוצע (`col-avg-price`)
6. ✅ שווי שוק (`col-market-value`)
7. ✅ P/L (`col-unrealized-pl`)
8. ✅ אחוז מהחשבון (`col-percent-account`) - **נוסף**
9. ✅ פעולות (`col-actions`) - **נוסף**

**שינויים:**
- ❌ הוסר: "חשבון" (לא נמצא בלגסי)
- ✅ נוסף: "נוכחי"
- ✅ נוסף: "צד"
- ✅ נוסף: "אחוז מהחשבון"
- ✅ נוסף: "פעולות"

---

## 📝 פרטים טכניים

### CSS Classes
כל עמודה כוללת את ה-`col-*` class המתאים לפי המיפוי מהלגסי.

### Data Attributes
- `data-table-type` - סוג הטבלה (trading_accounts)
- `data-column-index` - אינדקס העמודה למיון
- `data-sortable` - האם העמודה מיותרת
- `data-sort-key` - מפתח למיון
- `data-sort-type` - סוג הנתונים (string, numeric, date)

### IDs
- `accountsTable` - Container 1
- `accountActivityTable` - Container 3
- `positionsTable` - Container 4

---

## ✅ Checklist

- [x] Container 1 ממופה ועודכן
- [x] Container 3 ממופה ועודכן
- [x] Container 4 ממופה ועודכן
- [x] CSS Classes נוספו (`col-*`)
- [x] Data attributes עודכנו
- [x] דוגמאות רשומות עודכנו
- [x] קובץ מיפוי נוצר (`D16_ACCTS_VIEW_TABLES_MAPPING.md`)

---

## 📋 קבצים עודכנו

1. ✅ `D16_ACCTS_VIEW_BLUEPRINT.html` - Blueprint עודכן
2. ✅ `D16_ACCTS_VIEW_TABLES_MAPPING.md` - קובץ מיפוי נוצר
3. ✅ `TEAM_31_BLUEPRINT_UPDATED.md` - סיכום עדכונים (קובץ זה)

---

## 🚀 צעדים הבאים

1. **Team 30:** להשתמש ב-Blueprint המעודכן ליישום React
2. **Team 31:** לבדוק Container 0 ו-Container 2 (אם יש טבלאות דינמיות)
3. **Team 10:** לבדוק את הבלופרינט המעודכן

---

**Team 31 (Blueprint)**  
**Date:** 2026-02-01  
**Status:** ✅ **BLUEPRINT UPDATED WITH ACCURATE LEGACY MAPPING**
