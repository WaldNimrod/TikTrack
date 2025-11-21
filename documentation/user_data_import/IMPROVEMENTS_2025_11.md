# שיפורים במערכת ייבוא הנתונים - נובמבר 2025

## תאריך עדכון
21 בנובמבר 2025

## סקירה כללית

מסמך זה מתאר את השיפורים שבוצעו במערכת ייבוא הנתונים, כולל תיקון מערכת זיהוי כפילויות, הסרת שאריות קוד ישן, והוספת תכונות חדשות לניהול סשנים.

## 1. תיקון מערכת זיהוי כפילויות

### 1.1 תיקון תצוגת כפתורים
**בעיה**: כל שורה בטבלת כפילויות (הראשית + matches) הציגה כפתורי אישור/דחייה, מה שגרם לבלבול.

**פתרון**:
- הוסרו כפתורי אישור/דחייה משורות ה-match (`renderDuplicateMatchRows`)
- רק השורה הראשית מציגה כפתורי פעולה
- שורות ה-match מציגות רק מידע (ללא כפתורים)

**קבצים**:
- `trading-ui/scripts/import-user-data.js` - פונקציה `renderDuplicateMatchRows` (שורה 8748)

### 1.2 הוספת תאריך ושעה מדויקים
**בעיה**: בטבלת כפילויות חסרה עמודת תאריך ושעה מדויקים.

**פתרון**:
- נוספה עמודת "תאריך ושעה" בטבלאות כפילויות
- נוצרה פונקציה חדשה `renderImportDateTime` להצגת תאריך ושעה מלאים
- העמודה מוצגת גם עבור executions וגם עבור cashflows

**קבצים**:
- `trading-ui/scripts/import-user-data.js` - פונקציה `renderImportDateTime` (שורה 3318), `renderDuplicateRow` (שורה 8675)
- `trading-ui/data_import.html` - עדכון כותרות טבלאות (שורות 678-695, 703-720)

### 1.3 תיקון accept/reject duplicate
**בעיה**: לחיצה על אישור או דחייה הציגה הודעות הצלחה אבל הסשן לא התעדכן והרשומות לא יובאו.

**פתרון**:
- הוספת timeout קצר (100ms) לפני `refreshPreviewData` כדי להבטיח שה-backend commit הושלם
- סינון רשומות rejected ב-`renderExecutionStyleProblems` כדי שלא יוצגו בטבלה
- וידוא ש-`accept_duplicate` ו-`reject_duplicate` מעדכנים את ה-cache נכון

**קבצים**:
- `trading-ui/scripts/import-user-data.js` - פונקציות `acceptDuplicate` (שורה 7129), `rejectDuplicate` (שורה 7164), `renderExecutionStyleProblems` (שורה 9136)
- `Backend/services/user_data_import/import_orchestrator.py` - פונקציות `accept_duplicate` (שורה 4142), `reject_duplicate` (שורה 4245)

### 1.4 וידוא 5 דקות tolerance
**סטטוס**: הלוגיקה כבר מיושמת נכון ב-`duplicate_detection_service.py` (שורה 586).

**פירוט**:
- פער של יותר מ-5 דקות (300 שניות) בין תאריכים נחשב לא כפילות
- הלוגיקה בודקת גם same_day וגם within_5_minutes

**קבצים**:
- `Backend/services/user_data_import/duplicate_detection_service.py` - שורה 577-591

## 2. הסרת שאריות קוד של המשך סשן ישן משלב 1

### 2.1 הסרת HTML elements
**בעיה**: בשלב 1 הוצג מידע על סשן ישן עם כפתור "נקה סשן" שלא רלוונטי יותר.

**פתרון**:
- הוסרו לחלוטין `activeSessionControlsRow` ו-`activeSessionDetailsRow` מ-`data_import.html`
- הוסר `activeSessionIndicator` וכל התוכן הקשור

**קבצים**:
- `trading-ui/data_import.html` - שורות 267-327

### 2.2 ניקוי JavaScript
**בעיה**: קוד JavaScript טיפל ב-elements שכבר לא קיימים וגרם לבעיות (למשל שדה בחירת ספק נתונים לא פעיל).

**פתרון**:
- `syncAccountAndConnectorLockState` - הוסרה לוגיקה של lock connector בגלל סשן ישן
- `updateActiveSessionIndicator` - הוחלפה ב-return ריק
- `updateResetSessionButtonState` - הוחלפה ב-return ריק
- הוסר קוד שמטפל ב-`resumeImportSessionBtn` ב-`updateHeaderActions`

**קבצים**:
- `trading-ui/scripts/import-user-data.js` - פונקציות `syncAccountAndConnectorLockState` (שורה 670), `updateActiveSessionIndicator` (שורה 2913), `updateResetSessionButtonState` (שורה 2757), `updateHeaderActions` (שורה 4687)

### 2.3 ניקוי CSS
**פתרון**:
- הוסרו כל הסגנונות הקשורים ל-`activeSessionControlsRow`, `activeSessionDetailsRow`, `resetImportSessionBtn`, `resumeImportSessionBtn`

**קבצים**:
- `trading-ui/styles-new/07-pages/_data-import.css` - שורות 74-105
- `trading-ui/styles-new/06-components/_import-system.css` - שורות 35-41

## 3. מימוש כפתור המשך סשן בטבלה

### 3.1 הוספת כפתור בטבלה
**תכונה**: כפתור "המשך סשן" מופיע בטבלת סשני הייבוא (`data_import.html`).

**פירוט**:
- הכפתור מופיע רק לסשנים עם status `ready` או `analyzing` (סשנים שניתן להמשיך)
- הכפתור ממוקם בעמודת הפעולות לפני כפתור "הרצה חוזרת"

