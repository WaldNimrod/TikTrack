# מערכת ניהול חשבונות - תיעוד טכני

## סקירה כללית

מערכת ניהול החשבונות עברה ריכוז וארגון מחדש. כל הפונקציונליות מרוכזת בקובץ `accounts.js` ומשמשת את שני הדפים:
- `accounts.html` - דף חשבונות עם סטטיסטיקות
- `database.html` - דף בסיס נתונים עם ניהול כל הנתונים

## מבנה הקבצים

### קבצים ראשיים
- `trading-ui/scripts/accounts.js` - קובץ הפונקציות המשותפות
- `trading-ui/accounts.html` - דף חשבונות
- `trading-ui/database.html` - דף בסיס נתונים

### קבצים תומכים
- `trading-ui/scripts/grid-table.js` - פונקציות גנריות לטבלאות
- `trading-ui/scripts/app-header.js` - כותרת האפליקציה

## פונקציות עיקריות

### 1. ניהול נתונים
```javascript
// טעינת נתונים מהשרת
async function loadAccountsData()

// חישוב סטטיסטיקות
function calculateAccountsStats(accounts)

// עדכון סטטיסטיקות בממשק
function updateAccountsStats(stats)
```

### 2. ניהול מודלים
```javascript
// הצגת מודל הוספת חשבון
function showAddAccountModal()

// הצגת מודל עריכת חשבון
function showEditAccountModal(account)

// מילוי מודל עריכה
function fillAccountEditModal(account)
```

### 3. פעולות CRUD
```javascript
// יצירת חשבון חדש
async function createAccount(accountData)

// עדכון חשבון
async function updateAccount(accountId)

// מחיקת חשבון (עם בדיקת טריידים פתוחים)
async function deleteAccount(accountId, accountName)

// ביטול חשבון (עם בדיקת טריידים פתוחים)
async function cancelAccount(accountId, accountName)
```

### 4. המרות נתונים
```javascript
// המרת סטטוס לעברית
function convertAccountStatusToHebrew(status)

// המרת סטטוס לאנגלית
function convertAccountStatus(statusDisplay)
```

### 5. הצגת אזהרות
```javascript
// הצגת אזהרה עם טריידים פתוחים
async function showOpenTradesWarning(accountName, openTrades, action)

// הצגת הודעות למשתמש
function showNotification(message, type)
```

## זרימת עבודה

### הוספת חשבון חדש
1. המשתמש לוחץ על "הוסף" בדף החשבונות
2. `showAddAccountModal()` נפתחת
3. המשתמש ממלא את הטופס
4. `saveAccount()` נקראת
5. `createAccount()` שולחת בקשה לשרת
6. הנתונים נטענים מחדש עם `loadAccountsData()`

### עריכת חשבון
1. המשתמש לוחץ על "ערוך" בשורת החשבון
2. `showEditAccountModal(account)` נפתחת
3. המודל מתמלא עם נתוני החשבון
4. המשתמש מעדכן את הנתונים
5. `updateAccountFromModal()` נקראת
6. `updateAccount()` שולחת בקשה לשרת
7. הנתונים נטענים מחדש

### מחיקת חשבון
1. המשתמש לוחץ על "מחק"
2. `deleteAccount(accountId, accountName)` נפתחת
3. הפונקציה בודקת טריידים פתוחים:
   - אם יש טריידים פתוחים: מציגה אזהרה עם `showOpenTradesWarning()`
   - אם אין טריידים פתוחים: מוחקת את החשבון
4. הנתונים נטענים מחדש

### ביטול חשבון
1. המשתמש לוחץ על "ביטול" (רק בדף בסיס נתונים)
2. `cancelAccount(accountId, accountName)` נפתחת
3. הפונקציה בודקת טריידים פתוחים:
   - אם יש טריידים פתוחים: מציגה אזהרה
   - אם אין טריידים פתוחים: משנה סטטוס ל"מבוטל"
4. הנתונים נטענים מחדש

## בדיקת טריידים פתוחים

### זרימת הבדיקה
1. קריאה ל-API: `/api/v1/trades/?account_id={id}&status=פתוח`
2. קבלת רשימת טריידים פתוחים לחשבון
3. אם יש טריידים:
   - הצגת מודל אזהרה עם `showOpenTradesWarning()`
   - הצגת טבלה עם סימבולי טיקרים
   - מניעת הפעולה (ביטול/מחיקה)
