# תוכנית בדיקות אוטומטית מפורטת - מערכת העדפות

## מטרת התוכנית

תוכנית בדיקות מקיפה עם הרצה אוטומטית בדפדפן לבדיקת:

1. פונקציונליות מלאה
2. ביצועים
3. אופטימיזציות
4. edge cases

## כלי בדיקה

### 1. Browser Automation

- **Playwright** (מומלץ) - תמיכה ב-Chrome, Firefox, Safari
- **Puppeteer** (אלטרנטיבה) - תמיכה ב-Chrome בלבד

### 2. Test Framework

- **Jest** או **Mocha** - לבדיקות JavaScript
- **pytest** - לבדיקות Python

### 3. Performance Monitoring

- **Performance API** - מדידת ביצועים
- **Network API** - מעקב אחרי קריאות API
- **Custom metrics** - מדידות מותאמות

## מבנה תוכנית הבדיקות

### קטגוריה 1: בדיקות יחידה (Unit Tests)

#### 1.1 PreferencesManager Tests

**קובץ:** `trading-ui/scripts/testing/unit/preferences-manager.test.js`

**בדיקות:**

- [ ] `initialize()` - אתחול מוצלח
- [ ] `initialize()` - מניעת אתחול כפול
- [ ] `loadGroup()` - טעינה מהמטמון
- [ ] `loadGroup()` - טעינה מהשרת
- [ ] `loadGroup()` - deduplication
- [ ] `saveGroup()` - שמירה מוצלחת
- [ ] `saveGroup()` - optimistic update
- [ ] `saveGroup()` - rollback על שגיאה
- [ ] `refreshGroup()` - ניקוי מטמון וטעינה מחדש

#### 1.2 PreferencesCache Tests

**קובץ:** `trading-ui/scripts/testing/unit/preferences-cache.test.js`

**בדיקות:**

- [ ] `buildKey()` - פורמט נכון
- [ ] `parseKey()` - parsing נכון
- [ ] `get()` - קריאה מכל השכבות
- [ ] `set()` - שמירה לכל השכבות
- [ ] `invalidate()` - ניקוי key ספציפי
- [ ] `clearGroup()` - ניקוי קבוצה

#### 1.3 PreferencesUI Tests

**קובץ:** `trading-ui/scripts/testing/unit/preferences-ui.test.js`

**בדיקות:**

- [ ] `populateGroup()` - מילוי שדות
- [ ] `updateField()` - עדכון שדה בודד
- [ ] `updateFields()` - עדכון מספר שדות
- [ ] `markFieldAsModified()` - סימון שדה

#### 1.4 PreferencesEvents Tests

**קובץ:** `trading-ui/scripts/testing/unit/preferences-events.test.js`

**בדיקות:**

- [ ] `dispatch()` - שליחת event
- [ ] `listen()` - האזנה ל-event
- [ ] `removeAllListeners()` - הסרת listeners

### קטגוריה 2: בדיקות אינטגרציה (Integration Tests)

#### 2.1 Page Load Integration Test

**קובץ:** `trading-ui/scripts/testing/integration/page-load.test.js`

**תרחיש:**

1. פתיחת עמוד העדפות
2. אתחול PreferencesManager
3. טעינת critical preferences
4. טעינת קבוצות לפי demand
5. מילוי שדות UI

**בדיקות:**

- [ ] כל השלבים רצים בסדר הנכון
- [ ] אין טעינות כפולות
- [ ] מטמון עובד נכון
- [ ] UI מתמלא נכון
- [ ] אין שגיאות בקונסול
- [ ] זמן טעינה < 500ms

#### 2.2 Save Flow Integration Test

**קובץ:** `trading-ui/scripts/testing/integration/save-flow.test.js`

**תרחיש:**

1. שינוי ערך בשדה
2. לחיצה על שמור
3. שמירה לשרת
4. optimistic update
5. עדכון מטמון
6. dispatch event

**בדיקות:**

- [ ] שמירה לשרת מוצלחת
- [ ] UI מתעדכן מיד (optimistic)
- [ ] מטמון מתעדכן
- [ ] event נשלח
- [ ] אין טעינה מחדש מהשרת
- [ ] זמן שמירה < 200ms

#### 2.3 Cache Integration Test

**קובץ:** `trading-ui/scripts/testing/integration/cache.test.js`

**תרחיש:**

1. טעינת העדפות
2. שמירה במטמון
3. קריאה מהמטמון
4. ניקוי מטמון
5. טעינה מחדש

**בדיקות:**

- [ ] שמירה לכל השכבות
- [ ] קריאה מהשכבה הנכונה
- [ ] TTL עובד נכון
- [ ] ניקוי מטמון עובד
- [ ] cache hit rate > 80%

