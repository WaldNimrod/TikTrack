# דוח ניתוח דרישות - ai-analysis.html

**תאריך יצירה:** 30 בנובמבר 2025  
**עמוד:** `trading-ui/ai-analysis.html`  
**שלב:** שלב 1.5 - ניתוח דרישות

---

## סיכום ביצוע

ניתוח מפורט של הדרישות הפונקציונליות והטכניות של עמוד AI Analysis.

---

## 1. פונקציונליות מרכזית

### 1.1 בחירת תבנית ניתוח
- משתמש בוחר תבנית מתוך רשימת תבניות זמינות
- תבניות נטענות מ-API עם cache
- תבניות מוצגות ככרטיסים עם תיאור

### 1.2 מילוי משתנים
- אחרי בחירת תבנית, נפתח מודל עם טופס משתנים
- כל משתנה מוצג כ-select עם אופציות + "אחר"
- תמיכה באינטגרציות:
  - Tickers (via SelectPopulatorService)
  - Trading Methods (via SelectPopulatorService)
  - Investment Types
  - Trade Plan Reasons

### 1.3 בחירת מנוע AI
- משתמש בוחר מנוע AI (Gemini או Perplexity)
- בדיקה שהמנוע מוגדר בפרופיל המשתמש
- הצגת אזהרה אם אין מנוע מוגדר

### 1.4 יצירת ניתוח
- שליחת בקשה ל-API עם תבנית, משתנים, ומנוע
- הצגת מצב טעינה
- טיפול בשגיאות

### 1.5 הצגת תוצאות
- המרת Markdown ל-HTML
- הצגה במודל עם כפתורי פעולה:
  - שמור כהערה
  - ייצוא ל-PDF
  - ייצוא ל-Markdown
  - ייצוא ל-HTML

### 1.6 היסטוריית ניתוחים
- הצגת רשימת ניתוחים קודמים
- אפשרות לצפות בניתוח קודם

---

## 2. Use Cases עיקריים

### Use Case 1: ניתוח מניות חדש
1. משתמש נכנס לעמוד AI Analysis
2. בוחר תבנית "Equity Research Analysis"
3. ממלא משתנים: טיקר, סוג השקעה, טעם השקעה
4. בוחר מנוע AI (Gemini)
5. יוצר ניתוח
6. צופה בתוצאות
7. שומר כהערה לקשור לטיקר

### Use Case 2: ניתוח טכני
1. משתמש בוחר תבנית "Technical Analysis"
2. ממלא משתנים: טיקר, אינדיקטורים טכניים
3. יוצר ניתוח
4. מייצא ל-PDF

### Use Case 3: צפייה בניתוח קודם
1. משתמש נכנס לעמוד
2. רואה היסטוריית ניתוחים
3. לוחץ על "צפה בתוצאות"
4. צופה בניתוח במודל

---

## 3. אינטגרציות נדרשות

### 3.1 Notes System
- שמירת ניתוח כהערה
- קישור להערה לישות (טיקר, טרייד, תוכנית השקעה)

### 3.2 User Profile
- הגדרת API keys למנועי AI
- בדיקת הגדרות מנועים

### 3.3 Select Populator Service
- איכלוס select boxes:
  - Tickers
  - Trading Methods
  - Accounts
  - Trade Plans

### 3.4 Cache System
- מטמון תבניות (TTL: 1 שעה)
- מטמון היסטוריה (TTL: 5 דקות)
- CacheSyncManager integration

---

## 4. דרישות טכניות

### 4.1 מערכות מרכזיות חובה
- ✅ NotificationSystem - הצגת הודעות
- ✅ Logger Service - לוגים
- ✅ UnifiedCacheManager - מטמון
- ✅ CacheTTLGuard - TTL guard
- ✅ ModalManagerV2 - ניהול מודלים
- ✅ ButtonSystem - כפתורים סטנדרטיים
- ✅ IconSystem - אייקונים סטנדרטיים

### 4.2 מערכות מרכזיות מומלצות
- ⚠️ DataCollectionService - איסוף נתונים (לא בשימוש)
- ⚠️ CRUDResponseHandler - טיפול בתגובות (לא בשימוש מלא)
- ⚠️ FieldRendererService - רינדור שדות (בשימוש חלקי)

### 4.3 ספריות חיצוניות
- marked.js - המרת Markdown
- jsPDF - ייצוא PDF

---

## 5. דרישות UI/UX

### 5.1 מבנה העמוד
- Header section - ברוכים הבאים
- Templates section - בחירת תבנית
- History section - היסטוריית ניתוחים

### 5.2 מודלים
- Template Selection Modal - בחירת תבנית
- Variables Modal - מילוי משתנים
- Results Modal - הצגת תוצאות

### 5.3 כפתורים
- כל הכפתורים עם ButtonSystem
- `data-button-type`, `data-variant`
- `data-text` attributes

### 5.4 תגובות למשתמש
- מצב טעינה (spinners)
- הודעות הצלחה/שגיאה
- אזהרות (אם אין מנוע מוגדר)

---

## 6. דרישות ביצועים

### 6.1 טעינה ראשונית
- תבניות: cache עם TTL 1 שעה
- היסטוריה: cache עם TTL 5 דקות

### 6.2 יצירת ניתוח
- API call אסינכרוני
- הצגת מצב טעינה
- טיפול timeout

### 6.3 ייצוא
- PDF: client-side generation
- Markdown/HTML: download ישיר

---

## 7. דרישות אבטחה

### 7.1 API Keys
- API keys מאוחסנים ב-user profile
- לא נשלחים ל-client
- בדיקה שהמפתח תקין לפני יצירת ניתוח

### 7.2 אימות
- בדיקת authentication לפני שימוש
- credentials: 'include' בכל API calls

---

## 8. דרישות תחזוקה

### 8.1 קוד נקי
- שימוש במערכות מרכזיות
- אין כפילויות קוד
- JSDoc מלא

### 8.2 תקניות
- ITCSS compliance
- אין inline styles
- שימוש ב-IconSystem

---

## 9. סיכום דרישות

### דרישות פונקציונליות:
- ✅ בחירת תבנית
- ✅ מילוי משתנים
- ✅ בחירת מנוע AI
- ✅ יצירת ניתוח
- ✅ הצגת תוצאות
- ✅ היסטוריית ניתוחים

### דרישות טכניות:
- ✅ רוב המערכות משולבות
- ⚠️ צריך להוסיף DataCollectionService
- ⚠️ צריך להוסיף CRUDResponseHandler
- ⚠️ צריך להוסיף IconSystem

### דרישות UI/UX:
- ✅ מבנה נכון
- ⚠️ צריך קובץ CSS ספציפי
- ⚠️ צריך להסיר inline styles

---

**הערה:** דוח זה הוא חלק משלב 1 - לימוד מעמיק. השלבים הבאים יעסקו בתיקונים ובדיקות.

