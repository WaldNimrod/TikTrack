# Testing Scope - TikTrack

## מטרת המסמך
מסמך זה מגדיר את שכבות הבדיקה, האחריות והקריטריונים לכל שכבה במערכת TikTrack.

**תאריך עדכון:** 2025-01-27  
**גרסה:** 1.0.0

---

## שכבות בדיקה

### 1. Unit Tests (בדיקות יחידה)

**מיקום:** `tests/unit/`

**תפקיד:**
- בדיקת מערכות בודדות בבידוד מלא
- וידוא שהפונקציות והמחלקות עובדות כמצופה
- בדיקת edge cases ושגיאות

**כיסוי נדרש:**
- כל מערכת פעילה חייבת להיות מכוסה בבדיקות יחידה
- כיסוי מינימלי: 80% (statements, branches, functions, lines)

**דוגמאות:**
- `button-system.test.js` - בודק את Button System
- `field-renderer-service.test.js` - בודק את Field Renderer Service
- `unified-cache-manager.test.js` - בודק את Unified Cache Manager

**קריטריונים:**
- כל test file מכסה מערכת אחת
- שימוש ב-mocks/stubs לבידוד תלויות
- בדיקת API ציבורי בלבד
- בדיקת error handling

---

### 2. Integration Tests (בדיקות אינטגרציה)

**מיקום:** `tests/integration/`

**תפקיד:**
- בדיקת שילוב בין מספר מערכות
- וידוא שזרימות מורכבות עובדות כמצופה
- בדיקת תקשורת בין Frontend ל-Backend

**כיסוי נדרש:**
- זרימות קריטיות חייבת להיות מכוסות
- כיסוי מינימלי: 60%

**דוגמאות:**
- `ui-systems-integration.test.js` - בודק שילוב Header + Table + Button
- `cache-logger-integration.test.js` - בודק שילוב Cache + Logger
- `data-systems-integration.test.js` - בודק שילוב Data Collection + CRUD Handler

**קריטריונים:**
- בדיקת מספר מערכות יחד
- שימוש ב-test fixtures לנתונים
- בדיקת תרחישי שימוש אמיתיים
- בדיקת תקשורת API (mock)

---

### 3. Backend Tests (בדיקות Backend)

**מיקום:** `Backend/tests/`

**תפקיד:**
- בדיקת שירותי API ו-utils ב-Backend
- וידוא תקינות מודלים ומסד נתונים
- בדיקת business logic בצד השרת

**כיסוי נדרש:**
- כל route API חייב להיות מכוסה
- כל service חייב להיות מכוסה
- כיסוי מינימלי: 80%

**דוגמאות:**
- בדיקת routes API (GET, POST, PUT, DELETE)
- בדיקת services (validation, calculations)
- בדיקת models (database operations)

**קריטריונים:**
- שימוש ב-PyTest
- שימוש ב-in-memory database לבדיקות
- בדיקת error handling ו-edge cases
- בדיקת authentication/authorization

---

### 4. End-to-End Tests (בדיקות E2E)

**מיקום:** `tests/e2e/`

**תפקיד:**
- בדיקת תרחישי משתמש מלאים
- וידוא שהמערכת עובדת end-to-end
- בדיקת UI ואינטראקציות משתמש

**כיסוי נדרש:**
- תרחישים קריטיים חייבת להיות מכוסים
- כיסוי מינימלי: 40%

**דוגמאות:**
- `crud-full-flow.test.js` - בודק זרימה מלאה של CRUD
- `user-pages/trades.test.js` - בודק עמוד Trades
- `user-pages/alerts.test.js` - בודק עמוד Alerts

**קריטריונים:**
- שימוש ב-Playwright או Cypress
- הרצה מול שרת אמיתי (`./start_server.sh`)
- בדיקת תרחישי משתמש אמיתיים
- בדיקת UI ו-interactions

---

## אחריות וקריטריונים

### Unit Tests
- **אחריות:** מפתחי Frontend
- **תדירות:** לפני כל commit
- **זמן הרצה:** < 30 שניות
- **כיסוי נדרש:** 80%

### Integration Tests
- **אחריות:** מפתחי Frontend + Backend
- **תדירות:** לפני כל merge
- **זמן הרצה:** < 2 דקות
- **כיסוי נדרש:** 60%

### Backend Tests
- **אחריות:** מפתחי Backend
- **תדירות:** לפני כל commit
- **זמן הרצה:** < 1 דקה
- **כיסוי נדרש:** 80%

### E2E Tests
- **אחריות:** QA + מפתחים
- **תדירות:** לפני כל release
- **זמן הרצה:** < 10 דקות
- **כיסוי נדרש:** 40%

---

## תהליך עבודה

### לפני Commit
1. הרצת Unit Tests (`npm run test:unit`)
2. הרצת Backend Tests (`pytest Backend/tests/`)
3. וידוא שכל הבדיקות עוברות

### לפני Merge
1. הרצת Integration Tests (`npm run test:integration`)
2. וידוא שכל הבדיקות עוברות
3. בדיקת כיסוי (coverage)

### לפני Release
1. הרצת E2E Tests (`npm run test:e2e`)
2. וידוא שכל הבדיקות עוברות
3. בדיקת performance

---

## כללי כתיבה

### Unit Tests
- שם קובץ: `[system-name].test.js`
- מבנה: `describe` → `test` → `expect`
- שימוש ב-mocks/stubs
- בדיקת API ציבורי בלבד

### Integration Tests
- שם קובץ: `[systems]-integration.test.js`
- מבנה: `describe` → `test` → `expect`
- שימוש ב-test fixtures
- בדיקת מספר מערכות יחד

### Backend Tests
- שם קובץ: `test_[module_name].py`
- מבנה: `class TestModule` → `def test_function`
- שימוש ב-in-memory database
- בדיקת routes ו-services

### E2E Tests
- שם קובץ: `[page-name].test.js`
- מבנה: `test` → `page.goto` → `expect`
- שימוש ב-Playwright/Cypress
- בדיקת תרחישי משתמש

---

## מדדי איכות

### Coverage Thresholds
- **Unit Tests:** 80% (statements, branches, functions, lines)
- **Integration Tests:** 60% (statements, branches, functions, lines)
- **Backend Tests:** 80% (statements, branches, functions, lines)
- **E2E Tests:** 40% (critical flows)

### Performance Thresholds
- **Unit Tests:** < 30 שניות
- **Integration Tests:** < 2 דקות
- **Backend Tests:** < 1 דקה
- **E2E Tests:** < 10 דקות

---

## הערות חשובות

- כל הבדיקות חייבות להיות deterministic (אותה תוצאה בכל הרצה)
- אין להשתמש בנתונים אמיתיים בבדיקות
- כל בדיקה חייבת להיות independent (לא תלויה בבדיקות אחרות)
- יש לנקות resources אחרי כל בדיקה (cleanup)

---

## עדכונים עתידיים

- הוספת בדיקות performance
- הוספת בדיקות security
- הוספת בדיקות accessibility
- הוספת בדיקות compatibility

