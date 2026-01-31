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
import { useNavigate } from 'react-router-dom';
import authService from '../../services/auth.js';
import { audit } from '../../utils/audit.js';
import { debugLog } from '../../utils/debug.js';

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
   * @description מעדכן את state של הטופס
   * @param {Event} e - Event object
   */
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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
    
    if (!formData.usernameOrEmail.trim()) {
      errors.usernameOrEmail = 'שדה חובה';
    }
    
    if (!formData.password) {
      errors.password = 'שדה חובה';
    } else if (formData.password.length < 1) {
      errors.password = 'סיסמה חייבת להכיל לפחות תו אחד';
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Handle Form Submit
   * 
   * @description מטפל בשליחת הטופס והתחברות
   * @param {Event} e - Event object
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
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
      
      // Redirect to dashboard
      audit.log('Auth', 'Redirecting to dashboard');
      navigate('/dashboard');
      
    } catch (err) {
      // Handle error
      const errorMessage = err.response?.data?.detail || 
                          err.message || 
                          'שגיאה בהתחברות. אנא בדוק את פרטיך.';
      
      setError(errorMessage);
      audit.error('Auth', 'Login failed', err);
      
      // Show error in UI (using js-error-feedback element)
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
            <p className="auth-subtitle">ברוכים הבאים ל-TikTrack</p>
            <h1 className="auth-title">התחברות</h1>
          </div>

          <form className="js-login-form" onSubmit={handleSubmit}>
            {/* Error Feedback (hidden by default, shown on error) */}
            <div className="auth-form__error js-error-feedback" hidden={!error}>
              {error}
            </div>

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
              <a href="/reset-password" className="auth-link js-forgot-password-link">
                שכחת סיסמה?
              </a>
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
            <a href="/register" className="auth-link-bold js-register-link">
              הרשמה עכשיו
            </a>
          </div>
        </tt-section>
      </tt-container>
    </div>
  );
};

export default LoginForm;
