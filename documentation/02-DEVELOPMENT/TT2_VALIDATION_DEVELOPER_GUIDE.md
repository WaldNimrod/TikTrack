# 📘 מדריך מפתח: Validation Framework - Phoenix

**פרויקט:** פיניקס (TikTrack V2)  
**תפקיד:** מדריך מפורט למפתחים עתידיים  
**תאריך:** 2026-02-01  
**גרסה:** v1.0  
**סטטוס:** ✅ **COMPLETE - READY FOR USE**

---

## 📋 תקציר

מדריך זה מספק הנחיות מפורטות למפתחים עתידיים כיצד להשתמש בתשתית הולידציה של Phoenix, ליצור Schemas חדשים, ולטפל בשגיאות.

---

## 🎯 עקרונות יסוד

### **1. PhoenixSchema - ריכוזיות חוקים**

**חוק ברזל:** כל Validation Rules חייבות להיות ב-Schemas מרכזיות, לא בתוך Components.

**מיקום:** `ui/src/logic/schemas/`

**דוגמה:**
```javascript
// ✅ נכון - Schema מרכזי
import { validateEmail } from '../../logic/schemas/userSchema.js';

const handleEmailChange = (e) => {
  const value = e.target.value;
  const result = validateEmail(value);
  setFieldErrors(prev => ({ ...prev, email: result.error }));
};

// ❌ לא נכון - לוגיקה בתוך Component
const handleEmailChange = (e) => {
  const value = e.target.value;
  if (!value.trim()) {
    setEmailError('שדה חובה'); // ❌ לא נכון!
  }
};
```

---

### **2. Error Handling - מודל היברידי**

**עדיפות:**
1. **Priority 1:** `error_code` מה-Backend (אם קיים)
2. **Priority 2:** `detail` message מה-Backend (תרגום אוטומטי)
3. **Priority 3:** הודעה בעברית ישירה (אם קיימת)
4. **Fallback:** הודעת שגיאה גנרית

**שימוש:**
```javascript
import { handleApiError } from '../../utils/errorHandler.js';

try {
  // API call...
} catch (error) {
  const { fieldErrors, formError } = handleApiError(error);
  setFieldErrors(prev => ({ ...prev, ...fieldErrors }));
  setFormError(formError);
}
```

---

### **3. Transformation Layer**

**חוק:** כל תקשורת API חייבת לעבור דרך `reactToApi` ו-`apiToReact`.

**דוגמה:**
```javascript
import { reactToApi, apiToReact } from '../../utils/transformers.js';

// לפני שליחה ל-API
const payload = reactToApi(formData); // camelCase → snake_case

// אחרי קבלה מה-API
const userData = apiToReact(response.data); // snake_case → camelCase
```

---

## 📚 יצירת Schema חדש

### **שלב 1: יצירת קובץ Schema**

**מיקום:** `ui/src/logic/schemas/[entity]Schema.js`

**דוגמה - יצירת ProductSchema:**
```javascript
/**
 * Product Validation Schema
 * 
 * @description Centralized validation rules for product forms
 * @module logic/schemas/productSchema
 */

/**
 * Validate product name field
 * 
 * @param {string} value - Product name value
 * @returns {Object} - { isValid: boolean, error: string|null }
 */
export const validateProductName = (value) => {
  if (!value?.trim()) {
    return { isValid: false, error: 'שדה חובה' };
  }
  
  if (value.length > 200) {
    return { isValid: false, error: 'שם המוצר לא יכול להיות יותר מ-200 תווים' };
  }
  
  return { isValid: true, error: null };
};

/**
 * Validate product price field
 * 
 * @param {string|number} value - Product price value
 * @returns {Object} - { isValid: boolean, error: string|null }
 */
export const validateProductPrice = (value) => {
  if (!value) {
    return { isValid: false, error: 'שדה חובה' };
  }
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue) || numValue <= 0) {
    return { isValid: false, error: 'מחיר חייב להיות מספר חיובי' };
  }
  
  return { isValid: true, error: null };
};

/**
 * Validate entire product form
 * 
 * @param {Object} formData - Form data (camelCase)
 * @returns {Object} - { isValid: boolean, errors: Object }
 */
export const validateProductForm = (formData) => {
  const errors = {};
  
  // Product name validation
  const nameResult = validateProductName(formData.productName);
  if (!nameResult.isValid) {
    errors.productName = nameResult.error;
  }
  
  // Product price validation
  const priceResult = validateProductPrice(formData.productPrice);
  if (!priceResult.isValid) {
    errors.productPrice = priceResult.error;
  }
  
  // Add more validations...
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
```

---

### **שלב 2: שימוש ב-Schema ב-Component**

```javascript
import { validateProductForm, validateProductName } from '../../logic/schemas/productSchema.js';
import { handleApiError } from '../../utils/errorHandler.js';
import { reactToApi } from '../../utils/transformers.js';

const ProductForm = () => {
  const [formData, setFormData] = useState({
    productName: '',
    productPrice: ''
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState(null);
  
  // Field-level validation
  const handleProductNameChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, productName: value }));
    
    // ✅ שימוש ב-Schema מרכזי
    const result = validateProductName(value);
    setFieldErrors(prev => ({
      ...prev,
      productName: result.error
    }));
  };
  
  // Form-level validation
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // ✅ שימוש ב-Schema מרכזי
    const { isValid, errors } = validateProductForm(formData);
    if (!isValid) {
      setFieldErrors(errors);
      return;
    }
    
    try {
      // ✅ Transformation Layer
      const payload = reactToApi(formData);
      const response = await productService.createProduct(payload);
      
      // Success handling...
    } catch (error) {
      // ✅ Error Handler
      const { fieldErrors: apiErrors, formError: apiError } = handleApiError(error);
      setFieldErrors(prev => ({ ...prev, ...apiErrors }));
      setFormError(apiError);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="productName">שם המוצר:</label>
        <input
          id="productName"
          type="text"
          value={formData.productName}
          onChange={handleProductNameChange}
          className={`form-group__input ${fieldErrors.productName ? 'form-group__input--error' : ''}`}
          aria-invalid={!!fieldErrors.productName}
        />
        {fieldErrors.productName && (
          <span className="form-group__error-message" role="alert">
            {fieldErrors.productName}
          </span>
        )}
      </div>
      
      {/* More fields... */}
      
      {formError && (
        <div className="form-error" role="alert">
          {formError}
        </div>
      )}
      
      <button type="submit">שמור</button>
    </form>
  );
};
```

