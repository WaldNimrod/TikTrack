# TikTrack Function Naming Conventions

## Overview
The TikTrack system follows consistent function naming conventions to ensure code readability, maintainability, and consistency across all modules. This document outlines the established naming patterns and guidelines for function development.

## Naming Conventions

### 1. Global System Functions ✅ **RECENTLY ENHANCED**

#### Warning System Functions
```javascript
// Pattern: show[WarningType]
window.showDeleteWarning(message, onConfirm);
window.showLinkedItemsWarning(message, linkedItems, onConfirm);
window.showValidationWarning(message, fieldName);
window.showSuccessNotification(message);
window.showErrorNotification(message);
```

#### Translation System Functions
```javascript
// Pattern: translate[Entity][Property]
function translateAlertCondition(condition) { /* ... */ }
function translateTradeStatus(status) { /* ... */ }
function translateAccountStatus(status) { /* ... */ }
function translateCashFlowType(type) { /* ... */ }
```

#### Number Formatting Functions
```javascript
// Pattern: format[Type]With[Feature]
function formatNumberWithCommas(number) { /* ... */ }
function formatCurrencyWithCommas(amount, currency) { /* ... */ }
function colorAmountByValue(amount) { /* ... */ }
```

### 2. Page-Specific Functions

#### CRUD Operations
```javascript
// Pattern: [action][Entity]
function loadCashFlows() { /* ... */ }
function saveCashFlow(data) { /* ... */ }
function updateCashFlow(id, data) { /* ... */ }
function deleteCashFlow(id) { /* ... */ }
function renderCashFlowsTable(data) { /* ... */ }
```

#### Modal Management
```javascript
// Pattern: show[Action][Entity]Modal
function showAddCashFlowModal() { /* ... */ }
function showEditCashFlowModal(id) { /* ... */ }
function showDeleteCashFlowModal(id) { /* ... */ }
function closeCashFlowModal() { /* ... */ }
```

#### Form Management
```javascript
// Pattern: [action][Entity]Form
function validateCashFlowForm() { /* ... */ }
function resetCashFlowForm() { /* ... */ }
function populateCashFlowForm(data) { /* ... */ }
function submitCashFlowForm() { /* ... */ }
```

### 3. API Integration Functions

#### Data Loading
```javascript
// Pattern: load[Entity]From[Source]
function loadCashFlowsFromServer() { /* ... */ }
function loadAccountsFromServer() { /* ... */ }
function loadCurrenciesFromServer() { /* ... */ }
```

#### Data Operations
```javascript
// Pattern: [operation][Entity]On[Target]
function saveCashFlowOnServer(data) { /* ... */ }
function updateCashFlowOnServer(id, data) { /* ... */ }
function deleteCashFlowOnServer(id) { /* ... */ }
```

### 4. Utility Functions

#### Validation Functions
```javascript
// Pattern: validate[Entity][Field]
function validateCashFlowAmount(amount) { /* ... */ }
function validateCashFlowDate(date) { /* ... */ }
function validateCashFlowType(type) { /* ... */ }
```

#### Helper Functions
```javascript
// Pattern: [action][Entity][Context]
function getCashFlowCurrencyDisplay(currencyId) { /* ... */ }
function formatCashFlowDate(date) { /* ... */ }
function calculateCashFlowTotal(flows) { /* ... */ }
```

## Recent Improvements ✅ **RECENTLY ENHANCED**

### 1. Warning System Integration
```javascript
// New centralized warning system functions
window.showDeleteWarning(message, onConfirm);
window.showLinkedItemsWarning(message, linkedItems, onConfirm);
window.showValidationWarning(message, fieldName);

// Usage in page-specific modules
function showDeleteCashFlowModal(id) {
    window.showDeleteWarning(
        'Are you sure you want to delete this cash flow?',
        () => confirmDeleteCashFlow(id)
    );
}
```

### 2. Translation System Functions
```javascript
// New translation functions for consistent text display
function translateAlertCondition(condition) {
    const translations = {
        'price': 'Price',
'change': 'Change',
'ma': 'Moving Average',
'volume': 'Volume'
    };
    return translations[condition] || condition;
}

function translateTradeStatus(status) {
    const translations = {
        'open': 'Open',
'closed': 'Closed',
'pending': 'Pending',
'cancelled': 'Cancelled'
    };
    return translations[status] || status;
}
```

### 3. Cash Flows Module Functions ✅ **RECENTLY COMPLETED**
```javascript
// Complete CRUD functionality with consistent naming
async function loadCashFlows() { /* ... */ }
function renderCashFlowsTable(cashFlows) { /* ... */ }
function showAddCashFlowModal() { /* ... */ }
function showEditCashFlowModal(id) { /* ... */ }
function showDeleteCashFlowModal(id) { /* ... */ }
function saveCashFlow() { /* ... */ }
function updateCashFlow(id) { /* ... */ }
function deleteCashFlow(id) { /* ... */ }
function validateCashFlowForm() { /* ... */ }
function loadAccountsForCashFlow() { /* ... */ }
function loadCurrenciesForCashFlow() { /* ... */ }
```

## Function Categories

