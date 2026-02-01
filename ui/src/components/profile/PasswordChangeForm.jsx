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
import authService from '../../services/auth.js';
import { reactToApiPasswordChange } from '../../utils/transformers.js';
import { audit } from '../../utils/audit.js';
import { debugLog } from '../../utils/debug.js';

/**
 * PasswordChangeForm Component
 * 
 * @description רכיב שינוי סיסמה עם validation, error handling, ו-loading states
 * @legacyReference Legacy.auth.changePassword(oldPassword, newPassword)
 */
const PasswordChangeForm = () => {
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
   * @description בודק תקינות הטופס לפני שליחה
   * @returns {boolean} - true אם הטופס תקין
   */
  const validateForm = () => {
    const errors = {};
    
    // Current password validation
    if (!formData.currentPassword) {
      errors.currentPassword = 'שדה חובה';
    }
    
    // New password validation
    if (!formData.newPassword) {
      errors.newPassword = 'שדה חובה';
    } else if (formData.newPassword.length < 8) {
      errors.newPassword = 'סיסמה חייבת להכיל לפחות 8 תווים';
    }
    
    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'שדה חובה';
    } else if (formData.newPassword !== formData.confirmPassword) {
      errors.confirmPassword = 'הסיסמאות אינן תואמות';
    }
    
    // Check if new password is different from current
    if (formData.currentPassword && formData.newPassword && 
        formData.currentPassword === formData.newPassword) {
      errors.newPassword = 'הסיסמה החדשה חייבת להיות שונה מהסיסמה הנוכחית';
    }
    
    setFieldErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      audit.log('PasswordChangeForm', 'Form validation failed', { fieldErrors: errors });
      return false;
    }
    
    return true;
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
      
    } catch (err) {
      debugLog('PasswordChangeForm', 'Password change error', err);
      
      // Extract error message
      const errorMessage = err.response?.data?.detail || 
                          err.message || 
                          'שגיאה בשינוי הסיסמה. אנא נסה שוב.';
      
      setError(errorMessage);
      audit.error('PasswordChangeForm', 'Password change failed', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <tt-section data-title="אבטחת חשבון">
      <p className="subtitle-sm">ניהול סיסמה והגדרות אבטחה.</p>
      
      <form onSubmit={handleSubmit} className="auth-form">
        {/* General Error Display (LEGO Structure) */}
        {error && (
          <tt-container>
            <tt-section>
              <div className="auth-form__error js-error-feedback js-password-change-error" role="alert">
                {error}
              </div>
            </tt-section>
          </tt-container>
        )}
        
        {/* Success Message */}
        {success && (
          <tt-container>
            <tt-section>
              <div className="auth-form__success js-success-feedback js-password-change-success" role="alert" style={{ color: 'var(--color-brand)', padding: '12px', backgroundColor: 'var(--color-5)', borderRadius: '4px', marginBottom: '16px' }}>
                {success}
              </div>
            </tt-section>
          </tt-container>
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
          className="btn btn-full js-password-change-submit"
          disabled={isLoading}
        >
          {isLoading ? 'מעדכן...' : 'עדכן סיסמה'}
        </button>
      </form>
    </tt-section>
  );
};

export default PasswordChangeForm;
