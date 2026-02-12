/**
 * Transformation Layer - Data Normalization
 * ------------------------------------------
 * הפרדה בין ה-Backend (snake_case) לבין ה-Frontend (camelCase).
 * 
 * @description כל תקשורת API חייבת לעבור דרך פונקציות אלו כדי לשמור על ניקיון ה-State
 * @legacyReference Legacy.data.transformations
 * @version v1.3 - Hardened: NaN/Undefined prevention for table display
 */

/**
 * Financial fields that require forced number conversion
 * @constant {string[]}
 * @description Fields that contain these keywords will be converted to numbers
 * Note: 'minimum' is added because it's NUMERIC(20,6) in DB
 */
const FINANCIAL_FIELDS = ['balance', 'price', 'amount', 'total', 'value', 'quantity', 'cost', 'fee', 'commission', 'profit', 'loss', 'equity', 'margin', 'minimum'];

/**
 * Fields that should remain as strings (even if they contain financial keywords)
 * @constant {string[]}
 * @description These fields are VARCHAR/TEXT/ENUM in DB and should not be converted to numbers
 * Note: commissionValue was removed (now NUMERIC(20,6) - should be converted to number)
 * Note: commissionType is ENUM (TIERED/FLAT) - should remain as string
 */
const STRING_ONLY_FIELDS = ['description', 'notes', 'comment', 'message', 'name', 'title', 'label', 'commissionType', 'commission_type', 'type'];

/**
 * Convert value to number for financial fields
 * @param {any} value - Value to convert
 * @param {string} key - Field key name
 * @returns {number|null} - Converted number or null
 */
function convertFinancialField(value, key) {
  // Check if this field should remain as string (exclusions)
  const isStringOnlyField = STRING_ONLY_FIELDS.some(field => 
    key.toLowerCase() === field.toLowerCase()
  );
  
  if (isStringOnlyField) {
    return value; // Keep as-is (string)
  }
  
  // Check if this is a financial field (case-insensitive)
  const isFinancialField = FINANCIAL_FIELDS.some(field => 
    key.toLowerCase().includes(field.toLowerCase())
  );
  
  if (!isFinancialField) {
    return value;
  }
  
  // For financial fields: forced number conversion with default value
  if (value === null || value === undefined) {
    return 0; // Default value for null/undefined financial fields
  }
  
  // Convert to number
  const numValue = Number(value);
  
  // Return 0 if conversion failed (NaN) - prevents NaN in tables
  return isNaN(numValue) ? 0 : numValue;
}

/**
 * Sanitize value for table display - prevents NaN and undefined
 * @param {any} value - Value to sanitize
 * @returns {any} - Safe value for display
 */
function sanitizeForDisplay(value) {
  if (value === undefined) return null;
  if (typeof value === 'number' && isNaN(value)) return 0;
  return value;
}

/**
 * Transforms API response (snake_case) to React state (camelCase)
 * 
 * @description המרה מנתוני API לנתוני State של React
 * @legacyReference D15_USER_OBJECT, Legacy.data.apiToReact
 * @version v1.2 - Hardened: forced number conversion for financial fields
 * 
 * @param {Object|Array} apiData - API response with snake_case keys
 * @returns {Object|Array} - React state object with camelCase keys
 * 
 * @example
 * const apiData = { user_id: "123", balance: "1000.50", price: null };
 * const reactData = apiToReact(apiData);
 * // Returns: { userId: "123", balance: 1000.5, price: 0 }
 */
export const apiToReact = (apiData) => {
  const transform = (obj, parentKey = '') => {
    if (Array.isArray(obj)) {
      return obj.map(item => transform(item, parentKey));
    }
    if (obj !== null && typeof obj === 'object') {
      return Object.keys(obj).reduce((acc, key) => {
        const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
        const transformedValue = transform(obj[key], camelKey);
        
        // Apply forced number conversion for financial fields
        let result = convertFinancialField(transformedValue, camelKey);
        // Prevent undefined/NaN in output (table display)
        acc[camelKey] = sanitizeForDisplay(result);
        
        return acc;
      }, {});
    }
    
    // For primitive values, check if parent key indicates financial field
    const result = convertFinancialField(obj, parentKey);
    return sanitizeForDisplay(result);
  };
  return transform(apiData);
};

/**
 * Transforms React state (camelCase) to API request (snake_case)
 * 
 * @description המרה מנתוני UI לפורמט Payload עבור ה-API
 * @legacyReference Legacy.data.reactToApi
 * @version v1.2 - Hardened: forced number conversion for financial fields
 * 
 * @param {Object|Array} reactData - React state with camelCase keys
 * @returns {Object|Array} - API request object with snake_case keys
 * 
 * @example
 * const reactData = { email: "user@example.com", balance: "1000.50", rememberMe: true };
 * const apiPayload = reactToApi(reactData);
 * // Returns: { email: "user@example.com", balance: 1000.5, remember_me: true }
 */
export const reactToApi = (reactData) => {
  const transform = (obj, parentKey = '') => {
    if (Array.isArray(obj)) {
      return obj.map(item => transform(item, parentKey));
    }
    if (obj !== null && typeof obj === 'object') {
      return Object.keys(obj).reduce((acc, key) => {
        const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        const transformedValue = transform(obj[key], key);
        
        // Apply forced number conversion for financial fields
        let result = convertFinancialField(transformedValue, key);
        // Prevent undefined/NaN in output
        acc[snakeKey] = sanitizeForDisplay(result);
        
        return acc;
      }, {});
    }
    
    // For primitive values, check if parent key indicates financial field
    const result = convertFinancialField(obj, parentKey);
    return sanitizeForDisplay(result);
  };
  return transform(reactData);
};

/**
 * Transform React password change form to API payload
 * 
 * @description המרה מנתוני טופס שינוי סיסמה (React camelCase) לפורמט API (snake_case)
 * @legacyReference Legacy.auth.changePassword()
 * 
 * @param {Object} reactData - React form data (camelCase)
 * @param {string} reactData.currentPassword - הסיסמה הנוכחית
 * @param {string} reactData.newPassword - הסיסמה החדשה
 * @returns {Object} API payload (snake_case)
 * 
 * @example
 * const reactData = { currentPassword: "old123", newPassword: "new456" };
 * const apiPayload = reactToApiPasswordChange(reactData);
 * // Returns: { old_password: "old123", new_password: "new456" }
 */
export function reactToApiPasswordChange(reactData) {
  return {
    old_password: reactData.currentPassword,
    new_password: reactData.newPassword
  };
}

/**
 * Transform API password change response to React state
 * 
 * @description המרה מתגובת API של שינוי סיסמה לנתוני React
 * @legacyReference Legacy.auth.changePassword()
 * 
 * @param {Object} apiResponse - API response
 * @returns {Object} React state data
 * 
 * @example
 * const apiResponse = { message: "Password changed successfully" };
 * const reactData = apiToReactPasswordChange(apiResponse);
 * // Returns: { message: "Password changed successfully" }
 */
export function apiToReactPasswordChange(apiResponse) {
  // Usually just success message, but if needed:
  return {
    message: apiResponse.message || 'Password changed successfully'
  };
}
