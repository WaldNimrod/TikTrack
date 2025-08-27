# Function Naming Conventions - TikTrack Frontend

## Overview
This document outlines the naming conventions used for functions in the TikTrack frontend system. Consistent naming is crucial for code maintainability and developer productivity.

## 🎯 **Naming Principles**

### **1. Clarity and Specificity**
- **Clear Purpose:** Function names should clearly indicate what they do
- **Entity-Specific:** Include the entity/component the function serves
- **Action-Oriented:** Use verbs to describe the function's action
- **Consistent Patterns:** Follow established patterns across the codebase

### **2. Separation of Concerns**
- **Global Functions:** Functions used across multiple pages
- **Page-Specific Functions:** Functions used only on specific pages
- **Utility Functions:** Helper functions for common operations
- **Translation Functions:** Functions for text translation

## 📝 **Naming Patterns**

### **Translation Functions**
**Pattern:** `translate[Entity][Property]`

**Examples:**
```javascript
translateAccountStatus()      // Account status translation
translateTickerStatus()       // Ticker status translation
translateTradeType()          // Trade type translation
translateCashFlowType()       // Cash flow type translation
translateIsTriggered()        // Boolean triggered status translation
```

**Benefits:**
- Clear indication of what entity is being translated
- Consistent pattern across all translation functions
- Easy to identify and maintain

### **Update Functions**
**Pattern:** `update[Component][Action]`

**Examples:**
```javascript
updatePageSummaryStats()      // Update page summary statistics
updateTableSortIcons()        // Update table sorting icons
updateAccountFilterDisplayText() // Update account filter display text
updateStatusFilterDisplayText()  // Update status filter display text
```

**Benefits:**
- Clear indication of what component is being updated
- Specific action description
- Consistent with UI update patterns

### **CRUD Functions**
**Pattern:** `[action][Entity]`

**Examples:**
```javascript
createAccount()               // Create new account
updateAccount()               // Update existing account
deleteAccount()               // Delete account
loadAccounts()                // Load accounts data
saveAccount()                 // Save account data
```

**Benefits:**
- Standard CRUD operation naming
- Clear entity identification
- Consistent across all entities

### **Event Handler Functions**
**Pattern:** `handle[Event][Action]` or `on[Event][Action]`

**Examples:**
```javascript
handleAccountSubmit()         // Handle account form submission
onTradeClick()                // Handle trade row click
handleFilterChange()          // Handle filter change event
onSortColumnClick()           // Handle sort column click
```

**Benefits:**
- Clear event identification
- Action description included
- Consistent event handling pattern

### **Validation Functions**
**Pattern:** `validate[Entity][Property]` or `is[Property]Valid`

**Examples:**
```javascript
validateAccountName()         // Validate account name
isEmailValid()                // Check if email is valid
validateTradeAmount()         // Validate trade amount
isDateValid()                 // Check if date is valid
```

**Benefits:**
- Clear validation purpose
- Property-specific validation
- Boolean return indication

## 🔄 **Function Categories**

### **Global Utility Functions**
**Location:** `main.js`
**Pattern:** `[action][Component]`

```javascript
// Table operations
sortTableData()               // Sort table data
updateTableSortIcons()        // Update table sort icons
loadSortState()               // Load table sort state

// Page operations
updatePageSummaryStats()      // Update page summary statistics
showNotification()            // Show notification message
formatCurrency()              // Format currency values
```

### **Translation Functions**
**Location:** `translation-utils.js`
**Pattern:** `translate[Entity][Property]`

```javascript
// Status translations
translateAccountStatus()      // Account status to Hebrew
translateTickerStatus()       // Ticker status to Hebrew
translateAlertStatus()        // Alert status to Hebrew

// Type translations
translateTradeType()          // Trade type to Hebrew
translateCashFlowType()       // Cash flow type to Hebrew
translateExecutionAction()    // Execution action to Hebrew
```

### **Page-Specific Functions**
**Location:** `[page].js`
**Pattern:** `[action][Entity][Context]`

```javascript
// Accounts page
loadAccountsForDesignsPage()  // Load accounts for designs page
updateAccountsTable()         // Update accounts table
showEditAccountModal()        // Show account edit modal

// Trades page
loadTradesData()              // Load trades data
updateTradesTable()           // Update trades table
handleTradeFilter()           // Handle trade filtering
```

### **Component Functions**
**Location:** `[component].js`
**Pattern:** `[action][Component][Property]`

