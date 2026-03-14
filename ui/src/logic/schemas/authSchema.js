/**
 * Authentication Validation Schema
 *
 * @description Centralized validation rules for authentication forms
 * @module logic/schemas/authSchema
 * @legacyReference Legacy.auth.validate()
 */

import { validateEmail, validatePhoneNumber } from './userSchema.js';

/**
 * Validate username field
 *
 * @param {string} value - Username value
 * @returns {Object} - { isValid: boolean, error: string|null }
 */
export const validateUsername = (value) => {
  if (!value?.trim()) {
    return { isValid: false, error: 'שדה חובה' };
  }

  if (value.trim().length < 3) {
    return { isValid: false, error: 'שם משתמש חייב להכיל לפחות 3 תווים' };
  }

  if (value.trim().length > 50) {
    return { isValid: false, error: 'שם משתמש לא יכול להכיל יותר מ-50 תווים' };
  }

  return { isValid: true, error: null };
};

/**
 * Validate username or email field (for login)
 *
 * @param {string} value - Username or email value
 * @returns {Object} - { isValid: boolean, error: string|null }
 */
export const validateUsernameOrEmail = (value) => {
  if (!value?.trim()) {
    return { isValid: false, error: 'שדה חובה' };
  }

  return { isValid: true, error: null };
};

/**
 * Validate password field
 *
 * @param {string} value - Password value
 * @param {Object} options - Validation options
 * @param {number} options.minLength - Minimum password length (default: 8)
 * @returns {Object} - { isValid: boolean, error: string|null }
 */
export const validatePassword = (value, options = {}) => {
  const { minLength = 8 } = options;

  if (!value) {
    return { isValid: false, error: 'שדה חובה' };
  }

  if (value.length < minLength) {
    return {
      isValid: false,
      error: `סיסמה חייבת להכיל לפחות ${minLength} תווים`,
    };
  }

  return { isValid: true, error: null };
};

/**
 * Validate confirm password field
 *
 * @param {string} value - Confirm password value
 * @param {string} password - Original password value
 * @returns {Object} - { isValid: boolean, error: string|null }
 */
export const validateConfirmPassword = (value, password) => {
  if (!value) {
    return { isValid: false, error: 'שדה חובה' };
  }

  if (value !== password) {
    return { isValid: false, error: 'הסיסמאות אינן תואמות' };
  }

  return { isValid: true, error: null };
};

/**
 * Validate password change (new password must be different from current)
 *
 * @param {string} newPassword - New password value
 * @param {string} currentPassword - Current password value
 * @returns {Object} - { isValid: boolean, error: string|null }
 */
export const validatePasswordChange = (newPassword, currentPassword) => {
  if (!newPassword) {
    return { isValid: false, error: 'שדה חובה' };
  }

  if (newPassword.length < 8) {
    return { isValid: false, error: 'סיסמה חייבת להכיל לפחות 8 תווים' };
  }

  if (currentPassword && newPassword === currentPassword) {
    return {
      isValid: false,
      error: 'הסיסמה החדשה חייבת להיות שונה מהסיסמה הנוכחית',
    };
  }

  return { isValid: true, error: null };
};

/**
 * Validate verification code (SMS)
 *
 * @param {string} value - Verification code value
 * @param {number} length - Expected code length (default: 6)
 * @returns {Object} - { isValid: boolean, error: string|null }
 */
export const validateVerificationCode = (value, length = 6) => {
  if (!value) {
    return { isValid: false, error: 'שדה חובה' };
  }

  if (value.length !== length) {
    return { isValid: false, error: `קוד אימות חייב להכיל ${length} ספרות` };
  }

  if (!/^\d+$/.test(value)) {
    return { isValid: false, error: 'קוד אימות חייב להכיל ספרות בלבד' };
  }

  return { isValid: true, error: null };
};

/**
 * Validate reset token
 *
 * @param {string} value - Reset token value
 * @returns {Object} - { isValid: boolean, error: string|null }
 */
export const validateResetToken = (value) => {
  if (!value?.trim()) {
    return { isValid: false, error: 'שדה חובה' };
  }

  return { isValid: true, error: null };
};

/**
 * Validate identifier (email or phone) for password reset
 *
 * @param {string} value - Email or phone value
 * @returns {Object} - { isValid: boolean, error: string|null, method: string }
 */
