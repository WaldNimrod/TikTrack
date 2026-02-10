# 🧪 אינדקס בדיקות QA - Team 50

**id:** `TEAM_50_QA_TEST_INDEX`  
**owner:** Team 50 (QA & Fidelity)  
**status:** 🔒 **SSOT - ACTIVE**  
**supersedes:** None (Master document)  
**last_updated:** 2026-02-07 (עדכון עם נוהל QA מחייב מצוות 90 - Automation-First + E2E חובה)  
**version:** v1.2  
**⚠️ Note:** מסמך זה מכיל הפניות לקבצי תקשורת (`_COMMUNICATION`) לצורכי התייחסות בלבד. קבצי התקשורת אינם חלק מה-SSOT.

---

**מיקום:** `documentation/09-GOVERNANCE/standards/`  
**סטטוס:** ✅ **MAINTAINED**

---

## 📋 תקציר

אינדקס זה מספק סקירה מפורטת ומסודרת של כל הבדיקות, תרחישי הבדיקה, ותשתית הבדיקות של Team 50. האינדקס מאפשר תחזוקה וניקיון תקיות בצורה מרוכזת.

---

## 📂 מבנה תיקיות בדיקות

```
tests/
├── selenium-config.js          # הגדרות Selenium
├── package.json                # תלויות בדיקות
├── README.md                   # תיעוד בדיקות
├── run-all.js                  # Test runner
├── auth-flow.test.js           # בדיקות Authentication Flow
├── user-management.test.js     # בדיקות User Management Flow
├── api-keys.test.js            # בדיקות API Keys Management Flow
├── error-handling.test.js      # בדיקות Error Handling & Security
├── password-change.test.js     # בדיקות Password Change Flow
├── scenarios/                  # תרחישי בדיקה מפורטים
│   └── auth_scenarios.md
└── sanity/                     # Sanity Checklists
    └── phase1_sanity_checklist.md
```

---

## 🧪 קטגוריות בדיקות

### 1. Authentication Flow (Task 50.2.1)

**קובץ בדיקות:** `tests/auth-flow.test.js`  
**תרחישים:** `tests/scenarios/auth_scenarios.md`  
**דוח QA:** `documentation/05-REPORTS/artifacts_SESSION_01/TEAM_50_TASK_50.2.1_AUTHENTICATION_FLOW_INTEGRATION.md`

**תרחישי בדיקה:**
- ✅ Registration - Successful
- ✅ Registration - Validation Errors
- ✅ Registration - Duplicate User
- ✅ Login - Successful
- ✅ Login - Invalid Credentials
- ✅ Login - Token Refresh
- ✅ Logout - Successful
- ✅ Password Reset - Request (EMAIL)
- ✅ Password Reset - Request (SMS)
- ✅ Password Reset - Verify (EMAIL)
- ✅ Password Reset - Verify (SMS)
- ✅ Phone Verification - Request
- ✅ Phone Verification - Verify
- ✅ Phone Verification - Invalid Code

**סה"כ תרחישים:** 14

---

### 2. User Management Flow (Task 50.2.2)

**קובץ בדיקות:** `tests/user-management.test.js`  
**דוח QA:** `documentation/05-REPORTS/artifacts_SESSION_01/TEAM_50_TASK_50.2.2_USER_MANAGEMENT_FLOW_INTEGRATION.md`

**תרחישי בדיקה:**
- ✅ Get Current User - Successful
- ✅ Get Current User - Token Expiration
- ✅ Get Current User - Invalid Token
- ✅ Update User Profile - Successful
- ✅ Update User Profile - Validation Errors
- ✅ Update User Profile - Unauthorized Access
- ✅ Password Strength Validation

**סה"כ תרחישים:** 7

---

### 2.5. Password Change Flow (QA Protocol)

**קובץ בדיקות:** `tests/password-change.test.js`  
**דוח QA:** `documentation/05-REPORTS/artifacts_SESSION_01/TEAM_50_PASSWORD_CHANGE_QA_RESULTS.md`