### קטגוריה 3: בדיקות E2E (End-to-End Tests)

#### 3.1 Complete User Flow Test

**קובץ:** `trading-ui/scripts/testing/e2e/user-flow.test.js`

**תרחיש מלא:**

1. פתיחת עמוד העדפות
2. פתיחת section "הגדרות מסחר"
3. שינוי `atr_period` ל-21
4. לחיצה על שמור
5. בדיקת שהערך נשמר
6. ריענון עמוד (F5)
7. בדיקת שהערך נשאר 21

**בדיקות:**

- [ ] כל השלבים עובדים
- [ ] אין שגיאות
- [ ] הערכים נשמרים נכון
- [ ] הערכים נטענים נכון אחרי ריענון

#### 3.2 Profile Switch Test

**קובץ:** `trading-ui/scripts/testing/e2e/profile-switch.test.js`

**תרחיש:**

1. טעינת עמוד העדפות
2. החלפת פרופיל
3. בדיקת שהעדפות נטענות לפרופיל החדש
4. בדיקת שהמטמון נוקה

**בדיקות:**

- [ ] העדפות נטענות לפרופיל החדש
- [ ] מטמון נוקה מהפרופיל הישן
- [ ] אין עירוב בין פרופילים

#### 3.3 Multiple Groups Test

**קובץ:** `trading-ui/scripts/testing/e2e/multiple-groups.test.js`

**תרחיש:**

1. פתיחת מספר sections
2. שינוי ערכים בכמה קבוצות
3. שמירה של כל הקבוצות
4. בדיקת שהכל נשמר נכון

**בדיקות:**

- [ ] כל הקבוצות נשמרות
- [ ] אין קונפליקטים
- [ ] הערכים נכונים

### קטגוריה 4: בדיקות ביצועים (Performance Tests)

#### 4.1 Load Performance Test

**קובץ:** `trading-ui/scripts/testing/performance/load-performance.test.js`

**בדיקות:**

- [ ] זמן טעינה ראשונית < 500ms
- [ ] זמן טעינת קבוצה < 200ms
- [ ] מספר קריאות API < 3
- [ ] זמן עדכון UI < 50ms

#### 4.2 Save Performance Test

**קובץ:** `trading-ui/scripts/testing/performance/save-performance.test.js`

**בדיקות:**

- [ ] זמן שמירה < 200ms
- [ ] זמן optimistic update < 10ms
- [ ] אין טעינה מחדש מהשרת
- [ ] זמן עדכון מטמון < 20ms

#### 4.3 Cache Performance Test

**קובץ:** `trading-ui/scripts/testing/performance/cache-performance.test.js`

**בדיקות:**

- [ ] cache hit rate > 80%
- [ ] זמן קריאה מהמטמון < 10ms
- [ ] זמן שמירה למטמון < 20ms
- [ ] גודל מטמון < 5MB

### קטגוריה 5: בדיקות Edge Cases

#### 5.1 Error Handling Test

**קובץ:** `trading-ui/scripts/testing/edge-cases/error-handling.test.js`

**תרחישים:**

- [ ] שמירה עם שגיאת רשת
- [ ] טעינה עם מטמון פגום
- [ ] שמירה עם ערכים לא תקינים
- [ ] טעינה עם userId/profileId לא תקינים

**בדיקות:**

- [ ] rollback במקרה של שגיאה
- [ ] טיפול במטמון פגום
- [ ] validation של ערכים
- [ ] error messages ברורים

#### 5.2 Race Conditions Test

**קובץ:** `trading-ui/scripts/testing/edge-cases/race-conditions.test.js`

**תרחישים:**

- [ ] שמירה במקביל (2 שמירות באותו זמן)
- [ ] טעינה במקביל (2 טעינות באותו זמן)
- [ ] שמירה + טעינה במקביל

**בדיקות:**

- [ ] deduplication עובד
- [ ] אין קונפליקטים
- [ ] הערכים נכונים

#### 5.3 Cache Invalidation Test

**קובץ:** `trading-ui/scripts/testing/edge-cases/cache-invalidation.test.js`

**תרחישים:**

- [ ] ניקוי מטמון במהלך טעינה
- [ ] ניקוי מטמון במהלך שמירה
- [ ] ניקוי מטמון של קבוצה שלא קיימת

**בדיקות:**

- [ ] ניקוי עובד נכון
- [ ] אין שגיאות
- [ ] טעינה מחדש עובדת

## סקריפטי הרצה אוטומטית

### 1. Playwright Test Suite

**קובץ:** `trading-ui/scripts/testing/automated/preferences-e2e.spec.js`

**תכונות:**

