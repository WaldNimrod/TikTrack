# JavaScript Architecture Documentation - TikTrack

## 📋 Overview

This document describes the comprehensive JavaScript architecture implemented in TikTrack, featuring a modular system with 40+ organized script files, clear separation of concerns, and a complete Chart Management System.

**🔄 Last Updated:** September 22, 2025 - Added Unified IndexedDB System Specification

## 🗂️ Global Functions Index

### 📊 Core System Functions (`main.js`)
| Function | Description |
|----------|-------------|
| `window.initializeApplication()` | Initialize the entire application |
| `window.checkDependencies()` | Check if all required modules are available |
| `window.initializeCoreSystems()` | Initialize header, notification systems, and global confirm replacement |
| `window.initializeCurrentPage()` | Initialize current page functionality |
| `window.initializeDynamicColorScheme()` | Initialize dynamic color scheme system |
| `window.isModuleAvailable(moduleName, functionName)` | Check if a module/function is available |
| `window.getSystemInfo()` | Get system information and status |
| `window.closeModalGlobal(modalId)` | Close modal globally |
| `window.filterDataByFilters(data, pageName)` | Filter data by page-specific filters |
| `window.updateSortIcons(tableType, activeColumnIndex, direction)` | Update sort icons in tables |
| `window.restoreAllSectionStates()` | Restore all section states from localStorage |

### 🔄 Global confirm() Replacement System (NEW!)
| Function | Description |
|----------|-------------|
| `window.confirm()` | **OVERRIDDEN** - Now shows custom styled confirmation dialog |
| `window._originalConfirm` | Original browser confirm function (backup) |
| `window.showConfirmationDialog()` | Custom confirmation dialog with styling |
| `window.globalConfirm()` | Alternative confirmation function |
| `window.overrideNativeConfirm()` | Function to override native confirm |

### 🎨 UI Utilities (`ui-utils.js`)
| Function | Description |
|----------|-------------|
| `window.showModal(modalId)` | Show modal dialog |
| `window.calculateStopPrice(entryPrice, percentage)` | Calculate stop loss price |
| `window.calculateTargetPrice(entryPrice, percentage)` | Calculate target price |
| `window.calculatePercentageFromPrice(entryPrice, targetPrice)` | Calculate percentage from prices |
| `window.updatePricesFromPercentages()` | Update prices based on percentages |
| `window.updatePercentagesFromPrices()` | Update percentages based on prices |
| `window.formatPercentage(value)` | Format percentage display |
| `window.formatPrice(value)` | Format price display |
| `window.cancelItem(itemId, itemType)` | Cancel an item (ticker, trade, etc.) |
| `window.performItemCancellation(itemId, itemType)` | Perform item cancellation |
| `window.toggleTopSection()` | Toggle top page sections |
| `window.toggleMainSection()` | Toggle main page sections |
| `window.toggleSection(sectionId)` | Toggle specific section |
| `window.toggleAllSections()` | Toggle all sections at once |
| `window.restoreSectionStates()` | Restore section states |
| `window.enhancedTableRefresh(loadDataFunction, updateActiveFieldsFunction, operationName, delay)` | Enhanced table refresh with DOM reflow |
| `window.handleApiResponseWithRefresh(response, options)` | Handle API responses with automatic table refresh |
| `window.getPageDataFunctions(pageName)` | Get page-specific data functions |
| `window.autoRefreshCurrentPage(operationName)` | Auto-refresh current page |
| `window.showSecondConfirmationModal(itemId, itemType, action)` | Show second confirmation modal |
| `window.generateActionButtons(item, tableType)` | Generate action buttons for table items |
| `window.loadTableActionButtons()` | Load action buttons for tables |
| `window.viewTickerDetails(tickerId)` | View ticker details |
| `window.viewLinkedItems(itemId, itemType)` | View linked items |
| `window.editTicker(tickerId)` | Edit ticker |
| `window.cancelTicker(tickerId)` | Cancel ticker |
| `window.restoreTicker(tickerId)` | Restore ticker |
| `window.deleteTicker(tickerId)` | Delete ticker |
| `window.loadSectionStates()` | Load section states from localStorage |

### 📊 Data Utilities (`data-utils.js`)
| Function | Description |
|----------|-------------|
| `window.isNumeric(value)` | Check if value is numeric |
| `window.loadCurrenciesFromServer()` | Load currencies from server |
| `window.getCurrencyDisplay(currencyId)` | Get currency display name |
| `window.generateCurrencyOptions(selectedId)` | Generate currency options for selects |
| `window.apiCall(url, options)` | Make API calls with error handling |
| `window.calculateDefaultPrices(entryPrice, stopLossPercent, targetPercent)` | Calculate default prices |
| `window.convertAmountToShares(amount, price)` | Convert amount to shares |
| `window.convertSharesToAmount(shares, price)` | Convert shares to amount |
| `window.getUserPreference(preferenceName)` | Get user preference |
| `window.loadDataFromAPI(endpoint, options)` | Load data from API |
| `window.validateDataStructure(data, type)` | Validate data structure |
| `window.filterDataBySearch(data, searchTerm)` | Filter data by search term |
| `window.validateRequired(value, fieldName)` | Validate required field |
| `window.validateNumber(value, fieldName, min, max)` | Validate number field |
| `window.validateDate(value, fieldName)` | Validate date field |

