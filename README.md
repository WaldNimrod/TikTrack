# TikTrack - מערכת ניהול השקעות

## ⚠️ **חשוב: זהו README ראשי של הפרויקט בלבד!**

**אין קשר לקונפיגורציות השרת או מערכת הבדיקות!**

🎯 **מטרה**: תיעוד כללי של פרויקט TikTrack - מערכת ניהול השקעות
📍 **מיקום**: README.md (קובץ ראשי)
🔗 **מערכת הבדיקות**: Backend/testing_suite/README.md  
🔗 **מערכת סידור טבלאות**: documentation/TABLE_SORTING_SYSTEM.md

## 📋 תיאור כללי
TikTrack היא מערכת ניהול השקעות מתקדמת המאפשרת מעקב, תכנון וניהול השקעות בשוק ההון.

## 🆕 **עדכונים אחרונים - ארגון CSS מושלם**

### ✅ **ארגון CSS מושלם - ארכיטקטורה חדשה:**
- 🎨 **ארכיטקטורת CSS חדשה** - 6 קבצים מאורגנים עם אחריות ברורה
- 🔄 **ביטול כפילויות** - 20+ הגדרות כפולות נוקו
- 🧹 **ניקוי דריסות** - 10+ הגדרות דורסות נוקו
- 📁 **היררכיה ברורה** - סדר טעינה מ-weakest ל-strongest
- 🎯 **ארגון לפי קומפוננטים** - כל סגנון במקום המתאים

### 🔧 **שינויים טכניים:**
- **קבצים שהוסרו:** `menu.css`, `research_new.html`
- **קבצים ששונו:** 34 קבצים (CSS + HTML)
- **שורות שנוספו:** 1,734 שורות
- **שורות שהוסרו:** 1,240 שורות

### 📚 **דוקומנטציה חדשה:**
- **CSS Architecture** - `documentation/frontend/css/CSS_ARCHITECTURE.md`
- **CSS Organization Process** - `documentation/frontend/css/CSS_ORGANIZATION_PROCESS.md`
- **CSS Variables Reference** - `documentation/frontend/css/CSS_VARIABLES.md`
- **Component Style Guide** - `documentation/frontend/css/COMPONENT_STYLE_GUIDE.md`

### 🏗️ **ארכיטקטורה חדשה:**
```
trading-ui/styles/
├── apple-theme.css          # משתנים וסגנונות בסיס
├── typography.css           # פונטים וכותרות
├── styles.css              # קומפוננטים כלליים
├── table.css               # סגנונות טבלאות
├── header-system.css       # מערכת ראש דף
└── research-summary.css    # סגנונות ייעודיים
```

---

## 🆕 **Previous Updates - השלמת CRUD למטבעות ותזרימי מזומנים**

### ✅ **פונקציונאליות חדשה - CRUD מלא למטבעות:**
- 💱 **דף ניהול מטבעות חדש** - `/currencies` עם ממשק גרافי מלא
- ➕ **הוספת מטבעות** - מודל עם ולידציה לסמל, שם ושער דולר
- ✏️ **עריכת מטבעות** - עדכון פרטי מטבע קיים
- 🗑️ **מחיקת מטבעות** - עם אישור ואזהרה
- 📊 **סטטיסטיקות דינמיות** - סה"כ מטבעות, שערים מקסימלי ומינימלי
- 🔗 **אינטגרציה בתפריט** - נגיש מהתפריט הראשי אחרי "בסיס נתונים"

### ✅ **שיפור תזרימי מזומנים:**
- 🏦 **אינטגרציה עם מטבעות** - קישור לטבלת המטבעות המרכזית
- 💰 **שער דולר ביום הפעולה** - שמירת שער המטבע בזמן הפעולה
- 📥 **מקור המידע** - הבחנה בין הזנה ידנית לייבוא
- 🔗 **מזהה חיצוני** - תמיכה בייבוא נתונים מברוקרים
- 🎯 **ממשק משופר** - הערות והנחיות למשתמש

### 🔧 **Technical Changes:**
- **Backend:** Complete API for currencies, update `cash_flows` API
- **Frontend:** New `currencies.html` page, complete `currencies.js`
- **Database:** 4 new fields in `cash_flows` table
- **Navigation:** Menu update with currency link

