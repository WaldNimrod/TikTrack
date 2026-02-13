# CSS Load Verification Specification

**id:** `TEAM_40_CSS_LOAD_VERIFICATION_SPEC`  
**owner:** Team 40 (UI Assets & Design) - "שומרי ה-DNA"  
**status:** 🛑 **RED - BLOCKING - MANDATORY**  
**last_updated:** 2026-02-06  
**version:** v1.0 (Design Sprint - Critical Fix)

---

## 📢 Executive Summary

**CSS Load Verification** הוא מנגנון ב-G-Bridge (PhoenixBridge) שמוודא שקבצי ה-CSS נטענים בסדר הנכון, במיוחד ש-`phoenix-base.css` (DNA Variables) נטען ראשון לפני כל קובצי CSS אחרים.

מנגנון זה הוא **חובה קריטית** (P0) שנדרש על ידי Spy Team והאדריכלית כדי לאשר את ה-Design Sprint.

---

## 🎯 Purpose & Goals

### **מטרות עיקריות:**

1. **וידוא סדר טעינה:** וידוא ש-`phoenix-base.css` נטען ראשון בהיררכיית הטעינה
2. **Validation של משתנים:** וידוא שכל המשתנים מה-DNA Variables זמינים לפני טעינת קבצי CSS אחרים
3. **Error Handling:** זיהוי וטיפול בשגיאות אם סדר הטעינה שגוי
4. **Integration עם UAI:** אינטגרציה עם UAI DOMStage לביצוע הבדיקה בשלב הנכון

### **בעיות שהמערכת פותרת:**

- **בעיה 1:** אין מנגנון וידוא שקבצי CSS נטענים בסדר הנכון
- **בעיה 2:** אין בדיקה שמשתני CSS זמינים לפני שימוש
- **בעיה 3:** שגיאות עיצוב עקב טעינת CSS בסדר שגוי
- **בעיה 4:** חוסר אכיפה של היררכיית הטעינה המוגדרת ב-DNA Variables CSS Spec

### **יתרונות:**

- **יתרון 1:** מניעת שגיאות עיצוב עקב סדר טעינה שגוי
- **יתרון 2:** אכיפה אוטומטית של היררכיית הטעינה
- **יתרון 3:** זיהוי מוקדם של בעיות CSS
- **יתרון 4:** אינטגרציה חלקה עם UAI Lifecycle

---

## 🏗️ Architecture

### **מבנה כללי:**

