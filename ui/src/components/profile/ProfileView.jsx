/**
 * ProfileView - עמוד ניהול פרופיל משתמש (D15)
 * --------------------------------------------
 * עמוד ניהול פרופיל המשתמש המחובר
 * 
 * @description מימוש Pixel Perfect של עמוד הפרופיל בהתבסס על Blueprint של Team 31
 * @legacyReference Legacy.user.profile()
 * @blueprintSource _COMMUNICATION/team_01/team_01_staging/D15_PROF_VIEW.html
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../../services/auth.js';
import { audit } from '../../utils/audit.js';
import { debugLog } from '../../utils/debug.js';
import { validateUserForm, validateEmail, validatePhoneNumber, validateFirstName, validateLastName, validateDisplayName, validateTimezone, validateLanguage } from '../../logic/schemas/userSchema.js';
import { handleApiError } from '../../utils/errorHandler.js';

/**
 * ProfileView Component
 * 
 * @description עמוד ניהול פרופיל המשתמש המחובר עם אפשרות לערוך פרטים ולהתנתק
 * @legacyReference Legacy.user.profile()
 */
const ProfileView = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Form state - Initialize with empty values
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    displayName: '',
    email: '',
    phoneNumber: '',
    timezone: 'UTC',
    language: 'he',
  });
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  
  // Verification state
  const [resendingEmail, setResendingEmail] = useState(false);
  const [resendingPhone, setResendingPhone] = useState(false);
  
  // API Keys state
  const [apiKeys, setApiKeys] = useState([]);
  const [loadingApiKeys, setLoadingApiKeys] = useState(false);

  useEffect(() => {
    /**
     * טעינת נתוני המשתמש הנוכחי
     */
    const loadUserData = async () => {
      try {
        debugLog('ProfileView', 'Loading user data');
        const userData = await authService.getCurrentUser();
        debugLog('ProfileView', 'User data loaded', { 
          userId: userData.externalUlids, 
          username: userData.username 
        });
        setCurrentUser(userData);
        
        // Initialize form data
        // UserResponse now includes all fields needed for editing (after backend update)
        const initialFormData = {
          firstName: userData.firstName || userData.first_name || '',
          lastName: userData.lastName || userData.last_name || '',
          displayName: userData.displayName || userData.display_name || '',
          email: userData.email || '',
          phoneNumber: userData.phoneNumbers || userData.phone_numbers || '',
          timezone: userData.timezone || 'UTC',
          language: userData.language || 'he',
        };
        
        setFormData(initialFormData);
        
        debugLog('ProfileView', 'Form data initialized', {
          firstName: initialFormData.firstName,
          lastName: initialFormData.lastName,
          displayName: initialFormData.displayName,
          email: initialFormData.email,
          phoneNumber: initialFormData.phoneNumber,
          timezone: initialFormData.timezone,
          language: initialFormData.language,
          userDataKeys: Object.keys(userData)
        });
      } catch (error) {
        debugLog('ProfileView', 'Failed to load user data', error);
        audit.error('ProfileView', 'Failed to load user data', error);
        setError('שגיאה בטעינת פרטי המשתמש. אנא נסה שוב.');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);
  
  useEffect(() => {
    if (currentUser) {
      loadApiKeys();
    }
  }, [currentUser]);
  
  /**
   * Load API Keys
   * 
   * @description טוען את רשימת מפתחות ה-API של המשתמש
   */
  const loadApiKeys = async () => {
    if (!currentUser) return;
    
    try {
      setLoadingApiKeys(true);
      debugLog('ProfileView', 'Loading API keys');
      
      // TODO: Implement API keys service
      // const keys = await apiKeysService.listApiKeys();
      // setApiKeys(keys);
      
      // Placeholder for now - empty array
      // For admin user, show example data with all fields
      if (currentUser.role === 'ADMIN' || currentUser.role === 'SUPERADMIN') {
        // Example data for admin users to see structure
        // Based on UserApiKeyResponse schema: external_ulids, provider, provider_label, masked_key, is_active, is_verified, last_verified_at, created_at
        setApiKeys([
          {
            externalUlids: '01EXAMPLE1234567890ABCDEF',
            provider: 'IBKR',
            providerLabel: 'Interactive Brokers - Production',
            maskedKey: '********************',
            isActive: true,
            isVerified: true,
            lastVerifiedAt: new Date().toISOString(),
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days ago
          },
          {
            externalUlids: '01EXAMPLE9876543210FEDCBA',
            provider: 'POLYGON',
            providerLabel: 'Polygon.io - Primary',
            maskedKey: '********************',
            isActive: false,
            isVerified: false,
            lastVerifiedAt: null,
            createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString() // 14 days ago
          }
        ]);
      } else {
        setApiKeys([]);
      }
    } catch (error) {
      debugLog('ProfileView', 'Failed to load API keys', error);
      audit.error('ProfileView', 'Failed to load API keys', error);
    } finally {
      setLoadingApiKeys(false);
    }
  };
  
  /**
   * Resend Email Verification
   * 
   * @description שולח הודעת וריפיקציה מחדש לאימייל
   */
  const handleResendEmailVerification = async () => {
    try {
      setResendingEmail(true);
      audit.log('ProfileView', 'Resend email verification requested');
      
      await authService.resendEmailVerification();
      
      setSuccess('הודעת וריפיקציה נשלחה לאימייל שלך. אנא בדוק את תיבת הדואר.');
      setTimeout(() => setSuccess(null), 5000);
    } catch (error) {
      debugLog('ProfileView', 'Failed to resend email verification', error);
      const { formError: apiError } = handleApiError(error);
      setError(apiError || 'שגיאה בשליחת הודעת וריפיקציה. אנא נסה שוב.');
    } finally {
      setResendingEmail(false);
    }
  };
  
  /**
   * Resend Phone Verification
   * 
   * @description שולח קוד וריפיקציה מחדש לטלפון
   */
  const handleResendPhoneVerification = async () => {
    try {
      setResendingPhone(true);
      audit.log('ProfileView', 'Resend phone verification requested');
      
      const response = await authService.resendPhoneVerification();
      
      setSuccess('קוד וריפיקציה נשלח לטלפון שלך. אנא הזן את הקוד.');
      setTimeout(() => setSuccess(null), 5000);
      
      // Refresh user data to get updated verification status
      const userData = await authService.getCurrentUser();
      setCurrentUser(userData);
    } catch (error) {
      debugLog('ProfileView', 'Failed to resend phone verification', error);
      const { formError: apiError } = handleApiError(error);
      setError(apiError || 'שגיאה בשליחת קוד וריפיקציה. אנא נסה שוב.');
    } finally {
      setResendingPhone(false);
    }
  };

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
      case 'email':
        validationResult = validateEmail(value);
        break;
      case 'phoneNumber':
        validationResult = validatePhoneNumber(value);
        break;
      case 'firstName':
        validationResult = validateFirstName(value);
        break;
      case 'lastName':
        validationResult = validateLastName(value);
        break;
      case 'displayName':
        validationResult = validateDisplayName(value);
        break;
      case 'timezone':
        validationResult = validateTimezone(value);
        break;
      case 'language':
        validationResult = validateLanguage(value);
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
   * @description בודק תקינות הטופס לפני שליחה
   * @returns {boolean} - true אם הטופס תקין
   */
  const validateForm = () => {
    const errors = {};
    
    if (!formData.email.trim()) {
      errors.email = 'שדה חובה';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'אימייל לא תקין';
    }
    
    if (formData.phoneNumber && !/^0[0-9]{1,2}-?[0-9]{7}$/.test(formData.phoneNumber.replace(/-/g, ''))) {
      errors.phoneNumber = 'מספר טלפון לא תקין (05x-xxxxxxx)';
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Handle Form Submit
   * 
   * @description מטפל בעדכון פרטי המשתמש
   * @param {Event} e - Event object
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Prevent multiple submissions
    if (isLoading) {
      return;
    }
    
    // Clear previous errors and success
    setError(null);
    setSuccess(null);
    setFieldErrors({});
    
    // Validate form
    if (!validateForm()) {
      audit.log('ProfileView', 'Form validation failed', { fieldErrors });
      return;
    }
    
    setIsLoading(true);
    audit.log('ProfileView', 'Profile update submitted', { 
      firstName: formData.firstName,
      lastName: formData.lastName,
      displayName: formData.displayName,
      email: formData.email,
      phoneNumber: formData.phoneNumber,
      timezone: formData.timezone,
      language: formData.language
    });
    
    try {
      // Call Auth Service to update user
      const updatedUser = await authService.updateUser({
        externalUlids: currentUser.externalUlids,
        firstName: formData.firstName,
        lastName: formData.lastName,
        displayName: formData.displayName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        timezone: formData.timezone,
        language: formData.language,
      });
      
      debugLog('ProfileView', 'Profile update successful', { userId: updatedUser.externalUlids });
      
      // Update current user state
      setCurrentUser(updatedUser);
      setSuccess('הפרופיל עודכן בהצלחה!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
      
    } catch (err) {
      debugLog('ProfileView', 'Profile update error', err);
      
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
        setError('שגיאה בעדכון הפרופיל. אנא נסה שוב.');
      }
      
      audit.error('ProfileView', 'Profile update failed', err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle Logout
   * 
   * @description מטפל בהתנתקות המשתמש
   */
  const handleLogout = async () => {
    try {
      audit.log('ProfileView', 'Logout button clicked');
      await authService.logout();
      navigate('/login');
    } catch (error) {
      debugLog('ProfileView', 'Logout error', error);
      // Even if logout fails, navigate to login
      localStorage.removeItem('access_token');
      navigate('/login');
    }
  };

  if (loading) {
    return (
      <div className="auth-layout-root" dir="rtl">
        <tt-container>
          <tt-section>
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p>טוען...</p>
            </div>
          </tt-section>
        </tt-container>
      </div>
    );
  }

  return (
    <div className="auth-layout-root" dir="rtl">
      <tt-container>
        <tt-section>
          <div className="auth-header">
            <div className="auth-logo">
              <img src="/images/logo.svg" alt="TikTrack Logo" />
            </div>
            <p className="auth-subtitle">ניהול הפרופיל שלך</p>
            <h1 className="auth-title">פרופיל משתמש</h1>
          </div>

          <form 
            className="js-profile-form" 
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
            
            {/* Success Message */}
            {success && (
              <div className="auth-form__success js-success-feedback" role="alert" style={{ color: 'var(--color-brand)', padding: '0.75rem 1rem', backgroundColor: '#e6f7f5', border: '1px solid var(--color-brand)', borderRadius: '8px', marginBottom: 'var(--spacing-md, 16px)', textAlign: 'center' }}>
                {success}
              </div>
            )}

            {/* First Name Field */}
            <div className="form-group">
              <label className="form-label" htmlFor="firstName">
                שם פרטי:
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                className={`form-control js-profile-first-name-input ${fieldErrors.firstName ? 'auth-form__input--error' : ''}`}
                placeholder="הכנס שם פרטי"
                value={formData.firstName}
                onChange={handleInputChange}
                disabled={isLoading}
                maxLength={100}
              />
              {fieldErrors.firstName && (
                <span className="auth-form__error-message">{fieldErrors.firstName}</span>
              )}
            </div>

            {/* Last Name Field */}
            <div className="form-group">
              <label className="form-label" htmlFor="lastName">
                שם משפחה:
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                className={`form-control js-profile-last-name-input ${fieldErrors.lastName ? 'auth-form__input--error' : ''}`}
                placeholder="הכנס שם משפחה"
                value={formData.lastName}
                onChange={handleInputChange}
                disabled={isLoading}
                maxLength={100}
              />
              {fieldErrors.lastName && (
                <span className="auth-form__error-message">{fieldErrors.lastName}</span>
              )}
            </div>

            {/* Display Name Field */}
            <div className="form-group">
              <label className="form-label" htmlFor="displayName">
                שם תצוגה:
              </label>
              <input
                type="text"
                id="displayName"
                name="displayName"
                className={`form-control js-profile-display-name-input ${fieldErrors.displayName ? 'auth-form__input--error' : ''}`}
                placeholder="הכנס שם תצוגה"
                value={formData.displayName}
                onChange={handleInputChange}
                disabled={isLoading}
                maxLength={100}
              />
              {fieldErrors.displayName && (
                <span className="auth-form__error-message">{fieldErrors.displayName}</span>
              )}
            </div>

            {/* Email Field */}
            <div className="form-group">
              <label className="form-label" htmlFor="email">
                אימייל:
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className={`form-control js-profile-email-input ${fieldErrors.email ? 'auth-form__input--error' : ''}`}
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

            {/* Phone Number Field */}
            <div className="form-group">
              <label className="form-label" htmlFor="phoneNumber">
                טלפון: <span style={{ color: 'var(--pico-muted-color)', fontSize: '0.875rem' }}>(חובה בפורמט E.164)</span>
              </label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                className={`form-control js-profile-phone-input ${fieldErrors.phoneNumber ? 'auth-form__input--error' : ''}`}
                placeholder="+972501234567"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                disabled={isLoading}
                required
                pattern="^\+[1-9]\d{1,14}$"
              />
              {fieldErrors.phoneNumber && (
                <span className="auth-form__error-message">{fieldErrors.phoneNumber}</span>
              )}
              <small style={{ display: 'block', marginTop: '0.25rem', color: 'var(--pico-muted-color)', fontSize: '0.875rem' }}>
                פורמט: +[קוד מדינה][מספר] (דוגמה: +972501234567)
              </small>
            </div>

            {/* Timezone Field */}
            <div className="form-group">
              <label className="form-label" htmlFor="timezone">
                אזור זמן:
              </label>
              <select
                id="timezone"
                name="timezone"
                className={`form-control js-profile-timezone-input ${fieldErrors.timezone ? 'auth-form__input--error' : ''}`}
                value={formData.timezone}
                onChange={handleInputChange}
                disabled={isLoading}
                required
              >
                <option value="">בחר אזור זמן</option>
                <optgroup label="אסיה">
                  <option value="Asia/Jerusalem">ירושלים (Asia/Jerusalem)</option>
                  <option value="Asia/Dubai">דובאי (Asia/Dubai)</option>
                  <option value="Asia/Tokyo">טוקיו (Asia/Tokyo)</option>
                  <option value="Asia/Hong_Kong">הונג קונג (Asia/Hong_Kong)</option>
                  <option value="Asia/Shanghai">שנחאי (Asia/Shanghai)</option>
                  <option value="Asia/Singapore">סינגפור (Asia/Singapore)</option>
                  <option value="Asia/Bangkok">בנגקוק (Asia/Bangkok)</option>
                  <option value="Asia/Kolkata">מומבאי (Asia/Kolkata)</option>
                </optgroup>
                <optgroup label="אירופה">
                  <option value="Europe/London">לונדון (Europe/London)</option>
                  <option value="Europe/Paris">פריז (Europe/Paris)</option>
                  <option value="Europe/Berlin">ברלין (Europe/Berlin)</option>
                  <option value="Europe/Rome">רומא (Europe/Rome)</option>
                  <option value="Europe/Madrid">מדריד (Europe/Madrid)</option>
                  <option value="Europe/Amsterdam">אמסטרדם (Europe/Amsterdam)</option>
                  <option value="Europe/Moscow">מוסקבה (Europe/Moscow)</option>
                  <option value="Europe/Athens">אתונה (Europe/Athens)</option>
                </optgroup>
                <optgroup label="אמריקה">
                  <option value="America/New_York">ניו יורק (America/New_York)</option>
                  <option value="America/Chicago">שיקגו (America/Chicago)</option>
                  <option value="America/Denver">דנבר (America/Denver)</option>
                  <option value="America/Los_Angeles">לוס אנג'לס (America/Los_Angeles)</option>
                  <option value="America/Toronto">טורונטו (America/Toronto)</option>
                  <option value="America/Mexico_City">מקסיקו סיטי (America/Mexico_City)</option>
                  <option value="America/Sao_Paulo">סאו פאולו (America/Sao_Paulo)</option>
                  <option value="America/Buenos_Aires">בואנוס איירס (America/Buenos_Aires)</option>
                </optgroup>
                <optgroup label="אחרים">
                  <option value="UTC">UTC (Coordinated Universal Time)</option>
                  <option value="Australia/Sydney">סידני (Australia/Sydney)</option>
                  <option value="Australia/Melbourne">מלבורן (Australia/Melbourne)</option>
                  <option value="Pacific/Auckland">אוקלנד (Pacific/Auckland)</option>
                </optgroup>
              </select>
              {fieldErrors.timezone && (
                <span className="auth-form__error-message">{fieldErrors.timezone}</span>
              )}
            </div>

            {/* Language Field */}
            <div className="form-group">
              <label className="form-label" htmlFor="language">
                שפה:
              </label>
              <select
                id="language"
                name="language"
                className={`form-control js-profile-language-input ${fieldErrors.language ? 'auth-form__input--error' : ''}`}
                value={formData.language}
                onChange={handleInputChange}
                disabled={isLoading}
              >
                <option value="he">עברית</option>
                <option value="en" disabled>English (לא זמין)</option>
                <option value="ar" disabled>العربية (לא זמין)</option>
                <option value="ru" disabled>Русский (לא זמין)</option>
              </select>
              {fieldErrors.language && (
                <span className="auth-form__error-message">{fieldErrors.language}</span>
              )}
              <small style={{ display: 'block', marginTop: '0.25rem', color: 'var(--pico-muted-color)', fontSize: '0.875rem' }}>
                כרגע תומכים רק בעברית
              </small>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn-auth-primary js-profile-submit-button"
              disabled={isLoading}
            >
              {isLoading ? 'שומר...' : 'שמור שינויים'}
            </button>
          </form>

          {/* Read-Only Information Section */}
          {currentUser && (
            <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--border-color, #C6C6C8)' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', fontWeight: '600' }}>מידע נוסף</h3>
              
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {/* ULID - Primary Key (Read-Only) */}
                {currentUser.externalUlids && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', backgroundColor: 'var(--pico-background-color, #f8f9fa)', borderRadius: 'var(--pico-border-radius)', border: '1px solid var(--pico-border-color, #dee2e6)', marginBottom: '0.5rem' }}>
                    <div>
                      <span style={{ fontWeight: '600', color: 'var(--pico-muted-color)', fontSize: '0.875rem' }}>מזהה ייחודי (ULID):</span>
                      <div style={{ fontFamily: 'monospace', fontSize: '0.875rem', marginTop: '0.25rem', wordBreak: 'break-all' }}>
                        {currentUser.externalUlids}
                      </div>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--pico-muted-color)', padding: '0.25rem 0.5rem', backgroundColor: 'var(--pico-secondary-background)', borderRadius: '4px' }}>
                      לקריאה בלבד
                    </span>
                  </div>
                )}
                
                {currentUser.username && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--pico-border-color, #dee2e6)' }}>
                    <span style={{ fontWeight: '500', color: 'var(--pico-muted-color)' }}>שם משתמש:</span>
                    <span>{currentUser.username}</span>
                  </div>
                )}
                
                {currentUser.role && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--pico-border-color, #dee2e6)' }}>
                    <span style={{ fontWeight: '500', color: 'var(--pico-muted-color)' }}>תפקיד:</span>
                    <span>
                      {currentUser.role === 'USER' && 'משתמש'}
                      {currentUser.role === 'ADMIN' && 'מנהל'}
                      {currentUser.role === 'SUPERADMIN' && 'מנהל ראשי'}
                      {!['USER', 'ADMIN', 'SUPERADMIN'].includes(currentUser.role) && currentUser.role}
                    </span>
                  </div>
                )}
                
                {currentUser.userTierLevels && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--pico-border-color, #dee2e6)' }}>
                    <span style={{ fontWeight: '500', color: 'var(--pico-muted-color)' }}>רמת משתמש:</span>
                    <span>{currentUser.userTierLevels}</span>
                  </div>
                )}
                
                {/* Email Verification Status with Resend Button */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', backgroundColor: currentUser.isEmailVerified ? '#e6f7f5' : '#fff3cd', borderRadius: 'var(--pico-border-radius)', border: `1px solid ${currentUser.isEmailVerified ? 'var(--color-brand)' : '#ffc107'}` }}>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontWeight: '500', color: 'var(--pico-muted-color)', display: 'block' }}>אימייל מאומת:</span>
                    <span style={{ color: currentUser.isEmailVerified ? 'var(--color-brand)' : '#856404', fontWeight: '600', fontSize: '0.9rem' }}>
                      {currentUser.isEmailVerified ? '✓ מאומת' : '✗ לא מאומת'}
                    </span>
                    {currentUser.email && (
                      <span style={{ display: 'block', fontSize: '0.875rem', color: 'var(--pico-muted-color)', marginTop: '0.25rem' }}>
                        {currentUser.email}
                      </span>
                    )}
                  </div>
                  {!currentUser.isEmailVerified && (
                    <button
                      type="button"
                      onClick={handleResendEmailVerification}
                      disabled={resendingEmail}
                      style={{
                        padding: '0.5rem 1rem',
                        fontSize: '0.875rem',
                        background: 'var(--color-brand)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 'var(--pico-border-radius)',
                        cursor: resendingEmail ? 'not-allowed' : 'pointer',
                        opacity: resendingEmail ? 0.6 : 1,
                        marginRight: '1rem',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {resendingEmail ? 'שולח...' : 'שלח וריפיקציה'}
                    </button>
                  )}
                </div>
                
                {/* Phone Verification Status with Resend Button */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', backgroundColor: currentUser.phoneVerified ? '#e6f7f5' : '#fff3cd', borderRadius: 'var(--pico-border-radius)', border: `1px solid ${currentUser.phoneVerified ? 'var(--color-brand)' : '#ffc107'}` }}>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontWeight: '500', color: 'var(--pico-muted-color)', display: 'block' }}>טלפון מאומת:</span>
                    <span style={{ color: currentUser.phoneVerified ? 'var(--color-brand)' : '#856404', fontWeight: '600', fontSize: '0.9rem' }}>
                      {currentUser.phoneVerified ? '✓ מאומת' : '✗ לא מאומת'}
                    </span>
                    <span style={{ display: 'block', fontSize: '0.875rem', color: 'var(--pico-muted-color)', marginTop: '0.25rem' }}>
                      {currentUser.phoneNumber || currentUser.phoneNumbers || 'לא הוגדר'}
                    </span>
                  </div>
                  {!currentUser.phoneVerified && (
                    <button
                      type="button"
                      onClick={handleResendPhoneVerification}
                      disabled={resendingPhone}
                      style={{
                        padding: '0.5rem 1rem',
                        fontSize: '0.875rem',
                        background: 'var(--color-brand)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 'var(--pico-border-radius)',
                        cursor: resendingPhone ? 'not-allowed' : 'pointer',
                        opacity: resendingPhone ? 0.6 : 1,
                        marginRight: '1rem',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {resendingPhone ? 'שולח...' : 'שלח קוד וריפיקציה'}
                    </button>
                  )}
                </div>
                
                {currentUser.createdAt && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--pico-border-color, #dee2e6)' }}>
                    <span style={{ fontWeight: '500', color: 'var(--pico-muted-color)' }}>תאריך הרשמה:</span>
                    <span>{new Date(currentUser.createdAt).toLocaleDateString('he-IL', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* API Keys Management Section */}
          <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--border-color, #C6C6C8)' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', fontWeight: '600' }}>מפתחות API</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--pico-muted-color)', marginBottom: '1rem' }}>
              ניהול מפתחות API לחיבורים חיצוניים.
            </p>
            
            {loadingApiKeys ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <p>טוען מפתחות API...</p>
              </div>
            ) : (
              <>
                <table className="tiktrack-table-dense" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--pico-border-color, #dee2e6)' }}>
                      <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600' }}>ספק</th>
                      <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600' }}>תווית</th>
                      <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600' }}>מפתח API</th>
                      <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600' }}>סטטוס</th>
                      <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600' }}>פעולות</th>
                    </tr>
                  </thead>
                  <tbody>
                    {apiKeys.length === 0 ? (
                      <tr>
                        <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--pico-muted-color)' }}>
                          אין מפתחות API מוגדרים
                        </td>
                      </tr>
                    ) : (
                      apiKeys.map((key) => (
                        <tr key={key.externalUlids} style={{ borderBottom: '1px solid var(--pico-border-color, #dee2e6)' }}>
                          <td style={{ padding: '0.75rem' }}>{key.provider || 'N/A'}</td>
                          <td style={{ padding: '0.75rem' }}>{key.providerLabel || 'ללא תווית'}</td>
                          <td style={{ padding: '0.75rem' }}>
                            <input
                              type="text"
                              value={key.maskedKey || '********************'}
                              readOnly
                              style={{
                                width: '100%',
                                padding: '0.25rem 0.5rem',
                                fontSize: '0.875rem',
                                fontFamily: 'monospace',
                                background: 'var(--pico-background-color, #f8f9fa)',
                                border: '1px solid var(--pico-border-color, #dee2e6)',
                                borderRadius: 'var(--pico-border-radius)',
                                color: 'var(--pico-muted-color)',
                                cursor: 'not-allowed'
                              }}
                            />
                          </td>
                          <td style={{ padding: '0.75rem' }}>
                            <span style={{ color: key.isActive ? 'var(--color-brand)' : 'var(--pico-muted-color)' }}>
                              {key.isActive ? 'פעיל' : 'לא פעיל'}
                            </span>
                            {key.isVerified !== undefined && (
                              <span style={{ display: 'block', fontSize: '0.75rem', color: key.isVerified ? 'var(--color-brand)' : 'var(--pico-muted-color)', marginTop: '0.25rem' }}>
                                {key.isVerified ? '✓ מאומת' : '✗ לא מאומת'}
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '0.75rem' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                              <button
                                type="button"
                                className="btn btn-sm"
                                onClick={() => {/* TODO: Open edit API key modal */}}
                                style={{
                                  padding: '0.25rem 0.75rem',
                                  fontSize: '0.875rem',
                                  background: 'transparent',
                                  color: 'var(--color-brand)',
                                  border: '1px solid var(--color-brand)',
                                  borderRadius: 'var(--pico-border-radius)',
                                  cursor: 'pointer'
                                }}
                              >
                                ערוך
                              </button>
                              <button
                                type="button"
                                className="btn btn-sm"
                                onClick={() => {/* TODO: Delete API key */}}
                                style={{
                                  padding: '0.25rem 0.75rem',
                                  fontSize: '0.875rem',
                                  background: 'transparent',
                                  color: '#dc3545',
                                  border: '1px solid #dc3545',
                                  borderRadius: 'var(--pico-border-radius)',
                                  cursor: 'pointer'
                                }}
                              >
                                מחק
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                  <button
                    type="button"
                    className="btn btn-sm"
                    onClick={() => {/* TODO: Open add API key modal */}}
                    style={{
                      padding: '0.5rem 1rem',
                      fontSize: '0.875rem',
                      background: 'var(--color-brand)',
                      color: 'white',
                      border: 'none',
                      borderRadius: 'var(--pico-border-radius)',
                      cursor: 'pointer'
                    }}
                  >
                    + מפתח API חדש
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Password Change Link */}
          <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--border-color, #C6C6C8)', textAlign: 'center' }}>
            <Link 
              to="/profile/password"
              className="btn-auth-primary"
              style={{ 
                display: 'inline-block',
                padding: '0.75rem 1.5rem',
                textDecoration: 'none',
                borderRadius: 'var(--pico-border-radius)',
                fontSize: '1rem',
                marginBottom: '1rem'
              }}
            >
              שינוי סיסמה
            </Link>
          </div>

          {/* Logout Button */}
          <div style={{ marginTop: '1rem', textAlign: 'center' }}>
            <button
              type="button"
              onClick={handleLogout}
              className="secondary"
              style={{ 
                padding: '0.75rem 1.5rem',
                fontSize: '1rem',
                background: 'var(--pico-secondary-background, #f4f4f4)',
                color: 'var(--pico-secondary-color, #666)',
                border: '1px solid var(--pico-border-color, #dee2e6)',
                borderRadius: 'var(--pico-border-radius)',
                cursor: 'pointer'
              }}
            >
              התנתק
            </button>
          </div>

          {/* Navigation Links */}
          <div className="auth-footer-zone" style={{ marginTop: '2rem', textAlign: 'center' }}>
            <Link to="/" className="auth-link js-back-to-home-link">
              חזרה לעמוד הבית
            </Link>
          </div>
        </tt-section>
      </tt-container>
    </div>
  );
};

export default ProfileView;
