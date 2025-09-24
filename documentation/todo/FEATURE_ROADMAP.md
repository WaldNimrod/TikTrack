# Feature Roadmap - TikTrack

> 📋 **כל התכונות המתוכננות הועברו ל**: [../../CENTRAL_TASKS_TODO.md](../../CENTRAL_TASKS_TODO.md)

## 🎯 Planned Features (Moved to Central Tasks)

**כל התכונות המתוכננות הועברו לקובץ המשימות המרכזי.**

---

## 📋 Additional Features (To Be Added)

### 3. Automatic Target & Stop Loss Calculation
**Status:** 🟡 Planned  
**Priority:** High  
**Description:** Automatic calculation of target and stop loss based on default values

**Requirements:**
- [ ] Implement automatic target calculation based on risk/reward ratio
- [ ] Implement automatic stop loss calculation based on volatility/ATR
- [ ] Configurable default values for different market conditions
- [ ] User override capability for calculated values
- [ ] Real-time calculation updates

**Technical Considerations:**
- Integration with price data APIs
- Historical volatility calculations
- Risk management rules engine
- Performance optimization for real-time calculations

---

### 4. Trading Journal Database Design
**Status:** 🟡 Planned  
**Priority:** High  
**Description:** Database schema design for trading journal functionality

**Requirements:**
- [ ] Design journal entries table structure
- [ ] Define relationships with existing tables (trades, plans)
- [ ] Plan for journal categories and tags
- [ ] Consider journal entry types (text, images, charts)
- [ ] Design search and filtering capabilities

**Database Schema Considerations:**
- Journal entries table with rich text support
- Tag system for categorization
- Media attachments support
- Full-text search capabilities
- Journal entry templates

---

### 5. Show Closed Trades in Execution Forms
**Status:** 🟡 Planned  
**Priority:** High  
**Description:** Display closed trades in add/edit execution modals to allow users to add executions to closed trades

**Requirements:**
- [ ] Add "Show Closed Trades" checkbox to add execution modal
- [ ] Add "Show Closed Trades" checkbox to edit execution modal
- [ ] Implement filter logic to display both open and closed trades
- [ ] Add visual indicators (🟢/🔴) to distinguish open vs closed trades
- [ ] Update trade plan dropdown to show all plans (open and closed)
- [ ] Maintain current functionality for open trades
- [ ] Add status indicators in trade selection dropdown
- [ ] **Temporary Implementation:** Show "In Development" message when checkbox is clicked

**UI/UX Considerations:**
- [ ] Clear visual distinction between open and closed trades
- [ ] Intuitive checkbox placement in modal forms
- [ ] Consistent status indicators across the interface
- [ ] Tooltips explaining the feature
- [ ] Temporary "In Development" notification for user feedback

**Technical Considerations:**
- [ ] Update `loadModalData()` function to fetch all trades/plans
- [ ] Modify `updateTickerFromTradePlan()` to handle closed trades
- [ ] Add event handlers for checkbox state changes
- [ ] Ensure proper data validation for closed trades
- [ ] Update API calls to include closed trades in responses
- [ ] Add temporary click handler to show "In Development" message

**Implementation Notes:**
- This feature was partially implemented but needs completion
- Current implementation shows all trade plans but needs refinement
- Need to ensure proper error handling for closed trade selections
- Consider adding confirmation dialogs for closed trade selections

**Immediate Action Required:**
- [ ] Add click handler to "Show Closed Trades" checkbox in add execution modal
- [ ] Add click handler to "Show Closed Trades" checkbox in edit execution modal  
- [ ] Show "In Development" notification when checkbox is clicked
- [ ] Use existing notification system (`showNotification()`)

---

### 6. Data Update Verification Across All Pages
**Status:** 🟡 Planned  
**Priority:** Medium  
**Description:** Implement data update verification and refresh mechanisms

**Requirements:**
- [ ] Real-time data update notifications
- [ ] Automatic page refresh when data changes
- [ ] Manual refresh buttons on all pages
- [ ] Data consistency checks
- [ ] Update status indicators

**Technical Considerations:**
- WebSocket implementation for real-time updates
- Polling fallback mechanism
- Conflict resolution for concurrent updates
- Performance optimization for frequent updates

