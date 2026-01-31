/**
 * API Configuration
 * 
 * @description הגדרת API base URL ו-endpoints מ-Environment Variables
 * @legacyReference Legacy.api.config
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

/**
 * API Endpoints Configuration
 * 
 * @description כל ה-API endpoints במערכת
 */
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    REGISTER: `${API_BASE_URL}/auth/register`,
    REFRESH: `${API_BASE_URL}/auth/refresh`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
    RESET_PASSWORD: `${API_BASE_URL}/auth/reset-password`,
    VERIFY_RESET: `${API_BASE_URL}/auth/verify-reset`,
    VERIFY_PHONE: `${API_BASE_URL}/auth/verify-phone`
  },
  USERS: {
    ME: `${API_BASE_URL}/users/me`
  },
  API_KEYS: {
    LIST: `${API_BASE_URL}/user/api-keys`,
    CREATE: `${API_BASE_URL}/user/api-keys`,
    UPDATE: (keyId) => `${API_BASE_URL}/user/api-keys/${keyId}`,
    DELETE: (keyId) => `${API_BASE_URL}/user/api-keys/${keyId}`,
    VERIFY: (keyId) => `${API_BASE_URL}/user/api-keys/${keyId}/verify`
  }
};

export default API_ENDPOINTS;