### 📚 **Updated Documentation:**
- **CRUD Status** - `CRUD_COMPLETION_STATUS.md` file with detailed status
- **Database Changes** - Update `DATABASE_CHANGES_AUGUST_2025.md`
- **Progress Tracking** - Progress table for all entities

### 📊 **CRUD Completion Status:**
- ✅ **Currencies** - Completed 100%
- ✅ **Cash Flows** - Completed 100%
- 🔄 **Accounts** - In progress (needs delete testing)
- 🔄 **Tickers** - In progress (needs delete testing)
- ⏳ **Alerts, Executions, Trades, Plans** - Pending

## 🆕 **Previous Updates - Global Table Sorting System**

### ✅ **New Functionality - Table Sorting System:**
- 🔄 **Unified Sorting for All Tables** - Single global system for all pages
- 📊 **Support for All Data Types** - Text, numbers, dates, statuses
- 💾 **Automatic State Saving** - Separate localStorage for each page
- 🎯 **Dynamic Icons** - ↕ (inactive), ↑ (ascending), ↓ (descending)
- 🎨 **Consistent Design** - Uniform colors and animations

### 🔧 **Technical Changes:**
- **main.js:** Global functions `sortTableData()`, `updateSortIcons()`, `loadSortState()`
- **planning.js:** Implementing sorting system for planning page
- **grid-table.css:** Sorting icon designs
- **Documentation:** Comprehensive `documentation/TABLE_SORTING_SYSTEM.md` file

### 📚 **Updated Documentation:**
- **Complete JSDoc** - Detailed documentation for all functions
- **Usage Examples** - Sample code for each function
- **Extension Guide** - Instructions for adding sorting to new pages
- **Troubleshooting** - Guide for solving common issues

## 🆕 **Previous Updates - Advanced Ticker Deletion**

### ✅ **New Functionality - Safe Ticker Deletion:**
- 🔍 **Comprehensive Dependency Check** - Automatic check of all items linked to ticker
- 📊 **Detailed Modal** - Display all open trades, plans, notes, and alerts
- ⚠️ **Prevent Unsafe Deletion** - Cannot delete ticker with linked items
- 🎯 **User-Friendly Interface** - Clear messages and intuitive interface

### 🔧 **Technical Changes:**
- **Backend:** New API endpoint `/api/v1/tickers/<id>/linked-items`
- **Frontend:** `showLinkedItemsWarning()` function for detailed modal
- **Models:** Added `to_dict()` methods to missing models
- **Service:** `check_linked_items()` function in TickerService

## 🚫 **What's Not Here:**
- ❌ Server configurations (moved to archive)
- ❌ Development environment settings
- ❌ Server startup scripts
- ❌ Testing system
- ❌ Production settings

## 🚀 **System Startup (Unified Configuration)**

### ✅ **Single Configuration in Use:**
- **Server File:** `Backend/app.py`
- **Startup Script:** `./start_dev.sh`
- **Restart Script:** `Backend/restart_server.sh` ⭐ **New!**
- **Features:** Flask development server, debug mode, detailed logs
- **Additional Features:** Notification messages, paths without .html

### 🔄 **Server Restart Script (`restart_server.sh`):**
```bash
# Safe server shutdown
./Backend/restart_server.sh
```
**Features:**
- ✅ Safe shutdown of all processes
- ✅ Clear occupied ports
- ✅ Check logs for errors
- ✅ Restart with availability check
- ✅ Automatic API testing

### 🗄️ **Database Creation Script (`create_initial_data.py`):**
```bash
# Create new database with sample data
cd Backend && python3 ../backups/debug_files/create_initial_data.py
```
**Features:**
- ✅ Create all tables with updated structure
- ✅ Sample data for all entities
- ✅ Full consistency with current structure
- ✅ Validate all rules and relationships
- ✅ Compatibility with all recent fixes

### 🎯 **Startup:**
```bash
# Quick startup (recommended)
./start_dev.sh

# Or direct startup
cd Backend && python3 run_flask_simple.py
```

### ⚠️ **Important Note - Code Changes:**
**When changing Python code (models, routes, services), server restart is required for changes to load!**
```bash
# Stop server
pkill -f "python3.*run_flask_simple.py"

# Restart
cd Backend && python3 run_flask_simple.py &
```

### 📊 **Unified Configuration Advantages:**
- ✅ **Single configuration only** - No confusion
- ✅ **Speed** - Server starts in seconds
- ✅ **Stability** - Flask development server stable
- ✅ **Debug mode** - Enabled for development convenience
- ✅ **Detailed logs** - For development and troubleshooting
- ✅ **Simplicity** - Simple and clear configuration