---

### 6. Field Name Change: "Reasons" to "Strategy"
**Status:** 🟡 Planned  
**Priority:** Low  
**Description:** Rename the "reasons" field to "strategy" in trade planning

**Requirements:**
- [ ] Update database schema (if needed)
- [ ] Update all UI references
- [ ] Update API endpoints
- [ ] Update documentation
- [ ] Ensure backward compatibility

**Technical Considerations:**
- Database migration strategy
- API versioning considerations
- UI text updates across all pages
- Translation updates

---

### 7. Trade-Transaction Association System
**Status:** 🟡 Planned  
**Priority:** High  
**Description:** Associate all transactions with trades and display unassociated transactions

**Requirements:**
- [ ] Create transaction-trade association table
- [ ] Implement association logic
- [ ] Display unassociated transactions
- [ ] Bulk association tools
- [ ] Association validation rules

**Technical Considerations:**
- Many-to-many relationship handling
- Transaction matching algorithms
- Performance for large transaction volumes
- Data integrity constraints

---

### 8. Price Data & Ticker Information API
**Status:** 🟡 Planned  
**Priority:** Critical  
**Description:** Function to retrieve prices and ticker information

**Requirements:**
- [ ] Integrate with price data provider (Yahoo Finance, Alpha Vantage, etc.)
- [ ] Real-time price updates
- [ ] Historical price data
- [ ] Ticker information (company details, sector, etc.)
- [ ] Price alerts and notifications

**Technical Considerations:**
- API rate limiting and caching
- Multiple data source fallbacks
- Real-time vs delayed data options
- Data storage and caching strategy
- Error handling for API failures

---

### 9. Trading Journal Implementation
**Status:** 🟡 Planned  
**Priority:** High  
**Description:** Full trading journal functionality

**Requirements:**
- [ ] Journal entry creation and editing
- [ ] Rich text editor with formatting
- [ ] Image and chart attachments
- [ ] Journal entry templates
- [ ] Search and filtering
- [ ] Export functionality

**Features:**
- [ ] Daily/weekly journal summaries
- [ ] Performance tracking integration
- [ ] Journal entry categories
- [ ] Journal analytics and insights

---

### 10. Tagging System
**Status:** 🟡 Planned  
**Priority:** Medium  
**Description:** Comprehensive tagging system for all entities

**Requirements:**
- [ ] Tag creation and management
- [ ] Tag assignment to trades, plans, journal entries
- [ ] Tag-based filtering and search
- [ ] Tag analytics and usage statistics
- [ ] Tag suggestions and auto-complete

**Features:**
- [ ] Color-coded tags
- [ ] Tag hierarchies
- [ ] Bulk tag operations
- [ ] Tag export/import

---

### 11. Symbol Page
**Status:** 🟡 Planned  
**Priority:** Medium  
**Description:** Dedicated page for symbol/ticker information

**Requirements:**
- [ ] Symbol overview with key metrics
- [ ] Price charts and technical indicators
- [ ] News and fundamental data
- [ ] Related trades and plans
- [ ] Symbol watchlist integration

**Features:**
- [ ] Interactive charts
- [ ] Technical analysis tools
- [ ] Symbol comparison
- [ ] Market sentiment indicators

---

### 12. Rich Comments System
**Status:** 🟡 Planned  
**Priority:** Medium  
**Description:** Rich text comments for trades and trade plans

**Requirements:**
- [ ] Rich text editor for trade comments
- [ ] Rich text editor for trade plan comments
- [ ] Image and chart attachments
- [ ] Comment formatting options
- [ ] Comment history and versioning

**Location:** `trades.js:495`, `trades.js:1345`, `trade_plans.js:335`

---

### 13. Trade Alerts System
**Status:** 🟡 Planned  
**Priority:** Medium  
**Description:** Alert system for individual trades

**Requirements:**
- [ ] Create alerts for specific trades
- [ ] Alert notification system
- [ ] Alert management interface
- [ ] Alert history tracking

**Location:** `trades.js:501`, `trade_plans.js:341`

---

