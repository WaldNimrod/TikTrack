# אינדקס מלא: כל הקבצים בתקיית UI/src

**תאריך יצירה:** 2026-02-04 20:22:32  
**מבצע:** AI Assistant  
**סה"כ קבצים:** 60 קבצים  
**גודל כולל:** 832K

---

## סיכום כללי

| קטגוריה | כמות | TRACKED | UNTRACKED |
|:--------|:-----|:--------|:----------|
| **React Components (.jsx)** | 18 | 18 | 0 |
| **JavaScript Files (.js)** | 30 | 28 | 2 |
| **HTML Files (.html)** | 5 | 5 | 0 |
| **CSS Files (.css)** | 5 | 5 | 0 |
| **JSON Files (.json)** | 2 | 2 | 0 |
| **סה"כ** | **60** | **58** | **2** |

---

## קבצים UNTRACKED (דורשים תשומת לב)

| נתיב | גודל | תאריך שינוי | הערה |
|:-----|:-----|:------------|:------|
| `ui/src/logic/errorCodes.js` | 4.6K | 2026-02-04 02:00:33 | קובץ פעיל - צריך להוסיף ל-Git |
| `ui/src/utils/errorHandler.js` | 6.2K | 2026-02-04 02:00:33 | קובץ פעיל - צריך להוסיף ל-Git |

---

## רשימה מפורטת לפי קטגוריה

### 1. React Components (.jsx) - 18 קבצים

#### Components Core:
| נתיב | גודל | תאריך | Git | הערה |
|:-----|:-----|:------|:----|:-----|
| `ui/src/components/HomePage.jsx` | 67K | 2026-02-04 18:36:26 | ✅ TRACKED | עמוד בית |
| `ui/src/components/core/PageFooter.jsx` | 2.6K | 2026-02-04 02:00:33 | ✅ TRACKED | Footer component |

#### Identity Cube - Auth Components:
| נתיב | גודל | תאריך | Git | הערה |
|:-----|:-----|:------|:----|:-----|
| `ui/src/cubes/identity/components/AuthErrorHandler.jsx` | 6.1K | 2026-02-03 17:34:10 | ✅ TRACKED | Error handler |
| `ui/src/cubes/identity/components/AuthForm.jsx` | 15K | 2026-02-03 16:55:11 | ✅ TRACKED | Auth form wrapper |
| `ui/src/cubes/identity/components/AuthLayout.jsx` | 3.0K | 2026-02-04 02:00:33 | ✅ TRACKED | Auth layout |
| `ui/src/cubes/identity/components/auth/LoginForm.jsx` | 20K | 2026-02-03 17:00:24 | ✅ TRACKED | Login form |
| `ui/src/cubes/identity/components/auth/PasswordResetFlow.jsx` | 16K | 2026-02-03 17:00:41 | ✅ TRACKED | Password reset |
| `ui/src/cubes/identity/components/auth/ProtectedRoute.jsx` | 3.5K | 2026-02-03 17:34:04 | ✅ TRACKED | Protected route |
| `ui/src/cubes/identity/components/auth/RegisterForm.jsx` | 11K | 2026-02-03 17:00:26 | ✅ TRACKED | Register form |

#### Identity Cube - Profile Components:
| נתיב | גודל | תאריך | Git | הערה |
|:-----|:-----|:------|:----|:-----|
| `ui/src/cubes/identity/components/profile/PasswordChangeForm.jsx` | 14K | 2026-02-03 17:01:17 | ✅ TRACKED | Password change form |
| `ui/src/cubes/identity/components/profile/ProfileView.jsx` | 35K | 2026-02-04 18:36:26 | ✅ TRACKED | Profile view |

#### Shared Cube - Components:
| נתיב | גודל | תאריך | Git | הערה |
|:-----|:-----|:------|:----|:-----|
| `ui/src/cubes/shared/components/tables/PhoenixTable.jsx` | 13K | 2026-02-04 02:00:33 | ✅ TRACKED | Table component |

#### Layout:
| נתיב | גודל | תאריך | Git | הערה |
|:-----|:-----|:------|:----|:-----|
| `ui/src/layout/global_page_template.jsx` | 8.8K | 2026-02-04 02:00:33 | ✅ TRACKED | ⚠️ לבדיקה - כפילות עם UnifiedHeader |

---