```
┌─────────────────────────────────────────────────────────────┐
│                    CSS Load Verifier                        │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  1. Check CSS File Loading Order                    │  │
│  │     - phoenix-base.css must be first                 │  │
│  └──────────────────────────────────────────────────────┘  │
│                          │                                   │
│                          ▼                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  2. Verify CSS Variables Availability                │  │
│  │     - Check critical variables from :root            │  │
│  └──────────────────────────────────────────────────────┘  │
│                          │                                   │
│                          ▼                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  3. Error Handling & Reporting                     │  │
│  │     - Throw errors if verification fails             │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### **רכיבים מרכזיים:**

- **CSSLoadVerifier Class:** מחלקה ראשית לביצוע כל הבדיקות
- **checkCSSLoaded():** בדיקה אם קובץ CSS ספציפי נטען
- **checkCSSVariables():** בדיקה אם משתני CSS קריטיים זמינים
- **checkLoadingOrder():** בדיקת סדר טעינת קבצי CSS
- **verifyCSSLoadOrder():** פונקציה ראשית שמבצעת את כל הבדיקות

### **תלויות:**

- **UAI DOMStage:** הבדיקה מתבצעת ב-DOMStage לפני המשך Lifecycle
- **phoenix-base.css:** הקובץ חייב להיות נטען לפני הבדיקה
- **Browser APIs:** `document.querySelectorAll()`, `getComputedStyle()`

---

## 📋 API / Interface

### **CSSLoadVerifier Class**

#### **Constructor:**

```javascript
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
}
```

#### **Methods:**

##### **1. verifyCSSLoadOrder()**

**Purpose:** פונקציה ראשית שמבצעת את כל הבדיקות

**Returns:** `Promise<boolean>` - `true` אם כל הבדיקות עברו, `false` אחרת

**Throws:** `Error` אם `strictMode: true` והבדיקה נכשלה

**Example:**
```javascript
const verifier = new CSSLoadVerifier();
try {
  const isValid = await verifier.verifyCSSLoadOrder();
  if (isValid) {
    console.log('✅ CSS Load Order Verified');
  }
} catch (error) {
  console.error('❌ CSS Load Order Verification Failed:', error);
  throw error;
}
```

##### **2. checkCSSLoaded(filename)**

**Purpose:** בדיקה אם קובץ CSS ספציפי נטען

**Parameters:**
- `filename` (string): שם הקובץ לבדיקה (למשל, `'phoenix-base.css'`)

**Returns:** `boolean` - `true` אם הקובץ נטען, `false` אחרת

**Example:**
```javascript
const verifier = new CSSLoadVerifier();
const isLoaded = verifier.checkCSSLoaded('phoenix-base.css');
if (!isLoaded) {
  console.error('phoenix-base.css is not loaded');
}
```

##### **3. checkCSSVariables()**

**Purpose:** בדיקה אם משתני CSS קריטיים זמינים

**Returns:** `boolean` - `true` אם כל המשתנים הקריטיים זמינים, `false` אחרת

**Example:**
```javascript
const verifier = new CSSLoadVerifier();
const variablesAvailable = verifier.checkCSSVariables();
if (!variablesAvailable) {
  console.error('CSS Variables are not available');
}
```

##### **4. checkLoadingOrder()**

**Purpose:** בדיקת סדר טעינת קבצי CSS

**Returns:** `boolean` - `true` אם הסדר נכון, `false` אחרת

**Example:**
```javascript
const verifier = new CSSLoadVerifier();
const orderCorrect = verifier.checkLoadingOrder();
if (!orderCorrect) {
  console.error('CSS files loaded in incorrect order');
}
```

---

## 🔄 Workflow / Lifecycle

### **תהליך עבודה:**

1. **שלב 1: אתחול CSSLoadVerifier**
   - יצירת instance של `CSSLoadVerifier`
   - הגדרת options (אם נדרש)

2. **שלב 2: בדיקת טעינת phoenix-base.css**
   - בדיקה אם `phoenix-base.css` נטען
   - אם לא נטען, זריקת שגיאה (אם `strictMode: true`)

3. **שלב 3: בדיקת זמינות משתנים**
   - בדיקה אם כל המשתנים הקריטיים זמינים
   - אם משתנה לא זמין, זריקת שגיאה (אם `strictMode: true`)

4. **שלב 4: בדיקת סדר טעינה**
   - בדיקה ש-`phoenix-base.css` הוא הראשון ברשימת קבצי CSS
   - אם הסדר שגוי, זריקת שגיאה (אם `strictMode: true`)

5. **שלב 5: דיווח תוצאות**
   - אם כל הבדיקות עברו, החזרת `true`
   - אם בדיקה נכשלה, זריקת שגיאה או החזרת `false` (תלוי ב-`strictMode`)

### **Integration עם UAI DOMStage:**

הבדיקה מתבצעת ב-`DOMStage.execute()` לפני המשך Lifecycle:

```javascript
class DOMStage {
  async execute() {
    // ... existing DOM loading code ...
    
    // Verify CSS loading order (CRITICAL - must pass)
    const verifier = new CSSLoadVerifier({ strictMode: true });
    try {
      await verifier.verifyCSSLoadOrder();
      console.log('✅ CSS Load Order Verified');
    } catch (error) {
      console.error('❌ CSS Load Order Verification Failed:', error);
      // Stop page load - this is critical
      throw new Error(`CSS Load Verification Failed: ${error.message}`);
    }
    
    // ... continue with DOM stage ...
  }
}
```

---

## ⚠️ Error Handling

### **Error Types:**

- **Error Type 1: Base CSS Not Loaded**
  - **תיאור:** `phoenix-base.css` לא נטען
  - **קוד שגיאה:** `CSS_BASE_FILE_NOT_LOADED`
  - **טיפול:** זריקת שגיאה ועצירת Lifecycle

- **Error Type 2: CSS Variables Not Available**
  - **תיאור:** משתני CSS קריטיים לא זמינים
  - **קוד שגיאה:** `CSS_VARIABLES_NOT_AVAILABLE`
  - **טיפול:** זריקת שגיאה ועצירת Lifecycle

- **Error Type 3: Incorrect Loading Order**
  - **תיאור:** `phoenix-base.css` לא נטען ראשון
  - **קוד שגיאה:** `CSS_LOAD_ORDER_INCORRECT`
  - **טיפול:** זריקת שגיאה ועצירת Lifecycle

### **Error Handling Patterns:**

1. **Strict Mode (Default):**
   - זריקת שגיאה אם בדיקה נכשלה
   - עצירת Lifecycle
   - דיווח שגיאה ל-console

2. **Non-Strict Mode:**
   - החזרת `false` אם בדיקה נכשלה
   - המשך Lifecycle (עם אזהרה)
   - דיווח אזהרה ל-console

### **Error Codes:**

| Code | Description | HTTP Status |
|:---|:---|:---|
| `CSS_BASE_FILE_NOT_LOADED` | `phoenix-base.css` לא נטען | N/A (Client-side) |
| `CSS_VARIABLES_NOT_AVAILABLE` | משתני CSS לא זמינים | N/A (Client-side) |
| `CSS_LOAD_ORDER_INCORRECT` | סדר טעינת CSS שגוי | N/A (Client-side) |

---

## 📊 Examples

### **דוגמה 1: שימוש בסיסי**

```javascript
import { CSSLoadVerifier } from '../../components/core/cssLoadVerifier.js';

