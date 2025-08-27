# 📚 Quick Index - TikTrack

## 🚀 **Quick Access to All Documentation**

### 📁 **Main Files**
- **[README.md](../README.md)** - Main project documentation
- **[CHANGELOG.md](../CHANGELOG.md)** - Detailed changelog
- **[QUICK_INDEX.md](QUICK_INDEX.md)** - This index (quick access)

## 🚀 **System Activation (Unified Configuration)**

### ✅ **Single Configuration in Use:**
- **Server file:** `Backend/dev_server.py`
- **Activation script:** `./start_dev.sh`
- **Features:** Auto-reload, monitoring, health checks, automatic restart

### 🎯 **Activation:**
```bash
# Quick activation (recommended)
./start_dev.sh

# Or direct activation
cd Backend && python3 dev_server.py
```

### 📊 **Benefits of Unified Configuration:**
- ✅ **Single configuration only** - no confusion
- ✅ **Auto-reload** - server updates automatically with changes
- ✅ **Monitoring** - automatic health checks
- ✅ **Automatic restart** - in case of crash
- ✅ **Detailed logs** - for development and troubleshooting
- ✅ **Stability** - based on fixed Waitress

### 📁 **Old Configurations Archive:**
- **Location:** `Backend/backups/20250819_server_configurations/`
- **Date:** August 19, 2025
- **Reason:** Transition to unified configuration
- **Status:** Archive - not in use

## 🏗️ **File Architecture (New - Version 2.3)**

#### 📁 **JavaScript Files**
- **[main.js](../trading-ui/scripts/main.js)** - **Main general file** (new!)
  - Contains all shared functionality
  - Unification of `grid-table.js` and `grid-data.js`
  - General functions for the entire site

#### 📁 **Entity-Specific Files**
- **[accounts.js](../trading-ui/scripts/accounts.js)** - Account functions
- **[trades.js](../trading-ui/scripts/trades.js)** - Trade functions
- **[alerts.js](../trading-ui/scripts/alerts.js)** - Alert functions
- **[notes.js](../trading-ui/scripts/notes.js)** - Note functions

#### 📁 **Modular Files**
- **[grid-filters.js](../trading-ui/scripts/grid-filters.js)** - Filter system
- **[app-header.js](../trading-ui/scripts/app-header.js)** - Application header
- **[auth.js](../trading-ui/scripts/auth.js)** - User authentication

#### 📁 **Backup Files**
- **[20250818_js_unification/](../backups/20250818_js_unification/)** - JavaScript files unification backup (Version 2.3)
  - `grid-table.js.backup` - Old file backup
  - `grid-data.js.backup` - Old file backup
  - `main.js.backup` - Original file backup
  - `README.md` - Backup documentation

### 🔧 **Important Development Rules**
1. **General functions** → `main.js`
2. **Entity-specific functions** → dedicated file (e.g., `accounts.js`)
3. **All pages load** `main.js` instead of old files

### 📋 **Main Pages**
- **[index.html](../trading-ui/index.html)** - Main page
- **[database.html](../trading-ui/database.html)** - Database page (central)
- **[accounts.html](../trading-ui/accounts.html)** - Accounts page
- **[planning.html](../trading-ui/planning.html)** - Trade planning page
- **[tracking.html](../trading-ui/tracking.html)** - Trade tracking page
- **[notes.html](../trading-ui/notes.html)** - Notes page

### 🔗 **Detailed Documentation by Topics**

#### 📊 **Database**
- **[DATABASE_CHANGES_AUGUST_2025.md](database/DATABASE_CHANGES_AUGUST_2025.md)** - Database changes
- **[TRADE_PLAN_LINKING_RULES.md](database/TRADE_PLAN_LINKING_RULES.md)** - Trade-plan linking rules

#### 🖥️ **User Interface**
- **[DOUBLE_CONFIRMATION_SYSTEM.md](frontend/DOUBLE_CONFIRMATION_SYSTEM.md)** - Double confirmation system
- **[ACTIVE_ALERTS_COMPONENT.md](frontend/README_ACTIVE_ALERTS_COMPONENT.md)** - Active alerts component

#### 🎨 **CSS System**
- **[CSS_ARCHITECTURE.md](frontend/css/CSS_ARCHITECTURE.md)** - CSS architecture and organization
- **[CSS_VARIABLES.md](frontend/css/CSS_VARIABLES.md)** - CSS variables reference
- **[COMPONENT_STYLE_GUIDE.md](frontend/css/COMPONENT_STYLE_GUIDE.md)** - Component style guide

#### ⚙️ **Backend**
- **[ALERT_SYSTEM_DOCUMENTATION.md](../Backend/ALERT_SYSTEM_DOCUMENTATION.md)** - Alert system
- **[README_TESTING.md](../Backend/README_TESTING.md)** - Testing system
- **[testing_suite/README.md](../Backend/testing_suite/README.md)** - Testing system documentation

#### 🚀 **Deployment and Stability**
- **[README_SERVER_STABILITY.md](deployment/README_SERVER_STABILITY.md)** - Server stability

### 🧪 **Testing System**
- **[testing_suite/](../Backend/testing_suite/)** - Comprehensive testing system
  - **[unit_tests/](../Backend/testing_suite/unit_tests/)** - Unit tests
  - **[integration_tests/](../Backend/testing_suite/integration_tests/)** - Integration tests
  - **[e2e_tests/](../Backend/testing_suite/e2e_tests/)** - End-to-end tests
  - **[performance_tests/](../Backend/testing_suite/performance_tests/)** - Performance tests
  - **[load_tests/](../Backend/testing_suite/load_tests/)** - Load tests
  - **[security_tests/](../Backend/testing_suite/security_tests/)** - Security tests

### 📝 **API Documentation**
- **Swagger UI:** http://127.0.0.1:8080/api/docs (when server is running)
- **[API Endpoints](api/README.md)** - Endpoint documentation

### 🔧 **Activation Scripts**
- **[start_dev.sh](../start_dev.sh)** - Server activation (single configuration)
- **[stop_server.sh](../stop_server.sh)** - Server shutdown
- **[setup_autostart.sh](../setup_autostart.sh)** - Auto-start setup

### 📊 **Project Status**
- **Current version:** 2.6
- **Test status:** 23 tests passing, 2 skipped
- **Server status:** Stable with automatic monitoring
- **Configuration:** Unified - only `dev_server.py` and `./start_dev.sh`

### 🆕 **Recent Changes (Version 2.6)**
- **Unified configuration:** Transition to `dev_server.py` and `./start_dev.sh` only
- **Old configurations archive:** Moving `run_stable.py`, `run_waitress_fixed.py`, `SERVER_CONFIGURATIONS.md` to archive
- **Documentation simplification:** Updating documentation to show only the new configuration

### 🚨 **Known Issues**
- **Function `get_by_account_and_status`:** Returns all open trades in the system instead of only the specific account's trades
  - **Location:** `Backend/services/trade_service.py`
  - **Status:** Identified, waiting for fix

### 📞 **Support**
For questions and technical support, contact the development team.

---

**© 2025 TikTrack - All rights reserved**