### 📁 **Old Configurations Archive:**
- **Location:** `Backend/backups/20250820_flask_simple_configuration/`
- **Date:** August 20, 2025
- **Reason:** Transition to simple and stable configuration
- **Status:** Archive - Not in use

## 🏗️ File Architecture

### 📁 JavaScript Files

#### `trading-ui/scripts/main.js` - Main General File
**Purpose:** General file containing all shared functionality for the entire site.

**Important Rules:**
1. **General Functions:** Functions related to all pages or entities are written in this file
2. **Specific Functions:** Functions related to only one database entity are written in their own dedicated file
3. **File Consolidation:** This file includes all functionality from `grid-table.js` and `grid-data.js`

**File Contents:**
- General API functions
- Standard grid column definitions
- Database data management
- Section open/close functions
- Conversion and format functions
- Table filtering functions
- **Global Table Sorting System** - Unified sorting functionality for all tables
- Grid initialization functions
- Original functions from main.js

**Table Sorting System:**
- `sortTableData()` - Global function for table sorting
- `updateSortIcons()` - Update sorting icons
- `loadSortState()` - Load sort state from localStorage
- Support for all data types (text, numbers, dates, statuses)
- Separate state saving for each page

#### Entity-Specific Files:
- `accounts.js` - Account-specific functions (filter functions moved to grid-filters.js)
- `trades.js` - Trade-specific functions
- `alerts.js` - Alert-specific functions
- `notes.js` - Note-specific functions

#### Modular Files:
- `grid-filters.js` - Filter system (including account filter functions moved from accounts.js)
- `app-header.js` - Application header
- `auth.js` - User authentication

### 📁 Backup Files
- `backups/20250818_js_unification/` - JavaScript file consolidation backup (version 2.3)
  - `grid-table.js.backup` - Backup of old file
  - `grid-data.js.backup` - Backup of old file
  - `main.js.backup` - Backup of original file
  - `README.md` - Backup documentation

## 🔧 Development Instructions

### Adding New Functions:
1. **General Functions** → `main.js`
2. **Global Filter Functions** → `grid-filters.js`
3. **Entity-Specific Functions** → Dedicated file (e.g., `accounts.js`)

### Updating Pages:
- All pages load `main.js` instead of `grid-table.js` and `grid-data.js`
- No need to load old files

## 🚀 Future Development Instructions

### 📋 New Development Rules:
1. **Page-Specific Functions:** Each page needs a dedicated `.js` file with its specific functions
2. **`updateGridFromComponent` Function:** Each page must define this function to connect with global filters
3. **Function Exposure:** All required functions must be available through `window` object
4. **File Loading:** Ensure all pages load the required files

### 🎯 Adding a New Page:
```javascript
// 1. Create dedicated script file (e.g., newpage.js)
// 2. Define updateGridFromComponent function
window.updateGridFromComponent = function(selectedStatuses, selectedTypes, selectedDateRange, searchTerm) {
  window.updateGridFromComponentGlobal(selectedStatuses, selectedTypes, [], selectedDateRange, searchTerm, 'newpage');
};

// 3. Add file loading in HTML
<script src="scripts/newpage.js"></script>
```

### 🔧 Adding a New Filter:
1. **Update `app-header.js`:** Add filter to header HTML
2. **Update `grid-filters.js`:** Add filter logic to `filterDataByFilters` function
3. **Update all pages:** Ensure all pages support the new filter

### 📊 Data Rules:
- **Database:** Store all data in English
- **User Interface:** Translate to Hebrew only in UI
- **Statuses:** Use `cancelled` (with two 'l') instead of `cancelled`

### 🧪 Pre-Release Testing:
- [ ] Test filters on all pages
- [ ] Test data loading
- [ ] Test global functions
- [ ] Test text consistency
- [ ] Test RTL support

## ⚠️ Open and Known Issues

### 🔴 Critical Issues:
- **Alert Updates:** API for updating `account_id` in alerts doesn't work properly
- **Search Filter:** Issue with free search filter - one character remains after deletion

### 🟡 Medium Issues:
- **Filter State Saving:** Filters don't save between page transitions and refreshes
- **Immediate Refresh:** Filter change doesn't refresh table immediately

