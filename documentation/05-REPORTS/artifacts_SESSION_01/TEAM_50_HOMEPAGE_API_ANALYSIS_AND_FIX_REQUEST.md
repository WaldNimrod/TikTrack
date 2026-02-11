# Team 50 → כל הצוותים: ניתוח בעיית API בדף הבית + דרישת תיקון

**מאת:** Team 50 (QA)  
**תאריך:** 2026-01-31  
**הקשר:** דף הבית עובד ויזואלית אך קורא ל-API מוגנים לאורחים

---

## 1. הבעיה המזוהה

**דף הבית עובד ויזואלית כנדרש** (containers שונים למשתמש ואורח), **אבל**:
- קורא ל-API מוגנים ברקע גם כשאין משתמש מחובר
- יוצר **10 SEVERE errors (401 Unauthorized)** בכל טעינה של אורח
- מפר את דרישת "0 SEVERE" לשער

**מקור השגיאות:** קריאות ל-API של `trading_accounts`, `cash_flows`, `positions` בדף Home Type B (Shared).

---

## 2. תרחיש לבדיקה

### שלבים לבדיקה:
1. **פתח דפדפן חדש** (או נקה storage)
2. **נווט ל-** `http://localhost:8080/` (דף הבית)
3. **פתח DevTools → Console**
4. **רענן את הדף**

### מה תראה:
- **ויזואלי:** ✅ Guest Container מוצג (כנדרש)
- **Console:** ❌ 10 SEVERE errors עם "401 Unauthorized" ל-API calls
- **Network tab:** ❌ בקשות נכשלות ל-trading_accounts, cash_flows, positions

### תוצאה צפויה:
```
SEVERE: http://localhost:8080/api/v1/trading_accounts - Failed to load resource: 401
SEVERE: http://localhost:8080/api/v1/cash_flows - Failed to load resource: 401
SEVERE: http://localhost:8080/api/v1/positions - Failed to load resource: 401
```

---

## 3. ניתוח מקור הבעיה

### למה זה קורה:
- **Type B (Shared):** דף הבית נגיש לכולם, לא דורש auth
- **DataStage fix:** Team 30 הוסיפו `config.requiresAuth` בדיקה — **אבל** דף Home לא מסומן כ-`requiresAuth`
- **תוצאה:** רכיבי דף Home קוראים ל-API מוגנים בלי לבדוק authentication

### קוד רלוונטי:
```javascript
// DataStage.js — בודק רק אם הדף דורש auth
if (config.requiresAuth) {
  const authenticated = this.isAuthenticated();
  if (!authenticated) {
    // מדלג על API calls
  }
}

// אבל דף Home (Type B) לא מסומן כ-requiresAuth!
```

---

## 4. דרישת תיקון לצוותים

### Team 30 (Frontend) — תיקון דחוף:
**הוסף בדיקת authentication לכל רכיבי דף Home שקוראים ל-API מוגנים.**

#### אפשרויות תיקון:

**אופציה 1: בדיקה ברמת רכיב**
```javascript
// בכל רכיב שקורא ל-API
if (isAuthenticated()) {
  // קרא ל-API
} else {
  // הצג data ריקה או placeholder
}
```

**אופציה 2: תיקון DataStage**
```javascript
// DataStage.js — בדוק authentication גם בדפים שאינם requiresAuth
if (!this.isAuthenticated()) {
  // דלג על כל קריאות API מוגנות
}
```

**אופציה 3: תיקון ברמת HomePage**
```javascript
// HomePage.jsx — בדוק auth לפני render של widgets
{isAuthenticated && <TradingAccountsWidget />}
{isAuthenticated && <CashFlowsWidget />}
```

### מה נדרש:
1. **אתר את הרכיבים** שקוראים ל-trading_accounts, cash_flows, positions
2. **הוסף בדיקת `isAuthenticated()`** לפני כל קריאת API
3. **בדוק ש-SEVERE errors יורדים ל-0** באורחים

### Team 20 (Backend) — לא נדרש תיקון
הבעיה היא בצד Frontend - קריאות מיותרות ל-API מוגנים.

---

## 5. אימות תיקון

**לאחר תיקון:**
1. הרץ Gate A מחדש
2. וודא ש-SEVERE ירד מ-14 ל-4 (רק 422 Register)
3. דף Home עדיין עובד ויזואלית (containers שונים)

---

**Team 50 (QA)**  
**log_entry | HOMEPAGE_API_FIX_REQUEST | TEAM_30_FRONTEND_FIX | 2026-01-31**
