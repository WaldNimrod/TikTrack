# מדריך הרצה מהיר - בדיקות אוטומטיות

## הרצה מהירה (30 שניות)

### שלב 1: פתיחת עמוד

1. פתח: `http://localhost:8080/trading-ui/preferences.html`
2. פתח קונסול (F12)

### שלב 2: הרצת בדיקות

```javascript
window.runAllPreferenceTests()
```

### שלב 3: צפייה בתוצאות

- התוצאות מוצגות בקונסול
- גישה מפורטת: `window.preferencesTestResults`

## מה נבדק

### ✅ Unit Tests (4 בדיקות)

- PreferencesManager.initialize()
- PreferencesManager.loadGroup()
- PreferencesManager.saveGroup()
- PreferencesCache.buildKey()

### ✅ Integration Tests (2 בדיקות)

- Page Load Flow (< 500ms)
- Save Flow עם optimistic update (< 200ms)

### ✅ E2E Tests (1 בדיקה)

- Complete User Flow (פתיחה, שינוי, שמירה)

### ✅ Performance Tests (2 בדיקות)

- Load Performance
- Save Performance

**סה"כ:** 9 בדיקות אוטומטיות

## תוצאות צפויות

```
============================================================
TEST SUMMARY
============================================================

Total Tests: 9
Passed: 9 ✅
Failed: 0
Total Duration: ~500ms
```

## פתרון בעיות

**בעיה:** `window.runAllPreferenceTests is not a function`
**פתרון:** ודא שהקובץ `preferences-browser-test.js` נטען. בדוק ב-Network tab.

**בעיה:** בדיקות נכשלות
**פתרון:**

1. ודא שהשרת רץ
2. בדוק את הקונסול לשגיאות
3. נסה לרענן את העמוד

## בדיקות נוספות

### בדיקת ביצועים בלבד

```javascript
window.testPreferencesOptimization()
```

### בדיקת cache

```javascript
// בדיקת cache hit rate
const cacheKey = window.PreferencesCache.buildKey('group', 'trading_settings', 1, 0);
const cached = await window.PreferencesCache.get(cacheKey);
console.log('Cache hit:', cached !== null);
```

