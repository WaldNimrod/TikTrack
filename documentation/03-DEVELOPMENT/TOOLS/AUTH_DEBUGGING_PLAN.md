# מדריך מערכת – אימות ואוטנטיקציה (מצב נוכחי)

**עדכון:** 10 דצמבר 2025  
**מטרה:** תיעוד מצב קוד נוכחי, ליישום ואבחון אחיד בכל הממשקים (קיימים ועתידיים).

---

## 🧭 ארכיטקטורת אימות – תקציר

- **Token-based בלבד** (ללא cookies): הזרקת `Authorization: Bearer <token>` נעשית אוטומטית ע"י `api-fetch-wrapper.js`.
- **UnifiedCacheManager** לכל שכבות המטמון. מפתחות auth נשמרים עם `includeUserId: false` בלבד.
- **Login Modal** הוא מסלול הכניסה היחיד. `auth-guard.js` מוודא auth בכל עמוד, ומציג את המודל בעת 401/חוסר טוקן.
- **Z-Index וניהול Stack**: המודל נרשם ל־`ModalNavigationService` ומעודכן ב־`ModalZIndexManager.forceUpdate`.
- **Preferences ברירת מחדל**: `/api/preferences/default` מחזיר צבעי לוגו (`#26baac`, `#fc5a06`). הטענות העדפות רכות (soft-fail) כשהמשתמש לא מאומת.
- **Rate Limit (429)**: בעמודים כבדים (למשל trades_formatted) נדרש דיליי/צמצום כמות בקשות ל־`/api/trade-plans/`.

---

## 📌 נקודות חיבור בקוד (Front)

- `scripts/api-fetch-wrapper.js` – הזרקת Authorization + טיפול 401.
- `scripts/auth.js` – login/logout, modal, שמירת auth ל־UnifiedCacheManager, dev helpers.
- `scripts/auth-guard.js` – בדיקת auth בכל עמוד, הצגת modal בעת 401/חוסר טוקן.
- `scripts/modal-z-index-manager.js` + `modal-navigation-manager.js` – ניהול stack/z-index למודל כניסה.
- `scripts/services/preferences-data.js` – טעינת העדפות/ברירת מחדל עם guard על משתמש לא מאומת.

---

## 🔧 דיבוג ו-QA

1. **Firefox Debug**: `./scripts/debug/launch-firefox.sh` → F5 ב־Cursor/VSCode: "Launch Firefox - Development".
2. **בדיקות סלניום**:  
   - עמוד יחיד: `python3 scripts/test_pages_console_errors.py --page "/"`  
   - סוויפ מלא: `python3 scripts/test_pages_console_errors.py`  
   שימוש ב-admin/admin123 (token login מובנה בסקריפט).
3. **בריאות שרת**:  
   - `curl http://localhost:8080/api/health`  
   - `curl http://localhost:8080/api/preferences/default?preference_name=primary_color`
4. **Auth Debug Monitor**: חשוף דרך `auth-debug-monitor.js` (לוגי cache/auth, שמירת שגיאות).

---

## 🧪 רשימת בדיקות קצרה (Hands-on)

- כניסה → מופיע modal, לאחר login נשמר token ב־UnifiedCacheManager, HEADER מציג משתמש.
- ניווט לעמוד מוגן (למשל `/trades.html`) → ללא modal אם token תקף; עם modal אם לא.
- טעינת העדפות עם טוקן: אין 401; ללא טוקן: soft-fail ולוג debug בלבד.
- עמודים עם trade-plans כבדים (`/trades_formatted.html`): אין הצפה של 429 אחרי דיליי/RateLimitTracker.

---

## 🛠 נקודות כשל שכיחות ומה לבדוק

- מודל לא מעל backdrop → לבדוק רישום ל־`ModalNavigationService` ואז `ModalZIndexManager.forceUpdate(modalElement)`.
- 401 ב-tickers/watch-list → לוודא `TikTrackAuth.getCurrentUser()` לפני קריאות דאטה (הגנות קיימות).
- 429 ב-trade-plans/trades_formatted → להגדיל דיליי, לצמצם page size, ולהשתמש ב־CacheTTLGuard.

---

## 📝 הערות ליישום בממשקים חדשים

- כל קריאת API חייבת לעבור דרך ה־fetch wrapper הגלובלי.
- אין שימוש ב־localStorage ל-auth; רק UnifiedCacheManager (includeUserId:false).
- כניסה רק דרך modal; אין דפי login נפרדים.
- לשמור לוגים ברמת info/debug בלבד; שגיאות auth רכות (לא מפילות עמוד).

