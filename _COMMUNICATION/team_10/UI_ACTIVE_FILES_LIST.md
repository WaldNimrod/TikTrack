# רשימת קבצים פעילים - תקיית UI

**תאריך:** 2026-02-04 20:22:32  
**מבצע:** AI Assistant  
**סטטוס:** ✅ רשימה מאושרת

---

## קבצים פעילים (להשאיר)

### 1. Header & Footer (6 קבצים)

| נתיב | סוג | גודל | Git | הערה |
|:-----|:----|:-----|:----|:-----|
| `ui/src/components/core/unified-header.html` | HTML | 13K | ✅ | Header template |
| `ui/src/components/core/header-loader.js` | JS | 4.9K | ✅ | Header loader |
| `ui/src/components/core/phoenix-filter-bridge.js` | JS | 15K | ✅ | Filter bridge |
| `ui/src/components/core/PageFooter.jsx` | JSX | 2.6K | ✅ | Footer component |
| `ui/src/views/financial/footer.html` | HTML | 2.3K | ✅ | Footer template |
| `ui/src/views/financial/footer-loader.js` | JS | 2.8K | ✅ | Footer loader |

---

### 2. עמודי React - Identity (11 קבצים)

#### Auth Components:
| נתיב | סוג | גודל | Git | Route |
|:-----|:----|:-----|:----|:------|
| `ui/src/cubes/identity/components/auth/LoginForm.jsx` | JSX | 20K | ✅ | `/login` |
| `ui/src/cubes/identity/components/auth/RegisterForm.jsx` | JSX | 11K | ✅ | `/register` |
| `ui/src/cubes/identity/components/auth/PasswordResetFlow.jsx` | JSX | 16K | ✅ | `/reset-password` |
| `ui/src/cubes/identity/components/auth/ProtectedRoute.jsx` | JSX | 3.5K | ✅ | Route guard |
| `ui/src/cubes/identity/components/AuthLayout.jsx` | JSX | 3.0K | ✅ | Auth layout |
| `ui/src/cubes/identity/components/AuthErrorHandler.jsx` | JSX | 6.1K | ✅ | Error handler |
| `ui/src/cubes/identity/components/AuthForm.jsx` | JSX | 15K | ✅ | Form wrapper |

#### Profile Components:
| נתיב | סוג | גודל | Git | Route |
|:-----|:----|:-----|:----|:------|
| `ui/src/cubes/identity/components/profile/ProfileView.jsx` | JSX | 35K | ✅ | `/profile` |
| `ui/src/cubes/identity/components/profile/PasswordChangeForm.jsx` | JSX | 14K | ✅ | Sub-component |

#### Services & Hooks:
| נתיב | סוג | גודל | Git | הערה |
|:-----|:----|:-----|:----|:-----|
| `ui/src/cubes/identity/services/auth.js` | JS | 17K | ✅ | Auth service |
| `ui/src/cubes/identity/services/apiKeys.js` | JS | 6.3K | ✅ | API keys service |
| `ui/src/cubes/identity/hooks/useAuthValidation.js` | JS | 7.0K | ✅ | Validation hook |

---

### 3. עמודי HTML - Financial (4 קבצים)

| נתיב | סוג | גודל | Git | Route | הערה |
|:-----|:----|:-----|:----|:------|:-----|
| `ui/src/views/financial/trading_accounts.html` | HTML | 44K | ✅ | `/trading_accounts` | ✅ פעיל |
| `ui/src/views/financial/brokers_fees.html` | HTML | 1.9K | ✅ | `/brokers_fees` | ✅ פעיל |
| `ui/src/views/financial/cash_flows.html` | HTML | 2.3K | ✅ | `/cash_flows` | ✅ פעיל |
| `ui/src/views/financial/user_profile.html` | HTML | 22K | ✅ | `/user_profile` | ⚠️ כפילות עם ProfileView.jsx |

---

### 4. JavaScript Handlers - Financial (13 קבצים)

#### Core Handlers:
| נתיב | סוג | גודל | Git | הערה |
|:-----|:----|:-----|:----|:-----|
| `ui/src/views/financial/auth-guard.js` | JS | 8.3K | ✅ | Auth guard |
| `ui/src/views/financial/navigation-handler.js` | JS | 2.9K | ✅ | Navigation |
| `ui/src/views/financial/header-dropdown.js` | JS | 3.8K | ✅ | Dropdowns |
| `ui/src/views/financial/header-filters.js` | JS | 2.4K | ✅ | Filters |

#### D16 Handlers:
| נתיב | סוג | גודל | Git | הערה |
|:-----|:----|:-----|:----|:-----|
| `ui/src/views/financial/d16-data-loader.js` | JS | 27K | ✅ | Data loader |
| `ui/src/views/financial/d16-filters-integration.js` | JS | 7.5K | ✅ | Filters integration |
| `ui/src/views/financial/d16-header-handlers.js` | JS | 5.4K | ✅ | Header handlers |
| `ui/src/views/financial/d16-header-links.js` | JS | 5.8K | ✅ | Header links |
| `ui/src/views/financial/d16-table-init.js` | JS | 5.5K | ✅ | Table init |

