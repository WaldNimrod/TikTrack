# Team 50 → Team 30: Gate B E2E Feedback — תיקונים נדרשים

**id:** `TEAM_50_TO_TEAM_30_GATE_B_E2E_FEEDBACK`  
**from:** Team 50 (QA & Fidelity)  
**to:** Team 30 (Frontend Execution)  
**date:** 2026-02-07  
**context:** לאחר ריצת E2E מלאה — זיהוי בעיות שנותרו

---

## סיכום ביצוע

**Runtime:** 12/12 PASS  
**E2E:** 14/24 PASS (58.33%) — 2 כישלונות: D16, Routes SSOT

---

## 1. שגיאת SEVERE שנותרה — favicon.ico 404

### בעיה
```
SEVERE: http://localhost:8080/favicon.ico - Failed to load resource: the server responded with a status of 404 (Not Found)
```

### השפעה
- מופיעה בכל עמוד D16, D18, D21
- לפי Acceptance Criteria: **0 שגיאות SEVERE** — זהו חריגה

### פתרון נדרש
- **אופציה א:** הוספת `favicon.ico` ל־`ui/public/`
- **אופציה ב:** הוספת `<link rel="icon" href="data:,">` או קישור ל־favicon קיים ב־`<head>` של כל HTML

### מיקום
- `ui/public/` — אין כרגע favicon.ico
- HTML pages: `trading_accounts.html`, `brokers_fees.html`, `cash_flows.html`, `index.html`

---

## 2. React Router נטען על דפי HTML

### בעיה
ב־Console מופיעים:
```
WARNING: React Router Future Flag Warning (v7_startTransition, v7_relativeSplatPath)
INFO: React DevTools...
DEBUG: [vite] connecting...
```

### תצפית
- דפים כמו `trading_accounts.html`, `brokers_fees.html` אמורים להיות HTML טהור עם UAI
- נטענים גם React Router ו־Vite client — מעיד על כך ש־**index.html (React SPA)** נטען במקום דף ה־HTML

### השערה
- ייתכן שה־HTML plugin ב־Vite לא ממפה נכון את הנתיבים
- `routes.json` משתמש במבנה מקונן: `routes.financial.trading_accounts = "/trading_accounts.html"`
- ה־plugin בודק `routeToHtmlMap["/trading_accounts"]` — המפתח לא קיים במבנה הנוכחי

### קבצים לבדיקה
- `ui/vite.config.js` — htmlPagesPlugin, routeToHtmlMap
- `ui/public/routes.json` — מבנה routes

### פתרון נדרש
- לוודא שה־plugin flatten את `routes.json` או ממפה `/trading_accounts`, `/brokers_fees`, `/cash_flows` (עם או בלי .html) ל־HTML הנכון
- Fallback: `'/trading_accounts': '/views/financial/tradingAccounts/trading_accounts.html'` — להפעיל גם כשנשענים על routes.json

---

## 3. כישלון D16 — Trading Accounts

### תסמינים
- D18 ו־D21 עוברים
- D16 נכשל — `pageWrapper` או `container0` ([data-section="summary-alerts"]) לא נמצאים

### סיבה אפשרית
- ניווט ל־`/trading_accounts.html` מחזיר את React SPA במקום את `trading_accounts.html`
- ב־React אין `.page-wrapper` ו־`[data-section="summary-alerts"]` — אלה קיימים רק ב־HTML הפיננסי

### מידע נוסף
- Header Loader מצליח: `[Header Loader] Header inserted before firstChild`
- הדבר מעיד שדף כלשהו נטען, אך ייתכן שמדובר ב־login או ב־React ולא ב־trading_accounts.html

---

## 4. כישלון Routes SSOT Compliance

### בדיקה
```javascript
window.UAI && window.UAI.config || window.routesConfig
```

### בעיה
- `window.UAI.config` נקבע על ידי page config (למשל `tradingAccountsPageConfig.js`)
- אם נטענת React SPA ולא דף ה־HTML — `window.UAI.config` עשוי שלא להיקבע

### פתרון נדרש
- לוודא שדפי HTML הפיננסיים נטענים בפועל (ראה סעיף 2)
- אם נדרש — לחשוף גם `window.sharedServices` או ערך דומה לצורכי E2E (Shared_Services כבר חושף `window.sharedServices`)

---

## 5. קישורי unified-header — אי־התאמה ל־routes.json

### בעיה
ב־`unified-header.html`:
```html
<a href="/trading_accounts" ...>
<a href="/brokers_fees" ...>
<a href="/cash_flows" ...>
```

ב־`routes.json`:
```json
"trading_accounts": "/trading_accounts.html",
"brokers_fees": "/brokers_fees.html",
"cash_flows": "/cash_flows.html"
```

### תאימות
- Vite מטפל גם ב־`/trading_accounts` (בלי .html) אם המיפוי תקין
- אם המיפוי לא תקין — הקליקים יובילו ל־React SPA

### המלצה
- לשמור על עקביות: או להשתמש ב־.html בקישורים, או לוודא שה־plugin ממפה את שני הפורמטים

---

## 6. מה עובד לאחר התיקונים

- Header Loader — `insertBefore` לא קורס
- navigationHandler — אין `import.meta` (תוקן)
- כפתור משתמש — Security Token Leakage עובר
- CRUD — מזוהים API calls (3 ל־trading_accounts, 1 ל־brokers_fees, 1 ל־cash_flows)
- D18, D21 — עוברים כשהדף הנכון נטען

---

## 7. משימות מומלצות ל־Team 30

| # | משימה | קובץ/אזור |
|---|--------|-----------|
| 1 | תיקון favicon.ico 404 | `ui/public/favicon.ico` או link ב־head |
| 2 | תיקון מיפוי HTML ב־Vite | `ui/vite.config.js` — flatten/mapping מ־routes.json |
| 3 | וידוא טעינת דפי HTML פיננסיים | בדיקה: `/trading_accounts` ו־`/trading_accounts.html` מחזירים HTML |
| 4 | אימות קישורי Header | `unified-header.html` — consistency עם routes.json |

---

**Prepared by:** Team 50 (QA & Fidelity)  
**log_entry | [Team 50] | GATE_B | E2E_FEEDBACK | TEAM_30 | 2026-02-07**
