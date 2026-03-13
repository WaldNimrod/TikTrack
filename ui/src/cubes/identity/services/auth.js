/**
 * Auth Service - Authentication & User Management
 * -----------------------------------------------
 * SSOT: All auth flows go through Shared_Services (Option B - No Exceptions)
 *
 * @description מנהל את כל תהליכי האימות (login, register, logout, refresh token)
 * @legacyReference Legacy.auth.login(), Legacy.auth.register()
 * @mandate TEAM_10_TO_TEAM_30_AUTH_UNIFIED_SHARED_SERVICES_MANDATE.md
 */

import { apiToReact, reactToApi } from '../../shared/utils/transformers.js';
import { audit } from '../../../utils/audit.js';
import { debugLog, debugError } from '../../../utils/debug.js';
import sharedServices from '../../../components/core/sharedServices.js';

/** Fetch options for auth endpoints - credentials required for refresh token (httpOnly cookies) */
const AUTH_CREDENTIALS = { credentials: 'include' };

/** G7R Batch5: Pre-expiry window in seconds — refresh permitted ONLY when exp - now <= REFRESH_WINDOW_SEC */
const REFRESH_WINDOW_SEC = 300;

/**
 * Ensure Shared_Services is initialized before auth calls
 * @returns {Promise<void>}
 */
async function ensureInit() {
  await sharedServices.init();
}

/**
 * Extract and normalize auth response - handles both wrapped and direct formats
 * SSOT: apiToReact yields accessToken (camelCase); we store as access_token in localStorage
 * @param {Object} raw - Raw API response
 * @returns {Object} Normalized camelCase auth data
 */
function normalizeAuthResponse(raw) {
  const payload = raw?.data ?? raw;
  return apiToReact(payload || {});
}

/**
 * Request with 401 handling — G7R §3E: NO refresh on 401, immediate logout
 * @param {Function} requestFn - Async function that makes the request
 * @returns {Promise<Object>} Response
 */
async function requestWithRefresh(requestFn) {
  try {
    return await requestFn();
  } catch (error) {
    if (error?.status === 401 || error?.code === 'HTTP_401') {
      authService.handle401Logout();
      throw error;
    }
    throw error;
  }
}

/**
 * Auth Service Object - All endpoints via Shared_Services
 */