### ✅ Validation Utilities (`validation-utils.js`)
| Function | Description |
|----------|-------------|
| `window.isValidDate(dateString)` | Validate date string |
| `window.isValidEmail(email)` | Validate email address |
| `window.isValidPhone(phone)` | Validate phone number |
| `window.showFieldError(fieldId, message)` | Show field error message |
| `window.showFieldSuccess(fieldId, message)` | Show field success message |
| `window.clearFieldError(fieldId)` | Clear field error |
| `window.clearFieldValidation(fieldId)` | Clear field validation |
| `window.clearValidationErrors()` | Clear all validation errors |
| `window.validateForm(formId, rules)` | Validate entire form |
| `window.validateField(fieldId, rules)` | Validate single field |
| `window.validateTextField(fieldId, rules)` | Validate text field |
| `window.validateNumberField(fieldId, rules)` | Validate number field |
| `window.validateEmailField(fieldId, rules)` | Validate email field |
| `window.validateDateField(fieldId, rules)` | Validate date field |
| `window.validateSelectField(fieldId, rules)` | Validate select field |
| `window.setupFieldValidation(fieldId, rules)` | Setup field validation |
| `window.validateCurrencySymbol(value)` | Validate currency symbol |
| `window.validateCurrencyRate(value)` | Validate currency rate |
| `window.validateTickerSymbol(value)` | Validate ticker symbol |
| `window.initializeValidation()` | Initialize validation system |
| `window.clearValidation()` | Clear validation system |

### 🔔 Notification System (`notification-system.js`)
| Function | Description |
|----------|-------------|
| `window.createAlert(alertData)` | Create new alert |
| `window.updateAlert(alertId, alertData)` | Update existing alert |
| `window.markAlertAsTriggered(alertId)` | Mark alert as triggered |
| `window.markAlertAsRead(alertId)` | Mark alert as read |
| `window.showNotification(message, type, title)` | Show notification |
| `window.showSuccessNotification(title, message)` | Show success notification |
| `window.showErrorNotification(title, message)` | Show error notification |
| `window.showWarningNotification(title, message)` | Show warning notification |
| `window.showInfoNotification(title, message)` | Show info notification |
| `window.loadLinkedItemsData(itemId, itemType)` | Load linked items data |

### 📋 Table System (`tables.js`)
| Function | Description |
|----------|-------------|
| `window.sortTableData(columnIndex, data, tableType, updateFunction)` | Sort table data |
| `window.saveSortState(tableType, columnIndex, direction)` | Save sort state |
| `window.getSortState(tableType)` | Get sort state |
| `window.setSortState(tableType, columnIndex, direction)` | Set sort state |
| `window.sortAnyTable(tableType, columnIndex, data, updateFunction)` | Sort any table |
| `window.sortTable(tableType, columnIndex, dataArray, updateFunction)` | Legacy sort table |
| `window.restoreAnyTableSort(tableType, data, updateFunction)` | Restore table sort |
| `window.applyDefaultSort(tableType, data, updateFunction)` | Apply default sort |
| `window.closeModal(modalId)` | Close modal |
| `window.getDefaultColumnDefs(tableType)` | Get default column definitions |

### ⚙️ Preferences System (`preferences.js`)
| Function | Description |
|----------|-------------|
| `window.getPreference(preferenceName)` | Get single preference |
| `window.getGroupPreferences(groupName)` | Get group preferences |
| `window.getPreferencesByNames(preferenceNames)` | Get multiple preferences |
| `window.getAllUserPreferences()` | Get all user preferences |
| `window.savePreference(preferenceName, value)` | Save single preference |
| `window.savePreferences(preferences)` | Save multiple preferences |
| `window.getUserProfiles()` | Get user profiles |
| `window.checkPreferencesServiceHealth()` | Check preferences service health |
| `window.getPreferenceInfo(preferenceName)` | Get preference information |
| `window.loadPreferences()` | Load all preferences |
| `window.saveAllPreferences()` | Save all preferences |
| `window.resetToDefaults()` | Reset preferences to defaults |
| `window.initializePreferences()` | Initialize preferences system |

### 🎯 Preferences Page (`preferences-page.js`)
| Function | Description |
|----------|-------------|
| `window.loadAccountsForPreferences()` | Load accounts for preferences page |
| `window.loadColorsForPreferences()` | Load colors for preferences page |
| `window.validateCurrency(selectElement)` | Validate currency selection |
| `window.initializePreferencesPage()` | Initialize preferences page |

### 📊 Entity Service Functions

#### Accounts (`accounts.js`)
| Function | Description |
|----------|-------------|
| `window.loadAccountsFromServer()` | Load accounts from server |
| `window.loadAllAccountsFromServer()` | Load all accounts from server |
| `window.loadDefaultAccounts()` | Load default accounts |
| `window.loadAccountsData()` | Load accounts data |
| `window.updateAccountsTable(accounts)` | Update accounts table |
| `window.loadAccounts()` | Load accounts |
| `window.loadAccountsDataFromAPI()` | Load accounts data from API |
| `window.addAccountToAPI(accountData)` | Add account to API |
| `window.updateAccountInAPI(accountId, accountData)` | Update account in API |
| `window.deleteAccountFromAPI(accountId)` | Delete account from API |
| `window.checkLinkedItemsBeforeDelete(accountId)` | Check linked items before delete |
| `window.loadAccountsDataForAccountsPage()` | Load accounts data for accounts page |

#### Tickers (`tickers.js`)
| Function | Description |
|----------|-------------|
| `window.loadTickersData()` | Load tickers data |
| `window.updateTickersTable(tickers)` | Update tickers table |
| `window.loadTickers()` | Load tickers |
| `window.loadCurrenciesData()` | Load currencies data |
| `window.getCurrencySymbol(currencyId)` | Get currency symbol |
| `window.getTickerTypeStyle(type)` | Get ticker type style |
| `window.getTickerStatusStyle(status)` | Get ticker status style |
| `window.getTickerStatusLabel(status)` | Get ticker status label |
| `window.generateTickerCurrencyOptions(ticker)` | Generate ticker currency options |
| `window.updateCurrencyOptions(ticker)` | Update currency options |
| `window.deleteTickerFromAPI(tickerId)` | Delete ticker from API |
| `window.addTickerToAPI(tickerData)` | Add ticker to API |
| `window.updateTickerInAPI(tickerId, tickerData)` | Update ticker in API |
| `window.restoreTickerFromAPI(tickerId)` | Restore ticker from API |
| `window.cancelTickerFromAPI(tickerId)` | Cancel ticker from API |
| `window.updateTickersSummaryStats()` | Update tickers summary stats |