**תרחישי בדיקה:**
- ✅ Valid Password Change
- ✅ Invalid Old Password (401)
- ✅ Rate Limiting (5/15min)
- ✅ Unauthorized Access
- ✅ Expired Token
- ⚠️ Eye Icon Display (Missing)
- ⚠️ Eye Icon Functionality (Cannot Verify)
- ✅ Form Structure (LEGO)
- ✅ Audit Trail (Debug Mode)
- ✅ Integration Testing
- ✅ Transformation Layer (snake_case)

**סה"כ תרחישים:** 11 (9 verified, 2 need Eye icon)

---

### 3. API Keys Management Flow (Task 50.2.3)

**קובץ בדיקות:** `tests/api-keys.test.js`  
**דוח QA:** `documentation/05-REPORTS/artifacts_SESSION_01/TEAM_50_TASK_50.2.3_API_KEYS_FLOW_INTEGRATION.md`

**תרחישי בדיקה:**
- ✅ Create API Key - Successful
- ✅ Create API Key - Validation Errors
- ✅ Create API Key - Encryption Verification
- ✅ List API Keys - Successful
- ✅ List API Keys - Empty List
- ✅ List API Keys - Unauthorized Access
- ✅ Update API Key - Successful
- ✅ Update API Key - Invalid ID
- ✅ Verify API Key - Successful
- ✅ Verify API Key - Invalid Provider
- ✅ Delete API Key - Successful
- ✅ Delete API Key - Soft Delete Verification

**סה"כ תרחישים:** 12

---

### 4. Error Handling & Security (Task 50.2.4)

**קובץ בדיקות:** `tests/error-handling.test.js`  
**דוח QA:** `documentation/05-REPORTS/artifacts_SESSION_01/TEAM_50_TASK_50.2.4_ERROR_HANDLING_SECURITY_INTEGRATION.md`

**תרחישי בדיקה:**
- ✅ Network Error - Backend Offline
- ✅ Network Error - Timeout
- ✅ Network Error - CORS
- ✅ API Error - 400 Bad Request
- ✅ API Error - 401 Unauthorized
- ✅ API Error - 404 Not Found
- ✅ API Error - 500 Server Error
- ✅ Security - Token Expiration → Auto Refresh
- ✅ Security - Refresh Token Rotation
- ✅ Security - Token Tampering
- ✅ Security - API Key Masking

**סה"כ תרחישים:** 11

---

### 5. Validation Comprehensive Testing (P0 MANDATORY)

**קובץ בדיקות:** `tests/validation-comprehensive.test.js`  
**דוח QA:** `documentation/08-REPORTS/artifacts_SESSION_01/TEAM_50_VALIDATION_COMPREHENSIVE_TESTING.md`  
**משימה:** `_COMMUNICATION/team_10/TEAM_10_TO_TEAM_50_VALIDATION_COMPREHENSIVE_TESTING.md` ⚠️ **NON-SSOT - Communication only**

**תרחישי בדיקה:**

#### LoginForm Validation:
- ⏸️ Empty usernameOrEmail field (שדה חובה)
- ⏸️ Empty password field (שדה חובה)
- ⏸️ Field-level validation on blur
- ⏸️ BEM error classes (auth-form__input--error)
- ⏸️ ARIA attributes (aria-invalid, aria-describedby)
- ⏸️ Server-side: 401 Invalid Credentials
- ⏸️ Server-side: 400 Validation Error
- ⏸️ Error code translation (AUTH_INVALID_CREDENTIALS → Hebrew)

#### RegisterForm Validation:
- ⏸️ Empty username (שדה חובה)
- ⏸️ Username too short (< 3 characters)
- ⏸️ Invalid email format (אימייל לא תקין)
- ⏸️ Password too short (< 8 characters)
- ⏸️ Password mismatch (סיסמאות לא תואמות)
- ⏸️ Invalid phone format (E.164)
- ⏸️ Server-side: 400 Duplicate User (USER_ALREADY_EXISTS)

