# תרחישי בדיקה - אינטגרציה דשבורד טיקרים עם מערכת נתונים חיצוניים

## מטרה

מסמך זה מכיל תרחישי בדיקה מדויקים ומפורטים לבדיקת האינטגרציה המלאה בין דשבורד הטיקרים למערכת הנתונים החיצוניים.

**תאריך יצירה:** 6 בדצמבר 2025  
**גרסה:** 1.0.0  
**מחבר:** TikTrack Development Team

---

## תוכן עניינים

1. [תרחיש 1: טעינה ראשונית של עמוד טיקרים](#תרחיש-1-טעינה-ראשונית-של-עמוד-טיקרים)
2. [תרחיש 2: בדיקת שלמות נתונים אוטומטית](#תרחיש-2-בדיקת-שלמות-נתונים-אוטומטית)
3. [תרחיש 3: העשרת נתונים אוטומטית](#תרחיש-3-העשרת-נתונים-אוטומטית)
4. [תרחיש 4: הצגת אינדיקטורי סטטוס](#תרחיש-4-הצגת-אינדיקטורי-סטטוס)
5. [תרחיש 5: טעינת נתונים היסטוריים חסרים](#תרחיש-5-טעינת-נתונים-היסטוריים-חסרים)
6. [תרחיש 6: רענון נתונים חסרים](#תרחיש-6-רענון-נתונים-חסרים)
7. [תרחיש 7: ניהול Cache](#תרחיש-7-ניהול-cache)
8. [תרחיש 8: Progress Overlay](#תרחיש-8-progress-overlay)
9. [תרחיש 9: אינטגרציה עם External Data Dashboard](#תרחיש-9-אינטגרציה-עם-external-data-dashboard)
10. [תרחיש 10: בדיקת ביצועים](#תרחיש-10-בדיקת-ביצועים)

---

## תרחיש 1: טעינה ראשונית של עמוד טיקרים

### מטרה

לבדוק שעמוד הטיקרים נטען בהצלחה וכל המערכות הנדרשות זמינות.

### תנאים מקדימים

- השרת רץ על `http://127.0.0.1:8080`
- יש לפחות טיקר אחד במסד הנתונים
- המשתמש מחובר למערכת

### צעדים

1. **פתיחת עמוד טיקרים**
   - נווט ל: `http://127.0.0.1:8080/trading-ui/tickers.html`
   - המתן לטעינה מלאה (3-5 שניות)

2. **בדיקת טעינת JavaScript**
   - פתח את Console (F12)
   - בדוק שאין שגיאות קריטיות (SEVERE)
   - בדוק שההודעות הבאות מופיעות:

     ```
     ✅ Logger Service initialized successfully
     ✅ Header System v7.0.0 loaded successfully
     ✅ Unified Cache Manager initialized successfully
     ✅ EntityDetailsAPI initialized successfully
     ✅ ExternalDataService initialized successfully
     ✅ UnifiedProgressManager loaded
     ```

3. **בדיקת זמינות פונקציות**
   - בחר Console
   - הרץ את הפקודות הבאות:

     ```javascript
     typeof window.checkTickerDataCompleteness === 'function'
     typeof window.checkTickersDataCompleteness === 'function'
     typeof window.ensureHistoricalDataForTickers === 'function'
     typeof window.enrichTickersWithFullData === 'function'
     typeof window.loadAndRefreshMissingData === 'function'
     typeof window.getDataStatusBadge === 'function'
     ```

   - **תוצאה צפויה:** כל הפקודות מחזירות `true`

4. **בדיקת טעינת טבלה**
   - בדוק שהטבלה מופיעה בעמוד
   - בדוק שיש לפחות שורה אחת בטבלה
   - בדוק שהעמודות הבאות מופיעות:
     - סמל טיקר
     - מחיר נוכחי
     - שינוי יומי
     - נפח
     - סטטוס
     - סוג
     - שם
     - מטבע

### תוצאות צפויות

✅ **הצלחה:**

- העמוד נטען ללא שגיאות
- כל הפונקציות זמינות
- הטבלה מוצגת עם נתונים

❌ **כשלון:**

- שגיאות JavaScript בקונסול
- פונקציות חסרות
- טבלה ריקה או לא מופיעה

---

## תרחיש 2: בדיקת שלמות נתונים אוטומטית

### מטרה

לבדוק שהמערכת בודקת אוטומטית את שלמות הנתונים לכל טיקר.

### תנאים מקדימים

- עמוד טיקרים פתוח
- יש לפחות 3 טיקרים במסד הנתונים

### צעדים

1. **פתיחת Console**
   - פתח את Console (F12)
   - נקה את הלוגים

2. **טעינה מחדש של העמוד**
   - לחץ F5 או רענן את העמוד
   - המתן לטעינה מלאה

3. **בדיקת לוגים**
   - חפש בלוגים את ההודעות הבאות:

     ```
     Enriching tickers with full data
     Found tickers with incomplete data
     ```

   - בדוק שהמערכת בודקת את השלמות של כל טיקר

4. **בדיקת פונקציה ידנית**
   - בחר Console
   - הרץ:

     ```javascript
     // קבלת רשימת טיקרים
     const tickers = window.TableDataRegistry?.getFilteredData('tickers') || [];
     
     // בדיקת שלמות נתונים
     if (typeof window.checkTickersDataCompleteness === 'function') {
       const result = await window.checkTickersDataCompleteness(tickers);
       console.log('Data Completeness Summary:', result);
     }
     ```

   - **תוצאה צפויה:** אובייקט עם:

     ```javascript
     {
       total: 58,
       complete: 10,
       incomplete: 48,
       missingHistorical: [...],
       missingCalculations: [...]
     }
     ```

### תוצאות צפויות

✅ **הצלחה:**

- המערכת בודקת אוטומטית את שלמות הנתונים
- הלוגים מציגים סיכום מדויק
- הפונקציה `checkTickersDataCompleteness` עובדת

❌ **כשלון:**

- אין לוגים של בדיקת שלמות
- הפונקציה לא עובדת או מחזירה שגיאה

---

## תרחיש 3: העשרת נתונים אוטומטית

### מטרה

לבדוק שהמערכת מעשירה אוטומטית את הנתונים עם נתונים מלאים (היסטוריים + חישובים טכניים).

### תנאים מקדימים

- עמוד טיקרים פתוח
- יש לפחות טיקר אחד עם נתונים בסיסיים

### צעדים

1. **פתיחת Console**
   - פתח את Console (F12)
   - נקה את הלוגים

2. **טעינה מחדש של העמוד**
   - לחץ F5 או רענן את העמוד
   - המתן לטעינה מלאה (10-15 שניות)

3. **בדיקת לוגים של העשרה**
   - חפש בלוגים את ההודעות הבאות:

     ```
     Enriching tickers with full data
     Enriched ticker with full data
     Loaded full ticker data from cache
     ```

   - בדוק שהמערכת מעשירה את הנתונים

4. **בדיקת נתונים מועשרים**
   - בחר Console
   - הרץ:

     ```javascript
     // קבלת רשימת טיקרים
     const tickers = window.TableDataRegistry?.getFilteredData('tickers') || [];
     
     // בדיקת נתונים מועשרים
     const enrichedTicker = tickers[0];
     console.log('Enriched Ticker Data:', {
       id: enrichedTicker.id,
       symbol: enrichedTicker.symbol,
       hasATR: !!enrichedTicker.atr,
       hasWeek52: !!enrichedTicker.week52_high,
       hasVolatility: !!enrichedTicker.volatility,
       hasMA20: !!enrichedTicker.ma_20,
       hasMA150: !!enrichedTicker.ma_150,
       historicalCount: enrichedTicker.historical_quotes_count
     });
     ```

   - **תוצאה צפויה:** לפחות חלק מהשדות מופיעים (ATR, Week52, וכו')

5. **בדיקת Cache**
   - הרץ:

     ```javascript
     // בדיקת Cache
     const cacheKey = `ticker-full-${tickers[0].id}`;
     const cached = await window.UnifiedCacheManager?.get(cacheKey, 'memory');
     console.log('Cached Data:', cached ? 'Found' : 'Not Found');
     ```

   - **תוצאה צפויה:** הנתונים נשמרים ב-Cache

### תוצאות צפויות

✅ **הצלחה:**

- המערכת מעשירה אוטומטית את הנתונים
- הנתונים נשמרים ב-Cache
- השדות הטכניים (ATR, Week52, וכו') מופיעים

❌ **כשלון:**

- אין לוגים של העשרה
- הנתונים לא מועשרים
- Cache לא עובד

---

## תרחיש 4: הצגת אינדיקטורי סטטוס

### מטרה

לבדוק שהאינדיקטורים של סטטוס נתונים מוצגים בטבלה.

### תנאים מקדימים

- עמוד טיקרים פתוח
- יש לפחות טיקר אחד עם נתונים מועשרים

### צעדים

1. **בדיקת תצוגת Badges**
   - בדוק בעמודת "סטטוס" בטבלה
   - חפש את ה-Badges הבאים:
     - 🟢 **Full** - נתונים מלאים (ירוק)
     - 🟡 **Partial** - נתונים חלקיים (צהוב)
     - 🔴 **Missing** - נתונים חסרים (אדום)

2. **בדיקת CSS Classes**
   - פתח את Developer Tools (F12)
   - בחר Element Inspector
   - בחר אחד מה-Badges
   - בדוק שה-CSS Classes הבאים קיימים:

     ```css
     .data-status-badge
     .status-full / .status-partial / .status-missing
     ```

3. **בדיקת פונקציה ידנית**
   - בחר Console
   - הרץ:

     ```javascript
     // קבלת רשימת טיקרים
     const tickers = window.TableDataRegistry?.getFilteredData('tickers') || [];
     
     // בדיקת Badge
     if (typeof window.getDataStatusBadge === 'function') {
       const badge = window.getDataStatusBadge(tickers[0]);
       console.log('Status Badge HTML:', badge);
     }
     ```

   - **תוצאה צפויה:** HTML של Badge עם Class מתאים

4. **בדיקת מספר Badges**
   - ספור כמה Badges מוצגים בטבלה
   - בדוק שכל שורה יש Badge אחד לפחות

### תוצאות צפויות

✅ **הצלחה:**

- Badges מוצגים בכל שורה
- הצבעים נכונים (ירוק/צהוב/אדום)
- ה-CSS Classes נכונים

❌ **כשלון:**

- אין Badges בטבלה
- Badges לא מוצגים נכון
- CSS Classes חסרים

---

## תרחיש 5: טעינת נתונים היסטוריים חסרים

### מטרה

לבדוק שהמערכת טוענת אוטומטית נתונים היסטוריים חסרים.

### תנאים מקדימים

- עמוד טיקרים פתוח
- יש לפחות טיקר אחד עם פחות מ-150 quotes היסטוריים

### צעדים

1. **זיהוי טיקר עם נתונים חסרים**
   - בחר Console
   - הרץ:

     ```javascript
     // קבלת רשימת טיקרים
     const tickers = window.TableDataRegistry?.getFilteredData('tickers') || [];
     
     // מציאת טיקר עם נתונים חסרים
     const incompleteTicker = tickers.find(t => {
       const completeness = window.checkTickerDataCompleteness(t);
       return !completeness.hasHistorical;
     });
     
     console.log('Incomplete Ticker:', {
       id: incompleteTicker?.id,
       symbol: incompleteTicker?.symbol,
       historicalCount: incompleteTicker?.historical_quotes_count
     });
     ```

   - **תוצאה צפויה:** טיקר עם `historical_quotes_count < 150`

2. **טעינת נתונים היסטוריים**
   - הרץ:

     ```javascript
     if (incompleteTicker && typeof window.ensureHistoricalDataForTickers === 'function') {
       const result = await window.ensureHistoricalDataForTickers([incompleteTicker], {
         showProgress: true,
         silent: false
       });
       console.log('Historical Data Load Result:', result);
     }
     ```

   - **תוצאה צפויה:** Progress Overlay מופיע, נתונים נטענים

3. **בדיקת Progress Overlay**
   - בדוק ש-Progress Overlay מופיע
   - בדוק שההודעות הבאות מופיעות:

     ```
     טוען נתונים היסטוריים
     טוען נתונים היסטוריים עבור [SYMBOL] (1/1)
     ```

4. **בדיקת תוצאה**
   - המתן לסיום התהליך (30-60 שניות)
   - בדוק שהנתונים נטענו:

     ```javascript
     // בדיקת נתונים מעודכנים
     const updatedTicker = await window.entityDetailsAPI.getEntityDetails('ticker', incompleteTicker.id, {
       includeMarketData: true,
       forceRefresh: true
     });
     
     console.log('Updated Historical Count:', updatedTicker.historical_quotes_count);
     ```

   - **תוצאה צפויה:** `historical_quotes_count >= 150`

### תוצאות צפויות

✅ **הצלחה:**

- Progress Overlay מופיע
- נתונים היסטוריים נטענים
- מספר ה-quotes עולה

❌ **כשלון:**

- Progress Overlay לא מופיע
- נתונים לא נטענים
- שגיאות בקונסול

---

## תרחיש 6: רענון נתונים חסרים

### מטרה

לבדוק שהמערכת מרעננת אוטומטית נתונים חסרים.

### תנאים מקדימים

- עמוד טיקרים פתוח
- יש לפחות טיקר אחד עם נתונים חסרים

### צעדים

1. **זיהוי טיקרים עם נתונים חסרים**
   - בחר Console
   - הרץ:

     ```javascript
     // קבלת רשימת טיקרים
     const tickers = window.TableDataRegistry?.getFilteredData('tickers') || [];
     
     // בדיקת שלמות נתונים
     const completeness = await window.checkTickersDataCompleteness(tickers);
     console.log('Completeness Summary:', completeness);
     ```

   - **תוצאה צפויה:** רשימת טיקרים עם נתונים חסרים

2. **רענון נתונים חסרים**
   - הרץ:

     ```javascript
     if (typeof window.loadAndRefreshMissingData === 'function') {
       const result = await window.loadAndRefreshMissingData(tickers, {
         showProgress: true,
         silent: false
       });
       console.log('Refresh Result:', result);
     }
     ```

   - **תוצאה צפויה:** Progress Overlay מופיע, נתונים מתעדכנים

3. **בדיקת Progress Overlay**
   - בדוק ש-Progress Overlay מופיע
   - בדוק שההודעות הבאות מופיעות:

     ```
     מרענן נתונים חסרים
     מרענן נתונים עבור [SYMBOL] (1/N)
     ```

4. **בדיקת תוצאה**
   - המתן לסיום התהליך (1-2 דקות)
   - בדוק שהנתונים התעדכנו:

     ```javascript
     // בדיקת שלמות נתונים מעודכנת
     const updatedCompleteness = await window.checkTickersDataCompleteness(tickers);
     console.log('Updated Completeness:', updatedCompleteness);
     ```

   - **תוצאה צפויה:** מספר הטיקרים עם נתונים חסרים ירד

### תוצאות צפויות

✅ **הצלחה:**

- Progress Overlay מופיע
- נתונים מתעדכנים
- מספר הטיקרים עם נתונים חסרים ירד

❌ **כשלון:**

- Progress Overlay לא מופיע
- נתונים לא מתעדכנים
- שגיאות בקונסול

---

## תרחיש 7: ניהול Cache

### מטרה

לבדוק שהמערכת מנהלת נכון את ה-Cache.

### תנאים מקדימים

- עמוד טיקרים פתוח
- יש לפחות טיקר אחד עם נתונים מועשרים

### צעדים

1. **בדיקת שמירה ב-Cache**
   - בחר Console
   - הרץ:

     ```javascript
     // קבלת רשימת טיקרים
     const tickers = window.TableDataRegistry?.getFilteredData('tickers') || [];
     const ticker = tickers[0];
     
     // בדיקת Cache
     const cacheKey = `ticker-full-${ticker.id}`;
     const cached = await window.UnifiedCacheManager?.get(cacheKey, 'memory');
     console.log('Cached Data:', cached ? 'Found' : 'Not Found');
     ```

   - **תוצאה צפויה:** הנתונים נמצאים ב-Cache

2. **בדיקת טעינה מ-Cache**
   - רענן את העמוד (F5)
   - בדוק בלוגים:

     ```
     Loaded full ticker data from cache
     ```

   - **תוצאה צפויה:** הנתונים נטענים מ-Cache (מהיר יותר)

3. **בדיקת Invalidation**
   - הרץ:

     ```javascript
     // Invalidation של Cache
     await window.UnifiedCacheManager?.delete(cacheKey, 'memory');
     
     // בדיקת טעינה מחדש
     const freshData = await window.entityDetailsAPI.getEntityDetails('ticker', ticker.id, {
       includeMarketData: true,
       forceRefresh: true
     });
     console.log('Fresh Data:', freshData);
     ```

   - **תוצאה צפויה:** נתונים חדשים נטענים מהשרת

### תוצאות צפויות

✅ **הצלחה:**

- נתונים נשמרים ב-Cache
- נתונים נטענים מ-Cache
- Invalidation עובד

❌ **כשלון:**

- Cache לא עובד
- נתונים לא נשמרים
- Invalidation לא עובד

---

## תרחיש 8: Progress Overlay

### מטרה

לבדוק ש-Progress Overlay מופיע נכון במהלך תהליכים ארוכים.

### תנאים מקדימים

- עמוד טיקרים פתוח
- `UnifiedProgressManager` זמין

### צעדים

1. **בדיקת זמינות UnifiedProgressManager**
   - בחר Console
   - הרץ:

     ```javascript
     typeof window.UnifiedProgressManager !== 'undefined'
     typeof window.UnifiedProgressManager.showProgress === 'function'
     ```

   - **תוצאה צפויה:** `true`

2. **הצגת Progress Overlay ידנית**
   - הרץ:

     ```javascript
     const overlayId = 'test-progress';
     window.UnifiedProgressManager.createOverlay(overlayId, {
       title: 'בדיקת Progress',
       totalSteps: 5,
       stepLabels: ['שלב 1', 'שלב 2', 'שלב 3', 'שלב 4', 'שלב 5'],
       stepDescriptions: ['תיאור 1', 'תיאור 2', 'תיאור 3', 'תיאור 4', 'תיאור 5']
     });
     window.UnifiedProgressManager.showProgress(overlayId, 1, 'מתחיל', 'תיאור שלב 1');
     ```

   - **תוצאה צפויה:** Progress Overlay מופיע במרכז המסך

3. **עדכון Progress**
   - הרץ:

     ```javascript
     window.UnifiedProgressManager.updateProgress(overlayId, 50, '50% הושלם');
     ```

   - **תוצאה צפויה:** ה-Progress Bar מתעדכן ל-50%

4. **הסתרת Progress**
   - הרץ:

     ```javascript
     window.UnifiedProgressManager.hideProgress(overlayId);
     ```

   - **תוצאה צפויה:** Progress Overlay נעלם

### תוצאות צפויות

✅ **הצלחה:**

- Progress Overlay מופיע
- Progress מתעדכן
- Progress נסגר נכון

❌ **כשלון:**

- Progress Overlay לא מופיע
- Progress לא מתעדכן
- שגיאות בקונסול

---

## תרחיש 9: אינטגרציה עם External Data Dashboard

### מטרה

לבדוק שהאינטגרציה עם External Data Dashboard עובדת.

### תנאים מקדימים

- עמוד טיקרים פתוח
- External Data Dashboard זמין

### צעדים

1. **פתיחת External Data Dashboard**
   - נווט ל: `http://127.0.0.1:8080/trading-ui/external-data-dashboard.html`
   - המתן לטעינה מלאה

2. **בדיקת טבלת "טיקרים עם נתונים חסרים"**
   - חפש את הטבלה "טיקרים עם נתונים חסרים"
   - בדוק שיש שורות בטבלה
   - בדוק שכל שורה יש כפתור "רענון"

3. **רענון טיקר מהטבלה**
   - לחץ על כפתור "רענון" בשורה כלשהי
   - בדוק ש-Progress Overlay מופיע
   - המתן לסיום התהליך

4. **בדיקת תוצאה**
   - חזור לעמוד טיקרים
   - רענן את העמוד (F5)
   - בדוק שהנתונים התעדכנו

### תוצאות צפויות

✅ **הצלחה:**

- טבלת "טיקרים עם נתונים חסרים" מופיעה
- כפתור "רענון" עובד
- הנתונים מתעדכנים

❌ **כשלון:**

- טבלה לא מופיעה
- כפתור "רענון" לא עובד
- נתונים לא מתעדכנים

---

## תרחיש 10: בדיקת ביצועים

### מטרה

לבדוק שהביצועים תקינים גם עם מספר גדול של טיקרים.

### תנאים מקדימים

- יש לפחות 50 טיקרים במסד הנתונים
- עמוד טיקרים פתוח

### צעדים

1. **מדידת זמן טעינה ראשונית**
   - פתח את Network Tab ב-Developer Tools
   - נקה את הלוגים
   - רענן את העמוד (F5)
   - מדוד את זמן הטעינה:
     - זמן עד להצגת הטבלה
     - זמן עד להשלמת העשרת נתונים

2. **מדידת זמן העשרה**
   - בחר Console
   - הרץ:

     ```javascript
     const startTime = performance.now();
     
     const tickers = window.TableDataRegistry?.getFilteredData('tickers') || [];
     await window.enrichTickersWithFullData(tickers.slice(0, 10), {
       showProgress: true,
       silent: false
     });
     
     const endTime = performance.now();
     console.log(`Enrichment Time: ${(endTime - startTime) / 1000} seconds`);
     ```

   - **תוצאה צפויה:** פחות מ-30 שניות ל-10 טיקרים

3. **בדיקת שימוש ב-Cache**
   - רענן את העמוד (F5)
   - מדוד את זמן הטעינה שוב
   - **תוצאה צפויה:** זמן טעינה קצר יותר (בגלל Cache)

### תוצאות צפויות

✅ **הצלחה:**

- זמן טעינה ראשונית: פחות מ-10 שניות
- זמן העשרה: פחות מ-3 שניות לטיקר
- Cache משפר את הביצועים

❌ **כשלון:**

- זמן טעינה ארוך מדי
- העשרה איטית
- Cache לא משפר ביצועים

---

## סיכום

### קריטריוני הצלחה כלליים

✅ **כל התרחישים עברו:**

- כל הפונקציות זמינות ועובדות
- האינטגרציה רצה אוטומטית
- Progress Overlay מופיע
- Cache עובד
- הביצועים תקינים

⚠️ **תרחישים עם אזהרות:**

- חלק מהפונקציות עובדות
- יש בעיות קלות בביצועים
- Cache לא תמיד עובד

❌ **תרחישים שנכשלו:**

- פונקציות חסרות או לא עובדות
- האינטגרציה לא רצה
- שגיאות קריטיות

### המלצות

1. **לפני בדיקה:**
   - ודא שהשרת רץ
   - נקה את ה-Cache (אופציונלי)
   - ודא שיש נתונים במסד הנתונים

2. **במהלך בדיקה:**
   - פתח את Console לכל התרחישים
   - בדוק את הלוגים
   - בדוק את Network Tab

3. **אחרי בדיקה:**
   - שמור את התוצאות
   - דווח על בעיות
   - עדכן את המסמך לפי הצורך

---

**גרסה:** 1.0.0  
**תאריך עדכון אחרון:** 6 בדצמבר 2025  
**מחבר:** TikTrack Development Team


