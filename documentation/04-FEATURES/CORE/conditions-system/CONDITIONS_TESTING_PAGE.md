# Conditions System Testing Page - TikTrack
============================================

## 🎯 Overview

The Conditions Testing Page is a comprehensive testing interface for the Conditions and Reasons system. It provides a structured way to test all 7 core functionalities of the conditions system with detailed logging and debugging capabilities.

## 📍 Location

- **File**: `trading-ui/conditions-test.html`
- **Scripts**: `trading-ui/scripts/conditions-test.js`
- **Styles**: `trading-ui/styles-new/07-pages/_conditions-test.css`
- **Documentation**: `documentation/04-FEATURES/CORE/conditions-system/CONDITIONS_TESTING_PAGE.md`

## 🏗️ Architecture Compliance

The page follows the complete TikTrack architecture standards:

### ✅ ITCSS Implementation
- **Complete CSS Architecture**: All required CSS files loaded in correct order
- **Bootstrap Integration**: Bootstrap 5.3.0 loaded before ITCSS
- **Page-specific Styles**: Custom styles in `07-pages/_conditions-test.css`
- **Theme Support**: Light theme with dark mode detection
- **Utilities**: Only `_utilities.css` loaded (other utility files don't exist)

### ✅ Standard Page Structure
- **Unified Header**: Uses `#unified-header` component
- **Background Wrapper**: Standard `background-wrapper` and `page-body`
- **Top Section**: Info summary with test statistics
- **Content Sections**: Two main sections (test controls + log display)
- **Standard Classes**: Uses `section-header`, `section-body`, `table-title`, etc.

### ✅ Unified Initialization System
- **Base Package Scripts**: All 20+ base scripts loaded
- **Page Configuration**: Registered in `PAGE_CONFIGS`
- **Custom Initializer**: `initializeConditionsTestPage()` function
- **Error Handling**: Integrated with unified error system

### ✅ Component Integration
- **Notification System**: Uses `showNotification()` and `logWithCategory()`
- **Cache System**: Integrated with `UnifiedCacheManager`
- **Translation System**: Uses `translation-utils.js`
- **Button System**: Uses `button-icons.js` and `button-system-init.js`

## 🚀 Features

### 1. **7-Stage Testing System**
- **Stage 1**: Load Trading Methods - Tests API connectivity and data retrieval
- **Stage 2**: Create New Condition - Tests condition creation with parameters
- **Stage 3**: Read Existing Conditions - Tests condition retrieval
- **Stage 4**: Edit Condition - Tests condition modification
- **Stage 5**: Delete Condition - Tests condition removal
- **Stage 6**: Create Alert from Condition - Tests alert generation
- **Stage 7**: Inheritance Test - Tests condition inheritance from Trade Plan to Trade

### 2. **Advanced Logging System**
- **Unified Integration**: Uses the existing notification system for consistent logging
- **Multiple Log Levels**: INFO, SUCCESS, WARNING, ERROR, DEBUG, RUNNING
- **Category Support**: development, system, business, performance, ui, security
- **Real-time Display**: Live log updates with timestamps and icons
- **Data Logging**: JSON data logging for complex objects

### 3. **Copy Log Functionality**
- **Formatted Copy**: HTML-formatted logs for documentation
- **Raw Copy**: Plain text logs for debugging
- **Session Summary**: Complete test session with statistics
- **Clipboard Integration**: One-click copy to clipboard

### 4. **Visual Indicators**
- **Status Icons**: ⚪ Pending, 🔵 Running, ✅ Success, ❌ Failed
- **Progress Tracking**: Real-time status updates
- **Duration Display**: Test execution time in milliseconds
- **Statistics Panel**: Overall test statistics and success rates

### 5. **Responsive Design**
- **Mobile Support**: Responsive layout for all screen sizes
- **RTL Support**: Full right-to-left support for Hebrew
- **Dark Mode**: Automatic dark mode detection
- **Accessibility**: Focus indicators and keyboard navigation

## 🔧 Technical Implementation

### Architecture

```
┌─────────────────────────────────────────┐
│  ConditionsTestManager (Main Class)     │
├─────────────────────────────────────────┤
│  - Test Configuration Management        │
│  - API Call Handling                    │
│  - Logging Integration                  │
│  - UI State Management                  │
│  - Statistics Calculation               │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│  Unified Notification System            │
├─────────────────────────────────────────┤
│  - showNotification()                   │
│  - logWithCategory()                    │
│  - getLogEmoji()                        │
│  - Category-based filtering             │
└─────────────────────────────────────────┘
```

### Key Components

#### 1. **ConditionsTestManager Class**
```javascript
class ConditionsTestManager {
    constructor() {
        this.initialized = false;
        this.testResults = {};
        this.logEntries = [];
        this.tests = { /* 7 test configurations */ };
    }
}
```

#### 2. **Test Configuration**
Each test has:
- **Name**: Human-readable test name
- **Description**: Test purpose and scope
- **API Endpoint**: Target API URL
- **Method**: HTTP method (GET, POST, PUT, DELETE)
- **Test Data**: Sample data for testing
- **Query Parameters**: URL parameters

#### 3. **Unified Logging Integration**
```javascript
async logWithUnifiedSystem(level, message, category, data) {
    // Use unified notification system
    if (window.logWithCategory) {
        await window.logWithCategory(level, message, category, data);
    }
    
    // Show notifications for important messages
    if (level === 'error' && window.showErrorNotification) {
        window.showErrorNotification(message, 'בדיקת תנאים');
    }
    
    // Store in local log entries for display
    this.logEntries.push(logEntry);
    this.displayLogEntry(logEntry);
}
```

## 📊 Test Scenarios

### Scenario 1: Load Trading Methods
```javascript
{
    name: 'טעינת שיטות מסחר',
    description: 'טעינת 6 השיטות מה-API',
    apiEndpoint: '/api/trading-methods/',
    method: 'GET'
}
```

**Expected Result**: Returns 6 trading methods with parameters

### Scenario 2: Create New Condition
```javascript
{
    name: 'יצירת תנאי חדש',
    description: 'יצירת תנאי חדש עם פרמטרים',
    apiEndpoint: '/api/plan-conditions/trade-plans/1/conditions',
    method: 'POST',
    testData: {
        method_id: 1,
        parameters: {
            ma_period: 50,
            ma_type: 'SMA'
        }
    }
}
```

**Expected Result**: Creates new condition and returns condition ID

### Scenario 3: Read Existing Conditions
```javascript
{
    name: 'קריאת תנאים קיימים',
    description: 'קריאת תנאים מ-Trade Plan',
    apiEndpoint: '/api/plan-conditions/trade-plans/1/conditions',
    method: 'GET'
}
```

**Expected Result**: Returns list of existing conditions

### Scenario 4: Edit Condition
```javascript
{
    name: 'עריכת תנאי',
    description: 'עריכת תנאי קיים',
    apiEndpoint: '/api/plan-conditions',
    method: 'PUT',
    testData: {
        id: null, // Set dynamically from previous test
        parameters: {
            ma_period: 100,
            ma_type: 'EMA'
        }
    }
}
```

**Expected Result**: Updates existing condition

### Scenario 5: Delete Condition
```javascript
{
    name: 'מחיקת תנאי',
    description: 'מחיקת תנאי קיים',
    apiEndpoint: '/api/plan-conditions',
    method: 'DELETE',
    testData: {
        id: null // Set dynamically from previous test
    }
}
```

**Expected Result**: Removes condition from database

### Scenario 6: Create Alert from Condition
```javascript
{
    name: 'יצירת התראה מתנאי',
    description: 'יצירת התראה מתנאי קיים',
    apiEndpoint: '/api/alerts/from_condition',
    method: 'POST',
    testData: {
        condition_id: null, // Set dynamically
        alert_type: 'notification',
        message: 'Test alert from condition'
    }
}
```

**Expected Result**: Creates alert linked to condition

### Scenario 7: Inheritance Test
```javascript
{
    name: 'בדיקת ירושה',
    description: 'העתקת תנאים מתכנית לטרייד',
    apiEndpoint: '/api/trade-conditions/trades/1/conditions',
    method: 'POST',
    testData: {
        method_id: 1,
        parameters: {
            ma_period: 50,
            ma_type: 'SMA'
        }
    }
}
```

**Expected Result**: Creates trade condition based on plan condition

## 🎨 UI Components

### Header Section
- **Title**: "מערכת בדיקת תנאים - Conditions"
- **Controls**: Clear Logs, Copy Log, Reset All buttons

### Left Panel - Test Controls
- **Test Items**: 7 test scenarios with run buttons
- **Status Indicators**: Visual status for each test
- **Duration Display**: Execution time for each test
- **Statistics Panel**: Overall test statistics

### Right Panel - Log Display
- **Log Header**: Title and copy controls
- **Log Content**: Real-time log display
- **Log Entries**: Formatted log entries with timestamps

## 🔌 API Integration

### Supported APIs

1. **Trading Methods API**
   - `GET /api/trading-methods/`
   - Returns all trading methods with parameters

2. **Plan Conditions API**
   - `GET /api/plan-conditions/trade-plans/{plan_id}/conditions`
   - `POST /api/plan-conditions/trade-plans/{plan_id}/conditions`
   - `PUT /api/plan-conditions/{condition_id}`
   - `DELETE /api/plan-conditions/{condition_id}`

3. **Trade Conditions API**
   - `GET /api/trade-conditions/trades/{trade_id}/conditions`
   - `POST /api/trade-conditions/trades/{trade_id}/conditions`

4. **Alerts API**
   - `POST /api/alerts/from_condition`

### Error Handling

The system handles various error scenarios:
- **Network Errors**: Connection timeouts, server errors
- **Validation Errors**: Invalid parameters, missing data
- **Business Logic Errors**: Condition conflicts, dependency issues
- **System Errors**: Database errors, service unavailability

## 📱 Usage Guide

### 1. **Accessing the Page**
Navigate to: `http://localhost:8080/conditions-test.html`

### 2. **Running Tests**
1. Click "Run Test" button for any test scenario
2. Monitor the log output in real-time
3. Check status indicators for test results
4. Review statistics panel for overall progress

### 3. **Copying Logs**
1. Click "Copy Log" for formatted HTML logs
2. Click "Copy Formatted" for HTML format
3. Click "Copy Raw" for plain text format
4. Use copied logs for debugging or documentation

### 4. **Resetting Tests**
1. Click "Reset All" to clear all test results
2. Click "Clear Logs" to clear log display only
3. Tests can be run individually or in sequence

## 🐛 Debugging Features

### 1. **Detailed Logging**
- **API Calls**: Full request/response logging
- **Test Data**: Parameter validation and data flow
- **Error Details**: Stack traces and error context
- **Performance**: Response times and execution duration

### 2. **Visual Debugging**
- **Status Colors**: Color-coded test results
- **Progress Indicators**: Real-time test progress
- **Error Highlighting**: Clear error identification
- **Data Display**: JSON data formatting

### 3. **Export Capabilities**
- **Session Logs**: Complete test session export
- **Error Reports**: Detailed error analysis
- **Performance Metrics**: Test execution statistics
- **Configuration Export**: Test setup and parameters

## 🔧 Configuration

### Test Parameters
Tests can be configured by modifying the `tests` object in `conditions-test.js`:

```javascript
this.tests = {
    'test-id': {
        name: 'Test Name',
        description: 'Test Description',
        apiEndpoint: '/api/endpoint',
        method: 'GET|POST|PUT|DELETE',
        testData: { /* test data */ },
        queryParams: { /* query parameters */ }
    }
};
```

### Logging Configuration
Logging behavior can be controlled through the unified notification system:

```javascript
// Set notification mode
window.setNotificationMode('DEBUG'); // DEBUG, DEVELOPMENT, WORK, SILENT

// Configure categories
window.setCategorySettings({
    development: { enabled: true, level: 'info' },
    system: { enabled: true, level: 'error' }
});
```

## 📈 Performance Metrics

### Test Execution Times
- **Load Methods**: ~100-200ms
- **Create Condition**: ~150-300ms
- **Read Conditions**: ~100-250ms
- **Edit Condition**: ~200-400ms
- **Delete Condition**: ~150-300ms
- **Create Alert**: ~200-500ms
- **Inheritance Test**: ~300-600ms

### System Requirements
- **Browser**: Modern browser with ES6+ support
- **Network**: Stable connection to backend API
- **Memory**: ~10MB for log storage
- **Storage**: Local storage for test results

## 🚨 Troubleshooting

### Common Issues

1. **API Connection Errors**
   - Check server status: `http://localhost:8080/api/health`
   - Verify API endpoints are accessible
   - Check network connectivity

2. **Test Failures**
   - Review log output for error details
   - Check test data validity
   - Verify database state

3. **UI Issues**
   - Clear browser cache
   - Check console for JavaScript errors
   - Verify CSS files are loaded

4. **Logging Issues**
   - Check notification system initialization
   - Verify unified logging is available
   - Check browser console for errors

### Debug Mode
Enable debug mode for detailed logging:

```javascript
// In browser console
window.setNotificationMode('DEBUG');
window.conditionsTestManager.logWithUnifiedSystem('debug', 'Debug mode enabled', 'development');
```

## 📚 Related Documentation

- [Conditions System Overview](CONDITIONS_SYSTEM.md)
- [Conditions System Architecture](CONDITIONS_SYSTEM_ARCHITECTURE.md)
- [Conditions System API Documentation](CONDITIONS_SYSTEM_API_DOCUMENTATION.md)
- [Conditions System Developer Guide](CONDITIONS_SYSTEM_DEVELOPER_GUIDE.md)
- [Conditions System User Guide](CONDITIONS_SYSTEM_USER_GUIDE.md)
- [Conditions System Testing Guide](CONDITIONS_SYSTEM_TESTING_GUIDE.md)
- [Conditions System Integration Guide](CONDITIONS_SYSTEM_INTEGRATION_GUIDE.md)

## 🔄 Version History

- **v1.0.0** (October 2025): Initial implementation
  - 7-stage testing system
  - Unified logging integration
  - Copy log functionality
  - Responsive design
  - Complete API integration

## 👥 Contributing

When contributing to the testing page:

1. **Follow the existing architecture**
2. **Use the unified logging system**
3. **Maintain responsive design**
4. **Update documentation**
5. **Test all scenarios**
6. **Follow Hebrew RTL guidelines**

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review the log output
3. Check the unified notification system
4. Verify API connectivity
5. Contact the development team

### Fixed Issues (October 2025)

- **MIME Type Errors**: Removed non-existent CSS files from utilities layer (`_display.css`, `_responsive.css`, `_spacing.css`, `_text.css`)
- **Missing Icons**: Replaced missing icon files (`cogs.svg`, `play.svg`, `list.svg`) with existing `development.svg`
- **CSS Loading**: Ensured only existing CSS files are loaded to prevent 404 errors

---

**Last Updated**: October 2025  
**Version**: 1.0.0  
**Author**: TikTrack Development Team