### 14. Advanced Entry Conditions
**Status:** 🟡 Planned  
**Priority:** Medium  
**Description:** Advanced entry conditions for trade plans

**Requirements:**
- [ ] Complex entry condition builder
- [ ] Multiple condition combinations
- [ ] Condition validation
- [ ] Condition templates

**Location:** `trade_plans.js:2132`

---

### 15. Advanced Reasons/Strategy System
**Status:** 🟡 Planned  
**Priority:** Medium  
**Description:** Advanced reasons and strategy system for trade plans

**Requirements:**
- [ ] Structured strategy builder
- [ ] Strategy templates
- [ ] Strategy validation
- [ ] Strategy analytics

**Location:** `trade_plans.js:2145`

---

### 16. Full Position Closing Interface
**Status:** 🟡 Planned  
**Priority:** High  
**Description:** Complete position closing interface including partial closes

**Requirements:**
- [ ] Partial position closing
- [ ] Position size management
- [ ] Closing confirmation dialogs
- [ ] Closing history tracking

**Location:** `trades.js:1414`

---

### 17. Transaction Association System
**Status:** 🟡 Planned  
**Priority:** High  
**Description:** Associate and unassociate transactions with trades

**Requirements:**
- [ ] Transaction-trade association interface
- [ ] Bulk association tools
- [ ] Association validation
- [ ] Unassociation functionality

**Location:** `trades.js:1449`, `trades.js:1460`

---

### 18. Account Management Functions
**Status:** 🟡 Planned  
**Priority:** Medium  
**Description:** Edit and delete account functions

**Requirements:**
- [ ] Account editing interface
- [ ] Account deletion with confirmation
- [ ] Account data validation
- [ ] Account history tracking

**Location:** `accounts.js:1656`, `accounts.js:1663`

---

### 19. Database Record Management
**Status:** 🟡 Planned  
**Priority:** Medium  
**Description:** Add and cancel records in database tables

**Requirements:**
- [ ] Add record functionality for all tables
- [ ] Cancel record functionality
- [ ] Record validation
- [ ] Bulk operations

**Location:** `database.js:910`, `database.js:918`, `database.js:926`, `database.js:934`, `database.js:942`

---

### 20. Test Management Functions
**Status:** 🟡 Planned  
**Priority:** Low  
**Description:** Edit test functions

**Requirements:**
- [ ] Test editing interface
- [ ] Test validation
- [ ] Test history tracking

**Location:** Removed - tests functionality deleted

---

### 21. Linked Items View
**Status:** 🟡 Planned  
**Priority:** Medium  
**Description:** View linked items functionality

**Requirements:**
- [ ] Linked items display interface
- [ ] Item relationship visualization
- [ ] Navigation between linked items


---

### 22. Object Linking System
**Status:** 🟡 Planned  
**Priority:** Medium  
**Description:** Link objects and navigate to related objects

**Requirements:**
- [ ] Object linking interface
- [ ] Related object navigation
- [ ] Link validation
- [ ] Link history

**Location:** `active-alerts-component.js:1033`, `active-alerts-component.js:1249`, `active-alerts-component.js:1258`

---

### 23. Advanced Alert Types
**Status:** 🟡 Planned  
**Priority:** Medium  
**Description:** Volume alerts and custom alerts

**Requirements:**
- [ ] Volume-based alerts
- [ ] Custom alert conditions
- [ ] Alert type validation
- [ ] Alert templates

**Location:** `alerts.js:846`, `alerts.js:848`, `alerts.js:850`

---

### 24. General Functionality Placeholders
**Status:** 🟡 Planned  
**Priority:** Low  
**Description:** Various general functionality placeholders

**Requirements:**
- [ ] Identify specific functionality needed
- [ ] Implement placeholder functions
- [ ] Add proper error handling

**Location:** `trades.js:507`, `trade_plans.js:323`, `trade_plans.js:329`

---

### 25. Linked Objects Modal Windows
**Status:** 🟡 Planned  
**Priority:** Medium  
**Description:** Modal windows for linked objects module with two implementation phases

