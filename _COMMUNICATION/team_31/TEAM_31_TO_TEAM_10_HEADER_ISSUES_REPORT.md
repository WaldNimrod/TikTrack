# 🐛 דיווח שגיאות - אלמנט ראש הדף (Header Component)

**מאת:** Team 31 (Blueprint)  
**תאריך:** 2026-02-01  
**עד:** Team 10 (Gateway) + Team 40 (UI Assets & Design)  
**עדיפות:** גבוהה - משפיע על כל העמודים במערכת

---

## 📋 סיכום

זוהו שתי שגיאות קשות באלמנט ראש הדף (Unified Header) המשפיעות על כל העמודים במערכת:

1. **לוגו גדול מדי** - גובה הלוגו חורג מהמותר
2. **אייקון משתמש לא מיושר** - אייקון המשתמש לא צמוד לסוף השורה

---

## 🔴 שגיאה #1: לוגו גדול מדי

### תיאור הבעיה
הלוגו בעמוד הראשי (`#unified-header .logo-image`) גדול מדי. הגובה המקסימלי המותר הוא **55px**, אך הלוגו הנוכחי חורג מהגבול הזה.

### מיקום בקוד
- **קובץ CSS:** `ui/src/styles/phoenix-header.css`
- **Selector:** `#unified-header .logo-image`
- **קובץ HTML:** כל העמודים המשתמשים ב-Unified Header

### השפעה
- הפרה של עיצוב אחיד
- בעיות יישור עם אלמנטים אחרים ב-header
- בעיות תצוגה במסכים קטנים

### תיקון זמני (הוחל ב-blueprints)
```css
#unified-header .logo-image {
  max-height: 55px !important;
  height: auto !important;
  width: auto !important;
}
```

### פעולה נדרשת
**Team 40 (UI Assets & Design)** נדרש:
1. לבדוק את גובה הלוגו בקובץ `ui/src/styles/phoenix-header.css`
2. להגדיר `max-height: 55px` (או פחות) ל-`.logo-image`
3. לוודא שהלוגו שומר על יחס גובה-רוחב (aspect ratio)

---

## 🔴 שגיאה #2: אייקון משתמש לא מיושר

### תיאור הבעיה
אייקון המשתמש (`#unified-header .filter-user-section`) לא צמוד לסוף השורה כנדרש. האייקון צריך להיות מיושר לימין (במבנה RTL) של שורת הפילטרים.

### מיקום בקוד
- **קובץ CSS:** `ui/src/styles/phoenix-header.css`
- **Selector:** `#unified-header .filter-user-section`
- **קובץ HTML:** כל העמודים המשתמשים ב-Unified Header

### השפעה
- הפרה של עיצוב אחיד
- בעיות יישור עם אלמנטים אחרים ב-header
- חווית משתמש לא עקבית

### תיקון זמני (הוחל ב-blueprints)
```css
#unified-header .filter-user-section {
  margin-inline-start: auto !important;
  margin-inline-end: 0 !important;
}

#unified-header .filter-actions {
  margin-inline-start: auto !important;
}
```

### פעולה נדרשת
**Team 40 (UI Assets & Design)** נדרש:
1. לבדוק את יישור אייקון המשתמש בקובץ `ui/src/styles/phoenix-header.css`
2. לוודא ש-`.filter-user-section` מיושר לימין השורה (RTL)
3. לוודא ש-`.filter-actions` גם מיושר נכון

---

## ✅ תיקונים זמניים שהוחלו

תיקונים זמניים הוחלו בשני הבלופרינטים:
- `D18_BRKRS_VIEW.html`
- `D21_CASH_VIEW.html`

התיקונים הזמניים מוגדרים ב-`<style>` בתוך הקבצים, אך יש לתקן את הבעיות בקובץ ה-CSS הראשי של המערכת.

---

## 📝 הערות נוספות

1. **תאימות:** השגיאות משפיעות על כל העמודים במערכת המשתמשים ב-Unified Header
2. **בדיקה:** יש לבדוק את התיקונים גם במערכת הפעילה (Production)
3. **תיעוד:** יש לעדכן את התיעוד של Unified Header לאחר התיקון

---

## 🔗 קבצים רלוונטיים

- `ui/src/styles/phoenix-header.css` - קובץ CSS הראשי של Header
- `_COMMUNICATION/team_31/team_31_staging/sandbox_v2/D18_BRKRS_VIEW.html` - Blueprint עם תיקון זמני
- `_COMMUNICATION/team_31/team_31_staging/sandbox_v2/D21_CASH_VIEW.html` - Blueprint עם תיקון זמני

---

**סטטוס:** ✅ דיווח הושלם  
**ממתין ל:** Team 40 (UI Assets & Design) + Team 10 (Gateway) לאישור ותיקון
