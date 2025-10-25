# API Reference - TikTrack Systems

## Overview
תיעוד API מלא לכל 35+ המערכות במערכת TikTrack.

## Core Systems (חבילת בסיס)

### 1. Notification System
**File:** `notification-system.md`  
**Location:** `trading-ui/scripts/notification-system.js`  
**Functions:** 9 core functions + 5 categories  
**Features:** 4 notification modes, global confirm replacement

### 2. Unified Cache Manager
**File:** `unified-cache-manager.md`  
**Location:** `trading-ui/scripts/unified-cache-manager.js`  
**Functions:** 15+ cache management functions  
**Features:** 4 cache layers, automatic sync, memory management

### 3. Field Renderer Service
**File:** `field-renderer-service.md`  
**Location:** `trading-ui/scripts/services/field-renderer-service.js`  
**Functions:** 20+ rendering functions  
**Features:** Status badges, currency display, date formatting, linked entities

## UI Systems (חבילת UI)

### 4. Button System
**File:** `button-system.md` (in 02-ARCHITECTURE/FRONTEND/)  
**Location:** `trading-ui/scripts/button-system-init.js`  
**Functions:** 30+ button types  
**Features:** Action menus, dynamic colors, RTL support

### 5. Header System
**File:** `header-system.md` (in 02-ARCHITECTURE/FRONTEND/)  
**Location:** `trading-ui/scripts/header-system.js`  
**Functions:** Menu management, filter integration  
**Features:** RTL support, responsive design

### 6. Color Scheme System
**File:** `color-scheme-system.md` (in 02-ARCHITECTURE/FRONTEND/)  
**Location:** `trading-ui/scripts/color-scheme-system.js`  
**Functions:** Dynamic color management  
**Features:** User preferences, entity-based colors

## Data Systems (חבילת נתונים)

### 7. Table System
**File:** `table-system.md` (in 02-ARCHITECTURE/FRONTEND/)  
**Location:** `trading-ui/scripts/tables.js`  
**Functions:** Table management, sorting, filtering  
**Features:** Dynamic tables, CRUD operations

### 8. Data Utils
**File:** `data-utils.md` (in 02-ARCHITECTURE/FRONTEND/)  
**Location:** `trading-ui/scripts/data-utils.js`  
**Functions:** Data processing utilities  
**Features:** Data transformation, validation

### 9. Date Utilities
**File:** `date-utils.md` (in 02-ARCHITECTURE/FRONTEND/)  
**Location:** `trading-ui/scripts/date-utils.js`  
**Functions:** Date formatting, timezone handling  
**Features:** RTL date display, multiple formats

## Advanced Systems (מערכות מתקדמות)

### 10. Conditions System
**File:** `conditions-system.md` (in 02-ARCHITECTURE/FRONTEND/)  
**Location:** `trading-ui/scripts/conditions/`  
**Functions:** 6 trading methods  
**Features:** Builder pattern, validation, translation

### 11. External Data Integration
**File:** `external-data.md` (in 02-ARCHITECTURE/FRONTEND/)  
**Location:** `trading-ui/scripts/external-data-service.js`  
**Functions:** Yahoo Finance integration  
**Features:** Real-time quotes, data refresh

### 12. Logger Service
**File:** `logger-service.md` (in 02-ARCHITECTURE/FRONTEND/)  
**Location:** `trading-ui/scripts/logger-service.js`  
**Functions:** Logging management  
**Features:** Multiple log levels, backend integration

## System Management (ניהול מערכת)

### 13. System Management
**File:** `system-management.md` (in 02-ARCHITECTURE/FRONTEND/)  
**Location:** `trading-ui/scripts/system-management.js`  
**Functions:** System monitoring, health checks  
**Features:** Performance tracking, error reporting

### 14. Background Tasks
**File:** `background-tasks.md` (in 02-ARCHITECTURE/FRONTEND/)  
**Location:** `trading-ui/scripts/background-tasks.js`  
**Functions:** Task scheduling, execution  
**Features:** Real-time notifications, status tracking

## Chart Systems (מערכות גרפים)

### 15. Chart Management
**File:** `chart-management.md` (in 02-ARCHITECTURE/FRONTEND/)  
**Location:** `trading-ui/scripts/chart-management.js`  
**Functions:** Chart creation, rendering  
**Features:** Multiple chart types, real-time updates

### 16. Chart Utils
**File:** `chart-utils.md` (in 02-ARCHITECTURE/FRONTEND/)  
**Location:** `trading-ui/scripts/chart-utils.js`  
**Functions:** Chart utilities, data processing  
**Features:** Data transformation, chart configuration