**Phase A - Table Design:**
- [ ] Design linked objects module in tables
- [ ] Create table structure for linked objects
- [ ] Implement linked objects display in grid format
- [ ] Add linking/unlinking functionality in tables
- [ ] Design table-based navigation between linked objects

**Phase B - Modal Design:**
- [ ] Design linked objects module in modal windows
- [ ] Create modal interface for linked objects management
- [ ] Implement modal-based linking/unlinking functionality
- [ ] Add modal navigation between linked objects
- [ ] Create test window 2 for modal functionality

**Technical Requirements:**
- [ ] Consistent UI/UX with existing modal patterns
- [ ] Responsive design for different screen sizes
- [ ] Real-time updates when objects are linked/unlinked
- [ ] Proper error handling and validation
- [ ] Integration with existing object linking system

**Features:**
- [ ] Visual representation of object relationships
- [ ] Bulk linking/unlinking operations
- [ ] Search and filter linked objects
- [ ] Relationship type indicators
- [ ] Quick navigation between related objects

---

### 26. Open Plans Field for Tickers
**Status:** 🟡 Planned  
**Priority:** High  
**Description:** Add open_plans field to tickers table with automatic database constraint updates

**Requirements:**
- [ ] Add open_plans field to tickers table (Boolean, default=False)
- [ ] Create database triggers for automatic updates on trade_plans table changes
- [ ] Implement SQLAlchemy event listeners for automatic updates
- [ ] Create migration script for database schema changes
- [ ] Update ticker model to include open_plans field
- [ ] Add open_plans to ticker API responses
- [ ] Update UI to display open_plans status
- [ ] Implement real-time updates for open_plans field

**Database Triggers:**
- [ ] trigger_trade_plan_insert_open_plans (AFTER INSERT)
- [ ] trigger_trade_plan_update_open_plans (AFTER UPDATE)  
- [ ] trigger_trade_plan_delete_open_plans (AFTER DELETE)

**Technical Requirements:**
- [ ] Automatic field update when trade plans status changes to/from 'open'
- [ ] Consistent behavior with existing active_trades field
- [ ] Performance optimization for frequent updates
- [ ] Proper error handling and rollback mechanisms
- [ ] Integration with existing ticker update mechanisms

**Features:**
- [ ] Real-time open plans status for all tickers
- [ ] Fast filtering of tickers with open plans
- [ ] Consistent data integrity across all operations
- [ ] Enhanced ticker overview with both active trades and open plans
- [ ] Improved data update performance for planning operations

**Benefits:**
- [ ] Faster data retrieval for tickers with open plans
- [ ] Consistent data integrity without manual updates
- [ ] Enhanced user experience with real-time status updates
- [ ] Better performance for planning-related operations
- [ ] Foundation for advanced planning features

---

### 27. Preferences Page - Default Filter Parameters Not Saving
**Status:** 🟡 Planned  
**Priority:** High  
**Description:** Fix issue where changing default filter parameters in preferences page shows success message but changes are not saved and disappear on refresh

**Requirements:**
- [ ] Investigate why preferences API returns success but file is not updated
- [ ] Fix file writing issue in preferences API endpoint
- [ ] Ensure changes persist after page refresh
- [ ] Add proper error handling for file write failures
- [ ] Test all preference types (status, type, account, date range, search filters)

**Technical Requirements:**
- [ ] Debug file path resolution in preferences.py
- [ ] Add comprehensive logging for file operations
- [ ] Verify file permissions and directory access
- [ ] Test API endpoint with different preference types
- [ ] Ensure backward compatibility with existing preferences

**Features:**
- [ ] Reliable preference saving for all filter types
- [ ] Proper error messages when saving fails
- [ ] Consistent behavior across all preference settings
- [ ] Persistent changes after page refresh

**Benefits:**
- [ ] Users can successfully customize their default filters
- [ ] Improved user experience with reliable settings
- [ ] Consistent behavior across the application
- [ ] Foundation for future preference features

---

### 28. ALERTS SYSTEM - מערכת התראות עסקיות לתנאי שוק
**Status:** 🟡 Planned  
**Priority:** Medium  
**Description:** מערכת התראות עסקיות אוטומטיות לתנאי שוק, הועבר מ-notification-system.js

