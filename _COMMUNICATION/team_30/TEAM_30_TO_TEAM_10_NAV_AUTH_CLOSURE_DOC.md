# Team 30 → Team 10: מסמך סגירה — Nav/Auth

**מאת:** Team 30 (Frontend Execution)  
**אל:** Team 10 (The Gateway)  
**תאריך:** 2026-02-12  
**מקור:** `TEAM_10_TO_TEAM_30_FINAL_CLOSURE_DEMAND.md`, `TEAM_10_TO_TEAM_30_NAVIGATION_AUTH_FIX_MANDATE.md`

---

## 1. מצב נוכחי — איך Header ו-Auth ממומשים היום

### 1.1 ארכיטקטורה כללית

המערכת בנויה **היברידית**:
- **React SPA:** `/`, `/login`, `/profile` — נטענים דרך `index.html` → `main.jsx` → `AppRouter.jsx`
- **HTML Pages:** `/trading_accounts.html`, `/brokers_fees.html`, `/cash_flows.html` — נטענים ישירות ע"י **Vite `htmlPagesPlugin`** לפני React Router

### 1.2 Header — מימוש

| רכיב | מיקום | תיאור |
|------|--------|-------|
| **unified-header.html** | `ui/src/views/shared/unified-header.html` | מקור יחיד (SSOT) — HTML בלבד |
| **headerLoader.js** | `ui/src/components/core/headerLoader.js` | טוען את `unified-header.html` דינמית ומזריק ל-`<body>` |
| **פעילות:** | | אין כפילות — אין `UnifiedHeader.jsx` |

**טעינת Header:**
- **React:** `index.html` מכיל `headerLoader.js` — Header מוזרק לפני mount של React
- **HTML Pages:** `UnifiedAppInit.js` → `DOMStage` טוען את `headerLoader.js` — Header מוזרק בתחילת העמוד

### 1.3 Navigation — קישורים

**unified-header.html** משתמש **רק** ב־`<a href>` סטנדרטיים:
- אין `<Link>` מ־React Router
- דוגמאות: `<a href="/trading_accounts.html">`, `<a href="/profile">`, `<a href="/login">`

**navigationHandler.js** (`ui/src/components/core/navigationHandler.js`):
- מטפל **רק** ב-dropdownים (פתיחה/סגירה)
- אינו מטפל בניווט — הדפדפן מנהל ניווט
- אין לוגיקת React Router bypass

### 1.4 Auth Guard

**authGuard.js** (`ui/src/components/core/authGuard.js`):
- בודק `localStorage` / `sessionStorage` עבור `access_token` / `authToken`
- עבור עמודי HTML (Type C/D) — מפנה ל־`/` (Home) אם אין אימות (לפי SSOT: TT2_AUTH_GUARDS_AND_ROUTE_SSOT.md)
- נטען ע"י `DOMStage` לפני תוכן העמוד
- שימוש ב־`maskedLog` (ללא דליפת tokens)

**React:** `ProtectedRoute.jsx` מגן על `/profile` ו־`/admin/design-system`.

### 1.5 React Router

**AppRouter.jsx** (`ui/src/router/AppRouter.jsx`):
- `Route path="*"` → `<Navigate to="/" />` — חל **רק** על routes של React
- עמודי HTML **לא עוברים** דרך React Router — Vite middleware מספק אותם קודם

**Vite `htmlPagesPlugin`** (`vite.config.js`):
- Middleware בתחילת המחסנית
- `routeToHtmlMap` (מתוך `routes.json`) ממפה `/trading_accounts` → `trading_accounts.html`
- עמודי HTML נמסרים ישירות — React Router לא רואה את הבקשות הללו

---

## 2. השוואה למנדט — מה לא קיים או שונה

### Phase 1: הסרת כפילויות Header

| פריט במנדט | מצב נוכחי |
|------------|------------|
| מחיקת `UnifiedHeader.jsx` | הקובץ **לא קיים** — המבנה הנוכחי לא כולל אותו |
| הסרת `TtHeader` מ־`global_page_template.jsx` | `global_page_template.jsx` **לא קיים** — אין `ui/src/layout/` |
| הסרת `TtGlobalFilter` מ־`global_page_template.jsx` | אותו מצב — הקובץ לא קיים |

**מסקנה:** עקרונות Phase 1 מתקיימים — אין כפילות Header, אין TtHeader, אין TtGlobalFilter.

### Phase 2: תיקון Navigation

| פריט במנדט | מצב נוכחי |
|------------|------------|
| רק `<a href>` ב־unified-header | מתקיים — אין `<Link>` |
| פישוט `navigation-handler.js` | `navigationHandler.js` כבר מטפל רק ב-dropdownים |

**מסקנה:** Phase 2 מיושם.

### Phase 3: תיקון React Router

| פריט במנדט | מצב נוכחי |
|------------|------------|
| Catch-All Route לא חוסם HTML Pages | מתקיים — Vite middleware מספק HTML לפני React Router |
| וידוא Vite Middleware מטפל ב-HTML | מתקיים — `htmlPagesPlugin` בראש ה-middleware stack |

**מסקנה:** Phase 3 מיושם.

### Phase 4: תיקון Auth Guard

| פריט במנדט | מצב נוכחי |
|------------|------------|
| זיהוי clean routes | `authGuard.js` בודק path; `routes.json` הוא SSOT ל-routes |
| אינטגרציה עם React Auth | React משתמש ב־`ProtectedRoute`; HTML משתמש ב־`authGuard.js` |

**מסקנה:** Phase 4 מיושם ברמת העקרונות — HTML ו-React ממומשים בנפרד לפי סוג העמוד.

---

## 3. הבדלי מבנה (לא חוסרים פונקציונליים)

| קבצים במנדט | מיקום נוכחי |
|-------------|-------------|
| `ui/src/components/core/unified-header.html` | `ui/src/views/shared/unified-header.html` |
| `ui/src/views/financial/navigation-handler.js` | `ui/src/components/core/navigationHandler.js` |
| `ui/src/views/financial/auth-guard.js` | `ui/src/components/core/authGuard.js` |

המבנה הנוכחי שונה במעט (מיקומי קבצים) אך תואם לעקרונות המנדט.

---

## 4. המלצה

**משימת Nav/Auth נסגרת — המבנה הנוכחי עומד בעקרונות המנדט.**

- אין כפילויות Header  
- Navigation מבוסס על `<a href>`  
- React Router לא חוסם HTML Pages  
- Auth Guard פעיל לעמודי HTML; `ProtectedRoute` לעמודים של React  

**אין שינוי קוד נדרש.** המנדט נכתב ככל הנראה למבנה קודם שלא קיים עוד — המבנה הנוכחי כבר מיישם את העקרונות.

---

## 5. בקשת אישור

Team 10 מתבקש לאשר את מסמך הסגירה זה כדי לסמן את משימת Nav/Auth כ־**סגורה** באינדקס.

---

## 6. עדכון (תיקון שגיאות)

| סעיף | שגיאה | תיקון |
|------|--------|-------|
| 1.4 Redirect | נכתב "מפנה ל־/login" | תוקן: מפנה ל־`/` (Home) — לפי authGuard.js + TT2_AUTH_GUARDS_AND_ROUTE_SSOT.md |
| 1.4 Token | נכתב `auth_token` | תוקן: `access_token` + `authToken` — לפי authGuard.js |

---

**Team 30 (Frontend Execution)**  
**log_entry | TEAM_30 | NAV_AUTH_CLOSURE_DOC | TEAM_10 | 2026-02-12**