#### Trades (`trades.js`)
| Function | Description |
|----------|-------------|
| `window.loadTradesData()` | Load trades data |
| `window.updateTradesTable(trades)` | Update trades table |
| `window.loadTrades()` | Load trades |
| `window.addTradeToAPI(tradeData)` | Add trade to API |
| `window.updateTradeInAPI(tradeId, tradeData)` | Update trade in API |
| `window.deleteTradeFromAPI(tradeId)` | Delete trade from API |
| `window.restoreTradeFromAPI(tradeId)` | Restore trade from API |
| `window.cancelTradeFromAPI(tradeId)` | Cancel trade from API |

#### Trade Plans (`trade_plans.js`)
| Function | Description |
|----------|-------------|
| `window.loadTradePlansData()` | Load trade plans data |
| `window.updateTradePlansTable(tradePlans)` | Update trade plans table |
| `window.loadTradePlans()` | Load trade plans |
| `window.addTradePlanToAPI(tradePlanData)` | Add trade plan to API |
| `window.updateTradePlanInAPI(tradePlanId, tradePlanData)` | Update trade plan in API |
| `window.deleteTradePlanFromAPI(tradePlanId)` | Delete trade plan from API |
| `window.restoreTradePlanFromAPI(tradePlanId)` | Restore trade plan from API |
| `window.cancelTradePlanFromAPI(tradePlanId)` | Cancel trade plan from API |

#### Executions (`executions.js`)
| Function | Description |
|----------|-------------|
| `window.loadExecutionsData()` | Load executions data |
| `window.updateExecutionsTable(executions)` | Update executions table |
| `window.loadExecutions()` | Load executions |
| `window.addExecutionToAPI(executionData)` | Add execution to API |
| `window.updateExecutionInAPI(executionId, executionData)` | Update execution in API |
| `window.deleteExecutionFromAPI(executionId)` | Delete execution from API |
| `window.validateExecutionTradeId(input)` | Validate execution trade ID |
| `window.validateExecutionQuantity(input)` | Validate execution quantity |
| `window.validateExecutionPrice(input)` | Validate execution price |
| `window.validateExecutionCommission(input)` | Validate execution commission |
| `window.validateExecutionType(input)` | Validate execution type |
| `window.validateExecutionSource(input)` | Validate execution source |
| `window.validateExecutionNotes(input)` | Validate execution notes |
| `window.validateExecutionExternalId(input)` | Validate execution external ID |
| `window.validateExecutionDate(input)` | Validate execution date |

#### Alerts (`alerts.js`)
| Function | Description |
|----------|-------------|
| `window.loadAlertsData()` | Load alerts data |
| `window.updateAlertsTable(alerts)` | Update alerts table |
| `window.loadAlerts()` | Load alerts |
| `window.addAlertToAPI(alertData)` | Add alert to API |
| `window.updateAlertInAPI(alertId, alertData)` | Update alert in API |
| `window.deleteAlertFromAPI(alertId)` | Delete alert from API |
| `window.restoreAlertFromAPI(alertId)` | Restore alert from API |
| `window.cancelAlertFromAPI(alertId)` | Cancel alert from API |
| `window.validateAlertStatusCombination(status, isTriggered)` | Validate alert status combination |

#### Cash Flows (`cash_flows.js`)
| Function | Description |
|----------|-------------|
| `window.loadCashFlowsData()` | Load cash flows data |
| `window.updateCashFlowsTable(cashFlows)` | Update cash flows table |
| `window.loadCashFlows()` | Load cash flows |
| `window.addCashFlowToAPI(cashFlowData)` | Add cash flow to API |
| `window.updateCashFlowInAPI(cashFlowId, cashFlowData)` | Update cash flow in API |
| `window.deleteCashFlowFromAPI(cashFlowId)` | Delete cash flow from API |
| `window.restoreCashFlowFromAPI(cashFlowId)` | Restore cash flow from API |
| `window.cancelCashFlowFromAPI(cashFlowId)` | Cancel cash flow from API |

#### Notes (`notes.js`)
| Function | Description |
|----------|-------------|
| `window.loadNotesData()` | Load notes data |
| `window.updateNotesTable(notes)` | Update notes table |
| `window.loadNotes()` | Load notes |
| `window.addNoteToAPI(noteData)` | Add note to API |
| `window.updateNoteInAPI(noteId, noteData)` | Update note in API |
| `window.deleteNoteFromAPI(noteId)` | Delete note from API |
| `window.restoreNoteFromAPI(noteId)` | Restore note from API |
| `window.cancelNoteFromAPI(noteId)` | Cancel note from API |

### 🔧 System Functions

#### Filter System (`filter-system.js`)
| Function | Description |
|----------|-------------|
| `window.resetFiltersManually()` | Reset filters manually |
| `window.clearAllFilters()` | Clear all filters |
| `window.loadAccountsForFilter()` | Load accounts for filter |
| `window.updateAccountFilterOptions()` | Update account filter options |
| `window.useAccountFilterFallback()` | Use account filter fallback |
| `window.getAccountIdByName(accountName)` | Get account ID by name |

#### Header System (`header-system.js`)
| Function | Description |
|----------|-------------|
| `window.HeaderSystem` | Header system class |
| `window.resetFiltersManually()` | Reset filters manually |
| `window.clearAllFilters()` | Clear all filters |
| `window.loadAccountsForFilter()` | Load accounts for filter |
| `window.updateAccountFilterOptions()` | Update account filter options |
| `window.useAccountFilterFallback()` | Use account filter fallback |
| `window.getAccountIdByName(accountName)` | Get account ID by name |

