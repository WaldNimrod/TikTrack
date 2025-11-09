# TikTrack Production Issues Log
# =================================

## מטרת הקובץ
תיעוד שיטתי של בעיות שמופיעות בסביבת Production בלבד ואינן מופיעות בסביבת Development, כולל:
- תיאור מפורט של הבעיה
- תהליך החקירה והזיהוי
- הפתרון שיושם
- בדיקות שבוצעו
- האם נדרש המשך עבודה/תחזוקה

## מבנה הקובץ
כל רשומה תכיל:
1. **מספר רשומה** - מספר סידורי
2. **תאריך זיהוי** - מתי הבעיה זוהתה
3. **תיאור הבעיה** - תיאור מפורט של מה לא עובד
4. **תסמינים** - איך הבעיה מתבטאת במערכת
5. **סביבה** - Production בלבד / גם Development
6. **חקירה** - מה נבדק ואיך זוהתה הסיבה
7. **סיבה שורשית** - מה הגורם האמיתי לבעיה
8. **פתרון** - מה תוקן ואיך
9. **בדיקות** - מה נבדק אחרי התיקון
10. **סטטוס** - פתור / בתהליך / דורש המשך עבודה
11. **הערות** - הערות נוספות, קישורים לקבצים רלוונטיים

---

## רשומה #1: העדפות משתמש - חשבונות מסחר לא נטענים

### תאריך זיהוי
2025-11-09

### תיאור הבעיה
בדף העדפות משתמש, חשבונות מסחר לא נטענים, כך שלא ניתן להגדיר חשבון ברירת מחדל.

### תסמינים
- בדף העדפות, שדה בחירת חשבון מסחר ברירת מחדל ריק או לא מציג אפשרויות
- המשתמש לא יכול לבחור חשבון מסחר
- הבעיה מופיעה רק בסביבת Production (פורט 5001)
- בסביבת Development (פורט 8080) הכל עובד תקין

### סביבה
- ✅ Production בלבד
- ❌ Development - עובד תקין

### חקירה

**קבצים רלוונטיים:**
- `trading-ui/scripts/preferences-page.js` - פונקציה `loadAccountsForPreferences()`
- `trading-ui/scripts/services/select-populator-service.js` - פונקציה `populateAccountsSelect()`
- `Backend/routes/api/trading_accounts.py` - endpoint `/api/trading-accounts/open`

**מה נבדק:**
1. ✅ הקוד משתמש ב-`SelectPopulatorService.populateAccountsSelect()` אם זמין
2. ✅ Fallback ל-fetch ישיר ל-`/api/trading-accounts/open?_t=${Date.now()}` (עם cache busting)
3. ✅ Endpoint `/api/trading-accounts/open` משתמש ב-`@api_endpoint(cache_ttl=60)` - cache של 60 שניות
4. ⚠️ **בעיה זוהתה**: `SelectPopulatorService.populateAccountsSelect()` קורא ל-`/api/trading-accounts/open` **ללא cache busting** (שורה 263)
5. ⚠️ **הבדל בין סביבות**: ב-Production יש cache אגרסיבי יותר (DEFAULT_CACHE_TTL=300), ב-Development (DEFAULT_CACHE_TTL=10)

**ממצאים:**
- ב-`preferences-page.js` יש cache busting: `?_t=${Date.now()}`
- ב-`SelectPopulatorService` אין cache busting
- ב-Production, cache של 60 שניות + cache ברמת advanced_cache_service
- אם `SelectPopulatorService` נקרא ראשון ומחזיר cache ישן/ריק, הבעיה תופיע

### סיבה שורשית
**זוהתה וזוהתה בבירור:**

1. **הבעיה העיקרית**: `SelectPopulatorService.populateAccountsSelect()` קורא ל-`/api/trading-accounts/open` **ללא cache busting** (שורה 263)
2. **ב-Production**: 
   - Cache ברמת endpoint: `@api_endpoint(cache_ttl=60)` - 60 שניות
   - Cache ברמת מערכת: `DEFAULT_CACHE_TTL = 300` - 5 דקות
   - Cache מופעל: `CACHE_DISABLED = False`