const authService = {
  /**
   * Login - התחברות משתמש
   */
  async login(usernameOrEmail, password) {
    audit.log('Auth', 'Login attempt started', { usernameOrEmail });

    try {
      await ensureInit();
      const payload = reactToApi({ usernameOrEmail, password });
      debugLog('Auth', 'Login payload prepared', payload);

      const raw = await sharedServices.post(
        '/auth/login',
        payload,
        AUTH_CREDENTIALS,
      );
      const loginData = normalizeAuthResponse(raw);

      if (loginData.accessToken) {
        localStorage.setItem('access_token', loginData.accessToken);
        this.startProactiveRefreshScheduler();
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('auth:login'));
        }
      }

      audit.log('Auth', 'Login successful', {
        userId: loginData.user?.externalUlids,
      });
      return loginData;
    } catch (error) {
      audit.error('Auth', 'Login failure', error);
      throw error;
    }
  },

  /**
   * Register - הרשמת משתמש חדש
   */
  async register(userData) {
    audit.log('Auth', 'Register attempt started', { email: userData.email });

    try {
      await ensureInit();
      const payload = reactToApi(userData);
      debugLog('Auth', 'Register payload prepared', payload);

      const raw = await sharedServices.post(
        '/auth/register',
        payload,
        AUTH_CREDENTIALS,
      );
      const registerData = normalizeAuthResponse(raw);

      if (registerData.accessToken) {
        localStorage.setItem('access_token', registerData.accessToken);
        this.startProactiveRefreshScheduler();
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('auth:login'));
        }
      }

      audit.log('Auth', 'Register successful', {
        userId: registerData.user?.externalUlids,
      });
      return registerData;
    } catch (error) {
      audit.error('Auth', 'Register failure', error);
      throw error;
    }
  },

  /**
   * G7R Batch5: Check if token is inside 5-min pre-expiry window.
   * Returns true ONLY when: token exists AND exp - now <= 300 AND exp > now (not expired).
   */
  isInsideRefreshWindow() {
    const token =
      localStorage.getItem('access_token') ||
      localStorage.getItem('auth_token');
    if (!token || token.trim() === '') return false;
    try {
      const parts = token.split('.');
      if (parts.length < 2) return false;
      const payload = JSON.parse(atob(parts[1]));
      const exp = payload.exp;
      if (!exp || typeof exp !== 'number') return false;
      const now = Date.now() / 1000;
      if (exp <= now) return false; // Expired — do NOT refresh
      if (exp - now > REFRESH_WINDOW_SEC) return false; // Outside window
      return true; // Inside 5-min window
    } catch {
      return false;
    }
  },

  /**
   * Refresh Token - רענון access token
   * G7R Batch5: Refresh permitted ONLY inside 5-min pre-expiry window.
   */
  async refreshToken() {
    if (!this.isInsideRefreshWindow()) {
      audit.log('Auth', 'Refresh rejected — outside 5-min pre-expiry window');
      throw new Error('Refresh only permitted within 5-min pre-expiry window');
    }
    audit.log('Auth', 'Token refresh started');

    try {
      await ensureInit();
      const raw = await sharedServices.post(
        '/auth/refresh',
        {},
        AUTH_CREDENTIALS,
      );
      const refreshData = normalizeAuthResponse(raw);

      if (refreshData.accessToken) {
        localStorage.setItem('access_token', refreshData.accessToken);
        sharedServices.setToken(refreshData.accessToken);
      }

      audit.log('Auth', 'Token refresh successful');
      return refreshData;
    } catch (error) {
      audit.error('Auth', 'Token refresh failure', error);
      throw error;
    }
  },

  /**
   * Logout - התנתקות משתמש
   */
  async logout() {
    audit.log('Auth', 'Logout started');

    try {
      await ensureInit();
      await sharedServices.post('/auth/logout', {}, AUTH_CREDENTIALS);
    } catch (error) {
      audit.error('Auth', 'Logout API error (clearing storage anyway)', error);
    } finally {
      this.stopProactiveRefreshScheduler();
      localStorage.removeItem('access_token');
      localStorage.removeItem('auth_token');
      sessionStorage.removeItem('access_token');
      sessionStorage.removeItem('auth_token');
      audit.log('Auth', 'Logout successful');
    }
  },

  /**
   * Request Password Reset
   */
  async requestPasswordReset(method, identifier) {
    audit.log('Auth', 'Password reset request started', { method, identifier });

    try {
      await ensureInit();
      const payload = reactToApi({
        method,
        ...(method === 'EMAIL'
          ? { email: identifier }
          : { phoneNumber: identifier }),
      });
      debugLog('Auth', 'Password reset payload prepared', payload);

      const raw = await sharedServices.post(
        '/auth/reset-password',
        payload,
        AUTH_CREDENTIALS,
      );
      audit.log('Auth', 'Password reset request successful');
      return raw?.data ?? raw ?? {};
    } catch (error) {
      audit.error('Auth', 'Password reset request failure', error);
      throw error;
    }
  },

  /**
   * Verify Password Reset
   */
  async verifyPasswordReset(resetData) {
    audit.log('Auth', 'Password reset verify started');

    try {
      await ensureInit();
      const payload = reactToApi(resetData);
      debugLog('Auth', 'Password reset verify payload prepared', payload);

      const raw = await sharedServices.post(
        '/auth/verify-reset',
        payload,
        AUTH_CREDENTIALS,
      );
      audit.log('Auth', 'Password reset verify successful');
      return raw?.data ?? raw;
    } catch (error) {
      audit.error('Auth', 'Password reset verify failure', error);
      throw error;
    }
  },

  /**
   * Verify Phone
   */
  async verifyPhone(verificationCode) {
    audit.log('Auth', 'Phone verification started');

    try {
      await ensureInit();
      const payload = reactToApi({ verificationCode });
      debugLog('Auth', 'Phone verification payload prepared', payload);

      const raw = await sharedServices.post(
        '/auth/verify-phone',
        payload,
        AUTH_CREDENTIALS,
      );
      audit.log('Auth', 'Phone verification successful');
      return normalizeAuthResponse(raw);
    } catch (error) {
      audit.error('Auth', 'Phone verification failure', error);
      throw error;
    }
  },

  /**
   * Get Current User - עם retry על 401 (refresh)
   */
  async getCurrentUser() {
    audit.log('Auth', 'Get current user started');

    return requestWithRefresh(async () => {
      await ensureInit();
      const raw = await sharedServices.get('/users/me', {}, {});
      const data = raw?.data ?? raw;
      const userData =
        typeof data === 'object' && data !== null ? apiToReact(data) : data;

      audit.log('Auth', 'Get current user successful', {
        userId: userData?.externalUlids,
      });
      return userData;
    });
  },

  getUserRole() {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return null;
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.role || null;
      } catch (e) {
        debugError('Auth', 'Error decoding JWT token', e);
        return null;
      }
    } catch (error) {
      debugError('Auth', 'Error getting user role', error);
      return null;
    }
  },

  isAdmin() {
    const role = this.getUserRole();
    return role === 'ADMIN' || role === 'SUPERADMIN';
  },

  /**
   * Update User - עם retry על 401
   */
  async updateUser(userData) {
    audit.log('Auth', 'Update user started', {
      userId: userData.externalUlids,
    });

    return requestWithRefresh(async () => {
      await ensureInit();
      const payload = reactToApi(userData);
      debugLog('Auth', 'Update user payload prepared', payload);

      const raw = await sharedServices.put('/users/me', payload, {});
      const data = raw?.data ?? raw;
      const updatedUser =
        typeof data === 'object' && data !== null ? apiToReact(data) : data;

      audit.log('Auth', 'Update user successful', {
        userId: updatedUser?.externalUlids,
      });
      return updatedUser;
    });
  },

  /**
   * Change Password - עם retry על 401
   */
  async changePassword(passwordData) {
    audit.log('Auth', 'Change password started');

    return requestWithRefresh(async () => {
      await ensureInit();
      debugLog('Auth', 'Change password payload prepared', passwordData);

      const raw = await sharedServices.put(
        '/users/me/password',
        reactToApi(passwordData),
        {},
      );
      audit.log('Auth', 'Change password successful');
      return raw?.data ?? raw;
    });
  },

  async resendEmailVerification() {
    audit.log('Auth', 'Resend email verification started');
    try {
      const userData = await this.getCurrentUser();
      await ensureInit();
      await sharedServices.post(
        '/auth/reset-password',
        reactToApi({ email: userData.email, method: 'EMAIL' }),
        AUTH_CREDENTIALS,
      );
      audit.log('Auth', 'Resend email verification successful');
      return {};
    } catch (error) {
      audit.error('Auth', 'Resend email verification failure', error);
      throw error;
    }
  },

  async resendPhoneVerification() {
    audit.log('Auth', 'Resend phone verification started');
    try {
      const userData = await this.getCurrentUser();
      // API returns phone_numbers (string); apiToReact → phoneNumbers
      const phoneNumber = userData?.phoneNumbers ?? userData?.phoneNumber;
      if (!phoneNumber) throw new Error('לא נמצא מספר טלפון במערכת');

      await ensureInit();
      await sharedServices.post(
        '/auth/reset-password',
        reactToApi({ phoneNumber, method: 'SMS' }),
        AUTH_CREDENTIALS,
      );
      audit.log('Auth', 'Resend phone verification successful');
      return {};
    } catch (error) {
      audit.error('Auth', 'Resend phone verification failure', error);
      throw error;
    }
  },

  isAuthenticated() {
    return !!localStorage.getItem('access_token');
  },

  getAccessToken() {
    return localStorage.getItem('access_token');
  },

  /** G7R §3E: Handle 401 — immediate logout, redirect, preserve usernameOrEmail only */
  handle401Logout() {
    this.stopProactiveRefreshScheduler();
    const usernameOrEmail = localStorage.getItem('usernameOrEmail');
    localStorage.clear();
    sessionStorage.clear();
    if (usernameOrEmail)
      localStorage.setItem('usernameOrEmail', usernameOrEmail);
    window.dispatchEvent(new CustomEvent('auth:logout'));
    audit.log('Auth', '401 logout — redirecting to login');
    if (!window.location.pathname.startsWith('/login'))
      window.location.href = '/login';
  },

  /** G7R §3E: App boot — if token expired, clear auth and redirect */
  checkTokenExpiryOnBoot() {
    const token =
      localStorage.getItem('access_token') ||
      localStorage.getItem('auth_token');
    if (!token || token.trim() === '') return;
    try {
      const parts = token.split('.');
      if (parts.length < 2) return;
      const payload = JSON.parse(atob(parts[1]));
      const exp = payload.exp;
      if (exp && exp < Date.now() / 1000) {
        audit.log('Auth', 'Token expired on boot — clearing and redirecting');
        this.handle401Logout();
      }
    } catch {
      // Invalid token
    }
  },

  /** G7R Batch5: Proactive refresh scheduler — refresh ONLY inside 5-min window. Cleared on logout. */
  _refreshIntervalId: null,
  startProactiveRefreshScheduler() {
    if (this._refreshIntervalId) return;
    const CHECK_MS = 60 * 1000; // Check every 60 seconds
    this._refreshIntervalId = setInterval(async () => {
      if (!this.isInsideRefreshWindow()) return;
      try {
        await this.refreshToken();
        audit.log('Auth', 'Proactive refresh completed (within 5-min window)');
      } catch (err) {
        if (err?.message?.includes('outside 5-min')) return;
        audit.error('Auth', 'Proactive refresh failed', err);
      }
    }, CHECK_MS);
    audit.log('Auth', 'Proactive refresh scheduler started');
  },
  stopProactiveRefreshScheduler() {
    if (this._refreshIntervalId) {
      clearInterval(this._refreshIntervalId);
      this._refreshIntervalId = null;
    }
  },
};

export default authService;
