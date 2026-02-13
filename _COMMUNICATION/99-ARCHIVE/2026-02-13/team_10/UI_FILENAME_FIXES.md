# רשימת תיקוני שמות קבצים

**תאריך:** 2026-02-04 20:22:32  
**מבצע:** AI Assistant  
**מטרה:** תיקון שמות קבצים בהתאם לתקן (camelCase ל-JavaScript files)

---

## תקן שמות קבצים

- **React Components:** `PascalCase.jsx` ✅ (כל הקבצים תקינים)
- **HTML Files:** `snake_case.html` ✅ (כל הקבצים תקינים)
- **JavaScript Files:** `camelCase.js` ⚠️ (15 קבצים דורשים תיקון)
- **CSS Files:** `kebab-case.css` ✅ (כל הקבצים תקינים)

---

## רשימת תיקונים נדרשים

### קבצים ב-`components/core/`:

| נתיב נוכחי | שם תקין | קבצים שמתייחסים |
|:-----------|:--------|:----------------|
| `header-loader.js` | `headerLoader.js` | index.html, כל HTML files, header-loader.js עצמו |
| `phoenix-filter-bridge.js` | `phoenixFilterBridge.js` | index.html, כל HTML files, header-loader.js |

### קבצים ב-`views/financial/`:

| נתיב נוכחי | שם תקין | קבצים שמתייחסים |
|:-----------|:--------|:----------------|
| `footer-loader.js` | `footerLoader.js` | כל HTML files, footer.html |
| `auth-guard.js` | `authGuard.js` | כל HTML files, test-auth-guard.html |
| `navigation-handler.js` | `navigationHandler.js` | כל HTML files, header-loader.js |
| `header-dropdown.js` | `headerDropdown.js` | כל HTML files, header-loader.js, unified-header.html |
| `header-filters.js` | `headerFilters.js` | כל HTML files, header-loader.js, unified-header.html |
| `portfolio-summary.js` | `portfolioSummary.js` | (לבדוק שימושים) |
| `section-toggle.js` | `sectionToggle.js` | (לבדוק שימושים) |
| `user_profile.js` | `userProfile.js` | user_profile.html |
| `d16-data-loader.js` | `d16DataLoader.js` | (לבדוק שימושים) |
| `d16-filters-integration.js` | `d16FiltersIntegration.js` | (לבדוק שימושים) |
| `d16-header-handlers.js` | `d16HeaderHandlers.js` | (לבדוק שימושים) |
| `d16-header-links.js` | `d16HeaderLinks.js` | (לבדוק שימושים) |
| `d16-table-init.js` | `d16TableInit.js` | (לבדוק שימושים) |

---

## סדר ביצוע

1. **שינוי שמות קבצים** (mv)
2. **עדכון references ב-HTML files**
3. **עדכון references ב-JavaScript files**
4. **עדכון references ב-Comments**

---

## קבצים לעדכון

### HTML Files (6 קבצים):
- `ui/index.html`
- `ui/src/views/financial/trading_accounts.html`
- `ui/src/views/financial/brokers_fees.html`
- `ui/src/views/financial/cash_flows.html`
- `ui/src/views/financial/user_profile.html`
- `ui/test-auth-guard.html`

### JavaScript Files (2 קבצים):
- `ui/src/components/core/header-loader.js` (אחרי שינוי שם)
- `ui/src/views/financial/navigation-handler.js`

### Comments (3 קבצים):
- `ui/src/components/HomePage.jsx`
- `ui/src/cubes/identity/components/profile/ProfileView.jsx`
- `ui/src/components/core/unified-header.html`

---

**תאריך:** 2026-02-04 20:22:32  
**מבצע:** AI Assistant