3. **ב-Development**:
   - Cache מושבת: `CACHE_DISABLED = True` (ברירת מחדל)
   - Cache קצר: `DEFAULT_CACHE_TTL = 10` שניות
4. **תרחיש הבעיה**:
   - אם cache מכיל תוצאה ריקה או ישנה מהקריאה הראשונה
   - `SelectPopulatorService` מחזיר את התוצאה מה-cache
   - ב-Production cache נשאר 60-300 שניות
   - ב-Development cache מושבת או מתעדכן מהר

**הבדל בין הקוד:**
- `preferences-page.js` fallback (שורה 114): משתמש ב-`?_t=${Date.now()}` ✅
- `SelectPopulatorService` (שורה 263): **לא משתמש ב-cache busting** ❌

### פתרון
**תוקן:**

**שינויים שבוצעו:**
1. **קובץ Development**: `trading-ui/scripts/services/select-populator-service.js`
   - שורה 262-264: הוספת cache busting ל-`populateAccountsSelect()`
2. **קובץ Production**: `production/trading-ui/scripts/services/select-populator-service.js`
   - שורה 262-264: הוספת cache busting ל-`populateAccountsSelect()` (תוקן ב-2025-11-09)

**לפני:**
```javascript
const endpoint = options.includeAll ? '/api/trading-accounts/' : '/api/trading-accounts/open';
const response = await fetch(endpoint);
```

**אחרי:**
```javascript
const baseEndpoint = options.includeAll ? '/api/trading-accounts/' : '/api/trading-accounts/open';
// Add cache busting to prevent stale cache issues in production
const endpoint = `${baseEndpoint}?_t=${Date.now()}`;
const response = await fetch(endpoint);
```

**הסבר:**
- הוספת `?_t=${Date.now()}` מבטיחה שכל קריאה תהיה ייחודית
- מונע שימוש ב-cache ישן/ריק ב-Production
- עקבי עם הקוד ב-`preferences-page.js` fallback

### בדיקות
**לבדוק אחרי תיקון:**
1. ✅ לבדוק שחשבונות מסחר נטענים בדף העדפות ב-Production
2. ✅ לבדוק שהתיקון לא שבר דבר ב-Development
3. ✅ לבדוק console logs - לוודא שהקריאה מתבצעת עם timestamp
4. ⚠️ **לבדוק גם**: האם יש עוד מקומות ב-`SelectPopulatorService` שצריכים cache busting:
   - `populateTickersSelect()` - `/api/tickers/` (שורה 204)
   - `populateCurrenciesSelect()` - `/api/currencies/` (שורה 340)
   - `populateTradesSelect()` - `/api/trades/` (שורה 450)
   - `populateTradePlansSelect()` - `/api/trade_plans/` (שורה 509)

### סטטוס
✅ **תוקן** - cache busting נוסף ל-`populateAccountsSelect()` גם ב-Development וגם ב-Production

**תאריך תיקון Production**: 2025-11-09

**הערה**: יש לבדוק אם נדרש להוסיף cache busting גם לשאר הפונקציות ב-`SelectPopulatorService` אם הן גורמות לבעיות דומות ב-Production.

### הערות
- **קבצים רלוונטיים:**
  - `trading-ui/scripts/preferences-page.js` (שורות 59-167)
  - `trading-ui/scripts/services/select-populator-service.js` (שורות 250-308) ✅ תוקן
  - `production/trading-ui/scripts/services/select-populator-service.js` (שורות 262-264) ✅ תוקן ב-2025-11-09
  - `Backend/routes/api/trading_accounts.py` (שורות 28-48)
  - `Backend/routes/api/base_entity_decorators.py` (שורות 33-75)
  - `Backend/config/settings.py` - הגדרות cache

- **הבדלים בין סביבות:**
  - Development: `CACHE_DISABLED = true` (ברירת מחדל), `DEFAULT_CACHE_TTL = 10`
  - Production: `CACHE_DISABLED = false`, `DEFAULT_CACHE_TTL = 300`

---

## רשומות נוספות
_רשומות נוספות יתווספו כאן..._

