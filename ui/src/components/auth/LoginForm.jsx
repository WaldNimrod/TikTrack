/**
 * LoginForm - רכיב התחברות (D15)
 * --------------------------------
 * רכיב React להתחברות משתמשים
 * 
 * @description מימוש Pixel Perfect של דף ההתחברות בהתבסס על Blueprint של Team 31
 * @legacyReference Legacy.auth.login()
 * @blueprintSource _COMMUNICATION/team_31/team_31_staging/D15_LOGIN.html
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../../services/auth.js';
import { audit } from '../../utils/audit.js';
import { debugLog } from '../../utils/debug.js';
import { validateLoginForm, validateUsernameOrEmail, validatePassword } from '../../logic/schemas/authSchema.js';
import { handleApiError } from '../../utils/errorHandler.js';

/**
 * LoginForm Component
 * 
 * @description רכיב התחברות עם validation, error handling, ו-loading states
 * @legacyReference Legacy.auth.login(username, password)
 */
const LoginForm = () => {
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    usernameOrEmail: '',
    password: '',
    rememberMe: true,
  });
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  /**
   * Handle Input Change
   * 
   * @description מעדכן את state של הטופס ומבצע ולידציה באמצעות Schema
   * @param {Event} e - Event object
   */
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Validate field using Schema
    if (type !== 'checkbox') {
      let validationResult = null;
      switch (name) {
        case 'usernameOrEmail':
          validationResult = validateUsernameOrEmail(value);
          break;
        case 'password':
          validationResult = validatePassword(value, { minLength: 1 });
          break;
        default:
          break;
      }
      
      // Update field error
      if (validationResult) {
        setFieldErrors(prev => ({
          ...prev,
          [name]: validationResult.error
        }));
      }
    }
    
    // Don't clear general error immediately - let user see it
    // Error will be cleared on next form submission attempt
  };

  /**
   * Validate Form
   * 
   * @description בודק תקינות הטופס לפני שליחה באמצעות Schema מרכזי
   * @returns {boolean} - true אם הטופס תקין
   */
  const validateForm = () => {
    const { isValid, errors } = validateLoginForm(formData);
    setFieldErrors(errors);
    return isValid;
  };

  /**
   * Handle Form Submit
   * 
   * @description מטפל בשליחת הטופס והתחברות
   * @param {Event} e - Event object
   */
  const handleSubmit = async (e) => {
    // CRITICAL: Always prevent default form submission
    e.preventDefault();
    e.stopPropagation();
    
    // Prevent multiple submissions
    if (isLoading) {
      return;
    }
    
    // Clear previous errors only at start of new submission
    setError(null);
    setFieldErrors({});
    
    // Validate form
    if (!validateForm()) {
      audit.log('Auth', 'Login form validation failed', { fieldErrors });
      return;
    }
    
    setIsLoading(true);
    audit.log('Auth', 'Login form submitted', { 
      usernameOrEmail: formData.usernameOrEmail,
      rememberMe: formData.rememberMe 
    });
    
    try {
      // Call Auth Service
      const response = await authService.login(
        formData.usernameOrEmail,
        formData.password
      );
      
      debugLog('Auth', 'Login successful', { userId: response.user?.externalUlids });
      
      // Store remember me preference (if needed)
      if (formData.rememberMe) {
        localStorage.setItem('remember_me', 'true');
      }
      
      // Redirect to dashboard (only on success, not on error)
      audit.log('Auth', 'Redirecting to dashboard');
      navigate('/dashboard');
      
    } catch (err) {
      // CRITICAL: Prevent any navigation or refresh on error
      // Use centralized error handler
      const { fieldErrors: apiErrors, formError: apiError } = handleApiError(err);
      
      // Merge API field errors with existing errors
      if (Object.keys(apiErrors).length > 0) {
        setFieldErrors(prev => ({ ...prev, ...apiErrors }));
      }
      
      // Set form-level error
      if (apiError) {
        setError(apiError);
      } else {
        setError('שגיאה בהתחברות. אנא בדוק את פרטיך.');
      }
      
      audit.error('Auth', 'Login failed', err);
      
      // Ensure error is visible in DOM and scroll to it
      // Use setTimeout to ensure DOM update happens after state update
      setTimeout(() => {
        const errorElement = document.querySelector('.js-error-feedback');
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 100);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-layout-root" dir="rtl">
      <tt-container>
        <tt-section>
          <div className="auth-header">
            <div className="auth-logo">
              <img src="/images/logo.svg" alt="TikTrack Logo" />
            </div>
            <p className="auth-subtitle">ברוכים הבאים ל-TikTrack</p>
            <h1 className="auth-title">התחברות</h1>
          </div>

          <form 
            className="js-login-form" 
            onSubmit={handleSubmit} 
            noValidate
            action="#"
            method="post"
          >
            {/* Error Feedback (hidden by default, shown on error) */}
            {error && (
              <div className="auth-form__error js-error-feedback" role="alert" aria-live="polite">
                {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="usernameOrEmail">
                שם משתמש / אימייל:
              </label>
              <input
                type="text"
                id="usernameOrEmail"
                name="usernameOrEmail"
                className={`form-control js-login-username-input ${fieldErrors.usernameOrEmail ? 'auth-form__input--error' : ''}`}
                required
                placeholder="הכנס שם משתמש"
                value={formData.usernameOrEmail}
                onChange={handleInputChange}
                disabled={isLoading}
              />
              {fieldErrors.usernameOrEmail && (
                <span className="auth-form__error-message">{fieldErrors.usernameOrEmail}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">
                סיסמה:
              </label>
              <input
                type="password"
                id="password"
                name="password"
                className={`form-control js-login-password-input ${fieldErrors.password ? 'auth-form__input--error' : ''}`}
                required
                placeholder="הכנס סיסמה"
                value={formData.password}
                onChange={handleInputChange}
                disabled={isLoading}
              />
              {fieldErrors.password && (
                <span className="auth-form__error-message">{fieldErrors.password}</span>
              )}
            </div>

            <div className="form-options">
              <label className="remember-me">
                <input
                  type="checkbox"
                  name="rememberMe"
                  className="lod-checkbox js-login-remember-checkbox"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
                {' '}זכור אותי
              </label>
              <Link to="/reset-password" className="auth-link js-forgot-password-link">
                שכחת סיסמה?
              </Link>
            </div>

            <button
              type="submit"
              className="btn-auth-primary js-login-submit-button"
              disabled={isLoading}
            >
              {isLoading ? 'מתחבר...' : 'התחבר'}
            </button>
          </form>

          <div className="auth-footer-zone">
            <span>אין לך חשבון?</span>{' '}
            <Link to="/register" className="auth-link-bold js-register-link">
              הרשמה עכשיו
            </Link>
          </div>
        </tt-section>
      </tt-container>
    </div>
  );
};

export default LoginForm;
