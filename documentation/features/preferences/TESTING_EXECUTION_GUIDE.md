# מדריך הרצת בדיקות אוטומטיות - מערכת העדפות

## סקירה כללית

מדריך מפורט להרצת כל הבדיקות האוטומטיות למערכת העדפות, כולל:

1. Custom Browser Test (הרצה ישירה בדפדפן)
2. Playwright E2E Tests (הרצה אוטומטית מלאה)
3. Puppeteer Tests (אלטרנטיבה)

## אופציה 1: Custom Browser Test (הכי קל)

### תכונות

- ✅ הרצה ישירה בדפדפן - אין צורך בהתקנות
- ✅ בדיקות מלאות: Unit, Integration, E2E, Performance
- ✅ דוחות מפורטים בקונסול
- ✅ תוצאות נשמרות ב-`window.preferencesTestResults`

### הוראות הרצה

**שלב 1: טעינת הסקריפט**

1. פתח את עמוד העדפות: `http://localhost:8080/preferences`
2. פתח את הקונסול (F12)
3. ודא שהסקריפט נטען (אמור להופיע: `✅ Automated preference test suite loaded`)

**שלב 2: הרצת הבדיקות**

```javascript
// הרצת כל הבדיקות
window.runAllPreferenceTests()
```

**שלב 3: צפייה בתוצאות**

- התוצאות מוצגות בקונסול
- תוצאות מפורטות נשמרות ב-`window.preferencesTestResults`
- גישה לתוצאות: `window.preferencesTestResults`

### דוגמת פלט

```
============================================================
PREFERENCES SYSTEM - AUTOMATED TEST SUITE
============================================================

Test Configuration:
  User ID: 1
  Profile ID: 0
  Group: trading_settings
  Preference: atr_period
  Test Value: 21

============================================================
UNIT TESTS
============================================================

✅ PASS: PreferencesManager.initialize()
   Initialization successful
   Duration: 45.23ms

✅ PASS: PreferencesManager.loadGroup()
   Loaded 15 preferences
   Duration: 123.45ms

...

============================================================
TEST SUMMARY
============================================================

Total Tests: 25
Passed: 23 ✅
Failed: 2 ❌
Total Duration: 1234.56ms
```

### בדיקות ספציפיות

```javascript
// הרצת בדיקות יחידה בלבד
await window.runAllPreferenceTests() // כולל unit tests

// בדיקת ביצועים בלבד
window.testPreferencesOptimization() // מהסקריפט הקיים
```

## אופציה 2: Playwright E2E Tests (מומלץ לבדיקות אוטומטיות)

### תכונות

- ✅ הרצה אוטומטית מלאה
- ✅ תמיכה ב-Chrome, Firefox, Safari
- ✅ צילומי מסך על שגיאות
- ✅ דוחות HTML מפורטים
- ✅ CI/CD integration

### התקנה

```bash
# התקנת Playwright
npm install --save-dev @playwright/test

# התקנת דפדפנים
npx playwright install
```

### הרצה

```bash
# הרצת כל הבדיקות
npx playwright test trading-ui/scripts/testing/automated/preferences-e2e.spec.js

# הרצה עם UI (headed mode)
npx playwright test trading-ui/scripts/testing/automated/preferences-e2e.spec.js --headed

# הרצה בדפדפן ספציפי
npx playwright test trading-ui/scripts/testing/automated/preferences-e2e.spec.js --project=chromium
```

### דוחות

```bash
# צפייה בדוח HTML
npx playwright show-report

# יצירת דוח JSON
npx playwright test --reporter=json
```

### קבצי תצורה

**קובץ:** `playwright.config.js` (ליצירה)

```javascript
module.exports = {
  testDir: './trading-ui/scripts/testing/automated',
  use: {
    baseURL: 'http://localhost:8080',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
  ],
};
```

## אופציה 3: Puppeteer Tests

### תכונות

- ✅ הרצה אוטומטית ב-Chrome
- ✅ מעקב אחרי network requests
- ✅ מדידת ביצועים
- ✅ קל יותר מ-Playwright (אבל רק Chrome)

### התקנה

```bash
npm install --save-dev puppeteer
```

### הרצה

```bash
node trading-ui/scripts/testing/automated/preferences-puppeteer.test.js
```

## בדיקות זמינות

### 1. Unit Tests

- `testPreferencesManagerInitialize()` - אתחול PreferencesManager
- `testPreferencesManagerLoadGroup()` - טעינת קבוצה
- `testPreferencesManagerSaveGroup()` - שמירת קבוצה
- `testPreferencesCacheBuildKey()` - בניית cache key

### 2. Integration Tests

- `testPageLoadFlow()` - תהליך טעינת עמוד מלא
- `testSaveFlow()` - תהליך שמירה מלא (עם optimistic update)

### 3. E2E Tests

- `testCompleteUserFlow()` - תהליך משתמש מלא (פתיחה, שינוי, שמירה)

### 4. Performance Tests

- `testLoadPerformance()` - מדידת זמן טעינה
- `testSavePerformance()` - מדידת זמן שמירה

## קריטריוני הצלחה

### ביצועים

- ✅ זמן טעינה < 500ms
- ✅ קריאות API < 3 לעמוד
- ✅ זמן שמירה < 200ms
- ✅ cache hit rate > 80%

### פונקציונליות

- ✅ כל הפונקציות עובדות
- ✅ אין שגיאות בקונסול
- ✅ optimistic updates עובדים
- ✅ מטמון עובד נכון

## פתרון בעיות

### בעיה: PreferencesManager לא זמין

**פתרון:** ודא שהקבצים נטענים בסדר הנכון ב-`package-manifest.js`

### בעיה: בדיקות נכשלות

**פתרון:**

1. בדוק שהשרת רץ (`http://localhost:8080`)
2. בדוק שהדפדפן לא חסום
3. בדוק את הקונסול לשגיאות

### בעיה: Playwright לא עובד

**פתרון:**

1. ודא שהתקנת: `npx playwright install`
2. בדוק שהשרת רץ
3. נסה עם `--headed` לראות מה קורה

## סיכום

**האופציה המומלצת:** Custom Browser Test (`preferences-browser-test.js`)

- הכי קל להרצה
- אין צורך בהתקנות
- בדיקות מלאות
- דוחות מפורטים

**לבדיקות CI/CD:** Playwright

- אוטומציה מלאה
- תמיכה ב-multiple browsers
- דוחות HTML

