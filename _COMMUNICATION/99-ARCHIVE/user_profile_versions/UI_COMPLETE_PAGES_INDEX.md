# אינדקס מלא של כל העמודים והקבצים שיכולים לייצר עמודים בתיקייה UI

**תאריך עדכון:** 2026-02-04  
**מטרה:** רשימה מקיפה ומסודרת של כל הקבצים בתיקייה `ui` שיכולים לייצר עמודים, מחולקים לפי:
- סוג (React Component / HTML Static / Component)
- סטטוס (פעיל / לא פעיל / ישן)
- שיוך לעמוד (איזה Route / Path)

---

## 📊 סיכום כללי

סה"כ **15 קבצים** שיכולים לייצר עמודים:
- **5 עמודים פעילים** (React Router)
- **4 עמודי HTML סטטיים** (Vite Middleware)
- **6 קומפוננטות** (לא עמודים עצמאיים)

---

## 🟢 עמודים פעילים (React Router)

### 1. עמוד בית / דשבורד ראשי
- **קובץ:** `ui/src/components/HomePage.jsx`
- **Route:** `/` (Protected)
- **סטטוס:** ✅ **פעיל** (TRACKED)
- **תאריך עדכון אחרון:** 2026-02-03 16:18:38
- **Commit:** `64be69689b368771ae4eaa6033b1974dcabb394b`
- **הודעה:** "fix(team-30): Remove ALL inline styles from HomePage.jsx - zero tolerance"
- **גרסה:** v3.0 (React Component)
- **תיאור:** עמוד בית ראשי עם התראות, סיכום, וויגיטים וטבלת פורטפוליו
- **Blueprint:** `_COMMUNICATION/team_01/team_01_staging/D15_INDEX.html`
- **תכונות:**
  - UnifiedHeader
  - התראות פעילות
  - סיכום פורטפוליו
  - וויגיטים (Recent Trades, Pending Actions, Ticker List)
  - טבלת פורטפוליו

---

### 2. עמוד פרופיל משתמש (React)
- **קובץ:** `ui/src/cubes/identity/components/profile/ProfileView.jsx`
- **Route:** `/profile` (Protected)
- **סטטוס:** ✅ **פעיל** (TRACKED)
- **תאריך עדכון אחרון:** 2026-02-03 17:02:00
- **Commit:** `a098bf95fa137c1b1dbb10146aea09964d3bae85`
- **הודעה:** "fix(team-30): Fix all QA issues - Audit Trail and Inline Styles"
- **גרסה:** v3.0 (React Component)
- **תיאור:** עמוד ניהול פרופיל משתמש (גרסה React)
- **Blueprint:** `_COMMUNICATION/team_31/team_31_staging/sandbox_v2/D15_PAGE_TEMPLATE_V3.html`
- **תכונות:**
  - מידע אישי
  - שינוי סיסמה
  - מפתחות API
  - 3 קונטיינרים לפי תבנית V3

---

### 3. עמוד התחברות
- **קובץ:** `ui/src/cubes/identity/components/auth/LoginForm.jsx`
- **Route:** `/login` (Public)
- **סטטוס:** ✅ **פעיל** (TRACKED)
- **תאריך עדכון אחרון:** 2026-02-03 17:00:24
- **גרסה:** v1.0 (React Component)
- **תיאור:** עמוד התחברות למערכת

---

### 4. עמוד הרשמה
- **קובץ:** `ui/src/cubes/identity/components/auth/RegisterForm.jsx`
- **Route:** `/register` (Public)
- **סטטוס:** ✅ **פעיל** (TRACKED)
- **תאריך עדכון אחרון:** 2026-02-03 17:00:26
- **גרסה:** v1.0 (React Component)
- **תיאור:** עמוד הרשמה למערכת

---

### 5. עמוד איפוס סיסמה
- **קובץ:** `ui/src/cubes/identity/components/auth/PasswordResetFlow.jsx`
- **Route:** `/reset-password` (Public)
- **סטטוס:** ✅ **פעיל** (TRACKED)
- **תאריך עדכון אחרון:** 2026-02-03 17:00:41
- **גרסה:** v1.0 (React Component)
- **תיאור:** עמוד איפוס סיסמה (Flow מלא)

---

## 📄 עמודי HTML סטטיים (Vite Middleware)

### 6. עמוד חשבונות מסחר (HTML)
- **קובץ:** `ui/src/views/financial/trading_accounts.html`
- **Route:** `/trading_accounts` (Vite Middleware)
- **סטטוס:** ⚠️ **פעיל אבל UNTRACKED**
- **תאריך עדכון אחרון:** 2026-02-04 02:00:33
- **גרסה:** v1.0 (Static HTML Page)
- **תיאור:** עמוד לניהול חשבונות מסחר (גרסה HTML סטטית)
- **תכונות:**
  - טבלת חשבונות מסחר
  - פילטרים וחיפוש
  - פעולות CRUD
  - נטען דרך Vite Middleware (לא React Router)

---