### 🟢 Future Improvements:
- **Performance:** Optimize parallel data loading
- **UX:** Improve user experience in filters
- **Documentation:** Add detailed documentation for each function

### 📋 Future Tasks:
- [ ] Fix alert update API
- [ ] Fix free search filter
- [ ] Implement filter state saving
- [ ] Implement immediate table refresh
- [ ] Performance optimization

## 📊 Database Structure

### Main Entities:
- **Users** - Users
- **Accounts** - Accounts
- **Tickers** - Tickers
- **Trades** - Trades
- **Trade Plans** - Trade Plans
- **Alerts** - Alerts
- **Cash Flows** - Cash Flows
- **Notes** - Notes
- **Executions** - Executions
- **User Roles** - User Roles

## 🚀 System Startup

### Requirements:
- Python 3.8+
- SQLite3
- Modern browser

### Startup:
```bash
# Start server (single configuration)
./start_dev.sh

# Or manually:
cd Backend && python3 dev_server.py
```

### Access:
- **User Interface:** http://localhost:8080
- **API:** http://localhost:8080/api/v1/

## 📝 Recent Changes

### Version 2.7 (August 2025) - Message and Path Improvements
**Description:** Adding notification system and paths without .html

#### 🎯 Message Improvements:
- **Notification System:** Green messages in corner that disappear automatically
- **Demo Page:** Removed - no longer needed
- **Conversion from alert:** Instructions for converting from alert to notification
- **Message Types:** success (green), error (red), warning (yellow), info (blue)

#### 🔗 Path Improvements:
- **Paths without .html:** All pages available without .html at the end
- **Dual Support:** Each page available both with .html and without
- **New routes:** Adding routes for notes

#### 📁 Updated Files:
- ✅ `Backend/app.py` - Adding new routes and annotations
- ✅ `Backend/run_flask_simple.py` - Updated startup messages
- ✅ `Backend/SERVER_CONFIGURATIONS.md` - Updated documentation

- ✅ `README.md` - Documentation update

### Version 2.6 (August 2025) - Unified Configuration
**Description:** Transition to unified configuration - only `dev_server.py` and `./start_dev.sh`

#### 🔄 Configuration Changes:
- **Archive old configurations:** Moving `dev_server.py`, `run_flask_dev.py`, `start_server.sh`, `stop_server.sh` to archive
- **Simple configuration:** Only `run_flask_simple.py` and `./start_dev.sh` in use
- **Documentation simplification:** Updating documentation to show only the new configuration
- **Direct startup:** Updating `app.py` to allow direct startup with Flask development server
- **Creating run_flask_simple.py:** Simple and stable Flask file without auto-reload
- **Adding routes:** Adding routes for `notes` without .html
- **Message improvement:** Transition from alert to notification system

#### 📁 Updated Files:
- ✅ `README.md` - Update to show only the new configuration
- ✅ `backups/20250820_flask_simple_configuration/` - Archive of old configurations
- ✅ `backups/20250820_flask_simple_configuration/README_BACKUP.md` - Backup documentation
- ✅ `Backend/app.py` - Direct startup with Flask development server + new routes
- ✅ `Backend/run_flask_simple.py` - Simple and stable Flask file
- ✅ `start_dev.sh` - Update to use `run_flask_simple.py`

- ✅ `trading-ui/scripts/notes.js` - Success message update (coming soon)
- ✅ `trading-ui/scripts/alerts.js` - Success message update (coming soon)

#### 🎯 Change Benefits:
- ✅ **Single configuration only** - No confusion
- ✅ **Speed** - Server starts in seconds
- ✅ **Stability** - Flask development server stable
- ✅ **Debug mode** - Enabled for development convenience
- ✅ **Detailed logs** - For development and troubleshooting
- ✅ **Simplicity** - Simple and clear configuration
- ✅ **Direct startup** - `app.py` allows direct startup
- ✅ **Development stage configuration** - Specifically adapted for active development

### Version 2.5 (August 2025) - Advanced Filter System and Date Filter Fixes
**Description:** Comprehensive improvement of the filter system with precise date filter fixes

#### 📅 Date Filter Improvements:
- **"This Week" Filter:** Shows data from last Sunday to today inclusive (calendar week)
- **"Week" Filter:** Shows data from 7 days ago to today
- **"MTD" Filter:** Shows data from beginning of calendar month to today
- **"30 Days" Filter:** Shows data from 30 days ago to today
- **"60 Days" Filter:** Shows data from 60 days ago to today
- **"90 Days" Filter:** Shows data from 90 days ago to today
- **"Year" Filter:** Shows data from 365 days ago to today
- **"YTD" Filter:** Shows data from beginning of calendar year to today
- **"Previous Year" Filter:** Shows data from beginning of previous calendar year to its end

