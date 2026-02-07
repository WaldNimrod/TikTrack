# CSS Load Verification - דוגמאות קוד

**id:** `TEAM_40_CSS_LOAD_VERIFICATION_EXAMPLES`  
**owner:** Team 40 (UI Assets & Design) - "שומרי ה-DNA"  
**status:** 🛑 **RED - BLOCKING - MANDATORY**  
**last_updated:** 2026-02-06  
**version:** v1.0 (Design Sprint - Critical Fix)

---

## 📢 Executive Summary

מסמך זה מכיל דוגמאות קוד מפורטות לשימוש ב-**CSS Load Verification** במערכת Phoenix.

---

## 📋 דוגמאות קוד

### **דוגמה 1: יישום בסיסי של CSSLoadVerifier**

```javascript
/**
 * CSS Load Verifier - Basic Implementation
 * Location: ui/src/components/core/cssLoadVerifier.js
 */

class CSSLoadVerifier {
  constructor(options = {}) {
    this.options = {
      baseCSSFile: 'phoenix-base.css',
      criticalVariables: [
        '--color-primary',
        '--font-family-primary',
        '--spacing-md',
        '--apple-text-primary',
        '--z-index-sticky'
      ],
      strictMode: true, // Throw errors on failure
      ...options
    };
  }

  /**
   * Verify CSS loading order
   * @returns {Promise<boolean>} - true if order is correct
   * @throws {Error} - if strictMode is true and verification fails
   */
  async verifyCSSLoadOrder() {
    // 1. Check if phoenix-base.css is loaded first
    const baseCSSLoaded = this.checkCSSLoaded(this.options.baseCSSFile);
    if (!baseCSSLoaded) {
      const error = new Error(`${this.options.baseCSSFile} must be loaded first`);
      error.code = 'CSS_BASE_FILE_NOT_LOADED';
      if (this.options.strictMode) {
        throw error;
      }
      console.error(`❌ ${error.message}`);
      return false;
    }

    // 2. Verify CSS Variables are available
    const variablesAvailable = this.checkCSSVariables();
    if (!variablesAvailable) {
      const error = new Error('CSS Variables from phoenix-base.css are not available');
      error.code = 'CSS_VARIABLES_NOT_AVAILABLE';
      if (this.options.strictMode) {
        throw error;
      }
      console.error(`❌ ${error.message}`);
      return false;
    }

    // 3. Check loading order of other CSS files
    const orderCorrect = this.checkLoadingOrder();
    if (!orderCorrect) {
      const error = new Error(`${this.options.baseCSSFile} must be loaded first`);
      error.code = 'CSS_LOAD_ORDER_INCORRECT';
      if (this.options.strictMode) {
        throw error;
      }
      console.warn(`⚠️ ${error.message}`);
      return false;
    }

    console.log('✅ CSS Load Order Verified');
    return true;
  }

  /**
   * Check if specific CSS file is loaded
   * @param {string} filename - CSS filename
   * @returns {boolean}
   */
  checkCSSLoaded(filename) {
    const links = document.querySelectorAll('link[rel="stylesheet"]');
    for (const link of links) {
      if (link.href.includes(filename)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Check if CSS Variables are available
   * @returns {boolean}
   */
  checkCSSVariables() {
    // Check for critical CSS Variables from phoenix-base.css
    const root = getComputedStyle(document.documentElement);
    
    for (const varName of this.options.criticalVariables) {
      const value = root.getPropertyValue(varName);
      if (!value || value.trim() === '') {
        console.error(`❌ CSS Variable ${varName} is not available`);
        return false;
      }
    }

    return true;
  }

  /**
   * Check loading order of CSS files
   * @returns {boolean}
   */
  checkLoadingOrder() {
    const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
    const baseCSSIndex = links.findIndex(link => 
      link.href.includes(this.options.baseCSSFile)
    );

    // phoenix-base.css must be first
    if (baseCSSIndex !== 0) {
      console.error(`❌ ${this.options.baseCSSFile} must be loaded first (found at index ${baseCSSIndex})`);
      return false;
    }

    return true;
  }
}

// Export for use in UAI DOMStage
export { CSSLoadVerifier };
```

---

### **דוגמה 2: Integration עם UAI DOMStage**