```javascript
// Header system
updateStatusFilterDisplayText()   // Update status filter text
updateTypeFilterDisplayText()     // Update type filter text
updateAccountFilterDisplayText()  // Update account filter text

// Menu system
toggleMenuVisibility()            // Toggle menu visibility
updateMenuItems()                 // Update menu items
handleMenuClick()                 // Handle menu click
```

## 📊 **Naming Guidelines**

### **Do's**
✅ **Use descriptive names:**
```javascript
// Good
updateAccountBalance()
validateTradeAmount()
translateAccountStatus()

// Avoid
update()
validate()
translate()
```

✅ **Include entity context:**
```javascript
// Good
updateAccountsTable()
loadTradesData()
deleteAlert()

// Avoid
updateTable()
loadData()
delete()
```

✅ **Use consistent verbs:**
```javascript
// Good - consistent update pattern
updateAccountStatus()
updateTradeType()
updateAlertMessage()

// Avoid - inconsistent verbs
setAccountStatus()
changeTradeType()
modifyAlertMessage()
```

✅ **Group related functions:**
```javascript
// Good - related functions grouped
translateAccountStatus()
translateAccountType()
translateAccountCurrency()

// Good - different entities separated
translateAccountStatus()
translateTradeStatus()
translateAlertStatus()
```

### **Don'ts**
❌ **Avoid abbreviations:**
```javascript
// Avoid
updAccStat()
valTradeAmt()
trnsAccStat()

// Use full names
updateAccountStatus()
validateTradeAmount()
translateAccountStatus()
```

❌ **Avoid generic names:**
```javascript
// Avoid
update()
process()
handle()

// Use specific names
updateAccountTable()
processTradeData()
handleAccountSubmit()
```

❌ **Avoid inconsistent patterns:**
```javascript
// Avoid - mixed patterns
updateAccount()
setTradeStatus()
modifyAlert()

// Use consistent pattern
updateAccount()
updateTradeStatus()
updateAlert()
```

## 🔗 **Backward Compatibility**

### **Old Function Names**
When renaming functions, maintain backward compatibility:

```javascript
// New function name
function updatePageSummaryStats() {
    // Implementation
}

// Backward compatibility
window.updateSummaryStats = updatePageSummaryStats;
```

### **Migration Strategy**
1. **Create new function** with proper naming
2. **Export old name** pointing to new function
3. **Update all calls** to use new name
4. **Remove old exports** after migration complete

## 📚 **Documentation Standards**

### **JSDoc Comments**
All functions should include comprehensive JSDoc comments:

```javascript
/**
 * Update account status in the accounts table
 * @param {string} accountId - The account ID to update
 * @param {string} newStatus - The new status value
 * @param {boolean} showNotification - Whether to show success notification
 * @returns {Promise<boolean>} Success status of the update operation
 * @throws {Error} When account is not found or update fails
 */
function updateAccountStatus(accountId, newStatus, showNotification = true) {
    // Implementation
}
```

### **Function Documentation**
Include in function documentation:
- **Purpose:** What the function does
- **Parameters:** Parameter types and descriptions
- **Returns:** Return value type and description
- **Examples:** Usage examples
- **Related:** Related functions or components

## 🧪 **Testing and Validation**

### **Naming Validation**
- **Consistency Check:** Ensure naming follows established patterns
- **Clarity Review:** Verify function names are self-explanatory
- **Entity Identification:** Confirm entity context is clear
- **Action Description:** Validate action description is accurate

### **Code Review Checklist**
- [ ] Function name follows established pattern
- [ ] Entity context is clearly identified
- [ ] Action description is accurate
- [ ] No abbreviations used
- [ ] Consistent with similar functions
- [ ] JSDoc comments included
- [ ] Backward compatibility maintained (if applicable)

## 🚀 **Future Guidelines**

### **Adding New Functions**
When adding new functions:

1. **Identify the category** (utility, translation, page-specific, etc.)
2. **Follow the appropriate pattern** for that category
3. **Include entity context** in the name
4. **Use descriptive action verbs**
5. **Add comprehensive JSDoc comments**
6. **Update this documentation** if new patterns are established

### **Refactoring Guidelines**
When refactoring function names:

1. **Maintain backward compatibility** during transition
2. **Update all call sites** to use new names
3. **Update documentation** to reflect changes
4. **Test thoroughly** to ensure no breaking changes
5. **Remove old exports** after migration is complete

---

**Last Updated:** August 22, 2025  
**Version:** 2.1  
**Status:** Complete ✅