## Preferences System (מערכת העדפות)

### 17. Preferences Core
**File:** `preferences-core.md` (in 02-ARCHITECTURE/FRONTEND/)  
**Location:** `trading-ui/scripts/preferences-core-new.js`  
**Functions:** 60+ preferences management  
**Features:** Dynamic colors, validation, persistence

### 18. Preferences UI
**File:** `preferences-ui.md` (in 02-ARCHITECTURE/FRONTEND/)  
**Location:** `trading-ui/scripts/preferences-ui.js`  
**Functions:** UI management for preferences  
**Features:** Form handling, validation, user feedback

## Entity Systems (מערכות ישויות)

### 19. Entity Details Modal
**File:** `entity-details-modal.md` (in 02-ARCHITECTURE/FRONTEND/)  
**Location:** `trading-ui/scripts/entity-details-modal.js`  
**Functions:** Modal management, entity display  
**Features:** Dynamic content, CRUD operations

### 20. Linked Items System
**File:** `linked-items-system.md` (in 02-ARCHITECTURE/FRONTEND/)  
**Location:** `trading-ui/scripts/linked-items.js`  
**Functions:** Linked entity management  
**Features:** Backend + Frontend + UI integration

## Utility Systems (מערכות עזר)

### 21. UI Utils
**File:** `ui-utils.md` (in 02-ARCHITECTURE/FRONTEND/)  
**Location:** `trading-ui/scripts/ui-utils.js`  
**Functions:** General UI utilities  
**Features:** DOM manipulation, event handling

### 22. Validation Utils
**File:** `validation-utils.md` (in 02-ARCHITECTURE/FRONTEND/)  
**Location:** `trading-ui/scripts/validation-utils.js`  
**Functions:** Data validation  
**Features:** Form validation, data integrity

### 23. Translation Utils
**File:** `translation-utils.md` (in 02-ARCHITECTURE/FRONTEND/)  
**Location:** `trading-ui/scripts/translation-utils.js`  
**Functions:** Text translation  
**Features:** RTL support, dynamic translation

## File Structure
```
documentation/03-API_REFERENCE/
├── README.md                           # This file
├── notification-system.md              # Notification System API
├── unified-cache-manager.md            # Cache Manager API
├── field-renderer-service.md           # Field Renderer API
├── button-system.md                    # Button System API
├── header-system.md                    # Header System API
├── color-scheme-system.md              # Color Scheme API
├── table-system.md                     # Table System API
├── data-utils.md                       # Data Utils API
├── date-utils.md                       # Date Utils API
├── conditions-system.md                # Conditions System API
├── external-data.md                    # External Data API
├── logger-service.md                   # Logger Service API
├── system-management.md                # System Management API
├── background-tasks.md                 # Background Tasks API
├── chart-management.md                 # Chart Management API
├── chart-utils.md                      # Chart Utils API
├── preferences-core.md                 # Preferences Core API
├── preferences-ui.md                   # Preferences UI API
├── entity-details-modal.md             # Entity Details API
├── linked-items-system.md              # Linked Items API
├── ui-utils.md                         # UI Utils API
├── validation-utils.md                 # Validation Utils API
└── translation-utils.md                # Translation Utils API
```

## Usage Guidelines

### 1. Finding the Right System
- **Notifications:** Use Notification System
- **Caching:** Use Unified Cache Manager  
- **Field Display:** Use Field Renderer Service
- **Buttons:** Use Button System
- **Tables:** Use Table System
- **Charts:** Use Chart Management

### 2. Integration Patterns
```javascript
// Basic pattern
const result = SystemName.functionName(params);

// With error handling
try {
  const result = SystemName.functionName(params);
} catch (error) {
  window.Logger?.error('Error in SystemName', error);
  window.showErrorNotification('Error message');
}
```

### 3. Best Practices
- Always check if system is available
- Use appropriate error handling
- Follow naming conventions
- Use JSDoc for custom functions

## Status
- **Completed:** 6/35+ systems documented
- **In Progress:** API Reference creation
- **Pending:** Remaining 29+ systems

### ✅ **Completed Systems:**
1. **Notification System** - 9 functions + 5 categories
2. **Unified Cache Manager** - 15+ functions + 4 layers  
3. **Field Renderer Service** - 20+ functions + 138 locations
4. **Button System** - 30+ button types + action menus
5. **Table System** - 15+ table functions + performance optimization
6. **Logger Service** - 5 log levels + server integration

## Last Updated
January 24, 2025
