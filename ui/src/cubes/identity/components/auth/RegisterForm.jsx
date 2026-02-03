/**
 * RegisterForm - רכיב הרשמה (D15)
 * --------------------------------
 * רכיב React להרשמת משתמשים חדשים
 * 
 * @description מימוש Pixel Perfect של דף ההרשמה בהתבסס על Blueprint של Team 31
 * @legacyReference Legacy.auth.register()
 * @blueprintSource _COMMUNICATION/team_31/team_31_staging/D15_REGISTER.html
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../../services/auth.js';
import { audit } from '../../../../utils/audit.js';
import { debugLog } from '../../../../utils/debug.js';
import { validateRegisterForm, validateUsername, validatePassword, validateConfirmPassword } from '../../../../logic/schemas/authSchema.js';
import { validateEmail, validatePhoneNumber } from '../../../../logic/schemas/userSchema.js';
import { handleApiError } from '../../../../utils/errorHandler.js';
import PageFooter from '../../../../components/core/PageFooter.jsx';

/**
 * RegisterForm Component
 * 
 * @description רכיב הרשמה עם validation, error handling, ו-loading states
 * @legacyReference Legacy.auth.register(userData)
 */
const RegisterForm = () => {
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
  });
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  // Add auth-layout-root class to body on mount (matches blueprint)
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
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Validate field using Schema
    let validationResult = null;
    switch (name) {
      case 'username':
        validationResult = validateUsername(value);
        break;
      case 'email':
        validationResult = validateEmail(value);
        break;
      case 'password':
        validationResult = validatePassword(value, { minLength: 8 });
        break;
      case 'confirmPassword':
        validationResult = validateConfirmPassword(value, formData.password);
        break;
      case 'phoneNumber':
        if (value && value.trim()) {
          validationResult = validatePhoneNumber(value);
        }
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
    
    // Clear general error
    if (error) {
      setError(null);
    }
  };

  /**
   * Validate Form
   * 
   * @description בודק תקינות הטופס לפני שליחה באמצעות Schema מרכזי
   * @returns {boolean} - true אם הטופס תקין
   */
  const validateForm = () => {
    const { isValid, errors } = validateRegisterForm(formData);
    setFieldErrors(errors);
    return isValid;
  };

  /**
   * Handle Form Submit
   * 
   * @description מטפל בשליחת הטופס והרשמה
   * @param {Event} e - Event object
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setError(null);
    setFieldErrors({});
    
    // Validate form
    if (!validateForm()) {
      debugLog('Auth', 'Register form validation failed', { fieldErrors });
      return;
    }
    
    setIsLoading(true);
    debugLog('Auth', 'Register form submitted', { 
      email: formData.email,
      username: formData.username 
    });
    
    try {
      // Prepare user data (camelCase for React)
      const userData = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        ...(formData.phoneNumber?.trim() && {
          phoneNumber: formData.phoneNumber.trim()
        }),
      };
      
      // Call Auth Service
      const response = await authService.register(userData);
      
      debugLog('Auth', 'Register successful', { userId: response.user?.externalUlids });
      
      // Redirect to dashboard or login
      debugLog('Auth', 'Redirecting after registration');
      navigate('/dashboard');
      
    } catch (err) {
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
        setError('שגיאה בהרשמה. אנא נסה שוב.');
      }
      
      audit.error('Auth', 'Register failed', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-container">
        <main>
          <tt-container>
            <tt-section>
              <div className="auth-header">
                <div className="auth-logo">
                  <img src="/images/logo.svg" alt="TikTrack Logo" />
                </div>
                <p className="auth-subtitle">הצטרפו לקהילת הסוחרים</p>
                <h1 className="auth-title">הרשמה</h1>
              </div>

              <form 
                className="js-register-form" 
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
                  <label className="form-label" htmlFor="username">
                    שם משתמש:
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    className={`form-control js-register-username-input ${fieldErrors.username ? 'auth-form__input--error' : ''}`}
                    required
                    placeholder="בחר שם משתמש"
                    value={formData.username}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                  {fieldErrors.username && (
                    <span className="auth-form__error-message">{fieldErrors.username}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="email">
                    אימייל:
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className={`form-control js-register-email-input ${fieldErrors.email ? 'auth-form__input--error' : ''}`}
                    required
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                  {fieldErrors.email && (
                    <span className="auth-form__error-message">{fieldErrors.email}</span>
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
                    className={`form-control js-register-password-input ${fieldErrors.password ? 'auth-form__input--error' : ''}`}
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

                <div className="form-group">
                  <label className="form-label" htmlFor="confirmPassword">
                    אימות סיסמה:
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    className={`form-control js-register-confirm-password-input ${fieldErrors.confirmPassword ? 'auth-form__input--error' : ''}`}
                    required
                    placeholder="הכנס סיסמה שוב"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                  {fieldErrors.confirmPassword && (
                    <span className="auth-form__error-message">{fieldErrors.confirmPassword}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="phoneNumber">
                    טלפון (אופציונלי):
                  </label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    className={`form-control js-register-phone-input ${fieldErrors.phoneNumber ? 'auth-form__input--error' : ''}`}
                    placeholder="+972-5x-xxxxxxx"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                  {fieldErrors.phoneNumber && (
                    <span className="auth-form__error-message">{fieldErrors.phoneNumber}</span>
                  )}
                </div>

                <button
                  type="submit"
                  className="btn-auth-primary js-register-submit-button"
                  disabled={isLoading}
                >
                  {isLoading ? 'יוצר חשבון...' : 'צור חשבון'}
                </button>
              </form>

              <div className="auth-footer-zone">
                <Link to="/login" className="auth-link js-login-link">
                  כבר יש לך חשבון? התחבר
                </Link>
              </div>
            </tt-section>
          </tt-container>
        </main>
      </div>
      
      {/* Modular Footer */}
      <PageFooter />
    </div>
  );
};

export default RegisterForm;
