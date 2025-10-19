/**
 * External Data Settings Service (Frontend)
 * Lightweight wrapper around /api/system-settings/external-data
 * Provides getSettings() and saveSettings(payload) with unified notifications
 */

(function () {
  const ENDPOINT = '/api/system-settings/external-data';

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

  async function getSettings() {
    const resp = await fetch(ENDPOINT, { method: 'GET' });
    return handleResponse(resp);
  }

  async function saveSettings(payload) {
    const resp = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload || {}),
    });
    return handleResponse(resp);
  }

  window.ExternalDataSettingsService = {
    getSettings,
    saveSettings,
  };
})();