### 1. Data Management Functions
```javascript
// Loading and rendering
function load[Entity]() { /* ... */ }
function render[Entity]Table(data) { /* ... */ }
function refresh[Entity]Data() { /* ... */ }

// CRUD operations
function create[Entity](data) { /* ... */ }
function read[Entity](id) { /* ... */ }
function update[Entity](id, data) { /* ... */ }
function delete[Entity](id) { /* ... */ }
```

### 2. UI Management Functions
```javascript
// Modal management
function show[Action][Entity]Modal() { /* ... */ }
function close[Entity]Modal() { /* ... */ }
function toggle[Entity]Modal() { /* ... */ }

// Form management
function validate[Entity]Form() { /* ... */ }
function reset[Entity]Form() { /* ... */ }
function populate[Entity]Form(data) { /* ... */ }
```

### 3. Event Handler Functions
```javascript
// Event handlers
function handle[Entity][Event]() { /* ... */ }
function on[Entity][Action]() { /* ... */ }
function process[Entity][Action]() { /* ... */ }
```

### 4. Utility Functions
```javascript
// Helper functions
function get[Entity][Property]() { /* ... */ }
function set[Entity][Property](value) { /* ... */ }
function format[Entity][Property](value) { /* ... */ }
function validate[Entity][Property](value) { /* ... */ }
```

## Best Practices

### 1. Consistency
- **Use consistent patterns** across all modules
- **Follow established conventions** for similar functionality
- **Maintain naming consistency** within each module
- **Use descriptive names** that clearly indicate function purpose

### 2. Clarity
- **Choose descriptive names** that explain what the function does
- **Use action verbs** at the beginning of function names
- **Include entity names** to indicate what the function operates on
- **Add context** when necessary for clarity

### 3. Maintainability
- **Follow established patterns** for easy maintenance
- **Use consistent abbreviations** across the codebase
- **Document naming conventions** for team reference
- **Review and update** conventions as the system evolves

### 4. Performance
- **Use efficient naming** that doesn't impact performance
- **Avoid overly long names** that reduce readability
- **Balance clarity with conciseness** in function names
- **Consider future scalability** in naming choices

## Examples by Module

### Cash Flows Module ✅ **RECENTLY COMPLETED**
```javascript
// Data management
async function loadCashFlows() { /* ... */ }
function renderCashFlowsTable(cashFlows) { /* ... */ }
function refreshCashFlowsData() { /* ... */ }

// CRUD operations
function saveCashFlow() { /* ... */ }
function updateCashFlow(id) { /* ... */ }
function deleteCashFlow(id) { /* ... */ }
function confirmDeleteCashFlow(id) { /* ... */ }

// Modal management
function showAddCashFlowModal() { /* ... */ }
function showEditCashFlowModal(id) { /* ... */ }
function showDeleteCashFlowModal(id) { /* ... */ }
function closeCashFlowModal() { /* ... */ }

// Form management
function validateCashFlowForm() { /* ... */ }
function validateEditCashFlowForm() { /* ... */ }
function resetCashFlowForm() { /* ... */ }
function populateCashFlowForm(data) { /* ... */ }

// Data loading
function loadAccountsForCashFlow() { /* ... */ }
function loadCurrenciesForCashFlow() { /* ... */ }
function loadAccountsForEditCashFlow() { /* ... */ }
function loadCurrenciesForEditCashFlow() { /* ... */ }

// Utility functions
function getCashFlowCurrencyDisplay(currencyId) { /* ... */ }
function formatCashFlowDate(date) { /* ... */ }
function calculateCashFlowTotal(flows) { /* ... */ }
```

### Accounts Module
```javascript
// Data management
async function loadAccounts() { /* ... */ }
function renderAccountsTable(accounts) { /* ... */ }
function refreshAccountsData() { /* ... */ }

// CRUD operations
function saveAccount() { /* ... */ }
function updateAccount(id) { /* ... */ }
function deleteAccount(id) { /* ... */ }
function confirmDeleteAccount(id) { /* ... */ }

// Modal management
function showAddAccountModal() { /* ... */ }
function showEditAccountModal(id) { /* ... */ }
function showDeleteAccountModal(id) { /* ... */ }
function closeAccountModal() { /* ... */ }
```

### Alerts Module
```javascript
// Data management
async function loadAlerts() { /* ... */ }
function renderAlertsTable(alerts) { /* ... */ }
function refreshAlertsData() { /* ... */ }

// CRUD operations
function saveAlert() { /* ... */ }
function updateAlert(id) { /* ... */ }
function deleteAlert(id) { /* ... */ }
function confirmDeleteAlert(id) { /* ... */ }

// Modal management
function showAddAlertModal() { /* ... */ }
function showEditAlertModal(id) { /* ... */ }
function showDeleteAlertModal(id) { /* ... */ }
function closeAlertModal() { /* ... */ }
```

## Future Enhancements

### Planned Improvements
1. **Advanced Function Naming**: More sophisticated naming patterns
2. **Automated Naming Validation**: Tools to enforce naming conventions
3. **Documentation Generation**: Automatic documentation from naming patterns
4. **Code Quality Tools**: Integration with code quality tools

### Technical Debt
1. **Naming Consistency**: Ensure all modules follow conventions
2. **Documentation Updates**: Keep naming documentation current
3. **Code Review**: Regular review of naming conventions
4. **Team Training**: Ensure team understands naming patterns

---

**Last Updated**: 2025-01-26  
**Maintainer**: TikTrack Development Team
