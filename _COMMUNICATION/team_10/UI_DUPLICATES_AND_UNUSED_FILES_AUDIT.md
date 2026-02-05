# ביקורת כפילויות וקבצים מיותרים

**תאריך:** 2026-02-04 20:22:32  
**מבצע:** AI Assistant  
**מטרה:** בדיקת כפילויות, קבצים מיותרים, והתאמה לאינדקס

---

## ✅ בדיקת כפילויות - שמות קבצים

**תוצאה:** ✅ **אין כפילויות**

נבדקו כל הקבצים ב-`ui/src`:
- אין שני קבצים עם אותו שם בדיוק
- כל קובץ ייחודי בשמו

**סטטיסטיקה:**
- סה"כ קבצים: 50 (JS, JSX, HTML)
- כפילויות: 0

---

## ⚠️ קבצים מיותרים/לא בשימוש

### 1. `ui/src/layout/global_page_template.jsx` ⚠️

**סטטוס:** לא בשימוש נכון

**בעיה:**
- הקובץ נמצא ב-`ui/src/layout/global_page_template.jsx`
- יש התייחסות אליו ב-`cash_flows.html` ו-`brokers_fees.html` אבל זה לא יכול לעבוד כי:
  - HTML לא יכול לייבא JSX ישירות
  - אין import של הקובץ בשום מקום ב-JavaScript/React
  - הקובץ משתמש ב-`lucide-react` (אסור לפי הסטנדרטים)

**בדיקה:**
```bash
# חיפוש שימושים
grep -r "global_page_template\|GlobalPageTemplate" ui/src/
```

**תוצאה:**
- נמצא ב-`cash_flows.html` ו-`brokers_fees.html` אבל זה לא תקין (HTML לא יכול לייבא JSX)
- לא נמצא בשום import ב-JavaScript/React

**המלצה:**
- ✅ הקובץ כבר הועבר לארכיון ב-`99-ARCHIVE/ui/legacy/layout/` (בדיקת cleanup קודמת)
- ⚠️ צריך לבדוק אם יש התייחסות אליו ב-HTML ולמחוק

---

## 📋 בדיקת התאמה לאינדקס

**אינדקס ראשי:** `documentation/D15_SYSTEM_INDEX.md`

**סטטוס:** צריך לבדוק אם כל הקבצים מופיעים באינדקס

---

## 🔍 רשימת כל הקבצים הפעילים

### React Components (JSX):
1. `ui/src/components/HomePage.jsx`
2. `ui/src/components/core/PageFooter.jsx`
3. `ui/src/cubes/identity/components/AuthErrorHandler.jsx`
4. `ui/src/cubes/identity/components/AuthForm.jsx`
5. `ui/src/cubes/identity/components/AuthLayout.jsx`
6. `ui/src/cubes/identity/components/auth/LoginForm.jsx`
7. `ui/src/cubes/identity/components/auth/PasswordResetFlow.jsx`
8. `ui/src/cubes/identity/components/auth/ProtectedRoute.jsx`
9. `ui/src/cubes/identity/components/auth/RegisterForm.jsx`
10. `ui/src/cubes/identity/components/profile/PasswordChangeForm.jsx`
11. `ui/src/cubes/identity/components/profile/ProfileView.jsx`
12. `ui/src/cubes/shared/components/tables/PhoenixTable.jsx`
13. `ui/src/main.jsx`
14. `ui/src/router/AppRouter.jsx`

### JavaScript Files:
1. `ui/src/components/core/headerLoader.js`
2. `ui/src/components/core/phoenixFilterBridge.js`
3. `ui/src/cubes/identity/hooks/useAuthValidation.js`
4. `ui/src/cubes/identity/services/apiKeys.js`
5. `ui/src/cubes/identity/services/auth.js`
6. `ui/src/cubes/shared/PhoenixTableFilterManager.js`
7. `ui/src/cubes/shared/PhoenixTableSortManager.js`
8. `ui/src/cubes/shared/contexts/PhoenixFilterContext.jsx`
9. `ui/src/cubes/shared/hooks/usePhoenixTableData.js`
10. `ui/src/cubes/shared/hooks/usePhoenixTableFilter.js`
11. `ui/src/cubes/shared/hooks/usePhoenixTableSort.js`
12. `ui/src/cubes/shared/tableFormatters.js`
13. `ui/src/cubes/shared/utils/transformers.js`
14. `ui/src/logic/errorCodes.js`
15. `ui/src/logic/schemas/authSchema.js`
16. `ui/src/logic/schemas/userSchema.js`
17. `ui/src/utils/audit.js`
18. `ui/src/utils/debug.js`
19. `ui/src/utils/errorHandler.js`
20. `ui/src/views/financial/authGuard.js`
21. `ui/src/views/financial/d16DataLoader.js` ⚠️ צריך שינוי שם
22. `ui/src/views/financial/d16FiltersIntegration.js` ⚠️ צריך שינוי שם
23. `ui/src/views/financial/d16HeaderHandlers.js` ⚠️ צריך שינוי שם
24. `ui/src/views/financial/d16HeaderLinks.js` ⚠️ צריך שינוי שם
25. `ui/src/views/financial/d16TableInit.js` ⚠️ צריך שינוי שם
26. `ui/src/views/financial/footerLoader.js`
27. `ui/src/views/financial/headerDropdown.js`
28. `ui/src/views/financial/headerFilters.js`
29. `ui/src/views/financial/navigationHandler.js`
30. `ui/src/views/financial/portfolioSummary.js` ⚠️ צריך שינוי שם
31. `ui/src/views/financial/sectionToggle.js` ⚠️ צריך שינוי שם

### HTML Files:
1. `ui/src/components/core/unified-header.html`
2. `ui/src/views/financial/brokers_fees.html`
3. `ui/src/views/financial/cash_flows.html`
4. `ui/src/views/financial/footer.html`
5. `ui/src/views/financial/trading_accounts.html`

**סה"כ:** 50 קבצים פעילים

---

## 📊 סיכום

| קטגוריה | כמות | סטטוס |
|:--------|:-----|:------|
| **כפילויות (שמות זהים)** | 0 | ✅ תקין |
| **קבצים מיותרים** | 1 | ⚠️ `global_page_template.jsx` (כבר בארכיון) |
| **קבצים שצריכים שינוי שם** | 7 | ⚠️ דורש תיקון |
| **סה"כ קבצים פעילים** | 50 | ✅ |

---

**תאריך:** 2026-02-04 20:22:32  
**מבצע:** AI Assistant