#### Transformation Layer:
- ⏸️ Payload format (camelCase → snake_case)
- ⏸️ Response format (snake_case → camelCase)

#### PhoenixSchema:
- ⏸️ Centralized validation usage
- ⏸️ Validation messages match schema

#### Error Code Translation:
- ⏸️ AUTH_INVALID_CREDENTIALS → Hebrew

**סה"כ תרחישים:** 20+

---

### 6. Frontend Routing & HTML Pages Testing (Team 30)

**קטגוריה:** בדיקות Routing ו-HTML Pages  
**אחריות:** Team 30 (Frontend Execution)  
**תאריך יצירה:** 2026-02-03

#### 6.1 Trading Accounts Routing Test

**קובץ:** `tests/trading-accounts-routing.test.js`  
**סוג:** בדיקת Selenium אוטומטית  
**תפקיד:** בודק ש-routing של עמודים HTML עובד נכון

**תרחישי בדיקה:**
- ✅ Trading Accounts Route Serves HTML - בודק שהנתיב `/trading_accounts` משרת קובץ HTML
- ✅ Trading Accounts with Debug Mode - בודק ש-Debug Mode עובד עם `?debug=true`
- ✅ Trading Accounts without Authentication - בודק ש-redirect ל-login מתבצע נכון

**בדיקות שבוצעות:**
- בדיקת טעינת קובץ HTML (לא React Router redirect)
- בדיקת Auth Guard execution
- בדיקת Debug Mode functionality
- בדיקת Authentication redirect

**שימוש:**
```bash
cd tests
npm install
npm run test:routing
```

**תיעוד:**
- **דוח:** `_COMMUNICATION/team_30/TEAM_30_TO_TEAM_10_SELENIUM_TEST_ADDED.md` ⚠️ **NON-SSOT - Communication only**

**סטטוס:** ✅ **ACTIVE - READY FOR USE**

---

### 7. Phase 2 Runtime Testing (Phase 2 Financial Core)

**קובץ בדיקות:** `tests/phase2-runtime.test.js`  
**סוג:** בדיקת Runtime אוטומטית (HTTP requests)  
**תפקיד:** בודק טעינת עמודים ו-API endpoints עבור Phase 2 Financial Core

**תרחישי בדיקה:**
- ✅ Login API - Successful authentication
- ✅ D16 - Trading Accounts: Page loads (HTTP 200)
- ✅ D18 - Brokers Fees: Page loads (HTTP 200)
- ✅ D21 - Cash Flows: Page loads (HTTP 200)
- ✅ D16 API: `/api/v1/trading_accounts` - Success (200)
- ✅ D18 API: `/api/v1/brokers_fees` - Success (200)
- ✅ D21 API: `/api/v1/cash_flows` - Success (200)
- ✅ CSS Loading: phoenix-base.css referenced

**בדיקות שבוצעות:**
- בדיקת טעינת קובץ HTML (HTTP 200)
- בדיקת CSS loading order (phoenix-base.css)
- בדיקת API endpoints עם authentication
- בדיקת Infrastructure (Backend + Frontend servers)

**שימוש:**
```bash
cd tests
node phase2-runtime.test.js
```

**תיעוד:**
- **דוח:** `_COMMUNICATION/team_50/TEAM_50_PHASE_2_QA_COMPLETE.md` ⚠️ **NON-SSOT - Communication only**

**סטטוס:** ✅ **ACTIVE - READY FOR USE**

---

### 8. Phase 2 E2E Selenium Tests (SOP-010 Compliance)

**קובץ בדיקות:** `tests/phase2-e2e-selenium.test.js`  
**סוג:** בדיקת E2E אוטומטית (Selenium/Headless)  
**תפקיד:** סימולציה טכנית מלאה - SOP-010 Compliance

