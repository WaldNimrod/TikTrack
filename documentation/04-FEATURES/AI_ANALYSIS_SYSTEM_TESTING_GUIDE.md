# מדריך הרצת בדיקות - מערכת AI Analysis

**תאריך יצירה:** 28 בינואר 2025  
**גרסה:** 1.0.0

---

## 📋 תוכן עניינים

1. [Browser Tests (הכי קל)](#browser-tests)
2. [Playwright E2E Tests](#playwright-e2e-tests)
3. [בדיקות ידניות](#manual-tests)
4. [תוצאות בדיקות](#test-results)

---

## 🌐 Browser Tests (הכי קל)

### תכונות
- ✅ הרצה ישירה בדפדפן - אין צורך בהתקנות
- ✅ בדיקות מלאות: Unit, Integration, E2E, Performance
- ✅ דוחות מפורטים בקונסול
- ✅ תוצאות נשמרות ב-`window.aiAnalysisTestResults`

### הוראות הרצה

**שלב 1: טעינת הסקריפט**
1. פתח את עמוד AI Analysis: `http://localhost:8080/trading-ui/ai-analysis.html`
2. פתח את הקונסול (F12)
3. ודא שהסקריפט נטען (אמור להופיע: `✅ AI Analysis automated test suite loaded`)

**שלב 2: הרצת הבדיקות**
```javascript
// הרצת כל הבדיקות
window.runAllAIAnalysisTests()
```

**שלב 3: צפייה בתוצאות**
- התוצאות מוצגות בקונסול
- תוצאות מפורטות נשמרות ב-`window.aiAnalysisTestResults`
- גישה לתוצאות: `window.aiAnalysisTestResults`

### דוגמת פלט

```
============================================================
AI ANALYSIS SYSTEM - AUTOMATED TEST SUITE
============================================================

Test Configuration:
  Timeout: 30000ms
  Retries: 3
  Verbose: true

============================================================
UNIT TESTS
============================================================

✅ PASS: AIAnalysisData service loaded - Service available (0.12ms)
✅ PASS: AIAnalysisData.loadTemplates() - Method exists
✅ PASS: AIAnalysisData.generateAnalysis() - Method exists
...

============================================================
INTEGRATION TESTS
============================================================

✅ PASS: Load templates from API - Loaded 4 templates (234.56ms)
✅ PASS: Load LLM provider settings - Settings loaded (123.45ms)
...

============================================================
E2E TESTS
============================================================

✅ PASS: Page loads correctly - Page ready (0.00ms)
✅ PASS: Templates container exists - Container found
...

============================================================
TEST SUMMARY
============================================================

Total Tests: 25
Passed: 23 ✅
Failed: 2 ❌
Total Duration: 1234.56ms
```

---

## 🎭 Playwright E2E Tests

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
npx playwright test trading-ui/scripts/testing/automated/ai-analysis-e2e.spec.js

# הרצה עם UI (headed mode)
npx playwright test trading-ui/scripts/testing/automated/ai-analysis-e2e.spec.js --headed

# הרצה בדפדפן ספציפי
npx playwright test trading-ui/scripts/testing/automated/ai-analysis-e2e.spec.js --project=chromium
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

---

## 🔍 בדיקות ידניות

### בדיקות בסיסיות

1. **טעינת עמוד**
   - פתח: `http://localhost:8080/trading-ui/ai-analysis.html`
   - ודא שהעמוד נטען ללא שגיאות
   - בדוק שהתבניות מוצגות

2. **בחירת תבנית**
   - לחץ על תבנית
   - ודא שהטופס מופיע
   - בדוק שכל השדות נטענים

3. **יצירת ניתוח**
   - מלא את הטופס
   - בחר מנוע AI
   - לחץ "צור ניתוח"
   - ודא שהניתוח נוצר

4. **הצגת תוצאות**
   - בדוק שהתוצאות מוצגות
   - בדוק שכפתורי הייצוא עובדים
   - בדוק שכפתור "שמור כהערה" עובד

5. **היסטוריה**
   - בדוק שההיסטוריה נטענת
   - בדוק שניתן לצפות בניתוחים קודמים

### בדיקות User Profile

1. **ניהול API Keys**
   - פתח: `http://localhost:8080/trading-ui/user-profile.html`
   - גלול לסקשן "הגדרות AI Analysis"
   - בדוק שניתן להכניס API keys
   - בדוק שכפתורי הבדיקה עובדים

---

## 📊 תוצאות בדיקות

### בדיקות אוטומטיות

התוצאות נשמרות ב-`window.aiAnalysisTestResults`:

```javascript
{
  total: 25,
  passed: 23,
  failed: 2,
  errors: [...],
  startTime: 1234567890,
  endTime: 1234569123,
  duration: 1233
}
```

### בדיקות Playwright

התוצאות נשמרות ב-`playwright-report/`:

```bash
# צפייה בדוח
npx playwright show-report
```

---

## 🐛 פתרון בעיות

### בעיה: הבדיקות לא רצות

**פתרון:**
1. ודא שהשרת רץ: `http://localhost:8080`
2. ודא שהעמוד נטען ללא שגיאות
3. בדוק את הקונסול לשגיאות JavaScript

### בעיה: Templates לא נטענים

**פתרון:**
1. בדוק שהשרת רץ
2. בדוק את Network tab ב-DevTools
3. ודא שה-API endpoint זמין: `/api/ai-analysis/templates`

### בעיה: Playwright לא מוצא את העמוד

**פתרון:**
1. ודא שהשרת רץ על פורט 8080
2. בדוק את `BASE_URL` ב-`ai-analysis-e2e.spec.js`
3. ודא שהנתיב נכון: `/trading-ui/ai-analysis.html`

---

## 📝 הערות

- כל הבדיקות דורשות שהשרת ירוץ
- בדיקות E2E דורשות API keys תקינים (אופציונלי)
- בדיקות Performance עשויות להשתנות בהתאם למהירות הרשת

---

**עודכן:** 28 בינואר 2025

