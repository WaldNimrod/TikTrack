/**
 * Auth Service - Authentication & User Management
 * -----------------------------------------------
 * שירות לניהול אימות משתמשים ותקשורת עם Backend API
 * 
 * @description מנהל את כל תהליכי האימות (login, register, logout, refresh token)
 * @legacyReference Legacy.auth.login(), Legacy.auth.register()
 */

import axios from 'axios';
import { apiToReact, reactToApi } from '../utils/transformers.js';
import { audit } from '../utils/audit.js';
import { debugLog, debugError } from '../utils/debug.js';

// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8082/api/v1';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for httpOnly cookies (refresh token)
});

// Request interceptor - Add access token to requests
apiClient.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle token refresh on 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retrying, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        audit.log('Auth', 'Token expired, attempting refresh');
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const { access_token } = apiToReact(refreshResponse.data);
        localStorage.setItem('access_token', access_token);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed - logout user
        audit.error('Auth', 'Token refresh failed', refreshError);
        localStorage.removeItem('access_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Auth Service Object
 */
const authService = {
  /**
   * Login - התחברות משתמש
   * 
   * @description מבצע התחברות משתמש עם username/email ו-password
   * @legacyReference Legacy.auth.login(username, password)
   * 
   * @param {string} usernameOrEmail - שם משתמש או אימייל
   * @param {string} password - סיסמה
   * @returns {Promise<Object>} - LoginResponse עם accessToken ו-user data (camelCase)
   * 
   * @example
   * const response = await authService.login('user@example.com', 'password123');
   * // Returns: { accessToken: "...", user: {...} }
   * 
   * @throws {Error} - אם האימות נכשל (401)
   */
  async login(usernameOrEmail, password) {
    audit.log('Auth', 'Login attempt started', { usernameOrEmail });

    try {
      // Transform to API format (snake_case)
      const payload = reactToApi({
        usernameOrEmail,
        password,
      });

      debugLog('Auth', 'Login payload prepared', payload);

      const response = await apiClient.post('/auth/login', payload);

      // Transform response to React format (camelCase)
      const loginData = apiToReact(response.data);
      
      // Store access token
      if (loginData.accessToken) {
        localStorage.setItem('access_token', loginData.accessToken);
      }

      audit.log('Auth', 'Login successful', { userId: loginData.user?.externalUlids });
      
      return loginData;
    } catch (error) {
      audit.error('Auth', 'Login failure', error);
      throw error;
    }
  },

  /**
   * Register - הרשמת משתמש חדש
   * 
   * @description מבצע הרשמה של משתמש חדש
   * @legacyReference Legacy.auth.register(userData)
   * 
   * @param {Object} userData - נתוני המשתמש (camelCase)
   * @param {string} userData.username - שם משתמש
   * @param {string} userData.email - אימייל
   * @param {string} userData.password - סיסמה
   * @param {string} [userData.phoneNumber] - מספר טלפון (אופציונלי)
   * @returns {Promise<Object>} - RegisterResponse עם accessToken ו-user data (camelCase)
   * 
   * @throws {Error} - אם ההרשמה נכשלה (400, 409)
   */
  async register(userData) {
    audit.log('Auth', 'Register attempt started', { email: userData.email });

    try {
      // Transform to API format (snake_case)
      const payload = reactToApi(userData);

      debugLog('Auth', 'Register payload prepared', payload);

      const response = await apiClient.post('/auth/register', payload);

      // Transform response to React format (camelCase)
      const registerData = apiToReact(response.data);
      
      // Store access token
      if (registerData.accessToken) {
        localStorage.setItem('access_token', registerData.accessToken);
      }

      audit.log('Auth', 'Register successful', { userId: registerData.user?.externalUlids });
      
      return registerData;
    } catch (error) {
      audit.error('Auth', 'Register failure', error);
      throw error;
    }
  },

  /**
   * Refresh Token - רענון access token
   * 
   * @description מרענן את ה-access token באמצעות refresh token מה-cookie
   * @legacyReference Legacy.auth.refreshToken()
   * 
   * @returns {Promise<Object>} - RefreshResponse עם accessToken חדש (camelCase)
   * 
   * @throws {Error} - אם ה-refresh token לא תקין (401)
   */
  async refreshToken() {
    audit.log('Auth', 'Token refresh started');

    try {
      const response = await apiClient.post('/auth/refresh', {});

      // Transform response to React format (camelCase)
      const refreshData = apiToReact(response.data);
      
      // Store new access token
      if (refreshData.accessToken) {
        localStorage.setItem('access_token', refreshData.accessToken);
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
   * 
   * @description מבצע התנתקות ומסיר את ה-tokens
   * @legacyReference Legacy.auth.logout()
   * 
   * @returns {Promise<void>}
   */
  async logout() {
    audit.log('Auth', 'Logout started');

    try {
      await apiClient.post('/auth/logout');
      
      // Clear local storage
      localStorage.removeItem('access_token');
      
      audit.log('Auth', 'Logout successful');
    } catch (error) {
      // Even if API call fails, clear local storage
      localStorage.removeItem('access_token');
      audit.error('Auth', 'Logout error (cleared local storage anyway)', error);
    }
  },

  /**
   * Request Password Reset - בקשת איפוס סיסמה
   * 
   * @description מבקש איפוס סיסמה דרך EMAIL או SMS
   * @legacyReference Legacy.auth.requestPasswordReset(method, identifier)
   * 
   * @param {string} method - שיטת איפוס: 'EMAIL' או 'SMS'
   * @param {string} identifier - אימייל או מספר טלפון
   * @returns {Promise<Object>} - Response עם הודעה
   * 
   * @throws {Error} - אם הבקשה נכשלה (400, 500)
   */
  async requestPasswordReset(method, identifier) {
    audit.log('Auth', 'Password reset request started', { method, identifier });

    try {
      const payload = reactToApi({
        method,
        ...(method === 'EMAIL' 
          ? { email: identifier }
          : { phoneNumber: identifier }
        ),
      });

      debugLog('Auth', 'Password reset payload prepared', payload);

      const response = await apiClient.post('/auth/reset-password', payload);

      audit.log('Auth', 'Password reset request successful');
      
      return response.data;
    } catch (error) {
      audit.error('Auth', 'Password reset request failure', error);
      throw error;
    }
  },

  /**
   * Verify Password Reset - אימות ואיפוס סיסמה
   * 
   * @description מאמת token/code ומאפס את הסיסמה
   * @legacyReference Legacy.auth.verifyPasswordReset(token, code, newPassword)
   * 
   * @param {Object} resetData - נתוני איפוס
   * @param {string} [resetData.resetToken] - Token מאימייל (אם method=EMAIL)
   * @param {string} [resetData.verificationCode] - קוד מ-SMS (אם method=SMS)
   * @param {string} resetData.newPassword - סיסמה חדשה
   * @returns {Promise<Object>} - Response עם הודעה
   * 
   * @throws {Error} - אם האימות נכשל (400, 500)
   */
  async verifyPasswordReset(resetData) {
    audit.log('Auth', 'Password reset verify started');

    try {
      const payload = reactToApi(resetData);

      debugLog('Auth', 'Password reset verify payload prepared', payload);

      const response = await apiClient.post('/auth/verify-reset', payload);

      audit.log('Auth', 'Password reset verify successful');
      
      return response.data;
    } catch (error) {
      audit.error('Auth', 'Password reset verify failure', error);
      throw error;
    }
  },

  /**
   * Verify Phone - אימות מספר טלפון
   * 
   * @description מאמת מספר טלפון באמצעות קוד SMS
   * @legacyReference Legacy.auth.verifyPhone(code)
   * 
   * @param {string} verificationCode - קוד אימות 6 ספרות
   * @returns {Promise<Object>} - Response עם סטטוס אימות
   * 
   * @throws {Error} - אם האימות נכשל (400, 401, 500)
   */
  async verifyPhone(verificationCode) {
    audit.log('Auth', 'Phone verification started');

    try {
      const payload = reactToApi({
        verificationCode,
      });

      debugLog('Auth', 'Phone verification payload prepared', payload);

      const response = await apiClient.post('/auth/verify-phone', payload);

      audit.log('Auth', 'Phone verification successful');
      
      return apiToReact(response.data);
    } catch (error) {
      audit.error('Auth', 'Phone verification failure', error);
      throw error;
    }
  },

  /**
   * Get Current User - קבלת פרופיל המשתמש הנוכחי
   * 
   * @description מביא את פרטי המשתמש המחובר
   * @legacyReference Legacy.auth.getCurrentUser()
   * 
   * @returns {Promise<Object>} - UserResponse (camelCase)
   * 
   * @throws {Error} - אם המשתמש לא מחובר (401)
   */
  async getCurrentUser() {
    audit.log('Auth', 'Get current user started');

    try {
      const response = await apiClient.get('/users/me');

      // Transform response to React format (camelCase)
      const userData = apiToReact(response.data);

      audit.log('Auth', 'Get current user successful', { userId: userData.externalUlids });
      
      return userData;
    } catch (error) {
      audit.error('Auth', 'Get current user failure', error);
      throw error;
    }
  },

  /**
   * Update User - עדכון פרופיל משתמש
   * 
   * @description מעדכן את פרטי המשתמש
   * @legacyReference Legacy.auth.updateUser(userData)
   * 
   * @param {Object} userData - נתוני עדכון (camelCase)
   * @returns {Promise<Object>} - UserResponse מעודכן (camelCase)
   * 
   * @throws {Error} - אם העדכון נכשל (400, 401, 500)
   */
  async updateUser(userData) {
    audit.log('Auth', 'Update user started', { userId: userData.externalUlids });

    try {
      // Transform to API format (snake_case)
      const payload = reactToApi(userData);

      debugLog('Auth', 'Update user payload prepared', payload);

      const response = await apiClient.put('/users/me', payload);

      // Transform response to React format (camelCase)
      const updatedUser = apiToReact(response.data);

      audit.log('Auth', 'Update user successful', { userId: updatedUser.externalUlids });
      
      return updatedUser;
    } catch (error) {
      audit.error('Auth', 'Update user failure', error);
      throw error;
    }
  },

  /**
   * Change Password - שינוי סיסמה למשתמש מחובר
   * 
   * @description משנה את הסיסמה של המשתמש המחובר
   * @legacyReference Legacy.auth.changePassword(oldPassword, newPassword)
   * 
   * @param {Object} passwordData - נתוני שינוי סיסמה (snake_case after transformation)
   * @param {string} passwordData.old_password - הסיסמה הנוכחית
   * @param {string} passwordData.new_password - הסיסמה החדשה
   * @returns {Promise<Object>} Success response
   * 
   * @throws {Error} - אם שינוי הסיסמה נכשל (400, 401, 500)
   * 
   * @example
   * await authService.changePassword({ old_password: "old123", new_password: "new456" });
   */
  async changePassword(passwordData) {
    audit.log('Auth', 'Change password started');

    try {
      debugLog('Auth', 'Change password payload prepared', passwordData);

      const response = await apiClient.put('/users/me/password', passwordData);

      audit.log('Auth', 'Change password successful');
      
      return response.data;
    } catch (error) {
      audit.error('Auth', 'Change password failure', error);
      throw error;
    }
  },

  /**
   * Is Authenticated - בדיקה אם המשתמש מחובר
   * 
   * @description בודק אם יש access token ב-localStorage
   * @legacyReference Legacy.auth.isAuthenticated()
   * 
   * @returns {boolean} - true אם המשתמש מחובר
   */
  isAuthenticated() {
    return !!localStorage.getItem('access_token');
  },

  /**
   * Get Access Token - קבלת access token
   * 
   * @description מחזיר את ה-access token הנוכחי
   * @returns {string|null} - Access token או null
   */
  getAccessToken() {
    return localStorage.getItem('access_token');
  },
};

export default authService;