### 7. עמוד פרופיל משתמש (HTML)
- **קובץ:** `ui/src/views/financial/user_profile.html`
- **Route:** `/user_profile` (Vite Middleware)
- **סטטוס:** ⚠️ **פעיל אבל UNTRACKED**
- **תאריך עדכון אחרון:** 2026-02-04 02:00:33
- **גרסה:** v1.0 (Static HTML Page)
- **תיאור:** עמוד לניהול פרופיל משתמש (גרסה HTML סטטית)
- **תכונות:**
  - מידע אישי
  - שינוי סיסמה
  - מפתחות API
  - **בעיה ידועה:** חסרים שדות, החלוקה לא נכונה, עיצוב סקשן המפתחות לא קרוב
- **הערה:** זהו עמוד נפרד מ-`ProfileView.jsx` (React Component)

---

### 8. עמוד עמלות ברוקרים (HTML)
- **קובץ:** `ui/src/views/financial/brokers_fees.html`
- **Route:** `/brokers_fees` (Vite Middleware)
- **סטטוס:** ⚠️ **פעיל אבל UNTRACKED**
- **תאריך עדכון אחרון:** 2026-02-04 02:00:33
- **גרסה:** v1.0 (Static HTML Page)
- **תיאור:** עמוד לניהול ברוקרים ועמלות (גרסה HTML סטטית)
- **תכונות:**
  - טבלת ברוקרים ועמלות
  - הגדרות עמלות

---

### 9. עמוד תזרימי מזומנים (HTML)
- **קובץ:** `ui/src/views/financial/cash_flows.html`
- **Route:** `/cash_flows` (Vite Middleware)
- **סטטוס:** ⚠️ **פעיל אבל UNTRACKED**
- **תאריך עדכון אחרון:** 2026-02-04 02:00:33
- **גרסה:** v1.0 (Static HTML Page)
- **תיאור:** עמוד ליומן תזרים מזומנים (גרסה HTML סטטית)
- **תכונות:**
  - טבלת תנועות מזומנים
  - פילטרים לפי תאריך

---

## 🧩 קומפוננטות (לא עמודים עצמאיים)

### 10. Unified Header Component
- **קובץ:** `ui/src/components/core/UnifiedHeader.jsx`
- **Route:** N/A (קומפוננטה)
- **סטטוס:** ✅ **פעיל** (TRACKED)
- **תיאור:** רכיב Header מאוחד לכל העמודים
- **שימוש:** נטען בכל העמודים (React ו-HTML)

---

### 11. Unified Header Template (HTML)
- **קובץ:** `ui/src/components/core/unified-header.html`
- **Route:** N/A (תבנית HTML)
- **סטטוס:** ⚠️ **UNTRACKED**
- **תאריך עדכון אחרון:** 2026-02-04 02:00:33
- **תיאור:** תבנית HTML ל-Header (נטען דינמית על ידי `header-loader.js`)

---

### 12. Page Footer Component
- **קובץ:** `ui/src/components/core/PageFooter.jsx`
- **Route:** N/A (קומפוננטה)
- **סטטוס:** ✅ **פעיל** (TRACKED)
- **תיאור:** רכיב Footer לכל העמודים
- **שימוש:** נטען בכל העמודים (React)

---

### 13. Footer Template (HTML)
- **קובץ:** `ui/src/views/financial/footer.html`
- **Route:** N/A (תבנית HTML)
- **סטטוס:** ⚠️ **UNTRACKED**
- **תאריך עדכון אחרון:** 2026-02-04 02:00:33
- **תיאור:** תבנית HTML ל-Footer (נטען דינמית על ידי `footer-loader.js`)

---

### 14. Global Page Template
- **קובץ:** `ui/src/layout/global_page_template.jsx`
- **Route:** N/A (תבנית)
- **סטטוס:** ✅ **פעיל** (TRACKED)
- **תיאור:** תבנית עמוד גלובלית (TtHeader, TtGlobalFilter, TtSection, TtSectionRow)
- **שימוש:** תבנית בסיסית לעמודים חדשים

---

### 15. Auth Layout Component
- **קובץ:** `ui/src/cubes/identity/components/AuthLayout.jsx`
- **Route:** N/A (קומפוננטה)
- **סטטוס:** ✅ **פעיל** (TRACKED)
- **תיאור:** תבנית Layout לעמודי אימות (Login, Register, Reset Password)
- **שימוש:** עוטף את כל עמודי האימות

---

## 📁 קבצים נוספים (לא עמודים עצמאיים)

### 16. Index Entry Point
- **קובץ:** `ui/index.html`
- **Route:** `/` (Entry Point)
- **סטטוס:** ✅ **פעיל** (TRACKED)
- **תאריך עדכון אחרון:** 2026-01-31 21:59:31
- **תיאור:** נקודת כניסה למערכת (טוען את React App)

### 17. Auth Guard Test
- **קובץ:** `ui/test-auth-guard.html`
- **Route:** N/A (קובץ בדיקה)
- **סטטוס:** ⚠️ **UNTRACKED** (קובץ בדיקה)
- **תאריך עדכון אחרון:** 2026-02-04 02:00:33
- **תיאור:** קובץ בדיקה ל-Auth Guard

