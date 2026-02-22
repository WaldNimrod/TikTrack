# Phase 1.5 Integration Testing - Selenium Automation
**project_domain:** TIKTRACK

**Team 50 (QA)**  
**Date:** 2026-01-31  
**Status:** ✅ **AUTOMATION READY**

---

## 📋 Overview

This directory contains Selenium-based automated integration tests for Phase 1.5 Integration Testing. Tests cover all four main testing areas:

1. **Authentication Flow** (`auth-flow.test.js`)
2. **User Management Flow** (`user-management.test.js`)
3. **API Keys Management Flow** (`api-keys.test.js`)
4. **Error Handling & Security** (`error-handling.test.js`)

---

## 🚀 Quick Start

### Prerequisites

1. **Backend running:** `http://localhost:8082`
2. **Frontend running:** `http://localhost:8080`
3. **Chrome browser** installed
4. **Node.js** v18+ installed

**אם השרת לא פועל — איתחול חובה:** לפני הרצת בדיקות, להריץ איתחול שרתים (עצירה + הפעלה):

```bash
# מתוך שורש הפרויקט
./scripts/init-servers-for-qa.sh
```

לאחר סיום האיתחול Backend ו-Frontend רצים ברקע; אז להריץ את הבדיקות.

### Installation

```bash
cd tests
npm install
```

### Run Tests

```bash
# Run all tests (browser visible by default for QA visual validation)
npm run test:all

# Run individual test suites
npm run test:auth      # Authentication Flow
npm run test:user      # User Management Flow
npm run test:apikeys   # API Keys Management Flow
npm run test:errors    # Error Handling & Security
npm run test:password-change  # Password Change Flow
npm run test:gate-b    # Gate B E2E (Design System, Brokers)
npm run test:external-data-suite-e  # External Data — Suite E (Staleness Clock + Tooltip)

# Run in headless mode (for CI/CD - browser not visible)
HEADLESS=true npm run test:all
```

**Note:** By default, tests run with **visible browser** for QA visual validation. Set `HEADLESS=true` environment variable to run in headless mode (useful for CI/CD).

---

## 📊 Test Structure

### Test Configuration

- **Config:** `selenium-config.js`
- **Frontend URL:** `http://localhost:8080`
- **Backend URL:** `http://localhost:8082`
- **Timeout:** 10 seconds (default)
- **Headless Mode:** Disabled by default (browser visible for QA visual validation)
  - Set `HEADLESS=true` environment variable to enable headless mode

### Test Results

Tests output:
- ✅ **PASS** - Test passed
- ❌ **FAIL** - Test failed
- ⏸️ **SKIP** - Test skipped

### Logging

Each test logs:
- Test name and status
- Detailed results (token storage, redirects, errors)
- Console logs (if available)
- Network logs (if available)

---

## 🧪 Test Scenarios

### Authentication Flow (Task 50.2.1)

- ✅ Registration - Successful
- ✅ Registration - Validation Errors
- ✅ Login - Successful
- ✅ Login - Invalid Credentials
- ✅ Logout - Successful

### User Management Flow (Task 50.2.2)

- ✅ Get Current User
- ✅ Update Profile
- ⚠️ Change Password (needs clarification)

### API Keys Management Flow (Task 50.2.3)

- ✅ Create API Key
- ✅ List API Keys
- ✅ Update API Key
- ✅ Verify API Key
- ✅ Delete API Key

### Error Handling & Security (Task 50.2.4)

- ✅ Network Errors
- ✅ API Errors (400, 401, 404, 500)
- ✅ Token Expiration → Auto Refresh
- ✅ Refresh Token Rotation
- ✅ Token Tampering
- ✅ API Key Masking

---

## 📝 Test Execution Flow

1. **Infrastructure Check:** Verify backend and frontend are running
2. **Test Execution:** Run test suites sequentially
3. **Result Collection:** Collect test results and logs
4. **Summary Report:** Generate test summary
5. **Visual Validation:** After all tests pass, proceed to manual visual validation

---

## 🔍 Monitoring & Debugging

### Visual Browser Testing

**Default Behavior:** Tests run with **visible browser** for QA visual validation. You can watch the tests execute in real-time, which is essential for:
- Visual validation of UI elements
- Debugging test failures
- Understanding test flow
- Verifying user experience

**Headless Mode:** Set `HEADLESS=true` to run tests without visible browser (useful for CI/CD):
```bash
HEADLESS=true npm run test:all
```

### Console Logs

Tests capture browser console logs for debugging:
- Errors
- Warnings
- Network requests (if available)

### Screenshots

Screenshots can be taken for failed tests (configured in `selenium-config.js`).

### Network Monitoring

Network requests are monitored via:
- Browser performance logs
- Console logs
- localStorage verification

---

## ✅ After Tests Pass

Once all automated tests pass:

1. **Review Test Summary:** Check all tests passed
2. **Visual Validation:** Manual browser validation required
3. **Report to Teams:** Share results with Team 20 and Team 30

---

## 📎 Related Documents

- `documentation/05-REPORTS/artifacts_SESSION_01/TEAM_50_PHASE_1.5_INTEGRATION_TESTING_RESULTS.md`
- `documentation/05-REPORTS/artifacts_SESSION_01/TEAM_50_TASK_50.2.1_AUTHENTICATION_FLOW_INTEGRATION.md`
- `documentation/05-REPORTS/artifacts_SESSION_01/TEAM_50_TASK_50.2.2_USER_MANAGEMENT_FLOW_INTEGRATION.md`
- `documentation/05-REPORTS/artifacts_SESSION_01/TEAM_50_TASK_50.2.3_API_KEYS_FLOW_INTEGRATION.md`
- `documentation/05-REPORTS/artifacts_SESSION_01/TEAM_50_TASK_50.2.4_ERROR_HANDLING_SECURITY_INTEGRATION.md`

---

**Prepared by:** Team 50 (QA)  
**Status:** ✅ **AUTOMATION READY**
