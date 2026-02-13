# Team 30 → Team 10: תיקון מלא של כל קישורי התפריט הראשי

**תאריך:** 2026-01-31  
**סטטוס:** ✅ הושלם  
**Gate:** Gate B  
**Priority:** 🔴 BLOCKING

---

## 📋 סיכום

בוצע תיקון מלא ואחיד של כל קישורי התפריט הראשי (`unified-header.html`) והלוגיקה הדינמית (`headerLinksUpdater.js`) כדי להבטיח ניווט תקין בכל העמודים.

---

## 🎯 בעיות שזוהו ותוקנו

### 1. **קישורים לא עקביים בתפריט הראשי**
   - **בעיה:** חלק מהקישורים השתמשו ב-`.html` וחלק לא, חלק היו `#` וחלק היו נתיבים מלאים
   - **תיקון:** כל הקישורים עודכנו להיות עקביים לפי `routes.json`:
     - קבצי HTML פיננסיים: `/trading_accounts.html`, `/brokers_fees.html`, `/cash_flows.html`
     - קבצי HTML אחרים: `/trade_plans.html`, `/trades_history.html`
     - React routes: `/profile`, `/login`, `/register`, `/reset-password`
     - Dropdown parents: `#` (לא מנווטים, רק פותחים תפריט)

### 2. **כפתור משתמש לא מבצע התנתקות**
   - **בעיה:** כפתור המשתמש היה רק קישור לפרופיל/כניסה, ללא אפשרות להתנתק
   - **תיקון:** 
     - הוספת פונקציית `handleLogout()` ב-`headerLinksUpdater.js`
     - כפתור המשתמש עכשיו:
       - **כשלא מחובר:** קישור ל-`/login` עם צבע אזהרה (אדום)
       - **כשמחובר:** קישור ל-`/profile` עם צבע הצלחה (ירוק)
       - **Right-click / Context menu:** מציע התנתקות עם אישור

### 3. **קישור לפרופיל שגוי**
   - **בעיה:** הקישור היה `/user_profile` במקום `/profile` (React route)
   - **תיקון:** עודכן ל-`/profile` בכל המקומות

### 4. **קישורים לא מעודכנים דינמית**
   - **בעיה:** `headerLinksUpdater.js` לא עדכן את כל הקישורים בצורה מקיפה
   - **תיקון:** הוספת לוגיקה מקיפה לעדכון כל הקישורים:
     - עדכון קישורים פיננסיים (`.html`)
     - עדכון קישורי React (ללא `.html`)
     - עדכון `data-page` attributes
     - עדכון dropdown toggles

---

## 🔧 קבצים שעודכנו

### 1. `ui/src/views/shared/unified-header.html`
   - **שינויים:**
     - כל קישורי התפריט עודכנו להיות עקביים
     - Dropdown parents שונו ל-`#` (לא מנווטים)
     - קישור לפרופיל עודכן ל-`/profile`
     - הוספת `data-page` attributes לקישורים רלוונטיים
   
   **דוגמאות:**
   ```html
   <!-- לפני -->
   <a href="/trade_plans" class="tiktrack-nav-link tiktrack-dropdown-toggle">
   <a href="/user_profile" data-page="user_profile">👤 פרופיל משתמש</a>
   
   <!-- אחרי -->
   <a href="#" class="tiktrack-nav-link tiktrack-dropdown-toggle" data-page="trade_plans">
   <a href="/profile" data-page="user_profile">👤 פרופיל משתמש</a>
   ```

### 2. `ui/src/components/core/headerLinksUpdater.js`
   - **שינויים:**
     - הוספת פונקציית `handleLogout()` מלאה עם תמיכה ב-`authService` ו-fallback
     - שיפור `updateUserProfileLink()` עם תמיכה ב-logout (right-click)
     - שיפור `updateHeaderLinks()` עם עדכון מקיף של כל הקישורים:
       - עדכון קישורים פיננסיים (`.html`)
       - עדכון קישורי React (`/profile`, `/login`, וכו')
       - עדכון dropdown toggles
       - הוספת `data-page` attributes
   
   **פונקציות חדשות:**
   ```javascript
   async function handleLogout() {
     // מנסה להשתמש ב-authService אם זמין
     // אחרת מנקה tokens ידנית
     // מפנה ל-/login
   }
   ```

---

## ✅ Acceptance Criteria

- [x] כל קישורי התפריט הראשי עקביים ומתאימים ל-`routes.json`
- [x] כפתור המשתמש מציג מצב נכון (מחובר/לא מחובר) עם צבעים
- [x] כפתור המשתמש מאפשר התנתקות (right-click)
- [x] כל הקישורים מעודכנים דינמית ב-`headerLinksUpdater.js`
- [x] קישורים פיננסיים משתמשים ב-`.html` extension
- [x] קישורי React משתמשים בנתיבים ללא `.html`
- [x] Dropdown parents לא מנווטים (משתמשים ב-`#`)

---

## 🧪 בדיקות נדרשות

### בדיקות ידניות:
1. **ניווט בתפריט הראשי:**
   - [ ] מעבר מעמוד הבית לעמודים פיננסיים (Trading Accounts, Brokers Fees, Cash Flows)
   - [ ] מעבר לתפריטים אחרים (תכנון, מעקב, מחקר, הגדרות, ניהול)
   - [ ] בדיקת dropdown menus נפתחים ונסגרים כראוי

2. **כפתור משתמש:**
   - [ ] כשלא מחובר: קישור ל-`/login` עם צבע אזהרה (אדום)
   - [ ] כשמחובר: קישור ל-`/profile` עם צבע הצלחה (ירוק)
   - [ ] Right-click על כפתור המשתמש מציע התנתקות
   - [ ] התנתקות מנקה tokens ומפנה ל-`/login`

3. **עדכון דינמי:**
   - [ ] כפתור המשתמש מתעדכן בזמן אמת כשמתחברים/מתנתקים
   - [ ] קישורים מתעדכנים אוטומטית כשהדף נטען

---

## 📝 הערות טכניות

### מיפוי קישורים (לפי `routes.json`):
- **HTML Routes (עם `.html`):**
  - `/trading_accounts.html` → `src/views/financial/tradingAccounts/trading_accounts.html`
  - `/brokers_fees.html` → `src/views/financial/brokersFees/brokers_fees.html`
  - `/cash_flows.html` → `src/views/financial/cashFlows/cash_flows.html`
  - `/trade_plans.html` → (מוגדר ב-`routes.json`)
  - `/trades_history.html` → (מוגדר ב-`routes.json`)

- **React Routes (ללא `.html`):**
  - `/profile` → React component (`ProfileView`)
  - `/login` → React component (`LoginForm`)
  - `/register` → React component (`RegisterForm`)
  - `/reset-password` → React component (`PasswordResetFlow`)

### Logout Flow:
1. Right-click על כפתור המשתמש
2. אישור התנתקות
3. קריאה ל-`authService.logout()` (אם זמין) או ניקוי ידני של tokens
4. Dispatch של `auth:logout` event
5. הפניה ל-`/login`

---

## 🚀 Ready for Testing

**Status:** ✅ כל התיקונים הושלמו  
**Next Step:** בדיקות ידניות + בדיקות E2E על ידי Team 50

---

**Team 30 (Frontend Execution)**  
**Date:** 2026-01-31