```javascript
/**
 * DOMStage - With CSS Load Verification
 * Location: ui/src/components/core/stages/DOMStage.js
 */

import { CSSLoadVerifier } from '../cssLoadVerifier.js';

class DOMStage {
  constructor() {
    this.name = 'DOM';
    this.status = 'pending';
  }

  async execute() {
    this.status = 'running';

    // Wait for DOM
    await this.waitForDOM();

    // CRITICAL: Verify CSS loading order before continuing
    const verifier = new CSSLoadVerifier({
      strictMode: true, // Must pass - stop if fails
      baseCSSFile: 'phoenix-base.css',
      criticalVariables: [
        '--color-primary',
        '--font-family-primary',
        '--spacing-md',
        '--apple-text-primary',
        '--z-index-sticky'
      ]
    });

    try {
      await verifier.verifyCSSLoadOrder();
      console.log('✅ CSS Load Order Verified');

      // Emit event for CSS verification success
      this.emit('css-verified', {
        timestamp: Date.now(),
        verified: true,
        baseCSSFile: 'phoenix-base.css',
        variablesChecked: verifier.options.criticalVariables.length
      });
    } catch (error) {
      console.error('❌ CSS Load Order Verification Failed:', error);

      // Emit event for CSS verification failure
      this.emit('css-verification-failed', {
        error: error.message,
        errorCode: error.code,
        timestamp: Date.now(),
        verified: false
      });

      // Stop lifecycle - this is critical
      this.status = 'error';
      this.error = error;
      throw new Error(`CSS Load Verification Failed: ${error.message}`);
    }

    // Continue with DOM stage only if CSS verification passed
    await this.loadAuthGuard();
    await this.loadHeader();
    this.prepareContainers();

    this.status = 'completed';
    this.emit('stage-complete', { stage: this.name });
  }

  async waitForDOM() {
    return new Promise((resolve) => {
      if (document.readyState === 'complete' || document.readyState === 'interactive') {
        resolve();
      } else {
        document.addEventListener('DOMContentLoaded', resolve);
      }
    });
  }

  async loadAuthGuard() {
    // Load and execute authGuard.js
    // Wait for authentication check to complete
  }

  async loadHeader() {
    // Load headerLoader.js if needed
    // Wait for header to be injected
  }

  prepareContainers() {
    // Ensure required containers exist
    // Prepare page structure
  }

  emit(eventName, data) {
    window.dispatchEvent(new CustomEvent(`uai:${this.name.toLowerCase()}:${eventName}`, {
      detail: { stage: this.name, ...data }
    }));
  }
}

export { DOMStage };
```

---

### **דוגמה 3: שימוש ב-Standalone (ללא UAI)**

```javascript
/**
 * Standalone CSS Load Verification
 * Use this if you're not using UAI (not recommended)
 */

import { CSSLoadVerifier } from './cssLoadVerifier.js';

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', verifyCSS);
} else {
  verifyCSS();
}

async function verifyCSS() {
  const verifier = new CSSLoadVerifier({
    strictMode: true,
    baseCSSFile: 'phoenix-base.css',
    criticalVariables: [
      '--color-primary',
      '--font-family-primary',
      '--spacing-md',
      '--apple-text-primary',
      '--z-index-sticky'
    ]
  });

  try {
    await verifier.verifyCSSLoadOrder();
    console.log('✅ CSS Load Order Verified - Page can continue loading');
    
    // Continue with page initialization
    initializePage();
  } catch (error) {
    console.error('❌ CSS Load Order Verification Failed:', error);
    
    // Show error message to user
    showErrorMessage('CSS loading error. Please refresh the page.');
    
    // Stop page initialization
    return;
  }
}

function initializePage() {
  // Your page initialization code here
  console.log('Page initialization started...');
}

function showErrorMessage(message) {
  // Show error message to user
  const errorDiv = document.createElement('div');
  errorDiv.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: #ff3b30;
    color: white;
    padding: 16px;
    text-align: center;
    z-index: 10000;
  `;
  errorDiv.textContent = message;
  document.body.appendChild(errorDiv);
}
```

---

### **דוגמה 4: בדיקה ידנית של משתנים ספציפיים**

```javascript
/**
 * Manual CSS Variables Check
 * Use this to check specific variables manually
 */

import { CSSLoadVerifier } from './cssLoadVerifier.js';

const verifier = new CSSLoadVerifier();

// Check if specific CSS file is loaded
const isBaseLoaded = verifier.checkCSSLoaded('phoenix-base.css');
console.log('phoenix-base.css loaded:', isBaseLoaded);

// Check if CSS variables are available
const variablesAvailable = verifier.checkCSSVariables();
console.log('CSS Variables available:', variablesAvailable);

// Check loading order
const orderCorrect = verifier.checkLoadingOrder();
console.log('Loading order correct:', orderCorrect);

// Check specific variable manually
function checkSpecificVariable(varName) {
  const root = getComputedStyle(document.documentElement);
  const value = root.getPropertyValue(varName);
  
  if (!value || value.trim() === '') {
    console.error(`❌ CSS Variable ${varName} is not available`);
    return false;
  }
  
  console.log(`✅ CSS Variable ${varName} = ${value}`);
  return true;
}

// Check specific variables
checkSpecificVariable('--color-primary');
checkSpecificVariable('--font-family-primary');
checkSpecificVariable('--spacing-md');
```

---

### **דוגמה 5: Event Listeners**

```javascript
/**
 * Event Listeners for CSS Verification
 * Listen to CSS verification events from UAI
 */

// Listen for CSS verification success
window.addEventListener('uai:dom:css-verified', function(e) {
  console.log('✅ CSS Verified:', e.detail);
  
  // Continue with page initialization
  const { timestamp, verified, baseCSSFile, variablesChecked } = e.detail;
  console.log(`CSS verified at ${new Date(timestamp).toISOString()}`);
  console.log(`Base CSS file: ${baseCSSFile}`);
  console.log(`Variables checked: ${variablesChecked}`);
  
  // Your code here
});