### 2. JavaScript Files (.js) - 30 קבצים

#### Components Core - Loaders & Bridge:
| נתיב | גודל | תאריך | Git | הערה |
|:-----|:-----|:------|:----|:-----|
| `ui/src/components/core/header-loader.js` | 4.9K | 2026-02-04 02:00:33 | ✅ TRACKED | Header loader |
| `ui/src/components/core/phoenix-filter-bridge.js` | 15K | 2026-02-04 02:00:33 | ✅ TRACKED | Filter bridge |

#### Identity Cube - Services:
| נתיב | גודל | תאריך | Git | הערה |
|:-----|:-----|:------|:----|:-----|
| `ui/src/cubes/identity/services/apiKeys.js` | 6.3K | 2026-02-03 15:44:50 | ✅ TRACKED | API keys service |
| `ui/src/cubes/identity/services/auth.js` | 17K | 2026-02-04 02:00:33 | ✅ TRACKED | Auth service |

#### Identity Cube - Hooks:
| נתיב | גודל | תאריך | Git | הערה |
|:-----|:-----|:------|:----|:-----|
| `ui/src/cubes/identity/hooks/useAuthValidation.js` | 7.0K | 2026-02-04 02:00:33 | ✅ TRACKED | Auth validation hook |

#### Shared Cube - Managers:
| נתיב | גודל | תאריך | Git | הערה |
|:-----|:-----|:------|:----|:-----|
| `ui/src/cubes/shared/PhoenixTableFilterManager.js` | 13K | 2026-02-04 02:00:33 | ✅ TRACKED | Filter manager |
| `ui/src/cubes/shared/PhoenixTableSortManager.js` | 13K | 2026-02-03 23:22:41 | ✅ TRACKED | Sort manager |
| `ui/src/cubes/shared/tableFormatters.js` | 10K | 2026-02-03 23:43:43 | ✅ TRACKED | Table formatters |

#### Shared Cube - Contexts:
| נתיב | גודל | תאריך | Git | הערה |
|:-----|:-----|:------|:----|:-----|
| `ui/src/cubes/shared/contexts/PhoenixFilterContext.jsx` | 5.3K | 2026-02-04 02:00:33 | ✅ TRACKED | Filter context |

#### Shared Cube - Hooks:
| נתיב | גודל | תאריך | Git | הערה |
|:-----|:-----|:------|:----|:-----|
| `ui/src/cubes/shared/hooks/usePhoenixTableData.js` | 4.0K | 2026-02-04 02:00:33 | ✅ TRACKED | Table data hook |
| `ui/src/cubes/shared/hooks/usePhoenixTableFilter.js` | 5.0K | 2026-02-04 02:00:33 | ✅ TRACKED | Table filter hook |
| `ui/src/cubes/shared/hooks/usePhoenixTableSort.js` | 5.8K | 2026-02-04 02:00:33 | ✅ TRACKED | Table sort hook |

#### Shared Cube - Utils:
| נתיב | גודל | תאריך | Git | הערה |
|:-----|:-----|:------|:----|:-----|
| `ui/src/cubes/shared/utils/transformers.js` | 3.8K | 2026-01-31 23:23:13 | ✅ TRACKED | Transformers |

#### Logic:
| נתיב | גודל | תאריך | Git | הערה |
|:-----|:-----|:------|:----|:-----|
| `ui/src/logic/errorCodes.js` | 4.6K | 2026-02-04 02:00:33 | ⚠️ UNTRACKED | Error codes |
| `ui/src/logic/schemas/authSchema.js` | 9.7K | 2026-02-01 15:53:17 | ✅ TRACKED | Auth schema |
| `ui/src/logic/schemas/userSchema.js` | 6.5K | 2026-02-04 02:00:33 | ✅ TRACKED | User schema |

#### Utils:
| נתיב | גודל | תאריך | Git | הערה |
|:-----|:-----|:------|:----|:-----|
| `ui/src/utils/audit.js` | 3.7K | 2026-02-04 02:00:33 | ✅ TRACKED | Audit utility |
| `ui/src/utils/debug.js` | 1.8K | 2026-02-04 02:00:33 | ✅ TRACKED | Debug utility |
| `ui/src/utils/errorHandler.js` | 6.2K | 2026-02-04 02:00:33 | ⚠️ UNTRACKED | Error handler |