- הרצה אוטומטית בדפדפן
- צילומי מסך על שגיאות
- דוחות מפורטים
- תמיכה ב-Chrome, Firefox, Safari

### 2. Puppeteer Test Suite

**קובץ:** `trading-ui/scripts/testing/automated/preferences-puppeteer.test.js`

**תכונות:**

- הרצה אוטומטית ב-Chrome
- מעקב אחרי network requests
- מדידת ביצועים
- דוחות מפורטים

### 3. Custom Browser Test

**קובץ:** `trading-ui/scripts/testing/automated/preferences-browser-test.js`

**תכונות:**

- הרצה ישירה בדפדפן (ללא Playwright/Puppeteer)
- שימוש ב-`window.testPreferencesOptimization()`
- דוחות בקונסול
- קל להרצה ידנית

## מבנה קבצים

```
trading-ui/scripts/testing/
├── unit/
│   ├── preferences-manager.test.js
│   ├── preferences-cache.test.js
│   ├── preferences-ui.test.js
│   └── preferences-events.test.js
├── integration/
│   ├── page-load.test.js
│   ├── save-flow.test.js
│   └── cache.test.js
├── e2e/
│   ├── user-flow.test.js
│   ├── profile-switch.test.js
│   └── multiple-groups.test.js
├── performance/
│   ├── load-performance.test.js
│   ├── save-performance.test.js
│   └── cache-performance.test.js
├── edge-cases/
│   ├── error-handling.test.js
│   ├── race-conditions.test.js
│   └── cache-invalidation.test.js
└── automated/
    ├── preferences-e2e.spec.js (Playwright)
    ├── preferences-puppeteer.test.js (Puppeteer)
    └── preferences-browser-test.js (Custom)
```

## הוראות הרצה

### אופציה 1: Playwright (מומלץ)

**התקנה:**

```bash
npm install --save-dev @playwright/test
npx playwright install
```

**הרצה:**

```bash
npx playwright test trading-ui/scripts/testing/automated/preferences-e2e.spec.js
```

**דוחות:**

```bash
npx playwright show-report
```

### אופציה 2: Puppeteer

**התקנה:**

```bash
npm install --save-dev puppeteer
```

**הרצה:**

```bash
node trading-ui/scripts/testing/automated/preferences-puppeteer.test.js
```

### אופציה 3: Custom Browser Test

**הרצה:**

1. פתח `http://localhost:8080/trading-ui/preferences.html`
2. פתח קונסול (F12)
3. הרץ: `window.runAllPreferenceTests()`

## קריטריוני הצלחה

### ביצועים

- [ ] זמן טעינה < 500ms
- [ ] קריאות API < 3 לעמוד
- [ ] זמן שמירה < 200ms
- [ ] cache hit rate > 80%

### פונקציונליות

- [ ] כל הפונקציות עובדות
- [ ] אין שגיאות בקונסול
- [ ] optimistic updates עובדים
- [ ] מטמון עובד נכון

### UX

- [ ] אין עיכובים מיותרים
- [ ] אין "קפיצות" בערכים
- [ ] הערכים נשמרים נכון
- [ ] ריענון עמוד עובד

## דוחות וניטור

### דוחות אוטומטיים

- HTML reports (Playwright)
- JSON reports (Puppeteer)
- Console logs (Custom)

### ניטור בזמן אמת

- Performance metrics
- Network requests
- Cache statistics
- Error tracking

## לוח זמנים

### שלב 1: יצירת סקריפטים (יום 1)

- [ ] סקריפטי בדיקות יחידה
- [ ] סקריפטי בדיקות אינטגרציה
- [ ] סקריפטי בדיקות E2E

### שלב 2: יצירת בדיקות אוטומטיות (יום 2)

- [ ] Playwright test suite
- [ ] Puppeteer test suite
- [ ] Custom browser test

### שלב 3: הרצת בדיקות (יום 3)

- [ ] הרצת כל הבדיקות
- [ ] תיעוד תוצאות
- [ ] זיהוי בעיות

### שלב 4: תיקון ושיפור (יום 4)

- [ ] תיקון בעיות
- [ ] שיפור ביצועים
- [ ] הרצה חוזרת

### שלב 5: סיכום (יום 5)

- [ ] דוח סופי
- [ ] תיעוד תוצאות
- [ ] המלצות להמשך

## הערות חשובות

1. **Backward Compatibility**: כל הבדיקות צריכות לעבוד גם עם המערכת הישנה
2. **Incremental Testing**: בדיקות הדרגתיות, לא big bang
3. **Performance Baseline**: מדידת baseline לפני אופטימיזציה
4. **Documentation**: תיעוד מלא של כל הבדיקות