// Listen for CSS verification failure
window.addEventListener('uai:dom:css-verification-failed', function(e) {
  console.error('❌ CSS Verification Failed:', e.detail);
  
  // Show error message to user
  const { error, errorCode, timestamp } = e.detail;
  console.error(`Error: ${error}`);
  console.error(`Error code: ${errorCode}`);
  console.error(`Failed at: ${new Date(timestamp).toISOString()}`);
  
  // Show error message to user
  showErrorMessage('CSS loading error. Please refresh the page.');
  
  // Your error handling code here
});

function showErrorMessage(message) {
  // Show error message to user
  const errorDiv = document.createElement('div');
  errorDiv.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: #ff3b30;
    color: white;
    padding: 16px;
    text-align: center;
    z-index: 10000;
    font-family: var(--font-family-primary, sans-serif);
  `;
  errorDiv.textContent = message;
  document.body.appendChild(errorDiv);
}
```

---

### **דוגמה 6: HTML Loading Order (Correct)**

```html
<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Phoenix App</title>
  
  <!-- ✅ CORRECT: phoenix-base.css MUST be loaded first -->
  <link rel="stylesheet" href="ui/src/styles/phoenix-base.css">
  
  <!-- ✅ CORRECT: Other CSS files loaded after phoenix-base.css -->
  <link rel="stylesheet" href="ui/src/styles/phoenix-components.css">
  <link rel="stylesheet" href="ui/src/styles/phoenix-header.css">
  <link rel="stylesheet" href="ui/src/styles/D15_DASHBOARD_STYLES.css">
</head>
<body>
  <!-- Page content -->
  
  <!-- UAI Entry Point -->
  <script type="module" src="ui/src/components/core/UnifiedAppInit.js"></script>
</body>
</html>
```

---

### **דוגמה 7: HTML Loading Order (Incorrect - Will Fail)**

```html
<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Phoenix App</title>
  
  <!-- ❌ INCORRECT: phoenix-base.css is NOT first -->
  <link rel="stylesheet" href="ui/src/styles/phoenix-components.css">
  <link rel="stylesheet" href="ui/src/styles/phoenix-header.css">
  
  <!-- ❌ INCORRECT: phoenix-base.css loaded after other CSS files -->
  <link rel="stylesheet" href="ui/src/styles/phoenix-base.css">
  
  <!-- This will cause CSS Load Verification to fail -->
</head>
<body>
  <!-- Page content -->
</body>
</html>
```

---

### **דוגמה 8: Non-Strict Mode (אזהרות בלבד)**

```javascript
/**
 * Non-Strict Mode - Warnings Only
 * NOT RECOMMENDED for production
 */

import { CSSLoadVerifier } from './cssLoadVerifier.js';

const verifier = new CSSLoadVerifier({
  strictMode: false, // Don't throw errors, just return false
  baseCSSFile: 'phoenix-base.css',
  criticalVariables: [
    '--color-primary',
    '--font-family-primary',
    '--spacing-md',
    '--apple-text-primary',
    '--z-index-sticky'
  ]
});

// Verify CSS load order (won't throw errors)
const isValid = await verifier.verifyCSSLoadOrder();

if (!isValid) {
  console.warn('⚠️ CSS Load Order Verification Failed - continuing anyway');
  // Continue with page load (not recommended for production)
} else {
  console.log('✅ CSS Load Order Verified');
  // Continue with page load
}
```

---

## ✅ Checklist

### **דוגמאות קוד:**

- [x] יישום בסיסי של CSSLoadVerifier
- [x] Integration עם UAI DOMStage
- [x] שימוש ב-Standalone (ללא UAI)
- [x] בדיקה ידנית של משתנים ספציפיים
- [x] Event Listeners
- [x] HTML Loading Order (Correct)
- [x] HTML Loading Order (Incorrect)
- [x] Non-Strict Mode

---

## 📞 קישורים רלוונטיים

### **מקור המנדט:**
- `_COMMUNICATION/team_10/TEAM_10_TO_TEAM_40_CSS_LOAD_VERIFICATION.md`

### **Specs קשורים:**
- `_COMMUNICATION/team_40/TEAM_40_CSS_LOAD_VERIFICATION_SPEC.md`
- `_COMMUNICATION/team_40/TEAM_40_CSS_LOAD_VERIFICATION_INTEGRATION.md`

### **קבצים קשורים:**
- `ui/src/components/core/cssLoadVerifier.js` (לצור)
- `ui/src/components/core/stages/DOMStage.js` (לעדכון)

---

**Team 40 (UI Assets & Design) - "שומרי ה-DNA"**  
**תאריך:** 2026-02-06  
**סטטוס:** 🛑 **RED - BLOCKING - MANDATORY**

**log_entry | [Team 40] | CSS_LOAD_VERIFICATION | EXAMPLES | RED | 2026-02-06**
