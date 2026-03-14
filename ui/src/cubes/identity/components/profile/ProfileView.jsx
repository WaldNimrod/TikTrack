/**
 * ProfileView - עמוד ניהול פרופיל משתמש (D15)
 * --------------------------------------------
 * עמוד ניהול פרופיל המשתמש המחובר
 *
 * @description תבנית V3 מבוססת על הבלופרינט המלא
 * Header נטען דינמית דרך headerLoader.js
 * @legacyReference Legacy.user.profile()
 * @blueprintSource _COMMUNICATION/team_31/team_31_staging/sandbox_v2/D15_PAGE_TEMPLATE_V3.html
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageFooter from '../../../../components/core/PageFooter.jsx';
import authService from '../../services/auth.js';
import apiKeysService from '../../services/apiKeys.js';
import { audit } from '../../../../utils/audit.js';
import { debugLog } from '../../../../utils/debug.js';

/**
 * ProfileView Component
 *
 * @description עמוד ניהול פרופיל עם 3 קונטיינרים לפי תבנית V3
 * @legacyReference Legacy.user.profile()
 */
const ProfileView = () => {
  const navigate = useNavigate();

  // User data state
  const [userData, setUserData] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  // Form state for user info
  const [userInfoForm, setUserInfoForm] = useState({
    username: '',
    email: '',
    phoneNumber: '',
    firstName: '',
    lastName: '',
    displayName: '',
  });

  // Form state for password change
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  // Form state for API keys
  const [apiKeysForm, setApiKeysForm] = useState({
    aiDefaultProvider: 'gemini',
    geminiApiKey: '',
    perplexityApiKey: '',
  });

  // UI state
  const [isUpdatingInfo, setIsUpdatingInfo] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isSavingApiKeys, setIsSavingApiKeys] = useState(false);
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showPerplexityKey, setShowPerplexityKey] = useState(false);
  const [phoneVerificationCode, setPhoneVerificationCode] = useState('');
  const [isVerifyingPhone, setIsVerifyingPhone] = useState(false);

  // Section toggle state
  const [openSections, setOpenSections] = useState({
    'section-0': true,
    'section-3': true,
  });

  // API Keys state
  const [apiKeys, setApiKeys] = useState([]);
  const [isLoadingApiKeys, setIsLoadingApiKeys] = useState(false);

  /**
   * Load User Data
   */
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setIsLoadingUser(true);
        const user = await authService.getCurrentUser();
        setUserData(user);
        // Populate form with user data (API: phone_numbers → phoneNumber via apiToReact)
        setUserInfoForm({
          username: user.username || '',
          email: user.email || '',
          phoneNumber: user.phoneNumber || user.phone_numbers || '',
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          displayName: user.displayName || '',
        });
        debugLog('ProfileView', 'User data loaded', {
          userId: user.externalUlids,
        });
      } catch (error) {
        audit.error('ProfileView', 'Failed to load user data', error);
        // Redirect to home if unauthorized (per ADR-013)
        if (error.response?.status === 401) {
          navigate('/');
        }
      } finally {
        setIsLoadingUser(false);
      }
    };

    loadUserData();
  }, [navigate]);

  /**
   * Load API Keys
   */
  useEffect(() => {
    const loadApiKeys = async () => {
      try {
        setIsLoadingApiKeys(true);
        const keys = await apiKeysService.list();
        setApiKeys(keys);
        debugLog('ProfileView', 'API keys loaded', { count: keys.length });
      } catch (error) {
        audit.error('ProfileView', 'Failed to load API keys', error);
      } finally {
        setIsLoadingApiKeys(false);
      }
    };

    loadApiKeys();
  }, []);

  /**
   * Handle Section Toggle
   */
  const handleSectionToggle = (sectionId) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  /**
   * Handle User Info Form Submit
   */
  const handleUserInfoSubmit = async (e) => {
    e.preventDefault();
    setIsUpdatingInfo(true);
    try {
      // Send only fields allowed by PUT /users/me (UserUpdate schema)
      const payload = {
        firstName: userInfoForm.firstName,
        lastName: userInfoForm.lastName,
        displayName: userInfoForm.displayName,
        phoneNumber: userInfoForm.phoneNumber || null,
      };
      await authService.updateUser(payload);
      debugLog('ProfileView', 'User info updated');
      // Reload user data
      const user = await authService.getCurrentUser();
      setUserData(user);
    } catch (error) {
      audit.error('ProfileView', 'Failed to update user info', error);
    } finally {
      setIsUpdatingInfo(false);
    }
  };

  /**
   * Handle Password Form Submit
   */
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      audit.error('ProfileView', 'Password mismatch');
      return;
    }
    setIsUpdatingPassword(true);
    try {
      await authService.changePassword({
        old_password: passwordForm.currentPassword,
        new_password: passwordForm.newPassword,
      });
      debugLog('ProfileView', 'Password updated');
      // Clear form
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      });
    } catch (error) {
      audit.error('ProfileView', 'Failed to update password', error);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  /**
   * Handle API Keys Form Submit
   */
  const handleApiKeysSubmit = async (e) => {
    e.preventDefault();
    setIsSavingApiKeys(true);
    try {
      // TODO: Implement API keys save when endpoint is available
      debugLog('ProfileView', 'API keys save requested');
    } catch (error) {
      audit.error('ProfileView', 'Failed to save API keys', error);
    } finally {
      setIsSavingApiKeys(false);
    }
  };

  /**
   * Handle Logout
   */
  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/');
      debugLog('ProfileView', 'User logged out');
    } catch (error) {
      audit.error('ProfileView', 'Logout error', error);
      // Navigate anyway
      navigate('/');
    }
  };

  if (isLoadingUser) {
    return (
      <>
        {/* Unified Header - Loaded dynamically via headerLoader.js */}
        {/* Header is injected at the beginning of <body> by headerLoader.js */}
        <div className="page-wrapper">
          <div className="page-container">
            <main data-context="settings">
              <tt-container>
                <tt-section>
                  <p>טוען...</p>
                </tt-section>
              </tt-container>
            </main>
          </div>
        </div>
        <PageFooter />
      </>
    );
  }

  return (
    <>
      {/* Unified Header - Loaded dynamically via headerLoader.js */}
      {/* Header is injected at the beginning of <body> by headerLoader.js */}

      {/* Page Wrapper: Full-width gray background (EXACT from login page) */}
      <div className="page-wrapper">
        {/* Page Container: Centered, max-width 1400px (EXACT from login page) */}
        <div className="page-container">
          {/* Main Content - Context: Settings (for entity colors) */}
          <main data-context="settings">
            <tt-container>
              {/* Container 0: מידע + כפתורים לעדכון סיסמה והתנתקות */}
              <tt-section data-section="section-0">
                {/* Section Header */}
                <div className="index-section__header">
                  <div className="index-section__header-title">
                    <img
                      src="/images/icons/entities/user.svg"
                      alt="מידע"
                      className="index-section__header-icon"
                      width="35"
                      height="35"
                    />
                    <h1 className="index-section__header-text">מידע</h1>
                  </div>
                  <div className="index-section__header-meta">
                    <span className="index-section__header-count">
                      מידע אישי וסטטוס אימות
                    </span>
                  </div>
                  <div className="index-section__header-actions">
                    <button
                      className="index-section__header-toggle-btn js-section-toggle"
                      aria-label="הצג/הסתר"
                      onClick={() => handleSectionToggle('section-0')}
                      aria-expanded={openSections['section-0']}
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M6 9l6 6l6 -6"></path>
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Section Body */}
                {openSections['section-0'] && (
                  <div className="index-section__body">
                    <tt-section-row>
                      {/* User Info Card */}
                      <div className="col-md-6">
                        <div className="card h-100">
                          <div className="card-header bg-light">
                            <h6 className="mb-0 text-muted">פרטי משתמש</h6>
                          </div>
                          <div className="card-body">
                            <form
                              id="userInfoForm"
                              onSubmit={handleUserInfoSubmit}
                            >
                              <div className="row g-3">
                                <div className="col-12">
                                  <label
                                    className="form-label"
                                    htmlFor="profileUsername"
                                  >
                                    שם משתמש
                                  </label>
                                  <input
                                    type="text"
                                    id="profileUsername"
                                    className="form-control"
                                    readOnly
                                    value={userInfoForm.username}
                                  />
                                </div>
                                <div className="col-12">
                                  <label
                                    className="form-label form-label-with-verify"
                                    htmlFor="profileEmail"
                                  >
                                    אימייל
                                    {userData && (
                                      <span
                                        className={`profile-verify-icon ${userData.isEmailVerified ? 'profile-verify-icon--verified' : 'profile-verify-icon--not-verified'}`}
                                        title={
                                          userData.isEmailVerified
                                            ? 'מאומת'
                                            : 'לא מאומת'
                                        }
                                      >
                                        {userData.isEmailVerified ? (
                                          <svg
                                            width="14"
                                            height="14"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                          >
                                            <path d="M20 6L9 17l-5-5" />
                                          </svg>
                                        ) : (
                                          <svg
                                            width="14"
                                            height="14"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                          >
                                            <circle cx="12" cy="12" r="10" />
                                            <path d="M12 8v4M12 16h.01" />
                                          </svg>
                                        )}
                                      </span>
                                    )}
                                  </label>
                                  <input
                                    type="email"
                                    id="profileEmail"
                                    className="form-control dir-ltr"
                                    placeholder="הכנס כתובת אימייל"
                                    readOnly
                                    dir="ltr"
                                    value={userInfoForm.email}
                                  />
                                  <small className="form-text text-muted">
                                    אימייל לא ניתן לשינוי מכאן
                                  </small>
                                  {userData && !userData.isEmailVerified && (
                                    <div className="profile-verify-row">
                                      <button
                                        type="button"
                                        className="btn btn-sm btn-outline-secondary"
                                        onClick={async () => {
                                          try {
                                            await authService.resendEmailVerification();
                                            audit.log(
                                              'ProfileView',
                                              'Email verification sent',
                                            );
                                          } catch (e) {
                                            audit.error(
                                              'ProfileView',
                                              'Resend email failed',
                                              e,
                                            );
                                          }
                                        }}
                                      >
                                        שלח אימות
                                      </button>
                                    </div>
                                  )}
                                </div>
                                <div className="col-12">
                                  <label
                                    className="form-label form-label-with-verify"
                                    htmlFor="profilePhone"
                                  >
                                    טלפון
                                    {userData &&
                                      (userData.phoneNumbers ||
                                        userData.phoneNumber) && (
                                        <span
                                          className={`profile-verify-icon ${userData.phoneVerified ? 'profile-verify-icon--verified' : 'profile-verify-icon--not-verified'}`}
                                          title={
                                            userData.phoneVerified
                                              ? 'מאומת'
                                              : 'לא מאומת'
                                          }
                                        >
                                          {userData.phoneVerified ? (
                                            <svg
                                              width="14"
                                              height="14"
                                              viewBox="0 0 24 24"
                                              fill="none"
                                              stroke="currentColor"
                                              strokeWidth="2"
                                            >
                                              <path d="M20 6L9 17l-5-5" />
                                            </svg>
                                          ) : (
                                            <svg
                                              width="14"
                                              height="14"
                                              viewBox="0 0 24 24"
                                              fill="none"
                                              stroke="currentColor"
                                              strokeWidth="2"
                                            >
                                              <circle cx="12" cy="12" r="10" />
                                              <path d="M12 8v4M12 16h.01" />
                                            </svg>
                                          )}
                                        </span>
                                      )}
                                  </label>
                                  <input
                                    type="tel"
                                    id="profilePhone"
                                    className="form-control dir-ltr"
                                    placeholder="+972501234567"
                                    dir="ltr"
                                    value={userInfoForm.phoneNumber}
                                    onChange={(e) =>
                                      setUserInfoForm({
                                        ...userInfoForm,
                                        phoneNumber: e.target.value,
                                      })
                                    }
                                  />
                                  <small className="form-text text-muted dir-ltr">
                                    פורמט E.164 (למשל +972501234567)
                                  </small>
                                  {userData &&
                                    (userData.phoneNumbers ||
                                      userData.phoneNumber) &&
                                    !userData.phoneVerified && (
                                      <div className="profile-verify-row">
                                        <div className="d-flex align-items-center gap-2 flex-wrap">
                                          <button
                                            type="button"
                                            className="btn btn-sm btn-outline-secondary"
                                            onClick={async () => {
                                              try {
                                                await authService.resendPhoneVerification();
                                                audit.log(
                                                  'ProfileView',
                                                  'Phone verification code sent',
                                                );
                                              } catch (e) {
                                                audit.error(
                                                  'ProfileView',
                                                  'Resend phone verification failed',
                                                  e,
                                                );
                                              }
                                            }}
                                          >
                                            שלח קוד
                                          </button>
                                          <input
                                            type="text"
                                            className="form-control form-control-sm profile-verify-code-input dir-ltr"
                                            placeholder="קוד 6 ספרות"
                                            maxLength={6}
                                            value={phoneVerificationCode}
                                            onChange={(e) =>
                                              setPhoneVerificationCode(
                                                e.target.value.replace(
                                                  /\D/g,
                                                  '',
                                                ),
                                              )
                                            }
                                          />
                                          <button
                                            type="button"
                                            className="btn btn-sm btn-primary"
                                            disabled={
                                              phoneVerificationCode.length !==
                                                6 || isVerifyingPhone
                                            }
                                            onClick={async () => {
                                              if (
                                                phoneVerificationCode.length !==
                                                6
                                              )
                                                return;
                                              setIsVerifyingPhone(true);
                                              try {
                                                await authService.verifyPhone(
                                                  phoneVerificationCode,
                                                );
                                                setPhoneVerificationCode('');
                                                const u =
                                                  await authService.getCurrentUser();
                                                setUserData(u);
                                              } catch (e) {
                                                audit.error(
                                                  'ProfileView',
                                                  'Phone verification failed',
                                                  e,
                                                );
                                              } finally {
                                                setIsVerifyingPhone(false);
                                              }
                                            }}
                                          >
                                            {isVerifyingPhone
                                              ? 'מאמת...'
                                              : 'אימות'}
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                </div>
                                <div className="col-md-6">
                                  <label
                                    className="form-label"
                                    htmlFor="profileFirstName"
                                  >
                                    שם פרטי
                                  </label>
                                  <input
                                    type="text"
                                    id="profileFirstName"
                                    className="form-control"
                                    placeholder="הכנס שם פרטי"
                                    value={userInfoForm.firstName}
                                    onChange={(e) =>
                                      setUserInfoForm({
                                        ...userInfoForm,
                                        firstName: e.target.value,
                                      })
                                    }
                                  />
                                </div>
                                <div className="col-md-6">
                                  <label
                                    className="form-label"
                                    htmlFor="profileLastName"
                                  >
                                    שם משפחה
                                  </label>
                                  <input
                                    type="text"
                                    id="profileLastName"
                                    className="form-control"
                                    placeholder="הכנס שם משפחה"
                                    value={userInfoForm.lastName}
                                    onChange={(e) =>
                                      setUserInfoForm({
                                        ...userInfoForm,
                                        lastName: e.target.value,
                                      })
                                    }
                                  />
                                </div>
                                <div className="col-12">
                                  <label
                                    className="form-label"
                                    htmlFor="profileDisplayName"
                                  >
                                    שם תצוגה
                                  </label>
                                  <input
                                    type="text"
                                    id="profileDisplayName"
                                    className="form-control"
                                    placeholder="שם שיוצג במערכת"
                                    value={userInfoForm.displayName}
                                    onChange={(e) =>
                                      setUserInfoForm({
                                        ...userInfoForm,
                                        displayName: e.target.value,
                                      })
                                    }
                                  />
                                </div>
                                <div className="col-12">
                                  <div className="d-flex justify-content-end">
                                    <button
                                      type="submit"
                                      className="btn btn-primary"
                                      id="updateInfoBtn"
                                      disabled={isUpdatingInfo}
                                    >
                                      <span id="updateInfoBtnText">
                                        {isUpdatingInfo
                                          ? 'מעדכן...'
                                          : 'עדכן פרטים'}
                                      </span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </form>
                          </div>
                        </div>
                      </div>

                      {/* Password Change Card */}
                      <div className="col-md-6">
                        <div className="card h-100">
                          <div className="card-header bg-light">
                            <h6 className="mb-0 text-muted">שינוי סיסמה</h6>
                          </div>
                          <div className="card-body">
                            <form
                              id="passwordForm"
                              onSubmit={handlePasswordSubmit}
                            >
                              <div className="row g-3">
                                <div className="col-12">
                                  <label
                                    className="form-label"
                                    htmlFor="currentPassword"
                                  >
                                    סיסמה נוכחית
                                  </label>
                                  <input
                                    type="password"
                                    id="currentPassword"
                                    className="form-control"
                                    placeholder="הכנס סיסמה נוכחית"
                                    required
                                    value={passwordForm.currentPassword}
                                    onChange={(e) =>
                                      setPasswordForm({
                                        ...passwordForm,
                                        currentPassword: e.target.value,
                                      })
                                    }
                                  />
                                </div>
                                <div className="col-12">
                                  <label
                                    className="form-label"
                                    htmlFor="newPassword"
                                  >
                                    סיסמה חדשה
                                  </label>
                                  <input
                                    type="password"
                                    id="newPassword"
                                    className="form-control"
                                    placeholder="הכנס סיסמה חדשה (מינימום 6 תווים)"
                                    required
                                    minLength="6"
                                    value={passwordForm.newPassword}
                                    onChange={(e) =>
                                      setPasswordForm({
                                        ...passwordForm,
                                        newPassword: e.target.value,
                                      })
                                    }
                                  />
                                </div>
                                <div className="col-12">
                                  <label
                                    className="form-label"
                                    htmlFor="confirmNewPassword"
                                  >
                                    אימות סיסמה חדשה
                                  </label>
                                  <input
                                    type="password"
                                    id="confirmNewPassword"
                                    className="form-control"
                                    placeholder="אמת סיסמה חדשה"
                                    required
                                    minLength="6"
                                    value={passwordForm.confirmNewPassword}
                                    onChange={(e) =>
                                      setPasswordForm({
                                        ...passwordForm,
                                        confirmNewPassword: e.target.value,
                                      })
                                    }
                                  />
                                </div>
                                <div className="col-12">
                                  <div className="d-flex justify-content-end">
                                    <button
                                      type="submit"
                                      className="btn btn-warning"
                                      id="updatePasswordBtn"
                                      disabled={isUpdatingPassword}
                                    >
                                      <span id="updatePasswordBtnText">
                                        {isUpdatingPassword
                                          ? 'מעדכן...'
                                          : 'עדכן סיסמה'}
                                      </span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </form>
                          </div>
                        </div>
                      </div>
                    </tt-section-row>

                    {/* Action Buttons Row */}
                    <tt-section-row>
                      <div className="col-12">
                        <div className="d-flex justify-content-end action-buttons-row">
                          <button
                            type="button"
                            className="btn btn-primary btn-logout"
                            onClick={handleLogout}
                          >
                            התנתק
                          </button>
                        </div>
                      </div>
                    </tt-section-row>
                  </div>
                )}
              </tt-section>

              {/* Container 3: מפתחות API */}
              <tt-section data-section="section-3">
                {/* Section Header */}
                <div className="index-section__header">
                  <div className="index-section__header-title">
                    <img
                      src="/images/icons/entities/trading_accounts.svg"
                      alt="מפתחות API"
                      className="index-section__header-icon"
                      width="35"
                      height="35"
                    />
                    <h2 className="index-section__header-text">מפתחות API</h2>
                  </div>
                  <div className="index-section__header-meta">
                    <span className="index-section__header-count">
                      ניהול מפתחות API לחיבורים חיצוניים
                    </span>
                  </div>
                  <div className="index-section__header-actions">
                    <button
                      className="index-section__header-toggle-btn js-section-toggle"
                      aria-label="הצג/הסתר"
                      onClick={() => handleSectionToggle('section-3')}
                      aria-expanded={openSections['section-3']}
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M6 9l6 6l6 -6"></path>
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Section Body */}
                {openSections['section-3'] && (
                  <div className="index-section__body">
                    <tt-section-row>
                      <div className="col-12">
                        <div className="card">
                          <div className="card-body">
                            <form
                              id="aiAnalysisSettingsForm"
                              onSubmit={handleApiKeysSubmit}
                            >
                              <div className="row g-3">
                                {/* Column 1: Controls */}
                                <div className="col-md-6">
                                  <label
                                    className="form-label"
                                    htmlFor="aiDefaultProvider"
                                  >
                                    מנוע AI ברירת מחדל
                                  </label>
                                  <select
                                    id="aiDefaultProvider"
                                    className="form-select"
                                    required
                                    value={apiKeysForm.aiDefaultProvider}
                                    onChange={(e) =>
                                      setApiKeysForm({
                                        ...apiKeysForm,
                                        aiDefaultProvider: e.target.value,
                                      })
                                    }
                                  >
                                    <option value="gemini">
                                      Gemini (מומלץ למתחילים)
                                    </option>
                                    <option value="perplexity">
                                      Perplexity
                                    </option>
                                  </select>
                                  <small className="form-text text-muted">
                                    בחר מנוע AI שישמש כברירת מחדל לניתוחים
                                  </small>

                                  {/* Gemini API Key */}
                                  <div className="mt-3">
                                    <label
                                      className="form-label"
                                      htmlFor="geminiApiKey"
                                    >
                                      Gemini API Key
                                    </label>
                                    <div className="input-group">
                                      <input
                                        type={
                                          showGeminiKey ? 'text' : 'password'
                                        }
                                        id="geminiApiKey"
                                        className="form-control"
                                        placeholder="הכנס Gemini API Key"
                                        value={apiKeysForm.geminiApiKey}
                                        onChange={(e) =>
                                          setApiKeysForm({
                                            ...apiKeysForm,
                                            geminiApiKey: e.target.value,
                                          })
                                        }
                                      />
                                      <button
                                        className="btn btn-outline-secondary"
                                        type="button"
                                        id="toggleGeminiKeyBtn"
                                        title="הצג/הסתר מפתח"
                                        onClick={() =>
                                          setShowGeminiKey(!showGeminiKey)
                                        }
                                      >
                                        <span id="toggleGeminiKeyIcon">
                                          {showGeminiKey ? '👁️' : '👁️‍🗨️'}
                                        </span>
                                      </button>
                                    </div>
                                    <small className="form-text text-muted">
                                      המפתח יישמר מוצפן במסד הנתונים
                                    </small>

                                    <div className="d-flex align-items-center gap-2 mt-2">
                                      <div
                                        id="geminiKeyStatus"
                                        className="status-display flex-grow-1"
                                      ></div>
                                      <button
                                        type="button"
                                        className="btn btn-secondary btn-sm"
                                        id="validateGeminiBtn"
                                      >
                                        <span id="validateGeminiBtnText">
                                          בדוק
                                        </span>
                                      </button>
                                    </div>
                                  </div>

                                  {/* Perplexity API Key */}
                                  <div className="mt-3">
                                    <label
                                      className="form-label"
                                      htmlFor="perplexityApiKey"
                                    >
                                      Perplexity API Key
                                    </label>
                                    <div className="input-group">
                                      <input
                                        type={
                                          showPerplexityKey
                                            ? 'text'
                                            : 'password'
                                        }
                                        id="perplexityApiKey"
                                        className="form-control"
                                        placeholder="הכנס Perplexity API Key"
                                        value={apiKeysForm.perplexityApiKey}
                                        onChange={(e) =>
                                          setApiKeysForm({
                                            ...apiKeysForm,
                                            perplexityApiKey: e.target.value,
                                          })
                                        }
                                      />
                                      <button
                                        className="btn btn-outline-secondary"
                                        type="button"
                                        id="togglePerplexityKeyBtn"
                                        title="הצג/הסתר מפתח"
                                        onClick={() =>
                                          setShowPerplexityKey(
                                            !showPerplexityKey,
                                          )
                                        }
                                      >
                                        <span id="togglePerplexityKeyIcon">
                                          {showPerplexityKey ? '👁️' : '👁️‍🗨️'}
                                        </span>
                                      </button>
                                    </div>
                                    <small className="form-text text-muted">
                                      המפתח יישמר מוצפן במסד הנתונים
                                    </small>

                                    <div className="d-flex align-items-center gap-2 mt-2">
                                      <div
                                        id="perplexityKeyStatus"
                                        className="status-display flex-grow-1"
                                      ></div>
                                      <button
                                        type="button"
                                        className="btn btn-secondary btn-sm"
                                        id="validatePerplexityBtn"
                                      >
                                        <span id="validatePerplexityBtnText">
                                          בדוק
                                        </span>
                                      </button>
                                    </div>
                                  </div>
                                </div>

                                {/* Column 2: Help Panel */}
                                <div className="col-md-6">
                                  <label className="form-label">
                                    איפה להשיג מפתח API?
                                  </label>
                                  <div className="alert alert-info mb-0">
                                    <div className="mb-2">
                                      <strong>Gemini:</strong>
                                      <br />
                                      <small>
                                        1. עבור ל-
                                        <a
                                          href="https://aistudio.google.com/"
                                          target="_blank"
                                          className="alert-link"
                                          rel="noopener noreferrer"
                                        >
                                          Google AI Studio
                                        </a>
                                        <br />
                                        2. לחץ על "Get API Key"
                                        <br />
                                        3. העתק את המפתח
                                      </small>
                                    </div>
                                    <div>
                                      <strong>Perplexity:</strong>
                                      <br />
                                      <small>
                                        1. עבור ל-
                                        <a
                                          href="https://www.perplexity.ai/api"
                                          target="_blank"
                                          className="alert-link"
                                          rel="noopener noreferrer"
                                        >
                                          Perplexity API
                                        </a>
                                        <br />
                                        2. התחבר או צור חשבון
                                        <br />
                                        3. עבור ל-"API Keys"
                                        <br />
                                        4. לחץ על "Create API Key"
                                        <br />
                                        5. העתק את המפתח
                                      </small>
                                    </div>
                                  </div>
                                </div>

                                <div className="col-12">
                                  <div className="d-flex justify-content-end">
                                    <button
                                      type="submit"
                                      className="btn btn-success"
                                      id="saveAiAnalysisBtn"
                                      disabled={isSavingApiKeys}
                                    >
                                      <span id="saveAiAnalysisBtnText">
                                        {isSavingApiKeys
                                          ? 'שומר...'
                                          : 'שמור הגדרות'}
                                      </span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </form>
                          </div>
                        </div>
                      </div>
                    </tt-section-row>
                  </div>
                )}
              </tt-section>
            </tt-container>
          </main>
        </div>
      </div>

      {/* Modular Footer */}
      <PageFooter />
    </>
  );
};

export default ProfileView;
