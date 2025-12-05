# מפרט מערכת: Watch List
## Watch List System Specification

**תאריך:** 28 בינואר 2025  
**גרסה:** 1.0.0  
**סטטוס:** אפיון מלא - מוכן למימוש

---

## תוכן עניינים

1. [סקירה כללית](#סקירה-כללית)
2. [דרישות פונקציונליות](#דרישות-פונקציונליות)
3. [ארכיטקטורה](#ארכיטקטורה)
4. [שכבות המערכת](#שכבות-המערכת)
5. [אינטגרציה עם מערכות קיימות](#אינטגרציה-עם-מערכות-קיימות)
6. [הגבלות ותצורת מערכת](#הגבלות-ותצורת-מערכת)

---

## סקירה כללית

### מטרת המערכת

מערכת Watch List מאפשרת למשתמשים ליצור ולנהל רשימות צפייה מותאמות אישית לטיקרים, עם תמיכה מלאה בטיקרים קיימים במערכת וגם טיקרים חיצוניים.

### תכונות עיקריות

- ✅ רשימות מרובות למשתמש (עד 20)
- ✅ טיקרים מרובים ברשימה (עד 50)
- ✅ תמיכה בטיקרים חיצוניים
- ✅ מערכת דגלים (8 צבעים)
- ✅ תצוגות מרובות (טבלה, כרטיסים, קומפקטי)
- ✅ סידור ידני (רשימות וטיקרים)
- ✅ עיצוב אישי (שם, איקון, צבע)
- ✅ תצוגת דגלים לפי צבע

---

## דרישות פונקציונליות

### 1. ניהול רשימות

**יצירת רשימה:**
- שם רשימה (חובה, max 100 chars)
- איקון (אופציונלי, מ-IconSystem)
- צבע (אופציונלי, hex format)
- תצוגה ברירת מחדל (table/cards/compact)

**עריכת רשימה:**
- שינוי שם, איקון, צבע
- שינוי תצוגה ברירת מחדל
- שינוי מיון ברירת מחדל

**מחיקת רשימה:**
- מחיקה כולל כל הפריטים (CASCADE)
- אישור מחיקה (אופציונלי)

**סידור רשימות:**
- Drag & Drop לסידור ידני
- שמירת סדר ב-DB

---

### 2. ניהול טיקרים ברשימה

**הוספת טיקר:**
- טיקר במערכת (חיפוש + בחירה)
- טיקר חיצוני (הזנת symbol)
- אופציונלי: דגל, הערות, מיקום

**הסרת טיקר:**
- הסרה מרשימה (לא מהמערכת)

**עריכת פריט:**
- שינוי דגל
- שינוי הערות
- שינוי מיקום

**סידור טיקרים:**
- Drag & Drop לסידור ידני
- שמירת סדר ב-DB

---

### 3. מערכת דגלים

**8 צבעי דגלים:**
- מ-8 צבעי ישויות קיימים
- הצעה: trade, tradePlan, account, cashFlow, ticker, alert, note, execution

**שינוי דגל:**
- Quick action - לחיצה על איקון דגל
- Palette עם 8 צבעים
- אפשרות להסרת דגל

**תצוגת דגלים:**
- כל דגל → תצוגה של כל הטיקרים עם הדגל הזה
- מכל הרשימות של המשתמש

---

### 4. תצוגות

**Table View (ברירת מחדל):**
- טבלה מלאה עם כל העמודות
- Sortable columns
- Drag & Drop לסידור
- Quick actions

**Cards View:**
- Grid של cards
- מידע בסיסי: Symbol, Name, Price, Change%
- Flag visible

**Compact View:**
- רשימה קומפקטית
- מינימלי: Symbol, Price, Change%, Flag

---

### 5. נתונים חיצוניים

**טיקרים חיצוניים:**
- Symbol + Name (optional)
- משיכת נתוני מחיר מ-External Data Service
- Caching משותף לכל המשתמשים
- תדירות נמוכה (לפי הגדרות)

**Integration:**
- YahooFinanceAdapter
- Batch requests
- Cache management

---

### 6. העתקה והעברה

**העתקת טיקר:**
- העתקה לרשימה אחרת
- שמירת דגל והערות

**ייבוא/ייצוא (עתידי):**
- ייצוא ל-CSV/JSON
- רשימת symbols עם פסיקים (copy to clipboard)

---

## ארכיטקטורה

### שכבות המערכת

```
┌─────────────────────────────────────┐
│      Frontend (UI Layer)            │
│  - watch-lists.html                 │
│  - watch-lists.js                   │
│  - watch-lists-ui-service.js        │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   Frontend Services                 │
│  - watch-lists-data.js              │
│  - ExternalDataService              │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   Backend API                       │
│  - /api/watch-lists/*               │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   Business Logic                    │
│  - WatchListService                 │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   Database                          │
│  - watch_lists                      │
│  - watch_list_items                 │
└─────────────────────────────────────┘
```

---

## שכבות המערכת

### 1. Database Layer

**טבלאות:**
- `watch_lists` - רשימות
- `watch_list_items` - פריטים

**ראו:** `DATABASE_SCHEMA.md` לפרטים מלאים

---

### 2. Backend API Layer

**Routes:**
- `/api/watch-lists` - CRUD רשימות
- `/api/watch-lists/:id/items` - CRUD פריטים
- `/api/watch-lists/flags/:color` - טיקרים לפי דגל
- `/api/watch-lists/external-tickers` - טיקרים חיצוניים

**ראו:** `API_REFERENCE.md` לפרטים מלאים

---

### 3. Frontend Services Layer

**Data Service:**
- CRUD wrappers
- Cache management
- Error handling

**UI Service:**
- View management
- Flag management
- Quick actions
- Drag & drop

**ראו:** `FRONTEND_SERVICES_SPEC.md` לפרטים מלאים

---

### 4. UI Layer

**עמוד ראשי:**
- Sections: Top, Lists Grid, Active List, Flagged Tickers
- Modals: Add/Edit List, Add Ticker, Flag Palette

**ראו:** `UI_DESIGN_SPEC.md` לפרטים מלאים

---

## אינטגרציה עם מערכות קיימות

### מערכות חובה

1. **Unified Initialization System** - אתחול עמוד
2. **Unified Cache Manager** - מטמון נתונים
3. **CRUD Response Handler** - טיפול בתגובות
4. **Modal Manager V2** - ניהול מודלים
5. **Unified Table System** - טבלאות ומיון
6. **Icon System** - איקונים
7. **Field Renderer Service** - רינדור שדות
8. **External Data Service** - נתונים חיצוניים
9. **Notification System** - התראות
10. **Color Scheme System** - צבעים

### מערכות אופציונליות

1. **Info Summary System** - סיכומי סטטיסטיקות
2. **Page State Management** - שמירת מצב

**ראו:** `INTEGRATION_PLAN.md` לפרטים מלאים

---

## הגבלות ותצורת מערכת

### הגבלות קשיחות

**מיקום:** `Backend/services/watch_list_service.py`

```python
MAX_WATCH_LISTS_PER_USER = 20  # TODO: Move to admin settings
MAX_TICKERS_PER_LIST = 50      # TODO: Move to admin settings
```

**הערה:** הגבלות אלה קשיחות בקוד עם הערה להעברה לממשק מנהל בעתיד.

---

### 8 צבעי דגלים

**מיקום:** `Backend/config/preferences_defaults.json` + Frontend

**מקור:** 8 מתוך 12 צבעי ישויות קיימים

**רשימה מוצעת:**
1. Trade: #26baac
2. Trade Plan: #0056b3
3. Account: #28a745
4. Cash Flow: #20c997
5. Ticker: #dc3545
6. Alert: #ff9c05
7. Note: #6f42c1
8. Execution: #17a2b8

---

## תכונות עתידיות (לא בשלב ראשון)

### Phase 2:
- התראות על שינויי מחיר
- ייצוא/ייבוא רשימות
- שיתוף רשימות בין משתמשים
- תבניות רשימות
- היסטוריית צפייה

---

## מסמכי תיעוד נוספים

1. **DATABASE_SCHEMA.md** - סכמת מסד נתונים מפורטת
2. **API_REFERENCE.md** - תיעוד API מלא
3. **FRONTEND_SERVICES_SPEC.md** - מפרט שירותי Frontend
4. **UI_DESIGN_SPEC.md** - מפרט עיצוב ממשק
5. **INTEGRATION_PLAN.md** - תוכנית אינטגרציה
6. **WATCHLIST_COMPARATIVE_ANALYSIS.md** - ניתוח השוואתי
7. **UI_PATTERNS_ANALYSIS.md** - ניתוח דפוסי UI

---

**סיכום:** מערכת Watch List מתוכננת במלואה עם אינטגרציה מלאה לכל המערכות הקיימות ומוכנה למימוש מלא.










