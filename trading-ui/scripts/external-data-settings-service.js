/**
 * External Data Settings Service - Comprehensive Function Index
 * ==========================================
 * 
 * This file contains a lightweight wrapper around /api/system-settings/external-data
 * providing getSettings() and saveSettings(payload) with unified notifications.
 * 
 * Related Documentation:
 * - documentation/02-ARCHITECTURE/FRONTEND/EXTERNAL_DATA_INTEGRATION.md
 * 
 * Author: TikTrack Development Team
 * Version: 1.0
 * Last Updated: 2025-01-27
 */

(function () {
  const ENDPOINT = '/api/system-settings/external-data';

  /**
   * Handle API response
   * @function handleResponse
   * @async
   * @param {Response} response - Fetch response object
   * @returns {Promise<Object|null>} Response body or null
   * @throws {Error} HTTP error message
   */
  async function handleResponse(response) {
    const contentType = response.headers.get('content-type') || '';
    let body = null;
    try {
      body = contentType.includes('application/json') ? await response.json() : null;
    } catch (_) {
      body = null;
    }
    if (!response.ok) {
      const message = (body && (body.message || body.error)) || `HTTP ${response.status}`;
      throw new Error(message);
    }
    return body;
  }

  /**
   * Get external data settings
   * @function getSettings
   * @async
   * @returns {Promise<Object|null>} Settings object
   * @throws {Error} HTTP error message
   */
  async function getSettings() {
    const resp = await fetch(ENDPOINT, { method: 'GET' });
    return handleResponse(resp);
  }

  /**
   * Save external data settings
   * @function saveSettings
   * @async
   * @param {Object} payload - Settings payload to save
   * @returns {Promise<Object|null>} Response object
   * @throws {Error} HTTP error message
   */
  async function saveSettings(payload) {
    const resp = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload || {}),
    });
    return handleResponse(resp);
  }

  // ===== GLOBAL EXPORTS =====
  window.ExternalDataSettingsService = {
    getSettings,
    saveSettings,
  };
})();