**בדיקות:**

- ✅ שרת פעיל
- ✅ Database מחובר
- ✅ Session management עובד
- ✅ `/api/auth/me` מחזיר 401 (כצפוי ללא משתמש)

---

### 5. Selenium Testing

**שימוש:** בדיקה אוטומטית של טעינת העמוד והצגת מודול כניסה

**פקודה:**

```bash
python3 scripts/test_pages_console_errors.py
```

**מה לבדוק:**

- ✅ שגיאות JavaScript בזמן ריצה
- ✅ הודעות קונסול (errors, warnings)
- ✅ איתחול מערכות (Header, Core Systems, Auth)
- ✅ הצגת מודול כניסה כשאין משתמש

---

### 6. EventHandlerManager Debug API

**שימוש:** בדיקת event listeners הקשורים לאימות

**פקודות בקונסולה:**

```javascript
// בדיקת event listeners
const debug = window.EventHandlerManager?.debug;
if (debug) {
  const stats = debug.getStatistics();
  window.Logger?.info('📊 Event Handler Stats', stats);
  
  const history = debug.getEventHistory(50);
  const authEvents = history.filter(e => 
    e.type.includes('auth') || 
    e.type.includes('login') || 
    e.type.includes('logout')
  );
  window.Logger?.info('🔐 Auth Events', { authEvents });
}
```

---

## 📝 תוכנית פעולה מפורטת

### שלב 1: הכנות (5 דקות)

- [ ] בדוק health: `curl http://localhost:8080/api/health`
- [ ] הפעל שרת: `./start_server.sh` (אם לא פעיל)
- [ ] הפעל Firefox: `./scripts/debug/launch-firefox.sh`
- [ ] פתח VS Code/Cursor debugger (F5)

### שלב 2: דיבוגינג עם Breakpoints (10 דקות)

- [ ] הגדר breakpoint ב-`auth.js:1138` (הגדרת `window.TikTrackAuth`)
- [ ] הגדר breakpoint ב-`auth-guard.js:80` (`showLoginModal`)
- [ ] הגדר breakpoint ב-`auth-guard.js:111` (`initAuthGuard`)
- [ ] טען את העמוד: `http://localhost:8080/index.html`
- [ ] עקוב אחרי זרימת הקוד עם F10/F11
- [ ] בדוק Watch Expressions:
  - `typeof window.TikTrackAuth`
  - `typeof window.TikTrackAuth?.showLoginModal`
  - `document.readyState`

### שלב 3: ניטור עם Logger Service (5 דקות)

- [ ] פתח קונסולה בדפדפן
- [ ] הרץ: `window.Logger.getLogs()` (אם זמין)
- [ ] בדוק לוגים הקשורים ל-auth
- [ ] חפש שגיאות או אזהרות

### שלב 4: בדיקת מצב המערכת (5 דקות)

- [ ] הרץ בקונסולה:

```javascript
// בדיקת מערכות
console.log('TikTrackAuth:', typeof window.TikTrackAuth);
console.log('AuthGuard:', typeof window.AuthGuard);
console.log('UnifiedCacheManager:', typeof window.UnifiedCacheManager);

// בדיקת פונקציות
if (window.TikTrackAuth) {
  console.log('TikTrackAuth functions:', Object.keys(window.TikTrackAuth));
  console.log('showLoginModal:', typeof window.TikTrackAuth.showLoginModal);
}
```

### שלב 5: בדיקת טעינת סקריפטים (5 דקות)

- [ ] בדוק Network tab ב-DevTools
- [ ] וודא ש-`auth.js` נטען (status 200)
- [ ] וודא ש-`auth-guard.js` נטען (status 200)
- [ ] בדוק שגיאות טעינה (status 404/500)

### שלב 6: בדיקת Health Service (2 דקות)

```bash
# Health check
curl http://localhost:8080/api/health

# Auth endpoint
curl -v http://localhost:8080/api/auth/me
```

### שלב 7: בדיקת Selenium (10 דקות)

```bash
# הרצת בדיקות אוטומטיות
python3 scripts/test_pages_console_errors.py

# בדוק את התוצאות:
# - console_errors_report.json
# - שגיאות JavaScript
# - הודעות קונסול
```

---

## 🎯 נקודות בדיקה קריטיות

### 1. טעינת `auth.js`

- ✅ הקובץ נטען ללא שגיאות syntax
- ✅ `window.TikTrackAuth` מוגדר בסוף הקובץ
- ✅ `window.TikTrackAuth.showLoginModal` קיים

### 2. טעינת `auth-guard.js`