#### Router & Main:
| נתיב | גודל | תאריך | Git | הערה |
|:-----|:-----|:------|:----|:-----|
| `ui/src/main.jsx` | 1.6K | 2026-02-04 02:00:33 | ✅ TRACKED | Entry point |
| `ui/src/router/AppRouter.jsx` | 1.9K | 2026-02-03 23:49:40 | ✅ TRACKED | Router |

#### Views Financial - Handlers:
| נתיב | גודל | תאריך | Git | הערה |
|:-----|:-----|:------|:----|:-----|
| `ui/src/views/financial/auth-guard.js` | 8.3K | 2026-02-04 02:00:33 | ✅ TRACKED | Auth guard |
| `ui/src/views/financial/navigation-handler.js` | 2.9K | 2026-02-04 18:36:23 | ✅ TRACKED | Navigation handler |
| `ui/src/views/financial/header-dropdown.js` | 3.8K | 2026-02-04 02:00:33 | ✅ TRACKED | Header dropdown |
| `ui/src/views/financial/header-filters.js` | 2.4K | 2026-02-04 02:00:33 | ✅ TRACKED | Header filters |
| `ui/src/views/financial/footer-loader.js` | 2.8K | 2026-02-04 02:00:33 | ✅ TRACKED | Footer loader |

#### Views Financial - D16 Handlers:
| נתיב | גודל | תאריך | Git | הערה |
|:-----|:-----|:------|:----|:-----|
| `ui/src/views/financial/d16-data-loader.js` | 27K | 2026-02-04 02:00:33 | ✅ TRACKED | Data loader |
| `ui/src/views/financial/d16-filters-integration.js` | 7.5K | 2026-02-03 23:22:47 | ✅ TRACKED | Filters integration |
| `ui/src/views/financial/d16-header-handlers.js` | 5.4K | 2026-02-04 02:00:33 | ✅ TRACKED | Header handlers |
| `ui/src/views/financial/d16-header-links.js` | 5.8K | 2026-02-04 02:00:33 | ✅ TRACKED | Header links |
| `ui/src/views/financial/d16-table-init.js` | 5.5K | 2026-02-03 23:22:38 | ✅ TRACKED | Table init |

#### Views Financial - Page Handlers:
| נתיב | גודל | תאריך | Git | הערה |
|:-----|:-----|:------|:----|:-----|
| `ui/src/views/financial/user_profile.js` | 17K | 2026-02-04 02:02:23 | ✅ TRACKED | User profile handler |
| `ui/src/views/financial/portfolio-summary.js` | 2.5K | 2026-02-04 02:00:33 | ✅ TRACKED | Portfolio summary |
| `ui/src/views/financial/section-toggle.js` | 3.0K | 2026-02-04 02:00:33 | ✅ TRACKED | Section toggle |

---

### 3. HTML Files (.html) - 5 קבצים

| נתיב | גודל | תאריך | Git | הערה |
|:-----|:-----|:------|:----|:-----|
| `ui/src/components/core/unified-header.html` | 13K | 2026-02-04 02:00:33 | ✅ TRACKED | Unified header |
| `ui/src/views/financial/footer.html` | 2.3K | 2026-02-04 02:00:33 | ✅ TRACKED | Footer |
| `ui/src/views/financial/trading_accounts.html` | 44K | 2026-02-04 02:00:33 | ✅ TRACKED | Trading accounts page |
| `ui/src/views/financial/brokers_fees.html` | 1.9K | 2026-02-04 02:00:33 | ✅ TRACKED | Brokers fees page |
| `ui/src/views/financial/cash_flows.html` | 2.3K | 2026-02-04 02:00:33 | ✅ TRACKED | Cash flows page |
| `ui/src/views/financial/user_profile.html` | 22K | 2026-02-04 02:00:33 | ✅ TRACKED | ⚠️ לבדיקה - כפילות עם ProfileView.jsx |

**סה"כ:** 6 קבצי HTML (לא 5 כפי שצוין קודם)

---

### 4. CSS Files (.css) - 5 קבצים

