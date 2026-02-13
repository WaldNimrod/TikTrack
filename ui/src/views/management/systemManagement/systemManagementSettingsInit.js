/**
 * System Management Settings Init — Rate-Limit & Scaling
 * TEAM_10_TO_TEAM_30_RATELIMIT_SCALING_SETTINGS_MANDATE
 * Fetches GET /settings/market-data and displays 4 controls
 */

import sharedServices from '../../../components/core/sharedServices.js';
import { maskedLog } from '../../../utils/maskedLog.js';

const LABELS = {
  max_active_tickers: 'מקסימום טיקרים פעילים (Intraday)',
  intraday_interval_minutes: 'מרווח Intraday (דקות)',
  provider_cooldown_minutes: 'זמן Cooldown אחרי 429 (דקות)',
  max_symbols_per_request: 'מקסימום סימבולים לבקשה',
};

(async function initSystemManagementSettings() {
  'use strict';

  const container = document.getElementById('marketDataSettingsValues');
  if (!container) return;

  try {
    await sharedServices.init();
    const data = await sharedServices.get('/settings/market-data', {});
    if (!data) throw new Error('No data');

    container.innerHTML = '';
    const keys = [
      'max_active_tickers',
      'intraday_interval_minutes',
      'provider_cooldown_minutes',
      'max_symbols_per_request',
    ];

    keys.forEach((key) => {
      const row = document.createElement('div');
      row.className = 'settings-row';
      row.innerHTML = `
        <div class="settings-row__label">${LABELS[key] ?? key}</div>
        <div class="settings-row__value" data-setting="${key}">${data[key] ?? '—'}</div>
      `;
      container.appendChild(row);
    });
  } catch (e) {
    maskedLog('[System Management] Failed to load market-data settings:', e);
    container.innerHTML = '<p class="settings-error">לא ניתן לטעון הגדרות. יש לבדוק חיבור ל-Backend.</p>';
  }
})();
