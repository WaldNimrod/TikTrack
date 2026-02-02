/**
 * PasswordChangeForm - רכיב שינוי סיסמה (D15)
 * -------------------------------------------
 * רכיב React לשינוי סיסמה למשתמש מחובר
 * 
 * @description מימוש Pixel Perfect של טופס שינוי סיסמה בהתבסס על Blueprint של Team 31
 * @legacyReference Legacy.auth.changePassword()
 * @blueprintSource _COMMUNICATION/team_01/team_01_staging/D15_PROF_VIEW.html
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../../services/auth.js';
import { reactToApiPasswordChange } from '../../../shared/utils/transformers.js';
import { audit } from '../../../../utils/audit.js';
import { debugLog } from '../../../../utils/debug.js';
import { validatePasswordChangeForm, validatePasswordChange, validateConfirmPassword } from '../../../../logic/schemas/authSchema.js';
import { handleApiError } from '../../../../utils/errorHandler.js';

/**
 * PasswordChangeForm Component
 * 
 * @description רכיב שינוי סיסמה עם validation, error handling, ו-loading states
 * @legacyReference Legacy.auth.changePassword(oldPassword, newPassword)
 */
const PasswordChangeForm = () => {
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  
  // Password visibility state
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
      case 'currentPassword':
        if (!value) {
          validationResult = { isValid: false, error: 'שדה חובה' };
        } else {
          validationResult = { isValid: true, error: null };
        }
        break;
      case 'newPassword':
        validationResult = validatePasswordChange(value, formData.currentPassword);
        break;
      case 'confirmPassword':
        validationResult = validateConfirmPassword(value, formData.newPassword);
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
    
    // Clear general error and success
    if (error) {
      setError(null);
    }
    if (success) {
      setSuccess(null);
    }
  };

  /**
   * Validate Form
   * 
   * @description בודק תקינות הטופס לפני שליחה באמצעות Schema מרכזי
   * @returns {boolean} - true אם הטופס תקין
   */
  const validateForm = () => {
    const { isValid, errors } = validatePasswordChangeForm(formData);
    setFieldErrors(errors);
    
    if (!isValid) {
      audit.log('PasswordChangeForm', 'Form validation failed', { fieldErrors: errors });
    }
    
    return isValid;
  };

  /**
   * Handle Form Submit
   * 
   * @description מטפל בשליחת הטופס ושינוי הסיסמה
   * @param {Event} e - Event object
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    audit.log('PasswordChangeForm', 'Password change started');
    
    try {
      // Transform to API format (snake_case)
      const payload = reactToApiPasswordChange({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });
      
      debugLog('PasswordChangeForm', 'Password change payload prepared', payload);
      
      // API call
      await authService.changePassword(payload);
      
      // Success
      audit.log('PasswordChangeForm', 'Password changed successfully');
      setSuccess('הסיסמה עודכנה בהצלחה');
      
      // Clear form
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      
      // Reset password visibility
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
      
      // Redirect to profile page after 2 seconds
      setTimeout(() => {
        navigate('/profile');
      }, 2000);
      
    } catch (err) {
      debugLog('PasswordChangeForm', 'Password change error', err);
      
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
        setError('שגיאה בשינוי הסיסמה. אנא נסה שוב.');
      }
      
      audit.error('PasswordChangeForm', 'Password change failed', err);
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
            <p className="auth-subtitle">ניהול אבטחת החשבון</p>
            <h1 className="auth-title">שינוי סיסמה</h1>
          </div>

          <form 
            className="js-password-change-form" 
            onSubmit={handleSubmit} 
            noValidate
            action="#"
            method="post"
          >
            {/* Error Feedback (hidden by default, shown on error) */}
            {error && (
              <div className="auth-form__error js-error-feedback js-password-change-error" role="alert" aria-live="polite">
                {error}
              </div>
            )}
            
            {/* Success Message */}
            {success && (
              <div className="auth-form__success js-success-feedback js-password-change-success" role="alert" style={{ color: 'var(--color-brand)', padding: '0.75rem 1rem', backgroundColor: '#e6f7f5', border: '1px solid var(--color-brand)', borderRadius: '8px', marginBottom: 'var(--spacing-md, 16px)', textAlign: 'center' }}>
                {success}
              </div>
            )}
        
        {/* Current Password Field */}
        <div className="form-group">
          <label className="form-label" htmlFor="currentPassword">
            סיסמה נוכחית:
          </label>
          <div className="password-input-wrapper" style={{ position: 'relative' }}>
            <input
              type={showCurrentPassword ? "text" : "password"}
              id="currentPassword"
              name="currentPassword"
              className={`form-control js-password-change-current-input ${fieldErrors.currentPassword ? 'auth-form__input--error' : ''}`}
              required
              placeholder="הכנס סיסמה נוכחית"
              value={formData.currentPassword}
              onChange={handleInputChange}
              disabled={isLoading}
              style={{ paddingRight: '40px' }}
            />
            <button
              type="button"
              className="password-toggle js-password-toggle-current"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              aria-label={showCurrentPassword ? "הסתר סיסמה" : "הצג סיסמה"}
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-30)',
              }}
              disabled={isLoading}
            >
              {showCurrentPassword ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              )}
            </button>
          </div>
          {fieldErrors.currentPassword && (
            <span className="auth-form__error-message">{fieldErrors.currentPassword}</span>
          )}
        </div>
        
        {/* New Password Field */}
        <div className="form-group">
          <label className="form-label" htmlFor="newPassword">
            סיסמה חדשה:
          </label>
          <div className="password-input-wrapper" style={{ position: 'relative' }}>
            <input
              type={showNewPassword ? "text" : "password"}
              id="newPassword"
              name="newPassword"
              className={`form-control js-password-change-new-input ${fieldErrors.newPassword ? 'auth-form__input--error' : ''}`}
              required
              placeholder="הכנס סיסמה חדשה"
              value={formData.newPassword}
              onChange={handleInputChange}
              disabled={isLoading}
              style={{ paddingRight: '40px' }}
            />
            <button
              type="button"
              className="password-toggle js-password-toggle-new"
              onClick={() => setShowNewPassword(!showNewPassword)}
              aria-label={showNewPassword ? "הסתר סיסמה" : "הצג סיסמה"}
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-30)',
              }}
              disabled={isLoading}
            >
              {showNewPassword ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              )}
            </button>
          </div>
          {fieldErrors.newPassword && (
            <span className="auth-form__error-message">{fieldErrors.newPassword}</span>
          )}
        </div>
        
        {/* Confirm Password Field */}
        <div className="form-group">
          <label className="form-label" htmlFor="confirmPassword">
            אימות סיסמה:
          </label>
          <div className="password-input-wrapper" style={{ position: 'relative' }}>
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              name="confirmPassword"
              className={`form-control js-password-change-confirm-input ${fieldErrors.confirmPassword ? 'auth-form__input--error' : ''}`}
              required
              placeholder="הכנס סיסמה שוב"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              disabled={isLoading}
              style={{ paddingRight: '40px' }}
            />
            <button
              type="button"
              className="password-toggle js-password-toggle-confirm"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={showConfirmPassword ? "הסתר סיסמה" : "הצג סיסמה"}
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-30)',
              }}
              disabled={isLoading}
            >
              {showConfirmPassword ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              )}
            </button>
          </div>
          {fieldErrors.confirmPassword && (
            <span className="auth-form__error-message">{fieldErrors.confirmPassword}</span>
          )}
        </div>
        
            {/* Submit Button */}
            <button
              type="submit"
              className="btn-auth-primary js-password-change-submit"
              disabled={isLoading}
            >
              {isLoading ? 'מעדכן...' : 'עדכן סיסמה'}
            </button>
          </form>

          {/* Navigation Links */}
          <div className="auth-footer-zone" style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <Link to="/profile" className="auth-link js-back-to-profile-link">
              חזרה לפרופיל
            </Link>
          </div>
        </tt-section>
      </tt-container>
    </div>
  );
};

export default PasswordChangeForm;
