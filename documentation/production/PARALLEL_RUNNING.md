# TikTrack - הרצה במקביל של פיתוח ופרודקשן

**תאריך:** 2025-11-08  
**גרסה:** 1.0.0  
**מטרה:** הסבר על הרצה במקביל של שתי המערכות

## סקירה כללית

כן, ניתן להריץ את שני השרתים במקביל ללא בעיות טכניות, אבל יש כמה נקודות חשובות להבין.

## ✅ מה נפרד לחלוטין

### 1. פורטים נפרדים
- **פיתוח:** `http://localhost:8080`
- **פרודקשן:** `http://localhost:5001`
- ✅ אין התנגשויות - כל שרת רץ על פורט משלו

### 2. בסיסי נתונים נפרדים
- **פיתוח:** PostgreSQL (`TikTrack-db-development`)
- **פרודקשן:** PostgreSQL (`TikTrack-db-production`)
- ✅ אין שיתוף נתונים - כל שרת עם DB משלו

### 3. לוגים נפרדים
- **פיתוח:** `Backend/logs/`
- **פרודקשן:** `production/Backend/logs/`
- ✅ אין שיתוף לוגים

### 4. קוד Backend נפרד
- **פיתוח:** `Backend/` (כל הקבצים)
- **פרודקשן:** `production/Backend/` (רק קבצים פעילים)
- ✅ אין שיתוף קוד Backend

## ⚠️ מה משותף

### 1. Frontend (trading-ui) משותף

**שני השרתים משרתים את אותו `trading-ui/` directory:**

```
TikTrackApp/
├── Backend/              # שרת פיתוח → http://localhost:8080
├── production/Backend/   # שרת פרודקשן → http://localhost:5001
└── trading-ui/           # ← משותף לשניהם
```

**השפעה:**
- ✅ שינויים ב-`trading-ui/` יופיעו בשני השרתים
- ⚠️ זה יכול להיות מבלבל אם עובדים על שינויים ב-UI

### 2. Browser Storage משותף

**localStorage ו-sessionStorage משותפים בין שני השרתים:**

כי שניהם על `localhost` (אותו domain), ה-browser משתמש באותו storage:
- `localStorage` - נשמר בין sessions
- `sessionStorage` - נשמר רק ב-session הנוכחי
- Cookies - אם יש

**השפעה:**
- ⚠️ אם יש שמירת העדפות ב-localStorage, הם יהיו משותפים
- ⚠️ אם יש cache ב-localStorage, הוא יהיה משותף
- ⚠️ זה יכול לגרום לבלבול אם עובדים על שתי המערכות

## 🎯 תשובות לשאלות

### שאלה 1: האם יש בעיה להריץ במקביל?

**תשובה: לא, אין בעיה טכנית.**

✅ **יתרונות:**
- ניתן לעבוד על פיתוח תוך כדי שהפרודקשן רץ
- ניתן להשוות בין שתי המערכות
- נוח לבדיקות

⚠️ **זהירות:**
- שינויים ב-`trading-ui/` יופיעו בשניהם
- Browser storage משותף (localStorage/sessionStorage)
- צריך לזכור איזה פורט משתמשים

### שאלה 2: האם הרצה של אחד מאפשרת גלישה לשתי המערכות?

**תשובה: כן, אבל כל שרת נגיש רק דרך הפורט שלו.**

**דוגמה:**
```bash
# שרת פיתוח רץ על פורט 8080
# שרת פרודקשן רץ על פורט 5001

# גלישה לפיתוח:
http://localhost:8080

# גלישה לפרודקשן:
http://localhost:5001
```

**חשוב:**
- כל שרת נגיש רק דרך הפורט שלו
- לא ניתן לגשת לפרודקשן דרך פורט 8080
- לא ניתן לגשת לפיתוח דרך פורט 5001

## 🔧 המלצות להרצה במקביל

### 1. שימוש ב-Tabs נפרדים

פתח שני tabs נפרדים:
- Tab 1: `http://localhost:8080` (פיתוח)
- Tab 2: `http://localhost:5001` (פרודקשן)

### 2. שימוש ב-Incognito/Private Mode

אם יש בעיות עם browser storage:
- פתח פיתוח ב-normal mode
- פתח פרודקשן ב-incognito mode (או להיפך)

### 3. ניקוי Browser Storage

אם יש בלבול:
```javascript
// ב-Console של הדפדפן:
localStorage.clear();
sessionStorage.clear();
```

### 4. שימוש ב-Bookmarks

צור bookmarks ברורים:
- 🔧 TikTrack Dev: `http://localhost:8080`
- 🏭 TikTrack Prod: `http://localhost:5001`

## 📊 טבלת השוואה

| רכיב | פיתוח (8080) | פרודקשן (5001) | משותף? |
|------|---------------|----------------|---------|
| **Backend Code** | `Backend/` | `production/Backend/` | ❌ לא |
| **Database** | PostgreSQL (`TikTrack-db-development`) | PostgreSQL (`TikTrack-db-production`) | ❌ לא |
| **Port** | 8080 | 5001 | ❌ לא |
| **Logs** | `Backend/logs/` | `production/Backend/logs/` | ❌ לא |
| **Frontend (UI)** | `trading-ui/` | `trading-ui/` | ✅ כן |
| **Browser Storage** | `localhost` | `localhost` | ✅ כן |

## 🚨 בעיות אפשריות ופתרונות

### בעיה 1: שינויים ב-UI מופיעים בשניהם

**פתרון:**
- זה התנהגות נורמלית - `trading-ui/` משותף
- אם צריך UI נפרד, צריך ליצור `production/trading-ui/` נפרד

### בעיה 2: Browser Storage משותף

**פתרון:**
- השתמש ב-incognito mode לאחד השרתים
- או נקה storage לפני מעבר בין שרתים
- או הוסף prefix ל-localStorage keys לפי פורט

### בעיה 3: בלבול בין השרתים

**פתרון:**
- השתמש ב-bookmarks עם שמות ברורים
- הוסף indicator ב-UI (למשל: "DEV" או "PROD" ב-header)
- השתמש בצבעים שונים (למשל: רקע כחול לפיתוח, ירוק לפרודקשן)

## ✅ סיכום

**הרצה במקביל:**
- ✅ אפשרית טכנית
- ✅ מומלצת לבדיקות והשוואות
- ⚠️ צריך לשים לב ל-UI משותף ו-Browser Storage

**גלישה:**
- ✅ כל שרת נגיש רק דרך הפורט שלו
- ✅ ניתן לגלוש לשתי המערכות במקביל
- ⚠️ Browser Storage משותף (localStorage/sessionStorage)

---

**עודכן:** 2025-11-08  
**גרסה:** 1.0.0