#### Menu System (`menu.js`)
| Function | Description |
|----------|-------------|
| `window.resetFiltersManually()` | Reset filters manually |
| `window.clearFiltersManually()` | Clear filters manually |
| `window.loadAccountsForFilter()` | Load accounts for filter |
| `window.updateAccountFilterOptions()` | Update account filter options |
| `window.useAccountFilterFallback()` | Use account filter fallback |
| `window.getAccountIdByName(accountName)` | Get account ID by name |

### 🛠️ Utility Functions

#### Translation (`translation-utils.js`)
| Function | Description |
|----------|-------------|
| `window.translateField(value, fieldName)` | Translate field value |
| `window.translateStatus(status)` | Translate status |
| `window.translateType(type)` | Translate type |
| `window.formatCurrency(amount)` | Format currency |
| `window.formatNumber(number)` | Format number |
| `window.formatDate(date)` | Format date |
| `window.formatTime(time)` | Format time |

#### Date Utilities (`date-utils.js`)
| Function | Description |
|----------|-------------|
| `window.formatDate(date)` | Format date |
| `window.formatDateTime(dateTime)` | Format date and time |
| `window.parseDate(dateString)` | Parse date string |
| `window.isValidDate(date)` | Check if date is valid |
| `window.addDays(date, days)` | Add days to date |
| `window.subtractDays(date, days)` | Subtract days from date |
| `window.getDateRange(startDate, endDate)` | Get date range |

#### Page Utilities (`page-utils.js`)
| Function | Description |
|----------|-------------|
| `window.getCurrentPageName()` | Get current page name |
| `window.getPageTitle()` | Get page title |
| `window.getPageType()` | Get page type |
| `window.isPageLoaded()` | Check if page is loaded |
| `window.getPageData()` | Get page data |

#### Linked Items (`linked-items.js`)
| Function | Description |
|----------|-------------|
| `window.showLinkedItemsModal(itemId, itemType)` | Show linked items modal |
| `window.loadLinkedItemsData(itemId, itemType)` | Load linked items data |
| `window.updateLinkedItemsDisplay(itemId, itemType)` | Update linked items display |
| `window.getLinkedItemsCount(itemId, itemType)` | Get linked items count |

#### Warning System (`warning-system.js`)
| Function | Description |
|----------|-------------|
| `window.showWarningModal(title, message, callback)` | Show warning modal |
| `window.showConfirmationModal(title, message, callback)` | Show confirmation modal |
| `window.showInfoModal(title, message)` | Show info modal |
| `window.showErrorModal(title, message)` | Show error modal |

#### CRUD Utilities (`crud-utils.js`)
| Function | Description |
|----------|-------------|
| `window.createItem(itemType, itemData)` | Create new item |
| `window.updateItem(itemType, itemId, itemData)` | Update item |
| `window.deleteItem(itemType, itemId)` | Delete item |
| `window.restoreItem(itemType, itemId)` | Restore item |
| `window.cancelItem(itemType, itemId)` | Cancel item |
| `window.validateItemData(itemType, itemData)` | Validate item data |

### 📊 Monitoring & Development

#### Linter Monitor (`linter-realtime-monitor.js`)
| Function | Description |
|----------|-------------|
| `window.copyUnresolvedIssuesLog()` | Copy unresolved issues log |
| `window.discoverProjectFiles()` | Discover project files |
| `window.startMonitoring()` | Start monitoring |
| `window.stopMonitoring()` | Stop monitoring |
| `window.copyDetailedLog()` | Copy detailed log |
| `window.startFileScan()` | Start file scan |
| `window.fixAllIssues()` | Fix all issues |
| `window.fixAllErrors()` | Fix all errors |
| `window.fixAllWarnings()` | Fix all warnings |
| `window.ignoreAllIssues()` | Ignore all issues |
| `window.resetFixedIssues()` | Reset fixed issues |
| `window.refreshChartData()` | Refresh chart data |
| `window.clearChartHistory()` | Clear chart history |
| `window.applyChartSettings()` | Apply chart settings |
| `window.updateProblemFilesTable()` | Update problem files table |
| `window.loadIssues()` | Load issues |
| `window.toggleAllSections()` | Toggle all sections |
| `window.toggleSection(sectionId)` | Toggle specific section |
| `window.runComprehensiveTests()` | Run comprehensive tests |
| `window.runQuickHealthCheck()` | Run quick health check |
| `window.exportChartData()` | Export chart data |
| `window.clearFiltersBtn()` | Clear filters button |
| `window.initializeChart()` | Initialize chart |
| `window.clearProjectFilesCache()` | Clear project files cache |

#### Project Files Scanner (`project-files-scanner.js`) - **NEW**
| Function | Description |
|----------|-------------|
| `window.getProjectFiles()` | Get all project files with caching |
| `window.getFilesByType(type)` | Get files by type (js, html, css, python, other) |
| `window.getTotalFileCount()` | Get total number of files |
| `window.getFileStatistics()` | Get file statistics by type |
| `window.clearProjectFilesCache()` | Clear project files cache |
| `window.projectFilesScanner` | Global scanner instance |
| `window.ignoreAllIssues()` | Ignore all issues |
| `window.resetFixedIssues()` | Reset fixed issues |
| `window.toggleAutoRefresh()` | Toggle auto refresh |
| `window.toggleSection(id)` | Toggle section |
| `window.toggleAllSections()` | Toggle all sections |
| `window.refreshChartData()` | Refresh chart data |
| `window.clearChartHistory()` | Clear chart history |
| `window.exportChartData()` | Export chart data |
| `window.applyChartSettings()` | Apply chart settings |
| `window.addLogEntry(entry)` | Add log entry |
| `window.initializeSession()` | Initialize session |
| `window.getSelectedFileTypes()` | Get selected file types |
| `window.calculateTotalSize()` | Calculate total size |

