/**
 * AuthForm - Component משותף לטופסי Auth
 * --------------------------------------
 * Component משותף עבור Identity & Authentication Cube שישמש את כל עמודי Auth (Login, Register, Reset Password).
 * 
 * @description Component משותף לטופסי Auth עם תמיכה ב-3 סוגי טפסים: Login, Register, Reset Password
 * @standard JS Standards Protocol ✅ | LEGO System ✅ | Accessibility ✅ | Audit Trail ✅ | CSS Standards ✅
 * @legacyReference Legacy.auth.form()
 * 
 * @example
 * ```javascript
 * // Login Form
 * <AuthForm 
 *   formType="login"
 *   onSubmit={handleLogin}
 *   isLoading={isLoading}
 *   error={error}
 * />
 * 
 * // Register Form
 * <AuthForm 
 *   formType="register"
 *   onSubmit={handleRegister}
 *   isLoading={isLoading}
 *   error={error}
 * />
 * 
 * // Reset Password Form
 * <AuthForm 
 *   formType="reset-password"
 *   onSubmit={handleResetPassword}
 *   isLoading={isLoading}
 *   error={error}
 * />
 * ```
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { debugLog } from '../../../utils/debug.js';
import useAuthValidation from '../hooks/useAuthValidation.js';
import AuthErrorHandler, { FieldError } from './AuthErrorHandler.jsx';
import AuthLayout from './AuthLayout.jsx';
import {
  validateUsernameOrEmail,
  validatePassword,
  validateUsername,
  validateConfirmPassword,
  validateIdentifier
} from '../../../logic/schemas/authSchema.js';
import { validateEmail, validatePhoneNumber } from '../../../logic/schemas/userSchema.js';

/**
 * AuthForm Component
 * 
 * @param {Object} props - Component props
 * @param {string} props.formType - Form type: 'login' | 'register' | 'reset-password'
 * @param {Function} props.onSubmit - Callback function called on form submit with form data (camelCase)
 * @param {Object} [props.initialValues] - Initial form values (optional, for Reset Password)
 * @param {boolean} [props.isLoading] - Loading state (default: false)
 * @param {string|null} [props.error] - General error message (Hebrew)
 * @param {string} [props.title] - Custom page title (optional, uses defaults if not provided)
 * @param {string} [props.subtitle] - Custom page subtitle (optional, uses defaults if not provided)
 * @param {Array} [props.footerLinks] - Footer links array (optional, uses defaults if not provided)
 * @param {string} [props.footerText] - Footer text (optional, uses defaults if not provided)
 * @returns {React.ReactElement} - Auth form component
 */
