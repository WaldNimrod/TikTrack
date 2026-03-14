/**
 * useAuthValidation - React Hook לולידציה משותפת של טופסי Auth
 * ----------------------------------------------------------------
 * Hook לניהול ולידציה של טופסי Auth עם תמיכה ב-Schema-based validation.
 *
 * @description Hook לניהול ולידציה של טופסי Auth עם תמיכה ב-field-level ו-form-level validation
 * @standard JS Standards Protocol ✅ | Audit Trail System ✅ | Debug Mode ✅
 * @legacyReference Legacy.auth.validate()
 *
 * @example
 * ```javascript
 * const { validateField, validateForm, fieldErrors, formErrors, clearErrors } = useAuthValidation({
 *   schema: loginSchema,
 *   formData: formData,
 * });
 * ```
 */

import { useState, useCallback, useMemo } from 'react';
import { audit } from '../../../../utils/audit.js';
import { DEBUG_MODE } from '../../../../utils/debug.js';

/**
 * useAuthValidation Hook
 *
 * @param {Object} options - Configuration options
 * @param {Object} options.schema - Validation schema object with field validators
 * @param {Object} options.formData - Current form data (camelCase)
 * @param {Object} [options.options] - Additional validation options
 * @returns {Object} - Validation API
 *
 * @property {Function} validateField - Validate single field
 * @property {Function} validateForm - Validate entire form
 * @property {Object} fieldErrors - Field-level errors object { fieldName: errorMessage }
 * @property {Object} formErrors - Form-level errors object
 * @property {Function} clearErrors - Clear all errors
 * @property {Function} clearFieldError - Clear specific field error
 */
export const useAuthValidation = ({ schema, formData, options = {} }) => {
  const [fieldErrors, setFieldErrors] = useState({});
  const [formErrors, setFormErrors] = useState({});

  /**
   * Validate Single Field
   *
   * @description בודק ולידציה של שדה בודד באמצעות Schema
   * @param {string} fieldName - שם השדה (camelCase)
   * @param {*} value - ערך השדה
   * @param {Object} [additionalData] - נתונים נוספים לולידציה (למשל password ל-confirmPassword)
   * @returns {Object} - { isValid: boolean, error: string|null }
   */
  const validateField = useCallback(
    (fieldName, value, additionalData = {}) => {
      if (!schema || !schema[fieldName]) {
        if (DEBUG_MODE) {
          audit.log('AuthValidation', 'Field validator not found', {
            fieldName,
            availableValidators: Object.keys(schema || {}),
          });
        }
        return { isValid: true, error: null };
      }

      try {
        const validator = schema[fieldName];
        let validationResult;

        // Handle different validator signatures
        if (typeof validator === 'function') {
          // Check if validator accepts additional data (like confirmPassword)
          if (validator.length > 1) {
            validationResult = validator(value, additionalData);
          } else {
            validationResult = validator(value);
          }
        } else {
          // If schema[fieldName] is not a function, return valid
          return { isValid: true, error: null };
        }

        // Update field error state
        if (validationResult && !validationResult.isValid) {
          setFieldErrors((prev) => ({
            ...prev,
            [fieldName]: validationResult.error,
          }));
        } else {
          // Clear field error if valid
          setFieldErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[fieldName];
            return newErrors;
          });
        }

        if (DEBUG_MODE) {
          audit.log('AuthValidation', 'Field validated', {
            fieldName,
            isValid: validationResult?.isValid ?? true,
            error: validationResult?.error ?? null,
          });
        }

        return validationResult || { isValid: true, error: null };
      } catch (error) {
        audit.error('AuthValidation', 'Field validation error', error);
        return { isValid: false, error: 'שגיאה בוולידציה' };
      }
    },
    [schema],
  );

  /**
   * Validate Entire Form
   *
   * @description בודק ולידציה של כל הטופס באמצעות Schema
   * @param {Object} [customFormData] - נתוני טופס מותאמים אישית (אם לא מועבר, משתמש ב-formData)
   * @returns {Object} - { isValid: boolean, errors: Object }
   */
  const validateForm = useCallback(
    (customFormData = null) => {
      const dataToValidate = customFormData || formData;
      const errors = {};
      let isValid = true;

      if (!schema) {
        audit.error(
          'AuthValidation',
          'Schema not provided for form validation',
        );
        return { isValid: false, errors: {} };
      }

      // Validate each field in schema
      Object.keys(schema).forEach((fieldName) => {
        const value = dataToValidate[fieldName];
        const validator = schema[fieldName];

        if (typeof validator === 'function') {
          let validationResult;

          // Handle special cases (like confirmPassword that needs password)
          if (fieldName === 'confirmPassword' && dataToValidate.password) {
            validationResult = validator(value, dataToValidate.password);
          } else if (
            fieldName === 'confirmNewPassword' &&
            dataToValidate.newPassword
          ) {
            validationResult = validator(value, dataToValidate.newPassword);
          } else {
            validationResult = validator(value);
          }

          if (validationResult && !validationResult.isValid) {
            errors[fieldName] = validationResult.error;
            isValid = false;
          }
        }
      });

      // Update field errors state
      setFieldErrors(errors);

      if (DEBUG_MODE) {
        audit.log('AuthValidation', 'Form validated', {
          isValid,
          errorCount: Object.keys(errors).length,
          errors,
        });
      }

      return { isValid, errors };
    },
    [schema, formData],
  );

  /**
   * Clear All Errors
   *
   * @description מנקה את כל השגיאות
   */
  const clearErrors = useCallback(() => {
    setFieldErrors({});
    setFormErrors({});
    if (DEBUG_MODE) {
      audit.log('AuthValidation', 'All errors cleared');
    }
  }, []);

  /**
   * Clear Field Error
   *
   * @description מנקה שגיאה של שדה ספציפי
   * @param {string} fieldName - שם השדה
   */
  const clearFieldError = useCallback((fieldName) => {
    setFieldErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
    if (DEBUG_MODE) {
      audit.log('AuthValidation', 'Field error cleared', { fieldName });
    }
  }, []);

  // Memoized validation state
  const validationState = useMemo(
    () => ({
      hasErrors:
        Object.keys(fieldErrors).length > 0 ||
        Object.keys(formErrors).length > 0,
      fieldErrorCount: Object.keys(fieldErrors).length,
      formErrorCount: Object.keys(formErrors).length,
    }),
    [fieldErrors, formErrors],
  );

  return {
    // Validation functions
    validateField,
    validateForm,

    // Error state
    fieldErrors,
    formErrors,

    // Error management
    clearErrors,
    clearFieldError,

    // Validation state
    ...validationState,
  };
};

export default useAuthValidation;