#### Chart Management System (`chart-management.js`) - **NEW**
| Function | Description |
|----------|-------------|
| `window.createTestChart()` | Create test chart with real data |
| `window.updateTestChart()` | Update test chart data |
| `window.destroyTestChart()` | Destroy test chart |
| `window.createPerformanceChart()` | Create performance chart |
| `window.createAccountChart()` | Create account chart |
| `window.createMixedChart()` | Create mixed entity chart |
| `window.exportTestChart()` | Export test chart |
| `window.refreshAllCharts()` | Refresh all charts |
| `window.copyDetailedLog()` | Copy detailed system log |
| `window.toggleAutoRefresh()` | Toggle auto refresh |
| `window.ChartSystem` | Global chart system instance |
| `window.ChartExportSystem` | Global chart export system |
| `window.TradesAdapter` | Trades data adapter |

---

**Total Global Functions: 250+**  
**Last Updated: January 21, 2025**  
**Maintained By: TikTrack Development Team**

### 🆕 Additional Global Systems - **NEW DISCOVERIES**

#### JS-Map Utilities (`js-map-utils.js`) - **NEW**
|| Function | Description |
||----------|-------------|
|| `window.toggleAllSections()` | Toggle all JS-Map sections |
|| `window.performQuickSearch()` | Perform quick search in functions |
|| `window.toggleFunctionsDropdown()` | Toggle functions dropdown |
|| `window.scrollToTop()` | Scroll to top of page |
|| `window.exportDuplicatesReport()` | Export duplicates report |
|| `window.initializeErrorTracking()` | Initialize error tracking system |

#### Color Scheme System (`color-scheme-system.js`) - **NEW**
|| Function | Description |
||----------|-------------|
|| `window.getEntityColor(entity)` | Get color for entity type |
|| `window.getStatusColor(status)` | Get color for status |
|| `window.getNumericValueColor(value)` | Get color for numeric value |
|| `window.updateCSSVariablesFromPreferences()` | Update CSS variables from preferences |
|| `window.initializeColorScheme()` | Initialize color scheme system |
|| `window.applyColorScheme(scheme)` | Apply color scheme |

#### System Management (`system-management.js`) - **NEW**
|| Function | Description |
||----------|-------------|
|| `window.getSystemStatus()` | Get system status |
|| `window.checkSystemHealth()` | Check system health |
|| `window.restartSystem()` | Restart system |
|| `window.updateSystemConfig()` | Update system configuration |
|| `window.getSystemMetrics()` | Get system metrics |

#### Pagination System (`pagination-system.js`) - **NEW**
|| Function | Description |
||----------|-------------|
|| `window.initializePagination()` | Initialize pagination |
|| `window.updatePagination()` | Update pagination |
|| `window.goToPage(page)` | Go to specific page |
|| `window.nextPage()` | Go to next page |
|| `window.previousPage()` | Go to previous page |
|| `window.setPageSize(size)` | Set page size |

#### Central Refresh System (`central-refresh-system.js`) - **NEW**
|| Function | Description |
||----------|-------------|
|| `window.refreshAllData()` | Refresh all data |
|| `window.refreshPageData()` | Refresh page data |
|| `window.scheduleRefresh()` | Schedule refresh |
|| `window.cancelRefresh()` | Cancel refresh |
|| `window.getRefreshStatus()` | Get refresh status |

## 🚨 **עדכון דחוף - 4 בספטמבר 2025**
**בעיה קריטית זוהתה במערכת הנתונים החיצוניים** - הנתונים נאספים מ-Yahoo Finance API אבל לא נשמרים בבסיס הנתונים. המערכת 90% מושלמת עם בעיה אחת קריטית שצריכה פתרון.

## 🏗️ Architecture Overview

### Project Structure
```
trading-ui/scripts/
├── 🏛️ Core Files
│   ├── main.js                    # Global initialization and core functions
│   ├── header-system.js           # Unified header system
│   ├── notification-system.js     # Global notification system
│   └── console-cleanup.js         # Console cleanup
│
├── 🛠️ Utility Files
│   ├── ui-utils.js                # Shared UI functions + TABLE REFRESH SYSTEM
│   ├── validation-utils.js        # Global validation system
│   ├── data-utils.js              # Shared data functions
│   ├── date-utils.js              # Date functions
│   ├── tables.js                  # Global table system
│   ├── page-utils.js              # Page functions
│   ├── linked-items.js            # Linked items system
│   ├── translation-utils.js       # Translation functions
│   ├── table-mappings.js          # Table column mappings
│   ├── simple-filter.js           # Simple filter system
│   ├── warning-system.js          # Central warning system
│   └── crud-utils.js              # CRUD operations utilities
│
├── 📄 Page Files
│   ├── accounts.js                # Account management (currency_id migration)
│   ├── alerts.js                  # Alert management
│   ├── trades.js                  # Trade management (linked items)
│   ├── trade_plans.js             # Trade plan management
│   ├── tickers.js                 # Ticker management
│   ├── notes.js                   # Note management
│   ├── executions.js              # Execution management (modal fixes)
│   ├── cash_flows.js              # Cash flow management (ENUM/RANGE)
│   ├── currencies.js              # Currency management
│   ├── preferences.js             # Preference management
│   ├── research.js                # Research management

│   ├── database.js                # Database management
│   ├── auth.js                    # User authentication
│   ├── active-alerts-component.js # Active alerts component
│   └── db-extradata.js            # Auxiliary tables management
│
└── 🔧 System Files
    ├── filter-system.js           # Advanced filter system
    ├── constraint-manager.js      # Constraint manager
    ├── condition-translator.js    # Condition translator
    └── button-icons.js            # Button icon system
    │
└── 📊 Chart System Files
    ├── chart-management.js        # Chart management page
    ├── chart-system.js            # Core chart system
    ├── chart-theme.js             # Dynamic color theming
    ├── chart-export.js            # Chart export functionality
    ├── trades-adapter.js          # Real data adapter
    └── chart-loader.js            # Chart loading utilities
    │
└── 🆕 Additional Global Systems
    ├── js-map-utils.js           # JS-Map specific utilities
    ├── color-scheme-system.js     # Dynamic color scheme management
    ├── system-management.js       # System health and management
    ├── pagination-system.js       # Global pagination system
    ├── central-refresh-system.js  # Centralized refresh management
    ├── global-file-mapping-system.js # Global file mapping and scanning system
    └── 🆕 UNIFIED_INDEXEDDB_SPECIFICATION.md # Unified IndexedDB System Specification
```

