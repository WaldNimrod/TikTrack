/**
 * Transformation Layer - Data Normalization
 * ------------------------------------------
 * הפרדה בין ה-Backend (snake_case) לבין ה-Frontend (camelCase).
 * 
 * @description כל תקשורת API חייבת לעבור דרך פונקציות אלו כדי לשמור על ניקיון ה-State
 * @legacyReference Legacy.data.transformations
 */

/**
 * Transforms API response (snake_case) to React state (camelCase)
 * 
 * @description המרה מנתוני API לנתוני State של React
 * @legacyReference D15_USER_OBJECT, Legacy.data.apiToReact
 * 
 * @param {Object|Array} apiData - API response with snake_case keys
 * @returns {Object|Array} - React state object with camelCase keys
 * 
 * @example
 * const apiData = { user_id: "123", is_email_verified: true };
 * const reactData = apiToReact(apiData);
 * // Returns: { userId: "123", isEmailVerified: true }
 */
export const apiToReact = (apiData) => {
  const transform = (obj) => {
    if (Array.isArray(obj)) {
      return obj.map(transform);
    }
    if (obj !== null && typeof obj === 'object') {
      return Object.keys(obj).reduce((acc, key) => {
        const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
        acc[camelKey] = transform(obj[key]);
        return acc;
      }, {});
    }
    return obj;
  };
  return transform(apiData);
};

/**
 * Transforms React state (camelCase) to API request (snake_case)
 * 
 * @description המרה מנתוני UI לפורמט Payload עבור ה-API
 * @legacyReference Legacy.data.reactToApi
 * 
 * @param {Object|Array} reactData - React state with camelCase keys
 * @returns {Object|Array} - API request object with snake_case keys
 * 
 * @example
 * const reactData = { email: "user@example.com", rememberMe: true };
 * const apiPayload = reactToApi(reactData);
 * // Returns: { email: "user@example.com", remember_me: true }
 */
export const reactToApi = (reactData) => {
  const transform = (obj) => {
    if (Array.isArray(obj)) {
      return obj.map(transform);
    }
    if (obj !== null && typeof obj === 'object') {
      return Object.keys(obj).reduce((acc, key) => {
        const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        acc[snakeKey] = transform(obj[key]);
        return acc;
      }, {});
    }
    return obj;
  };
  return transform(reactData);
};