**SOP-010 Requirements:**
- ✅ Selenium/Headless להרצות UI מלאות
- ✅ CRUD E2E לכל endpoints (כולל summary/derivatives)
- ✅ Security validation (Masked Log, token leakage, headers)
- ✅ Routes SSOT compliance
- ✅ Artifacts: logs, screenshots, HTML/JUnit report

**תרחישי בדיקה:**
- ✅ D16 - Trading Accounts: Page Load & Console Hygiene
- ✅ D18 - Brokers Fees: Page Load & Console Hygiene
- ✅ D21 - Cash Flows: Page Load & Console Hygiene
- ✅ CRUD E2E - Trading Accounts API
- ✅ CRUD E2E - Brokers Fees API
- ✅ CRUD E2E - Cash Flows API (כולל summary)
- ✅ Security Validation - Token Leakage
- ✅ Routes SSOT Compliance

**בדיקות שבוצעות:**
- בדיקת טעינת עמודים בדפדפן (Selenium)
- בדיקת Console Hygiene (0 שגיאות, 0 אזהרות)
- בדיקת Security Validation (Masked Log, Token Leakage)
- בדיקת CRUD E2E - כל ה-endpoints
- בדיקת Routes SSOT compliance
- יצירת Artifacts: screenshots, console logs, network logs, errors

**שימוש:**
```bash
cd tests
npm run test:phase2-e2e
```

**Artifacts:**
- Screenshots: `documentation/05-REPORTS/artifacts_SESSION_01/phase2-e2e-artifacts/`
- Console logs: `console_logs.json`
- Network logs: `network_logs.json`
- Errors: `errors.json`
- Test summary: `test_summary.json`

**תיעוד:**
- **דוח:** `_COMMUNICATION/team_50/TEAM_50_TO_TEAM_10_PHASE_2_QA_COMPLETE.md` ⚠️ **NON-SSOT - Communication only**
- **SOP-010:** `_COMMUNICATION/team_90/SOP_010_MANUAL_INTENT_SIMULATION_PROTOCOL.md` ⚠️ **NON-SSOT - Communication only**

**סטטוס:** ✅ **ACTIVE - READY FOR USE**

---

### 9. Frontend Development Testing Tools (Team 30)

**קטגוריה:** כלי בדיקה לפיתוח Frontend  
**אחריות:** Team 30 (Frontend Execution)  
**תאריך יצירה:** 2026-02-02

#### 6.1 CSS Loading Checker

**קובץ:** `ui/check-css-loading.js`  
**סוג:** כלי בדיקה אוטומטי (Browser Console)  
**תפקיד:** בודק שכל קבצי ה-CSS נטענים בסדר הנכון

**שימוש:**
1. פתח `http://localhost:8080/` בדפדפן
2. פתח DevTools (F12) → Console
3. העתק והדבק את התוכן של `check-css-loading.js`
4. לחץ Enter

**או:** `npm run check:css` (מציג הוראות)