---

## 🔧 הוספת Error Code חדש

### **שלב 1: עדכון Backend**

**קובץ:** `api/utils/exceptions.py`

```python
class ErrorCodes:
    # ... existing codes ...
    
    # Product errors
    PRODUCT_NOT_FOUND = "PRODUCT_NOT_FOUND"
    PRODUCT_ALREADY_EXISTS = "PRODUCT_ALREADY_EXISTS"
    PRODUCT_CREATE_FAILED = "PRODUCT_CREATE_FAILED"
```

---

### **שלב 2: עדכון Frontend**

**קובץ:** `ui/src/logic/errorCodes.js`

```javascript
export const ERROR_CODES = {
  // ... existing codes ...
  
  // Product errors
  'PRODUCT_NOT_FOUND': 'מוצר לא נמצא.',
  'PRODUCT_ALREADY_EXISTS': 'מוצר כבר קיים.',
  'PRODUCT_CREATE_FAILED': 'יצירת המוצר נכשלה.',
};
```

---

## 📋 Checklist ליצירת Form חדש

### **Phase 1: Schema Creation**
- [ ] יצירת קובץ Schema חדש ב-`ui/src/logic/schemas/`
- [ ] הגדרת פונקציות ולידציה לכל שדה
- [ ] הגדרת פונקציית ולידציה מלאה לטופס
- [ ] תיעוד JSDoc מלא

### **Phase 2: Component Creation**
- [ ] יצירת Component חדש
- [ ] שימוש ב-Schema מרכזי (לא לוגיקה פנימית)
- [ ] שימוש ב-Error Handler
- [ ] שימוש ב-Transformation Layer
- [ ] הוספת BEM classes לשגיאות
- [ ] הוספת ARIA attributes

### **Phase 3: Error Handling**
- [ ] הוספת Error Codes ל-Backend (אם נדרש)
- [ ] הוספת Error Codes ל-Frontend Dictionary
- [ ] בדיקת טיפול בשגיאות

### **Phase 4: Testing**
- [ ] בדיקת ולידציה Client-side
- [ ] בדיקת ולידציה Server-side
- [ ] בדיקת Error Handling
- [ ] בדיקת Transformation Layer

---

## 🎨 Best Practices

### **1. הודעות שגיאה**

**✅ נכון:**
- הודעות בעברית ברורות ומדויקות
- הסבר מה הבעיה ואיך לתקן
- הודעות קצרות וקלות להבנה

**❌ לא נכון:**
- הודעות באנגלית
- הודעות טכניות מדי
- הודעות ארוכות מדי

---

### **2. Validation Timing**

**Field-level:** על `onBlur` (כשהמשתמש עוזב את השדה)  
**Form-level:** על `onSubmit` (כשהמשתמש שולח את הטופס)

**דוגמה:**
```javascript
// Field-level validation
<input
  onBlur={() => {
    const result = validateEmail(formData.email);
    setFieldErrors(prev => ({ ...prev, email: result.error }));
  }}
/>

// Form-level validation
<form onSubmit={(e) => {
  e.preventDefault();
  const { isValid, errors } = validateForm(formData);
  if (!isValid) {
    setFieldErrors(errors);
    return;
  }
  // Submit...
}}>
```

---

### **3. State Management**

**מבנה מומלץ:**
```javascript
const [formData, setFormData] = useState({
  field1: '',
  field2: ''
});

const [fieldErrors, setFieldErrors] = useState({});
const [formError, setFormError] = useState(null);
const [isSubmitting, setIsSubmitting] = useState(false);
```

---

### **4. Accessibility**

**חובה לכל שדה:**
- `aria-invalid={!!fieldErrors.fieldName}`
- `aria-describedby={fieldErrors.fieldName ? 'fieldName-error' : undefined}`
- `id="fieldName-error"` על הודעת שגיאה
- `role="alert"` על הודעת שגיאה

---

## 🔗 מסמכים רלוונטיים

1. **תשתית ולידציה:** `documentation/10-POLICIES/TT2_FORM_VALIDATION_FRAMEWORK.md`
2. **JS Standards:** `documentation/10-POLICIES/TT2_JS_STANDARDS_PROTOCOL.md`
3. **CSS Standards:** `documentation/10-POLICIES/TT2_CSS_STANDARDS_PROTOCOL.md`
4. **החלטה אדריכלית:** `_COMMUNICATION/90_Architects_comunication/ARCHITECT_DIRECTIVE_VALIDATION_HYBRID.md`

---

## 📝 דוגמאות קוד

### **דוגמה מלאה - Form עם ולידציה**

ראה: `ui/src/components/profile/ProfileView.jsx`

---

**תאריך עדכון:** 2026-02-01  
**גרסה:** v1.0  
**סטטוס:** ✅ **COMPLETE**