// Create verifier instance
const verifier = new CSSLoadVerifier();

// Verify CSS load order
try {
  const isValid = await verifier.verifyCSSLoadOrder();
  if (isValid) {
    console.log('✅ CSS Load Order Verified');
  }
} catch (error) {
  console.error('❌ CSS Load Order Verification Failed:', error);
  // Handle error - stop page load
  throw error;
}
```

### **דוגמה 2: Integration עם UAI DOMStage**

```javascript
// ui/src/components/core/stages/DOMStage.js
import { CSSLoadVerifier } from '../cssLoadVerifier.js';

class DOMStage {
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
    } catch (error) {
      console.error('❌ CSS Load Order Verification Failed:', error);
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
}
```

### **דוגמה 3: בדיקה ידנית של משתנים**

```javascript
import { CSSLoadVerifier } from '../../components/core/cssLoadVerifier.js';

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
```

### **דוגמה 4: Non-Strict Mode (אזהרות בלבד)**

```javascript
import { CSSLoadVerifier } from '../../components/core/cssLoadVerifier.js';

// Create verifier with non-strict mode
const verifier = new CSSLoadVerifier({
  strictMode: false // Don't throw errors, just return false
});

// Verify CSS load order (won't throw errors)
const isValid = await verifier.verifyCSSLoadOrder();
if (!isValid) {
  console.warn('⚠️ CSS Load Order Verification Failed - continuing anyway');
  // Continue with page load (not recommended for production)
}
```

---

## 🔗 Dependencies

### **External Dependencies:**

- **אין תלויות חיצוניות:** הקוד משתמש רק ב-Browser APIs סטנדרטיים

### **Internal Dependencies:**

- **UAI DOMStage:** הבדיקה מתבצעת ב-DOMStage
- **phoenix-base.css:** הקובץ חייב להיות נטען לפני הבדיקה

### **SSOT Dependencies:**

- **DNA Variables CSS Spec:** `_COMMUNICATION/team_40/TEAM_40_DNA_VARIABLES_CSS_SPEC.md`
- **UAI Spec:** `_COMMUNICATION/team_30/UAI_Architectural_Design.md`

---

## ✅ Checklist

### **Specification:**

- [x] כל הסעיפים מולאו
- [x] דוגמאות קוד נכללו
- [x] Error handling מתועד
- [x] Integration עם UAI מתועד
- [x] API/Interface מתועד

### **Implementation:**

- [ ] יצירת `cssLoadVerifier.js` ב-`ui/src/components/core/`
- [ ] יישום `CSSLoadVerifier` class
- [ ] יישום כל ה-Methods
- [ ] יישום Error Handling
- [ ] Integration עם UAI DOMStage

---

## 📞 קישורים רלוונטיים

### **מקור המנדט:**
- `_COMMUNICATION/team_10/TEAM_10_TO_TEAM_40_CSS_LOAD_VERIFICATION.md`
- `_COMMUNICATION/90_Architects_comunication/ARCHITECT_DESIGN_CONTRACTS_MANDATE.md`

### **Specs קשורים:**
- `_COMMUNICATION/team_40/TEAM_40_DNA_VARIABLES_CSS_SPEC.md`
- `_COMMUNICATION/team_30/UAI_Architectural_Design.md`

### **קבצים קשורים:**
- `ui/src/styles/phoenix-base.css` (DNA Variables SSOT)
- `ui/src/components/core/phoenixFilterBridge.js` (PhoenixBridge example)

---

## 📝 הערות חשובות

### **1. חובה קריטית (P0):**
- הבדיקה היא **חובה** ולא אופציונלית
- אם הבדיקה נכשלה, Lifecycle חייב להיעצר
- אין להמשיך ללא CSS Load Verification

### **2. סדר טעינה:**
- `phoenix-base.css` **חייב** להיטען ראשון
- כל קובצי CSS אחרים חייבים להיטען אחרי `phoenix-base.css`

### **3. משתנים קריטיים:**
- המשתנים הקריטיים נקבעים ב-`criticalVariables` option
- ניתן להתאים את הרשימה לפי צרכים

### **4. Strict Mode:**
- ברירת המחדל היא `strictMode: true`
- ב-Strict Mode, שגיאות זורקות exceptions ועצירת Lifecycle
- ב-Non-Strict Mode, רק אזהרות (לא מומלץ ל-production)

---

**Team 40 (UI Assets & Design) - "שומרי ה-DNA"**  
**תאריך:** 2026-02-06  
**סטטוס:** 🛑 **RED - BLOCKING - MANDATORY**

**log_entry | [Team 40] | CSS_LOAD_VERIFICATION | SPEC_DRAFT | RED | 2026-02-06**