**בדיקות שבוצעות:**
- ✅ בדיקת סדר טעינת CSS (Pico → phoenix-base → phoenix-components → phoenix-header → page-specific)
- ✅ בדיקת קבצי CSS חסרים
- ✅ בדיקת כפילויות בטעינת CSS
- ✅ בדיקת זמינות CSS Variables (--apple-blue, --spacing-md, וכו')
- ✅ בדיקת דרישות CSS ספציפיות לעמוד (Auth/Dashboard)

**תוצאות:**
- דוח מפורט על כל הבדיקות
- רשימת שגיאות (errors)
- רשימת אזהרות (warnings)
- סיכום כולל (passed/failed)

**תיעוד:**
- **מדריך שימוש:** `documentation/04-DESIGN_UX_UI/CSS_LOADING_ORDER.md`
- **תהליך עבודה:** `_COMMUNICATION/team_30/TT2_BLUEPRINT_INTEGRATION_WORKFLOW.md` ⚠️ **NON-SSOT - Communication only**

**סטטוס:** ✅ **ACTIVE - READY FOR USE**

---

#### 6.2 Blueprint Comparison Tool

**קובץ:** `ui/blueprint-comparison.js`  
**סוג:** כלי בדיקה אוטומטי (Browser Console)  
**תפקיד:** משווה את העמוד בפועל לבלופרינט (DOM structure, CSS styles)

**שימוש:**
1. פתח `http://localhost:8080/` בדפדפן
2. פתח DevTools (F12) → Console
3. העתק והדבק את התוכן של `blueprint-comparison.js`
4. לחץ Enter

**בדיקות שבוצעות:**
- ✅ בדיקת טעינת CSS (בסיסית)
- ✅ בדיקת מבנה DOM (page-wrapper, page-container, tt-container, tt-section)
- ✅ בדיקת CSS Variables availability
- ✅ בדיקת Dropdown Menu Spacing
- ✅ בדיקת Filter User Section Position
- ✅ בדיקת Investment Type Filter Options
- ✅ בדיקת Active Alerts Structure & Design
- ✅ בדיקת Info Summary Structure & Design
- ✅ בדיקת Widget Placeholders Structure & Design
- ✅ בדיקת Portfolio Section Header Filters

**תוצאות:**
- דוח מפורט על כל הבדיקות
- השוואת ערכים בפועל מול צפוי
- רשימת שגיאות (errors)
- רשימת אזהרות (warnings)
- סיכום כולל (passed/failed)

**תיעוד:**
- **תהליך עבודה:** `_COMMUNICATION/team_30/TT2_BLUEPRINT_INTEGRATION_WORKFLOW.md` ⚠️ **NON-SSOT - Communication only**
- **הנחיות בלופרינט:** `_COMMUNICATION/team_30/TEAM_30_TO_TEAM_31_BLUEPRINT_WORK_GUIDELINES_V2.md` ⚠️ **NON-SSOT - Communication only**

**סטטוס:** ✅ **ACTIVE - READY FOR USE**

**גרסה:** Enhanced (עודכן עם בדיקת CSS loading ו-DOM structure)

---

**סה"כ כלי בדיקה Frontend:** 2

**סה"כ בדיקות Routing:** 1 (3 תרחישים)

---

## 📊 סיכום כללי

### סטטיסטיקות בדיקות

| קטגוריה | תרחישים | Code Review | Runtime | Visual | Status |
|---------|---------|-------------|---------|--------|--------|
| **Authentication Flow** | 14 | ✅ 14/14 | ⏸️ Ready | ⏸️ Pending | ✅ Complete |
| **User Management Flow** | 7 | ✅ 7/7 | ⏸️ Ready | ⏸️ Pending | ✅ Complete |
| **Password Change Flow** | 11 | ✅ 9/11 | ⏸️ Ready | ⏸️ Pending | ⚠️ 1 Issue |
| **API Keys Management Flow** | 12 | ✅ 12/12 | ⏸️ Ready | ⏸️ Pending | ✅ Complete |
| **Error Handling & Security** | 11 | ✅ 11/11 | ⏸️ Ready | ⏸️ Pending | ✅ Complete |
| **Validation Comprehensive** | 20+ | ✅ 12/18 | ⚠️ 1 Failed | ⏸️ Pending | ⚠️ **1 Issue** |
| **Frontend Testing Tools** | 2 | ✅ 2/2 | ✅ Active | ✅ Ready | ✅ **Complete** |
| **Frontend Routing Tests** | 3 | ✅ 3/3 | ⏸️ Ready | ⏸️ Pending | ✅ **Complete** |
| **Phase 2 Runtime Tests** | 8 | ✅ 8/8 | ✅ Active | ✅ Ready | ✅ **Complete** |
| **Phase 2 E2E Selenium (SOP-010)** | 8 | ✅ 8/8 | ✅ Active | ✅ Ready | ✅ **Complete** |
| **Total** | **96+** | **86/96+** | **✅ Active** | **⏸️ Pending** | ⚠️ **2 Issues** |

---

## 🔗 קישורים לבדיקות

### קבצי בדיקות Selenium

- **Authentication:** `tests/auth-flow.test.js`
- **User Management:** `tests/user-management.test.js`
- **Password Change:** `tests/password-change.test.js`
- **API Keys:** `tests/api-keys.test.js`
- **Error Handling:** `tests/error-handling.test.js`
- **Validation Comprehensive:** `tests/validation-comprehensive.test.js`
- **Trading Accounts Routing:** `tests/trading-accounts-routing.test.js` (Team 30)
- **Phase 2 Runtime:** `tests/phase2-runtime.test.js` (Phase 2 Financial Core)
- **Phase 2 E2E Selenium (SOP-010):** `tests/phase2-e2e-selenium.test.js` (Phase 2 Financial Core - SOP-010 Compliance)
- **Configuration:** `tests/selenium-config.js`
- **Test Runner:** `tests/run-all.js`

### כלי בדיקה Frontend (Team 30)

- **CSS Loading Checker:** `ui/check-css-loading.js`
- **Blueprint Comparison Tool:** `ui/blueprint-comparison.js`
- **npm Script:** `npm run check:css` (מציג הוראות לשימוש)

### דוחות QA

- **Phase 1.5 Summary:** `documentation/05-REPORTS/artifacts_SESSION_01/TEAM_50_PHASE_1.5_INTEGRATION_TESTING_RESULTS.md`
- **Task 50.2.1:** `documentation/05-REPORTS/artifacts_SESSION_01/TEAM_50_TASK_50.2.1_AUTHENTICATION_FLOW_INTEGRATION.md`
- **Task 50.2.2:** `documentation/05-REPORTS/artifacts_SESSION_01/TEAM_50_TASK_50.2.2_USER_MANAGEMENT_FLOW_INTEGRATION.md`
- **Password Change:** `documentation/05-REPORTS/artifacts_SESSION_01/TEAM_50_PASSWORD_CHANGE_QA_RESULTS.md`
- **Task 50.2.3:** `documentation/05-REPORTS/artifacts_SESSION_01/TEAM_50_TASK_50.2.3_API_KEYS_FLOW_INTEGRATION.md`
- **Task 50.2.4:** `documentation/05-REPORTS/artifacts_SESSION_01/TEAM_50_TASK_50.2.4_ERROR_HANDLING_SECURITY_INTEGRATION.md`
- **Validation Comprehensive:** `documentation/08-REPORTS/artifacts_SESSION_01/TEAM_50_VALIDATION_COMPREHENSIVE_TESTING.md`

### תרחישי בדיקה

- **Authentication Scenarios:** `tests/scenarios/auth_scenarios.md`
- **Sanity Checklist:** `tests/sanity/phase1_sanity_checklist.md`

---

## 📋 נוהלי עבודה

### נוהל עבודה QA (מחייב)

**מסמך:** `documentation/09-GOVERNANCE/standards/TEAM_50_QA_WORKFLOW_PROTOCOL.md`  
**מקור:** נוהל QA מחייב מצוות 90 (Spy) והאדריכלית הראשית  
**סטטוס:** 🔒 **MANDATORY - נוהל קבוע ומחייב לכל הפרויקט**

**מפת נוהל QA (שלבים + דרישות):**

#### 🧭 Gate A — Doc↔Code (אוטומטי, חובה)
- **מטרה:** לוודא שכל Spec ב-SSOT תואם לקוד
- **בדיקות:** התאמת endpoints, schemas, versions
- **תוצר:** Doc/Code Matrix + דוח סטיות

#### 🧭 Gate B — Contract↔Runtime (אוטומטי, חובה)
- **מטרה:** לוודא שה-API חוזר בפועל לפי החוזים
- **בדיקות:** Contract tests, Shared_Services בלבד, UAI config חיצוני
- **תוצר:** ContractTestReport

#### 🧭 Gate C — UI↔Runtime (E2E חובה)
- **מטרה:** בדיקות E2E לכל הדפים הקריטיים
- **בדיקות:** UAI stages, Filters, Pagination, CSS load order, Failure injection, Console Hygiene, Security
- **תוצר:** E2EReport + screenshots

#### 🧭 Gate D — Manual/Visual (רק בסוף)
- **מטרה:** אישור חזותי ותפקודי סופי
- **בדיקות:** תקינות UI מול SSOT, דיוק תאריכים/סכומים/labels, UX sanity
- **תוצר:** ManualApproval

**כללי חובה:**
- ✅ **Automation-First:** אין קיצור דרך — כל מה שאפשר אוטומטי
- ✅ **E2E חובה:** ללא E2E אין GREEN
- ✅ **Manual רק בסוף:** ידני תמיד אחרי כל האוטומציות
- ✅ **Zero-Deviation:** סטייה = RED מיידי
- ✅ **בדיקות אבטחה חובה:** Masked Log + token leakage בכל Gate

**תוצרים סופיים חובה:**
1. DocCode Matrix (Gate A)
2. ContractTestReport (Gate B)
3. E2EReport (Gate C)
4. ManualApproval (Gate D)
5. QA Final Summary

**שלבים Legacy (עדיין תקף):**
1. Code Review (חובה ראשונית)
2. Selenium Automation (חובה)
3. Visual Validation (חובה)

### תבניות דיווח

**QA Report Template:** `documentation/06-GOVERNANCE_&_COMPLIANCE/standards/TEAM_50_QA_REPORT_TEMPLATE.md`

---

## 🔗 סטנדרטים מחייבים

### CSS Standards

**מסמך:** `documentation/07-POLICIES/TT2_CSS_STANDARDS_PROTOCOL.md`

**בדיקות QA נדרשות:**
- Pixel Match (0 pixel deviation)
- RTL Mirroring verification
- State Integrity (hover, focus, active)
- G-Bridge validation

### JavaScript Standards

**מסמך:** `documentation/07-POLICIES/TT2_JS_STANDARDS_PROTOCOL.md`

**בדיקות QA נדרשות:**
- Network Integrity (Payloads ב-snake_case)
- Console Audit (נקי במצב רגיל, מלא ב-`?debug`)
- Fidelity Resilience (שגיאות ב-LEGO components)
- Transformation Layer compliance

---

## 📊 תחזוקה וניקיון

### תחזוקה שוטפת

**תדירות:** לאחר כל Phase/Module completion

**פעולות:**
1. עדכון אינדקס זה עם תרחישי בדיקה חדשים
2. עדכון דוחות QA עם תוצאות
3. ניקיון תיקיות Evidence (העברה לארכיון אם נדרש)
4. עדכון סטטיסטיקות

### ניקיון תקיות

**תדירות:** בסיום כל Session

**פעולות:**
1. ארכיון דוחות ישנים (אם נדרש)
2. עדכון אינדקסים
3. ניקיון קבצי Evidence זמניים
4. עדכון קישורים

---

## ✅ Sign-off

**אינדקס זה מתעדכן באופן שוטף עם כל בדיקה חדשה.**

**Last Updated:** 2026-02-07  
**Maintained By:** Team 50 (QA) + Team 30 (Frontend Testing Tools)  
**Next Update:** After Phase 2 manual tests completed (Gate D)

**נוהל QA עודכן:** 2026-02-07 - נוהל QA מחייב מצוות 90 (Automation-First + E2E חובה) אומץ ותועד

---

**log_entry | Team 50 | QA_TEST_INDEX | MAINTAINED | GREEN | 2026-01-31**
