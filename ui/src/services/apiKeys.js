/**
 * API Keys Service - ניהול מפתחות API
 * -------------------------------------
 * שירות לניהול מפתחות API של המשתמש
 * 
 * @description מנהל CRUD operations למפתחות API (D24)
 * @legacyReference Legacy.apiKeys.*
 */

import axios from 'axios';
import { apiToReact, reactToApi } from '../utils/transformers.js';
import { audit } from '../utils/audit.js';
import { debugLog } from '../utils/debug.js';
import authService from './auth.js';

// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

// Create axios instance with auth
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add auth interceptor
apiClient.interceptors.request.use(
  (config) => {
    const accessToken = authService.getAccessToken();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * API Keys Service Object
 */
const apiKeysService = {
  /**
   * List API Keys - רשימת מפתחות API
   * 
   * @description מביא את כל מפתחות ה-API של המשתמש המחובר
   * @legacyReference Legacy.apiKeys.list()
   * 
   * @returns {Promise<Array>} - מערך של UserApiKeyResponse (camelCase)
   * 
   * @throws {Error} - אם המשתמש לא מחובר (401)
   */
  async list() {
    audit.log('APIKeys', 'List API keys started');

    try {
      const response = await apiClient.get('/user/api-keys');

      // Transform response to React format (camelCase)
      const apiKeys = apiToReact(response.data);

      audit.log('APIKeys', 'List API keys successful', { count: apiKeys.length });
      
      return apiKeys;
    } catch (error) {
      audit.error('APIKeys', 'List API keys failure', error);
      throw error;
    }
  },

  /**
   * Create API Key - יצירת מפתח API חדש
   * 
   * @description יוצר מפתח API חדש עבור provider מסוים
   * @legacyReference Legacy.apiKeys.create(keyData)
   * 
   * @param {Object} keyData - נתוני המפתח (camelCase)
   * @param {string} keyData.provider - Provider (IBKR, POLYGON, etc.)
   * @param {string} keyData.apiKey - מפתח API
   * @param {string} [keyData.apiSecret] - סוד API (אופציונלי)
   * @param {string} [keyData.providerLabel] - תווית מותאמת אישית
   * @param {Object} [keyData.additionalConfig] - הגדרות נוספות
   * @returns {Promise<Object>} - UserApiKeyResponse (camelCase)
   * 
   * @throws {Error} - אם היצירה נכשלה (400, 401, 500)
   */
  async create(keyData) {
    audit.log('APIKeys', 'Create API key started', { provider: keyData.provider });

    try {
      // Transform to API format (snake_case)
      const payload = reactToApi(keyData);

      debugLog('APIKeys', 'Create API key payload prepared', payload);

      const response = await apiClient.post('/user/api-keys', payload);

      // Transform response to React format (camelCase)
      const apiKey = apiToReact(response.data);

      audit.log('APIKeys', 'Create API key successful', { keyId: apiKey.externalUlids });
      
      return apiKey;
    } catch (error) {
      audit.error('APIKeys', 'Create API key failure', error);
      throw error;
    }
  },

  /**
   * Update API Key - עדכון מפתח API
   * 
   * @description מעדכן מפתח API קיים
   * @legacyReference Legacy.apiKeys.update(keyId, keyData)
   * 
   * @param {string} keyId - ULID של המפתח
   * @param {Object} updateData - נתוני עדכון (camelCase)
   * @param {string} [updateData.providerLabel] - תווית חדשה
   * @param {boolean} [updateData.isActive] - סטטוס פעיל
   * @param {string} [updateData.apiKey] - מפתח חדש (אם משתנה)
   * @param {string} [updateData.apiSecret] - סוד חדש (אם משתנה)
   * @returns {Promise<Object>} - UserApiKeyResponse מעודכן (camelCase)
   * 
   * @throws {Error} - אם העדכון נכשל (400, 401, 404, 500)
   */
  async update(keyId, updateData) {
    audit.log('APIKeys', 'Update API key started', { keyId });

    try {
      // Transform to API format (snake_case)
      const payload = reactToApi(updateData);

      debugLog('APIKeys', 'Update API key payload prepared', payload);

      const response = await apiClient.put(`/user/api-keys/${keyId}`, payload);

      // Transform response to React format (camelCase)
      const apiKey = apiToReact(response.data);

      audit.log('APIKeys', 'Update API key successful', { keyId });
      
      return apiKey;
    } catch (error) {
      audit.error('APIKeys', 'Update API key failure', error);
      throw error;
    }
  },

  /**
   * Delete API Key - מחיקת מפתח API
   * 
   * @description מוחק מפתח API (soft delete)
   * @legacyReference Legacy.apiKeys.delete(keyId)
   * 
   * @param {string} keyId - ULID של המפתח
   * @returns {Promise<void>}
   * 
   * @throws {Error} - אם המחיקה נכשלה (401, 404, 500)
   */
  async delete(keyId) {
    audit.log('APIKeys', 'Delete API key started', { keyId });

    try {
      await apiClient.delete(`/user/api-keys/${keyId}`);

      audit.log('APIKeys', 'Delete API key successful', { keyId });
    } catch (error) {
      audit.error('APIKeys', 'Delete API key failure', error);
      throw error;
    }
  },

  /**
   * Verify API Key - אימות מפתח API
   * 
   * @description מאמת מפתח API מול ה-provider
   * @legacyReference Legacy.apiKeys.verify(keyId)
   * 
   * @param {string} keyId - ULID של המפתח
   * @returns {Promise<Object>} - תוצאת האימות
   * 
   * @throws {Error} - אם האימות נכשל (401, 404, 500)
   */
  async verify(keyId) {
    audit.log('APIKeys', 'Verify API key started', { keyId });

    try {
      const response = await apiClient.post(`/user/api-keys/${keyId}/verify`);

      // Transform response to React format (camelCase)
      const result = apiToReact(response.data);

      audit.log('APIKeys', 'Verify API key successful', { 
        keyId, 
        isVerified: result.isVerified 
      });
      
      return result;
    } catch (error) {
      audit.error('APIKeys', 'Verify API key failure', error);
      throw error;
    }
  },
};

export default apiKeysService;
