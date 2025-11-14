# Table Sorting Manual Checklist

## מטרת הסבב
אימות ידני לאחר עדכוני מערכת המיון המאוחדת (תאריכים ↘, סטטוס ↗, טיקר ↗) והחיבור המחודש ל־PageStateManager ו־UnifiedCacheManager.

## הכנה
- נקו מטמון דפדפן (`localStorage`, `IndexedDB`) באמצעות תפריט הניקוי המאוחד.
- רעננו את העמוד הרצוי לאחר הניקוי.
- ודאו שכל הטבלאות נרשמות (Console: `window.UnifiedTableSystem.registry.getAllTables()`).

## טבלאות משלימות
יש לבצע את הסבב עבור כל אחת מהטבלאות העיקריות:
`trades`, `trade_plans`, `executions`, `cash_flows`, `tickers`, `alerts`, `notes`, `trading_accounts`, וכן טבלאות משנה (`positions`, `portfolio`, `linked_items`, `trade_suggestions`).

## צ׳ק־ליסט
1. **ברירת מחדל קנונית**
   - טען את העמוד לאחר ניקוי מטמון.
   - ודא שהטבלה מוצגת לפי סדר תאריך יורד (הרשומה החדשה בראש).
   - ודא שאם יש שתי רשומות עם אותו תאריך: הסטטוס מסודר `open` → `closed` → `cancelled`.
   - אם אין סטטוס, ודא שמסודר לפי טיקר/שם (A → Z).

2. **שינוי סידור ידני**
   - לחץ על כותרת כל עמודה פעמיים ובדוק שהכיוון מתחלף (`↕ → ↑/↓`).
   - ודא שהאייקונים מתעדכנים בכותרות המתאימות בלבד.

3. **שחזור מצב**
   - מיין עמודה, עבור לעמוד אחר וחזור.
   - ודא שהסידור נשמר (PageStateManager ו-UnifiedCacheManager).
   - חזור על הפעולה לאחר רענון מלא של העמוד.

4. **התנהגות מודולים**
   - פתח חלון משנה (Positions, Portfolio, Linked Items).
   - ודא שהסידור ברירת מחדל מופעל במודול.
   - סגור ופתח מחדש את המודול כדי לוודא שהמצב נשמר.

5. **התנהגות חריגה**
   - נסה לסדר טבלה שאינה רשומה (הסר זמנית את קריאת `register...Tables`).
   - ודא שמתקבלת אזהרה מהמערכת הכללית ולא מבוצע מיון שגוי.

6. **PageStateManager**
   - ב־DevTools בדקו את `localStorage` (Keys: `pageState_<pageName>`).
   - ודאו שבכל ערך `sort` קיים אובייקט ממופה לפי `tableType` עם `columnIndex`, `direction`, `chain`.

7. **UnifiedCacheManager**
   - בדקו באמצעות הקונסול את `await window.getSortState('<tableType>')`.
   - ודאו שהערך מחזיר `chain` בהתאם לברירת המחדל או לפעולת המשתמש.

8. **בדיקות העלאת נתונים**
   - בצעו סינון/עימוד.
   - ודאו שהחזרת כלל הנתונים (`הצג הכל`) אינה מאבדת את הסידור האחרון.

9. **בדיקות רגרסיה**
   - עמודים ללא סטטוס (למשל `notes`) – ודאו שהסידור fallback לטיקר/שם.
   - טבלאות עם ערכים מעורבים (תאריכים כ־DateEnvelope ומחרוזות ISO) – ודאו שאין חריגות.

## תיעוד תוצאות
- רשמו את ממצאי הבדיקה והחריגות ב־`documentation/05-REPORTS/SORTING_FIXES_COMPLETE_REPORT.md`.
- אם anomaly מאותר, צרפו צילום מסך והעתק מצב (`window.getSortState`, `PageStateManager.loadSort`).

---
🔁 יש לבצע את הצ׳ק־ליסט לאחר כל שינוי במערכת המיון או ברישום טבלאות.



