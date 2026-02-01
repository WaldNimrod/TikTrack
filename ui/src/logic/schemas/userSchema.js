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
 * Validate phone number field
 * 
 * @param {string} value - Phone number value
 * @returns {Object} - { isValid: boolean, error: string|null }
 */
export const validatePhoneNumber = (value) => {
  if (!value) {
    return { isValid: true, error: null }; // Optional field
  }
  
  const clean = value.replace(/[\s-()]/g, '');
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  
  if (!phoneRegex.test(clean)) {
    return { isValid: false, error: 'מספר טלפון חייב להיות בפורמט E.164 (דוגמה: +972501234567)' };
  }
  
  return { isValid: true, error: null };
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
 * @returns {Object} - { isValid: boolean, errors: Object }
 */
export const validateUserForm = (formData) => {
  const errors = {};
  
  // Email validation
  const emailResult = validateEmail(formData.email);
  if (!emailResult.isValid) {
    errors.email = emailResult.error;
  }
  
  // Phone validation
  const phoneResult = validatePhoneNumber(formData.phoneNumber);
  if (!phoneResult.isValid) {
    errors.phoneNumber = phoneResult.error;
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
    errors
  };
};