## 📥 File Loading Order

### Standard Loading Order (All Pages)
```html
<!-- 1. Header system -->
<script src="scripts/header-system.js"></script>

<!-- 2. Console cleanup -->
<script src="scripts/console-cleanup.js"></script>

<!-- 3. Basic filters -->
<script src="scripts/simple-filter.js"></script>

<!-- 4. Translation functions -->
<script src="scripts/translation-utils.js"></script>

<!-- 5. Data functions -->
<script src="scripts/data-utils.js"></script>

<!-- 6. UI functions -->
<script src="scripts/ui-utils.js"></script>

<!-- 7. Table mappings -->
<script src="scripts/table-mappings.js"></script>

<!-- 8. Date functions -->
<script src="scripts/date-utils.js"></script>

<!-- 9. Table system -->
<script src="scripts/tables.js"></script>

<!-- 10. Page-specific files -->
<script src="scripts/[page-name].js"></script>
```

## 🏛️ Core Files

### main.js
**Purpose**: Global initialization and core functions
- Global variables and constants
- Core utility functions
- System initialization
- Error handling

### header-system.js
**Purpose**: Unified header system
- Navigation management
- Filter system integration

## 🎯 Table Identification System

### Overview
The TikTrack JavaScript architecture implements a sophisticated table identification system that supports both dedicated pages and unified database views. This system ensures consistent behavior across all table operations including sorting, filtering, and data management.

### System Components

#### 1. **Table Mappings (`table-mappings.js`)**
Centralized column mapping system for all tables.

**Purpose:**
- Defines column structure for each table type
- Provides consistent field access across pages
- Supports sorting and filtering operations

**Key Functions:**
```javascript
// Get column value for sorting/filtering
function getColumnValue(item, columnIndex, tableType)

// Get complete column mapping
function getTableMapping(tableType)

// Check if table is supported
function isTableSupported(tableType)
```

#### 2. **Global Table System (`tables.js`)**
Universal table operations system.

**Key Functions:**
```javascript
// Universal table sorter
window.sortTableData(columnIndex, data, tableType, updateFunction)

// Legacy compatibility wrapper
window.sortTable(tableType, columnIndex, dataArray, updateFunction)

// Sort state management
window.saveSortState(tableType, columnIndex, direction)
window.getSortState(tableType)
```

#### 3. **Page-Specific Table Functions**
Each page implements its own table identification method.

### Table Identification Methods

#### **Method 1: CSS Class-Based (Specific Pages)**
Used in dedicated pages like `tickers.html`, `accounts.html`, `trades.html`.

**Structure:**
```html
<div class="content-section tickers-page">
  <table class="table" id="tickersTable" data-table-type="tickers">
    <!-- table content -->
  </table>
</div>
```

**Implementation:**
```javascript
// In tickers.js
function sortTable(columnIndex) {
    window.sortTableData(
        columnIndex,
        window.tickersData || [],
        'tickers',
        updateTickersTable
    );
}
```

**Characteristics:**
- Container has page-specific CSS class
- Page-specific JavaScript files contain local functions
- Functions know table type from context
- Single table per page

#### **Method 2: Data Attribute-Based (Database Display)**
Used in unified database display page (`db_display.html`).

**Structure:**
```html
<table class="table" id="tradePlansTable" data-table-type="trade_plans">
<table class="table" id="tradesTable" data-table-type="trades">
<table class="table" id="accountsTable" data-table-type="accounts">
```

**Implementation:**
```javascript
// In database.js
function sortTable(columnIndex, tableId) {
    const table = document.getElementById(tableId);
    const tableType = table.getAttribute('data-table-type');
    
    let data = [];
    let updateFunction = null;
    
    switch (tableType) {
        case 'trade_plans':
            data = allData.tradePlans || [];
            updateFunction = updateTradePlansTable;
            break;
        case 'trades':
            data = allData.trades || [];
            updateFunction = updateTradesTable;
            break;
        // ... other cases
    }
    
    window.sortTableData(columnIndex, data, tableType, updateFunction);
}
```

**Characteristics:**
- Each table has `data-table-type` attribute
- Global function handles multiple tables
- Function determines table type dynamically
- Multiple tables per page

### Filter System Integration

#### **Specific Pages Filtering**
```javascript
// In simple-filter.js
applyFiltersToTradePlansTable() {
    const table = document.getElementById('designsTable');
    // Works with specific table structure
}

applyFiltersToAlertsTable() {
    const table = document.getElementById('alertsTable');
    // Works with specific table structure
}
```

#### **Database Display Page Filtering**
```javascript
// In simple-filter.js
applyFiltersToDatabaseDisplayTables() {
    const tableIds = [
        'tradePlansTable', 'tradesTable', 'accountsTable',
        'tickersTable', 'executionsTable', 'cashFlowsTable',
        'alertsTable', 'notesTable'
    ];
    
    tableIds.forEach(tableId => {
        this.applyFiltersToDatabaseTable(tableId);
    });
}
```

