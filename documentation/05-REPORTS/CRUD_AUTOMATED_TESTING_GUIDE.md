# מדריך הרצת בדיקות CRUD אוטומטיות - TikTrack

**תאריך יצירה:** 1 בדצמבר 2025  
**גרסה:** 1.0.0

---

## 📋 מטרה

הרצת בדיקות אוטומטיות על 8 העמודים המרכזיים כדי לוודא שכל פעולות CRUD עובדות ב-100% לפני מעבר לבדיקות ידניות.

---

## 🚀 הוראות הרצה

### שיטה 1: דרך הדשבורד (מומלץ)

1. **הפעל את השרת:**
   ```bash
   ./start_server.sh
   ```

2. **פתח את הדשבורד בדפדפן:**
   ```
   http://localhost:8080/crud-testing-dashboard.html
   ```

3. **לחץ על כפתור "הרץ כל הבדיקות":**
   - הכפתור נמצא בכותרת הדשבורד
   - זה יריץ בדיקות על כל 29 הישויות במערכת

4. **או הרץ בדיקות רק על 8 העמודים המרכזיים:**
   - פתח את הקונסול (F12)
   - העתק והדבק:
     ```javascript
     await runCRUDAutomatedTests()
     ```
   - לחץ Enter

### שיטה 2: דרך הקונסול ישירות

1. **פתח כל עמוד מהרשימה:**
   - `http://localhost:8080/trades.html`
   - `http://localhost:8080/trade_plans.html`
   - `http://localhost:8080/alerts.html`
   - `http://localhost:8080/tickers.html`
   - `http://localhost:8080/trading_accounts.html`
   - `http://localhost:8080/executions.html`
   - `http://localhost:8080/cash_flows.html`
   - `http://localhost:8080/notes.html`

2. **פתח את הקונסול (F12)**

3. **העתק והדבק:**
   ```javascript
   // טען את הסקריפט
   const script = document.createElement('script');
   script.src = '/scripts/crud-testing-enhanced.js';
   document.head.appendChild(script);
   
   // המתן לטעינה
   await new Promise(resolve => setTimeout(resolve, 2000));
   
   // הרץ בדיקות
   if (window.CRUDEnhancedTester) {
     const tester = new window.CRUDEnhancedTester();
     const result = await tester.smartEntityTest('trades'); // או כל עמוד אחר
     console.log('Result:', result);
   }
   ```

---

## 📊 מה הבדיקות בודקות

כל בדיקה כוללת:

1. **טעינת עמוד (20 נקודות)**
   - בדיקה שהעמוד נטען ללא שגיאות HTTP

2. **API GET (20 נקודות)**
   - בדיקה שה-API endpoint מחזיר נתונים

3. **CREATE (15 נקודות)**
   - יצירת רשומת דמו
   - בדיקה שהרשומה נוצרה בהצלחה

4. **UPDATE (15 נקודות)**
   - עדכון הרשומה שנוצרה
   - בדיקה שהעדכון הצליח

5. **DELETE (15 נקודות)**
   - מחיקת הרשומה שנוצרה
   - בדיקה שהמחיקה הצליחה

6. **זמן תגובה (15 נקודות)**
   - בדיקה שזמן התגובה בתוך SLA

**סה"כ: 100 נקודות לכל עמוד**

---

## ✅ קריטריונים להצלחה

**עמוד נחשב כעובר אם:**
- ציון ≥ 80/100
- כל פעולות CRUD עובדות (CREATE, UPDATE, DELETE)
- אין שגיאות קריטיות

**עמוד נחשב כנכשל אם:**
- ציון < 80/100
- אחת או יותר מפעולות CRUD נכשלות
- יש שגיאות קריטיות

---

## 📝 תיעוד תוצאות

### שמירה אוטומטית

התוצאות נשמרות אוטומטית ב-localStorage תחת המפתח:
```
crud_automated_test_report
```

### גישה לתוצאות

```javascript
// בקונסול הדפדפן
const report = JSON.parse(localStorage.getItem('crud_automated_test_report'));
console.log(report);
```

### מבנה הדוח

```javascript
{
  timestamp: "2025-12-01T10:00:00.000Z",
  totalTime: 120000, // במילישניות
  summary: {
    total: 8,
    passed: 6,
    failed: 2,
    averageScore: 85,
    allPassed: false
  },
  results: [
    {
      entity: "trades",
      displayName: "טריידים",
      score: 95,
      issues: [],
      responseTime: 1200,
      ...
    },
    ...
  ],
  failedPages: [
    {
      entity: "alerts",
      displayName: "התראות",
      score: 65,
      issues: ["CREATE failed: ..."]
    }
  ]
}
```

