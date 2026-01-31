/**
 * PasswordResetFlow - זרימת איפוס סיסמה (D15)
 * --------------------------------------------
 * רכיב React לאיפוס סיסמה דרך EMAIL או SMS
 * 
 * @description מימוש Pixel Perfect של דף איפוס הסיסמה בהתבסס על Blueprint של Team 31
 * @legacyReference Legacy.auth.resetPassword()
 * @blueprintSource _COMMUNICATION/team_31/team_31_staging/D15_RESET_PWD.html
 */

import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import authService from '../../services/auth.js';
import { audit } from '../../utils/audit.js';
import { debugLog } from '../../utils/debug.js';

/**
 * PasswordResetFlow Component
 * 
 * @description רכיב איפוס סיסמה עם תמיכה ב-EMAIL ו-SMS
 * @legacyReference Legacy.auth.resetPassword(method, identifier)
 */
const PasswordResetFlow = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Check if we're in verify mode (token/code provided)
  const resetToken = searchParams.get('token');
  const verificationCode = searchParams.get('code');
  const isVerifyMode = !!(resetToken || verificationCode);
  
  // Form state - Request mode
  const [requestData, setRequestData] = useState({
    identifier: '', // email or phone
  });
  
  // Form state - Verify mode
  const [verifyData, setVerifyData] = useState({
    resetToken: resetToken || '',
    verificationCode: verificationCode || '',
    newPassword: '',
    confirmPassword: '',
  });
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [method, setMethod] = useState('EMAIL'); // EMAIL or SMS

  /**
   * Detect Method from Identifier
   * 
   * @description מזהה אם המזהה הוא אימייל או טלפון
   * @param {string} identifier - אימייל או טלפון
   * @returns {string} - 'EMAIL' או 'SMS'
   */
  const detectMethod = (identifier) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    
    if (emailRegex.test(identifier.trim())) {
      return 'EMAIL';
    } else if (phoneRegex.test(identifier.trim())) {
      return 'SMS';
    }
    // Default to EMAIL if unclear
    return 'EMAIL';
  };

  /**
   * Handle Request Input Change
   */
  const handleRequestInputChange = (e) => {
    const { value } = e.target;
    setRequestData({ identifier: value });
    
    // Auto-detect method
    if (value.trim()) {
      setMethod(detectMethod(value));
    }
    
    // Clear errors
    if (error) setError(null);
    if (fieldErrors.identifier) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.identifier;
        return newErrors;
      });
    }
  };

  /**
   * Handle Verify Input Change
   */
  const handleVerifyInputChange = (e) => {
    const { name, value } = e.target;
    setVerifyData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors
    if (error) setError(null);
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  /**
   * Validate Request Form
   */
  const validateRequestForm = () => {
    const errors = {};
    
    if (!requestData.identifier.trim()) {
      errors.identifier = 'שדה חובה';
    } else {
      const detectedMethod = detectMethod(requestData.identifier);
      if (detectedMethod === 'EMAIL') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(requestData.identifier.trim())) {
          errors.identifier = 'כתובת אימייל לא תקינה';
        }
      } else {
        const phoneRegex = /^\+?[1-9]\d{1,14}$/;
        if (!phoneRegex.test(requestData.identifier.trim())) {
          errors.identifier = 'מספר טלפון לא תקין (פורמט E.164: +972501234567)';
        }
      }
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Validate Verify Form
   */
  const validateVerifyForm = () => {
    const errors = {};
    
    const currentMethod = resetToken ? 'EMAIL' : 'SMS';
    
    if (currentMethod === 'EMAIL' && !verifyData.resetToken) {
      errors.resetToken = 'שדה חובה';
    }
    
    if (currentMethod === 'SMS' && !verifyData.verificationCode) {
      errors.verificationCode = 'שדה חובה';
    } else if (currentMethod === 'SMS' && verifyData.verificationCode.length !== 6) {
      errors.verificationCode = 'קוד אימות חייב להכיל 6 ספרות';
    }
    
    if (!verifyData.newPassword) {
      errors.newPassword = 'שדה חובה';
    } else if (verifyData.newPassword.length < 8) {
      errors.newPassword = 'סיסמה חייבת להכיל לפחות 8 תווים';
    }
    
    if (!verifyData.confirmPassword) {
      errors.confirmPassword = 'שדה חובה';
    } else if (verifyData.newPassword !== verifyData.confirmPassword) {
      errors.confirmPassword = 'הסיסמאות אינן תואמות';
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Handle Request Submit
   */
  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    
    setError(null);
    setFieldErrors({});
    
    if (!validateRequestForm()) {
      audit.log('Auth', 'Password reset request validation failed', { fieldErrors });
      return;
    }
    
    setIsLoading(true);
    const detectedMethod = detectMethod(requestData.identifier);
    
    audit.log('Auth', 'Password reset request started', { 
      method: detectedMethod,
      identifier: requestData.identifier 
    });
    
    try {
      await authService.requestPasswordReset(
        detectedMethod,
        requestData.identifier.trim()
      );
      
      setSuccess(true);
      audit.log('Auth', 'Password reset request successful');
      
      // Show success message
      setTimeout(() => {
        setSuccess(false);
        // Optionally redirect to verify page if token/code is provided
      }, 3000);
      
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 
                          err.message || 
                          'שגיאה בשליחת בקשה. אנא נסה שוב.';
      
      setError(errorMessage);
      audit.error('Auth', 'Password reset request failed', err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle Verify Submit
   */
  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    
    setError(null);
    setFieldErrors({});
    
    if (!validateVerifyForm()) {
      audit.log('Auth', 'Password reset verify validation failed', { fieldErrors });
      return;
    }
    
    setIsLoading(true);
    const currentMethod = resetToken ? 'EMAIL' : 'SMS';
    
    audit.log('Auth', 'Password reset verify started', { method: currentMethod });
    
    try {
      const resetPayload = {
        newPassword: verifyData.newPassword,
        ...(currentMethod === 'EMAIL' 
          ? { resetToken: verifyData.resetToken }
          : { verificationCode: verifyData.verificationCode }
        ),
      };
      
      await authService.verifyPasswordReset(resetPayload);
      
      setSuccess(true);
      audit.log('Auth', 'Password reset verify successful');
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 
                          err.message || 
                          'שגיאה באיפוס הסיסמה. אנא נסה שוב.';
      
      setError(errorMessage);
      audit.error('Auth', 'Password reset verify failed', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Render Verify Mode
  if (isVerifyMode) {
    return (
      <div className="auth-layout-root" dir="rtl">
        <div className="g-bridge-banner">
          🛡️ G-BRIDGE [{new Date().toLocaleTimeString('he-IL')}] | ✅ READY FOR DEVELOPMENT
        </div>
        
        <tt-container>
          <tt-section>
            <div className="auth-header">
              <div className="auth-logo">
                <img src="./images/logo.svg" alt="TikTrack Logo" />
              </div>
              <p className="auth-subtitle">הזן סיסמה חדשה</p>
              <h1 className="auth-title">איפוס סיסמה</h1>
            </div>

            <form className="js-reset-verify-form" onSubmit={handleVerifySubmit}>
              <div className="auth-form__error js-error-feedback" hidden={!error}>
                {error}
              </div>
              
              <div className="auth-form__success js-success-feedback" hidden={!success}>
                הסיסמה אופסה בהצלחה! מפנה לדף ההתחברות...
              </div>

              {resetToken && (
                <div className="form-group">
                  <label className="form-label" htmlFor="resetToken">
                    קוד איפוס:
                  </label>
                  <input
                    type="text"
                    id="resetToken"
                    name="resetToken"
                    className={`form-control js-reset-token-input ${fieldErrors.resetToken ? 'auth-form__input--error' : ''}`}
                    required
                    placeholder="הכנס קוד איפוס מהאימייל"
                    value={verifyData.resetToken}
                    onChange={handleVerifyInputChange}
                    disabled={isLoading}
                  />
                  {fieldErrors.resetToken && (
                    <span className="auth-form__error-message">{fieldErrors.resetToken}</span>
                  )}
                </div>
              )}

              {verificationCode && (
                <div className="form-group">
                  <label className="form-label" htmlFor="verificationCode">
                    קוד אימות SMS:
                  </label>
                  <input
                    type="text"
                    id="verificationCode"
                    name="verificationCode"
                    className={`form-control js-reset-code-input ${fieldErrors.verificationCode ? 'auth-form__input--error' : ''}`}
                    required
                    placeholder="הכנס קוד 6 ספרות"
                    maxLength={6}
                    value={verifyData.verificationCode}
                    onChange={handleVerifyInputChange}
                    disabled={isLoading}
                  />
                  {fieldErrors.verificationCode && (
                    <span className="auth-form__error-message">{fieldErrors.verificationCode}</span>
                  )}
                </div>
              )}

              <div className="form-group">
                <label className="form-label" htmlFor="newPassword">
                  סיסמה חדשה:
                </label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  className={`form-control js-reset-new-password-input ${fieldErrors.newPassword ? 'auth-form__input--error' : ''}`}
                  required
                  placeholder="הכנס סיסמה חדשה"
                  value={verifyData.newPassword}
                  onChange={handleVerifyInputChange}
                  disabled={isLoading}
                />
                {fieldErrors.newPassword && (
                  <span className="auth-form__error-message">{fieldErrors.newPassword}</span>
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
                  className={`form-control js-reset-confirm-password-input ${fieldErrors.confirmPassword ? 'auth-form__input--error' : ''}`}
                  required
                  placeholder="הכנס סיסמה שוב"
                  value={verifyData.confirmPassword}
                  onChange={handleVerifyInputChange}
                  disabled={isLoading}
                />
                {fieldErrors.confirmPassword && (
                  <span className="auth-form__error-message">{fieldErrors.confirmPassword}</span>
                )}
              </div>

              <button
                type="submit"
                className="btn-auth-primary js-reset-verify-submit-button"
                disabled={isLoading}
              >
                {isLoading ? 'מאפס סיסמה...' : 'אפס סיסמה'}
              </button>
            </form>

            <div className="auth-footer-zone">
              <a href="/login" className="auth-link js-back-to-login-link">
                חזרה להתחברות
              </a>
            </div>
          </tt-section>
        </tt-container>
      </div>
    );
  }

  // Render Request Mode
  return (
    <div className="auth-layout-root" dir="rtl">
      <div className="g-bridge-banner">
        🛡️ G-BRIDGE [{new Date().toLocaleTimeString('he-IL')}] | ✅ READY FOR DEVELOPMENT
      </div>
      
      <tt-container>
        <tt-section>
          <div className="auth-header">
            <div className="auth-logo">
              <img src="./images/logo.svg" alt="TikTrack Logo" />
            </div>
            <p className="auth-subtitle">הזן אימייל או טלפון לקבלת קישור איפוס</p>
            <h1 className="auth-title">שחזור סיסמה</h1>
          </div>

          <form className="js-reset-request-form" onSubmit={handleRequestSubmit}>
            <div className="auth-form__error js-error-feedback" hidden={!error}>
              {error}
            </div>
            
            <div className="auth-form__success js-success-feedback" hidden={!success}>
              בקשה נשלחה בהצלחה! בדוק את {method === 'EMAIL' ? 'האימייל' : 'ה-SMS'} שלך.
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="identifier">
                אימייל או טלפון:
              </label>
              <input
                type="text"
                id="identifier"
                name="identifier"
                className={`form-control js-reset-identifier-input ${fieldErrors.identifier ? 'auth-form__input--error' : ''}`}
                required
                placeholder="your@email.com או +972-5x-xxxxxxx"
                value={requestData.identifier}
                onChange={handleRequestInputChange}
                disabled={isLoading}
              />
              {fieldErrors.identifier && (
                <span className="auth-form__error-message">{fieldErrors.identifier}</span>
              )}
              {requestData.identifier && (
                <p className="auth-form__hint">
                  שיטת איפוס: {method === 'EMAIL' ? 'אימייל' : 'SMS'}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="btn-auth-primary js-reset-request-submit-button"
              disabled={isLoading}
            >
              {isLoading ? 'שולח...' : 'שלח קישור איפוס'}
            </button>
          </form>

          <div className="auth-footer-zone">
            <a href="/login" className="auth-link js-back-to-login-link">
              חזרה להתחברות
            </a>
          </div>
        </tt-section>
      </tt-container>
    </div>
  );
};

export default PasswordResetFlow;