### Data Flow Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   HTML Table    │    │  JavaScript      │    │   Global Data   │
│                 │    │  Functions       │    │                 │
├─────────────────┤    ├──────────────────┤    ├─────────────────┤
│ data-table-type │───▶│ sortTable()      │───▶│ allData object  │
│ id="tableId"    │    │ updateTable()    │    │ pageData object │
│ class="..."     │    │ filterTable()    │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │                       ▼                       │
         │              ┌──────────────────┐             │
         │              │  Table Mappings  │             │
         │              │  (table-mappings │             │
         └──────────────│  .js)            │◀────────────┘
                        └──────────────────┘
```

### Best Practices

#### **1. Consistent Naming**
- Use consistent table IDs: `[tableName]Table`
- Use consistent `data-table-type` values
- Follow naming conventions across all pages

#### **2. Error Handling**
```javascript
function sortTable(columnIndex, tableId) {
    const table = document.getElementById(tableId);
    if (!table) {
        console.error('❌ Table not found:', tableId);
        return;
    }
    
    const tableType = table.getAttribute('data-table-type');
    if (!tableType) {
        console.error('❌ Table type not found for table:', tableId);
        return;
    }
    
    if (!window.isTableSupported(tableType)) {
        console.error('❌ Unsupported table type:', tableType);
        return;
    }
}
```

#### **3. Performance Optimization**
- Cache table references when possible
- Use efficient DOM queries
- Minimize redundant table type lookups
- Implement proper cleanup for event listeners

#### **4. Maintainability**
- Keep table mappings centralized
- Use consistent data structures
- Document table type values
- Implement proper error logging

### Integration with Other Systems

#### **Header System Integration**
```javascript
// Header system provides filter integration
function initializeHeaderFilters() {
    const filterContainer = document.getElementById('header-filters');
    if (filterContainer) {
        setupFilterSystem(filterContainer);
    }
}
```

#### **Translation System Integration**
```javascript
// Translation system works with table data
function translateTableData(data, tableType) {
    return data.map(item => {
        const translated = {};
        const columns = getTableMapping(tableType);
        columns.forEach((field, index) => {
            translated[field] = translateField(item[field], field);
        });
        return translated;
    });
}
```

### console-cleanup.js
**Purpose**: Console cleanup and logging
- Console message filtering
- Development logging
- Error tracking

## 🛠️ Utility Files

### ui-utils.js
**Purpose**: Shared UI functions and Section Toggle System
- Modal management
- Button handling
- Form validation
- UI state management
- **Section Toggle System** - Centralized system for opening/closing page sections
  - `toggleTopSection()` - Toggle top sections
  - `toggleMainSection()` - Toggle main sections
  - `toggleSection(sectionId)` - Toggle specific sections
  - `toggleAllSections()` - Toggle all sections at once
  - State persistence with localStorage
  - Visual feedback with icon rotation
  - Page-specific behavior handling

**Documentation**: [Section Toggle System](SECTION_TOGGLE_SYSTEM.md)

### data-utils.js
**Purpose**: Shared data functions
- API communication
- Data formatting
- Error handling
- Data validation

### date-utils.js
**Purpose**: Date functions
- Date formatting
- Date validation
- Date calculations
- Timezone handling

### tables.js
**Purpose**: Global table system
- Table initialization
- Sorting functionality
- Pagination
- Data display

### translation-utils.js
**Purpose**: Translation functions
- Text translation
- Field mapping
- Language support
- Localization

### warning-system.js
**Purpose**: Central warning system
- Warning display
- Confirmation dialogs
- Error messages
- User notifications

## 📄 Page Files

### accounts.js
**Purpose**: Account management
- Account CRUD operations
- Account validation
- Account display
- Account linking

### alerts.js
**Purpose**: Alert management
- Alert CRUD operations
- Alert conditions
- Alert notifications
- Alert status management

### trades.js
**Purpose**: Trade management
- Trade CRUD operations
- Trade calculations
- Trade status management
- Trade linking

### executions.js
**Purpose**: Execution management
- Execution CRUD operations
- Execution calculations
- Execution linking
- Execution display

### tickers.js
**Purpose**: Ticker management
- Ticker CRUD operations
- Ticker validation
- Ticker display
- Ticker linking

## 🔧 System Files

### filter-system.js
**Purpose**: Advanced filter system
- Complex filtering
- Filter combinations
- Filter persistence
- Filter reset

### constraint-manager.js
**Purpose**: Constraint manager
- Database constraints
- Validation rules
- Constraint display
- Constraint management

## 🎯 Key Principles

### 1. Modularity
Each file has a specific purpose and responsibility, making the system maintainable and scalable.

### 2. Separation of Concerns
Clear separation between core functions, utilities, page-specific code, and system components.

### 3. Reusability
Utility functions are designed to be reusable across different pages and components.

### 4. Consistency
Standardized naming conventions and patterns across all files.

### 5. Performance
Optimized loading order and efficient function organization.

## 📊 File Statistics

| **Category** | **Count** | **Purpose** |
|-------------|-----------|-------------|
| **Core Files** | 3 | System foundation |
| **Utility Files** | 11 | Shared functionality |
| **Page Files** | 16 | Page-specific logic |
| **System Files** | 4 | Advanced systems |
| **Chart System** | 6 | Chart management system |
| **Additional Systems** | 5 | Newly discovered systems |
| **Total** | **45** | Complete system |

## 🎨 CSS Architecture Integration

### Small Row Cards - Generic Component
The system includes a generic component for small cards displayed in rows:

| **Class Name** | **Purpose** | **File Location** |
|----------------|-------------|-------------------|
| `.small-row-card` | Small cards in rows | `_cards.css` |
| `.small-row-card-label` | Card labels | `_cards.css` |
| `.small-row-card-value` | Card values | `_cards.css` |
| `.small-row-card-icon` | Card icons | `_cards.css` |

**Usage**: Used in JS-Map page for statistics display and can be reused in other pages that need similar small card layouts.

### 📈 Recent Updates (January 21, 2025)
- **Added:** Chart Management System - Complete implementation with 6 new files
- **Added:** `chart-management.js` - Chart management page functionality
- **Added:** `chart-system.js` - Core chart system with Chart.js integration
- **Added:** `chart-theme.js` - Dynamic color theming system
- **Added:** `chart-export.js` - Chart export functionality
- **Added:** `trades-adapter.js` - Real data adapter for charts
- **Enhanced:** Color system integration with user preferences
- **Updated:** Preferences system with chart-specific settings
- **NEW:** Additional Global Systems - 5 newly discovered systems
- **NEW:** `js-map-utils.js` - JS-Map specific utilities
- **NEW:** `color-scheme-system.js` - Dynamic color scheme management
- **NEW:** `system-management.js` - System health and management
- **NEW:** `pagination-system.js` - Global pagination system
- **NEW:** `central-refresh-system.js` - Centralized refresh management
- **Previous:** `project-files-scanner.js` - Global project files scanner
- **Previous:** `linter-realtime-monitor.js` - Comprehensive file scanning (400+ files)

## 🔄 Maintenance Guidelines

### Adding New Files
1. Identify the appropriate category
2. Follow naming conventions
3. Update loading order if needed
4. Document the file purpose

### Modifying Existing Files
1. Maintain the file's primary purpose
2. Update documentation
3. Test across related pages
4. Ensure backward compatibility

### Removing Files
1. Check for dependencies
2. Update loading order
3. Remove references
4. Test thoroughly

## 🚀 Benefits

1. **Maintainability**: Clear structure and organization
2. **Scalability**: Easy to add new features
3. **Performance**: Optimized loading and execution
4. **Debugging**: Clear file organization for troubleshooting
5. **Team Development**: Clear responsibilities and boundaries

## 🔄 Global Table Refresh System (New in v2.9.0)

### Overview
מערכת רענון טבלאות גלובלית חדשה הוטמעה ב-`ui-utils.js` לטיפול אחיד ויעיל ברענון טבלאות אחרי פעולות CRUD בכל העמודים.

### Core Functions

#### `enhancedTableRefresh(loadDataFunction, updateActiveFieldsFunction, operationName, delay)`
- **תפקיד**: רענון טבלה משופר עם כפיית DOM reflow
- **פרמטרים**: פונקציית טעינת נתונים, עדכון שדות פעילים, שם פעולה, עיכוב
- **יתרונות**: לוגים אחידים, טיפול בשגיאות, אופטימיזציה של ביצועים

#### `handleApiResponseWithRefresh(response, options)`
- **תפקיד**: טיפול אוטומטי בתגובות API עם רענון טבלה
- **תכונות**:
  - טיפול אחיד בהצלחה, 404, ושגיאות
  - הודעות מותאמות אישית
  - רענון אוטומטי של טבלאות
  - תמיכה בפונקציות callback מותאמות

#### `autoRefreshCurrentPage(operationName)`
- **תפקיד**: רענון אוטומטי לפי עמוד נוכחי
- **זיהוי אוטומטי**: מזהה את העמוד הנוכחי ופונקציות הנתונים המתאימות

### Page Function Mapping
```javascript
const pageFunctions = {
  'tickers': { loadData: loadTickersData, updateActive: updateActiveTradesField },
  'trades': { loadData: loadTradesData, updateActive: updateActiveTradesField },
  'accounts': { loadData: loadAccountsDataForAccountsPage, updateActive: null },
  'alerts': { loadData: loadAlertsData, updateActive: null },
  // ... additional pages
};
```

### Usage Examples

**Before (50+ lines of repetitive code):**
```javascript
if (response.ok) {
  // success handling
  // delay
  // refresh data
  // update fields
  // logging
} else if (response.status === 404) {
  // 404 handling
  // refresh data
  // logging
} else {
  // error handling
}
```

**After (10 lines with global system):**
```javascript
const handled = await window.handleApiResponseWithRefresh(response, {
  loadDataFunction: window.loadTickersData,
  updateActiveFieldsFunction: window.updateActiveTradesField,
  operationName: 'מחיקה',
  itemName: 'הטיקר',
  successMessage: 'הטיקר נמחק בהצלחה'
});
```

### Benefits
1. **Code Reduction**: 80% less code in CRUD operations
2. **Consistency**: Uniform behavior across all pages
3. **Maintainability**: Single point of change for refresh logic
4. **404 Handling**: Automatic handling of non-existent items
5. **Enhanced UX**: Immediate table updates without manual refresh
6. **Debugging**: Comprehensive logging for all operations

### Implementation Status
- ✅ **Tickers Page**: Delete and reactivate functions updated
- ⏳ **Other Pages**: Ready for migration to new system
- ✅ **Global Functions**: All exported to window object
- ✅ **Documentation**: Complete usage examples

## 📚 Related Documentation

- [Chart Management System](CHART_SYSTEM_COMPLETE_GUIDE.md) - **NEW**
- [Filter System](FILTER_SYSTEM.md)
- [Number Formatting](NUMBER_FORMATTING.md)
- [CSS Architecture](../css/CSS_ARCHITECTURE.md)
- [Backend Integration](../../backend/README.md)
- [External Data Integration](EXTERNAL_DATA_INTEGRATION.md)

---

**Last Updated**: January 21, 2025  
**Version**: 3.0.0  
**Maintained By**: TikTrack Development Team