export const validateIdentifier = (value) => {
  if (!value?.trim()) {
    return { isValid: false, error: 'שדה חובה', method: null };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\+[1-9]\d{1,14}$/;

  const cleanValue = value.trim();

  if (emailRegex.test(cleanValue)) {
    return { isValid: true, error: null, method: 'EMAIL' };
  } else if (phoneRegex.test(cleanValue)) {
    return { isValid: true, error: null, method: 'SMS' };
  } else {
    // Try to detect what it might be
    if (cleanValue.includes('@')) {
      return {
        isValid: false,
        error: 'כתובת אימייל לא תקינה',
        method: 'EMAIL',
      };
    } else {
      return {
        isValid: false,
        error: 'מספר טלפון לא תקין (פורמט E.164: +972501234567)',
        method: 'SMS',
      };
    }
  }
};

/**
 * Validate login form
 *
 * @param {Object} formData - Form data (camelCase)
 * @returns {Object} - { isValid: boolean, errors: Object }
 */
export const validateLoginForm = (formData) => {
  const errors = {};

  // Username or email validation
  const usernameOrEmailResult = validateUsernameOrEmail(
    formData.usernameOrEmail,
  );
  if (!usernameOrEmailResult.isValid) {
    errors.usernameOrEmail = usernameOrEmailResult.error;
  }

  // Password validation
  const passwordResult = validatePassword(formData.password, { minLength: 1 });
  if (!passwordResult.isValid) {
    errors.password = passwordResult.error;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate register form
 *
 * @param {Object} formData - Form data (camelCase)
 * @returns {Object} - { isValid: boolean, errors: Object }
 */
export const validateRegisterForm = (formData) => {
  const errors = {};

  // Username validation
  const usernameResult = validateUsername(formData.username);
  if (!usernameResult.isValid) {
    errors.username = usernameResult.error;
  }

  // Email validation (reuse from userSchema)
  const emailResult = validateEmail(formData.email);
  if (!emailResult.isValid) {
    errors.email = emailResult.error;
  }

  // Password validation
  const passwordResult = validatePassword(formData.password, { minLength: 8 });
  if (!passwordResult.isValid) {
    errors.password = passwordResult.error;
  }

  // Confirm password validation
  const confirmPasswordResult = validateConfirmPassword(
    formData.confirmPassword,
    formData.password,
  );
  if (!confirmPasswordResult.isValid) {
    errors.confirmPassword = confirmPasswordResult.error;
  }

  // Phone validation (optional) - reuse from userSchema
  if (formData.phoneNumber && formData.phoneNumber.trim()) {
    const phoneResult = validatePhoneNumber(formData.phoneNumber);
    if (!phoneResult.isValid) {
      errors.phoneNumber = phoneResult.error;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate password change form
 *
 * @param {Object} formData - Form data (camelCase)
 * @returns {Object} - { isValid: boolean, errors: Object }
 */
export const validatePasswordChangeForm = (formData) => {
  const errors = {};

  // Current password validation
  if (!formData.currentPassword) {
    errors.currentPassword = 'שדה חובה';
  }

  // New password validation
  const passwordChangeResult = validatePasswordChange(
    formData.newPassword,
    formData.currentPassword,
  );
  if (!passwordChangeResult.isValid) {
    errors.newPassword = passwordChangeResult.error;
  }

  // Confirm password validation
  const confirmPasswordResult = validateConfirmPassword(
    formData.confirmPassword,
    formData.newPassword,
  );
  if (!confirmPasswordResult.isValid) {
    errors.confirmPassword = confirmPasswordResult.error;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate password reset request form
 *
 * @param {Object} formData - Form data (camelCase)
 * @returns {Object} - { isValid: boolean, errors: Object, method: string }
 */
export const validatePasswordResetRequestForm = (formData) => {
  const identifierResult = validateIdentifier(formData.identifier);

  return {
    isValid: identifierResult.isValid,
    errors: identifierResult.isValid
      ? {}
      : { identifier: identifierResult.error },
    method: identifierResult.method,
  };
};

/**
 * Validate password reset verify form
 *
 * @param {Object} formData - Form data (camelCase)
 * @param {string} method - Reset method ('EMAIL' or 'SMS')
 * @returns {Object} - { isValid: boolean, errors: Object }
 */
export const validatePasswordResetVerifyForm = (formData, method) => {
  const errors = {};

  // Token or code validation
  if (method === 'EMAIL') {
    const tokenResult = validateResetToken(formData.resetToken);
    if (!tokenResult.isValid) {
      errors.resetToken = tokenResult.error;
    }
  } else if (method === 'SMS') {
    const codeResult = validateVerificationCode(formData.verificationCode, 6);
    if (!codeResult.isValid) {
      errors.verificationCode = codeResult.error;
    }
  }

  // New password validation
  const passwordResult = validatePassword(formData.newPassword, {
    minLength: 8,
  });
  if (!passwordResult.isValid) {
    errors.newPassword = passwordResult.error;
  }

  // Confirm password validation
  const confirmPasswordResult = validateConfirmPassword(
    formData.confirmPassword,
    formData.newPassword,
  );
  if (!confirmPasswordResult.isValid) {
    errors.confirmPassword = confirmPasswordResult.error;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