**קבצים**:
- `trading-ui/scripts/data_import.js` - פונקציה `renderHistoryRow` (שורה 750)

### 3.2 מימוש פונקציית המשך סשן
**תכונה**: `resumeActiveImportSession` - PLACEHOLDER (לא מיושם כרגע).

**הערה**: המשתמש החזיר את הפונקציה למצב placeholder. המימוש המלא שהיה מתוכנן:
- טעינת נתוני הסשן מה-API
- קפיצה ישר לשלב 2 (דילוג על שלב 1)
- הצגת תוצאות ניתוח

**קבצים**:
- `trading-ui/scripts/import-user-data.js` - פונקציה `resumeActiveImportSession` (שורה 6309)

### 3.3 הוספת פונקציה continueImportSession
**תכונה**: `continueImportSession` - פותחת את מודול הייבוא ומנסה להמשיך סשן.

**פירוט**:
- פותחת את מודול הייבוא (`openImportUserDataModal`)
- קוראת ל-`resumeActiveImportSession` עם ה-session ID
- מחכה 300ms לפתיחת המודל

**קבצים**:
- `trading-ui/scripts/data_import.js` - פונקציה `continueImportSession` (שורה 1196)

## 4. מימוש כפתור מחיקת סשן

### 4.1 הוספת כפתור בטבלה
**תכונה**: כפתור מחיקה (DELETE) מופיע בטבלת סשני הייבוא.

**פירוט**:
- הכפתור משתמש ב-`data-button-type="DELETE"` (סגנון כפתורי המחיקה במערכת)
- הכפתור ממוקם בעמודת הפעולות אחרי כפתור "הרצה חוזרת"

**קבצים**:
- `trading-ui/scripts/data_import.js` - פונקציה `renderHistoryRow` (שורה 750)

### 4.2 מימוש פונקציית מחיקה ב-frontend
**תכונה**: `deleteImportSession` - מבקש אישור מהמשתמש ומבצע מחיקה.

**פירוט**:
- משתמש ב-`showConfirmationDialog` לאישור מהמשתמש
- קורא ל-API endpoint `DELETE /api/user-data-import/session/<session_id>`
- מרענן את הטבלה אחרי מחיקה מוצלחת
- מציג הודעות שגיאה/הצלחה

**קבצים**:
- `trading-ui/scripts/data_import.js` - פונקציה `deleteImportSession` (שורה 1201)

### 4.3 יצירת API endpoint
**Endpoint**: `DELETE /api/user-data-import/session/<int:session_id>`

**פירוט**:
- מקבל session_id
- קורא ל-`orchestrator.delete_session`
- מחזיר JSON response עם success status

**קבצים**:
- `Backend/routes/api/user_data_import.py` - פונקציה `delete_import_session` (שורה 1049)

### 4.4 הוספת פונקציה ב-service
**תכונה**: `delete_session` - מוחקת סשן וניקוי cache.

**פירוט**:
- מוצאת את הסשן ב-database
- מנקה cache entries (`import_session_{id}_summary`, `import_session_{id}_analysis`, `import_session_{id}_preview`)
- מוחקת את הסשן מה-database
- מבצעת commit

**קבצים**:
- `Backend/services/user_data_import/session_manager.py` - פונקציה `delete_session` (שורה 418)
- `Backend/services/user_data_import/import_orchestrator.py` - פונקציה `delete_session` (שורה 4063)

## קבצים שעודכנו

### Frontend
1. `trading-ui/scripts/import-user-data.js` - תיקון כפילויות, הסרת קוד ישן
2. `trading-ui/scripts/data_import.js` - הוספת כפתורי המשך סשן ומחיקה
3. `trading-ui/data_import.html` - הסרת HTML elements ישנים, עדכון כותרות טבלאות
4. `trading-ui/styles-new/07-pages/_data-import.css` - ניקוי CSS
5. `trading-ui/styles-new/06-components/_import-system.css` - ניקוי CSS

### Backend
1. `Backend/services/user_data_import/import_orchestrator.py` - תיקון accept/reject duplicate, הוספת delete_session
2. `Backend/routes/api/user_data_import.py` - הוספת endpoint מחיקה
3. `Backend/services/user_data_import/session_manager.py` - הוספת פונקציית מחיקה
4. `Backend/services/user_data_import/duplicate_detection_service.py` - וידוא 5 דקות tolerance

## שינויים ב-API

### Endpoints חדשים
- `DELETE /api/user-data-import/session/<int:session_id>` - מחיקת סשן ייבוא

### Endpoints קיימים (ללא שינוי)
- `POST /api/user-data-import/session/<int:session_id>/accept-duplicate` - אישור כפילות
- `POST /api/user-data-import/session/<int:session_id>/reject-duplicate` - דחיית כפילות
- `POST /api/user-data-import/session/<int:session_id>/refresh-preview` - רענון preview

## הערות חשובות

1. **resumeActiveImportSession**: הפונקציה הוחזרה למצב placeholder על ידי המשתמש. המימוש המלא שהיה מתוכנן לא פעיל כרגע.

2. **5 דקות tolerance**: הלוגיקה כבר הייתה מיושמת נכון - רק וידאנו שהיא עובדת.

3. **סינון rejected duplicates**: רשומות שנדחו (rejected) לא מוצגות יותר בטבלאות כפילויות.

4. **תאריך ושעה**: העמודה החדשה מציגה תאריך ושעה מלאים, לא רק תאריך.

## בדיקות מומלצות

ראה `TESTING_SCENARIOS.md` לתרחישי בדיקה מפורטים.

