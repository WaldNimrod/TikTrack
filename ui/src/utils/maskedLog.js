/**
 * Masked Log - Secure logging utility
 * ------------------------------------
 * Masks sensitive data (tokens, passwords) in logs to prevent security leaks
 * 
 * @description Prevents token leakage to console logs
 * @usage import { maskedLog } from '../utils/maskedLog.js';
 */

/**
 * Recursively mask sensitive fields in an object
 */
function maskSensitiveFields(obj, depth = 0) {
  // Prevent infinite recursion
  if (depth > 10) return obj;
  
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(item => maskSensitiveFields(item, depth + 1));
  }
  
  // Handle objects
  if (typeof obj === 'object') {
    const masked = {};
    for (const [key, value] of Object.entries(obj)) {
      const lowerKey = key.toLowerCase();
      
      // Mask sensitive keys
      if (lowerKey.includes('token') || 
          lowerKey.includes('password') || 
          lowerKey === 'authorization' ||
          lowerKey === 'auth') {
        masked[key] = '***MASKED***';
      } else if (typeof value === 'object' && value !== null) {
        // Recursively mask nested objects
        masked[key] = maskSensitiveFields(value, depth + 1);
      } else {
        masked[key] = value;
      }
    }
    return masked;
  }
  
  // Handle strings that might contain tokens
  if (typeof obj === 'string') {
    // Check if string looks like a token (JWT format: xxx.yyy.zzz)
    if (obj.match(/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/)) {
      return '***MASKED_TOKEN***';
    }
    // Check if string contains "Bearer" (likely an auth header)
    if (obj.includes('Bearer ') && obj.length > 20) {
      return 'Bearer ***MASKED***';
    }
  }
  
  return obj;
}

/**
 * Masked Log - Logs with sensitive data masked
 * 
 * @param {string} message - Log message
 * @param {object} data - Data to log (will be masked)
 * @returns {object} Masked data
 */
export function maskedLog(message, data = {}) {
  const maskedData = maskSensitiveFields(data);
  
  // Log with masked data
  if (Object.keys(maskedData).length > 0) {
    console.log(message, maskedData);
  } else {
    console.log(message);
  }
  
  return maskedData;
}

/**
 * Masked Log with Timestamp
 * 
 * @param {string} message - Log message
 * @param {object} data - Data to log (will be masked)
 * @returns {object} Masked data with timestamp
 */
export function maskedLogWithTimestamp(message, data = {}) {
  const timestamp = new Date().toISOString();
  const maskedData = maskSensitiveFields(data);
  
  // Log with timestamp and masked data
  if (Object.keys(maskedData).length > 0) {
    console.log(`[${timestamp}] ${message}`, maskedData);
  } else {
    console.log(`[${timestamp}] ${message}`);
  }
  
  return {
    timestamp,
    message,
    data: maskedData
  };
}
