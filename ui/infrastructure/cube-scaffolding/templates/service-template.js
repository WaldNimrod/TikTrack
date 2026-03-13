/**
 * [Service Name] - [Description]
 * -----------------------------------------------
 * שירות ל-[תיאור]
 *
 * @description [תיאור מפורט]
 * @legacyReference [אם רלוונטי]
 */

import axios from 'axios';
import { apiToReact, reactToApi } from '../../shared/utils/transformers.js';
import { audit } from '../../../utils/audit.js';
import { debugLog, debugError } from '../../../utils/debug.js';

// API Base URL
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8082/api/v1';

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
  },
);

// Response interceptor - Handle errors and token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle 401 - Unauthorized
    if (error.response?.status === 401) {
      // Token refresh logic if needed
      audit.error('Auth', 'Unauthorized request', error);
    }
    return Promise.reject(error);
  },
);

/**
 * Service Name
 *
 * @description Service for [feature]
 */
const serviceName = {
  /**
   * Get data
   *
   * @description Fetch data from API
   * @returns {Promise<Object>} Transformed data
   */
  async getData() {
    try {
      audit.log('[Service]', 'Fetching data');
      const response = await apiClient.get('/endpoint');
      const transformedData = apiToReact(response.data);
      audit.log('[Service]', 'Data fetched successfully');
      return transformedData;
    } catch (error) {
      audit.error('[Service]', 'Failed to fetch data', error);
      throw error;
    }
  },

  /**
   * Create data
   *
   * @description Create new data
   * @param {Object} data - Data to create (camelCase)
   * @returns {Promise<Object>} Created data
   */
  async createData(data) {
    try {
      audit.log('[Service]', 'Creating data');
      const apiData = reactToApi(data); // Transform to snake_case
      const response = await apiClient.post('/endpoint', apiData);
      const transformedData = apiToReact(response.data);
      audit.log('[Service]', 'Data created successfully');
      return transformedData;
    } catch (error) {
      audit.error('[Service]', 'Failed to create data', error);
      throw error;
    }
  },

  // Add more service methods here
};

export default serviceName;
