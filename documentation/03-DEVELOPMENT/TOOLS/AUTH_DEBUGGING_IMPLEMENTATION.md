# מדריך מפתח – יישום ואבחון אימות (מצב נוכחי)

**עדכון:** 10 דצמבר 2025  
**מטרה:** תיעוד מערכת קיים ומדריך ישים למפתחים בכל הממשקים (קיימים/עתידיים).

---

## 1) ארכיטקטורת אימות ובידוד נתונים

- **Token בלבד (Bearer)**: ללא cookies. `api-fetch-wrapper.js` מזריק Authorization אוטומטית.
- **UnifiedCacheManager**: authToken/currentUser נשמרים עם `includeUserId:false` בלבד; פינוי דרך `forceLogoutAndPrompt`.
- **Login Modal**: מסלול יחיד. כל עמוד מוגן מפעיל `auth-guard.js`; ב-401/חוסר טוקן מוצג המודל.
- **Z-Index/Stack**: רישום המודל ב־`ModalNavigationService` והפעלת `ModalZIndexManager.forceUpdate(modalElement)` כדי להבטיח שהוא מעל ה-backdrop.
- **Preferences ברירת מחדל**: `/api/preferences/default` מחזיר צבעי לוגו (#26baac, #fc5a06). טעינה רכה (soft-fail) כשאין משתמש.
- **Rate Limit (429)**: בעמודים עתירי trade-plans (למשל `/trades_formatted.html`) חובה לצמצם מקביליות, להגדיל דיליי, ולהישען על CacheTTLGuard/RateLimitTracker.
- **בידוד נתונים מלא**: כל Service Layer מסנן לפי user_id בצורה חובה. משתמשים רואים רק נתונים שלהם.
- **API Responses**: כוללים user_id נכון בכל entity (למשל Trade.to_dict() כולל user_id).

---

## 2) אינדקס קבצים מרכזיים

- Auth/Guard: `trading-ui/scripts/auth.js`, `trading-ui/scripts/auth-guard.js`
- Fetch גלובלי: `trading-ui/scripts/api-fetch-wrapper.js`
- Cache: `trading-ui/scripts/unified-cache-manager.js`
- Modal Stack/Z: `trading-ui/scripts/modal-navigation-manager.js`, `trading-ui/scripts/modal-z-index-manager.js`
- Preferences: `trading-ui/scripts/services/preferences-data.js`
- Selenium: `scripts/test_pages_console_errors.py` (token login מובנה)

---

## 3) Checklist למפתחים

1. **בריאות שרת**  
   - `curl http://localhost:8080/api/health`  
   - `curl http://localhost:8080/api/preferences/default?preference_name=primary_color` → `#26baac`
2. **סלניום**  
   - עמוד בודד: `python3 scripts/test_pages_console_errors.py --page "/"`  
   - סוויפ מלא: `python3 scripts/test_pages_console_errors.py`
3. **Modal & Z-Index**  
   - לפתוח עמוד מוגן ללא טוקן → modal מוצג, מעל backdrop, אין "Modal not found in stack".
4. **Auth/Cache**  
   - אחרי login: `UnifiedCacheManager.get('authToken', {includeUserId:false})` קיים; בטאב נוסף אין 401 מוקדמים ל-tickers/watch-list/preferences.
5. **Preferences**  
   - עם טוקן: `/api/preferences/user` ללא 401.  
   - ללא טוקן: soft-fail, לוג debug, צבעי ברירת מחדל זמינים.
6. **Trade-Plans 429**  
   - `/trades_formatted.html`: אין הצפה של 429; throttling פעיל, page size קטן, דיליי בין קריאות.

---

## 4) רצף Login לדוגמה

```javascript
// auth-guard כבר רץ
await window.TikTrackAuth.showLoginModal(); // modal מוצג
// לאחר הצלחה:
// - fetch wrapper מזריק Authorization
// - authToken/currentUser נשמרים ב-UC (includeUserId:false)
// - header-system מעדכן סטטוס משתמש
```

---

## 5) דיבוג וכלים

- **Firefox Debug**: `./scripts/debug/launch-firefox.sh` → F5 (“Launch Firefox - Development”).
- **Auth Debug Monitor**: לוגי cache/auth, שגיאות נשמרות; זמין בדפדפן.
- **בדיקת auth מהירה**: `curl -H "Authorization: Bearer <token>" http://localhost:8080/api/auth/me`
- **System Debug Helper**: `window.debugSystem()` + `AuthDebugMonitor` לבדיקת cache/טעינת סקריפטים.

---

## 6) הנחיות יישום לממשקים חדשים

- כל fetch עובר דרך ה-wrapper הגלובלי; אין `credentials: 'include'`.
- auth נשמר ונמחק רק ב-`UnifiedCacheManager` (includeUserId:false); אין שימוש ב-localStorage ל-auth.
- כניסה רק דרך modal; אין דפי login.
- 401/403 → לוג warn/debug ו־soft-fail; אין קריסה של העמוד.
- עמודים עתירי trade-plans → לצמצם מקביליות, להגדיל דיליי, להפעיל CacheTTLGuard/RateLimitTracker.

---

## 7) נקודות כשל נפוצות

- מודל מאחורי backdrop → לרשום למנהל הניווט ואז `ModalZIndexManager.forceUpdate(modalElement)`.
- 401 ב-tickers/watch-list → לבדוק `TikTrackAuth.getCurrentUser()` לפני קריאות, ולאשר טוקן ב-UC.
- 429 ב-trade-plans → להפחית page size, להגדיל דיליי, להשתמש ב-cache.

---

## 8) תפעול/QA מהיר

- **פינוי auth**: `window.TikTrackAuth.forceLogoutAndPrompt('manual')` מנקה את כל שכבות המטמון ומשדר logout לטאבים.
- **סדר טעינה**: `api-fetch-wrapper.js` (0.5) לפני הכל; `auth.js` (9.5) לפני `auth-guard.js` (9.6).
- **Header סטטוס**: אייקון ירוק מחובר / כתום מנותק לאחר login/logout.
