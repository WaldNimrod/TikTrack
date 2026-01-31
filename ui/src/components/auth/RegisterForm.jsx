/**
 * RegisterForm - רכיב הרשמה (D15)
 * --------------------------------
 * רכיב React להרשמת משתמשים חדשים
 * 
 * @description מימוש Pixel Perfect של דף ההרשמה בהתבסס על Blueprint של Team 31
 * @legacyReference Legacy.auth.register()
 * @blueprintSource _COMMUNICATION/team_31/team_31_staging/D15_REGISTER.html
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/auth.js';
import { audit } from '../../utils/audit.js';
import { debugLog } from '../../utils/debug.js';

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

  /**
   * Handle Input Change
   * 
   * @description מעדכן את state של הטופס
   * @param {Event} e - Event object
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear field error when user types
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    // Clear general error
    if (error) {
      setError(null);
    }
  };

  /**
   * Validate Form
   * 
   * @description בודק תקינות הטופס לפני שליחה
   * @returns {boolean} - true אם הטופס תקין
   */
  const validateForm = () => {
    const errors = {};
    
    // Username validation
    if (!formData.username.trim()) {
      errors.username = 'שדה חובה';
    } else if (formData.username.length < 3) {
      errors.username = 'שם משתמש חייב להכיל לפחות 3 תווים';
    } else if (formData.username.length > 50) {
      errors.username = 'שם משתמש לא יכול להכיל יותר מ-50 תווים';
    }
    
    // Email validation
    if (!formData.email.trim()) {
      errors.email = 'שדה חובה';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        errors.email = 'כתובת אימייל לא תקינה';
      }
    }
    
    // Password validation
    if (!formData.password) {
      errors.password = 'שדה חובה';
    } else if (formData.password.length < 8) {
      errors.password = 'סיסמה חייבת להכיל לפחות 8 תווים';
    }
    
    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'שדה חובה';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'הסיסמאות אינן תואמות';
    }
    
    // Phone validation (optional)
    if (formData.phoneNumber && formData.phoneNumber.trim()) {
      const phoneRegex = /^\+?[1-9]\d{1,14}$/;
      if (!phoneRegex.test(formData.phoneNumber.trim())) {
        errors.phoneNumber = 'מספר טלפון לא תקין (פורמט E.164: +972501234567)';
      }
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
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
      audit.log('Auth', 'Register form validation failed', { fieldErrors });
      return;
    }
    
    setIsLoading(true);
    audit.log('Auth', 'Register form submitted', { 
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
      audit.log('Auth', 'Redirecting after registration');
      navigate('/dashboard');
      
    } catch (err) {
      // Handle error
      const errorMessage = err.response?.data?.detail || 
                          err.message || 
                          'שגיאה בהרשמה. אנא נסה שוב.';
      
      setError(errorMessage);
      audit.error('Auth', 'Register failed', err);
      
      // Show error in UI
      const errorElement = document.querySelector('.js-error-feedback');
      if (errorElement) {
        errorElement.textContent = errorMessage;
        errorElement.hidden = false;
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-layout-root" dir="rtl">
      {/* G-Bridge Banner */}
      <div className="g-bridge-banner">
        🛡️ G-BRIDGE [{new Date().toLocaleTimeString('he-IL')}] | ✅ READY FOR DEVELOPMENT
      </div>
      
      <tt-container>
        <tt-section>
          <div className="auth-header">
            <div className="auth-logo">
              <img src="./images/logo.svg" alt="TikTrack Logo" />
            </div>
            <p className="auth-subtitle">הצטרפו לקהילת הסוחרים</p>
            <h1 className="auth-title">הרשמה</h1>
          </div>

          <form className="js-register-form" onSubmit={handleSubmit}>
            {/* Error Feedback (hidden by default, shown on error) */}
            <div className="auth-form__error js-error-feedback" hidden={!error}>
              {error}
            </div>

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
            <a href="/login" className="auth-link js-login-link">
              כבר יש לך חשבון? התחבר
            </a>
          </div>
        </tt-section>
      </tt-container>
    </div>
  );
};

export default RegisterForm;