---

## 📊 טבלת סיכום - עמודים פעילים

| # | שם עמוד | קובץ | Route | סוג | סטטוס | תאריך עדכון | גרסה |
|---|---------|------|-------|-----|-------|--------------|-------|
| 1 | עמוד בית | `HomePage.jsx` | `/` | React | ✅ פעיל | 2026-02-03 16:18:37 | v3.0 |
| 2 | פרופיל משתמש (React) | `ProfileView.jsx` | `/profile` | React | ✅ פעיל | 2026-02-03 17:01:27 | v3.0 |
| 3 | התחברות | `LoginForm.jsx` | `/login` | React | ✅ פעיל | 2026-02-03 17:00:24 | v1.0 |
| 4 | הרשמה | `RegisterForm.jsx` | `/register` | React | ✅ פעיל | 2026-02-03 17:00:26 | v1.0 |
| 5 | איפוס סיסמה | `PasswordResetFlow.jsx` | `/reset-password` | React | ✅ פעיל | 2026-02-03 17:00:41 | v1.0 |
| 6 | חשבונות מסחר (HTML) | `trading_accounts.html` | `/trading_accounts` | HTML | ⚠️ פעיל | 2026-02-04 | v1.0 |
| 7 | פרופיל משתמש (HTML) | `user_profile.html` | `/user_profile` | HTML | ⚠️ פעיל | 2026-02-04 | v1.0 |
| 8 | עמלות ברוקרים (HTML) | `brokers_fees.html` | `/brokers_fees` | HTML | ⚠️ פעיל | 2026-02-04 | v1.0 |
| 9 | תזרימי מזומנים (HTML) | `cash_flows.html` | `/cash_flows` | HTML | ⚠️ פעיל | 2026-02-04 | v1.0 |

---

## 🔍 ניתוח כפילות

### כפילות בין React ו-HTML:

1. **פרופיל משתמש:**
   - ✅ React: `/profile` → `ProfileView.jsx` (פעיל, TRACKED)
   - ⚠️ HTML: `/user_profile` → `user_profile.html` (פעיל, UNTRACKED)
   - **בעיה:** שני עמודים שונים לאותו מטרה!

### עמודים ללא כפילות:

- **עמוד בית:** רק React (`HomePage.jsx`)
- **חשבונות מסחר:** רק HTML (`trading_accounts.html`)
- **עמלות ברוקרים:** רק HTML (`brokers_fees.html`)
- **תזרימי מזומנים:** רק HTML (`cash_flows.html`)
- **עמודי אימות:** רק React (LoginForm, RegisterForm, PasswordResetFlow)

---

## ⚠️ בעיות וסיכונים

1. **כפילות פרופיל משתמש:**
   - יש שני עמודים שונים: `/profile` (React) ו-`/user_profile` (HTML)
   - לא ברור איזה מהם פעיל/מועדף
   - `user_profile.html` יש לו בעיות ידועות (חסרים שדות, החלוקה לא נכונה)

2. **קבצים UNTRACKED:**
   - כל עמודי ה-HTML הסטטיים לא נשמרו בגיט
   - אין היסטוריית גרסאות
   - לא ניתן לעקוב אחרי שינויים

3. **חוסר עקביות:**
   - חלק מהעמודים ב-React Router
   - חלק מהעמודים ב-Vite Middleware
   - לא ברור מתי להשתמש במה

---

## 🔧 המלצות

1. **לאחד את עמודי הפרופיל:**
   - להחליט איזה גרסה פעילה: React או HTML
   - למחוק או לשמור את הגרסה השנייה
   - לתקן את הבעיות ב-`user_profile.html` אם נשאר

2. **לשמור את כל הקבצים בגיט:**
   - להוסיף את כל הקבצים ה-UNTRACKED ל-git
   - ליצור commit לכל שינוי משמעותי

3. **לאחד את מערכת הניתוב:**
   - להחליט: React Router או Vite Middleware
   - להעביר את כל העמודים לאותה מערכת
   - לתעד את ההחלטה

4. **לתעד את המבנה:**
   - ליצור תיעוד ברור: מתי להשתמש ב-React, מתי ב-HTML
   - לתעד את כל ה-Routes והקישורים ביניהם

---

## 📝 הערות טכניות

### React Router (AppRouter.jsx):
- **Routes מוגדרים:**
  - `/` → HomePage (Protected)
  - `/profile` → ProfileView (Protected)
  - `/login` → LoginForm (Public)
  - `/register` → RegisterForm (Public)
  - `/reset-password` → PasswordResetFlow (Public)

### Vite Middleware (vite.config.js):
- **Routes מוגדרים:**
  - `/trading_accounts` → `trading_accounts.html`
  - `/user_profile` → `user_profile.html`
  - `/brokers_fees` → `brokers_fees.html`
  - `/cash_flows` → `cash_flows.html`

### Loaders דינמיים:
- `header-loader.js` - טוען `unified-header.html`
- `footer-loader.js` - טוען `footer.html`

---

**עודכן על ידי:** AI Assistant  
**תאריך:** 2026-02-04