#### Page Handlers:
| נתיב | סוג | גודל | Git | הערה |
|:-----|:----|:-----|:----|:-----|
| `ui/src/views/financial/user_profile.js` | JS | 17K | ✅ | User profile handler |
| `ui/src/views/financial/portfolio-summary.js` | JS | 2.5K | ✅ | Portfolio summary |
| `ui/src/views/financial/section-toggle.js` | JS | 3.0K | ✅ | Section toggle |

---

### 5. Shared Components (10 קבצים)

#### Components:
| נתיב | סוג | גודל | Git | הערה |
|:-----|:----|:-----|:----|:-----|
| `ui/src/cubes/shared/components/tables/PhoenixTable.jsx` | JSX | 13K | ✅ | Table component |

#### Contexts:
| נתיב | סוג | גודל | Git | הערה |
|:-----|:----|:-----|:----|:-----|
| `ui/src/cubes/shared/contexts/PhoenixFilterContext.jsx` | JSX | 5.3K | ✅ | Filter context |

#### Hooks:
| נתיב | סוג | גודל | Git | הערה |
|:-----|:----|:-----|:----|:-----|
| `ui/src/cubes/shared/hooks/usePhoenixTableData.js` | JS | 4.0K | ✅ | Table data hook |
| `ui/src/cubes/shared/hooks/usePhoenixTableFilter.js` | JS | 5.0K | ✅ | Table filter hook |
| `ui/src/cubes/shared/hooks/usePhoenixTableSort.js` | JS | 5.8K | ✅ | Table sort hook |

#### Managers & Utils:
| נתיב | סוג | גודל | Git | הערה |
|:-----|:----|:-----|:----|:-----|
| `ui/src/cubes/shared/PhoenixTableFilterManager.js` | JS | 13K | ✅ | Filter manager |
| `ui/src/cubes/shared/PhoenixTableSortManager.js` | JS | 13K | ✅ | Sort manager |
| `ui/src/cubes/shared/tableFormatters.js` | JS | 10K | ✅ | Table formatters |
| `ui/src/cubes/shared/utils/transformers.js` | JS | 3.8K | ✅ | Transformers |

---

### 6. Styles (5 קבצים)

| נתיב | סוג | גודל | Git | הערה |
|:-----|:----|:-----|:----|:-----|
| `ui/src/styles/phoenix-base.css` | CSS | 27K | ✅ | Base styles |
| `ui/src/styles/phoenix-components.css` | CSS | 40K | ✅ | Components styles |
| `ui/src/styles/phoenix-header.css` | CSS | 35K | ✅ | Header styles |
| `ui/src/styles/D15_DASHBOARD_STYLES.css` | CSS | 40K | ✅ | Dashboard styles |
| `ui/src/styles/D15_IDENTITY_STYLES.css` | CSS | 13K | ✅ | Identity styles |

---

### 7. Core Infrastructure (7 קבצים)

#### Entry Points:
| נתיב | סוג | גודל | Git | הערה |
|:-----|:----|:-----|:----|:-----|
| `ui/src/main.jsx` | JSX | 1.6K | ✅ | Entry point |
| `ui/src/router/AppRouter.jsx` | JSX | 1.9K | ✅ | Router |

#### Utils:
| נתיב | סוג | גודל | Git | הערה |
|:-----|:----|:-----|:----|:-----|
| `ui/src/utils/audit.js` | JS | 3.7K | ✅ | Audit utility |
| `ui/src/utils/debug.js` | JS | 1.8K | ✅ | Debug utility |
| `ui/src/utils/errorHandler.js` | JS | 6.2K | ⚠️ | Error handler - UNTRACKED |

#### Logic:
| נתיב | סוג | גודל | Git | הערה |
|:-----|:----|:-----|:----|:-----|
| `ui/src/logic/errorCodes.js` | JS | 4.6K | ⚠️ | Error codes - UNTRACKED |
| `ui/src/logic/schemas/authSchema.js` | JS | 9.7K | ✅ | Auth schema |
| `ui/src/logic/schemas/userSchema.js` | JS | 6.5K | ✅ | User schema |

---

### 8. Pages (2 קבצים)

| נתיב | סוג | גודל | Git | Route | הערה |
|:-----|:----|:-----|:----|:------|:-----|
| `ui/src/components/HomePage.jsx` | JSX | 67K | ✅ | `/` | Home page |

---

## סיכום קבצים פעילים

| קטגוריה | כמות | UNTRACKED |
|:--------|:-----|:----------|
| Header & Footer | 6 | 0 |
| React - Identity | 11 | 0 |
| HTML - Financial | 4 | 0 |
| JS Handlers - Financial | 13 | 0 |
| Shared Components | 10 | 0 |
| Styles | 5 | 0 |
| Core Infrastructure | 7 | 2 |
| Pages | 1 | 0 |
| **סה"כ** | **57** | **2** |

---

## קבצים שצריך להוסיף ל-Git

1. `ui/src/utils/errorHandler.js` - קובץ פעיל
2. `ui/src/logic/errorCodes.js` - קובץ פעיל

---

## הערות

- כל הקבצים הפעילים מזוהים
- 2 קבצים פעילים לא ב-Git - צריך להוסיף
- `user_profile.html` כפילות עם `ProfileView.jsx` - צריך להחליט

---

**תאריך:** 2026-02-04 20:22:32  
**מבצע:** AI Assistant