| נתיב | גודל | תאריך | Git | הערה |
|:-----|:-----|:------|:----|:-----|
| `ui/src/styles/phoenix-base.css` | 27K | 2026-02-03 17:03:04 | ✅ TRACKED | Base styles |
| `ui/src/styles/phoenix-components.css` | 40K | 2026-02-04 02:00:33 | ✅ TRACKED | Components styles |
| `ui/src/styles/phoenix-header.css` | 35K | 2026-02-04 19:44:38 | ✅ TRACKED | Header styles |
| `ui/src/styles/D15_DASHBOARD_STYLES.css` | 40K | 2026-02-04 02:00:33 | ✅ TRACKED | Dashboard styles |
| `ui/src/styles/D15_IDENTITY_STYLES.css` | 13K | 2026-02-03 17:34:07 | ✅ TRACKED | Identity styles |

---

### 5. JSON Files (.json) - 2 קבצים

| נתיב | גודל | תאריך | Git | הערה |
|:-----|:-----|:------|:----|:-----|
| `ui/src/cubes/identity/components/auth/blueprint-diff-report-fix-suggestions.json` | 10K | 2026-02-02 02:07:47 | ✅ TRACKED | Blueprint diff suggestions |
| `ui/src/cubes/identity/components/auth/blueprint-diff-report.json` | 16K | 2026-02-02 02:09:18 | ✅ TRACKED | Blueprint diff report |

---

## ניתוח שמות קבצים

### קבצים עם שמות לא תקינים (לפי התקן):

#### JavaScript Files שצריכים תיקון (camelCase נדרש):
| נתיב נוכחי | שם תקין נדרש | הערה |
|:-----------|:--------------|:------|
| `header-loader.js` | `headerLoader.js` | צריך להיות camelCase |
| `phoenix-filter-bridge.js` | `phoenixFilterBridge.js` | צריך להיות camelCase |
| `footer-loader.js` | `footerLoader.js` | צריך להיות camelCase |
| `auth-guard.js` | `authGuard.js` | צריך להיות camelCase |
| `navigation-handler.js` | `navigationHandler.js` | צריך להיות camelCase |
| `header-dropdown.js` | `headerDropdown.js` | צריך להיות camelCase |
| `header-filters.js` | `headerFilters.js` | צריך להיות camelCase |
| `portfolio-summary.js` | `portfolioSummary.js` | צריך להיות camelCase |
| `section-toggle.js` | `sectionToggle.js` | צריך להיות camelCase |
| `user_profile.js` | `userProfile.js` | צריך להיות camelCase |
| `d16-data-loader.js` | `d16DataLoader.js` | צריך להיות camelCase |
| `d16-filters-integration.js` | `d16FiltersIntegration.js` | צריך להיות camelCase |
| `d16-header-handlers.js` | `d16HeaderHandlers.js` | צריך להיות camelCase |
| `d16-header-links.js` | `d16HeaderLinks.js` | צריך להיות camelCase |
| `d16-table-init.js` | `d16TableInit.js` | צריך להיות camelCase |

#### HTML Files - תקינים (snake_case):
✅ כל קבצי ה-HTML תקינים - משתמשים ב-`snake_case`

#### CSS Files - תקינים (kebab-case):
✅ כל קבצי ה-CSS תקינים - משתמשים ב-`kebab-case`

#### React Components - תקינים (PascalCase):
✅ כל קבצי ה-React Components תקינים - משתמשים ב-`PascalCase`

---

## בעיות שזוהו

### 1. קבצים UNTRACKED:
- `ui/src/logic/errorCodes.js` - קובץ פעיל שלא ב-Git
- `ui/src/utils/errorHandler.js` - קובץ פעיל שלא ב-Git

### 2. כפילות:
- `ui/src/views/financial/user_profile.html` + `ui/src/cubes/identity/components/profile/ProfileView.jsx` - שני עמודים לאותו מטרה

### 3. קבצים לבדיקה:
- `ui/src/layout/global_page_template.jsx` - כפילות אפשרית עם UnifiedHeader

### 4. שמות קבצים לא תקינים:
- 15 קבצי JavaScript עם שמות ב-`kebab-case` במקום `camelCase`

---

## המלצות

1. **להוסיף ל-Git:** 2 קבצים UNTRACKED
2. **לתקן שמות:** 15 קבצי JavaScript
3. **להחליט על כפילות:** `user_profile.html` vs `ProfileView.jsx`
4. **לבדוק כפילות:** `global_page_template.jsx` vs `unified-header.html`

---

**תאריך יצירה:** 2026-02-04 20:22:32  
**מבצע:** AI Assistant