const AuthForm = ({
  formType,
  onSubmit,
  initialValues = {},
  isLoading = false,
  error = null,
  title = null,
  subtitle = null,
  footerLinks = null,
  footerText = null
}) => {
  // Form state based on form type
  const getInitialFormData = () => {
    switch (formType) {
      case 'login':
        return {
          usernameOrEmail: initialValues.usernameOrEmail || '',
          password: initialValues.password || '',
          rememberMe: initialValues.rememberMe !== undefined ? initialValues.rememberMe : true
        };
      case 'register':
        return {
          username: initialValues.username || '',
          email: initialValues.email || '',
          password: initialValues.password || '',
          confirmPassword: initialValues.confirmPassword || '',
          phoneNumber: initialValues.phoneNumber || ''
        };
      case 'reset-password':
        return {
          identifier: initialValues.identifier || ''
        };
      default:
        return {};
    }
  };

  const [formData, setFormData] = useState(getInitialFormData);

  // Create validation schema based on form type
  const validationSchema = useMemo(() => {
    switch (formType) {
      case 'login':
        return {
          usernameOrEmail: (value) => validateUsernameOrEmail(value),
          password: (value) => validatePassword(value, { minLength: 1 })
        };
      case 'register':
        return {
          username: (value) => validateUsername(value),
          email: (value) => validateEmail(value),
          password: (value) => validatePassword(value, { minLength: 8 }),
          confirmPassword: (value, additionalData) => validateConfirmPassword(value, additionalData.password),
          phoneNumber: (value) => {
            if (!value || !value.trim()) {
              return { isValid: true, error: null }; // Optional field
            }
            return validatePhoneNumber(value);
          }
        };
      case 'reset-password':
        return {
          identifier: (value) => validateIdentifier(value)
        };
      default:
        return {};
    }
  }, [formType]);

  // Use validation hook
  const {
    validateField,
    validateForm: validateFormSchema,
    fieldErrors,
    clearErrors,
    clearFieldError
  } = useAuthValidation({
    schema: validationSchema,
    formData
  });

  // Add auth-layout-root class to body on mount
  useEffect(() => {
    document.body.classList.add('auth-layout-root');
    return () => {
      document.body.classList.remove('auth-layout-root');
    };
  }, []);

  /**
   * Handle Input Change
   * 
   * @description מעדכן את state של הטופס ומבצע ולידציה באמצעות Schema
   * @param {Event} e - Event object
   */
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Calculate new form data
    const newFormData = {
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    };
    
    // Update form data
    setFormData(newFormData);

    // Validate field (skip checkbox)
    if (type !== 'checkbox') {
      // For confirmPassword, pass password as additional data (use new value)
      if (name === 'confirmPassword') {
        const additionalData = { password: newFormData.password };
        validateField(name, value, additionalData);
      } else {
        validateField(name, value);
        
        // If password changed and confirmPassword has value, re-validate confirmPassword
        if (name === 'password' && formType === 'register' && newFormData.confirmPassword) {
          const additionalData = { password: value };
          validateField('confirmPassword', newFormData.confirmPassword, additionalData);
        }
      }
    }

    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      clearFieldError(name);
    }

    debugLog('AuthForm', 'Field changed', { field: name, formType });
  };

  /**
   * Handle Form Submit
   * 
   * @description מטפל בשליחת הטופס
   * @param {Event} e - Event object
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Prevent multiple submissions
    if (isLoading) {
      return;
    }

    // Clear previous errors
    clearErrors();

    debugLog('AuthForm', 'Form submission started', { formType });

    // Validate form
    const validationResult = validateFormSchema();
    if (!validationResult.isValid) {
      debugLog('AuthForm', 'Form validation failed', {
        formType,
        errors: validationResult.errors
      });
      return;
    }

    // Call onSubmit callback with form data
    if (onSubmit) {
      await onSubmit(formData);
    }
  };

  /**
   * Get Form Configuration
   * 
   * @description מחזיר את תצורת הטופס לפי סוג הטופס
   */
  const getFormConfig = () => {
    switch (formType) {
      case 'login':
        return {
          title: title || 'התחברות',
          subtitle: subtitle || 'ברוכים הבאים ל-TikTrack',
          footerText: footerText || 'אין לך חשבון?',
          footerLinks: footerLinks || [
            { to: '/register', text: 'הרשמה עכשיו', className: 'auth-link-bold' }
          ],
          submitText: isLoading ? 'מתחבר...' : 'התחבר'
        };
      case 'register':
        return {
          title: title || 'הרשמה',
          subtitle: subtitle || 'הצטרפו לקהילת הסוחרים',
          footerText: footerText || null,
          footerLinks: footerLinks || [
            { to: '/login', text: 'כבר יש לך חשבון? התחבר' }
          ],
          submitText: isLoading ? 'יוצר חשבון...' : 'צור חשבון'
        };
      case 'reset-password':
        return {
          title: title || 'שחזור סיסמה',
          subtitle: subtitle || 'הזן אימייל או טלפון לקבלת קישור איפוס',
          footerText: footerText || null,
          footerLinks: footerLinks || [
            { to: '/login', text: 'חזרה להתחברות' }
          ],
          submitText: isLoading ? 'שולח...' : 'שלח קישור איפוס'
        };
      default:
        return {
          title: '',
          subtitle: '',
          footerText: null,
          footerLinks: [],
          submitText: 'שלח'
        };
    }
  };

  const formConfig = getFormConfig();

  /**
   * Render Login Form Fields
   */
  const renderLoginFields = () => (
    <>
      <div className="form-group">
        <label className="form-label" htmlFor="usernameOrEmail">
          שם משתמש / אימייל:
        </label>
        <input
          type="text"
          id="usernameOrEmail"
          name="usernameOrEmail"
          className={`form-control ${fieldErrors.usernameOrEmail ? 'auth-form__input--error' : ''}`}
          required
          placeholder="הכנס שם משתמש"
          value={formData.usernameOrEmail}
          onChange={handleInputChange}
          disabled={isLoading}
        />
        <FieldError fieldName="usernameOrEmail" fieldErrors={fieldErrors} />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="password">
          סיסמה:
        </label>
        <input
          type="password"
          id="password"
          name="password"
          className={`form-control ${fieldErrors.password ? 'auth-form__input--error' : ''}`}
          required
          placeholder="הכנס סיסמה"
          value={formData.password}
          onChange={handleInputChange}
          disabled={isLoading}
        />
        <FieldError fieldName="password" fieldErrors={fieldErrors} />
      </div>

      <div className="form-options">
        <label className="remember-me">
          <input
            type="checkbox"
            name="rememberMe"
            checked={formData.rememberMe}
            onChange={handleInputChange}
            disabled={isLoading}
          />
          {' '}זכור אותי
        </label>
        <Link to="/reset-password" className="auth-link">
          שכחת סיסמה?
        </Link>
      </div>
    </>
  );

  /**
   * Render Register Form Fields
   */
  const renderRegisterFields = () => (
    <>
      <div className="form-group">
        <label className="form-label" htmlFor="username">
          שם משתמש:
        </label>
        <input
          type="text"
          id="username"
          name="username"
          className={`form-control ${fieldErrors.username ? 'auth-form__input--error' : ''}`}
          required
          placeholder="בחר שם משתמש"
          value={formData.username}
          onChange={handleInputChange}
          disabled={isLoading}
        />
        <FieldError fieldName="username" fieldErrors={fieldErrors} />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="email">
          אימייל:
        </label>
        <input
          type="email"
          id="email"
          name="email"
          className={`form-control ${fieldErrors.email ? 'auth-form__input--error' : ''}`}
          required
          placeholder="your@email.com"
          value={formData.email}
          onChange={handleInputChange}
          disabled={isLoading}
        />
        <FieldError fieldName="email" fieldErrors={fieldErrors} />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="password">
          סיסמה:
        </label>
        <input
          type="password"
          id="password"
          name="password"
          className={`form-control ${fieldErrors.password ? 'auth-form__input--error' : ''}`}
          required
          placeholder="הכנס סיסמה"
          value={formData.password}
          onChange={handleInputChange}
          disabled={isLoading}
        />
        <FieldError fieldName="password" fieldErrors={fieldErrors} />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="confirmPassword">
          אימות סיסמה:
        </label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          className={`form-control ${fieldErrors.confirmPassword ? 'auth-form__input--error' : ''}`}
          required
          placeholder="הכנס סיסמה שוב"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          disabled={isLoading}
        />
        <FieldError fieldName="confirmPassword" fieldErrors={fieldErrors} />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="phoneNumber">
          טלפון (אופציונלי):
        </label>
        <input
          type="tel"
          id="phoneNumber"
          name="phoneNumber"
          className={`form-control ${fieldErrors.phoneNumber ? 'auth-form__input--error' : ''}`}
          placeholder="+972-5x-xxxxxxx"
          value={formData.phoneNumber}
          onChange={handleInputChange}
          disabled={isLoading}
        />
        <FieldError fieldName="phoneNumber" fieldErrors={fieldErrors} />
      </div>
    </>
  );

  /**
   * Render Reset Password Form Fields
   */
  const renderResetPasswordFields = () => (
    <>
      <div className="form-group">
        <label className="form-label" htmlFor="identifier">
          אימייל או טלפון:
        </label>
        <input
          type="text"
          id="identifier"
          name="identifier"
          className={`form-control ${fieldErrors.identifier ? 'auth-form__input--error' : ''}`}
          required
          placeholder="your@email.com או +972-5x-xxxxxxx"
          value={formData.identifier}
          onChange={handleInputChange}
          disabled={isLoading}
        />
        <FieldError fieldName="identifier" fieldErrors={fieldErrors} />
      </div>
    </>
  );

  /**
   * Render Form Fields Based on Form Type
   */
  const renderFormFields = () => {
    switch (formType) {
      case 'login':
        return renderLoginFields();
      case 'register':
        return renderRegisterFields();
      case 'reset-password':
        return renderResetPasswordFields();
      default:
        return null;
    }
  };

  return (
    <AuthLayout
      title={formConfig.title}
      subtitle={formConfig.subtitle}
      links={formConfig.footerLinks}
      footerText={formConfig.footerText}
    >
      <form onSubmit={handleSubmit} noValidate>
        {/* Error Handler */}
        <AuthErrorHandler
          error={error}
          fieldErrors={fieldErrors}
          showFieldErrors={false}
        />

        {/* Form Fields */}
        {renderFormFields()}

        {/* Submit Button */}
        <button
          type="submit"
          className="btn-auth-primary"
          disabled={isLoading}
        >
          {formConfig.submitText}
        </button>
      </form>
    </AuthLayout>
  );
};

export default AuthForm;
