/**
 * User Validation Schema
 * 
 * @description Centralized validation rules for user forms
 * @module logic/schemas/userSchema
 * @legacyReference Legacy.user.validate()
 */

/**
 * Validate email field
 * 
 * @param {string} value - Email value
 * @returns {Object} - { isValid: boolean, error: string|null }
 */
export const validateEmail = (value) => {
  if (!value?.trim()) {
    return { isValid: false, error: 'שדה חובה' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    return { isValid: false, error: 'אימייל לא תקין' };
  }
  
  return { isValid: true, error: null };
};

/**
 * Normalize phone number to E.164 format (without + prefix)
 * 
 * @param {string} value - Phone number value
 * @returns {string|null} - Normalized phone number or null if cannot be normalized
 */
export const normalizePhoneNumber = (value) => {
  if (!value) {
    return null;
  }
  
  // Remove all spaces, dashes, parentheses, and other formatting
  let clean = value.replace(/[\s\-()]/g, '');
  
  // Remove + if present at the beginning
  clean = clean.replace(/^\+/, '');
  
  // Remove leading zeros if present
  clean = clean.replace(/^0+/, '');
  
  // Common Israeli phone number patterns
  // 05x-xxxxxxx -> 9725xxxxxxxx
  if (/^05\d{8}$/.test(clean)) {
    return `972${clean.substring(1)}`;
  }
  
  // 0x-xxxxxxx -> 972x-xxxxxxx (for landlines)
  if (/^0\d{8,9}$/.test(clean)) {
    return `972${clean.substring(1)}`;
  }
  
  // Already in E.164 format without +
  if (/^[1-9]\d{1,14}$/.test(clean)) {
    // If starts with 972, it's Israeli number
    if (/^972\d{8,9}$/.test(clean)) {
      return clean;
    }
    // Otherwise, assume it's already correct
    return clean;
  }
  
  // If starts with country code 972
  if (/^972\d{8,9}$/.test(clean)) {
    return clean;
  }
  
  return null;
};

/**
 * Validate phone number field
 * 
 * @param {string} value - Phone number value
 * @returns {Object} - { isValid: boolean, error: string|null, normalized: string|null }
 */
export const validatePhoneNumber = (value) => {
  if (!value) {
    return { isValid: true, error: null, normalized: null }; // Optional field
  }
  
  // Try to normalize first
  const normalized = normalizePhoneNumber(value);
  
  if (normalized) {
    // Validate E.164 format (without +): country code (1-3 digits) + number (up to 15 digits total)
    const phoneRegex = /^[1-9]\d{1,14}$/;
    if (phoneRegex.test(normalized)) {
      return { isValid: true, error: null, normalized };
    }
  }
  
  return { 
    isValid: false, 
    error: 'מספר טלפון חייב להיות בפורמט E.164 (דוגמה: 972501234567)',
    normalized: null
  };
};

/**
 * Validate first name field
 * 
 * @param {string} value - First name value
 * @returns {Object} - { isValid: boolean, error: string|null }
 */
export const validateFirstName = (value) => {
  if (value && value.length > 100) {
    return { isValid: false, error: 'שם פרטי לא יכול להיות יותר מ-100 תווים' };
  }
  
  return { isValid: true, error: null };
};

/**
 * Validate last name field
 * 
 * @param {string} value - Last name value
 * @returns {Object} - { isValid: boolean, error: string|null }
 */
export const validateLastName = (value) => {
  if (value && value.length > 100) {
    return { isValid: false, error: 'שם משפחה לא יכול להיות יותר מ-100 תווים' };
  }
  
  return { isValid: true, error: null };
};

/**
 * Validate display name field
 * 
 * @param {string} value - Display name value
 * @returns {Object} - { isValid: boolean, error: string|null }
 */
export const validateDisplayName = (value) => {
  if (value && value.length > 100) {
    return { isValid: false, error: 'שם תצוגה לא יכול להיות יותר מ-100 תווים' };
  }
  
  return { isValid: true, error: null };
};

/**
 * Validate timezone field
 * 
 * @param {string} value - Timezone value
 * @returns {Object} - { isValid: boolean, error: string|null }
 */
export const validateTimezone = (value) => {
  if (!value) {
    return { isValid: false, error: 'שדה חובה' };
  }
  
  const timezoneRegex = /^[A-Za-z_]+\/[A-Za-z_]+$/;
  if (!timezoneRegex.test(value)) {
    return { isValid: false, error: 'אזור זמן לא תקין' };
  }
  
  return { isValid: true, error: null };
};

/**
 * Validate language field
 * 
 * @param {string} value - Language value
 * @returns {Object} - { isValid: boolean, error: string|null }
 */
export const validateLanguage = (value) => {
  if (!value) {
    return { isValid: false, error: 'שדה חובה' };
  }
  
  const validLanguages = ['he', 'en', 'ar', 'ru'];
  if (!validLanguages.includes(value)) {
    return { isValid: false, error: 'שפה לא תקינה' };
  }
  
  return { isValid: true, error: null };
};

/**
 * Validate entire user form
 * 
 * @param {Object} formData - Form data (camelCase)
 * @returns {Object} - { isValid: boolean, errors: Object, normalizedData: Object }
 */
export const validateUserForm = (formData) => {
  const errors = {};
  const normalizedData = { ...formData };
  
  // Email validation
  const emailResult = validateEmail(formData.email);
  if (!emailResult.isValid) {
    errors.email = emailResult.error;
  }
  
  // Phone validation - try to normalize first
  const phoneResult = validatePhoneNumber(formData.phoneNumber);
  if (!phoneResult.isValid) {
    errors.phoneNumber = phoneResult.error;
  } else if (phoneResult.normalized) {
    // Use normalized value if available
    normalizedData.phoneNumber = phoneResult.normalized;
  }
  
  // First name validation
  const firstNameResult = validateFirstName(formData.firstName);
  if (!firstNameResult.isValid) {
    errors.firstName = firstNameResult.error;
  }
  
  // Last name validation
  const lastNameResult = validateLastName(formData.lastName);
  if (!lastNameResult.isValid) {
    errors.lastName = lastNameResult.error;
  }
  
  // Display name validation
  const displayNameResult = validateDisplayName(formData.displayName);
  if (!displayNameResult.isValid) {
    errors.displayName = displayNameResult.error;
  }
  
  // Timezone validation
  const timezoneResult = validateTimezone(formData.timezone);
  if (!timezoneResult.isValid) {
    errors.timezone = timezoneResult.error;
  }
  
  // Language validation
  const languageResult = validateLanguage(formData.language);
  if (!languageResult.isValid) {
    errors.language = languageResult.error;
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    normalizedData
  };
};