**Requirements:**
- [ ] **createAlert** - יצירת התראה עסקית חדשה לתנאי שוק
- [ ] **updateAlert** - עדכון התראה עסקית קיימת
- [ ] **markAlertAsTriggered** - סימון התראה כמופעלת כאשר התנאים מתקיימים
- [ ] **markAlertAsRead** - סימון התראה כנקראה על ידי המשתמש

**Technical Requirements:**
- [ ] Integration with market data APIs
- [ ] Real-time condition monitoring
- [ ] Database schema for alerts storage
- [ ] User notification system integration
- [ ] Alert history and management interface

**Features:**
- [ ] Business alerts for market conditions
- [ ] Automatic alert triggering
- [ ] User alert management
- [ ] Alert history tracking
- [ ] Customizable alert conditions

**Benefits:**
- [ ] Proactive market condition notifications
- [ ] Improved trading decision support
- [ ] Automated market monitoring
- [ ] Better risk management

---

### 29. Top Section Spacing Enhancement
**Status:** 🟡 Planned  
**Priority:** Low  
**Description:** Add consistent top margin/spacing to top-section elements across all pages

**Requirements:**
- [ ] Implement consistent 15px top margin for all top-section elements
- [ ] Ensure spacing works across all page types (tickers, accounts, alerts, etc.)
- [ ] Test spacing with different screen sizes and orientations
- [ ] Verify spacing doesn't conflict with existing header system
- [ ] Document spacing standards for future development

**Technical Requirements:**
- [ ] CSS implementation with proper specificity
- [ ] Cross-browser compatibility testing
- [ ] Mobile responsiveness verification
- [ ] Integration with existing page layout system
- [ ] Performance optimization for CSS rules

**Features:**
- [ ] Consistent visual spacing across all pages
- [ ] Improved page layout consistency
- [ ] Better visual hierarchy between sections
- [ ] Enhanced user experience with proper spacing

**Benefits:**
- [ ] More professional and polished appearance
- [ ] Consistent user experience across all pages
- [ ] Better visual organization of page content
- [ ] Foundation for future layout improvements

---

## 🚀 Implementation Priority

### Phase 1 - Critical Foundation
1. **Price Data & Ticker Information API** (Critical)
2. **Preferences Page - Default Filter Parameters Not Saving** (High) - Bug fix
3. **Trade Plan & Trade Duplication** (High)
4. **Trading Journal Database Design** (High)
5. **Transaction Association System** (High) - Found in code
6. **Full Position Closing Interface** (High) - Found in code
7. **Open Plans Field for Tickers** (High) - New feature
8. **Style Demonstration Page Structure Fix** (High) - Manual container organization

### Phase 2 - Core Features
6. **Trading Journal Implementation** (High)
7. **Automatic Target & Stop Loss Calculation** (High)
8. **Template System Foundation** (High)
9. **Account Management Functions** (Medium) - Found in code
10. **Database Record Management** (Medium) - Found in code

### Phase 3 - Enhancement Features
11. **Tagging System** (Medium)
12. **Data Update Verification** (Medium)
13. **Rich Comments System** (Medium) - Found in code
14. **Trade Alerts System** (Medium) - Found in code
15. **Advanced Alert Types** (Medium) - Found in code
16. **Linked Items View** (Medium) - Found in code
17. **Object Linking System** (Medium) - Found in code
18. **Linked Objects Modal Windows** (Medium) - New feature

### Phase 4 - Advanced Features
19. **Symbol Page** (Medium)
20. **Advanced Entry Conditions** (Medium) - Found in code
21. **Advanced Reasons/Strategy System** (Medium) - Found in code
22. **Advanced Template Features** (Medium)
23. **Test Management Functions** (Low) - Found in code
24. **General Functionality Placeholders** (Low) - Found in code
25. **Field Name Change: "Reasons" to "Strategy"** (Low)

---

## 📝 Notes

- All features should maintain consistency with existing UI/UX patterns
- Consider mobile responsiveness for all new features
- Ensure proper error handling and user feedback
- Maintain database integrity and performance
- Follow existing code organization patterns

---

*Last Updated: 2 בספטמבר 2025*
*Version: 1.1*