- ✅ הקובץ נטען לאחר `auth.js`
- ✅ `waitForAuthJS()` מחכה ל-`window.TikTrackAuth`
- ✅ `showLoginModal()` מוצא את `window.TikTrackAuth.showLoginModal`

### 3. סדר טעינה

- ✅ `auth.js` נטען לפני `auth-guard.js` (loadOrder 9.5 vs 9.6)
- ✅ `UnifiedCacheManager` נטען לפני `auth.js` (loadOrder 7 vs 9.5)
- ✅ `logger-service.js` נטען לפני `auth.js` (loadOrder 10 vs 9.5)

### 4. אימות

- ✅ `/api/auth/me` מחזיר 401 (כצפוי ללא משתמש)
- ✅ `auth-guard.js` מזהה 401 ומנסה להציג מודול
- ✅ `showLoginModal()` נקרא בהצלחה

---

## 🔍 דפוסי בעיות נפוצות

### בעיה: `window.TikTrackAuth` לא מוגדר

**סיבות אפשריות:**

1. שגיאת syntax ב-`auth.js` (תוקנה)
2. הקובץ לא נטען (404/500)
3. שגיאה בזמן ריצה מונעת הגעה לשורה 1138

**פתרון:**

- בדוק Network tab - האם הקובץ נטען?
- בדוק Console - האם יש שגיאות?
- בדוק עם breakpoint בשורה 1138 - האם הקוד מגיע לשם?

### בעיה: `showLoginModal` לא זמין

**סיבות אפשריות:**

1. `window.TikTrackAuth` לא מוגדר
2. `showLoginModal` לא נוסף ל-`window.TikTrackAuth`
3. שגיאה בזמן הגדרת `window.TikTrackAuth`

**פתרון:**

- בדוק `Object.keys(window.TikTrackAuth || {})`
- בדוק `typeof window.TikTrackAuth?.showLoginModal`
- בדוק עם breakpoint בשורה 1161 (הוספת `showLoginModal`)

### בעיה: מודול כניסה לא מופיע

**סיבות אפשריות:**

1. `showLoginModal` לא נקרא
2. Bootstrap Modal לא זמין
3. שגיאה ביצירת ה-modal HTML

**פתרון:**

- בדוק עם breakpoint ב-`showLoginModal` - האם הפונקציה נקראת?
- בדוק `typeof window.bootstrap` - האם Bootstrap זמין?
- בדוק Console - האם יש שגיאות ביצירת ה-modal?

---

## 📊 מטריצת בדיקות

| כלי | מתי להשתמש | מה לבדוק | תוצאה צפויה |
|-----|------------|----------|-------------|
| **Debugger for Firefox** | דיבוגינג JavaScript | Breakpoints ב-auth.js ו-auth-guard.js | הקוד רץ ללא שגיאות |
| **Logger Service** | ניטור תהליך | לוגים של טעינה ואימות | לוגים מפורטים ללא שגיאות |
| **System Debug Helper** | בדיקה מקיפה | מצב מערכות אתחול | כל המערכות זמינות |
| **Health Service** | בדיקת שרת | סטטוס שרת ואימות | שרת פעיל, 401 ללא משתמש |
| **Selenium Testing** | בדיקה אוטומטית | שגיאות JavaScript וטעינה | אין שגיאות, מודול מופיע |
| **EventHandlerManager** | בדיקת events | Event listeners הקשורים לאימות | Events נקראים נכון |

---

## ✅ Checklist לפני סיום

- [ ] כל הבדיקות עברו
- [ ] מודול כניסה מופיע כשאין משתמש
- [ ] אין שגיאות JavaScript בקונסולה
- [ ] אין שגיאות Network (404/500)
- [ ] Health check עובר
- [ ] Selenium tests עוברים
- [ ] תיעוד עודכן

---

## 📚 קישורים רלוונטיים

- [QA and Debugging Guide](QA_AND_DEBUGGING_GUIDE.md)
- [Debugging Quick Reference](DEBUGGING_QUICK_REFERENCE.md)
- [Debugging Checklist](../GUIDELINES/DEBUGGING_CHECKLIST.md)
- [Browser Debugging Standards](../GUIDELINES/BROWSER_DEBUGGING_STANDARDS.md)
- [Debugging Standards](../GUIDELINES/DEBUGGING_STANDARDS.md)
- [Monitoring Standards](../GUIDELINES/MONITORING_STANDARDS.md)
- [Selenium Testing Guide](../TESTING/SELENIUM_TESTING_GUIDE.md)

---

**תאריך עדכון:** 9 בדצמבר 2025