---

## 🔄 תהליך עבודה

### שלב 1: הרצת בדיקות ראשונית

1. הרץ את הבדיקות האוטומטיות
2. תיעד את התוצאות
3. זהה עמודים שנכשלו

### שלב 2: תיקון בעיות

1. עבור על כל עמוד שנכשל
2. בדוק את ה-issues שזוהו
3. תקן את הבעיות
4. תיעד את התיקונים

### שלב 3: הרצה חוזרת

1. הרץ את הבדיקות שוב
2. וודא שכל העמודים עוברים (≥80)
3. אם יש עדיין כשלים, חזור לשלב 2

### שלב 4: אימות סופי

1. הרץ את הבדיקות פעם אחרונה
2. וודא שכל 8 העמודים עוברים ב-100%
3. תיעד את התוצאות הסופיות

---

## 🐛 פתרון בעיות נפוצות

### בעיה: "CRUDEnhancedTester not available"

**פתרון:**
- ודא שאתה בדף `crud-testing-dashboard.html`
- או טען את הסקריפט ידנית (ראה שיטה 2)

### בעיה: "Page Load failed"

**פתרון:**
- ודא שהשרת פועל על פורט 8080
- בדוק שהעמוד קיים ונגיש
- בדוק את הקונסול לשגיאות JavaScript

### בעיה: "API Load failed"

**פתרון:**
- ודא שאתה מחובר כמשתמש מנהל
- בדוק שה-API endpoint קיים
- בדוק את הקונסול לשגיאות רשת

### בעיה: "CREATE failed"

**פתרון:**
- בדוק את נתוני הדמו - אולי חסרים שדות חובה
- בדוק את הקונסול לשגיאות ולידציה
- בדוק את הלוגים בשרת

---

## 📊 דוגמת תוצאות

```
╔══════════════════════════════════════════════════════════════╗
║  CRUD Automated Test Results                                ║
╚══════════════════════════════════════════════════════════════╝

⏱️ Total Time: 120 seconds
📋 Pages Tested: 8
✅ Passed (≥80): 6
❌ Failed (<80): 2
📊 Average Score: 85/100

❌ Failed Pages:
   - התראות: 65/100
     • CREATE failed: HTTP 400: Missing required field
   - הערות: 70/100
     • UPDATE failed: HTTP 404: Record not found

✅ Passed Pages:
   - טריידים: 95/100
   - תכניות מסחר: 90/100
   - טיקרים: 85/100
   - חשבונות מסחר: 88/100
   - ביצועי עסקאות: 92/100
   - תזרימי מזומנים: 87/100
```

---

## 🎯 יעד סופי

**כל 8 העמודים המרכזיים חייבים לעבור ב-100% לפני מעבר לבדיקות ידניות.**

עמודים לבדיקה:
1. ✅ trades
2. ✅ trade_plans
3. ✅ alerts
4. ✅ tickers
5. ✅ trading_accounts
6. ✅ executions
7. ✅ cash_flows
8. ✅ notes

---

## 📝 הערות חשובות

1. **נתוני דמו**: הבדיקות יוצרות רשומות דמו עם התווית "CRUD Test Record - Safe to delete". הרשומות נמחקות אוטומטית בסוף הבדיקה.

2. **בידוד משתמשים**: הבדיקות מתבצעות עם המשתמש המחובר. ודא שאתה מחובר כמשתמש מנהל.

3. **זמן תגובה**: הבדיקות כוללות בדיקת זמן תגובה. עמודים איטיים יקבלו ציון נמוך יותר.

4. **שגיאות**: כל שגיאה מתועדת ב-issues. בדוק את ה-issues כדי להבין מה צריך לתקן.

---

## 🔗 קבצים קשורים

- **דוח מצב**: `documentation/05-REPORTS/CRUD_REVIVAL_STATUS.md`
- **דוח דפוסים**: `documentation/05-REPORTS/CRUD_PATTERNS_ANALYSIS.md`
- **רשימת בדיקות ידניות**: `documentation/05-REPORTS/CRUD_TESTING_CHECKLIST.md`
- **סקריפט בדיקות**: `trading-ui/scripts/crud-testing-enhanced.js`
- **סקריפט הרצה אוטומטית**: `trading-ui/scripts/crud-automated-test-runner.js`