4. אם אין טריידים:
   - המשך הפעולה הרגילה

### הצגת סימבולי טיקרים
1. קריאה ל-API: `/api/v1/tickers/`
2. יצירת מפה: `ticker_id` → `symbol`
3. הצגת סימבול בטבלה במקום מזהה מספרי

## סטטוסים עקביים

### סטטוסי חשבונות
- `פתוח` - חשבון פעיל
- `סגור` - חשבון לא פעיל  
- `מבוטל` - חשבון מבוטל

### המרות סטטוס
```javascript
// אנגלית לעברית
'active' → 'פתוח'
'inactive' → 'סגור'
'cancelled' → 'מבוטל'

// עברית לאנגלית
'פתוח' → 'פתוח'
'סגור' → 'סגור'
'מבוטל' → 'מבוטל'
```

## פונקציות גלובליות

כל הפונקציות זמינות גלובלית דרך `window`:

```javascript
// פונקציות עיקריות
window.loadAccountsData
window.calculateAccountsStats
window.updateAccountsStats
window.showAddAccountModal
window.showEditAccountModal
window.createAccount
window.updateAccount
window.deleteAccount
window.cancelAccount

// פונקציות עזר
window.convertAccountStatus
window.convertAccountStatusToHebrew
window.showOpenTradesWarning
window.showNotification
window.formatDateTime
```

## API Endpoints

### חשבונות
- `GET /api/v1/accounts/` - קבלת כל החשבונות
- `POST /api/v1/accounts/` - יצירת חשבון חדש
- `PUT /api/v1/accounts/{id}` - עדכון חשבון
- `DELETE /api/v1/accounts/{id}` - מחיקת חשבון

### טריידים
- `GET /api/v1/trades/?account_id={id}&status=פתוח` - טריידים פתוחים לחשבון
- `GET /api/v1/trades/` - כל הטריידים

### טיקרים
- `GET /api/v1/tickers/` - כל הטיקרים

## בעיות ידועות

### 1. פונקציה `get_by_account_and_status`
**מיקום**: `Backend/services/trade_service.py`
**בעיה**: מחזירה את כל הטריידים הפתוחים במערכת במקום רק את הטריידים של החשבון הספציפי
**סטטוס**: זוהה, ממתין לתיקון

### 2. URL Encoding
**מיקום**: `trading-ui/scripts/accounts.js`
**בעיה**: תווים עבריים לא מקודדים נכון ב-URL
**פתרון**: שימוש ב-`encodeURIComponent()`
**סטטוס**: תוקן חלקית

## בדיקות

### בדיקות פונקציונליות
1. **הוספת חשבון**: וודא שחשבון חדש נוצר בהצלחה
2. **עריכת חשבון**: וודא שנתוני החשבון מתעדכנים
3. **מחיקת חשבון**: וודא שהחשבון נמחק
4. **ביטול חשבון**: וודא שהסטטוס משתנה ל"מבוטל"

### בדיקות טריידים פתוחים
1. **חשבון עם טריידים פתוחים**: וודא שמופיעה אזהרה
2. **חשבון ללא טריידים פתוחים**: וודא שהפעולה מתבצעת
3. **הצגת סימבולים**: וודא שמוצגים סימבולי טיקרים

### בדיקות API
```bash
# בדיקת חשבונות
curl http://127.0.0.1:8080/api/v1/accounts/

# בדיקת טריידים פתוחים לחשבון 1
curl "http://127.0.0.1:8080/api/v1/trades/?account_id=1&status=%D7%A4%D7%AA%D7%95%D7%97"

# בדיקת טיקרים
curl http://127.0.0.1:8080/api/v1/tickers/
```

## תחזוקה

### הוספת פונקציה חדשה
1. הוסף את הפונקציה ל-`accounts.js`
2. הוסף תיעוד JSDoc
3. הוסף את הפונקציה לרשימת הפונקציות הגלובליות
4. בדוק שהפונקציה עובדת בשני הדפים

### עדכון API
1. עדכן את הפונקציה הרלוונטית ב-`accounts.js`
2. בדוק שהשינויים עובדים בשני הדפים
3. עדכן את התיעוד

### דיבוג
1. פתח את Developer Tools בדפדפן
2. בדוק את הלוגים בקונסול
3. בדוק את בקשות ה-Network
4. בדוק את הלוגים בשרת