#### 🔧 Code Improvements:
- **`getDateRange` Function:** Improved function with precise logic for each date filter
- **Dual Support:** Support for "This Week" and "Week" filters with different logic
- **Bug Fix:** Fixed "Week" filter that showed data from 1970 instead of 7 days ago
- **AppHeader Update:** Added "This Week" filter to filter menu

#### 📊 Updated Files:
- ✅ `trading-ui/scripts/app-header.js` - Added "This Week" filter to menu
- ✅ `trading-ui/scripts/grid-filters.js` - Improved `getDateRange` function with precise logic

#### 🎯 Improved Functions:
```javascript
// Improved function for calculating date ranges
getDateRange(dateRange)

// Support for "This Week" and "Week" filters
case 'השבוע': // Calendar week
case 'שבוע':  // 7 days back
```

### Version 2.4 (August 2025) - Unified Filter System
**Description:** Comprehensive refactoring of the filter system and script architecture

#### 🔄 Script Architecture Refactoring:
- **Function Separation:** Moving page-specific functions to dedicated files
- **`designs.js` File:** Creating dedicated file for planning page with all specific functions
- **`tracking.js` File:** Renaming from `trades.js` to `tracking.js` to match page name
- **Global Functions:** Exposing all required functions through `window` object

#### 🎯 Unified Filter System:
- **`grid-filters.js` File:** Centralizing all shared filter functions
- **`updateGridFromComponentGlobal` Function:** Central function for handling filters on all pages
- **`filterDataByFilters` Function:** Unified function for filtering data by all filter types
- **Multi-Page Support:** Filter support for `planning`, `tracking`, `accounts`, `notes`, `alerts`, `designs`

#### 🔧 Filter Improvements:
- **Account Filter:** Fixed display of "All Accounts" when all accounts are selected
- **Date Filter:** Changed "All" to "All Time" in all instances
- **Account Loading:** Using `loadAllAccountsFromServer` to load all accounts (not just 'open')
- **Status Consistency:** Fixed consistency between `cancelled` and `cancelled` according to database

#### 📄 Page Updates:
- **Planning Page (`planning.html`):** Updated to load `designs.js` instead of embedded code
- **Tracking Page (`tracking.html`):** Updated to load `tracking.js` instead of `trades.js`
- **Accounts Page (`accounts.html`):** Added `updateGridFromComponent` function
- **Notes Page (`notes.html`):** Added `updateGridFromComponent` function
- **Alerts Page (`alerts.html`):** Added `updateGridFromComponent` function
- **Designs Page (`designs.html`):** Added loading of `designs.js`

#### 🗄️ Database Cleanup:
- **Account Deletion:** Deleting accounts without linked trades
- **Trade Updates:** Cancelling open trades before deleting accounts
- **Note Updates:** Ensuring all notes are linked to existing accounts
- **Alert Updates:** Attempting to update alerts with `account_id` (open issue)

#### 🎨 Interface Improvements:
- **RTL Support:** Improved Hebrew and RTL support in filters
- **Dropdown Design:** Improved filter menu design
- **Consistent Text:** Updated filter texts to consistent Hebrew

#### 🔗 New Functions:
```javascript
// Global function for handling filters
window.updateGridFromComponentGlobal(selectedStatuses, selectedTypes, selectedAccounts, selectedDateRange, searchTerm, pageName)

// Page-specific functions
window.updateGridFromComponent = function(selectedStatuses, selectedTypes, selectedDateRange, searchTerm) {
  window.updateGridFromComponentGlobal(selectedStatuses, selectedTypes, [], selectedDateRange, searchTerm, 'pageName');
}

// Function for loading all accounts
window.loadAllAccountsFromServer()
```

#### 📊 Files Created/Updated:
- ✅ `trading-ui/scripts/designs.js` - New file for planning page
- ✅ `trading-ui/scripts/tracking.js` - Renamed from `trades.js`
- ✅ `trading-ui/scripts/grid-filters.js` - Updated filter functions
- ✅ `trading-ui/scripts/app-header.js` - Updated account and date filters
- ✅ `trading-ui/scripts/accounts.js` - Added `updateGridFromComponent` function
- ✅ `trading-ui/scripts/notes.js` - Added `updateGridFromComponent` function
- ✅ `trading-ui/scripts/alerts.js` - Added `updateGridFromComponent` function

#### 🗑️ Deleted Files:
- ❌ `trading-ui/scripts/trades.js` - Replaced by `tracking.js`
- ❌ `trading-ui/scripts/grid-data.js` - Merged into `main.js`

#### 🚨 Issues We Solved:
- **Filter Consistency Issue:** Filters worked on one page and broke another
- **Account Loading Issue:** Account filter displayed deleted accounts from localStorage
- **Status Issue:** Inconsistency between `cancelled` and `cancelled` in database
- **Page Structure Issue:** Planning page didn't load `designs.js` file
- **Global Functions Issue:** Functions weren't available between different files

#### 📚 Lessons Learned:
- **Modular Architecture:** Separating specific functions to dedicated files
- **Global Functions:** Exposing functions through `window` object for availability between files
- **Data Consistency:** Storing data in English in database and translating only in UI
- **Dependency Checking:** Ensuring all required files are loaded on pages
- **Change Documentation:** Detailed documentation of each change for future problem identification

#### 🔍 Quality Tests:
- ✅ All pages load the correct files
- ✅ Filters work consistently on all pages
- ✅ Global functions available between files
- ✅ Filter texts consistent in Hebrew
- ✅ Database data consistent in English

### Version 2.3 (August 2025)
- **JavaScript File Consolidation:** Merging `grid-table.js` and `grid-data.js` into `main.js`
- **Architecture Improvement:** Defining clear rules for function distribution between files
- **Improved Documentation:** Adding detailed documentation about file structure
- **Bug Fixes:** Fixing issues in data loading and filters

### Version 2.2 (August 2025)
- **Bug Fixes:** Fixed `joinedload` error in server
- **UI Improvement:** Fixed section open/close buttons
- **Optimization:** Improved performance in data loading

## 🤝 Project Contribution

### Development Rules:
1. **Documentation:** Every new function must be documented
2. **Testing:** Testing functionality before commit
3. **Backup:** Creating backup before significant changes
4. **Architecture:** Maintaining defined rules for file distribution

### Development Process:
1. Creating new branch
2. Development and documentation
3. Comprehensive testing
4. Creating Pull Request
5. Code Review
6. Merge to main

## 🔗 **Important Links:**

### 🧪 **Testing System:**
- **File**: `Backend/testing_suite/README.md`
- **Content**: Automated tests, security measures, reports
- **When to use**: When you need to run tests or develop new tests

### 🚀 **Server Settings:**
- **File**: `Backend/SERVER_CONFIGURATIONS.md`
- **Content**: Server settings, startup scripts, development environments
- **When to use**: When you need to understand server settings or solve server issues

### 📊 **Table Sorting System:**
- **File**: `documentation/TABLE_SORTING_SYSTEM.md`
- **Content**: Global sorting system, functions, design, extension
- **When to use**: When you need to add sorting to a new page or solve sorting issues

### 🚀 **Server Startup:**
```bash
# Single configuration in use
./start_dev.sh

# Or direct startup
cd Backend && python3 dev_server.py
```

### 🧪 **Running Tests:**
```bash
# Safe tests (recommended)
cd Backend/testing_suite && make test-safe

# All tests
cd Backend/testing_suite && make test

# Specific tests
cd Backend/testing_suite && make test-unit
```

## ⚠️ **Important Differences:**

| Main README | Server Settings | Testing System | Configuration Archive |
|-------------|-------------|----------------|---------------------|
| General Documentation | Server Settings | Code Testing | Old Configurations |
| Architecture | Startup Scripts | Security Measures | Change History |
| Development | Development Environments | Result Reports | Recovery (if needed) |
| UI/UX | Process Management | Bug Detection | Archive |

## 📞 Support

For questions and technical support, contact the development team.

---

**© 2025 TikTrack - All Rights Reserved**

**🎯 Remember: The single configuration in use is `dev_server.py` and `./start_dev.sh`!**

**📚 Updated Documentation:**
- **Table Sorting System**: `documentation/TABLE_SORTING_SYSTEM.md`
- **Complete JSDoc** in all new functions
- **Usage Examples** for each function
- **Extension Guide** for adding sorting to new pages
